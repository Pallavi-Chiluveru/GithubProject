import exp from "express";
import fs from "fs";
import path from "path";
import { RepositoryModel } from "../models/RepositoryModel.js";
import { CollaborationModel } from "../models/CollaborationModel.js";
import { RepositoryMemberModel } from "../models/RepositoryMemberModel.js";
import { ActivityLogModel } from "../models/ActivityLogModel.js";
import { OrganizationModel } from "../models/OrganizationModel.js";
import { OrgMemberModel } from "../models/OrgMemberModel.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { RepoFileModel } from "../models/RepoFileModel.js";
import { CommitModel } from "../models/CommitModel.js";
import { UserModel } from "../models/UserModel.js";
import { decryptToken } from "../utils/encrypt.js";
import { createGiteaRepo, deleteGiteaRepo, forkGiteaRepo } from "../services/giteaRepoService.js";
import { registerRepoWebhook } from "../services/giteaWebhookService.js";
import { isGiteaConfigured } from "../services/giteaClient.js";
import { syncForkWithUpstream } from "../services/gitForkService.js";
import { getRepoTree, getCommitLog, getFileContent, updateFileContent } from "../services/giteaCommitService.js";
import { getIO } from "../socket.js";
import { getUserRepoRole, requireMinimumRole } from "../middleware/repoAuth.js";

export const repoApp = exp.Router();

/* CREATE REPOSITORY */
repoApp.post("/createRepo", verifyToken, async (req, res) => {
  try {
    const { name, description, isPublic, visibility, gitignore, license, orgId, addReadme, initializeWithReadme } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Repository name required" });
    }

    let ownerId = req.user.id;
    let organizationId = null;

    if (orgId) {
      const org = await OrganizationModel.findById(orgId);
      if (!org) return res.status(404).json({ message: "Organization not found" });

      const isOwner = org.owner.toString() === req.user.id;
      const member = await OrgMemberModel.findOne({ organization: orgId, user: req.user.id });
      const canCreate = member && ["ADMIN", "MAINTAINER", "COLLABORATOR"].includes(member.role);

      if (!isOwner && !canCreate) {
        return res.status(403).json({ message: "Only owners, admins, maintainers, and collaborators can create repositories in this organization" });
      }
      organizationId = orgId;
      ownerId = req.user.id; // creator owns the repo within the org
    }

    const existing = await RepositoryModel.findOne({
      name,
      owner: ownerId,
      organization: organizationId
    });

    if (existing) {
      return res.status(400).json({ message: "Repository already exists" });
    }

    const shouldInitWithReadme = initializeWithReadme === true || initializeWithReadme === "true" || addReadme === true || String(addReadme) === "true";

    const repo = new RepositoryModel({
      name,
      description,
      isPrivate: visibility === "PRIVATE" || !isPublic,
      visibility: visibility || (isPublic ? "PUBLIC" : "PRIVATE"),
      owner: ownerId,
      organization: organizationId,
      gitignore: gitignore || "None",
      license: license || "None",
      initializeWithReadme: shouldInitWithReadme,
    });

    await repo.save();

    // Create OWNER membership for the creator
    await RepositoryMemberModel.create({
      repository: repo._id,
      user: ownerId,
      role: "OWNER",
      status: "accepted"
    });

    // Create initial README if requested
    if (shouldInitWithReadme) {
      const readmeFilename = `readme-${repo._id}.md`;
      const readmePath = path.join(process.cwd(), "uploads", readmeFilename);
      const content = "";

      try {
        await RepoFileModel.create({
          repoId: repo._id,
          originalName: "README.md",
          filename: readmeFilename,
          filePath: `uploads/${readmeFilename}`, // Keep relative for database/fileAPI
          storageProvider: "local",
          mimeType: "text/markdown",
          size: Buffer.byteLength(content),
          uploadedBy: req.user.id,
        });

        fs.writeFileSync(readmePath, content);
        console.log(`README.md created successfully at ${readmePath}`);
      } catch (fileErr) {
        console.error("FAILED TO CREATE INITIAL README:", fileErr);
        // We don't want to fail repo creation just because README failed
      }
    }

    // If org repo, add it to the org's repository list
    if (organizationId) {
      await OrganizationModel.findByIdAndUpdate(organizationId, {
        $push: { repositories: repo._id }
      });
    }

    // Log activity
    await new ActivityLogModel({
      user: req.user.id,
      action: "repo_created",
      message: `Created repository "${name}"${organizationId ? ` in organization` : ''}`,
      repoId: repo._id,
    }).save();

    // ─── Mirror repository in Gitea (non-blocking) ─────────────────────────────
    // Creates a real Git repo in Gitea and registers webhook for real-time events.
    setImmediate(async () => {
      try {
        if (!isGiteaConfigured()) return;

        const user = await UserModel.findById(req.user.id).select("giteaUsername giteaToken").lean();
        if (!user?.giteaUsername || !user?.giteaToken) {
          console.warn(`[Gitea] User ${req.user.username} has no Gitea account — skipping repo creation.`);
          return;
        }

        let targetUser = user;
        if (organizationId) {
          const org = await OrganizationModel.findById(organizationId);
          if (org && org.owner) {
            const orgOwner = await UserModel.findById(org.owner).select("giteaUsername giteaToken").lean();
            if (orgOwner?.giteaUsername && orgOwner?.giteaToken) {
              targetUser = orgOwner;
            }
          }
        }

        const giteaToken = decryptToken(targetUser.giteaToken);
        const giteaRepo = await createGiteaRepo({
          giteaUsername: targetUser.giteaUsername,
          giteaToken,
          name,
          description: description || "",
          isPrivate: visibility === "PRIVATE" || !isPublic,
          defaultBranch: "main",
          autoInit: repo.initializeWithReadme || false,
        });

        if (giteaRepo) {
          // Store Gitea references in MongoDB
          await RepositoryModel.findByIdAndUpdate(repo._id, {
            giteaRepoId: giteaRepo.id,
            giteaFullName: giteaRepo.full_name,
            cloneUrlHttps: giteaRepo.clone_url,
            cloneUrlSsh: giteaRepo.ssh_url,
            giteaSynced: true,
          });

          // Register webhook so push/PR events flow back to us
          await registerRepoWebhook(targetUser.giteaUsername, name);

          // Notify all connected clients
          getIO().emit("repo_created", {
            repoId: repo._id,
            name,
            owner: req.user.username,
            cloneUrl: giteaRepo.clone_url,
          });

          console.log(`[Gitea] Repo ${name} successfully created and webhook registered.`);
        }
      } catch (giteaErr) {
        console.error(`[Gitea] Repo mirror failed for ${name}:`, giteaErr.message);
      }
    });

    res.status(201).json({ message: "Repository created successfully", repo });
  } catch (err) {
    console.error("REPO CREATE ERROR:", err);
    res.status(500).json({
      message: "Error creating repository on server",
      error: err.message,
      stack: err.stack
    });
  }
});


