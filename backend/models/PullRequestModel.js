import { Schema, model } from "mongoose";

const pullRequestSchema = new Schema(
  {
    // ─── Repository Context ─────────────────────────────────────────────────────
    // repoId is always the BASE repo (the parent / destination repo).
    // For same-repo PRs: repoId = baseRepoId = headRepoId.
    // For cross-fork PRs: repoId = baseRepoId (parent), headRepoId = fork repo.
    repoId: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
    },

    // ─── Cross-Repo Fork PR Fields ──────────────────────────────────────────────
    // baseRepoId: the destination repo (where the PR is "received" and shown)
    baseRepoId: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      default: null,
    },
    // headRepoId: the source repo (fork) where the changes come from
    headRepoId: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      default: null,
    },
    // isCrossRepo: true when PR spans two different repositories (fork → parent)
    isCrossRepo: {
      type: Boolean,
      default: false,
    },

    // ─── Branch Names ───────────────────────────────────────────────────────────
    sourceBranch: {
      type: String,
      required: true,
    },
    targetBranch: {
      type: String,
      required: true,
      default: "main",
    },

    // ─── PR Content ─────────────────────────────────────────────────────────────
    title: {
      type: String,
      required: true,
    },
    description: String,

    // ─── Legacy Commit References (kept for backwards compat) ───────────────────
    fromCommit: {
      type: Schema.Types.ObjectId,
      ref: "Commit",
    },
    toCommit: {
      type: Schema.Types.ObjectId,
      ref: "Commit",
    },

    // ─── Author & Collaborators ─────────────────────────────────────────────────
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    reviewers: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    assignees: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],

    // ─── Status & Workflow ──────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["open", "merged", "closed", "draft"],
      default: "open",
    },
    isDraft: {
      type: Boolean,
      default: false,
    },
    mergeMethod: {
      type: String,
      enum: ["merge", "squash", "rebase"],
      default: "merge",
    },

    // ─── Labels ─────────────────────────────────────────────────────────────────
    labels: [
      {
        type: String,
      },
    ],

    // ─── Gitea References ────────────────────────────────────────────────────────
    // When giteaPRNumber is set, all diff/merge operations use the Gitea PR API.
    // MongoDB stores UI metadata (labels, reviewers) + activity for notifications.
    giteaPRNumber: {
      type: Number,
      default: null,
    },
    giteaPRId: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

export const PullRequestModel = model("PullRequest", pullRequestSchema);
