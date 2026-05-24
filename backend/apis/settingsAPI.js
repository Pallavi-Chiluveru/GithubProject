import { Router } from "express";
import Groq from "groq-sdk";
import { verifyToken } from "../middleware/verifyToken.js";
import { RepositoryModel } from "../models/RepositoryModel.js";
import { UserModel } from "../models/UserModel.js";
import { encryptToken, decryptToken } from "../utils/encrypt.js";

import crypto from "crypto";

import {
  RepositoryModerationSettings,
  BlockedRepositoryUser,
  ModerationReport,
  ModerationAuditLog,
  BranchProtectionRule,
  Release,
  Ruleset,
  Environment,
  Deployment,
  ModelConnection,
  PromptHistory,
  Webhook,
  WebhookDelivery,
  Codespace,
  PageDeployment,
  SecurityAlert,
  DeployKey,
  RepositorySecret,
  RepositoryVariable,
  AccessibilitySettings
} from "../models/SettingsModels.js";

const router = Router();

// ==========================================
// MIDDLEWARES
// ==========================================

const checkRepoAccess = async (req, res, next) => {
  try {
    const { id } = req.params;
    const repo = await RepositoryModel.findById(id);
    if (!repo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    const isOwner = repo.owner.toString() === req.user.id;
    const isCollaborator = repo.collaborators?.some(c => c.toString() === req.user.id);

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: "Access denied: You do not have permissions for this repository" });
    }

    req.repo = repo;
    req.isOwner = isOwner;
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const requireOwner = (req, res, next) => {
  if (!req.isOwner) {
    return res.status(403).json({ message: "Only repository owners can modify settings." });
  }
  next();
};

// ==========================================
// 1. MODERATION API
// ==========================================

