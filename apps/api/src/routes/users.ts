import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { prisma } from "../services/db";
import { createError } from "../middleware/errorHandler";

export const usersRouter = Router();

// GET /api/users/me
usersRouter.get("/me", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: {
        id: true, username: true, email: true,
        avatarUrl: true, bio: true, createdAt: true,
        _count: { select: { submissions: true } },
      },
    });
    if (!user) throw createError("User not found", 404);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:username
usersRouter.get("/:username", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
      select: {
        id: true, username: true, avatarUrl: true, bio: true, createdAt: true,
        _count: { select: { submissions: true } },
      },
    });
    if (!user) throw createError("User not found", 404);
    res.json(user);
  } catch (err) {
    next(err);
  }
});
