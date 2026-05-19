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
    const plaintextPassword = newUser.password; // Save before hashing (needed for Gitea token)

    // Hash password for MongoDB
    newUser.password = await hash(newUser.password, 12);

    // Save user to MongoDB
    const userDocument = new UserModel(newUser);
    await userDocument.save();

    // ─── Mirror user in Gitea (non-blocking) ───────────────────────────────────
    // We run this async but don't block the response if Gitea is unavailable.
    setImmediate(async () => {
      try {
        const giteaUser = await createGiteaUser({
          username: userDocument.username,
          email: userDocument.email,
          password: plaintextPassword,
        });

        if (giteaUser) {
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
        }
      } catch (giteaErr) {
        console.error(`[Gitea] Mirror failed for ${userDocument.username} — continuing without Git access:`, giteaErr.message);
      }
    });

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
    const { username, gitname, bio, profileImageUrl } = req.body;
    const updated = await UserModel.findByIdAndUpdate(
      req.user.id,
      { username, gitname, bio, profileImageUrl },
      { new: true, runValidators: false }
    ).select("-password");
    res.status(200).json({ message: "Profile updated", user: updated });
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
    // Case-insensitive search for username
    const user = await UserModel.findOne({
      username: { $regex: new RegExp(`^${username}$`, 'i') }
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Mock followers/following for now as we don't have a Follow model yet
    // In a real app, you'd count records in a Follows table
    const followersCount = 0;
    const followingCount = 0;

    res.status(200).json({
      ...user.toObject(),
      followersCount,
      followingCount
    });
  } catch (err) {
    res.status(500).json({ message: "error occurred", error: err.message });
  }
});
