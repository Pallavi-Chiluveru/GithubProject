import mongoose from "mongoose";

const repoPermissionSchema = new mongoose.Schema({
  repository: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Repository",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  permission: {
    type: String,
    enum: ["READ", "WRITE", "ADMIN"],
    default: "READ",
  }
}, { timestamps: true });

repoPermissionSchema.index({ repository: 1, user: 1 }, { unique: true });

export const RepoPermissionModel = mongoose.model("RepoPermission", repoPermissionSchema);
