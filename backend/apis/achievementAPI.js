import exp from "express";
import { AchievementModel } from "../models/AchievementModel.js";
import { UserModel } from "../models/UserModel.js";
import { verifyToken } from "../middleware/verifyToken.js";

export const achievementApp = exp.Router();

/* GET ACHIEVEMENTS BY USERNAME */
achievementApp.get("/user/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const user = await UserModel.findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') } 
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const achievements = await AchievementModel.find({ user: user._id })
      .sort({ unlockedAt: -1 });

    res.status(200).json(achievements);
  } catch (err) {
    res.status(500).json({ message: "Error fetching achievements", error: err.message });
  }
});

/* UNLOCK ACHIEVEMENT (Internal/Admin only, but for this demo we'll let users unlock some) */
achievementApp.post("/unlock", verifyToken, async (req, res) => {
  try {
    const { title, description, badgeUrl } = req.body;
    
    const achievement = await AchievementModel.findOneAndUpdate(
      { user: req.user.id, title },
      { description, badgeUrl, unlockedAt: new Date() },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: "Achievement unlocked!", achievement });
  } catch (err) {
    res.status(500).json({ message: "Error unlocking achievement", error: err.message });
  }
});
