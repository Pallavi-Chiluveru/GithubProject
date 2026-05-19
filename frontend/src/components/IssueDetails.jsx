import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
   CircleDot,
   MessageSquare,
   Plus,
   ChevronDown,
   MoreHorizontal,
   Smile,
   Heading,
   Bold,
   Italic,
   List,
   Code,
   Link as LinkIcon,
   AtSign,
   Reply,
   Paperclip,
   CheckCircle2,
   Settings,
   Layout,
   Zap,
   Play,
   Book,
   Activity,
   Shield,
   GitPullRequest,
   Copy
} from "lucide-react";
import API from "../api";

export default function IssueDetails() {
   const { repoId, issueId } = useParams();
   const navigate = useNavigate();
   const [issue, setIssue] = useState(null);
   const [repo, setRepo] = useState(null);
   const [comment, setComment] = useState("");
   const [activeTab, setActiveTab] = useState("write");
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchData = async () => {
         try {
            const [issueRes, repoRes] = await Promise.all([
               API.get(`/issue-api/single/${issueId}`),
               API.get(`/repo-api/${repoId}`)
            ]);
            setIssue(issueRes.data);
            setRepo(repoRes.data);
         } catch (err) {
            console.error("Failed to fetch issue details:", err);
         } finally {
            setLoading(false);
         }
      };
      fetchData();
   }, [repoId, issueId]);

   if (loading) {
      return (
         <div className="flex h-screen items-center justify-center bg-[#010409]">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec4899] border-t-transparent"></div>
         </div>
      );
   }

   const tabs = [
      { id: 'code', icon: Code, label: 'Code', path: `/repo/${repoId}` },
      { id: 'issues', icon: CircleDot, label: 'Issues', count: 1, active: true, path: `/repo/${repoId}/issues` },
      { id: 'pulls', icon: GitPullRequest, label: 'Pull requests', count: 0, path: `/repo/${repoId}/pulls` },
      { id: 'agents', icon: Zap, label: 'Agents', path: `/repo/${repoId}?tab=agents` },
      { id: 'actions', icon: Play, label: 'Actions', path: `/repo/${repoId}?tab=actions` },
      { id: 'projects', icon: Layout, label: 'Projects', path: `/repo/${repoId}?tab=projects` },
      { id: 'wiki', icon: Book, label: 'Wiki', path: `/repo/${repoId}?tab=wiki` },
      { id: 'security', icon: Shield, label: 'Security', path: `/repo/${repoId}?tab=security` },
      { id: 'insights', icon: Activity, label: 'Insights', path: `/repo/${repoId}?tab=insights` },
      { id: 'settings', icon: Settings, label: 'Settings', path: `/repo/${repoId}/settings` }
   ];

   return (
      <div className="min-h-screen bg-[#010409] text-[#c9d1d9]">
         {/* Top Navigation Tabs */}
         <div className="border-b border-[#30363d] bg-[#0d1117] pt-4">
            <div className="mx-auto max-w-[1280px] px-8">
               <nav className="flex gap-1 overflow-x-auto custom-scrollbar">
                  {tabs.map((tab) => (
                     <button
                        key={tab.id}
                        onClick={() => navigate(tab.path)}
                        className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm transition-all whitespace-nowrap ${tab.active ? 'border-[#f78166] text-[#f0f6fc]' : 'border-transparent text-[#8b949e] hover:bg-[#30363d]/30 hover:text-[#f0f6fc]'}`}
                     >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                        {tab.count !== undefined && <span className="rounded-full bg-[#30363d] px-2 py-0.5 text-xs text-[#f0f6fc]">{tab.count}</span>}
                     </button>
                  ))}
               </nav>
            </div>
         </div>

         <div className="mx-auto max-w-[1280px] px-8 py-8">
            {/* Issue Header */}
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-[#30363d] pb-6">
               <div className="flex-1">
                  <h1 className="text-3xl font-normal text-[#f0f6fc]">
                     {issue?.title} <span className="text-[#8b949e]">#{issueId.slice(-1)}</span>
                  </h1>
                  <div className="mt-3 flex items-center gap-3">
                     <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold text-white ${issue?.status === 'open' ? 'bg-[#238636]' : 'bg-[#a371f7]'}`}>
                        {issue?.status === 'open' ? <CircleDot className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                        {issue?.status === 'open' ? 'Open' : 'Closed'}
                     </div>
                     <p className="text-sm text-[#8b949e]">
                        <span className="font-bold text-[#8b949e] hover:text-[#ec4899] cursor-pointer">{issue?.createdBy?.username || "Pallavi-Chiluveru"}</span> opened this issue now • 0 comments
                     </p>
                  </div>
               </div>

               <div className="flex items-center gap-2">
                  <button className="rounded-md border border-[#30363d] bg-[#21262d] px-3 py-1 text-xs font-semibold text-[#f0f6fc] hover:bg-[#30363d]">Edit</button>
                  <Link to={`/repo/${repoId}/new-issue`} className="rounded-md bg-[#238636] px-3 py-1 text-xs font-semibold text-white hover:bg-[#2ea043]">New issue</Link>
                  <button className="rounded-md border border-[#30363d] bg-[#21262d] p-1 text-[#8b949e] hover:bg-[#30363d]"><Copy className="h-4 w-4" /></button>
               </div>
            </div>

            <div className="mx-auto max-w-[960px] space-y-8">
               {/* Conversation Area */}
               {/* Main Issue Post */}
               <div className="flex items-start gap-4">
                  <div className="h-10 w-10 overflow-hidden rounded-full border border-[#30363d]">
                     <img src={`https://ui-avatars.com/api/?name=${issue?.createdBy?.username || "Guest"}&background=random`} alt="" />
                  </div>
                  <div className="flex-1 rounded-xl border border-[#30363d] bg-[#0d1117] overflow-hidden">
                     <div className="flex items-center justify-between border-b border-[#30363d] bg-[#161b22] px-4 py-2">
                        <p className="text-sm text-[#8b949e]">
                           <span className="font-bold text-[#f0f6fc]">{issue?.createdBy?.username || "Pallavi-Chiluveru"}</span> opened now
                        </p>
                        <div className="flex items-center gap-2">
                           <span className="rounded-full border border-[#30363d] px-2 py-0.5 text-[10px] font-bold text-[#8b949e]">Owner</span>
                           <button className="text-[#8b949e] hover:text-[#f0f6fc]"><MoreHorizontal className="h-4 w-4" /></button>
                        </div>
                     </div>
                     <div className="p-4 text-sm text-[#f0f6fc] min-h-[60px]">
                        {issue?.description || "No description provided."}
                     </div>
                     <div className="flex items-center gap-2 px-4 py-3 border-t border-[#30363d]/50">
                        <button className="flex items-center gap-1 rounded-md border border-[#30363d] bg-[#21262d] px-2 py-1 text-xs font-semibold text-[#f0f6fc] hover:bg-[#30363d]">
                           Create sub-issue <ChevronDown className="h-3 w-3" />
                        </button>
                        <button className="text-[#8b949e] hover:text-[#ec4899]"><Smile className="h-4 w-4" /></button>
                     </div>
                  </div>
               </div>

               {/* Add a comment */}
               <div className="flex items-start gap-4">
                  <div className="h-10 w-10 overflow-hidden rounded-full border border-[#30363d]">
                     <img src="https://ui-avatars.com/api/?name=Current+User&background=random" alt="" />
                  </div>
                  <div className="flex-1 space-y-3">
                     <h3 className="text-sm font-semibold text-[#f0f6fc]">Add a comment</h3>
                     <div className="rounded-xl border border-[#30363d] bg-[#010409] overflow-hidden">
                        <div className="flex items-center justify-between border-b border-[#30363d] bg-[#161b22] px-4 pt-2">
                           <div className="flex gap-1">
                              <button
                                 onClick={() => setActiveTab("write")}
                                 className={`px-4 py-2 text-sm font-medium border-x border-t border-transparent rounded-t-lg transition-all ${activeTab === "write" ? "bg-[#0d1117] border-[#30363d] text-[#f0f6fc]" : "text-[#8b949e] hover:text-[#f0f6fc]"}`}
                              >
                                 Write
                              </button>
                              <button
                                 onClick={() => setActiveTab("preview")}
                                 className={`px-4 py-2 text-sm font-medium border-x border-t border-transparent rounded-t-lg transition-all ${activeTab === "preview" ? "bg-[#0d1117] border-[#30363d] text-[#f0f6fc]" : "text-[#8b949e] hover:text-[#f0f6fc]"}`}
                              >
                                 Preview
                              </button>
                           </div>
                           <div className="flex items-center gap-2 pb-2">
                              <Heading className="h-4 w-4 text-[#8b949e] hover:text-[#f0f6fc] cursor-pointer" />
                              <Bold className="h-4 w-4 text-[#8b949e] hover:text-[#f0f6fc] cursor-pointer" />
                              <Italic className="h-4 w-4 text-[#8b949e] hover:text-[#f0f6fc] cursor-pointer" />
                              <div className="h-4 w-[1px] bg-[#30363d] mx-1"></div>
                              <Code className="h-4 w-4 text-[#8b949e] hover:text-[#f0f6fc] cursor-pointer" />
                              <LinkIcon className="h-4 w-4 text-[#8b949e] hover:text-[#f0f6fc] cursor-pointer" />
                              <div className="h-4 w-[1px] bg-[#30363d] mx-1"></div>
                              <List className="h-4 w-4 text-[#8b949e] hover:text-[#f0f6fc] cursor-pointer" />
                              <AtSign className="h-4 w-4 text-[#8b949e] hover:text-[#f0f6fc] cursor-pointer" />
                              <Reply className="h-4 w-4 text-[#8b949e] hover:text-[#f0f6fc] cursor-pointer" />
                           </div>
                        </div>
                        <div className="p-4">
                           <textarea
                              rows="6"
                              placeholder="Use Markdown to format your comment"
                              className="w-full bg-transparent text-sm text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none resize-none"
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                           />
                        </div>
                        <div className="flex items-center gap-2 border-t border-[#30363d] px-4 py-2.5 bg-[#0d1117]/50">
                           <Paperclip className="h-4 w-4 text-[#8b949e]" />
                           <span className="text-xs text-[#8b949e]">Paste, drop, or click to add files</span>
                        </div>
                     </div>
                     <div className="flex justify-end gap-2 pt-2">
                        <button className="flex items-center gap-1.5 rounded-md border border-[#30363d] bg-[#21262d] px-4 py-1.5 text-sm font-semibold text-[#f0f6fc] hover:bg-[#30363d]">
                           <CheckCircle2 className="h-4 w-4 text-[#a371f7]" /> Close issue <ChevronDown className="h-3 w-3" />
                        </button>
                        <button className="rounded-md bg-[#238636] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#2ea043] transition-all">
                           Comment
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
