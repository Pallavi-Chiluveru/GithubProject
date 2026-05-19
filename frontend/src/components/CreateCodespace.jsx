import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { 
  Monitor, 
  ChevronDown, 
  Check, 
  Globe, 
  Cpu, 
  GitBranch, 
  Database,
  Search,
  X,
  Layout
} from "lucide-react";


export default function CreateCodespace() {
  const navigate = useNavigate();
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState("main");
  const [selectedRegion, setSelectedRegion] = useState("Southeast Asia");
  const [selectedMachine, setSelectedMachine] = useState("2-core • 8GB RAM");
  const [isRepoDropdownOpen, setIsRepoDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const res = await API.get("/repo-api/user");
        setRepos(res.data);
      } catch (err) {
        console.error("Failed to fetch repos:", err);
      }
    };
    fetchRepos();
  }, []);

  const handleCreate = () => {
    if (!selectedRepo) {
      alert("Please select a repository");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Codespace creation started! (Simulation)");
      navigate("/codespaces");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#010409] text-[#c9d1d9] flex flex-col items-center py-16 px-6 font-sans">
      <div className="w-full max-w-4xl space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Title */}
        <div className="text-center">
           <h1 className="text-3xl font-bold text-[#f0f6fc]">Create a new codespace</h1>
        </div>

        {/* Main Card */}
        <div className="rounded-xl border border-[#30363d] bg-[#0d1117] overflow-hidden shadow-2xl">
           
           {/* Repository Selection */}
           <div className="p-6 border-b border-[#30363d] flex items-center justify-between group hover:bg-[#161b22]/50 transition-all">
              <div>
                 <h3 className="text-sm font-bold text-[#f0f6fc]">Repository</h3>
                 <p className="text-xs text-[#8b949e] mt-1">To be cloned into your codespace</p>
              </div>
              <div className="relative">
                 <button 
                  onClick={() => setIsRepoDropdownOpen(!isRepoDropdownOpen)}
                  className="flex items-center gap-4 rounded-lg border border-[#30363d] bg-[#161b22] px-4 py-2 text-sm text-[#f0f6fc] hover:bg-[#30363d] transition-all min-w-[240px] justify-between"
                 >
                    <span className="truncate">{selectedRepo ? selectedRepo.name : "Select a repository"}</span>
                    <ChevronDown className="h-4 w-4 text-[#8b949e]" />
                 </button>

                 {isRepoDropdownOpen && (
                   <div className="absolute right-0 mt-2 z-50 w-[300px] rounded-xl border border-[#30363d] bg-[#161b22] shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-2 border-b border-[#30363d] mb-2">
                         <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#8b949e]" />
                            <input 
                              type="text" 
                              placeholder="Search repositories" 
                              className="w-full rounded-md border border-[#30363d] bg-[#0d1117] py-1.5 pl-8 pr-4 text-xs text-[#f0f6fc] focus:border-indigo-500 focus:outline-none"
                            />
                         </div>
                      </div>
                      <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                         {repos.map((repo) => (
                           <button 
                             key={repo._id}
                             onClick={() => { setSelectedRepo(repo); setIsRepoDropdownOpen(false); }}
                             className="w-full text-left px-4 py-2 text-sm text-[#f0f6fc] hover:bg-indigo-600 flex items-center justify-between group"
                           >
                              <span className="truncate">{repo.name}</span>
                              {selectedRepo?._id === repo._id && <Check className="h-4 w-4 text-white" />}
                           </button>
                         ))}
                      </div>
                   </div>
                 )}
              </div>
           </div>

           {/* Branch Selection */}
           <div className="p-6 border-b border-[#30363d] flex items-center justify-between group hover:bg-[#161b22]/50 transition-all opacity-80">
              <div>
                 <h3 className="text-sm font-bold text-[#f0f6fc]">Branch</h3>
                 <p className="text-xs text-[#8b949e] mt-1">This branch will be checked out on creation</p>
              </div>
              <button className="flex items-center gap-4 rounded-lg border border-[#30363d] bg-[#161b22] px-4 py-2 text-sm text-[#8b949e] transition-all min-w-[240px] justify-between cursor-not-allowed">
                 <span className="flex items-center gap-2"><GitBranch className="h-3.5 w-3.5" /> Default Branch</span>
                 <ChevronDown className="h-4 w-4" />
              </button>
           </div>

           {/* Region Selection */}
           <div className="p-6 border-b border-[#30363d] flex items-center justify-between group hover:bg-[#161b22]/50 transition-all">
              <div>
                 <h3 className="text-sm font-bold text-[#f0f6fc]">Region</h3>
                 <p className="text-xs text-[#8b949e] mt-1">Your codespace will run in the selected region</p>
              </div>
              <button className="flex items-center gap-4 rounded-lg border border-[#30363d] bg-[#161b22] px-4 py-2 text-sm text-[#f0f6fc] hover:bg-[#30363d] transition-all min-w-[240px] justify-between">
                 <span className="flex items-center gap-2"><Globe className="h-3.5 w-3.5 text-indigo-400" /> {selectedRegion}</span>
                 <ChevronDown className="h-4 w-4 text-[#8b949e]" />
              </button>
           </div>

           {/* Machine Type */}
           <div className="p-6 border-b border-[#30363d] flex items-center justify-between group hover:bg-[#161b22]/50 transition-all">
              <div>
                 <h3 className="text-sm font-bold text-[#f0f6fc]">Machine type</h3>
                 <p className="text-xs text-[#8b949e] mt-1">Resources for your codespace</p>
              </div>
              <button className="flex items-center gap-4 rounded-lg border border-[#30363d] bg-[#161b22] px-4 py-2 text-sm text-[#f0f6fc] hover:bg-[#30363d] transition-all min-w-[240px] justify-between">
                 <span className="flex items-center gap-2"><Cpu className="h-3.5 w-3.5 text-emerald-400" /> {selectedMachine}</span>
                 <ChevronDown className="h-4 w-4 text-[#8b949e]" />
              </button>
           </div>

           {/* Footer Action */}
           <div className="p-6 bg-[#161b22]/30 flex justify-end">
              <button 
                onClick={handleCreate}
                disabled={loading || !selectedRepo}
                className="flex items-center gap-2 rounded-lg bg-[#238636] px-8 py-2 text-sm font-bold text-white hover:bg-[#2ea043] transition-all shadow-lg shadow-emerald-900/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                 {loading ? "Creating..." : "Create codespace"}
              </button>
           </div>
        </div>

        {/* Footer Mimic */}
        <footer className="w-full max-w-5xl pt-12 border-t border-[#30363d]">
           <div className="flex flex-wrap justify-center gap-6 text-[11px] text-[#8b949e]">
              <div className="flex items-center gap-2">
                 <Layout className="h-4 w-4" />
                 <span>© 2026 GitClone, Inc.</span>
              </div>

              <span className="hover:text-indigo-400 cursor-pointer transition-colors">Terms</span>
              <span className="hover:text-indigo-400 cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-indigo-400 cursor-pointer transition-colors">Security</span>
              <span className="hover:text-indigo-400 cursor-pointer transition-colors">Status</span>
              <span className="hover:text-indigo-400 cursor-pointer transition-colors">Docs</span>
              <span className="hover:text-indigo-400 cursor-pointer transition-colors">Contact</span>
              <span className="hover:text-indigo-400 cursor-pointer transition-colors">Manage cookies</span>
           </div>
        </footer>

      </div>

      <button 
        onClick={() => navigate("/codespaces")}
        className="fixed top-8 right-8 p-2 rounded-full border border-[#30363d] bg-[#161b22] text-[#8b949e] hover:text-[#f0f6fc] transition-all"
      >
        <X className="h-6 w-6" />
      </button>
    </div>
  );
}
