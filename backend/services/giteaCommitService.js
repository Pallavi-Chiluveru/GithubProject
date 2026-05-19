/**
 * giteaCommitService.js
 * Reads real Git commit history and file diffs from Gitea.
 * This replaces the simulated CommitModel-based system entirely.
 */

import { adminClient, userClient, GITEA_BASE, isGiteaConfigured } from "./giteaClient.js";
import axios from "axios";

/**
 * Returns the commit log for a branch (or tag/SHA).
 * @param {string} giteaUsername
 * @param {string} repoName
 * @param {string} branch
 * @param {number} limit
 * @param {number} page
 * @returns {Promise<Array<CommitObject>>}
 */
export const getCommitLog = async (giteaUsername, repoName, branch = "main", limit = 30, page = 1) => {
  if (!isGiteaConfigured()) return [];
  try {
    const res = await adminClient().get(`/repos/${giteaUsername}/${repoName}/commits`, {
      params: { sha: branch, limit, page },
    });
    return res.data || [];
  } catch (err) {
    console.error(`[Gitea] getCommitLog failed for ${giteaUsername}/${repoName}:`, err.response?.data?.message);
    return [];
  }
};

/**
 * Returns a single commit's metadata by its SHA.
 * @param {string} giteaUsername
 * @param {string} repoName
 * @param {string} sha
 */
export const getCommit = async (giteaUsername, repoName, sha) => {
  if (!isGiteaConfigured()) return null;
  try {
    const res = await adminClient().get(`/repos/${giteaUsername}/${repoName}/git/commits/${sha}`);
    return res.data;
  } catch (err) {
    console.error(`[Gitea] getCommit failed for ${sha}:`, err.response?.data?.message);
    return null;
  }
};

/**
 * Returns the raw unified diff text for a specific commit.
 * @param {string} giteaUsername
 * @param {string} repoName
 * @param {string} sha
 * @returns {Promise<string>} unified diff string
 */
export const getCommitDiff = async (giteaUsername, repoName, sha) => {
  if (!isGiteaConfigured()) return "";
  try {
    const res = await axios.get(
      `${GITEA_BASE}/${giteaUsername}/${repoName}/commit/${sha}.diff`,
      { timeout: 10000 }
    );
    return res.data;
  } catch (err) {
    console.error(`[Gitea] getCommitDiff failed for ${sha}:`, err.message);
    return "";
  }
};

/**
 * Returns files changed in a specific commit.
 * @param {string} giteaUsername
 * @param {string} repoName
 * @param {string} sha
 */
export const getCommitFiles = async (giteaUsername, repoName, sha) => {
  if (!isGiteaConfigured()) return [];
  try {
    const res = await adminClient().get(`/repos/${giteaUsername}/${repoName}/commits/${sha}`);
    return res.data?.files || [];
  } catch (err) {
    console.error(`[Gitea] getCommitFiles failed:`, err.response?.data?.message);
    return [];
  }
};

/**
 * Compares two branches and returns commits unique to the head branch.
 * Used for branch comparison in CreatePullRequest.
 * @param {string} giteaUsername
 * @param {string} repoName
 * @param {string} base — target branch (e.g., "main")
 * @param {string} head — source branch (e.g., "dev-feature")
 * @returns {Promise<{ commits: [], files: [], totalCommits: number, diffUrl: string }>}
 */
export const compareBranches = async (giteaUsername, repoName, base, head) => {
  if (!isGiteaConfigured()) return { commits: [], files: [], totalCommits: 0 };
  try {
    const res = await adminClient().get(
      `/repos/${giteaUsername}/${repoName}/compare/${base}...${head}`
    );
    return res.data;
  } catch (err) {
    console.error(`[Gitea] compareBranches failed (${base}...${head}):`, err.response?.data?.message);
    return { commits: [], files: [], totalCommits: 0 };
  }
};

