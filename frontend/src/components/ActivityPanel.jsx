import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import API from '../api';
import { formatDistanceToNow } from 'date-fns';

const ActivityPanel = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await API.get('/activity-api/');
        setActivities(response.data || []);
      } catch (err) {
        console.error('Error fetching activity:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  if (loading) {
    return (
      <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl p-6 transition-colors">
        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-6">Recent Activity</h3>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-[var(--border-color)] mt-2" />
              <div className="flex-1 space-y-2">
                <div className="h-2 bg-[var(--border-color)] rounded w-1/4" />
                <div className="h-3 bg-[var(--border-color)] rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl p-6 shadow-xl transition-colors">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-[var(--text-primary)]">Recent Activity</h3>
      </div>

      <div className="space-y-6 relative before:absolute before:left-[3px] before:top-2 before:bottom-2 before:w-[1px] before:bg-[var(--border-color)]">
        {activities.length > 0 ? (
          activities.map((log, index) => (
            <motion.div
              key={log._id || index}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="pl-6 relative group cursor-pointer"
            >
              <div className="absolute left-[-1.5px] top-1.5 w-[10px] h-[10px] rounded-full bg-[var(--border-color)] border-2 border-[var(--bg-tertiary)] group-hover:bg-[#2f81f7] transition-colors shadow-sm shadow-blue-500/20" />
              <span className="text-[11px] text-[var(--text-secondary)] block mb-1">
                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
              </span>
              <p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[#2f81f7] transition-colors leading-snug break-all">
                {log.message}
              </p>
              {log.repoId && (
                <span className="text-[10px] text-[#2f81f7] mt-1 block font-semibold hover:underline break-all">
                  {log.repoId.name}
                </span>
              )}
            </motion.div>
          ))
        ) : (
          <div className="pl-6 text-xs text-[var(--text-secondary)] italic py-4">
            No recent activity found. Start by creating a repository!
          </div>
        )}
      </div>

      <button className="mt-8 text-xs text-[var(--text-secondary)] hover:text-[#2f81f7] transition-colors flex items-center gap-1 group">
        View full activity log <span className="text-[10px] group-hover:translate-x-1 transition-transform">→</span>
      </button>
    </div>
  );
};

export default ActivityPanel;
