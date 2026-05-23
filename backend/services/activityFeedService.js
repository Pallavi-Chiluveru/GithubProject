/**
 * activityFeedService.js
 * Processes raw Gitea webhook payloads into structured MongoDB activity logs.
 * This is the bridge between Git events and the Antigravity analytics/feed system.
 */

import { ActivityLogModel } from "../models/ActivityLogModel.js";
import { CommitModel } from "../models/CommitModel.js";
import { RepositoryModel } from "../models/RepositoryModel.js";
import { UserModel } from "../models/UserModel.js";
import { syncRepoFromGitea } from "./repoSyncService.js";

/**
 * Handles a "push" webhook event from Gitea.
 * Stores each commit as an analytics record and creates an activity log entry.
 * @param {object} payload — raw Gitea push webhook payload
 */
export const handlePushEvent = async (payload) => {
  try {
    const giteaRepoId = payload.repository?.id;
    if (!giteaRepoId) return;

    const repo = await RepositoryModel.findOne({ giteaRepoId });
    if (!repo) return;

    const branch = (payload.ref || "").replace("refs/heads/", "");

    // Resolve authentic user details by looking up Mongoose UserModel by Gitea username
    const giteaUsername = payload.sender?.login || payload.pusher?.username;
    let resolvedUser = null;
    if (giteaUsername) {
      resolvedUser = await UserModel.findOne({
        $or: [
          { giteaUsername: giteaUsername },
          { username: giteaUsername }
        ]
      });
    }

    console.log({
      stage: "db_persistence_started",
      giteaUser: giteaUsername || null,
      repoOwner: repo.owner ? repo.owner.toString() : null,
      commitAuthor: payload.commits?.[0]?.author?.name || null,
      webhookSender: giteaUsername || null,
      socketRoomUser: null,
      frontendUser: null
    });

    // Persist each commit to MongoDB as an analytics cache entry
    for (const commit of payload.commits || []) {
      await CommitModel.findOneAndUpdate(
        { sha: commit.id },
        {
          repoId: repo._id,
          sha: commit.id,
          shortSha: commit.id.slice(0, 7),
          message: commit.message,
          authorName: commit.author?.name || "Unknown",
          authorEmail: commit.author?.email || "",
          createdBy: resolvedUser ? resolvedUser._id : null, // Link resolved Mongoose user
          branch,
          filesChanged: (commit.added?.length || 0) + (commit.modified?.length || 0) + (commit.removed?.length || 0),
          addedLines: 0,     // Not available in push payload; enriched later if needed
          deletedLines: 0,
        },
        { upsert: true, new: true }
      );
    }

    // Create a single activity log entry summarising the push
    if ((payload.commits || []).length > 0) {
      const firstCommit = payload.commits[0];
      const isMismatch = giteaUsername && firstCommit.author?.name && (giteaUsername !== firstCommit.author?.name);
      await ActivityLogModel.create({
        user: resolvedUser ? resolvedUser._id : repo.owner, // Link to actual user or repo owner
        giteaUsername: giteaUsername || "",
        pushedBy: giteaUsername || "",
        repoId: repo._id,
        action: "commit_pushed",
        message: `${giteaUsername || firstCommit.author?.name || "Unknown"} pushed ${payload.commits.length} commit(s) to ${branch}: "${firstCommit.message.slice(0, 80)}"`,
        metadata: {
          giteaUser: giteaUsername || null,
          commitAuthor: firstCommit.author?.name || null,
          identityMismatch: !!isMismatch,
          staleSessionOverwrite: false
        }
      });
    }

    // Repository Sync Validation: Fetch latest repo metadata from Gitea API after every push
    await syncRepoFromGitea(repo._id);

    console.log({
      stage: "db_persistence_completed",
      giteaUser: giteaUsername || null,
      repoOwner: repo.owner ? repo.owner.toString() : null,
      commitAuthor: payload.commits?.[0]?.author?.name || null,
      webhookSender: giteaUsername || null,
      socketRoomUser: null,
      frontendUser: null
    });

    console.log(`[Activity] Push event processed for repo: ${repo.name}`);
  } catch (err) {
    console.error("[Activity] handlePushEvent failed:", err.message);
  }
};

/**
 * Handles a "pull_request" webhook event.
 * @param {object} payload — raw Gitea PR webhook payload
 */
