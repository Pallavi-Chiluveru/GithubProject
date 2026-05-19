import { RepositoryModel } from "../models/RepositoryModel.js";
import { OrganizationModel } from "../models/OrganizationModel.js";
import { OrgMemberModel } from "../models/OrgMemberModel.js";
import { RepositoryMemberModel } from "../models/RepositoryMemberModel.js";

const PERMISSION_LEVELS = {
  READ: 1,
  TRIAGE: 2,
  WRITE: 3,
  MAINTAIN: 4,
  ADMIN: 5
};

export const ROLE_WEIGHTS = {
  OWNER: 3,
  MAINTAINER: 2,
  DEVELOPER: 1
};

/**
 * Resolves the user's role on a repository.
 * Returns "OWNER", "MAINTAINER", "DEVELOPER", or null.
 */
export async function getUserRepoRole(userId, repoId) {
  if (!userId || !repoId) return null;

  try {
    const repo = await RepositoryModel.findById(repoId);
    if (!repo) return null;

    // 1. Direct owner → OWNER
    if (repo.owner && repo.owner.toString() === userId.toString()) {
      return "OWNER";
    }

    // 2. Org owner / admin → OWNER
    if (repo.organization) {
      const org = await OrganizationModel.findById(repo.organization);
      if (org) {
        if (org.owner && org.owner.toString() === userId.toString()) {
          return "OWNER";
        }
        const orgMember = await OrgMemberModel.findOne({ organization: repo.organization, user: userId });
        if (orgMember) {
          if (orgMember.role === "OWNER" || orgMember.role === "ADMIN") {
            return "OWNER";
          }
        }
      }
    }

    // 3. Repository membership → role
    const membership = await RepositoryMemberModel.findOne({
      repository: repoId,
      user: userId,
      status: "accepted"
    });

    if (membership) {
      return membership.role;
    }

    return null;
  } catch (err) {
    console.error("Error in getUserRepoRole:", err);
    return null;
  }
}

/**
 * Middleware ensuring hierarchical minimum role access.
 * e.g. requireMinimumRole("MAINTAINER") allows OWNER and MAINTAINER.
 */
export const requireMinimumRole = (minRole) => {
  return async (req, res, next) => {
    try {
      let repoId = req.params.repoId || req.params.id || req.body.repoId || req.query.repoId;

      // Dynamic lookup if operating on issue or PR
      if (!repoId && req.params.issueId) {
        const { IssueModel } = await import("../models/IssueModel.js");
        const issue = await IssueModel.findById(req.params.issueId);
        if (issue) repoId = issue.repoId;
      }
      if (!repoId && req.params.prId) {
        const { PullRequestModel } = await import("../models/PullRequestModel.js");
        const pr = await PullRequestModel.findById(req.params.prId);
        if (pr) repoId = pr.repoId;
      }

      if (!repoId) {
        return res.status(400).json({ message: "Repository context not found" });
      }

      const role = await getUserRepoRole(req.user.id, repoId);
      if (!role) {
        // Fallback for public repository read access
        const repo = await RepositoryModel.findById(repoId);
        if (repo && repo.visibility === "PUBLIC" && req.method === "GET") {
          req.repoRole = "GUEST";
          return next();
        }
        return res.status(403).json({ message: "Access denied: you are not a collaborator on this repository" });
      }

      const userWeight = ROLE_WEIGHTS[role] || 0;
      const requiredWeight = ROLE_WEIGHTS[minRole] || 0;

      if (userWeight >= requiredWeight) {
        req.repoRole = role;
        return next();
      }

      return res.status(403).json({ message: `Access denied: requires minimum role of ${minRole}` });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };
};

/**
 * Legacy permission bridging check.
 */
export const checkRepoPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const repoId = req.params.repoId || req.params.id || req.body.repoId || req.query.repoId;
      if (!repoId) return res.status(400).json({ message: "Repository ID is required" });

      const repo = await RepositoryModel.findById(repoId);
      if (!repo) return res.status(404).json({ message: "Repository not found" });

      req.repo = repo;
      const requiredLevel = PERMISSION_LEVELS[requiredPermission] || 1;
      let maxUserLevel = 0;

      const role = await getUserRepoRole(req.user.id, repoId);
      if (role === "OWNER") {
        maxUserLevel = PERMISSION_LEVELS.ADMIN;
      } else if (role === "MAINTAINER") {
        maxUserLevel = PERMISSION_LEVELS.MAINTAIN;
      } else if (role === "DEVELOPER") {
        maxUserLevel = PERMISSION_LEVELS.WRITE;
      }

      // Public read fallback
      if (maxUserLevel < requiredLevel && requiredPermission === "READ" && repo.visibility === "PUBLIC") {
        maxUserLevel = PERMISSION_LEVELS.READ;
      }

      if (maxUserLevel >= requiredLevel) {
        req.repoRole = role || "GUEST";
        return next();
      }

      return res.status(403).json({ message: "Insufficient permissions for this repository" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
};
