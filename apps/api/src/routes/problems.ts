import { Router } from "express";
import { prisma } from "../services/db";
import { requireAuth } from "../middleware/auth";
import { createError } from "../middleware/errorHandler";

export const problemsRouter = Router();

// GET /api/problems — list with filters
problemsRouter.get("/", async (req, res, next) => {
  try {
    const { difficulty, tag, search, skip = "0", take = "50" } = req.query as Record<string, string>;

    const problems = await prisma.problem.findMany({
      where: {
        ...(difficulty && { difficulty: difficulty as "EASY" | "MEDIUM" | "HARD" }),
        ...(tag && { tags: { has: tag } }),
        ...(search && { title: { contains: search, mode: "insensitive" } }),
      },
      select: {
        id: true,
        slug: true,
        title: true,
        difficulty: true,
        tags: true,
        createdAt: true,
      },
      skip: parseInt(skip),
      take: Math.min(parseInt(take), 100),
      orderBy: { createdAt: "asc" },
    });

    res.json({ problems, total: problems.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/problems/:slug
problemsRouter.get("/:slug", async (req, res, next) => {
  try {
    const problem = await prisma.problem.findUnique({
      where: { slug: req.params.slug },
      select: {
        id: true, slug: true, title: true, difficulty: true,
        tags: true, description: true, examples: true,
        constraints: true, starterCode: true,
      },
    });
    if (!problem) throw createError("Problem not found", 404);
    res.json(problem);
  } catch (err) {
    next(err);
  }
});
