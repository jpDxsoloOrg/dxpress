"use client";

import { useState, useEffect } from "react";
import { List, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

function extractHeadings(content: string): TocItem[] {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const items: TocItem[] = [];
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2]
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/`(.+?)`/g, "$1")
      .replace(/\[(.+?)\]\(.+?\)/g, "$1")
      .trim();

    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

    items.push({ id, text, level });
  }

  return items;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const items = extractHeadings(content);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "0px 0px -80% 0px", threshold: 0 }
    );

    const headings = document.querySelectorAll("h2[id], h3[id], h4[id]");
    headings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, []);

  if (items.length < 2) return null;

  return (
    <>
      {/* Mobile: collapsible */}
      <div className="mb-8 rounded-lg border border-neutral-200 dark:border-neutral-800 lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          <span className="inline-flex items-center gap-2">
            <List className="h-4 w-4" />
            Table of Contents
          </span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {isOpen && (
          <nav className="border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
            <TocList items={items} activeId={activeId} />
          </nav>
        )}
      </div>

      {/* Desktop: sticky sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            On this page
          </p>
          <nav>
            <TocList items={items} activeId={activeId} />
          </nav>
        </div>
      </aside>
    </>
  );
}

function TocList({ items, activeId }: { items: TocItem[]; activeId: string }) {
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className={cn(
              "block rounded-md py-1 text-sm transition-colors",
              item.level === 2 && "pl-0",
              item.level === 3 && "pl-4",
              item.level === 4 && "pl-8",
              activeId === item.id
                ? "font-medium text-accent-600 dark:text-accent-400"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
            )}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );
}
