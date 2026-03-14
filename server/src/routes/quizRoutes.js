import express from "express";
import { Quiz } from "../models/Quiz.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

const buildSearchQuery = (query, difficulty) => {
  const conditions = [];

  if (query?.trim()) {
    conditions.push({ title: { $regex: query.trim(), $options: "i" } });
  }

  if (difficulty?.trim()) {
    conditions.push({ difficulty: difficulty.trim() });
  }

  if (conditions.length === 0) {
    return {};
  }

  return { $and: conditions };
};

const getSort = (sort) => {
  switch (sort) {
    case "title":
      return { title: 1 };
    case "difficulty":
      return { difficulty: 1, createdAt: -1 };
    case "oldest":
      return { createdAt: 1 };
    default:
      return { createdAt: -1 };
  }
};

router.get(
  "/",
  asyncHandler(async (_req, res) => {
  const quizzes = await Quiz.find({
    owner: _req.user._id,
    ...buildSearchQuery(_req.query.q, _req.query.difficulty)
  }).sort(getSort(_req.query.sort));
  res.json(quizzes);
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
  if (!req.body.title?.trim()) {
    return res.status(400).json({ message: "Quiz title is required" });
  }

  const quiz = await Quiz.create({
    owner: req.user._id,
    title: req.body.title,
    difficulty: req.body.difficulty,
    timerSeconds: req.body.timerSeconds,
    questions: req.body.questions || []
  });
  res.status(201).json(quiz);
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const updated = await Quiz.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      {
        title: req.body.title,
        difficulty: req.body.difficulty,
        timerSeconds: req.body.timerSeconds,
        questions: req.body.questions || []
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.json(updated);
  })
);

router.post(
  "/:id/attempts",
  asyncHandler(async (req, res) => {
    const score = Number(req.body.score);
    const totalQuestions = Number(req.body.totalQuestions);

    if (!Number.isFinite(score) || !Number.isFinite(totalQuestions) || totalQuestions <= 0) {
      return res.status(400).json({ message: "Valid score and total question count are required" });
    }

    const percentage = Math.round((score / totalQuestions) * 100);

    const quiz = await Quiz.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      {
        $push: {
          attempts: {
            $each: [{ score, totalQuestions, percentage }],
            $slice: -10
          }
        }
      },
      { new: true, runValidators: true }
    );

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.status(201).json(quiz.attempts.at(-1));
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
  const deleted = await Quiz.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

  if (!deleted) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  res.json({ message: "Quiz deleted" });
  })
);

export default router;
