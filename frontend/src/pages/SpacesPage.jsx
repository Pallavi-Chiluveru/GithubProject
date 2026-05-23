import React, { useState, useEffect } from 'react';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Star, 
  User, 
  Globe, 
  Lock, 
  Building, 
  MoreVertical, 
  Edit2, 
  Share2, 
  Copy, 
  Archive, 
  Trash2,
  X,
  Clock,
  Layout,
  Users,
  Settings,
  Cpu,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import GithubIcon from '../components/GithubIcon';

const TABS = [
  { id: 'starred', label: 'Starred', icon: Star },
  { id: 'yours', label: 'Yours', icon: User },
  { id: 'shared', label: 'Shared with me', icon: Users },
  { id: 'orgs', label: 'Organizations', icon: Building }
];

const INITIAL_SPACES = [];

const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed, to }) => {
  const content = (
    <>
      <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
        active 
          ? 'text-[#6366F1] scale-110' 
          : 'text-[var(--text-secondary)] group-hover:scale-110'
      }`} />
      {!collapsed && (
        <span className={`text-sm transition-all duration-200 truncate ${
          active 
            ? 'font-bold text-[#6366F1] dark:text-white' 
            : 'font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
        }`}>
          {label}
        </span>
      )}
      {active && (
        <motion.div 
          layoutId="activeTab"
          className="absolute left-0 w-1.2 h-6 bg-[#6366F1] rounded-r-full"
        />
      )}
    </>
  );

  const baseClass = `group relative flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 ${
    active 
      ? 'bg-[#6366F1]/10 text-[#6366F1] dark:text-white shadow-xs' 
      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
  }`;

  if (to) {
    return (
      <Link to={to} onClick={onClick} className={baseClass}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={baseClass}>
      {content}
    </button>
  );
};

const SpaceCard = ({ space, onAction, onToggleStar, onClick }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="group bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-5 hover:border-[#6366F1]/40 shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[220px]"
      onClick={onClick}
    >
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            {space.visibility === 'Public' ? (
              <Globe className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            )}
            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
              space.visibility === 'Public' 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
            }`}>
              {space.visibility}
            </span>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleStar(space.id || space._id); }}
            className={`p-1.5 rounded-lg border transition-all hover:scale-105 active:scale-95 ${
              space.isStarred 
                ? 'text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-xs' 
                : 'text-[var(--text-secondary)] border-transparent hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${space.isStarred ? 'fill-current' : ''}`} />
          </button>
        </div>

        <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[#6366F1] transition-colors duration-200 line-clamp-1">{space.title}</h3>
        <p className="text-xs text-[var(--text-secondary)] mt-1.5 line-clamp-2 min-h-[32px] leading-relaxed">{space.description || 'No description provided.'}</p>

        {space.tags && space.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {space.tags.map(tag => (
              <span key={tag} className="text-[9px] font-semibold bg-[var(--bg-secondary)] text-[var(--text-secondary)] px-2.5 py-0.8 rounded-md border border-[var(--border-color)]/60 group-hover:border-[#6366F1]/20 transition-all duration-200">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-5 pt-4 border-t border-[var(--border-color)]/50">
        <div className="flex -space-x-1.5">
          {(space.members || []).slice(0, 3).map((member, i) => (
            <img key={i} src={member.avatar} className="w-5.5 h-5.5 rounded-full border-2 border-[var(--card-bg)] shadow-xs" alt="member" />
          ))}
          {space.members && space.members.length > 3 && (
            <div className="w-5.5 h-5.5 rounded-full border-2 border-[var(--card-bg)] bg-[var(--bg-secondary)] flex items-center justify-center text-[7px] font-bold text-[var(--text-secondary)] shadow-xs">
              +{space.members.length - 3}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-[var(--text-secondary)] flex items-center gap-1 font-medium">
            <Clock className="w-3 h-3 text-[var(--text-muted)]" /> {space.updatedAt}
          </span>
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-1 hover:bg-[var(--bg-tertiary)] rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  className="absolute bottom-full right-0 mb-2 w-32 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-2xl z-[100] overflow-hidden py-1"
                >
                  {[
                    { id: 'edit', label: 'Edit', icon: Edit2 },
                    { id: 'share', label: 'Share', icon: Share2 },
                    { id: 'duplicate', label: 'Duplicate', icon: Copy },
                    { id: 'archive', label: 'Archive', icon: Archive },
                    { id: 'delete', label: 'Delete', icon: Trash2, danger: true }
                  ].map(item => (
                    <button 
                      key={item.id}
                      onClick={(e) => { e.stopPropagation(); onAction(item.id, space.id || space._id); setShowMenu(false); }}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-[10px] font-semibold text-left hover:bg-[var(--bg-tertiary)] transition-colors ${item.danger ? 'text-red-500 hover:bg-red-500/10' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    >
                      <item.icon className="w-3 h-3" />
                      {item.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const SpacesPage = () => {
  const navigate = useNavigate();
  const [spaces, setSpaces] = useState(INITIAL_SPACES);
  const [activeTab, setActiveTab] = useState('yours');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSpace, setNewSpace] = useState({ title: '', description: '', visibility: 'Private', tags: '' });
  const [showToast, setShowToast] = useState(null);

  const triggerToast = (msg) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    try {
      const res = await API.get('/space-api');
      setSpaces(res.data.payload);
    } catch (err) {
      console.error('Error fetching spaces:', err);
    }
  };

  const handleCreateSpace = async (e) => {
    e.preventDefault();
    if (!newSpace.title) return;
    
    const spaceData = {
      title: newSpace.title,
      description: newSpace.description,
      visibility: newSpace.visibility,
      tags: newSpace.tags ? newSpace.tags.split(',').map(t => t.trim()) : [],
      members: [{ id: 'u1', avatar: 'https://ui-avatars.com/api/?name=Pallavi&background=6366F1&color=fff' }],
      tab: 'yours'
    };
    
    try {
      const res = await API.post('/space-api', spaceData);
      setSpaces([res.data.payload, ...spaces]);
      setIsCreateModalOpen(false);
      setNewSpace({ title: '', description: '', visibility: 'Private', tags: '' });
      triggerToast('✅ Space created successfully!');
    } catch (err) {
      console.error('Error creating space:', err);
      triggerToast('❌ Error creating space');
    }
  };

  const handleAction = async (action, id) => {
    if (action === 'delete') {
      if (window.confirm('Are you sure you want to delete this space?')) {
        try {
          await API.delete(`/space-api/${id}`);
          setSpaces(spaces.filter(s => s.id !== id && s._id !== id));
          triggerToast('🗑️ Space deleted');
        } catch (err) {
          console.error('Error deleting space:', err);
          triggerToast('❌ Error deleting space');
        }
      }
    } else {
      triggerToast(`Feature "${action}" coming soon!`);
    }
  };

  const toggleStar = async (id) => {
    try {
      const res = await API.patch(`/space-api/${id}/star`);
      setSpaces(spaces.map(s => (s.id === id || s._id === id) ? res.data.payload : s));
    } catch (err) {
      console.error('Error toggling star:', err);
    }
  };

  const filteredSpaces = spaces.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (s.tags && s.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesTab = activeTab === 'starred' ? s.isStarred : s.tab === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="flex h-screen bg-[var(--bg-secondary)] text-[var(--text-primary)] font-sans overflow-hidden transition-colors duration-300">
      
      {/* Sidebar */}
      <aside className={`flex flex-col bg-[var(--sidebar-bg)] border-r border-[var(--border-color)] shadow-xs transition-all duration-300 relative z-30 ${
        isSidebarCollapsed ? 'w-20' : 'w-72'
      }`}>
        <div className="p-5 flex items-center justify-between border-b border-[var(--border-color)]">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-3 pl-1">
              <GithubIcon className="h-9 object-contain" />
            </div>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all ml-auto"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1.5 mt-5">
          <SidebarItem icon={Layout} label="Dashboard" to="/dashboard" collapsed={isSidebarCollapsed} />
          <SidebarItem icon={Star} label="Starred" active={activeTab === 'starred'} onClick={() => setActiveTab('starred')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={Plus} label="Spaces" active={activeTab === 'yours' || activeTab === 'shared' || activeTab === 'orgs'} onClick={() => setActiveTab('yours')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={Cpu} label="AI Assistant" to="/agent" collapsed={isSidebarCollapsed} />
          <SidebarItem icon={Settings} label="Settings" to="/settings" collapsed={isSidebarCollapsed} />
        </nav>

        <div className="p-4 border-t border-[var(--border-color)]">
          <div className={`flex items-center gap-3 p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 ${
            isSidebarCollapsed ? 'justify-center' : ''
          }`}>
            <img 
              src="https://ui-avatars.com/api/?name=Pallavi&background=6366F1&color=fff" 
              className="w-7 h-7 rounded-full border border-[var(--border-color)]/80" 
              alt="profile" 
            />
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate text-[var(--text-primary)]">Pallavi-Chiluveru</p>
                <p className="text-[9px] text-[var(--text-secondary)] font-semibold truncate leading-none mt-0.5">Pro Developer</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <header className="p-8 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">Spaces</h1>
              <p className="text-[var(--text-secondary)] text-xs mt-1.5 leading-relaxed font-medium">Group repositories, files, and AI context into intelligent workspaces.</p>
            </div>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5558e6] hover:to-[#7c4ee0] text-white rounded-xl font-bold shadow-lg shadow-[#6366F1]/15 hover:shadow-xl hover:shadow-[#6366F1]/25 hover:scale-[1.02] active:scale-98 transition-all duration-200 cursor-pointer text-sm"
            >
              <Plus className="w-4 h-4" />
              Create Space
            </button>
          </div>

          <div className="mt-6 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 group w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] group-focus-within:text-[#6366F1] transition-colors" />
              <input 
                type="text" 
                placeholder="Search workspaces, tags, or members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl py-2.5 pl-12 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] transition-all"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1.5 scrollbar-hide">
            {TABS.map(tab => {
              const count = tab.id === 'starred' 
                ? spaces.filter(s => s.isStarred).length 
                : spaces.filter(s => s.tab === tab.id).length;

              return (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-4.5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'text-[#6366F1] dark:text-white' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                  <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold border transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#6366F1]/15 text-[#6366F1] border-[#6366F1]/25'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)]/60'
                  }`}>
                    {count}
                  </span>
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="tab-underline"
                      className="absolute inset-0 bg-[#6366F1]/10 rounded-full -z-10 border border-[#6366F1]/25"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </header>

        {/* AI Banner */}
        <div className="px-8 mt-6 flex-shrink-0">
          <div className="bg-gradient-to-r from-[#6366F1]/8 to-[#8B5CF6]/8 border border-[#6366F1]/20 rounded-2xl p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-full bg-[var(--card-bg)] border border-[var(--border-color)] flex items-center justify-center shadow-xs flex-shrink-0">
                <Cpu className="w-4 h-4 text-[#6366F1]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[var(--text-primary)]">Copilot Recommendation</h4>
                <p className="text-[11px] text-[var(--text-secondary)] font-medium mt-0.5">Based on your activity, we suggest creating a space for "Project Quantum".</p>
              </div>
            </div>
            <button className="text-[11px] font-bold text-[#6366F1] hover:text-[#5558e6] hover:underline flex items-center gap-0.8 flex-shrink-0 ml-3">
              Analyze Context <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar pb-32">
          <AnimatePresence mode="popLayout">
            {filteredSpaces.length > 0 ? (
              <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {filteredSpaces.map(space => (
                  <SpaceCard 
                    key={space.id || space._id} 
                    space={space} 
                    onAction={handleAction}
                    onToggleStar={toggleStar}
                    onClick={() => navigate(`/spaces/${space.id || space._id}`)}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-8 max-w-md mx-auto shadow-[var(--card-shadow)] mt-6"
              >
                <div className="w-16 h-16 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl flex items-center justify-center mb-5 shadow-xs">
                  <Layout className="w-8 h-8 text-[#6366F1]" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">No spaces found</h3>
                <p className="text-[var(--text-secondary)] text-xs mt-2 max-w-xs leading-relaxed">You haven't created any spaces in this category yet.</p>
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-6 px-5 py-2.5 bg-[#6366F1] hover:bg-[#5558e6] text-white rounded-xl text-xs font-bold shadow-lg shadow-[#6366F1]/15 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  Create your first space
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Toast */}
        <AnimatePresence>
          {showToast && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 px-5 py-2.5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl z-[200] flex items-center gap-2.5"
            >
              <Info className="w-4 h-4 text-[#6366F1]" />
              <span className="text-xs font-bold text-[var(--text-primary)]">{showToast}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Create Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-5 bg-black/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl shadow-3xl overflow-hidden z-10"
            >
              <form onSubmit={handleCreateSpace} className="p-7 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">New Space</h2>
                  <button type="button" onClick={() => setIsCreateModalOpen(false)} className="p-1 hover:bg-[var(--bg-tertiary)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all">
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Space Name</label>
                    <input 
                      autoFocus
                      type="text" 
                      required
                      placeholder="e.g. Project Quantum"
                      value={newSpace.title}
                      onChange={(e) => setNewSpace({ ...newSpace, title: e.target.value })}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/40 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Description</label>
                    <textarea 
                      placeholder="What is this space for?"
                      rows={3}
                      value={newSpace.description}
                      onChange={(e) => setNewSpace({ ...newSpace, description: e.target.value })}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/40 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Visibility</label>
                      <select 
                        value={newSpace.visibility}
                        onChange={(e) => setNewSpace({ ...newSpace, visibility: e.target.value })}
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1]"
                      >
                        <option>Private</option>
                        <option>Public</option>
                        <option>Organization</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Tags</label>
                      <input 
                        type="text" 
                        placeholder="tag1, tag2..."
                        value={newSpace.tags}
                        onChange={(e) => setNewSpace({ ...newSpace, tags: e.target.value })}
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/40 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-3">
                  <button 
                    type="button" 
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-[var(--border-color)] text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] py-2.5 px-4 bg-[#6366F1] hover:bg-[#5558e6] text-white rounded-xl text-xs font-bold shadow-lg shadow-[#6366F1]/15 hover:scale-[1.02] active:scale-98 transition-all duration-200"
                  >
                    Create Space
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpacesPage;
