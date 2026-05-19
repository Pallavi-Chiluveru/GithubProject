import exp from "express";
import { RepositoryMemberModel } from "../models/RepositoryMemberModel.js";
import { CollaborationModel } from "../models/CollaborationModel.js";
import { RepositoryModel } from "../models/RepositoryModel.js";
import { UserModel } from "../models/UserModel.js";
import { ActivityLogModel } from "../models/ActivityLogModel.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { NotificationModel } from "../models/NotificationModel.js";
import { getIO } from "../socket.js";
import { getUserRepoRole } from "../middleware/repoAuth.js";

export const collabApp = exp.Router();

// Self-healing database migration
async function runSelfHealingMigration() {
  try {
    console.log("[DB Self-Healing] Starting RBAC migration...");
    
    // 1. Migrate direct repository owners
    const repos = await RepositoryModel.find({});
    let ownerCount = 0;
    for (const repo of repos) {
      if (repo.owner) {
        const exists = await RepositoryMemberModel.findOne({
          repository: repo._id,
          user: repo.owner
        });
        if (!exists) {
          await RepositoryMemberModel.create({
            repository: repo._id,
            user: repo.owner,
            role: "OWNER",
            status: "accepted"
          });
          ownerCount++;
        }
      }
    }
    
    // 2. Migrate existing legacy CollaborationModel records
    const legacyCollabs = await CollaborationModel.find({});
    let collabCount = 0;
    for (const legacy of legacyCollabs) {
      if (!legacy.repoId || !legacy.userId) continue;
      
      const exists = await RepositoryMemberModel.findOne({
        repository: legacy.repoId,
        user: legacy.userId
      });
      
      if (!exists) {
        let mappedRole = "DEVELOPER";
        if (legacy.role === "owner") mappedRole = "OWNER";
        else if (legacy.role === "collaborator") mappedRole = "MAINTAINER";
        else if (legacy.role === "viewer") mappedRole = "DEVELOPER";
        
        await RepositoryMemberModel.create({
          repository: legacy.repoId,
          user: legacy.userId,
          role: mappedRole,
          status: legacy.status || "pending",
          invitedBy: legacy.invitedBy
        });
        collabCount++;
      }
    }
    
    console.log(`[DB Self-Healing] Completed! Migrated ${ownerCount} owners and ${collabCount} collaboration records.`);
  } catch (err) {
    console.error("[DB Self-Healing] Migration error:", err);
  }
}

// Run migration asynchronously after DB connection is verified
setTimeout(() => {
  runSelfHealingMigration();
}, 2000);

