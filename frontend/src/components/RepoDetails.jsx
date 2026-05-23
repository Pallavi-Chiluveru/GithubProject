import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import API from "../api";
import ProjectsTab from "./ProjectsTab";
import ActionsTab from "./ActionsTab";
import WikiTab from "./WikiTab";
import SecurityTab from "./SecurityTab";
import InsightsTab from "./InsightsTab";
import AgentsTab from "./AgentsTab";
import {
  Book,
  Code,
  MessageSquare,
  GitPullRequest,
  Play,
  Shield,
  BarChart2,
  Settings,
  Star,
  GitBranch,
  File,
  Folder,
  History,
  ChevronDown,
  Globe,
  Lock,
  FileText,
  Activity,
  Terminal,
  Monitor,
  X,
  Search,
  MessageCircle,
  Layout
} from "lucide-react";
import FileViewer from "./FileViewer";
import BranchSelector from "./BranchSelector";
import TopNavbar from "./TopNavbar";
import Sidebar from "./Sidebar";
import DiscussionsView from "./DiscussionsView";
import LabelManager from "./LabelManager";
import { io } from "socket.io-client";
import ForkButton from "./ForkButton";
import ForkBanner from "./ForkBanner";
import SyncForkButton from "./SyncForkButton";
import ForkNetworkGraph from "./ForkNetworkGraph";

const socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:5000", {
  withCredentials: true
});

