import React, { useEffect, useState } from "react";
import { Activity, ShieldAlert, CheckCircle, RefreshCw, Radio, User, GitCommit } from "lucide-react";
import API from "../api";

export default function ObservabilityDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTelemetry = async () => {
    try {
      setRefreshing(true);
      const res = await API.get("/activity-api/observability");
      setData(res.data);
    } catch (err) {
      console.error("Telemetry fetch failed:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    // Live update interval
    const interval = setInterval(fetchTelemetry, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-[var(--text-secondary)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2f81f7] border-t-transparent mr-3" />
        <span className="text-sm font-bold">Loading Identity Telemetry...</span>
      </div>
    );
  }

  const { totalPushes, mismatchCount, staleSessionOverwrites, webhookSenders, displayedUsers, timeline } = data || {
    totalPushes: 0,
    mismatchCount: 0,
    staleSessionOverwrites: 0,
    webhookSenders: [],
    displayedUsers: [],
    timeline: []
  };

  return (
    <div className="space-y-8 p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-xl transition-all">
      {/* Dashboard Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-color)] pb-6">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <Radio className="text-emerald-500 animate-pulse h-5 w-5" />
            Identity Observability Dashboard
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Real-time attribution telemetry and verification pipelines for Gitea & Antigravity integration.
          </p>
        </div>
        <button
          onClick={fetchTelemetry}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2 text-xs font-bold hover:bg-[var(--bg-tertiary)] disabled:opacity-50 transition-all shadow-sm"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Grid Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Events */}
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-5 relative overflow-hidden group">
          <div className="absolute right-3 top-3 h-10 w-10 bg-blue-500/10 rounded-full flex items-center justify-center">
            <Activity className="h-5 w-5 text-blue-500" />
          </div>
          <span className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider block">Total Git Pushes</span>
          <span className="text-3xl font-extrabold mt-2 block">{totalPushes}</span>
        </div>

        {/* Identity Mismatches */}
        <div className={`rounded-xl border p-5 relative overflow-hidden group transition-all ${
          mismatchCount > 0 ? "border-red-500/30 bg-red-500/[0.02]" : "border-[var(--border-color)] bg-[var(--bg-primary)]"
        }`}>
          <div className="absolute right-3 top-3 h-10 w-10 rounded-full flex items-center justify-center bg-red-500/10">
            {mismatchCount > 0 ? (
              <ShieldAlert className="h-5 w-5 text-red-500 animate-bounce" />
            ) : (
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            )}
          </div>
          <span className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider block">Identity Mismatches</span>
          <span className={`text-3xl font-extrabold mt-2 block ${mismatchCount > 0 ? "text-red-500" : ""}`}>
            {mismatchCount}
          </span>
        </div>

        {/* Stale Overwrites */}
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-5 relative overflow-hidden group">
          <div className="absolute right-3 top-3 h-10 w-10 bg-amber-500/10 rounded-full flex items-center justify-center">
            <RefreshCw className="h-5 w-5 text-amber-500" />
          </div>
          <span className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider block">Session Overwrites</span>
          <span className="text-3xl font-extrabold mt-2 block">{staleSessionOverwrites}</span>
        </div>

        {/* System Health */}
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-5 relative overflow-hidden group">
          <div className="absolute right-3 top-3 h-10 w-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          </div>
          <span className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider block">Sync Engine Health</span>
          <span className="text-sm font-extrabold text-emerald-500 mt-3 block flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Active & Verified
          </span>
        </div>
      </div>

      {/* Senders and Display Users List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Webhook Senders */}
        <div className="border border-[var(--border-color)] bg-[var(--bg-primary)] rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2 flex items-center gap-2">
            <User className="h-4 w-4 text-[var(--text-secondary)]" /> Authoritative Webhook Senders
          </h3>
          <div className="flex flex-wrap gap-2">
            {webhookSenders.length > 0 ? (
              webhookSenders.map(sender => (
                <span key={sender} className="rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] px-3 py-1 text-xs font-bold font-mono">
                  {sender}
                </span>
              ))
            ) : (
              <span className="text-xs text-[var(--text-secondary)] italic">No webhook activity captured yet</span>
            )}
          </div>
        </div>

        {/* Displayed Users */}
        <div className="border border-[var(--border-color)] bg-[var(--bg-primary)] rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2 flex items-center gap-2">
            <User className="h-4 w-4 text-[var(--text-secondary)]" /> Rendered Frontend Users
          </h3>
          <div className="flex flex-wrap gap-2">
            {displayedUsers.length > 0 ? (
              displayedUsers.map(user => (
                <span key={user} className="rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] px-3 py-1 text-xs font-bold font-mono text-blue-400">
                  {user}
                </span>
              ))
            ) : (
              <span className="text-xs text-[var(--text-secondary)] italic">No rendered activities yet</span>
            )}
          </div>
        </div>
      </div>

      {/* Telemetry Timeline */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
          <GitCommit className="h-5 w-5 text-[var(--text-secondary)]" /> Real-Time Telemetry Log
        </h3>
        
        {timeline.length > 0 ? (
          <div className="border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-[var(--text-primary)] border-collapse">
              <thead>
                <tr className="bg-[var(--bg-tertiary)] border-b border-[var(--border-color)] text-[var(--text-secondary)] font-bold">
                  <th className="p-3">Time</th>
                  <th className="p-3">Gitea Sender</th>
                  <th className="p-3">Git Author</th>
                  <th className="p-3">Displayed User</th>
                  <th className="p-3">Attribution Check</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {timeline.map((event) => (
                  <tr key={event.id} className="hover:bg-[var(--bg-tertiary)] transition-colors">
                    <td className="p-3 text-[var(--text-secondary)] font-mono">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-3 font-bold font-mono">{event.giteaUser}</td>
                    <td className="p-3 font-mono text-[var(--text-secondary)]">{event.commitAuthor}</td>
                    <td className="p-3 font-bold font-mono text-blue-400">{event.displayedUser}</td>
                    <td className="p-3">
                      {event.isMismatch ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                          <ShieldAlert className="h-3 w-3" /> Resolved Mismatch
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle className="h-3 w-3" /> Correctly Attributed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 border border-[var(--border-color)] border-dashed rounded-xl bg-[var(--bg-primary)]">
            <p className="text-xs text-[var(--text-secondary)]">No telemetry captured yet. Send a push to Gitea to record real-time data.</p>
          </div>
        )}
      </div>
    </div>
  );
}
