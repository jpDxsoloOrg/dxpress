"use client";

import { useCallback, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  "data-language"?: string;
  "data-theme"?: string;
}

export function CodeBlock({ children, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLDivElement>(null);
  const language = props["data-language"] || "";

  const copyToClipboard = useCallback(() => {
    const text = codeRef.current?.textContent ?? "";
    if (!text) return;

    // Use the synchronous clipboard fallback first for reliability,
    // then try the async API. The async clipboard API can lose
    // user-activation context after hydration on some browsers.
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    } catch {
      // Fall back to async API if execCommand fails
      navigator.clipboard.writeText(text).catch(() => {});
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <div className="group relative my-6 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
      {language && (
        <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-100 px-4 py-2 dark:border-neutral-800 dark:bg-neutral-800/50">
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            {language}
          </span>
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-neutral-500 transition-colors hover:bg-neutral-200 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
            aria-label="Copy code"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
      )}
      <div className="overflow-x-auto p-4" ref={codeRef}>
        <pre className="text-sm leading-relaxed" {...props}>
          {children}
        </pre>
      </div>
    </div>
  );
}
