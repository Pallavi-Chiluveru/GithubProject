import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

import { 
  History, 
  Info, 
  Globe, 
  Lock, 
  ChevronDown, 
  User, 
  Key,
  Link as LinkIcon,
  ShieldAlert,
  ArrowRight
} from "lucide-react";

export default function ImportRepo() {
  const navigate = useNavigate();
  const [sourceUrl, setSourceUrl] = useState("");
  const [repoName, setRepoName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleImport = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/repo-api/import", {
        sourceUrl,
        repoName,
        isPrivate: visibility === "private",
        username,
        password
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("Import failed:", err);
      alert(err.response?.data?.message || "Failed to import repository");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#010409] text-[#c9d1d9] pb-20">
      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Header */}
        <div className="mb-8 border-b border-[#30363d] pb-8">
          <div className="flex items-center gap-3 mb-4">
             <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <History className="h-7 w-7 text-indigo-400" />
             </div>
             <div>
                <h1 className="text-3xl font-bold text-[#f0f6fc]">Import your project to RepoSphere</h1>
                <p className="text-[#8b949e] mt-1 text-sm">Import all the files, including revision history, from another version control system.</p>
             </div>
          </div>
          <p className="text-xs text-[#8b949e] italic">Required fields are marked with an asterisk (*).</p>
        </div>

        {/* Warning Banner */}
        <div className="mb-10 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3">
           <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
           <p className="text-sm text-amber-200/80 leading-relaxed">
             Support for importing Mercurial, Subversion and Team Foundation Version Control (TFVC) repositories ended on April 12, 2024. For more details, see the <span className="text-amber-400 cursor-pointer hover:underline">changelog</span>.
           </p>
        </div>

        <form onSubmit={handleImport} className="space-y-10">
          {/* Source Section */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-[#f0f6fc] border-b border-[#30363d] pb-3">Your source repository details</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#f0f6fc]">
                The URL for your source repository <span className="text-[#f85149]">*</span>
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-[#8b949e]" />
                <input 
                  type="text" 
                  required
                  placeholder="https://git.example.org/code/git"
                  className="w-full rounded-lg border border-[#30363d] bg-[#0d1117] py-2.5 pl-10 pr-4 text-sm text-[#f0f6fc] focus:border-indigo-500 focus:outline-none transition-all"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                />
              </div>
              <p className="text-[11px] text-[#8b949e]">Learn more about <span className="text-indigo-400 cursor-pointer hover:underline">importing git repositories</span>.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
               <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">Your username for source repository</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-[#8b949e]" />
                    <input 
                      type="text" 
                      className="w-full rounded-lg border border-[#30363d] bg-[#0d1117] py-2 pl-10 pr-4 text-sm text-[#f0f6fc] focus:border-indigo-500 focus:outline-none"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />

                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">Your access token or password</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-2.5 h-4 w-4 text-[#8b949e]" />
                    <input 
                      type="password" 
                      className="w-full rounded-lg border border-[#30363d] bg-[#0d1117] py-2 pl-10 pr-4 text-sm text-[#f0f6fc] focus:border-indigo-500 focus:outline-none"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />

                  </div>
               </div>
            </div>
            <p className="text-[11px] text-[#8b949e] italic">Please enter your credentials if required for cloning your remote repository.</p>
          </section>

          {/* Target Section */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-[#f0f6fc] border-b border-[#30363d] pb-3">Your new repository details</h2>
            
            <div className="flex flex-wrap items-end gap-4">
               <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#f0f6fc]">Owner <span className="text-[#f85149]">*</span></label>
                  <button type="button" className="flex items-center gap-2 rounded-lg border border-[#30363d] bg-[#161b22] px-3 py-2 text-sm font-medium hover:bg-[#30363d] transition-all">
                     <div className="h-5 w-5 rounded-full bg-indigo-500/20 flex items-center justify-center overflow-hidden">
                        <img src={`https://ui-avatars.com/api/?name=${user.username}&background=random`} alt="" />
                     </div>
                     {user.username}
                     <ChevronDown className="h-3 w-3 text-[#8b949e]" />
                  </button>
               </div>
               <span className="text-2xl text-[#30363d] mb-1">/</span>
               <div className="flex-1 space-y-2 min-w-[200px]">
                  <label className="text-sm font-semibold text-[#f0f6fc]">Repository name <span className="text-[#f85149]">*</span></label>
                  <input 
                    type="text" 
                    required
                    className="w-full rounded-lg border border-[#30363d] bg-[#0d1117] py-2 px-4 text-sm text-[#f0f6fc] focus:border-indigo-500 focus:outline-none"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                  />
               </div>
            </div>

            <div className="space-y-4 pt-4">
              <label className="flex items-start gap-3 p-4 rounded-xl border border-[#30363d] bg-[#0d1117] hover:border-indigo-500/50 cursor-pointer transition-all group">
                <input 
                  type="radio" 
                  name="visibility" 
                  value="public"
                  checked={visibility === "public"}
                  onChange={() => setVisibility("public")}
                  className="mt-1 h-4 w-4 border-[#30363d] bg-[#0d1117] text-indigo-500 focus:ring-indigo-500" 
                />
                <div className="flex gap-3">
                  <Globe className={`h-5 w-5 mt-0.5 ${visibility === 'public' ? 'text-indigo-400' : 'text-[#8b949e]'}`} />
                  <div>
                    <p className="text-sm font-bold text-[#f0f6fc] group-hover:text-indigo-400 transition-colors">Public</p>
                    <p className="text-xs text-[#8b949e]">Anyone on the internet can see this repository. You choose who can commit.</p>
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-xl border border-[#30363d] bg-[#0d1117] hover:border-indigo-500/50 cursor-pointer transition-all group">
                <input 
                  type="radio" 
                  name="visibility" 
                  value="private"
                  checked={visibility === "private"}
                  onChange={() => setVisibility("private")}
                  className="mt-1 h-4 w-4 border-[#30363d] bg-[#0d1117] text-indigo-500 focus:ring-indigo-500" 
                />
                <div className="flex gap-3">
                  <Lock className={`h-5 w-5 mt-0.5 ${visibility === 'private' ? 'text-indigo-400' : 'text-[#8b949e]'}`} />
                  <div>
                    <p className="text-sm font-bold text-[#f0f6fc] group-hover:text-indigo-400 transition-colors">Private</p>
                    <p className="text-xs text-[#8b949e]">You choose who can see and commit to this repository.</p>
                  </div>
                </div>
              </label>
            </div>

            <div className="flex items-center gap-2 p-4 bg-[#161b22]/50 rounded-lg text-xs text-[#8b949e]">
               <Info className="h-4 w-4 text-indigo-400" />
               <span>You are creating a {visibility} repository in your personal account.</span>
            </div>
          </section>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-4 border-t border-[#30363d] pt-8">
            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 text-sm font-semibold text-[#8b949e] hover:text-[#f0f6fc] transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-[#238636] px-8 py-2.5 text-sm font-bold text-white hover:bg-[#2ea043] transition-all shadow-lg shadow-emerald-900/20 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Importing..." : "Begin import"} <ArrowRight className="h-4 w-4" />
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}
