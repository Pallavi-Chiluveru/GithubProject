import exp from "express";
import fs from "fs";
import path from "path";

import { upload } from "../utils/multer.js";
import { RepoFileModel } from "../models/RepoFileModel.js";
import { RepositoryModel } from "../models/RepositoryModel.js";
import { UserModel } from "../models/UserModel.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { checkRepoPermission } from "../middleware/repoAuth.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudStorage.js";
import { isGiteaConfigured, userClient, adminClient } from "../services/giteaClient.js";
import { decryptToken } from "../utils/encrypt.js";

import { getIO } from "../socket.js";

export const fileApp = exp.Router();

// Helper to notify repo room
const notifyRepo = (repoId, event, data) => {
  try {
    getIO().to(repoId.toString()).emit(event, data);
  } catch (err) {
    console.error("Socket notification failed:", err);
  }
};

/* UPLOAD FILE */
fileApp.post("/:repoId/upload", verifyToken, checkRepoPermission("WRITE"), upload.single("file"), async (req, res) => {
  try {
    const cloudFile = await uploadToCloudinary(req.file);

    const file = await RepoFileModel.create({
      repoId: req.params.repoId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      storageProvider: cloudFile ? "cloudinary" : "local",
      cloudUrl: cloudFile?.url || "",
      cloudPublicId: cloudFile?.publicId || "",
      cloudResourceType: cloudFile?.resourceType || "",
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user.id,
    });

    // ── Sync to Gitea if repo is Gitea synced ───────────────────────────
    const repo = await RepositoryModel.findById(req.params.repoId).populate("owner");
    if (isGiteaConfigured() && repo?.giteaFullName) {
      const [giteaUser, giteaRepo] = repo.giteaFullName.split("/");
      let userToken = null;
      const currentUser = await UserModel.findById(req.user.id).select("giteaToken").lean();
      if (currentUser?.giteaToken) {
        userToken = decryptToken(currentUser.giteaToken);
      }

      const fileContentBase64 = fs.readFileSync(req.file.path).toString("base64");
      const client = userToken ? userClient(userToken) : adminClient();
      
      try {
        let existingSha = null;
        try {
          const existRes = await client.get(`/repos/${giteaUser}/${giteaRepo}/contents/${req.file.originalname}`);
          existingSha = existRes.data?.sha;
        } catch (_) {}

        await client.put(`/repos/${giteaUser}/${giteaRepo}/contents/${req.file.originalname}`, {
          content: fileContentBase64,
          sha: existingSha || undefined,
          message: `Upload ${req.file.originalname}`,
          branch: repo.defaultBranch || "main"
        });
      } catch (giteaErr) {
        console.error("Failed to commit uploaded file to Gitea:", giteaErr.response?.data?.message || giteaErr.message);
      }
    }

    notifyRepo(req.params.repoId, "file_added", file);

    res.status(201).json({
      message: "File uploaded",
      file,
    });
  } catch (err) {
    console.error("FILE API ERROR:", err);
    res.status(500).json({ message: err.message, stack: err.stack });
  }
});

/* GET ALL FILES IN REPO */
fileApp.get("/:repoId/files", verifyToken, checkRepoPermission("READ"), async (req, res) => {
  try {
    const files = await RepoFileModel.find({
      repoId: req.params.repoId,
    }).select("_id originalName filename mimeType size createdAt storageProvider cloudUrl");

    res.status(200).json(files);
  } catch (err) {
    console.error("FILE API ERROR:", err);
    res.status(500).json({ message: err.message, stack: err.stack });
  }
});

