import React, { useState, useEffect, useRef } from 'react';
import { GitBranch, ChevronDown, Search, X, Check } from 'lucide-react';

export default function BranchSelector({ currentBranch = 'main', branches = ['main'] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('branches'); // 'branches' or 'tags'
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredBranches = branches.filter(b => b.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-1.5 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors"
      >
        <GitBranch className="h-4 w-4 text-[#2f81f7]" />
        <span className="text-xs font-bold text-[var(--text-primary)]">{currentBranch}</span>
        <ChevronDown className={`h-3 w-3 text-[var(--text-secondary)] ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-80 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-150 overflow-hidden flex flex-col">
          {/* HEADER */}
          <div className="flex items-center justify-between p-3 border-b border-[var(--border-color)]">
            <h4 className="text-xs font-bold text-[var(--text-primary)]">Switch branches/tags</h4>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* SEARCH */}
          <div className="p-3 border-b border-[var(--border-color)]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-secondary)]" />
              <input 
                autoFocus
                type="text" 
                placeholder="Find or create a branch..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] py-1.5 pl-9 pr-3 text-xs text-[var(--text-primary)] focus:border-[#2f81f7] focus:ring-1 focus:ring-[#2f81f7] focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* TABS */}
          <div className="flex px-3 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)]">
            <button 
              onClick={() => setActiveTab('branches')}
              className={`px-4 py-2 text-xs font-bold transition-colors ${activeTab === 'branches' ? 'border-b-2 border-[#f78166] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              Branches
            </button>
            <button 
              onClick={() => setActiveTab('tags')}
              className={`px-4 py-2 text-xs font-bold transition-colors ${activeTab === 'tags' ? 'border-b-2 border-[#f78166] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              Tags
            </button>
          </div>

          {/* LIST */}
          <div className="flex-1 overflow-y-auto max-h-60 custom-scrollbar py-2 bg-[var(--bg-secondary)]">
            {activeTab === 'branches' ? (
              filteredBranches.length > 0 ? (
                filteredBranches.map(branch => (
                  <button 
                    key={branch}
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-between px-4 py-2 hover:bg-[var(--bg-tertiary)] transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <Check className={`h-4 w-4 ${currentBranch === branch ? 'text-[var(--text-primary)]' : 'text-transparent group-hover:text-[var(--text-secondary)]'}`} />
                      <span className={`text-sm ${currentBranch === branch ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`}>
                        {branch}
                      </span>
                    </div>
                    {branch === 'main' && (
                      <span className="rounded-full border border-[var(--border-color)] px-2 py-0.5 text-[10px] font-bold text-[var(--text-secondary)]">
                        default
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-[var(--text-secondary)] text-center">
                  Nothing to show
                </div>
              )
            ) : (
              <div className="px-4 py-3 text-sm text-[var(--text-secondary)] text-center">
                Nothing to show
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-tertiary)]">
            <button className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[#2f81f7] transition-colors">
              View all {activeTab}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
