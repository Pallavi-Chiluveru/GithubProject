import mongoose from "mongoose";

const orgMemberSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  role: {
    type: String,
    enum: ["OWNER", "ADMIN", "MAINTAINER", "COLLABORATOR", "CONTRIBUTOR", "VIEWER"],
    default: "COLLABORATOR",
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

// Ensure a user can only be in an organization once
orgMemberSchema.index({ organization: 1, user: 1 }, { unique: true });

export const OrgMemberModel = mongoose.model("OrgMember", orgMemberSchema);
