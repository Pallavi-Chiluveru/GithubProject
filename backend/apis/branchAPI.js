/**
 * branchAPI.js
 * Gitea-backed branch management REST API.
 * All operations proxy through to Gitea, keeping MongoDB in sync.
 */

import exp from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireMinimumRole } from "../middleware/repoAuth.js";
import { RepositoryModel } from "../models/RepositoryModel.js";
import { UserModel } from "../models/UserModel.js";
import { decryptToken } from "../utils/encrypt.js";
import { BranchModel } from "../models/BranchModel.js";
import {
  listBranches as giteaListBranches,
  getBranch as giteaGetBranch,
  createBranch as giteaCreateBranch,
  deleteBranch as giteaDeleteBranch,
  protectBranch as giteaProtectBranch,
  listBranchNames as giteaListBranchNames,
} from "../services/giteaBranchService.js";
import { isGiteaConfigured } from "../services/giteaClient.js";
import { getIO } from "../socket.js";
import {
  listBranches as dbListBranches,
  createBranch as dbCreateBranch,
  deleteBranch as dbDeleteBranch,
  setDefaultBranch,
  protectBranch as dbProtectBranch,
  unprotectBranch,
  calculateAheadBehind,
  compareBranches,
} from "../services/branchService.js";

export const branchApp = exp.Router();

/**
 * Helper: resolve giteaOwner/repoName from MongoDB repo doc.
 * Falls back to MongoDB branches array if Gitea is not configured.
 */
const resolveGiteaOwner = async (repoId) => {
  const repo = await RepositoryModel.findById(repoId)
    .populate("owner", "giteaUsername username")
    .lean();
  return repo;
};

/* ─── LIST BRANCHES ───────────────────────────────────────────────────────── */
branchApp.get("/:repoId/list", verifyToken, requireMinimumRole("DEVELOPER"), async (req, res) => {
  try {
    const repoId = req.params.repoId;
    const repo = await RepositoryModel.findById(repoId).lean();
    if (!repo) return res.status(404).json({ message: "Repository not found" });

    // If Gitea is configured, proxy to Gitea
    if (isGiteaConfigured() && repo.giteaFullName) {
      const [ownerUsername, repoName] = repo.giteaFullName.split("/");
      const branches = await giteaListBranches(ownerUsername, repoName);
      return res.status(200).json(branches);
    }

    // Local DB fallback using branchService
    const { branches, total } = await dbListBranches(repoId);
    return res.status(200).json({ branches, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─── GET BRANCH NAMES ONLY ───────────────────────────────────────────────── */
branchApp.get("/:repoId/names", verifyToken, requireMinimumRole("DEVELOPER"), async (req, res) => {
  try {
    const repo = await resolveGiteaOwner(req.params.repoId);
    if (!repo) return res.status(404).json({ message: "Repository not found" });

    if (isGiteaConfigured() && repo.giteaFullName) {
      const [ownerUsername, repoName] = repo.giteaFullName.split("/");
      const names = await giteaListBranchNames(ownerUsername, repoName);
      return res.status(200).json(names);
    }

    return res.status(200).json(repo.branches || ["main"]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─── CREATE BRANCH ───────────────────────────────────────────────────────── */
branchApp.post("/:repoId/create", verifyToken, requireMinimumRole("DEVELOPER"), async (req, res) => {
  try {
    const { newBranchName, fromBranch = "main" } = req.body;
    if (!newBranchName) return res.status(400).json({ message: "newBranchName is required" });

    const repoId = req.params.repoId;
    const repo = await RepositoryModel.findById(repoId).lean();
    if (!repo) return res.status(404).json({ message: "Repository not found" });

    // Prefer Gitea when configured
    if (isGiteaConfigured() && repo.giteaFullName) {
      const [ownerUsername, repoName] = repo.giteaFullName.split("/");
      const user = await UserModel.findById(req.user.id).select("giteaToken giteaUsername").lean();
      const giteaToken = decryptToken(user?.giteaToken);
      const branch = await giteaCreateBranch(ownerUsername, repoName, giteaToken, {
        newBranchName,
        oldBranchName: fromBranch,
      });
      if (!branch) return res.status(500).json({ message: "Failed to create branch in Gitea" });
      await RepositoryModel.findByIdAndUpdate(repoId, { $addToSet: { branches: newBranchName } });
      getIO().to(repoId).emit("branch_created", {
        branch: newBranchName,
        from: fromBranch,
        author: req.user.username,
        timestamp: new Date().toISOString(),
      });
      return res.status(201).json({ message: "Branch created", branch });
    }

    // Local Git fallback using branchService
    const branchDoc = await dbCreateBranch(repoId, newBranchName, fromBranch, req.user.id);
    // Update repo document's branches array
    await RepositoryModel.findByIdAndUpdate(repoId, { $addToSet: { branches: newBranchName } });
    getIO().to(repoId).emit("branch_created", {
      branch: newBranchName,
      from: fromBranch,
      author: req.user.username,
      timestamp: new Date().toISOString(),
    });
    return res.status(201).json({ message: "Branch created", branch: branchDoc });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─── DELETE BRANCH ───────────────────────────────────────────────────────── */
branchApp.delete("/:repoId/:branchName", verifyToken, requireMinimumRole("MAINTAINER"), async (req, res) => {
  try {
    const { repoId, branchName } = req.params;
    const repo = await RepositoryModel.findById(repoId).lean();
    if (!repo) return res.status(404).json({ message: "Repository not found" });
    if (branchName === (repo.defaultBranch || "main")) {
      return res.status(400).json({ message: "Cannot delete the default branch" });
    }
    if (isGiteaConfigured() && repo.giteaFullName) {
      const [ownerUsername, repoName] = repo.giteaFullName.split("/");
      await giteaDeleteBranch(ownerUsername, repoName, branchName);
    } else {
      await dbDeleteBranch(repoId, branchName);
    }
    await RepositoryModel.findByIdAndUpdate(repoId, { $pull: { branches: branchName } });
    getIO().to(repoId).emit("branch_deleted", {
      branch: branchName,
      author: req.user.username,
      timestamp: new Date().toISOString(),
    });
    res.status(200).json({ message: `Branch "${branchName}" deleted` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─── PROTECT BRANCH ──────────────────────────────────────────────────────── */
branchApp.post("/:repoId/:branchName/protect", verifyToken, requireMinimumRole("OWNER"), async (req, res) => {
  try {
    const { repoId, branchName } = req.params;
    const rules = req.body;
    const repo = await RepositoryModel.findById(repoId).lean();
    if (!repo) return res.status(404).json({ message: "Repository not found" });
    if (isGiteaConfigured() && repo.giteaFullName) {
      const [ownerUsername, repoName] = repo.giteaFullName.split("/");
      const protection = await giteaProtectBranch(ownerUsername, repoName, branchName, rules);
      return res.status(200).json({ message: `Branch "${branchName}" is now protected`, protection });
    } else {
      const updated = await dbProtectBranch(repoId, branchName, rules);
      return res.status(200).json({ message: `Branch "${branchName}" protected locally`, branch: updated });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
