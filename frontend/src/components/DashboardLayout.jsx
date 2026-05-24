import React, { useState } from 'react';
import TopNavbar from './TopNavbar';
import Sidebar from './Sidebar';

/**
 * DashboardLayout provides a consistent layout for the dashboard page.
 * It includes a fixed top navbar and a sidebar that starts below the navbar.
 * The main content is rendered via children.
 */
export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      {/* Fixed top navigation bar */}
      <TopNavbar onMenuClick={() => setIsSidebarOpen(true)} />
      {/* Body container with top offset to avoid overlap */}
      <div className="flex pt-16 min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans">
        {/* Sidebar – hidden on large screens, overlay on mobile */}
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-[var(--bg-primary)] transition-colors">
          {children}
        </main>
      </div>
    </>
  );
}
