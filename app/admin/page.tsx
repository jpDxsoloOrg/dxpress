import Link from "next/link";
import {
  FileText,
  FolderKanban,
  Eye,
  EyeOff,
  Plus,
  Clock,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getStats() {
  const [totalPosts, publishedPosts, draftPosts, totalProjects, recentPosts] =
    await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { published: true } }),
      prisma.post.count({ where: { published: false } }),
      prisma.project.count(),
      prisma.post.findMany({
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          published: true,
          updatedAt: true,
        },
      }),
    ]);

  return { totalPosts, publishedPosts, draftPosts, totalProjects, recentPosts };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const statCards = [
    {
      label: "Total Posts",
      value: stats.totalPosts,
      icon: FileText,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/50",
    },
    {
      label: "Published",
      value: stats.publishedPosts,
      icon: Eye,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-950/50",
    },
    {
      label: "Drafts",
      value: stats.draftPosts,
      icon: EyeOff,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/50",
    },
    {
      label: "Projects",
      value: stats.totalProjects,
      icon: FolderKanban,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/50",
    },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Overview of your portfolio content.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-700"
          >
            <Plus className="h-4 w-4" />
            New Post
          </Link>
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-neutral-200 p-5 dark:border-neutral-800"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {card.label}
                </p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
          <h2 className="font-semibold text-neutral-900 dark:text-white">
            Recent Posts
          </h2>
          <Link
            href="/admin/posts"
            className="text-sm text-accent-600 hover:text-accent-700 dark:text-accent-400"
          >
            View all
          </Link>
        </div>
        {stats.recentPosts.length > 0 ? (
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {stats.recentPosts.map((post) => (
              <li key={post.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      post.published
                        ? "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                    }`}
                  >
                    {post.published ? "Published" : "Draft"}
                  </span>
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="font-medium text-neutral-900 hover:text-accent-600 dark:text-white dark:hover:text-accent-400"
                  >
                    {post.title}
                  </Link>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDate(post.updatedAt)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
            No posts yet. Create your first post to get started.
          </p>
        )}
      </div>
    </div>
  );
}
