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

const isWin = process.platform === "win32";
const pythonCmd = isWin ? "python" : "python3";
const npxCmd = isWin ? "npx.cmd" : "npx";

// Language config: file extension and run command factory
const LANG_CONFIG: Record<string, { ext: string; run: (dir: string, file: string) => [string, string[]] }> = {
  python: {
    ext: "py",
    run: (_dir, file) => [pythonCmd, [file]],
  },
  javascript: {
    ext: "js",
    run: (_dir, file) => ["node", [file]],
  },
  typescript: {
    ext: "ts",
    run: (_dir, file) => [npxCmd, ["ts-node", "--transpile-only", file]],
  },
  cpp: {
    ext: "cpp",
    run: (dir, file) => {
      const out = path.join(dir, isWin ? "a.exe" : "a.out");
      return isWin
        ? ["cmd.exe", ["/c", `g++ -O2 "${file}" -o "${out}" && "${out}"`]]
        : ["sh", ["-c", `g++ -O2 "${file}" -o "${out}" && "${out}"`]];
    },
  },
  java: {
    ext: "java",
    run: (dir, _file) => {
      return isWin
        ? ["cmd.exe", ["/c", `cd /d "${dir}" && javac Solution.java && java Solution`]]
        : ["sh", ["-c", `cd "${dir}" && javac Solution.java && java Solution`]];
    },
  },
  go: {
    ext: "go",
    run: (_dir, file) => ["go", ["run", file]],
  },
  rust: {
    ext: "rs",
    run: (dir, file) => {
      const out = path.join(dir, isWin ? "a.exe" : "a.out");
      return isWin
        ? ["cmd.exe", ["/c", `rustc "${file}" -o "${out}" && "${out}"`]]
        : ["sh", ["-c", `rustc "${file}" -o "${out}" && "${out}"`]];
    },
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

  let codeToWrite = req.code;
  // Automatically inject harness for LeetCode Solution classes if no custom main/printing is present
  if (req.language === "python" && !req.code.includes("__main__") && !req.code.includes("print(")) {
    codeToWrite += `\n\n# --- CodeArena LeetCode Test Harness ---
if __name__ == '__main__':
    import sys, json, ast, re
    raw = sys.stdin.read().strip()
    if raw:
        args = []
        if '=' in raw and not (raw.startswith('{') and raw.endswith('}')):
            parts = re.split(r',\\s*(?=[a-zA-Z_]\\w*\\s*=)|\\n+', raw)
            for p in parts:
                p = p.strip()
                if '=' in p:
                    p = p.split('=', 1)[1].strip()
                try:
                    args.append(json.loads(p))
                except Exception:
                    try:
                        args.append(ast.literal_eval(p))
                    except Exception:
                        args.append(p)
        else:
            lines = [l.strip() for l in raw.split('\\n') if l.strip()]
            for line in lines:
                if '=' in line and not (line.startswith('{') and line.endswith('}')):
                    line = line.split('=', 1)[1].strip()
                try:
                    args.append(json.loads(line))
                except Exception:
                    try:
                        args.append(ast.literal_eval(line))
                    except Exception:
                        args.append(line)
        fn = None
        if 'Solution' in globals():
            sol = Solution()
            methods = [m for m in dir(sol) if not m.startswith('_') and callable(getattr(sol, m))]
            if methods:
                fn = getattr(sol, methods[0])
        if not fn:
            callables = [f for f in globals().values() if callable(f) and not getattr(f, '__name__', '').startswith('_')]
            if callables:
                fn = callables[-1]
        if fn:
            res = fn(*args)
            if res is not None:
                if isinstance(res, bool):
                    print("true" if res else "false")
                else:
                    print(json.dumps(res, separators=(',', ':')))
`;
  } else if ((req.language === "javascript" || req.language === "typescript") && !req.code.includes("console.log")) {
    const fnMatch = req.code.match(/(?:var|let|const|function)\s+([a-zA-Z0-9_$]+)/);
    const candidateName = fnMatch ? fnMatch[1] : "";

    codeToWrite += `\n\n// --- CodeArena LeetCode Test Harness ---
try {
  const fs = require('fs');
  const rawInput = fs.readFileSync(0, 'utf-8').trim();
  if (rawInput) {
    let parsedArgs = [];
    if (rawInput.includes('=') && !rawInput.startsWith('{')) {
      const parts = rawInput.split(/,\\s*(?=[a-zA-Z_$][\\w$]*\\s*=)|\\n+/);
      parsedArgs = parts.map(p => {
        let val = p.trim();
        if (val.includes('=')) val = val.split(/=(.+)/)[1].trim();
        try { return JSON.parse(val); } catch(e) { return val; }
      });
    } else {
      const lines = rawInput.split('\\n').map(l => l.trim()).filter(Boolean);
      parsedArgs = lines.map(l => {
        let val = l;
        if (val.includes('=') && !val.startsWith('{')) val = val.split(/=(.+)/)[1].trim();
        try { return JSON.parse(val); } catch(e) { return val; }
      });
    }
    let fn = null;
    if (typeof Solution !== 'undefined') {
      const s = new Solution();
      const m = Object.getOwnPropertyNames(Object.getPrototypeOf(s)).filter(x => x !== 'constructor');
      if (m.length) fn = s[m[0]].bind(s);
    }
    if (!fn && "${candidateName}") {
      try {
        const candidate = eval("${candidateName}");
        if (typeof candidate === 'function') fn = candidate;
      } catch(e) {}
    }
    if (fn) {
      const out = fn(...parsedArgs);
      if (out !== undefined) {
        console.log(JSON.stringify(out));
      }
    }
  }
} catch(e) {
  console.error(e);
}
`;
  }


  await writeFile(filepath, codeToWrite, "utf-8");
  await writeFile(stdinFile, req.stdin, "utf-8");

  const [cmd, args] = lang.run(tmpDir, filepath);
  const start = Date.now();

  try {
    const { stdout, stderr } = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
      const child = execFile(
        cmd,
        args,
        {
          timeout: req.timeoutMs,
          maxBuffer: 1024 * 1024,
        },
        (err, stdout, stderr) => {
          if (err) {
            (err as any).stdout = stdout;
            (err as any).stderr = stderr;
            return reject(err);
          }
          resolve({ stdout, stderr });
        }
      );

      if (req.stdin && child.stdin) {
        child.stdin.write(req.stdin);
        child.stdin.end();
      }
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
