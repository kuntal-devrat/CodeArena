import { execFile } from "child_process";
import { writeFile, mkdir, rm } from "fs/promises";
import path from "path";
import os from "os";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

interface ExecRequest {
  code: string;
  language: string;
  stdin: string;
  timeoutMs: number;
  memoryLimitMb: number;
}

interface ExecResult {
  stdout: string;
  stderr: string;
  runtimeMs: number;
  timedOut: boolean;
  runtimeError: boolean;
  compileError?: string;
}

// Language config: file extension and run command factory
const LANG_CONFIG: Record<string, { ext: string; run: (dir: string, file: string) => [string, string[]] }> = {
  python: {
    ext: "py",
    run: (_dir, file) => ["python3", [file]],
  },
  javascript: {
    ext: "js",
    run: (_dir, file) => ["node", [file]],
  },
  typescript: {
    ext: "ts",
    run: (_dir, file) => ["npx", ["ts-node", "--transpile-only", file]],
  },
  // For compiled languages, a real production judge would compile first in a sandbox.
  // This stub shows the structure — extend with docker exec or gVisor calls.
  cpp: {
    ext: "cpp",
    run: (dir, _file) => ["sh", ["-c", `g++ -o ${path.join(dir, "a.out")} ${path.join(dir, "solution.cpp")} && ${path.join(dir, "a.out")}`]],
  },
  java: {
    ext: "java",
    run: (dir, _file) => ["sh", ["-c", `cd ${dir} && javac Solution.java && java Solution`]],
  },
  go: {
    ext: "go",
    run: (_dir, file) => ["go", ["run", file]],
  },
  rust: {
    ext: "rs",
    run: (dir, _file) => ["sh", ["-c", `cd ${dir} && rustc solution.rs -o a.out && ./a.out`]],
  },
};

/**
 * Executes user code in a temporary directory.
 *
 * NOTE: In production, wrap this in a container/gVisor/Firecracker sandbox
 * with strict network=none, CPU, and memory limits. This implementation
 * is intentionally simple for the starter — it runs code directly on the host.
 */
export async function executeCode(req: ExecRequest): Promise<ExecResult> {
  const lang = LANG_CONFIG[req.language];
  if (!lang) {
    return {
      stdout: "",
      stderr: `Unsupported language: ${req.language}`,
      runtimeMs: 0,
      timedOut: false,
      runtimeError: true,
    };
  }

  const tmpDir = path.join(os.tmpdir(), `ca_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  await mkdir(tmpDir, { recursive: true });

  const filename = req.language === "java" ? "Solution.java" : `solution.${lang.ext}`;
  const filepath = path.join(tmpDir, filename);
  const stdinFile = path.join(tmpDir, "stdin.txt");

  await writeFile(filepath, req.code, "utf-8");
  await writeFile(stdinFile, req.stdin, "utf-8");

  const [cmd, args] = lang.run(tmpDir, filepath);
  const start = Date.now();

  try {
    const { stdout, stderr } = await execFileAsync(cmd, args, {
      timeout: req.timeoutMs,
      maxBuffer: 1024 * 1024, // 1MB stdout cap
      input: req.stdin,
    });

    return {
      stdout,
      stderr,
      runtimeMs: Date.now() - start,
      timedOut: false,
      runtimeError: false,
    };
  } catch (err: unknown) {
    const e = err as NodeJS.ErrnoException & { killed?: boolean; stderr?: string; stdout?: string };
    if (e.killed || e.code === "ETIMEDOUT") {
      return { stdout: "", stderr: "", runtimeMs: req.timeoutMs, timedOut: true, runtimeError: false };
    }
    const stderr = (e.stderr as string) ?? "";
    // Distinguish compile errors from runtime errors heuristically
    const isCompile = /error:/.test(stderr) && req.language !== "python";
    return {
      stdout: (e.stdout as string) ?? "",
      stderr,
      runtimeMs: Date.now() - start,
      timedOut: false,
      runtimeError: !isCompile,
      compileError: isCompile ? stderr : undefined,
    };
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
}
