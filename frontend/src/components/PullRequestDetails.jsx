import { useEffect, useState } from "react";
import API from "../api";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  GitPullRequest, 
  MessageSquare, 
  GitCommit, 
  FileCode, 
  CheckCircle2, 
  Clock, 
  GitMerge, 
  XCircle,
  MoreHorizontal,
  ChevronDown,
  ArrowRight,
  GitBranch,
  ShieldCheck,
  AlertCircle,
  Settings,
  UserPlus,
  Eye,
  CheckCircle,
  Activity,
  History,
  Lock,
  Unlock,
  Trash2,
  Plus
} from "lucide-react";
import DiffViewer from "./DiffViewer";
import PullRequestTimeline from "./PullRequestTimeline";

export default function PullRequestDetails() {
  const { id, prId } = useParams();
  const navigate = useNavigate();
  const [pr, setPr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("conversation");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [merging, setMerging] = useState(false);
  const [mergeMenuOpen, setMergeMenuOpen] = useState(false);
  const [diffView, setDiffView] = useState("unified");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchPR = async () => {
    try {
      const res = await API.get(`/pr-api/detail/${prId}`);
      setPr(res.data);
    } catch (err) {
      console.error("Failed to fetch PR details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPR();
  }, [prId]);

  const handleAddComment = async () => {
    if (!comment) return;
    try {
      setSubmitting(true);
      await API.post(`/pr-api/${prId}/comments`, { comment });
      setComment("");
      fetchPR();
    } catch (err) {
      alert("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddInlineComment = async (fileName, lineNumber, comment) => {
    try {
      await API.post(`/pr-api/${prId}/comments`, { fileName, lineNumber, comment });
      fetchPR();
    } catch (err) {
      alert("Failed to add inline comment");
    }
  };

  const handleMerge = async (method = "merge") => {
    setMergeMenuOpen(false);
    if (!window.confirm(`Are you sure you want to merge via ${method}?`)) return;
    try {
      setMerging(true);
      await API.post(`/pr-api/merge/${prId}`, { mergeMethod: method });
      fetchPR();
    } catch (err) {
      alert(err.response?.data?.message || "Merge failed");
    } finally {
      setMerging(false);
    }
  };

  const handleClose = async () => {
    if (!window.confirm("Are you sure you want to close this PR?")) return;
    try {
      await API.post(`/pr-api/close/${prId}`);
      fetchPR();
    } catch (err) {
      alert("Failed to close PR");
    }
  };

  const handleReject = async () => {
    const message = prompt("Add a rejection reason:");
    if (message === null) return;
    try {
      await API.post(`/pr-api/reject/${prId}`, { message });
      fetchPR();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject PR");
    }
  };

  const handleReview = async (type) => {
    const message = prompt(`Add a message for your ${type}:`);
    if (message === null) return;
    try {
      await API.post(`/pr-api/review/${prId}`, { reviewType: type, message });
      fetchPR();
    } catch (err) {
      alert("Review failed");
    }
  };

  const [showReviewerSelect, setShowReviewerSelect] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);

  const fetchAvailableUsers = async () => {
    try {
      const res = await API.get(`/repo-api/collaborators/${id}`);
      setAvailableUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignReviewer = async (userId) => {
    try {
      const currentReviewers = pr.reviewers?.map(r => r._id) || [];
      const newReviewers = currentReviewers.includes(userId)
        ? currentReviewers.filter(id => id !== userId)
        : [...currentReviewers, userId];
      
      await API.post(`/pr-api/${prId}/reviewers`, { reviewerIds: newReviewers });
      fetchPR();
    } catch (err) {
      alert("Failed to update reviewers");
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0d1117]">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#f78166] border-t-transparent"></div>
    </div>
  );

  if (!pr) return <div className="text-center p-20 text-[#8b949e]">PR not found.</div>;

  const isAuthor = pr.createdBy?._id === user.id;
  const hasApprovals = pr.reviews?.some(r => r.reviewType === "approve");
  const canMerge = pr.role === "OWNER";
  const canReview = pr.role === "OWNER" || pr.role === "MAINTAINER";
  const canClose = pr.role === "OWNER" || pr.role === "MAINTAINER" || isAuthor;
  const changedFiles = pr.files || [];
  const additions = changedFiles.reduce((sum, file) => sum + (file.additions || 0), 0);
  const deletions = changedFiles.reduce((sum, file) => sum + (file.deletions || 0), 0);

  return (
    <div className="min-h-screen bg-[#010409] text-[#c9d1d9] pb-20 selection:bg-[#2f81f7]/30">
      <div className="mx-auto max-w-7xl px-4 py-8">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-[#8b949e] mb-6 animate-in fade-in slide-in-from-left-2 duration-300">
           <Link to="/dashboard" className="hover:text-[#2f81f7] transition-colors">Dashboard</Link>
           <span>/</span>
           <Link to={`/repo/${id}`} className="hover:text-[#2f81f7] transition-colors font-bold text-[#f0f6fc]">{pr.repoId?.name}</Link>
           <span>/</span>
           <span>Pull Request #{prId.slice(-4)}</span>
        </div>

        {/* Header */}
        <div className="mb-8 group">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold text-[#f0f6fc] tracking-tight group-hover:text-[#2f81f7] transition-colors duration-500">
                   {pr.title} 
                   <span className="text-[#30363d] ml-2 font-mono text-2xl font-light tracking-widest">#{prId.slice(-4)}</span>
                </h1>
             </div>
             <div className="flex items-center gap-2">
                <button onClick={() => setActiveTab("commits")} title="View commits" className="p-2 hover:bg-[#30363d] rounded-lg transition-all text-[#8b949e] hover:text-[#f0f6fc]"><History size={18} /></button>
                <button onClick={() => navigate(`/repo/${id}/settings`)} title="Repository settings" className="p-2 hover:bg-[#30363d] rounded-lg transition-all text-[#8b949e] hover:text-[#f0f6fc]"><Settings size={18} /></button>
             </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg transition-all duration-300 ${
              pr.status === "open" ? "bg-[#238636] text-white shadow-emerald-900/20" : 
              pr.status === "merged" ? "bg-[#8957e5] text-white shadow-purple-900/20" : 
              "bg-[#da3633] text-white shadow-red-900/20"
            }`}>
              {pr.status === "open" ? <GitPullRequest className="h-4 w-4 animate-pulse" /> : pr.status === "merged" ? <GitMerge className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {pr.status.charAt(0).toUpperCase() + pr.status.slice(1)}
            </div>
            <div className="text-[#8b949e] text-sm flex items-center gap-2 bg-[#161b22] px-3 py-1.5 rounded-lg border border-[#30363d]">
              <img src={pr.createdBy?.profileImageUrl || `https://ui-avatars.com/api/?name=${pr.createdBy?.username}&background=random`} className="h-5 w-5 rounded-full border border-[#30363d]" />
              <span className="font-bold text-[#f0f6fc] hover:text-[#2f81f7] transition-colors cursor-pointer">{pr.createdBy?.username}</span> 
              <span>wants to merge</span>
              <span className="bg-[#21262d] px-2 py-0.5 rounded text-[#2f81f7] font-mono text-xs border border-[#30363d]">
                {pr.headRepoId?.owner?.username ? `${pr.headRepoId.owner.username}:` : ""}{pr.sourceBranch}
              </span>
              <span>into</span>
              <span className="bg-[#21262d] px-2 py-0.5 rounded text-[#2f81f7] font-mono text-xs border border-[#30363d]">
                {pr.baseRepoId?.owner?.username ? `${pr.baseRepoId.owner.username}:` : ""}{pr.targetBranch}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center border-b border-[#30363d] mb-10 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <button 
            onClick={() => setActiveTab("conversation")}
            className={`px-6 py-4 text-sm font-bold transition-all relative flex items-center gap-2 ${activeTab === "conversation" ? "text-[#f0f6fc]" : "text-[#8b949e] hover:text-[#f0f6fc]"}`}
          >
            <MessageSquare className="h-4 w-4" /> 
            Conversation 
            <span className="bg-[#30363d] px-2 py-0.5 rounded-full text-[10px] ml-1">{pr.comments?.length || 0}</span>
            {activeTab === "conversation" && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#f78166] rounded-t-full shadow-[0_-4px_12px_#f78166]" />}
          </button>
          <button 
            onClick={() => setActiveTab("commits")}
            className={`px-6 py-4 text-sm font-bold transition-all relative flex items-center gap-2 ${activeTab === "commits" ? "text-[#f0f6fc]" : "text-[#8b949e] hover:text-[#f0f6fc]"}`}
          >
            <GitCommit className="h-4 w-4" /> 
            Commits 
            <span className="bg-[#30363d] px-2 py-0.5 rounded-full text-[10px] ml-1">{pr.commits?.length || 0}</span>
            {activeTab === "commits" && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#f78166] rounded-t-full shadow-[0_-4px_12px_#f78166]" />}
          </button>
          <button 
            onClick={() => setActiveTab("files")}
            className={`px-6 py-4 text-sm font-bold transition-all relative flex items-center gap-2 ${activeTab === "files" ? "text-[#f0f6fc]" : "text-[#8b949e] hover:text-[#f0f6fc]"}`}
          >
            <FileCode className="h-4 w-4" /> 
            Files changed 
            <span className="bg-[#30363d] px-2 py-0.5 rounded-full text-[10px] ml-1">{
              pr.files?.length || [...new Set(pr.commits?.flatMap(c => c.files?.map(f => f.path) || []) || [])].length
            }</span>
            {activeTab === "files" && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#f78166] rounded-t-full shadow-[0_-4px_12px_#f78166]" />}
          </button>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-8 animate-in fade-in zoom-in-95 duration-500">
            
            {activeTab === "conversation" && (
              <>
                {/* PR Description Card */}
                <div className="border border-[#30363d] rounded-2xl overflow-hidden bg-[#0d1117] shadow-xl group hover:border-[#444c56] transition-all duration-300">
                  <div className="bg-[#161b22] px-6 py-3 border-b border-[#30363d] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={pr.createdBy?.profileImageUrl || `https://ui-avatars.com/api/?name=${pr.createdBy?.username}&background=random`} className="h-8 w-8 rounded-full border border-[#30363d] shadow-inner" />
                      <div>
                         <span className="font-bold text-sm text-[#f0f6fc]">{pr.createdBy?.username}</span>
                         <span className="text-[10px] text-[#8b949e] ml-2 font-mono uppercase tracking-widest">{new Date(pr.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button className="p-1.5 hover:bg-[#30363d] rounded text-[#8b949e] hover:text-[#f0f6fc]"><Activity size={14} /></button>
                       <button className="p-1.5 hover:bg-[#30363d] rounded text-[#8b949e] hover:text-[#f0f6fc]"><MoreHorizontal size={14} /></button>
                    </div>
                  </div>
                  <div className="p-6 text-[#c9d1d9] leading-relaxed whitespace-pre-wrap selection:bg-[#2f81f7]/50">
                    {pr.description || <span className="italic opacity-50">No description provided.</span>}
                  </div>
                </div>

                {/* Timeline Section */}
                <div className="relative pl-8 border-l border-[#30363d] ml-4 space-y-6">
                   <div className="absolute -left-[1px] top-0 h-4 w-[1px] bg-gradient-to-b from-[#010409] to-[#30363d]" />
                   <PullRequestTimeline 
                      pr={pr} 
                      commits={pr.commits || []} 
                      reviews={pr.reviews || []} 
                      comments={pr.comments || []} 
                   />
                </div>

                {/* Merge Action Box */}
                {pr.status === "open" && (
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#238636] to-[#2f81f7] rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative border border-[#30363d] rounded-2xl overflow-hidden bg-[#0d1117] shadow-2xl p-6">
                      <div className="flex items-start gap-6">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 ${pr.hasConflicts ? 'bg-[#da3633] shadow-red-900/40' : 'bg-[#238636] shadow-emerald-900/40'}`}>
                          {pr.hasConflicts ? <AlertCircle className="h-6 w-6 text-white" /> : <GitMerge className="h-6 w-6 text-white animate-pulse" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                             <h4 className="text-xl font-bold text-[#f0f6fc]">
                                {pr.hasConflicts ? "This branch has conflicts that must be resolved" : "This pull request is ready to be merged"}
                             </h4>
                             {!pr.hasConflicts && <span className="text-[10px] font-bold uppercase tracking-widest text-[#3fb950] bg-[#3fb950]/10 px-2 py-1 rounded border border-[#3fb950]/30 flex items-center gap-1"><ShieldCheck size={12} /> Auto-mergeable</span>}
                          </div>
                          <p className="text-[#8b949e] text-sm mb-6 leading-relaxed">
                             {pr.hasConflicts 
                                ? `The following files have changes that conflict with the base branch: ${pr.conflictingFiles.join(', ')}. Use the command line to resolve these conflicts.`
                                : "Merging will automatically integrate all commits from the source branch into the target branch without conflicts."
                             }
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-4">
                            {canMerge && !pr.hasConflicts ? (
                              <div className="relative group">
                                <div className="flex rounded-xl overflow-hidden shadow-2xl">
                                  <button 
                                    onClick={() => handleMerge("merge")}
                                    disabled={merging}
                                    className="bg-[#238636] hover:bg-[#2ea043] text-white px-6 py-2.5 text-sm font-bold flex items-center gap-2 border-r border-[#1e6a2b] transition-all active:scale-95"
                                  >
                                    {merging ? <Activity className="animate-spin h-4 w-4" /> : <GitMerge size={16} />}
                                    Merge pull request
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setMergeMenuOpen(prev => !prev)}
                                    className="bg-[#238636] hover:bg-[#2ea043] text-white px-3 py-2.5 transition-colors"
                                  >
                                    <ChevronDown className="h-4 w-4" />
                                  </button>
                                </div>
                                {mergeMenuOpen && (
                                  <div className="absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-[#30363d] bg-[#0d1117] shadow-2xl">
                                    {[
                                      ["merge", "Create a merge commit"],
                                      ["squash", "Squash and merge"],
                                      ["rebase", "Rebase and merge"],
                                    ].map(([method, label]) => (
                                      <button
                                        key={method}
                                        type="button"
                                        onClick={() => handleMerge(method)}
                                        disabled={merging}
                                        className="block w-full px-4 py-3 text-left text-xs font-bold text-[#c9d1d9] hover:bg-[#21262d] hover:text-[#f0f6fc] disabled:opacity-50"
                                      >
                                        {label}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : !pr.hasConflicts && (
                              <div className="bg-[#161b22] border border-[#30363d] px-4 py-2.5 rounded-xl text-sm font-medium text-[#8b949e] flex items-center gap-2">
                                 <Clock size={16} /> Waiting for owner approval
                              </div>
                            )}
                            
                            {canClose && (
                              <button onClick={handleClose} className="bg-transparent hover:bg-[#da3633]/10 text-[#f85149] px-6 py-2.5 rounded-xl border border-[#30363d] hover:border-[#da3633] text-sm font-bold transition-all flex items-center gap-2 active:scale-95">
                                <XCircle size={16} /> Close pull request
                              </button>
                            )}

                            {canReview && (
                               <div className="flex gap-2">
                                  <button onClick={() => handleReview("approve")} className="bg-[#161b22] hover:bg-[#238636]/20 text-[#3fb950] px-5 py-2.5 rounded-xl border border-[#30363d] hover:border-[#3fb950] text-sm font-bold transition-all flex items-center gap-2">
                                     <CheckCircle size={16} /> Approve
                                  </button>
                                  <button onClick={handleReject} className="bg-[#161b22] hover:bg-[#da3633]/20 text-[#f85149] px-5 py-2.5 rounded-xl border border-[#30363d] hover:border-[#da3633] text-sm font-bold transition-all flex items-center gap-2">
                                     <XCircle size={16} /> Reject
                                  </button>
                                  <button onClick={() => handleReview("request_changes")} className="bg-[#161b22] hover:bg-[#da3633]/20 text-[#f85149] px-5 py-2.5 rounded-xl border border-[#30363d] hover:border-[#da3633] text-sm font-bold transition-all flex items-center gap-2">
                                     <AlertCircle size={16} /> Request Changes
                                  </button>
                               </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Comment Editor */}
                <div className="border border-[#30363d] rounded-2xl overflow-hidden bg-[#0d1117] shadow-xl focus-within:border-[#2f81f7] transition-all duration-300">
                  <div className="bg-[#161b22] px-6 py-3 border-b border-[#30363d] flex items-center gap-4">
                    <span className="text-sm font-bold text-[#f0f6fc] flex items-center gap-2">
                       <MessageSquare size={16} className="text-[#2f81f7]" /> Leave a comment
                    </span>
                  </div>
                  <div className="p-6 space-y-4">
                    <textarea 
                      placeholder="Write your comment here... (Markdown supported)" 
                      rows={6}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full bg-[#010409] border border-[#30363d] rounded-xl px-4 py-3 text-sm text-[#f0f6fc] focus:border-[#2f81f7] focus:ring-1 focus:ring-[#2f81f7] outline-none resize-none font-sans leading-relaxed"
                    />
                    <div className="flex items-center justify-between pt-2">
                       <div className="flex items-center gap-4 text-[#8b949e]">
                          <button type="button" onClick={() => setActiveTab("files")} title="Preview changed files" className="hover:text-[#f0f6fc] transition-colors"><Eye size={18} /></button>
                          <button type="button" onClick={() => setComment(prev => `${prev}${prev ? "\n" : ""}- `)} title="Insert list item" className="hover:text-[#f0f6fc] transition-colors"><Plus size={18} /></button>
                       </div>
                       <button 
                         onClick={handleAddComment}
                         disabled={submitting || !comment}
                         className="bg-[#238636] hover:bg-[#2ea043] text-white px-8 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 transition-all shadow-lg shadow-emerald-900/30 flex items-center gap-2 active:scale-95"
                       >
                         {submitting ? <Activity className="animate-spin h-4 w-4" /> : <MessageSquare size={16} />}
                         Comment
                       </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "commits" && (
              <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 mb-2 text-[#8b949e] text-sm">
                   <History size={16} /> Commits in this pull request
                </div>
                <div className="border border-[#30363d] rounded-2xl overflow-hidden divide-y divide-[#30363d] shadow-2xl">
                  {pr.commits?.map((commit, idx) => (
                    <div key={commit.sha || commit._id || idx} className="bg-[#0d1117] px-6 py-4 flex items-center justify-between hover:bg-[#161b22] transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-[#21262d] flex items-center justify-center text-[#8b949e] group-hover:text-[#2f81f7] group-hover:bg-[#2f81f7]/10 transition-all">
                           <GitCommit size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#f0f6fc] group-hover:text-[#2f81f7] transition-colors">{commit.message}</p>
                          <div className="flex items-center gap-2 text-xs text-[#8b949e] mt-1">
                             <img src={`https://ui-avatars.com/api/?name=${commit.authorName || commit.author || "U"}&background=random`} className="h-4 w-4 rounded-full" />
                             <span className="font-medium text-[#c9d1d9]">{commit.authorName || commit.author || "Unknown"}</span>
                             <span>committed on {new Date(commit.createdAt || commit.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="text-[11px] font-mono bg-[#161b22] px-3 py-1.5 rounded-lg border border-[#30363d] text-[#2f81f7] font-bold tracking-wider group-hover:border-[#2f81f7]/50 transition-all">
                            {commit.shortSha || commit.sha?.slice(0, 7) || commit._id?.slice(-7)}
                         </span>
                         <button className="p-2 hover:bg-[#30363d] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-[#8b949e]"><ArrowRight size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "files" && (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-4">
                   <div className="text-[#8b949e] text-sm flex items-center gap-2">
                      <FileCode size={18} />
                      Showing <span className="text-[#f0f6fc] font-bold">{changedFiles.length} changed {changedFiles.length === 1 ? "file" : "files"}</span> with <span className="text-[#3fb950] font-bold">{additions} additions</span> and <span className="text-[#f85149] font-bold">{deletions} deletions</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <button onClick={() => setDiffView("unified")} className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all ${diffView === "unified" ? "bg-[#161b22] border-[#30363d] text-[#c9d1d9]" : "bg-transparent border-transparent text-[#8b949e] hover:text-[#f0f6fc]"}`}>Unified</button>
                      <button onClick={() => setDiffView("split")} className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all ${diffView === "split" ? "bg-[#161b22] border-[#30363d] text-[#c9d1d9]" : "bg-transparent border-transparent text-[#8b949e] hover:text-[#f0f6fc]"}`}>Split</button>
                   </div>
                </div>
                
                {(() => {
                  const uniqueFiles = pr.files?.length
                    ? pr.files
                    : Array.from(new Map((pr.commits?.flatMap(c => c.files || []) || []).map(f => [f.path, f])).values());
                  
                  return uniqueFiles.length > 0 ? (
                    uniqueFiles.map((file, idx) => (
                      <DiffViewer 
                        key={idx}
                        fileName={file.filename || file.path || "source_file.js"} 
                        diffText={file.patch || file.diff || "No changes detected in this file."} 
                        comments={pr.comments || []}
                        onAddComment={handleAddInlineComment}
                        viewMode={diffView}
                      />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-32 bg-[#0d1117] border border-dashed border-[#30363d] rounded-3xl opacity-60">
                      <FileCode size={48} className="mb-4 text-[#30363d]" />
                      <p className="text-[#8b949e] text-sm italic">No file differences to display.</p>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Right Sidebar - Sticky */}
          <div className="lg:col-span-3 space-y-8">
            <div className="sticky top-8 space-y-8">
               
               {/* Reviewers Section */}
               <div className="relative group">
                 <h4 className="text-[11px] font-bold text-[#8b949e] uppercase tracking-widest mb-4 flex items-center justify-between">
                   Reviewers 
                   <button 
                     onClick={() => {
                       if (!showReviewerSelect) fetchAvailableUsers();
                       setShowReviewerSelect(!showReviewerSelect);
                     }}
                     className="p-1.5 hover:bg-[#30363d] rounded-lg transition-all text-[#8b949e] hover:text-[#f0f6fc]"
                   >
                     <Settings size={14} />
                   </button>
                 </h4>
                 
                 {showReviewerSelect && (
                   <div className="absolute right-0 top-full mt-2 w-72 bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl z-50 p-3 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-xl bg-opacity-90">
                     <div className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest px-2 mb-3">Assign Reviewers</div>
                     <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                        {availableUsers.map(u => (
                           <button
                             key={u._id}
                             onClick={() => handleAssignReviewer(u._id)}
                             className="w-full text-left p-2.5 hover:bg-[#2f81f7] rounded-xl flex items-center gap-3 group transition-all"
                           >
                             <img src={u.profileImageUrl || `https://ui-avatars.com/api/?name=${u.username}&background=random`} className="h-7 w-7 rounded-full border border-[#30363d]" />
                             <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-bold text-[#f0f6fc] group-hover:text-white truncate">{u.username}</p>
                                <p className="text-[10px] text-[#8b949e] group-hover:text-white/70 truncate">{u.email}</p>
                             </div>
                             {pr.reviewers?.some(r => r._id === u._id) && <CheckCircle size={16} className="text-[#3fb950] group-hover:text-white" />}
                           </button>
                        ))}
                     </div>
                   </div>
                 )}

                 <div className="space-y-3">
                   {pr.reviewers?.length > 0 ? (
                     pr.reviewers.map(r => {
                        const review = pr.reviews?.find(rev => rev.reviewer?._id === r._id);
                        return (
                          <div key={r._id} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                               <div className="relative">
                                  <img src={r.profileImageUrl || `https://ui-avatars.com/api/?name=${r.username}&background=random`} className="h-7 w-7 rounded-full border border-[#30363d]" />
                                  <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-[#010409] ${review ? 'bg-[#3fb950]' : 'bg-[#8b949e]'}`} />
                               </div>
                               <span className="text-sm font-medium text-[#c9d1d9] group-hover:text-[#f0f6fc] transition-colors">{r.username}</span>
                            </div>
                            {review?.reviewType === 'approve' && (
                               <div className="flex items-center gap-1.5 text-[#3fb950] bg-[#3fb950]/10 px-2 py-0.5 rounded text-[10px] font-bold">
                                  <CheckCircle size={10} /> Approved
                               </div>
                            )}
                          </div>
                        );
                     })
                   ) : (
                     <div className="text-xs text-[#8b949e] flex items-center gap-2 italic py-2 border border-dashed border-[#30363d] rounded-lg justify-center">
                        <UserPlus size={14} /> No reviewers assigned
                     </div>
                   )}
                 </div>
               </div>

               {/* Assignees Section */}
               <div>
                 <h4 className="text-[11px] font-bold text-[#8b949e] uppercase tracking-widest mb-4 flex items-center justify-between">
                   Assignees 
                   <button className="p-1.5 hover:bg-[#30363d] rounded-lg transition-all text-[#8b949e] hover:text-[#f0f6fc]"><Settings size={14} /></button>
                 </h4>
                 <div className="text-xs text-[#8b949e] flex items-center gap-2 italic py-2 border border-dashed border-[#30363d] rounded-lg justify-center">
                    <UserPlus size={14} /> No one assigned
                 </div>
               </div>

               {/* Labels Section */}
               <div>
                 <h4 className="text-[11px] font-bold text-[#8b949e] uppercase tracking-widest mb-4 flex items-center justify-between">
                   Labels 
                   <button className="p-1.5 hover:bg-[#30363d] rounded-lg transition-all text-[#8b949e] hover:text-[#f0f6fc]"><Settings size={14} /></button>
                 </h4>
                 <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#d73a4a]/20 text-[#ff4b5c] text-[10px] font-bold border border-[#d73a4a]/30 shadow-sm shadow-red-900/10 transition-transform hover:scale-105 cursor-pointer">bug</span>
                    <span className="px-3 py-1 rounded-full bg-[#2f81f7]/20 text-[#58a6ff] text-[10px] font-bold border border-[#2f81f7]/30 shadow-sm shadow-blue-900/10 transition-transform hover:scale-105 cursor-pointer">enhancement</span>
                    <span className="px-3 py-1 rounded-full bg-[#238636]/20 text-[#3fb950] text-[10px] font-bold border border-[#238636]/30 shadow-sm shadow-green-900/10 transition-transform hover:scale-105 cursor-pointer">feature</span>
                 </div>
               </div>

               {/* Security & Checks Section */}
               <div className="pt-8 border-t border-[#30363d]">
                  <h4 className="text-[11px] font-bold text-[#8b949e] uppercase tracking-widest mb-4">Repository Health</h4>
                  <div className="space-y-4">
                     <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-[#3fb950] font-bold">
                           <ShieldCheck size={16} /> CI / CD Pipeline
                        </div>
                        <span className="text-[#3fb950] font-mono">Passed</span>
                     </div>
                     <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-[#f0f6fc] font-bold">
                           <Lock size={16} className="text-[#8b949e]" /> Branch Protection
                        </div>
                        <span className="text-[#3fb950] font-mono">Active</span>
                     </div>
                     <div className="w-full bg-[#30363d] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-[#238636] to-[#3fb950] h-full w-[100%] shadow-[0_0_8px_#3fb950]" />
                     </div>
                  </div>
               </div>

               {/* Destructive Actions (Author/Owner) */}
               {canClose && (
                  <div className="pt-8 border-t border-[#30363d]">
                     <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[#30363d] text-[#8b949e] hover:text-[#f85149] hover:border-[#da3633] hover:bg-[#da3633]/5 transition-all text-xs font-bold group">
                        <Trash2 size={14} className="group-hover:animate-bounce" /> Delete Branch After Merge
                     </button>
                  </div>
               )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
