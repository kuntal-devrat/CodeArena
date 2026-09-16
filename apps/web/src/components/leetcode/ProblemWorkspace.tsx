"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Editor } from "@monaco-editor/react";
import {
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText,
  BookOpen,
  Code2,
  History,
  Sparkles,
  Maximize2,
  Minimize2,
  Pause,
  AlertCircle,
  Copy,
  Check,
  Wand2,
  Lightbulb,
  ExternalLink,
  Loader2,
  Cpu,
  Zap,
  Cloud,
  Server,
  Laptop
} from "lucide-react";

import { clsx } from "clsx";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import type { Problem, Language, SubmissionVerdict, TestCaseResult } from "@codearena/shared";

const SUPPORTED_LANGUAGES: { id: Language; label: string; monacoLang: string }[] = [
  { id: "python", label: "Python 3", monacoLang: "python" },
  { id: "javascript", label: "JavaScript", monacoLang: "javascript" },
  { id: "typescript", label: "TypeScript", monacoLang: "typescript" },
  { id: "cpp", label: "C++", monacoLang: "cpp" },
  { id: "java", label: "Java", monacoLang: "java" },
  { id: "go", label: "Go", monacoLang: "go" },
  { id: "rust", label: "Rust", monacoLang: "rust" },
];

function parseProblemDescription(rawHtml: string): { statementHtml: string; followUpHtml?: string } {
  if (!rawHtml) {
    return { statementHtml: "<p class='text-m3-on-surface-variant text-sm'>No description available.</p>" };
  }

  let text = rawHtml
    .replace(/\xa0/g, " ")
    .replace(/&nbsp;/g, " ");

  // Extract Follow-up if present anywhere in the description
  let followUpHtml: string | undefined;
  const followUpMatch = text.match(/(?:<p\b[^>]*>\s*)?(?:<strong\b[^>]*>)?Follow[- ]?up:?\s*(?:<\/strong>)?([\s\S]*?)(?:<\/p>|$)/i);
  if (followUpMatch && followUpMatch[1].trim()) {
    followUpHtml = followUpMatch[1].trim()
      .replace(/<font[^>]*>/gi, "")
      .replace(/<\/font>/gi, "")
      .replace(/`([^`]+)`/g, '<code class="bg-m3-surface-container-highest text-[#ffe088] font-mono text-[12px] px-1.5 py-0.5 rounded border border-m3-outline-variant/40">$1</code>');
  }

  // Strip raw Example and Constraints section if present so it doesn't duplicate structured cards
  const exampleIndex = text.search(/(?:<p\b[^>]*>\s*)?<strong\b[^>]*>\s*Example\s*1|<p\b[^>]*>\s*Example\s*1|\bExample\s*1\s*:/i);
  if (exampleIndex !== -1) {
    text = text.slice(0, exampleIndex).trim();
  }

  // Also remove trailing follow-up if still in statement
  text = text.replace(/(?:<p\b[^>]*>\s*)?(?:<strong\b[^>]*>)?Follow[- ]?up:?[\s\S]*$/i, "").trim();

  // Clean empty tags
  text = text
    .replace(/<p>\s*&nbsp;\s*<\/p>/gi, "")
    .replace(/<p>\s*<\/p>/gi, "");

  // Check if text is plain text or has HTML tags
  const hasHtmlTags = /<\/?(p|div|ul|ol|li|table|pre|code|h\d|section|article)[^>]*>/i.test(text);

  if (!hasHtmlTags) {
    const paragraphs = text.split(/\n{2,}/);
    const formatted = paragraphs
      .map((para) => {
        para = para.trim();
        if (!para) return "";

        const withCode = para
          .replace(/`([^`]+)`/g, '<code class="bg-m3-surface-container-highest text-[#ffe088] font-mono text-[12px] px-1.5 py-0.5 rounded border border-m3-outline-variant/40">$1</code>')
          .replace(/\n/g, "<br />");

        return `<p class="mb-3 text-m3-on-surface/90 text-[13.5px] sm:text-[14px] leading-6 font-normal">${withCode}</p>`;
      })
      .filter(Boolean)
      .join("");

    return { statementHtml: formatted, followUpHtml };
  }

  // Style HTML tags with M3 classes
  const styled = text
    .replace(/<p>/gi, '<p class="mb-3 text-m3-on-surface/90 text-[13.5px] sm:text-[14px] leading-6 font-normal">')
    .replace(/<pre>/gi, '<pre class="bg-m3-surface-container-lowest border border-m3-outline-variant/40 p-3 rounded-xl font-mono text-[12.5px] text-m3-primary overflow-x-auto my-3 leading-relaxed">')
    .replace(/<code>/gi, '<code class="bg-m3-surface-container-highest text-[#ffe088] font-mono text-[12px] px-1.5 py-0.5 rounded border border-m3-outline-variant/40">')
    .replace(/<strong class="example">/gi, '<strong class="text-m3-on-surface font-semibold block mt-3.5 mb-1.5 text-[13.5px]">')
    .replace(/<ul>/gi, '<ul class="list-disc pl-5 space-y-1.5 text-m3-on-surface/90 text-[13px] my-2">')
    .replace(/<ol>/gi, '<ol class="list-decimal pl-5 space-y-1.5 text-m3-on-surface/90 text-[13px] my-2">')
    .replace(/<li>/gi, '<li class="leading-relaxed">')
    .replace(/<table/gi, '<table class="border-collapse border border-m3-outline-variant/40 my-3 text-[12.5px]"')
    .replace(/<th/gi, '<th class="border border-m3-outline-variant/40 bg-m3-surface-container px-3 py-1.5 text-m3-on-surface font-medium"')
    .replace(/<td/gi, '<td class="border border-m3-outline-variant/40 px-3 py-1.5 text-m3-on-surface-variant"');

  return { statementHtml: styled, followUpHtml };
}



