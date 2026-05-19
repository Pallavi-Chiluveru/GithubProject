/**
 * repoSyncService.js
 * Keeps MongoDB's RepositoryModel in sync with the real Gitea state.
 * Called after webhook events to update metadata caches.
 */

import { RepositoryModel } from "../models/RepositoryModel.js";
import { getGiteaRepo } from "./giteaRepoService.js";
import { listBranchNames } from "./giteaBranchService.js";
import { isGiteaConfigured } from "./giteaClient.js";

/**
 * Syncs the latest Gitea repo metadata into MongoDB.
 * @param {string} mongoRepoId — MongoDB _id of the repository
 */
export const syncRepoFromGitea = async (mongoRepoId) => {
  if (!isGiteaConfigured()) return;

  try {
    const repo = await RepositoryModel.findById(mongoRepoId);
    if (!repo || !repo.giteaFullName) return;

    const [ownerUsername, repoName] = repo.giteaFullName.split("/");

    // Fetch real data from Gitea
    const [giteaRepo, branchNames] = await Promise.all([
      getGiteaRepo(ownerUsername, repoName),
      listBranchNames(ownerUsername, repoName),
    ]);

    if (!giteaRepo) return;

    // Update MongoDB cache fields
    await RepositoryModel.findByIdAndUpdate(mongoRepoId, {
      defaultBranch: giteaRepo.default_branch || "main",
      branches: branchNames.length > 0 ? branchNames : ["main"],
      cloneUrlHttps: giteaRepo.clone_url,
      cloneUrlSsh: giteaRepo.ssh_url,
    });

    console.log(`[Sync] Repo ${repo.name} synced from Gitea`);
  } catch (err) {
    console.error(`[Sync] syncRepoFromGitea failed for ${mongoRepoId}:`, err.message);
  }
};

/**
 * Updates the MongoDB repo record after a branch creation/deletion event.
 * @param {string} giteaRepoId — Gitea numeric repo ID
 * @param {string[]} updatedBranches — new full list of branch names
 */
export const updateRepoBranches = async (giteaRepoId, updatedBranches) => {
  try {
    await RepositoryModel.findOneAndUpdate(
      { giteaRepoId },
      { branches: updatedBranches }
    );
    console.log(`[Sync] Updated branches for giteaRepoId ${giteaRepoId}`);
  } catch (err) {
    console.error(`[Sync] updateRepoBranches failed:`, err.message);
  }
};
