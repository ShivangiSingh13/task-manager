import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.replace("Bearer ", "").trim();
};

export const createToken = (user) =>
  jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET || "dev-secret-change-me", {
    expiresIn: "7d"
  });

export const requireAuth = asyncHandler(async (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret-change-me");
  const user = await User.findById(payload.userId).select("name email");

  if (!user) {
    return res.status(401).json({ message: "User account no longer exists" });
  }

  req.user = user;
  next();
});