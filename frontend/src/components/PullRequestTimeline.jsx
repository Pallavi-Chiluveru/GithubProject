import { motion } from "framer-motion";
import { GitCommit, MessageSquare, GitPullRequest, CheckCircle2, XCircle, UserPlus, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function PullRequestTimeline({ pr, reviews, comments, commits }) {
  // Combine all activities into a single timeline
  const activities = [
    {
      type: "created",
      user: pr.createdBy,
      timestamp: new Date(pr.createdAt),
      icon: <GitPullRequest size={14} className="text-emerald-500" />,
      text: "opened this pull request"
    },
    ...commits.map(c => ({
      type: "commit",
      user: c.author,
      timestamp: new Date(c.createdAt),
      icon: <GitCommit size={14} className="text-slate-400" />,
      text: `pushed commit ${c.hash?.substring(0, 7) || "abc1234"}`,
      message: c.message
    })),
    ...reviews.map(r => ({
      type: "review",
      user: r.reviewer,
      timestamp: new Date(r.createdAt),
      icon: r.reviewType === "approve" ? <CheckCircle2 size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-red-500" />,
      text: `${r.reviewType}ed this pull request`,
      comment: r.message
    })),
    ...comments.filter(c => c.fileName === "general").map(c => ({
      type: "comment",
      user: c.createdBy,
      timestamp: new Date(c.createdAt),
      icon: <MessageSquare size={14} className="text-slate-400" />,
      text: "commented",
      comment: c.comment
    }))
  ].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <div className="relative space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[var(--border-color)]">
      {activities.map((activity, idx) => (
        <motion.div 
          key={idx}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative pl-10"
        >
          <div className="absolute left-0 top-1 p-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-full z-10">
            {activity.icon}
          </div>
          
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs">
              <img 
                src={activity.user?.profileImageUrl || `https://ui-avatars.com/api/?name=${activity.user?.username || "U"}&background=random`} 
                className="h-5 w-5 rounded-full border border-[var(--border-color)]"
              />
              <span className="font-bold text-[var(--text-primary)]">{activity.user?.username || "unknown"}</span>
              <span className="text-[var(--text-secondary)]">{activity.text}</span>
              <span className="text-[var(--text-secondary)] flex items-center gap-1">
                <Clock size={10} /> {formatDistanceToNow(activity.timestamp)} ago
              </span>
            </div>
            
            {activity.message && (
              <div className="mt-1 p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-xs font-mono text-[var(--text-secondary)]">
                {activity.message}
              </div>
            )}
            
            {activity.comment && (
              <div className="mt-1 p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl text-sm text-[var(--text-primary)] shadow-sm">
                {activity.comment}
              </div>
            )}
          </div>
        </motion.div>
      ))}
      
      {pr.status === "merged" && (
        <div className="relative pl-10">
          <div className="absolute left-0 top-1 p-1 bg-purple-500 rounded-full z-10 text-white">
            <GitPullRequest size={14} />
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
            <span>Merged</span>
            <span className="text-[var(--text-secondary)] font-normal">into</span>
            <span className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] rounded font-mono">{pr.targetBranch}</span>
          </div>
        </div>
      )}
    </div>
  );
}
