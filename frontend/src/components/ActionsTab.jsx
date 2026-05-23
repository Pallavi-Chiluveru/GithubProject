import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Terminal, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RotateCw, 
  ExternalLink,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import API from "../api";

export default function ActionsTab({ repoId }) {
  const [runs, setRuns] = useState([]);
  const [activeRun, setActiveRun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const logTerminalRef = useRef(null);

  const fetchRuns = async () => {
    try {
      const res = await API.get(`/workflow-api/${repoId}`);
      setRuns(res.data);
      
      // If we are currently viewing a run, sync its status & logs
      if (activeRun) {
        const synced = res.data.find(r => r._id === activeRun._id);
        if (synced) setActiveRun(synced);
      }
    } catch (err) {
      console.error("Failed to fetch workflow runs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
    // Poll runs while there is any active "queued" or "running" run
    const interval = setInterval(() => {
      fetchRuns();
    }, 2000);

    return () => clearInterval(interval);
  }, [repoId, activeRun?._id]);

  const handleTriggerWorkflow = async () => {
    setTriggering(true);
    try {
      const res = await API.post(`/workflow-api/${repoId}/trigger`, {
        workflowName: "CodeForge Build & Test Suite",
        workflowFile: ".github/workflows/build-test.yml"
      });
      // Add immediately to local runs list
      setRuns([res.data.run, ...runs]);
      setActiveRun(res.data.run);
    } catch (err) {
      console.error("Failed to trigger workflow:", err);
    } finally {
      setTriggering(false);
    }
  };

  // Scroll to bottom of terminal when logs change
  useEffect(() => {
    if (logTerminalRef.current) {
      logTerminalRef.current.scrollTop = logTerminalRef.current.scrollHeight;
    }
  }, [activeRun?.logs, activeRun?.status]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2f81f7] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div className="flex items-center gap-3">
          <Terminal className="h-5 w-5 text-[#2f81f7]" />
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Actions (CI/CD Pipelines)</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Automate, build, test, and deploy code right from your repository.</p>
          </div>
        </div>

        <button
          onClick={handleTriggerWorkflow}
          disabled={triggering}
          className="flex items-center gap-1.5 rounded-xl bg-[#238636] px-4 py-2 text-xs font-bold text-white hover:bg-[#2ea043] transition-all disabled:opacity-50"
        >
          <Play className="h-3.5 w-3.5 fill-white" /> {triggering ? "Queueing Job..." : "Run Workflow"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Runs list */}
        <div className="lg:col-span-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[var(--border-color)]">
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">All Pipeline Runs</h3>
          </div>

          <div className="divide-y divide-[var(--border-color)] max-h-[500px] overflow-y-auto">
            {runs.length > 0 ? (
              runs.map((run) => (
                <button
                  key={run._id}
                  onClick={() => setActiveRun(run)}
                  className={`w-full flex items-start gap-3 p-4 text-left hover:bg-[var(--bg-tertiary)] transition-all ${
                    activeRun?._id === run._id ? "bg-[#2f81f7]/5 border-l-2 border-[#2f81f7]" : ""
                  }`}
                >
                  <div className="mt-0.5">
                    {run.status === "success" && <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />}
                    {run.status === "failed" && <XCircle className="h-4.5 w-4.5 text-red-400" />}
                    {run.status === "running" && <RotateCw className="h-4.5 w-4.5 text-[#2f81f7] animate-spin" />}
                    {run.status === "queued" && <Clock className="h-4.5 w-4.5 text-slate-500 animate-pulse" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[var(--text-primary)] truncate">{run.name}</p>
                    <p className="text-[10px] text-[var(--text-secondary)] font-mono truncate mt-0.5">
                      {run.workflowFile} • sha-{run.commitSha?.substring(0, 7) || "local"}
                    </p>
                    <p className="text-[9px] text-slate-500 mt-1">
                      {new Date(run.createdAt).toLocaleString()}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500 italic text-xs">
                No workflows triggered yet. Click "Run Workflow" to execute your first pipeline.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Log console terminal */}
        <div className="lg:col-span-2 flex flex-col rounded-xl border border-[var(--border-color)] bg-[#0d1117] overflow-hidden min-h-[450px]">
          {activeRun ? (
            <>
              {/* Terminal Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                  </div>
                  <span className="text-[11px] font-mono text-[#8b949e] ml-2">bash - runners/node-{activeRun.status}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    activeRun.status === "success" ? "bg-emerald-500/10 text-emerald-400" :
                    activeRun.status === "failed" ? "bg-red-500/10 text-red-400" :
                    activeRun.status === "running" ? "bg-[#2f81f7]/10 text-[#2f81f7]" : "bg-slate-500/10 text-slate-400"
                  }`}>
                    {activeRun.status}
                  </span>
                </div>
              </div>

              {/* Console logs output */}
              <div 
                ref={logTerminalRef}
                className="flex-1 p-4 font-mono text-xs text-[#c9d1d9] bg-[#090d13] overflow-y-auto max-h-[500px] leading-relaxed whitespace-pre-wrap selection:bg-[#2f81f7]/30"
              >
                {activeRun.logs}
                {activeRun.status === "running" && (
                  <span className="inline-block w-1.5 h-4 bg-[#c9d1d9] ml-1 animate-pulse"></span>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <Terminal className="h-10 w-10 text-slate-700 mb-3" />
              <h4 className="text-xs font-bold text-slate-400">Select a pipeline run</h4>
              <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                Click on any workflow execution on the left panel to inspect real-time server output, compilation times, and deployments.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
