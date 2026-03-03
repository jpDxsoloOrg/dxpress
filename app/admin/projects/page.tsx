import Link from "next/link";
import { Plus, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProjectActions } from "./ProjectActions";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Projects
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Manage your portfolio projects.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-700"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
              <th className="px-4 py-3 text-left font-medium text-neutral-500 dark:text-neutral-400">
                Title
              </th>
              <th className="hidden px-4 py-3 text-left font-medium text-neutral-500 dark:text-neutral-400 sm:table-cell">
                Featured
              </th>
              <th className="hidden px-4 py-3 text-left font-medium text-neutral-500 dark:text-neutral-400 md:table-cell">
                Tech Stack
              </th>
              <th className="hidden px-4 py-3 text-left font-medium text-neutral-500 dark:text-neutral-400 lg:table-cell">
                Order
              </th>
              <th className="px-4 py-3 text-right font-medium text-neutral-500 dark:text-neutral-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/projects/${project.id}/edit`}
                    className="font-medium text-neutral-900 hover:text-accent-600 dark:text-white dark:hover:text-accent-400"
                  >
                    {project.title}
                  </Link>
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  {project.featured && (
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  )}
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {project.techStack.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.techStack.length > 3 && (
                      <span className="text-xs text-neutral-400">
                        +{project.techStack.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-neutral-500 dark:text-neutral-400 lg:table-cell">
                  {project.sortOrder}
                </td>
                <td className="px-4 py-3">
                  <ProjectActions projectId={project.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {projects.length === 0 && (
          <div className="px-4 py-12 text-center text-neutral-500 dark:text-neutral-400">
            No projects yet. Create your first project.
          </div>
        )}
      </div>
    </div>
  );
}
