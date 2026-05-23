import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Info, MessageSquare, UserPlus, GitPullRequest, GitCommit, GitBranch, GitMerge, FolderGit } from "lucide-react";

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export default function NotificationProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [toasts, setToasts] = useState([]);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!user._id) return;

    const newSocket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:5000", {
      withCredentials: true
    });

    newSocket.on("connect", () => {
      console.log("Socket connected");
      newSocket.emit("join", `user:${user._id}`);
    });

    // ─── Existing notification system ────────────────────────────────────────────
    newSocket.on("notification", (notif) => {
      addToast(notif);
    });

    // ─── Gitea real-time Git events ───────────────────────────────────────────────
    newSocket.on("commit_pushed", (data) => {
      const { branch, commitCount, author, username, lastMessage } = data;
      const displayUser = username || author || "Guest";

      console.log({
        stage: "socket_event_notification_received",
        giteaUser: username || author || null,
        repoOwner: null,
        commitAuthor: author || null,
        webhookSender: username || author || null,
        socketRoomUser: newSocket.id,
        frontendUser: displayUser
      });

      addToast({
        type: "GIT_PUSH",
        message: `${displayUser} pushed ${commitCount} commit(s) to ${branch}: "${lastMessage}"`,
      });
    });

    newSocket.on("branch_created", ({ branch, author }) => {
      addToast({
        type: "BRANCH_CREATED",
        message: `${author} created branch "${branch}"`,
      });
    });

    newSocket.on("branch_deleted", ({ branch, author }) => {
      addToast({
        type: "BRANCH_DELETED",
        message: `${author} deleted branch "${branch}"`,
      });
    });

    newSocket.on("pr_created", ({ prNumber, title, author }) => {
      addToast({
        type: "PR_CREATED",
        message: `${author} opened PR #${prNumber}: "${title}"`,
      });
    });

    newSocket.on("pr_merged", ({ prNumber, title }) => {
      addToast({
        type: "PR_MERGED",
        message: `PR #${prNumber} "${title}" was merged! 🎉`,
      });
    });

    newSocket.on("pr_closed", ({ prNumber, title }) => {
      addToast({
        type: "PR_REVIEW",
        message: `PR #${prNumber} "${title}" was closed.`,
      });
    });

    newSocket.on("repo_created", ({ name, owner }) => {
      addToast({
        type: "REPO_CREATED",
        message: `New repository "${name}" created by ${owner}.`,
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.off("commit_pushed");
      newSocket.off("branch_created");
      newSocket.off("branch_deleted");
      newSocket.off("pr_created");
      newSocket.off("pr_merged");
      newSocket.off("pr_closed");
      newSocket.off("repo_created");
      newSocket.close();
    };
  }, [user._id]);



  const addToast = (notif) => {
    const id = Date.now();
    setToasts(prev => [...prev, { ...notif, toastId: id }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.toastId !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case "MENTION":        return <MessageSquare className="text-blue-400" size={18} />;
      case "REPLY":          return <MessageSquare className="text-emerald-400" size={18} />;
      case "TEAM_INVITE":    return <UserPlus className="text-purple-400" size={18} />;
      case "PR_REVIEW":      return <GitPullRequest className="text-amber-400" size={18} />;
      // ─── Gitea event icons ────────────────────────────────────────────────────
      case "GIT_PUSH":       return <GitCommit className="text-green-400" size={18} />;
      case "BRANCH_CREATED": return <GitBranch className="text-cyan-400" size={18} />;
      case "BRANCH_DELETED": return <GitBranch className="text-red-400" size={18} />;
      case "PR_CREATED":     return <GitPullRequest className="text-blue-400" size={18} />;
      case "PR_MERGED":      return <GitMerge className="text-purple-400" size={18} />;
      case "REPO_CREATED":   return <FolderGit className="text-orange-400" size={18} />;
      default:               return <Bell className="text-slate-400" size={18} />;
    }
  };


  return (
    <NotificationContext.Provider value={{ socket, addToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.toastId}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className="pointer-events-auto w-80 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden flex items-stretch"
            >
              <div className="w-1.5 bg-[#1f6feb]" />
              <div className="flex-1 p-4 flex items-start gap-3">
                <div className="mt-0.5 p-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl">
                  {getIcon(toast.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--text-primary)] line-clamp-2">
                    {toast.message}
                  </p>
                  <button className="text-[10px] text-[#2f81f7] hover:underline font-bold mt-1 uppercase tracking-wider">
                    View Details
                  </button>
                </div>
                <button 
                  onClick={() => removeToast(toast.toastId)}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}
