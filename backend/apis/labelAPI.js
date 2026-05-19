import exp from "express";
import { LabelModel } from "../models/LabelModel.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { RepositoryModel } from "../models/RepositoryModel.js";

export const labelApp = exp.Router();

/* ─── GET REPO LABELS ──────────────────────────────────────── */
labelApp.get("/repo/:repoId", verifyToken, async (req, res, next) => {
  try {
    const labels = await LabelModel.find({ repoId: req.params.repoId });
    res.status(200).json(labels);
  } catch (err) {
    next(err);
  }
});

/* ─── CREATE LABEL ─────────────────────────────────────────── */
labelApp.post("/create", verifyToken, async (req, res, next) => {
  try {
    const { repoId, name, color, description } = req.body;

    if (!repoId || !name || !color) {
      return res.status(400).json({ message: "RepoId, Name, and Color are required" });
    }

    const label = await LabelModel.create({
      repoId,
      name,
      color,
      description: description || ""
    });

    res.status(201).json({ message: "Label created successfully", label });
  } catch (err) {
    next(err);
  }
});

/* ─── UPDATE LABEL ─────────────────────────────────────────── */
labelApp.patch("/:id", verifyToken, async (req, res, next) => {
  try {
    const { name, color, description } = req.body;
    const label = await LabelModel.findByIdAndUpdate(
      req.params.id,
      { name, color, description },
      { new: true }
    );

    if (!label) return res.status(404).json({ message: "Label not found" });

    res.status(200).json({ message: "Label updated successfully", label });
  } catch (err) {
    next(err);
  }
});

/* ─── DELETE LABEL ─────────────────────────────────────────── */
labelApp.delete("/:id", verifyToken, async (req, res, next) => {
  try {
    const label = await LabelModel.findByIdAndDelete(req.params.id);
    if (!label) return res.status(404).json({ message: "Label not found" });

    res.status(200).json({ message: "Label deleted successfully" });
  } catch (err) {
    next(err);
  }
});

export default labelApp;
