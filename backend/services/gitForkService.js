/**
 * gitForkService.js
 * Handles the low-level Git synchronization using native git commands.
 */

import { exec } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

const execPromise = (cmd, options = {}) => {
  return new Promise((resolve, reject) => {
    exec(cmd, options, (error, stdout, stderr) => {
      if (error) {
        console.error(`[Exec Error] Command: "${cmd}" failed:`, stderr || error.message);
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
};

/**
 * Syncs a forked repository with its upstream repository.
 * Clones the fork, adds the upstream remote, fetches, merges, and pushes back to Gitea.
 */
export const syncForkWithUpstream = async ({
  forkCloneUrl,
  upstreamCloneUrl,
  giteaUsername,
  giteaToken,
  defaultBranch = "main"
}) => {
  const tempDir = path.join(os.tmpdir(), `reposphere-sync-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`);
  fs.mkdirSync(tempDir, { recursive: true });

  try {
    // Inject OAuth token into the clone URLs for authentication
    // Format: http://giteaUsername:token@domain:port/path.git
    const authenticatedForkUrl = forkCloneUrl.replace("://", `://${giteaUsername}:${giteaToken}@`);
    const authenticatedUpstreamUrl = upstreamCloneUrl.replace("://", `://${giteaUsername}:${giteaToken}@`);

    console.log(`[Git Sync] Temp dir: ${tempDir}`);
    console.log(`[Git Sync] Cloning fork from: ${forkCloneUrl.replace(/:[^@/]+@/, ":***@")}`);

    // Clone only the default branch to save time/bandwidth
    await execPromise(`git clone --single-branch --branch ${defaultBranch} ${authenticatedForkUrl} .`, { cwd: tempDir });

    // Set user.name and user.email for git merge
    await execPromise(`git config user.name "${giteaUsername}"`, { cwd: tempDir });
    await execPromise(`git config user.email "${giteaUsername}@reposphere.local"`, { cwd: tempDir });

    console.log(`[Git Sync] Adding upstream remote: ${upstreamCloneUrl.replace(/:[^@/]+@/, ":***@")}`);
    await execPromise(`git remote add upstream ${authenticatedUpstreamUrl}`, { cwd: tempDir });

    console.log("[Git Sync] Fetching upstream...");
    await execPromise("git fetch upstream", { cwd: tempDir });

    console.log(`[Git Sync] Merging upstream/${defaultBranch}...`);
    // Merge upstream default branch into local default branch without opening editor
    await execPromise(`git merge upstream/${defaultBranch} --no-edit`, { cwd: tempDir });

    console.log(`[Git Sync] Pushing back to origin/${defaultBranch}...`);
    await execPromise(`git push origin ${defaultBranch}`, { cwd: tempDir });

    console.log("[Git Sync] Successfully synced fork.");
    return { success: true, message: "Fork synced successfully" };
  } catch (err) {
    console.error("[Git Sync] Failed to sync fork:", err.message);
    throw new Error(`Git Sync failed: ${err.message}`);
  } finally {
    // Cleanup temporary directory (safely handles locked file issues on Windows)
    setTimeout(() => {
      try {
        if (fs.existsSync(tempDir)) {
          fs.rmSync(tempDir, { recursive: true, force: true });
          console.log(`[Git Sync] Cleaned up temp dir: ${tempDir}`);
        }
      } catch (cleanupErr) {
        console.warn(`[Git Sync] Failed to clean up temp dir ${tempDir}:`, cleanupErr.message);
      }
    }, 2000);
  }
};
