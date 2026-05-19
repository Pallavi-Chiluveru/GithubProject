import { useEffect, useState, useRef } from "react";
import API from "../api";
import RepoCard from "./RepoCard";
import {
  Plus,
  Search,
  BookOpen,
  Star,
  Users,
  MessageSquare,
  Layout,
  GitPullRequest,
  Settings,
  ChevronDown,
  Terminal,
  Cpu,
  MoreHorizontal,
  Bell,
  Code2,
  TrendingUp,
  Activity,
  History,
  ExternalLink,
  X,
  Building,
  Check
} from "lucide-react";
import Github from "./GithubIcon";
import RepositoryDropdown from "./RepositoryDropdown";
import AskDropdown from "./AskDropdown";
import CreateDropdown from "./CreateDropdown";
import { useNavigate, Link } from "react-router-dom";

export default function Dashboard() {
  const [repos, setRepos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [showRepoDropdown, setShowRepoDropdown] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const orgDropdownRef = useRef(null);
  const navigate = useNavigate();

  // Helper to format time ago
  const timeAgo = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    const fetchRepos = async () => {
      try {
        const res = await API.get("/repo-api/user");
        setRepos(res.data);
      } catch (err) {
        console.error("Failed to fetch repos:", err);
        if (err.response?.status === 401) {
          navigate("/");
        }
      }
    };

    const fetchActivityLogs = async () => {
      try {
        const res = await API.get("/activity-api/?limit=10");
        setActivityLogs(res.data);
      } catch (err) {
        console.error("Failed to fetch activity logs:", err);
      }
    };

    const fetchOrgs = async () => {
      try {
        const res = await API.get("/org-api/my-orgs");
        setOrgs(res.data);
      } catch (err) {
        console.error("Failed to fetch orgs:", err);
      }
    };

    fetchRepos();
    fetchActivityLogs();
    fetchOrgs();
  }, [navigate]);

  // Close org dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (orgDropdownRef.current && !orgDropdownRef.current.contains(event.target)) {
        setIsOrgDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredRepos = repos.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans transition-colors">
      {/* LEFT SIDEBAR */}
      <aside className="hidden w-72 flex-col border-r border-[var(--border-color)] bg-[var(--bg-secondary)] lg:flex">
        <div className="flex flex-col gap-6 p-4">
          {/* User Profile / Org Switcher */}
          <div className="relative" ref={orgDropdownRef}>
            <button
              onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[var(--bg-tertiary)] transition-all w-full text-left"
            >
              <div className="h-5 w-5 overflow-hidden rounded-full border border-[var(--border-color)]">
                <img src={`https://ui-avatars.com/api/?name=${user?.username || "Guest"}&background=random`} alt="Avatar" className="h-full w-full object-cover" />
              </div>
              <span className="text-sm font-semibold text-[var(--text-primary)] flex-1">{user?.username || "Pallavi-Chiluveru"}</span>
              <ChevronDown className={`h-3 w-3 text-[var(--text-secondary)] transition-transform ${isOrgDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* ORG DROPDOWN MATCHING UI */}
            {isOrgDropdownOpen && (
              <div className="absolute left-2 top-10 z-50 w-72 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between mb-4 px-1">
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">Go to organization dashboard</h4>
                  <button onClick={() => setIsOrgDropdownOpen(false)} className="rounded-md p-1 hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-1 mb-4">
                  <button className="flex items-center gap-3 w-full px-3 py-2 rounded-md bg-[var(--bg-secondary)] text-left group">
                    <Check className="h-3.5 w-3.5 text-[#2f81f7]" />
                    <div className="h-6 w-6 overflow-hidden rounded-full border border-[var(--border-color)]">
                      <img src={`https://ui-avatars.com/api/?name=${user?.username || "Guest"}&background=random`} alt="" />
                    </div>
                    <span className="text-sm font-semibold text-[var(--text-primary)] truncate">{user?.username || "Pallavi-Chiluveru"}</span>
                  </button>

                  {orgs.map(org => (
                    <button 
                      key={org._id} 
                      onClick={() => navigate(`/org/${org._id}`)}
                      className="flex items-center gap-3 w-full px-3 py-2 rounded-md hover:bg-[var(--bg-secondary)] text-left group"
                    >
                      <div className="h-3.5 w-3.5"></div> {/* Placeholder for check */}
                      {org.logo ? (
                        <div className="h-6 w-6 overflow-hidden rounded-full border border-[var(--border-color)]">
                          <img src={org.logo} alt="" className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-6 w-6 overflow-hidden rounded-full border border-[var(--border-color)] bg-[#2f81f7]/10 flex items-center justify-center">
                          <Users className="h-3 w-3 text-[#2f81f7]" />
                        </div>
                      )}
                      <span className="text-sm font-semibold text-[var(--text-primary)] truncate">{org.name}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
                  <button 
                    onClick={() => { navigate("/settings/organizations"); setIsOrgDropdownOpen(false); }}
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    <Building className="h-4 w-4" /> Manage organizations
                  </button>
                  <button
                    onClick={() => { navigate("/org"); setIsOrgDropdownOpen(false); }}
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    <Plus className="h-4 w-4" /> Create organization
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Section */}
          <div className="space-y-1 mb-6 px-2">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-md hover:bg-[var(--bg-tertiary)] text-xs font-semibold text-[var(--text-primary)] transition-all"
            >
              <Building className="h-4 w-4 text-[var(--text-secondary)]" />
              Home
            </button>
            <button 
              onClick={() => navigate('/spaces')}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-md hover:bg-[var(--bg-tertiary)] text-xs font-semibold text-[var(--text-primary)] transition-all"
            >
              <Layout className="h-4 w-4 text-[var(--text-secondary)]" />
              Spaces
            </button>
            <button 
              onClick={() => navigate('/agent')}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-md hover:bg-[var(--bg-tertiary)] text-xs font-semibold text-[var(--text-primary)] transition-all"
            >
              <Cpu className="h-4 w-4 text-[var(--text-secondary)]" />
              Copilot Agent
            </button>
          </div>

          {/* Top Repositories */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Top repositories</h3>
              <button
                onClick={() => navigate("/create-repo")}
                className="flex items-center gap-1.5 rounded-md bg-[#238636] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#2ea043] transition-all"
              >
                <BookOpen className="h-3.5 w-3.5" />
                New
              </button>
            </div>

            <div className="px-2">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Find a repository..."
                  className="w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] py-1.5 pl-3 pr-3 text-xs text-[var(--text-primary)] focus:border-[#2f81f7] focus:outline-none focus:ring-1 focus:ring-[#2f81f7] transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-0.5 overflow-y-auto max-h-[500px] custom-scrollbar">
              {filteredRepos.map((repo) => (
                <Link
                  key={repo._id}
                  to={`/repo/${repo._id}`}
                  className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-all group"
                >
                  <div className="h-4 w-4 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-[#2f81f7]"></div>
                  </div>
                  <span className="truncate">{user?.username || "Pallavi-Chiluveru"}/{repo.name}</span>
                </Link>
              ))}
              <div className="px-3 py-1 text-[11px] text-[var(--text-secondary)] hover:text-[#2f81f7] cursor-pointer">Show more</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto bg-[var(--bg-primary)] transition-colors">
        <div className="mx-auto max-w-4xl px-8 py-8">
          <h1 className="mb-6 text-2xl font-semibold text-[var(--text-primary)]">Home</h1>

          {/* AI CARD MATCHING UI */}
          <div className="mb-6 overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-sm transition-all">
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <span className="text-sm font-medium text-[#2f81f7]">/create-issue</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-[var(--border-color)] bg-[var(--bg-tertiary)] px-4 py-2 transition-all">
              <div className="flex items-center gap-4">
                <AskDropdown isCompact={true} />
                <div className="relative">
                  <button 
                    onClick={() => setShowRepoDropdown(!showRepoDropdown)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <Layout className="h-4 w-4" />
                    All repositories <ChevronDown className="h-3 w-3" />
                  </button>
                  <RepositoryDropdown isOpen={showRepoDropdown} onClose={() => setShowRepoDropdown(false)} />
                </div>
                <CreateDropdown isCompact={true} />
              </div>
              <div className="flex items-center gap-3">
                <button className="h-7 w-7 rounded-md bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  <Terminal className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS ROW */}
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <button onClick={() => navigate("/agent")} className="flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-1.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all">
              <Cpu className="h-4 w-4" /> Agent
            </button>
            <Link to="/new-issue" className="flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-1.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all">
              <MessageSquare className="h-4 w-4" /> Create issue
            </Link>
            <button className="flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-1.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all">
              <Code2 className="h-4 w-4" /> Write code <ChevronDown className="h-3 w-3" />
            </button>
            <button className="flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-1.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all">
              <GitPullRequest className="h-4 w-4" /> Git <ChevronDown className="h-3 w-3" />
            </button>
            <button className="flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-1.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all">
              <Users className="h-4 w-4" /> Pull requests
            </button>
          </div>


          {/* FEED SECTION */}
          <section>
            <div className="mb-4 flex items-center justify-between border-b border-[var(--border-color)] pb-2 transition-all">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Feed</h2>
            </div>

            <div className="space-y-6">

              {/* REAL REPOS LIST */}
              {repos.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                  {repos.slice(0, 3).map(repo => (
                    <RepoCard key={repo._id} repo={repo} />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Footer Match */}
          <footer className="mt-20 border-t border-[var(--border-color)] py-10 transition-all">
            <div className="flex flex-wrap items-center gap-6 text-xs text-[var(--text-secondary)]">
              <Github className="h-5 w-5 opacity-50" />
              <span>© 2026 antigravity.</span>
              <span className="hover:text-[#2f81f7] cursor-pointer">Terms</span>
              <span className="hover:text-[#2f81f7] cursor-pointer">Privacy</span>
              <span className="hover:text-[#2f81f7] cursor-pointer">Security</span>
              <span className="hover:text-[#2f81f7] cursor-pointer">Status</span>
              <span className="hover:text-[#2f81f7] cursor-pointer">Docs</span>
              <span className="hover:text-[#2f81f7] cursor-pointer">Contact</span>
              <span className="hover:text-[#2f81f7] cursor-pointer">Manage cookies</span>
            </div>
          </footer>
        </div>
      </main>

      {/* RIGHT SIDEBAR - CHANGELOG */}
      <aside className="hidden w-80 flex-col border-l border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 xl:flex transition-colors">
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4 shadow-sm transition-all">
          <h3 className="text-xs font-bold text-[var(--text-primary)] mb-4 uppercase tracking-wider">Recent Activity</h3>
          <ul className="space-y-6 relative before:absolute before:left-[3px] before:top-2 before:bottom-2 before:w-[1px] before:bg-[var(--border-color)]">
            {activityLogs.filter(log => log.action !== 'org_invite_sent').length > 0 ? (
              activityLogs.filter(log => log.action !== 'org_invite_sent').map((log) => (
                <li key={log._id} className="relative pl-6">
                  <div className="absolute left-[-1.5px] top-1.5 w-[10px] h-[10px] rounded-full bg-[var(--border-color)] border-2 border-[var(--bg-primary)]" />
                  <span className="text-[11px] text-[var(--text-secondary)]">{timeAgo(log.createdAt)}</span>
                  <p className="mt-1 text-xs font-medium text-[var(--text-primary)] hover:text-[#2f81f7] cursor-pointer leading-snug transition-colors">
                    {log.message}
                  </p>
                </li>
              ))
            ) : (
              <li className="text-xs text-[var(--text-secondary)] italic pl-6">No recent activity.</li>
            )}
          </ul>
          <Link to="/changelog" className="mt-6 block text-xs font-semibold text-[var(--text-secondary)] hover:text-[#2f81f7] transition-all">
            View all activity →
          </Link>
        </div>
      </aside>
    </div>
  );
}
