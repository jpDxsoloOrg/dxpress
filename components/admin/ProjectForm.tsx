"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { MarkdownEditor } from "./MarkdownEditor";
import { ImageUpload } from "./ImageUpload";

interface ProjectFormData {
  id?: string;
  title: string;
  description: string;
  content: string;
  coverImage: string;
  githubUrl: string;
  liveUrl: string;
  techStack: string;
  featured: boolean;
  sortOrder: number;
}

interface ProjectFormProps {
  initialData?: ProjectFormData;
  mode: "create" | "edit";
}

export function ProjectForm({ initialData, mode }: ProjectFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<ProjectFormData>({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    content: initialData?.content ?? "",
    coverImage: initialData?.coverImage ?? "",
    githubUrl: initialData?.githubUrl ?? "",
    liveUrl: initialData?.liveUrl ?? "",
    techStack: initialData?.techStack ?? "",
    featured: initialData?.featured ?? false,
    sortOrder: initialData?.sortOrder ?? 0,
  });

  const updateField = useCallback(
    <K extends keyof ProjectFormData>(field: K, value: ProjectFormData[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.content.trim()) {
      setError("Title, description, and content are required.");
      return;
    }

    setError("");
    setSaving(true);

    try {
      const url =
        mode === "create"
          ? "/api/projects"
          : `/api/projects/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const techStack = form.techStack
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          content: form.content,
          coverImage: form.coverImage || undefined,
          githubUrl: form.githubUrl || undefined,
          liveUrl: form.liveUrl || undefined,
          techStack,
          featured: form.featured,
          sortOrder: form.sortOrder,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save project");
      }

      router.push("/admin/projects");
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
            href="/admin/projects"
            className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
            {mode === "create" ? "New Project" : "Edit Project"}
          </h1>
        </div>
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

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Project title..."
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 placeholder-neutral-400 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Short project description..."
              rows={2}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500"
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

        <div className="space-y-4">
          <ImageUpload
            value={form.coverImage}
            onChange={(url) => updateField("coverImage", url)}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              GitHub URL
            </label>
            <input
              type="url"
              value={form.githubUrl}
              onChange={(e) => updateField("githubUrl", e.target.value)}
              placeholder="https://github.com/..."
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Live URL
            </label>
            <input
              type="url"
              value={form.liveUrl}
              onChange={(e) => updateField("liveUrl", e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Tech Stack (comma-separated)
            </label>
            <input
              type="text"
              value={form.techStack}
              onChange={(e) => updateField("techStack", e.target.value)}
              placeholder="React, TypeScript, Node.js..."
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => updateField("featured", e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-accent-600 focus:ring-accent-500"
              />
              <span className="text-neutral-700 dark:text-neutral-300">
                Featured
              </span>
            </label>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Sort Order
            </label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) =>
                updateField("sortOrder", parseInt(e.target.value, 10) || 0)
              }
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
