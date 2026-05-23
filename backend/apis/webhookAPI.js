/**
 * webhookAPI.js
 * Gitea Webhook Receiver with HMAC-SHA256 signature verification.
 * All Gitea push, PR, and branch events flow through here and are:
 *   1. Verified for authenticity
 *   2. Processed into MongoDB activity logs and commit analytics
 *   3. Broadcast to live clients via Socket.IO
 */

import exp from "express";
import crypto from "crypto";
import {
  handlePushEvent,
  handlePREvent,
  handleCreateEvent,
  handleDeleteEvent,
} from "../services/activityFeedService.js";
import {
  notifyPushEvent,
  notifyPREvent,
  notifyCreateEvent,
  notifyDeleteEvent,
} from "../services/socketNotificationService.js";

export const webhookApp = exp.Router();

/**
 * Middleware: validates the Gitea HMAC-SHA256 webhook signature.
 * Gitea sends: X-Gitea-Signature: <hmac-sha256-hex>
 * We compare it against a locally computed HMAC using GITEA_WEBHOOK_SECRET.
 */
const verifyGiteaSignature = (req, res, next) => {
  const secret = process.env.GITEA_WEBHOOK_SECRET;

  // If no secret is configured, skip verification (development mode)
  if (!secret) {
    console.warn("[Webhook] GITEA_WEBHOOK_SECRET not set — skipping signature verification!");
    return next();
  }

  const signature = req.headers["x-gitea-signature"];
  if (!signature) {
    return res.status(401).json({ message: "Missing webhook signature" });
  }

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(JSON.stringify(req.body));
  const expectedSignature = hmac.digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    console.warn("[Webhook] Signature mismatch — potential spoofed request!");
    return res.status(403).json({ message: "Invalid webhook signature" });
  }

  next();
};

/* ─── WEBHOOK IDENTITY VALIDATION MIDDLEWARE ────────────────────────────────── */
/**
 * Middleware: validates webhook identity consistency.
 * Logs a warning if the webhook sender does not match the repository owner.
 */
const validateWebhookIdentity = (req, res, next) => {
  const payload = req.body;
  if (payload && payload.sender && payload.repository && payload.repository.owner) {
    const sender = payload.sender.login || payload.sender.username;
    const owner = payload.repository.owner.username || payload.repository.owner.login;
    if (sender && owner && sender !== owner) {
      console.warn(`[Webhook Validation] Potential identity mismatch detected: Webhook sender is "${sender}" but repository owner is "${owner}"`);
    }
  }
  next();
};

/* ─── MAIN WEBHOOK RECEIVER ───────────────────────────────────────────────── */
/**
 * POST /webhook-api/gitea
 * Receives all Gitea webhook events.
 * Event type is in the X-Gitea-Event header.
 */
webhookApp.post("/gitea", verifyGiteaSignature, validateWebhookIdentity, async (req, res) => {
  // Acknowledge immediately — Gitea expects fast responses
  res.status(200).json({ ok: true });

  const event = req.headers["x-gitea-event"];
  const deliveryId = req.headers["x-gitea-delivery"];
  const payload = req.body;

  // 1. Structured debug logging for full end-to-end lifecycle tracing
  console.log({
    stage: "webhook_received",
    event,
    deliveryId,
    giteaUser: payload.sender?.login || payload.sender?.username || null,
    repoOwner: payload.repository?.owner?.username || payload.repository?.owner?.login || null,
    commitAuthor: payload.head_commit?.author?.username || payload.commits?.[0]?.author?.name || null,
    webhookSender: payload.sender?.login || payload.sender?.username || null,
    socketRoomUser: null,
    frontendUser: null
  });

  try {
    switch (event) {
      case "push":
        // Run activity logging and socket notification in parallel
        await Promise.all([
          handlePushEvent(payload),
          notifyPushEvent(payload),
        ]);
        break;

      case "pull_request":
        await Promise.all([
          handlePREvent(payload),
          notifyPREvent(payload),
        ]);
        break;

      case "create":
        // Branch or tag was created
        await Promise.all([
          handleCreateEvent(payload),
          notifyCreateEvent(payload),
        ]);
        break;

      case "delete":
        // Branch or tag was deleted
        await Promise.all([
          handleDeleteEvent(payload),
          notifyDeleteEvent(payload),
        ]);
        break;

      case "repository":
        // Repository was created or deleted at the Gitea level
        console.log(`[Webhook] Repository event: ${payload.action} — ${payload.repository?.full_name}`);
        break;

      case "release":
        console.log(`[Webhook] Release event: ${payload.action} — ${payload.release?.tag_name}`);
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${event}`);
    }
  } catch (err) {
    console.error(`[Webhook] Error processing event "${event}":`, err.message);
  }
});

/* ─── HEALTH CHECK ────────────────────────────────────────────────────────── */
/**
 * GET /webhook-api/health
 * Simple endpoint to verify the webhook receiver is reachable.
 * Gitea can use this to test webhook connectivity.
 */
webhookApp.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Antigravity webhook receiver is live",
    timestamp: new Date().toISOString(),
  });
});
