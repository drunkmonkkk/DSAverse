"use client";
import { useEffect, useState } from "react";
import type { Language } from "@/lib/types";
const languageIds: Record<Language, string> = {
  Python: "python",
  JavaScript: "javascript",
  TypeScript: "typescript",
  Java: "java",
  "C++": "cpp",
  C: "c",
};
export function CodeBlock({
  code,
  language,
}: {
  code: string;
  language: Language;
}) {
  const [highlight, setHighlight] = useState<{
      code: string;
      language: Language;
      html: string;
    } | null>(null),
    [copied, setCopied] = useState("Copy code");
  useEffect(() => {
    let active = true;
    void import("shiki")
      .then(({ codeToHtml }) =>
        codeToHtml(code, { lang: languageIds[language], theme: "github-dark" }),
      )
      .then((html) => {
        if (active) setHighlight({ code, language, html });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [code, language]);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied("Copied");
    } catch {
      setCopied("Copy unavailable — select the code");
    }
  }
  return (
    <div className="code-box section">
      <div className="code-header">
        <span>{language}</span>
        <button className="button outline" onClick={() => void copy()}>
          {copied}
        </button>
      </div>
      {highlight?.code === code && highlight.language === language ? (
        <div
          className="code-content"
          dangerouslySetInnerHTML={{ __html: highlight.html }}
        />
      ) : (
        <pre className="code-content">{code}</pre>
      )}
    </div>
  );
}
