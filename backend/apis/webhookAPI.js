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

/* ─── MAIN WEBHOOK RECEIVER ───────────────────────────────────────────────── */
/**
 * POST /webhook-api/gitea
 * Receives all Gitea webhook events.
 * Event type is in the X-Gitea-Event header.
 */
webhookApp.post("/gitea", verifyGiteaSignature, async (req, res) => {
  // Acknowledge immediately — Gitea expects fast responses
  res.status(200).json({ ok: true });

  const event = req.headers["x-gitea-event"];
  const deliveryId = req.headers["x-gitea-delivery"];
  const payload = req.body;

  console.log(`[Webhook] Received event: ${event} | delivery: ${deliveryId}`);

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