// Helper for activity logging
async function logActivity(userId, repoId, action, message, metadata = {}) {
  try {
    await ActivityLogModel.create({
      user: userId,
      repoId,
      action,
      message,
      metadata
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}

/* SEARCH USERS FOR COLLABORATION */
collabApp.get("/search-users", verifyToken, async (req, res) => {
  try {
    const { query, repoId } = req.query;
    if (!query) return res.json([]);

    // Find matching users
    const users = await UserModel.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } }
      ],
      _id: { $ne: req.user.id } // Exclude self
    }).select("username email profileImageUrl _id").limit(10);

    // Filter out existing members
    if (repoId) {
      const existing = await RepositoryMemberModel.find({ 
        repository: repoId, 
        status: { $in: ["pending", "accepted"] } 
      }).select("user");
      const existingIds = existing.map(e => e.user.toString());
      
      const filtered = users.filter(u => !existingIds.includes(u._id.toString()));
      return res.json(filtered);
    }

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* SEND INVITE */
collabApp.post("/invite/:repoId", verifyToken, async (req, res) => {
  try {
    const { userId, role = "DEVELOPER" } = req.body;
    const repoId = req.params.repoId;

    const repo = await RepositoryModel.findById(repoId);
    if (!repo) return res.status(404).json({ message: "Repo not found" });

    // Only OWNER can invite
    const requesterRole = await getUserRepoRole(req.user.id, repoId);
    if (requesterRole !== "OWNER") {
      return res.status(403).json({ message: "Only repository owners can manage collaborators" });
    }

    // Check if target user exists
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Validate role input
    const normalizedRole = role.toUpperCase();
    if (!["OWNER", "MAINTAINER", "DEVELOPER"].includes(normalizedRole)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    // Already a member?
    const existing = await RepositoryMemberModel.findOne({ repository: repoId, user: userId });
    if (existing && existing.status !== "rejected" && existing.status !== "removed") {
      return res.status(400).json({ message: "User already invited or is a collaborator" });
    }

    const invite = existing || new RepositoryMemberModel({ repository: repoId, user: userId });
    invite.invitedBy = req.user.id;
    invite.role = normalizedRole;
    invite.status = "pending";
    await invite.save();

    // Log Activity
    await logActivity(req.user.id, repoId, "COLLABORATOR_INVITED", `Invited ${user.username} as ${normalizedRole}`, { targetUser: user._id });

    // Create notification
    const notification = await NotificationModel.create({
      user: userId,
      type: "repo_invite",
      message: `You have been invited to collaborate on "${repo.name}" as ${normalizedRole}`,
      relatedId: invite._id,
    });
    getIO().to(userId.toString()).emit("new_notification", notification);

    res.status(201).json({ message: "Invite sent successfully", invite });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* GET REPO COLLABORATORS & PENDING INVITES */
collabApp.get("/repo/:repoId", verifyToken, async (req, res) => {
  try {
    const { repoId } = req.params;
    const repo = await RepositoryModel.findById(repoId);
    if (!repo) return res.status(404).json({ message: "Repo not found" });

    const members = await RepositoryMemberModel.find({ repository: repoId })
      .populate("user", "username email profileImageUrl")
      .populate("invitedBy", "username");

    // Format list mapping fields back to what CollaboratorManager expects
    const result = members.map(m => {
      const obj = m.toObject();
      obj.userId = m.user;
      
      // Mark permanent repository owner
      if (repo.owner && m.user && m.user._id.toString() === repo.owner.toString()) {
        obj.isPermanentOwner = true;
      }
      return obj;
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* UPDATE COLLABORATOR ROLE */
collabApp.patch("/update/:id", verifyToken, async (req, res) => {
  try {
    const { role } = req.body;
    const normalizedRole = role ? role.toUpperCase() : null;
    
    if (!normalizedRole || !["OWNER", "MAINTAINER", "DEVELOPER"].includes(normalizedRole)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    const member = await RepositoryMemberModel.findById(req.params.id).populate("user", "username");
    if (!member) return res.status(404).json({ message: "Member not found" });

    const repo = await RepositoryModel.findById(member.repository);
    if (!repo) return res.status(404).json({ message: "Repo not found" });
    
    // Security: Only owner can update roles
    const requesterRole = await getUserRepoRole(req.user.id, repo._id);
    if (requesterRole !== "OWNER") {
      return res.status(403).json({ message: "Only repository owners can update roles" });
    }

    // Prevent changing the role of the direct primary owner
    if (repo.owner && member.user._id.toString() === repo.owner.toString()) {
      return res.status(400).json({ message: "Cannot change the role of the repository owner" });
    }

    member.role = normalizedRole;
    await member.save();

    await logActivity(req.user.id, repo._id, "COLLABORATOR_UPDATED", `Updated ${member.user.username}'s role to ${normalizedRole}`);

    res.json({ message: "Collaborator updated", member });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* REMOVE COLLABORATOR */
collabApp.delete("/remove/:id", verifyToken, async (req, res) => {
  try {
    const member = await RepositoryMemberModel.findById(req.params.id).populate("user", "username");
    if (!member) return res.status(404).json({ message: "Collaborator not found" });

    const repo = await RepositoryModel.findById(member.repository);
    if (!repo) return res.status(404).json({ message: "Repo not found" });
    
    // Prevent removing the primary direct owner
    if (repo.owner && member.user._id.toString() === repo.owner.toString()) {
      return res.status(400).json({ message: "Cannot remove repository owner" });
    }

    // Security: Only owner can remove members
    const requesterRole = await getUserRepoRole(req.user.id, repo._id);
    if (requesterRole !== "OWNER") {
      return res.status(403).json({ message: "Only repository owners can remove collaborators" });
    }

    await RepositoryMemberModel.findByIdAndDelete(req.params.id);

    await logActivity(req.user.id, repo._id, "COLLABORATOR_REMOVED", `Removed ${member.user.username} from repository`);

    res.json({ message: "Collaborator removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* RESPOND TO INVITATION */
collabApp.post("/respond/:id", verifyToken, async (req, res) => {
  try {
    const { action } = req.body; // "accept" or "reject"
    const member = await RepositoryMemberModel.findById(req.params.id);
    if (!member) return res.status(404).json({ message: "Invite not found" });

    if (member.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to respond to this invite" });
    }

    if (action === "accept") {
      member.status = "accepted";
    } else {
      member.status = "rejected";
    }

    await member.save();
    
    await logActivity(req.user.id, member.repository, action === "accept" ? "INVITE_ACCEPTED" : "INVITE_REJECTED", `User ${action}ed the invitation`);

    // Notify the repository owner
    const repo = await RepositoryModel.findById(member.repository);
    if (repo && repo.owner) {
      const responder = await UserModel.findById(req.user.id);
      const notification = await NotificationModel.create({
        user: repo.owner,
        type: action === "accept" ? "invite_accepted" : "invite_rejected",
        message: `${responder?.username || "A user"} has ${action}ed your invitation to collaborate on "${repo.name}"`,
        relatedId: repo._id,
      });
      getIO().to(repo.owner.toString()).emit("new_notification", notification);
    }

    res.json({ message: `Invite ${action}ed` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* GET REPO ACTIVITY */
collabApp.get("/activity/:repoId", verifyToken, async (req, res) => {
  try {
    const activities = await ActivityLogModel.find({ repoId: req.params.repoId })
      .populate("user", "username profileImageUrl")
      .populate("metadata.targetUser", "username")
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* GET CURRENT USER'S PENDING INVITES */
collabApp.get("/my-invites", verifyToken, async (req, res) => {
  try {
    const invites = await RepositoryMemberModel.find({
      user: req.user.id,
      status: "pending",
    }).populate("repository", "name");
    
    // Map repository reference back to `repoId` for frontend backwards compatibility
    const result = invites.map(i => {
      const obj = i.toObject();
      obj.repoId = i.repository;
      return obj;
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
