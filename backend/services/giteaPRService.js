/**
 * giteaPRService.js
 * Manages real Pull Requests through the Gitea API.
 * This replaces the simulated MongoDB-only PR system with genuine merge operations.
 */

import { adminClient, userClient, isGiteaConfigured } from "./giteaClient.js";

/**
 * Creates a Pull Request in Gitea.
 * @param {string} giteaUsername
 * @param {string} repoName
 * @param {string} giteaToken — user's personal access token (PR attributed to them)
 * @param {{ title, body, head, base, isDraft, labels, assignees }} prData
 * @returns {Promise<object | null>} Gitea PR object with { number, id, state, diff_url }
 */
export const createGiteaPR = async (giteaUsername, repoName, giteaToken, {
  title, body = "", head, base, isDraft = false, labels = [], assignees = [],
}) => {
  if (!isGiteaConfigured() || !giteaToken) return null;
  try {
    const res = await userClient(giteaToken).post(
      `/repos/${giteaUsername}/${repoName}/pulls`,
      { title, body, head, base, draft: isDraft, labels, assignees }
    );
    console.log(`[Gitea] PR created #${res.data.number}: ${title}`);
    return res.data;
  } catch (err) {
    console.error(`[Gitea] createGiteaPR failed:`, err.response?.data?.message || err.message);
    throw new Error(err.response?.data?.message || "Failed to create PR in Gitea");
  }
};

/**
 * Fetches a single PR's metadata.
 * @param {string} giteaUsername
 * @param {string} repoName
 * @param {number} prNumber
 */
export const getGiteaPR = async (giteaUsername, repoName, prNumber) => {
  if (!isGiteaConfigured()) return null;
  try {
    const res = await adminClient().get(`/repos/${giteaUsername}/${repoName}/pulls/${prNumber}`);
    return res.data;
  } catch (err) {
    console.error(`[Gitea] getGiteaPR #${prNumber} failed:`, err.response?.data?.message);
    return null;
  }
};

/**
 * Lists all PRs for a repository.
 * @param {string} giteaUsername
 * @param {string} repoName
 * @param {string} state — "open" | "closed" | "all"
 */
export const listGiteaPRs = async (giteaUsername, repoName, state = "open") => {
  if (!isGiteaConfigured()) return [];
  try {
    const res = await adminClient().get(`/repos/${giteaUsername}/${repoName}/pulls`, {
      params: { state, limit: 50 },
    });
    return res.data || [];
  } catch (err) {
    console.error(`[Gitea] listGiteaPRs failed:`, err.response?.data?.message);
    return [];
  }
};

/**
 * Returns file-level diffs for a PR (replaces simulated diff text).
 * @param {string} giteaUsername
 * @param {string} repoName
 * @param {number} prNumber
 * @returns {Promise<Array<{ filename, status, additions, deletions, changes, patch }>>}
 */
export const getPRFiles = async (giteaUsername, repoName, prNumber) => {
  if (!isGiteaConfigured()) return [];
  try {
    const res = await adminClient().get(`/repos/${giteaUsername}/${repoName}/pulls/${prNumber}/files`);
    return res.data || [];
  } catch (err) {
    console.error(`[Gitea] getPRFiles #${prNumber} failed:`, err.response?.data?.message);
    return [];
  }
};

/**
 * Returns all commits within a PR.
 * @param {string} giteaUsername
 * @param {string} repoName
 * @param {number} prNumber
 */
export const getPRCommits = async (giteaUsername, repoName, prNumber) => {
  if (!isGiteaConfigured()) return [];
  try {
    const res = await adminClient().get(`/repos/${giteaUsername}/${repoName}/pulls/${prNumber}/commits`);
    return res.data || [];
  } catch (err) {
    console.error(`[Gitea] getPRCommits #${prNumber} failed:`, err.response?.data?.message);
    return [];
  }
};

/**
 * Merges a PR using the specified strategy.
 * @param {string} giteaUsername
 * @param {string} repoName
 * @param {string} giteaToken — must be repo owner or admin
 * @param {number} prNumber
 * @param {string} mergeMethod — "merge" | "squash" | "rebase"
 * @param {string} mergeMessage — optional commit message
 */
export const mergeGiteaPR = async (giteaUsername, repoName, giteaToken, prNumber, mergeMethod = "merge", mergeMessage = "") => {
  if (!isGiteaConfigured() || !giteaToken) return null;
  try {
    await userClient(giteaToken).post(
      `/repos/${giteaUsername}/${repoName}/pulls/${prNumber}/merge`,
      {
        Do: mergeMethod,
        merge_message_field: mergeMessage || `Merged PR #${prNumber} via Antigravity`,
        delete_branch_after_merge: false,
      }
    );
    console.log(`[Gitea] PR #${prNumber} merged via ${mergeMethod}`);
    return { success: true };
  } catch (err) {
    console.error(`[Gitea] mergeGiteaPR #${prNumber} failed:`, err.response?.data?.message || err.message);
    throw new Error(err.response?.data?.message || "Failed to merge PR in Gitea");
  }
};

/**
 * Closes a PR without merging.
 * @param {string} giteaUsername
 * @param {string} repoName
 * @param {string} giteaToken
 * @param {number} prNumber
 */
export const closeGiteaPR = async (giteaUsername, repoName, giteaToken, prNumber) => {
  if (!isGiteaConfigured() || !giteaToken) return null;
  try {
    const res = await userClient(giteaToken).patch(
      `/repos/${giteaUsername}/${repoName}/pulls/${prNumber}`,
      { state: "closed" }
    );
    console.log(`[Gitea] PR #${prNumber} closed`);
    return res.data;
  } catch (err) {
    console.error(`[Gitea] closeGiteaPR #${prNumber} failed:`, err.response?.data?.message);
    return null;
  }
};

/**
 * Checks whether a PR can be merged (no conflicts).
 * @param {string} giteaUsername
 * @param {string} repoName
 * @param {number} prNumber
 * @returns {Promise<boolean>}
 */
export const isPRMergeable = async (giteaUsername, repoName, prNumber) => {
  const pr = await getGiteaPR(giteaUsername, repoName, prNumber);
  return pr?.mergeable === true;
};
