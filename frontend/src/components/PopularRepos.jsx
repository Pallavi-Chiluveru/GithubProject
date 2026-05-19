import React, { useState, useEffect } from 'react';
import { Star, GitFork, Book } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../api';
import { motion } from 'framer-motion';

const PopularRepos = ({ username }) => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const res = await API.get(`/repo-api/user/${username}`);
        // For popular repos, we'll just show the top 6 updated ones for now
        setRepos(res.data.slice(0, 6) || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching repos:', err);
        setLoading(false);
      }
    };
    fetchRepos();
  }, [username]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-[#161b22] border border-[#30363d] rounded-md animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white">Popular repositories</h2>
        <button className="text-xs text-[#8b949e] hover:text-[#2f81f7]">Customize your pins</button>
      </div>

      {repos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {repos.map((repo, i) => (
            <motion.div
              key={repo._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 bg-[#0d1117] border border-[#30363d] rounded-md hover:border-[#8b949e] transition-all group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Book size={14} className="text-[#8b949e]" />
                    <Link 
                      to={`/repo/${repo._id}`} 
                      className="text-sm font-bold text-[#2f81f7] hover:underline truncate max-w-[200px]"
                    >
                      {repo.name}
                    </Link>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 border border-[#30363d] rounded-full text-[#8b949e] font-medium">
                    {repo.visibility || (repo.isPrivate ? 'Private' : 'Public')}
                  </span>
                </div>
                
                {repo.description && (
                  <p className="text-xs text-[#8b949e] line-clamp-2 leading-relaxed">
                    {repo.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4 mt-4 text-[11px] text-[#8b949e]">
                <div className="flex items-center gap-1.5">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: getLanguageColor(repo.language) }}
                  ></div>
                  <span>{repo.language || 'Plain Text'}</span>
                </div>
                <div className="flex items-center gap-1 hover:text-[#2f81f7] cursor-pointer">
                  <Star size={12} />
                  <span>{repo.stars || 0}</span>
                </div>
                <div className="flex items-center gap-1 hover:text-[#2f81f7] cursor-pointer">
                  <GitFork size={12} />
                  <span>{repo.forkCount || repo.forks || 0}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border border-[#30363d] border-dashed rounded-md bg-[#161b22]">
          <p className="text-sm text-[#8b949e]">No public repositories found</p>
        </div>
      )}
    </div>
  );
};

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

export default PopularRepos;
