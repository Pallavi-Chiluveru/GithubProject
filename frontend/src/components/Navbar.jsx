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
    { icon: <FileCode size={16} />, label: "Import repository", path: "/import" },
    { type: "divider" },
    { icon: <Box size={16} />, label: "New codespace", path: "/codespaces/new" },
    { icon: <FileCode size={16} />, label: "New gist", path: "/gist" },
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
    "/codespaces": "Codespaces",
    "/codespaces/new": "Create Codespace",
    "/gist": "New Gist",
    "/new-issue": "New Issue",
    "/notifications": "Notifications",
    "/invitations": "Invitations",
    "/changelog": "Changelog",
    "/settings": "Settings",
    "/settings/organizations": "Organizations",
  }[location.pathname] || (
    location.pathname.startsWith("/org/") ? "Organization" :
    location.pathname.startsWith("/repo/") ? "Repository" : "antigravity"
  );

  return (
    <nav className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#30363d] bg-[#0d1117] px-4 shadow-sm">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button className="rounded-md p-2 hover:bg-[#30363d] md:hidden">
          <Menu className="h-5 w-5 text-[#8b949e]" />
        </button>
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-[#30363d] bg-[#010409]">
            <Github className="h-5 w-5 text-[#f0f6fc]" />
          </div>
          <span className="hidden text-sm font-bold text-[#f0f6fc] md:block">{pageTitle}</span>
        </Link>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {token ? (
          <>
            <div className="flex items-center border-r border-[#30363d] pr-2 mr-2">
              <button className="rounded-md p-2 text-[#8b949e] hover:bg-[#30363d] hover:text-[#f0f6fc]">
                <Box className="h-4 w-4" />
                <ChevronDown className="h-3 w-3 inline ml-1" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              {/* + Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1 rounded-md border border-[#30363d] bg-[#21262d] px-2 py-1 text-[#8b949e] hover:bg-[#30363d] transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <ChevronDown className="h-3 w-3" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-md border border-[#30363d] bg-[#161b22] py-2 shadow-2xl z-[60]">
                    {menuItems.map((item, index) => (
                      item.type === "divider" ? (
                        <div key={index} className="my-1 border-t border-[#30363d]" />
                      ) : (
                        <Link
                          key={index}
                          to={item.path}
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-1.5 text-sm text-[#c9d1d9] hover:bg-[#1f6feb] hover:text-white transition-all group"
                        >
                          <span className="text-[#8b949e] group-hover:text-white">{item.icon}</span>
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
                className="relative rounded-md p-2 text-[#8b949e] hover:bg-[#30363d] hover:text-[#f0f6fc]"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#1f6feb] text-[9px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>

              {/* Invitations */}
              <Link
                to="/invitations"
                className="rounded-md p-2 text-[#8b949e] hover:bg-[#30363d] hover:text-[#f0f6fc]"
                title="Invitations"
              >
                <Mail className="h-4 w-4" />
              </Link>

              <Link 
                to="/pulls"
                className="rounded-md p-2 text-[#8b949e] hover:bg-[#30363d] hover:text-[#f0f6fc]"
                title="Pull requests"
              >
                <GitPullRequest className="h-4 w-4" />
              </Link>
              <button className="rounded-md p-2 text-[#8b949e] hover:bg-[#30363d] hover:text-[#f0f6fc]">
                <History className="h-4 w-4" />
              </button>
            </div>

            {/* Avatar Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <div 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="h-7 w-7 overflow-hidden rounded-full border border-[#30363d] cursor-pointer hover:border-[#8b949e] ml-2"
              >
                <img
                  src={user?.profileImageUrl || `https://ui-avatars.com/api/?name=${user?.username || "User"}&background=random`}
                  alt="User"
                  className="w-full h-full object-cover"
                />
              </div>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl border border-[#30363d] bg-[#0d1117] py-2 shadow-2xl z-[70] overflow-hidden animate-in fade-in zoom-in duration-150">
                  {/* Profile Header */}
                  <div className="px-4 py-3 flex items-center justify-between hover:bg-[#161b22] cursor-pointer transition-colors border-b border-[#30363d] mb-1">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-[#30363d]">
                        <img 
                          src={user?.profileImageUrl || `https://ui-avatars.com/api/?name=${user?.username || "User"}&background=random`} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#f0f6fc]">{user.username || 'Pallavi-Chiluveru'}</span>
                        <span className="text-xs text-[#8b949e]">{user.displayName || 'Chiluveru Pallavi'}</span>
                      </div>
                    </div>
                    <Repeat className="w-4 h-4 text-[#8b949e]" />
                  </div>

                  {/* Status */}
                  <div className="px-4 py-2 hover:bg-[#161b22] cursor-pointer group transition-colors">
                    <div className="flex items-center gap-3 text-[#c9d1d9] group-hover:text-white">
                      <Target className="w-4 h-4 text-[#f778ba]" />
                      <span className="text-sm">Focusing</span>
                    </div>
                  </div>

                  <div className="my-1 border-t border-[#30363d]" />

                  {/* Menu Sections */}
                  {[
                    { icon: <User size={16} />, label: "Profile", path: `/profile/${user.username}` },
                    { icon: <Book size={16} />, label: "Repositories", path: "/dashboard" },
                    { icon: <Star size={16} />, label: "Stars", path: "/stars" },
                    { icon: <Code size={16} />, label: "Gists", path: "/gist" },
                  ].map((item, i) => (
                    <Link
                      key={i}
                      to={item.path}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-1.5 text-sm text-[#c9d1d9] hover:bg-[#1f6feb] hover:text-white transition-all group"
                    >
                      <span className="text-[#8b949e] group-hover:text-white">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  ))}

                  <div className="my-1 border-t border-[#30363d]" />

                  {[
                    { icon: <Building size={16} />, label: "Organizations", path: "/settings/organizations" },
                    { icon: <Globe size={16} />, label: "Enterprises", path: "/enterprises" },
                    { icon: <Heart size={16} />, label: "Sponsors", path: "/sponsors" },
                  ].map((item, i) => (
                    <Link
                      key={i}
                      to={item.path}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-1.5 text-sm text-[#c9d1d9] hover:bg-[#1f6feb] hover:text-white transition-all group"
                    >
                      <span className="text-[#8b949e] group-hover:text-white">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  ))}

                  <div className="my-1 border-t border-[#30363d]" />

                  {[
                    { icon: <Settings size={16} />, label: "Settings", path: "/settings" },
                    { icon: <Repeat size={16} />, label: "Copilot settings", path: "/copilot" },
                    { icon: <FlaskConical size={16} />, label: "Feature preview", path: "/features", badge: "New" },
                    { icon: <Paintbrush size={16} />, label: "Appearance", path: "/appearance" },
                    { icon: <Accessibility size={16} />, label: "Accessibility", path: "/accessibility" },
                    { icon: <UploadCloud size={16} />, label: "Try Enterprise", path: "/enterprise-trial", badge: "Free" },
                  ].map((item, i) => (
                    <Link
                      key={i}
                      to={item.path}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center justify-between px-4 py-1.5 text-sm text-[#c9d1d9] hover:bg-[#1f6feb] hover:text-white transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[#8b949e] group-hover:text-white">{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border border-[#30363d] ${item.badge === 'New' ? 'text-[#2f81f7] border-[#2f81f7]' : 'text-[#8b949e]'}`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}

                  <div className="my-1 border-t border-[#30363d]" />

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[#c9d1d9] hover:bg-[#1f6feb] hover:text-white transition-all group text-left"
                  >
                    <LogOut size={16} className="text-[#8b949e] group-hover:text-white" />
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