import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../api";
import {
  Users, Settings, Plus, Mail, Trash2, Shield, Book,
  Activity, Lock, Globe, UserPlus, ArrowLeft, ChevronDown, Check, X,
  Clock, Search, Filter, MoreVertical, Layout
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import OrgMembersView from "./OrgMembersView";
import OrgTeamsView from "./OrgTeamsView";
import TopNavbar from "./TopNavbar";
import Sidebar from "./Sidebar";

const ROLES = ["OWNER", "COLLABORATOR", "VIEWER"];
const ROLE_COLORS = {
  OWNER: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  COLLABORATOR: "bg-green-500/20 text-green-400 border-green-500/30",
  VIEWER: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

function RoleBadge({ role }) {
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${ROLE_COLORS[role] || ROLE_COLORS.VIEWER}`}>
      {role}
    </span>
  );
}

export default function OrgDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [org, setOrg] = useState(null);
  const [members, setMembers] = useState([]);
  const [repos, setRepos] = useState([]);
  const [teams, setTeams] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("repositories");
  const [repoSearch, setRepoSearch] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Settings
  const [settingDesc, setSettingDesc] = useState("");
  const [settingVis, setSettingVis] = useState("PUBLIC");
  const [saving, setSaving] = useState(false);
  const [forceInviteOpen, setForceInviteOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchOrg = useCallback(async () => {
    try {
      // Fetch org first — if this fails, show "not found"
      const orgRes = await API.get(`/org-api/${id}`);
      const orgData = orgRes.data;
      setOrg(orgData);
      setSettingDesc(orgData.description || "");
      setSettingVis(orgData.visibility || "PUBLIC");

      // If the org response already includes members (from GET /:id), use them
      if (Array.isArray(orgData.members)) {
        setMembers(orgData.members);
      }

      // Also try the dedicated members endpoint for normalized data
      try {
        const memberRes = await API.get(`/org-api/${id}/members`);
        if (Array.isArray(memberRes.data) && memberRes.data.length > 0) {
          setMembers(memberRes.data);
        }
      } catch (memberErr) {
        console.warn("Members endpoint failed, using embedded members:", memberErr?.response?.data?.message);
        // Fall back to embedded org.members if already set above
      }
    } catch (err) {
      console.error("Failed to load org:", err?.response?.data || err.message);
      // org stays null → shows "Organization not found"
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchActivity = useCallback(async () => {
    try {
      const res = await API.get(`/org-api/${id}/activity`);
      setActivity(res.data);
    } catch (err) { console.error(err); }
  }, [id]);

  const fetchRepos = useCallback(async () => {
    try {
      const res = await API.get(`/org-api/${id}/repos`);
      setRepos(res.data);
    } catch (err) {
      console.warn("Repos fetch failed:", err?.response?.data?.message);
    }
  }, [id]);

  const fetchTeams = useCallback(async () => {
    try {
      const res = await API.get(`/team-api/org/${id}`);
      setTeams(res.data);
    } catch (err) {
      console.warn("Teams fetch failed:", err?.response?.data?.message);
    }
  }, [id]);

  useEffect(() => { fetchOrg(); }, [fetchOrg]);
  useEffect(() => { fetchRepos(); }, [fetchRepos]);
  useEffect(() => { fetchTeams(); }, [fetchTeams]);
  useEffect(() => {
    if (activeTab === "activity") fetchActivity();
  }, [activeTab, fetchActivity]);


  // Debounced search removed as it is now handled in OrgMembersView

  const myMembership = members.find(m => m.user?._id === user._id || m.user?._id?.toString() === user._id);
  const isOwner = org && (org.owner?._id === user._id || org.owner?._id?.toString() === user._id);
  const myRole = isOwner ? "OWNER" : myMembership?.role;
  const canManage = ["OWNER", "ADMIN"].includes(myRole);       // invite, remove, role changes
  const canCreateRepo = ["OWNER", "ADMIN", "MAINTAINER", "COLLABORATOR"].includes(myRole); // create repos

  const handleInvite = async (inviteData) => {
    try {
      await API.post(`/org-api/invite`, {
        orgId: id,
        usernameOrEmail: inviteData.usernameOrEmail,
        role: inviteData.role,
        customPermissions: inviteData.customPermissions
      });
      // fetchOrg(); // Optional: refresh members list
    } catch (err) {
      alert(err.response?.data?.message || "Error sending invitation");
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Remove this member?")) return;
    try {
      await API.delete(`/org-api/remove-member`, { data: { orgId: id, memberId } });
      setMembers(prev => prev.filter(m => m.user?._id !== memberId));
    } catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  const handleChangeRole = async (memberId, newRole) => {
    try {
      await API.patch(`/org-api/change-role`, { orgId: id, memberId, newRole });
      setMembers(prev => prev.map(m => m.user?._id === memberId ? { ...m, role: newRole } : m));
    } catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await API.patch(`/org-api/${id}/update`, { description: settingDesc, visibility: settingVis });
      alert("✅ Organization updated");
      fetchOrg();
    } catch (err) { alert(err.response?.data?.message || "Error"); }
    finally { setSaving(false); }
  };

  const handleDeleteOrg = async () => {
    if (!window.confirm(`Delete "${org?.name}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/org-api/${id}`);
      navigate("/dashboard");
    } catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[var(--bg-primary)] transition-colors">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1f6feb]" />
    </div>
  );

  if (!org) return (
    <div className="flex h-screen items-center justify-center bg-[var(--bg-primary)] transition-colors">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Organization not found</h1>
        <button onClick={() => navigate("/dashboard")} className="text-[#2f81f7] hover:underline">Return to dashboard</button>
      </div>
    </div>
  );

  const filteredRepos = repos.filter(r =>
    !repoSearch || r.name?.toLowerCase().includes(repoSearch.toLowerCase())
  );
  const filteredMembers = members.filter(m =>
    !memberSearch || m.user?.username?.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const tabs = [
    { id: "repositories", label: "Repositories", icon: <Book size={16} />, count: repos.length },
    { id: "members", label: "People", icon: <Users size={16} />, count: members.length },
    { id: "teams", label: "Teams", icon: <Users size={16} />, count: teams.length },
    { id: "activity", label: "Activity", icon: <Activity size={16} /> },
    ...(canManage ? [{ id: "settings", label: "Settings", icon: <Settings size={16} /> }] : []),
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans pb-20 transition-colors">
      <TopNavbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} title={org.name} />
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Header */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] pt-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4">
            <ArrowLeft size={14} /> Back to Dashboard
          </button>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] flex items-center justify-center text-2xl font-bold text-[var(--text-primary)] overflow-hidden">
                {org.logo ? <img src={org.logo} alt={org.name} className="h-full w-full object-cover" /> : org.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-[var(--text-primary)]">{org.name}</h1>
                  <span className="rounded-full border border-[var(--border-color)] px-2 py-0.5 text-xs text-[var(--text-secondary)] flex items-center gap-1">
                    {org.visibility === "PRIVATE" ? <Lock size={10} /> : <Globe size={10} />}
                    {org.visibility}
                  </span>
                  {myRole && <RoleBadge role={myRole} />}
                </div>
                {org.description && <p className="text-sm text-[var(--text-secondary)] mt-0.5">{org.description}</p>}
                <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)] mt-1">
                  <span className="flex items-center gap-1"><Users size={12} />{members.length} members</span>
                  <span className="flex items-center gap-1"><Book size={12} />{repos.length} repos</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {canCreateRepo && (
                <Link to={`/create-repo?orgId=${org._id}&orgName=${encodeURIComponent(org.name)}`}
                  className="flex items-center gap-1.5 rounded-md bg-[#238636] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#2ea043] transition-all">
                  <Plus size={16} /> New repository
                </Link>
              )}
              {canManage && (
                <button onClick={() => { setActiveTab("members"); setForceInviteOpen(true); }}
                  className="flex items-center gap-1.5 rounded-md bg-[var(--bg-tertiary)] border border-[var(--border-color)] px-3 py-1.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors">
                  <UserPlus size={16} /> Invite
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-3 pb-3 text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}>
                {tab.icon}{tab.label}
                {tab.count !== undefined && (
                  <span className="ml-1 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] px-1.5 py-0.5 text-xs">{tab.count}</span>
                )}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f78166]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-6">

        {/* REPOSITORIES */}
        {activeTab === "repositories" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <input type="text" placeholder="Find a repository…"
                value={repoSearch} onChange={e => setRepoSearch(e.target.value)}
                className="w-full sm:max-w-xs rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] px-3 py-1.5 text-sm focus:border-[#1f6feb] focus:outline-none" />
            </div>
            <div className="divide-y divide-[var(--border-color)] border border-[var(--border-color)] rounded-md overflow-hidden transition-all">
              {filteredRepos.length > 0 ? filteredRepos.map(repo => (
                <div key={repo._id} className="py-4 px-5 flex items-start justify-between bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link to={`/repo/${repo._id}`} className="font-bold text-[#2f81f7] hover:underline">{repo.name}</Link>
                      <span className="rounded-full border border-[var(--border-color)] px-2 py-0.5 text-[10px] uppercase text-[var(--text-secondary)] font-bold">
                        {repo.visibility || (repo.isPrivate ? "PRIVATE" : "PUBLIC")}
                      </span>
                    </div>
                    {repo.description && <p className="text-xs text-[var(--text-secondary)]">{repo.description}</p>}
                    <p className="text-xs text-[var(--text-secondary)]">Updated {new Date(repo.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              )) : (
                <div className="py-16 text-center bg-[var(--bg-primary)]">
                  <Book className="mx-auto h-10 w-10 text-[var(--border-color)] mb-3" />
                  <p className="text-[var(--text-primary)] font-semibold">No repositories yet</p>
                  {canCreateRepo ? (
                    <Link
                      to={`/create-repo?orgId=${org._id}&orgName=${encodeURIComponent(org.name)}`}
                      className="mt-4 inline-block rounded-md bg-[#238636] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#2ea043]">
                      Create first repository
                    </Link>
                  ) : (
                    <p className="mt-2 text-xs text-[var(--text-secondary)]">
                      Ask an Owner or Admin to create a repository for this organization.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "members" && (
          <OrgMembersView
            orgId={id}
            members={members}
            onRemove={handleRemoveMember}
            onChangeRole={handleChangeRole}
            onInvite={handleInvite}
            currentUserId={user._id}
            isLoading={loading}
            forceOpenInvite={forceInviteOpen}
            onCloseInvite={() => setForceInviteOpen(false)}
          />
        )}

        {activeTab === "teams" && (
          <OrgTeamsView
            orgId={id}
            teams={teams}
            canManage={canManage}
            onRefresh={fetchTeams}
          />
        )}



        {/* ACTIVITY */}
        {activeTab === "activity" && (
          <div className="space-y-2">
            {activity.length > 0 ? activity.map(log => (
              <div key={log._id} className="flex items-start gap-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-md px-4 py-3 hover:bg-[var(--bg-tertiary)] transition-colors">
                <img src={log.user?.profileImageUrl || `https://ui-avatars.com/api/?name=${log.user?.username}&background=random`}
                  className="h-7 w-7 rounded-full border border-[var(--border-color)] mt-0.5" alt="" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--text-primary)]">
                    <span className="font-semibold text-[var(--text-primary)]">{log.user?.username}</span>{" "}
                    {log.message}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">{new Date(log.createdAt).toLocaleString()}</p>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-20 text-[var(--text-secondary)]">
                <Activity className="h-12 w-12 mb-3 opacity-20" />
                <p>No activity logs yet</p>
              </div>
            )}
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === "settings" && canManage && (
          <div className="max-w-2xl space-y-8">
            <section>
              <h3 className="text-base font-semibold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2 mb-4">Organization profile</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1 text-[var(--text-secondary)]">Organization name</label>
                  <input type="text" value={org.name} disabled
                    className="w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-1.5 text-sm opacity-60 cursor-not-allowed" />
                  <p className="text-xs text-[var(--text-secondary)] mt-1">Contact support to rename an organization.</p>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-[var(--text-secondary)]">Description</label>
                  <textarea value={settingDesc} onChange={e => setSettingDesc(e.target.value)}
                    className="w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] px-3 py-1.5 text-sm h-24 focus:border-[#1f6feb] focus:outline-none resize-none" />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-[var(--text-secondary)]">Visibility</label>
                  <div className="flex gap-3">
                    {["PUBLIC", "PRIVATE"].map(v => (
                      <label key={v} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={settingVis === v} onChange={() => setSettingVis(v)} />
                        <span className="text-sm text-[var(--text-primary)] flex items-center gap-1">
                          {v === "PRIVATE" ? <Lock size={13} /> : <Globe size={13} />} {v}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <button onClick={handleSaveSettings} disabled={saving}
                  className="rounded-md bg-[#238636] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#2ea043] disabled:opacity-50 transition-all">
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </section>

            {isOwner && (
              <section className="pt-6 border-t border-red-500/20">
                <h3 className="text-base font-semibold text-red-500 mb-3">Danger Zone</h3>
                <div className="border border-red-500/20 rounded-md p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white text-sm">Delete this organization</p>
                    <p className="text-xs text-[#8b949e]">Once deleted, there is no going back.</p>
                  </div>
                  <button onClick={handleDeleteOrg}
                    className="rounded-md border border-red-500/50 px-3 py-1.5 text-sm font-semibold text-red-500 hover:bg-red-500 hover:text-white transition-all">
                    Delete
                  </button>
                </div>
              </section>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
