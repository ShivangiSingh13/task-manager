import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { requireAuth } from "./middleware/auth.js";
import authRoutes from "./routes/authRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/todos", requireAuth, todoRoutes);
app.use("/api/notes", requireAuth, noteRoutes);
app.use("/api/quizzes", requireAuth, quizRoutes);

app.use("/api/*", (_req, res) => {
  res.status(404).json({ message: "API route not found" });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: Object.values(err.errors)
        .map((entry) => entry.message)
        .join(", ")
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid resource id" });
  }

  res.status(500).json({ message: err.message || "Internal server error" });
});

const start = async () => {
  await connectDB();
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
};

start().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
