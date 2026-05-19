import { useState, useEffect } from "react";
import { MessageSquare, Plus, Search, Filter, ThumbsUp, CheckCircle, MessageCircle, Pin, Lock, MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api";

export default function DiscussionsView({ repoId }) {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({ title: "", content: "", category: "GENERAL" });

  const categories = [
    { id: "ALL", label: "All Discussions" },
    { id: "GENERAL", label: "General" },
    { id: "IDEAS", label: "Ideas" },
    { id: "Q&A", label: "Q&A" },
    { id: "SHOW_AND_TELL", label: "Show and tell" },
  ];

  const fetchDiscussions = async () => {
    try {
      const catParam = activeCategory !== "ALL" ? `?category=${activeCategory}` : "";
      const res = await API.get(`/discussion-api/repo/${repoId}${catParam}`);
      setDiscussions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, [repoId, activeCategory]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post("/discussion-api/create", { ...newDiscussion, repoId });
      setIsComposerOpen(false);
      setNewDiscussion({ title: "", content: "", category: "GENERAL" });
      fetchDiscussions();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const handleUpvote = async (id) => {
    try {
      await API.post(`/discussion-api/${id}/upvote`);
      fetchDiscussions();
    } catch (err) { console.error(err); }
  };

  const filteredDiscussions = discussions.filter(d => 
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar Categories */}
      <div className="space-y-6">
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4">
          <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-4 px-2">Categories</h3>
          <div className="space-y-1">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between ${
                  activeCategory === cat.id 
                    ? "bg-[#1f6feb]/10 text-[#2f81f7] font-bold" 
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {cat.label}
                {activeCategory === cat.id && <motion.div layoutId="catDot" className="w-1.5 h-1.5 rounded-full bg-[#2f81f7]" />}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#2f81f7]/5 to-transparent border border-[#2f81f7]/20 rounded-xl p-5">
          <h4 className="text-sm font-bold text-[var(--text-primary)] mb-2">Want to help?</h4>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Answer questions in the Q&A section or share your feedback on new ideas!
          </p>
        </div>
      </div>

      {/* Main Discussions List */}
      <div className="lg:col-span-3 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4 rounded-xl shadow-sm">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm focus:outline-none focus:border-[#1f6feb] transition-all"
            />
          </div>
          <button
            onClick={() => setIsComposerOpen(true)}
            className="flex items-center gap-2 px-6 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-green-900/20"
          >
            <Plus size={18} /> New Discussion
          </button>
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl animate-pulse" />
              ))
            ) : filteredDiscussions.length > 0 ? (
              filteredDiscussions.map((d) => (
                <motion.div
                  key={d._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 rounded-xl hover:border-[#1f6feb]/50 transition-all group relative cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleUpvote(d._id); }}
                      className={`flex flex-col items-center justify-center min-w-[44px] h-14 rounded-xl border transition-all ${
                        d.upvotes?.includes(JSON.parse(localStorage.getItem("user") || "{}")._id)
                          ? "bg-[#1f6feb]/10 border-[#1f6feb] text-[#2f81f7]"
                          : "bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]"
                      }`}
                    >
                      <ThumbsUp size={16} />
                      <span className="text-xs font-bold mt-1">{d.upvotes?.length || 0}</span>
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#2f81f7] bg-[#1f6feb]/10 px-2 py-0.5 rounded-full">
                          {d.category}
                        </span>
                        {d.isPinned && <Pin size={12} className="text-amber-500 fill-amber-500" />}
                        {d.isLocked && <Lock size={12} className="text-[var(--text-secondary)]" />}
                      </div>
                      <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[#2f81f7] transition-colors line-clamp-1">
                        {d.title}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)] line-clamp-1 mt-1">
                        {d.content}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-4 text-xs text-[var(--text-secondary)]">
                        <div className="flex items-center gap-1.5">
                          <img 
                            src={d.author?.profileImageUrl || `https://ui-avatars.com/api/?name=${d.author?.username}&background=random`}
                            className="w-5 h-5 rounded-full border border-[var(--border-color)]"
                            alt=""
                          />
                          <span className="font-medium text-[var(--text-primary)]">{d.author?.username}</span>
                        </div>
                        <span className="flex items-center gap-1"><MessageCircle size={14} /> 0 replies</span>
                        <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {d.bestAnswer && (
                      <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-500 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                        <CheckCircle size={14} /> Solved
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-20 text-center bg-[var(--bg-secondary)] border border-dashed border-[var(--border-color)] rounded-2xl">
                <MessageSquare className="mx-auto h-12 w-12 text-[var(--border-color)] mb-4" />
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Start the conversation</h3>
                <p className="text-[var(--text-secondary)] text-sm max-w-xs mx-auto mt-1">
                  Share ideas, ask questions, or just say hello to the community!
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Composer Modal */}
      <AnimatePresence>
        {isComposerOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsComposerOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">New Discussion</h3>
                <button onClick={() => setIsComposerOpen(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Category</label>
                    <select
                      value={newDiscussion.category}
                      onChange={(e) => setNewDiscussion({ ...newDiscussion, category: e.target.value })}
                      className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm focus:outline-none focus:border-[#1f6feb]"
                    >
                      {categories.filter(c => c.id !== "ALL").map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Title</label>
                  <input
                    required
                    type="text"
                    value={newDiscussion.title}
                    onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                    placeholder="Brief summary of your topic..."
                    className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm focus:outline-none focus:border-[#1f6feb]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Content</label>
                  <textarea
                    required
                    value={newDiscussion.content}
                    onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                    placeholder="Elaborate on your topic. Supports Markdown..."
                    className="w-full px-4 py-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm h-48 focus:outline-none focus:border-[#1f6feb] resize-none font-mono"
                  />
                </div>
                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsComposerOpen(false)}
                    className="px-6 py-2 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newDiscussion.title || !newDiscussion.content}
                    className="px-8 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-green-900/20 disabled:opacity-50"
                  >
                    Post Discussion
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
