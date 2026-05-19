import { useState } from "react";
import { Plus, Search, Users, Shield, MoreHorizontal, Settings, Trash2, Globe, Lock, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api";

export default function OrgTeamsView({ orgId, teams, canManage, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: "", description: "", visibility: "VISIBLE" });
  const [loading, setLoading] = useState(false);

  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/team-api/create", {
        ...newTeam,
        organizationId: orgId
      });
      setIsCreateModalOpen(false);
      setNewTeam({ name: "", description: "", visibility: "VISIBLE" });
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating team");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
          <input
            type="text"
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md text-sm focus:outline-none focus:border-[#1f6feb] transition-colors"
          />
        </div>
        {canManage && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-md text-sm font-semibold transition-all"
          >
            <Plus size={18} /> New Team
          </button>
        )}
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredTeams.length > 0 ? (
            filteredTeams.map((team) => (
              <motion.div
                key={team._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group p-5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl hover:border-[#1f6feb]/50 transition-all cursor-pointer relative"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#1f6feb]/10 rounded-lg flex items-center justify-center border border-[#1f6feb]/20 overflow-hidden">
                      {team.avatar ? (
                        <img src={team.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Users className="text-[#2f81f7]" size={24} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--text-primary)] group-hover:text-[#2f81f7] transition-colors">
                        {team.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-wider">
                          {team.visibility === "VISIBLE" ? <Globe size={10} /> : <Lock size={10} />}
                          {team.visibility}
                        </span>
                        <span className="text-[var(--border-color)] text-xs">•</span>
                        <span className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-wider flex items-center gap-1">
                          <Users size={10} /> {team.members?.length || 0} Members
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-md transition-all">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
                
                <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4 h-10">
                  {team.description || "No description provided."}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
                  <div className="flex -space-x-2">
                    {team.members?.slice(0, 5).map((m, i) => (
                      <img
                        key={i}
                        src={m.user?.profileImageUrl || `https://ui-avatars.com/api/?name=${m.user?.username}&background=random`}
                        className="w-6 h-6 rounded-full border-2 border-[var(--bg-secondary)]"
                        title={m.user?.username}
                        alt=""
                      />
                    ))}
                    {team.members?.length > 5 && (
                      <div className="w-6 h-6 rounded-full border-2 border-[var(--bg-secondary)] bg-[var(--bg-tertiary)] flex items-center justify-center text-[10px] text-[var(--text-secondary)] font-bold">
                        +{team.members.length - 5}
                      </div>
                    )}
                  </div>
                  <button className="flex items-center gap-1 text-xs text-[#2f81f7] hover:underline font-medium">
                    View details <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-[var(--bg-secondary)] border border-dashed border-[var(--border-color)] rounded-xl">
              <Users className="mx-auto h-12 w-12 text-[var(--border-color)] mb-4" />
              <h3 className="text-lg font-bold text-[var(--text-primary)]">No teams found</h3>
              <p className="text-[var(--text-secondary)] text-sm mt-1 max-w-xs mx-auto">
                {searchTerm ? "Try adjusting your search terms." : "Teams help you organize people and manage permissions across repositories."}
              </p>
              {!searchTerm && canManage && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-6 px-6 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-md text-sm font-semibold transition-all"
                >
                  Create your first team
                </button>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Team Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Create new team</h3>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>
              <form onSubmit={handleCreateTeam} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Team name</label>
                  <input
                    required
                    type="text"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                    placeholder="e.g. Engineering, Marketing"
                    className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm focus:outline-none focus:border-[#1f6feb] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Description (optional)</label>
                  <textarea
                    value={newTeam.description}
                    onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                    placeholder="What is this team for?"
                    className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm h-24 focus:outline-none focus:border-[#1f6feb] transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Visibility</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewTeam({ ...newTeam, visibility: "VISIBLE" })}
                      className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${
                        newTeam.visibility === "VISIBLE" 
                          ? "bg-[#1f6feb]/10 border-[#1f6feb] text-[#2f81f7]" 
                          : "bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]"
                      }`}
                    >
                      <Globe size={18} />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">Visible</span>
                        <span className="text-[10px] opacity-70">Anyone in org can see</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTeam({ ...newTeam, visibility: "SECRET" })}
                      className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${
                        newTeam.visibility === "SECRET" 
                          ? "bg-amber-500/10 border-amber-500 text-amber-500" 
                          : "bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]"
                      }`}
                    >
                      <Lock size={18} />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">Secret</span>
                        <span className="text-[10px] opacity-70">Only members can see</span>
                      </div>
                    </button>
                  </div>
                </div>
                <div className="pt-4 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 px-4 py-2 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg text-sm font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={loading || !newTeam.name}
                    type="submit"
                    className="flex-1 px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                  >
                    {loading ? "Creating..." : "Create team"}
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
