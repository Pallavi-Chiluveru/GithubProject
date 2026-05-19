import { Schema, model } from "mongoose";
import "../models/UserModel.js";

const repositorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    language: {
      type: String,
      default: "JavaScript",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization"
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    visibility: {
      type: String,
      enum: ["PUBLIC", "PRIVATE", "INTERNAL"],
      default: "PUBLIC"
    },
    collaborators: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    viewers: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    defaultBranch: {
      type: String,
      default: "main",
    },
    branches: {
      type: [String],
      default: ["main"],
    },
    gitRemoteUrl: {
      type: String,
      default: "",
    },
    gitProvider: {
      type: String,
      enum: ["none", "github"],
      default: "none",
    },
    tags: [
      {
        type: String,
      },
    ],
    gitignore: {
      type: String,
      default: "None"
    },
    license: {
      type: String,
      default: "None"
    },
    initializeWithReadme: {
      type: Boolean,
      default: false,
    },
    // ─── Gitea References ────────────────────────────────────────────────────
    // Cross-references to the actual Git repository engine (Gitea).
    // When giteaRepoId is set, all Git operations are backed by Gitea.
    giteaRepoId:   { type: Number, default: null },     // Gitea's internal numeric repo ID
    giteaFullName: { type: String, default: "" },       // "username/reponame" in Gitea
    cloneUrlHttps: { type: String, default: "" },       // Real HTTPS clone URL from Gitea
    cloneUrlSsh:   { type: String, default: "" },       // Real SSH clone URL from Gitea
    giteaSynced:   { type: Boolean, default: false },   // True when Gitea repo has been created

    // ─── Stars ──────────────────────────────────────────────────────────────
    stars: [{ type: Schema.Types.ObjectId, ref: "user" }],
    starCount: { type: Number, default: 0 },

    // ─── Forking ─────────────────────────────────────────────────────────────
    isFork: { type: Boolean, default: false },
    parentRepoId: { type: Schema.Types.ObjectId, ref: "Repository", default: null },
    parentOwnerId: { type: Schema.Types.ObjectId, ref: "user", default: null },
    forkedFrom: { type: String, default: "" },
    forkedFromRepoId: { type: Schema.Types.ObjectId, ref: "Repository", default: null },
    forkCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const RepositoryModel = model("Repository", repositorySchema);
