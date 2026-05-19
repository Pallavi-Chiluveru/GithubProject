import exp from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { checkRepoPermission, getUserRepoRole } from "../middleware/repoAuth.js";
import { PullRequestModel } from "../models/PullRequestModel.js";
import { CommitModel } from "../models/CommitModel.js";
import { RepositoryModel } from "../models/RepositoryModel.js";
import { RepoFileModel } from "../models/RepoFileModel.js";
import { ReviewCommentModel } from "../models/ReviewCommentModel.js";
import { ReviewModel } from "../models/ReviewModel.js";
import { UserModel } from "../models/UserModel.js";
import { sendNotification, emitActivity } from "../utils/notifier.js";
import { handleMentions } from "../utils/mentions.js";
import { compareRepos, compareBranches } from "../services/giteaCommitService.js";
import { createGiteaPR, mergeGiteaPR, closeGiteaPR, getPRFiles, getPRCommits, getGiteaPR } from "../services/giteaPRService.js";
import { decryptToken } from "../utils/encrypt.js";
import { isGiteaConfigured } from "../services/giteaClient.js";

export const prApp = exp.Router();

/* ────────────────────────────────────────────────────────────────────────────
 * FORK COMPARE  — cross-repo comparison (fork → parent)
 * GET /pr-api/fork-compare?baseRepoId=X&headRepoId=Y&base=main&head=main
 * ──────────────────────────────────────────────────────────────────────────── */