function getProblemSolutions(problem: Problem, lang: Language): { title: string; approach: string; complexity: { time: string; space: string }; code: string } {
  const starter = (problem.starterCode && problem.starterCode[lang]) || "";

  if (problem.slug === "two-sum") {
    if (lang === "python") {
      return {
        title: "One-Pass Hash Map (Optimal)",
        approach: "Iterate through nums once while storing each number's index in a hash map. For each element, check if (target - num) exists in O(1) time.",
        complexity: { time: "O(N)", space: "O(N)" },
        code: `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        seen = {}\n        for i, num in enumerate(nums):\n            diff = target - num\n            if diff in seen:\n                return [seen[diff], i]\n            seen[num] = i\n        return []`,
      };
    } else if (lang === "javascript") {
      return {
        title: "One-Pass Hash Map (Optimal)",
        approach: "Maintain a map of { number: index } while looping through nums. Check if target - num is present in constant time.",
        complexity: { time: "O(N)", space: "O(N)" },
        code: `var twoSum = function(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n};`,
      };
    } else if (lang === "typescript") {
      return {
        title: "One-Pass Hash Map (Optimal)",
        approach: "Store visited numbers in a Map and search complement in constant time.",
        complexity: { time: "O(N)", space: "O(N)" },
        code: `function twoSum(nums: number[], target: number): number[] {\n    const map = new Map<number, number>();\n    for (let i = 0; i < nums.length; i++) {\n        const comp = target - nums[i];\n        if (map.has(comp)) {\n            return [map.get(comp)!, i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n};`,
      };
    } else if (lang === "cpp") {
      return {
        title: "std::unordered_map Solution",
        approach: "Single pass using unordered_map for O(1) average lookup.",
        complexity: { time: "O(N)", space: "O(N)" },
        code: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> seen;\n        for (int i = 0; i < nums.size(); ++i) {\n            int diff = target - nums[i];\n            if (seen.find(diff) != seen.end()) {\n                return {seen[diff], i};\n            }\n            seen[nums[i]] = i;\n        }\n        return {};\n    }\n};`,
      };
    } else if (lang === "java") {
      return {
        title: "HashMap Solution",
        approach: "One-pass HashMap lookup in Java.",
        complexity: { time: "O(N)", space: "O(N)" },
        code: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[] { map.get(complement), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[] {};\n    }\n}`,
      };
    }
  }

  // Generic intelligent template for any question
  const tagList = problem.tags && problem.tags.length > 0 ? problem.tags.join(", ") : "optimal algorithms";
  if (lang === "python") {
    return {
      title: `Optimal Solution (${problem.title})`,
      approach: `Analyze the problem constraints and apply an optimal algorithm based on ${tagList}.`,
      complexity: { time: "O(N)", space: "O(1) or O(N)" },
      code: starter || `class Solution:\n    def solve(self):\n        # Implementation here\n        pass`,
    };
  }

  return {
    title: `Optimal Solution (${lang.toUpperCase()})`,
    approach: `Structured implementation for ${problem.title} using ${tagList}.`,
    complexity: { time: "O(N)", space: "O(1)" },
    code: starter || `// Optimal solution implementation for ${problem.title}`,
  };
}

interface ProblemWorkspaceProps {
  initialProblem: Problem;
}

