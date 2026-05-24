import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import MainContent from '../components/MainContent';
import ActivityPanel from '../components/ActivityPanel';
import AccountPanel from '../components/AccountPanel';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-[#1f6feb]/30 transition-colors">
      {/* Top Navigation Bar */}
      <TopNavbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex">
        {/* Leftmost Account & Repo Panel (Static on Desktop) */}
        <aside className="hidden lg:block w-[320px] flex-shrink-0 sticky top-20 z-[1001] h-[calc(100vh-95px)] overflow-y-auto border-r border-[var(--border-color)] bg-[var(--bg-primary)] custom-scrollbar">          <AccountPanel />
        </aside>

        {/* Global Navigation Sidebar (Sliding Drawer) */}
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 pt-20 px-4 sm:px-8 max-w-[1400px] mx-auto pb-20">
          <div className="flex flex-col xl:flex-row gap-10">

            {/* Main Center Content */}
            <div className="flex-1 min-w-0 max-w-3xl">
              <MainContent />
            </div>

            {/* Right Activity Panel */}
            <aside className="w-full xl:w-[300px] flex-shrink-0">
              <div className="xl:sticky xl:top-24 space-y-8">
                <ActivityPanel />
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Background Decor & Premium Lighting */}
      <div className="fixed -top-40 -right-40 -z-10 w-[800px] h-[800px] bg-[#1f6feb] opacity-[0.06] blur-[160px] rounded-full pointer-events-none animate-pulse transition-all duration-1000" />
      <div className="fixed -bottom-40 -left-40 -z-10 w-[800px] h-[800px] bg-[#238636] opacity-[0.04] blur-[160px] rounded-full pointer-events-none animate-pulse transition-all duration-1000" style={{ animationDuration: '8s' }} />
      <div className="fixed top-1/4 left-1/3 -z-10 w-[600px] h-[600px] bg-[#8b5cf6] opacity-[0.03] blur-[140px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '12s' }} />
      <div className="fixed bottom-1/4 right-1/4 -z-10 w-[500px] h-[500px] bg-[#f78166] opacity-[0.02] blur-[120px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '10s' }} />

      {/* Subtle Mesh Gradient Overlay */}
      <div className="fixed inset-0 -z-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#030712] to-black opacity-40 pointer-events-none" />

      {/* Modern Grid Lighting Pattern */}
      <div className="fixed inset-0 -z-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
    </div>
  );
};

export default Dashboard;
