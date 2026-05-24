/**
 * patch-user-token.js
 * One-off script to generate and store a Gitea token for an existing user
 * who was created before the scope fix was applied.
 *
 * Usage:
 *   node backend/scripts/patch-user-token.js <username> <password>
 *
 * Example:
 *   node backend/scripts/patch-user-token.js manasa116 YourPassword123
 */

import { config } from "dotenv";
import mongoose from "mongoose";
import axios from "axios";
config();

const USERNAME = process.argv[2];
const PASSWORD = process.argv[3];
const GITEA_BASE = process.env.GITEA_BASE_URL || "http://localhost:3000";
const ENCRYPTION_KEY = process.env.GITEA_TOKEN_ENCRYPTION_KEY || "";

if (!USERNAME || !PASSWORD) {
  console.error("Usage: node patch-user-token.js <username> <password>");
  process.exit(1);
}

// ─── AES-256-GCM encrypt (inline, no import needed) ─────────────────────────
import crypto from "crypto";
const encryptToken = (plaintext) => {
  const key = Buffer.from(ENCRYPTION_KEY.slice(0, 32).padEnd(32, "0"), "utf8");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv, authTag, encrypted].map(b => b.toString("base64")).join(":");
};

async function patchUser() {
  await mongoose.connect(process.env.DB_URL);
  console.log("[DB] Connected to MongoDB");

  const db = mongoose.connection.db;

  // Find user by username
  const user = await db.collection("users").findOne({ username: USERNAME });
  if (!user) {
    console.error(`[Error] User "${USERNAME}" not found in MongoDB`);
    process.exit(1);
  }
  console.log(`[DB] Found user: ${user.username} (${user._id})`);

  // Check Gitea user exists
  try {
    const check = await axios.get(`${GITEA_BASE}/api/v1/users/${USERNAME}`, {
      headers: { Authorization: `token ${process.env.GITEA_ADMIN_TOKEN}` }
    });
    console.log(`[Gitea] Gitea user exists: ${check.data.login} (id: ${check.data.id})`);
  } catch (e) {
    console.error(`[Gitea] User "${USERNAME}" not found in Gitea:`, e.response?.data?.message);
    process.exit(1);
  }

  // Delete old token if exists
  try {
    await axios.delete(`${GITEA_BASE}/api/v1/users/${USERNAME}/tokens/reposphere-platform`, {
      auth: { username: USERNAME, password: PASSWORD }
    });
    console.log("[Gitea] Removed old token (if any)");
  } catch (_) {}

  // Create new token WITH scopes
  const tokenRes = await axios.post(
    `${GITEA_BASE}/api/v1/users/${USERNAME}/tokens`,
    {
      name: "reposphere-platform",
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
      auth: { username: USERNAME, password: PASSWORD },
      headers: { "Content-Type": "application/json" },
    }
  );

  const rawToken = tokenRes.data.sha1;
  const encryptedToken = encryptToken(rawToken);

  console.log(`[Gitea] Token created: ${rawToken.slice(0, 8)}...`);

  // Patch MongoDB
  const giteaUserRes = await axios.get(`${GITEA_BASE}/api/v1/users/${USERNAME}`, {
    headers: { Authorization: `token ${process.env.GITEA_ADMIN_TOKEN}` }
  });

  await db.collection("users").updateOne(
    { _id: user._id },
    {
      $set: {
        giteaUserId: giteaUserRes.data.id,
        giteaUsername: giteaUserRes.data.login,
        giteaToken: encryptedToken,
        giteaSynced: true,
      }
    }
  );

  console.log(`\n✅ Patched! User "${USERNAME}" now has a valid Gitea token stored in MongoDB.`);
  console.log(`   Gitea ID     : ${giteaUserRes.data.id}`);
  console.log(`   Gitea login  : ${giteaUserRes.data.login}`);
  console.log(`   Token (enc.) : ${encryptedToken.slice(0, 20)}...`);

  await mongoose.disconnect();
  process.exit(0);
}

patchUser().catch(err => {
  console.error("[Fatal]", err.message);
  process.exit(1);
});
