import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopNavbar from '../components/TopNavbar';
import ProfileSidebar from '../components/ProfileSidebar';
import PopularRepos from '../components/PopularRepos';
import ProfileRepos from '../components/ProfileRepos';
import ContributionHeatmap from '../components/ContributionHeatmap';
import ActivityTimeline from '../components/ActivityTimeline';
import API from '../api';
import { motion } from 'framer-motion';

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/user-api/profile/${username}`);
        setUser(res.data);
        setError(null);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.response?.data?.message || 'Failed to load profile');
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    if (updatedUser && updatedUser.username && updatedUser.username !== username) {
      // Redirect to the new username page
      navigate(`/profile/${updatedUser.username}`, { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#2f81f7] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center text-[#c9d1d9]">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans">
      <TopNavbar />
      
      <main className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-24 pb-20">
        {/* Navigation Tabs (GitHub style) */}
        <div className="flex items-center gap-6 border-b border-[#30363d] mb-8 sticky top-16 bg-[#0d1117] z-40 pt-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
          {['Overview', 'Repositories'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm transition-all relative ${
                activeTab === tab 
                  ? 'text-white font-semibold' 
                  : 'text-[#8b949e] hover:text-white'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 w-full h-[2px] bg-[#f78166]" 
                />
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar */}
          <div className="w-full lg:w-[296px] flex-shrink-0">
            <ProfileSidebar user={user} onUpdate={handleUserUpdate} />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {activeTab === 'Overview' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-12"
              >
                <PopularRepos username={user?.username || username} />
                <ContributionHeatmap username={user?.username || username} />
                <ActivityTimeline username={user?.username || username} />
              </motion.div>
            )}

            {activeTab === 'Repositories' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <ProfileRepos username={user?.username || username} />
              </motion.div>
            )}
            
            {activeTab !== 'Overview' && activeTab !== 'Repositories' && (
              <div className="flex items-center justify-center h-64 text-[#8b949e] italic">
                {activeTab} content is coming soon...
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
