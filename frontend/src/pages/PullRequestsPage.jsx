import React, { useEffect, useState } from 'react';
import PullRequestCard from '../components/PullRequestCard';
import { usePRSocket } from '../hooks/usePRSocket';

const PullRequestsPage = () => {
  const [pullRequests, setPullRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const repoId = window.location.pathname.split('/')[2]; // assuming /repo/:id/pull

  useEffect(() => {
    fetch(`/pr-api/${repoId}`)
      .then(res => res.json())
      .then(data => {
        setPullRequests(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, [repoId]);

  // realtime updates via socket
  usePRSocket(`repo:${repoId}`, (payload) => {
    if (payload.type === 'PR_CREATED') {
      setPullRequests(prev => [payload.data, ...prev]);
    }
    // handle other events as needed
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Pull Requests</h1>
      {loading ? (
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-3/4 mb-2" />
          <div className="h-6 bg-gray-300 rounded w-1/2" />
        </div>
      ) : (
        <div className="space-y-4">
          {pullRequests.map(pr => (
            <PullRequestCard key={pr._id} pr={pr} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PullRequestsPage;
