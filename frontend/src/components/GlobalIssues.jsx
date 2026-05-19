import { useEffect, useState } from "react";
import API from "../api";
import { Link, useNavigate } from "react-router-dom";
import { 
  CircleDot, 
  Search, 
  ChevronDown, 
  Plus,
  Clock,
  User,
  Filter,
  Users,
  AtSign,
  History,
  CheckCircle2,
  MessageSquare
} from "lucide-react";

export default function GlobalIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("assigned"); // assigned, created, mentioned, recent
  const [searchQuery, setSearchQuery] = useState("is:issue state:open archived:false assignee:@me sort:updated-desc");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const res = await API.get("/issue-api/user/all");
      setIssues(res.data);
    } catch (err) {
      console.error("Failed to fetch global issues:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const filteredIssues = issues.filter(issue => {
    if (activeFilter === "assigned") {
      return issue.assignedTo?.some(a => (a._id === user.id || a === user.id));
    }
    if (activeFilter === "created") {
      return (issue.createdBy?._id === user.id || issue.createdBy === user.id);
    }
    return true;
  });

  const sidebarItems = [
    { id: "assigned", label: "Assigned to me", icon: Users, query: "is:issue state:open archived:false assignee:@me sort:updated-desc" },
    { id: "created", label: "Created by me", icon: CircleDot, query: "is:issue state:open archived:false author:@me sort:updated-desc" },
    { id: "mentioned", label: "Mentioned", icon: AtSign, query: "is:issue state:open archived:false mentions:@me sort:updated-desc" },
    { id: "recent", label: "Recent activity", icon: History, query: "is:issue involves:@me updated:>@today-1w sort:updated-desc" },
  ];

  return (
    <div className="min-h-screen bg-[#010409] text-[#c9d1d9] flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#30363d] pt-8 px-2 hidden md:block">
        <div className="space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveFilter(item.id);
                setSearchQuery(item.query);
              }}
              className={`flex w-full items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeFilter === item.id 
                ? "bg-[#1f6feb] text-white" 
                : "text-[#8b949e] hover:bg-[#161b22] hover:text-[#f0f6fc]"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>

      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-[#f0f6fc]">
              {sidebarItems.find(i => i.id === activeFilter)?.label}
            </h1>
            <Link 
              to="/new-issue"
              className="bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-all"
            >
              New issue
            </Link>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8b949e]" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg py-2 pl-10 pr-4 text-sm text-[#c9d1d9] focus:outline-none focus:ring-1 focus:ring-[#1f6feb] focus:border-[#1f6feb]"
              />
            </div>
          </div>

          {/* List */}
          <div className="border border-[#30363d] rounded-lg bg-[#0d1117] overflow-hidden">
            <div className="bg-[#161b22] border-b border-[#30363d] px-4 py-3 flex items-center justify-between">
              <div className="text-sm text-[#f0f6fc] font-semibold">
                {filteredIssues.length} results
              </div>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1 text-xs text-[#8b949e] hover:text-[#f0f6fc]">
                  <Clock className="h-4 w-4" /> Updated <ChevronDown className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="divide-y divide-[#30363d]">
              {loading ? (
                <div className="py-20 flex justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1f6feb] border-t-transparent"></div>
                </div>
              ) : filteredIssues.length > 0 ? (
                filteredIssues.map((issue) => (
                  <div key={issue._id} className="p-4 hover:bg-[#161b22] transition-colors flex items-start gap-3">
                    <CircleDot className="h-4 w-4 mt-1 text-[#3fb950]" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Link 
                          to={`/repo/${issue.repoId?._id}/issues/${issue._id}`}
                          className="font-bold text-[#f0f6fc] hover:text-[#1f6feb]"
                        >
                          {issue.title}
                        </Link>
                      </div>
                      <div className="text-xs text-[#8b949e] mt-1">
                        #{issue._id.slice(-4)} opened {new Date(issue.createdAt).toLocaleDateString()} in 
                        <Link to={`/repo/${issue.repoId?._id}`} className="hover:text-[#1f6feb] ml-1">
                          {issue.repoId?.owner?.username}/{issue.repoId?.name}
                        </Link>
                      </div>
                    </div>
                    {issue.comments?.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-[#8b949e]">
                        <MessageSquare className="h-3 w-3" />
                        {issue.comments.length}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-20 flex flex-col items-center text-center">
                  <h2 className="text-xl font-bold text-[#f0f6fc] mb-2">No results</h2>
                  <p className="text-[#8b949e] text-sm">Try adjusting your search filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
