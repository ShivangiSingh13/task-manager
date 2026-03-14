import express from "express";
import { Note } from "../models/Note.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

const buildSearchQuery = (query) => {
  if (!query?.trim()) {
    return {};
  }

  return {
    $or: [
      { title: { $regex: query.trim(), $options: "i" } },
      { content: { $regex: query.trim(), $options: "i" } }
    ]
  };
};

const getSort = (sort) => {
  switch (sort) {
    case "title":
      return { title: 1 };
    case "oldest":
      return { createdAt: 1 };
    default:
      return { updatedAt: -1 };
  }
};

router.get(
  "/",
  asyncHandler(async (_req, res) => {
  const notes = await Note.find({
    owner: _req.user._id,
    ...buildSearchQuery(_req.query.q)
  }).sort(getSort(_req.query.sort));
  res.json(notes);
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
  if (!req.body.title?.trim() || !req.body.content?.trim()) {
    return res.status(400).json({ message: "Title and content are required" });
  }

  const note = await Note.create({
    owner: req.user._id,
    title: req.body.title,
    content: req.body.content
  });
  res.status(201).json(note);
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    if (!req.body.title?.trim() || !req.body.content?.trim()) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const updated = await Note.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      {
        title: req.body.title,
        content: req.body.content
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json(updated);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
  const deleted = await Note.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

  if (!deleted) {
    return res.status(404).json({ message: "Note not found" });
  }

  res.json({ message: "Note deleted" });
  })
);

export default router;
