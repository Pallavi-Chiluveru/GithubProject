import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  User,
  Settings,
  Shield,
  Bell,
  Lock,
  CreditCard,
  Mail,
  Key,
  Building,
  Users,
  Layout,
  ChevronRight,
  ExternalLink,
  Plus,
  Eye
} from "lucide-react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import SettingsLayout from "./SettingsLayout";

export default function ManageOrgs() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState("");

  // Initialize user and fetch organizations on mount
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    // Attempt to load cached organizations
    const cached = localStorage.getItem("orgsCache");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setOrgs(parsed);
        setLoading(false);
      } catch (e) {
        // ignore malformed cache
        setLoading(true);
      }
    } else {
      setLoading(true);
    }
    fetchOrgs();
  }, []);

  // Reset loading state instantly when navigating to the organizations page to avoid flicker
  useEffect(() => {
    if (location.pathname === "/settings/organizations") {
      setOrgs([]);
      setLoading(true);
    }
  }, [location.pathname]);

  const fetchOrgs = async () => {
    try {
      const res = await API.get("/org-api/my-orgs");
      setOrgs(res.data);
      // Cache the orgs for faster subsequent loads
      localStorage.setItem("orgsCache", JSON.stringify(res.data));
    } catch (err) {
      console.error("Failed to fetch orgs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async (orgId) => {
    if (!window.confirm("Are you sure you want to leave this organization?")) return;
    try {
      await API.delete(`/org-api/leave/${orgId}`);
      fetchOrgs();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to leave organization");
    }
  };

  const sidebarItems = [
    { icon: User, label: "Public profile", path: "/settings/profile" },
    { icon: Settings, label: "Account", path: "/settings/account" },
    { icon: Layout, label: "Appearance", path: "/settings/appearance" },
    { icon: Bell, label: "Notifications", path: "/settings/notifications" },
    { section: "Access" },
    { icon: Mail, label: "Emails", path: "/settings/emails" },
    { icon: Lock, label: "Password and authentication", path: "/settings/password" },
    { icon: Shield, label: "Sessions", path: "/settings/sessions" },
    { icon: Key, label: "SSH and GPG keys", path: "/settings/ssh" },
    { icon: Building, label: "Organizations", path: "/settings/organizations" }
  ];

  useEffect(() => {
    const path = location.pathname;
    const match = sidebarItems.find(i => i.path && path.startsWith(i.path.split('?')[0]));
    if (match) setActive(match.label.toLowerCase().replace(/ /g, ""));
  }, [location.pathname]);

  if (loading && orgs.length === 0) {
    // Show skeleton UI instantly while fetching organizations
    return (
      <div className="flex h-screen items-center justify-center bg-[#0d1117]">
        <div className="space-y-4 w-64">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="h-12 w-12 rounded-md bg-[#30363d]"></div>
              <div className="flex-1 h-4 rounded bg-[#30363d]"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans pb-20">
      <div className="mx-auto max-w-6xl px-4 pt-12">
        <div className="flex flex-col md:flex-row gap-8">

          {/* SIDEBAR */}
          <aside className="w-full md:w-64 space-y-1">
            <div className="flex items-center gap-3 px-2 mb-6">
              <div className="h-10 w-10 overflow-hidden rounded-full border border-[#30363d]">
                <img src={`https://ui-avatars.com/api/?name=${user?.username || "User"}&background=random`} alt="Avatar" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#f0f6fc]">{user?.username || "User"}</h2>
                <p className="text-xs text-[#8b949e]">Your personal account</p>
              </div>
            </div>

            {sidebarItems.map((item, idx) => (
              item.section ? (
                <h3 key={idx} className="px-3 py-2 text-xs font-bold text-[#8b949e] mt-4 uppercase tracking-wider">{item.section}</h3>
              ) : (
                <button
                  key={idx}
                  onClick={() => item.path && navigate(item.path)}
                  className={`flex items-center gap-3 w-full px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${active === item.label.toLowerCase().replace(/ /g, "")
                    ? "bg-[#21262d] text-[#f0f6fc] border-l-2 border-[#ec4899]"
                    : "text-[#c9d1d9] hover:bg-[#21262d]"
                    }`}
                >
                  <item.icon className={`h-4 w-4 ${active === item.label.toLowerCase().replace(/ /g, "") ? "text-[#ec4899]" : "text-[#8b949e]"}`} />
                  {item.label}
                </button>
              )
            ))}
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#30363d]">
              <h1 className="text-xl font-semibold text-[#f0f6fc]">Organizations</h1>
              <button
                onClick={() => navigate("/org")}
                className="flex items-center gap-1.5 rounded-md bg-[#21262d] border border-[#30363d] px-3 py-1 text-sm font-semibold text-[#f0f6fc] hover:bg-[#30363d]"
              >
                New organization
              </button>
            </div>

            {loading ? (
              <div className="space-y-4 p-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="h-12 w-12 rounded-md bg-[#30363d]"></div>
                    <div className="flex-1 h-4 rounded bg-[#30363d]"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="border border-[#30363d] rounded-md overflow-hidden bg-[#161b22]/30">
                  {orgs.length > 0 ? (
                    <div className="divide-y divide-[#30363d]">
                      {orgs.map((org) => (
                        <div key={org._id} className="flex items-center justify-between p-4 bg-[#0d1117] hover:bg-[#161b22] transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 overflow-hidden rounded-md border border-[#30363d] bg-gradient-to-br from-pink-500/20 to-rose-600/20 flex items-center justify-center">
                              {org.logo ? (
                                <img src={org.logo} alt={org.name} className="h-full w-full object-cover" />
                              ) : (
                                <Building className="h-6 w-6 text-[#ec4899]" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-[#f0f6fc] hover:text-[#ec4899] cursor-pointer hover:underline" onClick={() => navigate(`/org/${org._id}`)}>
                                  {org.name}
                                </h3>
                                <span className="px-2 py-0.5 rounded-full border border-[#30363d] text-[10px] font-bold text-[#8b949e] uppercase">
                                  {org.owner === user?._id ? "Owner" : "Member"}
                                </span>
                              </div>
                              <p className="text-xs text-[#8b949e] mt-0.5">{org.description || "No description provided."}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {org.owner === user?._id ? (
                              <>
                                <button
                                  onClick={() => navigate(`/org/${org._id}`)}
                                  className="px-3 py-1 rounded-md border border-[#30363d] bg-[#21262d] text-xs font-semibold text-[#f0f6fc] hover:bg-[#30363d]"
                                >
                                  Settings
                                </button>
                                <button className="px-3 py-1 rounded-md border border-[#30363d] bg-[#21262d] text-xs font-semibold text-[#f0f6fc] hover:bg-[#30363d]">
                                  Compare plans
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleLeave(org._id)}
                                className="px-3 py-1 rounded-md border border-[#30363d] bg-[#21262d] text-xs font-semibold text-[#f0f6fc] hover:bg-[#30363d]"
                              >
                                Leave
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 text-center">
                      <Building className="h-12 w-12 text-[#8b949e] mx-auto mb-4 opacity-20" />
                      <p className="text-sm text-[#8b949e]">You don't belong to any organizations yet.</p>
                    </div>
                  )}
                </div>

                {/* Move to an organization section matching image 2 */}
                <div className="mt-12">
                  <h2 className="text-lg font-semibold text-[#f0f6fc] mb-2">Move to an organization</h2>
                  <p className="text-sm text-[#8b949e] mb-4 leading-relaxed">
                    Your personal account cannot be converted to an organization. You must create a new organization and transfer your repositories and projects to it instead. You can then rename your personal account and the organization if you want your organization to have the same name that you are currently using for your personal account.
                  </p>
                  <button className="flex items-center gap-2 rounded-md bg-[#21262d] border border-[#30363d] px-4 py-1.5 text-sm font-semibold text-[#f0f6fc] hover:bg-[#30363d]">
                    Move work to an organization
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
