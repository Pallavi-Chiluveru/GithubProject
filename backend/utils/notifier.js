import { NotificationModel } from "../models/NotificationModel.js";
import { getIO } from "../socket.js";

/**
 * Creates a notification in DB and emits a socket event to the recipient.
 * @param {Object} params
 * @param {String} params.user - Recipient User ID
 * @param {String} params.type - MENTION, REPLY, TEAM_INVITE, PR_REVIEW, etc.
 * @param {String} params.message - Content of the notification
 * @param {String} params.link - URL to navigate to
 * @param {Object} params.metadata - Extra data (e.g. sender info)
 */
export const sendNotification = async ({ user, type, message, link, metadata = {} }) => {
  try {
    const notification = await NotificationModel.create({
      user,
      type,
      message,
      link,
      metadata,
      read: false
    });

    const io = getIO();
    // Send to a specific room for this user
    io.to(`user:${user}`).emit("notification", notification);
    
    return notification;
  } catch (err) {
    console.error("Error sending notification:", err);
  }
};

/**
 * Emits activity to a specific repository room.
 * @param {String} repoId 
 * @param {String} type 
 * @param {Object} data 
 */
export const emitActivity = (repoId, type, data) => {
  try {
    const io = getIO();
    io.to(`repo:${repoId}`).emit("activity", { type, data, timestamp: new Date() });
  } catch (err) {
    console.error("Error emitting activity:", err);
  }
};
