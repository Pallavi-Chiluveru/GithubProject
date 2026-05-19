/**
 * giteaClient.js
 * Shared Axios factory for all Gitea API calls.
 * Provides two clients:
 *   1. adminClient  — uses the platform's admin token (server-to-server operations)
 *   2. userClient   — uses a specific user's personal access token (acts on their behalf)
 */

import axios from "axios";

const GITEA_BASE_URL = process.env.GITEA_BASE_URL || "http://localhost:3000";
const GITEA_ADMIN_TOKEN = process.env.GITEA_ADMIN_TOKEN;

/**
 * Returns an Axios instance authenticated as the platform admin.
 * Use for operations that require elevated permissions (creating users, registering webhooks).
 */
export const adminClient = () =>
  axios.create({
    baseURL: `${GITEA_BASE_URL}/api/v1`,
    headers: {
      Authorization: `token ${GITEA_ADMIN_TOKEN}`,
      "Content-Type": "application/json",
    },
    timeout: 10000,
  });

/**
 * Returns an Axios instance authenticated as a specific user.
 * Use for operations that should be attributed to the user (creating repos, opening PRs).
 * @param {string} userToken — the user's personal access token stored in MongoDB
 */
export const userClient = (userToken) =>
  axios.create({
    baseURL: `${GITEA_BASE_URL}/api/v1`,
    headers: {
      Authorization: `token ${userToken}`,
      "Content-Type": "application/json",
    },
    timeout: 10000,
  });

/**
 * Returns true if Gitea is configured (i.e., environment vars are set).
 * Use this guard before any Gitea operation to allow graceful fallback.
 */
export const isGiteaConfigured = () =>
  !!(process.env.GITEA_BASE_URL && process.env.GITEA_ADMIN_TOKEN);

export const GITEA_BASE = GITEA_BASE_URL;
