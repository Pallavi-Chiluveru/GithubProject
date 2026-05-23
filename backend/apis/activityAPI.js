import exp from "express";
import { OrgMemberModel } from "../models/OrgMemberModel.js";
import { RepositoryModel } from "../models/RepositoryModel.js";
import { OrganizationModel } from "../models/OrganizationModel.js";
import { UserModel } from "../models/UserModel.js";
import { ActivityLogModel } from "../models/ActivityLogModel.js";
import { verifyToken } from "../middleware/verifyToken.js";

export const activityApp = exp.Router();

/* GET ACTIVITY LOGS FOR CURRENT USER */
activityApp.get("/", verifyToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const logs = await ActivityLogModel.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("repoId", "name");

    res.status(200).json(logs);
  } catch (err) {
    console.error("ACTIVITY LOG FETCH ERROR:", err);
    res.status(500).json({ message: "Error fetching activity logs", error: err.message });
  }
});

/* GET ACTIVITY LOGS BY USERNAME */
activityApp.get("/user/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const user = await UserModel.findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') } 
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const limit = parseInt(req.query.limit) || 20;
    const logs = await ActivityLogModel.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("repoId", "name");

    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching activity logs", error: err.message });
  }
});

/* GET CONTRIBUTIONS FOR HEATMAP BY USERNAME */
activityApp.get("/contributions/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const user = await UserModel.findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') } 
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Aggregation to count activities by date
    const contributions = await ActivityLogModel.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json(contributions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching contributions", error: err.message });
  }
});

/* GET OBSERVABILITY TELEMETRY */
activityApp.get("/observability", verifyToken, async (req, res) => {
  try {
    const logs = await ActivityLogModel.find({ action: "commit_pushed" }).lean();
    
    let totalPushes = logs.length;
    let mismatchCount = 0;
    let staleSessionOverwrites = 0;
    
    const webhookSenders = new Set();
    const displayedUsers = new Set();
    const timeline = [];

    for (const log of logs) {
      const metadata = log.metadata || {};
      if (metadata.identityMismatch) {
        mismatchCount++;
      }
      if (metadata.staleSessionOverwrite) {
        staleSessionOverwrites++;
      }
      
      const giteaUser = metadata.giteaUser || log.giteaUsername || "Unknown";
      const displayedUser = log.message.split(" pushed ")[0] || "Unknown";
      
      webhookSenders.add(giteaUser);
      displayedUsers.add(displayedUser);
      
      timeline.push({
        id: log._id,
        timestamp: log.createdAt,
        giteaUser,
        commitAuthor: metadata.commitAuthor || "Unknown",
        displayedUser,
        isMismatch: !!metadata.identityMismatch,
        message: log.message
      });
    }

    res.status(200).json({
      totalPushes,
      mismatchCount,
      staleSessionOverwrites,
      webhookSenders: Array.from(webhookSenders),
      displayedUsers: Array.from(displayedUsers),
      timeline: timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching observability stats", error: err.message });
  }
});
