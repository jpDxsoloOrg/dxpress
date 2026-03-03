export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/layout";
import { PostCard } from "@/components/blog/PostCard";
import { TagFilter } from "@/components/blog/TagFilter";
import { Pagination } from "@/components/ui/Pagination";
import { getPublishedPosts } from "@/lib/data/posts";
import { getAllTags } from "@/lib/data/tags";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Thoughts on software engineering, web development, and technology.",
};

const POSTS_PER_PAGE = 10;

interface BlogPageProps {
  searchParams: Promise<{ tag?: string; page?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const tagSlug = params.tag;

  const [{ posts, total }, tags] = await Promise.all([
    getPublishedPosts({ page: currentPage, perPage: POSTS_PER_PAGE, tagSlug }),
    getAllTags(),
  ]);

  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  const filterParams: Record<string, string> = {};
  if (tagSlug) filterParams.tag = tagSlug;

  return (
    <Container className="py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
          Blog
        </h1>
        <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
          Thoughts on software engineering, web development, and lessons learned
          building products.
        </p>
      </div>

      {tags.length > 0 && (
        <div className="mb-10">
          <Suspense fallback={null}>
            <TagFilter tags={tags} activeTag={tagSlug} />
          </Suspense>
        </div>
      )}

      {posts.length > 0 ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          <div className="mt-12">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath="/blog"
              searchParams={filterParams}
            />
          </div>
        </>
      ) : (
        <div className="py-12 text-center">
          <p className="text-neutral-500 dark:text-neutral-400">
            {tagSlug
              ? "No posts found with this tag. Try a different filter."
              : "No posts yet. Check back soon."}
          </p>
        </div>
      )}
    </Container>
  );
}
