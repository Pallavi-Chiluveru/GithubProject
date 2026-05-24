import { useState } from "react";
import { 
  Plus, ChevronDown, Globe, Lock, Code2, Info, CheckCircle2, Building
} from "lucide-react";
import API from "../api";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useTheme } from "../theme/ThemeContext";
import darkLogo from "../assets/antigravity_logo_dark.png";
import lightLogo from "../assets/image.png";

export default function CreateRepo() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [addReadme, setAddReadme] = useState(false);
  const [gitignore, setGitignore] = useState("None");
  const [license, setLicense] = useState("None");
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Read orgId from query string: /create-repo?orgId=ORGID
  const orgId = searchParams.get("orgId") || "";
  const orgName = searchParams.get("orgName") || "";

  const { theme } = useTheme();
  const logoSrc = theme === "dark" ? darkLogo : lightLogo;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Repository name is required");
    
    setLoading(true);
    try {
      const payload = { 
        name: name.trim(), 
        description, 
        isPublic,
        visibility: isPublic ? "PUBLIC" : "PRIVATE",
        addReadme,
        initializeWithReadme: addReadme,
        gitignore,
        license,
        orgId, // Include organization ID in the request
      };

      const res = await API.post("/repo-api/createRepo", payload);

      // Navigate back to org dashboard or personal dashboard
      if (orgId) {
        navigate(`/org/${orgId}`);
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Creation failed:", err);
      const msg = err.response?.data?.message || err.response?.data?.error || "Connection error — please check if the server is running";
      alert(msg);
    } finally {     
      setLoading(false);
    }
  };

  const gitignoreOptions = ["None", "Node", "Python", "Java", "C++", "Go", "Rust", "Unity"];
  const licenseOptions = ["None", "MIT", "Apache 2.0", "GPLv3", "BSD 3-Clause", "Unlicense"];  return (
    <div className="create-repo-container min-h-screen bg-slate-50 text-gray-900 pb-20 selection:bg-indigo-500/30 dark:bg-[#0d1117] dark:text-[#c9d1d9] transition-all duration-300 relative overflow-hidden">
      {/* Premium Radial Accent Glow Elements - active only in dark mode */}
      <div className="absolute inset-0 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.10),_transparent_35%)]"></div>

      <div className="mx-auto max-w-4xl px-6 pt-12 relative z-10">
        <header className="mb-10 text-center">
          <div className="mb-4 flex items-center justify-center">
            <img 
              src={logoSrc} 
              alt="Logo" 
              className="h-16 w-16 object-contain select-none transition-all duration-300"
            />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight dark:text-white">Create New Repository</h1>
          {orgId ? (
            <p className="mt-3 text-base text-gray-600 dark:text-gray-400">
              Creating inside organization{" "}
              <Link to={`/org/${orgId}`} className="text-indigo-600 font-semibold hover:underline dark:text-violet-400">
                {orgName || orgId}
              </Link>
            </p>
          ) : (
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
              A repository contains all your project files, including the revision history.
            </p>
          )}
        </header>

        <form onSubmit={handleCreate} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 space-y-6">
              <div className="create-repo-card rounded-2xl border border-gray-200 bg-white p-6 backdrop-blur-sm shadow-xl dark:bg-[#161b22] dark:border dark:border-white/10 dark:shadow-[0_8px_30px_rgba(0,0,0,0.45)] transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                   <div className="create-repo-index h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center dark:bg-violet-500/15">
                      <span className="text-xs font-bold text-indigo-600 dark:text-violet-400">01</span>
                   </div>
                   <h2 className="text-xl font-bold text-gray-900 dark:text-white">General Information</h2>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Owner / Org indicator */}
                    <div className="space-y-2">
                      <label className="create-repo-label text-sm font-semibold text-gray-700 dark:text-gray-200">Owner</label>
                      <div className="create-repo-input flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 dark:bg-[#0f172a] dark:border-[#2a3441] transition-all duration-300">
                        {orgId ? (
                          <>
                            <Building className="h-5 w-5 text-indigo-600 dark:text-violet-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-white">{orgName || "Organization"}</span>
                          </>
                        ) : (
                          <>
                            <div className="h-6 w-6 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-white/10">
                              <img src={`https://ui-avatars.com/api/?name=${user?.username || "Guest"}&background=random`} alt="User" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-white">{user?.username || "Loading..."}</span>
                          </>
                        )}
                        <ChevronDown className="ml-auto h-4 w-4 text-gray-400 dark:text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="create-repo-label text-sm font-semibold text-gray-700 dark:text-gray-200">Repository Name *</label>
                      <input
                        type="text"
                        required
                        className="create-repo-input w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all dark:bg-[#0f172a] dark:border-[#2a3441] dark:text-white dark:placeholder:text-gray-500 dark:focus:border-violet-500 dark:focus:ring-violet-500/20"
                        placeholder="e.g. my-awesome-app"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="create-repo-label text-sm font-semibold text-gray-700 dark:text-gray-200 flex justify-between">
                      Description <span className="text-xs font-normal text-gray-400 dark:text-gray-500">{description.length}/350</span>
                    </label>
                    <textarea
                      rows="3"
                      maxLength={350}
                      className="create-repo-input w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none dark:bg-[#0f172a] dark:border-[#2a3441] dark:text-white dark:placeholder:text-gray-500 dark:focus:border-violet-500 dark:focus:ring-violet-500/20"
                      placeholder="Briefly describe your project..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Visibility */}
              <div className="create-repo-card rounded-2xl border border-gray-200 bg-white p-6 backdrop-blur-sm shadow-xl dark:bg-[#161b22] dark:border dark:border-white/10 dark:shadow-[0_8px_30px_rgba(0,0,0,0.45)] transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                   <div className="create-repo-index h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center dark:bg-violet-500/15">
                      <span className="text-xs font-bold text-purple-600 dark:text-violet-400">02</span>
                   </div>
                   <h2 className="text-xl font-bold text-gray-900 dark:text-white">Visibility & Access</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <button 
                    type="button"
                    onClick={() => setIsPublic(true)}
                    className={`flex flex-col items-start gap-3 rounded-2xl border p-5 transition-all text-left duration-300 ${isPublic ? "border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600 dark:border-violet-500 dark:bg-violet-500/10 dark:ring-violet-500" : "border-gray-200 bg-white hover:border-gray-300 dark:border-white/5 dark:bg-[#0f172a] dark:hover:border-violet-500/30"}`}
                   >
                      <div className={`p-2 rounded-lg transition-all duration-300 ${isPublic ? "bg-indigo-600 text-white dark:bg-violet-600" : "bg-gray-100 text-gray-400 dark:bg-[#21262d] dark:text-gray-400"}`}>
                        <Globe className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold transition-all duration-300 ${isPublic ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>Public</span>
                          {isPublic && <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-violet-400" />}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed dark:text-gray-400">Anyone on the internet can see this project. You choose who can commit.</p>
                      </div>
                   </button>

                   <button 
                    type="button"
                    onClick={() => setIsPublic(false)}
                    className={`flex flex-col items-start gap-3 rounded-2xl border p-5 transition-all text-left duration-300 ${!isPublic ? "border-purple-600 bg-purple-50/30 ring-1 ring-purple-600 dark:border-violet-500 dark:bg-violet-500/10 dark:ring-violet-500" : "border-gray-200 bg-white hover:border-gray-300 dark:border-white/5 dark:bg-[#0f172a] dark:hover:border-violet-500/30"}`}
                   >
                      <div className={`p-2 rounded-lg transition-all duration-300 ${!isPublic ? "bg-purple-600 text-white dark:bg-violet-600" : "bg-gray-100 text-gray-400 dark:bg-[#21262d] dark:text-gray-400"}`}>
                        <Lock className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold transition-all duration-300 ${!isPublic ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>Private</span>
                          {!isPublic && <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-violet-400" />}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed dark:text-gray-400">You choose who can see and commit to this project.</p>
                      </div>
                   </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">
              <div className="create-repo-card rounded-2xl border border-gray-200 bg-white p-6 backdrop-blur-sm shadow-xl dark:bg-[#161b22] dark:border dark:border-white/10 dark:shadow-[0_8px_30px_rgba(0,0,0,0.45)] transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                   <div className="create-repo-index h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center dark:bg-violet-500/15">
                      <span className="text-xs font-bold text-emerald-600 dark:text-violet-400">03</span>
                   </div>
                   <h2 className="text-xl font-bold text-gray-900 dark:text-white">Initialize Project</h2>
                </div>

                <div className="space-y-6">
                  {/* README toggle */}
                  <div className="create-repo-readme-box flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 dark:bg-[#0f172a] dark:border-white/5 transition-all duration-300">
                    <div className="flex gap-3 items-center">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Initialize repository with README</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Add a README file for documentation</p>
                      </div>
                    </div>
                    <div 
                        onClick={() => setAddReadme(!addReadme)}
                        className={`h-6 w-11 rounded-full relative cursor-pointer transition-all duration-300 ${addReadme ? "bg-indigo-600 dark:bg-violet-600" : "bg-gray-300 dark:bg-gray-700"}`}
                      >
                        <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all duration-300 ${addReadme ? "left-6" : "left-1"}`}></div>
                     </div>
                  </div>

                  {/* .gitignore */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                      <span>.gitignore Template</span>
                      <Info className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                    </div>
                    <select 
                      value={gitignore}
                      onChange={(e) => setGitignore(e.target.value)}
                      className="create-repo-input w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none appearance-none cursor-pointer dark:bg-[#0f172a] dark:border-[#2a3441] dark:text-white dark:focus:border-violet-500 transition-all duration-300"
                    >
                      {gitignoreOptions.map(opt => <option key={opt} value={opt} className="bg-white text-gray-900 dark:bg-[#161b22] dark:text-white">{opt === "None" ? "No .gitignore" : opt}</option>)}
                    </select>
                  </div>

                  {/* License */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                      <span>Choose License</span>
                      <Info className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                    </div>
                    <select 
                      value={license}
                      onChange={(e) => setLicense(e.target.value)}
                      className="create-repo-input w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none appearance-none cursor-pointer dark:bg-[#0f172a] dark:border-[#2a3441] dark:text-white dark:focus:border-violet-500 transition-all duration-300"
                    >
                      {licenseOptions.map(opt => <option key={opt} value={opt} className="bg-white text-gray-900 dark:bg-[#161b22] dark:text-white">{opt === "None" ? "No license" : opt}</option>)}
                    </select>
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 py-4 font-bold text-white shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 dark:from-violet-600 dark:to-fuchsia-600 dark:shadow-[0_0_20px_rgba(130,80,223,0.2)] dark:hover:shadow-[0_0_25px_rgba(130,80,223,0.45)] duration-300"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Creating...
                        </div>
                      ) : (orgId ? "Create Repository in Organization" : "Create Repository")}
                    </button>
                    <p className="mt-4 text-center text-[11px] text-gray-500 leading-relaxed px-4 dark:text-gray-500">
                      By clicking "Create Repository", you agree to our Terms of Service and Privacy Policy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}