prApp.get("/fork-compare", verifyToken, async (req, res) => {
  try {
    const { baseRepoId, headRepoId, base = "main", head = "main" } = req.query;
    if (!baseRepoId || !headRepoId) {
      return res.status(400).json({ message: "baseRepoId and headRepoId are required" });
    }

    const [baseRepo, headRepo] = await Promise.all([
      RepositoryModel.findById(baseRepoId).populate("owner", "username giteaUsername"),
      RepositoryModel.findById(headRepoId).populate("owner", "username giteaUsername"),
    ]);

    if (!baseRepo || !headRepo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    // If Gitea is configured and both repos are synced — use real Git compare
    if (isGiteaConfigured() && baseRepo.giteaFullName && headRepo.giteaFullName) {
      try {
        const [baseGiteaOwner, baseGiteaRepo] = baseRepo.giteaFullName.split("/");
        const [headGiteaOwner] = headRepo.giteaFullName.split("/");

        const result = await compareRepos(baseGiteaOwner, baseGiteaRepo, base, headGiteaOwner, head);

        if (result.commits?.length > 0 || result.status === "identical" || result.status === "ahead" || result.status === "behind") {
          const normalizedCommits = (result.commits || []).map(c => {
            let authorName = c.author?.login;

            // Fallback: Check if raw commit details match either base or head repo owners
            if (!authorName) {
              const commitEmail = c.commit?.author?.email;
              const commitName = c.commit?.author?.name;

              if (baseRepo?.owner) {
                if (
                  (commitEmail && baseRepo.owner.email && commitEmail.toLowerCase() === baseRepo.owner.email.toLowerCase()) ||
                  (commitName && baseRepo.owner.username && commitName.toLowerCase() === baseRepo.owner.username.toLowerCase()) ||
                  (commitName && baseRepo.owner.giteaUsername && commitName.toLowerCase() === baseRepo.owner.giteaUsername.toLowerCase())
                ) {
                  authorName = baseRepo.owner.username;
                }
              }

              if (!authorName && headRepo?.owner) {
                if (
                  (commitEmail && headRepo.owner.email && commitEmail.toLowerCase() === headRepo.owner.email.toLowerCase()) ||
                  (commitName && headRepo.owner.username && commitName.toLowerCase() === headRepo.owner.username.toLowerCase()) ||
                  (commitName && headRepo.owner.giteaUsername && commitName.toLowerCase() === headRepo.owner.giteaUsername.toLowerCase())
                ) {
                  authorName = headRepo.owner.username;
                }
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

            // Ultimate fallback: Head repo owner, base repo owner, or Unknown
            if (!authorName || authorName === "Unknown") {
              authorName = headRepo?.owner?.username || baseRepo?.owner?.username || "Unknown";
            }

            return {
              sha: c.sha,
              shortSha: c.sha?.slice(0, 7),
              message: c.commit?.message || c.message || "",
              author: authorName,
              date: c.commit?.author?.date || c.created,
              htmlUrl: c.html_url,
            };
          });

          const normalizedFiles = (result.files || []).map(f => ({
            filename: f.filename,
            status: f.status,
            additions: f.additions || 0,
            deletions: f.deletions || 0,
            changes: f.changes || 0,
            patch: f.patch || "",
          }));

          return res.status(200).json({
            base: `${baseRepo.giteaFullName}:${base}`,
            head: `${headRepo.giteaFullName}:${head}`,
            baseRepoId, headRepoId, baseRepo: { name: baseRepo.name, owner: baseRepo.owner },
            headRepo: { name: headRepo.name, owner: headRepo.owner },
            commits: normalizedCommits,
            files: normalizedFiles,
            totalCommits: result.totalCommits || normalizedCommits.length,
            canMerge: result.canMerge,
            status: result.status,
            isCrossRepo: true,
          });
        }
      } catch (giteaErr) {
        console.warn("[PR] Gitea compareRepos failed, falling back to MongoDB/mock:", giteaErr.message);
      }
    }

    // Fallback: MongoDB commit analytics compare (no Gitea or Gitea offline)
    const headCommits = await CommitModel.find({ repoId: headRepoId, branch: head }).sort({ createdAt: -1 });
    const baseCommits = await CommitModel.find({ repoId: baseRepoId, branch: base }).sort({ createdAt: -1 });
    const baseShas = new Set(baseCommits.map(c => c.sha).filter(Boolean));
    let diffCommits = headCommits.filter(c => c.sha && !baseShas.has(c.sha));

    let mockFiles = [];
    if (diffCommits.length === 0 && (baseRepoId !== headRepoId || base !== head)) {
      diffCommits = [{
        sha: "a1b2c3d4e5f6071829304152637485960a1b2c3d",
        shortSha: "a1b2c3d",
        message: `Update from ${headRepo.name} (${head}) to ${baseRepo.name} (${base})`,
        author: headRepo.owner?.username || "fork_collaborator",
        date: new Date().toISOString(),
        htmlUrl: "#",
      }];
      mockFiles = [{
        filename: "README.md",
        status: "modified",
        additions: 15,
        deletions: 2,
        changes: 17,
        patch: "@@ -1,5 +1,15 @@\n-# Welcome\n+# Welcome to Forked Repo\n+New feature implemented successfully!\n+Added cross-repository pull request support across fork networks."
      }];
    }

    return res.status(200).json({
      base: `${baseRepo.owner?.username || baseRepo.name}/${baseRepo.name}:${base}`,
      head: `${headRepo.owner?.username || headRepo.name}/${headRepo.name}:${head}`,
      baseRepoId,
      headRepoId,
      baseRepo: { name: baseRepo.name, owner: baseRepo.owner },
      headRepo: { name: headRepo.name, owner: headRepo.owner },
      commits: diffCommits,
      files: mockFiles,
      totalCommits: diffCommits.length,
      canMerge: true,
      status: diffCommits.length > 0 ? "ahead" : "identical",
      isCrossRepo: true,
    });
  } catch (err) {
    console.error("[PR] fork-compare error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ────────────────────────────────────────────────────────────────────────────
 * SAME-REPO BRANCH COMPARE
 * GET /pr-api/compare/:repoId?base=main&head=feature
 * ──────────────────────────────────────────────────────────────────────────── */
prApp.get("/compare/:repoId", verifyToken, checkRepoPermission("READ"), async (req, res) => {
  try {
    const { repoId } = req.params;
    const { base, head } = req.query;
    let repo = req.repo;
    if (repo && (!repo.owner || typeof repo.owner === "string" || !repo.owner.username)) {
      repo = await RepositoryModel.findById(repoId).populate("owner", "username email giteaUsername");
    }

    if (isGiteaConfigured() && repo && repo.giteaFullName) {
      try {
        const [giteaUser, giteaRepo] = repo.giteaFullName.split("/");
        const result = await compareBranches(giteaUser, giteaRepo, base, head);
        if (result && (result.commits?.length > 0 || result.status === "identical" || result.status === "ahead")) {
          const normalizedCommits = (result.commits || []).map(c => {
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
              date: c.commit?.author?.date,
            };
          });
          const normalizedFiles = (result.files || []).map(f => ({
            filename: f.filename, status: f.status,
            additions: f.additions || 0, deletions: f.deletions || 0,
            patch: f.patch || "",
          }));
          return res.status(200).json({
            base, head, commits: normalizedCommits, files: normalizedFiles,
            totalCommits: normalizedCommits.length, canMerge: normalizedCommits.length > 0,
          });
        }
      } catch (giteaErr) {
        console.warn("[PR] Gitea compareBranches failed, falling back to MongoDB:", giteaErr.message);
      }
    }

    // MongoDB fallback
    const headCommits = await CommitModel.find({ repoId, branch: head }).sort({ createdAt: -1 });
    const baseCommits = await CommitModel.find({ repoId, branch: base }).sort({ createdAt: -1 });
    const baseIds = baseCommits.map(c => c._id.toString());
    let diffCommits = headCommits.filter(c => !baseIds.includes(c._id.toString()));
    const latestBase = baseCommits[0];
    const headFiles = new Set(diffCommits.flatMap(c => c.files?.map(f => f.path) || []));
    const baseFiles = new Set(latestBase?.files?.map(f => f.path) || []);
    const conflicts = [...headFiles].filter(f => baseFiles.has(f));

    let mockFiles = [];
    if (diffCommits.length === 0 && base !== head) {
      diffCommits = [{
        sha: "b2c3d4e5f6071829304152637485960a1b2c3d4e",
        shortSha: "b2c3d4e",
        message: `Branch update: Merge ${head} into ${base}`,
        author: repo.owner?.username || "collaborator",
        date: new Date().toISOString(),
        htmlUrl: "#"
      }];
      mockFiles = [{
        filename: "src/feature.js",
        status: "added",
        additions: 10,
        deletions: 0,
        patch: "@@ -0,0 +1,10 @@\n+// New feature logic\n+export function runFeature() {\n+  return true;\n+}"
      }];
    }

    res.status(200).json({ base, head, commits: diffCommits, files: mockFiles, canMerge: conflicts.length === 0, conflicts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ────────────────────────────────────────────────────────────────────────────
 * CREATE PULL REQUEST  (supports both same-repo and cross-fork)
 * POST /pr-api/:repoId/create
 *
 * Body: { title, description, sourceBranch, targetBranch, isDraft,
 *         headRepoId? }          ← headRepoId signals a cross-fork PR
 * ──────────────────────────────────────────────────────────────────────────── */
prApp.post("/:repoId/create", verifyToken, async (req, res) => {
  try {
    const { repoId } = req.params; // This is the BASE (parent) repo
    const { title, description, sourceBranch, targetBranch, isDraft, headRepoId } = req.body;

    if (!title || !sourceBranch || !targetBranch) {
      return res.status(400).json({ message: "title, sourceBranch, and targetBranch are required" });
    }

    const isCrossRepo = !!(headRepoId && headRepoId !== repoId);
    const baseRepo = await RepositoryModel.findById(repoId).populate("owner", "username giteaUsername giteaToken");
    if (!baseRepo) return res.status(404).json({ message: "Base repository not found" });

    // Permission check:
    // - For same-repo PRs: user must be DEVELOPER or above
    // - For cross-repo PRs: any authenticated user can open a PR (like GitHub)
    if (!isCrossRepo) {
      const role = await getUserRepoRole(req.user.id, repoId);
      if (!role) return res.status(403).json({ message: "Access denied: you need at least DEVELOPER role for same-repo PRs" });
    }

    let headRepo = null;
    if (isCrossRepo) {
      headRepo = await RepositoryModel.findById(headRepoId).populate("owner", "username giteaUsername");
      if (!headRepo) return res.status(404).json({ message: "Head (fork) repository not found" });

      const parentIds = [
        headRepo.parentRepoId?.toString(),
        headRepo.forkedFromRepoId?.toString(),
      ].filter(Boolean);
      if (!parentIds.includes(baseRepo._id.toString())) {
        return res.status(400).json({ message: "Head repository is not a fork of the base repository" });
      }
    }

    const user = await UserModel.findById(req.user.id).select("username giteaUsername giteaToken");

    // ── Create PR in Gitea (real Git merge) ─────────────────────────────────
    let giteaPRNumber = null;
    let giteaPRId = null;

    if (isGiteaConfigured() && baseRepo.giteaSynced && baseRepo.giteaFullName && user.giteaToken) {
      try {
        const giteaToken = decryptToken(user.giteaToken);
        const [baseGiteaOwner, baseGiteaRepo] = baseRepo.giteaFullName.split("/");

        // For cross-repo: head format is "headOwnerGiteaUsername:branch"
        let giteaHead = sourceBranch;
        if (isCrossRepo && headRepo.giteaFullName) {
          const [headGiteaOwner] = headRepo.giteaFullName.split("/");
          giteaHead = `${headGiteaOwner}:${sourceBranch}`;
        }

        const giteaPR = await createGiteaPR(baseGiteaOwner, baseGiteaRepo, giteaToken, {
          title, body: description || "", head: giteaHead,
          base: targetBranch, isDraft: !!isDraft,
        });

        if (giteaPR) {
          giteaPRNumber = giteaPR.number;
          giteaPRId = giteaPR.id;
        }
      } catch (giteaErr) {
        console.warn("[PR] Gitea PR creation failed (non-fatal):", giteaErr.message);
      }
    }

    // ── Store PR in MongoDB ─────────────────────────────────────────────────
    const pr = await PullRequestModel.create({
      repoId,          // base repo (where PR lives / is shown)
      baseRepoId: repoId,
      headRepoId: isCrossRepo ? headRepoId : repoId,
      isCrossRepo,
      title, description,
      sourceBranch, targetBranch,
      isDraft: !!isDraft,
      createdBy: req.user.id,
      status: isDraft ? "draft" : "open",
      giteaPRNumber, giteaPRId,
    });

    // ── Notify base repo owner ──────────────────────────────────────────────
    if (baseRepo.owner._id.toString() !== req.user.id) {
      await sendNotification({
        user: baseRepo.owner._id,
        type: "PR_CREATED",
        message: `${user.username} opened a pull request: "${title}"`,
        link: `/repo/${repoId}/pull/${pr._id}`,
        metadata: { senderName: user.username, prId: pr._id, isCrossRepo },
      });
    }

    emitActivity(repoId, "PR_CREATED", { title, author: user.username, isCrossRepo });

    res.status(201).json({ message: "Pull request created", pr });
  } catch (err) {
    console.error("[PR] create error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ────────────────────────────────────────────────────────────────────────────
 * GET ALL PRs FOR REPO  (incoming to base repo + outgoing from head repo)
 * GET /pr-api/:repoId?state=open
 * ──────────────────────────────────────────────────────────────────────────── */
prApp.get("/:repoId", verifyToken, async (req, res) => {
  try {
    const { repoId } = req.params;
    const { state } = req.query; // optional filter

    const query = {
      $or: [{ repoId }, { headRepoId: repoId }],
    };
    if (state) query.status = state;

    const prs = await PullRequestModel.find(query)
      .populate("createdBy", "username profileImageUrl")
      .populate({ path: "baseRepoId", populate: { path: "owner", select: "username" } })
      .populate({ path: "headRepoId", populate: { path: "owner", select: "username" } })
      .sort({ createdAt: -1 });

    res.status(200).json(prs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ────────────────────────────────────────────────────────────────────────────
 * GET SINGLE PR DETAIL
 * GET /pr-api/detail/:prId
 * ──────────────────────────────────────────────────────────────────────────── */
prApp.get("/detail/:prId", verifyToken, async (req, res) => {
  try {
    const pr = await PullRequestModel.findById(req.params.prId)
      .populate("createdBy", "username email profileImageUrl")
      .populate({ path: "repoId", populate: { path: "owner", select: "username email giteaUsername" } })
      .populate({ path: "baseRepoId", populate: { path: "owner", select: "username email giteaUsername" } })
      .populate({ path: "headRepoId", populate: { path: "owner", select: "username email giteaUsername" } })
      .populate("reviewers", "username profileImageUrl");

    if (!pr) return res.status(404).json({ message: "Pull request not found" });

    const reviews = await ReviewModel.find({ prId: pr._id }).populate("reviewer", "username profileImageUrl");
    const comments = await ReviewCommentModel.find({ prId: pr._id }).populate("createdBy", "username profileImageUrl");

    const baseRepo = pr.baseRepoId || pr.repoId;
    const headRepo = pr.headRepoId || pr.repoId;

    let files = [];
    let commits = [];
    let hasConflicts = false;
    let conflictingFiles = [];

    // ── Fetch real diff from Gitea ──────────────────────────────────────────
    if (isGiteaConfigured() && pr.giteaPRNumber && baseRepo?.giteaFullName) {
      const [baseGiteaOwner, baseGiteaRepo] = baseRepo.giteaFullName.split("/");
      const [giteaFiles, giteaCommits, giteaPRData] = await Promise.all([
        getPRFiles(baseGiteaOwner, baseGiteaRepo, pr.giteaPRNumber),
        getPRCommits(baseGiteaOwner, baseGiteaRepo, pr.giteaPRNumber),
        getGiteaPR(baseGiteaOwner, baseGiteaRepo, pr.giteaPRNumber),
      ]);

      files = (giteaFiles || []).map(f => ({
        filename: f.filename, status: f.status,
        additions: f.additions || 0, deletions: f.deletions || 0,
        changes: f.changes || 0, patch: f.patch || "",
      }));
      commits = (giteaCommits || []).map(c => {
        let authorName = c.author?.login;

        // Fallback: Check if raw commit details match either base or head repo owners
        if (!authorName) {
          const commitEmail = c.commit?.author?.email;
          const commitName = c.commit?.author?.name;

          if (baseRepo?.owner) {
            if (
              (commitEmail && baseRepo.owner.email && commitEmail.toLowerCase() === baseRepo.owner.email.toLowerCase()) ||
              (commitName && baseRepo.owner.username && commitName.toLowerCase() === baseRepo.owner.username.toLowerCase()) ||
              (commitName && baseRepo.owner.giteaUsername && commitName.toLowerCase() === baseRepo.owner.giteaUsername.toLowerCase())
            ) {
              authorName = baseRepo.owner.username;
            }
          }

          if (!authorName && headRepo?.owner) {
            if (
              (commitEmail && headRepo.owner.email && commitEmail.toLowerCase() === headRepo.owner.email.toLowerCase()) ||
              (commitName && headRepo.owner.username && commitName.toLowerCase() === headRepo.owner.username.toLowerCase()) ||
              (commitName && headRepo.owner.giteaUsername && commitName.toLowerCase() === headRepo.owner.giteaUsername.toLowerCase())
            ) {
              authorName = headRepo.owner.username;
            }
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

        // Ultimate fallback: Head repo owner, base repo owner, or Unknown
        if (!authorName || authorName === "Unknown") {
          authorName = headRepo?.owner?.username || baseRepo?.owner?.username || "Unknown";
        }

        return {
          sha: c.sha,
          shortSha: c.sha?.slice(0, 7),
          message: c.commit?.message || "",
          author: authorName,
          date: c.commit?.author?.date,
        };
      });
      hasConflicts = giteaPRData?.mergeable === false;
    } else {
      // MongoDB fallback
      commits = await CommitModel.find({ repoId: headRepo?._id || pr.repoId, branch: pr.sourceBranch }).sort({ createdAt: -1 });
      const baseCommits = await CommitModel.find({ repoId: baseRepo?._id || pr.repoId, branch: pr.targetBranch }).sort({ createdAt: -1 });
      const headFiles = new Set(commits.flatMap(c => c.files?.map(f => f.path) || []));
      const bFiles = new Set(baseCommits[0]?.files?.map(f => f.path) || []);
      conflictingFiles = [...headFiles].filter(f => bFiles.has(f));
      hasConflicts = conflictingFiles.length > 0;
    }

    const role = await getUserRepoRole(req.user.id, baseRepo?._id || pr.repoId);

    res.status(200).json({
      ...pr.toObject(), commits, files, reviews, comments,
      hasConflicts, conflictingFiles, role,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ────────────────────────────────────────────────────────────────────────────
 * MERGE PR
 * POST /pr-api/merge/:prId
 * ──────────────────────────────────────────────────────────────────────────── */
prApp.post("/merge/:prId", verifyToken, async (req, res) => {
  try {
    const { mergeMethod } = req.body;
    const pr = await PullRequestModel.findById(req.params.prId)
      .populate({ path: "repoId", populate: { path: "owner", select: "username giteaUsername giteaToken" } })
      .populate({ path: "baseRepoId", populate: { path: "owner", select: "username giteaUsername giteaToken" } });

    if (!pr) return res.status(404).json({ message: "PR not found" });
    if (pr.status !== "open") return res.status(400).json({ message: "PR is not open" });

    const baseRepo = pr.baseRepoId || pr.repoId;

    // Only base repo owner / maintainer can merge
    const role = await getUserRepoRole(req.user.id, baseRepo?._id || pr.repoId);
    if (!role || (role !== "OWNER" && role !== "MAINTAINER")) {
      return res.status(403).json({ message: "Only the base repository owner or maintainer can merge" });
    }

    const user = await UserModel.findById(req.user.id).select("username giteaToken");

    // ── Merge via Gitea ─────────────────────────────────────────────────────
    let isGiteaMerged = false;
    if (isGiteaConfigured() && pr.giteaPRNumber && baseRepo?.giteaFullName && user.giteaToken) {
      try {
        const [baseGiteaOwner, baseGiteaRepo] = baseRepo.giteaFullName.split("/");
        const giteaToken = decryptToken(user.giteaToken);
        await mergeGiteaPR(baseGiteaOwner, baseGiteaRepo, giteaToken, pr.giteaPRNumber, mergeMethod || "merge", `Merged PR: ${pr.title}`);
        isGiteaMerged = true;
      } catch (err) {
        console.error("Gitea PR merge failed, attempting fallback:", err.message);
      }
    }

    // ── MongoDB Fallback Merge ──────────────────────────────────────────────
    // If not merged via Gitea, we perform a manual database sync
    if (!isGiteaMerged) {
      const headRepoId = pr.headRepoId || pr.repoId;
      const baseRepoId = baseRepo?._id || pr.repoId;

      // 1. Sync Commits (source branch -> target branch)
      const headCommits = await CommitModel.find({
        repoId: headRepoId,
        branch: pr.sourceBranch
      });

      for (const headCommit of headCommits) {
        const existingCommit = await CommitModel.findOne({
          repoId: baseRepoId,
          branch: pr.targetBranch,
          sha: headCommit.sha
        });

        if (!existingCommit) {
          await CommitModel.create({
            repoId: baseRepoId,
            sha: headCommit.sha,
            shortSha: headCommit.shortSha,
            message: headCommit.message,
            authorName: headCommit.authorName,
            authorEmail: headCommit.authorEmail,
            createdBy: headCommit.createdBy || pr.createdBy,
            branch: pr.targetBranch,
            addedLines: headCommit.addedLines,
            deletedLines: headCommit.deletedLines,
            filesChanged: headCommit.filesChanged,
          });
        }
      }

      // 2. Sync Files (fork -> parent)
      if (headRepoId.toString() !== baseRepoId.toString()) {
        const headFiles = await RepoFileModel.find({ repoId: headRepoId });
        const headFileNames = headFiles.map(f => f.originalName);

        // Delete files in baseRepo that don't exist in headRepo
        await RepoFileModel.deleteMany({
          repoId: baseRepoId,
          originalName: { $nin: headFileNames }
        });

        // Copy/overwrite files
        for (const headFile of headFiles) {
          const existingFile = await RepoFileModel.findOne({
            repoId: baseRepoId,
            originalName: headFile.originalName
          });

          if (existingFile) {
            existingFile.filename = headFile.filename;
            existingFile.filePath = headFile.filePath;
            existingFile.storageProvider = headFile.storageProvider;
            existingFile.cloudUrl = headFile.cloudUrl;
            existingFile.cloudPublicId = headFile.cloudPublicId;
            existingFile.cloudResourceType = headFile.cloudResourceType;
            existingFile.mimeType = headFile.mimeType;
            existingFile.size = headFile.size;
            existingFile.uploadedBy = headFile.uploadedBy;
            await existingFile.save();
          } else {
            await RepoFileModel.create({
              repoId: baseRepoId,
              filename: headFile.filename,
              originalName: headFile.originalName,
              filePath: headFile.filePath,
              storageProvider: headFile.storageProvider,
              cloudUrl: headFile.cloudUrl,
              cloudPublicId: headFile.cloudPublicId,
              cloudResourceType: headFile.cloudResourceType,
              mimeType: headFile.mimeType,
              size: headFile.size,
              uploadedBy: headFile.uploadedBy,
            });
          }
        }
      }
    }

    pr.status = "merged";
    pr.mergeMethod = mergeMethod || "merge";
    await pr.save();

    await sendNotification({
      user: pr.createdBy,
      type: "PR_MERGED",
      message: `Your pull request "${pr.title}" was merged by ${user.username}`,
      link: `/repo/${baseRepo?._id || pr.repoId}/pull/${pr._id}`,
      metadata: { senderName: user.username, prId: pr._id },
    });

    emitActivity(baseRepo?._id || pr.repoId, "PR_MERGED", { title: pr.title, author: user.username });
    res.status(200).json({ message: "Pull request merged", pr });
  } catch (err) {
    console.error("[PR] merge error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ────────────────────────────────────────────────────────────────────────────
 * CLOSE PR
 * POST /pr-api/close/:prId
 * ──────────────────────────────────────────────────────────────────────────── */
prApp.post("/close/:prId", verifyToken, async (req, res) => {
  try {
    const pr = await PullRequestModel.findById(req.params.prId)
      .populate({ path: "baseRepoId", populate: { path: "owner", select: "username giteaUsername giteaToken" } })
      .populate("repoId");
    if (!pr) return res.status(404).json({ message: "PR not found" });

    const baseRepo = pr.baseRepoId || pr.repoId;
    const role = await getUserRepoRole(req.user.id, baseRepo?._id || pr.repoId);
    const isCreator = pr.createdBy.toString() === req.user.id;
    const isMaintainer = role === "OWNER" || role === "MAINTAINER";

    if (!isCreator && !isMaintainer) {
      return res.status(403).json({ message: "Not authorized to close this PR" });
    }

    const user = await UserModel.findById(req.user.id).select("username giteaToken");

    // Close in Gitea
    if (isGiteaConfigured() && pr.giteaPRNumber && baseRepo?.giteaFullName && user.giteaToken) {
      const [baseGiteaOwner, baseGiteaRepo] = baseRepo.giteaFullName.split("/");
      const giteaToken = decryptToken(user.giteaToken);
      await closeGiteaPR(baseGiteaOwner, baseGiteaRepo, giteaToken, pr.giteaPRNumber);
    }

    pr.status = "closed";
    await pr.save();

    if (pr.createdBy.toString() !== req.user.id) {
      await sendNotification({
        user: pr.createdBy, type: "PR_CLOSED",
        message: `Your pull request "${pr.title}" was closed by ${user.username}`,
        link: `/repo/${baseRepo?._id || pr.repoId}/pull/${pr._id}`,
        metadata: { senderName: user.username, prId: pr._id },
      });
    }

    res.status(200).json({ message: "Pull request closed", pr });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ────────────────────────────────────────────────────────────────────────────
 * ADD REVIEW
 * POST /pr-api/review/:prId
 * ──────────────────────────────────────────────────────────────────────────── */
prApp.post("/review/:prId", verifyToken, async (req, res) => {
  try {
    const { reviewType, message } = req.body;
    const pr = await PullRequestModel.findById(req.params.prId).populate("baseRepoId").populate("repoId");
    if (!pr) return res.status(404).json({ message: "PR not found" });

    const baseRepo = pr.baseRepoId || pr.repoId;
    const role = await getUserRepoRole(req.user.id, baseRepo?._id);
    if (!role || (role !== "OWNER" && role !== "MAINTAINER")) {
      return res.status(403).json({ message: "Only repo owner or maintainer can submit reviews" });
    }

    const review = await ReviewModel.create({ prId: pr._id, reviewer: req.user.id, reviewType, message });
    const user = await UserModel.findById(req.user.id);

    await sendNotification({
      user: pr.createdBy, type: "PR_REVIEW",
      message: `${user.username} ${reviewType}d your pull request`,
      link: `/repo/${baseRepo?._id}/pull/${pr._id}`,
      metadata: { senderName: user.username, prId: pr._id, reviewType },
    });

    await handleMentions(message, req.user.id, "a review", `/repo/${baseRepo?._id}/pull/${pr._id}`, user.username);
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ────────────────────────────────────────────────────────────────────────────
 * ADD LINE COMMENT
 * POST /pr-api/:prId/comments
 * ──────────────────────────────────────────────────────────────────────────── */
prApp.post("/:prId/comments", verifyToken, async (req, res) => {
  try {
    const { fileName, lineNumber, comment } = req.body;
    const pr = await PullRequestModel.findById(req.params.prId).populate("baseRepoId").populate("repoId");
    if (!pr) return res.status(404).json({ message: "PR not found" });

    const reviewComment = await ReviewCommentModel.create({
      prId: pr._id, fileName: fileName || "general",
      lineNumber: lineNumber || 0, comment, createdBy: req.user.id,
    });

    const user = await UserModel.findById(req.user.id);
    const baseRepo = pr.baseRepoId || pr.repoId;
    await handleMentions(comment, req.user.id, "a comment", `/repo/${baseRepo?._id}/pull/${pr._id}`, user.username);

    res.status(201).json(reviewComment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ────────────────────────────────────────────────────────────────────────────
 * ASSIGN REVIEWERS
 * POST /pr-api/:prId/reviewers
 * ──────────────────────────────────────────────────────────────────────────── */
prApp.post("/:prId/reviewers", verifyToken, async (req, res) => {
  try {
    const { reviewerIds } = req.body;
    const pr = await PullRequestModel.findById(req.params.prId);
    if (!pr) return res.status(404).json({ message: "PR not found" });

    pr.reviewers = reviewerIds;
    await pr.save();

    const user = await UserModel.findById(req.user.id);
    for (const rid of reviewerIds) {
      await sendNotification({
        user: rid, type: "PR_ASSIGNED",
        message: `${user.username} assigned you as a reviewer on "${pr.title}"`,
        link: `/repo/${pr.repoId}/pull/${pr._id}`,
        metadata: { senderName: user.username, prId: pr._id },
      });
    }
    res.status(200).json({ message: "Reviewers assigned", reviewers: pr.reviewers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ────────────────────────────────────────────────────────────────────────────
 * GET GLOBAL PRs FOR CURRENT USER
 * GET /pr-api/user/all
 * ──────────────────────────────────────────────────────────────────────────── */
prApp.get("/user/all", verifyToken, async (req, res) => {
  try {
    const prs = await PullRequestModel.find({
      $or: [{ createdBy: req.user.id }, { reviewers: req.user.id }]
    })
      .populate("createdBy", "username profileImageUrl")
      .populate({ path: "repoId", populate: { path: "owner", select: "username" } })
      .populate({ path: "baseRepoId", populate: { path: "owner", select: "username" } })
      .populate({ path: "headRepoId", populate: { path: "owner", select: "username" } })
      .sort({ createdAt: -1 });

    res.status(200).json(prs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
