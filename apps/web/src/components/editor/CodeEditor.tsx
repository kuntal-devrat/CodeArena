"use client";

import { Editor } from "@monaco-editor/react";
import { useState } from "react";
import type { Language } from "@codearena/shared";

const LANGUAGES: Language[] = ["python", "javascript", "typescript", "java", "cpp", "go", "rust"];

interface CodeEditorProps {
  initialCode?: string;
  language?: Language;
  readOnly?: boolean;
  onChange?: (code: string) => void;
  onRun?: (code: string, language: Language) => void;
  onSubmit?: (code: string, language: Language) => void;
}

export function CodeEditor({
  initialCode = "",
  language: initialLang = "python",
  readOnly = false,
  onChange,
  onRun,
  onSubmit,
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState<Language>(initialLang);

  function handleChange(value: string | undefined) {
    const v = value ?? "";
    setCode(v);
    onChange?.(v);
  }

  return (
    <div className="flex flex-col h-full bg-arena-surface border border-arena-border rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-arena-border">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          disabled={readOnly}
          className="bg-arena-bg border border-arena-border text-white text-sm rounded-md px-2 py-1 focus:outline-none focus:border-brand-500"
          aria-label="Select language"
        >
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>

        {!readOnly && (
          <div className="flex gap-2">
            <button
              onClick={() => onRun?.(code, language)}
              className="btn-ghost text-sm py-1 px-3 border border-arena-border"
            >
              ▶ Run
            </button>
            <button
              onClick={() => onSubmit?.(code, language)}
              className="btn-primary text-sm py-1 px-3"
            >
              Submit
            </button>
          </div>
        )}

        {readOnly && (
          <span className="text-xs text-arena-muted border border-arena-border px-2 py-1 rounded-md">
            👀 Read-only Peek
          </span>
        )}
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={language === "cpp" ? "cpp" : language}
          value={code}
          onChange={handleChange}
          options={{
            readOnly,
            theme: "vs-dark",
            fontSize: 14,
            fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', monospace",
            minimap: { enabled: false },
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            tabSize: 2,
            padding: { top: 12 },
          }}
        />
      </div>
    </div>
  );
}
