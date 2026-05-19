import { useState, useEffect } from "react";
import { Plus, Tag, Trash2, Edit2, Palette, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api";

export default function LabelManager({ repoId }) {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState({ name: "", color: "#2f81f7", description: "" });
  const [editingId, setEditingId] = useState(null);

  const colors = [
    "#2f81f7", "#238636", "#da3633", "#d29922", "#8957e5", "#db6d28", 
    "#0969da", "#1a7f37", "#cf222e", "#9a6700", "#8250df", "#bc4c00"
  ];

  const fetchLabels = async () => {
    try {
      const res = await API.get(`/label-api/repo/${repoId}`);
      setLabels(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabels();
  }, [repoId]);

  const handleCreate = async () => {
    if (!newLabel.name) return;
    try {
      await API.post("/label-api/create", { ...newLabel, repoId });
      setNewLabel({ name: "", color: "#2f81f7", description: "" });
      setIsAdding(false);
      fetchLabels();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this label?")) return;
    try {
      await API.delete(`/label-api/${id}`);
      fetchLabels();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[var(--text-primary)]">Repository Labels</h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg text-xs font-bold transition-all"
          >
            <Plus size={14} /> New Label
          </button>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-5 bg-[var(--bg-secondary)] border border-[#2f81f7]/30 rounded-xl space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-1.5">Label Name</label>
                <input
                  type="text"
                  value={newLabel.name}
                  onChange={(e) => setNewLabel({ ...newLabel, name: e.target.value })}
                  placeholder="e.g. bug, high priority"
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm focus:border-[#2f81f7] outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-1.5">Description</label>
                <input
                  type="text"
                  value={newLabel.description}
                  onChange={(e) => setNewLabel({ ...newLabel, description: e.target.value })}
                  placeholder="What does this label mean?"
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm focus:border-[#2f81f7] outline-none"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-1.5">Color</label>
                <div className="flex flex-wrap gap-2">
                  {colors.map(c => (
                    <button
                      key={c}
                      onClick={() => setNewLabel({ ...newLabel, color: c })}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${newLabel.color === c ? "border-white scale-110" : "border-transparent"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <div className="flex items-center gap-2 ml-2">
                    <input
                      type="color"
                      value={newLabel.color}
                      onChange={(e) => setNewLabel({ ...newLabel, color: e.target.value })}
                      className="w-8 h-8 rounded-lg bg-transparent border-none cursor-pointer"
                    />
                    <input
                      type="text"
                      value={newLabel.color}
                      onChange={(e) => setNewLabel({ ...newLabel, color: e.target.value })}
                      className="w-20 px-2 py-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-end gap-2">
                <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-xs font-bold text-[var(--text-secondary)]">Cancel</button>
                <button onClick={handleCreate} className="px-6 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg text-xs font-bold">Create Label</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="border border-[var(--border-color)] rounded-xl overflow-hidden divide-y divide-[var(--border-color)]">
        {loading ? (
          <div className="p-10 text-center animate-pulse">Loading labels...</div>
        ) : labels.length > 0 ? (
          labels.map(label => (
            <div key={label._id} className="p-4 bg-[var(--bg-secondary)] flex items-center justify-between hover:bg-[var(--bg-tertiary)] transition-all">
              <div className="flex items-center gap-4">
                <span 
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white shadow-sm"
                  style={{ backgroundColor: label.color }}
                >
                  {label.name}
                </span>
                <span className="text-xs text-[var(--text-secondary)] line-clamp-1">{label.description}</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(label._id)} className="p-1.5 text-[var(--text-secondary)] hover:text-red-500 transition-all"><Trash2 size={14} /></button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-10 text-center text-[var(--text-secondary)] flex flex-col items-center gap-3">
            <Tag size={32} className="opacity-20" />
            <p className="text-sm">No labels created yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
