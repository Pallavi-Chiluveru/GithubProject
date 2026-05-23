import React, { useState, useEffect, useRef } from 'react';
import { Users, Building, Mail, MapPin, Edit2, Award, Loader2, Camera, Link as LinkIcon, Globe } from 'lucide-react';
import { FaTwitter, FaGithub, FaLinkedin } from 'react-icons/fa';
import API from '../api';
import { useNotifications } from './NotificationProvider';
import EditProfileModal from './EditProfileModal';
import FollowersModal from './FollowersModal';

const ProfileSidebar = ({ user, onUpdate }) => {
  const { addToast } = useNotifications();
  const fileInputRef = useRef(null);

  const [achievements, setAchievements] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [followersModalType, setFollowersModalType] = useState(null); // 'Followers' | 'Following' | null
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);

  const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isOwnProfile = loggedInUser.username === user.username;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [achRes, orgRes] = await Promise.all([
          API.get(`/achievement-api/user/${user.username}`),
          API.get(`/org-api/user/${user.username}`)
        ]);
        setAchievements(achRes.data || []);
        setOrganizations(orgRes.data || []);
      } catch (err) {
        console.error('Error fetching sidebar data:', err);
      }
    };
    fetchData();
  }, [user.username]);

  const handleFollowToggle = async () => {
    if (!loggedInUser._id) {
      addToast({ type: 'error', message: 'You must be logged in to follow users.' });
      return;
    }

    const isFollowing = user.isFollowing;
    const endpoint = `/user-api/${user._id}/${isFollowing ? 'unfollow' : 'follow'}`;

    try {
      setIsFollowLoading(true);
      const res = await API.post(endpoint);

      // Call parent update to keep top-level user details completely in sync
      onUpdate({
        ...user,
        followersCount: res.data.followersCount,
        followingCount: res.data.followingCount,
        isFollowing: res.data.isFollowing
      });

      addToast({ 
        type: 'MENTION', 
        message: `${isFollowing ? 'Unfollowed' : 'Followed'} @${user.username}!` 
      });
    } catch (err) {
      console.error('Follow toggle failed:', err);
      addToast({ type: 'error', message: err.response?.data?.message || 'Action failed' });
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleAvatarClick = () => {
    if (isOwnProfile && !isAvatarUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast({ type: 'error', message: 'Please select a valid image file.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast({ type: 'error', message: 'Image size should be less than 5MB.' });
      return;
    }

    const uploadData = new FormData();
    uploadData.append('avatar', file);

    try {
      setIsAvatarUploading(true);
      const res = await API.post('/user-api/profile/avatar', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const newUrl = res.data.profileImageUrl;

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }

      onUpdate(res.data.user || { ...user, profileImageUrl: newUrl });
      addToast({ type: 'MENTION', message: 'Profile picture updated successfully!' });
    } catch (err) {
      console.error('Error uploading avatar:', err);
      addToast({ type: 'error', message: err.response?.data?.message || 'Failed to upload image' });
    } finally {
      setIsAvatarUploading(false);
    }
  };

  const handleModalCountsChange = ({ followersCount, followingCount }) => {
    onUpdate({
      ...user,
      followersCount,
      followingCount
    });
  };

  return (
    <div className="space-y-6">
      {/* Profile Header & Picture */}
      <div 
        onClick={handleAvatarClick}
        className={`relative group rounded-full overflow-hidden border border-[#30363d] bg-[#161b22] aspect-square w-full max-w-[296px] mx-auto ${
          isOwnProfile ? 'cursor-pointer' : ''
        }`}
      >
        {isAvatarUploading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
            <Loader2 className="w-10 h-10 text-[#2f81f7] animate-spin" />
          </div>
        ) : (
          isOwnProfile && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
              <Camera className="w-8 h-8 text-white mb-2" />
              <span className="text-xs text-white font-medium uppercase tracking-wider">Update photo</span>
            </div>
          )
        )}
        <img 
          src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${user.username}&background=random&size=300`} 
          alt={user.username}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {isOwnProfile && (
          <div className="absolute bottom-4 right-4 p-2 bg-[#21262d] border border-[#30363d] rounded-full hover:bg-[#30363d] transition-colors text-[#c9d1d9] z-20 shadow-md">
            <Edit2 size={14} />
          </div>
        )}
      </div>

      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarChange}
        accept="image/*"
        className="hidden"
      />

      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-white leading-tight">
            {user.displayName || user.gitname || user.username}
          </h1>
          <p className="text-xl text-[#8b949e] font-light">
            {user.username}
          </p>
        </div>

        {user.bio && (
          <p className="text-[#c9d1d9] text-sm leading-relaxed">
            {user.bio}
          </p>
        )}

        {isOwnProfile ? (
          <button 
            onClick={() => setIsEditOpen(true)}
            className="w-full py-1.5 bg-[#21262d] border border-[#30363d] rounded-md text-sm font-semibold hover:bg-[#30363d] hover:border-[#8b949e] transition-all text-[#c9d1d9]"
          >
            Edit profile
          </button>
        ) : (
          <button 
            onClick={handleFollowToggle}
            disabled={isFollowLoading}
            className={`w-full py-1.5 rounded-md text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 border ${
              user.isFollowing 
                ? 'bg-[#21262d] hover:bg-red-950/20 hover:text-red-400 hover:border-red-900/50 border-[#30363d]' 
                : 'bg-[#238636] hover:bg-[#2ea043] border-[#2ea043]/30'
            }`}
          >
            {isFollowLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : user.isFollowing ? (
              'Following'
            ) : (
              'Follow'
            )}
          </button>
        )}

        {/* Connections Counts */}
        <div className="flex items-center gap-4 text-sm text-[#8b949e]">
          <button 
            onClick={() => setFollowersModalType('Followers')}
            className="flex items-center gap-1 hover:text-[#2f81f7] transition-colors cursor-pointer group text-left"
          >
            <Users size={16} className="group-hover:text-[#2f81f7]" />
            <span className="text-white font-bold">{user.followersCount || 0}</span> followers
          </button>
          <button 
            onClick={() => setFollowersModalType('Following')}
            className="flex items-center gap-1 hover:text-[#2f81f7] transition-colors cursor-pointer group text-left"
          >
            <span className="text-white font-bold">{user.followingCount || 0}</span> following
          </button>
        </div>

        {/* Detailed User metadata */}
        <div className="space-y-2.5 pt-4 border-t border-[#30363d] text-sm text-[#c9d1d9]">
          {user.company && (
            <div className="flex items-center gap-2">
              <Building size={16} className="text-[#8b949e] flex-shrink-0" />
              <span className="truncate">{user.company}</span>
            </div>
          )}
          {user.location && (
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-[#8b949e] flex-shrink-0" />
              <span className="truncate">{user.location}</span>
            </div>
          )}
          {user.email && (
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-[#8b949e] flex-shrink-0" />
              <a href={`mailto:${user.email}`} className="hover:text-[#2f81f7] truncate">
                {user.email}
              </a>
            </div>
          )}

          {/* Social Links Sub-section */}
          {user.socialLinks && (user.socialLinks.website || user.socialLinks.twitter || user.socialLinks.github || user.socialLinks.linkedin) && (
            <div className="pt-2.5 border-t border-[#30363d]/50 space-y-2 mt-2">
              {user.socialLinks.website && (
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-[#8b949e] flex-shrink-0" />
                  <a 
                    href={user.socialLinks.website.startsWith('http') ? user.socialLinks.website : `https://${user.socialLinks.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-[#2f81f7] text-[#8b949e] truncate text-xs"
                  >
                    {user.socialLinks.website.replace(/(^\w+:|^)\/\//, '')}
                  </a>
                </div>
              )}
              {user.socialLinks.twitter && (
                <div className="flex items-center gap-2">
                  <FaTwitter size={16} className="text-[#8b949e] flex-shrink-0" />
                  <a 
                    href={`https://twitter.com/${user.socialLinks.twitter.replace('@', '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-[#2f81f7] text-[#8b949e] truncate text-xs"
                  >
                    @{user.socialLinks.twitter.replace('@', '')}
                  </a>
                </div>
              )}
              {user.socialLinks.github && (
                <div className="flex items-center gap-2">
                  <FaGithub size={16} className="text-[#8b949e] flex-shrink-0" />
                  <a 
                    href={`https://github.com/${user.socialLinks.github}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-[#2f81f7] text-[#8b949e] truncate text-xs"
                  >
                    {user.socialLinks.github}
                  </a>
                </div>
              )}
              {user.socialLinks.linkedin && (
                <div className="flex items-center gap-2">
                  <FaLinkedin size={16} className="text-[#8b949e] flex-shrink-0" />
                  <a 
                    href={user.socialLinks.linkedin.includes('linkedin.com') ? user.socialLinks.linkedin : `https://linkedin.com/in/${user.socialLinks.linkedin}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-[#2f81f7] text-[#8b949e] truncate text-xs"
                  >
                    LinkedIn
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Achievements Section */}
      <div className="pt-6 border-t border-[#30363d]">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          Achievements
        </h3>
        {achievements.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {achievements.map((ach, i) => (
              <div key={i} title={ach.title} className="group relative">
                <img 
                  src={ach.badgeUrl} 
                  alt={ach.title} 
                  className="w-11 h-11 transition-transform hover:scale-110"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#161b22] border border-[#30363d] border-dashed rounded-lg p-4 text-center">
            <Award size={20} className="mx-auto mb-2 text-[#30363d]" />
            <p className="text-xs text-[#8b949e]">No achievements earned yet</p>
          </div>
        )}
      </div>

      {/* Organizations Section */}
      <div className="pt-6 border-t border-[#30363d]">
        <h3 className="text-sm font-bold text-white mb-4">Organizations</h3>
        {organizations.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {organizations.map((org) => (
              <div 
                key={org._id} 
                title={org.name}
                className="w-8 h-8 rounded bg-[#161b22] border border-[#30363d] overflow-hidden hover:border-[#8b949e] cursor-pointer transition-colors"
              >
                {org.logo ? (
                  <img src={org.logo} alt={org.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-[#8b949e]">
                    {org.name?.charAt(0)}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#8b949e] italic">No organizations joined yet</p>
        )}
      </div>

      {/* Modals Integration */}
      {isEditOpen && (
        <EditProfileModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          user={user}
          onUpdate={onUpdate}
        />
      )}

      {followersModalType && (
        <FollowersModal
          isOpen={!!followersModalType}
          onClose={() => setFollowersModalType(null)}
          userId={user._id}
          type={followersModalType}
          onCountsChange={handleModalCountsChange}
        />
      )}
    </div>
  );
};

export default ProfileSidebar;
