import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, CloudLightning, ChevronDown, Check } from 'lucide-react';

export default function AskDropdown({ isCompact }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isAgent = location.pathname.includes('/agent');

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {isCompact ? (
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#8b949e] hover:text-[#f0f6fc]"
        >
          {isAgent ? <CloudLightning className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
          {isAgent ? 'Agent' : 'Ask'} <ChevronDown className="h-3 w-3" />
        </button>
      ) : (
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#c9d1d9] bg-[#161b22] hover:bg-[#21262d] rounded-md transition-colors border border-[#30363d]"
        >
          {isAgent ? <CloudLightning className="w-3.5 h-3.5 text-[#8b949e]" /> : <MessageSquare className="w-3.5 h-3.5 text-[#8b949e]" />}
          {isAgent ? 'Agent' : 'Ask'}
          <ChevronDown className="w-3 h-3 text-[#8b949e]" />
        </button>
      )}

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-32 bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col py-1">
          <button 
            onClick={() => { 
              const focusInput = () => {
                const input = document.getElementById('ai-input');
                if (input) {
                  input.focus();
                  input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  return true;
                }
                return false;
              };

              if (focusInput()) {
                // Success!
              } else {
                // Not found on current page, go home
                navigate('/dashboard');
                setTimeout(focusInput, 150);
              }
              setIsOpen(false); 
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-[#1f242c] transition-colors flex items-center gap-2 group"
          >
            <div className="w-4 flex items-center justify-center">
              {!isAgent && <Check className="h-3.5 w-3.5 text-[#c9d1d9]" />}
            </div>
            <MessageSquare className="h-3.5 w-3.5 text-[#8b949e] group-hover:text-[#c9d1d9]" />
            <span className="text-xs font-medium text-[#c9d1d9]">Ask</span>
          </button>
          
          <button 
            onClick={() => { navigate('/agent'); setIsOpen(false); }}
            className="w-full text-left px-3 py-1.5 hover:bg-[#1f242c] transition-colors flex items-center gap-2 group"
          >
            <div className="w-4 flex items-center justify-center">
              {isAgent && <Check className="h-3.5 w-3.5 text-[#c9d1d9]" />}
            </div>
            <CloudLightning className="h-3.5 w-3.5 text-[#8b949e] group-hover:text-[#c9d1d9]" />
            <span className="text-xs font-medium text-[#c9d1d9]">Agent</span>
          </button>
        </div>
      )}
    </div>
  );
}
