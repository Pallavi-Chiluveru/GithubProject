import React, { useState, useEffect } from 'react';
import { Users, Building, Mail, MapPin, Link as LinkIcon, Edit2, Award } from 'lucide-react';
import API from '../api';

const ProfileSidebar = ({ user }) => {
  const [achievements, setAchievements] = useState([]);
  const [organizations, setOrganizations] = useState([]);
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

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="relative group">
        <div className="w-full aspect-square rounded-full overflow-hidden border border-[#30363d] bg-[#161b22]">
          <img 
            src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${user.username}&background=random&size=300`} 
            alt={user.username}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        {isOwnProfile && (
          <button className="absolute bottom-4 right-4 p-2 bg-[#21262d] border border-[#30363d] rounded-full hover:bg-[#30363d] transition-colors text-[#c9d1d9]">
            <Edit2 size={16} />
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-white leading-tight">
            {user.gitname || user.username}
          </h1>
          <p className="text-xl text-[#8b949e] font-light">
            {user.username}
          </p>
        </div>

        {user.bio && (
          <p className="text-[#c9d1d9] text-base leading-relaxed">
            {user.bio}
          </p>
        )}

        {isOwnProfile ? (
          <button className="w-full py-1.5 bg-[#21262d] border border-[#30363d] rounded-md text-sm font-semibold hover:bg-[#30363d] hover:border-[#8b949e] transition-all">
            Edit profile
          </button>
        ) : (
          <button className="w-full py-1.5 bg-[#238636] hover:bg-[#2ea043] border border-[#2ea043]/30 rounded-md text-sm font-semibold text-white transition-all">
            Follow
          </button>
        )}

        <div className="flex items-center gap-4 text-sm text-[#8b949e]">
          <div className="flex items-center gap-1 hover:text-[#2f81f7] cursor-pointer">
            <Users size={16} />
            <span className="text-white font-bold">{user.followersCount || 0}</span> followers
          </div>
          <div className="flex items-center gap-1 hover:text-[#2f81f7] cursor-pointer">
            <span className="text-white font-bold">{user.followingCount || 0}</span> following
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t border-[#30363d] text-sm text-[#c9d1d9]">
          {user.company && (
            <div className="flex items-center gap-2">
              <Building size={16} className="text-[#8b949e]" />
              <span className="font-semibold">{user.company}</span>
            </div>
          )}
          {user.location && (
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-[#8b949e]" />
              <span>{user.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-[#8b949e]" />
            <a href={`mailto:${user.email}`} className="hover:text-[#2f81f7] truncate">
              {user.email}
            </a>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="pt-6 border-t border-[#30363d]">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          Achievements
        </h3>
        {achievements.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {achievements.map((ach, i) => (
              <div key={i} title={ach.title} className="group relative">
                <img 
                  src={ach.badgeUrl} 
                  alt={ach.title} 
                  className="w-12 h-12 transition-transform hover:scale-110"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#161b22] border border-[#30363d] border-dashed rounded-lg p-4 text-center">
            <Award size={24} className="mx-auto mb-2 text-[#30363d]" />
            <p className="text-xs text-[#8b949e]">No achievements earned yet</p>
          </div>
        )}
      </div>

      {/* Organizations Section */}
      <div className="pt-6 border-t border-[#30363d]">
        <h3 className="text-base font-bold text-white mb-4">Organizations</h3>
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
    </div>
  );
};

export default ProfileSidebar;
