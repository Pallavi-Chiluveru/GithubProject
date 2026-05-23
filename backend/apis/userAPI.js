import exp from "express";
import { UserModel } from "../models/UserModel.js";
import { hash, compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { verifyToken } from "../middleware/verifyToken.js";
import { encryptToken } from "../utils/encrypt.js";
import { createGiteaUser, createGiteaUserToken } from "../services/giteaAuthService.js";
import { addGiteaSSHKey } from "../services/giteaAuthService.js";
import fs from "fs";
import { upload } from "../utils/multer.js";
import { uploadToCloudinary } from "../utils/cloudStorage.js";

export const userApp = exp.Router();
config();

function signUser(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      username: user.username,
      profileImageUrl: user.profileImageUrl,
    },
    process.env.KEY,
    { expiresIn: "1h" }
  );
}

function setAuthCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });
}

/* REGISTER */
userApp.post("/register", async (req, res, next) => {
  try {
    const newUser = req.body;
    const plaintextPassword = newUser.password; // needed for Gitea token

    // Hash password for MongoDB
    newUser.password = await hash(newUser.password, 12);

    // Save user to MongoDB
    const userDocument = new UserModel(newUser);
    await userDocument.save();

    // ─── Mirror user in Gitea (blocking) ───────────────────────────────────
    // This step is performed synchronously so we can return the personal access token
    // to the client after successful creation.
    try {
      const giteaUser = await createGiteaUser({
        username: userDocument.username,
        email: userDocument.email,
        password: plaintextPassword,
      });

      if (giteaUser) {
        console.log('gitea user created');
        // Generate a personal access token for this user in Gitea
        const rawToken = await createGiteaUserToken(userDocument.username, plaintextPassword);
        const encryptedToken = rawToken ? encryptToken(rawToken) : "";

        // Store Gitea identity back in MongoDB
        await UserModel.findByIdAndUpdate(userDocument._id, {
          giteaUserId: giteaUser.giteaUserId,
          giteaUsername: giteaUser.giteaUsername,
          giteaToken: encryptedToken,
          giteaSynced: true,
        });

        console.log(`[Gitea] User ${userDocument.username} successfully mirrored.`);
        // Respond with token so the client can push via HTTP
        return res.status(201).json({
          message: "User registered",
          giteaToken: rawToken,
          giteaUsername: userDocument.username,
        });
      }
    } catch (giteaErr) {
      console.error(
        `[Gitea] Mirror failed for ${userDocument.username} — continuing without Git access:`,
        giteaErr.message
      );
    }
    // If we reach here, Gitea mirroring failed – send a basic success response.
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    next(err);
  }
});


/* LOGIN */
userApp.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // find user
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    // check password
    const isMatched = await compare(password, user.password);
    if (!isMatched) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const signedToken = signUser(user);
    setAuthCookie(res, signedToken);

    // remove password before sending response
    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      message: "Login Successful",
      token: signedToken,
      payload: userObj
    });
  } catch (err) {
    next(err);
  }
});


userApp.post('/logout', async (req, res) => {
  // delete the teoken from the cookie storage
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false
  })
  res.status(200).json({ message: "Logged out successfully" });
})

/* SEARCH USER */
userApp.get("/find", verifyToken, async (req, res) => {
  try {
    const { query } = req.query;
    fs.appendFileSync('search_debug.log', `Query: "${query}" at ${new Date().toISOString()}\n`);

    console.log(`Searching for: ${query}`);

    if (!query) return res.status(200).json([]);

    const searchRegex = query.trim();
    const users = await UserModel.find({
      $or: [
        { username: { $regex: searchRegex, $options: "i" } },
        { email: { $regex: searchRegex, $options: "i" } },
        { gitname: { $regex: searchRegex, $options: "i" } }
      ]
    }).select("username email _id profileImageUrl gitname");

    console.log(`Regex: /${searchRegex}/i, Found ${users.length} users`);
    res.status(200).json(users);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "error occurred", error: err.message });
  }
});

