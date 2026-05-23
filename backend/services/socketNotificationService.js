/**
 * socketNotificationService.js
 * Emits real-time Socket.IO events from webhook payloads.
 * Every Gitea event is translated into a structured Socket event
 * that the frontend listens for to update dashboards live.
 */

import { getIO } from "../socket.js";
import { RepositoryModel } from "../models/RepositoryModel.js";

/**
 * Emits events to a specific repository room.
 * All users on the repo detail page will receive these.
 * @param {number} giteaRepoId
 * @param {string} event
 * @param {object} data
 */
const emitToRepo = async (giteaRepoId, event, data) => {
  try {
    const repo = await RepositoryModel.findOne({ giteaRepoId }).select("_id");
    if (!repo) return;

    getIO().to(repo._id.toString()).emit(event, data);
    console.log(`[Socket] Emitted "${event}" to room ${repo._id}`);
  } catch (err) {
    console.error(`[Socket] emitToRepo failed for event "${event}":`, err.message);
  }
};

/**
 * Handles realtime notifications for a push event.
 * @param {object} payload — Gitea push webhook payload
 */
export const notifyPushEvent = async (payload) => {
  const branch = (payload.ref || "").replace("refs/heads/", "");
  const commits = payload.commits || [];
  const giteaRepoId = payload.repository?.id;
  if (!giteaRepoId || commits.length === 0) return;

  const giteaUsername = payload.sender?.login || payload.pusher?.username || commits[0]?.author?.name || "Unknown";

  console.log({
    stage: "socket_emission_started",
    giteaUser: giteaUsername,
    repoOwner: payload.repository?.owner?.username || payload.repository?.owner?.login || null,
    commitAuthor: commits[0]?.author?.name || null,
    webhookSender: payload.sender?.login || null,
    socketRoomUser: null,
    frontendUser: null
  });

  await emitToRepo(giteaRepoId, "commit_pushed", {
    branch,
    commitCount: commits.length,
    lastMessage: commits[0]?.message?.slice(0, 80) || "",
    author: giteaUsername,
    username: giteaUsername,
    timestamp: new Date().toISOString(),
  });

  await emitToRepo(giteaRepoId, "push-event", {
    branch,
    commitCount: commits.length,
    lastMessage: commits[0]?.message?.slice(0, 80) || "",
    author: giteaUsername,
    username: giteaUsername,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Handles realtime notifications for PR events (opened/merged/closed).
 * @param {object} payload — Gitea pull_request webhook payload
 */
export const notifyPREvent = async (payload) => {
  const action = payload.action;
  const pr = payload.pull_request;
  const giteaRepoId = payload.repository?.id;
  if (!giteaRepoId || !pr) return;

  let socketEvent = "";
  if (action === "opened") socketEvent = "pr_created";
  else if (action === "closed" && pr.merged) socketEvent = "pr_merged";
  else if (action === "closed") socketEvent = "pr_closed";
  else return;

  await emitToRepo(giteaRepoId, socketEvent, {
    prNumber: pr.number,
    title: pr.title,
    author: pr.user?.login,
    base: pr.base?.label,
    head: pr.head?.label,
    merged: pr.merged || false,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Handles realtime notifications for branch creation.
 * @param {object} payload — Gitea create webhook payload
 */
export const notifyCreateEvent = async (payload) => {
  const refType = payload.ref_type;
  const giteaRepoId = payload.repository?.id;
  if (!giteaRepoId) return;

  if (refType === "branch") {
    await emitToRepo(giteaRepoId, "branch_created", {
      branch: payload.ref,
      author: payload.sender?.login,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Handles realtime notifications for branch/tag deletion.
 * @param {object} payload — Gitea delete webhook payload
 */
export const notifyDeleteEvent = async (payload) => {
  const refType = payload.ref_type;
  const giteaRepoId = payload.repository?.id;
  if (!giteaRepoId) return;

  if (refType === "branch") {
    await emitToRepo(giteaRepoId, "branch_deleted", {
      branch: payload.ref,
      author: payload.sender?.login,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Broadcasts a global notification to ALL connected clients.
 * Use sparingly — for platform-wide alerts.
 * @param {string} event
 * @param {object} data
 */
export const broadcastGlobal = (event, data) => {
  try {
    getIO().emit(event, data);
  } catch (err) {
    console.error(`[Socket] broadcastGlobal failed:`, err.message);
  }
};
