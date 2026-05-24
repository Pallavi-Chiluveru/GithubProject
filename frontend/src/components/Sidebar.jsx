import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Home,
  CircleDot,
  GitPullRequest,
  BookOpen,
  Layout,
  MessageSquare,
  Terminal,
  Cpu,
  Compass,
  ShoppingBag,
  Library,
  Code2,
  Sparkles,
  Zap
} from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import SidebarItem from './SidebarItem';
import MobileOverlay from './MobileOverlay';
import GithubIcon from './GithubIcon';

const Sidebar = ({ isOpen, setIsOpen }) => {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [setIsOpen]);

  const sidebarVariants = {
    open: {
      x: 0,
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    },
    closed: {
      x: '-100%',
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <MobileOverlay isOpen={isOpen} onClose={() => setIsOpen(false)} />
        )}
      </AnimatePresence>

      <aside className={`fixed top-[64px] left-0 h-[calc(100vh-64px)] w-full sm:w-[320px] bg-[var(--sidebar-bg)] border-r border-[var(--border-color)] z-[1100] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[var(--sidebar-bg)] z-10 border-b border-[var(--border-color)] mt-2">
          <div className="flex items-center gap-2 pl-1">
            <GithubIcon className="h-9 object-contain" />
            <span className="text-sm font-black tracking-wide text-[var(--text-primary)]">RepoSphere</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pt-5">
          <div className="space-y-1 px-3">
            <SidebarItem icon={Home} label="Home" to="/dashboard" onClick={() => setIsOpen(false)} />
            <SidebarItem icon={CircleDot} label="All issues" to="/issues" onClick={() => setIsOpen(false)} />
            <SidebarItem icon={GitPullRequest} label="All pull requests" to="/pulls" onClick={() => setIsOpen(false)} />
            <SidebarItem icon={BookOpen} label="All Repositories" to="/repos" onClick={() => setIsOpen(false)} />
            <SidebarItem icon={MessageSquare} label="Discussions" to="/discussions" onClick={() => setIsOpen(false)} />

            <SidebarItem icon={Cpu} label="Copilot" to="/copilot" onClick={() => setIsOpen(false)} />
            <SidebarItem icon={Sparkles} label="Learn RepoSphere" to="/companion" onClick={() => setIsOpen(false)} />
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
