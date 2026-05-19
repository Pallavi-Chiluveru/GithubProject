import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  ChevronRight,
  Info,
  Clock,
  Layout,
  MessageSquare,
  Users,
  Settings,
  Cpu,
  Zap,
  ArrowRight
} from 'lucide-react';


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
      <Icon className={`w-5 h-5 ${active ? 'text-[#6366F1]' : 'group-hover:scale-110 transition-transform'}`} />
      {!collapsed && (
        <span className={`text-sm font-medium transition-opacity duration-300 ${active ? 'font-bold' : ''}`}>
          {label}
        </span>
      )}
      {active && (
        <motion.div 
          layoutId="activeTab"
          className="absolute left-0 w-1 h-6 bg-[#6366F1] rounded-r-full"
        />
      )}
    </>
  );

  if (to) {
    return (
      <Link 
        to={to}
        onClick={onClick}
        className={`group relative flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${
          active 
            ? 'bg-[#6366F1]/10 text-[#6366F1]' 
            : 'text-[#9CA3AF] hover:bg-white/5 hover:text-[#F3F4F6]'
        }`}
      >
        {content}
      </Link>
    );
  }

  return (
    <button 
      onClick={onClick}
      className={`group relative flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${
        active 
          ? 'bg-[#6366F1]/10 text-[#6366F1]' 
          : 'text-[#9CA3AF] hover:bg-white/5 hover:text-[#F3F4F6]'
      }`}
    >
      {content}
    </button>
  );
};

