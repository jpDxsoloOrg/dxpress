import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { PostWithTags } from "@/lib/data/posts";

interface PostNavigationProps {
  prev: PostWithTags | null;
  next: PostWithTags | null;
}

export function PostNavigation({ prev, next }: PostNavigationProps) {
  if (!prev && !next) return null;

  return (
    <nav className="mt-12 grid grid-cols-1 gap-4 border-t border-neutral-200 pt-8 dark:border-neutral-800 sm:grid-cols-2">
      {prev ? (
        <Link
          href={`/blog/${prev.slug}`}
          className="group flex flex-col rounded-lg border border-neutral-200 p-4 transition-colors hover:border-accent-300 hover:bg-accent-50/50 dark:border-neutral-800 dark:hover:border-accent-800 dark:hover:bg-accent-950/20"
        >
          <span className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
            <ArrowLeft className="h-3 w-3" />
            Previous
          </span>
          <span className="text-sm font-medium text-neutral-900 group-hover:text-accent-600 dark:text-white dark:group-hover:text-accent-400">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={`/blog/${next.slug}`}
          className="group flex flex-col items-end rounded-lg border border-neutral-200 p-4 text-right transition-colors hover:border-accent-300 hover:bg-accent-50/50 dark:border-neutral-800 dark:hover:border-accent-800 dark:hover:bg-accent-950/20"
        >
          <span className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Next
            <ArrowRight className="h-3 w-3" />
          </span>
          <span className="text-sm font-medium text-neutral-900 group-hover:text-accent-600 dark:text-white dark:group-hover:text-accent-400">
            {next.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
