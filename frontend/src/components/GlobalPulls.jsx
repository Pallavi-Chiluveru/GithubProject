import { useEffect, useState } from "react";
import API from "../api";
import { Link, useNavigate } from "react-router-dom";
import { 
  GitPullRequest, 
  Search, 
  ChevronDown, 
  Clock,
  Filter,
  MessageSquare,
  CheckCircle2
} from "lucide-react";

export default function GlobalPulls() {
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("created"); // created, assigned, mentioned, review
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  const getQueryForTab = (tab) => {
    const base = "is:open is:pr archived:false";
    switch (tab) {
      case "created": return `${base} author:${user.username}`;
      case "assigned": return `${base} assignee:${user.username}`;
      case "mentioned": return `${base} mentions:${user.username}`;
      case "review": return `${base} review-requested:${user.username}`;
      default: return base;
    }
  };

  const [searchQuery, setSearchQuery] = useState(getQueryForTab("created"));

  const fetchPrs = async () => {
    try {
      setLoading(true);
      const res = await API.get("/pr-api/user/all");
      setPrs(res.data);
    } catch (err) {
      console.error("Failed to fetch global PRs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrs();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery(getQueryForTab(tab));
  };

  const filteredPrs = prs.filter(pr => {
    if (activeTab === "created") {
      return pr.createdBy?._id === user.id || pr.createdBy === user.id;
    }
    // Add other filter logic if backend supports it
    return false;
  });

  const tabs = [
    { id: "created", label: "Created" },
    { id: "assigned", label: "Assigned" },
    { id: "mentioned", label: "Mentioned" },
    { id: "review", label: "Review requests" },
  ];

  const renderProTip = () => {
    switch (activeTab) {
      case "created":
        return (
          <>
            Adding <span className="text-[#1f6feb] cursor-pointer font-medium">no:label</span> will show everything without a label.
          </>
        );
      case "assigned":
        return (
          <>
            Exclude your own issues with <span className="text-[#1f6feb] cursor-pointer font-medium">-author:{user.username || 'user1'}</span>.
          </>
        );
      case "mentioned":
        return (
          <>
            Type <kbd className="bg-[#161b22] border border-[#30363d] px-1.5 py-0.5 rounded text-xs font-mono">g</kbd> <kbd className="bg-[#161b22] border border-[#30363d] px-1.5 py-0.5 rounded text-xs font-mono">i</kbd> on any issue or pull request to go back to the issue listing page.
          </>
        );
      case "review":
        return (
          <>
            What's not been updated in a month: <span className="text-[#1f6feb] cursor-pointer font-medium">updated:&lt;{new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0]}</span>
          </>
        );
      default:
        return (
          <>
            Updated in the last three days: <span className="text-[#1f6feb] cursor-pointer font-medium">updated:&gt;{new Date(Date.now() - 3*24*60*60*1000).toISOString().split('T')[0]}</span>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#010409] text-[#c9d1d9] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <GitPullRequest className="h-6 w-6 text-[#8b949e]" />
          <h1 className="text-xl font-bold text-[#f0f6fc]">Pull requests</h1>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex border border-[#30363d] rounded-lg overflow-hidden h-9">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 text-sm font-medium transition-all ${
                  activeTab === tab.id 
                  ? "bg-[#1f6feb] text-white" 
                  : "bg-[#0d1117] text-[#c9d1d9] hover:bg-[#161b22] border-r border-[#30363d] last:border-r-0"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8b949e]" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg py-1.5 pl-10 pr-4 text-sm text-[#c9d1d9] focus:outline-none focus:ring-1 focus:ring-[#1f6feb] focus:border-[#1f6feb]"
            />
          </div>
        </div>

        {/* List Container */}
        <div className="border border-[#30363d] rounded-lg bg-[#0d1117] overflow-hidden">
          <div className="bg-[#161b22] border-b border-[#30363d] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <button className="flex items-center gap-1 font-semibold text-[#f0f6fc]">
                <GitPullRequest className="h-4 w-4" /> 0 Open
              </button>
              <button className="flex items-center gap-1 text-[#8b949e] hover:text-[#f0f6fc]">
                <CheckCircle2 className="h-4 w-4" /> 0 Closed
              </button>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-[#8b949e]">
              <button className="flex items-center gap-1 hover:text-[#f0f6fc]">
                Visibility <ChevronDown className="h-3 w-3" />
              </button>
              <button className="flex items-center gap-1 hover:text-[#f0f6fc]">
                Organization <ChevronDown className="h-3 w-3" />
              </button>
              <button className="flex items-center gap-1 hover:text-[#f0f6fc]">
                Sort <ChevronDown className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="divide-y divide-[#30363d]">
            {loading ? (
              <div className="py-20 flex justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1f6feb] border-t-transparent"></div>
              </div>
            ) : filteredPrs.length > 0 ? (
              filteredPrs.map((pr) => (
                <div key={pr._id} className="p-4 hover:bg-[#161b22] transition-colors flex items-start gap-3">
                  <GitPullRequest className="h-4 w-4 mt-1 text-[#3fb950]" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Link 
                        to={`/repo/${pr.repoId?._id}/pull/${pr._id}`}
                        className="font-bold text-[#f0f6fc] hover:text-[#1f6feb]"
                      >
                        {pr.title}
                      </Link>
                    </div>
                    <div className="text-xs text-[#8b949e] mt-1">
                      #{pr._id.slice(-4)} opened {new Date(pr.createdAt).toLocaleDateString()} by {pr.createdBy?.username} in 
                      <Link to={`/repo/${pr.repoId?._id}`} className="hover:text-[#1f6feb] ml-1">
                        {pr.repoId?.owner?.username}/{pr.repoId?.name}
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-24 flex flex-col items-center text-center">
                <GitPullRequest className="h-8 w-8 text-[#8b949e] mb-4 opacity-50" />
                <h2 className="text-xl font-bold text-[#f0f6fc] mb-2">No results matched your search.</h2>
                <p className="text-[#8b949e] text-sm max-w-md">
                  You could search <span className="text-[#1f6feb] cursor-pointer">all of GitHub</span> or try an <span className="text-[#1f6feb] cursor-pointer">advanced search</span>.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tip */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#8b949e]">
          <span className="font-bold text-[#c9d1d9]">ProTip!</span> 
          {renderProTip()}
        </div>
      </div>
    </div>
  );
}
