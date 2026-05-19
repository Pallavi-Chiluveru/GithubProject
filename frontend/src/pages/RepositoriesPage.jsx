import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Filter, 
  Grid, 
  List, 
  GitFork, 
  Star, 
  Clock, 
  MoreHorizontal,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Repeat,
  Code2,
  Users,
  Shield,
  Activity,
  History,
  GitPullRequest,
  CheckCircle2,
  MessageSquare,
  BookOpen,
  Archive,
  Lock,
  Globe,
  Pin,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TopNavbar from '../components/TopNavbar';
import Sidebar from '../components/Sidebar';
import API from '../api';


const SidebarItem = ({ icon: Icon, label, active, onClick, collapsible = false, isCollapsed = false }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
      active 
        ? 'bg-[#1f6feb]/10 text-[#2f81f7] border border-[#1f6feb]/20' 
        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
    }`}
  >
    <Icon className={`w-4 h-4 ${active ? 'text-[#2f81f7]' : 'group-hover:text-[var(--text-primary)]'}`} />
    {!isCollapsed && <span className="text-sm font-medium">{label}</span>}
    {active && !isCollapsed && <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-[#2f81f7]" />}
  </button>
);

const RepoCard = ({ repo, viewMode }) => {
  const navigate = useNavigate();
  
  const contributionBadge = () => {
    switch (repo.contributionType) {
      case 'commit': return <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20"><History className="w-2.5 h-2.5" /> Committed</span>;
      case 'pr': return <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/20"><GitPullRequest className="w-2.5 h-2.5" /> Opened PR</span>;
      case 'review': return <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-bold border border-purple-500/20"><CheckCircle2 className="w-2.5 h-2.5" /> Reviewed</span>;
      case 'comment': return <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 text-[10px] font-bold border border-orange-500/20"><MessageSquare className="w-2.5 h-2.5" /> Commented</span>;
      default: return null;
    }
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now - date) / (1000 * 60 * 60));
    if (diff < 1) return 'just now';
    if (diff < 24) return `${diff}h ago`;
    return `${Math.floor(diff / 24)}d ago`;
  };

  if (viewMode === 'grid') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -4 }}
        className="group bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-5 hover:border-[#1f6feb]/50 hover:shadow-lg hover:shadow-[#1f6feb]/5 transition-all cursor-pointer relative overflow-hidden"
        onClick={() => navigate(`/repo/${repo._id}`)}
      >
        {/* Background Sparkline Gradient */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              d={`M0 100 ${repo.sparkline.map((v, i) => `L${(i / (repo.sparkline.length - 1)) * 100} ${100 - v}`).join(' ')} V100 H0 Z`}
              fill="currentColor"
              className="text-[#1f6feb]"
            />
          </svg>
        </div>

        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center border border-[var(--border-color)] group-hover:border-[#1f6feb]/30 transition-colors">
              {repo.isForked ? <GitFork className="w-4 h-4 text-[#8b949e]" /> : <BookOpen className="w-4 h-4 text-[#2f81f7]" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[#2f81f7] transition-colors truncate max-w-[150px]">
                  {repo.name}
                </h4>
                {repo.pinned && <Pin className="w-3 h-3 text-[var(--text-secondary)] rotate-45" />}
              </div>
              <p className="text-[10px] text-[var(--text-secondary)]">{repo.owner.username}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
              repo.visibility === 'public' 
                ? 'bg-green-500/5 text-green-500/80 border-green-500/10' 
                : 'bg-amber-500/5 text-amber-500/80 border-amber-500/10'
            }`}>
              {repo.visibility}
            </span>
            {contributionBadge()}
          </div>
        </div>

        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-4 h-8 leading-relaxed">
          {repo.description}
        </p>

        {repo.isForked && (
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
              <GitFork className="w-3 h-3 text-[var(--text-secondary)]" />
              <span className="text-[10px] text-[var(--text-secondary)] truncate">
                forked from <span className="text-[#2f81f7]">{repo.parentRepo}</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-amber-500 font-bold">{repo.ahead} commits ahead</span>
              <button className="text-[9px] text-[#2f81f7] hover:underline flex items-center gap-1">
                <Repeat className="w-2.5 h-2.5" /> Sync upstream
              </button>
            </div>
          </div>
        )}

        {repo.type === 'admin' && (
          <div className="flex items-center gap-3 mb-4 p-2 rounded-lg bg-[#2f81f7]/5 border border-[#2f81f7]/10">
            <div className="flex items-center gap-1 text-[9px] text-[var(--text-secondary)]">
              <Users className="w-3 h-3" />
              {Math.floor(Math.random() * 5) + 2} collaborators
            </div>
            <div className="flex items-center gap-1 text-[9px] text-green-500/80">
              <Shield className="w-3 h-3" />
              Main protected
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: repo.language.color }} />
              <span className="text-[10px] text-[var(--text-secondary)]">{repo.language.name}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)]">
              <Star className="w-3 h-3" />
              {repo.stars > 1000 ? `${(repo.stars / 1000).toFixed(1)}k` : repo.stars}
            </div>
          </div>
          <span className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {getTimeAgo(repo.updatedAt)}
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="group flex items-center justify-between p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg hover:border-[#1f6feb]/30 hover:bg-[#1f6feb]/5 transition-all cursor-pointer"
      onClick={() => navigate(`/repo/${repo._id}`)}
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center border border-[var(--border-color)] group-hover:bg-[var(--bg-secondary)] transition-colors shrink-0">
          {repo.isForked ? <GitFork className="w-5 h-5 text-[#8b949e]" /> : <BookOpen className="w-5 h-5 text-[#2f81f7]" />}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[#2f81f7] transition-colors truncate">
              {repo.name}
            </h4>
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${
              repo.visibility === 'public' 
                ? 'bg-green-500/5 text-green-500/80 border-green-500/10' 
                : 'bg-amber-500/5 text-amber-500/80 border-amber-500/10'
            }`}>
              {repo.visibility}
            </span>
            {contributionBadge()}
            {repo.pinned && <Pin className="w-3 h-3 text-[var(--text-secondary)] rotate-45" />}
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xs text-[var(--text-secondary)] truncate max-w-[400px]">
              {repo.description}
            </p>
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: repo.language.color }} />
              <span className="text-[10px] text-[var(--text-secondary)]">{repo.language.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 shrink-0 ml-4">
        <div className="hidden sm:flex items-center gap-4">
          {repo.type === 'admin' && (
            <div className="flex items-center gap-3 mr-2">
              <div className="flex items-center gap-1 text-[10px] text-[#2f81f7] font-bold bg-[#2f81f7]/10 px-1.5 py-0.5 rounded border border-[#2f81f7]/20">
                <Shield className="w-2.5 h-2.5" />
                Admin
              </div>
              <div className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)]">
                <Users className="w-3 h-3" />
                {Math.floor(Math.random() * 10) + 2} members
              </div>
              <div className="flex items-center gap-1 text-[10px] text-green-500/80">
                <Lock className="w-3 h-3" />
                Protected
              </div>
            </div>
          )}
          {repo.isForked && (
            <div className="flex items-center gap-2 mr-2">
              <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                {repo.ahead} ahead
              </span>
              <button className="flex items-center gap-1 px-2 py-0.5 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded text-[10px] hover:bg-[var(--bg-secondary)] transition-colors">
                <Repeat className="w-2.5 h-2.5" />
                Sync
              </button>
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
            <Star className="w-3.5 h-3.5" />
            {repo.stars}
          </div>
          <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
            <GitFork className="w-3.5 h-3.5" />
            {repo.forks}
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-[var(--text-secondary)] whitespace-nowrap">Updated {getTimeAgo(repo.updatedAt)}</p>
          <div className="mt-1 flex gap-1 justify-end">
            <div className="w-16 h-4 opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all">
              <svg className="w-full h-full" viewBox="0 0 100 20">
                <path
                  d={`M0 20 ${repo.sparkline.map((v, i) => `L${(i / (repo.sparkline.length - 1)) * 100} ${20 - (v / 5)}`).join(' ')}`}
                  fill="none"
                  stroke="#238636"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
        <button className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded-md text-[var(--text-secondary)] transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

const RepositoriesPage = () => {
  const [activeSection, setActiveSection] = useState(() => localStorage.getItem('repo_active_section') || 'repositories');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('repo_view_mode') || 'list');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updated');
  const [filterType, setFilterType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isMainSidebarOpen, setIsMainSidebarOpen] = useState(false);
  const [repos, setRepos] = useState([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRepos = async () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const currentUsername = user.username || 'Pallavi-Chiluveru';
      
      setIsLoading(true);
      try {
        const res = await API.get('/repo-api/user');
        const transformedRepos = (res.data || []).map(repo => ({
          ...repo,
          type: repo.owner?.username === currentUsername ? 'owned' : 'contribution',
          language: repo.language || { name: 'JavaScript', color: '#f1e05a' },
          updatedAt: repo.updatedAt || new Date().toISOString(),
          stars: repo.stars || 0,
          forks: repo.forks || 0,
          visibility: (repo.visibility || 'public').toLowerCase(),
          sparkline: repo.sparkline || [10, 20, 30, 40, 50, 40, 30, 20, 10, 5] // Fallback sparkline
        }));
        setRepos(transformedRepos);
      } catch (err) {
        console.error('Error fetching repositories:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRepos();
  }, []);

  useEffect(() => {
    localStorage.setItem('repo_view_mode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('repo_active_section', activeSection);
  }, [activeSection]);

  const filteredRepos = useMemo(() => {
    return repos.filter(repo => {
      // Section Filter
      if (activeSection === 'all') {
        // Show everything
      } else if (activeSection === 'contributions' && repo.type !== 'contribution') {
        return false;
      } else if (activeSection === 'repositories' && repo.type !== 'owned' && repo.type !== 'admin') {
        return false;
      } else if (activeSection === 'forks' && !repo.isForked) {
        return false;
      } else if (activeSection === 'admin' && !repo.admin) {
        return false;
      }

      // Search Filter
      const matchesSearch = (repo.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                           (repo.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      // Property Filter
      const matchesType = filterType === 'all' || 
                         (filterType === 'public' && repo.visibility === 'public') ||
                         (filterType === 'private' && repo.visibility === 'private');

      return matchesSearch && matchesType;
    }).sort((a, b) => {
      if (sortBy === 'updated') return new Date(b.updatedAt) - new Date(a.updatedAt);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'stars') return b.stars - a.stars;
      return 0;
    });
  }, [repos, activeSection, searchTerm, sortBy, filterType]);

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'contributions': return 'My Contributions';
      case 'repositories': return 'My Repositories';
      case 'forks': return 'My Forks';
      case 'admin': return 'Admin Access';
      default: return 'All Repositories';
    }
  };

  const getSectionDescription = () => {
    switch (activeSection) {
      case 'contributions': return 'Projects you’ve participated in through commits, PRs, or reviews.';
      case 'repositories': return 'Repositories you own, manage, or created.';
      case 'forks': return 'Repositories copied from other sources for independent work.';
      case 'admin': return 'Repositories where you have administrative privileges.';
      default: return '';
    }
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center mb-6 border border-[var(--border-color)]">
        <BookOpen className="w-8 h-8 text-[var(--text-secondary)]" />
      </div>
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">No repositories found</h3>
      <p className="text-sm text-[var(--text-secondary)] max-w-xs mb-8">
        Try adjusting your search or filters to find what you're looking for.
      </p>
      <button 
        onClick={() => {
          setSearchTerm('');
          setFilterType('all');
        }}
        className="px-4 py-2 bg-[#2f81f7] hover:bg-[#388bfd] text-white text-sm font-bold rounded-lg transition-all"
      >
        Clear all filters
      </button>
    </div>
  );

  const SkeletonLoader = () => (
    <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="animate-pulse bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-5 h-40">
          <div className="flex gap-4 mb-4">
            <div className="w-10 h-10 bg-[var(--bg-tertiary)] rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[var(--bg-tertiary)] rounded w-1/2" />
              <div className="h-3 bg-[var(--bg-tertiary)] rounded w-1/4" />
            </div>
          </div>
          <div className="h-3 bg-[var(--bg-tertiary)] rounded w-full mb-2" />
          <div className="h-3 bg-[var(--bg-tertiary)] rounded w-2/3" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans transition-colors selection:bg-[#1f6feb]/30">
      <TopNavbar 
        onMenuClick={() => setIsMainSidebarOpen(!isMainSidebarOpen)} 
        title="Repositories"
      />
      <Sidebar isOpen={isMainSidebarOpen} setIsOpen={setIsMainSidebarOpen} />

      <div className="flex pt-16 h-screen overflow-hidden">
        {/* Repository Management Sidebar */}
        <aside 
          className={`flex-shrink-0 bg-[var(--bg-primary)] border-r border-[var(--border-color)] transition-all duration-300 ease-in-out flex flex-col ${
            isSidebarCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          <div className="p-4 flex items-center justify-between">
            {!isSidebarCollapsed && <h2 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Workspace</h2>}
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          <nav className="flex-1 px-2 space-y-1 overflow-y-auto custom-scrollbar">
            <SidebarItem 
              icon={Activity} 
              label="My Contributions" 
              active={activeSection === 'contributions'} 
              onClick={() => setActiveSection('contributions')} 
              isCollapsed={isSidebarCollapsed}
            />
            <SidebarItem 
              icon={BookOpen} 
              label="My Repositories" 
              active={activeSection === 'repositories'} 
              onClick={() => setActiveSection('repositories')} 
              isCollapsed={isSidebarCollapsed}
            />
            <SidebarItem 
              icon={GitFork} 
              label="My Forks" 
              active={activeSection === 'forks'} 
              onClick={() => setActiveSection('forks')} 
              isCollapsed={isSidebarCollapsed}
            />
             <SidebarItem 
              icon={Shield} 
              label="Admin Access" 
              active={activeSection === 'admin'} 
              isCollapsed={isSidebarCollapsed}
            />
            <div className="my-4 border-t border-[var(--border-color)] opacity-50" />
            <SidebarItem 
              icon={Sparkles} 
              label="Learn GitHub" 
              active={false} 
              onClick={() => navigate('/companion')} 
              isCollapsed={isSidebarCollapsed}
            />
          </nav>

          <div className="p-4 border-t border-[var(--border-color)]">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group">
              <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform duration-500" />
              {!isSidebarCollapsed && <span className="text-sm font-medium">Settings</span>}
            </button>
          </div>
        </aside>

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[var(--bg-secondary)]/30">
          <div className="max-w-[1400px] mx-auto p-4 md:p-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 mb-2"
                >
                  <div className="p-2.5 rounded-xl bg-[#1f6feb]/10 text-[#2f81f7] border border-[#1f6feb]/20">
                    {activeSection === 'contributions' && <Activity className="w-6 h-6" />}
                    {activeSection === 'repositories' && <BookOpen className="w-6 h-6" />}
                    {activeSection === 'forks' && <GitFork className="w-6 h-6" />}
                    {activeSection === 'admin' && <Shield className="w-6 h-6" />}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                    {getSectionTitle()}
                  </h1>
                </motion.div>
                <p className="text-[var(--text-secondary)] text-sm max-w-xl leading-relaxed">
                  {getSectionDescription()}
                </p>
              </div>
              <button 
                onClick={() => navigate('/create-repo')}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-[#238636]/20 active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" />
                New Repository
              </button>
            </div>

            {/* Toolbar */}
            <div className="sticky top-0 z-20 bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-color)] rounded-2xl p-3 mb-8 flex flex-col lg:flex-row gap-4 items-center shadow-xl shadow-black/10">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                <input 
                  type="text" 
                  placeholder="Search your workspace..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl pl-10 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[#2f81f7]/50 focus:border-[#2f81f7] transition-all"
                />
              </div>

              <div className="flex items-center gap-2 w-full lg:w-auto">
                <div className="relative flex-1 lg:flex-none min-w-[120px]">
                  <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full appearance-none bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#2f81f7]/50 pr-10"
                  >
                    <option value="all">Type: All</option>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="archived">Archived</option>
                  </select>
                  <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
                </div>


                <div className="h-8 w-[1px] bg-[var(--border-color)] mx-1 hidden lg:block" />

                <div className="flex bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl p-1 shrink-0">
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#1f6feb] text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#1f6feb] text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <SkeletonLoader />
                </motion.div>
              ) : filteredRepos.length > 0 ? (
                <motion.div
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}
                >
                  {filteredRepos.map((repo) => (
                    <RepoCard key={repo._id} repo={repo} viewMode={viewMode} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <EmptyState />
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </main>
      </div>

      {/* Decorative Gradients */}
      <div className="fixed top-0 right-0 -z-10 w-[600px] h-[600px] bg-[#1f6feb] opacity-[0.05] blur-[140px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-[#238636] opacity-[0.03] blur-[140px] rounded-full pointer-events-none" />
    </div>
  );
};

export default RepositoriesPage;
