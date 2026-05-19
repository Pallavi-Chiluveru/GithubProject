import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Book, Lock, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api';

export default function RepositorySelectorModal({ onClose }) {
  const [repos, setRepos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRepos();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const fetchRepos = async () => {
    setLoading(true);
    try {
      const res = await API.get('/repo-api/user');
      setRepos(res.data || []);
    } catch (err) {
      console.error("Failed to fetch repositories:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRepos = repos.filter(repo => 
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (repo.owner?.username && repo.owner.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-xl bg-[#0d1117] border border-[#30363d] rounded-xl shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
            <h2 className="text-base font-semibold text-[#f0f6fc]">Select a repository</h2>
            <button 
              onClick={onClose}
              className="text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] p-1 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 border-b border-[#30363d]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b949e]" />
              <input
                type="text"
                placeholder="Search repositories"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg py-2 pl-9 pr-3 text-sm text-[#c9d1d9] placeholder-[#8b949e] focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#58a6ff] transition-all"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-[50vh] overflow-y-auto custom-scrollbar bg-[#0d1117]">
            {loading ? (
              <div className="p-4 flex flex-col gap-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center gap-3 animate-pulse p-2">
                    <div className="h-5 w-5 rounded-full bg-[#30363d]"></div>
                    <div className="h-4 w-48 rounded bg-[#30363d]"></div>
                  </div>
                ))}
              </div>
            ) : filteredRepos.length === 0 ? (
              <div className="p-12 text-center text-[#8b949e] flex flex-col items-center">
                <Book className="h-10 w-10 mb-3 opacity-20" />
                <p>{searchQuery ? "No matching repositories found." : "No repositories available."}</p>
              </div>
            ) : (
              <div className="py-2 px-2 flex flex-col gap-1">
                {filteredRepos.map(repo => (
                  <button
                    key={repo._id}
                    onClick={() => {
                      navigate(`/repo/${repo._id}`);
                      onClose();
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#161b22] border border-transparent hover:border-[#30363d] transition-all flex items-center gap-3 group"
                  >
                    <div className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-[#2ea043]/10">
                      <Book className="h-3.5 w-3.5 text-[#2ea043]" />
                    </div>
                    <div className="flex-1 overflow-hidden flex items-center gap-1.5">
                      {repo.owner?.username && (
                        <span className="text-sm text-[#8b949e]">
                          {repo.owner.username} /
                        </span>
                      )}
                      <span className="text-sm font-semibold text-[#c9d1d9] truncate group-hover:text-[#58a6ff] transition-colors">
                        {repo.name}
                      </span>
                    </div>
                    <div className="ml-auto">
                      {repo.visibility === 'Private' || repo.isPrivate ? (
                        <Lock className="h-3.5 w-3.5 text-[#8b949e]" />
                      ) : (
                        <Globe className="h-3.5 w-3.5 text-[#8b949e]" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
