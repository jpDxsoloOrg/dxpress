"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface TagFilterProps {
  tags: { id: string; name: string; slug: string }[];
  activeTag?: string;
}

export function TagFilter({ tags, activeTag }: TagFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleTagClick(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === activeTag) {
      params.delete("tag");
    } else {
      params.set("tag", slug);
    }
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `/blog?${qs}` : "/blog");
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleTagClick(activeTag ?? "")}
        className={cn(
          "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
          !activeTag
            ? "bg-accent-600 text-white"
            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
        )}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag.id}
          onClick={() => handleTagClick(tag.slug)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            activeTag === tag.slug
              ? "bg-accent-600 text-white"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
          )}
        >
          {tag.name}
        </button>
      ))}
    </div>
  );
}
