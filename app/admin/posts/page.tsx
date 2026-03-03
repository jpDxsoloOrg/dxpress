import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { PostActions } from "./PostActions";

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      tags: { select: { id: true, name: true, slug: true } },
      author: { select: { name: true } },
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Posts
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Manage your blog posts.
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-700"
        >
          <Plus className="h-4 w-4" />
          New Post
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
                Status
              </th>
              <th className="hidden px-4 py-3 text-left font-medium text-neutral-500 dark:text-neutral-400 md:table-cell">
                Tags
              </th>
              <th className="hidden px-4 py-3 text-left font-medium text-neutral-500 dark:text-neutral-400 lg:table-cell">
                Updated
              </th>
              <th className="px-4 py-3 text-right font-medium text-neutral-500 dark:text-neutral-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="font-medium text-neutral-900 hover:text-accent-600 dark:text-white dark:hover:text-accent-400"
                  >
                    {post.title}
                  </Link>
                  <span className="ml-2 inline sm:hidden">
                    <StatusBadge published={post.published} />
                  </span>
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <StatusBadge published={post.published} />
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag.id}
                        className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                      >
                        {tag.name}
                      </span>
                    ))}
                    {post.tags.length > 3 && (
                      <span className="text-xs text-neutral-400">
                        +{post.tags.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-neutral-500 dark:text-neutral-400 lg:table-cell">
                  {formatDate(post.updatedAt)}
                </td>
                <td className="px-4 py-3">
                  <PostActions postId={post.id} published={post.published} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {posts.length === 0 && (
          <div className="px-4 py-12 text-center text-neutral-500 dark:text-neutral-400">
            No posts yet. Create your first post.
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ published }: { published: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        published
          ? "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400"
          : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
      }`}
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}
