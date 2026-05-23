import { useState } from "react";
import { 
  Plus, ChevronDown, Globe, Lock, Code2, Info, CheckCircle2, Building
} from "lucide-react";
import API from "../api";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

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
  const licenseOptions = ["None", "MIT", "Apache 2.0", "GPLv3", "BSD 3-Clause", "Unlicense"];

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-20 selection:bg-indigo-500/30 dark:bg-[#030712] dark:text-slate-200">
      <div className="mx-auto max-w-4xl px-6 pt-12">
        <header className="mb-10 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/20 mb-4">
            <Code2 className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight dark:text-white">Create New Repository</h1>
          {orgId ? (
            <p className="mt-3 text-base text-gray-600 dark:text-slate-400">
              Creating inside organization{" "}
              <Link to={`/org/${orgId}`} className="text-indigo-600 font-semibold hover:underline dark:text-indigo-400">
                {orgName || orgId}
              </Link>
            </p>
          ) : (
            <p className="mt-3 text-lg text-gray-600 dark:text-slate-400">
              A repository contains all your project files, including the revision history.
            </p>
          )}
        </header>

        <form onSubmit={handleCreate} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                   <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-indigo-400">01</span>
                   </div>
                   <h2 className="text-xl font-bold text-gray-900 dark:text-white">General Information</h2>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Owner / Org indicator */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-300">Owner</label>
                      <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-2.5">
                        {orgId ? (
                          <>
                            <Building className="h-5 w-5 text-indigo-400" />
                            <span className="text-sm font-medium text-slate-200">{orgName || "Organization"}</span>
                          </>
                        ) : (
                          <>
                            <div className="h-6 w-6 rounded-full overflow-hidden ring-2 ring-slate-800">
                              <img src={`https://ui-avatars.com/api/?name=${user?.username || "Guest"}&background=random`} alt="User" />
                            </div>
                            <span className="text-sm font-medium text-slate-200">{user?.username || "Loading..."}</span>
                          </>
                        )}
                        <ChevronDown className="ml-auto h-4 w-4 text-slate-500" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-300">Repository Name *</label>
                      <input
                        type="text"
                        required
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:border-slate-800 dark:bg-slate-950/50 dark:text-white dark:placeholder-slate-600"
                        placeholder="e.g. my-awesome-app"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300 flex justify-between">
                      Description <span className="text-xs font-normal text-slate-500">{description.length}/350</span>
                    </label>
                    <textarea
                      rows="3"
                      maxLength={350}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none dark:border-slate-800 dark:bg-slate-950/50 dark:text-white dark:placeholder-slate-600"
                      placeholder="Briefly describe your project..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Visibility */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                   <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-purple-400">02</span>
                   </div>
                   <h2 className="text-xl font-bold text-gray-900 dark:text-white">Visibility & Access</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <button 
                    type="button"
                    onClick={() => setIsPublic(true)}
                    className={`flex flex-col items-start gap-3 rounded-2xl border p-5 transition-all text-left ${isPublic ? "border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500" : "border-slate-800 bg-slate-950/50 hover:border-slate-700"}`}
                   >
                      <div className={`p-2 rounded-lg ${isPublic ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-400"}`}>
                        <Globe className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isPublic ? "text-white" : "text-gray-700"}`}>Public</span>
                          {isPublic && <CheckCircle2 className="h-4 w-4 text-indigo-400" />}
                        </div>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed dark:text-slate-500">Anyone on the internet can see this project. You choose who can commit.</p>
                      </div>
                   </button>

                   <button 
                    type="button"
                    onClick={() => setIsPublic(false)}
                    className={`flex flex-col items-start gap-3 rounded-2xl border p-5 transition-all text-left ${!isPublic ? "border-purple-500 bg-purple-500/5 ring-1 ring-purple-500" : "border-slate-800 bg-slate-950/50 hover:border-slate-700"}`}
                   >
                      <div className={`p-2 rounded-lg ${!isPublic ? "bg-purple-500 text-white" : "bg-slate-800 text-slate-400"}`}>
                        <Lock className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${!isPublic ? "text-white" : "text-gray-700"}`}>Private</span>
                          {!isPublic && <CheckCircle2 className="h-4 w-4 text-purple-400" />}
                        </div>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed dark:text-slate-500">You choose who can see and commit to this project.</p>
                      </div>
                   </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                   <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-emerald-400">03</span>
                   </div>
                   <h2 className="text-xl font-bold text-gray-900 dark:text-white">Initialize Project</h2>
                </div>

                <div className="space-y-6">
                  {/* README toggle */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/50 border border-slate-800/50">
                    <div className="flex gap-3 items-center">
                      <div>
                        <p className="text-sm font-semibold text-white">Initialize repository with README</p>
                        <p className="text-[10px] text-slate-500">Add a README file for documentation</p>
                      </div>
                    </div>
                    <div 
                        onClick={() => setAddReadme(!addReadme)}
                        className={`h-6 w-11 rounded-full relative cursor-pointer transition-all ${addReadme ? "bg-indigo-600" : "bg-gray-300"}`}
                      >
                        <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${addReadme ? "left-6" : "left-1"}`}></div>
                     </div>
                  </div>

                  {/* .gitignore */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                      <span>.gitignore Template</span>
                      <Info className="h-3 w-3 text-slate-500" />
                    </div>
                    <select 
                      value={gitignore}
                      onChange={(e) => setGitignore(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none appearance-none cursor-pointer dark:border-slate-800 dark:bg-slate-950/50 dark:text-white"
                    >
                      {gitignoreOptions.map(opt => <option key={opt} value={opt} className="bg-slate-900">{opt === "None" ? "No .gitignore" : opt}</option>)}
                    </select>
                  </div>

                  {/* License */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                      <span>Choose License</span>
                      <Info className="h-3 w-3 text-slate-500" />
                    </div>
                    <select 
                      value={license}
                      onChange={(e) => setLicense(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none appearance-none cursor-pointer dark:border-slate-800 dark:bg-slate-950/50 dark:text-white"
                    >
                      {licenseOptions.map(opt => <option key={opt} value={opt} className="bg-slate-900">{opt === "None" ? "No license" : opt}</option>)}
                    </select>
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 py-4 font-bold text-white shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 dark:shadow-purple-600/20"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Creating...
                        </div>
                      ) : (orgId ? "Create Repository in Organization" : "Create Repository")}
                    </button>
                    <p className="mt-4 text-center text-[11px] text-slate-500 leading-relaxed px-4">
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