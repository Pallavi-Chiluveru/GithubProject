import exp from "express";
import { CommitModel } from "../models/CommitModel.js";
import { RepoFileModel } from "../models/RepoFileModel.js";
import { RepositoryModel } from "../models/RepositoryModel.js";
import { verifyToken } from "../middleware/verifyToken.js";

export const commitApp = exp.Router();

const hasAccess = (repo, userId) => {
  return (
    repo.owner.toString() === userId ||
    (repo.collaborators || []).some((id) => id.toString() === userId) ||
    (repo.viewers || []).some((id) => id.toString() === userId)
  );
};

const canWrite = (repo, userId) => {
  return (
    repo.owner.toString() === userId ||
    (repo.collaborators || []).some((id) => id.toString() === userId)
  );
};

// create commit
commitApp.post("/:repoId", verifyToken, async (req, res) => {
  try {
    const { repoId } = req.params;
    const { message } = req.body;

    const repo = await RepositoryModel.findById(repoId);

    if (!repo) {
      return res.status(404).json({ message: "Repo not found" });
    }

    if (!canWrite(repo, req.user.id)) {
      return res.status(403).json({ message: "Only owner and collaborators can create commits" });
    }

    // get all files of repo
    const files = await RepoFileModel.find({ repoId });

    const snapshot = files.map((f) => ({
      filename: f.filename,
      filePath: f.filePath,
      originalName: f.originalName,
    }));

    const branch = req.body.branch || repo.defaultBranch || "main";

    // Update repo branches if new branch
    if (!repo.branches.includes(branch)) {
      repo.branches.push(branch);
      await repo.save();
    }

    const commit = await CommitModel.create({
      repoId,
      message,
      createdBy: req.user.id,
      branch,
      snapshot,
      files: files.map(f => ({
        path: f.filePath,
        content: "File content simulation",
        diff: `+ ${f.originalName}\n+ File content updated in this commit.`
      }))
    });

    res.status(201).json({
      message: "Commit created",
      commit,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// commit history getting
commitApp.get("/:repoId", verifyToken, async (req, res) => {
  try {
    const repo = await RepositoryModel.findById(req.params.repoId);
    if (!repo) return res.status(404).json({ message: "Repo not found" });
    if (!hasAccess(repo, req.user.id)) {
      return res.status(403).json({ message: "No access" });
    }

    const commits = await CommitModel.find({
      repoId: req.params.repoId,
    })
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json(commits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// GET single commit
commitApp.get("/detail/:commitId", verifyToken, async (req, res) => {
  try {
    const commit = await CommitModel.findById(req.params.commitId)
      .populate("createdBy", "username email");

    if (!commit) {
      return res.status(404).json({ message: "Commit not found" });
    }

    res.status(200).json(commit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});