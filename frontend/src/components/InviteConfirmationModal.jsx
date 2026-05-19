import React from "react";
import { UserPlus, X, AlertCircle, Shield, Check, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InviteConfirmationModal({ user, role, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-[#161b22] border border-[#30363d] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-md overflow-hidden relative"
      >
        {/* Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-[#6366F1] to-transparent opacity-50" />
        
        <div className="p-8 text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-[#6366F1]/10 rounded-2xl flex items-center justify-center border border-[#6366F1]/20 relative">
            <UserPlus className="text-[#6366F1] h-10 w-10" />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#161b22] border border-[#30363d] rounded-full flex items-center justify-center shadow-lg">
              <Check size={14} className="text-[#10b981]" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-2xl font-black text-white tracking-tight">Send Invitation?</h3>
            <div className="text-sm text-[#9CA3AF] leading-relaxed">
              You are about to invite <span className="text-[#E5E7EB] font-bold underline decoration-[#6366F1]/30 underline-offset-4">{user.username}</span> to the organization with the <span className="px-2 py-0.5 rounded bg-[#6366F1]/10 text-[#6366F1] font-bold border border-[#6366F1]/20">{role}</span> role.
            </div>
          </div>

          <div className="bg-[#0d1117] rounded-2xl p-4 border border-[#30363d]/50 flex items-start gap-3 text-left">
            <Info size={16} className="text-[#6366F1] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#8b949e] leading-relaxed">
              The user will receive a notification and an email to accept this invitation. They can view the organization and repositories based on their assigned role.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={onConfirm}
              className="w-full py-4 bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold rounded-2xl transition-all shadow-xl shadow-[#6366F1]/20 active:scale-[0.98]"
            >
              Confirm and Send
            </button>
            <button
              onClick={onCancel}
              className="w-full py-4 text-[#8b949e] hover:text-white font-bold transition-colors text-sm"
            >
              Wait, I need to change something
            </button>
          </div>
        </div>
        
        <div className="bg-[#0d1117]/50 px-8 py-4 flex items-center justify-center gap-2 border-t border-[#30363d]">
          <Shield size={12} className="text-[#9CA3AF]" />
          <p className="text-[10px] text-[#8b949e] uppercase tracking-[0.2em] font-black">
            Secure Collaboration System
          </p>
        </div>
      </motion.div>
    </div>
  );
}

