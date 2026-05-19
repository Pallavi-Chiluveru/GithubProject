import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const SidebarItem = ({ icon: Icon, label, to, onClick }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-1.5 text-sm font-normal rounded-md transition-all duration-200 group relative ${
          isActive
            ? 'bg-[#1f242c] text-white'
            : 'text-[#c9d1d9] hover:bg-[#21262d] hover:text-white'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div className="absolute left-[-8px] top-1 bottom-1 w-[4px] bg-[#2f81f7] rounded-r-full shadow-[0_0_8px_rgba(47,129,247,0.5)]" />
          )}
          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#8b949e] group-hover:text-white'} transition-colors duration-200`} />
          <span className={`${isActive ? 'font-semibold' : 'font-medium'}`}>{label}</span>
        </>
      )}
    </NavLink>
  );
};

export default SidebarItem;