export function ProblemWorkspace({ initialProblem }: ProblemWorkspaceProps) {
  const router = useRouter();
  const [problem, setProblem] = useState<Problem>(initialProblem);

  // Left pane active tab
  const [leftTab, setLeftTab] = useState<"description" | "editorial" | "solutions" | "submissions">("description");

  // Selected language & code state (with localStorage caching)
  const [language, setLanguage] = useState<Language>("python");
  const [solutionLang, setSolutionLang] = useState<Language>("python");
  const [code, setCode] = useState<string>("");
  const [copiedSolution, setCopiedSolution] = useState(false);

  // Console & Testcases state
  const [consoleTab, setConsoleTab] = useState<"testcase" | "result">("testcase");
  const [selectedCaseIdx, setSelectedCaseIdx] = useState<number>(0);
  const [consoleHeight, setConsoleHeight] = useState<number>(240);
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(true);

  // Local Hardware Executor state
  const [localRunnerOnline, setLocalRunnerOnline] = useState<boolean>(false);
  const [runnerHardware, setRunnerHardware] = useState<{
    cpuModel: string;
    cpuCores: number;
    totalMemoryGb?: number;
    freeMemoryGb?: number;
    runtimes?: Record<string, { available: boolean; version: string | null }>;
  } | null>(null);
  const [executorMode, setExecutorMode] = useState<"local" | "cloud">("local");
  const [showRunnerModal, setShowRunnerModal] = useState<boolean>(false);

  const parsedDesc = useMemo(() => parseProblemDescription(problem.description), [problem.description]);

  // Poll Local Hardware Runner on port 5001
  useEffect(() => {
    let mounted = true;
    async function checkRunner() {
      try {
        const res = await fetch("http://127.0.0.1:5001/status");
        if (res.ok) {
          const data = await res.json();
          if (mounted) {
            setLocalRunnerOnline(true);
            setRunnerHardware({
              cpuModel: data.hardware?.cpuModel || "Local CPU",
              cpuCores: data.hardware?.cpuCores || 8,
              totalMemoryGb: data.hardware?.totalMemoryGb,
              freeMemoryGb: data.hardware?.freeMemoryGb,
              runtimes: data.runtimes,
            });
          }
        }
      } catch {
        if (mounted) {
          setLocalRunnerOnline(false);
          setExecutorMode("cloud");
        }
      }
    }
    checkRunner();
    const timer = setInterval(checkRunner, 10000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  // Execution & Submission state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [runResult, setRunResult] = useState<{
    verdict: SubmissionVerdict;
    runtime: number;
    testCaseResults: TestCaseResult[];
    errorMessage?: string;
    totalCases?: number;
    passedCases?: number;
    executedLocally?: boolean;
    hardware?: { cpuModel: string; cpuCores: number; platform: string };
  } | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState<boolean>(false);

  // Timer state
  const [seconds, setSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // Accordion state for hints
  const [openHints, setOpenHints] = useState<Record<number, boolean>>({});

  // Split resize states
  const [splitRatio, setSplitRatio] = useState<number>(45); // percentage for left pane
  const isDraggingSplit = useRef(false);
  const isDraggingConsole = useRef(false);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  // Load code on problem/language change
  useEffect(() => {
    const storageKey = `codearena_${problem.slug}_${language}`;
    const savedCode = localStorage.getItem(storageKey);

    if (savedCode !== null) {
      setCode(savedCode);
    } else if (problem.starterCode && problem.starterCode[language]) {
      setCode(problem.starterCode[language]);
    } else {
      setCode(getDefaultStarterCode(language, problem.slug));
    }
  }, [problem.slug, language]);

  // Save code changes to localStorage
  function handleCodeChange(val: string | undefined) {
    const newCode = val ?? "";
    setCode(newCode);
    localStorage.setItem(`codearena_${problem.slug}_${language}`, newCode);
  }

  // Reset to default starter code
  function handleResetCode() {
    if (confirm("Reset editor to default starter code? Your current edits will be discarded.")) {
      const defaultCode = (problem.starterCode && problem.starterCode[language]) || getDefaultStarterCode(language, problem.slug);
      setCode(defaultCode);
      localStorage.setItem(`codearena_${problem.slug}_${language}`, defaultCode);
      toast.success("Code reset to default starter template");
    }
  }

  // Fetch past submissions
  async function fetchSubmissions() {
    setLoadingSubmissions(true);
    try {
      const res = await api.get(`/api/submissions?problemId=${problem.id}`);
      setSubmissions(res.data || []);
    } catch {
      // Submissions will be empty if not logged in
    } finally {
      setLoadingSubmissions(false);
    }
  }

  useEffect(() => {
    if (leftTab === "submissions") {
      fetchSubmissions();
    }
  }, [leftTab, problem.id]);

  // Run code against sample test cases
  async function handleRun() {
    if (isRunning) return;
    setIsRunning(true);
    setConsoleTab("result");
    setIsConsoleOpen(true);

    const isLocal = executorMode === "local" && localRunnerOnline;
    toast.loading(isLocal ? "⚡ Running locally on your CPU..." : "Running in judge sandbox...", { id: "run-toast" });

    try {
      if (isLocal) {
        // Direct execution on user's hardware via http://127.0.0.1:5001/judge
        const localCases = sampleCases.map((s) => ({ input: s.input, expected: s.output }));
        const res = await fetch("http://127.0.0.1:5001/judge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            language,
            testCases: localCases,
            isRun: true,
          }),
        });
        const data = await res.json();
        setRunResult({
          verdict: data.verdict,
          runtime: data.runtime,
          testCaseResults: data.testCaseResults || [],
          errorMessage: data.errorMessage,
          totalCases: data.totalCases,
          passedCases: data.passedCases,
          executedLocally: true,
          hardware: data.hardware,
        });

        if (data.verdict === "ACCEPTED") {
          toast.success(`⚡ Accepted on local CPU! (${data.runtime}ms)`, { id: "run-toast" });
        } else {
          toast.error(`Verdict: ${data.verdict.replace(/_/g, " ")} (${data.passedCases}/${data.totalCases} passed)`, { id: "run-toast" });
        }
      } else {
        const res = await api.post("/api/submissions/run", {
          problemId: problem.id,
          language,
          code,
        });

        setRunResult(res.data);
        if (res.data.verdict === "ACCEPTED") {
          toast.success(`Accepted! (${res.data.runtime}ms)`, { id: "run-toast" });
        } else {
          toast.error(`Verdict: ${res.data.verdict.replace(/_/g, " ")}`, { id: "run-toast" });
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Failed to execute code";
      toast.error(msg, { id: "run-toast" });
      setRunResult({
        verdict: "RUNTIME_ERROR",
        runtime: 0,
        testCaseResults: [],
        errorMessage: msg,
      });
    } finally {
      setIsRunning(false);
    }
  }

  // Submit code
  async function handleSubmit() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const isLocal = executorMode === "local" && localRunnerOnline;
    toast.loading(isLocal ? "⚡ Running all test cases on local hardware..." : "Submitting solution to judge...", { id: "submit-toast" });

    try {
      if (isLocal) {
        // Direct local execution of ALL real test cases
        let allCases: { input: string; expected: string }[] = [];
        try {
          allCases = typeof problem.testCases === "string" ? JSON.parse(problem.testCases) : (problem.testCases as any) || [];
        } catch {
          allCases = [];
        }
        if (allCases.length === 0) {
          allCases = sampleCases.map((s) => ({ input: s.input, expected: s.output }));
        }

        const res = await fetch("http://127.0.0.1:5001/judge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            language,
            testCases: allCases,
            isRun: false,
          }),
        });
        const data = await res.json();
        setIsSubmitting(false);

        const newSub = {
          id: `local-${Date.now()}`,
          language,
          verdict: data.verdict,
          runtime: data.runtime,
          memory: data.memory,
          submittedAt: new Date().toISOString(),
          passedCases: data.passedCases,
          totalCases: data.totalCases,
          executedLocally: true,
        };
        setSubmissions((prev) => [newSub, ...prev]);
        setLeftTab("submissions");

        if (data.verdict === "ACCEPTED") {
          toast.success(`🎉 Accepted on local hardware! ${data.passedCases}/${data.totalCases} test cases passed (${data.runtime}ms)`, { id: "submit-toast" });
        } else {
          toast.error(`${data.verdict.replace(/_/g, " ")}: ${data.passedCases}/${data.totalCases} test cases passed`, { id: "submit-toast" });
        }
      } else {
        const res = await api.post("/api/submissions", {
          problemId: problem.id,
          language,
          code,
          isRun: false,
        });

        const submissionId = res.data.submissionId;

        // Poll for verdict
        let attempts = 0;
        const pollInterval = setInterval(async () => {
          attempts++;
          try {
            const subRes = await api.get(`/api/submissions/${submissionId}`);
            if (subRes.data.verdict !== "PENDING" && subRes.data.verdict !== "RUNNING") {
              clearInterval(pollInterval);
              setIsSubmitting(false);

              if (subRes.data.verdict === "ACCEPTED") {
                toast.success(`🎉 Accepted! Runtime: ${subRes.data.runtime || 0} ms`, { id: "submit-toast" });
              } else {
                toast.error(`Verdict: ${subRes.data.verdict.replace(/_/g, " ")}`, { id: "submit-toast" });
              }
              // Switch to submissions tab to view
              setLeftTab("submissions");
              fetchSubmissions();
            } else if (attempts >= 15) {
              clearInterval(pollInterval);
              setIsSubmitting(false);
              toast("Submission is still processing in background", { id: "submit-toast" });
            }
          } catch {
            clearInterval(pollInterval);
            setIsSubmitting(false);
          }
        }, 1000);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      const msg = err.response?.data?.error || err.message || "Submission failed";
      toast.error(msg, { id: "submit-toast" });
    }
  }

  // Format timer HH:MM:SS
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h > 0 ? `${h.toString().padStart(2, "0")}:` : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Keyboard shortcuts (Ctrl + ' for Run, Ctrl + Enter for Submit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "'") {
        e.preventDefault();
        handleRun();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [code, language, isRunning, isSubmitting]);

  // Mouse handlers for horizontal split pane
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingSplit.current) {
        const newRatio = (e.clientX / window.innerWidth) * 100;
        if (newRatio >= 25 && newRatio <= 75) {
          setSplitRatio(newRatio);
        }
      } else if (isDraggingConsole.current) {
        const newHeight = window.innerHeight - e.clientY;
        if (newHeight >= 100 && newHeight <= window.innerHeight - 150) {
          setConsoleHeight(newHeight);
        }
      }
    };

    const handleMouseUp = () => {
      isDraggingSplit.current = false;
      isDraggingConsole.current = false;
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const sampleCases = (problem.examples || []).map((ex, idx) => ({
    input: ex.input,
    output: ex.output,
    explanation: ex.explanation,
    caseNum: idx + 1,
  }));

  return (
    <div className="flex flex-col h-screen w-screen bg-m3-surface text-m3-on-surface select-none overflow-hidden font-sans">
      {/* 1. Top App Bar - Google Material 3 */}
      <header className="h-12 bg-m3-surface-container border-b border-m3-outline-variant/30 flex items-center justify-between px-3 sm:px-4 z-20 shrink-0 shadow-xs">
        <div className="flex items-center gap-2.5">
          {/* Back to problem list */}
          <Link
            href="/problems"
            className="flex items-center gap-1 text-xs font-medium text-m3-on-surface-variant hover:text-m3-on-surface bg-m3-surface-container-high hover:bg-m3-surface-container-highest px-3 py-1.5 rounded-full transition-colors border border-m3-outline-variant/30"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Problems</span>
          </Link>

          {/* Problem Title & Number */}
          <div className="flex items-center gap-2">
            <span className="font-medium text-xs sm:text-sm text-m3-on-surface">
              {problem.title}
            </span>
            <span
              className={clsx(
                "text-[11px] font-medium px-2 py-0.5 rounded-full capitalize",
                problem.difficulty === "EASY" && "bg-m3-success-container/70 text-m3-success border border-m3-success/30",
                problem.difficulty === "MEDIUM" && "bg-m3-warning-container/70 text-m3-warning border border-m3-warning/30",
                problem.difficulty === "HARD" && "bg-m3-error-container/70 text-m3-error border border-m3-error/30"
              )}
            >
              {problem.difficulty.toLowerCase()}
            </span>
          </div>
        </div>

        {/* Center: Run & Submit Actions + Hardware Executor Selector */}
        <div className="flex items-center gap-2">
          {/* Hardware Runner Status Badge */}
          <button
            onClick={() => setShowRunnerModal(true)}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all select-none border cursor-pointer",
              localRunnerOnline && executorMode === "local"
                ? "bg-m3-success-container/40 border-m3-success/40 text-m3-success hover:bg-m3-success-container/60"
                : "bg-m3-surface-container border-m3-outline-variant/40 text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-container-high"
            )}
            title="Click to view Hardware Executor configuration and detected compilers"
          >
            {localRunnerOnline && executorMode === "local" ? (
              <>
                <span className="w-2 h-2 rounded-full bg-m3-success animate-pulse shrink-0" />
                <span className="font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-m3-success fill-current" />
                  <span>Hardware Runner</span>
                </span>
                <span className="text-[10px] text-m3-on-surface-variant font-mono hidden md:inline">
                  $0 Server Cost
                </span>
              </>
            ) : (
              <>
                <Cloud className="w-3.5 h-3.5 text-m3-on-surface-variant" />
                <span>Cloud Sandbox</span>
                <span className="text-[10px] text-m3-primary font-mono hidden lg:inline">Connect Local</span>
              </>
            )}
          </button>

          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 bg-m3-secondary-container hover:bg-m3-secondary-container/80 text-m3-on-secondary-container text-xs font-medium px-3.5 py-1.5 rounded-full transition-all duration-150 active:scale-95 disabled:opacity-50"
            title="Run Code (Ctrl + ')"
          >
            <Play className={clsx("w-3 h-3 fill-current text-m3-on-secondary-container", isRunning && "animate-pulse")} />
            <span>{isRunning ? "Running..." : "Run"}</span>
            <span className="text-[10px] text-m3-on-secondary-container/70 font-mono hidden sm:inline ml-0.5">Ctrl + &apos;</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 bg-m3-primary hover:brightness-110 text-m3-on-primary text-xs font-semibold px-4 py-1.5 rounded-full transition-all duration-150 shadow-sm active:scale-95 disabled:opacity-50"
            title="Submit Solution (Ctrl + Enter)"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isSubmitting ? "Submitting..." : "Submit"}</span>
            <span className="text-[10px] text-m3-on-primary/80 font-mono hidden sm:inline ml-0.5">Ctrl + ↵</span>
          </button>
        </div>

        {/* Right: Stopwatch Timer, Reset, Profile */}
        <div className="flex items-center gap-2.5">
          {/* Stopwatch */}
          <div className="flex items-center gap-1.5 bg-m3-surface-container border border-m3-outline-variant/40 px-3 py-1 rounded-full text-xs font-mono text-m3-on-surface-variant">
            <Clock className="w-3.5 h-3.5 text-m3-on-surface-variant" />
            <span>{formatTime(seconds)}</span>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="hover:text-m3-on-surface ml-0.5"
              title={isTimerRunning ? "Pause timer" : "Start timer"}
            >
              {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
            <button
              onClick={() => setSeconds(0)}
              className="hover:text-m3-on-surface"
              title="Reset timer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={handleResetCode}
            className="p-1.5 text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-white/10 rounded-full transition-colors"
            title="Reset code to starter template"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <Link
            href="/profile"
            className="w-7 h-7 rounded-full bg-m3-primary text-m3-on-primary font-bold text-xs flex items-center justify-center shadow-sm"
            title="User Profile"
          >
            CA
          </Link>
        </div>
      </header>

      {/* 2. Workspace Body: Split Panes */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* Left Pane: Problem Description, Editorial, Solutions, Submissions */}
        <div
          style={{ width: `${splitRatio}%` }}
          className="flex flex-col bg-m3-surface border-r border-m3-outline-variant/30 overflow-hidden"
        >
          {/* Left Pane Tab Bar */}
          <div className="h-11 bg-m3-surface-container-low border-b border-m3-outline-variant/30 flex items-center px-3 gap-1 shrink-0">
            <button
              onClick={() => setLeftTab("description")}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150",
                leftTab === "description"
                  ? "bg-m3-secondary-container text-m3-on-secondary-container shadow-sm"
                  : "text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-white/5"
              )}
            >
              <FileText className="w-3.5 h-3.5 text-m3-primary" />
              <span>Description</span>
            </button>

            <button
              onClick={() => setLeftTab("editorial")}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150",
                leftTab === "editorial"
                  ? "bg-m3-secondary-container text-m3-on-secondary-container shadow-sm"
                  : "text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-white/5"
              )}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#ffba38]" />
              <span>Editorial</span>
            </button>

            <button
              onClick={() => setLeftTab("solutions")}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150",
                leftTab === "solutions"
                  ? "bg-m3-secondary-container text-m3-on-secondary-container shadow-sm"
                  : "text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-white/5"
              )}
            >
              <Code2 className="w-3.5 h-3.5 text-m3-success" />
              <span>Solutions</span>
            </button>

            <button
              onClick={() => setLeftTab("submissions")}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150",
                leftTab === "submissions"
                  ? "bg-m3-secondary-container text-m3-on-secondary-container shadow-sm"
                  : "text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-white/5"
              )}
            >
              <History className="w-3.5 h-3.5 text-m3-tertiary" />
              <span>Submissions</span>
            </button>
          </div>

          {/* Left Pane Content Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-[13.5px] leading-relaxed text-m3-on-surface/90">
            {leftTab === "description" && (
              <div className="space-y-5">
                {/* Problem Title & Badges */}
                <div className="space-y-2.5">
                  <h1 className="text-xl sm:text-[22px] font-semibold text-m3-on-surface tracking-normal">
                    {problem.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={clsx(
                        "text-[11px] font-medium px-2.5 py-0.5 rounded-full",
                        problem.difficulty === "EASY" && "bg-m3-success-container/70 text-m3-success border border-m3-success/30",
                        problem.difficulty === "MEDIUM" && "bg-m3-warning-container/70 text-m3-warning border border-m3-warning/30",
                        problem.difficulty === "HARD" && "bg-m3-error-container/70 text-m3-error border border-m3-error/30"
                      )}
                    >
                      {problem.difficulty.charAt(0) + problem.difficulty.slice(1).toLowerCase()}
                    </span>

                    {problem.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-m3-surface-container-high hover:bg-m3-surface-container-highest text-m3-on-surface-variant border border-m3-outline-variant/40 px-2.5 py-0.5 rounded-md transition-colors cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Problem Description Body (Problem Statement Only) */}
                <div
                  className="max-w-none text-m3-on-surface/90 text-[13.5px] sm:text-[14px] leading-6 space-y-3 select-text font-normal"
                  dangerouslySetInnerHTML={{ __html: parsedDesc.statementHtml }}
                />

                {/* Structured Examples (LeetCode Style) */}
                {sampleCases.length > 0 && (
                  <div className="space-y-3 pt-2">
                    {sampleCases.map((ex) => (
                      <div
                        key={ex.caseNum}
                        className="bg-m3-surface-container-low border border-m3-outline-variant/40 rounded-xl p-3.5 space-y-2.5 font-mono text-[12.5px] shadow-sm"
                      >
                        <div className="font-sans font-semibold text-m3-on-surface text-xs flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-3.5 bg-m3-primary rounded-full inline-block"></span>
                            <span>Example {ex.caseNum}:</span>
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(ex.input);
                              toast.success(`Example ${ex.caseNum} input copied!`);
                            }}
                            className="text-[11px] font-mono text-m3-on-surface-variant hover:text-m3-on-surface flex items-center gap-1 bg-m3-surface-container px-2 py-0.5 rounded-md border border-m3-outline-variant/30 hover:border-m3-primary/50 transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy Input</span>
                          </button>
                        </div>
                        <div className="space-y-2 text-m3-on-surface/90">
                          <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                            <span className="text-m3-on-surface-variant font-semibold font-sans w-14 shrink-0 text-[11px] uppercase tracking-wider mt-0.5">Input:</span>
                            <span className="text-[#ffe088] bg-m3-surface-container-lowest border border-m3-outline-variant/30 px-2.5 py-1 rounded-lg font-mono text-[12px] break-all leading-5 flex-1">
                              {ex.input}
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                            <span className="text-m3-on-surface-variant font-semibold font-sans w-14 shrink-0 text-[11px] uppercase tracking-wider mt-0.5">Output:</span>
                            <span className="text-m3-success bg-m3-surface-container-lowest border border-m3-outline-variant/30 px-2.5 py-1 rounded-lg font-mono text-[12px] break-all leading-5 flex-1">
                              {ex.output}
                            </span>
                          </div>
                          {ex.explanation && (
                            <div className="font-sans text-m3-on-surface-variant pt-1.5 text-xs leading-5 border-t border-m3-outline-variant/30 mt-1.5">
                              <span className="font-medium text-m3-on-surface">Explanation: </span>
                              {ex.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Constraints */}
                {problem.constraints && problem.constraints.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-m3-outline-variant/30">
                    <h3 className="font-medium text-m3-on-surface text-xs flex items-center gap-1.5 uppercase tracking-wider">
                      <span className="w-1.5 h-3 bg-[#ffba38] rounded-full inline-block"></span>
                      <span>Constraints:</span>
                    </h3>
                    <ul className="space-y-1.5 text-xs text-m3-on-surface font-mono">
                      {problem.constraints.map((c, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-m3-primary mt-0.5">•</span>
                          <span className="bg-m3-surface-container-low border border-m3-outline-variant/30 px-2 py-0.5 rounded text-[12px] text-m3-on-surface-variant leading-5">
                            {c}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Follow-up Callout */}
                {parsedDesc.followUpHtml && (
                  <div className="bg-m3-surface-container border border-m3-outline-variant/40 rounded-xl p-3.5 space-y-2 shadow-sm mt-3">
                    <div className="flex items-center gap-1.5 text-[#ffba38] font-medium text-xs uppercase tracking-wider">
                      <span>💡</span>
                      <span className="font-semibold">Follow-up</span>
                    </div>
                    <div
                      className="text-m3-on-surface/90 text-xs leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: parsedDesc.followUpHtml }}
                    />
                  </div>
                )}
              </div>
            )}

            {leftTab === "editorial" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-semibold text-m3-on-surface flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#ffba38]" />
                    <span>Editorial Walkthrough</span>
                  </h2>
                  <button
                    onClick={() => setLeftTab("solutions")}
                    className="text-xs text-m3-primary hover:underline flex items-center gap-1 font-medium bg-m3-surface-container px-3 py-1 rounded-full border border-m3-outline-variant/30 transition-colors"
                  >
                    <span>View Solutions</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Intuition & Core Approach */}
                <div className="bg-m3-surface-container-low border border-m3-outline-variant/40 rounded-2xl p-4 space-y-2.5 shadow-sm">
                  <div className="flex items-center gap-2 text-m3-primary font-medium text-xs tracking-wide uppercase">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Core Intuition &amp; Invariants</span>
                  </div>
                  <p className="text-xs sm:text-[13px] text-m3-on-surface/90 leading-relaxed">
                    To solve <strong className="text-m3-on-surface font-medium">{problem.title}</strong> efficiently, identify the underlying invariants and bounds.
                    A naive brute-force approach often examines all combinations, resulting in an unacceptable <span className="font-mono text-m3-error bg-m3-error-container/50 px-1 py-0.5 rounded text-[11px]">O(N²)</span> runtime.
                    By leveraging optimal data structures (such as hash tables, two pointers, or monotonic structures), we can prune redundant exploration down to linear time.
                  </p>
                </div>

                {/* Complexity Analysis Cards */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-m3-surface-container-low border border-m3-outline-variant/40 rounded-xl p-3 space-y-1 shadow-sm">
                    <div className="text-[11px] text-m3-on-surface-variant font-medium">Time Complexity</div>
                    <div className="text-sm font-bold font-mono text-m3-success">O(N)</div>
                    <div className="text-[11px] text-m3-on-surface-variant/80">Single pass over input elements.</div>
                  </div>
                  <div className="bg-m3-surface-container-low border border-m3-outline-variant/40 rounded-xl p-3 space-y-1 shadow-sm">
                    <div className="text-[11px] text-m3-on-surface-variant font-medium">Space Complexity</div>
                    <div className="text-sm font-bold font-mono text-[#ffba38]">O(N) or O(1)</div>
                    <div className="text-[11px] text-m3-on-surface-variant/80">Auxiliary lookup storage.</div>
                  </div>
                </div>

                {/* Step by Step Breakdown */}
                <div className="space-y-2 pt-1">
                  <h3 className="text-xs font-semibold text-m3-on-surface uppercase tracking-wider">Algorithm Walkthrough</h3>
                  <div className="space-y-2 text-xs text-m3-on-surface-variant leading-relaxed">
                    <div className="bg-m3-surface-container-low border border-m3-outline-variant/30 p-3 rounded-xl flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-m3-primary-container text-m3-on-primary-container font-semibold text-[11px] flex items-center justify-center shrink-0">1</span>
                      <div>
                        <strong className="text-m3-on-surface block mb-0.5 font-medium">Parse &amp; Normalize Input:</strong>
                        Ensure array boundaries and constraints are respected, handling empty or single-element corner cases upfront.
                      </div>
                    </div>
                    <div className="bg-m3-surface-container-low border border-m3-outline-variant/30 p-3 rounded-xl flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-m3-primary-container text-m3-on-primary-container font-semibold text-[11px] flex items-center justify-center shrink-0">2</span>
                      <div>
                        <strong className="text-m3-on-surface block mb-0.5 font-medium">Track Visited States:</strong>
                        Maintain a lookup map or window pointers to verify if the complementary target condition has been fulfilled.
                      </div>
                    </div>
                    <div className="bg-m3-surface-container-low border border-m3-outline-variant/30 p-3 rounded-xl flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-m3-primary-container text-m3-on-primary-container font-semibold text-[11px] flex items-center justify-center shrink-0">3</span>
                      <div>
                        <strong className="text-m3-on-surface block mb-0.5 font-medium">Final Return:</strong>
                        Return the calculated target index or optimal value as specified by the problem definition.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progressive Hints Accordion */}
                <div className="space-y-2 pt-1">
                  <h3 className="text-xs font-semibold text-m3-on-surface flex items-center gap-1.5 uppercase tracking-wider">
                    <Lightbulb className="w-3.5 h-3.5 text-[#ffba38]" />
                    <span>Progressive Hints</span>
                  </h3>
                  {[
                    { num: 1, text: "Can you solve this without re-scanning elements you have already traversed?" },
                    { num: 2, text: "Think about what information you need to recall in O(1) time. What data structure provides constant-time average lookups?" },
                    { num: 3, text: "Store elements in a Hash Map mapping { value: index }. As you iterate, check if the required complement is already in the map!" }
                  ].map((h) => {
                    const isOpen = openHints[h.num];
                    return (
                      <div key={h.num} className="bg-m3-surface-container-low border border-m3-outline-variant/30 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setOpenHints((prev) => ({ ...prev, [h.num]: !prev[h.num] }))}
                          className="w-full px-3.5 py-2.5 text-left flex items-center justify-between text-xs font-medium text-m3-on-surface hover:bg-white/5 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-[#ffba38] font-semibold">Hint {h.num}</span>
                            <span className="text-m3-on-surface-variant text-[11px]">{isOpen ? "" : "— Click to reveal"}</span>
                          </span>
                          {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-m3-on-surface-variant" /> : <ChevronDown className="w-3.5 h-3.5 text-m3-on-surface-variant" />}
                        </button>
                        {isOpen && (
                          <div className="px-3.5 pb-3 text-xs text-m3-on-surface-variant leading-relaxed border-t border-m3-outline-variant/30 pt-2 bg-m3-surface-container-lowest">
                            {h.text}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {leftTab === "solutions" && (
              <div className="space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-m3-on-surface flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-m3-success" />
                      <span>Optimal Solutions</span>
                    </h2>
                    <p className="text-xs text-m3-on-surface-variant mt-0.5">
                      Clean, production-grade solutions with complexity analysis.
                    </p>
                  </div>

                  {/* Apply button */}
                  <button
                    onClick={() => {
                      const sol = getProblemSolutions(problem, solutionLang);
                      setCode(sol.code);
                      setLanguage(solutionLang);
                      localStorage.setItem(`codearena_${problem.slug}_${solutionLang}`, sol.code);
                      toast.success(`Loaded ${solutionLang} solution into editor! Click ▶ Run to test.`);
                    }}
                    className="m3-btn-filled text-xs py-1.5 px-3.5 flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-sm"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Apply to Editor</span>
                  </button>
                </div>

                {/* Language Picker */}
                <div className="flex flex-wrap gap-1 bg-m3-surface-container p-1 rounded-full border border-m3-outline-variant/30">
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setSolutionLang(l.id)}
                      className={clsx(
                        "text-xs px-3 py-1 rounded-full font-medium transition-colors",
                        solutionLang === l.id
                          ? "bg-m3-primary text-m3-on-primary font-semibold shadow-sm"
                          : "text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-white/5"
                      )}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>

                {/* Solution Display Card */}
                {(() => {
                  const sol = getProblemSolutions(problem, solutionLang);
                  return (
                    <div className="bg-m3-surface-container-low border border-m3-outline-variant/40 rounded-2xl overflow-hidden shadow-sm space-y-3 p-4">
                      <div className="flex items-center justify-between border-b border-m3-outline-variant/30 pb-2.5">
                        <div>
                          <div className="font-semibold text-m3-on-surface text-xs sm:text-sm">{sol.title}</div>
                          <div className="text-xs text-m3-on-surface-variant mt-0.5">{sol.approach}</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-mono bg-m3-success-container/70 text-m3-success px-2 py-0.5 rounded-full border border-m3-success/30">
                            {sol.complexity.time}
                          </span>
                          <span className="text-[11px] font-mono bg-m3-warning-container/70 text-[#ffe088] px-2 py-0.5 rounded-full border border-m3-warning/30">
                            {sol.complexity.space}
                          </span>
                        </div>
                      </div>

                      {/* Solution Code Block with Copy */}
                      <div className="relative group">
                        <pre className="bg-m3-surface-container-lowest border border-m3-outline-variant/30 p-3.5 rounded-xl text-xs font-mono text-m3-on-surface overflow-x-auto leading-relaxed max-h-96">
                          <code>{sol.code}</code>
                        </pre>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(sol.code);
                            setCopiedSolution(true);
                            toast.success("Solution copied to clipboard!");
                            setTimeout(() => setCopiedSolution(false), 2000);
                          }}
                          className="absolute top-2.5 right-2.5 bg-m3-surface-container hover:bg-m3-surface-container-high text-m3-on-surface-variant hover:text-m3-on-surface px-2.5 py-1 rounded-full text-[11px] font-mono border border-m3-outline-variant/40 flex items-center gap-1 transition-colors"
                        >
                          {copiedSolution ? <Check className="w-3 h-3 text-m3-success" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedSolution ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {leftTab === "submissions" && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-semibold text-m3-on-surface flex items-center gap-2">
                    <History className="w-4 h-4 text-m3-tertiary" />
                    <span>Your Submissions</span>
                  </h2>
                  <Link
                    href="/submissions"
                    className="text-xs text-m3-primary hover:underline flex items-center gap-1"
                  >
                    <span>All Submissions</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {loadingSubmissions ? (
                  <div className="text-xs text-m3-on-surface-variant py-10 text-center flex flex-col items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-m3-primary" />
                    <span>Loading submissions...</span>
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="bg-m3-surface-container-low border border-m3-outline-variant/30 rounded-2xl p-6 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-m3-surface-container text-m3-on-surface-variant flex items-center justify-center mx-auto">
                      <History className="w-5 h-5" />
                    </div>
                    <div className="text-m3-on-surface text-xs sm:text-sm font-semibold">No Submissions Yet</div>
                    <p className="text-xs text-m3-on-surface-variant max-w-xs mx-auto">
                      Click <strong className="text-m3-primary">Submit</strong> in the top bar to run test cases!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {submissions.map((s) => (
                      <div
                        key={s.id}
                        className="bg-m3-surface-container-low border border-m3-outline-variant/30 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={clsx(
                              "font-bold text-[11px] px-2 py-0.5 rounded-full uppercase tracking-wide",
                              s.verdict === "ACCEPTED"
                                ? "bg-m3-success-container/70 text-m3-success border border-m3-success/30"
                                : "bg-m3-error-container/70 text-m3-error border border-m3-error/30"
                            )}
                          >
                            {s.verdict.replace(/_/g, " ")}
                          </span>
                          <span className="text-m3-on-surface capitalize">{s.language}</span>
                          {s.runtime !== null && <span className="text-m3-on-surface-variant">{s.runtime} ms</span>}
                        </div>

                        <div className="flex items-center gap-2 text-m3-on-surface-variant">
                          <span>{new Date(s.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {s.code && (
                            <button
                              onClick={() => {
                                setCode(s.code);
                                setLanguage(s.language);
                                toast.success("Restored code into editor!");
                              }}
                              className="text-xs bg-m3-surface-container hover:bg-m3-surface-container-high text-m3-on-surface px-2.5 py-0.5 rounded-full transition-colors font-sans"
                            >
                              Restore Code
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Draggable Divider (Horizontal Split) */}
        <div
          onMouseDown={() => {
            isDraggingSplit.current = true;
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
          }}
          className="w-1 bg-m3-outline-variant/20 hover:bg-m3-primary transition-colors cursor-col-resize z-10 shrink-0"
        />

        {/* Right Pane: Code Editor + Testcases / Console */}
        <div
          style={{ width: `${100 - splitRatio}%` }}
          className="flex flex-col bg-m3-surface-container-lowest overflow-hidden"
        >
          {/* Editor Header Toolbar */}
          <div className="h-11 bg-m3-surface-container-low border-b border-m3-outline-variant/30 flex items-center justify-between px-3 shrink-0">
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-m3-surface-container border border-m3-outline-variant/40 text-m3-on-surface text-xs font-medium rounded-lg px-2.5 py-1 focus:outline-none focus:border-m3-primary cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Editor Actions */}
            <div className="flex items-center gap-1 text-m3-on-surface-variant text-xs">
              <button
                onClick={handleResetCode}
                className="px-2.5 py-1 hover:text-m3-on-surface hover:bg-white/5 rounded-full transition-colors"
                title="Reset code"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 relative overflow-hidden bg-m3-surface-container-lowest">
            <Editor
              height="100%"
              language={SUPPORTED_LANGUAGES.find((l) => l.id === language)?.monacoLang || "python"}
              value={code}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                fontSize: 13.5,
                lineHeight: 20,
                fontFamily: "var(--font-roboto-mono), 'Roboto Mono', 'JetBrains Mono', Consolas, monospace",
                fontLigatures: true,
                minimap: { enabled: false },
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                wordWrap: "on",
                tabSize: language === "python" ? 4 : 2,
                automaticLayout: true,
                padding: { top: 12, bottom: 12 },
                cursorBlinking: "smooth",
                smoothScrolling: true,
                bracketPairColorization: { enabled: true },
                renderLineHighlight: "all",
              }}
            />
          </div>

          {/* Draggable Divider (Vertical Split for Console) */}
          {isConsoleOpen && (
            <div
              onMouseDown={() => {
                isDraggingConsole.current = true;
                document.body.style.cursor = "row-resize";
                document.body.style.userSelect = "none";
              }}
              className="h-1 bg-m3-outline-variant/20 hover:bg-m3-primary transition-colors cursor-row-resize z-10 shrink-0"
            />
          )}

          {/* Bottom Console Panel (Collapsible) - Google Material 3 */}
          <div
            style={{ height: isConsoleOpen ? `${consoleHeight}px` : "36px" }}
            className="bg-m3-surface-container-low border-t border-m3-outline-variant/30 flex flex-col shrink-0 overflow-hidden transition-all duration-150"
          >
            {/* Console Header Bar */}
            <div className="h-9 bg-m3-surface-container border-b border-m3-outline-variant/30 flex items-center justify-between px-3 shrink-0">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setConsoleTab("testcase");
                    setIsConsoleOpen(true);
                  }}
                  className={clsx(
                    "text-xs font-medium px-3 py-1 rounded-full transition-all duration-150 select-none",
                    consoleTab === "testcase" && isConsoleOpen
                      ? "bg-m3-secondary-container text-m3-on-secondary-container shadow-xs font-semibold"
                      : "text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-container-high"
                  )}
                >
                  Testcase
                </button>

                <button
                  onClick={() => {
                    setConsoleTab("result");
                    setIsConsoleOpen(true);
                  }}
                  className={clsx(
                    "text-xs font-medium px-3 py-1 rounded-full transition-all duration-150 flex items-center gap-1.5 select-none",
                    consoleTab === "result" && isConsoleOpen
                      ? "bg-m3-secondary-container text-m3-on-secondary-container shadow-xs font-semibold"
                      : "text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-container-high"
                  )}
                >
                  <span>Test Result</span>
                  {runResult && (
                    <span
                      className={clsx(
                        "w-2 h-2 rounded-full",
                        runResult.verdict === "ACCEPTED" ? "bg-m3-success" : "bg-m3-error"
                      )}
                    />
                  )}
                </button>
              </div>

              {/* Console Toggle */}
              <button
                onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                className="text-m3-on-surface-variant hover:text-m3-on-surface p-1 rounded-full hover:bg-m3-surface-container-high transition-colors"
                title={isConsoleOpen ? "Collapse Console" : "Expand Console"}
              >
                {isConsoleOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>

            {/* Console Body */}
            {isConsoleOpen && (
              <div className="flex-1 overflow-y-auto p-3.5 font-mono text-xs">
                {consoleTab === "testcase" && (
                  <div className="space-y-3">
                    {/* Case Tabs */}
                    <div className="flex items-center gap-1.5">
                      {sampleCases.map((c, idx) => (
                        <button
                          key={c.caseNum}
                          onClick={() => setSelectedCaseIdx(idx)}
                          className={clsx(
                            "px-2.5 py-1 rounded-lg text-xs font-sans font-medium transition-colors select-none",
                            selectedCaseIdx === idx
                              ? "bg-m3-secondary-container text-m3-on-secondary-container shadow-xs font-semibold"
                              : "bg-m3-surface-container border border-m3-outline-variant/30 text-m3-on-surface-variant hover:text-m3-on-surface"
                          )}
                        >
                          Case {c.caseNum}
                        </button>
                      ))}
                    </div>

                    {/* Active Case Parameters */}
                    {sampleCases[selectedCaseIdx] && (
                      <div className="space-y-2">
                        <div className="text-m3-on-surface-variant font-sans text-xs">Input:</div>
                        <div className="bg-m3-surface-container-lowest border border-m3-outline-variant/30 rounded-xl p-2.5 text-m3-on-surface font-mono text-[12px] leading-5">
                          {sampleCases[selectedCaseIdx].input}
                        </div>

                        <div className="text-m3-on-surface-variant font-sans text-xs">Expected Output:</div>
                        <div className="bg-m3-surface-container-lowest border border-m3-outline-variant/30 rounded-xl p-2.5 text-m3-success font-mono text-[12px] leading-5">
                          {sampleCases[selectedCaseIdx].output}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {consoleTab === "result" && (
                  <div className="space-y-3">
                    {isRunning ? (
                      <div className="flex items-center gap-2 text-m3-on-surface-variant py-4 font-sans text-xs">
                        <div className="w-4 h-4 border-2 border-m3-primary border-t-transparent rounded-full animate-spin" />
                        <span>Running sample test cases in judge sandbox...</span>
                      </div>
                    ) : !runResult ? (
                      <div className="text-m3-on-surface-variant/70 py-4 text-center font-sans text-xs">
                        Click &quot;Run&quot; to execute your solution against sample testcases.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Verdict Header */}
                        <div className="flex items-center justify-between pb-2 border-b border-m3-outline-variant/30">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={clsx(
                                "text-xs font-medium px-2.5 py-0.5 rounded-full capitalize select-none",
                                runResult.verdict === "ACCEPTED"
                                  ? "bg-m3-success-container/40 text-m3-success border border-m3-success/30"
                                  : "bg-m3-error-container/40 text-m3-error border border-m3-error/30"
                              )}
                            >
                              {runResult.verdict.replace(/_/g, " ")}
                            </span>
                            {runResult.totalCases !== undefined && (
                              <span className="text-xs font-mono font-semibold text-m3-on-surface">
                                ({runResult.passedCases ?? 0} / {runResult.totalCases} test cases passed)
                              </span>
                            )}
                            <span className="text-xs text-m3-on-surface-variant font-mono">
                              Runtime: {runResult.runtime} ms
                            </span>
                            {runResult.executedLocally && (
                              <span className="text-[11px] font-mono text-m3-success bg-m3-success-container/30 border border-m3-success/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Cpu className="w-3 h-3 text-m3-success" />
                                <span>Direct Hardware Execution</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Error Message if any */}
                        {runResult.errorMessage && (
                          <div className="bg-m3-error-container/30 border border-m3-error/40 rounded-xl p-3 text-m3-error whitespace-pre-wrap font-mono text-[12px] leading-5">
                            {runResult.errorMessage}
                          </div>
                        )}

                        {/* Per-Testcase Output Tabs */}
                        {runResult.testCaseResults && runResult.testCaseResults.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-1.5">
                              {runResult.testCaseResults.map((tc, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setSelectedCaseIdx(idx)}
                                  className={clsx(
                                    "px-2.5 py-1 rounded-lg text-xs font-sans font-medium flex items-center gap-1.5 transition-colors select-none",
                                    selectedCaseIdx === idx
                                      ? "bg-m3-secondary-container text-m3-on-secondary-container shadow-xs font-semibold"
                                      : "bg-m3-surface-container border border-m3-outline-variant/30 text-m3-on-surface-variant hover:text-m3-on-surface"
                                  )}
                                >
                                  <span
                                    className={clsx(
                                      "w-2 h-2 rounded-full",
                                      tc.passed ? "bg-m3-success" : "bg-m3-error"
                                    )}
                                  />
                                  <span>Case {idx + 1}</span>
                                </button>
                              ))}
                            </div>

                            {/* Active Case Details */}
                            {runResult.testCaseResults[selectedCaseIdx] && (
                              <div className="space-y-2">
                                <div>
                                  <div className="text-m3-on-surface-variant font-sans text-xs">Input:</div>
                                  <div className="bg-m3-surface-container-lowest border border-m3-outline-variant/30 rounded-xl p-2.5 text-m3-on-surface font-mono text-[12px]">
                                    {runResult.testCaseResults[selectedCaseIdx].input}
                                  </div>
                                </div>

                                <div>
                                  <div className="text-m3-on-surface-variant font-sans text-xs">Your Output:</div>
                                  <div
                                    className={clsx(
                                      "border rounded-xl p-2.5 font-mono text-[12px]",
                                      runResult.testCaseResults[selectedCaseIdx].passed
                                        ? "bg-m3-surface-container-lowest border-m3-outline-variant/30 text-m3-success"
                                        : "bg-m3-error-container/20 border-m3-error/40 text-m3-error"
                                    )}
                                  >
                                    {runResult.testCaseResults[selectedCaseIdx].actual || "(no output)"}
                                  </div>
                                </div>

                                <div>
                                  <div className="text-m3-on-surface-variant font-sans text-xs">Expected Output:</div>
                                  <div className="bg-m3-surface-container-lowest border border-m3-outline-variant/30 rounded-xl p-2.5 text-m3-success font-mono text-[12px]">
                                    {runResult.testCaseResults[selectedCaseIdx].expected}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Hardware Runner Configuration Modal */}
      {showRunnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-m3-surface-container border border-m3-outline-variant/50 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-m3-on-surface">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-m3-outline-variant/30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#a8c7fa] to-[#0842a0] flex items-center justify-center text-[#062e6f]">
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-m3-on-surface">Hardware Executor Settings</h3>
                  <p className="text-[11px] text-m3-on-surface-variant">Run code directly on your local CPU for $0 server cost</p>
                </div>
              </div>
              <button
                onClick={() => setShowRunnerModal(false)}
                className="p-1 rounded-full text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-white/10"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Execution Target Switcher */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-m3-on-surface-variant uppercase tracking-wider">
                Execution Target
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setExecutorMode("local")}
                  className={clsx(
                    "p-3 rounded-xl border text-left transition-all",
                    executorMode === "local"
                      ? "bg-m3-surface-container-high border-m3-primary text-m3-on-surface shadow-xs"
                      : "bg-m3-surface-container-low border-m3-outline-variant/30 text-m3-on-surface-variant hover:bg-m3-surface-container-high"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-m3-primary" />
                      <span>Local Hardware</span>
                    </span>
                    {localRunnerOnline ? (
                      <span className="w-2 h-2 rounded-full bg-m3-success" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-m3-error" />
                    )}
                  </div>
                  <p className="text-[11px] text-m3-on-surface-variant leading-relaxed">
                    0ms queue delay &bull; Direct CPU execution &bull; 100% Free
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setExecutorMode("cloud")}
                  className={clsx(
                    "p-3 rounded-xl border text-left transition-all",
                    executorMode === "cloud"
                      ? "bg-m3-surface-container-high border-m3-primary text-m3-on-surface shadow-xs"
                      : "bg-m3-surface-container-low border-m3-outline-variant/30 text-m3-on-surface-variant hover:bg-m3-surface-container-high"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs flex items-center gap-1.5">
                      <Cloud className="w-3.5 h-3.5 text-m3-on-surface-variant" />
                      <span>Cloud Sandbox</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-m3-on-surface-variant leading-relaxed">
                    Server judge fallback &bull; Remote container isolation
                  </p>
                </button>
              </div>
            </div>

            {/* Hardware Status / Info */}
            <div className="bg-m3-surface-container-low border border-m3-outline-variant/30 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-m3-on-surface-variant">Daemon Status:</span>
                <span className={clsx("font-semibold font-mono", localRunnerOnline ? "text-m3-success" : "text-m3-error")}>
                  {localRunnerOnline ? "● ONLINE (127.0.0.1:5001)" : "○ OFFLINE"}
                </span>
              </div>
              {runnerHardware && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-m3-on-surface-variant">Host Processor:</span>
                    <span className="font-mono text-m3-on-surface">{runnerHardware.cpuModel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-m3-on-surface-variant">Cores & Threads:</span>
                    <span className="font-mono text-m3-on-surface">{runnerHardware.cpuCores} Threads</span>
                  </div>
                  {runnerHardware.totalMemoryGb && (
                    <div className="flex items-center justify-between">
                      <span className="text-m3-on-surface-variant">Available Memory:</span>
                      <span className="font-mono text-m3-on-surface">
                        {runnerHardware.freeMemoryGb} GB free / {runnerHardware.totalMemoryGb} GB total
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* If Offline: Show Quick Launch Help */}
            {!localRunnerOnline && (
              <div className="bg-m3-surface-container-highest/60 border border-m3-outline-variant/40 rounded-xl p-3 text-xs space-y-1.5">
                <div className="font-medium text-m3-warning flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>How to activate Local Hardware Runner:</span>
                </div>
                <p className="text-m3-on-surface-variant text-[11.5px] leading-relaxed">
                  1. Double-click <code className="bg-black/30 px-1 py-0.5 rounded text-[#ffe088]">start-runner.bat</code> in the repository root, or<br />
                  2. Run <code className="bg-black/30 px-1 py-0.5 rounded text-[#ffe088]">npm run runner</code> in your terminal.
                </p>
              </div>
            )}

            {/* Action Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-m3-outline-variant/30">
              <a
                href="http://127.0.0.1:5001"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-m3-primary hover:underline flex items-center gap-1"
              >
                <span>Open Runner Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={() => setShowRunnerModal(false)}
                className="bg-m3-primary hover:brightness-110 text-m3-on-primary font-semibold text-xs px-4 py-1.5 rounded-full transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getDefaultStarterCode(lang: Language, slug: string): string {
  switch (lang) {
    case "python":
      return `class Solution:\n    def solve(self) -> None:\n        # Write your solution here\n        pass\n`;
    case "javascript":
      return `/**\n * @return {void}\n */\nvar solve = function() {\n    // Write your solution here\n};\n`;
    case "typescript":
      return `function solve(): void {\n    // Write your solution here\n}\n`;
    case "cpp":
      return `#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    void solve() {\n        // Write your solution here\n    }\n};\n`;
    case "java":
      return `class Solution {\n    public void solve() {\n        // Write your solution here\n    }\n}\n`;
    case "go":
      return `package main\n\nfunc solve() {\n    // Write your solution here\n}\n`;
    case "rust":
      return `struct Solution;\n\nimpl Solution {\n    pub fn solve() {\n        // Write your solution here\n    }\n}\n`;
    default:
      return `// Write your solution here\n`;
  }
}
