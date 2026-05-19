import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  type: {
    type: String,
    enum: ["org_invite", "repo_invite", "invite_accepted", "invite_rejected", "member_removed", "role_updated", "general"],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  read: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

export const NotificationModel = mongoose.model("Notification", notificationSchema);
