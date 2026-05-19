import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Layout, 
  Tag, 
  FileText, 
  AlertCircle,
  HelpCircle,
  FolderOpen
} from "lucide-react";
import API from "../api";

export default function ProjectsTab({ repoId }) {
  const [projects, setProjects] = useState([]);
  const [activeBoard, setActiveBoard] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Card creation states
  const [addingToCol, setAddingToCol] = useState(null); // column id
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardContent, setNewCardContent] = useState("");
  const [newCardType, setNewCardType] = useState("note");

  const fetchProjects = async () => {
    try {
      const res = await API.get(`/project-api/${repoId}`);
      setProjects(res.data);
      if (res.data.length > 0 && !activeBoard) {
        // Default to first board if activeBoard is not set
        setActiveBoard(res.data[0]);
      } else if (activeBoard) {
        // Sync active board with refreshed data
        const synced = res.data.find(b => b._id === activeBoard._id);
        setActiveBoard(synced || null);
      }
    } catch (err) {
      console.error("Failed to fetch project boards:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [repoId]);

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      const res = await API.post(`/project-api/${repoId}`, {
        name: newName,
        description: newDesc
      });
      setProjects([res.data.project, ...projects]);
      setActiveBoard(res.data.project);
      setIsCreating(false);
      setNewName("");
      setNewDesc("");
    } catch (err) {
      console.error("Failed to create board:", err);
    }
  };

  const handleDeleteBoard = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project board?")) return;

    try {
      await API.delete(`/project-api/board/${projectId}`);
      const updated = projects.filter(p => p._id !== projectId);
      setProjects(updated);
      setActiveBoard(updated.length > 0 ? updated[0] : null);
    } catch (err) {
      console.error("Failed to delete board:", err);
    }
  };

  const handleAddCard = async (colId) => {
    if (!newCardTitle.trim() || !activeBoard) return;

    const newCard = {
      id: Math.random().toString(36).substring(2, 9),
      title: newCardTitle,
      content: newCardContent,
      type: newCardType
    };

    const updatedColumns = activeBoard.columns.map(col => {
      if (col.id === colId) {
        return {
          ...col,
          cards: [...col.cards, newCard]
        };
      }
      return col;
    });

    try {
      const res = await API.put(`/project-api/board/${activeBoard._id}`, {
        columns: updatedColumns
      });
      setActiveBoard(res.data.project);
      // reset states
      setAddingToCol(null);
      setNewCardTitle("");
      setNewCardContent("");
      setNewCardType("note");
      // refresh lists
      fetchProjects();
    } catch (err) {
      console.error("Failed to add card:", err);
    }
  };

  const handleMoveCard = async (cardId, fromColId, direction) => {
    if (!activeBoard) return;

    const colIndex = activeBoard.columns.findIndex(c => c.id === fromColId);
    if (colIndex === -1) return;

    const newColIndex = colIndex + direction;
    if (newColIndex < 0 || newColIndex >= activeBoard.columns.length) return;

    const sourceCol = activeBoard.columns[colIndex];
    const targetCol = activeBoard.columns[newColIndex];
    const cardToMove = sourceCol.cards.find(c => c.id === cardId);

    if (!cardToMove) return;

    // Remove from source, add to target
    const updatedColumns = activeBoard.columns.map((col, idx) => {
      if (idx === colIndex) {
        return {
          ...col,
          cards: col.cards.filter(c => c.id !== cardId)
        };
      }
      if (idx === newColIndex) {
        return {
          ...col,
          cards: [...col.cards, cardToMove]
        };
      }
      return col;
    });

    try {
      const res = await API.put(`/project-api/board/${activeBoard._id}`, {
        columns: updatedColumns
      });
      setActiveBoard(res.data.project);
      fetchProjects();
    } catch (err) {
      console.error("Failed to move card:", err);
    }
  };

  const handleDeleteCard = async (cardId, colId) => {
    if (!activeBoard || !window.confirm("Delete this card?")) return;

    const updatedColumns = activeBoard.columns.map(col => {
      if (col.id === colId) {
        return {
          ...col,
          cards: col.cards.filter(c => c.id !== cardId)
        };
      }
      return col;
    });

    try {
      const res = await API.put(`/project-api/board/${activeBoard._id}`, {
        columns: updatedColumns
      });
      setActiveBoard(res.data.project);
      fetchProjects();
    } catch (err) {
      console.error("Failed to delete card:", err);
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
      {/* Board Selector & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div className="flex items-center gap-3">
          <Layout className="h-5 w-5 text-[#2f81f7]" />
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Project Boards</h2>
          {projects.length > 0 && (
            <select
              value={activeBoard?._id || ""}
              onChange={(e) => {
                const b = projects.find(p => p._id === e.target.value);
                setActiveBoard(b || null);
              }}
              className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-1.5 text-xs font-bold text-[var(--text-primary)] focus:outline-none"
            >
              {projects.map(b => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          )}
        </div>

        <div className="flex gap-2">
          {activeBoard && (
            <button
              onClick={() => handleDeleteBoard(activeBoard._id)}
              className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete Board
            </button>
          )}
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#238636] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#2ea043] transition-all"
          >
            <Plus className="h-4 w-4" /> New Board
          </button>
        </div>
      </div>

      {/* Creation Modal */}
      {isCreating && (
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Create a new Project Board</h3>
          <form onSubmit={handleCreateBoard} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Board Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Sprint Planning, Release roadmap"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-2.5 text-xs text-[var(--text-primary)] focus:border-[#2f81f7] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Description</label>
              <textarea
                placeholder="Optional description"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-2.5 text-xs text-[var(--text-primary)] focus:border-[#2f81f7] focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="rounded-xl border border-[var(--border-color)] bg-transparent px-4 py-2 font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#238636] px-4 py-2 font-bold text-white hover:bg-[#2ea043]"
              >
                Create Board
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Kanban Layout */}
      {activeBoard ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeBoard.columns.map((col, colIdx) => (
            <div key={col.id} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col min-h-[500px]">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#2f81f7]"></span>
                  <h4 className="text-xs font-bold text-[var(--text-primary)] tracking-wide uppercase">{col.name}</h4>
                  <span className="rounded-full bg-[var(--bg-tertiary)] px-2 py-0.5 text-[10px] text-[var(--text-secondary)] font-bold">
                    {col.cards.length}
                  </span>
                </div>
                <button
                  onClick={() => setAddingToCol(col.id)}
                  className="p-1 hover:bg-[var(--bg-tertiary)] rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Card Builder */}
              {addingToCol === col.id && (
                <div className="p-3 border-b border-[var(--border-color)] bg-[var(--bg-primary)] space-y-3">
                  <input
                    type="text"
                    placeholder="Card Title"
                    required
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-2 text-xs text-[var(--text-primary)] focus:outline-none"
                  />
                  <textarea
                    placeholder="Details or note content"
                    value={newCardContent}
                    onChange={(e) => setNewCardContent(e.target.value)}
                    rows={2}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-2 text-xs text-[var(--text-primary)] focus:outline-none"
                  />
                  <div className="flex justify-between items-center text-xs">
                    <select
                      value={newCardType}
                      onChange={(e) => setNewCardType(e.target.value)}
                      className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded p-1 text-[10px] text-[var(--text-secondary)] font-bold focus:outline-none"
                    >
                      <option value="note">Note</option>
                      <option value="issue">Issue</option>
                      <option value="pr">PR</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setAddingToCol(null)}
                        className="px-2 py-1 text-[10px] border border-[var(--border-color)] rounded hover:bg-[var(--bg-tertiary)]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAddCard(col.id)}
                        className="px-2 py-1 text-[10px] bg-[#238636] text-white rounded hover:bg-[#2ea043]"
                      >
                        Add Card
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Cards list */}
              <div className="p-3 flex-1 space-y-3 overflow-y-auto max-h-[600px]">
                {col.cards.length > 0 ? (
                  col.cards.map((card) => (
                    <div key={card.id} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4 space-y-2 hover:border-[#2f81f7]/50 shadow-sm transition-all group">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-1.5">
                          {card.type === "note" && <FileText className="h-3.5 w-3.5 text-orange-400" />}
                          {card.type === "issue" && <AlertCircle className="h-3.5 w-3.5 text-emerald-400" />}
                          {card.type === "pr" && <HelpCircle className="h-3.5 w-3.5 text-purple-400" />}
                          <span className="text-xs font-bold text-[var(--text-primary)]">{card.title}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteCard(card.id, col.id)}
                          className="opacity-0 group-hover:opacity-100 text-[var(--text-secondary)] hover:text-red-400 p-0.5 rounded transition-all"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>

                      {card.content && (
                        <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{card.content}</p>
                      )}

                      {/* Direction controls for moving columns */}
                      <div className="flex justify-between items-center pt-2 border-t border-[var(--border-color)]/30">
                        <button
                          disabled={colIdx === 0}
                          onClick={() => handleMoveCard(card.id, col.id, -1)}
                          className="p-1 hover:bg-[var(--bg-tertiary)] rounded-md text-[var(--text-secondary)] disabled:opacity-30"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-[9px] text-[var(--text-secondary)] font-bold tracking-wider uppercase">
                          Move Card
                        </span>
                        <button
                          disabled={colIdx === activeBoard.columns.length - 1}
                          onClick={() => handleMoveCard(card.id, col.id, 1)}
                          className="p-1 hover:bg-[var(--bg-tertiary)] rounded-md text-[var(--text-secondary)] disabled:opacity-30"
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-slate-600">
                    <FolderOpen className="h-8 w-8 opacity-20 mb-2" />
                    <p className="text-[10px] font-bold">No cards in this stage</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center border border-dashed border-[var(--border-color)] rounded-xl py-20 text-center">
          <Layout className="h-10 w-10 text-[var(--text-secondary)] opacity-30 mb-3" />
          <h4 className="text-sm font-bold text-[var(--text-primary)]">Welcome to Projects</h4>
          <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm">
            Keep track of features, roadmaps, issues, and ideas using our Kanban boards. Try creating your first board!
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="mt-4 rounded-xl bg-[#238636] px-4 py-2 text-xs font-bold text-white hover:bg-[#2ea043] transition-all"
          >
            Create first project board
          </button>
        </div>
      )}
    </div>
  );
}
