import express from "express";
import cors from "cors";
import path from "path";
import { detectRuntimes, getSystemHardware, HardwareRunnerStatus } from "./detectRuntimes";
import { executeLocally } from "./localExecutor";
import { runLocalJudge } from "./testcaseRunner";

// Safe public directory resolution for both CommonJS and ESM
const publicDir = typeof __dirname !== "undefined"
  ? path.join(__dirname, "public")
  : path.join(process.cwd(), "apps/desktop-runner/src/public");

const app = express();
const PORT = 5001;

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "4mb" }));

// Serve static dashboard
app.use(express.static(publicDir));

let totalExecutions = 0;
const startTime = Date.now();
const logs: { time: string; type: "info" | "success" | "warn"; message: string }[] = [];

function addLog(type: "info" | "success" | "warn", message: string) {
  const time = new Date().toLocaleTimeString();
  logs.unshift({ time, type, message });
  if (logs.length > 50) logs.pop();
}

// GET /status (and /health)
app.get(["/status", "/health"], (_req, res) => {
  const hardware = getSystemHardware();
  const runtimes = detectRuntimes();
  const status: HardwareRunnerStatus = {
    status: "online",
    version: "1.0.0",
    port: PORT,
    hardware,
    runtimes,
    totalExecutions,
    uptimeSeconds: Math.round((Date.now() - startTime) / 1000),
  };
  res.json(status);
});

// GET /logs
app.get("/logs", (_req, res) => {
  res.json(logs);
});

// POST /run — executes single or sample test cases directly on local CPU
app.post("/run", async (req, res) => {
  totalExecutions++;
  const { code, language, stdin = "", timeoutMs = 5000 } = req.body;
  addLog("info", `[Run] Executing ${language.toUpperCase()} locally (${code.length} bytes)...`);

  try {
    const result = await executeLocally({ code, language, stdin, timeoutMs });
    addLog(
      result.runtimeError ? "warn" : "success",
      `[Run] Finished in ${result.runtimeMs}ms (Direct Hardware Execution)`
    );
    res.json({
      ...result,
      executedLocally: true,
      port: PORT,
    });
  } catch (err: any) {
    addLog("warn", `[Run Error] ${err.message}`);
    res.status(500).json({ error: err.message, executedLocally: true });
  }
});

// POST /judge — runs complete test suite locally (Submit mode)
app.post("/judge", async (req, res) => {
  totalExecutions++;
  const { code, language, testCases = [], isRun = false, timeoutMs = 5000 } = req.body;
  addLog("info", `[Judge] Testing ${language.toUpperCase()} against ${testCases.length} testcases on local CPU...`);

  try {
    const result = await runLocalJudge({
      code,
      language,
      testCases,
      isRun,
      timeoutMs,
    });
    addLog(
      result.verdict === "ACCEPTED" ? "success" : "warn",
      `[Judge] Verdict: ${result.verdict} (${result.passedCases}/${result.totalCases} passed in ${result.runtime}ms)`
    );
    res.json(result);
  } catch (err: any) {
    addLog("warn", `[Judge Error] ${err.message}`);
    res.status(500).json({ error: err.message, executedLocally: true });
  }
});

// Dashboard root redirect
app.get("/", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n=============================================================`);
  console.log(`⚡ CodeArena Hardware Executor ACTIVE on http://127.0.0.1:${PORT}`);
  console.log(`💻 Local Hardware: ${getSystemHardware().cpuModel} (${getSystemHardware().cpuCores} cores)`);
  console.log(`🔗 Auto-connecting to CodeArena Web App (http://localhost:3000)`);
  console.log(`📊 Dashboard: http://127.0.0.1:${PORT}`);
  console.log(`=============================================================\n`);
});
