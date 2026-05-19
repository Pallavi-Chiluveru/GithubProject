import express from "express";
import { SpaceModel } from "../models/SpaceModel.js";

export const spaceApp = express.Router();

// GET all spaces
spaceApp.get("/", async (req, res, next) => {
  try {
    const spaces = await SpaceModel.find().sort({ createdAt: -1 });
    res.send({ message: "Spaces fetched successfully", payload: spaces });
  } catch (err) {
    next(err);
  }
});

// GET space by ID
spaceApp.get("/:id", async (req, res, next) => {
  try {
    const space = await SpaceModel.findById(req.params.id);
    if (!space) return res.status(404).send({ message: "Space not found" });
    res.send({ message: "Space fetched successfully", payload: space });
  } catch (err) {
    next(err);
  }
});

// POST new space
spaceApp.post("/", async (req, res, next) => {
  try {
    const spaceData = req.body;
    
    // Add default boilerplate if empty
    if (!spaceData.files || spaceData.files.length === 0) {
      spaceData.files = [
        { name: 'README.md', size: '1.2 KB', date: 'Just now', type: 'MD' },
        { name: 'config.json', size: '0.5 KB', date: 'Just now', type: 'JSON' }
      ];
    }
    if (!spaceData.tasks || spaceData.tasks.length === 0) {
      spaceData.tasks = [
        { id: 't1', title: 'Initialize workspace context', status: 'completed' },
        { id: 't2', title: 'Invite team members', status: 'pending' }
      ];
    }
    if (!spaceData.activity || spaceData.activity.length === 0) {
      spaceData.activity = [
        { user: 'System', action: 'created', target: spaceData.title, time: 'Just now' }
      ];
    }

    const space = new SpaceModel(spaceData);
    await space.save();
    res.send({ message: "Space created successfully", payload: space });
  } catch (err) {
    next(err);
  }
});

// DELETE space
spaceApp.delete("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    await SpaceModel.findByIdAndDelete(id);
    res.send({ message: "Space deleted successfully" });
  } catch (err) {
    next(err);
  }
});

// PATCH toggle star
spaceApp.patch("/:id/star", async (req, res, next) => {
  try {
    const id = req.params.id;
    const space = await SpaceModel.findById(id);
    if (!space) {
      return res.status(404).send({ message: "Space not found" });
    }
    space.isStarred = !space.isStarred;
    await space.save();
    res.send({ message: "Star toggled successfully", payload: space });
  } catch (err) {
    next(err);
  }
});