/**
 * Compares branches across TWO DIFFERENT repositories (fork → parent).
 * This is the core function for GitHub-style fork pull requests.
 *
 * Gitea format: /repos/{baseOwner}/{baseRepo}/compare/{baseBranch}...{headOwner}:{headBranch}
 *
 * @param {string} baseOwner  — Gitea username of the parent repo owner (e.g. "manasa116")
 * @param {string} baseRepo   — Gitea repo name of the parent (e.g. "re11")
 * @param {string} baseBranch — Target branch in the parent repo (e.g. "main")
 * @param {string} headOwner  — Gitea username of the fork owner (e.g. "giri9115")
 * @param {string} headBranch — Source branch in the fork (e.g. "main")
 * @returns {Promise<{ commits: [], files: [], totalCommits: number, canMerge: boolean }>}
 */
export const compareRepos = async (baseOwner, baseRepo, baseBranch, headOwner, headBranch) => {
  if (!isGiteaConfigured()) return { commits: [], files: [], totalCommits: 0, canMerge: false };
  try {
    // The critical format: baseBranch...headOwner:headBranch
    const compareRef = `${baseBranch}...${headOwner}:${headBranch}`;
    const res = await adminClient().get(
      `/repos/${baseOwner}/${baseRepo}/compare/${compareRef}`
    );
    const data = res.data || {};
    return {
      commits: data.commits || [],
      files: data.files || [],
      totalCommits: data.total_commits || (data.commits?.length ?? 0),
      canMerge: data.status === "ahead" || (data.commits?.length > 0),
      status: data.status, // "ahead" | "behind" | "diverged" | "identical"
      diffUrl: `${GITEA_BASE}/${baseOwner}/${baseRepo}/compare/${compareRef}`,
    };
  } catch (err) {
    console.error(`[Gitea] compareRepos failed (${baseOwner}/${baseRepo} ← ${headOwner}:${headBranch}):`, err.response?.data?.message || err.message);
    return { commits: [], files: [], totalCommits: 0, canMerge: false };
  }
};

/**
 * Lists files and their content/tree at a specific ref (branch/SHA).
 * @param {string} giteaUsername
 * @param {string} repoName
 * @param {string} ref
 */
export const getRepoTree = async (giteaUsername, repoName, ref = "main") => {
  if (!isGiteaConfigured()) return [];
  try {
    const res = await adminClient().get(`/repos/${giteaUsername}/${repoName}/git/trees/${ref}`, {
      params: { recursive: true },
    });
    return res.data?.tree || [];
  } catch (err) {
    console.error(`[Gitea] getRepoTree failed:`, err.response?.data?.message);
    return [];
  }
};

/**
 * Fetches and decodes the raw content of a file from Gitea.
 * @param {string} giteaUsername
 * @param {string} repoName
 * @param {string} filePath
 * @param {string} ref
 */
export const getFileContent = async (giteaUsername, repoName, filePath, ref = "main") => {
  if (!isGiteaConfigured()) return null;
  try {
    const res = await adminClient().get(`/repos/${giteaUsername}/${repoName}/contents/${filePath}`, {
      params: { ref },
    });
    const data = res.data;
    if (!data || !data.content) return null;
    const decoded = Buffer.from(data.content, "base64").toString("utf8");
    return { content: decoded, size: data.size, sha: data.sha };
  } catch (err) {
    console.error(`[Gitea] getFileContent failed for ${filePath}:`, err.response?.data?.message);
    return null;
  }
};

/**
 * Commits an edit to a file back to Gitea.
 * @param {string} giteaUsername
 * @param {string} repoName
 * @param {string} filePath
 * @param {string} content
 * @param {string} sha
 * @param {string} message
 * @param {string} branch
 * @param {string} [userToken] — if provided, commit is attributed to this user
 */
export const updateFileContent = async (giteaUsername, repoName, filePath, content, sha, message = "Update file", branch = "main", userToken = null) => {
  if (!isGiteaConfigured()) return null;
  try {
    const base64Content = Buffer.from(content, "utf8").toString("base64");
    const client = userToken ? userClient(userToken) : adminClient();
    const res = await client.put(`/repos/${giteaUsername}/${repoName}/contents/${filePath}`, {
      content: base64Content,
      sha,
      message,
      branch,
    });
    return res.data;
  } catch (err) {
    console.error(`[Gitea] updateFileContent failed for ${filePath}:`, err.response?.data?.message);
    throw err;
  }
};
