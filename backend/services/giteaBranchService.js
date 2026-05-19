/**
 * giteaBranchService.js
 * Manages Git branches through the Gitea API.
 * Branches are authoritative from Gitea — MongoDB's `branches[]` array
 * is deprecated and replaced by real-time lookups here.
 */

import { adminClient, userClient, isGiteaConfigured } from "./giteaClient.js";

/**
 * Lists all branches for a repository.
 * @param {string} giteaUsername
 * @param {string} repoName
 * @returns {Promise<Array<{ name: string, commit: object, protected: boolean }>>}
 */
export const listBranches = async (giteaUsername, repoName) => {
  if (!isGiteaConfigured()) return [];
  try {
    const res = await adminClient().get(
      `/repos/${giteaUsername}/${repoName}/branches`,
      { params: { limit: 50 } }
    );
    return res.data || [];
  } catch (err) {
    console.error(`[Gitea] listBranches failed for ${giteaUsername}/${repoName}:`, err.response?.data?.message);
    return [];
  }
};

/**
 * Gets a single branch's details.
 * @param {string} giteaUsername
 * @param {string} repoName
 * @param {string} branchName
 */
export const getBranch = async (giteaUsername, repoName, branchName) => {
  if (!isGiteaConfigured()) return null;
  try {
    const res = await adminClient().get(`/repos/${giteaUsername}/${repoName}/branches/${branchName}`);
    return res.data;
  } catch (err) {
    console.error(`[Gitea] getBranch failed:`, err.response?.data?.message);
    return null;
  }
};

/**
 * Creates a new branch from an existing branch (or commit SHA).
 * @param {string} giteaUsername
 * @param {string} repoName
 * @param {string} giteaToken — the user's token (attributed to them)
 * @param {{ newBranchName: string, oldBranchName?: string }} params
 */
export const createBranch = async (giteaUsername, repoName, giteaToken, { newBranchName, oldBranchName = "main" }) => {
  if (!isGiteaConfigured() || !giteaToken) return null;
  try {
    const res = await userClient(giteaToken).post(`/repos/${giteaUsername}/${repoName}/branches`, {
      new_branch_name: newBranchName,
      old_branch_name: oldBranchName,
    });
    console.log(`[Gitea] Created branch: ${newBranchName} from ${oldBranchName}`);
    return res.data;
  } catch (err) {
    console.error(`[Gitea] createBranch failed:`, err.response?.data?.message);
    return null;
  }
};

/**
 * Deletes a branch from a repository.
 * @param {string} giteaUsername
 * @param {string} repoName
 * @param {string} branchName
 */
export const deleteBranch = async (giteaUsername, repoName, branchName) => {
  if (!isGiteaConfigured()) return;
  try {
    await adminClient().delete(`/repos/${giteaUsername}/${repoName}/branches/${branchName}`);
    console.log(`[Gitea] Deleted branch: ${branchName}`);
  } catch (err) {
    console.error(`[Gitea] deleteBranch failed:`, err.response?.data?.message);
  }
};

/**
 * Sets branch protection rules (admin-level operation).
 * @param {string} giteaUsername
 * @param {string} repoName
 * @param {string} branchName
 * @param {{ requireReview?: boolean, dismissStaleReviews?: boolean }} rules
 */
export const protectBranch = async (giteaUsername, repoName, branchName, rules = {}) => {
  if (!isGiteaConfigured()) return null;
  try {
    const res = await adminClient().post(`/repos/${giteaUsername}/${repoName}/branch_protections`, {
      branch_name: branchName,
      enable_push: false,
      required_approvals: rules.requireReview ? 1 : 0,
      dismiss_stale_approvals: rules.dismissStaleReviews ?? true,
      enable_merge_whitelist: false,
    });
    console.log(`[Gitea] Branch protection set for: ${branchName}`);
    return res.data;
  } catch (err) {
    console.error(`[Gitea] protectBranch failed:`, err.response?.data?.message);
    return null;
  }
};

/**
 * Returns just the branch name strings — a simplified helper for dropdowns.
 * @param {string} giteaUsername
 * @param {string} repoName
 * @returns {Promise<string[]>}
 */
export const listBranchNames = async (giteaUsername, repoName) => {
  const branches = await listBranches(giteaUsername, repoName);
  return branches.map(b => b.name);
};
