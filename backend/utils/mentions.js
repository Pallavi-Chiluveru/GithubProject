import { UserModel } from "../models/UserModel.js";
import { sendNotification } from "./notifier.js";

/**
 * Detects @username mentions in text and sends notifications.
 * @param {String} content - Text to search for mentions
 * @param {String} senderId - ID of user who sent the message
 * @param {String} contextType - "discussion", "pull request", "comment", etc.
 * @param {String} link - URL to the content
 * @param {String} senderName - Name of the sender
 */
export const handleMentions = async (content, senderId, contextType, link, senderName) => {
  if (!content) return;
  const mentionRegex = /@(\w+)/g;
  const mentions = [...content.matchAll(mentionRegex)].map(match => match[1]);
  
  const uniqueMentions = [...new Set(mentions)];
  for (const username of uniqueMentions) {
    const user = await UserModel.findOne({ username });
    if (user && user._id.toString() !== senderId.toString()) {
      await sendNotification({
        user: user._id,
        type: "MENTION",
        message: `${senderName} mentioned you in ${contextType}`,
        link,
        metadata: { senderName, senderId, contextType }
      });
    }
  }
};
