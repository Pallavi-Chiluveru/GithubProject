import { Schema, model } from "mongoose";

/**
 * CommitModel — Analytics Cache Layer
 *
 * This model is now a lightweight analytics cache populated by Gitea webhook push events.
 * It no longer stores file content, diffs, or snapshots (those are fetched live from Gitea).
 * The primary use cases are:
 *   1. Contribution heatmap data (commits per day/user)
 *   2. Repository activity feed
 *   3. Dashboard statistics (total commits, top contributors)
 *
 * Source of truth for actual commit content: Gitea commit API.
 */
const commitSchema = new Schema(
  {
    repoId: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
    },

    // Git commit identity
    sha: {
      type: String,
      required: true,
      index: true,
    },

    shortSha: {
      type: String,
      default: function () {
        return this.sha?.slice(0, 7) || "";
      },
    },

    message: {
      type: String,
      default: "Initial commit",
    },

    // Author info from Git commit object
    authorName: {
      type: String,
      default: "",
    },

    authorEmail: {
      type: String,
      default: "",
    },

    // Gitea user reference (if email matches a registered user)
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },

    branch: {
      type: String,
      required: true,
      default: "main",
    },

    // Analytics metrics (populated from push webhook or diff API)
    addedLines: {
      type: Number,
      default: 0,
    },

    deletedLines: {
      type: Number,
      default: 0,
    },

    filesChanged: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Prevent duplicate SHA entries per repo
commitSchema.index({ repoId: 1, sha: 1 }, { unique: true });

export const CommitModel = model("Commit", commitSchema);