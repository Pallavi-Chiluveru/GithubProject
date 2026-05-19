import { useEffect, useState } from "react";
import API from "../api";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  GitPullRequest, 
  MessageSquare, 
  Search, 
  ChevronDown, 
  Filter,
  Plus,
  CheckCircle2,
  Clock,
  User,
  X,
  Tag,
  GitBranch,
  ArrowRight,
  MoreHorizontal,
  Calendar,
  AlertCircle
} from "lucide-react";


export default function RepoPulls() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prs, setPrs] = useState([]);
  const [repo, setRepo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("open");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPrs = async () => {
    try {
      const res = await API.get(`/pr-api/${id}`);
      setPrs(res.data);
    } catch (err) {
      console.error("Failed to fetch PRs:", err);
    }
  };

  const fetchRepo = async () => {
    try {
      const res = await API.get(`/repo-api/${id}`);
      setRepo(res.data);
    } catch (err) {
      console.error("Failed to fetch repo:", err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchPrs(), fetchRepo()]);
      setLoading(false);
    };
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0d1117]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#f78166] border-t-transparent"></div>
      </div>
    );
  }

  const filteredPrs = prs.filter(p => {
    const matchesFilter = p.status === filter;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.createdBy?.username?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#010409] text-[#c9d1d9] pb-20 selection:bg-[#2f81f7]/30">
      <div className="mx-auto max-w-6xl px-4 py-8">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-[#8b949e] mb-8 animate-in fade-in slide-in-from-left-2 duration-300">
           <Link to="/dashboard" className="hover:text-[#2f81f7] transition-colors">Dashboard</Link>
           <span className="opacity-40">/</span>
           <Link to={`/repo/${id}`} className="hover:text-[#2f81f7] transition-colors font-bold text-[#f0f6fc]">{repo?.name}</Link>
           <span className="opacity-40">/</span>
           <span className="text-[#f78166] font-medium">Pull requests</span>
        </div>

        {/* Header Section */}
        <div className="flex flex-wrap items-center justify-between gap-6 mb-10">
           <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#2f81f7] to-[#12c2e9] flex items-center justify-center shadow-lg shadow-blue-900/20 transform hover:rotate-6 transition-transform">
                 <GitPullRequest className="h-8 w-8 text-white" />
              </div>
              <div>
                 <h1 className="text-3xl font-extrabold text-[#f0f6fc] tracking-tight">Pull requests</h1>
                 <p className="text-sm text-[#8b949e] mt-1 flex items-center gap-2">
                    <Activity className="h-3 w-3" /> Manage and review code changes for <span className="text-[#c9d1d9] font-bold">{repo?.name}</span>
                 </p>
              </div>
           </div>

           <Link 
            to={`/repo/${id}/pull/new`}
            className="group flex items-center gap-2 rounded-xl bg-[#238636] px-6 py-3 text-sm font-bold text-white hover:bg-[#2ea043] shadow-xl shadow-emerald-900/20 transition-all active:scale-95 border border-[#3fb950]/30"
           >
             <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" /> New pull request
           </Link>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
           <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b949e] group-focus-within:text-[#2f81f7] transition-colors" />
              <input 
                type="text" 
                placeholder="Search pull requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl pl-11 pr-4 py-2.5 text-sm text-[#f0f6fc] focus:border-[#2f81f7] focus:ring-1 focus:ring-[#2f81f7] outline-none transition-all shadow-inner"
              />
           </div>
           <div className="flex items-center gap-2 bg-[#0d1117] border border-[#30363d] rounded-xl px-2 py-1.5 shadow-sm">
              <button className="px-3 py-1.5 text-xs font-bold text-[#8b949e] hover:text-[#f0f6fc] flex items-center gap-2"><Filter size={14} /> Filters <ChevronDown size={12} /></button>
              <div className="w-[1px] h-4 bg-[#30363d]" />
              <button className="px-3 py-1.5 text-xs font-bold text-[#8b949e] hover:text-[#f0f6fc] flex items-center gap-2"><Tag size={14} /> Labels</button>
           </div>
        </div>

        {/* PRs List Container */}
        <div className="rounded-2xl border border-[#30363d] bg-[#0d1117] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-500">
           {/* List Header */}
           <div className="flex items-center justify-between bg-[#161b22] border-b border-[#30363d] px-6 py-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
              <div className="flex items-center gap-8">
                 <button 
                  onClick={() => setFilter("open")}
                  className={`flex items-center gap-2 text-sm font-bold transition-all relative py-2 ${filter === "open" ? "text-[#f0f6fc]" : "text-[#8b949e] hover:text-[#f0f6fc]"}`}
                 >
                    <GitPullRequest className={`h-4 w-4 ${filter === 'open' ? 'text-[#3fb950]' : ''}`} /> 
                    {prs.filter(i => i.status === "open").length} Open
                    {filter === 'open' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f78166] rounded-full" />}
                 </button>
                 <button 
                  onClick={() => setFilter("merged")}
                  className={`flex items-center gap-2 text-sm font-bold transition-all relative py-2 ${filter === "merged" ? "text-[#f0f6fc]" : "text-[#8b949e] hover:text-[#f0f6fc]"}`}
                 >
                    <GitMerge className={`h-4 w-4 ${filter === 'merged' ? 'text-[#a371f7]' : ''}`} /> 
                    {prs.filter(i => i.status === "merged").length} Merged
                    {filter === 'merged' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f78166] rounded-full" />}
                 </button>
                 <button 
                  onClick={() => setFilter("closed")}
                  className={`flex items-center gap-2 text-sm font-bold transition-all relative py-2 ${filter === "closed" ? "text-[#f0f6fc]" : "text-[#8b949e] hover:text-[#f0f6fc]"}`}
                 >
                    <XCircle className={`h-4 w-4 ${filter === 'closed' ? 'text-[#f85149]' : ''}`} /> 
                    {prs.filter(i => i.status === "closed").length} Closed
                    {filter === 'closed' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f78166] rounded-full" />}
                 </button>
                 <button 
                  onClick={() => setFilter("draft")}
                  className={`flex items-center gap-2 text-sm font-bold transition-all relative py-2 ${filter === "draft" ? "text-[#f0f6fc]" : "text-[#8b949e] hover:text-[#f0f6fc]"}`}
                 >
                    <Clock className={`h-4 w-4 ${filter === 'draft' ? 'text-[#8b949e]' : ''}`} /> 
                    {prs.filter(i => i.status === "draft").length} Drafts
                    {filter === 'draft' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f78166] rounded-full" />}
                 </button>
              </div>
           </div>

           {/* List Items */}
           <div className="divide-y divide-[#30363d]">
              {filteredPrs.length > 0 ? (
                filteredPrs.map((pr, idx) => (
                  <div 
                    key={pr._id} 
                    className="flex items-start gap-4 px-6 py-5 hover:bg-[#161b22] transition-all group relative animate-in slide-in-from-bottom-2 duration-300"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                     <div className="mt-1.5 relative">
                        <GitPullRequest className={`h-5 w-5 ${pr.status === "open" ? "text-[#3fb950]" : pr.status === "merged" ? "text-[#a371f7]" : "text-[#8b949e]"}`} />
                        {pr.status === 'open' && <div className="absolute -top-1 -right-1 h-2 w-2 bg-[#3fb950] rounded-full animate-ping" />}
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                           <Link 
                            to={`/repo/${id}/pull/${pr._id}`}
                            className="text-lg font-bold text-[#f0f6fc] hover:text-[#2f81f7] transition-colors truncate"
                           >
                              {pr.title}
                           </Link>
                           {pr.isDraft && <span className="bg-[#161b22] border border-[#30363d] text-[#8b949e] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter">Draft</span>}
                           {pr.labels?.map(label => (
                              <span key={label} className="bg-[#30363d] text-[#c9d1d9] px-2 py-0.5 rounded-full text-[10px] font-medium">{label}</span>
                           ))}
                        </div>
                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-[#8b949e]">
                           <span className="font-mono text-[#8b949e]">#{pr._id.slice(-4)}</span>
                           <span className="flex items-center gap-1.5">
                              <Calendar size={12} /> {new Date(pr.createdAt).toLocaleDateString()}
                           </span>
                           <span className="flex items-center gap-1.5">
                              <User size={12} /> by <span className="text-[#c9d1d9] font-bold hover:text-[#2f81f7] cursor-pointer">{pr.createdBy?.username || "Unknown"}</span>
                           </span>
                           <span className="flex items-center gap-1 bg-[#161b22] px-2 py-0.5 rounded border border-[#30363d] text-[#2f81f7] font-mono">
                             <GitBranch size={10} /> {pr.sourceBranch} <ArrowRight size={10} className="mx-0.5" /> {pr.targetBranch}
                           </span>
                        </div>
                     </div>
                     <div className="flex flex-col items-end gap-3">
                        <div className="flex -space-x-2">
                           <img
                             src={pr.createdBy?.profileImageUrl || `https://ui-avatars.com/api/?name=${pr.createdBy?.username || "U"}&background=random`}
                             alt="" className="h-6 w-6 rounded-full border-2 border-[#0d1117] shadow-lg" title={pr.createdBy?.username} />
                           {pr.reviewers?.slice(0, 3).map(r => (
                             <img key={r._id} src={r.profileImageUrl || `https://ui-avatars.com/api/?name=${r.username}&background=random`} className="h-6 w-6 rounded-full border-2 border-[#0d1117] shadow-lg" title={`Reviewer: ${r.username}`} />
                           ))}
                        </div>
                        {pr.comments?.length > 0 && (
                           <div className="flex items-center gap-1 text-[10px] font-bold text-[#8b949e] bg-[#21262d] px-2 py-0.5 rounded-full border border-[#30363d]">
                              <MessageSquare size={10} /> {pr.comments.length}
                           </div>
                        )}
                     </div>
                     
                     <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-[#30363d] rounded-lg text-[#8b949e]"><MoreHorizontal size={16} /></button>
                     </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
                   <div className="h-24 w-24 rounded-full bg-[#161b22] border border-[#30363d] flex items-center justify-center mb-8 relative">
                      <GitPullRequest className="h-12 w-12 text-[#30363d]" />
                      <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-[#0d1117] border border-[#30363d] rounded-xl flex items-center justify-center shadow-2xl">
                         <Search className="h-5 w-5 text-[#8b949e]" />
                      </div>
                   </div>
                   <h3 className="text-2xl font-bold text-[#f0f6fc]">No {filter} pull requests matching your search</h3>
                   <p className="mt-4 text-[#8b949e] max-w-md mx-auto leading-relaxed italic">
                      "Clean code always looks like it was written by someone who cares."
                   </p>
                </div>
              )}
           </div>
           
           {/* List Footer */}
           <div className="bg-[#161b22] px-6 py-3 text-xs text-[#8b949e] border-t border-[#30363d] flex items-center gap-4">
              <span className="flex items-center gap-1.5"><AlertCircle size={12} /> Pro Tip: Type 'is:open' in search to filter quickly.</span>
           </div>
        </div>
      </div>
    </div>
  );
}

// Dummy Activity Icon
function Activity({ className }) {
   return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
}

// Dummy GitMerge Icon
function GitMerge({ className }) {
   return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v2.586a1 1 0 01-.293.707l-2.414 2.414a1 1 0 00-.293.707V19a2 2 0 002 2h2" /></svg>
}

// Dummy XCircle Icon
function XCircle({ className }) {
   return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
}
