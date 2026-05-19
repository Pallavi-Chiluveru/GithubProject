import { useState, useEffect } from "react";
import { 
  X, 
  Copy, 
  Book, 
  ChevronDown, 
  ArrowRight,
  CircleDot,
  Search,
  MessageSquare,
  Layout
} from "lucide-react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function CreateIssue() {
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [isRepoDropdownOpen, setIsRepoDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const res = await API.get("/repo-api/user");
        setRepos(res.data);
        if (res.data.length > 0) {
          setSelectedRepo(res.data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch repos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRepos();
  }, []);

  const handleBlankIssue = () => {
    if (selectedRepo) {
      navigate(`/repo/${selectedRepo._id}/new-issue`);
    }
  };



  return (
    <div className="min-h-screen bg-[#010409] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[#30363d] bg-[#0d1117] shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#30363d] bg-[#161b22] px-6 py-4">
          <h2 className="text-base font-bold text-[#f0f6fc]">Create new issue</h2>
          <div className="flex items-center gap-3">
            <button className="text-[#8b949e] hover:text-[#f0f6fc] transition-colors">
              <Copy className="h-4 w-4" />
            </button>
            <button 
              onClick={() => navigate("/dashboard")}
              className="text-[#8b949e] hover:text-[#f0f6fc] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* Repository Selector */}
          <div className="mb-8 space-y-3">
            <label className="text-sm font-semibold text-[#f0f6fc]">
              Repository <span className="text-[#f85149]">*</span>
            </label>
            
            <div className="relative">
              <button 
                onClick={() => setIsRepoDropdownOpen(!isRepoDropdownOpen)}
                className="flex w-full items-center gap-3 rounded-lg border border-[#30363d] bg-[#010409] px-4 py-3 text-left hover:border-[#8b949e] transition-all group"
              >
                <Book className="h-4 w-4 text-[#8b949e] group-hover:text-indigo-400" />
                <span className="flex-1 text-sm font-medium text-[#f0f6fc]">
                  {loading ? "Loading repositories..." : selectedRepo ? `${user.username}/${selectedRepo.name}` : "Select a repository"}
                </span>
                <ChevronDown className={`h-4 w-4 text-[#8b949e] transition-transform ${isRepoDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isRepoDropdownOpen && (
                <div className="absolute z-10 mt-2 w-full rounded-xl border border-[#30363d] bg-[#161b22] py-2 shadow-2xl shadow-black/50 overflow-hidden animate-in slide-in-from-top-2 duration-150">
                  <div className="px-3 pb-2 border-b border-[#30363d] mb-2">
                     <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#8b949e]" />
                        <input 
                          type="text" 
                          placeholder="Filter repositories" 
                          className="w-full rounded-md border border-[#30363d] bg-[#0d1117] py-2 pl-8 pr-4 text-xs text-[#f0f6fc] focus:border-indigo-500 focus:outline-none"
                        />
                     </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto custom-scrollbar">
                    {repos.map((repo) => (
                      <button
                        key={repo._id}
                        onClick={() => {
                          setSelectedRepo(repo);
                          setIsRepoDropdownOpen(false);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-[#f0f6fc] hover:bg-indigo-600 transition-colors"
                      >
                        <Book className="h-3.5 w-3.5 opacity-60" />
                        {user.username}/{repo.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Templates Section */}
          <div className="space-y-4">
            <div className="border-b border-[#30363d] pb-2">
              <h3 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider">Templates and forms</h3>
            </div>

            <button 
              onClick={handleBlankIssue}
              className="flex w-full items-center justify-between rounded-xl border border-[#30363d] bg-[#0d1117] p-5 text-left hover:border-indigo-500 hover:bg-indigo-500/5 transition-all group shadow-sm"
            >
              <div className="space-y-1">
                <h4 className="text-base font-bold text-[#f0f6fc] group-hover:text-indigo-400">Blank issue</h4>
                <p className="text-sm text-[#8b949e]">Create a new issue from scratch</p>
              </div>
              <ArrowRight className="h-5 w-5 text-[#8b949e] group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-[#161b22] px-8 py-4 border-t border-[#30363d]">
          <div className="flex items-center gap-2 text-[11px] text-[#8b949e]">
            <CircleDot className="h-3.5 w-3.5" />
            <span>Open source developers are more likely to respond to clear, detailed issue reports.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
