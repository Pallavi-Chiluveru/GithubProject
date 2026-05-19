import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { GitBranch, Info, AlertCircle, RefreshCw, ChevronDown, Check } from "lucide-react";
import API from "../api";
import { useNotifications } from "../components/NotificationProvider";

export default function CreateForkPage() {
  const { repoId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useNotifications();

  const [repo, setRepo] = useState(null);
  const [loadingRepo, setLoadingRepo] = useState(true);
  const [creatingFork, setCreatingFork] = useState(false);
  const [forkStatus, setForkStatus] = useState("");

  const [owners, setOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [isOwnerDropdownOpen, setIsOwnerDropdownOpen] = useState(false);

  const [repoName, setRepoName] = useState("");
  const [description, setDescription] = useState("");
  const [copyMainBranchOnly, setCopyMainBranchOnly] = useState(true);
  const [error, setError] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchRepoAndOwners = async () => {
      try {
        setLoadingRepo(true);
        // Fetch repo details
        const repoRes = await API.get(`/repo-api/${repoId}`);
        setRepo(repoRes.data);
        setRepoName(repoRes.data.name);
        setDescription(repoRes.data.description || "");

        // Build owner options: starting with the user themselves
        const ownerOptions = [
          {
            id: currentUser._id,
            username: currentUser.username,
            type: "USER",
            avatar: `https://ui-avatars.com/api/?name=${currentUser.username}&background=random`
          }
        ];

        // Fetch organizations for the dropdown
        try {
          const orgRes = await API.get("/org-api/my-orgs");
          if (Array.isArray(orgRes.data)) {
            orgRes.data.forEach(org => {
              ownerOptions.push({
                id: org._id,
                username: org.name,
                type: "ORGANIZATION",
                avatar: org.logo || `https://ui-avatars.com/api/?name=${org.name}&background=random`
              });
            });
          }
        } catch (orgErr) {
          console.error("Failed to fetch orgs:", orgErr);
        }

        setOwners(ownerOptions);
        setSelectedOwner(ownerOptions[0]);
      } catch (err) {
        console.error("Error loading repository details:", err);
        setError("Failed to load repository details. Please verify that Gitea is active and running.");
      } finally {
        setLoadingRepo(false);
      }
    };

    fetchRepoAndOwners();
  }, [repoId]);

  const handleCreateFork = async (e) => {
    e.preventDefault();
    if (!repoName.trim()) {
      setError("Repository name is required.");
      return;
    }

    setCreatingFork(true);
    setForkStatus("Contacting Gitea server...");
    setError("");

    try {
      addToast({
        type: "REPO_CREATED",
        message: `Creating fork "${repoName}"...`
      });

      // We wait for Gitea to clone and set up the fork
      setForkStatus("Forking repository in Gitea (this may take a few seconds)...");
      const res = await API.post(`/repo-api/${repoId}/fork`, {
        repoName: repoName.trim(),
        description: description.trim(),
        copyMainBranchOnly,
        ownerId: selectedOwner.id,
        ownerType: selectedOwner.type
      });

      setForkStatus("Syncing fork details in database...");
      addToast({
        type: "REPO_CREATED",
        message: `Successfully forked repository! 🎉`
      });

      // Redirect to the newly created fork page
      navigate(`/repo/${res.data.repo._id}`);
    } catch (err) {
      console.error("Forking failed:", err);
      const msg = err.response?.data?.message || err.response?.data?.error || "Connection error. Please make sure the backend is active.";
      setError(msg);
      addToast({
        type: "BRANCH_DELETED",
        message: `Fork creation failed: ${msg}`
      });
    } finally {
      setCreatingFork(false);
    }
  };

  if (loadingRepo) {
    return (
      <div className="min-h-screen bg-[#030712] text-slate-200 flex flex-col items-center justify-center p-6">
        <RefreshCw className="h-10 w-10 animate-spin text-[#2f81f7] mb-4" />
        <p className="text-sm text-slate-400">Loading repository details...</p>
      </div>
    );
  }

  if (error && !repo) {
    return (
      <div className="min-h-screen bg-[#030712] text-slate-200 flex flex-col items-center justify-center p-6 text-center">
        <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 text-red-500">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold mb-2">Error Loading Repository</h2>
        <p className="text-sm text-slate-400 max-w-md mb-6">{error}</p>
        <Link to="/dashboard" className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white hover:bg-slate-800 transition-all">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 pb-20 selection:bg-[#2f81f7]/30">
      <div className="mx-auto max-w-4xl px-6 pt-12">
        <header className="mb-10 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2f81f7] to-[#1f6feb] shadow-xl shadow-blue-500/15 mb-4">
            <GitBranch className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Create a new fork</h1>
          <p className="mt-3 text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A fork is a copy of a repository. Forking a repository allows you to freely experiment with changes without affecting the original project.
          </p>
        </header>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/5 p-4 text-red-400 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Fork creation failed:</span> {error}
            </div>
          </div>
        )}

        <form onSubmit={handleCreateFork} className="space-y-8">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              {/* Owner selection */}
              <div className="space-y-2 relative">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Owner</label>
                <button
                  type="button"
                  onClick={() => setIsOwnerDropdownOpen(!isOwnerDropdownOpen)}
                  disabled={creatingFork}
                  className="w-full flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-200 hover:border-slate-700 transition-all disabled:opacity-50"
                >
                  {selectedOwner && (
                    <div className="flex items-center gap-2">
                      <img src={selectedOwner.avatar} alt="Owner" className="h-5 w-5 rounded-full shrink-0" />
                      <span className="font-semibold text-white">{selectedOwner.username}</span>
                    </div>
                  )}
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </button>

                {isOwnerDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {owners.map(owner => (
                      <button
                        key={owner.id}
                        type="button"
                        onClick={() => {
                          setSelectedOwner(owner);
                          setIsOwnerDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-900/60 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <img src={owner.avatar} alt="Owner" className="h-5 w-5 rounded-full shrink-0" />
                          <span className="text-xs font-semibold text-white">{owner.username}</span>
                        </div>
                        {selectedOwner?.id === owner.id && <Check className="h-4 w-4 text-[#2f81f7]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Slash */}
              <div className="hidden md:flex justify-center text-2xl font-light text-slate-600 pb-2">/</div>

              {/* Repository Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Repository name</label>
                <input
                  type="text"
                  required
                  disabled={creatingFork}
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  placeholder="name-of-fork"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-white focus:border-[#2f81f7] focus:outline-none focus:ring-1 focus:ring-[#2f81f7] transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-3 leading-relaxed flex items-start gap-1.5">
              <Info className="h-3.5 w-3.5 mt-0.5 text-slate-500 shrink-0" />
              By default, forks are named the same as their upstream repository. You can customize the name if you wish.
            </p>

            {/* Description */}
            <div className="space-y-2 mt-6">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex justify-between">
                Description <span className="text-[10px] font-normal text-slate-500">optional</span>
              </label>
              <textarea
                rows="3"
                disabled={creatingFork}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Repository description..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-[#2f81f7] focus:outline-none focus:ring-1 focus:ring-[#2f81f7] transition-all resize-none disabled:opacity-50"
              />
            </div>

            {/* Branch Copy Selector */}
            <div className="mt-8 border-t border-slate-800 pt-6">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  disabled={creatingFork}
                  checked={copyMainBranchOnly}
                  onChange={(e) => setCopyMainBranchOnly(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-800 text-[#2f81f7] focus:ring-[#2f81f7] focus:ring-offset-slate-950 cursor-pointer"
                />
                <div>
                  <p className="text-sm font-bold text-white">Copy the {repo?.defaultBranch || "main"} branch only</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Minimizes history weight. If unchecked, Gitea will sync all branches (e.g. staging, development) to your fork.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-800 pt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={creatingFork}
              className="px-5 py-3 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:bg-slate-900 transition-all disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={creatingFork}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#238636] hover:bg-[#2ea043] text-white px-8 py-3 text-xs font-bold shadow-lg shadow-green-950/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
            >
              {creatingFork ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Creating Fork...</span>
                </>
              ) : (
                <span>Create fork</span>
              )}
            </button>
          </div>

          {creatingFork && (
            <div className="flex flex-col items-center justify-center p-6 bg-slate-900/10 border border-slate-800/50 rounded-2xl animate-pulse">
              <RefreshCw className="h-6 w-6 animate-spin text-[#2f81f7] mb-2" />
              <p className="text-xs text-slate-400 text-center font-medium">{forkStatus}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
