import { Router } from "express";
import { prisma } from "../services/db";
import { createError } from "../middleware/errorHandler";
import { execFile } from "child_process";
import * as path from "path";
import * as fs from "fs";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export const problemsRouter = Router();

/**
 * Execute the python leetcode scraper tool
 */
async function scrapeLeetCodeProblem(slugOrUrl: string): Promise<any> {
  const currentDir = typeof __dirname !== "undefined" ? __dirname : process.cwd();
  const rootDir = path.resolve(currentDir, currentDir.includes("routes") ? "../../../.." : ".");
  const winVenvPython = path.join(rootDir, "tools", "scraper", ".venv", "Scripts", "python.exe");
  const unixVenvPython = path.join(rootDir, "tools", "scraper", ".venv", "bin", "python");
  const scriptPath = path.join(rootDir, "tools", "scraper", "leetcode_scraper.py");

  let pythonBin = "python";
  if (process.platform === "win32" && fs.existsSync(winVenvPython)) {
    pythonBin = winVenvPython;
  } else if (fs.existsSync(unixVenvPython)) {
    pythonBin = unixVenvPython;
  }

  try {
    const { stdout } = await execFileAsync(pythonBin, [scriptPath, slugOrUrl, "--json"], {
      maxBuffer: 10 * 1024 * 1024,
      timeout: 30000,
      encoding: "utf-8",
    });
    return JSON.parse(stdout as string);
  } catch (venvErr: any) {
    // If venv python had an issue (e.g. numpy mismatch), fallback to system python
    if (pythonBin !== "python") {
      try {
        const { stdout } = await execFileAsync("python", [scriptPath, slugOrUrl, "--json"], {
          maxBuffer: 10 * 1024 * 1024,
          timeout: 30000,
          encoding: "utf-8",
        });
        return JSON.parse(stdout as string);
      } catch (sysErr: any) {
        throw createError(
          `Failed to scrape LeetCode problem '${slugOrUrl}': ${sysErr.stderr || sysErr.message}`,
          400
        );
      }
    }
    console.error("[scraper error]", venvErr);
    throw createError(
      `Failed to scrape LeetCode problem '${slugOrUrl}': ${venvErr.stderr || venvErr.message}`,
      400
    );
  }

}

// GET /api/problems/popular — list popular problems for quick import
problemsRouter.get("/popular", (_req, res) => {
  const popular = [
    { slug: "two-sum", title: "Two Sum", difficulty: "EASY" },
    { slug: "valid-parentheses", title: "Valid Parentheses", difficulty: "EASY" },
    { slug: "longest-substring-without-repeating-characters", title: "Longest Substring Without Repeating Characters", difficulty: "MEDIUM" },
    { slug: "reverse-linked-list", title: "Reverse Linked List", difficulty: "EASY" },
    { slug: "container-with-most-water", title: "Container With Most Water", difficulty: "MEDIUM" },
    { slug: "3sum", title: "3Sum", difficulty: "MEDIUM" },
    { slug: "climbing-stairs", title: "Climbing Stairs", difficulty: "EASY" },
    { slug: "trapping-rain-water", title: "Trapping Rain Water", difficulty: "HARD" },
    { slug: "best-time-to-buy-and-sell-stock", title: "Best Time to Buy and Sell Stock", difficulty: "EASY" },
    { slug: "invert-binary-tree", title: "Invert Binary Tree", difficulty: "EASY" },
  ];
  res.json({ problems: popular });
});

function cleanProblemDescription(desc: string): string {
  if (!desc) return "";
  let cleaned = desc.replace(/\xa0/g, " ").replace(/&nbsp;/g, " ");
  for (let i = 0; i < 5; i++) {
    cleaned = cleaned.replace(/(\n|\A)\s*Example\s*\d+\s*:\s*(?=(\n|\Z|Example\s*\d+\s*:|Constraints\s*:))/gi, "$1");
    cleaned = cleaned.replace(/(\n|\A)\s*Constraints\s*:\s*(?=(\n|\Z|Follow[- ]?up:))/gi, "$1");
  }
  return cleaned.replace(/\n{3,}/g, "\n\n").trim();
}

function formatProblem(p: any) {
  if (!p) return null;
  const parseJsonField = (val: any, defaultVal: any) => {
    if (typeof val !== "string") return val ?? defaultVal;
    try {
      return JSON.parse(val);
    } catch {
      return defaultVal;
    }
  };

  return {
    ...p,
    description: cleanProblemDescription(p.description),
    tags: parseJsonField(p.tags, []),
    examples: parseJsonField(p.examples, []),
    constraints: parseJsonField(p.constraints, []),
    starterCode: parseJsonField(p.starterCode, {}),
    testCases: parseJsonField(p.testCases, []),
  };
}


