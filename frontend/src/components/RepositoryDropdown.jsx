import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Book, Lock, Globe } from 'lucide-react';
import API from '../api';

export default function RepositoryDropdown({ isOpen, onClose }) {
  const [repos, setRepos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchRepos();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

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

  if (!isOpen) return null;

  const filteredRepos = repos.filter(repo => 
    repo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-12 left-0 w-80 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col"
    >
      <div className="p-3 border-b border-[var(--border-color)]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Find a repository..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg py-1.5 pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[#2f81f7] focus:outline-none transition-colors"
            autoFocus
          />
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto custom-scrollbar bg-[var(--bg-secondary)]">
        {loading ? (
          <div className="p-4 flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-4 w-4 rounded bg-[var(--bg-tertiary)]"></div>
                <div className="h-3.5 w-32 rounded bg-[var(--bg-tertiary)]"></div>
              </div>
            ))}
          </div>
        ) : filteredRepos.length === 0 ? (
          <div className="p-6 text-center text-sm text-[var(--text-secondary)]">
            {searchQuery ? "No matching repositories found." : "No repositories yet."}
          </div>
        ) : (
          <div className="py-1">
            {filteredRepos.map(repo => (
              <button
                key={repo._id}
                onClick={() => {
                  navigate(`/repo/${repo._id}`);
                  onClose();
                }}
                className="w-full text-left px-4 py-2 hover:bg-[var(--bg-tertiary)] transition-colors flex items-center gap-3 group"
              >
                <div className="flex-shrink-0">
                  <Book className="h-4 w-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium text-[var(--text-primary)] truncate group-hover:text-[#2f81f7] transition-colors">
                    {repo.name}
                  </span>
                  {repo.owner?.username && (
                    <span className="text-xs text-[var(--text-secondary)] truncate">
                      {repo.owner.username}
                    </span>
                  )}
                </div>
                {/* Visibility removed per user request */}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
