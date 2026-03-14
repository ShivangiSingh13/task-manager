import express from "express";
import { Todo } from "../models/Todo.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

const buildSearchQuery = (query) => {
  if (!query?.trim()) {
    return {};
  }

  return { title: { $regex: query.trim(), $options: "i" } };
};

const getSort = (sort) => {
  switch (sort) {
    case "title":
      return { title: 1 };
    case "completed":
      return { completed: -1, createdAt: -1 };
    case "oldest":
      return { createdAt: 1 };
    default:
      return { createdAt: -1 };
  }
};

router.get(
  "/",
  asyncHandler(async (_req, res) => {
  const items = await Todo.find({
    owner: _req.user._id,
    ...buildSearchQuery(_req.query.q)
  }).sort(getSort(_req.query.sort));
  res.json(items);
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
  if (!req.body.title?.trim()) {
    return res.status(400).json({ message: "Title is required" });
  }

    const item = await Todo.create({ owner: req.user._id, title: req.body.title });
  res.status(201).json(item);
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
  const updated = await Todo.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    {
      ...(req.body.title !== undefined ? { title: req.body.title } : {}),
      ...(req.body.completed !== undefined ? { completed: req.body.completed } : {})
    },
    { new: true, runValidators: true }
  );

  if (!updated) {
    return res.status(404).json({ message: "Todo not found" });
  }

  res.json(updated);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
  const deleted = await Todo.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

  if (!deleted) {
    return res.status(404).json({ message: "Todo not found" });
  }

  res.json({ message: "Todo deleted" });
  })
);

export default router;
