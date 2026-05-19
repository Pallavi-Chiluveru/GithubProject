import { useEffect, useState } from "react";
import API from "../api";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  GitPullRequest, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  GitBranch,
  ChevronDown,
  Code,
  FileText,
  Activity,
  History,
  Info,
  ShieldCheck,
  Send,
  GitCommit,
  Settings
} from "lucide-react";
import DiffViewer from "./DiffViewer";

export default function CreatePullRequest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [repo, setRepo] = useState(null);
  const [baseRepo, setBaseRepo] = useState(null);
  const [headRepo, setHeadRepo] = useState(null);
  const [networkRepos, setNetworkRepos] = useState([]);
  const [baseBranches, setBaseBranches] = useState([]);
  const [headBranches, setHeadBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [baseBranch, setBaseBranch] = useState("");
  const [headBranch, setHeadBranch] = useState("");
  const [comparison, setComparison] = useState(null);
  const [comparing, setComparing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  const getOwnerName = (repoData) => repoData?.owner?.username || "Unknown";
  const getRepoLabel = (repoData) => repoData ? `${getOwnerName(repoData)}/${repoData.name}` : "";

  const fetchBranchNames = async (repoData) => {
    if (!repoData?._id) return ["main"];

    let branches = repoData.branches || ["main"];
    try {
      const branchRes = await API.get(`/branch-api/${repoData._id}/names`);
      if (Array.isArray(branchRes.data) && branchRes.data.length > 0) {
        branches = branchRes.data;
      }
    } catch (branchErr) {
      console.warn("[Branches] branch API unavailable, using repository metadata:", branchErr.message);
    }

    return branches.length > 0 ? branches : ["main"];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const repoRes = await API.get(`/repo-api/${id}`);
        const repoData = repoRes.data;
        setRepo(repoData);

        let netRepos = [repoData];
        try {
          const netRes = await API.get(`/repo-api/${repoData._id}/network`);
          if (netRes.data?.network && Array.isArray(netRes.data.network)) {
            netRepos = netRes.data.network;
          }
        } catch (netErr) {
          console.warn("[Network] Could not fetch fork network:", netErr.message);
        }
        setNetworkRepos(netRepos);

        // Try fetching real branch list from Gitea-backed endpoint
        const upstreamCandidate = repoData.isFork
          ? (netRepos.find(r => r._id === repoData.forkedFromRepoId || r._id === repoData.parentRepoId) || repoData)
          : repoData;
        const sourceRepo = repoData;

        setBaseRepo(upstreamCandidate);
        setHeadRepo(sourceRepo);

        const [upstreamBranches, sourceBranches] = await Promise.all([
          fetchBranchNames(upstreamCandidate),
          fetchBranchNames(sourceRepo),
        ]);

        setBaseBranches(upstreamBranches);
        setHeadBranches(sourceBranches);
        setBaseBranch(upstreamCandidate?.defaultBranch || upstreamBranches[0] || "main");
        setHeadBranch(sourceRepo?.defaultBranch || sourceBranches[0] || "main");
      } catch (err) {
        console.error("Failed to fetch repo:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleBaseRepoChange = async (selectedId) => {
    const selectedRepo = networkRepos.find(r => r._id === selectedId);
    if (!selectedRepo) return;
    setBaseRepo(selectedRepo);
    const branches = await fetchBranchNames(selectedRepo);
    setBaseBranches(branches);
    setBaseBranch(selectedRepo.defaultBranch || branches[0] || "main");
  };

  const handleHeadRepoChange = async (selectedId) => {
    const selectedRepo = networkRepos.find(r => r._id === selectedId);
    if (!selectedRepo) return;
    setHeadRepo(selectedRepo);
    const branches = await fetchBranchNames(selectedRepo);
    setHeadBranches(branches);
    setHeadBranch(selectedRepo.defaultBranch || branches[0] || "main");
  };

  const isCrossRepo = !!(baseRepo?._id && headRepo?._id && baseRepo._id !== headRepo._id);
  const hasValidComparison = !!(baseRepo?._id && headRepo?._id && baseBranch && headBranch && (isCrossRepo || baseBranch !== headBranch));

  useEffect(() => {
    if (hasValidComparison) {
      handleCompare();
    } else {
      setComparison(null);
    }
  }, [baseRepo?._id, headRepo?._id, baseBranch, headBranch]);

  const handleCompare = async () => {
    try {
      setComparing(true);
      const params = new URLSearchParams({ base: baseBranch, head: headBranch });
      const compareUrl = isCrossRepo
        ? `/pr-api/fork-compare?baseRepoId=${baseRepo._id}&headRepoId=${headRepo._id}&${params.toString()}`
        : `/pr-api/compare/${headRepo._id}?${params.toString()}`;
      const res = await API.get(compareUrl);
      setComparison(res.data);
      if (res.data.commits && res.data.commits.length > 0) {
        setTitle(res.data.commits[0].message);
      }
    } catch (err) {
      console.error("Comparison failed:", err);
    } finally {
      setComparing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !baseBranch || !headBranch || !baseRepo?._id || !headRepo?._id) return;

    try {
      setSubmitting(true);
      const res = await API.post(`/pr-api/${baseRepo._id}/create`, {
        title,
        description,
        sourceBranch: headBranch,
        targetBranch: baseBranch,
        isDraft,
        headRepoId: headRepo._id,
      });
      navigate(`/repo/${baseRepo._id}/pull/${res.data.pr._id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create PR");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0d1117]">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#f78166] border-t-transparent"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#010409] text-[#c9d1d9] pb-20 selection:bg-[#2f81f7]/30">
      <div className="mx-auto max-w-6xl px-4 py-8">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-[#8b949e] mb-8 animate-in fade-in slide-in-from-left-2 duration-300">
           <Link to="/dashboard" className="hover:text-[#2f81f7] transition-colors">Dashboard</Link>
           <span className="opacity-40">/</span>
           <Link to={`/repo/${id}`} className="hover:text-[#2f81f7] transition-colors font-bold text-[#f0f6fc]">{repo?.name}</Link>
           <span className="opacity-40">/</span>
           <span className="text-[#f78166] font-medium">New Pull Request</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-6 mb-10">
           <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#3fb950] to-[#238636] flex items-center justify-center shadow-lg shadow-emerald-900/20 transform hover:-rotate-6 transition-transform">
                 <GitPullRequest className="h-8 w-8 text-white" />
              </div>
              <div>
                 <h1 className="text-3xl font-extrabold text-[#f0f6fc] tracking-tight">Compare changes</h1>
                 <p className="text-sm text-[#8b949e] mt-1">Review the differences between branches before creating a pull request.</p>
              </div>
           </div>
        </div>

        {/* Comparison Bar */}
        <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-6 mb-10 flex items-center gap-6 flex-wrap shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#2f81f7] to-transparent opacity-30" />
          
          <div className="flex items-center gap-3 bg-[#161b22] border border-[#30363d] px-4 py-2.5 rounded-xl transition-all hover:border-[#2f81f7]/50">
            <span className="text-[10px] text-[#8b949e] font-black uppercase tracking-widest">base:</span>
            <select
              value={baseRepo?._id || ""}
              onChange={(e) => handleBaseRepoChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#f0f6fc] outline-none cursor-pointer border-r border-[#30363d] pr-3 mr-1"
            >
              {networkRepos.map(r => (
                <option key={r._id} value={r._id} className="bg-[#0d1117]">
                  {getRepoLabel(r)}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2">
               <GitBranch size={14} className="text-[#2f81f7]" />
               <select 
                 value={baseBranch} 
                 onChange={(e) => setBaseBranch(e.target.value)}
                 className="bg-transparent text-sm font-bold text-[#f0f6fc] outline-none cursor-pointer appearance-none"
               >
                 {baseBranches.map(b => <option key={b} value={b} className="bg-[#0d1117]">{b}</option>)}
               </select>
               <ChevronDown size={12} className="text-[#8b949e]" />
            </div>
          </div>

          <div className="h-10 w-10 rounded-full bg-[#30363d]/30 flex items-center justify-center text-[#8b949e] animate-in fade-in zoom-in duration-500">
             <ArrowRight size={20} />
          </div>

          <div className="flex items-center gap-3 bg-[#161b22] border border-[#30363d] px-4 py-2.5 rounded-xl transition-all hover:border-[#2f81f7]/50">
            <span className="text-[10px] text-[#8b949e] font-black uppercase tracking-widest">compare:</span>
            <select
              value={headRepo?._id || ""}
              onChange={(e) => handleHeadRepoChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#f0f6fc] outline-none cursor-pointer border-r border-[#30363d] pr-3 mr-1"
            >
              {networkRepos.map(r => (
                <option key={r._id} value={r._id} className="bg-[#0d1117]">
                  {getRepoLabel(r)}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2">
               <GitBranch size={14} className="text-[#f78166]" />
               <select 
                 value={headBranch} 
                 onChange={(e) => setHeadBranch(e.target.value)}
                 className="bg-transparent text-sm font-bold text-[#f0f6fc] outline-none cursor-pointer appearance-none"
               >
                 {headBranches.map(b => <option key={b} value={b} className="bg-[#0d1117]">{b}</option>)}
               </select>
               <ChevronDown size={12} className="text-[#8b949e]" />
            </div>
          </div>

          {comparison && comparison.canMerge && (
            <div className="flex items-center gap-3 ml-auto bg-[#3fb950]/10 px-4 py-2 rounded-xl border border-[#3fb950]/30 animate-in fade-in slide-in-from-right-4 duration-500">
              <CheckCircle2 className="h-5 w-5 text-[#3fb950] animate-pulse" />
              <div>
                 <p className="text-xs font-bold text-[#f0f6fc]">Able to merge.</p>
                 <p className="text-[10px] text-[#8b949e]">These branches can be automatically merged.</p>
              </div>
            </div>
          )}
          
          {comparison && !comparison.canMerge && (
            <div className="flex items-center gap-3 ml-auto bg-[#da3633]/10 px-4 py-2 rounded-xl border border-[#da3633]/30 animate-in fade-in slide-in-from-right-4 duration-500">
              <AlertCircle className="h-5 w-5 text-[#f85149]" />
              <div>
                 <p className="text-xs font-bold text-[#f85149]">Can’t automatically merge.</p>
                 <p className="text-[10px] text-[#8b949e]">Don’t worry, you can still create the pull request.</p>
              </div>
            </div>
          )}
        </div>

        {!hasValidComparison ? (
          <div className="bg-[#0d1117] border border-[#30363d] border-dashed rounded-3xl p-24 text-center animate-in fade-in duration-700">
             <div className="h-24 w-24 rounded-full bg-[#161b22] flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Info className="h-12 w-12 text-[#30363d]" />
             </div>
             <h3 className="text-2xl font-black text-[#f0f6fc] tracking-tight">There isn’t anything to compare.</h3>
             <p className="text-[#8b949e] mt-4 max-w-md mx-auto text-sm leading-relaxed italic">"You’ll need to use two different branch names to get a valid comparison and start a new pull request."</p>
          </div>
        ) : comparing ? (
          <div className="flex flex-col items-center justify-center py-32 animate-in fade-in duration-300">
             <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#2f81f7] border-t-transparent shadow-lg shadow-blue-900/20 mb-6"></div>
             <p className="text-sm font-bold text-[#8b949e] animate-pulse uppercase tracking-widest">Analyzing differences...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in slide-in-from-bottom-8 duration-700">
            {/* Left Column: Form & Content */}
            <div className="lg:col-span-8 space-y-10">
              
              {/* Main PR Form */}
              <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl overflow-hidden shadow-2xl focus-within:border-[#2f81f7] transition-all duration-300">
                 <div className="bg-[#161b22] px-6 py-4 border-b border-[#30363d] flex items-center gap-3">
                    <Send className="h-5 w-5 text-[#2f81f7]" />
                    <span className="text-sm font-black text-[#f0f6fc] uppercase tracking-widest">Open a pull request</span>
                 </div>
                 <div className="p-6 space-y-6">
                    <input 
                      type="text" 
                      placeholder="Title" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-[#010409] border border-[#30363d] rounded-xl px-4 py-3 text-sm text-[#f0f6fc] focus:border-[#2f81f7] focus:ring-1 focus:ring-[#2f81f7] outline-none font-bold placeholder-[#8b949e]"
                    />
                    <textarea 
                      placeholder="Add a detailed description... (Markdown supported)" 
                      rows={8}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-[#010409] border border-[#30363d] rounded-xl px-4 py-3 text-sm text-[#f0f6fc] focus:border-[#2f81f7] focus:ring-1 focus:ring-[#2f81f7] outline-none resize-none font-sans leading-relaxed"
                    />
                    <div className="flex flex-wrap items-center justify-between pt-4 border-t border-[#30363d]/50 gap-4">
                       <div className="flex items-center gap-6">
                          <label className="flex items-center gap-3 cursor-pointer group">
                             <div className={`w-12 h-6 rounded-full p-1 transition-all duration-500 ${isDraft ? "bg-[#8957e5] shadow-lg shadow-purple-900/30" : "bg-[#30363d]"}`}>
                                <div className={`w-4 h-4 bg-white rounded-full transition-all duration-500 transform ${isDraft ? "translate-x-6 rotate-12" : ""}`} />
                             </div>
                             <input type="checkbox" className="hidden" checked={isDraft} onChange={(e) => setIsDraft(e.target.checked)} />
                             <span className="text-xs font-black uppercase tracking-widest text-[#8b949e] group-hover:text-[#f0f6fc] transition-all">Create as Draft</span>
                          </label>
                       </div>
                       <button 
                        onClick={handleSubmit}
                        disabled={submitting || !title}
                        className={`px-10 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-2xl disabled:opacity-50 active:scale-95 ${isDraft ? "bg-[#30363d] hover:bg-[#3c444d] text-[#c9d1d9]" : "bg-[#238636] hover:bg-[#2ea043] text-white shadow-emerald-900/40"}`}
                       >
                         {submitting ? "Creating..." : isDraft ? "Create Draft PR" : "Create Pull Request"}
                       </button>
                    </div>
                 </div>
              </div>

              {/* Commits Preview */}
              {comparison?.commits?.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-[11px] font-black text-[#8b949e] uppercase tracking-widest flex items-center gap-2 ml-2">
                    <History className="h-4 w-4" /> {comparison.commits.length} commits will be added
                  </h3>
                  <div className="border border-[#30363d] rounded-2xl divide-y divide-[#30363d] overflow-hidden shadow-xl">
                    {comparison.commits.map((commit, idx) => (
                      <div key={commit.sha || commit._id || idx} className="flex items-center justify-between bg-[#0d1117] px-6 py-4 hover:bg-[#161b22] transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="h-9 w-9 rounded-xl bg-[#21262d] flex items-center justify-center text-[#8b949e] group-hover:text-[#2f81f7] transition-all">
                             <GitCommit size={18} />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-[#f0f6fc] group-hover:text-[#2f81f7] transition-all">{commit.message}</span>
                            <div className="flex items-center gap-2 mt-1">
                               <img src={`https://ui-avatars.com/api/?name=${commit.authorName || commit.author || "U"}&background=random`} className="h-4 w-4 rounded-full border border-[#30363d]" />
                               <span className="text-[10px] text-[#8b949e] font-bold">{commit.authorName || commit.author || "Unknown"}</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-[#8b949e] bg-[#161b22] px-2 py-1 rounded border border-[#30363d]">{commit.shortSha || commit.sha?.slice(0, 7) || commit._id?.slice(-7)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Diff Preview Placeholder or real Diff */}
              <div className="space-y-4">
                 <h3 className="text-[11px] font-black text-[#8b949e] uppercase tracking-widest flex items-center gap-2 ml-2">
                    <FileText className="h-4 w-4" /> Changes preview
                 </h3>
                 <div className="space-y-4">
                    {comparison?.files?.slice(0, 5).map((file, idx) => (
                       <DiffViewer 
                         key={idx}
                         fileName={file.filename || file.path}
                         diffText={file.patch || file.diff || "No patch available."}
                         comments={[]}
                         onAddComment={() => {}}
                       />
                    ))}
                    {(!comparison?.files || comparison.files.length === 0) && (
                       <div className="p-12 bg-[#0d1117] border border-dashed border-[#30363d] rounded-2xl text-center">
                          <Code className="h-10 w-10 text-[#30363d] mx-auto mb-4" />
                          <p className="text-xs text-[#8b949e] italic">No file changes detected to preview.</p>
                       </div>
                    )}
                 </div>
              </div>
            </div>

            {/* Right Column: Metadata & Sidebar */}
            <div className="lg:col-span-4 space-y-8">
               <div className="sticky top-8 space-y-8">
                  
                  <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-6 shadow-2xl">
                     <h4 className="text-[10px] font-black text-[#8b949e] uppercase tracking-widest mb-6 flex items-center justify-between">
                        Configuration <Activity size={12} />
                     </h4>
                     
                     <div className="space-y-6">
                        <div className="group">
                           <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-[#c9d1d9] group-hover:text-[#2f81f7] transition-all cursor-default">Reviewers</span>
                              <Settings size={14} className="text-[#8b949e] cursor-pointer hover:text-[#f0f6fc]" />
                           </div>
                           <p className="text-[10px] text-[#8b949e] italic leading-relaxed">No reviewers suggested yet. You can assign them after creating the PR.</p>
                        </div>

                        <div className="group">
                           <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-[#c9d1d9] group-hover:text-[#2f81f7] transition-all cursor-default">Assignees</span>
                              <Settings size={14} className="text-[#8b949e] cursor-pointer hover:text-[#f0f6fc]" />
                           </div>
                           <p className="text-[10px] text-[#8b949e] italic leading-relaxed">Assign yourself or others to this task.</p>
                        </div>

                        <div className="group">
                           <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-[#c9d1d9] group-hover:text-[#2f81f7] transition-all cursor-default">Labels</span>
                              <Settings size={14} className="text-[#8b949e] cursor-pointer hover:text-[#f0f6fc]" />
                           </div>
                           <div className="flex flex-wrap gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-[#2f81f7]/10 text-[#2f81f7] text-[9px] font-black uppercase border border-[#2f81f7]/20">enhancement</span>
                              <span className="px-2 py-0.5 rounded-md bg-[#3fb950]/10 text-[#3fb950] text-[9px] font-black uppercase border border-[#3fb950]/20">ready</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-2 opacity-10">
                        <ShieldCheck size={60} />
                     </div>
                     <h4 className="text-[10px] font-black text-[#8b949e] uppercase tracking-widest mb-4">Merge Safety</h4>
                     <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs text-[#3fb950] font-bold">
                           <CheckCircle2 size={14} /> Branch is up to date
                        </div>
                        <div className="flex items-center gap-2 text-[#8b949e] text-[10px]">
                           <div className="h-1 w-1 rounded-full bg-[#8b949e]" /> No conflicts detected
                        </div>
                        <div className="flex items-center gap-2 text-[#8b949e] text-[10px]">
                           <div className="h-1 w-1 rounded-full bg-[#8b949e]" /> CI checks passed
                        </div>
                     </div>
                  </div>

               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