/* GET ALL PUBLIC REPOS */
repoApp.get("/public", verifyToken, async (req, res) => {
  try {
    const repos = await RepositoryModel.find({ visibility: "PUBLIC" })
      .populate("owner", "username profileImageUrl")
      .sort({ createdAt: -1 })
      .limit(20);
    res.status(200).json(repos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* IMPORT REPOSITORY */
repoApp.post("/import", verifyToken, async (req, res) => {
  try {
    const { sourceUrl, repoName, isPrivate, username, password } = req.body;

    if (!sourceUrl || !repoName) {
      return res.status(400).json({ message: "Source URL and Repository name are required" });
    }

    const existing = await RepositoryModel.findOne({
      name: repoName,
      owner: req.user.id,
    });

    if (existing) {
      return res.status(400).json({ message: "Repository already exists" });
    }

    const repo = new RepositoryModel({
      name: repoName,
      isPrivate: isPrivate,
      owner: req.user.id,
      gitRemoteUrl: sourceUrl,
      gitProvider: sourceUrl.includes("github.com") ? "github" : "none",
    });

    await repo.save();

    // Log activity
    await new ActivityLogModel({
      user: req.user.id,
      action: "repo_imported",
      message: `Imported repository "${repoName}" from ${sourceUrl}`,
      repoId: repo._id,
    }).save();

    res.status(201).json({
      message: "Repository imported successfully",
      repo
    });
  } catch (err) {
    console.error("REPO IMPORT ERROR:", err);
    res.status(500).json({ message: "Error importing repository", error: err.message });
  }
});


/* GET ALL REPOS (OWNER + COLLABORATOR) */
repoApp.get("/user", verifyToken, async (req, res) => {
  try {
    // Find organizations user belongs to (normalized table)
    const memberships = await OrgMemberModel.find({ user: req.user.id }).select("organization").lean();
    const orgIds = memberships.map(m => m.organization);

    const repos = await RepositoryModel.find({
      $or: [
        { owner: req.user.id },
        { collaborators: req.user.id },
        { viewers: req.user.id },
        { organization: { $in: orgIds } }
      ],
    }).populate("owner", "username profileImageUrl").sort({ updatedAt: -1 });

    res.status(200).json(repos);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "error occurred",
      error: err.message,
    });
  }
});


/* GET SINGLE REPOSITORY */
repoApp.get("/:id", verifyToken, async (req, res) => {
  try {
    const repo = await RepositoryModel.findById(req.params.id)
      .populate("owner", "username email profileImageUrl")
      .populate("collaborators", "username email profileImageUrl")
      .populate("viewers", "username email profileImageUrl")
      .populate({
        path: "parentRepoId",
        populate: { path: "owner", select: "username email profileImageUrl giteaUsername" }
      })
      .populate({
        path: "forkedFromRepoId",
        populate: { path: "owner", select: "username email profileImageUrl giteaUsername" }
      });

    if (!repo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    const role = await getUserRepoRole(req.user.id, repo._id);

    // If it's private and user has no role, check org access or block
    if (repo.visibility !== "PUBLIC" && !role) {
      // Check org membership for org repos
      let isOrgMember = false;
      if (repo.organization) {
        const member = await OrgMemberModel.findOne({
          organization: repo.organization,
          user: req.user.id,
        });
        const org = await OrganizationModel.findById(repo.organization).select("owner").lean();
        isOrgMember = !!member || (org && org.owner.toString() === req.user.id);
      }

      if (!isOrgMember) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    let hasCommits = false;
    let hasFiles = false;

    if (isGiteaConfigured() && repo.giteaFullName) {
      try {
        const [giteaUser, giteaRepo] = repo.giteaFullName.split("/");
        const commits = await getCommitLog(giteaUser, giteaRepo, repo.defaultBranch || "main", 1);
        if (commits && commits.length > 0) {
          hasCommits = true;
        }
      } catch (_) {
        // Empty or non-existing branch throws an error or returns empty
      }
    }

    const fileCount = await RepoFileModel.countDocuments({ repoId: repo._id });
    if (fileCount > 0) {
      hasFiles = true;
    }

    const isEmpty = !hasCommits && !hasFiles;

    const repoObj = repo.toObject();
    repoObj.role = role;
    repoObj.isEmpty = isEmpty;

    res.status(200).json(repoObj);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "error occurred",
      error: err.message,
    });
  }
});


/* UPDATE REPOSITORY (OWNER ONLY) */
repoApp.put("/:id", verifyToken, requireMinimumRole("OWNER"), async (req, res) => {
  try {
    const repo = await RepositoryModel.findById(req.params.id);

    if (!repo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    const { name, description, isPrivate, gitRemoteUrl } = req.body;

    if (name) repo.name = name;
    if (description) repo.description = description;
    if (isPrivate !== undefined) repo.isPrivate = isPrivate;
    if (gitRemoteUrl !== undefined) {
      repo.gitRemoteUrl = gitRemoteUrl;
      repo.gitProvider = gitRemoteUrl?.includes("github.com") ? "github" : "none";
    }

    await repo.save();

    res.status(200).json({
      message: "Repository updated",
      repo,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


/* DELETE REPOSITORY (OWNER ONLY) */
repoApp.delete("/:id", verifyToken, requireMinimumRole("OWNER"), async (req, res) => {
  try {
    const repo = await RepositoryModel.findById(req.params.id);

    if (!repo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    await repo.deleteOne();

    // Log activity
    await new ActivityLogModel({
      user: req.user.id,
      action: "repo_deleted",
      message: `Deleted repository "${repo.name}"`,
    }).save();

    res.status(200).json({ message: "Repository deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "error occurred",
      error: err.message,
    });
  }
});


/* REMOVE COLLABORATOR (OWNER ONLY) */
repoApp.delete("/:repoId/collaborator/:userId", verifyToken, async (req, res) => {
  try {
    const { repoId, userId } = req.params;

    const repo = await RepositoryModel.findById(repoId);
    if (!repo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    if (repo.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // prevent removing owner
    if (repo.owner.toString() === userId) {
      return res.status(400).json({ message: "Cannot remove owner" });
    }

    // remove collaborator
    repo.collaborators = (repo.collaborators || []).filter(
      (id) => id.toString() !== userId
    );
    repo.viewers = (repo.viewers || []).filter(
      (id) => id.toString() !== userId
    );

    await repo.save();

    // update collaboration record
    await CollaborationModel.findOneAndUpdate(
      { repoId, userId },
      { status: "removed" }
    );

    res.status(200).json({ message: "Collaborator removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

repoApp.get("/:id/git", verifyToken, async (req, res) => {
  try {
    const repo = await RepositoryModel.findById(req.params.id);
    if (!repo) return res.status(404).json({ message: "Repository not found" });

    const hasAccess =
      repo.owner.toString() === req.user.id ||
      (repo.collaborators || []).some((id) => id.toString() === req.user.id) ||
      (repo.viewers || []).some((id) => id.toString() === req.user.id);

    if (!hasAccess) return res.status(403).json({ message: "Access denied" });

    const match = (repo.gitRemoteUrl || "").match(/github\.com[:/](.+?)\/(.+?)(\.git)?$/);
    if (!match) {
      return res.status(200).json({
        provider: repo.gitProvider,
        remoteUrl: repo.gitRemoteUrl,
        message: "No GitHub remote configured",
      });
    }

    const owner = match[1];
    const name = match[2];
    const response = await fetch(`https://api.github.com/repos/${owner}/${name}`);
    const data = await response.json();

    res.status(response.ok ? 200 : response.status).json({
      provider: "github",
      remoteUrl: repo.gitRemoteUrl,
      defaultBranch: data.default_branch,
      stars: data.stargazers_count,
      forks: data.forks_count,
      openIssues: data.open_issues_count,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* GET REPOS BY USERNAME */
repoApp.get("/user/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const user = await UserModel.findOne({
      username: { $regex: new RegExp(`^${username}$`, 'i') }
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch public repos for this user
    const repos = await RepositoryModel.find({
      owner: user._id,
      visibility: "PUBLIC"
    }).populate("owner", "username profileImageUrl").sort({ updatedAt: -1 });

    res.status(200).json(repos);
  } catch (err) {
    res.status(500).json({ message: "error occurred", error: err.message });
  }
});

/* ── GITEA FILE TREE ───────────────────────────────────────────────────────────
 * GET /repo-api/:id/tree?ref=main
 * Returns the recursive file/folder tree from Gitea for a repo.
 * Falls back to empty array if Gitea is not configured.
 */
repoApp.get("/:id/tree", verifyToken, async (req, res) => {
  try {
    const repo = await RepositoryModel.findById(req.params.id).populate("owner", "username giteaUsername");
    if (!repo) return res.status(404).json({ message: "Repository not found" });

    if (!isGiteaConfigured() || !repo.giteaFullName) {
      return res.status(200).json({ source: "none", tree: [] });
    }

    const [giteaUser, giteaRepo] = repo.giteaFullName.split("/");
    const ref = req.query.ref || "main";
    const tree = await getRepoTree(giteaUser, giteaRepo, ref);

    // Normalise: only return blobs and trees at the top level for display
    const entries = tree.map(item => ({
      path: item.path,
      type: item.type, // "blob" = file, "tree" = folder
      size: item.size || 0,
      sha: item.sha,
      url: item.url,
    }));

    res.status(200).json({ source: "gitea", ref, tree: entries });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── GITEA COMMIT LOG ──────────────────────────────────────────────────────────
 * GET /repo-api/:id/commits?branch=main&limit=10
 * Returns real commit history from Gitea.
 */
repoApp.get("/:id/commits", verifyToken, async (req, res) => {
  try {
    const repo = await RepositoryModel.findById(req.params.id).populate("owner", "username giteaUsername");
    if (!repo) return res.status(404).json({ message: "Repository not found" });

    if (!isGiteaConfigured() || !repo.giteaFullName) {
      return res.status(200).json([]);
    }

    const [giteaUser, giteaRepo] = repo.giteaFullName.split("/");
    const branch = req.query.branch || "main";
    const limit = parseInt(req.query.limit) || 20;
    const commits = await getCommitLog(giteaUser, giteaRepo, branch, limit);

    const normalised = commits.map(c => {
      let authorName = c.author?.login;

      // Fallback: Check if raw commit details match the repo owner
      if (!authorName && repo.owner) {
        const commitEmail = c.commit?.author?.email;
        const commitName = c.commit?.author?.name;
        if (
          (commitEmail && repo.owner.email && commitEmail.toLowerCase() === repo.owner.email.toLowerCase()) ||
          (commitName && repo.owner.username && commitName.toLowerCase() === repo.owner.username.toLowerCase()) ||
          (commitName && repo.owner.giteaUsername && commitName.toLowerCase() === repo.owner.giteaUsername.toLowerCase())
        ) {
          authorName = repo.owner.username;
        }
      }

      // Fallback: Check if raw commit details match the logged-in user
      if (!authorName && req.user) {
        const commitEmail = c.commit?.author?.email;
        const commitName = c.commit?.author?.name;
        if (
          (commitEmail && req.user.email && commitEmail.toLowerCase() === req.user.email.toLowerCase()) ||
          (commitName && req.user.username && commitName.toLowerCase() === req.user.username.toLowerCase())
        ) {
          authorName = req.user.username;
        }
      }

      // Fallback: Raw Git author name
      if (!authorName) {
        authorName = c.commit?.author?.name;
      }

      // Ultimate fallback: Repo owner or Unknown
      if (!authorName || authorName === "Unknown") {
        authorName = repo.owner?.username || "Unknown";
      }

      return {
        sha: c.sha,
        shortSha: c.sha?.slice(0, 7),
        message: c.commit?.message || "",
        author: authorName,
        date: c.commit?.author?.date || c.created,
        htmlUrl: c.html_url,
      };
    });

    res.status(200).json(normalised);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── GITEA FILE CONTENT ────────────────────────────────────────────────────────
 * GET /repo-api/:id/contents?path=README.md&ref=main
 * Returns the raw decoded content of a file from Gitea.
 */
repoApp.get("/:id/contents", verifyToken, async (req, res) => {
  try {
    const repo = await RepositoryModel.findById(req.params.id).populate("owner", "username giteaUsername");
    if (!repo) return res.status(404).json({ message: "Repository not found" });

    if (!isGiteaConfigured() || !repo.giteaFullName) {
      return res.status(400).json({ message: "Gitea integration not active for this repo" });
    }

    const { path: filePath, ref } = req.query;
    if (!filePath) return res.status(400).json({ message: "File path is required" });

    const [giteaUser, giteaRepo] = repo.giteaFullName.split("/");
    const result = await getFileContent(giteaUser, giteaRepo, filePath, ref || "main");

    if (!result) {
      return res.status(404).json({ message: `File "${filePath}" not found in repository` });
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── UPDATE GITEA FILE CONTENT ──────────────────────────────────────────────────
 * PUT /repo-api/:id/contents
 * Commits a file edit back to Gitea, attributed to the logged-in user.
 */
repoApp.put("/:id/contents", verifyToken, async (req, res) => {
  try {
    const repo = await RepositoryModel.findById(req.params.id).populate("owner", "username giteaUsername");
    if (!repo) return res.status(404).json({ message: "Repository not found" });

    if (!isGiteaConfigured() || !repo.giteaFullName) {
      return res.status(400).json({ message: "Gitea integration not active for this repo" });
    }

    const { path: filePath, content, sha, message, branch } = req.body;
    if (!filePath || content === undefined) {
      return res.status(400).json({ message: "Path and content are required" });
    }

    // Resolve the logged-in user's Gitea token so the commit is attributed to them
    let userToken = null;
    const currentUser = await UserModel.findById(req.user.id).select("giteaToken").lean();
    if (currentUser?.giteaToken) {
      userToken = decryptToken(currentUser.giteaToken);
    }

    const [giteaUser, giteaRepo] = repo.giteaFullName.split("/");
    const result = await updateFileContent(
      giteaUser,
      giteaRepo,
      filePath,
      content,
      sha,
      message || `Update ${filePath}`,
      branch || "main",
      userToken
    );

    res.status(200).json({ message: "File updated successfully", result });
  } catch (err) {
    res.status(500).json({ message: err.response?.data?.message || err.message });
  }
});


/* ── STAR / UNSTAR REPOSITORY ──────────────────────────────────────────────────
 * POST /repo-api/:id/star
 * Toggles star on/off for the authenticated user.
 */
repoApp.post("/:id/star", verifyToken, async (req, res) => {
  try {
    const repo = await RepositoryModel.findById(req.params.id);
    if (!repo) return res.status(404).json({ message: "Repository not found" });

    const userId = req.user.id;
    const alreadyStarred = (repo.stars || []).some(id => id.toString() === userId);

    if (alreadyStarred) {
      // Unstar
      await RepositoryModel.findByIdAndUpdate(req.params.id, {
        $pull: { stars: userId },
        $inc: { starCount: -1 },
      });
      return res.status(200).json({ starred: false, starCount: Math.max(0, (repo.starCount || 0) - 1) });
    } else {
      // Star
      await RepositoryModel.findByIdAndUpdate(req.params.id, {
        $addToSet: { stars: userId },
        $inc: { starCount: 1 },
      });
      return res.status(200).json({ starred: true, starCount: (repo.starCount || 0) + 1 });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── CHECK STAR STATUS ─────────────────────────────────────────────────────────
 * GET /repo-api/:id/star
 * Returns whether the current user has starred this repo and the star count.
 */
repoApp.get("/:id/star", verifyToken, async (req, res) => {
  try {
    const repo = await RepositoryModel.findById(req.params.id).select("stars starCount").lean();
    if (!repo) return res.status(404).json({ message: "Repository not found" });

    const starred = (repo.stars || []).some(id => id.toString() === req.user.id);
    res.status(200).json({ starred, starCount: repo.starCount || 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


/* FORK REPOSITORY */
repoApp.post("/:id/fork", verifyToken, async (req, res) => {
  try {
    const originalRepo = await RepositoryModel.findById(req.params.id).populate("owner");
    if (!originalRepo) {
      return res.status(404).json({ message: "Original repository not found" });
    }

    const { repoName, description, copyMainBranchOnly } = req.body;
    const finalName = repoName || originalRepo.name;

    // Check if user already owns a repo with this name
    const existing = await RepositoryModel.findOne({
      name: finalName,
      owner: req.user.id,
    });

    if (existing) {
      return res.status(400).json({ message: "You already have a repository with this name." });
    }

    const user = await UserModel.findById(req.user.id).select("username giteaUsername giteaToken").lean();

    let giteaFork = null;
    if (isGiteaConfigured() && user?.giteaToken && originalRepo.giteaSynced && originalRepo.giteaFullName) {
      try {
        const giteaToken = decryptToken(user.giteaToken);
        const [originalOwnerGitea] = originalRepo.giteaFullName.split("/");
        giteaFork = await forkGiteaRepo(originalOwnerGitea, originalRepo.name, giteaToken, finalName);
      } catch (giteaErr) {
        console.warn("[Fork] Gitea fork failed (non-fatal):", giteaErr.message);
      }
    }

    // Create repository document in MongoDB
    const forkedRepo = new RepositoryModel({
      name: finalName,
      description: description || originalRepo.description || "",
      isPrivate: originalRepo.isPrivate,
      visibility: originalRepo.visibility,
      owner: req.user.id,
      isFork: true,
      parentRepoId: originalRepo._id,
      parentOwnerId: originalRepo.owner._id,
      forkedFrom: `${originalRepo.owner.username}/${originalRepo.name}`,
      forkedFromRepoId: originalRepo._id,
      defaultBranch: originalRepo.defaultBranch || "main",
      branches: originalRepo.branches || ["main"],
      giteaRepoId: giteaFork?.id || null,
      giteaFullName: giteaFork?.full_name || `${user?.username || "user"}/${finalName}`,
      cloneUrlHttps: giteaFork?.clone_url || `http://localhost:3000/${user?.username || "user"}/${finalName}.git`,
      cloneUrlSsh: giteaFork?.ssh_url || `ssh://git@localhost:2222/${user?.username || "user"}/${finalName}.git`,
      giteaSynced: !!giteaFork,
    });

    await forkedRepo.save();

    // Register Webhook for the newly forked Gitea repo to sync push events correctly
    if (isGiteaConfigured() && giteaFork) {
      try {
        const [forkOwner, forkRepoName] = giteaFork.full_name.split("/");
        await registerRepoWebhook(forkOwner, forkRepoName);
        console.log(`[Fork] Webhook registered successfully for: ${giteaFork.full_name}`);
      } catch (webhookErr) {
        console.error("[Fork] Webhook registration failed:", webhookErr.message);
      }
    }

    // Duplicate all repository files/folders metadata and copy files in disk for absolute isolation
    const originalFiles = await RepoFileModel.find({ repoId: originalRepo._id });
    const copiedFiles = [];
    let copiedFoldersCount = 0;
    const uniqueFolders = new Set();

    for (const file of originalFiles) {
      try {
        // Track unique folder hierarchies
        if (file.originalName && file.originalName.includes("/")) {
          const parts = file.originalName.split("/");
          parts.pop(); // Remove the filename to get folder hierarchy
          let pathBuild = "";
          for (const part of parts) {
            pathBuild = pathBuild ? `${pathBuild}/${part}` : part;
            uniqueFolders.add(pathBuild);
          }
        }

        let newFilePath = file.filePath;
        let newFilename = file.filename;

        // If local storage, physically copy the staging files on disk to preserve absolute isolation
        if (file.storageProvider === "local" && file.filePath) {
          try {
            const dirName = path.dirname(file.filePath);
            newFilename = `${Date.now()}-${Math.floor(Math.random() * 1000000)}-${path.basename(file.originalName)}`;
            const targetPath = path.join(dirName, newFilename);
            
            if (fs.existsSync(file.filePath)) {
              fs.copyFileSync(file.filePath, targetPath);
              newFilePath = targetPath;
            }
          } catch (fsErr) {
            console.error(`[Fork] Failed to copy physical file on disk from ${file.filePath}:`, fsErr.message);
          }
        }

        const clonedFile = new RepoFileModel({
          repoId: forkedRepo._id,
          filename: newFilename,
          originalName: file.originalName,
          filePath: newFilePath,
          storageProvider: file.storageProvider,
          cloudUrl: file.cloudUrl,
          cloudPublicId: file.cloudPublicId,
          cloudResourceType: file.cloudResourceType,
          mimeType: file.mimeType,
          size: file.size,
          uploadedBy: req.user.id,
        });

        await clonedFile.save();
        copiedFiles.push(clonedFile);
      } catch (fileErr) {
        console.error(`[Fork] Failed to duplicate file document ${file.originalName}:`, fileErr.message);
      }
    }
    copiedFoldersCount = uniqueFolders.size;

    // Duplicate commit histories from Mongo analytics cache
    const originalCommits = await CommitModel.find({ repoId: originalRepo._id });
    const copiedCommits = [];
    for (const commit of originalCommits) {
      try {
        const clonedCommit = new CommitModel({
          repoId: forkedRepo._id,
          sha: commit.sha,
          shortSha: commit.shortSha || commit.sha?.slice(0, 7) || "",
          message: commit.message,
          authorName: commit.authorName,
          authorEmail: commit.authorEmail,
          createdBy: commit.createdBy,
          branch: commit.branch,
          addedLines: commit.addedLines,
          deletedLines: commit.deletedLines,
          filesChanged: commit.filesChanged,
        });

        await clonedCommit.save();
        copiedCommits.push(clonedCommit);
      } catch (commitErr) {
        // Suppress unique index errors (like identical SHAs in repo boundaries if any)
        console.warn(`[Fork] Gracefully skipped commit duplicating error for ${commit.sha}:`, commitErr.message);
      }
    }

    // Create OWNER membership for the user on this fork
    await RepositoryMemberModel.create({
      repository: forkedRepo._id,
      user: req.user.id,
      role: "OWNER",
      status: "accepted"
    });

    // Increment fork count on the original repository
    originalRepo.forkCount = (originalRepo.forkCount || 0) + 1;
    await originalRepo.save();

    // Create activity log
    await new ActivityLogModel({
      user: req.user.id,
      action: "repo_forked",
      message: `Forked repository "${originalRepo.name}" as "${finalName}"`,
      repoId: forkedRepo._id,
    }).save();

    // Find the latest commit SHA from duplicated commits
    let latestCommitSHA = "";
    if (copiedCommits.length > 0) {
      const sortedCommits = [...copiedCommits].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      latestCommitSHA = sortedCommits[0].sha;
    }

    // Trigger realtime socket notification so user dashboard refreshes instantly
    try {
      getIO().emit("repo_created", { ownerId: req.user.id, repo: forkedRepo });
    } catch (socketErr) {
      console.warn("[Fork] Realtime socket notification failed:", socketErr.message);
    }

    res.status(201).json({
      message: "Repository forked successfully",
      repo: forkedRepo,
      copiedFilesCount: copiedFiles.length,
      copiedFoldersCount: copiedFoldersCount,
      copiedBranches: forkedRepo.branches || ["main"],
      copiedCommits: copiedCommits.length,
      latestCommitSHA: latestCommitSHA,
      forkedFromRepository: originalRepo.name
    });
  } catch (err) {
    console.error("REPO FORK ERROR:", err);
    res.status(500).json({ message: "Error forking repository", error: err.message });
  }
});

/* SYNC FORK */
repoApp.post("/:id/sync", verifyToken, async (req, res) => {
  try {
    const forkRepo = await RepositoryModel.findById(req.params.id).populate("owner");
    if (!forkRepo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    if (!forkRepo.isFork || !forkRepo.forkedFromRepoId) {
      return res.status(400).json({ message: "This repository is not a fork" });
    }

    const upstreamRepo = await RepositoryModel.findById(forkRepo.forkedFromRepoId).populate("owner");
    if (!upstreamRepo) {
      return res.status(404).json({ message: "Upstream repository not found" });
    }

    // Only owners/collaborators can sync forks
    if (forkRepo.owner._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to sync this fork" });
    }

    const user = await UserModel.findById(req.user.id).select("username giteaUsername giteaToken").lean();

    let synced = false;
    let resultMessage = "Fork synced successfully (MongoDB fallback)";

    if (isGiteaConfigured() && user?.giteaToken) {
      try {
        const giteaToken = decryptToken(user.giteaToken);
        // Call native git synchronization service
        const syncResult = await syncForkWithUpstream({
          forkCloneUrl: forkRepo.cloneUrlHttps,
          upstreamCloneUrl: upstreamRepo.cloneUrlHttps,
          giteaUsername: user.giteaUsername,
          giteaToken,
          defaultBranch: forkRepo.defaultBranch || "main",
        });
        synced = true;
        resultMessage = syncResult.message || "Fork synced successfully via Gitea";
      } catch (err) {
        console.error("Gitea fork sync failed, attempting MongoDB fallback:", err.message);
      }
    }

    // ── MongoDB Fallback Fork Sync ───────────────────────────────────────────
    if (!synced) {
      const defaultBranch = forkRepo.defaultBranch || "main";

      // 1. Sync Commits (upstream -> fork)
      const upstreamCommits = await CommitModel.find({
        repoId: upstreamRepo._id,
        branch: defaultBranch
      });

      for (const upstreamCommit of upstreamCommits) {
        const existingCommit = await CommitModel.findOne({
          repoId: forkRepo._id,
          branch: defaultBranch,
          sha: upstreamCommit.sha
        });

        if (!existingCommit) {
          await CommitModel.create({
            repoId: forkRepo._id,
            sha: upstreamCommit.sha,
            shortSha: upstreamCommit.shortSha,
            message: upstreamCommit.message,
            authorName: upstreamCommit.authorName,
            authorEmail: upstreamCommit.authorEmail,
            createdBy: upstreamCommit.createdBy,
            branch: defaultBranch,
            addedLines: upstreamCommit.addedLines,
            deletedLines: upstreamCommit.deletedLines,
            filesChanged: upstreamCommit.filesChanged,
          });
        }
      }

      // 2. Sync Files (upstream -> fork)
      const upstreamFiles = await RepoFileModel.find({ repoId: upstreamRepo._id });
      const upstreamFileNames = upstreamFiles.map(f => f.originalName);

      // Delete files in fork that don't exist in upstream
      await RepoFileModel.deleteMany({
        repoId: forkRepo._id,
        originalName: { $nin: upstreamFileNames }
      });

      // Copy/overwrite files
      for (const upstreamFile of upstreamFiles) {
        const existingFile = await RepoFileModel.findOne({
          repoId: forkRepo._id,
          originalName: upstreamFile.originalName
        });

        if (existingFile) {
          existingFile.filename = upstreamFile.filename;
          existingFile.filePath = upstreamFile.filePath;
          existingFile.storageProvider = upstreamFile.storageProvider;
          existingFile.cloudUrl = upstreamFile.cloudUrl;
          existingFile.cloudPublicId = upstreamFile.cloudPublicId;
          existingFile.cloudResourceType = upstreamFile.cloudResourceType;
          existingFile.mimeType = upstreamFile.mimeType;
          existingFile.size = upstreamFile.size;
          existingFile.uploadedBy = upstreamFile.uploadedBy;
          await existingFile.save();
        } else {
          await RepoFileModel.create({
            repoId: forkRepo._id,
            filename: upstreamFile.filename,
            originalName: upstreamFile.originalName,
            filePath: upstreamFile.filePath,
            storageProvider: upstreamFile.storageProvider,
            cloudUrl: upstreamFile.cloudUrl,
            cloudPublicId: upstreamFile.cloudPublicId,
            cloudResourceType: upstreamFile.cloudResourceType,
            mimeType: upstreamFile.mimeType,
            size: upstreamFile.size,
            uploadedBy: upstreamFile.uploadedBy,
          });
        }
      }
    }

    res.status(200).json({ success: true, message: resultMessage });
  } catch (err) {
    console.error("REPO SYNC ERROR:", err);
    res.status(500).json({ message: "Error syncing repository", error: err.message });
  }
});

/* GET REPOSITORY NETWORK (FORK TREE AND FLAT LIST) */
repoApp.get("/:id/network", verifyToken, async (req, res) => {
  try {
    const repo = await RepositoryModel.findById(req.params.id).populate("owner", "username profileImageUrl giteaUsername");
    if (!repo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    // Trace back to the absolute parent/root upstream repository
    let rootRepo = repo;
    while (rootRepo.isFork && (rootRepo.forkedFromRepoId || rootRepo.parentRepoId)) {
      const parentId = rootRepo.forkedFromRepoId || rootRepo.parentRepoId;
      const parent = await RepositoryModel.findById(parentId).populate("owner", "username profileImageUrl giteaUsername");
      if (!parent) break;
      rootRepo = parent;
    }

    // Fetch all descendants in the fork tree
    const allForks = await RepositoryModel.find({
      $or: [
        { forkedFromRepoId: rootRepo._id },
        { parentRepoId: rootRepo._id }
      ]
    }).populate("owner", "username profileImageUrl giteaUsername");

    const formatRepoObj = (r) => ({
      _id: r._id,
      id: r._id,
      name: r.name,
      fullName: `${r.owner?.username || "Unknown"}/${r.name}`,
      owner: {
        _id: r.owner?._id,
        username: r.owner?.username || "Unknown",
        profileImageUrl: r.owner?.profileImageUrl,
        giteaUsername: r.owner?.giteaUsername
      },
      defaultBranch: r.defaultBranch || "main",
      branches: r.branches || ["main"],
      isFork: r.isFork,
      forkedFromRepoId: r.forkedFromRepoId || r.parentRepoId
    });

    const rootObj = formatRepoObj(rootRepo);
    const networkList = [rootObj, ...allForks.map(formatRepoObj)];

    // Filter descendants properly for tree view
    const buildTree = (currentRepo) => {
      const node = {
        id: currentRepo._id,
        name: currentRepo.name,
        fullName: `${currentRepo.owner?.username || "Unknown"}/${currentRepo.name}`,
        owner: currentRepo.owner?.username || "Unknown",
        profileImageUrl: currentRepo.owner?.profileImageUrl,
        isRoot: currentRepo._id.toString() === rootRepo._id.toString(),
        children: []
      };

      const directForks = allForks.filter(f => (f.forkedFromRepoId || f.parentRepoId)?.toString() === currentRepo._id.toString());
      for (const fork of directForks) {
        node.children.push(buildTree(fork));
      }
      return node;
    };

    const tree = buildTree(rootRepo);
    res.status(200).json({ root: tree, network: networkList });
  } catch (err) {
    console.error("REPO NETWORK ERROR:", err);
    res.status(500).json({ message: "Error fetching fork network", error: err.message });
  }
});
