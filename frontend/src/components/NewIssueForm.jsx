import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  X, 
  Heading, 
  Bold, 
  Italic, 
  List, 
  ListOrdered,
  Code, 
  Link as LinkIcon, 
  AtSign, 
  Reply, 
  Image as ImageIcon,
  Paperclip,
  UserPlus,
  Tag,
  Layout,
  Milestone,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import API from "../api";

export default function NewIssueForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [repo, setRepo] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [activeTab, setActiveTab] = useState("write");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchRepo = async () => {
      try {
        const res = await API.get(`/repo-api/${id}`);
        setRepo(res.data);
      } catch (err) {
        console.error("Failed to fetch repo:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRepo();
  }, [id]);

  const handleCreate = async () => {
    if (!title) return alert("Title is required");
    setSubmitting(true);
    try {
      await API.post(`/issue-api/${id}`, { title, description });
      navigate(`/repo/${id}/issues`);
    } catch (err) {
      console.error("Failed to create issue:", err);
      const msg = err.response?.data?.message || "Failed to create issue";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };



  return (
    <div className="min-h-screen bg-[#010409] flex flex-col items-center p-6 text-[#c9d1d9]">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-[#30363d] bg-[#0d1117] shadow-2xl animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#30363d] bg-[#161b22] px-6 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="text-[#8b949e] hover:text-[#f0f6fc] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-base font-bold text-[#f0f6fc]">
              Create new issue in <span className="text-indigo-400">{loading ? "Loading..." : `${repo?.owner?.username || "Pallavi-Chiluveru"}/${repo?.name || "heloguru"}`}</span>
            </h2>
          </div>
          <button 
            onClick={() => navigate(`/repo/${id}`)}
            className="text-[#8b949e] hover:text-[#f0f6fc] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Title Input */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-[#f0f6fc]">
              Add a title <span className="text-[#f85149]">*</span>
            </label>
            <input
              type="text"
              placeholder="Title"
              className="w-full rounded-lg border border-[#30363d] bg-[#010409] px-4 py-2.5 text-[#f0f6fc] placeholder-[#8b949e] focus:border-[#ec4899] focus:bg-[#0d1117] focus:outline-none focus:ring-1 focus:ring-[#ec4899] transition-all"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description Editor */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-[#f0f6fc]">
              Add a description
            </label>
            
            <div className="rounded-xl border border-[#30363d] bg-[#010409] overflow-hidden">
              {/* Tabs & Toolbar */}
              <div className="flex items-center justify-between border-b border-[#30363d] bg-[#161b22] px-4 pt-2">
                <div className="flex gap-1">
                  <button 
                    onClick={() => setActiveTab("write")}
                    className={`px-4 py-2 text-sm font-medium border-x border-t border-transparent rounded-t-lg transition-all ${activeTab === "write" ? "bg-[#0d1117] border-[#30363d] text-[#f0f6fc]" : "text-[#8b949e] hover:text-[#f0f6fc]"}`}
                  >
                    Write
                  </button>
                  <button 
                    onClick={() => setActiveTab("preview")}
                    className={`px-4 py-2 text-sm font-medium border-x border-t border-transparent rounded-t-lg transition-all ${activeTab === "preview" ? "bg-[#0d1117] border-[#30363d] text-[#f0f6fc]" : "text-[#8b949e] hover:text-[#f0f6fc]"}`}
                  >
                    Preview
                  </button>
                </div>

                <div className="flex items-center gap-2 pb-2">
                   <button className="p-1.5 text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#30363d] rounded-md transition-all"><Heading className="h-4 w-4" /></button>
                   <button className="p-1.5 text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#30363d] rounded-md transition-all"><Bold className="h-4 w-4" /></button>
                   <button className="p-1.5 text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#30363d] rounded-md transition-all"><Italic className="h-4 w-4" /></button>
                   <div className="h-4 w-[1px] bg-[#30363d] mx-1"></div>
                   <button className="p-1.5 text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#30363d] rounded-md transition-all"><List className="h-4 w-4" /></button>
                   <button className="p-1.5 text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#30363d] rounded-md transition-all"><Code className="h-4 w-4" /></button>
                   <button className="p-1.5 text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#30363d] rounded-md transition-all"><LinkIcon className="h-4 w-4" /></button>
                   <div className="h-4 w-[1px] bg-[#30363d] mx-1"></div>
                   <button className="p-1.5 text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#30363d] rounded-md transition-all"><AtSign className="h-4 w-4" /></button>
                   <button className="p-1.5 text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#30363d] rounded-md transition-all"><Reply className="h-4 w-4" /></button>
                </div>
              </div>

              {/* Textarea Area */}
              <div className="p-4">
                {activeTab === "write" ? (
                  <textarea
                    rows="12"
                    placeholder="Type your description here..."
                    className="w-full bg-transparent text-sm text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                ) : (
                  <div className="min-h-[288px] text-sm text-[#8b949e] italic">
                    {description || "Nothing to preview"}
                  </div>
                )}
              </div>

              {/* Footer hint */}
              <div className="flex items-center gap-2 border-t border-[#30363d] px-4 py-2.5 bg-[#0d1117]/50">
                 <Paperclip className="h-4 w-4 text-[#8b949e]" />
                 <span className="text-xs text-[#8b949e]">Paste, drop, or click to add files</span>
              </div>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
            <div className="flex flex-wrap gap-2">
              <button className="flex items-center gap-1.5 rounded-md border border-[#30363d] bg-[#21262d] px-3 py-1.5 text-xs font-semibold text-[#f0f6fc] hover:bg-[#30363d]">
                <UserPlus className="h-4 w-4 text-[#8b949e]" /> Assignee
              </button>
              <button className="flex items-center gap-1.5 rounded-md border border-[#30363d] bg-[#21262d] px-3 py-1.5 text-xs font-semibold text-[#f0f6fc] hover:bg-[#30363d]">
                <Tag className="h-4 w-4 text-[#8b949e]" /> Label
              </button>
              <button className="flex items-center gap-1.5 rounded-md border border-[#30363d] bg-[#21262d] px-3 py-1.5 text-xs font-semibold text-[#f0f6fc] hover:bg-[#30363d]">
                <Layout className="h-4 w-4 text-[#8b949e]" /> Project
              </button>
              <button className="flex items-center gap-1.5 rounded-md border border-[#30363d] bg-[#21262d] px-3 py-1.5 text-xs font-semibold text-[#f0f6fc] hover:bg-[#30363d]">
                <Milestone className="h-4 w-4 text-[#8b949e]" /> Milestone
              </button>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="h-4 w-4 rounded border-[#30363d] bg-[#0d1117] text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0" />
                <span className="text-xs text-[#8b949e] group-hover:text-[#f0f6fc]">Create more</span>
              </label>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigate(-1)}
                  className="rounded-md bg-[#21262d] border border-[#30363d] px-4 py-1.5 text-sm font-semibold text-[#f0f6fc] hover:bg-[#30363d] transition-all"
                >
                  Cancel
                </button>
                <div className="flex items-center">
                  <button 
                    onClick={handleCreate}
                    disabled={submitting}
                    className="rounded-l-md bg-[#238636] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#2ea043] transition-all disabled:opacity-50"
                  >
                    {submitting ? "Creating..." : "Create"}
                  </button>
                  <button className="rounded-r-md bg-[#238636] border-l border-[#2ea043] px-2 py-1.5 text-sm font-semibold text-white hover:bg-[#2ea043] transition-all">
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
