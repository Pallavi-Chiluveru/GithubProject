import React from "react";
import { GitBranch } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ForkButton({ repoId, forkCount }) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] shadow-sm overflow-hidden">
      <button 
        onClick={() => navigate(`/fork/${repoId}`)}
        className="flex items-center gap-1.5 border-r border-[var(--border-color)] px-4 py-2 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[#2f81f7] transition-all"
      >
        <GitBranch className="h-4 w-4" /> Fork
      </button>
      <span className="px-3 py-2 text-[11px] font-bold text-[var(--text-secondary)]">
        {forkCount || 0}
      </span>
    </div>
  );
}
