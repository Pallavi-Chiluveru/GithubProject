import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, UserPlus, Mail, Filter, MoreVertical, Shield, User, 
  Check, X, Trash2, RefreshCw, ChevronDown, Info, ArrowRight, Clock, 
  Copy, AlertTriangle, CheckCircle2, Circle, Settings, ChevronRight
} from 'lucide-react';
import API from '../api';
import { ROLES, ROLE_CONFIGS, CUSTOM_PERMISSIONS_LIST } from '../constants/rolesConfig';
import InviteConfirmationModal from './InviteConfirmationModal';

const Skeleton = () => (
  <div className="bg-[#111827] border border-[#30363d]/50 rounded-2xl p-5 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-[#30363d]/50" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-[#30363d]/50 rounded w-1/3" />
        <div className="h-3 bg-[#30363d]/50 rounded w-1/2" />
      </div>
    </div>
    <div className="flex gap-2 mt-4">
      <div className="h-6 bg-[#30363d]/50 rounded w-20" />
      <div className="h-6 bg-[#30363d]/50 rounded w-32" />
    </div>
  </div>
);

const RoleSelector = ({ selectedRole, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentRole = ROLE_CONFIGS[selectedRole];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-bold ${currentRole.bg} ${currentRole.border} ${currentRole.color} hover:brightness-110`}
      >
        <currentRole.icon size={14} />
        {currentRole.title}
        <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[120]" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full right-0 mt-2 w-64 bg-[#0B1120] border border-[#30363d] rounded-xl shadow-2xl z-[130] overflow-hidden py-2"
            >
              {Object.entries(ROLE_CONFIGS).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => {
                    onSelect(key);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start gap-3 px-4 py-2.5 hover:bg-[#6366F1]/10 transition-colors group ${selectedRole === key ? 'bg-[#6366F1]/5' : ''}`}
                >
                  <div className={`mt-1 p-1.5 rounded-lg ${config.bg} ${config.border} border`}>
                    <config.icon size={14} className={config.color} />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      {config.title}
                      {selectedRole === key && <Check size={12} className="text-[#10b981]" />}
                    </div>
                    <p className="text-[10px] text-[#9CA3AF] line-clamp-2 leading-relaxed mt-0.5">{config.description}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const PermissionPanel = ({ roleKey, customPermissions, onToggleCustom }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = ROLE_CONFIGS[roleKey];

  return (
    <div className="bg-[#111827]/50 border border-[#30363d] rounded-2xl overflow-hidden transition-all">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-[#6366F1]/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings size={14} className="text-[#9CA3AF]" />
          <span className="text-xs font-bold text-[#E5E7EB] uppercase tracking-wider">Permissions for {config.title}</span>
        </div>
        <ChevronDown size={14} className={`text-[#9CA3AF] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-4">
              <p className="text-xs text-[#9CA3AF] leading-relaxed italic">{config.description}</p>
              
              {config.warning && (
                <div className="flex items-center gap-2.5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <AlertTriangle size={14} className="text-red-500 shrink-0" />
                  <p className="text-[10px] font-bold text-red-400">{config.warning}</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-2.5">
                {config.permissions.map((perm) => (
                  <div key={perm.id} className="flex items-center gap-2.5">
                    {perm.allowed ? (
                      <CheckCircle2 size={14} className="text-[#10b981]" />
                    ) : (
                      <Circle size={14} className="text-red-500/40" />
                    )}
                    <span className={`text-[11px] ${perm.allowed ? "text-[#E5E7EB]" : "text-[#9CA3AF] line-through"}`}>
                      {perm.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[#30363d]">
                <h4 className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-3">Custom Overrides</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CUSTOM_PERMISSIONS_LIST.map((p) => (
                    <label key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-[#0B1120] border border-[#30363d] cursor-pointer hover:border-[#6366F1]/50 transition-all">
                      <span className="text-[10px] text-[#E5E7EB]">{p.label}</span>
                      <input 
                        type="checkbox" 
                        checked={customPermissions[p.id] || false}
                        onChange={() => onToggleCustom(p.id)}
                        className="w-3 h-3 rounded bg-[#111827] border-[#30363d] text-[#6366F1] focus:ring-0 focus:ring-offset-0"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const OrgMembersView = ({ orgId, members, onRemove, onChangeRole, onInvite, currentUserId, isLoading, forceOpenInvite, onCloseInvite }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filterRole, setFilterRole] = useState('All');
  const [isInviteDrawerOpen, setIsInviteDrawerOpen] = useState(false);
  const [showToast, setShowToast] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  
  const [selectedInvites, setSelectedInvites] = useState([]);
  const [confirmInvite, setConfirmInvite] = useState(null);

  // Handle forced open from parent
  useEffect(() => {
    if (forceOpenInvite) {
      setIsInviteDrawerOpen(true);
      if (onCloseInvite) onCloseInvite(); // Reset the flag in parent
    }
  }, [forceOpenInvite, onCloseInvite]);

  const triggerToast = (msg, type = 'success') => {
    setShowToast({ msg, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  const searchUsers = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await API.get(`/user-api/find?query=${query}`);
      // Filter out users already in selectedInvites or already members
      const filtered = (res.data || []).filter(u => 
        !members.some(m => m.user?._id === u._id) && 
        !selectedInvites.some(s => s.user._id === u._id)
      );
      setSearchResults(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  }, [members, selectedInvites]);


  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, searchUsers]);

  const addInvite = (user) => {
    setSelectedInvites(prev => [...prev, {
      user,
      role: ROLES.COLLABORATOR,
      customPermissions: {}
    }]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeSelectedInvite = (userId) => {
    setSelectedInvites(prev => prev.filter(i => i.user._id !== userId));
  };

  const updateInviteRole = (userId, role) => {
    setSelectedInvites(prev => prev.map(i => 
      i.user._id === userId ? { ...i, role } : i
    ));
  };

  const toggleCustomPermission = (userId, permId) => {
    setSelectedInvites(prev => prev.map(i => 
      i.user._id === userId ? { 
        ...i, 
        customPermissions: { 
          ...i.customPermissions, 
          [permId]: !i.customPermissions[permId] 
        } 
      } : i
    ));
  };

  const handleInviteSubmit = () => {
    if (selectedInvites.length === 0) return;
    if (selectedInvites.length === 1) {
      setConfirmInvite(selectedInvites[0]);
    } else {
      // Multi-invite direct send for now, or could show a multi-confirm
      selectedInvites.forEach(invite => {
        onInvite({ 
          orgId,
          usernameOrEmail: invite.user.username,
          role: invite.role,
          customPermissions: invite.customPermissions
        });
      });
      setIsInviteDrawerOpen(false);
      setSelectedInvites([]);
      triggerToast(`${selectedInvites.length} invitations sent successfully!`);
    }
  };

  const finalizeInvitation = () => {
    if (!confirmInvite) return;
    onInvite({
      orgId,
      usernameOrEmail: confirmInvite.user.username,
      role: confirmInvite.role,
      customPermissions: confirmInvite.customPermissions
    });
    setConfirmInvite(null);
    setIsInviteDrawerOpen(false);
    setSelectedInvites([]);
    triggerToast("Invitation sent successfully!");
  };

  const filteredMembers = members.filter(m => {
    const username = m.user?.username?.toLowerCase() || '';
    const email = m.user?.email?.toLowerCase() || '';
    const query = memberSearchQuery.toLowerCase();
    
    const matchesSearch = username.includes(query) || email.includes(query);
    const matchesFilter = filterRole === 'All' || m.role === filterRole;
    return matchesSearch && matchesFilter;
  });

  const pendingInvites = []; // This would normally come from backend

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-8 right-8 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl border shadow-2xl backdrop-blur-md ${
              showToast.type === 'success' ? 'bg-[#10b981]/10 border-[#10b981]/20 text-[#10b981]' : 'bg-[#ef4444]/10 border-[#ef4444]/20 text-[#ef4444]'
            }`}
          >
            {showToast.type === 'success' ? <Check size={18} /> : <Info size={18} />}
            <span className="text-sm font-medium">{showToast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#111827]/40 p-4 rounded-2xl border border-[#30363d]/50 backdrop-blur-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input 
            type="text" 
            placeholder="Search members by name or email..."
            value={memberSearchQuery}
            onChange={(e) => setMemberSearchQuery(e.target.value)}
            className="w-full bg-[#0B1120] border border-[#30363d] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 transition-all placeholder:text-[#9CA3AF]/50"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-[#0B1120] border border-[#30363d] rounded-xl text-sm font-medium text-[#E5E7EB] hover:border-[#6366F1]/50 transition-all">
              <Filter className="w-4 h-4 text-[#9CA3AF]" />
              {filterRole}
              <ChevronDown className="w-3 h-3 text-[#9CA3AF]" />
            </button>
            <div className="absolute top-full right-0 mt-2 w-40 bg-[#111827] border border-[#30363d] rounded-xl shadow-2xl z-50 py-1 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all translate-y-2 group-hover:translate-y-0">
              {['All', 'OWNER', 'MAINTAINER', 'COLLABORATOR', 'CONTRIBUTOR', 'VIEWER'].map(role => (
                <button 
                  key={role}
                  onClick={() => setFilterRole(role)}
                  className="w-full text-left px-4 py-2 text-sm text-[#9CA3AF] hover:text-white hover:bg-[#6366F1]/10 transition-colors"
                >
                  {role === 'All' ? 'All Roles' : role.charAt(0) + role.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
          
          <button 
            onClick={() => setIsInviteDrawerOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#6366F1]/20 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            Invite Member
          </button>
        </div>
      </div>

      {/* Members List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {isLoading ? (
          <>
            <Skeleton />
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {filteredMembers.map((member, idx) => (
                <motion.div 
                  key={member._id || idx}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative bg-[#111827] border border-[#30363d]/50 rounded-2xl p-5 hover:border-[#6366F1]/30 transition-all hover:shadow-2xl hover:shadow-[#6366F1]/5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img 
                          src={member.user?.profileImageUrl || `https://ui-avatars.com/api/?name=${member.user?.username}&background=random`} 
                          alt="" 
                          className="w-12 h-12 rounded-2xl object-cover border border-[#30363d] shadow-inner"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#111827] ${member.user?.isUserActive ? 'bg-[#10b981]' : 'bg-[#9CA3AF]'}`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#E5E7EB] flex items-center gap-2">
                          {member.user?.username}
                          {member.user?._id === currentUserId && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#6366F1]/20 text-[#6366F1]">You</span>
                          )}
                        </h3>
                        <p className="text-xs text-[#9CA3AF] mt-0.5">{member.user?.email}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                            ROLE_CONFIGS[member.role]?.bg || 'bg-indigo-500/10'
                          } ${ROLE_CONFIGS[member.role]?.border || 'border-indigo-500/20'} ${ROLE_CONFIGS[member.role]?.color || 'text-indigo-500'}`}>
                            {ROLE_CONFIGS[member.role] ? React.createElement(ROLE_CONFIGS[member.role].icon, { size: 12 }) : <Shield size={12} />}
                            {member.role}
                          </span>
                          <span className="text-[10px] text-[#9CA3AF] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Joined {new Date(member.createdAt || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <button 
                        onClick={() => setActiveMenu(activeMenu === idx ? null : idx)}
                        className="p-2 hover:bg-[#0B1120] rounded-xl text-[#9CA3AF] hover:text-white transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {activeMenu === idx && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-[#0B1120] border border-[#30363d] rounded-2xl shadow-2xl z-[60] overflow-hidden py-1.5 animate-in zoom-in-95 duration-150">
                          <button className="w-full text-left px-4 py-2 text-xs text-[#E5E7EB] hover:bg-[#6366F1]/10 flex items-center gap-2 transition-colors">
                            <User className="w-3.5 h-3.5" /> View Profile
                          </button>
                          <button className="w-full text-left px-4 py-2 text-xs text-[#E5E7EB] hover:bg-[#6366F1]/10 flex items-center gap-2 transition-colors">
                            <RefreshCw className="w-3.5 h-3.5" /> Change Role
                          </button>
                          <div className="h-[1px] bg-[#30363d] my-1.5 mx-2" />
                          <button 
                            onClick={() => {
                              onRemove(member.user?._id);
                              setActiveMenu(null);
                              triggerToast("Member removed from organization", "error");
                            }}
                            className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-400/10 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove from Org
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredMembers.length === 0 && (
              <div className="col-span-full py-20 text-center flex flex-col items-center justify-center bg-[#111827]/20 border-2 border-dashed border-[#30363d] rounded-3xl">
                <div className="w-20 h-20 rounded-full bg-[#111827] flex items-center justify-center mb-6">
                  <Users className="w-10 h-10 text-[#30363d]" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">No members found</h2>
                <p className="text-[#9CA3AF] text-sm max-w-xs mx-auto mb-8">
                  No results match your search or filter. Try adjusting your criteria or invite new members.
                </p>
                <button 
                  onClick={() => setIsInviteDrawerOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-[#6366F1] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#6366F1]/20 transition-all hover:scale-105"
                >
                  Invite Your First Member
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Invite Member Drawer */}
      <AnimatePresence>
        {isInviteDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInviteDrawerOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-screen w-full max-w-xl bg-[#0B1120] border-l border-[#30363d] z-[110] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-[#30363d] flex items-center justify-between bg-[#111827]/50 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#6366F1]/10 flex items-center justify-center border border-[#6366F1]/20">
                    <UserPlus className="w-5 h-5 text-[#6366F1]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Invite Collaborators</h2>
                    <p className="text-xs text-[#9CA3AF]">Build your dream team together</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsInviteDrawerOpen(false)}
                  className="p-2 hover:bg-[#30363d] rounded-xl text-[#9CA3AF] hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {/* Search Section */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#E5E7EB] uppercase tracking-wider mb-2.5">Find people by name or email</label>
                    <div className="relative group">
                      <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isSearching ? 'text-[#6366F1]' : 'text-[#9CA3AF]'}`} />
                      <input 
                        type="text" 
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#111827] border border-[#30363d] rounded-2xl py-3.5 pl-11 pr-4 text-sm text-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/40 transition-all placeholder:text-[#9CA3AF]/40"
                      />
                      {isSearching && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <RefreshCw className="w-4 h-4 text-[#6366F1] animate-spin" />
                        </div>
                      )}
                    </div>
                    
                    {/* Search Results Dropdown */}
                    <AnimatePresence>
                      {searchResults.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-2 bg-[#0B1120] border border-[#30363d] rounded-2xl shadow-2xl max-h-60 overflow-y-auto z-50 divide-y divide-[#30363d]/50"
                        >
                          {searchResults.map(user => (
                            <button
                              key={user._id}
                              onClick={() => addInvite(user)}
                              className="w-full flex items-center gap-3 p-3 hover:bg-[#6366F1]/5 transition-colors group"
                            >
                              <img src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${user.username}`} className="w-10 h-10 rounded-xl border border-[#30363d]" alt="" />
                              <div className="text-left flex-1">
                                <div className="text-sm font-bold text-white group-hover:text-[#6366F1] transition-colors">{user.username}</div>
                                <div className="text-[11px] text-[#9CA3AF]">{user.email}</div>
                              </div>
                              <PlusCircle className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#6366F1] opacity-0 group-hover:opacity-100 transition-all" />
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Selected Invites List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#E5E7EB] uppercase tracking-wider">Selected Members ({selectedInvites.length})</label>
                    {selectedInvites.length > 0 && (
                      <button 
                        onClick={() => setSelectedInvites([])}
                        className="text-[10px] font-bold text-red-400 hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <AnimatePresence mode="popLayout">
                    {selectedInvites.length > 0 ? (
                      <div className="space-y-4">
                        {selectedInvites.map((invite) => (
                          <motion.div 
                            key={invite.user._id}
                            layout
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-[#111827]/40 border border-[#30363d] rounded-2xl p-4 space-y-4 backdrop-blur-sm"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <img src={invite.user.profileImageUrl || `https://ui-avatars.com/api/?name=${invite.user.username}`} className="w-12 h-12 rounded-2xl border border-[#30363d]" alt="" />
                                <div>
                                  <div className="text-sm font-bold text-white">{invite.user.username}</div>
                                  <div className="text-xs text-[#9CA3AF]">{invite.user.email}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <RoleSelector 
                                  selectedRole={invite.role} 
                                  onSelect={(role) => updateInviteRole(invite.user._id, role)} 
                                />
                                <button 
                                  onClick={() => removeSelectedInvite(invite.user._id)}
                                  className="p-2 hover:bg-red-500/10 rounded-xl text-[#9CA3AF] hover:text-red-400 transition-all"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </div>
                            
                            <PermissionPanel 
                              roleKey={invite.role} 
                              customPermissions={invite.customPermissions}
                              onToggleCustom={(permId) => toggleCustomPermission(invite.user._id, permId)}
                            />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 flex flex-col items-center justify-center bg-[#111827]/20 border-2 border-dashed border-[#30363d] rounded-3xl text-center">
                        <Users className="w-10 h-10 text-[#30363d] mb-3" />
                        <p className="text-xs text-[#9CA3AF]">Search and select users above to get started</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-[#30363d] bg-[#111827]/50 backdrop-blur-xl flex items-center gap-3">
                <button 
                  onClick={() => setIsInviteDrawerOpen(false)}
                  className="flex-1 py-3.5 px-4 rounded-2xl border border-[#30363d] text-sm font-bold text-[#E5E7EB] hover:bg-[#30363d] transition-all"
                >
                  Discard
                </button>
                <button 
                  disabled={selectedInvites.length === 0}
                  onClick={handleInviteSubmit}
                  className="flex-[2] py-3.5 px-4 rounded-2xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-bold shadow-2xl shadow-[#6366F1]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {selectedInvites.length > 1 ? `Send ${selectedInvites.length} Invitations` : 'Send Invitation'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      {confirmInvite && (
        <InviteConfirmationModal 
          user={confirmInvite.user}
          role={ROLE_CONFIGS[confirmInvite.role].title}
          onConfirm={finalizeInvitation}
          onCancel={() => setConfirmInvite(null)}
        />
      )}
    </div>
  );
};

// Internal sub-component for search icon
const PlusCircle = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default OrgMembersView;

