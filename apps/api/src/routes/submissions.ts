import { Router } from "express";
import { z } from "zod";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { prisma } from "../services/db";
import { judgeService } from "../services/judge";
import { createError } from "../middleware/errorHandler";

export const submissionsRouter = Router();

const submitSchema = z.object({
  problemId: z.string(),
  language: z.enum(["python", "javascript", "typescript", "java", "cpp", "go", "rust"]),
  code: z.string().max(65536),
  isRun: z.boolean().default(false), // true = run against sample cases only
});

// POST /api/submissions
submissionsRouter.post("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const body = submitSchema.parse(req.body);
    const userId = req.userId!;

    const problem = await prisma.problem.findUnique({
      where: { id: body.problemId },
      select: { id: true, testCases: true },
    });
    if (!problem) throw createError("Problem not found", 404);

    // Create a pending submission record
    const submission = await prisma.submission.create({
      data: {
        userId,
        problemId: body.problemId,
        language: body.language,
        code: body.code,
        verdict: "PENDING",
      },
    });

    // Send to judge (async — result comes back via webhook / polling)
    judgeService
      .judge({
        submissionId: submission.id,
        code: body.code,
        language: body.language,
        testCases: problem.testCases as object[],
        isRun: body.isRun,
      })
      .catch((err) => console.error("[judge] error", err));

    res.status(202).json({ submissionId: submission.id, verdict: "PENDING" });
  } catch (err) {
    next(err);
  }
});

// GET /api/submissions/:id
submissionsRouter.get("/:id", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const sub = await prisma.submission.findUnique({ where: { id: req.params.id } });
    if (!sub) throw createError("Submission not found", 404);
    if (sub.userId !== req.userId) throw createError("Forbidden", 403);
    res.json(sub);
  } catch (err) {
    next(err);
  }
});

// GET /api/submissions?problemId=...
submissionsRouter.get("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { problemId } = req.query as { problemId?: string };
    const subs = await prisma.submission.findMany({
      where: { userId: req.userId!, ...(problemId && { problemId }) },
      orderBy: { submittedAt: "desc" },
      take: 20,
    });
    res.json(subs);
  } catch (err) {
    next(err);
  }
});