/* ─── SETTINGS: GET CURRENT USER ──────────────────────────────── */
userApp.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "error occurred", error: err.message });
  }
});

/* ─── SETTINGS: UPDATE PUBLIC PROFILE ─────────────────────────── */
userApp.put("/profile", verifyToken, async (req, res) => {
  try {
    const { username, gitname, displayName, bio, company, location, profileImageUrl, email, socialLinks } = req.body;

    // Check if email or username already taken by another user
    if (email) {
      const emailExists = await UserModel.findOne({ email });
      if (emailExists && String(emailExists._id) !== req.user.id) {
        return res.status(409).json({ message: "Email is already in use" });
      }
    }

    if (username) {
      const usernameExists = await UserModel.findOne({ username });
      if (usernameExists && String(usernameExists._id) !== req.user.id) {
        return res.status(409).json({ message: "Username is already in use" });
      }
    }

    const updateFields = {
      username,
      gitname: displayName || gitname || username,
      displayName: displayName || gitname || username,
      bio,
      company,
      location,
      profileImageUrl,
      email,
      socialLinks
    };

    const updated = await UserModel.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: false }
    ).select("-password");

    // Re-sign token if username or profileImageUrl changed
    let signedToken = null;
    if (username !== req.user.username || profileImageUrl !== req.user.profileImageUrl) {
      signedToken = jwt.sign(
        {
          id: updated._id,
          email: updated.email,
          username: updated.username,
          profileImageUrl: updated.profileImageUrl,
        },
        process.env.KEY,
        { expiresIn: "1h" }
      );
      res.cookie("token", signedToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updated,
      token: signedToken
    });
  } catch (err) {
    res.status(500).json({ message: "error occurred", error: err.message });
  }
});

/* ─── SETTINGS: CHANGE EMAIL ───────────────────────────────────── */
userApp.put("/email", verifyToken, async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);
    console.log(`Password received: ${password ? 'YES' : 'NO'}`);
    console.log(`Login attempt for: ${email}`);
    const user = await UserModel.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatched = await compare(password, user.password);
    if (!isMatched) return res.status(400).json({ message: "Incorrect password" });

    const exists = await UserModel.findOne({ email });
    if (exists && String(exists._id) !== String(user._id))
      return res.status(409).json({ message: "Email already in use" });

    user.email = email;
    await user.save();
    res.status(200).json({ message: "Email updated" });
  } catch (err) {
    res.status(500).json({ message: "error occurred", error: err.message });
  }
});

/* ─── SETTINGS: CHANGE PASSWORD ────────────────────────────────── */
userApp.put("/password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await UserModel.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatched = await compare(currentPassword, user.password);
    if (!isMatched) return res.status(400).json({ message: "Current password is incorrect" });

    user.password = await hash(newPassword, 12);
    await user.save();
    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "error occurred", error: err.message });
  }
});

/* ─── SETTINGS: DELETE ACCOUNT ─────────────────────────────────── */
userApp.delete("/account", verifyToken, async (req, res) => {
  try {
    const { password } = req.body;
    const user = await UserModel.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatched = await compare(password, user.password);
    if (!isMatched) return res.status(400).json({ message: "Incorrect password" });

    await UserModel.findByIdAndDelete(req.user.id);
    res.clearCookie("token", { httpOnly: true, sameSite: "lax", secure: false });
    res.status(200).json({ message: "Account deleted" });
  } catch (err) {
    res.status(500).json({ message: "error occurred", error: err.message });
  }
});

/* ─── SETTINGS: LIST SSH KEYS ───────────────────────────────────── */
userApp.get("/ssh-keys", verifyToken, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id).select("sshKeys");
    res.status(200).json(user?.sshKeys || []);
  } catch (err) {
    res.status(500).json({ message: "error occurred", error: err.message });
  }
});

