import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  parentTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    default: null,
  },
  avatar: {
    type: String,
    default: "",
  },
  visibility: {
    type: String,
    enum: ["VISIBLE", "SECRET"],
    default: "VISIBLE"
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    },
    role: {
      type: String,
      enum: ["MAINTAINER", "MEMBER"],
      default: "MEMBER"
    }
  }],
  repositories: [{
    repository: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repository"
    },
    permission: {
      type: String,
      enum: ["READ", "TRIAGE", "WRITE", "MAINTAIN", "ADMIN"],
      default: "READ"
    }
  }]
}, { timestamps: true });

export const TeamModel = mongoose.model("Team", teamSchema);
