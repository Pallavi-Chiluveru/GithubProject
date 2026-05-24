import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Plus, 
  Menu, 
  GitPullRequest, 
  CircleDot, 
  Package, 
  Terminal,
  ChevronDown,
  Book,
  FileCode,
  Box,
  Building,
  Layout,
  User,
  Star,
  Code,
  Globe,
  Heart,
  Settings,
  FlaskConical,
  Paintbrush,
  Accessibility,
  UploadCloud,
  LogOut,
  Repeat,
  Target,
  Zap
} from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api';
import GithubIcon from './GithubIcon';

const TopNavbar = ({ onMenuClick, title = "Dashboard" }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const dropdownRef = useRef(null);
  const profileRef = useRef(null);
  const copilotRef = useRef(null);
  const orgRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [copilotInput, setCopilotInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'bot', text: "Hi! I'm CodeForge Agent. I can help you with code completion, explaining code, or generating new functions. How can I help you today?" }
  ]);
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);

  const handleCopilotSubmit = async (text) => {
    const prompt = typeof text === 'string' ? text : copilotInput;
    if (!prompt.trim()) return;
    
    const newHistory = [...chatHistory, { role: 'user', text: prompt }];
    setChatHistory(newHistory);
    setCopilotInput('');
    setIsCopilotLoading(true);

    try {
      const res = await API.post('/chat-api/prompt', { prompt });
      setChatHistory([...newHistory, { role: 'bot', text: res.data.response }]);
    } catch (err) {
      console.error(err);
      setChatHistory([...newHistory, { role: 'bot', text: 'Error fetching response from AI.' }]);
    } finally {
      setIsCopilotLoading(false);
    }
  };

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await API.get('/org-api/my-orgs');
        setOrganizations(res.data || []);
      } catch (err) {
        console.error('Error fetching orgs:', err);
      }
    };
    fetchOrgs();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (copilotRef.current && !copilotRef.current.contains(event.target)) {
        setIsCopilotOpen(false);
      }
      if (orgRef.current && !orgRef.current.contains(event.target)) {
        setIsOrgDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const menuItems = [
    { icon: <CircleDot size={16} />, label: "New issue", path: "/new-issue" },
    { icon: <GithubIcon className="w-4 h-4" />, label: "New repository", path: "/create-repo" },
    { type: "divider" },
    { icon: <Building size={16} />, label: "New organization", path: "/org" },
    { icon: <Layout size={16} />, label: "New project", path: "/new-project" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full h-16 bg-[var(--bg-primary)] border-b border-[var(--border-color)] flex items-center justify-between px-4 z-[1000] transition-colors">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <GithubIcon className="w-12 h-12 object-contain hover:opacity-80 cursor-pointer transition-opacity" />
          </Link>
          
          <div className="relative" ref={orgRef}>
            <button 
              onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-[var(--bg-tertiary)] transition-all group"
            >
              <span className="text-[var(--text-primary)] font-semibold text-sm hidden sm:block">{title}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-transform ${isOrgDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isOrgDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 mt-2 w-64 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl shadow-2xl py-2 z-50 overflow-hidden"
                >
                  <div className="px-4 py-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                      Switch Organization
                    </span>
                  </div>
                  <div className="max-h-60 overflow-y-auto custom-scrollbar">
                    {organizations.length > 0 ? (
                      organizations.map((org) => (
                        <button
                          key={org._id}
                          onClick={() => {
                            navigate(`/org/${org._id}`);
                            setIsOrgDropdownOpen(false);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 hover:bg-[#21262d] transition-colors group text-left"
                        >
                          <div className="w-6 h-6 rounded bg-[#30363d] border border-[var(--border-color)] flex items-center justify-center text-xs text-white font-bold group-hover:bg-[#2f81f7] group-hover:border-[#2f81f7] transition-all">
                            {org.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-[var(--text-primary)] group-hover:text-white truncate font-medium">
                              {org.name}
                            </span>
                            <span className="text-[10px] text-[var(--text-secondary)] uppercase">
                              Organization
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center">
                        <Building className="w-8 h-8 text-[var(--border-color)] mx-auto mb-2 opacity-20" />
                        <p className="text-xs text-[var(--text-secondary)]">No organizations found</p>
                        <Link 
                          to="/org" 
                          onClick={() => setIsOrgDropdownOpen(false)}
                          className="text-[10px] text-[#2f81f7] hover:underline mt-2 inline-block font-bold"
                        >
                          + Create New
                        </Link>
                      </div>
                    )}
                  </div>
                  <div className="p-2 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
                    <Link
                      to="/org"
                      onClick={() => setIsOrgDropdownOpen(false)}
                      className="flex items-center gap-2 w-full px-2 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold hover:bg-[var(--bg-primary)] rounded-md transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Create new organization
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Search Bar Removed */}
      <div className="flex-1" />

        <div className="flex items-center gap-2">

        {/* + Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div className="flex items-center gap-0 border border-[var(--border-color)] rounded-md overflow-hidden bg-[var(--bg-primary)] h-8">
            <button 
              className="p-1.5 hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <Plus className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-[var(--border-color)]" />
            <button 
              className="px-1 h-full hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="text-[10px] font-bold">▼</span>
            </button>
          </div>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)] py-2 shadow-2xl z-[60]">
              {menuItems.map((item, index) => (
                item.type === "divider" ? (
                  <div key={index} className="my-1 border-t border-[var(--border-color)]" />
                ) : (
                  <Link
                    key={index}
                    to={item.path}
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-1.5 text-sm text-[var(--text-primary)] hover:bg-[#2f81f7] hover:text-white transition-all group"
                  >
                    <span className="text-[var(--text-secondary)] group-hover:text-white">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center">
          {[
            { Icon: CircleDot, path: "/issues" },
            { Icon: GitPullRequest, path: "/pulls" },
            { Icon: Book, path: "/repos" },
            { Icon: Bell, path: "/notifications" }
          ].map((item, i) => (
            <button 
              key={i} 
              onClick={() => navigate(item.path)}
              className="p-2 hover:bg-[var(--bg-tertiary)] rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <item.Icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-7 h-7 rounded-full overflow-hidden border border-[var(--border-color)] cursor-pointer hover:border-[#8b949e] ml-2"
          >
            <img 
              src={`https://ui-avatars.com/api/?name=${user.username || 'User'}&background=random`} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          </div>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] py-2 shadow-2xl z-[70] overflow-hidden animate-in fade-in zoom-in duration-150">
              {/* Profile Header */}
              <div className="px-4 py-3 flex items-center justify-between hover:bg-[var(--bg-tertiary)] cursor-pointer transition-colors border-b border-[var(--border-color)] mb-1">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-[var(--border-color)]">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${user.username || 'User'}&background=random`} 
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
              <div className="px-4 py-2 hover:bg-[var(--bg-tertiary)] cursor-pointer group transition-colors">
                <div className="flex items-center gap-3 text-[var(--text-primary)] group-hover:text-[var(--text-primary)]">
                  <Target className="w-4 h-4 text-[#f778ba]" />
                  <span className="text-sm">Focusing</span>
                </div>
              </div>

              <div className="my-1 border-t border-[var(--border-color)]" />

              {/* Menu Sections */}
              {[
                { icon: <User size={16} />, label: "Profile", path: `/profile/${user.username}` },
                { icon: <Book size={16} />, label: "Repositories", path: "/repos" },
              ].map((item, i) => (
                <Link
                  key={i}
                  to={item.path}
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-1.5 text-sm text-[var(--text-primary)] hover:bg-[#2f81f7] hover:text-white transition-all group"
                >
                  <span className="text-[var(--text-secondary)] group-hover:text-white">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}

              <div className="my-1 border-t border-[var(--border-color)]" />

              {[
                { icon: <Building size={16} />, label: "Organizations", path: "/settings/organizations" },
              ].map((item, i) => (
                <Link
                  key={i}
                  to={item.path}
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-1.5 text-sm text-[var(--text-primary)] hover:bg-[#2f81f7] hover:text-white transition-all group"
                >
                  <span className="text-[var(--text-secondary)] group-hover:text-white">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}

              <div className="my-1 border-t border-[var(--border-color)]" />

              {[
                { icon: <Settings size={16} />, label: "Settings", path: "/settings" },
              ].map((item, i) => (
                <Link
                  key={i}
                  to={item.path}
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center justify-between px-4 py-1.5 text-sm text-[var(--text-primary)] hover:bg-[#2f81f7] hover:text-white transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[var(--text-secondary)] group-hover:text-white">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border border-[var(--border-color)] ${item.badge === 'New' ? 'text-[#2f81f7] border-[#2f81f7]' : 'text-[var(--text-secondary)]'}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}

              <div className="my-1 border-t border-[var(--border-color)]" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[#2f81f7] hover:text-white transition-all group text-left"
              >
                <LogOut size={16} className="text-[var(--text-secondary)] group-hover:text-white" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;
