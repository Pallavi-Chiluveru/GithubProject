import exp from "express";
import { WikiPageModel } from "../models/WikiPageModel.js";
import { verifyToken } from "../middleware/verifyToken.js";

export const wikiApp = exp.Router();

/* ---------------- GET ALL WIKI PAGES OF REPO ---------------- */
wikiApp.get("/:repoId", verifyToken, async (req, res) => {
  try {
    const pages = await WikiPageModel.find({ repoId: req.params.repoId })
      .populate("updatedBy", "username profileImageUrl")
      .sort({ updatedAt: -1 });
    res.status(200).json(pages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- GET SINGLE WIKI PAGE BY SLUG ---------------- */
wikiApp.get("/page/:repoId/:slug", verifyToken, async (req, res) => {
  try {
    const page = await WikiPageModel.findOne({
      repoId: req.params.repoId,
      slug: req.params.slug.toLowerCase(),
    }).populate("updatedBy", "username profileImageUrl");

    if (!page) {
      return res.status(404).json({ message: "Wiki page not found" });
    }

    res.status(200).json(page);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- CREATE OR UPDATE WIKI PAGE ---------------- */
wikiApp.post("/:repoId", verifyToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    const { repoId } = req.params;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    let page = await WikiPageModel.findOne({ repoId, slug });

    if (page) {
      page.title = title;
      page.content = content;
      page.updatedBy = req.user.id;
      await page.save();
    } else {
      page = await WikiPageModel.create({
        repoId,
        title,
        slug,
        content,
        updatedBy: req.user.id,
      });
    }

    res.status(200).json({
      message: "Wiki page saved successfully",
      page,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- DELETE WIKI PAGE ---------------- */
wikiApp.delete("/page/:repoId/:slug", verifyToken, async (req, res) => {
  try {
    const page = await WikiPageModel.findOne({
      repoId: req.params.repoId,
      slug: req.params.slug.toLowerCase(),
    });

    if (!page) {
      return res.status(404).json({ message: "Wiki page not found" });
    }

    await page.deleteOne();
    res.status(200).json({ message: "Wiki page deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
