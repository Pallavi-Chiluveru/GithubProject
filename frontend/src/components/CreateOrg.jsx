import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Check, Info, Headphones, Search, X, UserPlus, Building, Shield, Settings, Users, Book, Clock } from "lucide-react";
import API from "../api";
import RoleSelectorModal from "./RoleSelectorModal";
import InviteConfirmationModal from "./InviteConfirmationModal";
import { ROLE_CONFIGS } from "../constants/rolesConfig";

export default function CreateOrg() {
  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [belongsTo, setBelongsTo] = useState("personal");
  const [acceptedToS, setAcceptedToS] = useState(false);
  const [createdOrgId, setCreatedOrgId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [invitedUsers, setInvitedUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // New Invite Flow States
  const [selectedUserForInvite, setSelectedUserForInvite] = useState(null);
  const [pendingRole, setPendingRole] = useState(null);
  const [pendingCustomPermissions, setPendingCustomPermissions] = useState(null);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim()) {
        searchUsers();
      } else {
        setSearchResults([]);
      }
    }, 150);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const searchUsers = async () => {
    setIsSearching(true);
    try {
      const res = await API.get(`/user-api/find?query=${searchTerm}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    if (!orgName || !email || !acceptedToS) {
      alert("Please fill all required fields and accept the Terms of Service.");
      return;
    }

    try {
      const res = await API.post("/org-api/create", {
        name: orgName,
        description: "",
        logo: ""
      });
      setCreatedOrgId(res.data.org._id);
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create organization");
    }
  };

  const handleInviteInitiate = (invitee) => {
    if (invitedUsers.find(u => u._id === invitee._id)) return;
    setSelectedUserForInvite(invitee);
    setShowRoleSelector(true);
  };

  const handleRoleSelected = (role, customPerms) => {
    setPendingRole(role);
    setPendingCustomPermissions(customPerms);
    setShowRoleSelector(false);
    setShowConfirmation(true);
  };

  const handleInviteConfirm = async () => {
    try {
      const res = await API.post(`/org-api/invite`, {
        orgId: createdOrgId,
        usernameOrEmail: selectedUserForInvite.email,
        role: pendingRole,
        customPermissions: pendingCustomPermissions,
        invitedBy: user._id
      });

      setInvitedUsers([...invitedUsers, {
        ...selectedUserForInvite,
        role: pendingRole,
        invitedAt: new Date().toISOString()
      }]);

      // Reset flow
      setShowConfirmation(false);
      setSelectedUserForInvite(null);
      setPendingRole(null);
      setPendingCustomPermissions(null);
      setSearchTerm("");
      setSearchResults([]);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send invitation");
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans pb-20">
      {/* Step Header */}
      <div className="border-b border-[#30363d] bg-[#161b22] py-8">
        <div className="mx-auto max-w-3xl px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${step >= 1 ? "border-[#1f6feb] bg-[#1f6feb] text-white" : "border-[#30363d] text-[#8b949e]"}`}>
                1
              </div>
              <div className={`h-[2px] w-12 ${step >= 2 ? "bg-[#1f6feb]" : "bg-[#30363d]"}`} />
              <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${step >= 2 ? "border-[#1f6feb] bg-[#1f6feb] text-white" : "border-[#30363d] text-[#8b949e]"}`}>
                2
              </div>
            </div>
            <p className="text-sm text-[#8b949e]">Step {step} of 2</p>
          </div>
          <h1 className="text-3xl font-bold text-white">
            {step === 1 ? "Set up your organization" : "Invite members"}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 pt-10">
        {step === 1 ? (
          <form onSubmit={handleCreateOrg} className="space-y-8">
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-white">
                Organization name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. My Awesome Organization"
                className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-4 py-2 text-sm text-[#e6edf3] focus:border-[#1f6feb] focus:outline-none focus:ring-1 focus:ring-[#1f6feb]"
              />
              <p className="text-xs text-[#8b949e]">
                This will be the name of your organization on RepoSphere.
              </p>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-white">
                Contact email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-4 py-2 text-sm text-[#e6edf3] focus:border-[#1f6feb] focus:outline-none focus:ring-1 focus:ring-[#1f6feb]"
              />
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold text-white">This organization belongs to:</p>
              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="belongsTo"
                    checked={belongsTo === "personal"}
                    onChange={() => setBelongsTo("personal")}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white group-hover:text-[#58a6ff]">My personal account</p>
                    <p className="text-xs text-[#8b949e]">i.e., {user?.username || "Guest"} ({user?.email || "user@example.com"})</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="belongsTo"
                    checked={belongsTo === "business"}
                    onChange={() => setBelongsTo("business")}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white group-hover:text-[#58a6ff]">A business or institution</p>
                    <p className="text-xs text-[#8b949e]">This organization will be owned by your business.</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-[#30363d]">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedToS}
                  onChange={(e) => setAcceptedToS(e.target.checked)}
                  className="mt-1"
                />
                <p className="text-sm text-[#8b949e]">
                  I am happy to receive occasional marketing emails from RepoSphere. I can unsubscribe at any time. By clicking "Next", you agree to the <span className="text-[#58a6ff] hover:underline">RepoSphere Customer Agreement</span>.
                </p>
              </label>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="rounded-md bg-[#238636] px-6 py-2 text-sm font-semibold text-white hover:bg-[#2ea043] transition-colors shadow-sm"
              >
                Next
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 flex items-start gap-4">
              <div className="bg-[#238636]/20 p-2 rounded-md">
                <Check className="h-6 w-6 text-[#238636]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Organization created!</h2>
                <p className="text-sm text-[#8b949e]">
                  Now invite your team members to start collaborating. You can also do this later from organization settings.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-white">
                Search by username or email address
              </label>
              <div className="relative">
                <div className="flex items-center absolute inset-y-0 left-3 pointer-events-none">
                  <Search size={18} className="text-[#8b949e]" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="e.g. monalisa, lisa@github.com"
                  className="w-full rounded-md border border-[#30363d] bg-[#0d1117] pl-10 pr-4 py-2.5 text-sm text-[#e6edf3] focus:border-[#1f6feb] focus:outline-none focus:ring-1 focus:ring-[#1f6feb]"
                />

                {/* Search Results Dropdown */}
                {searchTerm && (
                  <div className="absolute z-10 w-full mt-2 bg-[#161b22] border border-[#30363d] rounded-md shadow-2xl max-h-72 overflow-y-auto divide-y divide-[#30363d]">
                    {isSearching ? (
                      <div className="p-4 text-center text-sm text-[#8b949e]">Searching...</div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((result) => (
                        <div
                          key={result._id}
                          className="flex items-center justify-between p-3 hover:bg-[#1f6feb]/10 cursor-pointer transition-colors"
                          onClick={() => handleInviteInitiate(result)}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={result.profileImageUrl || `https://ui-avatars.com/api/?name=${result.username}&background=random`}
                              alt={result.username}
                              className="h-9 w-9 rounded-full border border-[#30363d]"
                            />
                            <div>
                              <p className="text-sm font-semibold text-white">{result.username}</p>
                              <p className="text-xs text-[#8b949e]">{result.gitname || result.email}</p>
                            </div>
                          </div>
                          <button className="rounded-md border border-[#30363d] bg-[#21262d] p-1.5 text-[#c9d1d9] hover:bg-[#30363d] transition-colors">
                            <UserPlus size={16} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-[#8b949e]">No users found matching "{searchTerm}"</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Invited Users List */}
            {invitedUsers.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-[#30363d]">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">Pending invitations ({invitedUsers.length})</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {invitedUsers.map((u) => {
                    const roleConfig = ROLE_CONFIGS[u.role] || ROLE_CONFIGS.COLLABORATOR;
                    const RoleIcon = roleConfig.icon;
                    return (
                      <div key={u._id} className="group relative bg-[#161b22] p-4 rounded-xl border border-[#30363d] hover:border-[#1f6feb] transition-all shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.profileImageUrl || `https://ui-avatars.com/api/?name=${u.username}&background=random`}
                              alt={u.username}
                              className="h-10 w-10 rounded-full border border-[#30363d]"
                            />
                            <div>
                              <p className="text-sm font-bold text-white">{u.username}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <RoleIcon size={12} style={{ color: roleConfig.color }} />
                                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: roleConfig.color }}>
                                  {roleConfig.title}
                                </p>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setInvitedUsers(invitedUsers.filter(user => user._id !== u._id))}
                            className="p-1.5 text-[#8b949e] hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all opacity-0 group-hover:opacity-100"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-[10px] text-[#8b949e]">
                          <Clock size={12} />
                          <span>Invited {new Date(u.invitedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Modals */}
            {showRoleSelector && selectedUserForInvite && (
              <RoleSelectorModal
                user={selectedUserForInvite}
                onConfirm={handleRoleSelected}
                onCancel={() => {
                  setShowRoleSelector(false);
                  setSelectedUserForInvite(null);
                }}
              />
            )}

            {showConfirmation && selectedUserForInvite && (
              <InviteConfirmationModal
                user={selectedUserForInvite}
                role={pendingRole}
                onConfirm={handleInviteConfirm}
                onCancel={() => {
                  setShowConfirmation(false);
                  setShowRoleSelector(true);
                }}
              />
            )}

            <div className="flex justify-between items-center pt-8 border-t border-[#30363d]">
              <button
                onClick={() => setStep(1)}
                className="text-sm font-medium text-[#8b949e] hover:text-white transition-colors"
              >
                Back to organization setup
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="rounded-md bg-[#21262d] border border-[#30363d] px-6 py-2 text-sm font-semibold text-[#c9d1d9] hover:bg-[#30363d] hover:border-[#8b949e] transition-all"
              >
                Finish and go to dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
