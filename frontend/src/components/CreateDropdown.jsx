import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileCode2, FolderPlus, UploadCloud, Search, Book, Lock, Globe, X } from 'lucide-react';
import RepositorySelectorModal from './RepositorySelectorModal';
import UploadModal from './UploadModal';

export default function CreateDropdown({ isCompact, onUploadComplete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showRepoModal, setShowRepoModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = (action) => {
    setIsOpen(false);
    if (action === 'files') {
      setShowRepoModal(true);
    } else if (action === 'spaces') {
      navigate('/codespaces');
    } else if (action === 'upload') {
      setShowUploadModal(true);
    }
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {isCompact ? (
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="h-6 w-6 rounded-md border border-[#30363d] flex items-center justify-center text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        ) : (
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 text-[#8b949e] hover:text-[#c9d1d9] bg-[#161b22] hover:bg-[#21262d] rounded-md transition-colors border border-[#30363d]"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}

        {isOpen && (
          <div className="absolute top-full right-0 mt-1.5 w-56 bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col py-1">
            <button 
              onClick={() => handleAction('files')}
              className="w-full text-left px-3 py-2 hover:bg-[#1f242c] transition-colors flex items-center gap-3 group border-b border-[#30363d]"
            >
              <FileCode2 className="h-4 w-4 text-[#8b949e] group-hover:text-[#c9d1d9]" />
              <span className="text-sm font-medium text-[#c9d1d9]">Files and folders...</span>
            </button>
            
            <button 
              onClick={() => handleAction('upload')}
              className="w-full text-left px-3 py-2 hover:bg-[#1f242c] transition-colors flex items-center gap-3 group"
            >
              <UploadCloud className="h-4 w-4 text-[#8b949e] group-hover:text-[#c9d1d9]" />
              <span className="text-sm font-medium text-[#c9d1d9]">Upload from computer</span>
            </button>
          </div>
        )}
      </div>

      {showRepoModal && (
        <RepositorySelectorModal onClose={() => setShowRepoModal(false)} />
      )}
      
      {showUploadModal && (
        <UploadModal 
          onClose={() => setShowUploadModal(false)} 
          onUploadComplete={onUploadComplete} 
        />
      )}
    </>
  );
}
