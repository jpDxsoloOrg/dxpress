"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  if (!content) {
    return (
      <p className="text-sm italic text-neutral-400 dark:text-neutral-500">
        Nothing to preview yet. Start writing on the Write tab.
      </p>
    );
  }

  return (
    <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-a:text-accent-600 prose-a:no-underline hover:prose-a:underline dark:prose-a:text-accent-400 prose-img:rounded-lg prose-pre:bg-neutral-100 dark:prose-pre:bg-neutral-900">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
