/**
 * giteaWebhookService.js
 * Registers Gitea webhooks for repositories and organizations.
 * Webhooks push Git events (push, PR, branch create/delete) to the backend
 * for real-time Socket.IO broadcasting and MongoDB activity logging.
 */

import { adminClient, isGiteaConfigured } from "./giteaClient.js";

const getWebhookUrl = () =>
  `${process.env.BACKEND_URL || "http://localhost:5000"}/webhook-api/gitea`;

/**
 * Registers a webhook on a Gitea repository.
 * Called after every new repository is created.
 * @param {string} giteaUsername
 * @param {string} repoName
 */
export const registerRepoWebhook = async (giteaUsername, repoName) => {
  if (!isGiteaConfigured()) return;
  try {
    const webhookUrl = getWebhookUrl();

    // Check for existing webhooks to avoid duplicates
    const existingRes = await adminClient().get(`/repos/${giteaUsername}/${repoName}/hooks`);
    const alreadyExists = (existingRes.data || []).some(h => h.config?.url === webhookUrl);
    if (alreadyExists) {
      console.log(`[Gitea] Webhook already registered for ${giteaUsername}/${repoName}`);
      return;
    }

    await adminClient().post(`/repos/${giteaUsername}/${repoName}/hooks`, {
      type: "gitea",
      config: {
        url: webhookUrl,
        content_type: "json",
        secret: process.env.GITEA_WEBHOOK_SECRET || "",
      },
      events: ["push", "pull_request", "create", "delete", "repository", "release"],
      branch_filter: "*",
      active: true,
    });

    console.log(`[Gitea] Webhook registered for: ${giteaUsername}/${repoName}`);
  } catch (err) {
    console.error(`[Gitea] registerRepoWebhook failed for ${giteaUsername}/${repoName}:`, err.response?.data?.message || err.message);
  }
};

/**
 * Registers a webhook on a Gitea organization.
 * @param {string} orgName
 */
export const registerOrgWebhook = async (orgName) => {
  if (!isGiteaConfigured()) return;
  try {
    const webhookUrl = getWebhookUrl();

    const existingRes = await adminClient().get(`/orgs/${orgName}/hooks`);
    const alreadyExists = (existingRes.data || []).some(h => h.config?.url === webhookUrl);
    if (alreadyExists) return;

    await adminClient().post(`/orgs/${orgName}/hooks`, {
      type: "gitea",
      config: {
        url: webhookUrl,
        content_type: "json",
        secret: process.env.GITEA_WEBHOOK_SECRET || "",
      },
      events: ["push", "pull_request", "create", "delete", "repository"],
      active: true,
    });

    console.log(`[Gitea] Org webhook registered for: ${orgName}`);
  } catch (err) {
    console.error(`[Gitea] registerOrgWebhook failed for ${orgName}:`, err.response?.data?.message || err.message);
  }
};

/**
 * Deletes all webhooks pointing to this backend from a repository.
 * Called when a repository is deleted.
 * @param {string} giteaUsername
 * @param {string} repoName
 */
export const unregisterRepoWebhook = async (giteaUsername, repoName) => {
  if (!isGiteaConfigured()) return;
  try {
    const webhookUrl = getWebhookUrl();
    const existingRes = await adminClient().get(`/repos/${giteaUsername}/${repoName}/hooks`);
    const matching = (existingRes.data || []).filter(h => h.config?.url === webhookUrl);

    for (const hook of matching) {
      await adminClient().delete(`/repos/${giteaUsername}/${repoName}/hooks/${hook.id}`);
    }

    if (matching.length > 0) {
      console.log(`[Gitea] Removed ${matching.length} webhook(s) from ${giteaUsername}/${repoName}`);
    }
  } catch (err) {
    console.error(`[Gitea] unregisterRepoWebhook failed:`, err.response?.data?.message || err.message);
  }
};
