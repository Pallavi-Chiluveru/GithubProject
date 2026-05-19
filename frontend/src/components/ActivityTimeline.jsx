import React, { useState, useEffect } from 'react';
import { Book, GitPullRequest, CircleDot, UserPlus, GitCommit, Settings, Trash2 } from 'lucide-react';
import API from '../api';
import { motion } from 'framer-motion';

const ActivityTimeline = ({ username }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await API.get(`/activity-api/user/${username}`);
        const filteredActivities = (res.data || []).filter(log => log.action !== 'org_invite_sent');
        setActivities(filteredActivities);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setLoading(false);
      }
    };
    fetchActivities();
  }, [username]);

  const getActivityIcon = (action) => {
    switch (action) {
      case 'repo_created': return <Book size={16} className="text-[#8b949e]" />;
      case 'commit_pushed': return <GitCommit size={16} className="text-[#8b949e]" />;
      case 'issue_created': return <CircleDot size={16} className="text-[#8b949e]" />;
      case 'pr_opened': return <GitPullRequest size={16} className="text-[#8b949e]" />;
      case 'org_joined': return <UserPlus size={16} className="text-[#8b949e]" />;
      case 'repo_deleted': return <Trash2 size={16} className="text-[#f85149]" />;
      default: return <Settings size={16} className="text-[#8b949e]" />;
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-md animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-[var(--text-primary)]">Contribution activity</h3>

      {activities.length > 0 ? (
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-[15px] top-0 bottom-0 w-[2px] bg-[var(--border-color)]"></div>

          <div className="space-y-8">
            {activities.map((activity, i) => (
              <motion.div
                key={activity._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative pl-10"
              >
                {/* Icon Circle */}
                <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-[var(--bg-tertiary)] border-2 border-[var(--border-color)] flex items-center justify-center z-10 shadow-sm shadow-[var(--bg-primary)]">
                  {getActivityIcon(activity.action)}
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                      <span className="font-bold text-[var(--text-primary)]">{activity.message}</span>
                    </p>
                    {activity.repoId && (
                      <p className="text-xs text-[#8b949e] mt-1 hover:text-[#2f81f7] cursor-pointer inline-block">
                        {activity.repoId.name}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-[#8b949e] whitespace-nowrap">
                    {formatDate(activity.createdAt)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-10 border border-[var(--border-color)] border-dashed rounded-md bg-[var(--bg-tertiary)]">
          <p className="text-sm text-[var(--text-secondary)]">No recent activity recorded</p>
        </div>
      )}

      <button className="w-full py-1.5 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-md text-xs font-semibold hover:bg-[var(--bg-secondary)] transition-all text-[#2f81f7]">
        Show more activity
      </button>
    </div>
  );
};

export default ActivityTimeline;