/* DOWNLOAD FILE */
fileApp.get("/download/:fileId", verifyToken, async (req, res) => {
  try {
    const file = await RepoFileModel.findById(req.params.fileId);
    if (!file) return res.status(404).json({ message: "File not found" });

    // Internal permission check using repoAuth logic (but manually here since we need fileId)
    // We can use a trick: temporarily attach repoId to params for the middleware if we wanted, 
    // but let's just do a quick check or better, refactor middleware.
    // For now, let's just check RepositoryModel.
    const repo = await RepositoryModel.findById(file.repoId);
    if (!repo) return res.status(404).json({ message: "Repo not found" });
    
    // Use the logic from our updated repoAuth (simplified here)
    const isOwner = repo.owner.toString() === req.user.id;
    const isCollab = (repo.collaborators || []).some(id => id.toString() === req.user.id);
    if (!isOwner && !isCollab && repo.visibility !== "PUBLIC") {
       return res.status(403).json({ message: "Access denied" });
    }

    if (file.cloudUrl) {
      const cloudResponse = await fetch(file.cloudUrl);
      if (!cloudResponse.ok) return res.status(502).json({ message: "Unable to download from Cloudinary" });
      const buffer = Buffer.from(await cloudResponse.arrayBuffer());
      res.setHeader("Content-Type", file.mimeType || "application/octet-stream");
      res.setHeader("Content-Disposition", `attachment; filename="${file.originalName}"`);
      return res.send(buffer);
    }

    return res.download(path.resolve(file.filePath), file.originalName);
  } catch (err) {
    console.error("FILE API ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* GET FILE CONTENT */
fileApp.get("/content/:fileId", verifyToken, async (req, res) => {
  try {
    const file = await RepoFileModel.findById(req.params.fileId);
    if (!file) return res.status(404).json({ message: "File not found" });

    const repo = await RepositoryModel.findById(file.repoId);
    if (!repo) return res.status(404).json({ message: "Repo not found" });
    
    const isOwner = repo.owner.toString() === req.user.id;
    const isCollab = (repo.collaborators || []).some(id => id.toString() === req.user.id);
    if (!isOwner && !isCollab && repo.visibility !== "PUBLIC") {
       return res.status(403).json({ message: "Access denied" });
    }

    if (!file.mimeType?.startsWith("text/") && !file.originalName.match(/\.(js|jsx|json|css|html|md|txt|py|java|c|cpp|h|ts|tsx)$/i)) {
      return res.status(400).json({ message: "Only text files can be edited" });
    }

    let content;
    if (file.cloudUrl) {
      const cloudResponse = await fetch(file.cloudUrl);
      if (!cloudResponse.ok) return res.status(502).json({ message: "Unable to read from Cloudinary" });
      content = await cloudResponse.text();
    } else {
      if (fs.existsSync(file.filePath)) {
        content = fs.readFileSync(file.filePath, "utf8");
      } else {
        content = ""; // or handle error
      }
    }

    res.status(200).json({ file, content });
  } catch (err) {
    console.error("FILE API ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* UPDATE FILE CONTENT */
fileApp.put("/content/:fileId", verifyToken, async (req, res) => {
  try {
    const file = await RepoFileModel.findById(req.params.fileId);
    if (!file) return res.status(404).json({ message: "File not found" });

    const repo = await RepositoryModel.findById(file.repoId);
    if (repo.owner.toString() !== req.user.id && !(repo.collaborators || []).some(id => id.toString() === req.user.id)) {
       return res.status(403).json({ message: "Write access denied" });
    }

    const content = req.body.content || "";
    const dir = path.dirname(file.filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    fs.writeFileSync(file.filePath, content, "utf8");
    file.size = Buffer.byteLength(content);

    let cloudFile = null;
    try {
      cloudFile = await uploadToCloudinary({
        path: file.filePath,
        mimetype: file.mimeType || "text/plain",
        originalname: file.originalName,
      });
    } catch (cloudErr) {
      console.error("Cloudinary upload failed during edit, skipping:", cloudErr.message);
    }

    if (cloudFile) {
      file.storageProvider = "cloudinary";
      file.cloudUrl = cloudFile.url;
      file.cloudPublicId = cloudFile.publicId;
      file.cloudResourceType = cloudFile.resourceType;
    }

    await file.save();
    
    notifyRepo(file.repoId, "file_updated", file);

    res.status(200).json({ message: "File updated", file });
  } catch (err) {
    console.error("FILE API ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* DELETE FILE */
fileApp.delete("/:fileId", verifyToken, async (req, res) => {
  try {
    const file = await RepoFileModel.findById(req.params.fileId);
    if (!file) return res.status(404).json({ message: "File not found" });

    const repo = await RepositoryModel.findById(file.repoId);
    if (repo.owner.toString() !== req.user.id && !(repo.collaborators || []).some(id => id.toString() === req.user.id)) {
       return res.status(403).json({ message: "Write access denied" });
    }

    await deleteFromCloudinary(file);
    if (fs.existsSync(file.filePath)) fs.unlinkSync(file.filePath);
    await file.deleteOne();
    
    notifyRepo(repo._id, "file_deleted", { fileId: req.params.fileId });

    res.status(200).json({ message: "File deleted" });
  } catch (err) {
    console.error("FILE API ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});
