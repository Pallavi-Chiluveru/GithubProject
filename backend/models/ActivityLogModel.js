import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  repoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Repository",
  },
  metadata: {
    type: Object,
    default: {},
  },
}, { timestamps: true });

activityLogSchema.index({ user: 1, createdAt: -1 });

export const ActivityLogModel = mongoose.model("ActivityLog", activityLogSchema);
