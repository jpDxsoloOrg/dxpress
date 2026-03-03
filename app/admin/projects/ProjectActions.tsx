"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";

interface ProjectActionsProps {
  projectId: string;
}

export function ProjectActions({ projectId }: ProjectActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function deleteProject() {
    if (!confirm("Are you sure you want to delete this project?")) return;
    setLoading(true);
    await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/projects/${projectId}/edit`}
        className="rounded p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
        title="Edit"
      >
        <Edit className="h-4 w-4" />
      </Link>
      <button
        onClick={deleteProject}
        disabled={loading}
        className="rounded p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/50 dark:hover:text-red-400"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
