/**
 * sync-all-gitea.js
 * Programmatically restores and synchronizes MongoDB users and repositories with the Gitea Git engine.
 * Maps missing credentials, registers Gitea accounts, and mirrors local repositories in Gitea.
 */

import "dotenv/config"; // LOAD ENVIRONMENT VARIABLES FIRST before other imports are evaluated!

import { UserModel } from "../models/UserModel.js";
import { RepositoryModel } from "../models/RepositoryModel.js";
import { connect, disconnect } from "mongoose";
import { execSync } from "child_process";
import axios from "axios";
import { encryptToken } from "../utils/encrypt.js";
import { adminClient, GITEA_BASE } from "../services/giteaClient.js";
import { createGiteaUser, getGiteaUserInfo } from "../services/giteaAuthService.js";
import { createGiteaRepo } from "../services/giteaRepoService.js";

// Helper to generate a token using Gitea CLI inside container with full scopes
function generateGiteaTokenViaCli(username, giteaUserId) {
  try {
    // 1. Delete conflicting token from SQLite first
    if (giteaUserId) {
      try {
        const deleteDbCmd = `docker exec -u 1000 github-clone-gitea sqlite3 /data/gitea/gitea.db "DELETE FROM access_token WHERE uid = ${giteaUserId} AND name = 'antigravity-platform';"`;
        execSync(deleteDbCmd);
        console.log(`[Gitea SQLite] Cleaned up existing token for UID ${giteaUserId} (username: ${username})`);
      } catch (dbErr) {
        console.warn(`[Gitea SQLite] Non-fatal: could not clear SQLite token for UID ${giteaUserId}:`, dbErr.message);
      }
    }

    // 2. Generate new token via Gitea CLI with "--scopes all" for full permissions!
    const cmd = `docker exec -u 1000 github-clone-gitea gitea admin user generate-access-token --username ${username} --token-name antigravity-platform --scopes all`;
    const output = execSync(cmd).toString().trim();
    const match = output.match(/Access token was successfully created: ([a-f0-9]+)/);
    if (match && match[1]) {
      return match[1];
    }
    console.warn(`[Gitea CLI] Could not parse token from output for ${username}: ${output}`);
    return null;
  } catch (err) {
    console.error(`[Gitea CLI] Failed to generate token for ${username}:`, err.message);
    return null;
  }
}

