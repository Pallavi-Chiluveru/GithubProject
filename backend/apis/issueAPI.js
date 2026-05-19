import exp from "express";
import { IssueModel } from "../models/IssueModel.js";
import { IssueCommentModel } from "../models/IssueCommentModel.js";
import { RepositoryModel } from "../models/RepositoryModel.js";
import { ActivityLogModel } from "../models/ActivityLogModel.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireMinimumRole, getUserRepoRole } from "../middleware/repoAuth.js";

export const issueApp = exp.Router();

/* ---------------- GET GLOBAL ISSUES ---------------- */
issueApp.get("/user/all", verifyToken, async (req, res) => {
  try {
    const issues = await IssueModel.find({
      $or: [
        { createdBy: req.user.id },
        { assignedTo: req.user.id }
      ]
    })
      .populate("createdBy", "username profileImageUrl")
      .populate({
        path: "repoId",
        populate: { path: "owner", select: "username" }
      })
      .sort({ createdAt: -1 });

    const issuesWithComments = await Promise.all(issues.map(async (issue) => {
      const comments = await IssueCommentModel.find({ issueId: issue._id });
      return { ...issue.toObject(), comments };
    }));

    res.status(200).json(issuesWithComments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- CREATE ISSUE ---------------- */
issueApp.post("/:repoId", verifyToken, requireMinimumRole("DEVELOPER"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const { repoId } = req.params;

    const repo = await RepositoryModel.findById(repoId);
    if (!repo) {
      return res.status(404).json({ message: "Repo not found" });
    }

    const issue = await IssueModel.create({
      title,
      description,
      repoId,
      createdBy: req.user.id,
    });

    // Log activity
    await new ActivityLogModel({
      user: req.user.id,
      action: "issue_created",
      message: `Opened issue "${title}" in ${repo.name}`,
      repoId: repo._id,
    }).save();

    res.status(201).json({
      message: "Issue created",
      issue,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- GET ALL ISSUES OF REPO ---------------- */
issueApp.get("/:repoId", verifyToken, requireMinimumRole("DEVELOPER"), async (req, res) => {
  try {
    const issues = await IssueModel.find({
      repoId: req.params.repoId,
    })
      .populate("createdBy", "username email profileImageUrl")
      .populate("assignedTo", "username email profileImageUrl")
      .sort({ createdAt: -1 });

    const issuesWithComments = await Promise.all(issues.map(async (issue) => {
      const comments = await IssueCommentModel.find({ issueId: issue._id });
      return { ...issue.toObject(), comments };
    }));

    res.status(200).json(issuesWithComments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- GET SINGLE ISSUE ---------------- */
issueApp.get("/single/:issueId", verifyToken, async (req, res) => {
  try {
    const issue = await IssueModel.findById(req.params.issueId)
      .populate("createdBy", "username email profileImageUrl")
      .populate("assignedTo", "username email profileImageUrl");

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    const comments = await IssueCommentModel.find({ issueId: issue._id })
      .populate("createdBy", "username email profileImageUrl")
      .sort({ createdAt: 1 });

    res.status(200).json({ ...issue.toObject(), comments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- UPDATE ISSUE ---------------- */
issueApp.put("/:issueId", verifyToken, async (req, res) => {
  try {
    const issue = await IssueModel.findById(req.params.issueId);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    const role = await getUserRepoRole(req.user.id, issue.repoId);
    const isCreator = issue.createdBy.toString() === req.user.id;
    const isMaintainer = role === "OWNER" || role === "MAINTAINER";

    if (!isCreator && !isMaintainer) {
      return res.status(403).json({ message: "Not authorized to update this issue" });
    }

    const { title, description } = req.body;
    if (title) issue.title = title;
    if (description) issue.description = description;

    await issue.save();

    res.status(200).json({
      message: "Issue updated",
      issue,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- TOGGLE ISSUE STATUS ---------------- */
issueApp.patch("/:issueId/status", verifyToken, requireMinimumRole("MAINTAINER"), async (req, res) => {
  try {
    const issue = await IssueModel.findById(req.params.issueId);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    const repo = await RepositoryModel.findById(issue.repoId);
    issue.status = issue.status === "open" ? "closed" : "open";
    await issue.save();

    // Log activity
    await new ActivityLogModel({
      user: req.user.id,
      action: "issue_status_changed",
      message: `${issue.status === "closed" ? "Closed" : "Reopened"} issue "${issue.title}" in ${repo.name}`,
      repoId: repo._id,
    }).save();

    res.status(200).json({
      message: "Status updated",
      issue,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- ASSIGN USER ---------------- */
issueApp.patch(
  "/:issueId/assign/:userId",
  verifyToken,
  requireMinimumRole("MAINTAINER"),
  async (req, res) => {
    try {
      const issue = await IssueModel.findById(req.params.issueId);
      if (!issue) {
        return res.status(404).json({ message: "Issue not found" });
      }

      if (!issue.assignedTo.includes(req.params.userId)) {
        issue.assignedTo.push(req.params.userId);
      }

      await issue.save();

      res.status(200).json({
        message: "User assigned",
        issue,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/* ---------------- DELETE ISSUE ---------------- */
issueApp.delete("/:issueId", verifyToken, requireMinimumRole("MAINTAINER"), async (req, res) => {
  try {
    const issue = await IssueModel.findById(req.params.issueId);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    await issue.deleteOne();

    res.status(200).json({
      message: "Issue deleted",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- ADD COMMENT ---------------- */
issueApp.post("/:issueId/comments", verifyToken, async (req, res) => {
  try {
    const { comment } = req.body;
    const { issueId } = req.params;

    if (!comment) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const issue = await IssueModel.findById(issueId);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    const newComment = await IssueCommentModel.create({
      issueId,
      comment,
      createdBy: req.user.id,
    });

    const populatedComment = await IssueCommentModel.findById(newComment._id)
      .populate("createdBy", "username email profileImageUrl");

    res.status(201).json(populatedComment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
