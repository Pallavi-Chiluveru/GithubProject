import { useState, useEffect } from "react";
import {
  User,
  Settings,
  Layout,
  Bell,
  Lock,
  CreditCard,
  Mail,
  Key,
  Building,
  Users,
  Shield,
  ChevronRight,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Check,
  X,
} from "lucide-react";
import API from "../api";
import { useNavigate, useLocation } from "react-router-dom";
import { defaultAppearance, useTheme } from "../theme/ThemeContext";
import SettingsLayout from "./SettingsLayout";

const SECTIONS = [
  { id: "profile", icon: User, label: "Public profile" },
  { id: "account", icon: Settings, label: "Account" },
  { id: "appearance", icon: Layout, label: "Appearance" },
  { id: "notifications", icon: Bell, label: "Notifications" },
  { section: "ACCESS" },
  { id: "emails", icon: Mail, label: "Emails" },
  { id: "password", icon: Lock, label: "Password and authentication" },
  { id: "sessions", icon: Shield, label: "Sessions" },
  { id: "ssh", icon: Key, label: "SSH and GPG keys" },
  { id: "organizations", icon: Building, label: "Organizations", path: "/settings/organizations" },
];

function Toast({ msg, ok }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-xl transition-all ${
        ok ? "bg-[#238636] text-white" : "bg-[#da3633] text-white"
      }`}
    >
      {ok ? <Check size={16} /> : <X size={16} />} {msg}
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAppearance: setGlobalAppearance } = useTheme();
  const [active, setActive] = useState("profile");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  // Forms state
  const [profile, setProfile] = useState({ username: "", gitname: "", bio: "", profileImageUrl: "" });
  const [emailForm, setEmailForm] = useState({ email: "", password: "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [sshKeys, setSshKeys] = useState([]);
  const [sshForm, setSshForm] = useState({ title: "", key: "" });
  const [notifPrefs, setNotifPrefs] = useState({
    emailOnMention: true,
    emailOnReview: true,
    emailOnPush: false,
    webNotifications: true,
  });
  const [appearance, setAppearance] = useState({ theme: "light", fontSize: "medium" });
  const [deletePassword, setDeletePassword] = useState("");
  const [confirmDelete, setConfirmDelete] = useState("");

  const showToastMsg = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  // Initial data fetch
  useEffect(() => {
    API.get("/user-api/me")
      .then((res) => {
        const u = res.data;
        setUser(u);
        setProfile({ username: u.username || "", gitname: u.gitname || "", bio: u.bio || "", profileImageUrl: u.profileImageUrl || "" });
        setEmailForm((f) => ({ ...f, email: u.email || "" }));
        setNotifPrefs(u.notificationPrefs || notifPrefs);
        setAppearance(u.appearance || defaultAppearance);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    API.get("/user-api/ssh-keys").then((res) => setSshKeys(res.data || [])).catch(() => {});
  }, []);

  // Sync theme globally
  useEffect(() => {
    setGlobalAppearance(appearance);
  }, [appearance]);

  // Determine active tab from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab && SECTIONS.find((s) => s.id === tab)) {
      setActive(tab);
    } else {
      const segment = location.pathname.split("/").pop();
      if (SECTIONS.some((s) => s.id === segment)) setActive(segment);
    }
  }, [location.pathname]);

  const navTo = (item) => {
    if (item.path) {
      navigate(item.path);
      return;
    }
    setActive(item.id);
  };

  // Save actions
  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await API.put("/user-api/profile", profile);
      const updated = { ...JSON.parse(localStorage.getItem("user") || "{}"), ...res.data.user };
      localStorage.setItem("user", JSON.stringify(updated));
      showToastMsg("Profile updated!");
    } catch (e) {
      showToastMsg(e.response?.data?.message || "Failed", false);
    } finally {
      setSaving(false);
    }
  };

  const saveEmail = async () => {
    setSaving(true);
    try {
      await API.put("/user-api/email", emailForm);
      showToastMsg("Email updated!");
      setEmailForm((f) => ({ ...f, password: "" }));
    } catch (e) {
      showToastMsg(e.response?.data?.message || "Failed", false);
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirm) return showToastMsg("Passwords don't match", false);
    if (pwForm.newPassword.length < 6) return showToastMsg("Minimum 6 characters", false);
    setSaving(true);
    try {
      await API.put("/user-api/password", {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      showToastMsg("Password changed!");
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (e) {
      showToastMsg(e.response?.data?.message || "Failed", false);
    } finally {
      setSaving(false);
    }
  };

  const addSshKey = async () => {
    if (!sshForm.title || !sshForm.key) return showToastMsg("Title and key required", false);
    setSaving(true);
    try {
      const res = await API.post("/user-api/ssh-keys", sshForm);
      setSshKeys(res.data.sshKeys);
      setSshForm({ title: "", key: "" });
      showToastMsg("SSH key added!");
    } catch (e) {
      showToastMsg(e.response?.data?.message || "Failed", false);
    } finally {
      setSaving(false);
    }
  };

  const deleteSshKey = async (id) => {
    try {
      const res = await API.delete(`/user-api/ssh-keys/${id}`);
      setSshKeys(res.data.sshKeys);
      showToastMsg("SSH key removed!");
    } catch (e) {
      showToastMsg("Failed to remove key", false);
    }
  };

  const saveNotifs = async () => {
    setSaving(true);
    try {
      await API.put("/user-api/notifications", notifPrefs);
      showToastMsg("Notification preferences saved!");
    } catch (e) {
      showToastMsg("Failed", false);
    } finally {
      setSaving(false);
    }
  };

  const applyAppearance = (prefs) => {
    if (prefs.theme === "light") {
      document.documentElement.classList.remove("dark-theme");
    } else {
      document.documentElement.classList.add("dark-theme");
    }
    const sizeMap = { small: "14px", medium: "16px", large: "18px" };
    document.documentElement.style.fontSize = sizeMap[prefs.fontSize] || "16px";
  };

  useEffect(() => {
    applyAppearance(appearance);
  }, [appearance]);

  const saveAppearance = async () => {
    setSaving(true);
    try {
      await API.put("/user-api/appearance", appearance);
      const updated = { ...JSON.parse(localStorage.getItem("user") || "{}"), appearance };
      localStorage.setItem("user", JSON.stringify(updated));
      showToastMsg("Appearance saved!");
    } catch (e) {
      showToastMsg("Failed", false);
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    if (confirmDelete !== user?.username) return showToastMsg("Username doesn't match", false);
    if (!window.confirm("This is permanent. Are you absolutely sure?")) return;
    try {
      await API.delete("/user-api/account", { data: { password: deletePassword } });
      localStorage.clear();
      window.location.href = "/";
    } catch (e) {
      showToastMsg(e.response?.data?.message || "Failed", false);
    }
  };

  const inputCls = "w-full rounded-md border border-[#30363d] bg-[var(--bg-color)] px-3 py-2 text-sm text-[var(--text-color)] placeholder-[#8b949e] focus:border-[#58a6ff] focus:outline-none";
  const btnPrimary = "rounded-md bg-[#238636] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#2ea043] disabled:opacity-50";
  const btnDanger = "rounded-md bg-[#da3633] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#f85149]";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-color)]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#ec4899]" />
      </div>
    );
  }

  return (
    <SettingsLayout active={active} setActive={setActive} user={user}>
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}
      {/* Profile */}
      {active === "profile" && (
        <div className="space-y-6">
          <h1 className="text-xl font-semibold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-4">
            Public profile
          </h1>
          <div className="grid gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#8b949e] mb-1">Name</label>
              <input
                className={inputCls}
                value={profile.username}
                onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8b949e] mb-1">Git username</label>
              <input
                className={inputCls}
                value={profile.gitname}
                onChange={(e) => setProfile((p) => ({ ...p, gitname: e.target.value }))}
                placeholder="@githandle"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8b949e] mb-1">Bio</label>
              <textarea
                rows={3}
                className={inputCls + " resize-none"}
                value={profile.bio}
                onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                placeholder="Tell us a little about yourself"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8b949e] mb-1">Profile image URL</label>
              <input
                className={inputCls}
                value={profile.profileImageUrl}
                onChange={(e) => setProfile((p) => ({ ...p, profileImageUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          </div>
          <button onClick={saveProfile} disabled={saving} className={btnPrimary}>
            {saving ? "Saving…" : "Update profile"}
          </button>
        </div>
      )}
      {/* Account */}
      {active === "account" && (
        <div className="space-y-10">
          <h1 className="text-xl font-semibold text-[#f0f6fc] border-b border-[#30363d] pb-4">Account</h1>
          <div className="rounded-lg border border-[#f85133]/40 bg-[#161b22] p-6 space-y-4">
            <h2 className="text-base font-semibold text-[#f85133]">Delete this account</h2>
            <p className="text-sm text-[#8b949e]">Once you delete your account, there is no going back. Please be certain.</p>
            <div>
              <label className="block text-xs font-semibold text-[#8b949e] mb-1">Confirm your password</label>
              <input
                type="password"
                className={inputCls}
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Your password"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8b949e] mb-1">
                Type your username <span className="text-[#f0f6fc] font-bold">{user?.username}</span> to confirm
              </label>
              <input
                className={inputCls}
                value={confirmDelete}
                onChange={(e) => setConfirmDelete(e.target.value)}
                placeholder={user?.username}
              />
            </div>
            <button onClick={deleteAccount} className={btnDanger}>
              Delete my account
            </button>
          </div>
        </div>
      )}
      {/* Appearance */}
      {active === "appearance" && (
        <div className="space-y-6">
          <h1 className="text-xl font-semibold text-[#f0f6fc] border-b border-[#30363d] pb-4">Appearance</h1>
          <div>
            <label className="block text-sm font-semibold text-[#f0f6fc] mb-3">Theme</label>
            <div className="flex gap-4">
              {['dark', 'light'].map((t) => (
                <button
                  key={t}
                  onClick={() => setAppearance((a) => ({ ...a, theme: t }))}
                  className={`flex-1 rounded-lg border-2 p-4 text-sm font-medium capitalize transition-all ${
                    appearance.theme === t
                      ? "border-[#ec4899] bg-[var(--bg-tertiary)] text-[var(--text-primary)] shadow-md"
                      : "border-[var(--border-color)] bg-transparent text-[var(--text-secondary)] hover:border-[var(--text-secondary)]"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-full h-12 rounded-md mb-2 flex items-center justify-center ${
                        t === "dark" ? "bg-[#0d1117] border-[#30363d]" : "bg-[#ffffff] border-[#d0d7de]"
                      } border`}
                    >
                      {t === "dark" ? <span className="text-white">🌙</span> : <span className="text-black">☀️</span>}
                    </div>
                    <span>{t}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#f0f6fc] mb-3">Font size</label>
            <div className="flex gap-3">
              {['small', 'medium', 'large'].map((s) => (
                <button
                  key={s}
                  onClick={() => setAppearance((a) => ({ ...a, fontSize: s }))}
                  className={`flex-1 rounded-md border py-2 text-sm capitalize transition-all ${
                    appearance.fontSize === s
                      ? "border-[#ec4899] text-[var(--text-primary)] bg-[var(--bg-tertiary)]"
                      : "border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <button onClick={saveAppearance} disabled={saving} className={btnPrimary}>
            {saving ? "Saving…" : "Save preferences"}
          </button>
        </div>
      )}
      {/* Notifications */}
      {active === "notifications" && (
        <div className="space-y-6">
          <h1 className="text-xl font-semibold text-[#f0f6fc] border-b border-[#30363d] pb-4">Notifications</h1>
          <div className="space-y-4">
            {[
              { key: "emailOnMention", label: "Email me when I am mentioned" },
              { key: "emailOnReview", label: "Email me when a review is requested" },
              { key: "emailOnPush", label: "Email me on new push to my repos" },
              { key: "webNotifications", label: "Show web notifications" },
            ].map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center justify-between rounded-lg border border-[#30363d] bg-[#161b22] px-4 py-3 cursor-pointer hover:border-[#8b949e]"
              >
                <span className="text-sm text-[#f0f6fc]">{label}</span>
                <div
                  onClick={() => setNotifPrefs((p) => ({ ...p, [key]: !p[key] }))}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    notifPrefs[key] ? "bg-[#238636]" : "bg-[#30363d]"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      notifPrefs[key] ? "translate-x-4" : "translate-x-1"
                    }`}
                  />
                </div>
              </label>
            ))}
          </div>
          <button onClick={saveNotifs} disabled={saving} className={btnPrimary}>
            {saving ? "Saving…" : "Save notifications"}
          </button>
        </div>
      )}
      {/* Emails */}
      {active === "emails" && (
        <div className="space-y-6">
          <h1 className="text-xl font-semibold text-[#f0f6fc] border-b border-[#30363d] pb-4">Emails</h1>
          <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-5 space-y-4">
            <p className="text-sm text-[#8b949e]">Changing your email requires password confirmation.</p>
            <div>
              <label className="block text-xs font-semibold text-[#8b949e] mb-1">New email address</label>
              <input
                type="email"
                className={inputCls}
                value={emailForm.email}
                onChange={(e) => setEmailForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8b949e] mb-1">Current password</label>
              <input
                type="password"
                className={inputCls}
                value={emailForm.password}
                onChange={(e) => setEmailForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Required to confirm"
              />
            </div>
            <button onClick={saveEmail} disabled={saving} className={btnPrimary}>
              {saving ? "Saving…" : "Update email"}
            </button>
          </div>
        </div>
      )}
      {/* Password */}
      {active === "password" && (
        <div className="space-y-6">
          <h1 className="text-xl font-semibold text-[#f0f6fc] border-b border-[#30363d] pb-4">Password and authentication</h1>
          <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#8b949e] mb-1">Current password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  className={inputCls + " pr-10"}
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                />
                <button
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-2.5 text-[#8b949e]"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8b949e] mb-1">New password</label>
              <input
                type="password"
                className={inputCls}
                value={pwForm.newPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                placeholder="Minimum 6 characters"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8b949e] mb-1">Confirm new password</label>
              <input
                type="password"
                className={inputCls}
                value={pwForm.confirm}
                onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
              />
            </div>
            <button onClick={savePassword} disabled={saving} className={btnPrimary}>
              {saving ? "Saving…" : "Update password"}
            </button>
          </div>
        </div>
      )}
      {/* Sessions */}
      {active === "sessions" && (
        <div className="space-y-6">
          <h1 className="text-xl font-semibold text-[#f0f6fc] border-b border-[#30363d] pb-4">Sessions</h1>
          <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-5">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-[#21262d] flex items-center justify-center">
                <Shield size={18} className="text-[#58a6ff]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#f0f6fc]">Current session</p>
                <p className="text-xs text-[#8b949e] mt-0.5">
                  Logged in as <span className="text-[#f0f6fc]">{user?.username}</span>
                </p>
                <p className="text-xs text-[#8b949e]">Email: {user?.email}</p>
                <span className="mt-2 inline-block rounded-full bg-[#238636]/20 border border-[#238636]/40 px-2 py-0.5 text-[10px] text-[#3fb950] font-bold">
                  ● Active now
                </span>
              </div>
            </div>
            <p className="text-xs text-[#8b949e]">To end all sessions, log out and log back in.</p>
          </div>
        </div>
      )}
      {/* SSH */}
      {active === "ssh" && (
        <div className="space-y-6">
          <h1 className="text-xl font-semibold text-[#f0f6fc] border-b border-[#30363d] pb-4">SSH and GPG keys</h1>
          <div className="space-y-3">
            {sshKeys.length === 0 && (
              <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-6 text-center text-sm text-[#8b949e]">
                <Key size={28} className="mx-auto mb-2 opacity-30" />
                No SSH keys added yet.
              </div>
            )}
            {sshKeys.map((k) => (
              <div key={k._id} className="flex items-center justify-between rounded-lg border border-[#30363d] bg-[#161b22] px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-[#f0f6fc]">{k.title}</p>
                  <p className="text-xs text-[#8b949e] font-mono mt-0.5 truncate max-w-xs">{k.key.slice(0, 40)}…</p>
                  <p className="text-[10px] text-[#8b949e]">Added {new Date(k.addedAt).toLocaleDateString()}</p>
                </div>
                <button onClick={() => deleteSshKey(k._id)} className="p-2 text-[#8b949e] hover:text-[#f85149]">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-5 space-y-3">
              <h2 className="text-sm font-semibold text-[#f0f6fc]">Add new SSH key</h2>
              <input
                className={inputCls}
                placeholder="Title (e.g. My Laptop)"
                value={sshForm.title}
                onChange={(e) => setSshForm((f) => ({ ...f, title: e.target.value }))}
              />
              <textarea
                rows={4}
                className={inputCls + " resize-none font-mono text-xs"}
                placeholder="Paste your public key here (ssh-rsa AAAA...)"
                value={sshForm.key}
                onChange={(e) => setSshForm((f) => ({ ...f, key: e.target.value }))}
              />
              <button onClick={addSshKey} disabled={saving} className={btnPrimary + " flex items-center gap-1.5"}>
                <Plus size={14} />
                {saving ? "Adding…" : "Add SSH key"}
              </button>
            </div>
          </div>
        </div>
      )}
    </SettingsLayout>
  );
}