export const handlePREvent = async (payload) => {
  try {
    const giteaRepoId = payload.repository?.id;
    if (!giteaRepoId) return;

    const repo = await RepositoryModel.findOne({ giteaRepoId });
    if (!repo) return;

    const action = payload.action; // "opened" | "closed" | "reopened" | "synchronized"
    const pr = payload.pull_request;
    if (!pr) return;

    const giteaUsername = payload.sender?.login || pr.user?.login;
    let resolvedUser = null;
    if (giteaUsername) {
      resolvedUser = await UserModel.findOne({
        $or: [
          { giteaUsername: giteaUsername },
          { username: giteaUsername }
        ]
      });
    }

    let logMessage = "";
    if (action === "opened") {
      logMessage = `${giteaUsername || pr.user?.login} opened PR #${pr.number}: "${pr.title}"`;
    } else if (action === "closed" && pr.merged) {
      logMessage = `PR #${pr.number} "${pr.title}" was merged`;
    } else if (action === "closed") {
      logMessage = `PR #${pr.number} "${pr.title}" was closed`;
    } else {
      return; // ignore other actions for now
    }

    await ActivityLogModel.create({
      user: resolvedUser ? resolvedUser._id : repo.owner,
      giteaUsername: giteaUsername || "",
      pushedBy: giteaUsername || "",
      repoId: repo._id,
      action: action === "opened" ? "pr_created" : pr.merged ? "pr_merged" : "pr_closed",
      message: logMessage,
    });

    console.log(`[Activity] PR event (${action}) processed for repo: ${repo.name}`);
  } catch (err) {
    console.error("[Activity] handlePREvent failed:", err.message);
  }
};

/**
 * Handles a "create" event (branch or tag created).
 * @param {object} payload — raw Gitea create webhook payload
 */
export const handleCreateEvent = async (payload) => {
  try {
    const giteaRepoId = payload.repository?.id;
    if (!giteaRepoId) return;

    const repo = await RepositoryModel.findOne({ giteaRepoId });
    if (!repo) return;

    const refType = payload.ref_type; // "branch" | "tag"
    const refName = payload.ref;

    const giteaUsername = payload.sender?.login;
    let resolvedUser = null;
    if (giteaUsername) {
      resolvedUser = await UserModel.findOne({
        $or: [
          { giteaUsername: giteaUsername },
          { username: giteaUsername }
        ]
      });
    }

    if (refType === "branch") {
      // Add branch to MongoDB cache
      if (!repo.branches.includes(refName)) {
        repo.branches.push(refName);
        await repo.save();
      }

      await ActivityLogModel.create({
        user: resolvedUser ? resolvedUser._id : repo.owner,
        giteaUsername: giteaUsername || "",
        pushedBy: giteaUsername || "",
        repoId: repo._id,
        action: "branch_created",
        message: `${giteaUsername || payload.sender?.login || "Unknown"} created branch "${refName}"`,
      });
    }

    console.log(`[Activity] Create event (${refType}: ${refName}) processed`);
  } catch (err) {
    console.error("[Activity] handleCreateEvent failed:", err.message);
  }
};

/**
 * Handles a "delete" event (branch or tag deleted).
 * @param {object} payload — raw Gitea delete webhook payload
 */
export const handleDeleteEvent = async (payload) => {
  try {
    const giteaRepoId = payload.repository?.id;
    if (!giteaRepoId) return;

    const repo = await RepositoryModel.findOne({ giteaRepoId });
    if (!repo) return;

    const refType = payload.ref_type;
    const refName = payload.ref;

    const giteaUsername = payload.sender?.login;
    let resolvedUser = null;
    if (giteaUsername) {
      resolvedUser = await UserModel.findOne({
        $or: [
          { giteaUsername: giteaUsername },
          { username: giteaUsername }
        ]
      });
    }

    if (refType === "branch") {
      // Remove branch from MongoDB cache
      repo.branches = repo.branches.filter(b => b !== refName);
      await repo.save();

      await ActivityLogModel.create({
        user: resolvedUser ? resolvedUser._id : repo.owner,
        giteaUsername: giteaUsername || "",
        pushedBy: giteaUsername || "",
        repoId: repo._id,
        action: "branch_deleted",
        message: `${giteaUsername || payload.sender?.login || "Unknown"} deleted branch "${refName}"`,
      });
    }

    console.log(`[Activity] Delete event (${refType}: ${refName}) processed`);
  } catch (err) {
    console.error("[Activity] handleDeleteEvent failed:", err.message);
  }
};