/* ─── SETTINGS: ADD SSH KEY ─────────────────────────────────────── */
userApp.post("/ssh-keys", verifyToken, async (req, res) => {
  try {
    const { title, key } = req.body;
    if (!title || !key) return res.status(400).json({ message: "Title and key are required" });

    const user = await UserModel.findById(req.user.id);
    user.sshKeys.push({ title, key });
    await user.save();
    res.status(201).json({ message: "SSH key added", sshKeys: user.sshKeys });
  } catch (err) {
    res.status(500).json({ message: "error occurred", error: err.message });
  }
});

/* ─── SETTINGS: DELETE SSH KEY ──────────────────────────────────── */
userApp.delete("/ssh-keys/:keyId", verifyToken, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    user.sshKeys = user.sshKeys.filter(k => String(k._id) !== req.params.keyId);
    await user.save();
    res.status(200).json({ message: "SSH key removed", sshKeys: user.sshKeys });
  } catch (err) {
    res.status(500).json({ message: "error occurred", error: err.message });
  }
});

/* ─── SETTINGS: UPDATE NOTIFICATIONS ───────────────────────────── */
userApp.put("/notifications", verifyToken, async (req, res) => {
  try {
    const updated = await UserModel.findByIdAndUpdate(
      req.user.id,
      { notificationPrefs: req.body },
      { new: true }
    ).select("notificationPrefs");
    res.status(200).json({ message: "Notification preferences updated", prefs: updated.notificationPrefs });
  } catch (err) {
    res.status(500).json({ message: "error occurred", error: err.message });
  }
});

/* ─── SETTINGS: UPDATE APPEARANCE ──────────────────────────────── */
userApp.put("/appearance", verifyToken, async (req, res) => {
  try {
    const updated = await UserModel.findByIdAndUpdate(
      req.user.id,
      { appearance: req.body },
      { new: true }
    ).select("appearance");
    res.status(200).json({ message: "Appearance updated", appearance: updated.appearance });
  } catch (err) {
    res.status(500).json({ message: "error occurred", error: err.message });
  }
});



/* GET PROFILE BY USERNAME */
userApp.get("/profile/:username", async (req, res) => {
  try {
    const { username } = req.params;
    console.log(`PROFILE FETCH REQUEST FOR: ${username}`);

    // Fetch profile user
    const user = await UserModel.findOne({
      username: { $regex: new RegExp(`^${username}$`, 'i') }
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Optional authentication check to determine if the viewer is already following the target
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    let isFollowing = false;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.KEY);
        isFollowing = user.followers?.some(id => String(id) === String(decoded.id)) || false;
      } catch (err) { }
    }

    res.status(200).json({
      ...user.toObject(),
      followersCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0,
      isFollowing
    });
  } catch (err) {
    res.status(500).json({ message: "error occurred", error: err.message });
  }
});

/* ─── AVATAR UPLOAD ─────────────────────────────────────────── */
userApp.post("/profile/avatar", verifyToken, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // Upload to Cloudinary
    const cloudFile = await uploadToCloudinary(req.file);
    const profileImageUrl = cloudFile?.url || `/uploads/${req.file.filename}`;

    const updated = await UserModel.findByIdAndUpdate(
      req.user.id,
      { profileImageUrl },
      { new: true }
    ).select("-password");

    // Re-sign token with new image URL
    const signedToken = jwt.sign(
      {
        id: updated._id,
        email: updated.email,
        username: updated.username,
        profileImageUrl: updated.profileImageUrl,
      },
      process.env.KEY,
      { expiresIn: "1h" }
    );

    res.cookie("token", signedToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    res.status(200).json({
      message: "Avatar uploaded successfully",
      profileImageUrl,
      user: updated,
      token: signedToken
    });
  } catch (err) {
    console.error("AVATAR UPLOAD ERROR:", err);
    res.status(500).json({ message: "Error uploading avatar", error: err.message });
  }
});

