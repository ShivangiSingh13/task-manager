import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    explanation: { type: String, trim: true, default: "" },
    options: {
      type: [{ type: String, trim: true }],
      validate: {
        validator: (arr) => arr.length >= 2,
        message: "At least 2 options are required"
      }
    },
    answerIndex: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const attemptSchema = new mongoose.Schema(
  {
    score: { type: Number, required: true, min: 0 },
    totalQuestions: { type: Number, required: true, min: 1 },
    percentage: { type: Number, required: true, min: 0, max: 100 }
  },
  { _id: false, timestamps: true }
);

const quizSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium"
    },
    timerSeconds: { type: Number, min: 0, default: 0 },
    questions: {
      type: [questionSchema],
      validate: {
        validator: (arr) => arr.length >= 1,
        message: "At least 1 question is required"
      }
    },
    attempts: { type: [attemptSchema], default: [] }
  },
  { timestamps: true }
);

questionSchema.path("answerIndex").validate(function (value) {
  return Array.isArray(this.options) && value < this.options.length;
}, "Answer index must match one of the provided options");

export const Quiz = mongoose.model("Quiz", quizSchema);
