import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
  const [descriptionHistory, setDescriptionHistory] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [availableLabels, setAvailableLabels] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [milestone, setMilestone] = useState("");
  const [openPanel, setOpenPanel] = useState(null);
  const [createMore, setCreateMore] = useState(false);
  const descriptionRef = useRef(null);

  useEffect(() => {
    const fetchRepo = async () => {
      try {
        const res = await API.get(`/repo-api/${id}`);
        const repoData = res.data;
        setRepo(repoData);

        const safe = (promise, fallback) => promise.then(r => r.data).catch(() => fallback);
        const [collabs, labels, boards] = await Promise.all([
          safe(API.get(`/collab-api/repo/${id}`), []),
          safe(API.get(`/label-api/repo/${id}`), []),
          safe(API.get(`/project-api/${id}`), []),
        ]);

        const owner = repoData.owner;
        const members = Array.isArray(collabs) ? collabs.map(c => c.userId || c.user).filter(Boolean) : [];
        const users = owner?._id ? [owner, ...members] : members;
        setAvailableUsers(Array.from(new Map(users.map(u => [u._id, u])).values()));
        setAvailableLabels(Array.isArray(labels) ? labels : []);
        setProjects(Array.isArray(boards) ? boards : []);
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
      await API.post(`/issue-api/${id}`, {
        title,
        description,
        assignedTo: selectedAssignees,
        labels: selectedLabels,
        projectId: selectedProject || undefined,
        milestone,
      });
      if (createMore) {
        setTitle("");
        setDescription("");
        setSelectedAssignees([]);
        setSelectedLabels([]);
        setSelectedProject("");
        setMilestone("");
        setOpenPanel(null);
      } else {
        navigate(`/repo/${id}/issues`);
      }
    } catch (err) {
      console.error("Failed to create issue:", err);
      const msg = err.response?.data?.message || "Failed to create issue";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const updateDescription = (nextValue, nextSelectionStart = null, nextSelectionEnd = null) => {
    setDescriptionHistory(prev => [...prev.slice(-19), description]);
    setDescription(nextValue);
    setActiveTab("write");

    window.setTimeout(() => {
      const textarea = descriptionRef.current;
      if (!textarea) return;
      textarea.focus();
      if (nextSelectionStart !== null && nextSelectionEnd !== null) {
        textarea.setSelectionRange(nextSelectionStart, nextSelectionEnd);
      }
    }, 0);
  };

  const applyMarkdown = (type) => {
    const textarea = descriptionRef.current;
    const start = textarea?.selectionStart ?? description.length;
    const end = textarea?.selectionEnd ?? description.length;
    const selected = description.slice(start, end);
    const before = description.slice(0, start);
    const after = description.slice(end);
    const fallback = {
      heading: "Heading",
      bold: "bold text",
      italic: "italic text",
      list: "List item",
      ordered: "List item",
      code: "code",
      link: "link text",
      mention: "username",
    };

    let insert = selected || fallback[type] || "";
    let selectStart = start;
    let selectEnd = start + insert.length;

    if (type === "heading") {
      insert = (selected || fallback.heading).split("\n").map(line => line.startsWith("### ") ? line : `### ${line}`).join("\n");
      selectStart = start + 4;
      selectEnd = start + insert.length;
    } else if (type === "bold") {
      insert = `**${selected || fallback.bold}**`;
      selectStart = start + 2;
      selectEnd = start + insert.length - 2;
    } else if (type === "italic") {
      insert = `*${selected || fallback.italic}*`;
      selectStart = start + 1;
      selectEnd = start + insert.length - 1;
    } else if (type === "list") {
      insert = (selected || fallback.list).split("\n").map(line => line.startsWith("- ") ? line : `- ${line}`).join("\n");
      selectStart = start + 2;
      selectEnd = start + insert.length;
    } else if (type === "ordered") {
      insert = (selected || fallback.ordered).split("\n").map((line, idx) => /^\d+\.\s/.test(line) ? line : `${idx + 1}. ${line}`).join("\n");
      selectStart = start + 3;
      selectEnd = start + insert.length;
    } else if (type === "code") {
      insert = selected.includes("\n") ? `\`\`\`\n${selected || fallback.code}\n\`\`\`` : `\`${selected || fallback.code}\``;
      selectStart = start + (selected.includes("\n") ? 4 : 1);
      selectEnd = start + insert.length - (selected.includes("\n") ? 4 : 1);
    } else if (type === "link") {
      const url = window.prompt("Enter URL", "https://");
      if (url === null) return;
      insert = `[${selected || fallback.link}](${url})`;
      selectStart = start + 1;
      selectEnd = start + 1 + (selected || fallback.link).length;
    } else if (type === "mention") {
      const username = window.prompt("Mention username", selected || "");
      if (username === null) return;
      insert = `@${username.replace(/^@/, "") || fallback.mention}`;
      selectStart = start + 1;
      selectEnd = start + insert.length;
    }

    updateDescription(`${before}${insert}${after}`, selectStart, selectEnd);
  };

  const undoDescription = () => {
    setDescriptionHistory(prev => {
      if (prev.length === 0) return prev;
      const next = prev[prev.length - 1];
      setDescription(next);
      setActiveTab("write");
      window.setTimeout(() => descriptionRef.current?.focus(), 0);
      return prev.slice(0, -1);
    });
  };

  const toggleValue = (setter, value) => {
    setter(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]);
  };

  const panelButtonClass = "flex items-center gap-1.5 rounded-md border border-[#30363d] bg-[#21262d] px-3 py-1.5 text-xs font-semibold text-[#f0f6fc] hover:bg-[#30363d]";


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
                   <button type="button" title="Heading" onClick={() => applyMarkdown("heading")} className="p-1.5 text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#30363d] rounded-md transition-all"><Heading className="h-4 w-4" /></button>
                   <button type="button" title="Bold" onClick={() => applyMarkdown("bold")} className="p-1.5 text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#30363d] rounded-md transition-all"><Bold className="h-4 w-4" /></button>
                   <button type="button" title="Italic" onClick={() => applyMarkdown("italic")} className="p-1.5 text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#30363d] rounded-md transition-all"><Italic className="h-4 w-4" /></button>
                   <div className="h-4 w-[1px] bg-[#30363d] mx-1"></div>
                   <button type="button" title="Bulleted list" onClick={() => applyMarkdown("list")} className="p-1.5 text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#30363d] rounded-md transition-all"><List className="h-4 w-4" /></button>
                   <button type="button" title="Numbered list" onClick={() => applyMarkdown("ordered")} className="p-1.5 text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#30363d] rounded-md transition-all"><ListOrdered className="h-4 w-4" /></button>
                   <button type="button" title="Code" onClick={() => applyMarkdown("code")} className="p-1.5 text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#30363d] rounded-md transition-all"><Code className="h-4 w-4" /></button>
                   <button type="button" title="Link" onClick={() => applyMarkdown("link")} className="p-1.5 text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#30363d] rounded-md transition-all"><LinkIcon className="h-4 w-4" /></button>
                   <div className="h-4 w-[1px] bg-[#30363d] mx-1"></div>
                   <button type="button" title="Mention" onClick={() => applyMarkdown("mention")} className="p-1.5 text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#30363d] rounded-md transition-all"><AtSign className="h-4 w-4" /></button>
                   <button type="button" title="Undo" onClick={undoDescription} disabled={descriptionHistory.length === 0} className="p-1.5 text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#30363d] rounded-md transition-all disabled:opacity-40"><Reply className="h-4 w-4" /></button>
                </div>
              </div>

              {/* Textarea Area */}
              <div className="p-4">
                {activeTab === "write" ? (
                  <textarea
                    ref={descriptionRef}
                    rows="12"
                    placeholder="Type your description here..."
                    className="w-full bg-transparent text-sm text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                ) : (
                  <div className="min-h-[288px] text-sm text-[#c9d1d9]">
                    {description ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{description}</ReactMarkdown>
                    ) : (
                      <span className="italic text-[#8b949e]">Nothing to preview</span>
                    )}
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
            <div className="relative flex flex-wrap gap-2">
              <button type="button" onClick={() => setOpenPanel(openPanel === "assignees" ? null : "assignees")} className={panelButtonClass}>
                <UserPlus className="h-4 w-4 text-[#8b949e]" /> Assignee {selectedAssignees.length > 0 && `(${selectedAssignees.length})`}
              </button>
              <button type="button" onClick={() => setOpenPanel(openPanel === "labels" ? null : "labels")} className={panelButtonClass}>
                <Tag className="h-4 w-4 text-[#8b949e]" /> Label {selectedLabels.length > 0 && `(${selectedLabels.length})`}
              </button>
              <button type="button" onClick={() => setOpenPanel(openPanel === "project" ? null : "project")} className={panelButtonClass}>
                <Layout className="h-4 w-4 text-[#8b949e]" /> Project {selectedProject && "(1)"}
              </button>
              <button type="button" onClick={() => setOpenPanel(openPanel === "milestone" ? null : "milestone")} className={panelButtonClass}>
                <Milestone className="h-4 w-4 text-[#8b949e]" /> Milestone {milestone && "(1)"}
              </button>

              {openPanel && (
                <div className="absolute bottom-full left-0 z-50 mb-2 w-72 rounded-xl border border-[#30363d] bg-[#0d1117] p-3 shadow-2xl">
                  {openPanel === "assignees" && (
                    <div className="space-y-1">
                      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#8b949e]">Assign to</p>
                      {availableUsers.length ? availableUsers.map(u => (
                        <button key={u._id} type="button" onClick={() => toggleValue(setSelectedAssignees, u._id)} className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-xs text-[#c9d1d9] hover:bg-[#21262d]">
                          <span>{u.username}</span>
                          {selectedAssignees.includes(u._id) && <span className="text-[#3fb950]">Selected</span>}
                        </button>
                      )) : <p className="text-xs text-[#8b949e]">No collaborators found.</p>}
                    </div>
                  )}

                  {openPanel === "labels" && (
                    <div className="space-y-1">
                      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#8b949e]">Labels</p>
                      {availableLabels.length ? availableLabels.map(label => (
                        <button key={label._id || label.name} type="button" onClick={() => toggleValue(setSelectedLabels, label.name)} className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-xs text-[#c9d1d9] hover:bg-[#21262d]">
                          <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: label.color || "#2f81f7" }} />{label.name}</span>
                          {selectedLabels.includes(label.name) && <span className="text-[#3fb950]">Selected</span>}
                        </button>
                      )) : <p className="text-xs text-[#8b949e]">No labels found.</p>}
                    </div>
                  )}

                  {openPanel === "project" && (
                    <div className="space-y-1">
                      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#8b949e]">Project board</p>
                      <button type="button" onClick={() => setSelectedProject("")} className="w-full rounded-lg px-2 py-2 text-left text-xs text-[#c9d1d9] hover:bg-[#21262d]">No project</button>
                      {projects.length ? projects.map(project => (
                        <button key={project._id} type="button" onClick={() => setSelectedProject(project._id)} className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-xs text-[#c9d1d9] hover:bg-[#21262d]">
                          <span>{project.name}</span>
                          {selectedProject === project._id && <span className="text-[#3fb950]">Selected</span>}
                        </button>
                      )) : <p className="text-xs text-[#8b949e]">No project boards found.</p>}
                    </div>
                  )}

                  {openPanel === "milestone" && (
                    <div>
                      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#8b949e]">Milestone</p>
                      <input value={milestone} onChange={(e) => setMilestone(e.target.value)} placeholder="v1.0, Sprint 2..." className="w-full rounded-lg border border-[#30363d] bg-[#010409] px-3 py-2 text-xs text-[#f0f6fc] outline-none focus:border-[#2f81f7]" />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" checked={createMore} onChange={(e) => setCreateMore(e.target.checked)} className="h-4 w-4 rounded border-[#30363d] bg-[#0d1117] text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0" />
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
                  <button type="button" onClick={() => setCreateMore(prev => !prev)} title="Toggle create more" className="rounded-r-md bg-[#238636] border-l border-[#2ea043] px-2 py-1.5 text-sm font-semibold text-white hover:bg-[#2ea043] transition-all">
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
