import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const RepositoryItem = ({ id, name, avatar }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate(`/repo/${id}`)}
      className="flex items-center gap-3 px-3 py-1.5 cursor-pointer hover:bg-[#21262d] rounded-md transition-all group"
    >
      <div className="w-5 h-5 rounded-full overflow-hidden bg-[#39d353]/20 border border-[#39d353]/30 flex items-center justify-center p-0.5">
        <div className="w-full h-full bg-[#39d353] rounded-[2px]" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 50%, 0 50%, 0 100%, 100% 100%, 100% 0, 50% 0)' }} />
      </div>
      <span className="text-sm font-medium text-[#c9d1d9] group-hover:text-[#2f81f7] transition-colors truncate">
        {name}
      </span>
    </motion.div>
  );
};

export default RepositoryItem;
