import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { 
  ChevronDown, 
  ChevronUp, 
  Search,
  BookOpen,
  Plus
} from 'lucide-react';
import RepositoryList from './RepositoryList';

const AccountPanel = () => {
  const [repos, setRepos] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [repoRes, orgRes] = await Promise.all([
          API.get('/repo-api/user'),
          API.get('/org-api/my-orgs')
        ]);
        setRepos(repoRes.data || []);
        setOrgs(orgRes.data || []);
      } catch (err) {
        console.error('Error fetching account panel data:', err);
      }
    };

    fetchData();
  }, []);

  const filteredRepos = repos.filter(repo => 
    repo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-[var(--bg-primary)] pt-10 transition-colors">
      {/* Account Section */}
      <div className="px-4 mb-8">
        <button 
          onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
          className="flex items-center gap-2 py-1 px-2 rounded-md hover:bg-[var(--bg-tertiary)] transition-all group"
        >
          <div className="w-5 h-5 rounded-full overflow-hidden border border-[var(--border-color)]">
            <img 
              src={`https://ui-avatars.com/api/?name=${user.username || 'User'}&background=random`} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-sm font-bold text-[var(--text-primary)] truncate max-w-[150px]">
            {user.username || 'Pallavi-Chiluveru'}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-secondary)] transition-transform ${isOrgDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Organizations Dropdown */}
        <AnimatePresence>
          {isOrgDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-md shadow-xl py-2 z-50 absolute left-4 w-64"
            >
              <div className="px-3 py-1 mb-1">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Organizations
                </span>
              </div>
              {orgs.length > 0 ? (
                orgs.map((org) => (
                  <button
                    key={org._id}
                    onClick={() => {
                      navigate(`/org/${org._id}`);
                      setIsOrgDropdownOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2 hover:bg-[#21262d] transition-colors group text-left"
                  >
                    <div className="w-5 h-5 rounded bg-[#30363d] flex items-center justify-center text-[10px] text-white font-bold group-hover:bg-[#2f81f7]">
                      {org.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-[#c9d1d9] group-hover:text-white truncate">
                      {org.name}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2">
                  <p className="text-[11px] text-[#8b949e] italic">No organizations found</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Repositories Section Header */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Top repositories</h3>
          <button 
            onClick={() => navigate('/create-repo')}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-bold rounded-md transition-all shadow-sm shadow-[#238636]/20"
          >
            <BookOpen className="w-3.5 h-3.5" />
            New
          </button>
        </div>

        {/* Search Input */}
        <div className="relative group">
          <input 
            type="text" 
            placeholder="Find a repository..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[#2f81f7] focus:border-[#2f81f7] transition-all"
          />
        </div>
      </div>

      {/* Repositories List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
        <RepositoryList repositories={filteredRepos} hideHeader={true} />
      </div>
    </div>
  );
};

export default AccountPanel;
