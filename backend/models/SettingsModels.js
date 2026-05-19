import { Schema, model } from "mongoose";

// ==========================================
// 1. MODERATION SCHEMAS
// ==========================================

const repositoryModerationSettingsSchema = new Schema(
  {
    repoId: { type: Schema.Types.ObjectId, ref: "Repository", required: true, unique: true },
    commentLimit: { type: String, enum: ["everyone", "contributors", "collaborators", "members"], default: "everyone" },
    issueLimit: { type: String, enum: ["everyone", "contributors", "collaborators", "members"], default: "everyone" },
    prLimit: { type: String, enum: ["everyone", "contributors", "collaborators", "members"], default: "everyone" },
    limitExpiresAt: { type: Date, default: null }
  },
  { timestamps: true }
);

const blockedRepositoryUserSchema = new Schema(
  {
    repoId: { type: Schema.Types.ObjectId, ref: "Repository", required: true },
    user: { type: Schema.Types.ObjectId, ref: "user", required: true },
    blockedBy: { type: Schema.Types.ObjectId, ref: "user", required: true }
  },
  { timestamps: true }
);

const moderationReportSchema = new Schema(
  {
    repoId: { type: Schema.Types.ObjectId, ref: "Repository", required: true },
    reportedBy: { type: Schema.Types.ObjectId, ref: "user", required: true },
    reportedUser: { type: Schema.Types.ObjectId, ref: "user", required: true },
    reason: { type: String, required: true },
    targetType: { type: String, enum: ["issue", "pr", "comment", "discussion", "wiki"], default: "comment" },
    targetId: { type: String, default: "" },
    status: { type: String, enum: ["open", "resolved", "dismissed"], default: "open" }
  },
  { timestamps: true }
);

const moderationAuditLogSchema = new Schema(
  {
    repoId: { type: Schema.Types.ObjectId, ref: "Repository", required: true },
    actor: { type: Schema.Types.ObjectId, ref: "user", required: true },
    action: { type: String, required: true }, // e.g. "block_user", "set_limit"
    details: { type: String, default: "" }
  },
  { timestamps: true }
);

// ==========================================
// 2. BRANCH PROTECTION RULES SCHEMAS
// ==========================================

