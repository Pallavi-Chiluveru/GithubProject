import { Link, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { 
  Code2, Plus, Bell, LogOut, Menu, ChevronDown, Settings,
  CircleDot, Book, Building, Layout,
  Box, FileCode, GitPullRequest, History, Mail, User, Star, Code, Globe, Heart, FlaskConical, Paintbrush, Accessibility, UploadCloud, Repeat, Target
} from "lucide-react";
import { io } from "socket.io-client";
import Github from "./GithubIcon";
import API from "../api";
import { defaultAppearance, useTheme } from "../theme/ThemeContext";

// Singleton socket so we don't reconnect on every render
let _socket = null;
function getSocket() {
  if (!_socket) {
    _socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:5000", {
      withCredentials: true,
    });
  }
  return _socket;
}

export default function Navbar() {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const profileRef = useRef(null);

  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "{}"));
  const { setAppearance } = useTheme();

  // Keep token/user in sync if localStorage changes (e.g. login in another tab)
  useEffect(() => {
    const onStorage = () => {
      setToken(localStorage.getItem("token"));
      setUser(JSON.parse(localStorage.getItem("user") || "{}"));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Hide navbar on auth pages
  if (location.pathname === "/" || location.pathname === "/register") {
    return null;
  }

  // Fetch initial unread count and set up real-time listener
  useEffect(() => {
    if (!token || !user._id) return;

    // Get initial count
    API.get("/notification-api/unread-count")
      .then(res => setUnreadCount(res.data.count || 0))
      .catch(() => {});

    // Join user's socket room and listen for new notifications
    const socket = getSocket();
    socket.emit("join", user._id);
    const handler = () => setUnreadCount(prev => prev + 1);
    socket.on("new_notification", handler);

    return () => {
      socket.off("new_notification", handler);
    };
  }, [token, user._id]);

  // Reset unread count when user visits notifications page
  useEffect(() => {
    if (location.pathname === "/notifications") {
      setUnreadCount(0);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    if (_socket) { _socket.disconnect(); _socket = null; }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAppearance(defaultAppearance);
    // Full page redirect so all stale React state is cleared instantly
    window.location.href = "/";
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { icon: <CircleDot size={16} />, label: "New issue", path: "/new-issue" },
    { icon: <Book size={16} />, label: "New repository", path: "/create-repo" },
    { type: "divider" },
    { icon: <Building size={16} />, label: "New organization", path: "/org" },
    { icon: <Layout size={16} />, label: "New project", path: "/new-project" },
  ];

  const pageTitle = {
    "/dashboard": "Dashboard",
    "/create-repo": "Create Repository",
    "/new-project": "New Project",
    "/org": "New Organization",
    "/import": "Import Repository",

    "/gist": "New Gist",
    "/new-issue": "New Issue",
    "/notifications": "Notifications",
    "/invitations": "Invitations",
    "/changelog": "Changelog",
    "/settings": "Settings",
    "/settings/organizations": "Organizations",
  }[location.pathname] || (
    location.pathname.startsWith("/org/") ? "Organization" :
    location.pathname.startsWith("/repo/") ? "Repository" : "CodeForge"
  );

  return (
    <nav className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-primary)] px-4 shadow-sm text-[var(--text-primary)]">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button className="rounded-md p-2 hover:bg-[var(--bg-secondary)] md:hidden">
          <Menu className="h-5 w-5 text-[var(--text-secondary)]" />
        </button>
        <Link to="/dashboard" className="flex items-center gap-3">
          <Github className="w-12 h-12 object-contain hover:opacity-80 cursor-pointer transition-opacity" />
          <span className="hidden text-sm font-bold text-[var(--text-primary)] md:block">{pageTitle}</span>
        </Link>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {token ? (
          <>
            <div className="flex items-center border-r border-[var(--border-color)] pr-2 mr-2">
              <button className="rounded-md p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]">
                <Box className="h-4 w-4" />
                <ChevronDown className="h-3 w-3 inline ml-1" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              {/* + Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-secondary)] px-2 py-1 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <ChevronDown className="h-3 w-3" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-md border border-[var(--border-color)] bg-[var(--bg-secondary)] py-2 shadow-2xl z-[60]">
                    {menuItems.map((item, index) => (
                      item.type === "divider" ? (
                        <div key={index} className="my-1 border-t border-[var(--border-color)]" />
                      ) : (
                        <Link
                          key={index}
                          to={item.path}
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-1.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all group"
                        >
                          <span className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">{item.icon}</span>
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      )
                    ))}
                  </div>
                )}
              </div>

              {/* Bell with unread badge */}
              <Link
                to="/notifications"
                className="relative rounded-md p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>

              {/* Invitations */}
              <Link
                to="/invitations"
                className="rounded-md p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                title="Invitations"
              >
                <Mail className="h-4 w-4" />
              </Link>

              <Link 
                to="/pulls"
                className="rounded-md p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                title="Pull requests"
              >
                <GitPullRequest className="h-4 w-4" />
              </Link>
              <button className="rounded-md p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]">
                <History className="h-4 w-4" />
              </button>
            </div>

            {/* Avatar Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <div 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="h-7 w-7 overflow-hidden rounded-full border-2 border-[var(--border-color)] cursor-pointer hover:border-[#2f81f7] ml-2 transition-all"
              >
                <img
                  src={user?.profileImageUrl || `https://ui-avatars.com/api/?name=${user?.username || "User"}&background=random`}
                  alt="User"
                  className="w-full h-full object-cover"
                />
              </div>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] py-2 shadow-[0_8px_40px_rgba(0,0,0,0.12)] z-[70] overflow-hidden animate-in fade-in zoom-in duration-150">
                  {/* Profile Header */}
                  <div className="px-4 py-3 flex items-center justify-between hover:bg-[var(--bg-secondary)] cursor-pointer transition-colors border-b border-[var(--border-color)] mb-1">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-[var(--border-color)]">
                        <img 
                          src={user?.profileImageUrl || `https://ui-avatars.com/api/?name=${user?.username || "User"}&background=random`} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[var(--text-primary)]">{user.username || 'Pallavi-Chiluveru'}</span>
                        <span className="text-xs text-[var(--text-secondary)]">{user.displayName || 'Chiluveru Pallavi'}</span>
                      </div>
                    </div>
                    <Repeat className="w-4 h-4 text-[var(--text-secondary)]" />
                  </div>

                  {/* Status */}
                  <div className="px-4 py-2 hover:bg-[var(--bg-secondary)] cursor-pointer group transition-colors">
                    <div className="flex items-center gap-3 text-[var(--text-primary)]">
                      <Target className="w-4 h-4 text-[#f778ba]" />
                      <span className="text-sm">Focusing</span>
                    </div>
                  </div>

                  <div className="my-1 border-t border-[var(--border-color)]" />

                  {/* Menu Sections */}
                  {[
                    { icon: <User size={16} />, label: "Profile", path: `/profile/${user.username}` },
                    { icon: <Book size={16} />, label: "Repositories", path: "/dashboard" },
                  ].map((item, i) => (
                    <Link
                      key={i}
                      to={item.path}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-1.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all group"
                    >
                      <span className="text-[var(--text-secondary)] group-hover:text-[#2f81f7]">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  ))}

                  <div className="my-1 border-t border-[var(--border-color)]" />

                  {[
                    { icon: <Building size={16} />, label: "Organizations", path: "/settings/organizations" },
                    { icon: <Globe size={16} />, label: "Enterprises", path: "/enterprises" },
                    { icon: <Heart size={16} />, label: "Sponsors", path: "/sponsors" },
                  ].map((item, i) => (
                    <Link
                      key={i}
                      to={item.path}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-1.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all group"
                    >
                      <span className="text-[var(--text-secondary)] group-hover:text-[#2f81f7]">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  ))}

                  <div className="my-1 border-t border-[var(--border-color)]" />

                  {[
                    { icon: <Settings size={16} />, label: "Settings", path: "/settings" },
                    { icon: <Repeat size={16} />, label: "Copilot settings", path: "/copilot" },
                    { icon: <Accessibility size={16} />, label: "Accessibility", path: "/accessibility" },
                  ].map((item, i) => (
                    <Link
                      key={i}
                      to={item.path}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center justify-between px-4 py-1.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[var(--text-secondary)] group-hover:text-[#2f81f7]">{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${item.badge === 'New' ? 'text-[#2f81f7] border-[#2f81f7]/40' : 'text-[var(--text-secondary)] border-[var(--border-color)]'}`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}

                  <div className="my-1 border-t border-[var(--border-color)]" />

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-red-50 hover:text-red-600 transition-all group text-left"
                  >
                    <LogOut size={16} className="text-[var(--text-secondary)] group-hover:text-red-500" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link
            to="/"
            className="rounded-md bg-[#238636] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#2ea043] transition-all"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}