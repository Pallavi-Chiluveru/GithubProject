import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  User,
  Settings,
  Layout,
  Bell,
  Lock,
  CreditCard,
  Mail,
  Key,
  Building,
  Users,
  Shield,
  ChevronRight,
} from 'lucide-react';

// Reuse the same sidebar definition as SettingsPage for consistency
const SECTIONS = [
  { id: 'profile', icon: User, label: 'Public profile' },
  { id: 'account', icon: Settings, label: 'Account' },
  { id: 'appearance', icon: Layout, label: 'Appearance' },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
  { section: 'ACCESS' },
  { id: 'emails', icon: Mail, label: 'Emails' },
  { id: 'password', icon: Lock, label: 'Password and authentication' },
  { id: 'sessions', icon: Shield, label: 'Sessions' },
  { id: 'ssh', icon: Key, label: 'SSH and GPG keys' },
  { id: 'organizations', icon: Building, label: 'Organizations', path: '/settings/organizations' },
];

export default function SettingsLayout({ children, user, active, setActive }) {
  const navigate = useNavigate();

  const navTo = (item) => {
    if (item.path) {
      navigate(item.path);
      return;
    }
    setActive(item.id);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans pb-20 pt-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* SIDEBAR */}
          <aside className="fixed top-[64px] left-0 h-[calc(100vh-64px)] w-full md:w-60 shrink-0 bg-[#0d1117] z-50">
            <div className="flex items-center gap-3 px-2 mb-6">
              <div className="h-9 w-9 rounded-full overflow-hidden border border-[var(--border-color)]">
                <img
                  src={user?.profileImageUrl || `https://ui-avatars.com/api/?name=${user?.username || 'U'}&background=random`}
                  alt="avatar"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{user?.username}</p>
                <p className="text-xs text-[var(--text-secondary)]">Your personal account</p>
              </div>
            </div>
            <nav className="space-y-0.5">
              {SECTIONS.map((item, i) =>
                item.section ? (
                  <p
                    key={i}
                    className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]"
                  >
                    {item.section}
                  </p>
                ) : (
                  <button
                    key={item.id}
                    onClick={() => navTo(item)}
                    className={`flex w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      active === item.id
                        ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border-l-2 border-[#ec4899]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <item.icon size={15} className={active === item.id ? 'text-[#ec4899]' : ''} />
                    {item.label}
                    {item.path && <ChevronRight size={12} className="ml-auto opacity-50" />}
                  </button>
                )
              )}
            </nav>
          </aside>
          {/* MAIN CONTENT */}
          <main className="flex-1 min-w-0 md:ml-60">{children}</main>
        </div>
      </div>
    </div>
  );
}
