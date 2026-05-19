import exp from "express";
import { DiscussionModel } from "../models/DiscussionModel.js";
import { DiscussionReplyModel } from "../models/DiscussionReplyModel.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { RepositoryModel } from "../models/RepositoryModel.js";
import { ActivityLogModel } from "../models/ActivityLogModel.js";

export const discussionApp = exp.Router();

import { UserModel } from "../models/UserModel.js";
import { sendNotification, emitActivity } from "../utils/notifier.js";
import { handleMentions } from "../utils/mentions.js";

/* ─── CREATE DISCUSSION ────────────────────────────────────── */
discussionApp.post("/create", verifyToken, async (req, res, next) => {
  try {
    const { repoId, title, content, category, tags } = req.body;

    if (!repoId || !title || !content) {
      return res.status(400).json({ message: "RepoId, Title, and Content are required" });
    }

    const discussion = await DiscussionModel.create({
      repoId,
      title,
      content,
      category: category || "GENERAL",
      tags: tags || [],
      author: req.user.id
    });

    const user = await UserModel.findById(req.user.id);
    await handleMentions(content, req.user.id, "a discussion", `/repo/${repoId}?tab=discussions`, user.username);
    
    emitActivity(repoId, "DISCUSSION_CREATED", { title, author: user.username });

    await ActivityLogModel.create({
      user: req.user.id,
      action: "discussion_created",
      message: `Created discussion "${title}"`,
      metadata: { repoId, discussionId: discussion._id },
    });

    res.status(201).json({ message: "Discussion created successfully", discussion });
  } catch (err) {
    next(err);
  }
});

/* ─── GET REPO DISCUSSIONS ─────────────────────────────────── */
discussionApp.get("/repo/:repoId", verifyToken, async (req, res, next) => {
  try {
    const { repoId } = req.params;
    const { category, search } = req.query;

    let query = { repoId };
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } }
      ];
    }

    const discussions = await DiscussionModel.find(query)
      .populate("author", "username profileImageUrl")
      .sort({ isPinned: -1, createdAt: -1 })
      .lean();

    res.status(200).json(discussions);
  } catch (err) {
    next(err);
  }
});

/* ─── GET DISCUSSION DETAILS ──────────────────────────────── */
discussionApp.get("/:id", verifyToken, async (req, res, next) => {
  try {
    const discussion = await DiscussionModel.findById(req.params.id)
      .populate("author", "username profileImageUrl")
      .populate("repoId", "name visibility")
      .lean();

    if (!discussion) return res.status(404).json({ message: "Discussion not found" });

    // Get top-level replies
    const replies = await DiscussionReplyModel.find({ discussionId: discussion._id, parentReplyId: null })
      .populate("author", "username profileImageUrl")
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({ ...discussion, replies });
  } catch (err) {
    next(err);
  }
});

/* ─── ADD REPLY ───────────────────────────────────────────── */
discussionApp.post("/:id/replies", verifyToken, async (req, res, next) => {
  try {
    const { content, parentReplyId } = req.body;
    const discussionId = req.params.id;

    const reply = await DiscussionReplyModel.create({
      discussionId,
      content,
      author: req.user.id,
      parentReplyId: parentReplyId || null
    });

    const discussion = await DiscussionModel.findById(discussionId).populate("repoId");
    const user = await UserModel.findById(req.user.id);
    
    // Notify author of discussion (if not self)
    if (discussion.author.toString() !== req.user.id) {
      await sendNotification({
        user: discussion.author,
        type: "REPLY",
        message: `${user.username} replied to your discussion "${discussion.title}"`,
        link: `/repo/${discussion.repoId._id}?tab=discussions`,
        metadata: { senderName: user.username, discussionId }
      });
    }

    await handleMentions(content, req.user.id, "a reply", `/repo/${discussion.repoId._id}?tab=discussions`, user.username);
    emitActivity(discussion.repoId._id, "DISCUSSION_REPLY", { discussionTitle: discussion.title, author: user.username });

    res.status(201).json({ message: "Reply added successfully", reply });
  } catch (err) {
    next(err);
  }
});

/* ─── UPVOTE DISCUSSION ───────────────────────────────────── */
discussionApp.post("/:id/upvote", verifyToken, async (req, res, next) => {
  try {
    const discussion = await DiscussionModel.findById(req.params.id);
    if (!discussion) return res.status(404).json({ message: "Discussion not found" });

    const userId = req.user.id;
    const upvoteIndex = discussion.upvotes.indexOf(userId);

    if (upvoteIndex === -1) {
      discussion.upvotes.push(userId);
    } else {
      discussion.upvotes.splice(upvoteIndex, 1);
    }

    await discussion.save();
    res.status(200).json({ message: "Upvote toggled", upvotes: discussion.upvotes.length });
  } catch (err) {
    next(err);
  }
});

export default discussionApp;
