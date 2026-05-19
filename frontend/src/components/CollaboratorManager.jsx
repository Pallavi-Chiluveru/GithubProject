import { useState, useEffect } from "react";
import API from "../api";
import { 
  Users, 
  Search, 
  UserPlus, 
  Shield, 
  User, 
  Trash2, 
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  History,
  AlertCircle
} from "lucide-react";

const ROLE_COLORS = {
  OWNER: "text-red-500 bg-red-500/10 border-red-500/20",
  MAINTAINER: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  DEVELOPER: "text-blue-500 bg-blue-500/10 border-blue-500/20"
};

const ROLE_BADGES = {
  OWNER: <Shield size={12} className="mr-1" />,
  MAINTAINER: <ShieldAlert size={12} className="mr-1" />,
  DEVELOPER: <User size={12} className="mr-1" />
};

export default function CollaboratorManager({ repoId, isOwner }) {
  const [collabs, setCollabs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [inviteRole, setInviteRole] = useState("DEVELOPER");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("members"); // members, activity

  useEffect(() => {
    fetchData();
  }, [repoId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [collabRes, activityRes] = await Promise.all([
        API.get(`/collab-api/repo/${repoId}`),
        API.get(`/collab-api/activity/${repoId}`)
      ]);
      setCollabs(collabRes.data);
      setActivities(activityRes.data);
    } catch (err) {
      console.error("Failed to fetch collaboration data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (val) => {
    setSearchQuery(val);
    if (val.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await API.get(`/collab-api/search-users?query=${val}&repoId=${repoId}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInvite = async () => {
    if (!selectedUser) return;
    setInviteLoading(true);
    try {
      await API.post(`/collab-api/invite/${repoId}`, {
        userId: selectedUser._id,
        role: inviteRole
      });
      setShowInviteModal(false);
      setSelectedUser(null);
      setSearchQuery("");
      setSearchResults([]);
      fetchData();
      alert("Invitation sent successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send invitation");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemove = async (collabId, username) => {
    if (!window.confirm(`Are you sure you want to remove ${username} from this repository?`)) return;
    try {
      await API.delete(`/collab-api/remove/${collabId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove collaborator");
    }
  };

  const handleUpdateRole = async (collabId, newRole) => {
    try {
      await API.patch(`/collab-api/update/${collabId}`, { role: newRole });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update role");
    }
  };

  if (loading && collabs.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-blue-500" />
            Manage Access
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Control who can view and contribute to this repository.
          </p>
        </div>
        {isOwner && (
          <button 
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-blue-600/20"
          >
            <UserPlus size={16} />
            Add Collaborator
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-800">
        <button 
          onClick={() => setActiveTab("members")}
          className={`px-4 py-2 text-sm font-medium transition-all relative ${activeTab === "members" ? "text-blue-500" : "text-slate-400 hover:text-slate-200"}`}
        >
          Collaborators
          {activeTab === "members" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />}
        </button>
        <button 
          onClick={() => setActiveTab("activity")}
          className={`px-4 py-2 text-sm font-medium transition-all relative ${activeTab === "activity" ? "text-blue-500" : "text-slate-400 hover:text-slate-200"}`}
        >
          Activity Log
          {activeTab === "activity" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />}
        </button>
      </div>

      {activeTab === "members" ? (
        <div className="space-y-6">
          {/* Members Table */}
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/30 backdrop-blur-md">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {collabs.map((collab) => (
                  <tr key={collab._id} className="group hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {collab.userId?.profileImageUrl ? (
                            <img src={collab.userId.profileImageUrl} alt="" className="h-10 w-10 rounded-full border border-slate-700 object-cover" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center">
                              <User size={20} className="text-slate-400" />
                            </div>
                          )}
                          {collab.status === "pending" && (
                            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center">
                              <Clock size={8} className="text-amber-500" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white">{collab.userId?.username}</p>
                          <p className="text-xs text-slate-500">{collab.userId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-tight ${ROLE_COLORS[collab.role] || "text-slate-400 border-slate-700"}`}>
                        {ROLE_BADGES[collab.role]}
                        {collab.role}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {collab.status === "accepted" ? (
                        <span className="flex items-center text-xs text-emerald-500 gap-1.5">
                          <CheckCircle2 size={14} />
                          Active
                        </span>
                      ) : collab.status === "pending" ? (
                        <span className="flex items-center text-xs text-amber-500 gap-1.5">
                          <Clock size={14} />
                          Pending
                        </span>
                      ) : (
                        <span className="flex items-center text-xs text-slate-500 gap-1.5">
                          <XCircle size={14} />
                          {collab.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isOwner && !collab.isPermanentOwner && (
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <select 
                            onChange={(e) => handleUpdateRole(collab._id, e.target.value)}
                            value={collab.role}
                            className="bg-slate-950 border border-slate-800 text-xs rounded px-2 py-1 outline-none focus:border-blue-500 font-semibold"
                          >
                            <option value="OWNER">OWNER</option>
                            <option value="MAINTAINER">MAINTAINER</option>
                            <option value="DEVELOPER">DEVELOPER</option>
                          </select>
                          <button 
                            onClick={() => handleRemove(collab._id, collab.userId?.username)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            title="Remove collaborator"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                      {collab.isPermanentOwner && (
                        <span className="text-xs text-slate-500 italic">Repository Owner</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Activity Log Section */
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/20 rounded-xl border border-dashed border-slate-800">
              <History size={40} className="mx-auto text-slate-700 mb-4" />
              <p className="text-slate-500">No collaboration activity logged yet.</p>
            </div>
          ) : (
            <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {activities.map((act) => (
                <div key={act._id} className="relative">
                  <div className="absolute -left-[27px] top-1 h-5 w-5 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center z-10">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  </div>
                  <div className="flex items-start gap-3">
                    {act.user?.profileImageUrl ? (
                      <img src={act.user.profileImageUrl} alt="" className="h-8 w-8 rounded-full border border-slate-700" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                        <User size={14} className="text-slate-400" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-slate-200">
                        <span className="font-bold">{act.user?.username}</span> {act.message}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(act.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="text-blue-500" size={20} />
                Add Collaborator
              </h3>
              <button 
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Search Section */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Search Users</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search by username or email..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-blue-500 outline-none"
                  />
                </div>

                {/* Search Results Dropdown */}
                {searchQuery.length >= 2 && (
                  <div className="mt-2 rounded-lg border border-slate-800 bg-slate-950 max-h-48 overflow-y-auto divide-y divide-slate-800 shadow-xl font-medium">
                    {isSearching ? (
                      <div className="p-4 text-center text-xs text-slate-500">Searching...</div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500 italic flex items-center justify-center gap-2">
                        <AlertCircle size={14} />
                        No users found
                      </div>
                    ) : (
                      searchResults.map(user => (
                        <button
                          key={user._id}
                          onClick={() => { setSelectedUser(user); setSearchQuery(""); setSearchResults([]); }}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-900 text-left transition-colors"
                        >
                          {user.profileImageUrl ? (
                            <img src={user.profileImageUrl} className="h-8 w-8 rounded-full" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center">
                              <User size={14} className="text-slate-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-bold text-white">{user.username}</p>
                            <p className="text-[11px] text-slate-500">{user.email}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Selected User Preview */}
              {selectedUser && (
                <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedUser.profileImageUrl ? (
                      <img src={selectedUser.profileImageUrl} className="h-10 w-10 rounded-full" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center">
                        <User size={16} className="text-slate-400" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-white">{selectedUser.username}</p>
                      <p className="text-xs text-slate-400">{selectedUser.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="text-slate-500 hover:text-red-500"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              )}

              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Role</label>
                <div className="grid grid-cols-3 gap-3">
                  {["OWNER", "MAINTAINER", "DEVELOPER"].map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setInviteRole(role)}
                      className={`px-3 py-3 rounded-xl border text-left transition-all ${inviteRole === role ? "bg-blue-600/10 border-blue-600 text-white animate-pulse-subtle" : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700"}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        {ROLE_BADGES[role]}
                        <span className="text-xs font-bold">{role}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight font-medium">
                        {role === "OWNER" ? "Full access & admin rights." : role === "MAINTAINER" ? "Can write, merge and manage." : "Can push and create PRs."}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-800 flex gap-3">
              <button 
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleInvite}
                disabled={!selectedUser || inviteLoading}
                className="flex-2 px-8 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:shadow-none"
              >
                {inviteLoading ? "Sending..." : "Send Invitation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