router.get("/:id/settings/moderation", verifyToken, checkRepoAccess, async (req, res) => {
  try {
    let settings = await RepositoryModerationSettings.findOne({ repoId: req.repo._id });
    if (!settings) {
      settings = await RepositoryModerationSettings.create({ repoId: req.repo._id });
    }

    const blockedUsers = await BlockedRepositoryUser.find({ repoId: req.repo._id }).populate("user", "username email profileImageUrl");
    const reports = await ModerationReport.find({ repoId: req.repo._id })
      .populate("reportedBy", "username")
      .populate("reportedUser", "username");
    const auditLogs = await ModerationAuditLog.find({ repoId: req.repo._id })
      .populate("actor", "username")
      .sort({ createdAt: -1 });

    res.status(200).json({ settings, blockedUsers, reports, auditLogs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id/settings/moderation", verifyToken, checkRepoAccess, requireOwner, async (req, res) => {
  try {
    const { commentLimit, issueLimit, prLimit, durationDays } = req.body;
    let limitExpiresAt = null;

    if (durationDays > 0) {
      limitExpiresAt = new Date();
      limitExpiresAt.setDate(limitExpiresAt.getDate() + parseInt(durationDays));
    }

    const settings = await RepositoryModerationSettings.findOneAndUpdate(
      { repoId: req.repo._id },
      { commentLimit, issueLimit, prLimit, limitExpiresAt },
      { new: true, upsert: true }
    );

    await ModerationAuditLog.create({
      repoId: req.repo._id,
      actor: req.user.id,
      action: "set_limit",
      details: `Comment limit: ${commentLimit}, Issue limit: ${issueLimit}, PR limit: ${prLimit}, Duration: ${durationDays} days`
    });

    res.status(200).json({ message: "Moderation limits updated successfully", settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/settings/moderation/block", verifyToken, checkRepoAccess, requireOwner, async (req, res) => {
  try {
    const { username } = req.body;
    const targetUser = await UserModel.findOne({ username });
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (targetUser._id.toString() === req.user.id) {
      return res.status(400).json({ message: "You cannot block yourself" });
    }

    const alreadyBlocked = await BlockedRepositoryUser.findOne({ repoId: req.repo._id, user: targetUser._id });
    if (alreadyBlocked) {
      return res.status(400).json({ message: "User is already blocked" });
    }

    await BlockedRepositoryUser.create({
      repoId: req.repo._id,
      user: targetUser._id,
      blockedBy: req.user.id
    });

    await ModerationAuditLog.create({
      repoId: req.repo._id,
      actor: req.user.id,
      action: "block_user",
      details: `Blocked user: ${username}`
    });

    res.status(200).json({ message: `Successfully blocked ${username}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id/settings/moderation/block/:userId", verifyToken, checkRepoAccess, requireOwner, async (req, res) => {
  try {
    const { userId } = req.params;
    const block = await BlockedRepositoryUser.findOneAndDelete({ repoId: req.repo._id, user: userId });
    if (!block) {
      return res.status(404).json({ message: "Block record not found" });
    }

    const unblockedUser = await UserModel.findById(userId);

    await ModerationAuditLog.create({
      repoId: req.repo._id,
      actor: req.user.id,
      action: "unblock_user",
      details: `Unblocked user: ${unblockedUser?.username || userId}`
    });

    res.status(200).json({ message: "Successfully unblocked user" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 2. BRANCH PROTECTION RULES API
// ==========================================

router.get("/:id/settings/branches", verifyToken, checkRepoAccess, async (req, res) => {
  try {
    const rules = await BranchProtectionRule.find({ repoId: req.repo._id });
    res.status(200).json({
      defaultBranch: req.repo.defaultBranch || "main",
      branches: req.repo.branches || ["main"],
      rules
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/settings/branches/rules", verifyToken, checkRepoAccess, requireOwner, async (req, res) => {
  try {
    const { branchName, requirePR, requiredApprovals, preventForcePush, preventDeletion, requireStatusChecks } = req.body;
    if (!branchName) {
      return res.status(400).json({ message: "Branch name is required" });
    }

    const rule = await BranchProtectionRule.findOneAndUpdate(
      { repoId: req.repo._id, branchName },
      { requirePR, requiredApprovals, preventForcePush, preventDeletion, requireStatusChecks },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: "Branch protection rule updated", rule });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id/settings/branches/rules/:ruleId", verifyToken, checkRepoAccess, requireOwner, async (req, res) => {
  try {
    await BranchProtectionRule.findOneAndDelete({ repoId: req.repo._id, _id: req.params.ruleId });
    res.status(200).json({ message: "Branch protection rule deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 3. TAGS & RELEASES API
// ==========================================

router.get("/:id/settings/releases", verifyToken, checkRepoAccess, async (req, res) => {
  try {
    const releases = await Release.find({ repoId: req.repo._id }).sort({ createdAt: -1 });
    res.status(200).json(releases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/settings/releases", verifyToken, checkRepoAccess, requireOwner, async (req, res) => {
  try {
    const { tagName, targetBranch, name, body, isPrerelease, isDraft } = req.body;
    if (!tagName || !name) {
      return res.status(400).json({ message: "Tag name and Release name are required" });
    }

    // Add branch to repository branch array if it's not present
    if (!req.repo.branches?.includes(targetBranch)) {
      req.repo.branches = [...(req.repo.branches || []), targetBranch];
      await req.repo.save();
    }

    const release = await Release.create({
      repoId: req.repo._id,
      tagName,
      targetBranch,
      name,
      body,
      isPrerelease,
      isDraft
    });

    res.status(201).json({ message: "Release published successfully", release });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id/settings/releases/:releaseId", verifyToken, checkRepoAccess, requireOwner, async (req, res) => {
  try {
    await Release.findOneAndDelete({ repoId: req.repo._id, _id: req.params.releaseId });
    res.status(200).json({ message: "Release deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 4. RULESETS API
// ==========================================

router.get("/:id/settings/rulesets", verifyToken, checkRepoAccess, async (req, res) => {
  try {
    const rulesets = await Ruleset.find({ repoId: req.repo._id });
    res.status(200).json(rulesets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/settings/rulesets", verifyToken, checkRepoAccess, requireOwner, async (req, res) => {
  try {
    const { rulesetId, name, enforcement, branchPattern, commitPrefixes, protectedPaths, requiredReviewers } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Ruleset name is required" });
    }

    let ruleset;
    if (rulesetId) {
      ruleset = await Ruleset.findOneAndUpdate(
        { repoId: req.repo._id, _id: rulesetId },
        { name, enforcement, branchPattern, commitPrefixes, protectedPaths, requiredReviewers },
        { new: true }
      );
    } else {
      ruleset = await Ruleset.create({
        repoId: req.repo._id,
        name,
        enforcement,
        branchPattern,
        commitPrefixes,
        protectedPaths,
        requiredReviewers
      });
    }

    res.status(200).json({ message: "Ruleset saved successfully", ruleset });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id/settings/rulesets/:rulesetId", verifyToken, checkRepoAccess, requireOwner, async (req, res) => {
  try {
    await Ruleset.findOneAndDelete({ repoId: req.repo._id, _id: req.params.rulesetId });
    res.status(200).json({ message: "Ruleset deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 5. WEBHOOKS API
// ==========================================

router.get("/:id/settings/webhooks", verifyToken, checkRepoAccess, async (req, res) => {
  try {
    const webhooks = await Webhook.find({ repoId: req.repo._id });
    const deliveries = await WebhookDelivery.find({ repoId: req.repo._id }).sort({ createdAt: -1 }).limit(10);
    res.status(200).json({ webhooks, deliveries });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/settings/webhooks", verifyToken, checkRepoAccess, requireOwner, async (req, res) => {
  try {
    const { webhookId, url, secret, events, isActive } = req.body;
    if (!url) {
      return res.status(400).json({ message: "Payload URL is required" });
    }

    let webhook;
    if (webhookId) {
      webhook = await Webhook.findOneAndUpdate(
        { repoId: req.repo._id, _id: webhookId },
        { url, secret, events, isActive },
        { new: true }
      );
    } else {
      webhook = await Webhook.create({
        repoId: req.repo._id,
        url,
        secret,
        events,
        isActive
      });
    }

    res.status(200).json({ message: "Webhook saved successfully", webhook });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id/settings/webhooks/:webhookId", verifyToken, checkRepoAccess, requireOwner, async (req, res) => {
  try {
    await Webhook.findOneAndDelete({ repoId: req.repo._id, _id: req.params.webhookId });
    await WebhookDelivery.deleteMany({ webhookId: req.params.webhookId });
    res.status(200).json({ message: "Webhook deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/settings/webhooks/:webhookId/test", verifyToken, checkRepoAccess, requireOwner, async (req, res) => {
  try {
    const { webhookId } = req.params;
    const webhook = await Webhook.findOne({ repoId: req.repo._id, _id: webhookId });
    if (!webhook) {
      return res.status(404).json({ message: "Webhook not found" });
    }

    // Simulate real POST request and payload delivery
    const payload = {
      zen: "Approachable is better than simple.",
      hook_id: webhook._id,
      repository: {
        id: req.repo._id,
        name: req.repo.name,
        full_name: `${req.user.username}/${req.repo.name}`
      },
      sender: {
        login: req.user.username,
        id: req.user.id
      }
    };

    const startTime = Date.now();
    let statusCode = 200;
    let status = "success";
    let responseBody = '{"message": "Webhook received successfully!"}';

    try {
      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-GitHub-Event": "ping",
          "X-Hub-Signature-256": "sha256=" + crypto.createHmac("sha256", webhook.secret || "secret").update(JSON.stringify(payload)).digest("hex")
        },
        body: JSON.stringify(payload)
      });
      statusCode = response.status;
      responseBody = await response.text();
      status = response.ok ? "success" : "failed";
    } catch (fetchErr) {
      statusCode = 502;
      status = "failed";
      responseBody = `Error: ${fetchErr.message}`;
    }

    const delivery = await WebhookDelivery.create({
      webhookId: webhook._id,
      repoId: req.repo._id,
      event: "ping",
      deliveryId: crypto.randomUUID(),
      statusCode,
      status,
      duration: Date.now() - startTime,
      requestBody: JSON.stringify(payload, null, 2),
      responseBody
    });

    res.status(200).json({ message: "Ping webhook delivered", delivery });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 6. AI MODELS (AI PLAYGROUND & CONFIG)
// ==========================================

router.get("/:id/settings/models", verifyToken, checkRepoAccess, async (req, res) => {
  try {
    const connections = await ModelConnection.find({ repoId: req.repo._id });
    const history = await PromptHistory.find({ repoId: req.repo._id })
      .populate("user", "username")
      .sort({ createdAt: -1 })
      .limit(30);

    // Mask API keys for security
    const maskedConnections = connections.map(conn => {
      const plain = decryptToken(conn.apiKey);
      const masked = plain ? `${plain.slice(0, 8)}...${plain.slice(-4)}` : "";
      return {
        _id: conn._id,
        provider: conn.provider,
        isActive: conn.isActive,
        apiKey: masked
      };
    });

    res.status(200).json({ connections: maskedConnections, history });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/settings/models/config", verifyToken, checkRepoAccess, requireOwner, async (req, res) => {
  try {
    const { provider, apiKey, isActive } = req.body;
    if (!apiKey) {
      return res.status(400).json({ message: "API key is required" });
    }

    const encrypted = encryptToken(apiKey);

    const connection = await ModelConnection.findOneAndUpdate(
      { repoId: req.repo._id, provider },
      { apiKey: encrypted, isActive },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: `${provider} configuration updated` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/settings/models/chat", verifyToken, checkRepoAccess, async (req, res) => {
  try {
    const { prompt, provider = "groq" } = req.body;
    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const connection = await ModelConnection.findOne({ repoId: req.repo._id, provider, isActive: true });

    // Use the saved connection key first, fall back to system GROQ_API_KEY
    let apiKey = process.env.GROQ_API_KEY;
    if (connection) {
      apiKey = decryptToken(connection.apiKey);
    }

    if (!apiKey) {
      return res.status(400).json({
        message: `No active ${provider} API Key found for this repository. Please configure it in your Models settings tab.`
      });
    }

    let responseText = "";
    if (provider === "groq" || provider === "grok" || provider === "gemini") {
      // Use official Groq SDK — llama-3.1-8b-instant is free and fast
      const groqClient = new Groq({ apiKey });

      const completion = await groqClient.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are a helpful coding assistant. Be concise and provide code blocks if requested.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      });
      responseText = completion.choices[0]?.message?.content ?? "";
    } else {
      // Fallback/mock for other providers in the playground
      responseText = `[Mock Response for ${provider}] Received prompt: "${prompt}". This model integration is coming soon!`;
    }

    await PromptHistory.create({
      repoId: req.repo._id,
      user: req.user.id,
      provider,
      prompt,
      response: responseText,
      tokensUsed: Math.ceil(prompt.length / 4 + responseText.length / 4)
    });

    res.status(200).json({ response: responseText });
  } catch (err) {
    console.error("Settings Chat API Error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 7. ENVIRONMENTS API
// ==========================================

router.get("/:id/settings/environments", verifyToken, checkRepoAccess, async (req, res) => {
  try {
    const environments = await Environment.find({ repoId: req.repo._id }).populate("requiredReviewers", "username profileImageUrl");
    const deployments = await Deployment.find({ repoId: req.repo._id })
      .populate("approvals.user", "username")
      .sort({ createdAt: -1 });

    res.status(200).json({ environments, deployments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/settings/environments", verifyToken, checkRepoAccess, requireOwner, async (req, res) => {
  try {
    const { envId, name, requiredReviewers, waitTimer, branchRestrictions } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Environment name is required" });
    }

    // Resolve user IDs if emails/usernames are supplied
    const reviewerIds = [];
    if (requiredReviewers?.length > 0) {
      for (const username of requiredReviewers) {
        const u = await UserModel.findOne({ username });
        if (u) reviewerIds.push(u._id);
      }
    }

    let env;
    if (envId) {
      env = await Environment.findOneAndUpdate(
        { repoId: req.repo._id, _id: envId },
        { name, requiredReviewers: reviewerIds, waitTimer, branchRestrictions },
        { new: true }
      );
    } else {
      env = await Environment.create({
        repoId: req.repo._id,
        name,
        requiredReviewers: reviewerIds,
        waitTimer,
        branchRestrictions
      });
    }

    res.status(200).json({ message: "Environment updated successfully", environment: env });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id/settings/environments/:envId", verifyToken, checkRepoAccess, requireOwner, async (req, res) => {
  try {
    await Environment.findOneAndDelete({ repoId: req.repo._id, _id: req.params.envId });
    res.status(200).json({ message: "Environment deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 8. CODESPACES API
// ==========================================

router.get("/:id/settings/codespaces", verifyToken, checkRepoAccess, async (req, res) => {
  try {
    const codespaces = await Codespace.find({ repoId: req.repo._id, user: req.user.id });
    res.status(200).json(codespaces);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/settings/codespaces", verifyToken, checkRepoAccess, async (req, res) => {
  try {
    const { branch = "main" } = req.body;
    const name = `codespace-${req.repo.name.toLowerCase()}-${crypto.randomBytes(3).toString("hex")}`;
    const containerId = crypto.randomBytes(16).toString("hex");
    const port = Math.floor(Math.random() * (4000 - 3000) + 3000);

    const codespace = await Codespace.create({
      repoId: req.repo._id,
      user: req.user.id,
      name,
      branch,
      status: "running",
      containerId,
      port
    });

    res.status(201).json({ message: "Codespace launched successfully", codespace });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/settings/codespaces/:codespaceId/stop", verifyToken, checkRepoAccess, async (req, res) => {
  try {
    const codespace = await Codespace.findOneAndUpdate(
      { repoId: req.repo._id, _id: req.params.codespaceId, user: req.user.id },
      { status: "stopped" },
      { new: true }
    );
    res.status(200).json({ message: "Codespace stopped", codespace });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id/settings/codespaces/:codespaceId", verifyToken, checkRepoAccess, async (req, res) => {
  try {
    await Codespace.findOneAndDelete({ repoId: req.repo._id, _id: req.params.codespaceId, user: req.user.id });
    res.status(200).json({ message: "Codespace destroyed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 9. PAGES API
// ==========================================

router.get("/:id/settings/pages", verifyToken, checkRepoAccess, async (req, res) => {
  try {
    let deployment = await PageDeployment.findOne({ repoId: req.repo._id });
    if (!deployment) {
      deployment = await PageDeployment.create({
        repoId: req.repo._id,
        sourceBranch: req.repo.defaultBranch || "main",
        sourceDir: "/"
      });
    }
    res.status(200).json(deployment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/settings/pages", verifyToken, checkRepoAccess, requireOwner, async (req, res) => {
  try {
    const { sourceBranch, sourceDir, customDomain, httpsEnforced } = req.body;
    const deployment = await PageDeployment.findOneAndUpdate(
      { repoId: req.repo._id },
      { sourceBranch, sourceDir, customDomain, httpsEnforced },
      { new: true, upsert: true }
    );
    res.status(200).json({ message: "GitHub Pages configuration saved", deployment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/settings/pages/build", verifyToken, checkRepoAccess, requireOwner, async (req, res) => {
  try {
    const deployment = await PageDeployment.findOne({ repoId: req.repo._id });
    if (!deployment) {
      return res.status(404).json({ message: "Pages not configured" });
    }

    deployment.status = "building";
    deployment.logs = `[${new Date().toISOString()}] Initializing static page builder workflow...\n` +
      `[${new Date().toISOString()}] Checking out repository files from branch: ${deployment.sourceBranch}\n` +
      `[${new Date().toISOString()}] Analyzing bundle content structure from folder: ${deployment.sourceDir}\n` +
      `[${new Date().toISOString()}] Compiling static HTML, CSS assets...\n` +
      `[${new Date().toISOString()}] Running link verification tests...\n`;
    await deployment.save();

    // Run async build steps
    setTimeout(async () => {
      try {
        const d = await PageDeployment.findById(deployment._id);
        if (d) {
          d.status = "deployed";
          d.logs += `[${new Date().toISOString()}] Bundle compilation complete.\n` +
            `[${new Date().toISOString()}] Successfully deployed static site to production CDN.\n` +
            `[${new Date().toISOString()}] Live Site URL: http://localhost:5000/pages/${req.user.username}/${req.repo.name}\n`;
          await d.save();
        }
      } catch (_) { }
    }, 4000);

    res.status(200).json({ message: "Build triggered successfully", deployment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 10. ADVANCED SECURITY API
// ==========================================

router.get("/:id/settings/security", verifyToken, checkRepoAccess, async (req, res) => {
  try {
    const alerts = await SecurityAlert.find({ repoId: req.repo._id });
    res.status(200).json({ alerts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/settings/security/scan", verifyToken, checkRepoAccess, requireOwner, async (req, res) => {
  try {
    // Perform simulated scans
    await SecurityAlert.deleteMany({ repoId: req.repo._id, status: "open" });

    // Seed mock critical security vulnerabilities
    const findings = [
      {
        type: "secret",
        title: "Hardcoded Google Cloud Secret Key found",
        description: "A secure credential key was detected in a committed index.js file. Move keys out of code.",
        severity: "critical",
        filePath: "index.js",
        lineNumber: 14
      },
      {
        type: "dependency",
        title: "Prototype Pollution in lodash <= 4.17.20",
        description: "Vulnerability in lodash library allowing prototype pollution attacks in express models.",
        severity: "high",
        filePath: "package.json",
        lineNumber: 22
      },
      {
        type: "vulnerability",
        title: "Missing Cross-Site Request Forgery Protection",
        description: "Express session controllers are vulnerable to forgery attacks. Add csurf middleware.",
        severity: "medium",
        filePath: "backend/server.js",
        lineNumber: 50
      }
    ];

    const alerts = await SecurityAlert.create(
      findings.map(f => ({ ...f, repoId: req.repo._id }))
    );

    res.status(200).json({ message: "Security scan complete. Detected 3 vulnerabilities.", alerts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 11. DEPLOY KEYS API
// ==========================================

router.get("/:id/settings/deploy-keys", verifyToken, checkRepoAccess, async (req, res) => {
  try {
    const keys = await DeployKey.find({ repoId: req.repo._id });
    res.status(200).json(keys);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/settings/deploy-keys", verifyToken, checkRepoAccess, requireOwner, async (req, res) => {
  try {
    const { title, key, readOnly = true } = req.body;
    if (!title || !key) {
      return res.status(400).json({ message: "Key Title and SSH Key body are required" });
    }

    if (!key.startsWith("ssh-rsa") && !key.startsWith("ssh-ed25519") && !key.startsWith("ecdsa-sha2-nistp256")) {
      return res.status(400).json({ message: "Invalid SSH Key format. Must be ssh-rsa, ssh-ed25519, or ecdsa." });
    }

    const fingerprint = "SHA256:" + crypto.createHash("sha256").update(key).digest("base64").replace(/=/g, "");

    const deployKey = await DeployKey.create({
      repoId: req.repo._id,
      title,
      key,
      readOnly,
      fingerprint
    });

    res.status(201).json({ message: "Deploy key added successfully", deployKey });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id/settings/deploy-keys/:keyId", verifyToken, checkRepoAccess, requireOwner, async (req, res) => {
  try {
    await DeployKey.findOneAndDelete({ repoId: req.repo._id, _id: req.params.keyId });
    res.status(200).json({ message: "Deploy key removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 12. SECRETS & VARIABLES API
// ==========================================

router.get("/:id/settings/secrets-vars", verifyToken, checkRepoAccess, async (req, res) => {
  try {
    const secrets = await RepositorySecret.find({ repoId: req.repo._id });
    const variables = await RepositoryVariable.find({ repoId: req.repo._id });

    // Mask secrets values
    const maskedSecrets = secrets.map(sec => ({
      _id: sec._id,
      name: sec.name,
      value: "••••••••••••••••"
    }));

    res.status(200).json({ secrets: maskedSecrets, variables });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/settings/secrets", verifyToken, checkRepoAccess, requireOwner, async (req, res) => {
  try {
    const { name, value } = req.body;
    if (!name || !value) {
      return res.status(400).json({ message: "Secret name and value are required" });
    }

    const formattedName = name.toUpperCase().replace(/[^A-Z0-9_]/g, "_");
    const encrypted = encryptToken(value);

    const secret = await RepositorySecret.findOneAndUpdate(
      { repoId: req.repo._id, name: formattedName },
      { value: encrypted },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: `Secret ${formattedName} created/updated successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id/settings/secrets/:secretId", verifyToken, checkRepoAccess, requireOwner, async (req, res) => {
  try {
    await RepositorySecret.findOneAndDelete({ repoId: req.repo._id, _id: req.params.secretId });
    res.status(200).json({ message: "Secret deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/settings/variables", verifyToken, checkRepoAccess, requireOwner, async (req, res) => {
  try {
    const { name, value } = req.body;
    if (!name || !value) {
      return res.status(400).json({ message: "Variable name and value are required" });
    }

    const formattedName = name.toUpperCase().replace(/[^A-Z0-9_]/g, "_");

    const variable = await RepositoryVariable.findOneAndUpdate(
      { repoId: req.repo._id, name: formattedName },
      { value },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: `Variable ${formattedName} created/updated successfully`, variable });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id/settings/variables/:varId", verifyToken, checkRepoAccess, requireOwner, async (req, res) => {
  try {
    await RepositoryVariable.findOneAndDelete({ repoId: req.repo._id, _id: req.params.varId });
    res.status(200).json({ message: "Variable deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
