import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { authRouter } from "./routes/auth";
import { problemsRouter } from "./routes/problems";
import { submissionsRouter } from "./routes/submissions";
import { roomsRouter } from "./routes/rooms";
import { usersRouter } from "./routes/users";
import { errorHandler } from "./middleware/errorHandler";

export const app = express();

// ─── Core middleware ──────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.WEB_URL ?? "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// ─── Health ───────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/problems", problemsRouter);
app.use("/api/submissions", submissionsRouter);
app.use("/api/rooms", roomsRouter);
app.use("/api/users", usersRouter);

// ─── Error handler ────────────────────────────────────────────────────────────
app.use(errorHandler);