const branchProtectionRuleSchema = new Schema(
  {
    repoId: { type: Schema.Types.ObjectId, ref: "Repository", required: true },
    branchName: { type: String, required: true },
    requirePR: { type: Boolean, default: false },
    requiredApprovals: { type: Number, default: 0 },
    preventForcePush: { type: Boolean, default: true },
    preventDeletion: { type: Boolean, default: true },
    requireStatusChecks: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// ==========================================
// 3. TAGS & RELEASES SCHEMAS
// ==========================================

const releaseSchema = new Schema(
  {
    repoId: { type: Schema.Types.ObjectId, ref: "Repository", required: true },
    tagName: { type: String, required: true },
    targetBranch: { type: String, default: "main" },
    name: { type: String, required: true },
    body: { type: String, default: "" }, // Release notes
    isPrerelease: { type: Boolean, default: false },
    isDraft: { type: Boolean, default: false },
    assets: [
      {
        name: { type: String, required: true },
        size: { type: Number, required: true },
        url: { type: String, required: true }
      }
    ]
  },
  { timestamps: true }
);

// ==========================================
// 4. RULESETS SCHEMAS
// ==========================================

const rulesetSchema = new Schema(
  {
    repoId: { type: Schema.Types.ObjectId, ref: "Repository", required: true },
    name: { type: String, required: true },
    enforcement: { type: String, enum: ["active", "evaluate", "disabled"], default: "active" },
    branchPattern: { type: String, default: "feature/*" },
    commitPrefixes: [{ type: String }], // e.g. ["feat:", "fix:", "docs:"]
    protectedPaths: [{ type: String }], // e.g. [".github/workflows/*", "secrets.json"]
    requiredReviewers: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// ==========================================
// 5. ACTIONS & ENVIRONMENT SCHEMAS
// ==========================================

const environmentSchema = new Schema(
  {
    repoId: { type: Schema.Types.ObjectId, ref: "Repository", required: true },
    name: { type: String, required: true }, // e.g. "development", "staging", "production"
    requiredReviewers: [{ type: Schema.Types.ObjectId, ref: "user" }],
    waitTimer: { type: Number, default: 0 }, // in minutes
    branchRestrictions: [{ type: String }] // e.g. ["main"]
  },
  { timestamps: true }
);

const deploymentSchema = new Schema(
  {
    repoId: { type: Schema.Types.ObjectId, ref: "Repository", required: true },
    environmentName: { type: String, required: true },
    ref: { type: String, required: true }, // branch/tag/commit SHA
    status: { type: String, enum: ["queued", "waiting", "in_progress", "success", "failed", "rejected"], default: "queued" },
    approvals: [
      {
        user: { type: Schema.Types.ObjectId, ref: "user", required: true },
        status: { type: String, enum: ["approved", "rejected"], required: true },
        comment: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

// ==========================================
// 6. MODELS SCHEMAS (AI PLAYGROUND)
// ==========================================

const modelConnectionSchema = new Schema(
  {
    repoId: { type: Schema.Types.ObjectId, ref: "Repository", required: true },
    provider: { type: String, enum: ["openai", "anthropic", "gemini", "groq", "ollama", "openrouter"], default: "gemini" },
    apiKey: { type: String, required: true }, // Encrypted or mock-encrypted
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const promptHistorySchema = new Schema(
  {
    repoId: { type: Schema.Types.ObjectId, ref: "Repository", required: true },
    user: { type: Schema.Types.ObjectId, ref: "user", required: true },
    provider: { type: String, required: true },
    prompt: { type: String, required: true },
    response: { type: String, required: true },
    tokensUsed: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// ==========================================
// 7. WEBHOOK SCHEMAS
// ==========================================

const webhookSchema = new Schema(
  {
    repoId: { type: Schema.Types.ObjectId, ref: "Repository", required: true },
    url: { type: String, required: true },
    secret: { type: String, default: "" },
    events: [{ type: String }], // "push", "pull_request", "issue_opened", "release_published", "workflow_completed"
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const webhookDeliverySchema = new Schema(
  {
    webhookId: { type: Schema.Types.ObjectId, ref: "Webhook", required: true },
    repoId: { type: Schema.Types.ObjectId, ref: "Repository", required: true },
    event: { type: String, required: true },
    deliveryId: { type: String, required: true },
    statusCode: { type: Number, required: true },
    status: { type: String, enum: ["success", "failed"], required: true },
    duration: { type: Number, default: 0 }, // in ms
    requestBody: { type: String, default: "" },
    responseBody: { type: String, default: "" }
  },
  { timestamps: true }
);

// ==========================================
// 8. CODESPACE SCHEMAS
// ==========================================

const codespaceSchema = new Schema(
  {
    repoId: { type: Schema.Types.ObjectId, ref: "Repository", required: true },
    user: { type: Schema.Types.ObjectId, ref: "user", required: true },
    name: { type: String, required: true },
    branch: { type: String, default: "main" },
    status: { type: String, enum: ["starting", "running", "stopped", "suspending"], default: "running" },
    containerId: { type: String, required: true },
    port: { type: Number, default: 3000 }
  },
  { timestamps: true }
);

// ==========================================
// 9. PAGES SCHEMAS
// ==========================================

const pageDeploymentSchema = new Schema(
  {
    repoId: { type: Schema.Types.ObjectId, ref: "Repository", required: true, unique: true },
    sourceBranch: { type: String, default: "main" },
    sourceDir: { type: String, default: "/" }, // "/" or "/docs"
    customDomain: { type: String, default: "" },
    httpsEnforced: { type: Boolean, default: true },
    status: { type: String, enum: ["queued", "building", "deployed", "failed"], default: "queued" },
    logs: { type: String, default: "" }
  },
  { timestamps: true }
);

// ==========================================
// 10. ADVANCED SECURITY SCHEMAS
// ==========================================

const securityAlertSchema = new Schema(
  {
    repoId: { type: Schema.Types.ObjectId, ref: "Repository", required: true },
    type: { type: String, enum: ["secret", "dependency", "vulnerability"], required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    severity: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
    status: { type: String, enum: ["open", "dismissed", "fixed"], default: "open" },
    filePath: { type: String, default: "" },
    lineNumber: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// ==========================================
// 11. DEPLOY KEYS SCHEMAS
// ==========================================

const deployKeySchema = new Schema(
  {
    repoId: { type: Schema.Types.ObjectId, ref: "Repository", required: true },
    title: { type: String, required: true },
    key: { type: String, required: true },
    readOnly: { type: Boolean, default: true },
    fingerprint: { type: String, required: true }
  },
  { timestamps: true }
);

// ==========================================
// 12. SECRETS & VARIABLES SCHEMAS
// ==========================================

const repositorySecretSchema = new Schema(
  {
    repoId: { type: Schema.Types.ObjectId, ref: "Repository", required: true },
    name: { type: String, required: true },
    value: { type: String, required: true } // Encrypted
  },
  { timestamps: true }
);

const repositoryVariableSchema = new Schema(
  {
    repoId: { type: Schema.Types.ObjectId, ref: "Repository", required: true },
    name: { type: String, required: true },
    value: { type: String, required: true }
  },
  { timestamps: true }
);

// ==========================================
// EXPORTS
// ==========================================

export const RepositoryModerationSettings = model("RepositoryModerationSettings", repositoryModerationSettingsSchema);
export const BlockedRepositoryUser = model("BlockedRepositoryUser", blockedRepositoryUserSchema);
export const ModerationReport = model("ModerationReport", moderationReportSchema);
export const ModerationAuditLog = model("ModerationAuditLog", moderationAuditLogSchema);
export const BranchProtectionRule = model("BranchProtectionRule", branchProtectionRuleSchema);
export const Release = model("Release", releaseSchema);
export const Ruleset = model("Ruleset", rulesetSchema);
export const Environment = model("Environment", environmentSchema);
export const Deployment = model("Deployment", deploymentSchema);
export const ModelConnection = model("ModelConnection", modelConnectionSchema);
export const PromptHistory = model("PromptHistory", promptHistorySchema);
export const Webhook = model("Webhook", webhookSchema);
export const WebhookDelivery = model("WebhookDelivery", webhookDeliverySchema);
export const Codespace = model("Codespace", codespaceSchema);
export const PageDeployment = model("PageDeployment", pageDeploymentSchema);
export const SecurityAlert = model("SecurityAlert", securityAlertSchema);
export const DeployKey = model("DeployKey", deployKeySchema);
export const RepositorySecret = model("RepositorySecret", repositorySecretSchema);
export const RepositoryVariable = model("RepositoryVariable", repositoryVariableSchema);
