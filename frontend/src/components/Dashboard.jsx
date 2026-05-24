import { useEffect, useState, useRef } from "react";
import DashboardLayout from "./DashboardLayout";
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
    <DashboardLayout>
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
