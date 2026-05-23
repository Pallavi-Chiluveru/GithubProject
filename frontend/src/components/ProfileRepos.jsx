import React, { useState, useEffect } from 'react';
import { Search, Star, GitFork, Book, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../api';
import { motion, AnimatePresence } from 'framer-motion';

const ProfileRepos = ({ username }) => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, public, private, forks
  const [filterLang, setFilterLang] = useState('all');

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/repo-api/user/${username}`);
        setRepos(res.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile repos:', err);
        setLoading(false);
      }
    };
    fetchRepos();
  }, [username]);

  // Extract unique languages
  const languages = ['all', ...new Set(repos.map(r => r.language).filter(Boolean))];

  // Filtering logic
  const filteredRepos = repos.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const isRepoPrivate = repo.isPrivate || repo.visibility?.toLowerCase() === 'private';
    
    const matchesType = 
      filterType === 'all' ||
      (filterType === 'public' && !isRepoPrivate) ||
      (filterType === 'private' && isRepoPrivate) ||
      (filterType === 'forks' && repo.isForked);

    const matchesLang = 
      filterLang === 'all' || 
      repo.language === filterLang;

    return matchesSearch && matchesType && matchesLang;
  });

  const getLanguageColor = (lang) => {
    const colors = {
      'JavaScript': '#f1e05a',
      'Python': '#3572A5',
      'HTML': '#e34c26',
      'CSS': '#563d7c',
      'TypeScript': '#3178c6',
      'Java': '#b07219',
      'C++': '#f34b7d',
      'PHP': '#4F5D95',
    };
    return colors[lang] || '#8b949e';
  };

  const formatLastUpdated = (dateStr) => {
    if (!dateStr) return 'some time ago';
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `Updated ${diffMins}m ago`;
    if (diffHours < 24) return `Updated ${diffHours}h ago`;
    if (diffDays < 30) return `Updated ${diffDays}d ago`;
    return `Updated on ${date.toLocaleDateString()}`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-[#161b22] border border-[#30363d] rounded-md animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 border-b border-[#30363d] pb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e] w-4 h-4" />
          <input
            type="text"
            placeholder="Find a repository..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md pl-10 pr-4 py-1.5 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:border-[#2f81f7] focus:outline-none focus:ring-1 focus:ring-[#2f81f7] transition-all"
          />
        </div>

        <div className="flex gap-2">
          {/* Type Filter */}
          <div className="relative group">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="appearance-none bg-[#161b22] border border-[#30363d] rounded-md pl-3 pr-8 py-1.5 text-xs font-semibold text-[#c9d1d9] focus:outline-none focus:border-[#2f81f7] cursor-pointer"
            >
              <option value="all">Type: All</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="forks">Forks</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8b949e] pointer-events-none" />
          </div>

          {/* Language Filter */}
          <div className="relative group">
            <select
              value={filterLang}
              onChange={(e) => setFilterLang(e.target.value)}
              className="appearance-none bg-[#161b22] border border-[#30363d] rounded-md pl-3 pr-8 py-1.5 text-xs font-semibold text-[#c9d1d9] focus:outline-none focus:border-[#2f81f7] cursor-pointer"
            >
              <option value="all">Language: All</option>
              {languages.filter(l => l !== 'all').map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8b949e] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Repositories List */}
      <div className="divide-y divide-[#30363d]">
        <AnimatePresence mode="popLayout">
          {filteredRepos.length > 0 ? (
            filteredRepos.map((repo, i) => {
              const isRepoPrivate = repo.isPrivate || repo.visibility?.toLowerCase() === 'private';
              return (
                <motion.div
                  key={repo._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, delay: Math.min(i * 0.05, 0.3) }}
                  className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0"
                >
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link 
                        to={`/repo/${repo._id}`} 
                        className="text-lg font-bold text-[#2f81f7] hover:underline"
                      >
                        {repo.name}
                      </Link>
                      <span className="text-xs px-2 py-0.5 border border-[#30363d] rounded-full text-[#8b949e] font-semibold bg-[#161b22]">
                        {isRepoPrivate ? 'Private' : 'Public'}
                      </span>
                    </div>

                    {repo.description && (
                      <p className="text-sm text-[#8b949e] leading-relaxed">
                        {repo.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-[#8b949e] flex-wrap pt-2">
                      {repo.language && (
                        <div className="flex items-center gap-1.5">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: getLanguageColor(repo.language) }}
                          ></div>
                          <span>{repo.language}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1 hover:text-[#2f81f7] cursor-pointer">
                        <Star size={13} />
                        <span>{repo.stars || 0}</span>
                      </div>

                      <div className="flex items-center gap-1 hover:text-[#2f81f7] cursor-pointer">
                        <GitFork size={13} />
                        <span>{repo.forkCount || repo.forks || 0}</span>
                      </div>

                      <span>{formatLastUpdated(repo.updatedAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                    <button className="flex items-center gap-1.5 px-3 py-1 bg-[#21262d] border border-[#30363d] rounded-md text-xs font-semibold text-[#c9d1d9] hover:bg-[#30363d] hover:border-[#8b949e] transition-all">
                      <Star size={14} className="text-[#8b949e]" />
                      Star
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-16">
              <Book className="w-10 h-10 text-[#8b949e] mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-bold text-white mb-1">No repositories found</h3>
              <p className="text-sm text-[#8b949e]">
                {searchQuery ? `No results match your search query.` : `${username} doesn't have any repositories matching the filters.`}
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfileRepos;
