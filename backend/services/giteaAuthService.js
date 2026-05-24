/**
 * giteaAuthService.js
 * Manages user identity mirroring between MongoDB and Gitea.
 * Every RepoSphere user has a corresponding Gitea account so that
 * Git operations (clone, push, PR) are attributed to the correct user.
 */

import axios from "axios";
import { adminClient, GITEA_BASE, isGiteaConfigured } from "./giteaClient.js";

/**
 * Creates a new Gitea user account mirroring a MongoDB user.
 * Called during user registration.
 * @param {{ username: string, email: string, password: string }} userData
 * @returns {Promise<{ giteaUserId: number, giteaUsername: string } | null>}
 */
export const createGiteaUser = async ({ username, email, password }) => {
  if (!isGiteaConfigured()) {
    console.warn("[Gitea] Not configured — skipping user creation in Gitea.");
    return null;
  }

  try {
    const res = await adminClient().post("/admin/users", {
      username,
      email,
      password,
      must_change_password: false,
      source_id: 0,
      login_name: username,
      send_notify: false,
    });

    console.log(`[Gitea] Created user: ${username}`);
    return {
      giteaUserId: res.data.id,
      giteaUsername: res.data.login,
    };
  } catch (err) {
    const status = err.response?.status;
    const message = err.response?.data?.message;
    const detail = err.response?.data;
    console.error(
      `[Gitea] Failed to create user ${username}:`,
      `status=${status}`,
      `message=${message}`,
      `detail=${JSON.stringify(detail)}`
    );
    // 422 = user already exists in Gitea — look up and return their ID instead
    if (status === 422 && message?.includes('already')) {
      console.warn(`[Gitea] User ${username} already exists — fetching info.`);
      return getGiteaUserInfo(username);
    }
    return null;
  }
};

/**
 * Fetches Gitea user information by username.
 * @param {string} username
 * @returns {Promise<{ giteaUserId: number, giteaUsername: string } | null>}
 */
export const getGiteaUserInfo = async (username) => {
  if (!isGiteaConfigured()) return null;
  try {
    const res = await adminClient().get(`/users/${username}`);
    return {
      giteaUserId: res.data.id,
      giteaUsername: res.data.login,
    };
  } catch (err) {
    console.error(`[Gitea] Could not fetch user info for ${username}:`, err.response?.data?.message);
    return null;
  }
};

/**
 * Generates a personal access token for a Gitea user.
 * This token is stored encrypted in MongoDB and used for user-attributed Git operations.
 * @param {string} username
 * @param {string} plaintextPassword — needed for Basic Auth to generate token
 * @returns {Promise<string | null>} the raw token SHA
 */
export const createGiteaUserToken = async (username, plaintextPassword) => {
  if (!isGiteaConfigured()) return null;
  try {
    // First delete any existing token with the same name to avoid conflicts
    try {
      await adminClient().delete(`/users/${username}/tokens/reposphere-platform`);
    } catch (_) { /* ignore if not found */ }

    // Create token via basic auth (user credentials required)
    const res = await axios.post(
      `${GITEA_BASE}/api/v1/users/${username}/tokens`,
      {
        name: "reposphere-platform",
        // Gitea 1.22+ requires explicit scopes — without these the API returns
        // "access token must have a scope" error.
        scopes: [
          "write:repository",
          "read:user",
          "write:user",
          "write:issue",
          "read:organization",
          "write:organization",
          "read:notification",
        ],
      },
      {
        auth: { username, password: plaintextPassword },
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      }
    );

    console.log(`[Gitea] Created access token for user: ${username}`);
    return res.data.sha1;
  } catch (err) {
    console.error(`[Gitea] Failed to create token for ${username}:`, err.response?.data?.message || err.message);
    return null;
  }
};

/**
 * Deletes a Gitea user account.
 * Called when a MongoDB user deletes their RepoSphere account.
 * @param {string} username
 */
export const deleteGiteaUser = async (username) => {
  if (!isGiteaConfigured()) return;
  try {
    await adminClient().delete(`/admin/users/${username}`);
    console.log(`[Gitea] Deleted user: ${username}`);
  } catch (err) {
    console.error(`[Gitea] Failed to delete user ${username}:`, err.response?.data?.message);
  }
};

/**
 * Registers an SSH public key for a Gitea user.
 * Enables SSH-based Git operations for that user.
 * @param {string} username
 * @param {{ title: string, key: string }} sshKeyData
 */
export const addGiteaSSHKey = async (username, { title, key }) => {
  if (!isGiteaConfigured()) return null;
  try {
    const res = await adminClient().post(`/admin/users/${username}/keys`, {
      key,
      read_only: false,
      title,
    });
    console.log(`[Gitea] SSH key added for ${username}`);
    return res.data;
  } catch (err) {
    console.error(`[Gitea] Failed to add SSH key for ${username}:`, err.response?.data?.message);
    return null;
  }
};
