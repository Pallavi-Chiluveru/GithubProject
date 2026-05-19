/**
 * encrypt.js
 * AES-256-GCM symmetric encryption for storing Gitea user tokens securely in MongoDB.
 * The GITEA_TOKEN_ENCRYPTION_KEY env var must be exactly 32 characters.
 */

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

const getKey = () => {
  const key = process.env.GITEA_TOKEN_ENCRYPTION_KEY;
  if (!key || key.length !== 32) {
    // In development, use a default key (warn loudly)
    console.warn("[Encrypt] GITEA_TOKEN_ENCRYPTION_KEY is not set or not 32 chars — using fallback. SET THIS IN PRODUCTION!");
    return "antigravity-default-key-32chars!";
  }
  return key;
};

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * @param {string} plaintext
 * @returns {string} — base64 encoded "iv:authTag:ciphertext"
 */
export const encryptToken = (plaintext) => {
  if (!plaintext) return "";
  try {
    const key = Buffer.from(getKey(), "utf8");
    const iv = crypto.randomBytes(12); // 96-bit IV for GCM
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();

    // Pack as iv:authTag:ciphertext separated by colons (all base64)
    return [iv, authTag, encrypted].map(b => b.toString("base64")).join(":");
  } catch (err) {
    console.error("[Encrypt] encryptToken failed:", err.message);
    return "";
  }
};

/**
 * Decrypts an AES-256-GCM encrypted token.
 * @param {string} encoded — "iv:authTag:ciphertext" (base64)
 * @returns {string} plaintext token
 */
export const decryptToken = (encoded) => {
  if (!encoded) return "";
  try {
    const parts = encoded.split(":");
    if (parts.length !== 3) return "";

    const key = Buffer.from(getKey(), "utf8");
    const [iv, authTag, ciphertext] = parts.map(p => Buffer.from(p, "base64"));

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString("utf8");
  } catch (err) {
    console.error("[Encrypt] decryptToken failed — token may be corrupted:", err.message);
    return "";
  }
};
