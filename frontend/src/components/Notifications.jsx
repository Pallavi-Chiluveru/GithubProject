import { useState, useEffect } from "react";
import API from "../api";
import { Bell, Check, Circle, Trash2, Building, Book, Shield } from "lucide-react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

const TYPE_ICONS = {
  org_invite:    <Building className="h-4 w-4 text-[#1f6feb]" />,
  repo_invite:   <Book className="h-4 w-4 text-[#1f6feb]" />,
  invite_accepted: <Check className="h-4 w-4 text-[#238636]" />,
  invite_rejected: <Circle className="h-4 w-4 text-red-400" />,
  member_removed:  <Shield className="h-4 w-4 text-orange-400" />,
  role_updated:    <Shield className="h-4 w-4 text-purple-400" />,
  general:         <Bell className="h-4 w-4 text-[#8b949e]" />,
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchNotifications();

    // Real-time: join user room
    const socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:5000", {
      withCredentials: true,
    });
    if (user._id) socket.emit("join", user._id);

    socket.on("new_notification", (notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    return () => socket.disconnect();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notification-api/");
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await API.patch(`/notification-api/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await API.patch("/notification-api/mark-all-read");
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await API.delete(`/notification-api/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleInviteResponse = async (notificationId, inviteId, action, type) => {
    try {
      if (type === "repo_invite") {
        await API.post(`/collab-api/respond/${inviteId}`, { action });
      } else {
        await API.post(`/org-api/respond-invite`, { inviteId, action });
      }
      await markAsRead(notificationId);
      fetchNotifications();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} invitation`);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] pt-6 font-sans">
      <div className="mx-auto max-w-3xl px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b border-[#30363d] pb-4">
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2 text-white">
              <Bell className="h-5 w-5" /> Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-xs text-[#8b949e] mt-0.5">{unreadCount} unread</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 rounded-md bg-[#21262d] px-3 py-1.5 text-xs font-medium text-[#c9d1d9] hover:bg-[#30363d] border border-[#30363d]"
              >
                <Check className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-[#1f6feb] border-r-transparent border-b-transparent border-l-transparent" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-24 border border-[#30363d] rounded-lg bg-[#0d1117]">
            <Bell className="mx-auto h-12 w-12 mb-4 opacity-10 text-white" />
            <h3 className="text-lg font-semibold text-white mb-1">All caught up!</h3>
            <p className="text-sm text-[#8b949e]">You have no notifications.</p>
          </div>
        ) : (
          <div className="border border-[#30363d] rounded-lg overflow-hidden divide-y divide-[#30363d]">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-[#161b22] group ${
                  !n.read ? "bg-[#1f6feb]/5 border-l-2 border-l-[#1f6feb]" : ""
                }`}
              >
                {/* Type icon */}
                <div className="mt-0.5 flex-shrink-0">
                  {TYPE_ICONS[n.type] || TYPE_ICONS.general}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${!n.read ? "text-white font-medium" : "text-[#8b949e]"}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-[#8b949e] mt-1">
                    {new Date(n.createdAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>

                  {/* Accept/Reject for org and repo invites */}
                  {(n.type === "org_invite" || n.type === "repo_invite") && !n.read && (
                    <div className="mt-2.5 flex gap-2">
                      <button
                        onClick={() => handleInviteResponse(n._id, n.relatedId, "accept", n.type)}
                        className="rounded-md bg-[#238636] px-3 py-1 text-xs font-semibold text-white hover:bg-[#2ea043] transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleInviteResponse(n._id, n.relatedId, "reject", n.type)}
                        className="rounded-md bg-[#21262d] border border-[#30363d] px-3 py-1 text-xs font-medium text-white hover:bg-[#30363d] transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!n.read && (
                    <button
                      onClick={() => markAsRead(n._id)}
                      className="p-1.5 rounded-md hover:bg-[#30363d] text-[#8b949e] hover:text-white"
                      title="Mark as read"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(n._id)}
                    className="p-1.5 rounded-md hover:bg-[#30363d] text-[#8b949e] hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
