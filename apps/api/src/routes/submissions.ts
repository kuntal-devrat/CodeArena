import { Router } from "express";
import { z } from "zod";
import { optionalAuth, AuthRequest } from "../middleware/auth";
import { prisma } from "../services/db";
import { judgeService } from "../services/judge";
import { createError } from "../middleware/errorHandler";
import { getComprehensiveTestCases, TestCase } from "../services/testcaseGenerator";

export const submissionsRouter = Router();

async function getOrCreateUserId(req: AuthRequest): Promise<string> {
  if (req.userId) return req.userId;
  const guest = await prisma.user.upsert({
    where: { id: "guest-user" },
    update: {},
    create: {
      id: "guest-user",
      username: "GuestCoder",
      email: "guest@codearena.local",
      passwordHash: "none",
    },
  });
  return guest.id;
}

const submitSchema = z.object({
  problemId: z.string(),
  language: z.enum(["python", "javascript", "typescript", "java", "cpp", "go", "rust"]),
  code: z.string().max(65536),
  isRun: z.boolean().default(false), // true = run against sample cases only
});

const runSchema = z.object({
  problemId: z.string().optional(),
  language: z.enum(["python", "javascript", "typescript", "java", "cpp", "go", "rust"]),
  code: z.string().max(65536),
  testCases: z.array(z.object({
    input: z.string(),
    expected: z.string().optional(),
  })).optional(),
});

// POST /api/submissions/run — run code interactively against sample or custom test cases
submissionsRouter.post("/run", async (req, res, next) => {
  try {
    const body = runSchema.parse(req.body);

    let testCases: TestCase[] = (body.testCases as TestCase[]) || [];
    if (!testCases || testCases.length === 0) {
      if (!body.problemId) {
        throw createError("problemId or testCases are required", 400);
      }
      const problem = await prisma.problem.findUnique({
        where: { id: body.problemId },
        select: { id: true, slug: true, testCases: true },
      });
      if (!problem) throw createError("Problem not found", 404);
      let parsed: TestCase[] = [];
      try {
        parsed = (typeof problem.testCases === "string" ? JSON.parse(problem.testCases) : (problem.testCases as any)) || [];
      } catch {
        parsed = [];
      }
      testCases = getComprehensiveTestCases(problem.slug, parsed, true);
    }

    const result = await judgeService.run({
      code: body.code,
      language: body.language,
      testCases: (testCases || []).map((tc) => ({
        input: tc.input,
        expected: tc.expected ?? "",
      })),
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/submissions
submissionsRouter.post("/", optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const body = submitSchema.parse(req.body);
    const userId = await getOrCreateUserId(req);

    const problem = await prisma.problem.findUnique({
      where: { id: body.problemId },
      select: { id: true, slug: true, testCases: true },
    });
    if (!problem) throw createError("Problem not found", 404);

    let parsedTestCases: TestCase[] = [];
    try {
      parsedTestCases = typeof problem.testCases === "string" ? JSON.parse(problem.testCases) : (problem.testCases as any) || [];
    } catch {
      parsedTestCases = [];
    }

    // Comprehensive test cases for Submit mode
    const finalTestCases = getComprehensiveTestCases(problem.slug, parsedTestCases, body.isRun);

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
        testCases: finalTestCases,
        isRun: body.isRun,
      })
      .catch((err) => console.error("[judge] error", err));

    res.status(202).json({ submissionId: submission.id, verdict: "PENDING" });
  } catch (err) {
    next(err);
  }
});

// GET /api/submissions/:id
submissionsRouter.get("/:id", optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const sub = await prisma.submission.findUnique({
      where: { id: req.params.id },
      include: {
        problem: {
          select: {
            id: true,
            slug: true,
            title: true,
            difficulty: true,
          },
        },
      },
    });
    if (!sub) throw createError("Submission not found", 404);
    res.json(sub);
  } catch (err) {
    next(err);
  }
});

// GET /api/submissions?problemId=...
submissionsRouter.get("/", optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const { problemId, limit = "50" } = req.query as { problemId?: string; limit?: string };
    const where: any = {};
    if (problemId) where.problemId = problemId;
    if (req.userId) where.userId = req.userId;

    const subs = await prisma.submission.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      take: Math.min(parseInt(limit), 100),
      include: {
        problem: {
          select: {
            id: true,
            slug: true,
            title: true,
            difficulty: true,
          },
        },
      },
    });
    res.json(subs);
  } catch (err) {
    next(err);
  }
});
