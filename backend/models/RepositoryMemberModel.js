import { Schema, model } from "mongoose";

const repositoryMemberSchema = new Schema(
  {
    repository: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    role: {
      type: String,
      enum: ["OWNER", "MAINTAINER", "DEVELOPER"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "removed"],
      default: "pending",
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

// Guarantee unique user membership per repository
repositoryMemberSchema.index({ repository: 1, user: 1 }, { unique: true });

export const RepositoryMemberModel = model("RepositoryMember", repositoryMemberSchema);
