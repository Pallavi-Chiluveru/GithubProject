import exp from "express";
import { ProjectModel } from "../models/ProjectModel.js";
import { verifyToken } from "../middleware/verifyToken.js";

export const projectApp = exp.Router();

/* ---------------- GET PROJECTS OF REPO ---------------- */
projectApp.get("/:repoId", verifyToken, async (req, res) => {
  try {
    const projects = await ProjectModel.find({ repoId: req.params.repoId })
      .populate("createdBy", "username profileImageUrl")
      .sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- CREATE PROJECT ---------------- */
projectApp.post("/:repoId", verifyToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const { repoId } = req.params;

    // Default columns for Kanban
    const columns = [
      { id: "todo", name: "Todo", cards: [] },
      { id: "in_progress", name: "In Progress", cards: [] },
      { id: "done", name: "Done", cards: [] },
    ];

    const project = await ProjectModel.create({
      name,
      description,
      repoId,
      columns,
      createdBy: req.user.id,
    });

    res.status(201).json({
      message: "Project board created successfully",
      project,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- UPDATE PROJECT BOARD (COLUMNS / CARDS) ---------------- */
projectApp.put("/board/:projectId", verifyToken, async (req, res) => {
  try {
    const { columns } = req.body;
    const project = await ProjectModel.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.columns = columns;
    await project.save();

    res.status(200).json({
      message: "Project board updated successfully",
      project,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- DELETE PROJECT ---------------- */
projectApp.delete("/board/:projectId", verifyToken, async (req, res) => {
  try {
    const project = await ProjectModel.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await project.deleteOne();
    res.status(200).json({ message: "Project board deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
