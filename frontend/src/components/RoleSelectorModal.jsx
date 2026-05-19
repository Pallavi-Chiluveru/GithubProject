import React, { useState } from "react";
import {
  ChevronDown, Check, X, Shield, Info, AlertTriangle,
  Settings, Users, Eye, PenTool, User, CheckCircle2, Circle
} from "lucide-react";
import { ROLE_CONFIGS, ROLES, CUSTOM_PERMISSIONS_LIST } from "../constants/rolesConfig";

export default function RoleSelectorModal({ user, onConfirm, onCancel }) {
  const [selectedRole, setSelectedRole] = useState(ROLES.COLLABORATOR);
  const [showCustom, setShowCustom] = useState(false);
  const [customPermissions, setCustomPermissions] = useState(
    CUSTOM_PERMISSIONS_LIST.reduce((acc, p) => ({ ...acc, [p.id]: false }), {})
  );

  const roleConfig = ROLE_CONFIGS[selectedRole];
  const Icon = roleConfig.icon;

  const handleToggleCustom = (id) => {
    setCustomPermissions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#30363d] flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                alt={user.username}
                className="h-14 w-14 rounded-full border-2 border-[#30363d]"
              />
              <div className="absolute -bottom-1 -right-1 bg-[#238636] rounded-full p-1 border-2 border-[#161b22]">
                <Check size={12} className="text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Invite {user.username}</h2>
              <p className="text-sm text-[#8b949e]">{user.email}</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-[#8b949e] hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Role Selection */}
          <div className="space-y-4">
            <label className="text-sm font-semibold text-white flex items-center gap-2">
              Select Role
              <div className="group relative">
                <Info size={14} className="text-[#8b949e] cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#8b949e] z-10">
                  Roles define what this user can do in your organization.
                </div>
              </div>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(ROLE_CONFIGS).map(([key, config]) => {
                const RoleIcon = config.icon;
                const isSelected = selectedRole === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedRole(key)}
                    className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all text-center gap-2 ${isSelected
                        ? "border-[#1f6feb] bg-[#1f6feb]/10"
                        : "border-[#30363d] bg-[#0d1117] hover:border-[#8b949e]"
                      }`}
                  >
                    <RoleIcon size={24} style={{ color: config.color }} />
                    <span className="text-sm font-medium text-white">{config.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Role Info & Permissions */}
          <div className="bg-[#0d1117] rounded-xl border border-[#30363d] overflow-hidden">
            <div className="p-4 border-b border-[#30363d] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon size={18} style={{ color: roleConfig.color }} />
                <span className="text-sm font-bold text-white uppercase tracking-wider">{roleConfig.title} Permissions</span>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-[#30363d] text-[#8b949e]">Default</span>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-sm text-[#8b949e] leading-relaxed">
                {roleConfig.description}
              </p>

              {roleConfig.warning && (
                <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                  <AlertTriangle size={18} className="text-red-500" />
                  <p className="text-xs font-medium text-red-400">{roleConfig.warning}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {roleConfig.permissions.map((perm) => (
                  <div key={perm.id} className="flex items-center gap-3">
                    {perm.allowed ? (
                      <CheckCircle2 size={16} className="text-[#3fb950]" />
                    ) : (
                      <Circle size={16} className="text-red-500/40" />
                    )}
                    <span className={`text-xs ${perm.allowed ? "text-[#c9d1d9]" : "text-[#8b949e] line-through"}`}>
                      {perm.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Custom Permissions Toggle */}
          <div className="space-y-4">
            <button
              onClick={() => setShowCustom(!showCustom)}
              className="flex items-center gap-2 text-sm font-semibold text-[#58a6ff] hover:underline"
            >
              {showCustom ? "Hide" : "Show"} Custom Permission Overrides
              <ChevronDown size={14} className={`transition-transform ${showCustom ? "rotate-180" : ""}`} />
            </button>

            {showCustom && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-[#0d1117] rounded-lg border border-[#30363d] animate-in slide-in-from-top-2 duration-200">
                {CUSTOM_PERMISSIONS_LIST.map((p) => (
                  <label key={p.id} className="flex items-center justify-between p-2 rounded hover:bg-[#161b22] cursor-pointer">
                    <span className="text-xs text-[#c9d1d9]">{p.label}</span>
                    <input
                      type="checkbox"
                      checked={customPermissions[p.id]}
                      onChange={() => handleToggleCustom(p.id)}
                      className="rounded border-[#30363d] bg-[#0d1117] text-[#1f6feb] focus:ring-offset-0 focus:ring-1 focus:ring-[#1f6feb]"
                    />
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#30363d] bg-[#0d1117] flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-sm font-semibold text-[#8b949e] hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedRole, customPermissions)}
            className="px-6 py-2 text-sm font-semibold text-white bg-[#238636] hover:bg-[#2ea043] rounded-md transition-all shadow-lg shadow-green-900/20"
          >
            Send Invitation
          </button>
        </div>
      </div>
    </div>
  );
}