const ensureJsonStr = (val: any, defaultVal = "[]"): any => {
  if (typeof val === "string") return val;
  try {
    return JSON.stringify(val);
  } catch {
    return defaultVal;
  }
};

// POST /api/problems/import — import a problem from LeetCode via python leetscrape
problemsRouter.post("/import", async (req, res, next) => {
  try {
    const { slug, url } = req.body;
    const target = (slug || url || "").trim();
    if (!target) throw createError("Problem slug or URL is required", 400);

    const scraped = await scrapeLeetCodeProblem(target);

    // Upsert into database
    const problem = await prisma.problem.upsert({
      where: { slug: scraped.slug },
      update: {
        title: scraped.title,
        difficulty: scraped.difficulty,
        tags: ensureJsonStr(scraped.tags, "[]") as any,
        description: scraped.description,
        examples: ensureJsonStr(scraped.examples, "[]"),
        constraints: ensureJsonStr(scraped.constraints, "[]") as any,
        starterCode: ensureJsonStr(scraped.starterCode, "{}"),
        testCases: ensureJsonStr(scraped.testCases, "[]"),
      },
      create: {
        slug: scraped.slug,
        title: scraped.title,
        difficulty: scraped.difficulty,
        tags: ensureJsonStr(scraped.tags, "[]") as any,
        description: scraped.description,
        examples: ensureJsonStr(scraped.examples, "[]"),
        constraints: ensureJsonStr(scraped.constraints, "[]") as any,
        starterCode: ensureJsonStr(scraped.starterCode, "{}"),
        testCases: ensureJsonStr(scraped.testCases, "[]"),
      },
      select: {
        id: true,
        slug: true,
        title: true,
        difficulty: true,
        tags: true,
        description: true,
        examples: true,
        constraints: true,
        starterCode: true,
        testCases: true,
        createdAt: true,
      },
    });

    res.status(201).json({ success: true, problem: formatProblem(problem) });
  } catch (err) {
    next(err);
  }
});

// GET /api/problems — list with filters
problemsRouter.get("/", async (req, res, next) => {
  try {
    const { difficulty, tag, search, skip = "0", take = "5000" } = req.query as Record<string, string>;

    const whereClause: any = {};
    if (difficulty) whereClause.difficulty = difficulty;
    if (tag) whereClause.tags = { contains: tag };
    if (search) whereClause.title = { contains: search };

    const [problems, total] = await Promise.all([
      prisma.problem.findMany({
        where: whereClause,
        select: {
          id: true,
          slug: true,
          title: true,
          difficulty: true,
          tags: true,
          createdAt: true,
        },
        skip: parseInt(skip),
        take: Math.min(parseInt(take), 5000),
        orderBy: { createdAt: "asc" },
      }),
      prisma.problem.count({ where: whereClause }),
    ]);

    res.json({
      problems: problems.map((p) => {
        let tags: string[] = [];
        try {
          tags = typeof p.tags === "string" ? JSON.parse(p.tags) : (p.tags || []);
        } catch {
          tags = [];
        }
        return {
          ...p,
          tags,
        };
      }),
      total,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/problems/:slug — get problem, fallback to live scrape if not in DB
problemsRouter.get("/:slug", async (req, res, next) => {
  try {
    let problem = await prisma.problem.findUnique({
      where: { slug: req.params.slug },
      select: {
        id: true,
        slug: true,
        title: true,
        difficulty: true,
        tags: true,
        description: true,
        examples: true,
        constraints: true,
        starterCode: true,
        testCases: true,
      },
    });

    // If not found in DB, attempt on-demand import from LeetCode
    if (!problem) {
      try {
        const scraped = await scrapeLeetCodeProblem(req.params.slug);
        problem = await prisma.problem.create({
          data: {
            slug: scraped.slug,
            title: scraped.title,
            difficulty: scraped.difficulty,
            tags: ensureJsonStr(scraped.tags, "[]") as any,
            description: scraped.description,
            examples: ensureJsonStr(scraped.examples, "[]"),
            constraints: ensureJsonStr(scraped.constraints, "[]") as any,
            starterCode: ensureJsonStr(scraped.starterCode, "{}"),
            testCases: ensureJsonStr(scraped.testCases, "[]"),
          },
          select: {
            id: true,
            slug: true,
            title: true,
            difficulty: true,
            tags: true,
            description: true,
            examples: true,
            constraints: true,
            starterCode: true,
            testCases: true,
          },
        });
      } catch (_scrapeErr) {
        // Fall through to 404
      }
    }

    if (!problem) throw createError("Problem not found", 404);
    res.json(formatProblem(problem));
  } catch (err) {
    next(err);
  }
});


