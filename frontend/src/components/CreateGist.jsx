import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Code, 
  X, 
  Plus, 
  Trash2, 
  FileCode,
  ChevronDown,
  Globe,
  Lock,
  ArrowRight
} from "lucide-react";

export default function CreateGist() {
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([{ name: "", content: "" }]);
  const [visibility, setVisibility] = useState("secret");

  const addFile = () => setFiles([...files, { name: "", content: "" }]);
  const removeFile = (index) => setFiles(files.filter((_, i) => i !== index));
  const updateFile = (index, field, value) => {
    const newFiles = [...files];
    newFiles[index][field] = value;
    setFiles(newFiles);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    alert("Gist creation logic would go here (Simulation)");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#010409] text-[#c9d1d9] pb-20">
      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between border-b border-[#30363d] pb-6">
           <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-[#ec4899]/10 flex items-center justify-center">
                 <Code className="h-7 w-7 text-[#ec4899]" />
              </div>
              <div>
                 <h1 className="text-3xl font-extrabold text-[#f0f6fc]">Create a new Gist</h1>
                 <p className="text-[#8b949e] mt-1 text-sm">Instantly share code, notes, and snippets.</p>
              </div>
           </div>
           <button 
            onClick={() => navigate("/dashboard")}
            className="rounded-full p-2 hover:bg-[#30363d] transition-all"
           >
              <X className="h-6 w-6 text-[#8b949e]" />
           </button>
        </div>

        <form onSubmit={handleCreate} className="space-y-8">
           {/* Gist Description */}
           <div className="space-y-3">
              <label className="text-sm font-bold text-[#f0f6fc]">Gist description...</label>
              <input 
                type="text" 
                placeholder="Enter a description for this gist..."
                className="w-full rounded-lg border border-[#30363d] bg-[#0d1117] py-3 px-4 text-sm text-[#f0f6fc] focus:border-[#ec4899] focus:outline-none transition-all"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
           </div>

           {/* Files List */}
           <div className="space-y-6">
              {files.map((file, index) => (
                <div key={index} className="rounded-2xl border border-[#30363d] bg-[#0d1117] overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-300">
                   <div className="flex items-center justify-between bg-[#161b22] px-4 py-2 border-b border-[#30363d]">
                      <div className="flex items-center gap-3 flex-1 max-w-md">
                         <FileCode className="h-4 w-4 text-[#8b949e]" />
                         <input 
                           type="text" 
                           placeholder="Filename including extension..."
                           className="w-full bg-transparent text-sm text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none"
                           value={file.name}
                           onChange={(e) => updateFile(index, 'name', e.target.value)}
                         />
                      </div>
                      {files.length > 1 && (
                        <button 
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-[#8b949e] hover:text-[#f85149] transition-colors"
                        >
                           <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                   </div>
                   <div className="p-0">
                      <textarea 
                        rows="12"
                        placeholder="Paste your code here..."
                        className="w-full bg-[#010409] py-4 px-6 text-sm text-[#f0f6fc] placeholder-[#30363d] focus:outline-none resize-none font-mono leading-relaxed"
                        value={file.content}
                        onChange={(e) => updateFile(index, 'content', e.target.value)}
                      />
                   </div>
                </div>
              ))}
           </div>

           {/* Action Bar */}
           <div className="flex flex-wrap items-center justify-between gap-6 pt-6">
              <button 
                type="button"
                onClick={addFile}
                className="flex items-center gap-2 rounded-lg border border-[#30363d] bg-[#21262d] px-4 py-2 text-sm font-semibold text-[#f0f6fc] hover:bg-[#30363d] transition-all"
              >
                 <Plus className="h-4 w-4" /> Add file
              </button>

              <div className="flex items-center gap-3">
                 <div className="flex items-center">
                    <button 
                      type="submit"
                      className="rounded-l-lg bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/20"
                    >
                       Create {visibility} gist
                    </button>
                    <div className="relative group">
                       <button 
                        type="button"
                        className="rounded-r-lg bg-indigo-600 border-l border-indigo-500 px-3 py-2.5 text-sm text-white hover:bg-indigo-500 transition-all h-full"
                       >
                          <ChevronDown className="h-4 w-4" />
                       </button>
                       <div className="absolute right-0 bottom-full mb-2 w-56 rounded-xl border border-[#30363d] bg-[#161b22] py-2 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                          <button 
                            type="button"
                            onClick={() => setVisibility("secret")}
                            className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-[#30363d]"
                          >
                             <Lock className="h-4 w-4 text-[#8b949e]" />
                             <div>
                                <p className="font-bold text-[#f0f6fc]">Create secret gist</p>
                                <p className="text-[10px] text-[#8b949e]">Only visible to those with link</p>
                             </div>
                          </button>
                          <button 
                            type="button"
                            onClick={() => setVisibility("public")}
                            className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-[#30363d]"
                          >
                             <Globe className="h-4 w-4 text-[#8b949e]" />
                             <div>
                                <p className="font-bold text-[#f0f6fc]">Create public gist</p>
                                <p className="text-[10px] text-[#8b949e]">Visible to everyone</p>
                             </div>
                          </button>
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
