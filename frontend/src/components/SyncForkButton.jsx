import React, { useState, useRef, useEffect } from "react";
import { RefreshCw, ChevronDown, CheckCircle, AlertTriangle } from "lucide-react";
import API from "../api";
import { useNotifications } from "./NotificationProvider";

export default function SyncForkButton({ repo, onSyncComplete }) {
  const { addToast } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setIsOpen(false);
    try {
      addToast({
        type: "GIT_PUSH",
        message: "Starting fork synchronization with upstream..."
      });
      
      const res = await API.post(`/repo-api/${repo._id}/sync`);
      
      addToast({
        type: "GIT_PUSH",
        message: "Fork synced successfully! 🎉"
      });
      
      if (onSyncComplete) onSyncComplete();
    } catch (err) {
      console.error(err);
      addToast({
        type: "BRANCH_DELETED",
        message: err.response?.data?.message || "Failed to sync fork repository."
      });
    } finally {
      setSyncing(false);
    }
  };

  const upstreamOwner = repo.forkedFromRepoId?.owner?.username || "upstream";
  const upstreamName = repo.forkedFromRepoId?.name || "repo";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={syncing}
        className="flex items-center gap-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-2 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all disabled:opacity-50"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin text-[#2f81f7]" : "text-[var(--text-secondary)]"}`} />
        <span>{syncing ? "Syncing..." : "Sync fork"}</span>
        <ChevronDown className="h-3 w-3 text-[var(--text-secondary)]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <h4 className="text-xs font-bold text-[var(--text-primary)] mb-2 flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            Sync from upstream repository
          </h4>
          <p className="text-[11px] text-[var(--text-secondary)] mb-4">
            Update your fork by merging the latest changes from{" "}
            <span className="font-semibold text-[var(--text-primary)]">
              {upstreamOwner}/{upstreamName}
            </span>.
          </p>
          <button
            onClick={handleSync}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white py-2 text-xs font-bold shadow-sm transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Update branch
          </button>
        </div>
      )}
    </div>
  );
}
