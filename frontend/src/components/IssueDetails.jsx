import { useState, useEffect, useRef } from "react";
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
   Copy,
   Loader2,
   AlertCircle,
   X
} from "lucide-react";
import API from "../api";

// ── tiny relative-time helper ──────────────────────────────────────────────
function timeAgo(dateStr) {
   if (!dateStr) return "";
   const diff = Date.now() - new Date(dateStr).getTime();
   const s = Math.floor(diff / 1000);
   if (s < 60)  return "just now";
   const m = Math.floor(s / 60);
   if (m < 60)  return `${m}m ago`;
   const h = Math.floor(m / 60);
   if (h < 24)  return `${h}h ago`;
   const d = Math.floor(h / 24);
   if (d === 1) return "yesterday";
   if (d < 30)  return `${d} days ago`;
   return new Date(dateStr).toLocaleDateString();
}

export default function IssueDetails() {
   const { repoId, issueId } = useParams();
   const navigate    = useNavigate();

   const [issue,     setIssue]     = useState(null);
   const [repo,      setRepo]      = useState(null);
   const [comments,  setComments]  = useState([]);   // ← separate comments state
   const [comment,   setComment]   = useState("");
   const [activeTab, setActiveTab] = useState("write");
   const [loading,   setLoading]   = useState(true);
   const [submitting, setSubmitting] = useState(false);
   const [error,     setError]     = useState("");
   const [submitError, setSubmitError] = useState("");
   const commentEndRef = useRef(null);

   // ── current logged-in user ─────────────────────────────────────────────
   const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

   // ── fetch issue + repo ─────────────────────────────────────────────────
   useEffect(() => {
      const fetchData = async () => {
         try {
            const [issueRes, repoRes] = await Promise.all([
               API.get(`/issue-api/single/${issueId}`),
               API.get(`/repo-api/${repoId}`)
            ]);
            const issueData = issueRes.data;
            setIssue(issueData);
            setRepo(repoRes.data);
            // populate comments from the issue response
            setComments(issueData.comments || []);
         } catch (err) {
            console.error("Failed to fetch issue details:", err);
            setError("Failed to load issue. Please refresh.");
         } finally {
            setLoading(false);
         }
      };
      fetchData();
   }, [repoId, issueId]);

   // ── scroll to bottom of comments when new one added ───────────────────
   useEffect(() => {
      if (comments.length > 0) {
         commentEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
   }, [comments.length]);

   // ── submit comment handler ─────────────────────────────────────────────
   const handleSubmitComment = async () => {
      const trimmed = comment.trim();
      if (!trimmed) return;                    // prevent empty submit
      if (submitting) return;                  // prevent duplicate submit

      setSubmitting(true);
      setSubmitError("");

      // optimistic UI: add comment to list immediately
      const optimisticComment = {
         _id: `optimistic-${Date.now()}`,
         comment: trimmed,
         createdBy: {
            _id: currentUser._id,
            username: currentUser.username || "You",
            profileImageUrl: currentUser.profileImageUrl || null,
         },
         createdAt: new Date().toISOString(),
         _optimistic: true,
      };
      setComments(prev => [...prev, optimisticComment]);
      setComment("");   // clear textarea immediately

      try {
         console.log("[IssueDetails] Posting comment to /issue-api/:issueId/comments...");
         const res = await API.post(`/issue-api/${issueId}/comments`, {
            comment: trimmed,
         });
         console.log("[IssueDetails] Comment saved:", res.data);

         // replace optimistic entry with real server response
         setComments(prev =>
            prev.map(c =>
               c._id === optimisticComment._id ? res.data : c
            )
         );
      } catch (err) {
         console.error("[IssueDetails] Comment submit failed:", err);
         // roll back optimistic entry
         setComments(prev => prev.filter(c => c._id !== optimisticComment._id));
         setComment(trimmed);  // restore text so user doesn't lose it
         const msg = err?.response?.data?.message || "Failed to post comment. Please try again.";
         setSubmitError(msg);
      } finally {
         setSubmitting(false);
      }
   };

   // ── close / reopen issue ───────────────────────────────────────────────
   const handleToggleStatus = async () => {
      try {
         const res = await API.patch(`/issue-api/${issueId}/status`);
         setIssue(prev => ({ ...prev, status: res.data.issue.status }));
      } catch (err) {
         console.error("Failed to toggle issue status:", err);
      }
   };

   // ── loading state ──────────────────────────────────────────────────────
   if (loading) {
      return (
         <div className="flex h-screen items-center justify-center bg-[var(--bg-primary)]">
            <Loader2 className="h-10 w-10 animate-spin text-[#2f81f7]" />
         </div>
      );
   }

   if (error) {
      return (
         <div className="flex h-screen items-center justify-center bg-[var(--bg-primary)]">
            <div className="text-center space-y-3">
               <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
               <p className="text-[var(--text-primary)] font-medium">{error}</p>
               <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-[#238636] text-white text-sm rounded-md hover:bg-[#2ea043]"
               >
                  Retry
               </button>
            </div>
         </div>
      );
   }

   const tabs = [
      { id: "code",     icon: Code,           label: "Code",          path: `/repo/${repoId}` },
      { id: "issues",   icon: CircleDot,      label: "Issues",        count: 1, active: true, path: `/repo/${repoId}/issues` },
      { id: "pulls",    icon: GitPullRequest, label: "Pull requests", count: 0, path: `/repo/${repoId}/pulls` },
      { id: "agents",   icon: Zap,            label: "Agents",        path: `/repo/${repoId}?tab=agents` },
      { id: "actions",  icon: Play,           label: "Actions",       path: `/repo/${repoId}?tab=actions` },
      { id: "projects", icon: Layout,         label: "Projects",      path: `/repo/${repoId}?tab=projects` },
      { id: "wiki",     icon: Book,           label: "Wiki",          path: `/repo/${repoId}?tab=wiki` },
      { id: "security", icon: Shield,         label: "Security",      path: `/repo/${repoId}?tab=security` },
      { id: "insights", icon: Activity,       label: "Insights",      path: `/repo/${repoId}?tab=insights` },
      { id: "settings", icon: Settings,       label: "Settings",      path: `/repo/${repoId}/settings` },
   ];

   const isOpen = issue?.status === "open";

   return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
         {/* ── Top Navigation Tabs ── */}
         <div className="border-b border-[var(--border-color)] bg-[var(--bg-primary)] pt-4">
            <div className="mx-auto max-w-[1280px] px-8">
               <nav className="flex gap-1 overflow-x-auto custom-scrollbar">
                  {tabs.map((tab) => (
                     <button
                        key={tab.id}
                        onClick={() => navigate(tab.path)}
                        className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm transition-all whitespace-nowrap ${
                           tab.active
                              ? "border-[#f78166] text-[var(--text-primary)]"
                              : "border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                        }`}
                     >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                        {tab.count !== undefined && (
                           <span className="rounded-full bg-[var(--bg-tertiary)] px-2 py-0.5 text-xs text-[var(--text-primary)]">
                              {tab.count}
                           </span>
                        )}
                     </button>
                  ))}
               </nav>
            </div>
         </div>

         <div className="mx-auto max-w-[1280px] px-8 py-8">
            {/* ── Issue Header ── */}
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-color)] pb-6">
               <div className="flex-1">
                  <h1 className="text-3xl font-normal text-[var(--text-primary)]">
                     {issue?.title}{" "}
                     <span className="text-[var(--text-secondary)]">#{issueId.slice(-4)}</span>
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                     <div
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold text-white ${
                           isOpen ? "bg-[#238636]" : "bg-[#a371f7]"
                        }`}
                     >
                        {isOpen ? <CircleDot className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                        {isOpen ? "Open" : "Closed"}
                     </div>
                     <p className="text-sm text-[var(--text-secondary)]">
                        <span className="font-bold text-[var(--text-primary)] hover:text-[#ec4899] cursor-pointer">
                           {issue?.createdBy?.username || "Unknown"}
                        </span>{" "}
                        opened this issue {timeAgo(issue?.createdAt)} ·{" "}
                        <span className="font-semibold">{comments.length}</span>{" "}
                        {comments.length === 1 ? "comment" : "comments"}
                     </p>
                  </div>
               </div>

               <div className="flex items-center gap-2">
                  <button className="rounded-md border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-1 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors">
                     Edit
                  </button>
                  <Link
                     to={`/repo/${repoId}/new-issue`}
                     className="rounded-md bg-[#238636] px-3 py-1 text-xs font-semibold text-white hover:bg-[#2ea043] transition-colors"
                  >
                     New issue
                  </Link>
               </div>
            </div>

            <div className="mx-auto max-w-[960px] space-y-8">
               {/* ── Original Issue Post ── */}
               <div className="flex items-start gap-4">
                  <div className="h-10 w-10 overflow-hidden rounded-full border border-[var(--border-color)] shrink-0">
                     <img
                        src={
                           issue?.createdBy?.profileImageUrl ||
                           `https://ui-avatars.com/api/?name=${issue?.createdBy?.username || "Guest"}&background=random`
                        }
                        alt="author"
                        className="h-full w-full object-cover"
                     />
                  </div>
                  <div className="flex-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden">
                     <div className="flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-tertiary)] px-4 py-2">
                        <p className="text-sm text-[var(--text-secondary)]">
                           <span className="font-bold text-[var(--text-primary)]">
                              {issue?.createdBy?.username || "Unknown"}
                           </span>{" "}
                           · {timeAgo(issue?.createdAt)}
                        </p>
                        <div className="flex items-center gap-2">
                           <span className="rounded-full border border-[var(--border-color)] px-2 py-0.5 text-[10px] font-bold text-[var(--text-secondary)]">
                              Owner
                           </span>
                           <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                              <MoreHorizontal className="h-4 w-4" />
                           </button>
                        </div>
                     </div>
                     <div className="p-4 text-sm text-[var(--text-primary)] min-h-[60px] whitespace-pre-wrap">
                        {issue?.description || "No description provided."}
                     </div>
                     <div className="flex items-center gap-2 px-4 py-3 border-t border-[var(--border-color)]/50">
                        <button className="flex items-center gap-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] px-2 py-1 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors">
                           Create sub-issue <ChevronDown className="h-3 w-3" />
                        </button>
                        <button className="text-[var(--text-secondary)] hover:text-[#ec4899] transition-colors">
                           <Smile className="h-4 w-4" />
                        </button>
                     </div>
                  </div>
               </div>

               {/* ── Existing Comments Thread ── */}
               {comments.length > 0 && (
                  <div className="space-y-6">
                     {comments.map((c) => (
                        <div
                           key={c._id}
                           className={`flex items-start gap-4 transition-opacity ${
                              c._optimistic ? "opacity-60" : "opacity-100"
                           }`}
                        >
                           <div className="h-10 w-10 overflow-hidden rounded-full border border-[var(--border-color)] shrink-0">
                              <img
                                 src={
                                    c.createdBy?.profileImageUrl ||
                                    `https://ui-avatars.com/api/?name=${c.createdBy?.username || "User"}&background=random`
                                 }
                                 alt={c.createdBy?.username || "User"}
                                 className="h-full w-full object-cover"
                              />
                           </div>
                           <div className="flex-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden">
                              <div className="flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-tertiary)] px-4 py-2">
                                 <p className="text-sm text-[var(--text-secondary)]">
                                    <span className="font-bold text-[var(--text-primary)]">
                                       {c.createdBy?.username || "Unknown"}
                                    </span>{" "}
                                    · {c._optimistic ? "Posting…" : timeAgo(c.createdAt)}
                                 </p>
                                 <div className="flex items-center gap-2">
                                    {c._optimistic ? (
                                       <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--text-secondary)]" />
                                    ) : (
                                       <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                                          <MoreHorizontal className="h-4 w-4" />
                                       </button>
                                    )}
                                 </div>
                              </div>
                              <div className="p-4 text-sm text-[var(--text-primary)] whitespace-pre-wrap">
                                 {c.comment}
                              </div>
                              {!c._optimistic && (
                                 <div className="flex items-center gap-2 px-4 py-2.5 border-t border-[var(--border-color)]/50">
                                    <button className="text-[var(--text-secondary)] hover:text-[#ec4899] transition-colors">
                                       <Smile className="h-4 w-4" />
                                    </button>
                                    <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                                       <Reply className="h-4 w-4" />
                                    </button>
                                 </div>
                              )}
                           </div>
                        </div>
                     ))}
                     <div ref={commentEndRef} />
                  </div>
               )}

               {/* ── Add a Comment Box ── */}
               <div className="flex items-start gap-4">
                  <div className="h-10 w-10 overflow-hidden rounded-full border border-[var(--border-color)] shrink-0">
                     <img
                        src={
                           currentUser?.profileImageUrl ||
                           `https://ui-avatars.com/api/?name=${currentUser?.username || "You"}&background=random`
                        }
                        alt="you"
                        className="h-full w-full object-cover"
                     />
                  </div>
                  <div className="flex-1 space-y-3">
                     <h3 className="text-sm font-semibold text-[var(--text-primary)]">Add a comment</h3>

                     {/* Submit error banner */}
                     {submitError && (
                        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                           <AlertCircle className="h-4 w-4 shrink-0" />
                           <span className="flex-1">{submitError}</span>
                           <button onClick={() => setSubmitError("")} className="ml-2 text-red-500 hover:text-red-700">
                              <X className="h-3.5 w-3.5" />
                           </button>
                        </div>
                     )}

                     <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] overflow-hidden focus-within:ring-2 focus-within:ring-[#2f81f7]/30 focus-within:border-[#2f81f7] transition-all">
                        {/* Write / Preview tabs */}
                        <div className="flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 pt-2">
                           <div className="flex gap-1">
                              <button
                                 onClick={() => setActiveTab("write")}
                                 className={`px-4 py-2 text-sm font-medium border-x border-t border-transparent rounded-t-lg transition-all ${
                                    activeTab === "write"
                                       ? "bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-primary)]"
                                       : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                 }`}
                              >
                                 Write
                              </button>
                              <button
                                 onClick={() => setActiveTab("preview")}
                                 className={`px-4 py-2 text-sm font-medium border-x border-t border-transparent rounded-t-lg transition-all ${
                                    activeTab === "preview"
                                       ? "bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-primary)]"
                                       : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                 }`}
                              >
                                 Preview
                              </button>
                           </div>
                           {/* Markdown toolbar */}
                           <div className="flex items-center gap-2 pb-2">
                              <Heading className="h-4 w-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors" />
                              <Bold    className="h-4 w-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors" />
                              <Italic  className="h-4 w-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors" />
                              <div className="h-4 w-[1px] bg-[var(--border-color)] mx-1" />
                              <Code    className="h-4 w-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors" />
                              <LinkIcon className="h-4 w-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors" />
                              <div className="h-4 w-[1px] bg-[var(--border-color)] mx-1" />
                              <List   className="h-4 w-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors" />
                              <AtSign className="h-4 w-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors" />
                              <Reply  className="h-4 w-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors" />
                           </div>
                        </div>

                        {/* Textarea / Preview body */}
                        <div className="p-4 min-h-[120px]">
                           {activeTab === "write" ? (
                              <textarea
                                 id="comment-textarea"
                                 rows={6}
                                 placeholder="Leave a comment…"
                                 className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none resize-none"
                                 value={comment}
                                 onChange={(e) => setComment(e.target.value)}
                                 onKeyDown={(e) => {
                                    // Ctrl/Cmd + Enter to submit
                                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                                       e.preventDefault();
                                       handleSubmitComment();
                                    }
                                 }}
                                 disabled={submitting}
                              />
                           ) : (
                              <div className="text-sm text-[var(--text-primary)] min-h-[120px] whitespace-pre-wrap">
                                 {comment || (
                                    <span className="italic text-[var(--text-secondary)]">Nothing to preview.</span>
                                 )}
                              </div>
                           )}
                        </div>

                        {/* File attach hint */}
                        <div className="flex items-center gap-2 border-t border-[var(--border-color)] px-4 py-2.5 bg-[var(--bg-secondary)]/50">
                           <Paperclip className="h-4 w-4 text-[var(--text-secondary)]" />
                           <span className="text-xs text-[var(--text-secondary)]">Paste, drop, or click to add files</span>
                        </div>
                     </div>

                     {/* Action buttons */}
                     <div className="flex justify-end gap-2 pt-1">
                        <button
                           onClick={handleToggleStatus}
                           className="flex items-center gap-1.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-1.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                        >
                           {isOpen ? (
                              <><CheckCircle2 className="h-4 w-4 text-[#a371f7]" /> Close issue <ChevronDown className="h-3 w-3" /></>
                           ) : (
                              <><CircleDot className="h-4 w-4 text-[#238636]" /> Reopen issue</>
                           )}
                        </button>

                        <button
                           id="comment-submit-btn"
                           onClick={handleSubmitComment}
                           disabled={submitting || !comment.trim()}
                           className="flex items-center gap-2 rounded-md bg-[#238636] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#2ea043] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                           {submitting ? (
                              <>
                                 <Loader2 className="h-4 w-4 animate-spin" />
                                 Posting…
                              </>
                           ) : (
                              "Comment"
                           )}
                        </button>
                     </div>

                     <p className="text-[11px] text-[var(--text-secondary)] text-right">
                        Press <kbd className="rounded border border-[var(--border-color)] px-1 py-0.5 text-[10px] font-mono bg-[var(--bg-tertiary)]">Ctrl</kbd> +{" "}
                        <kbd className="rounded border border-[var(--border-color)] px-1 py-0.5 text-[10px] font-mono bg-[var(--bg-tertiary)]">Enter</kbd> to submit
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