export default function RepoDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [repo, setRepo] = useState(null);
  const [files, setFiles] = useState([]);
  const [readmeContent, setReadmeContent] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [isCodeDropdownOpen, setIsCodeDropdownOpen] = useState(false);
  const [codeTab, setCodeTab] = useState('local');
  const [cloneTab, setCloneTab] = useState('https');
  const [issueCount, setIssueCount] = useState(0);
  const [prCount, setPrCount] = useState(0);
  const codeDropdownRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [isEditingReadme, setIsEditingReadme] = useState(false);
  const [editBuffer, setEditBuffer] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || 'code');

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const [viewMode, setViewMode] = useState('repo'); // 'repo' or 'file'
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [giteaTree, setGiteaTree] = useState([]);       // real files from Gitea
  const [latestCommit, setLatestCommit] = useState(null); // most recent commit info
  const [currentPath, setCurrentPath] = useState("");    // current folder path for drill-down
  const [giteaFileModal, setGiteaFileModal] = useState(null); // { path, content, sha } or null
  const [isEditingFile, setIsEditingFile] = useState(false);
  const [editFileBuffer, setEditFileBuffer] = useState("");
  const [savingFile, setSavingFile] = useState(false);
  const [ignoreRules, setIgnoreRules] = useState([]);
  const [isStarred, setIsStarred] = useState(false);
  const [starCount, setStarCount] = useState(0);
  const [starLoading, setStarLoading] = useState(false);
  const isEmpty = giteaTree.length === 0 && files.length === 0;

  const parseGitignore = (content) => {
    if (!content) return [];
    return content
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line && !line.startsWith("#")) // Skip empty lines and comments
      .map(line => {
        let clean = line;
        if (clean.startsWith("/")) clean = clean.slice(1);
        if (clean.endsWith("/")) clean = clean.slice(0, -1);
        
        // Escape special regex chars except * and ?
        const regexStr = clean
          .replace(/[-\/\\^$*+?.()|[\]{}]/g, (match) => {
            if (match === '*' || match === '?') return match;
            return '\\' + match;
          })
          .replace(/\*/g, ".*")
          .replace(/\?/g, ".");
        try {
          return new RegExp(`(^|/)${regexStr}(/|$)`, "i");
        } catch (_) {
          return null;
        }
      })
      .filter(Boolean);
  };

  const shouldIgnore = (pathOrName) => {
    if (!pathOrName) return false;
    const lower = pathOrName.toLowerCase();
    // Always hide .gitignore itself
    if (lower === ".gitignore" || lower.endsWith("/.gitignore")) return true;
    
    // Check against ignore rules
    return ignoreRules.some(regex => regex.test(pathOrName));
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (codeDropdownRef.current && !codeDropdownRef.current.contains(event.target)) {
        setIsCodeDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const repoOwner = repo?.owner?.username || "Guest";
  const repoName = repo?.name || "repo";

  const isTextFileHelper = (file) => {
    if (!file) return false;
    const name = file.originalName || "";
    const mime = file.mimeType || "";
    return name.match(/\.(js|jsx|json|css|html|md|txt|py|java|c|cpp|h|ts|tsx)$/i) || mime.startsWith("text/");
  };

  // Build clone URLs — use real Gitea URLs when available, fall back to placeholder
  const GITEA_BASE = import.meta.env.VITE_GITEA_URL || "http://localhost:3000";
  const cloneUrls = {
    https: repo?.cloneUrlHttps || `${GITEA_BASE}/${repoOwner}/${repoName}.git`,
    ssh: repo?.cloneUrlSsh || `git@${repoOwner}:${repoName}.git`,
    cli: `git clone ${repo?.cloneUrlHttps || `${GITEA_BASE}/${repoOwner}/${repoName}.git`}`,
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Could add a small toast notification here in the future
  };

  const fetchRepoAndFiles = async () => {
    try {
      const res = await API.get(`/repo-api/${id}`);
      setRepo(res.data);

      // ── MongoDB-uploaded files (legacy/supplemental) ──
      const filesRes = await API.get(`/file-api/${id}/files`);
      setFiles(filesRes.data);

      // ── Real Gitea file tree ─────────────────────────
      let currentTree = [];
      try {
        const treeRes = await API.get(`/repo-api/${id}/tree`);
        if (treeRes.data?.tree?.length > 0) {
          currentTree = treeRes.data.tree;
          // Only show top-level entries (no slashes in path)
          const topLevel = treeRes.data.tree.filter(e => !e.path.includes("/"));
          setGiteaTree(topLevel);

          // Dynamically check and parse .gitignore from committed tree
          const gitignoreEntry = treeRes.data.tree.find(e => e.path.toLowerCase() === ".gitignore");
          if (gitignoreEntry) {
            const gitignoreRes = await API.get(`/repo-api/${id}/contents`, { params: { path: gitignoreEntry.path } });
            if (gitignoreRes.data?.content) {
              setIgnoreRules(parseGitignore(gitignoreRes.data.content));
            }
          }
        }
      } catch (_) { }

      // Fetch README.md content (prioritize Gitea, fallback to MongoDB)
      let loadedReadme = false;
      try {
        const giteaReadme = currentTree.find(e => e.path.toLowerCase() === "readme.md");
        if (giteaReadme) {
          const readmeRes = await API.get(`/repo-api/${id}/contents`, { params: { path: giteaReadme.path } });
          if (readmeRes.data?.content !== undefined) {
            setReadmeContent(readmeRes.data.content);
            loadedReadme = true;
          }
        }
      } catch (_) {}

      if (!loadedReadme) {
        // Check MongoDB fallback for gitignore rules
        const gitignoreFile = filesRes.data.find(f => f.originalName.toLowerCase() === ".gitignore");
        if (gitignoreFile) {
          try {
            const gitignoreRes = await API.get(`/file-api/content/${gitignoreFile._id}`);
            setIgnoreRules(parseGitignore(gitignoreRes.data.content));
          } catch (_) {}
        }

        const readmeFile = filesRes.data.find(f => f.originalName.toLowerCase() === "readme.md");
        if (readmeFile) {
          try {
            const readmeRes = await API.get(`/file-api/content/${readmeFile._id}`);
            setReadmeContent(readmeRes.data.content);
          } catch (_) {}
        }
      }

      // ── Real Gitea commit log ────────────────────────
      try {
        const commitsRes = await API.get(`/repo-api/${id}/commits?limit=1`);
        if (commitsRes.data?.length > 0) setLatestCommit(commitsRes.data[0]);
      } catch (_) { }

    } catch (err) {
      console.error("Failed to fetch repo details:", err);
    }
  };

  useEffect(() => {
    fetchRepoAndFiles();

    // Socket real-time sync
    socket.emit("join", id);

    socket.on("file_added", (newFile) => {
      setFiles(prev => {
        if (prev.some(f => f._id === newFile._id)) return prev;
        return [...prev, newFile];
      });
    });

    socket.on("file_updated", (updatedFile) => {
      setFiles(prev => prev.map(f => f._id === updatedFile._id ? updatedFile : f));
      if (updatedFile.originalName.toLowerCase() === "readme.md") {
        // Refresh readme content
        API.get(`/file-api/content/${updatedFile._id}`).then(res => setReadmeContent(res.data.content));
      }
    });

    socket.on("file_deleted", ({ fileId }) => {
      setFiles(prev => prev.filter(f => f._id !== fileId));
      if (selectedFile?._id === fileId) {
        setViewMode('repo');
        setSelectedFile(null);
      }
    });

    // ─── Gitea real-time events ────────────────────────────────────────────────────
    socket.on("commit_pushed", ({ branch, commitCount, lastMessage }) => {
      console.log(`[Socket] ${commitCount} commit(s) pushed to ${branch}: ${lastMessage}`);
      // Optionally refresh commit count badge in UI here
    });

    socket.on("branch_created", ({ branch }) => {
      setRepo(prev => prev ? {
        ...prev,
        branches: prev.branches?.includes(branch) ? prev.branches : [...(prev.branches || []), branch],
      } : prev);
    });

    socket.on("branch_deleted", ({ branch }) => {
      setRepo(prev => prev ? {
        ...prev,
        branches: (prev.branches || []).filter(b => b !== branch),
      } : prev);
    });

    // Fetch issue count separately
    API.get(`/issue-api/${id}`)
      .then(res => setIssueCount(Array.isArray(res.data) ? res.data.filter(i => i.status === "open").length : 0))
      .catch(() => { });

    // Fetch PR count separately
    API.get(`/pr-api/${id}`)
      .then(res => setPrCount(Array.isArray(res.data) ? res.data.filter(p => p.status === "open").length : 0))
      .catch(() => { });

    // Fetch star status
    API.get(`/repo-api/${id}/star`)
      .then(res => {
        setIsStarred(res.data.starred);
        setStarCount(res.data.starCount);
      })
      .catch(() => { });

    return () => {
      socket.off("file_added");
      socket.off("file_updated");
      socket.off("file_deleted");
      socket.off("commit_pushed");
      socket.off("branch_created");
      socket.off("branch_deleted");
    };
  }, [id, selectedFile?._id]);



  const handleFileClick = async (file) => {
    setSelectedFile(file);
    setViewMode('file');
  };

  //  Gitea entry click: folder = drill in, file = open content modal 
  const handleGiteaEntryClick = async (entry) => {
    if (entry.type === "tree") {
      // Navigate into folder  re-fetch tree filtered to this path
      setCurrentPath(entry.path);
      try {
        const treeRes = await API.get(`/repo-api/${id}/tree`);
        if (treeRes.data?.tree?.length > 0) {
          const children = treeRes.data.tree.filter(e => {
            const prefix = entry.path + "/";
            return e.path.startsWith(prefix) && !e.path.slice(prefix.length).includes("/");
          });
          setGiteaTree(children.length > 0 ? children : treeRes.data.tree.filter(e => !e.path.includes("/")));
          if (children.length > 0) return;
        }
      } catch (_) {}
    } else {
      // Fetch and display file content
      try {
        const res = await API.get(`/repo-api/${id}/contents`, { params: { path: entry.path } });
        setGiteaFileModal({ path: entry.path, content: res.data.content, sha: res.data.sha });
        setIsEditingFile(false);
        setEditFileBuffer("");
      } catch (err) {
        setGiteaFileModal({ path: entry.path, content: "// Could not load file content.", sha: "" });
        setIsEditingFile(false);
      }
    }
  };

  //  Navigate back to parent folder 
  const handleGiteaGoUp = async () => {
    const parentPath = currentPath.includes("/") ? currentPath.slice(0, currentPath.lastIndexOf("/")) : "";
    setCurrentPath(parentPath);
    try {
      const treeRes = await API.get(`/repo-api/${id}/tree`);
      if (treeRes.data?.tree?.length > 0) {
        if (parentPath === "") {
          setGiteaTree(treeRes.data.tree.filter(e => !e.path.includes("/")));
        } else {
          const prefix = parentPath + "/";
          const children = treeRes.data.tree.filter(e =>
            e.path.startsWith(prefix) && !e.path.slice(prefix.length).includes("/")
          );
          setGiteaTree(children);
        }
      }
    } catch (_) {}
  };

  const handleSaveGiteaFile = async () => {
    if (!giteaFileModal?.sha) return;
    try {
      setSavingFile(true);
      await API.put(`/repo-api/${id}/contents`, {
        path: giteaFileModal.path,
        content: editFileBuffer,
        sha: giteaFileModal.sha,
        message: `Update ${giteaFileModal.path}`,
      });
      // Update modal with new content
      setGiteaFileModal(prev => ({ ...prev, content: editFileBuffer }));
      setIsEditingFile(false);
      
      // Update ignore rules dynamically if they edited .gitignore
      if (giteaFileModal.path.toLowerCase() === ".gitignore") {
        setIgnoreRules(parseGitignore(editFileBuffer));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save file");
    } finally {
      setSavingFile(false);
    }
  };

  const handleSaveReadme = async () => {
    try {
      setSaving(true);
      
      // Try Gitea first
      let currentTree = [];
      try {
        const treeRes = await API.get(`/repo-api/${id}/tree`);
        currentTree = treeRes.data?.tree || [];
      } catch (_) {}
      
      const giteaReadme = currentTree.find(e => e.path.toLowerCase() === "readme.md");
      if (giteaReadme) {
        // Fetch current SHA to prevent stale updates
        const res = await API.get(`/repo-api/${id}/contents`, { params: { path: giteaReadme.path } });
        const sha = res.data.sha;
        
        await API.put(`/repo-api/${id}/contents`, {
          path: giteaReadme.path,
          content: editBuffer,
          sha: sha,
          message: `Update ${giteaReadme.path}`,
        });
        setReadmeContent(editBuffer);
        setIsEditingReadme(false);
        return;
      }

      // Fallback: MongoDB legacy upload
      const readmeFile = files.find(f => f.originalName.toLowerCase() === "readme.md");
      if (!readmeFile) return;

      await API.put(`/file-api/content/${readmeFile._id}`, { content: editBuffer });
      setReadmeContent(editBuffer);
      setIsEditingReadme(false);
      // Also update fileContent if the modal is open
      if (isFileModalOpen && selectedFile?._id === readmeFile._id) {
        setFileContent(editBuffer);
      }
    } catch (err) {
      console.error("Failed to save README:", err);
      alert("Error saving changes");
    } finally {
      setSaving(false);
    }
  };

  const startEditing = () => {
    setEditBuffer(readmeContent || "");
    setIsEditingReadme(true);
  };


  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      await API.post(`/file-api/${id}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const filesRes = await API.get(`/file-api/${id}/files`);
      setFiles(filesRes.data);

      const readmeFile = filesRes.data.find(f => f.originalName.toLowerCase() === "readme.md");
      if (readmeFile) {
        const readmeRes = await API.get(`/file-api/content/${readmeFile._id}`);
        setReadmeContent(readmeRes.data.content);
      }

      // Re-fetch Gitea file tree to show the newly uploaded file instantly in the explorer
      try {
        const treeRes = await API.get(`/repo-api/${id}/tree`);
        if (treeRes.data?.tree?.length > 0) {
          const topLevel = treeRes.data.tree.filter(entry => !entry.path.includes("/"));
          setGiteaTree(topLevel);
        }
      } catch (_) {}

    } catch (err) {
      console.error("Error uploading file:", err);
      alert(err.response?.data?.message || "Failed to upload file");
    } finally {
      setUploading(false);
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

  if (!repo) return (
    <div className="flex h-screen flex-col items-center justify-center bg-[var(--bg-primary)] text-[var(--text-secondary)]">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#2f81f7] border-t-transparent mb-4"></div>
      <p className="text-lg font-bold animate-pulse">Initializing CodeForge Data...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors">
      <TopNavbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} title={repo.name} />
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* REPO HEADER */}
      <header className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)] pt-20">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="flex flex-wrap items-center justify-between gap-6 pb-8">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-4 text-2xl font-bold">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2f81f7] to-[#1f6feb] shadow-lg shadow-[#2f81f7]/20">
                  <Book className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <Link to="/dashboard" className="text-[var(--text-secondary)] hover:text-[#2f81f7] transition-colors font-medium">{repo.owner?.username || "Unknown"}</Link>
                  <span className="text-[var(--border-color)]">/</span>
                  <span className="text-[var(--text-primary)] tracking-tight">{repo.name}</span>
                </div>
                <div className={`flex items-center gap-1 rounded-full border border-[var(--border-color)] bg-[var(--bg-primary)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${!repo.isPrivate ? "text-emerald-500" : "text-purple-500"}`}>
                  {!repo.isPrivate ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                  {!repo.isPrivate ? "Public" : "Private"}
                </div>
              </div>
              {repo.isFork && <ForkBanner forkedFromRepo={repo.forkedFromRepoId} />}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] shadow-sm overflow-hidden">
                <button
                  onClick={async () => {
                    if (starLoading) return;
                    setStarLoading(true);
                    try {
                      const res = await API.post(`/repo-api/${id}/star`);
                      setIsStarred(res.data.starred);
                      setStarCount(res.data.starCount);
                    } catch (err) {
                      console.error("Star toggle failed:", err);
                    } finally {
                      setStarLoading(false);
                    }
                  }}
                  disabled={starLoading}
                  className={`flex items-center gap-1.5 border-r border-[var(--border-color)] px-4 py-2 text-xs font-bold transition-all disabled:opacity-50 ${
                    isStarred
                      ? 'text-[#e3b341] hover:bg-[#e3b341]/10'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                  }`}
                >
                  <Star className={`h-4 w-4 transition-all ${isStarred ? 'fill-[#e3b341] text-[#e3b341]' : ''}`} />
                  {isStarred ? 'Starred' : 'Star'}
                </button>
                <button className="px-3 py-2 text-[11px] font-bold text-[var(--text-secondary)]">{starCount}</button>
              </div>
              
              <ForkButton repoId={repo._id} forkCount={repo.forkCount} />
              
              {repo.isFork && repo.role === "OWNER" && (
                <SyncForkButton repo={repo} onSyncComplete={() => fetchRepoAndFiles()} />
              )}
            </div>
          </div>

          <nav className="flex gap-2 overflow-x-auto text-sm font-bold">
            {[
              { id: 'code', icon: Code, label: 'Code', path: `/repo/${id}` },
              { id: 'issues', icon: MessageSquare, label: 'Issues', count: issueCount, path: `/repo/${id}/issues` },
              { id: 'pulls', icon: GitPullRequest, label: 'Pull requests', count: prCount, path: `/repo/${id}/pulls` },
              { id: 'agents', icon: Terminal, label: 'Agents' },
              { id: 'actions', icon: Play, label: 'Actions' },
              { id: 'projects', icon: Layout, label: 'Projects' },
              { id: 'wiki', icon: Book, label: 'Wiki' },
              { id: 'security', icon: Shield, label: 'Security' },
              { id: 'insights', icon: BarChart2, label: 'Insights' },
              ...(repo?.role === "OWNER" ? [{ id: 'settings', icon: Settings, label: 'Settings', path: `/repo/${id}/settings` }] : [])
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.path) {
                    navigate(tab.path);
                  } else {
                    navigate(`/repo/${id}?tab=${tab.id}`);
                    setActiveTab(tab.id);
                  }
                }}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-4 transition-all ${activeTab === tab.id ? 'border-[#2f81f7] text-[var(--text-primary)] bg-[#2f81f7]/5' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'}`}
              >
                <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-[#2f81f7]' : 'text-[var(--text-secondary)]'}`} />
                {tab.label}
                {tab.count !== undefined && <span className="ml-1 rounded-lg bg-[var(--bg-tertiary)] px-2 py-0.5 text-[10px] text-[var(--text-secondary)]">{tab.count}</span>}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="mx-auto max-w-7xl p-6 md:p-10">
        {viewMode === 'file' && activeTab === 'code' ? (
          <FileViewer
            repo={repo}
            files={files}
            initialFile={selectedFile}
            onClose={() => setViewMode('repo')}
          />
        ) : activeTab === 'forks' ? (
          <div className="max-w-4xl mx-auto">
            <ForkNetworkGraph />
          </div>
        ) : activeTab === 'projects' ? (
          <div className="max-w-7xl mx-auto">
            <ProjectsTab repoId={id} />
          </div>
        ) : activeTab === 'actions' ? (
          <div className="max-w-7xl mx-auto">
            <ActionsTab repoId={id} />
          </div>
        ) : activeTab === 'wiki' ? (
          <div className="max-w-7xl mx-auto">
            <WikiTab repoId={id} />
          </div>
        ) : activeTab === 'security' ? (
          <div className="max-w-7xl mx-auto">
            <SecurityTab repoId={id} />
          </div>
        ) : activeTab === 'insights' ? (
          <div className="max-w-7xl mx-auto">
            <InsightsTab repoId={id} />
          </div>
        ) : activeTab === 'agents' ? (
          <div className="max-w-7xl mx-auto">
            <AgentsTab repoId={id} repo={repo} />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-4">
            {/* FILE EXPLORER */}
            <div className="lg:col-span-3 space-y-6">
              {activeTab === 'code' && (
                <div className="flex items-center justify-between">
                  <BranchSelector currentBranch={repo.defaultBranch || "main"} branches={repo.branches || ["main"]} />
                  <div className="flex gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-secondary)]" />
                      <input
                        type="text"
                        placeholder="Go to file"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] py-2 pl-9 pr-4 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] focus:border-[#2f81f7] focus:outline-none transition-all w-64"
                      />
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                    <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-2 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all disabled:opacity-50">
                      {uploading ? "Uploading..." : "Add file"}
                    </button>
                    <div className="relative" ref={codeDropdownRef}>
                      <button
                        onClick={() => setIsCodeDropdownOpen(!isCodeDropdownOpen)}
                        className="rounded-xl bg-[#238636] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#2ea043] transition-all flex items-center gap-2"
                      >
                        <Code className="h-4 w-4" /> Code <ChevronDown className="h-3 w-3" />
                      </button>

                      {isCodeDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                          {/* Main Tabs */}
                          <div className="flex border-b border-[var(--border-color)]">
                            <button
                              onClick={() => setCodeTab('local')}
                              className={`flex-1 py-3 text-sm font-semibold transition-colors ${codeTab === 'local' ? 'border-b-2 border-[#2f81f7] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                            >
                              Local
                            </button>
                            <button
                              onClick={() => setCodeTab('codespaces')}
                              className={`flex-1 py-3 text-sm font-semibold transition-colors ${codeTab === 'codespaces' ? 'border-b-2 border-[#2f81f7] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                            >
                              Codespaces
                            </button>
                          </div>

                          {codeTab === 'local' ? (
                            <div className="p-4 space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                                  <Terminal className="h-4 w-4 text-[var(--text-secondary)]" />
                                  Clone
                                </div>
                                <div className="h-4 w-4 rounded-full border border-[var(--border-color)] flex items-center justify-center text-[10px] text-[var(--text-secondary)] font-bold cursor-help">?</div>
                              </div>

                              {/* Clone Tabs */}
                              <div>
                                <div className="flex gap-4 border-b border-[var(--border-color)] mb-3">
                                  <button onClick={() => setCloneTab('https')} className={`pb-2 text-xs font-semibold ${cloneTab === 'https' ? 'border-b-2 border-[#f78166] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>HTTPS</button>
                                  <button onClick={() => setCloneTab('ssh')} className={`pb-2 text-xs font-semibold ${cloneTab === 'ssh' ? 'border-b-2 border-[#f78166] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>SSH</button>
                                  <button onClick={() => setCloneTab('cli')} className={`pb-2 text-xs font-semibold ${cloneTab === 'cli' ? 'border-b-2 border-[#f78166] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>GitHub CLI</button>
                                </div>

                                {cloneTab === 'ssh' && (
                                  <div className="mb-3 rounded-md bg-[#fff8c5] p-3 text-xs text-[#7d4e00] border border-[#e8eaed]">
                                    You don't have any public SSH keys in your GitHub account. You can <span className="text-[#0969da] hover:underline cursor-pointer">add a new public key</span>, or try cloning this repository via HTTPS.
                                  </div>
                                )}

                                <div className="flex items-center justify-between rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] p-1.5">
                                  <input
                                    readOnly
                                    value={cloneUrls[cloneTab]}
                                    className="w-full bg-transparent text-xs text-[var(--text-primary)] focus:outline-none px-2 font-mono"
                                  />
                                  <button
                                    onClick={() => copyToClipboard(cloneUrls[cloneTab])}
                                    className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-md transition-all"
                                  >
                                    <FileText className="h-3.5 w-3.5" />
                                  </button>
                                </div>

                                <p className="mt-2 text-[11px] text-slate-500">
                                  {cloneTab === 'https' && "Clone using the web URL."}
                                  {cloneTab === 'ssh' && "Use a password-protected SSH key."}
                                  {cloneTab === 'cli' && <>Work fast with our official CLI. <span className="text-indigo-400 hover:underline cursor-pointer">Learn more</span></>}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="p-6 text-center space-y-4">
                              <h3 className="text-sm font-bold text-white">No codespaces</h3>
                              <p className="text-xs text-slate-400">
                                You don't have any codespaces with this repository checked out
                              </p>
                              <button className="w-full rounded-md bg-[#238636] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#2ea043] transition-all">
                                Create codespace on main
                              </button>
                              <p className="text-[11px] text-indigo-400 hover:underline cursor-pointer">
                                Learn more about codespaces...
                              </p>
                              <div className="pt-4 mt-2 border-t border-slate-800 text-[10px] text-slate-500">
                                Codespace usage for this repository is paid for by <span className="font-bold">{repoOwner}</span>.
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {isEmpty && activeTab === 'code' ? (
                <div className="space-y-6 max-w-4xl mx-auto">
                  {/* Beautiful GitHub-like empty state banner */}
                  <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-8 text-center shadow-xl">
                    <h2 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">This repository is empty.</h2>
                    <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-lg mx-auto leading-relaxed">
                      Get started by cloning this repository locally, adding your project files, and pushing them to Gitea.
                    </p>
                  </div>

                  {/* Simulated README.md block */}
                  <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-xl overflow-hidden animate-in fade-in duration-200">
                    <div className="flex items-center gap-3 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)] px-6 py-4">
                      <FileText className="h-4 w-4 text-[#2f81f7]" />
                      <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">README.md</span>
                    </div>
                    <div className="p-8 text-[var(--text-primary)] font-sans">
                      <h1 className="text-2xl font-extrabold tracking-tight border-b border-[var(--border-color)] pb-3 mb-4">
                        {repoName}
                      </h1>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        This repository is currently empty. To get started, follow the Git commands listed below to initialize your project, configure the Gitea remote, and push your code.
                      </p>
                    </div>
                  </div>

                  {/* Quick Setup instructions card */}
                  <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-lg overflow-hidden animate-in fade-in duration-200">
                    <div className="flex items-center gap-3 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)] px-6 py-4">
                      <Terminal className="h-4 w-4 text-[#2f81f7]" />
                      <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Quick Setup</span>
                      <span className="ml-2 text-xs text-[var(--text-secondary)] hidden sm:inline">— Clone or push to this repository</span>
                    </div>
                    <div className="px-6 py-4 border-b border-[var(--border-color)]">
                      <div className="flex items-center gap-2 mb-3">
                        {['https', 'ssh'].map(tab => (
                          <button key={tab} onClick={() => setCloneTab(tab)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${cloneTab === tab ? 'bg-[#2f81f7] text-white' : 'bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                            {tab.toUpperCase()}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5">
                        <Code className="h-4 w-4 text-[var(--text-secondary)] shrink-0" />
                        <span className="flex-1 font-mono text-xs text-[var(--text-primary)] truncate select-all">
                          {cloneTab === 'ssh' ? cloneUrls.ssh : cloneUrls.https}
                        </span>
                        <button onClick={() => copyToClipboard(cloneTab === 'ssh' ? cloneUrls.ssh : cloneUrls.https)} title="Copy URL"
                          className="text-[var(--text-secondary)] hover:text-[#2f81f7] transition-colors p-1 rounded-lg hover:bg-[var(--bg-tertiary)]">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                        </button>
                      </div>
                    </div>
                    <div className="px-6 py-5 space-y-6">
                      <div>
                        <p className="text-xs font-bold text-[var(--text-primary)] mb-2">Create a new repository on the command line</p>
                        <pre className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-xs font-mono text-[#7ee787] overflow-x-auto leading-6 select-all whitespace-pre">{`echo "# ${repoName}" >> README.md\ngit init\ngit add README.md\ngit commit -m "first commit"\ngit branch -M main\ngit remote add origin ${cloneUrls.https}\ngit push -u origin main`}</pre>
                        <button onClick={() => copyToClipboard(`echo "# ${repoName}" >> README.md\ngit init\ngit add README.md\ngit commit -m "first commit"\ngit branch -M main\ngit remote add origin ${cloneUrls.https}\ngit push -u origin main`)}
                          className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-secondary)] hover:text-[#2f81f7] transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                          Copy commands
                        </button>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[var(--text-primary)] mb-2">Push an existing repository from the command line</p>
                        <pre className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-xs font-mono text-[#7ee787] overflow-x-auto leading-6 select-all whitespace-pre">{`git remote add origin ${cloneUrls.https}\ngit branch -M main\ngit push -u origin main`}</pre>
                        <button onClick={() => copyToClipboard(`git remote add origin ${cloneUrls.https}\ngit branch -M main\ngit push -u origin main`)}
                          className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-secondary)] hover:text-[#2f81f7] transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                          Copy commands
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'code' ? (
                <>
                  {/* REPO CONTENT LIST */}
                  <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden shadow-2xl">
                {/* LATEST COMMIT BAR */}
                <div className="flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-tertiary)] px-6 py-4 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] overflow-hidden">
                      <img src={`https://ui-avatars.com/api/?name=${latestCommit?.author || repo.owner?.username || "Guest"}&background=random`} alt="User" />
                    </div>
                    <div>
                      <span className="font-bold text-[var(--text-primary)] hover:text-[#2f81f7] cursor-pointer">
                        {latestCommit?.author || repo.owner?.username || "Unknown"}
                      </span>
                      <span className="text-[var(--text-secondary)] ml-2">
                        {latestCommit?.message || "Initial project commit"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-[var(--text-secondary)]">
                    {latestCommit?.shortSha && (
                      <a href={latestCommit.htmlUrl} target="_blank" rel="noopener noreferrer"
                        className="font-mono text-xs bg-[var(--bg-primary)] border border-[var(--border-color)] px-2 py-1 rounded-lg text-[#2f81f7] hover:underline">
                        {latestCommit.shortSha}
                      </a>
                    )}
                    <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest">
                      <History className="h-4 w-4" />
                      <span>{latestCommit ? new Date(latestCommit.date).toLocaleDateString() : "—"}</span>
                    </div>
                  </div>
                </div>

                {/* FILE ROWS — Gitea tree first, fall back to MongoDB files */}
                <div className="bg-transparent divide-y divide-[var(--border-color)]">
                  {/* Breadcrumb / back button when inside a folder */}
                  {currentPath !== "" && giteaTree.length > 0 && (
                    <div
                      onClick={handleGiteaGoUp}
                      className="flex items-center gap-3 px-6 py-3.5 hover:bg-[var(--bg-tertiary)] cursor-pointer transition-all text-sm text-[var(--text-secondary)] hover:text-[#2f81f7] font-medium"
                    >
                      <span className="text-lg leading-none">&#8592;</span>
                      <span>..</span>
                      <span className="ml-2 text-xs opacity-60">{currentPath}</span>
                    </div>
                  )}
                  {giteaTree.length > 0 ? (
                    // ── Show real Gitea files ──────────────────────────────────
                    giteaTree
                      .filter(e => e.path.toLowerCase().includes(searchQuery.toLowerCase()))
                      .filter(e => !shouldIgnore(e.path))
                      .sort((a, b) => {
                        // folders first
                        if (a.type === "tree" && b.type !== "tree") return -1;
                        if (a.type !== "tree" && b.type === "tree") return 1;
                        return a.path.localeCompare(b.path);
                      })
                      .map(entry => (
                        <div key={entry.sha} onClick={() => handleGiteaEntryClick(entry)} className="flex items-center px-6 py-3.5 hover:bg-[var(--bg-tertiary)] group cursor-pointer transition-all">
                          <div className="flex flex-1 items-center gap-4">
                            {entry.type === "tree"
                              ? <Folder className="h-4 w-4 text-[#2f81f7]" />
                              : <File className="h-4 w-4 text-[var(--text-secondary)]" />
                            }
                            <span className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[#2f81f7]">
                              {entry.path.includes("/") ? entry.path.slice(entry.path.lastIndexOf("/") + 1) : entry.path}
                            </span>
                          </div>
                          <span className="flex-1 text-xs text-[var(--text-secondary)]">
                            {latestCommit?.message || ""}
                          </span>
                          <span className="text-[11px] text-[var(--text-secondary)] font-medium">
                            {latestCommit ? new Date(latestCommit.date).toLocaleDateString() : ""}
                          </span>
                        </div>
                      ))
                  ) : files.filter(f => f.originalName.toLowerCase().includes(searchQuery.toLowerCase()) && !shouldIgnore(f.originalName)).length === 0 ? (
                    <div className="px-6 py-8 text-center text-sm text-[var(--text-secondary)]">No files found.</div>
                  ) : (
                    // ── Fall back: MongoDB uploaded files ─────────────────────
                    files
                      .filter(f => f.originalName.toLowerCase().includes(searchQuery.toLowerCase()))
                      .filter(f => !shouldIgnore(f.originalName))
                      .map(file => (
                        <div
                          key={file._id}
                          onClick={() => handleFileClick(file)}
                          className="flex items-center px-6 py-3.5 hover:bg-[var(--bg-tertiary)] group cursor-pointer transition-all"
                        >
                          <div className="flex flex-1 items-center gap-4">
                            <File className="h-4 w-4 text-[var(--text-secondary)]" />
                            <span className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[#2f81f7]">{file.originalName}</span>
                          </div>
                          <span className="flex-1 text-xs text-[var(--text-secondary)]">{file.storageProvider === "cloudinary" ? "Cloud storage" : "Local storage"}</span>
                          <span className="text-[11px] text-[var(--text-secondary)] font-medium">
                            {new Date(file.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* README PREVIEW / EDITOR */}
              {readmeContent !== null && (
                <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] mt-8 shadow-2xl overflow-hidden transition-all">
                  <div className="flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-tertiary)] px-6 py-3">
                    <div className="flex items-center gap-3 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                      <FileText className="h-4 w-4 text-[#2f81f7]" />
                      README.md
                    </div>
                    {!isEditingReadme ? (
                      <button
                        onClick={startEditing}
                        className="flex items-center gap-2 rounded-lg bg-[var(--bg-primary)] px-3 py-1.5 text-[10px] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all border border-[var(--border-color)]"
                      >
                        <Settings className="h-3 w-3" /> EDIT
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsEditingReadme(false)}
                          className="px-3 py-1.5 text-[10px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                        >
                          CANCEL
                        </button>
                        <button
                          onClick={handleSaveReadme}
                          disabled={saving}
                          className="rounded-lg bg-[#2f81f7] px-3 py-1.5 text-[10px] font-bold text-white shadow-lg shadow-[#2f81f7]/20 hover:bg-[#1f6feb] transition-all disabled:opacity-50"
                        >
                          {saving ? "SAVING..." : "SAVE CHANGES"}
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="p-0">
                    {isEditingReadme ? (
                      <textarea
                        value={editBuffer}
                        onChange={(e) => setEditBuffer(e.target.value)}
                        className="w-full min-h-[300px] bg-[var(--bg-primary)] p-8 text-sm text-[var(--text-primary)] focus:outline-none font-mono leading-relaxed"
                        placeholder="Write your README content here..."
                      />
                    ) : (
                      <div className="p-10 text-[var(--text-primary)] whitespace-pre-wrap font-sans text-sm leading-relaxed">
                        {readmeContent || <span className="text-[var(--text-secondary)] italic">No content. Click Edit to add documentation.</span>}
                      </div>
                    )}
                  </div>
                </div>
              )}
                </>
              ) : null}

              {/* DISCUSSIONS VIEW */}
              {activeTab === 'discussions' && (
                <DiscussionsView repoId={id} />
              )}
            </div>

            {/* SIDEBAR */}
            <div className="space-y-8">
            </div>
          </div>
        )}
      </main>

      {/* GITEA FILE CONTENT MODAL */}
      {giteaFileModal && (() => {
        const fileLines = giteaFileModal.content.split(/\r?\n/);
        const fileExtension = giteaFileModal.path.split('.').pop().toUpperCase() || 'FILE';
        const fileCharCount = giteaFileModal.content.length;
        
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={() => { setGiteaFileModal(null); setIsEditingFile(false); }}>
            <div className="relative w-full max-w-4xl max-h-[85vh] rounded-2xl border border-slate-800 bg-[#0d1117] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-[#21262d] bg-[#161b22] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#2f81f7]/10 to-[#1f6feb]/20 border border-[#2f81f7]/30">
                    <FileText className="h-4 w-4 text-[#2f81f7]" />
                  </div>
                  <span className="text-sm font-mono font-bold text-white select-all">{giteaFileModal.path}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  {!isEditingFile ? (
                    <button
                      onClick={() => { setEditFileBuffer(giteaFileModal.content); setIsEditingFile(true); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-primary)] border border-[#30363d] text-xs font-bold text-[var(--text-secondary)] hover:text-white hover:border-[#2f81f7] hover:bg-[#21262d] transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-0.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                      Edit File
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditingFile(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border border-[#30363d] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-white hover:bg-[#21262d] transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveGiteaFile}
                        disabled={savingFile}
                        className="px-4 py-1.5 rounded-lg bg-[#238636] text-xs font-bold text-white hover:bg-[#2ea043] transition-all disabled:opacity-50 flex items-center gap-1"
                      >
                        {savingFile ? (
                          <>
                            <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                            Saving...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                            Save
                          </>
                        )}
                      </button>
                    </>
                  )}
                  <button onClick={() => { setGiteaFileModal(null); setIsEditingFile(false); }} className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800 ml-1">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Modal Body */}
              <div className="overflow-auto flex-1 bg-[#090d16] min-h-[400px] flex flex-col">
                {isEditingFile ? (
                  <textarea
                    value={editFileBuffer}
                    onChange={e => setEditFileBuffer(e.target.value)}
                    className="w-full flex-1 min-h-[400px] bg-[#090d16] p-6 text-xs font-mono text-[#c9d1d9] leading-relaxed focus:outline-none resize-none"
                    spellCheck={false}
                  />
                ) : (
                  <div className="flex font-mono text-xs overflow-auto flex-1 select-text p-6 bg-[#090d16]">
                    {/* Line numbers column */}
                    <div className="text-right text-[#484f58] pr-4 select-none border-r border-[#21262d] w-12 shrink-0">
                      {fileLines.map((_, i) => (
                        <div key={i} className="h-5.5 leading-5.5">{i + 1}</div>
                      ))}
                    </div>
                    {/* Code lines column */}
                    <div className="pl-4 overflow-x-auto w-full whitespace-pre">
                      {fileLines.map((line, i) => (
                        <div key={i} className="h-5.5 leading-5.5 hover:bg-[#161b22]/50 transition-colors w-full px-1 rounded-sm text-[#e6edf3]">{line || "\n"}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer / Status Bar */}
              <div className="flex items-center justify-between bg-[#161b22] px-6 py-2.5 border-t border-[#21262d] text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none font-mono">
                <span>{fileExtension} File</span>
                <span>{fileLines.length} Lines • {fileCharCount} Characters</span>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}