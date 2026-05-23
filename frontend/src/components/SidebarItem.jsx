import React from 'react';
import { NavLink } from 'react-router-dom';

const SidebarItem = ({ icon: Icon, label, to, onClick }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `sidebar-nav-item flex items-center gap-3 px-3 py-1.5 text-sm font-normal rounded-md transition-all duration-200 group relative ${
          isActive ? 'sidebar-nav-item--active' : ''
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div className="sidebar-active-bar absolute left-[-8px] top-1 bottom-1 w-[4px] rounded-r-full" />
          )}
          <Icon className={`w-4 h-4 transition-colors duration-200 ${isActive ? 'sidebar-icon--active' : 'sidebar-icon'}`} />
          <span className={`${isActive ? 'font-semibold' : 'font-medium'}`}>{label}</span>
        </>
      )}
    </NavLink>
  );
};

export default SidebarItem;
