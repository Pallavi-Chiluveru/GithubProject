import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RepositoryItem from './RepositoryItem';

const RepositoryList = ({ repositories = [], hideHeader = false }) => {
  const [showMore, setShowMore] = useState(false);
  const initialCount = 7; // Matching screenshot's longer list
  const visibleRepos = showMore ? repositories : repositories.slice(0, initialCount);

  return (
    <div className="mt-2 mb-10">
      {!hideHeader && (
        <div className="flex items-center justify-between px-3 mb-4">
          <h3 className="text-sm font-semibold text-white">Top repositories</h3>
          <button className="text-[#8b949e] hover:text-[#c9d1d9] transition-colors p-1 hover:bg-[#21262d] rounded-md">
            <Search className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="space-y-0.5">
        <AnimatePresence initial={false}>
          {visibleRepos.map((repo, index) => (
            <RepositoryItem key={repo._id || index} id={repo._id} name={repo.name} avatar={repo.avatar} />
          ))}
        </AnimatePresence>
      </div>

      {repositories.length > initialCount && (
        <button 
          onClick={() => setShowMore(!showMore)}
          className="mt-4 px-3 text-xs text-[#8b949e] hover:text-[#2f81f7] transition-colors"
        >
          {showMore ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
};

export default RepositoryList;
