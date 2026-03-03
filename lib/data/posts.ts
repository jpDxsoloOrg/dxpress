import { prisma } from "@/lib/prisma";

export type PostWithTags = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  published: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author: { name: string };
  tags: { id: string; name: string; slug: string }[];
};

export async function getPublishedPosts({
  page = 1,
  perPage = 10,
  tagSlug,
}: {
  page?: number;
  perPage?: number;
  tagSlug?: string;
} = {}): Promise<{ posts: PostWithTags[]; total: number }> {
  const where = {
    published: true,
    ...(tagSlug && {
      tags: { some: { slug: tagSlug } },
    }),
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        author: { select: { name: true } },
        tags: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.post.count({ where }),
  ]);

  return { posts, total };
}

export async function getPostBySlug(slug: string): Promise<PostWithTags | null> {
  return prisma.post.findUnique({
    where: { slug },
    include: {
      author: { select: { name: true } },
      tags: { select: { id: true, name: true, slug: true } },
    },
  });
}

export async function getRecentPosts(count = 3): Promise<PostWithTags[]> {
  return prisma.post.findMany({
    where: { published: true },
    include: {
      author: { select: { name: true } },
      tags: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: count,
  });
}

export async function getAdjacentPosts(
  publishedAt: Date
): Promise<{ prev: PostWithTags | null; next: PostWithTags | null }> {
  const [prev, next] = await Promise.all([
    prisma.post.findFirst({
      where: { published: true, publishedAt: { lt: publishedAt } },
      include: {
        author: { select: { name: true } },
        tags: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.post.findFirst({
      where: { published: true, publishedAt: { gt: publishedAt } },
      include: {
        author: { select: { name: true } },
        tags: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { publishedAt: "asc" },
    }),
  ]);

  return { prev, next };
}

export async function getPostsByTag(
  tagSlug: string,
  limit?: number
): Promise<PostWithTags[]> {
  return prisma.post.findMany({
    where: {
      published: true,
      tags: { some: { slug: tagSlug } },
    },
    include: {
      author: { select: { name: true } },
      tags: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { publishedAt: "desc" },
    ...(limit && { take: limit }),
  });
}
