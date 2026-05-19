import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Layout, 
  X, 
  Check, 
  Info, 
  Table, 
  Kanban, 
  Calendar,
  ChevronDown,
  ArrowRight,
  Globe,
  Lock
} from "lucide-react";

export default function CreateProject() {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [view, setView] = useState("table");
  const [visibility, setVisibility] = useState("private");

  const handleCreate = (e) => {
    e.preventDefault();
    alert("Project creation logic would go here (Simulation)");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#010409] text-[#c9d1d9] flex flex-col items-center py-16 px-6">
      <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-4 mb-8">
           <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Layout className="h-7 w-7 text-indigo-400" />
           </div>
           <div>
              <h1 className="text-3xl font-extrabold text-[#f0f6fc]">Create a new project</h1>
              <p className="text-[#8b949e] mt-1 text-base">Organize your work with a highly customizable project board.</p>
           </div>
        </div>

        <form onSubmit={handleCreate} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Left Side: Details */}
           <div className="lg:col-span-2 space-y-8">
              <div className="space-y-4">
                 <label className="text-sm font-bold text-[#f0f6fc]">Project name <span className="text-[#f85149]">*</span></label>
                 <input 
                    type="text" 
                    required
                    placeholder="Project Name"
                    className="w-full rounded-lg border border-[#30363d] bg-[#0d1117] py-3 px-4 text-[#f0f6fc] focus:border-indigo-500 focus:outline-none transition-all"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                 />
              </div>

              <div className="space-y-4">
                 <label className="text-sm font-bold text-[#f0f6fc]">Description <span className="text-[#8b949e] font-normal">(optional)</span></label>
                 <textarea 
                    rows="4"
                    placeholder="Add a description to your project..."
                    className="w-full rounded-lg border border-[#30363d] bg-[#0d1117] py-3 px-4 text-[#f0f6fc] focus:border-indigo-500 focus:outline-none transition-all resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                 />
              </div>

              {/* View Selection */}
              <div className="space-y-4">
                 <label className="text-sm font-bold text-[#f0f6fc]">Default view</label>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: 'table', icon: Table, label: 'Table', desc: 'Powerful list view' },
                      { id: 'kanban', icon: Kanban, label: 'Board', desc: 'Visual workflow' },
                      { id: 'timeline', icon: Calendar, label: 'Roadmap', desc: 'Track timelines' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setView(item.id)}
                        className={`flex flex-col items-start gap-2 p-4 rounded-xl border transition-all ${view === item.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-[#30363d] bg-[#0d1117] hover:border-[#8b949e]'}`}
                      >
                        <item.icon className={`h-6 w-6 ${view === item.id ? 'text-indigo-400' : 'text-[#8b949e]'}`} />
                        <div className="text-left">
                           <p className="text-sm font-bold text-[#f0f6fc]">{item.label}</p>
                           <p className="text-[10px] text-[#8b949e]">{item.desc}</p>
                        </div>
                      </button>
                    ))}
                 </div>
              </div>
           </div>

           {/* Right Side: Sidebar/Options */}
           <div className="space-y-8">
              <div className="rounded-2xl border border-[#30363d] bg-[#0d1117] p-6 space-y-6 shadow-xl">
                 <h3 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider">Project Settings</h3>
                 
                 <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer group">
                       <div className="flex items-center gap-3">
                          <Globe className="h-4 w-4 text-[#8b949e]" />
                          <span className="text-sm text-[#f0f6fc]">Public</span>
                       </div>
                       <input 
                          type="radio" 
                          name="visibility" 
                          value="public"
                          checked={visibility === "public"}
                          onChange={() => setVisibility("public")}
                          className="h-4 w-4 border-[#30363d] bg-transparent text-indigo-500"
                       />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer group">
                       <div className="flex items-center gap-3">
                          <Lock className="h-4 w-4 text-[#8b949e]" />
                          <span className="text-sm text-[#f0f6fc]">Private</span>
                       </div>
                       <input 
                          type="radio" 
                          name="visibility" 
                          value="private"
                          checked={visibility === "private"}
                          onChange={() => setVisibility("private")}
                          className="h-4 w-4 border-[#30363d] bg-transparent text-indigo-500"
                       />
                    </label>
                 </div>

                 <div className="pt-6 border-t border-[#30363d] space-y-4">
                    <div className="flex items-center gap-2 text-xs text-[#8b949e]">
                       <Info className="h-3.5 w-3.5 text-indigo-400" />
                       <span>Template: <span className="text-[#f0f6fc] font-semibold">Blank</span></span>
                    </div>
                    <button type="button" className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
                       Choose from templates <ChevronDown className="h-3 w-3" />
                    </button>
                 </div>
              </div>

              <div className="flex flex-col gap-3">
                 <button 
                    type="submit"
                    className="w-full rounded-xl bg-[#238636] py-3 text-sm font-bold text-white hover:bg-[#2ea043] transition-all shadow-lg shadow-emerald-900/20 active:scale-95 flex items-center justify-center gap-2"
                 >
                    Create project <ArrowRight className="h-4 w-4" />
                 </button>
                 <button 
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-full rounded-xl border border-[#30363d] bg-[#21262d] py-3 text-sm font-bold text-[#f0f6fc] hover:bg-[#30363d] transition-all"
                 >
                    Cancel
                 </button>
              </div>
           </div>
        </form>
      </div>

      <button 
        onClick={() => navigate("/dashboard")}
        className="fixed top-8 right-8 p-2 rounded-full border border-[#30363d] bg-[#161b22] text-[#8b949e] hover:text-[#f0f6fc] transition-all shadow-2xl"
      >
        <X className="h-6 w-6" />
      </button>
    </div>
  );
}
