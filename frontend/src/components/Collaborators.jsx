import { useEffect, useState } from "react";
import API from "../api";
import { useParams } from "react-router-dom";

export default function Collaborators() {
  const { id: repoId } = useParams(); // repository id
  const [collaborations, setCollaborations] = useState([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [repo, setRepo] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const fetchRepoAndUser = async () => {
    try {
      const repoRes = await API.get(`/repo-api/${repoId}`);
      setRepo(repoRes.data);
      
      const user = JSON.parse(localStorage.getItem("user"));
      setCurrentUser(user);
    } catch (err) {
      console.error("Error fetching repo/user", err);
    }
  };

  const fetchCollaborations = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/collab-api/repo/${repoId}`);
      setCollaborations(res.data);
    } catch (err) {
      setError("Failed to fetch collaborators");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchEmail) return;
    setError("");
    setSearchResult(null);
    try {
      const res = await API.get(`/user-api/search/${searchEmail}`);
      setSearchResult(res.data);
    } catch (err) {
      setError("User not found");
    }
  };

  const sendInvitation = async () => {
    try {
      await API.post(`/collab-api/invite/${repoId}`, {
        email: searchResult.email,
        role: "collaborator"
      });
      setSearchResult(null);
      setSearchEmail("");
      fetchCollaborations();
      alert("Invitation sent!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send invitation");
    }
  };

  const removeCollaborator = async (collabId) => {
    if (!window.confirm("Are you sure you want to remove this collaborator?")) return;
    try {
      await API.delete(`/collab-api/${collabId}`);
      fetchCollaborations();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove collaborator");
    }
  };

  useEffect(() => {
    fetchRepoAndUser();
    fetchCollaborations();
  }, [repoId]);

  const isOwner = repo && currentUser && repo.owner?._id === currentUser?._id;

  return (
    <div className="max-w-5xl mx-auto p-8 text-slate-200">
      <div className="mb-10 pb-6 border-b border-slate-800">
        <h2 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-2">
          Collaborators
        </h2>
        <p className="text-slate-400 text-lg">Manage who can access and contribute to this repository.</p>
      </div>

      {isOwner && (
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-8 mb-12 shadow-2xl">
          <h3 className="text-xl font-semibold mb-6 text-white">Invite a Collaborator</h3>
          <div className="flex gap-4 mb-6">
            <input
              type="email"
              placeholder="Search by email..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <button 
              onClick={handleSearch} 
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Search
            </button>
          </div>

          {searchResult && (
            <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {(searchResult.username || searchResult.name || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-white">{searchResult.username || searchResult.name}</p>
                  <p className="text-sm text-slate-400">{searchResult.email}</p>
                </div>
              </div>
              <button 
                onClick={sendInvitation}
                className="border border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white px-4 py-2 rounded-lg font-semibold transition-all"
              >
                Invite
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-semibold mb-4 text-white">Current Collaborators & Requests</h3>
        {loading ? (
          <div className="animate-pulse text-slate-500 py-10 text-center">Loading collaborators...</div>
        ) : collaborations.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/20 rounded-2xl border-2 border-dashed border-slate-800 text-slate-500">
            No collaborators yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {collaborations.map((collab) => (
              <div key={collab._id} className="flex items-center justify-between bg-slate-900/30 p-5 rounded-xl border border-slate-800 hover:border-slate-700 hover:bg-slate-900/50 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:shadow-lg group-hover:shadow-blue-500/10 transition-all">
                    {(collab.user?.username || collab.user?.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{collab.user?.username || collab.user?.name || "Unknown User"}</p>
                    <p className="text-sm text-slate-400">{collab.user?.email}</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mt-2 border ${
                      collab.status === 'accepted' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      collab.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                      'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {collab.status}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {isOwner && (
                     <button 
                      onClick={() => removeCollaborator(collab._id)}
                      className="text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
                     >
                      Remove
                     </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}