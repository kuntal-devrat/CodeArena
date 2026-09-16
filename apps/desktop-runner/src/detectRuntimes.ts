import { execSync } from "child_process";
import os from "os";

export interface DetectedRuntime {
  available: boolean;
  version: string | null;
  path?: string;
}

export interface SystemHardwareInfo {
  os: string;
  platform: string;
  arch: string;
  cpuModel: string;
  cpuCores: number;
  totalMemoryGb: number;
  freeMemoryGb: number;
}

export interface HardwareRunnerStatus {
  status: "online";
  version: string;
  port: number;
  hardware: SystemHardwareInfo;
  runtimes: Record<string, DetectedRuntime>;
  totalExecutions: number;
  uptimeSeconds: number;
}

function runCmdSilent(cmd: string): string | null {
  try {
    const output = execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 3000 });
    return output.trim();
  } catch {
    return null;
  }
}

export function getSystemHardware(): SystemHardwareInfo {
  const cpus = os.cpus();
  const cpuModel = cpus.length > 0 ? cpus[0].model.trim() : "Unknown CPU";
  return {
    os: `${os.type()} ${os.release()}`,
    platform: os.platform(),
    arch: os.arch(),
    cpuModel,
    cpuCores: cpus.length,
    totalMemoryGb: Math.round((os.totalmem() / (1024 * 1024 * 1024)) * 10) / 10,
    freeMemoryGb: Math.round((os.freemem() / (1024 * 1024 * 1024)) * 10) / 10,
  };
}

let cachedRuntimes: Record<string, DetectedRuntime> | null = null;
let lastCheckTime = 0;

export function detectRuntimes(forceRefresh = false): Record<string, DetectedRuntime> {
  const now = Date.now();
  if (!forceRefresh && cachedRuntimes && now - lastCheckTime < 60000) {
    return cachedRuntimes;
  }

  const runtimes: Record<string, DetectedRuntime> = {
    python: { available: false, version: null },
    javascript: { available: false, version: null },
    typescript: { available: false, version: null },
    cpp: { available: false, version: null },
    java: { available: false, version: null },
    go: { available: false, version: null },
    rust: { available: false, version: null },
  };

  // Node.js (JavaScript)
  const nodeVer = runCmdSilent("node -v");
  if (nodeVer) {
    runtimes.javascript = { available: true, version: nodeVer };
    runtimes.typescript = { available: true, version: nodeVer };
  }

  // Python
  const pyVer = runCmdSilent("python --version") || runCmdSilent("python3 --version") || runCmdSilent("py -3 --version");
  if (pyVer) {
    runtimes.python = { available: true, version: pyVer.replace(/^Python\s*/i, "") };
  }

  // C++ (g++, clang++, cl)
  const cppVer = runCmdSilent("g++ --version") || runCmdSilent("clang++ --version");
  if (cppVer) {
    const firstLine = cppVer.split("\n")[0];
    runtimes.cpp = { available: true, version: firstLine };
  }

  // Java
  const javaVer = runCmdSilent("javac -version") || runCmdSilent("java -version");
  if (javaVer) {
    const firstLine = javaVer.split("\n")[0];
    runtimes.java = { available: true, version: firstLine.replace(/^javac\s*/i, "") };
  }

  // Go
  const goVer = runCmdSilent("go version");
  if (goVer) {
    runtimes.go = { available: true, version: goVer.replace(/^go version\s*/i, "") };
  }

  // Rust
  const rustVer = runCmdSilent("rustc --version");
  if (rustVer) {
    runtimes.rust = { available: true, version: rustVer.replace(/^rustc\s*/i, "") };
  }

  cachedRuntimes = runtimes;
  lastCheckTime = now;
  return runtimes;
}
