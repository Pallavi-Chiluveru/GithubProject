import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Monitor, 
  X, 
  Plus, 
  Search, 
  ChevronDown, 
  MoreHorizontal,
  Terminal,
  Cpu,
  Globe,
  Settings,
  ArrowRight,
  Clock,
  ExternalLink
} from "lucide-react";

export default function Codespaces() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const codespaces = [
    { id: 1, name: "fluffy-space-unicorn", repo: "Pallavi-Chiluveru/heloguru", branch: "main", status: "Active", lastUsed: "2 hours ago", machine: "2-core • 8GB RAM" },
    { id: 2, name: "animated-adventure", repo: "Pallavi-Chiluveru/gitclone-frontend", branch: "feature-ui", status: "Shutdown", lastUsed: "Yesterday", machine: "4-core • 16GB RAM" }
  ];

  return (
    <div className="min-h-screen bg-[#010409] text-[#c9d1d9] pb-20">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-6 mb-10 border-b border-[#30363d] pb-8">
           <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-lg shadow-indigo-900/10">
                 <Monitor className="h-8 w-8 text-indigo-400" />
              </div>
              <div>
                 <h1 className="text-3xl font-extrabold text-[#f0f6fc]">Codespaces</h1>
                 <p className="text-[#8b949e] mt-1 text-base">Instant dev environments in the cloud.</p>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate("/settings")}
                className="flex items-center gap-2 rounded-lg border border-[#30363d] bg-[#21262d] px-4 py-2 text-sm font-semibold text-[#f0f6fc] hover:bg-[#30363d] transition-all"
              >
                 <Settings className="h-4 w-4" /> Settings
              </button>
              <button 
                onClick={() => navigate("/codespaces/new")}
                className="flex items-center gap-2 rounded-lg bg-[#238636] px-4 py-2 text-sm font-bold text-white hover:bg-[#2ea043] transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
              >
                 <Plus className="h-4 w-4" /> New codespace
              </button>
           </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
           <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8b949e]" />
              <input 
                type="text" 
                placeholder="Filter codespaces..."
                className="w-full rounded-lg border border-[#30363d] bg-[#0d1117] py-2 pl-10 pr-4 text-sm text-[#f0f6fc] focus:border-indigo-500 focus:outline-none transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 rounded-lg border border-[#30363d] bg-[#21262d] px-3 py-1.5 text-xs font-semibold text-[#f0f6fc] hover:bg-[#30363d]">
                 Sort <ChevronDown className="h-3 w-3" />
              </button>
           </div>
        </div>

        {/* Codespaces List */}
        <div className="rounded-2xl border border-[#30363d] bg-[#0d1117] overflow-hidden shadow-2xl">
           <div className="bg-[#161b22] px-6 py-4 border-b border-[#30363d]">
              <h3 className="text-sm font-bold text-[#f0f6fc]">Existing codespaces</h3>
           </div>
           <div className="divide-y divide-[#30363d]">
              {codespaces.map((cs) => (
                <div key={cs.id} className="flex flex-wrap items-center justify-between gap-6 px-6 py-6 hover:bg-[#161b22]/50 transition-all group">
                   <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1 h-10 w-10 rounded-lg bg-[#30363d]/30 flex items-center justify-center">
                         <Terminal className={`h-5 w-5 ${cs.status === 'Active' ? 'text-[#3fb950]' : 'text-[#8b949e]'}`} />
                      </div>
                      <div className="space-y-1">
                         <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-[#f0f6fc] group-hover:text-indigo-400 transition-colors cursor-pointer">{cs.name}</h4>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${cs.status === 'Active' ? 'bg-[#238636]/10 text-[#3fb950] border border-[#238636]/30' : 'bg-[#30363d]/30 text-[#8b949e] border border-[#30363d]'}`}>
                               {cs.status}
                            </span>
                         </div>
                         <div className="flex items-center gap-3 text-xs text-[#8b949e]">
                            <span className="flex items-center gap-1 hover:text-indigo-400 cursor-pointer transition-colors">
                               <Cpu className="h-3.5 w-3.5" /> {cs.machine}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 hover:text-indigo-400 cursor-pointer transition-colors">
                               <Globe className="h-3.5 w-3.5" /> {cs.repo}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Used {cs.lastUsed}</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <button className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-bold text-white hover:bg-indigo-500 transition-all">
                         Open <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-[#30363d] text-[#8b949e] transition-all">
                         <MoreHorizontal className="h-5 w-5" />
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Empty State / Templates section */}
        <div className="mt-12 space-y-6">
           <div className="border-b border-[#30363d] pb-2">
              <h3 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider">Quick start templates</h3>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'React', desc: 'Modern web development', icon: '⚛️' },
                { name: 'Node.js', desc: 'Backend development', icon: '🟢' },
                { name: 'Python', desc: 'Data science & scripting', icon: '🐍' },
                { name: 'Next.js', desc: 'Full-stack framework', icon: '▲' }
              ].map((t) => (
                <div key={t.name} className="p-5 rounded-2xl border border-[#30363d] bg-[#0d1117] hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-pointer group">
                   <div className="text-2xl mb-3">{t.icon}</div>
                   <h4 className="text-sm font-bold text-[#f0f6fc] group-hover:text-indigo-400">{t.name}</h4>
                   <p className="text-xs text-[#8b949e] mt-1">{t.desc}</p>
                   <ArrowRight className="h-4 w-4 text-[#8b949e] mt-4 group-hover:translate-x-1 group-hover:text-indigo-400 transition-all" />
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
