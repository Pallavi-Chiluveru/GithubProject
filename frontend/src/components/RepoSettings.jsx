import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import API from "../api";
import { 
  Settings,
  Users,
  ShieldAlert,
  GitBranch,
  Tag,
  ShieldCheck,
  Play,
  Webhook as WebhookIcon,
  Cpu as CopilotIcon,
  Layers,
  Code2,
  FileCode,
  Shield,
  Key,
  Lock,
  ChevronDown,
  Check,
  X as CloseIcon,
  Edit2,
  AlertCircle,
  Plus,
  Trash2,
  Send,
  Terminal,
  ExternalLink,
  RefreshCw,
  Eye,
  Sparkles,
  Info,
  ShieldX
} from "lucide-react";
import CollaboratorManager from "./CollaboratorManager";
import TopNavbar from "./TopNavbar";
import Sidebar from "./Sidebar";

export default function RepoSettings() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [repo, setRepo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("General");

  // General States
  const [repoName, setRepoName] = useState("");
  const [isEditingBranch, setIsEditingBranch] = useState(false);
  const [branchName, setBranchName] = useState("");

  // 1. Moderation States
  const [modSettings, setModSettings] = useState({ commentLimit: "everyone", issueLimit: "everyone", prLimit: "everyone" });
  const [durationDays, setDurationDays] = useState(0);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [blockedInput, setBlockedInput] = useState("");
  const [modReports, setModReports] = useState([]);
  const [modAuditLogs, setModAuditLogs] = useState([]);

  // 2. Branches Protection States
  const [branches, setBranches] = useState(["main"]);
  const [branchRules, setBranchRules] = useState([]);
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [newRule, setNewRule] = useState({
    branchName: "",
    requirePR: false,
    requiredApprovals: 0,
    preventForcePush: true,
    preventDeletion: true,
    requireStatusChecks: false
  });

  // 3. Tags & Releases States
  const [releases, setReleases] = useState([]);
  const [isAddingRelease, setIsAddingRelease] = useState(false);
  const [newRelease, setNewRelease] = useState({
    tagName: "",
    targetBranch: "main",
    name: "",
    body: "",
    isPrerelease: false,
    isDraft: false
  });

  // 4. Rulesets States
  const [rulesets, setRulesets] = useState([]);
  const [isAddingRuleset, setIsAddingRuleset] = useState(false);
  const [selectedRuleset, setSelectedRuleset] = useState(null);
  const [newRuleset, setNewRuleset] = useState({
    name: "",
    enforcement: "active",
    branchPattern: "feature/*",
    commitPrefixesStr: "feat:, fix:",
    protectedPathsStr: "",
    requiredReviewers: 0
  });

  // 5. Webhooks States
  const [webhooks, setWebhooks] = useState([]);
  const [webhookDeliveries, setWebhookDeliveries] = useState([]);
  const [isAddingWebhook, setIsAddingWebhook] = useState(false);
  const [newWebhook, setNewWebhook] = useState({
    url: "",
    secret: "",
    events: ["push"],
    isActive: true
  });
  const [selectedWebhook, setSelectedWebhook] = useState(null);

  // 6. AI Models States
  const [modelConnections, setModelConnections] = useState([]);
  const [promptHistory, setPromptHistory] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState("groq");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [playgroundPrompt, setPlaygroundPrompt] = useState("");
  const [playgroundResponse, setPlaygroundResponse] = useState("");
  const [playgroundLoading, setPlaygroundLoading] = useState(false);

  // 7. Copilot States
  const [copilotSettings, setCopilotSettings] = useState({
    suggestions: true,
    publicCodeMatching: false,
    inlineCompletions: true
  });

  // 8. Environments States
  const [environments, setEnvironments] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [isAddingEnv, setIsAddingEnv] = useState(false);
  const [newEnv, setNewEnv] = useState({
    name: "",
    requiredReviewersStr: "",
    waitTimer: 0,
    branchRestrictionsStr: ""
  });

  // 9. Codespaces States
  const [codespaces, setCodespaces] = useState([]);
  const [launchingCodespace, setLaunchingCodespace] = useState(false);
  const [activeTerminalCodespace, setActiveTerminalCodespace] = useState(null);
  const [terminalOutput, setTerminalOutput] = useState([]);

  // 10. Pages States
  const [pagesConfig, setPagesConfig] = useState({ sourceBranch: "main", sourceDir: "/", customDomain: "", httpsEnforced: true, status: "queued", logs: "" });
  const [pagesBuilding, setPagesBuilding] = useState(false);
  const [pageLogs, setPageLogs] = useState("");
  const logsBottomRef = useRef(null);

  // 11. Security States
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [scanning, setScanning] = useState(false);

  // 12. Deploy Keys States
  const [deployKeys, setDeployKeys] = useState([]);
  const [isAddingKey, setIsAddingKey] = useState(false);
  const [newKey, setNewKey] = useState({ title: "", key: "", readOnly: true });

  // 13. Secrets & Variables States
  const [secrets, setSecrets] = useState([]);
  const [variables, setVariables] = useState([]);
  const [secretsSubTab, setSecretsSubTab] = useState("secrets");
  const [isAddingSecret, setIsAddingSecret] = useState(false);
  const [secretForm, setSecretForm] = useState({ name: "", value: "" });
  const [isAddingVar, setIsAddingVar] = useState(false);
  const [varForm, setVarForm] = useState({ name: "", value: "" });

  useEffect(() => {
    const fetchRepo = async () => {
      try {
        const res = await API.get(`/repo-api/${id}`);
        if (res.data.role !== "OWNER") {
          navigate(`/repo/${id}`);
          return;
        }
        setRepo(res.data);
        setRepoName(res.data.name);
        setBranchName(res.data.defaultBranch || "main");
        
        document.title = `${res.data.owner?.username}/${res.data.name} | Settings`;
      } catch (err) {
        console.error("Failed to fetch repo details:", err);
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchRepo();
    return () => { document.title = "CodeForge"; };
  }, [id, navigate]);

  // Dynamic Tab Fetching
  useEffect(() => {
    if (!repo) return;
    if (activeCategory === "Moderation") fetchModerationData();
    if (activeCategory === "Branches") fetchBranchesData();
    if (activeCategory === "Tags") fetchReleasesData();
    if (activeCategory === "Rules") fetchRulesetsData();
    if (activeCategory === "Webhooks") fetchWebhooksData();
    if (activeCategory === "Models") fetchModelsData();
    if (activeCategory === "Environments") fetchEnvironmentsData();
    if (activeCategory === "Codespaces") fetchCodespacesData();
    if (activeCategory === "Pages") fetchPagesData();
    if (activeCategory === "Security") fetchSecurityData();
    if (activeCategory === "DeployKeys") fetchDeployKeysData();
    if (activeCategory === "Secrets") fetchSecretsData();
  }, [activeCategory, repo]);

  // ==========================================
  // GENERAL TAB FUNCTIONS
  // ==========================================
  const handleRename = async () => {
    if (!repoName || repoName === repo?.name) return;
    setSaving(true);
    try {
      const res = await API.put(`/repo-api/${id}`, { name: repoName });
      setRepo(res.data.repo);
      document.title = `${repo.owner?.username}/${repoName} | Settings`;
      alert("Repository renamed successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to rename repository");
      setRepoName(repo?.name);
    } finally {
      setSaving(false);
    }
  };

  const handleBranchRename = async () => {
    if (!branchName || branchName === repo?.defaultBranch) {
      setIsEditingBranch(false);
      return;
    }
    setSaving(true);
    try {
      const res = await API.put(`/repo-api/${id}`, { defaultBranch: branchName });
      setRepo(res.data.repo);
      setIsEditingBranch(false);
      alert("Default branch updated successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update branch");
      setBranchName(repo?.defaultBranch);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRepo = async () => {
    if (!window.confirm("Are you absolutely sure? This will permanently delete the repository and all its files.")) return;
    const confirmName = window.prompt(`Type the repository name "${repo?.name}" to confirm:`);
    if (confirmName !== repo?.name) {
      alert("Repository name mismatch. Deletion cancelled.");
      return;
    }

    setSaving(true);
    try {
      await API.delete(`/repo-api/${id}`);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete repository");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // 1. MODERATION ACTIONS
  // ==========================================
  const fetchModerationData = async () => {
    try {
      const res = await API.get(`/repo-api/${id}/settings/moderation`);
      setModSettings(res.data.settings);
      setBlockedUsers(res.data.blockedUsers);
      setModReports(res.data.reports);
      setModAuditLogs(res.data.auditLogs);
    } catch (_) {}
  };

  const handleUpdateModLimits = async () => {
    setSaving(true);
    try {
      const res = await API.put(`/repo-api/${id}/settings/moderation`, {
        ...modSettings,
        durationDays
      });
      setModSettings(res.data.settings);
      alert("Moderation limits updated successfully!");
      fetchModerationData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update moderation");
    } finally {
      setSaving(false);
    }
  };

  const handleBlockUser = async () => {
    if (!blockedInput) return;
    try {
      await API.post(`/repo-api/${id}/settings/moderation/block`, { username: blockedInput });
      setBlockedInput("");
      alert(`User ${blockedInput} has been blocked.`);
      fetchModerationData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to block user");
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      await API.delete(`/repo-api/${id}/settings/moderation/block/${userId}`);
      alert("User unblocked.");
      fetchModerationData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to unblock user");
    }
  };

  // ==========================================
  // 2. BRANCH PROTECTION ACTIONS
  // ==========================================
  const fetchBranchesData = async () => {
    try {
      const res = await API.get(`/repo-api/${id}/settings/branches`);
      setBranches(res.data.branches);
      setBranchRules(res.data.rules);
    } catch (_) {}
  };

  const handleAddBranchRule = async () => {
    if (!newRule.branchName) return;
    try {
      await API.post(`/repo-api/${id}/settings/branches/rules`, newRule);
      setNewRule({
        branchName: "",
        requirePR: false,
        requiredApprovals: 0,
        preventForcePush: true,
        preventDeletion: true,
        requireStatusChecks: false
      });
      setIsAddingRule(false);
      alert("Branch protection rule added successfully!");
      fetchBranchesData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add branch protection");
    }
  };

  const handleDeleteBranchRule = async (ruleId) => {
    if (!window.confirm("Are you sure you want to delete this protection rule?")) return;
    try {
      await API.delete(`/repo-api/${id}/settings/branches/rules/${ruleId}`);
      alert("Protection rule deleted.");
      fetchBranchesData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete protection rule");
    }
  };

  // ==========================================
  // 3. TAGS & RELEASES ACTIONS
  // ==========================================
  const fetchReleasesData = async () => {
    try {
      const res = await API.get(`/repo-api/${id}/settings/releases`);
      setReleases(res.data);
    } catch (_) {}
  };

  const handleCreateRelease = async () => {
    if (!newRelease.tagName || !newRelease.name) return;
    try {
      await API.post(`/repo-api/${id}/settings/releases`, newRelease);
      setNewRelease({
        tagName: "",
        targetBranch: "main",
        name: "",
        body: "",
        isPrerelease: false,
        isDraft: false
      });
      setIsAddingRelease(false);
      alert("Release published successfully!");
      fetchReleasesData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create release");
    }
  };

  const handleDeleteRelease = async (releaseId) => {
    if (!window.confirm("Are you sure you want to delete this release?")) return;
    try {
      await API.delete(`/repo-api/${id}/settings/releases/${releaseId}`);
      alert("Release deleted.");
      fetchReleasesData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete release");
    }
  };

  // ==========================================
  // 4. RULESETS ACTIONS
  // ==========================================
  const fetchRulesetsData = async () => {
    try {
      const res = await API.get(`/repo-api/${id}/settings/rulesets`);
      setRulesets(res.data);
    } catch (_) {}
  };

  const handleSaveRuleset = async () => {
    if (!newRuleset.name) return;
    try {
      const payload = {
        rulesetId: selectedRuleset?._id,
        name: newRuleset.name,
        enforcement: newRuleset.enforcement,
        branchPattern: newRuleset.branchPattern,
        commitPrefixes: newRuleset.commitPrefixesStr.split(",").map(s => s.trim()).filter(Boolean),
        protectedPaths: newRuleset.protectedPathsStr.split(",").map(s => s.trim()).filter(Boolean),
        requiredReviewers: newRuleset.requiredReviewers
      };
      await API.post(`/repo-api/${id}/settings/rulesets`, payload);
      setNewRuleset({
        name: "",
        enforcement: "active",
        branchPattern: "feature/*",
        commitPrefixesStr: "feat:, fix:",
        protectedPathsStr: "",
        requiredReviewers: 0
      });
      setIsAddingRuleset(false);
      setSelectedRuleset(null);
      alert("Ruleset saved successfully!");
      fetchRulesetsData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save ruleset");
    }
  };

  const handleDeleteRuleset = async (rulesetId) => {
    if (!window.confirm("Are you sure you want to delete this ruleset?")) return;
    try {
      await API.delete(`/repo-api/${id}/settings/rulesets/${rulesetId}`);
      alert("Ruleset deleted.");
      fetchRulesetsData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete ruleset");
    }
  };

  // ==========================================
  // 5. WEBHOOK ACTIONS
  // ==========================================
  const fetchWebhooksData = async () => {
    try {
      const res = await API.get(`/repo-api/${id}/settings/webhooks`);
      setWebhooks(res.data.webhooks);
      setWebhookDeliveries(res.data.deliveries);
    } catch (_) {}
  };

  const handleSaveWebhook = async () => {
    if (!newWebhook.url) return;
    try {
      const payload = {
        webhookId: selectedWebhook?._id,
        ...newWebhook
      };
      await API.post(`/repo-api/${id}/settings/webhooks`, payload);
      setNewWebhook({
        url: "",
        secret: "",
        events: ["push"],
        isActive: true
      });
      setIsAddingWebhook(false);
      setSelectedWebhook(null);
      alert("Webhook saved successfully!");
      fetchWebhooksData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save webhook");
    }
  };

  const handleTestWebhook = async (webhookId) => {
    try {
      const res = await API.post(`/repo-api/${id}/settings/webhooks/${webhookId}/test`);
      alert(`Webhook test triggered! Status code: ${res.data.delivery.statusCode}`);
      fetchWebhooksData();
    } catch (err) {
      alert(err.response?.data?.message || "Webhook delivery failed");
    }
  };

  const handleDeleteWebhook = async (webhookId) => {
    if (!window.confirm("Are you sure you want to delete this webhook?")) return;
    try {
      await API.delete(`/repo-api/${id}/settings/webhooks/${webhookId}`);
      alert("Webhook deleted.");
      fetchWebhooksData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete webhook");
    }
  };

  // ==========================================
  // 6. AI MODELS ACTIONS
  // ==========================================
  const fetchModelsData = async () => {
    try {
      const res = await API.get(`/repo-api/${id}/settings/models`);
      setModelConnections(res.data.connections);
      setPromptHistory(res.data.history);
    } catch (_) {}
  };

  const handleSaveModelConfig = async () => {
    if (!apiKeyInput) return;
    setSaving(true);
    try {
      await API.post(`/repo-api/${id}/settings/models/config`, {
        provider: selectedProvider,
        apiKey: apiKeyInput,
        isActive: true
      });
      setApiKeyInput("");
      alert(`${selectedProvider} key configured successfully.`);
      fetchModelsData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to configure model");
    } finally {
      setSaving(false);
    }
  };

  const handleSendPrompt = async () => {
    if (!playgroundPrompt) return;
    setPlaygroundLoading(true);
    try {
      const res = await API.post(`/repo-api/${id}/settings/models/chat`, {
        prompt: playgroundPrompt,
        provider: selectedProvider
      });
      setPlaygroundResponse(res.data.response);
      setPlaygroundPrompt("");
      fetchModelsData();
    } catch (err) {
      alert(err.response?.data?.message || "Model request failed");
    } finally {
      setPlaygroundLoading(false);
    }
  };

  // ==========================================
  // 7. ENVIRONMENTS ACTIONS
  // ==========================================
  const fetchEnvironmentsData = async () => {
    try {
      const res = await API.get(`/repo-api/${id}/settings/environments`);
      setEnvironments(res.data.environments);
      setDeployments(res.data.deployments);
    } catch (_) {}
  };

  const handleSaveEnvironment = async () => {
    if (!newEnv.name) return;
    try {
      const payload = {
        name: newEnv.name,
        waitTimer: newEnv.waitTimer,
        requiredReviewers: newEnv.requiredReviewersStr.split(",").map(s => s.trim()).filter(Boolean),
        branchRestrictions: newEnv.branchRestrictionsStr.split(",").map(s => s.trim()).filter(Boolean)
      };
      await API.post(`/repo-api/${id}/settings/environments`, payload);
      setNewEnv({
        name: "",
        requiredReviewersStr: "",
        waitTimer: 0,
        branchRestrictionsStr: ""
      });
      setIsAddingEnv(false);
      alert("Environment configured successfully!");
      fetchEnvironmentsData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to configure environment");
    }
  };

  const handleDeleteEnv = async (envId) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await API.delete(`/repo-api/${id}/settings/environments/${envId}`);
      alert("Environment deleted.");
      fetchEnvironmentsData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete environment");
    }
  };

  // ==========================================
  // 8. CODESPACES ACTIONS
  // ==========================================
  const fetchCodespacesData = async () => {
    try {
      const res = await API.get(`/repo-api/${id}/settings/codespaces`);
      setCodespaces(res.data);
    } catch (_) {}
  };

  const handleCreateCodespace = async () => {
    setLaunchingCodespace(true);
    try {
      const res = await API.post(`/repo-api/${id}/settings/codespaces`, { branch: repo.defaultBranch || "main" });
      alert("Codespace launched!");
      fetchCodespacesData();
      
      // Open Interactive terminal mock
      setActiveTerminalCodespace(res.data.codespace);
      setTerminalOutput([
        "Initializing Linux Dev Container in workspace...",
        "Provisioning virtual CPU core & memory buffers...",
        "Cloning repo into /workspace...",
        "Initializing dev packages: Node 18, Python 3.10...",
        "Server listening on port 3000.",
        "Codespace container is completely ready."
      ]);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to launch Codespace");
    } finally {
      setLaunchingCodespace(false);
    }
  };

  const handleStopCodespace = async (codespaceId) => {
    try {
      await API.post(`/repo-api/${id}/settings/codespaces/${codespaceId}/stop`);
      alert("Codespace suspended.");
      fetchCodespacesData();
    } catch (_) {}
  };

  const handleDeleteCodespace = async (codespaceId) => {
    try {
      await API.delete(`/repo-api/${id}/settings/codespaces/${codespaceId}`);
      alert("Codespace destroyed.");
      if (activeTerminalCodespace?._id === codespaceId) {
        setActiveTerminalCodespace(null);
      }
      fetchCodespacesData();
    } catch (_) {}
  };

  // ==========================================
  // 9. PAGES ACTIONS
  // ==========================================
  const fetchPagesData = async () => {
    try {
      const res = await API.get(`/repo-api/${id}/settings/pages`);
      setPagesConfig(res.data);
      setPageLogs(res.data.logs || "");
    } catch (_) {}
  };

  const handleSavePages = async () => {
    try {
      const res = await API.post(`/repo-api/${id}/settings/pages`, pagesConfig);
      setPagesConfig(res.data.deployment);
      alert("Pages settings updated!");
    } catch (_) {}
  };

  const handleTriggerPagesBuild = async () => {
    setPagesBuilding(true);
    try {
      const res = await API.post(`/repo-api/${id}/settings/pages/build`);
      setPagesConfig(res.data.deployment);
      setPageLogs(res.data.deployment.logs);
      
      // Stream updates or mock log lines
      let lines = [
        "Deploying artifacts...",
        "Building layout tree and indexes...",
        "Generating static website...",
        "Publishing build site online..."
      ];
      
      let index = 0;
      const interval = setInterval(async () => {
        if (index < lines.length) {
          setPageLogs(prev => prev + `[${new Date().toISOString()}] ${lines[index]}\n`);
          index++;
        } else {
          clearInterval(interval);
          setPagesBuilding(false);
          fetchPagesData();
        }
      }, 1000);
      
    } catch (_) {
      setPagesBuilding(false);
    }
  };

  // Scroll to bottom of build logs
  useEffect(() => {
    if (logsBottomRef.current) {
      logsBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [pageLogs]);

  // ==========================================
  // 10. ADVANCED SECURITY ACTIONS
  // ==========================================
  const fetchSecurityData = async () => {
    try {
      const res = await API.get(`/repo-api/${id}/settings/security`);
      setSecurityAlerts(res.data.alerts);
    } catch (_) {}
  };

  const handleTriggerSecurityScan = async () => {
    setScanning(true);
    try {
      const res = await API.post(`/repo-api/${id}/settings/security/scan`);
      setSecurityAlerts(res.data.alerts);
      alert(res.data.message);
    } catch (err) {
      alert("Security scanning failed");
    } finally {
      setScanning(false);
    }
  };

  // ==========================================
  // 11. DEPLOY KEYS ACTIONS
  // ==========================================
  const fetchDeployKeysData = async () => {
    try {
      const res = await API.get(`/repo-api/${id}/settings/deploy-keys`);
      setDeployKeys(res.data);
    } catch (_) {}
  };

  const handleAddDeployKey = async () => {
    if (!newKey.title || !newKey.key) return;
    try {
      await API.post(`/repo-api/${id}/settings/deploy-keys`, newKey);
      setNewKey({ title: "", key: "", readOnly: true });
      setIsAddingKey(false);
      alert("Deploy SSH key added successfully!");
      fetchDeployKeysData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add deploy key");
    }
  };

  const handleDeleteDeployKey = async (keyId) => {
    if (!window.confirm("Delete this deploy key?")) return;
    try {
      await API.delete(`/repo-api/${id}/settings/deploy-keys/${keyId}`);
      alert("Deploy key deleted.");
      fetchDeployKeysData();
    } catch (_) {}
  };

  // ==========================================
  // 12. SECRETS & VARIABLES ACTIONS
  // ==========================================
  const fetchSecretsData = async () => {
    try {
      const res = await API.get(`/repo-api/${id}/settings/secrets-vars`);
      setSecrets(res.data.secrets);
      setVariables(res.data.variables);
    } catch (_) {}
  };

  const handleAddSecret = async () => {
    if (!secretForm.name || !secretForm.value) return;
    try {
      await API.post(`/repo-api/${id}/settings/secrets`, secretForm);
      setSecretForm({ name: "", value: "" });
      setIsAddingSecret(false);
      alert("Secret added successfully!");
      fetchSecretsData();
    } catch (err) {
      alert("Failed to add secret");
    }
  };

  const handleDeleteSecret = async (secretId) => {
    if (!window.confirm("Remove this secret?")) return;
    try {
      await API.delete(`/repo-api/${id}/settings/secrets/${secretId}`);
      alert("Secret deleted.");
      fetchSecretsData();
    } catch (_) {}
  };

  const handleAddVar = async () => {
    if (!varForm.name || !varForm.value) return;
    try {
      await API.post(`/repo-api/${id}/settings/variables`, varForm);
      setVarForm({ name: "", value: "" });
      setIsAddingVar(false);
      alert("Variable added successfully!");
      fetchSecretsData();
    } catch (err) {
      alert("Failed to add variable");
    }
  };

  const handleDeleteVar = async (varId) => {
    if (!window.confirm("Remove this variable?")) return;
    try {
      await API.delete(`/repo-api/${id}/settings/variables/${varId}`);
      alert("Variable deleted.");
      fetchSecretsData();
    } catch (_) {}
  };

  if (loading || !repo) return (
    <div className="flex h-screen items-center justify-center bg-[#0d1117]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2f81f7] border-t-transparent"></div>
    </div>
  );

  const sidebarCategories = [
    {
      group: null,
      items: [ { id: "General", label: "General", icon: Settings } ]
    },
    {
      group: "Access",
      items: [
        { id: "Collaborators", label: "Collaborators", icon: Users }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] pb-20 font-sans">
      <TopNavbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} title="Repository Settings" />
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="mx-auto max-w-[1280px] px-4 pt-24 md:px-8">
        <div className="flex items-center gap-2 text-xl mb-8">
           <Link to="/dashboard" className="text-[#2f81f7] hover:underline font-medium">{repo.owner?.username}</Link>
           <span className="text-[#8b949e]">/</span>
           <Link to={`/repo/${id}`} className="text-[#2f81f7] hover:underline font-bold">{repo.name}</Link>
           <span className="px-2 py-0.5 rounded-full border border-[#30363d] text-xs font-medium text-[#8b949e]">Settings</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-72 flex-shrink-0">
            <nav className="space-y-6">
              {sidebarCategories.map((group, idx) => (
                <div key={idx} className="space-y-1">
                  {group.group && <h3 className="px-3 py-2 text-[12px] font-bold text-[#8b949e] uppercase tracking-wider">{group.group}</h3>}
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveCategory(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all group ${activeCategory === item.id ? "bg-[#1f242c] text-[#f0f6fc] font-semibold border-l-2 border-[#2f81f7]" : "text-[#c9d1d9] hover:bg-[#161b22]"}`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={16} className={activeCategory === item.id ? "text-[#2f81f7]" : "text-[#8b949e] group-hover:text-[#c9d1d9]"} />
                        <span>{item.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </nav>
          </aside>

          <main className="flex-1 max-w-4xl space-y-12">
            {/* ==========================================
                GENERAL TABS
                ========================================== */}
            {activeCategory === "General" && (
              <div className="space-y-10 animate-in fade-in duration-300">
                <div className="border-b border-[#30363d] pb-4">
                  <h1 className="text-2xl font-semibold text-[#f0f6fc]">General Settings</h1>
                </div>

                {/* Repository Name */}
                <section className="space-y-4 bg-[#161b22] border border-[#30363d] rounded-xl p-6">
                  <h3 className="text-sm font-bold text-[#f0f6fc]">Repository Name</h3>
                  <p className="text-xs text-[#8b949e]">Renaming a repository might break existing clone and push links.</p>
                  <div className="flex gap-3 max-w-md">
                    <input 
                      type="text"
                      value={repoName}
                      onChange={(e) => setRepoName(e.target.value)}
                      disabled={saving}
                      className="flex-1 bg-[#010409] border border-[#30363d] rounded-md px-3 py-1.5 text-sm focus:border-[#2f81f7] outline-none text-[#c9d1d9]"
                    />
                    <button 
                      onClick={handleRename}
                      disabled={saving || !repoName || repoName === repo?.name}
                      className="px-4 py-1.5 bg-[#21262d] border border-[#30363d] rounded-md text-sm font-bold text-[#c9d1d9] hover:bg-[#30363d] disabled:opacity-50 transition-colors"
                    >
                      {saving ? "Renaming..." : "Rename"}
                    </button>
                  </div>
                </section>

                {/* Default Branch */}
                <section className="space-y-4 bg-[#161b22] border border-[#30363d] rounded-xl p-6">
                  <h3 className="text-sm font-bold text-[#f0f6fc]">Default branch</h3>
                  <p className="text-xs text-[#8b949e]">
                    The default branch is the main branch in your repository for pull requests and code integrations.
                  </p>
                  <div className="flex gap-3 max-w-md">
                    <div className="flex-1 flex items-center gap-2 bg-[#010409] border border-[#30363d] rounded-md px-3 py-1.5 overflow-hidden">
                       <GitBranch size={14} className="text-[#8b949e] flex-shrink-0" />
                       {isEditingBranch ? (
                         <input 
                           type="text"
                           value={branchName}
                           onChange={(e) => setBranchName(e.target.value)}
                           className="w-full bg-transparent border-none outline-none text-sm font-mono text-[#c9d1d9]"
                           autoFocus
                         />
                       ) : (
                         <span className="text-sm font-mono truncate">{repo.defaultBranch || "main"}</span>
                       )}
                    </div>
                    {isEditingBranch ? (
                      <div className="flex gap-1">
                        <button 
                          onClick={handleBranchRename}
                          disabled={saving}
                          className="p-2 bg-[#238636] border border-[#30363d] rounded-md text-white hover:bg-[#2ea043] transition-colors"
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          onClick={() => {setIsEditingBranch(false); setBranchName(repo.defaultBranch);}}
                          className="p-2 bg-[#21262d] border border-[#30363d] rounded-md text-[#8b949e] hover:text-white"
                        >
                          <CloseIcon size={16} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setIsEditingBranch(true)}
                        className="p-2 bg-[#21262d] border border-[#30363d] rounded-md text-[#8b949e] hover:text-[#f0f6fc] transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                  </div>
                </section>

                {/* Danger Zone */}
                <section className="pt-4">
                   <div className="rounded-xl border border-[#da3633] overflow-hidden">
                      <div className="px-4 py-3 bg-[#da3633]/5 border-b border-[#da3633]">
                         <h3 className="text-sm font-bold text-[#f85149]">Danger Zone</h3>
                      </div>
                      <div className="divide-y divide-[#da3633]/20 bg-[#161b22]">
                         <div className="flex items-center justify-between p-6">
                            <div>
                               <p className="text-sm font-bold text-[#f0f6fc]">Delete this repository</p>
                               <p className="text-xs text-[#8b949e]">Once you delete a repository, there is no going back. Please be absolutely certain.</p>
                            </div>
                            <button 
                              onClick={handleDeleteRepo}
                              className="px-4 py-1.5 bg-[#da3633] rounded-md text-xs font-bold text-white hover:bg-[#f85149] transition-colors"
                            >
                              Delete repository
                            </button>
                         </div>
                      </div>
                   </div>
                </section>
              </div>
            )}

            {activeCategory === "Collaborators" && (
              <div className="animate-in fade-in duration-300">
                <CollaboratorManager repoId={id} isOwner={repo.role === "OWNER"} />
              </div>
            )}

            {/* ==========================================
                1. MODERATION OPTIONS TAB
                ========================================== */}
            {activeCategory === "Moderation" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-[#30363d] pb-4">
                  <h1 className="text-2xl font-semibold text-[#f0f6fc]">Moderation Options</h1>
                  <p className="text-xs text-[#8b949e]">Restrict user interactions or block abusive members inside repository boards.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left panel: Interaction Limits */}
                  <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-4">
                    <h3 className="text-sm font-bold text-[#f0f6fc]">Interaction Limits</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-[#8b949e] block mb-1">Comment Permissions</label>
                        <select 
                          value={modSettings?.commentLimit} 
                          onChange={(e) => setModSettings({ ...modSettings, commentLimit: e.target.value })}
                          className="w-full bg-[#010409] border border-[#30363d] rounded-md p-2 text-xs focus:border-[#2f81f7] outline-none"
                        >
                          <option value="everyone">Everyone</option>
                          <option value="contributors">Prior Contributors Only</option>
                          <option value="collaborators">Collaborators Only</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#8b949e] block mb-1">Issue Creation Permissions</label>
                        <select 
                          value={modSettings?.issueLimit} 
                          onChange={(e) => setModSettings({ ...modSettings, issueLimit: e.target.value })}
                          className="w-full bg-[#010409] border border-[#30363d] rounded-md p-2 text-xs focus:border-[#2f81f7] outline-none"
                        >
                          <option value="everyone">Everyone</option>
                          <option value="contributors">Prior Contributors Only</option>
                          <option value="collaborators">Collaborators Only</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#8b949e] block mb-1">Pull Request Permissions</label>
                        <select 
                          value={modSettings?.prLimit} 
                          onChange={(e) => setModSettings({ ...modSettings, prLimit: e.target.value })}
                          className="w-full bg-[#010409] border border-[#30363d] rounded-md p-2 text-xs focus:border-[#2f81f7] outline-none"
                        >
                          <option value="everyone">Everyone</option>
                          <option value="contributors">Prior Contributors Only</option>
                          <option value="collaborators">Collaborators Only</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#8b949e] block mb-1">Limit Duration</label>
                        <select 
                          value={durationDays} 
                          onChange={(e) => setDurationDays(parseInt(e.target.value))}
                          className="w-full bg-[#010409] border border-[#30363d] rounded-md p-2 text-xs focus:border-[#2f81f7] outline-none"
                        >
                          <option value={0}>Limitless (Indefinite)</option>
                          <option value={1}>1 Day</option>
                          <option value={3}>3 Days</option>
                          <option value={7}>1 Week</option>
                          <option value={30}>1 Month</option>
                        </select>
                      </div>

                      <button 
                        onClick={handleUpdateModLimits}
                        className="w-full py-1.5 bg-[#238636] hover:bg-[#2ea043] rounded-md text-xs font-bold text-white transition-colors"
                      >
                        Apply Limits
                      </button>
                    </div>
                  </div>

                  {/* Right panel: User Blocks */}
                  <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-4">
                    <h3 className="text-sm font-bold text-[#f0f6fc]">Block Users</h3>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Enter username" 
                        value={blockedInput} 
                        onChange={(e) => setBlockedInput(e.target.value)}
                        className="flex-1 bg-[#010409] border border-[#30363d] rounded-md p-2 text-xs outline-none focus:border-[#2f81f7]"
                      />
                      <button 
                        onClick={handleBlockUser}
                        className="px-4 bg-[#da3633] hover:bg-[#f85149] rounded-md text-xs font-bold text-white transition-colors"
                      >
                        Block
                      </button>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {blockedUsers.length === 0 ? (
                        <p className="text-xs text-[#8b949e] text-center py-4">No users currently blocked.</p>
                      ) : (
                        blockedUsers.map(b => (
                          <div key={b._id} className="flex items-center justify-between bg-[#0d1117] border border-[#30363d] rounded-md p-2">
                            <span className="text-xs font-mono">{b.user?.username}</span>
                            <button 
                              onClick={() => handleUnblockUser(b.user?._id)}
                              className="text-[10px] bg-[#21262d] hover:bg-[#30363d] px-2 py-1 rounded border border-[#30363d]"
                            >
                              Unblock
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Audit Logs list */}
                <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
                  <h3 className="text-sm font-bold text-[#f0f6fc] mb-3">Moderation Audit Logs</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {modAuditLogs.length === 0 ? (
                      <p className="text-xs text-[#8b949e] text-center py-4">Audit log is empty.</p>
                    ) : (
                      modAuditLogs.map(log => (
                        <div key={log._id} className="text-xs border-b border-[#30363d] pb-2 flex justify-between">
                          <div>
                            <span className="font-bold text-[#f0f6fc]">@{log.actor?.username || "system"}</span>: {log.details}
                          </div>
                          <span className="text-[10px] text-[#8b949e] font-mono">{new Date(log.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ==========================================
                2. BRANCH PROTECTION TAB
                ========================================== */}
            {activeCategory === "Branches" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-[#30363d] pb-4 flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-semibold text-[#f0f6fc]">Branches</h1>
                    <p className="text-xs text-[#8b949e]">Configure rules to protect sensitive codebase branches.</p>
                  </div>
                  {!isAddingRule && (
                    <button 
                      onClick={() => setIsAddingRule(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-xs font-bold text-white rounded-md transition-colors"
                    >
                      <Plus size={14} /> Add Rule
                    </button>
                  )}
                </div>

                {isAddingRule ? (
                  <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-4">
                    <h3 className="text-sm font-bold text-[#f0f6fc]">Add Branch Protection Rule</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-[#8b949e] block mb-1">Target Branch Pattern</label>
                        <input 
                          type="text" 
                          placeholder="e.g. main, release-*" 
                          value={newRule.branchName}
                          onChange={(e) => setNewRule({ ...newRule, branchName: e.target.value })}
                          className="w-full bg-[#010409] border border-[#30363d] rounded-md p-2 text-xs text-[#c9d1d9] outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[#8b949e] block mb-1">Required Approvals</label>
                        <input 
                          type="number" 
                          value={newRule.requiredApprovals}
                          onChange={(e) => setNewRule({ ...newRule, requiredApprovals: parseInt(e.target.value) || 0 })}
                          className="w-full bg-[#010409] border border-[#30363d] rounded-md p-2 text-xs text-[#c9d1d9] outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-[#30363d] pt-4">
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={newRule.requirePR} 
                          onChange={(e) => setNewRule({ ...newRule, requirePR: e.target.checked })}
                        />
                        Require pull request before merging
                      </label>
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={newRule.preventForcePush} 
                          onChange={(e) => setNewRule({ ...newRule, preventForcePush: e.target.checked })}
                        />
                        Restrict force pushes (Recommended)
                      </label>
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={newRule.preventDeletion} 
                          onChange={(e) => setNewRule({ ...newRule, preventDeletion: e.target.checked })}
                        />
                        Prevent deletion
                      </label>
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={newRule.requireStatusChecks} 
                          onChange={(e) => setNewRule({ ...newRule, requireStatusChecks: e.target.checked })}
                        />
                        Require status checks to pass before merging
                      </label>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => setIsAddingRule(false)}
                        className="px-4 py-1.5 bg-[#21262d] border border-[#30363d] text-xs font-bold rounded-md"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleAddBranchRule}
                        className="px-4 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-xs font-bold text-white rounded-md"
                      >
                        Create
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {branchRules.length === 0 ? (
                      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8 text-center">
                        <p className="text-sm text-[#8b949e]">No branch protection rules configured yet.</p>
                      </div>
                    ) : (
                      branchRules.map(rule => (
                        <div key={rule._id} className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-0.5 rounded bg-[#30363d] text-xs font-mono font-bold text-[#f0f6fc]">{rule.branchName}</span>
                              <span className="text-xs text-[#8b949e]">Rule active</span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-[#8b949e]">
                              <div>PR Required: <span className="font-bold text-[#c9d1d9]">{rule.requirePR ? "Yes" : "No"}</span></div>
                              <div>Approvals: <span className="font-bold text-[#c9d1d9]">{rule.requiredApprovals}</span></div>
                              <div>Force Push Blocked: <span className="font-bold text-[#c9d1d9]">{rule.preventForcePush ? "Yes" : "No"}</span></div>
                              <div>Deletion Blocked: <span className="font-bold text-[#c9d1d9]">{rule.preventDeletion ? "Yes" : "No"}</span></div>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDeleteBranchRule(rule._id)}
                            className="p-1.5 bg-[#21262d] hover:bg-[#da3633] text-[#8b949e] hover:text-white rounded-md border border-[#30363d] transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ==========================================
                3. TAGS & RELEASES TAB
                ========================================== */}
            {activeCategory === "Tags" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-[#30363d] pb-4 flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-semibold text-[#f0f6fc]">Tags & Releases</h1>
                    <p className="text-xs text-[#8b949e]">Manage software tags, versions, and releases logs.</p>
                  </div>
                  {!isAddingRelease && (
                    <button 
                      onClick={() => setIsAddingRelease(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-xs font-bold text-white rounded-md transition-colors"
                    >
                      <Plus size={14} /> Create Release
                    </button>
                  )}
                </div>

                {isAddingRelease ? (
                  <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-4">
                    <h3 className="text-sm font-bold text-[#f0f6fc]">Create a New Tagged Release</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-[#8b949e] block mb-1">Tag Version Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. v1.0.0" 
                          value={newRelease.tagName}
                          onChange={(e) => setNewRelease({ ...newRelease, tagName: e.target.value })}
                          className="w-full bg-[#010409] border border-[#30363d] rounded-md p-2 text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[#8b949e] block mb-1">Target Branch</label>
                        <select 
                          value={newRelease.targetBranch}
                          onChange={(e) => setNewRelease({ ...newRelease, targetBranch: e.target.value })}
                          className="w-full bg-[#010409] border border-[#30363d] rounded-md p-2 text-xs outline-none text-[#c9d1d9]"
                        >
                          <option value="main">main</option>
                          <option value="master">master</option>
                          <option value="dev">dev</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#8b949e] block mb-1">Release Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Production Gold Release" 
                        value={newRelease.name}
                        onChange={(e) => setNewRelease({ ...newRelease, name: e.target.value })}
                        className="w-full bg-[#010409] border border-[#30363d] rounded-md p-2 text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#8b949e] block mb-1">Release Notes</label>
                      <textarea 
                        rows={4}
                        placeholder="Write changelog descriptions..." 
                        value={newRelease.body}
                        onChange={(e) => setNewRelease({ ...newRelease, body: e.target.value })}
                        className="w-full bg-[#010409] border border-[#30363d] rounded-md p-2 text-xs outline-none font-mono"
                      />
                    </div>

                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={newRelease.isPrerelease} 
                          onChange={(e) => setNewRelease({ ...newRelease, isPrerelease: e.target.checked })}
                        />
                        This is a pre-release
                      </label>
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={newRelease.isDraft} 
                          onChange={(e) => setNewRelease({ ...newRelease, isDraft: e.target.checked })}
                        />
                        Save as draft
                      </label>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => setIsAddingRelease(false)}
                        className="px-4 py-1.5 bg-[#21262d] border border-[#30363d] text-xs font-bold rounded-md"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleCreateRelease}
                        className="px-4 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-xs font-bold text-white rounded-md"
                      >
                        Publish
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {releases.length === 0 ? (
                      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8 text-center">
                        <p className="text-sm text-[#8b949e]">No tagged releases created yet.</p>
                      </div>
                    ) : (
                      releases.map(rel => (
                        <div key={rel._id} className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-bold text-[#f0f6fc]">{rel.name}</span>
                              <span className="px-2 py-0.5 rounded bg-[#21262d] border border-[#30363d] text-[10px] font-mono font-bold text-[#2f81f7]">{rel.tagName}</span>
                              {rel.isPrerelease && <span className="px-2 py-0.5 rounded bg-[#da3633]/10 text-[9px] text-[#f85149] font-bold">Pre-release</span>}
                            </div>
                            <p className="text-xs text-[#8b949e] font-mono whitespace-pre-line">{rel.body}</p>
                            <span className="text-[10px] text-[#8b949e] block mt-2 font-mono">Branch: {rel.targetBranch} | Published {new Date(rel.createdAt).toLocaleDateString()}</span>
                          </div>
                          <button 
                            onClick={() => handleDeleteRelease(rel._id)}
                            className="p-1.5 bg-[#21262d] hover:bg-[#da3633] text-[#8b949e] hover:text-white rounded-md border border-[#30363d] transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ==========================================
                4. RULESETS TAB
                ========================================== */}
            {activeCategory === "Rules" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-[#30363d] pb-4 flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-semibold text-[#f0f6fc]">Repository Rulesets</h1>
                    <p className="text-xs text-[#8b949e]">Implement granular rules to enforce standard development styles across multiple branches.</p>
                  </div>
                  {!isAddingRuleset && (
                    <button 
                      onClick={() => setIsAddingRuleset(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-xs font-bold text-white rounded-md transition-colors"
                    >
                      <Plus size={14} /> Add Ruleset
                    </button>
                  )}
                </div>

                {isAddingRuleset ? (
                  <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-4">
                    <h3 className="text-sm font-bold text-[#f0f6fc]">Configure Branch Ruleset</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-[#8b949e] block mb-1">Ruleset Title Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Standard Feature Branch Lock" 
                          value={newRuleset.name}
                          onChange={(e) => setNewRuleset({ ...newRuleset, name: e.target.value })}
                          className="w-full bg-[#010409] border border-[#30363d] rounded-md p-2 text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[#8b949e] block mb-1">Enforcement State</label>
                        <select 
                          value={newRuleset.enforcement}
                          onChange={(e) => setNewRuleset({ ...newRuleset, enforcement: e.target.value })}
                          className="w-full bg-[#010409] border border-[#30363d] rounded-md p-2 text-xs outline-none text-[#c9d1d9]"
                        >
                          <option value="active">Active (Enforced)</option>
                          <option value="evaluate">Evaluation Mode</option>
                          <option value="disabled">Disabled</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-[#8b949e] block mb-1">Target Branch Glob Pattern</label>
                        <input 
                          type="text" 
                          placeholder="e.g. feature/*, staging" 
                          value={newRuleset.branchPattern}
                          onChange={(e) => setNewRuleset({ ...newRuleset, branchPattern: e.target.value })}
                          className="w-full bg-[#010409] border border-[#30363d] rounded-md p-2 text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[#8b949e] block mb-1">Required Reviewers</label>
                        <input 
                          type="number" 
                          value={newRuleset.requiredReviewers}
                          onChange={(e) => setNewRuleset({ ...newRuleset, requiredReviewers: parseInt(e.target.value) || 0 })}
                          className="w-full bg-[#010409] border border-[#30363d] rounded-md p-2 text-xs outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#8b949e] block mb-1">Allowed Commit Message Prefixes (comma separated)</label>
                      <input 
                        type="text" 
                        placeholder="feat:, fix:, docs:, chore:" 
                        value={newRuleset.commitPrefixesStr}
                        onChange={(e) => setNewRuleset({ ...newRuleset, commitPrefixesStr: e.target.value })}
                        className="w-full bg-[#010409] border border-[#30363d] rounded-md p-2 text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#8b949e] block mb-1">Protected File Paths (comma separated)</label>
                      <input 
                        type="text" 
                        placeholder=".github/workflows/*, secrets.json" 
                        value={newRuleset.protectedPathsStr}
                        onChange={(e) => setNewRuleset({ ...newRuleset, protectedPathsStr: e.target.value })}
                        className="w-full bg-[#010409] border border-[#30363d] rounded-md p-2 text-xs outline-none"
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => setIsAddingRuleset(false)}
                        className="px-4 py-1.5 bg-[#21262d] border border-[#30363d] text-xs font-bold rounded-md"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSaveRuleset}
                        className="px-4 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-xs font-bold text-white rounded-md"
                      >
                        Save Ruleset
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rulesets.length === 0 ? (
                      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8 text-center">
                        <p className="text-sm text-[#8b949e]">No repository rulesets configured.</p>
                      </div>
                    ) : (
                      rulesets.map(rs => (
                        <div key={rs._id} className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-bold text-[#f0f6fc]">{rs.name}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rs.enforcement === "active" ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-400"}`}>{rs.enforcement}</span>
                            </div>
                            <div className="text-xs text-[#8b949e] space-y-1">
                              <div>Branch pattern: <span className="font-mono text-[#c9d1d9]">{rs.branchPattern}</span></div>
                              <div>Allowed prefixes: <span className="font-mono text-[#c9d1d9]">{rs.commitPrefixes?.join(", ") || "None"}</span></div>
                              <div>Protected paths: <span className="font-mono text-[#c9d1d9]">{rs.protectedPaths?.join(", ") || "None"}</span></div>
                              <div>Required Reviewers: <span className="font-mono text-[#c9d1d9]">{rs.requiredReviewers}</span></div>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDeleteRuleset(rs._id)}
                            className="p-1.5 bg-[#21262d] hover:bg-[#da3633] text-[#8b949e] hover:text-white rounded-md border border-[#30363d] transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ==========================================
                5. WEBHOOKS TAB
                ========================================== */}
            {activeCategory === "Webhooks" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-[#30363d] pb-4 flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-semibold text-[#f0f6fc]">Webhooks</h1>
                    <p className="text-xs text-[#8b949e]">Configure webhooks to sync third-party hooks on push, PR, or other events.</p>
                  </div>
                  {!isAddingWebhook && (
                    <button 
                      onClick={() => setIsAddingWebhook(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-xs font-bold text-white rounded-md transition-colors"
                    >
                      <Plus size={14} /> Add Webhook
                    </button>
                  )}
                </div>

                {isAddingWebhook ? (
                  <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-4">
                    <h3 className="text-sm font-bold text-[#f0f6fc]">Configure Webhook Payload</h3>
                    
                    <div>
                      <label className="text-xs font-semibold text-[#8b949e] block mb-1">Payload URL</label>
                      <input 
                        type="text" 
                        placeholder="https://example.com/webhook" 
                        value={newWebhook.url}
                        onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                        className="w-full bg-[#010409] border border-[#30363d] rounded-md p-2 text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#8b949e] block mb-1">Secret Token</label>
                      <input 
                        type="password" 
                        placeholder="Webhook HMAC Secret key" 
                        value={newWebhook.secret}
                        onChange={(e) => setNewWebhook({ ...newWebhook, secret: e.target.value })}
                        className="w-full bg-[#010409] border border-[#30363d] rounded-md p-2 text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#8b949e] block mb-2">Trigger Event Events</label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={newWebhook.events.includes("push")} 
                            onChange={(e) => {
                              const evs = e.target.checked ? [...newWebhook.events, "push"] : newWebhook.events.filter(x => x !== "push");
                              setNewWebhook({ ...newWebhook, events: evs });
                            }}
                          />
                          git push events (Default)
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={newWebhook.events.includes("pull_request")} 
                            onChange={(e) => {
                              const evs = e.target.checked ? [...newWebhook.events, "pull_request"] : newWebhook.events.filter(x => x !== "pull_request");
                              setNewWebhook({ ...newWebhook, events: evs });
                            }}
                          />
                          pull request updates
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={newWebhook.events.includes("issue")} 
                            onChange={(e) => {
                              const evs = e.target.checked ? [...newWebhook.events, "issue"] : newWebhook.events.filter(x => x !== "issue");
                              setNewWebhook({ ...newWebhook, events: evs });
                            }}
                          />
                          issue reports
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => setIsAddingWebhook(false)}
                        className="px-4 py-1.5 bg-[#21262d] border border-[#30363d] text-xs font-bold rounded-md"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSaveWebhook}
                        className="px-4 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-xs font-bold text-white rounded-md"
                      >
                        Save Webhook
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Webhooks list */}
                    <div className="space-y-4">
                      {webhooks.length === 0 ? (
                        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8 text-center">
                          <p className="text-sm text-[#8b949e]">No webhooks configured.</p>
                        </div>
                      ) : (
                        webhooks.map(wh => (
                          <div key={wh._id} className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 flex justify-between items-center">
                            <div>
                              <span className="text-xs font-mono font-bold text-[#c9d1d9] break-all">{wh.url}</span>
                              <div className="flex gap-2 mt-2">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${wh.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                                  {wh.isActive ? "Active" : "Inactive"}
                                </span>
                                <span className="text-[10px] text-[#8b949e]">Events: {wh.events?.join(", ") || "None"}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleTestWebhook(wh._id)}
                                className="px-2 py-1 bg-[#21262d] border border-[#30363d] text-[10px] font-bold rounded hover:text-white"
                              >
                                Test Hook
                              </button>
                              <button 
                                onClick={() => handleDeleteWebhook(wh._id)}
                                className="p-1.5 bg-[#21262d] hover:bg-[#da3633] text-[#8b949e] hover:text-white rounded-md border border-[#30363d] transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Deliveries log list */}
                    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
                      <h3 className="text-sm font-bold text-[#f0f6fc] mb-4">Recent Deliveries</h3>
                      <div className="space-y-3">
                        {webhookDeliveries.length === 0 ? (
                          <p className="text-xs text-[#8b949e] text-center py-4">No deliveries logged yet.</p>
                        ) : (
                          webhookDeliveries.map(del => (
                            <div key={del._id} className="text-xs border-b border-[#30363d] pb-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${del.statusCode >= 200 && del.statusCode < 300 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                                    {del.statusCode}
                                  </span>
                                  <span className="font-mono text-[#8b949e]">{del.event}</span>
                                </div>
                                <span className="text-[10px] font-mono text-[#8b949e]">{del.duration}ms | {new Date(del.createdAt).toLocaleTimeString()}</span>
                              </div>
                              <details className="cursor-pointer group">
                                <summary className="text-[10px] text-[#2f81f7] hover:underline font-semibold select-none">View Delivery details</summary>
                                <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-[9px] bg-[#0d1117] border border-[#30363d] rounded-md p-3 max-h-40 overflow-y-auto">
                                  <div>
                                    <span className="font-bold text-[#8b949e] block mb-1">Request Payload</span>
                                    <pre className="text-slate-400 select-all">{del.requestBody}</pre>
                                  </div>
                                  <div>
                                    <span className="font-bold text-[#8b949e] block mb-1">Response Body</span>
                                    <pre className="text-slate-400 select-all">{del.responseBody}</pre>
                                  </div>
                                </div>
                              </details>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ==========================================
                6. AI PLAYGROUND TAB
                ========================================== */}
            {activeCategory === "Models" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-[#30363d] pb-4">
                  <h1 className="text-2xl font-semibold text-[#f0f6fc] flex items-center gap-2">
                    <Sparkles size={24} className="text-[#2f81f7]" /> AI Playground
                  </h1>
                  <p className="text-xs text-[#8b949e]">Configure API keys for AI models (Groq/LLaMA, OpenAI, Anthropic) and execute live playground prompts.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: Configure Keys */}
                  <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-4">
                    <h3 className="text-sm font-bold text-[#f0f6fc]">AI Configuration</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-[#8b949e] block mb-1">Select AI Provider</label>
                        <select 
                          value={selectedProvider}
                          onChange={(e) => setSelectedProvider(e.target.value)}
                          className="w-full bg-[#010409] border border-[#30363d] rounded-md p-2 text-xs focus:border-[#2f81f7] outline-none"
                        >
                          <option value="groq">Groq — LLaMA 3.1 8B Instant (Free)</option>
                          <option value="openai">OpenAI (GPT Models)</option>
                          <option value="anthropic">Anthropic (Claude)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#8b949e] block mb-1">Enter API Key</label>
                        <input 
                          type="password" 
                          placeholder="Paste API Key here" 
                          value={apiKeyInput}
                          onChange={(e) => setApiKeyInput(e.target.value)}
                          className="w-full bg-[#010409] border border-[#30363d] rounded-md p-2 text-xs focus:border-[#2f81f7] outline-none font-mono"
                        />
                        <p className="text-[10px] text-[#8b949e] mt-1">Keys are encrypted with military-grade AES-256-GCM before database storage.</p>
                      </div>

                      <button 
                        onClick={handleSaveModelConfig}
                        disabled={saving}
                        className="w-full py-1.5 bg-[#238636] hover:bg-[#2ea043] rounded-md text-xs font-bold text-white transition-colors"
                      >
                        {saving ? "Saving..." : "Configure Model"}
                      </button>
                    </div>

                    <div className="border-t border-[#30363d] pt-4">
                      <h4 className="text-xs font-bold text-[#8b949e] mb-2">Connected Providers</h4>
                      <div className="space-y-2">
                        {modelConnections.length === 0 ? (
                          <div className="flex items-center gap-1.5 text-xs text-[#8b949e]">
                            <Info size={12} /> Default Groq API Key active (System-wide fallback)
                          </div>
                        ) : (
                          modelConnections.map(conn => (
                            <div key={conn._id} className="flex justify-between items-center text-xs bg-[#0d1117] p-2 border border-[#30363d] rounded">
                              <span className="font-bold text-[#f0f6fc] font-mono uppercase">{conn.provider}</span>
                              <span className="font-mono text-[#8b949e]">{conn.apiKey}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: AI Chat Console */}
                  <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 flex flex-col justify-between h-[450px]">
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-[#f0f6fc] flex items-center justify-between">
                        <span>AI Inference Testing</span>
                        <span className="text-[10px] bg-[#2f81f7]/10 text-[#2f81f7] px-2 py-0.5 rounded font-mono font-bold uppercase">{selectedProvider} Console</span>
                      </h3>
                      
                      <div className="bg-[#0d1117] border border-[#30363d] rounded-md p-4 h-[280px] overflow-y-auto font-sans text-xs space-y-4">
                        {playgroundResponse ? (
                          <div className="space-y-4">
                            <div className="bg-[#1f242c] p-2 rounded-md border border-[#30363d]">
                              <span className="font-bold text-[#8b949e] block mb-1">User Prompt:</span>
                              <p className="text-slate-200">Test execute Grok inference</p>
                            </div>
                            <div className="bg-[#2f81f7]/5 p-2 rounded-md border border-[#2f81f7]/20">
                              <span className="font-bold text-[#2f81f7] block mb-1">AI Response:</span>
                              <p className="whitespace-pre-wrap leading-relaxed text-[#c9d1d9]">{playgroundResponse}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center flex-col text-center">
                            <Sparkles size={28} className="text-[#8b949e] mb-2 animate-pulse" />
                            <p className="text-[#8b949e]">Ready to run playground test prompts.</p>
                            <p className="text-[10px] text-slate-500 max-w-xs mt-1">Enter a prompt below and watch the selected model execute live reasoning.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Ask AI playground anything..." 
                        value={playgroundPrompt}
                        onChange={(e) => setPlaygroundPrompt(e.target.value)}
                        disabled={playgroundLoading}
                        onKeyDown={(e) => { if (e.key === "Enter") handleSendPrompt(); }}
                        className="flex-1 bg-[#010409] border border-[#30363d] rounded-md p-2 text-xs focus:border-[#2f81f7] outline-none"
                      />
                      <button 
                        onClick={handleSendPrompt}
                        disabled={playgroundLoading || !playgroundPrompt}
                        className="p-2 bg-[#2f81f7] hover:bg-[#1f6feb] rounded-md text-white transition-colors flex items-center justify-center"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI prompt logs */}
                <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
                  <h3 className="text-sm font-bold text-[#f0f6fc] mb-3">Prompt Execution Logs</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {promptHistory.length === 0 ? (
                      <p className="text-xs text-[#8b949e] text-center py-4">No playground tokens spent yet.</p>
                    ) : (
                      promptHistory.map(log => (
                        <div key={log._id} className="text-xs border-b border-[#30363d] pb-2 flex justify-between">
                          <div>
                            <span className="font-bold text-[#f0f6fc] font-mono">{log.provider?.toUpperCase()}</span>: "{log.prompt.slice(0, 50)}..."
                          </div>
                          <span className="text-[10px] text-[#8b949e] font-mono">{log.tokensUsed} tokens | {new Date(log.createdAt).toLocaleTimeString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ==========================================
                7. COPILOT CONFIG TAB
                ========================================== */}
            {activeCategory === "Copilot" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-[#30363d] pb-4 flex items-center gap-2">
                  <CopilotIcon size={24} className="text-[#2f81f7]" />
                  <div>
                    <h1 className="text-2xl font-semibold text-[#f0f6fc]">GitHub Copilot configuration</h1>
                    <p className="text-xs text-[#8b949e]">Configure AI assistance features and auto-suggestions on code editor workflows.</p>
                  </div>
                </div>

                <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-[#f0f6fc]">Enable suggestions</h3>
                      <p className="text-xs text-[#8b949e]">Allow Copilot to trigger real-time code line updates inside active IDE windows.</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={copilotSettings.suggestions}
                      onChange={(e) => setCopilotSettings({ ...copilotSettings, suggestions: e.target.checked })}
                      className="cursor-pointer h-4 w-4"
                    />
                  </div>

                  <div className="flex items-start justify-between border-t border-[#30363d] pt-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-[#f0f6fc]">Allow matching public code</h3>
                      <p className="text-xs text-[#8b949e]">Allow the model to match and fetch identical patterns of public-source codes.</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={copilotSettings.publicCodeMatching}
                      onChange={(e) => setCopilotSettings({ ...copilotSettings, publicCodeMatching: e.target.checked })}
                      className="cursor-pointer h-4 w-4"
                    />
                  </div>

                  <div className="flex items-start justify-between border-t border-[#30363d] pt-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-[#f0f6fc]">Inline auto-completions</h3>
                      <p className="text-xs text-[#8b949e]">Enable inline greyed-out completions during active coding sessions.</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={copilotSettings.inlineCompletions}
                      onChange={(e) => setCopilotSettings({ ...copilotSettings, inlineCompletions: e.target.checked })}
                      className="cursor-pointer h-4 w-4"
                    />
                  </div>

                  <button 
                    onClick={() => alert("Copilot configuration applied successfully!")}
                    className="px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-xs font-bold text-white rounded-md transition-all"
                  >
                    Apply Config
                  </button>
                </div>
              </div>
            )}

            {/* ==========================================
                8. ENVIRONMENTS TAB
                ========================================== */}
            {activeCategory === "Environments" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-[#30363d] pb-4 flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-semibold text-[#f0f6fc]">Environments</h1>
                    <p className="text-xs text-[#8b949e]">Configure staging, development, or production environments for pipeline workflow controls.</p>
                  </div>
                  {!isAddingEnv && (
                    <button 
                      onClick={() => setIsAddingEnv(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-xs font-bold text-white rounded-md transition-colors"
                    >
                      <Plus size={14} /> New Environment
                    </button>
                  )}
                </div>

                {isAddingEnv ? (
                  <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-4">
                    <h3 className="text-sm font-bold text-[#f0f6fc]">Configure Release Environment</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-[#8b949e] block mb-1">Environment Title Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. production, development" 
                          value={newEnv.name}
                          onChange={(e) => setNewEnv({ ...newEnv, name: e.target.value })}
                          className="w-full bg-[#010409] border border-[#30363d] rounded-md p-2 text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[#8b949e] block mb-1">Wait Timer (Minutes)</label>
                        <input 
                          type="number" 
                          value={newEnv.waitTimer}
                          onChange={(e) => setNewEnv({ ...newEnv, waitTimer: parseInt(e.target.value) || 0 })}
                          className="w-full bg-[#010409] border border-[#30363d] rounded-md p-2 text-xs outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#8b949e] block mb-1">Required Reviewers (Usernames, comma separated)</label>
                      <input 
                        type="text" 
                        placeholder="tester, admin" 
                        value={newEnv.requiredReviewersStr}
                        onChange={(e) => setNewEnv({ ...newEnv, requiredReviewersStr: e.target.value })}
                        className="w-full bg-[#010409] border border-[#30363d] rounded-md p-2 text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#8b949e] block mb-1">Allowed Branch Restrictions (comma separated)</label>
                      <input 
                        type="text" 
                        placeholder="main, release-*" 
                        value={newEnv.branchRestrictionsStr}
                        onChange={(e) => setNewEnv({ ...newEnv, branchRestrictionsStr: e.target.value })}
                        className="w-full bg-[#010409] border border-[#30363d] rounded-md p-2 text-xs outline-none"
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => setIsAddingEnv(false)}
                        className="px-4 py-1.5 bg-[#21262d] border border-[#30363d] text-xs font-bold rounded-md"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSaveEnvironment}
                        className="px-4 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-xs font-bold text-white rounded-md"
                      >
                        Configure
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Environments list */}
                    <div className="space-y-4">
                      {environments.length === 0 ? (
                        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8 text-center">
                          <p className="text-sm text-[#8b949e]">No environments configured.</p>
                        </div>
                      ) : (
                        environments.map(env => (
                          <div key={env._id} className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 flex justify-between items-start">
                            <div>
                              <span className="text-sm font-bold text-[#f0f6fc]">{env.name}</span>
                              <div className="text-xs text-[#8b949e] space-y-1 mt-2">
                                <div>Wait Timer: <span className="font-bold text-[#c9d1d9]">{env.waitTimer} mins</span></div>
                                <div>Allowed Branches: <span className="font-mono text-[#c9d1d9]">{env.branchRestrictions?.join(", ") || "Everyone"}</span></div>
                                <div>Reviewers: <span className="font-bold text-[#c9d1d9]">{env.requiredReviewers?.map(r => `@${r.username}`).join(", ") || "None"}</span></div>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleDeleteEnv(env._id)}
                              className="p-1.5 bg-[#21262d] hover:bg-[#da3633] text-[#8b949e] hover:text-white rounded-md border border-[#30363d] transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Deployments list */}
                    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
                      <h3 className="text-sm font-bold text-[#f0f6fc] mb-4">Workflow Deployment History</h3>
                      <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                        {deployments.length === 0 ? (
                          <p className="text-xs text-[#8b949e] text-center py-4">No deployments recorded.</p>
                        ) : (
                          deployments.map(dep => (
                            <div key={dep._id} className="text-xs border-b border-[#30363d] pb-2 flex justify-between">
                              <div>
                                Deployment to <span className="font-bold text-[#f0f6fc]">{dep.environmentName}</span> ({dep.ref})
                              </div>
                              <span className="font-mono text-[#2f81f7] uppercase font-bold">{dep.status}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ==========================================
                9. CODESPACES TAB
                ========================================== */}
            {activeCategory === "Codespaces" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-[#30363d] pb-4 flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-semibold text-[#f0f6fc]">Codespaces</h1>
                    <p className="text-xs text-[#8b949e]">Run docker-style containerized developer workspaces straight from the web settings.</p>
                  </div>
                  <button 
                    onClick={handleCreateCodespace}
                    disabled={launchingCodespace}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-xs font-bold text-white rounded-md transition-colors disabled:opacity-50"
                  >
                    {launchingCodespace ? "Launching..." : "Launch Codespace"}
                  </button>
                </div>

                {activeTerminalCodespace && (
                  <div className="bg-black border border-[#30363d] rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                    <div className="px-4 py-2 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Terminal size={14} className="text-emerald-400" />
                        <span className="text-xs font-mono font-bold text-white">{activeTerminalCodespace.name}</span>
                      </div>
                      <button 
                        onClick={() => setActiveTerminalCodespace(null)}
                        className="text-[#8b949e] hover:text-white"
                      >
                        <CloseIcon size={14} />
                      </button>
                    </div>
                    <div className="p-4 font-mono text-xs text-emerald-400 min-h-[160px] max-h-[250px] overflow-y-auto space-y-1">
                      {terminalOutput.map((out, idx) => (
                        <div key={idx}>$ {out}</div>
                      ))}
                      <div className="flex items-center gap-1.5 animate-pulse mt-2">
                        <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full"></span>
                        <span className="text-[10px] text-emerald-500 font-bold uppercase">Active Port: {activeTerminalCodespace.port}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {codespaces.length === 0 ? (
                    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8 text-center">
                      <p className="text-sm text-[#8b949e]">No running codespaces found.</p>
                    </div>
                  ) : (
                    codespaces.map(cs => (
                      <div key={cs._id} className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#f0f6fc]">{cs.name}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${cs.status === "running" ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                              {cs.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#8b949e] mt-1">
                            Branch: <span className="font-mono text-[#c9d1d9]">{cs.branch}</span> | Container ID: <span className="font-mono text-[#c9d1d9]">{cs.containerId.slice(0, 12)}</span> | Active Port: <span className="font-mono text-[#c9d1d9]">{cs.port}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {cs.status === "running" && (
                            <button 
                              onClick={() => handleStopCodespace(cs._id)}
                              className="px-2.5 py-1 bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] text-xs font-semibold rounded text-[#8b949e] hover:text-[#f0f6fc]"
                            >
                              Stop
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteCodespace(cs._id)}
                            className="p-1.5 bg-[#21262d] hover:bg-[#da3633] text-[#8b949e] hover:text-white rounded-md border border-[#30363d] transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ==========================================
                10. PAGES TAB
                ========================================== */}
            {activeCategory === "Pages" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-[#30363d] pb-4">
                  <h1 className="text-2xl font-semibold text-[#f0f6fc]">GitHub Pages</h1>
                  <p className="text-xs text-[#8b949e]">Deploy static website assets directly from committed folders inside your repository.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Configuration column */}
                  <div className="md:col-span-1 bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-4 h-fit">
                    <h3 className="text-sm font-bold text-[#f0f6fc]">Pages Configuration</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-[#8b949e] block mb-1">Source Branch</label>
                        <select 
                          value={pagesConfig.sourceBranch}
                          onChange={(e) => setPagesConfig({ ...pagesConfig, sourceBranch: e.target.value })}
                          className="w-full bg-[#010409] border border-[#30363d] rounded-md p-2 text-xs focus:border-[#2f81f7] outline-none"
                        >
                          <option value="main">main</option>
                          <option value="master">master</option>
                          <option value="gh-pages">gh-pages</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#8b949e] block mb-1">Source Directory</label>
                        <select 
                          value={pagesConfig.sourceDir}
                          onChange={(e) => setPagesConfig({ ...pagesConfig, sourceDir: e.target.value })}
                          className="w-full bg-[#010409] border border-[#30363d] rounded-md p-2 text-xs focus:border-[#2f81f7] outline-none"
                        >
                          <option value="/">/ (root directory)</option>
                          <option value="/docs">/docs (documentation folder)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#8b949e] block mb-1">Custom Domain</label>
                        <input 
                          type="text" 
                          placeholder="e.g. blog.mysite.com" 
                          value={pagesConfig.customDomain}
                          onChange={(e) => setPagesConfig({ ...pagesConfig, customDomain: e.target.value })}
                          className="w-full bg-[#010409] border border-[#30363d] rounded-md p-2 text-xs focus:border-[#2f81f7] outline-none"
                        />
                      </div>

                      <button 
                        onClick={handleSavePages}
                        className="w-full py-1.5 bg-[#238636] hover:bg-[#2ea043] rounded-md text-xs font-bold text-white transition-colors"
                      >
                        Save Configuration
                      </button>

                      <button 
                        onClick={handleTriggerPagesBuild}
                        disabled={pagesBuilding}
                        className="w-full py-1.5 bg-[#21262d] border border-[#30363d] rounded-md text-xs font-bold text-[#c9d1d9] hover:bg-[#30363d] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <RefreshCw size={12} className={pagesBuilding ? "animate-spin" : ""} /> Trigger Deployment Build
                      </button>
                    </div>
                  </div>

                  {/* Build terminal logs column */}
                  <div className="md:col-span-2 bg-[#161b22] border border-[#30363d] rounded-xl p-6 flex flex-col justify-between h-[420px]">
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-[#f0f6fc] flex items-center justify-between">
                        <span>Workflow Build & Deployment Logs</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${pagesConfig.status === "deployed" ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-400"}`}>{pagesConfig.status}</span>
                      </h3>
                      
                      <div className="bg-black border border-[#30363d] rounded-md p-4 h-[300px] overflow-y-auto font-mono text-[10px] text-slate-300 space-y-1">
                        {pageLogs ? (
                          <>
                            <pre className="whitespace-pre-wrap leading-relaxed">{pageLogs}</pre>
                            <div ref={logsBottomRef} />
                          </>
                        ) : (
                          <div className="h-full flex items-center justify-center flex-col text-center text-[#8b949e]">
                            <Terminal size={24} className="mb-2" />
                            <p>Build queue is empty. Click Trigger Build to launch deployment static pipelines.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {pagesConfig.status === "deployed" && (
                      <div className="text-xs bg-emerald-500/5 border border-emerald-500/20 p-2.5 rounded-md flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Check size={14} className="text-emerald-400" />
                          <span className="text-[#8b949e]">Site is live at:</span>
                          <span className="font-semibold text-white">http://localhost:5000/pages/{repo.owner?.username}/{repo.name}</span>
                        </div>
                        <a 
                          href={`http://localhost:5000/pages/${repo.owner?.username}/${repo.name}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#2f81f7] hover:underline flex items-center gap-1 font-semibold"
                        >
                          Visit <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ==========================================
                11. ADVANCED SECURITY TAB
                ========================================== */}
            {activeCategory === "Security" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-[#30363d] pb-4 flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-semibold text-[#f0f6fc] flex items-center gap-2">
                      <Shield size={24} className="text-[#2f81f7]" /> Advanced Security
                    </h1>
                    <p className="text-xs text-[#8b949e]">Run security scanners to identify credentials exposure, dependency exploits, and code vulnerability alerts.</p>
                  </div>
                  <button 
                    onClick={handleTriggerSecurityScan}
                    disabled={scanning}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2f81f7] hover:bg-[#1f6feb] text-xs font-bold text-white rounded-md transition-colors disabled:opacity-50"
                  >
                    {scanning ? "Scanning..." : "Scan Repository"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left checklist column */}
                  <div className="md:col-span-1 bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-4">
                    <h3 className="text-sm font-bold text-[#f0f6fc]">Security Features</h3>
                    <div className="space-y-4">
                      <label className="flex items-start gap-2.5 text-xs cursor-pointer">
                        <input type="checkbox" defaultChecked className="mt-0.5" />
                        <div>
                          <span className="font-bold text-[#f0f6fc] block">Dependency Graph alerts</span>
                          <span className="text-[10px] text-[#8b949e]">Alert on vulnerable npm/pip packages inside manifests.</span>
                        </div>
                      </label>
                      <label className="flex items-start gap-2.5 text-xs cursor-pointer">
                        <input type="checkbox" defaultChecked className="mt-0.5" />
                        <div>
                          <span className="font-bold text-[#f0f6fc] block">Secret Scanning protection</span>
                          <span className="text-[10px] text-[#8b949e]">Block git pushes containing raw API keys, credentials or certs.</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Scanner results column */}
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-sm font-bold text-[#f0f6fc]">Vulnerability Alerts ({securityAlerts.length})</h3>
                    {securityAlerts.length === 0 ? (
                      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8 text-center">
                        <Check size={28} className="text-emerald-400 mx-auto mb-2" />
                        <p className="text-sm text-[#8b949e]">No security alerts found in active branches. Scan complete!</p>
                      </div>
                    ) : (
                      securityAlerts.map(alert => (
                        <div key={alert._id} className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 flex gap-3 items-start">
                          <ShieldX size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#f0f6fc]">{alert.title}</span>
                              <span className="px-1.5 py-0.5 bg-red-500/10 text-[8px] text-red-400 font-bold uppercase rounded">{alert.severity}</span>
                            </div>
                            <p className="text-[11px] text-[#8b949e]">{alert.description}</p>
                            <span className="text-[10px] font-mono text-[#8b949e] block">Location: {alert.filePath} (Line {alert.lineNumber})</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ==========================================
                12. DEPLOY KEYS TAB
                ========================================== */}
            {activeCategory === "DeployKeys" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-[#30363d] pb-4 flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-semibold text-[#f0f6fc]">Deploy Keys</h1>
                    <p className="text-xs text-[#8b949e]">Deploy keys allow external build servers or CI runners to fetch code securely via SSH.</p>
                  </div>
                  {!isAddingKey && (
                    <button 
                      onClick={() => setIsAddingKey(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-xs font-bold text-white rounded-md transition-colors"
                    >
                      <Plus size={14} /> Add Deploy Key
                    </button>
                  )}
                </div>

                {isAddingKey ? (
                  <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-4">
                    <h3 className="text-sm font-bold text-[#f0f6fc]">Add SSH Deploy Key</h3>
                    
                    <div>
                      <label className="text-xs font-semibold text-[#8b949e] block mb-1">Key Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Jenkins CI Runner Server" 
                        value={newKey.title}
                        onChange={(e) => setNewKey({ ...newKey, title: e.target.value })}
                        className="w-full bg-[#010409] border border-[#30363d] rounded-md p-2 text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#8b949e] block mb-1">SSH Key Body</label>
                      <textarea 
                        rows={4}
                        placeholder="Begins with ssh-rsa, ssh-ed25519..." 
                        value={newKey.key}
                        onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
                        className="w-full bg-[#010409] border border-[#30363d] rounded-md p-2 text-xs outline-none font-mono"
                      />
                    </div>

                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={newKey.readOnly}
                        onChange={(e) => setNewKey({ ...newKey, readOnly: e.target.checked })}
                      />
                      Allow write access (Permit pushes from this server key)
                    </label>

                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => setIsAddingKey(false)}
                        className="px-4 py-1.5 bg-[#21262d] border border-[#30363d] text-xs font-bold rounded-md"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleAddDeployKey}
                        className="px-4 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-xs font-bold text-white rounded-md"
                      >
                        Add Key
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {deployKeys.length === 0 ? (
                      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8 text-center">
                        <p className="text-sm text-[#8b949e]">No deploy SSH keys configured.</p>
                      </div>
                    ) : (
                      deployKeys.map(key => (
                        <div key={key._id} className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 flex justify-between items-center">
                          <div>
                            <span className="text-sm font-bold text-[#f0f6fc]">{key.title}</span>
                            <div className="text-[10px] font-mono text-[#8b949e] mt-1 break-all select-all">{key.fingerprint}</div>
                            <span className="text-[10px] bg-[#21262d] border border-[#30363d] px-2 py-0.5 rounded text-[#8b949e] inline-block mt-2">
                              {key.readOnly ? "Read-only" : "Read / Write"}
                            </span>
                          </div>
                          <button 
                            onClick={() => handleDeleteDeployKey(key._id)}
                            className="p-1.5 bg-[#21262d] hover:bg-[#da3633] text-[#8b949e] hover:text-white rounded-md border border-[#30363d] transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ==========================================
                13. SECRETS & VARIABLES TAB
                ========================================== */}
            {activeCategory === "Secrets" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-[#30363d] pb-4">
                  <h1 className="text-2xl font-semibold text-[#f0f6fc]">Secrets and variables</h1>
                  <p className="text-xs text-[#8b949e]">Configure environment secrets (encrypted) or variables (plain text) to inject into active deployment runner containers.</p>
                </div>

                <div className="flex border-b border-[#30363d] gap-4 mb-4">
                  <button 
                    onClick={() => setSecretsSubTab("secrets")}
                    className={`pb-2 text-xs font-bold transition-all ${secretsSubTab === "secrets" ? "border-b-2 border-[#2f81f7] text-[#f0f6fc]" : "text-[#8b949e] hover:text-[#c9d1d9]"}`}
                  >
                    Actions Secrets
                  </button>
                  <button 
                    onClick={() => setSecretsSubTab("variables")}
                    className={`pb-2 text-xs font-bold transition-all ${secretsSubTab === "variables" ? "border-b-2 border-[#2f81f7] text-[#f0f6fc]" : "text-[#8b949e] hover:text-[#c9d1d9]"}`}
                  >
                    Actions Variables
                  </button>
                </div>

                {secretsSubTab === "secrets" ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold text-[#f0f6fc]">Repository Secrets</h3>
                      {!isAddingSecret && (
                        <button 
                          onClick={() => setIsAddingSecret(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-xs font-bold text-white rounded-md"
                        >
                          <Plus size={14} /> Add Secret
                        </button>
                      )}
                    </div>

                    {isAddingSecret && (
                      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
                        <h4 className="text-xs font-bold text-[#f0f6fc]">New Repository Secret</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-semibold text-[#8b949e] block mb-1">Secret Name</label>
                            <input 
                              type="text" 
                              placeholder="e.g. AWS_ACCESS_KEY_ID" 
                              value={secretForm.name}
                              onChange={(e) => setSecretForm({ ...secretForm, name: e.target.value })}
                              className="w-full bg-[#010409] border border-[#30363d] rounded-md p-2 text-xs outline-none uppercase font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-[#8b949e] block mb-1">Value</label>
                            <input 
                              type="password" 
                              placeholder="Secret value body" 
                              value={secretForm.value}
                              onChange={(e) => setSecretForm({ ...secretForm, value: e.target.value })}
                              className="w-full bg-[#010409] border border-[#30363d] rounded-md p-2 text-xs outline-none"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button 
                            onClick={() => setIsAddingSecret(false)}
                            className="px-4 py-1.5 bg-[#21262d] border border-[#30363d] text-xs font-bold rounded-md"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={handleAddSecret}
                            className="px-4 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-xs font-bold text-white rounded-md"
                          >
                            Add Secret
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {secrets.length === 0 ? (
                        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8 text-center">
                          <p className="text-sm text-[#8b949e]">No encrypted secrets found.</p>
                        </div>
                      ) : (
                        secrets.map(sec => (
                          <div key={sec._id} className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 flex justify-between items-center font-mono">
                            <div>
                              <span className="text-xs font-bold text-[#f0f6fc]">{sec.name}</span>
                              <span className="text-[10px] text-[#8b949e] block mt-1">Value encrypted with AES-GCM</span>
                            </div>
                            <button 
                              onClick={() => handleDeleteSecret(sec._id)}
                              className="p-1.5 bg-[#21262d] hover:bg-[#da3633] text-[#8b949e] hover:text-white rounded-md border border-[#30363d] transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold text-[#f0f6fc]">Repository Variables</h3>
                      {!isAddingVar && (
                        <button 
                          onClick={() => setIsAddingVar(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-xs font-bold text-white rounded-md"
                        >
                          <Plus size={14} /> Add Variable
                        </button>
                      )}
                    </div>

                    {isAddingVar && (
                      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
                        <h4 className="text-xs font-bold text-[#f0f6fc]">New Action Variable</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-semibold text-[#8b949e] block mb-1">Variable Name</label>
                            <input 
                              type="text" 
                              placeholder="e.g. DOCKER_BUILD_TAG" 
                              value={varForm.name}
                              onChange={(e) => setVarForm({ ...varForm, name: e.target.value })}
                              className="w-full bg-[#010409] border border-[#30363d] rounded-md p-2 text-xs outline-none uppercase font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-[#8b949e] block mb-1">Value</label>
                            <input 
                              type="text" 
                              placeholder="Variable value plain text" 
                              value={varForm.value}
                              onChange={(e) => setVarForm({ ...varForm, value: e.target.value })}
                              className="w-full bg-[#010409] border border-[#30363d] rounded-md p-2 text-xs outline-none"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button 
                            onClick={() => setIsAddingVar(false)}
                            className="px-4 py-1.5 bg-[#21262d] border border-[#30363d] text-xs font-bold rounded-md"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={handleAddVar}
                            className="px-4 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-xs font-bold text-white rounded-md"
                          >
                            Add Variable
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {variables.length === 0 ? (
                        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8 text-center">
                          <p className="text-sm text-[#8b949e]">No variables configured.</p>
                        </div>
                      ) : (
                        variables.map(varItem => (
                          <div key={varItem._id} className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 flex justify-between items-center font-mono">
                            <div>
                              <span className="text-xs font-bold text-[#f0f6fc]">{varItem.name}</span>
                              <span className="text-[10px] text-[#8b949e] block mt-1">Value: {varItem.value}</span>
                            </div>
                            <button 
                              onClick={() => handleDeleteVar(varItem._id)}
                              className="p-1.5 bg-[#21262d] hover:bg-[#da3633] text-[#8b949e] hover:text-white rounded-md border border-[#30363d] transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
