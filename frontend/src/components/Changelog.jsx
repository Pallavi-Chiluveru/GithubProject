import { useEffect, useState } from "react";
import API from "../api";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronDown, Rss, Link as LinkIcon, Filter } from "lucide-react";

export default function Changelog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllLogs = async () => {
      try {
        const res = await API.get("/activity-api/?limit=100");
        const filteredLogs = res.data.filter(log => log.action !== "org_invite_sent");
        setLogs(filteredLogs);
      } catch (err) {
        console.error("Failed to fetch logs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllLogs();
  }, []);

  // Group logs by month and year
  const groupedLogs = logs.reduce((acc, log) => {
    const date = new Date(log.createdAt);
    const monthYear = date.toLocaleString("en-US", { month: "long", year: "numeric" });
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(log);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#010409] text-[#c9d1d9] font-sans selection:bg-[#ec4899]/30">
      {/* HEADER SECTION */}
      <div className="relative border-b border-[#30363d] overflow-hidden">
        {/* Background Grid Pattern (simulated) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#30363d_1px,transparent_1px),linear-gradient(to_bottom,#30363d_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
        
        <div className="relative mx-auto max-w-5xl px-6 py-16 lg:py-24">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-[#8b949e] hover:text-[#ec4899] mb-8 transition-colors">
            ← BACK TO DASHBOARD
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h1 className="text-5xl font-extrabold text-[#f0f6fc] tracking-tight">Changelog</h1>
            <div className="flex items-center gap-4 text-xs font-medium text-[#8b949e]">
              <button className="hover:text-[#f0f6fc] transition-colors">COPY</button>
              <button className="flex items-center gap-1 hover:text-[#f0f6fc] transition-colors">RSS <Rss className="h-3 w-3" /></button>
              <button className="flex items-center gap-1 hover:text-[#f0f6fc] transition-colors">FEED URL <LinkIcon className="h-3 w-3" /></button>
              <div className="w-px h-4 bg-[#30363d] mx-2"></div>
              <span className="text-[#f0f6fc]">FOLLOW @GITCLONELOG ON X</span>
            </div>
          </div>

          {/* Filters Row */}
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-[#30363d] pt-6">
            <div className="flex flex-wrap items-center gap-2">
              <button className="flex items-center gap-2 rounded-full bg-[#30363d] px-4 py-1.5 text-xs font-semibold text-[#f0f6fc] hover:bg-[#8b949e]/20 transition-all">
                ALL
              </button>
            </div>
            <button className="flex items-center gap-2 rounded-md border border-[#30363d] bg-[#21262d] px-3 py-1.5 text-xs font-semibold text-[#f0f6fc] hover:bg-[#30363d] transition-all">
              FILTERS <Filter className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT LOGS SECTION */}
      <div className="mx-auto max-w-5xl px-6 py-12">
        {loading ? (
          <div className="text-center text-[#8b949e] py-20">Loading activity...</div>
        ) : Object.keys(groupedLogs).length === 0 ? (
          <div className="text-center text-[#8b949e] py-20 text-lg">No activity recorded yet.</div>
        ) : (
          <div className="space-y-16">
            {Object.keys(groupedLogs).map((monthYear, idx) => (
              <div key={monthYear} className="space-y-8">
                {/* Month Header */}
                <h2 className="flex items-center gap-2 text-2xl font-bold text-[#f0f6fc]">
                  {monthYear} <ChevronDown className="h-5 w-5 text-[#8b949e]" />
                </h2>
                
                {/* Logs for the month */}
                <div className="space-y-10 pl-4 border-l border-[#30363d] ml-2">
                  {groupedLogs[monthYear].map((log) => {
                    const date = new Date(log.createdAt);
                    const formattedDate = `${date.toLocaleString('en-US', { month: 'short' }).toUpperCase()}.${date.getDate().toString().padStart(2, '0')}`;
                    
                    let tagColor = "bg-[#30363d] text-[#c9d1d9]";
                    let tagText = "UPDATE";
                    
                    if (log.action.includes("created") || log.action.includes("imported")) {
                      tagColor = "bg-[#238636]/20 text-[#3fb950]";
                      tagText = "RELEASE";
                    } else if (log.action.includes("deleted") || log.action.includes("closed")) {
                      tagColor = "bg-[#f85149]/20 text-[#f85149]";
                      tagText = "RETIRED";
                    }

                    return (
                      <div key={log._id} className="relative group pl-6">
                        {/* Timeline dot */}
                        <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#8b949e] ring-4 ring-[#010409] group-hover:bg-[#ec4899] transition-colors"></div>
                        
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-semibold tracking-wider text-[#8b949e]">{formattedDate}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${tagColor}`}>
                            {tagText}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-start gap-4">
                          <h3 className="text-xl font-bold text-[#f0f6fc] leading-snug group-hover:text-[#ec4899] transition-colors cursor-pointer">
                            {log.message}
                          </h3>
                          <span className="text-[10px] font-bold text-[#8b949e] tracking-wider uppercase whitespace-nowrap mt-1">
                            ACTIVITY LOG ... +1
                          </span>
                        </div>
                        
                        {log.repoId && (
                          <div className="mt-3 text-sm text-[#8b949e]">
                            Related Repository: <span className="text-[#58a6ff] hover:underline cursor-pointer">{log.repoId.name}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* NEWSLETTER SUBSCRIPTION FOOTER */}
      <div className="bg-[#0d1117] py-24 border-t border-[#30363d] mt-20">
        <div className="mx-auto max-w-xl text-center px-4">
          <h2 className="text-3xl font-bold text-[#f0f6fc] mb-4">Subscribe to our developer newsletter</h2>
          <p className="text-[#8b949e] mb-8 text-sm">
            Discover tips, technical guides, and best practices in our biweekly newsletter just for devs.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email *" 
              className="flex-1 rounded-md border border-[#30363d] bg-[#010409] px-4 py-2.5 text-sm text-[#f0f6fc] focus:border-[#ec4899] focus:outline-none focus:ring-1 focus:ring-[#ec4899]"
            />
            <button className="rounded-md bg-[#238636] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#2ea043] transition-colors">
              Subscribe
            </button>
          </div>
          <p className="mt-6 text-[10px] text-[#8b949e] leading-relaxed">
            By submitting, I agree to let GitClone and its affiliates use my information for personalized communications, targeted advertising, and campaign effectiveness. See the <span className="text-[#58a6ff] hover:underline cursor-pointer">Privacy Statement</span> for more details.
          </p>
        </div>
      </div>
    </div>
  );
}