async function syncAll() {
  console.log("🚀 Starting Gitea Sync & Setup script...\n");

  await connect(process.env.DB_URL);
  console.log("Connected to MongoDB database.");

  // 1. Sync User Accounts
  const users = await UserModel.find({});
  console.log(`Found ${users.length} users in MongoDB.`);

  for (const user of users) {
    console.log(`\n--- Processing User: ${user.username} ---`);

    // Case A: pallavi537 is the admin account Pallavi_Chiluveru in Gitea
    if (user.username === "pallavi537") {
      console.log(`User "pallavi537" maps to Gitea admin "Pallavi_Chiluveru". Linking...`);
      const encryptedAdminToken = encryptToken(process.env.GITEA_ADMIN_TOKEN);

      user.giteaUserId = 1;
      user.giteaUsername = "Pallavi_Chiluveru";
      user.giteaToken = encryptedAdminToken;
      user.giteaSynced = true;
      await user.save();

      console.log(`✅ Linked pallavi537 to Gitea admin Pallavi_Chiluveru!`);
      continue;
    }

    // Check Gitea account exists
    console.log(`Checking Gitea account for ${user.username}...`);
    let giteaInfo = await getGiteaUserInfo(user.username);

    if (!giteaInfo) {
      console.log(`Gitea user does not exist. Creating Gitea account for ${user.username}...`);
      giteaInfo = await createGiteaUser({
        username: user.username,
        email: user.email,
        password: "Password123!" // standard default password
      });

      if (!giteaInfo) {
        console.error(`❌ Failed to create Gitea user for ${user.username}`);
        continue;
      }
    }

    console.log(`Gitea account verified: ${giteaInfo.giteaUsername} (ID: ${giteaInfo.giteaUserId})`);

    // Clean up old token if any (Gitea API)
    try {
      await adminClient().delete(`/users/${giteaInfo.giteaUsername}/tokens/antigravity-platform`);
      console.log(`Removed old access tokens for ${giteaInfo.giteaUsername}.`);
    } catch (_) {}

    // Generate access token using Docker Gitea CLI (handles SQLite conflict cleanup first)
    console.log(`Generating/refreshing personal access token with 'all' scopes...`);
    const rawToken = generateGiteaTokenViaCli(giteaInfo.giteaUsername, giteaInfo.giteaUserId);

    if (!rawToken) {
      console.error(`❌ Failed to generate access token for ${giteaInfo.giteaUsername}`);
      continue;
    }

    console.log(`Token successfully generated. Encrypting and saving...`);
    const encryptedToken = encryptToken(rawToken);

    user.giteaUserId = giteaInfo.giteaUserId;
    user.giteaUsername = giteaInfo.giteaUsername;
    user.giteaToken = encryptedToken;
    user.giteaSynced = true;
    await user.save();

    console.log(`✅ Synced and saved Gitea token for user: ${user.username}`);
  }

  // 2. Sync Repositories
  const repos = await RepositoryModel.find({}).populate("owner");
  console.log(`\n======================================================`);
  console.log(`Checking ${repos.length} repositories in MongoDB...`);

  for (const repo of repos) {
    console.log(`\n--- Processing Repo: ${repo.name} (Owner: ${repo.owner?.username}) ---`);

    if (repo.giteaSynced && repo.giteaFullName) {
      console.log(`Repo is already synced: ${repo.giteaFullName}`);
      continue;
    }

    const owner = repo.owner;
    if (!owner || !owner.giteaSynced || !owner.giteaUsername) {
      console.warn(`⚠️ Cannot sync repository ${repo.name} - owner not Gitea synced.`);
      continue;
    }

    console.log(`Looking up repository in Gitea under: ${owner.giteaUsername}/${repo.name}...`);
    let giteaRepo = null;

    try {
      const res = await adminClient().get(`/repos/${owner.giteaUsername}/${repo.name}`);
      giteaRepo = res.data;
      console.log(`Found existing Gitea repository: ${giteaRepo.full_name}`);
    } catch (err) {
      if (err.response?.status === 404) {
        console.log(`Gitea repository not found. Creating in Gitea...`);
        // We will create the repo in Gitea
        // Decrypt owner's token to perform creation on their behalf
        let tokenToUse = process.env.GITEA_ADMIN_TOKEN;
        const ownerTokenRes = await UserModel.findById(owner._id).select("giteaToken").lean();
        
        if (ownerTokenRes && ownerTokenRes.giteaToken) {
          // decrypt
          const parts = ownerTokenRes.giteaToken.split(":");
          if (parts.length === 3) {
            try {
              const key = Buffer.from((process.env.GITEA_TOKEN_ENCRYPTION_KEY || "antigravity-default-key-32chars!").slice(0, 32).padEnd(32, "0"), "utf8");
              const [iv, authTag, ciphertext] = parts.map(p => Buffer.from(p, "base64"));
              const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
              decipher.setAuthTag(authTag);
              const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
              tokenToUse = decrypted.toString("utf8");
            } catch (decErr) {
              console.warn("Could not decrypt owner token, using admin token:", decErr.message);
            }
          }
        }

        try {
          // Call Gitea Repo Service function
          giteaRepo = await createGiteaRepo({
            giteaUsername: owner.giteaUsername,
            giteaToken: tokenToUse,
            name: repo.name,
            description: repo.description || "",
            isPrivate: repo.isPrivate || false,
          });
        } catch (creatErr) {
          console.error(`❌ Failed to create Gitea repository:`, creatErr.message);
        }
      } else {
        console.error(`Error checking Gitea repo:`, err.response?.data?.message || err.message);
      }
    }

    if (giteaRepo) {
      repo.giteaRepoId = giteaRepo.id;
      repo.giteaFullName = giteaRepo.full_name;
      repo.cloneUrlHttps = giteaRepo.clone_url;
      repo.cloneUrlSsh = giteaRepo.ssh_url;
      repo.giteaSynced = true;
      await repo.save();
      console.log(`✅ Synced repository "${repo.name}" with Gitea!`);
    } else {
      console.error(`❌ Failed to sync repository "${repo.name}".`);
    }
  }

  console.log(`\n🎉 Gitea Sync completed successfully!`);
  await disconnect();
  process.exit(0);
}

// Inline crypto decipher dependency for token decryption helper
import crypto from "crypto";

syncAll().catch(err => {
  console.error("Fatal Sync Error:", err);
  process.exit(1);
});
