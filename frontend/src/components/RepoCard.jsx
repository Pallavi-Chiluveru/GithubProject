import { Link } from "react-router-dom";
import { Star, ChevronDown, GitBranch, Globe, Lock, Book } from "lucide-react";
import lightLogo from "../assets/image.png";
import darkLogo from "../assets/antigravity_logo_dark.png";

export default function RepoCard({ repo }) {
  // Map languages to colors
  const langColors = {
    "JavaScript": "#f1e05a",
    "Python": "#3572A5",
    "TypeScript": "#3178c6",
    "HTML": "#e34c26",
    "CSS": "#563d7c",
    "Java": "#b07219",
    "C++": "#f34b7d",
  };

  const langColor = langColors[repo.language] || "#ec4899";

  return (
    <div className="group relative rounded-xl border border-[#30363d] bg-[#0d1117] p-5 transition-all hover:bg-[#161b22]">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <img src={lightLogo} className="block dark:hidden w-6 h-6 rounded-full" alt="logo" />
            <img src={darkLogo} className="hidden dark:block w-6 h-6 rounded-full" alt="logo" />
            <Link 
              to={`/repo/${repo._id}`} 
              className="text-base font-bold text-[#f0f6fc] hover:text-[#ec4899] transition-colors"
            >
              {repo.name}
            </Link>
            <span className={`inline-flex items-center rounded-full border border-[#30363d] px-2 py-0.5 text-[10px] font-medium text-[#8b949e]`}>
               {repo.isPrivate ? "Private" : "Public"}
            </span>
          </div>
          <p className="text-xs text-[#8b949e] line-clamp-2 max-w-2xl">
            {repo.description || "No description provided."}
          </p>
        </div>

        <div className="flex items-center rounded-md border border-[#30363d] bg-[#21262d] shadow-sm overflow-hidden h-7">
          <button className="flex items-center gap-1.5 border-r border-[#30363d] px-3 h-full text-xs font-semibold text-[#f0f6fc] hover:bg-[#30363d] transition-all">
            <Star className="h-3.5 w-3.5 text-[#8b949e]" /> Star
          </button>
          <button className="px-2 h-full text-[#8b949e] hover:bg-[#30363d] hover:text-[#f0f6fc] transition-all">
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 text-[11px] font-medium text-[#8b949e]">
        <div className="flex items-center gap-1.5">
          <div 
            className="h-3 w-3 rounded-full" 
            style={{ backgroundColor: langColor }}
          ></div>
          <span>{repo.language || "Unknown"}</span>
        </div>
        
        <div className="flex items-center gap-1 hover:text-[#ec4899] cursor-pointer transition-colors">
          <Star className="h-3.5 w-3.5" />
          <span>{repo.stars || 0}</span>
        </div>

        <div className="flex items-center gap-1 hover:text-[#ec4899] cursor-pointer transition-colors">
          <GitBranch className="h-3.5 w-3.5" />
          <span>main</span>
        </div>

        <span className="ml-auto text-[10px] opacity-60">
          Updated {new Date(repo.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}