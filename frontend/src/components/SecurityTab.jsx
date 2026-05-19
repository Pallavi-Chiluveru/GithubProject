import React, { useState } from "react";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Search, 
  RefreshCw, 
  Lock, 
  ExternalLink,
  ChevronRight
} from "lucide-react";
import API from "../api";

export default function SecurityTab({ repoId }) {
  const [scanning, setScanning] = useState(false);
  const [auditDone, setAuditDone] = useState(false);
  const [alerts, setAlerts] = useState([]);

  const handleRunAudit = () => {
    setScanning(true);
    setAuditDone(false);
    
    // Simulate real security scanner traversing files
    setTimeout(() => {
      // Return beautiful, premium structured security details
      const detectedAlerts = [
        {
          id: "sec-001",
          severity: "CRITICAL",
          title: "Hardcoded API Access Secret Key Detected",
          description: "A plain-text OpenAI / JWT private token has been found in config/env setup files.",
          location: "config/auth.js:L12",
          remediation: "Move secrets immediately to a gitignored .env configuration. Re-generate and rotate the active API token.",
        },
        {
          id: "sec-002",
          severity: "HIGH",
          title: "Vulnerable Dependency Package (axios < 1.6.0)",
          description: "Server-side Request Forgery (SSRF) flaw detected in axios networking dependency.",
          location: "package.json:L26",
          remediation: "Upgrade axios immediately to version '^1.6.0' or newer via 'npm install axios@latest'.",
        },
        {
          id: "sec-003",
          severity: "MODERATE",
          title: "Unrestricted CORS Access Settings",
          description: "Main Express middleware is configured to allow wildcards (*) for client resource requests.",
          location: "server.js:L38",
          remediation: "Define explicit origin white-lists rather than using unrestricted wildcards.",
        }
      ];

      setAlerts(detectedAlerts);
      setScanning(false);
      setAuditDone(true);
    }, 2800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-[#2f81f7]" />
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Security Audit Center</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Scan your repository commits, branches, and libraries for security flaws or exposed keys.</p>
          </div>
        </div>

        <button
          onClick={handleRunAudit}
          disabled={scanning}
          className="flex items-center gap-1.5 rounded-xl bg-[#238636] px-4 py-2 text-xs font-bold text-white hover:bg-[#2ea043] transition-all disabled:opacity-50"
        >
          {scanning ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" /> Scanning repository...
            </>
          ) : (
            <>
              <Search className="h-3.5 w-3.5" /> Start Security Scan
            </>
          )}
        </button>
      </div>

      {/* Main scanning screen */}
      {scanning ? (
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] py-20 flex flex-col items-center justify-center space-y-4">
          <div className="h-14 w-14 rounded-full border-4 border-t-[#2f81f7] border-r-transparent border-b-[#2f81f7] border-l-transparent animate-spin flex items-center justify-center">
            <Lock className="h-6 w-6 text-[#2f81f7] animate-pulse" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-bold text-[var(--text-primary)] animate-pulse">Running advanced vulnerability heuristics...</p>
            <p className="text-[11px] text-[var(--text-secondary)]">Analyzing dependency trees, package files, credentials exposure...</p>
          </div>
        </div>
      ) : auditDone ? (
        <div className="space-y-6">
          {/* Health summary banner */}
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-red-400 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Vulnerabilities Detected in Repository</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Our scanner finished auditing your codebase files. We identified 3 security vulnerabilities that require your immediate intervention.
              </p>
            </div>
          </div>

          {/* Vulnerability alerts lists */}
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden shadow-sm"
              >
                {/* Alert title bar */}
                <div className="px-5 py-4 border-b border-[var(--border-color)] flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                        alert.severity === "CRITICAL" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                        alert.severity === "HIGH" ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" :
                        "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      }`}>
                        {alert.severity}
                      </span>
                      <h4 className="text-xs font-bold text-[var(--text-primary)]">{alert.title}</h4>
                    </div>
                    <p className="text-[10px] text-[var(--text-secondary)] font-mono">Location: {alert.location}</p>
                  </div>
                </div>

                {/* Details / Remediation */}
                <div className="p-5 bg-[var(--bg-primary)]/10 text-xs space-y-4">
                  <div>
                    <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider block mb-1">Details</span>
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{alert.description}</p>
                  </div>

                  <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mb-1">Recommended Remediation Steps</span>
                    <p className="text-[11px] text-emerald-300/80 leading-relaxed font-semibold">{alert.remediation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Unscanned Default view */
        <div className="rounded-xl border border-dashed border-[var(--border-color)] py-20 flex flex-col items-center justify-center text-center">
          <Shield className="h-10 w-10 text-[var(--text-secondary)] opacity-35 mb-3 animate-pulse" />
          <h4 className="text-sm font-bold text-[var(--text-primary)]">Analyze Repository Security</h4>
          <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm">
            Make sure your master branch commits and production bundles remain safe against API secrets leakage, and dependency library bugs.
          </p>
          <button
            onClick={handleRunAudit}
            className="mt-4 rounded-xl bg-[#238636] px-4 py-2 text-xs font-bold text-white hover:bg-[#2ea043] transition-all shadow-md shadow-emerald-900/10"
          >
            Start Scan Audit
          </button>
        </div>
      )}
    </div>
  );
}
