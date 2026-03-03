"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { MarkdownEditor } from "./MarkdownEditor";
import { ImageUpload } from "./ImageUpload";
import { TagSelector } from "./TagSelector";

interface PostFormData {
  id?: string;
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  published: boolean;
  tagIds: string[];
}

interface PostFormProps {
  initialData?: PostFormData;
  mode: "create" | "edit";
}

export function PostForm({ initialData, mode }: PostFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<PostFormData>({
    title: initialData?.title ?? "",
    content: initialData?.content ?? "",
    excerpt: initialData?.excerpt ?? "",
    coverImage: initialData?.coverImage ?? "",
    published: initialData?.published ?? false,
    tagIds: initialData?.tagIds ?? [],
  });

  const updateField = useCallback(
    <K extends keyof PostFormData>(field: K, value: PostFormData[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setError("Title and content are required.");
      return;
    }

    setError("");
    setSaving(true);

    try {
      const url =
        mode === "create"
          ? "/api/posts"
          : `/api/posts/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save post");
      }

      router.push("/admin/posts");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/posts"
            className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
            {mode === "create" ? "New Post" : "Edit Post"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => updateField("published", e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-accent-600 focus:ring-accent-500"
            />
            <span className="text-neutral-700 dark:text-neutral-300">
              Publish
            </span>
          </label>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-700 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main column */}
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Post title..."
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 placeholder-neutral-400 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Content
            </label>
            <MarkdownEditor
              value={form.content}
              onChange={(val) => updateField("content", val)}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Excerpt
            </label>
            <textarea
              value={form.excerpt}
              onChange={(e) => updateField("excerpt", e.target.value)}
              placeholder="Brief description for previews..."
              rows={3}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500"
            />
          </div>

          <ImageUpload
            value={form.coverImage}
            onChange={(url) => updateField("coverImage", url)}
          />

          <TagSelector
            selectedIds={form.tagIds}
            onChange={(ids) => updateField("tagIds", ids)}
          />
        </div>
      </div>
    </form>
  );
}
