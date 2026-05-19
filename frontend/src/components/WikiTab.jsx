import React, { useState, useEffect } from "react";
import { 
  Book, 
  Plus, 
  Edit3, 
  Trash2, 
  FileText, 
  BookOpen,
  Calendar,
  User
} from "lucide-react";
import API from "../api";

export default function WikiTab({ repoId }) {
  const [pages, setPages] = useState([]);
  const [activePage, setActivePage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Edit / Create fields
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const fetchPages = async () => {
    try {
      const res = await API.get(`/wiki-api/${repoId}`);
      setPages(res.data);
      if (res.data.length > 0 && !activePage) {
        setActivePage(res.data[0]);
      } else if (activePage) {
        // Sync active page
        const synced = res.data.find(p => p._id === activePage._id);
        setActivePage(synced || res.data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch wiki pages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [repoId]);

  const handleStartCreate = () => {
    setTitle("");
    setContent("");
    setIsEditing(true);
  };

  const handleStartEdit = () => {
    if (!activePage) return;
    setTitle(activePage.title);
    setContent(activePage.content);
    setIsEditing(true);
  };

  const handleSavePage = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await API.post(`/wiki-api/${repoId}`, {
        title,
        content
      });
      setIsEditing(false);
      setActivePage(res.data.page);
      fetchPages();
    } catch (err) {
      console.error("Failed to save wiki page:", err);
    }
  };

  const handleDeletePage = async () => {
    if (!activePage || !window.confirm(`Delete page "${activePage.title}"?`)) return;

    try {
      await API.delete(`/wiki-api/page/${repoId}/${activePage.slug}`);
      const updated = pages.filter(p => p._id !== activePage._id);
      setPages(updated);
      setActivePage(updated.length > 0 ? updated[0] : null);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to delete wiki page:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2f81f7] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div className="flex items-center gap-3">
          <Book className="h-5 w-5 text-[#2f81f7]" />
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Wiki Documentation</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Maintain internal documentation, manuals, API specifications, and notes.</p>
          </div>
        </div>

        <div className="flex gap-2">
          {activePage && !isEditing && (
            <>
              <button
                onClick={handleStartEdit}
                className="flex items-center gap-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-1.5 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all"
              >
                <Edit3 className="h-3.5 w-3.5" /> Edit Page
              </button>
              <button
                onClick={handleDeletePage}
                className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </>
          )}
          {!isEditing && (
            <button
              onClick={handleStartCreate}
              className="flex items-center gap-1.5 rounded-xl bg-[#238636] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#2ea043] transition-all"
            >
              <Plus className="h-4 w-4" /> New Page
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        /* Edit / Create Form */
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 space-y-4">
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            {activePage && title === activePage.title ? "Edit Wiki Page" : "Create a new Wiki Page"}
          </h3>
          <form onSubmit={handleSavePage} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Page Title</label>
              <input
                type="text"
                required
                placeholder="e.g. API-Endpoints, Getting-Started"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-2.5 text-xs text-[var(--text-primary)] focus:border-[#2f81f7] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Content (supports Markdown)</label>
              <textarea
                placeholder="Write your documentation details here..."
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className="w-full font-mono rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-2.5 text-xs text-[var(--text-primary)] focus:border-[#2f81f7] focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-xl border border-[var(--border-color)] bg-transparent px-4 py-2 font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#238636] px-4 py-2 font-bold text-white hover:bg-[#2ea043]"
              >
                Save Page
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* View Layout (Sidebar + Detail) */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden">
            <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/20">
              <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Pages</h3>
            </div>
            <div className="divide-y divide-[var(--border-color)] max-h-[400px] overflow-y-auto">
              {pages.length > 0 ? (
                pages.map(p => (
                  <button
                    key={p._id}
                    onClick={() => {
                      setActivePage(p);
                      setIsEditing(false);
                    }}
                    className={`w-full flex items-center gap-2 p-3.5 text-left text-xs font-bold transition-all hover:bg-[var(--bg-tertiary)] ${
                      activePage?._id === p._id ? "text-[#2f81f7] bg-[#2f81f7]/5 font-extrabold" : "text-[var(--text-secondary)]"
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    <span className="truncate">{p.title}</span>
                  </button>
                ))
              ) : (
                <div className="p-6 text-center text-slate-500 italic text-[11px]">
                  No wiki pages found.
                </div>
              )}
            </div>
          </div>

          {/* Details Content Viewer */}
          <div className="md:col-span-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 md:p-8 space-y-6">
            {activePage ? (
              <div className="space-y-6">
                <div className="border-b border-[var(--border-color)] pb-4 space-y-2">
                  <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">{activePage.title}</h1>
                  <div className="flex flex-wrap gap-4 text-[10px] text-[var(--text-secondary)] font-medium">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3 w-3" /> Updated by <span className="text-[var(--text-primary)] font-bold">{activePage.updatedBy?.username || "Developer"}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" /> Last updated: {new Date(activePage.updatedAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Render simple markdown layout */}
                <div className="prose prose-invert max-w-none text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">
                  {activePage.content || <p className="italic text-slate-500">This page is empty.</p>}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500">
                <BookOpen className="h-10 w-10 opacity-20 mb-3" />
                <h4 className="text-xs font-bold text-[var(--text-primary)]">Welcome to the Wiki</h4>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1 max-w-sm">
                  Add clear documentation templates for developers, installation checklists, code design principles, and guidelines.
                </p>
                <button
                  onClick={handleStartCreate}
                  className="mt-4 rounded-xl bg-[#238636] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#2ea043] transition-all"
                >
                  Create first wiki page
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