/* ─── FOLLOW USER ───────────────────────────────────────────── */
userApp.post("/:id/follow", verifyToken, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    if (String(targetUserId) === String(currentUserId)) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const targetUser = await UserModel.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Atomically follow by adding users to follow lists without duplicates
    await Promise.all([
      UserModel.findByIdAndUpdate(currentUserId, { $addToSet: { following: targetUserId } }),
      UserModel.findByIdAndUpdate(targetUserId, { $addToSet: { followers: currentUserId } })
    ]);

    // Fetch updated target user to return exact counts
    const updatedTarget = await UserModel.findById(targetUserId);

    res.status(200).json({
      message: "Followed successfully",
      followersCount: updatedTarget.followers?.length || 0,
      followingCount: updatedTarget.following?.length || 0,
      isFollowing: true
    });
  } catch (err) {
    res.status(500).json({ message: "Error following user", error: err.message });
  }
});

/* ─── UNFOLLOW USER ─────────────────────────────────────────── */
userApp.post("/:id/unfollow", verifyToken, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    const targetUser = await UserModel.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Atomically unfollow by removing users from lists
    await Promise.all([
      UserModel.findByIdAndUpdate(currentUserId, { $pull: { following: targetUserId } }),
      UserModel.findByIdAndUpdate(targetUserId, { $pull: { followers: currentUserId } })
    ]);

    // Fetch updated target user
    const updatedTarget = await UserModel.findById(targetUserId);

    res.status(200).json({
      message: "Unfollowed successfully",
      followersCount: updatedTarget.followers?.length || 0,
      followingCount: updatedTarget.following?.length || 0,
      isFollowing: false
    });
  } catch (err) {
    res.status(500).json({ message: "Error unfollowing user", error: err.message });
  }
});

/* ─── GET FOLLOWERS ─────────────────────────────────────────── */
userApp.get("/:id/followers", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const search = req.query.search || "";

    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch followers and filter using search if present
    const searchFilter = {
      _id: { $in: user.followers },
      ...(search ? {
        $or: [
          { username: { $regex: search, $options: "i" } },
          { displayName: { $regex: search, $options: "i" } },
          { gitname: { $regex: search, $options: "i" } }
        ]
      } : {})
    };

    const followers = await UserModel.find(searchFilter)
      .select("username displayName gitname profileImageUrl bio followers");

    // Add inline flag to see if current user is following them
    const mappedFollowers = followers.map(f => {
      const fObj = f.toObject();
      return {
        ...fObj,
        displayName: f.displayName || f.gitname || f.username,
        isFollowing: f.followers?.some(fid => String(fid) === String(req.user.id)) || false
      };
    });

    res.status(200).json(mappedFollowers);
  } catch (err) {
    res.status(500).json({ message: "Error fetching followers", error: err.message });
  }
});

/* ─── GET FOLLOWING ─────────────────────────────────────────── */
userApp.get("/:id/following", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const search = req.query.search || "";

    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch following list and filter using search
    const searchFilter = {
      _id: { $in: user.following },
      ...(search ? {
        $or: [
          { username: { $regex: search, $options: "i" } },
          { displayName: { $regex: search, $options: "i" } },
          { gitname: { $regex: search, $options: "i" } }
        ]
      } : {})
    };

    const following = await UserModel.find(searchFilter)
      .select("username displayName gitname profileImageUrl bio followers");

    const mappedFollowing = following.map(f => {
      const fObj = f.toObject();
      return {
        ...fObj,
        displayName: f.displayName || f.gitname || f.username,
        isFollowing: f.followers?.some(fid => String(fid) === String(req.user.id)) || false
      };
    });

    res.status(200).json(mappedFollowing);
  } catch (err) {
    res.status(500).json({ message: "Error fetching following list", error: err.message });
  }
});
