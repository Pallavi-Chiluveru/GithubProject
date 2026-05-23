import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Users, UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { useNotifications } from './NotificationProvider';

const FollowersModal = ({ isOpen, onClose, userId, type, onCountsChange }) => {
  const navigate = useNavigate();
  const { addToast } = useNotifications();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState({}); // Tracking loading state for follow action per user
  const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
  const searchTimeoutRef = useRef(null);

  const fetchConnectedUsers = async (query = '') => {
    try {
      setLoading(true);
      const endpoint = `/user-api/${userId}/${type.toLowerCase()}`;
      const res = await API.get(endpoint, {
        params: { search: query }
      });
      setUsers(res.data || []);
    } catch (err) {
      console.error(`Error fetching ${type}:`, err);
      addToast({ type: 'error', message: `Failed to load ${type}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      fetchConnectedUsers(searchQuery);
    }
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [isOpen, userId, type]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      fetchConnectedUsers(val);
    }, 300); // 300ms debounce
  };

  const handleFollowAction = async (e, targetUser) => {
    e.stopPropagation(); // Stop navigation click
    
    const isCurrentlyFollowing = targetUser.isFollowing;
    const endpoint = `/user-api/${targetUser._id}/${isCurrentlyFollowing ? 'unfollow' : 'follow'}`;

    try {
      setActionLoading(prev => ({ ...prev, [targetUser._id]: true }));
      const res = await API.post(endpoint);

      // Update local state for the user in the list
      setUsers(prev => prev.map(u => {
        if (u._id === targetUser._id) {
          return {
            ...u,
            isFollowing: !isCurrentlyFollowing,
            followers: !isCurrentlyFollowing 
              ? [...(u.followers || []), loggedInUser._id]
              : (u.followers || []).filter(id => String(id) !== String(loggedInUser._id))
          };
        }
        return u;
      }));

      // Notify parent if count needs to sync
      if (onCountsChange) {
        onCountsChange({
          followersCount: res.data.followersCount,
          followingCount: res.data.followingCount
        });
      }

      addToast({
        type: 'MENTION',
        message: `${isCurrentlyFollowing ? 'Unfollowed' : 'Followed'} @${targetUser.username}`
      });
    } catch (err) {
      console.error('Error toggling follow:', err);
      addToast({ type: 'error', message: err.response?.data?.message || 'Failed to update follow status' });
    } finally {
      setActionLoading(prev => ({ ...prev, [targetUser._id]: false }));
    }
  };

  const handleUserClick = (username) => {
    navigate(`/profile/${username}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-[#0d1117]/95 border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden glassmorphism flex flex-col max-h-[80vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#30363d] bg-[#161b22]">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#8b949e]" />
              {type === 'Followers' ? 'Followers' : 'Following'}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8b949e] hover:text-white hover:bg-[#30363d] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search bar */}
          <div className="p-4 border-b border-[#30363d] bg-[#0d1117]">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#8b949e]">
                <Search size={16} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={`Search ${type.toLowerCase()}...`}
                className="w-full pl-9 pr-3 py-1.5 bg-[#161b22] border border-[#30363d] rounded-lg text-sm text-white placeholder-[#484f58] focus:border-[#2f81f7] focus:ring-1 focus:ring-[#2f81f7] outline-hidden transition-all"
              />
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#2f81f7] animate-spin mb-2" />
                <p className="text-xs text-[#8b949e]">Loading users...</p>
              </div>
            ) : users.length > 0 ? (
              <div className="space-y-1">
                {users.map((user) => {
                  const isSelf = String(user._id) === String(loggedInUser._id);
                  const isFollowingThisUser = user.isFollowing;
                  const isLoading = actionLoading[user._id];

                  return (
                    <motion.div
                      key={user._id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-[#161b22] border border-transparent hover:border-[#30363d]/50 cursor-pointer transition-all gap-3"
                      onClick={() => handleUserClick(user.username)}
                    >
                      {/* Avatar & Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${user.username}&background=random&size=100`}
                          alt={user.username}
                          className="w-10 h-10 rounded-full object-cover border border-[#30363d]"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-white truncate leading-tight">
                            {user.displayName || user.gitname || user.username}
                          </h4>
                          <p className="text-xs text-[#8b949e] truncate">@{user.username}</p>
                          {user.bio && (
                            <p className="text-xs text-[#8b949e] truncate max-w-[200px] mt-0.5">
                              {user.bio}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Follow Button */}
                      {!isSelf && (
                        <button
                          type="button"
                          onClick={(e) => handleFollowAction(e, user)}
                          disabled={isLoading}
                          className={`flex items-center gap-1.5 px-3 py-1.2 rounded-lg text-xs font-semibold border transition-all ${
                            isFollowingThisUser
                              ? 'bg-[#21262d] hover:bg-red-950/20 hover:text-red-400 hover:border-red-900/50 text-[#c9d1d9] border-[#30363d]'
                              : 'bg-[#238636] hover:bg-[#2ea043] text-white border-transparent'
                          }`}
                        >
                          {isLoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : isFollowingThisUser ? (
                            <>
                              <UserCheck size={13} />
                              Following
                            </>
                          ) : (
                            <>
                              <UserPlus size={13} />
                              Follow
                            </>
                          )}
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center text-[#8b949e]">
                <Users size={32} className="text-[#30363d] mb-2" />
                <p className="text-sm font-medium">No results found</p>
                <p className="text-xs text-[#484f58] mt-1">
                  Try adjusting your search terms or verify the user connections.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FollowersModal;
