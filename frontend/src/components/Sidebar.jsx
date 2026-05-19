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

      <motion.aside
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        exit="closed"
        variants={sidebarVariants}
        className="fixed top-0 left-0 h-screen w-full sm:w-[320px] bg-[var(--bg-primary)] border-r border-[var(--border-color)] z-50 flex flex-col shadow-2xl transition-colors"
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 py-4 sticky top-0 bg-[var(--bg-primary)] z-10 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <GithubIcon className="w-8 h-8 object-contain" />
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-[#21262d] rounded-md text-[#8b949e] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pt-4">
          <div className="space-y-0.5 px-2">
            <SidebarItem icon={Home} label="Home" to="/dashboard" onClick={() => setIsOpen(false)} />
            <SidebarItem icon={CircleDot} label="All issues" to="/issues" onClick={() => setIsOpen(false)} />
            <SidebarItem icon={GitPullRequest} label="All pull requests" to="/pulls" onClick={() => setIsOpen(false)} />
            <SidebarItem icon={BookOpen} label="All Repositories" to="/repos" onClick={() => setIsOpen(false)} />
            <SidebarItem icon={MessageSquare} label="Discussions" to="/discussions" onClick={() => setIsOpen(false)} />
            <SidebarItem icon={Code2} label="Codespaces" to="/codespaces" onClick={() => setIsOpen(false)} />
            <SidebarItem icon={Layout} label="Spaces" to="/spaces" onClick={() => setIsOpen(false)} />
            <SidebarItem icon={Cpu} label="Copilot" to="/copilot" onClick={() => setIsOpen(false)} />
            <SidebarItem icon={Sparkles} label="Learn GitHub" to="/companion" onClick={() => setIsOpen(false)} />
          </div>

        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
