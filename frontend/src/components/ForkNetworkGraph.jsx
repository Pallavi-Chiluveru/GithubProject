import React, { useEffect, useState } from "react";
import { GitBranch, RefreshCw } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import API from "../api";

export default function ForkNetworkGraph() {
  const { id } = useParams();
  const [network, setNetwork] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNetwork = async () => {
      try {
        const res = await API.get(`/repo-api/${id}/network`);
        setNetwork(res.data.root);
      } catch (err) {
        console.error("Error fetching network:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNetwork();
  }, [id]);

  const renderNode = (node) => {
    return (
      <div key={node.id} className="pl-8 border-l border-[var(--border-color)] relative mt-4">
        {/* Horizontal branch line */}
        <div className="absolute left-0 top-6 w-6 h-px bg-[var(--border-color)]" />
        
        <div className="flex items-center gap-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-3 shadow-sm hover:border-[#2f81f7] transition-all max-w-md">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#2f81f7] to-[#1f6feb] flex items-center justify-center text-white shrink-0 font-bold text-sm">
            {node.owner?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <Link to={`/repo/${node.id}`} className="text-sm font-bold text-[var(--text-primary)] hover:text-[#2f81f7] hover:underline truncate block">
              {node.fullName}
            </Link>
            <span className="text-[10px] text-[var(--text-secondary)]">
              {node.isRoot ? "Upstream Repository" : "Forked Repository"}
            </span>
          </div>
        </div>

        {node.children && node.children.length > 0 && (
          <div className="space-y-1">
            {node.children.map(child => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl">
        <RefreshCw className="h-8 w-8 animate-spin text-[#2f81f7] mb-2" />
        <p className="text-xs text-[var(--text-secondary)]">Loading fork network...</p>
      </div>
    );
  }

  if (!network) {
    return (
      <div className="text-center p-8 text-sm text-[var(--text-secondary)] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl">
        Could not load fork network.
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 shadow-xl">
      <h3 className="text-base font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
        <GitBranch className="h-5 w-5 text-[#2f81f7]" />
        Repository Fork Network
      </h3>
      <div className="overflow-x-auto pb-4">
        <div className="pl-2">
          {/* Root node */}
          <div className="flex items-center gap-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl p-3 shadow-md hover:border-[#2f81f7] transition-all max-w-md">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#f78166] to-[#d85e43] flex items-center justify-center text-white shrink-0 font-bold text-sm">
              {network.owner?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <Link to={`/repo/${network.id}`} className="text-sm font-bold text-[var(--text-primary)] hover:text-[#2f81f7] hover:underline truncate block">
                {network.fullName}
              </Link>
              <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Root Upstream</span>
            </div>
          </div>
          
          {network.children && network.children.length > 0 && (
            <div className="space-y-1">
              {network.children.map(child => renderNode(child))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
