import { useState, useEffect } from "react";
import API from "../api";
import { Mail, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Invitations() {
  const [orgInvitations, setOrgInvitations] = useState([]);
  const [repoInvitations, setRepoInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const [orgRes, repoRes] = await Promise.all([
        API.get(`/org-api/invites/my-invites`),
        API.get(`/collab-api/my-invites`)
      ]);
      setOrgInvitations(orgRes.data);
      setRepoInvitations(repoRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOrgRespond = async (inviteId, action) => {
    try {
      await API.post(`/org-api/respond-invite`, {
        inviteId,
        action
      });
      fetchInvitations();
    } catch (err) {
      alert(err.response?.data?.message || `Error ${action}ing organization invitation`);
    }
  };

  const handleRepoRespond = async (inviteId, action) => {
    try {
      await API.post(`/collab-api/${action}/${inviteId}`);
      fetchInvitations();
    } catch (err) {
      alert(err.response?.data?.message || `Error ${action}ing repository invitation`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] pt-6 font-sans">
      <div className="mx-auto max-w-4xl px-4">
        <div className="flex items-center justify-between mb-6 border-b border-[#30363d] pb-4">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Mail className="h-6 w-6" />
            Pending Invitations
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-[#58a6ff] border-r-transparent border-b-transparent border-l-transparent"></div>
          </div>
        ) : orgInvitations.length === 0 && repoInvitations.length === 0 ? (
          <div className="text-center py-20 text-[#8b949e] border border-[#30363d] rounded-md bg-[#010409]">
            <Mail className="mx-auto h-12 w-12 mb-4 opacity-20" />
            <h3 className="text-lg font-semibold mb-1 text-white">No pending invitations</h3>
            <p>You don't have any pending invitations at the moment.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {orgInvitations.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 text-white">Organization Invitations</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {orgInvitations.map((invite) => (
                    <div key={invite._id} className="border border-[#30363d] rounded-md bg-[#161b22] p-5">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-md bg-[#010409] border border-[#30363d] flex items-center justify-center font-bold text-xl">
                          {invite.organization?.logo ? <img src={invite.organization.logo} alt="" className="h-full w-full rounded-md" /> : invite.organization?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-lg">{invite.organization?.name}</h3>
                          <p className="text-sm text-[#8b949e]">Invited by <span className="font-semibold text-[#c9d1d9]">{invite.inviter?.username}</span></p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleOrgRespond(invite._id, "accept")}
                          className="flex-1 flex items-center justify-center gap-2 rounded-md bg-[#238636] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#2ea043] transition-colors"
                        >
                          <Check className="h-4 w-4" /> Accept
                        </button>
                        <button
                          onClick={() => handleOrgRespond(invite._id, "reject")}
                          className="flex-1 flex items-center justify-center gap-2 rounded-md bg-[#21262d] border border-[#30363d] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#30363d] transition-colors"
                        >
                          <X className="h-4 w-4" /> Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {repoInvitations.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 text-white">Repository Invitations</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {repoInvitations.map((invite) => (
                    <div key={invite._id} className="border border-[#30363d] rounded-md bg-[#161b22] p-5">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-md bg-[#010409] border border-[#30363d] flex items-center justify-center font-bold text-xl">
                          {invite.repoId?.name?.charAt(0).toUpperCase() || "R"}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-lg">{invite.repoId?.name}</h3>
                          <p className="text-sm text-[#8b949e]">Role: <span className="font-semibold text-[#c9d1d9]">{invite.role}</span></p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleRepoRespond(invite._id, "accept")}
                          className="flex-1 flex items-center justify-center gap-2 rounded-md bg-[#238636] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#2ea043] transition-colors"
                        >
                          <Check className="h-4 w-4" /> Accept
                        </button>
                        <button
                          onClick={() => handleRepoRespond(invite._id, "reject")}
                          className="flex-1 flex items-center justify-center gap-2 rounded-md bg-[#21262d] border border-[#30363d] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#30363d] transition-colors"
                        >
                          <X className="h-4 w-4" /> Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
