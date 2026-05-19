import exp from "express";
import { NotificationModel } from "../models/NotificationModel.js";
import { verifyToken } from "../middleware/verifyToken.js";

export const notificationApp = exp.Router();

/* GET all notifications for current user */
notificationApp.get("/", verifyToken, async (req, res) => {
  try {
    const notifications = await NotificationModel.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* GET unread count */
notificationApp.get("/unread-count", verifyToken, async (req, res) => {
  try {
    const count = await NotificationModel.countDocuments({ user: req.user.id, read: false });
    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* PATCH mark-all-read — MUST be before /:id/read to avoid route conflict */
notificationApp.patch("/mark-all-read", verifyToken, async (req, res) => {
  try {
    await NotificationModel.updateMany(
      { user: req.user.id, read: false },
      { read: true }
    );
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* PATCH mark single as read */
notificationApp.patch("/:id/read", verifyToken, async (req, res) => {
  try {
    const notification = await NotificationModel.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.status(200).json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* DELETE a single notification */
notificationApp.delete("/:id", verifyToken, async (req, res) => {
  try {
    await NotificationModel.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.status(200).json({ message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
