import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  logo: {
    type: String,
    default: "",
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  visibility: {
    type: String,
    enum: ["PUBLIC", "PRIVATE"],
    default: "PUBLIC"
  },
  banner: {
    type: String,
    default: "",
  },
  billing: {
    plan: {
      type: String,
      enum: ["FREE", "PRO", "ENTERPRISE"],
      default: "FREE"
    },
    email: String,
    customerId: String,
  },
  visibilitySettings: {
    membersCanCreateRepos: { type: Boolean, default: true },
    membersCanCreateTeams: { type: Boolean, default: true },
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    },
    role: {
      type: String,
      enum: ["OWNER", "ADMIN", "MAINTAINER", "COLLABORATOR", "CONTRIBUTOR", "VIEWER"],
      default: "COLLABORATOR"
    }
  }],
  repositories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Repository"
  }],
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team" // To be created
  }]
}, { timestamps: true });

export const OrganizationModel = mongoose.model("Organization", organizationSchema);
