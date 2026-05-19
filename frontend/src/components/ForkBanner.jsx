import React from "react";
import { Link } from "react-router-dom";
import { GitBranch } from "lucide-react";

export default function ForkBanner({ forkedFromRepo }) {
  if (!forkedFromRepo) return null;

  const ownerName = forkedFromRepo.owner?.username || "Unknown";
  const repoName = forkedFromRepo.name;

  return (
    <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] mt-1 font-medium">
      <GitBranch className="h-3.5 w-3.5 text-[var(--text-secondary)] shrink-0" />
      <span>forked from</span>
      <Link 
        to={`/repo/${forkedFromRepo._id}`}
        className="text-[#2f81f7] hover:underline font-semibold"
      >
        {ownerName}/{repoName}
      </Link>
    </div>
  );
}