const SpaceCard = ({ space, onAction, onToggleStar, onClick }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group bg-[#010409] border border-[#30363d] rounded-2xl p-5 hover:border-[#6366F1]/30 hover:shadow-2xl hover:shadow-[#6366F1]/5 transition-all cursor-pointer relative overflow-hidden"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          {space.visibility === 'Public' ? <Globe className="w-3.5 h-3.5 text-green-400" /> : <Lock className="w-3.5 h-3.5 text-amber-400" />}
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
            space.visibility === 'Public' ? 'bg-green-400/10 text-green-400' : 'bg-amber-400/10 text-amber-400'
          }`}>
            {space.visibility}
          </span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleStar(space.id || space._id); }}
          className={`p-2 rounded-lg transition-colors ${space.isStarred ? 'text-amber-400 bg-amber-400/10' : 'text-[#9CA3AF] hover:bg-white/5 hover:text-white'}`}
        >
          <Star className={`w-4 h-4 ${space.isStarred ? 'fill-current' : ''}`} />
        </button>
      </div>

      <h3 className="text-lg font-bold text-[#F3F4F6] group-hover:text-[#6366F1] transition-colors">{space.title}</h3>
      <p className="text-sm text-[#9CA3AF] mt-2 line-clamp-2 min-h-[40px]">{space.description}</p>

      <div className="flex flex-wrap gap-2 mt-4">
        {space.tags.map(tag => (
          <span key={tag} className="text-[10px] font-medium bg-[#0B1120] text-[#9CA3AF] px-2 py-1 rounded-md border border-white/5 group-hover:border-[#6366F1]/20 transition-colors">
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
        <div className="flex -space-x-2">
          {space.members.map((member, i) => (
            <img key={i} src={member.avatar} className="w-6 h-6 rounded-full border-2 border-[#111827]" alt="member" />
          ))}
          <div className="w-6 h-6 rounded-full border-2 border-[#111827] bg-[#0B1120] flex items-center justify-center text-[8px] font-bold text-[#9CA3AF]">
            +2
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[#9CA3AF] flex items-center gap-1">
            <Clock className="w-3 h-3" /> {space.updatedAt}
          </span>
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-1.5 hover:bg-white/5 rounded-md text-[#9CA3AF] hover:text-white transition-all"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute bottom-full right-0 mb-2 w-36 bg-[#0B1120] border border-white/10 rounded-xl shadow-2xl z-[100] overflow-hidden py-1"
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
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-left hover:bg-white/5 transition-colors ${item.danger ? 'text-red-400 hover:bg-red-400/10' : 'text-[#9CA3AF] hover:text-white'}`}
                    >
                      <item.icon className="w-3.5 h-3.5" />
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
      const res = await axios.get('http://127.0.0.1:5000/space-api');
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
      tags: newSpace.tags.split(',').map(t => t.trim()),
      members: [{ id: 'u1', avatar: 'https://ui-avatars.com/api/?name=Pallavi&background=6366F1&color=fff' }],
      tab: 'yours'
    };
    
    try {
      const res = await axios.post('http://127.0.0.1:5000/space-api', spaceData);
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
          await axios.delete(`http://127.0.0.1:5000/space-api/${id}`);
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
      const res = await axios.patch(`http://127.0.0.1:5000/space-api/${id}/star`);
      setSpaces(spaces.map(s => (s.id === id || s._id === id) ? res.data.payload : s));
    } catch (err) {
      console.error('Error toggling star:', err);
    }
  };

  const filteredSpaces = spaces.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTab = activeTab === 'starred' ? s.isStarred : s.tab === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans overflow-hidden transition-colors">
      {/* Sidebar */}
      <aside className={`flex flex-col border-r border-[var(--border-color)] transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}>
        <div className="p-6 flex items-center justify-between">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#6366F1] rounded-xl flex items-center justify-center shadow-lg shadow-[#6366F1]/20">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight uppercase">Anti-Gravity</span>
            </div>
          )}
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-2 hover:bg-white/5 rounded-lg text-[#9CA3AF]">
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <SidebarItem icon={Layout} label="Dashboard" to="/dashboard" collapsed={isSidebarCollapsed} />
          <SidebarItem icon={Star} label="Starred" active={activeTab === 'starred'} onClick={() => setActiveTab('starred')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={Plus} label="Spaces" active={activeTab === 'yours' || activeTab === 'shared' || activeTab === 'orgs'} onClick={() => setActiveTab('yours')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={Cpu} label="AI Assistant" to="/agent" collapsed={isSidebarCollapsed} />

          <SidebarItem icon={Settings} label="Settings" to="/settings" collapsed={isSidebarCollapsed} />
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className={`flex items-center gap-3 p-2 rounded-xl bg-white/5 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
            <img src="https://ui-avatars.com/api/?name=Pallavi&background=6366F1&color=fff" className="w-8 h-8 rounded-full" alt="profile" />
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">Pallavi-Chiluveru</p>
                <p className="text-[10px] text-[#8b949e] truncate">Pro Developer</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="p-8 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-white">Spaces</h1>
              <p className="text-[#9CA3AF] text-sm mt-1">Group repositories, files, and AI context into intelligent workspaces.</p>
            </div>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white rounded-xl font-bold shadow-xl shadow-[#6366F1]/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Space
            </button>
          </div>

          <div className="mt-8 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] group-focus-within:text-[#6366F1] transition-colors" />
              <input 
                type="text" 
                placeholder="Search workspaces, tags, or members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111827] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 transition-all placeholder:text-[#9CA3AF]/40"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mt-8 overflow-x-auto pb-2 scrollbar-hide">
            {TABS.map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'text-white' 
                    : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                <span className="ml-1.5 px-2 py-0.5 rounded-full bg-[#111827] text-[10px] border border-white/5">
                  {tab.id === 'starred' ? spaces.filter(s => s.isStarred).length : spaces.filter(s => s.tab === tab.id).length}
                </span>
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="tab-underline"
                    className="absolute inset-0 bg-[#6366F1]/10 rounded-full -z-10 border border-[#6366F1]/30"
                  />
                )}
              </button>
            ))}
          </div>
        </header>

        {/* AI Banner */}
        <div className="px-8 mt-6">
          <div className="bg-gradient-to-r from-[#6366F1]/10 to-[#8B5CF6]/10 border border-[#6366F1]/20 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
                <Cpu className="w-6 h-6 text-[#6366F1]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Copilot Recommendation</h4>
                <p className="text-xs text-[#9CA3AF]">Based on your activity, we suggest creating a space for "Project Quantum".</p>
              </div>
            </div>
            <button className="text-xs font-bold text-[#6366F1] hover:underline flex items-center gap-1">
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
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-24 h-24 bg-[#111827] rounded-3xl flex items-center justify-center mb-6">
                  <Layout className="w-12 h-12 text-[#30363d]" />
                </div>
                <h3 className="text-xl font-bold text-white">No spaces found</h3>
                <p className="text-[#9CA3AF] text-sm mt-2 max-w-xs">You haven't created any spaces in this category yet.</p>
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-8 px-6 py-2.5 bg-white text-[#0B1120] rounded-xl text-sm font-bold hover:scale-105 transition-all"
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
              className="fixed bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 bg-[#111827] border border-white/10 rounded-2xl shadow-2xl z-[200] flex items-center gap-3"
            >
              <Info className="w-4 h-4 text-[#6366F1]" />
              <span className="text-sm font-bold text-white">{showToast}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Create Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-[#0B1120]/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#111827] border border-white/10 rounded-3xl shadow-3xl overflow-hidden"
            >
              <form onSubmit={handleCreateSpace} className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">New Space</h2>
                  <button type="button" onClick={() => setIsCreateModalOpen(false)} className="text-[#9CA3AF] hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#9CA3AF] uppercase tracking-widest mb-2">Space Name</label>
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="e.g. Project Quantum"
                      value={newSpace.title}
                      onChange={(e) => setNewSpace({ ...newSpace, title: e.target.value })}
                      className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#9CA3AF] uppercase tracking-widest mb-2">Description</label>
                    <textarea 
                      placeholder="What is this space for?"
                      rows={3}
                      value={newSpace.description}
                      onChange={(e) => setNewSpace({ ...newSpace, description: e.target.value })}
                      className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#9CA3AF] uppercase tracking-widest mb-2">Visibility</label>
                      <select 
                        value={newSpace.visibility}
                        onChange={(e) => setNewSpace({ ...newSpace, visibility: e.target.value })}
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 appearance-none"
                      >
                        <option>Private</option>
                        <option>Public</option>
                        <option>Organization</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#9CA3AF] uppercase tracking-widest mb-2">Tags</label>
                      <input 
                        type="text" 
                        placeholder="tag1, tag2..."
                        value={newSpace.tags}
                        onChange={(e) => setNewSpace({ ...newSpace, tags: e.target.value })}
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-sm font-bold hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] py-3 px-4 bg-[#6366F1] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#6366F1]/20 hover:scale-105 transition-all"
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
