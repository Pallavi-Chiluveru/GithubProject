/**
 * giteaRepoService.js
 * Manages Git repository lifecycle in Gitea.
 * All actual repository operations (create, delete, rename) go through here.
 */

import { adminClient, userClient, GITEA_BASE, isGiteaConfigured } from "./giteaClient.js";

/**
 * Creates a new Git repository in Gitea for a specific user.
 * @param {{ giteaUsername: string, giteaToken: string, name: string, description: string, isPrivate: boolean, defaultBranch: string }} params
 * @returns {Promise<{ id, name, full_name, clone_url, ssh_url, html_url } | null>}
 */
export const createGiteaRepo = async ({
  giteaUsername,
  giteaToken,
  name,
  description = "",
  isPrivate = false,
  defaultBranch = "main",
  autoInit = false,
}) => {
  if (!isGiteaConfigured() || !giteaToken) {
    console.warn("[Gitea] Not configured or no token — skipping repo creation.");
    return null;
  }

  try {
    const res = await userClient(giteaToken).post("/user/repos", {
      name,
      description,
      private: isPrivate,
      auto_init: autoInit,
      default_branch: defaultBranch,
    });

    console.log(`[Gitea] Created repo: ${giteaUsername}/${name}`);
    return res.data;
  } catch (err) {
    const status = err.response?.status;
    const message = err.response?.data?.message;

    if (status === 409) {
      // Repo already exists — fetch and return it
      console.warn(`[Gitea] Repo ${giteaUsername}/${name} already exists — fetching info.`);
      return getGiteaRepo(giteaUsername, name);
    }
    console.error(`[Gitea] Failed to create repo ${name}:`, message || err.message);
    return null;
  }
};

/**
 * Fetches metadata for a specific Gitea repository.
 * @param {string} giteaUsername
 * @param {string} repoName
 * @returns {Promise<object | null>}
 */
export const getGiteaRepo = async (giteaUsername, repoName) => {
  if (!isGiteaConfigured()) return null;
  try {
    const res = await adminClient().get(`/repos/${giteaUsername}/${repoName}`);
    return res.data;
  } catch (err) {
    console.error(`[Gitea] Failed to fetch repo ${giteaUsername}/${repoName}:`, err.response?.data?.message);
    return null;
  }
};

/**
 * Deletes a repository from Gitea.
 * @param {string} giteaUsername
 * @param {string} repoName
 */
export const deleteGiteaRepo = async (giteaUsername, repoName) => {
  if (!isGiteaConfigured()) return;
  try {
    await adminClient().delete(`/repos/${giteaUsername}/${repoName}`);
    console.log(`[Gitea] Deleted repo: ${giteaUsername}/${repoName}`);
  } catch (err) {
    if (err.response?.status !== 404) {
      console.error(`[Gitea] Failed to delete repo ${giteaUsername}/${repoName}:`, err.response?.data?.message);
    }
  }
};

/**
 * Updates repository metadata in Gitea (rename, description, visibility).
 * @param {string} giteaUsername
 * @param {string} repoName
 * @param {{ name?: string, description?: string, private?: boolean, website?: string }} updates
 * @returns {Promise<object | null>}
 */
export const updateGiteaRepo = async (giteaUsername, repoName, updates) => {
  if (!isGiteaConfigured()) return null;
  try {
    const res = await adminClient().patch(`/repos/${giteaUsername}/${repoName}`, updates);
    console.log(`[Gitea] Updated repo: ${giteaUsername}/${repoName}`);
    return res.data;
  } catch (err) {
    console.error(`[Gitea] Failed to update repo ${giteaUsername}/${repoName}:`, err.response?.data?.message);
    return null;
  }
};

/**
 * Returns the real clone URLs for a repository.
 * @param {string} giteaUsername
 * @param {string} repoName
 * @returns {{ https: string, ssh: string, cli: string }}
 */
export const buildCloneUrls = (giteaUsername, repoName) => ({
  https: `${GITEA_BASE}/${giteaUsername}/${repoName}.git`,
  ssh: `git@${process.env.GITEA_SSH_DOMAIN || "localhost"}:${process.env.GITEA_SSH_PORT || "2222"}/${giteaUsername}/${repoName}.git`,
  cli: `git clone ${GITEA_BASE}/${giteaUsername}/${repoName}.git`,
});

/**
 * Forks a repository in Gitea under the requesting user's account.
 * @param {string} ownerUsername
 * @param {string} repoName
 * @param {string} forkUserToken — the forking user's Gitea access token
 */
export const forkGiteaRepo = async (ownerUsername, repoName, forkUserToken, forkName = null) => {
  if (!isGiteaConfigured() || !forkUserToken) return null;
  try {
    const body = {};
    if (forkName) {
      body.name = forkName;
    }
    const res = await userClient(forkUserToken).post(`/repos/${ownerUsername}/${repoName}/forks`, body);
    return res.data;
  } catch (err) {
    console.error(`[Gitea] Failed to fork ${ownerUsername}/${repoName}:`, err.response?.data?.message || err.message);
    return null;
  }
};

/**
 * Lists all repository topics/tags in Gitea.
 * @param {string} giteaUsername
 * @param {string} repoName
 */
export const getGiteaTopics = async (giteaUsername, repoName) => {
  if (!isGiteaConfigured()) return [];
  try {
    const res = await adminClient().get(`/repos/${giteaUsername}/${repoName}/topics`);
    return res.data?.topics || [];
  } catch (_) {
    return [];
  }
};
