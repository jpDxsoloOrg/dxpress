import { prisma } from "@/lib/prisma";
import type { Tag } from "@prisma/client";

export type { Tag };

export async function getAllTags(): Promise<Tag[]> {
  return prisma.tag.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  return prisma.tag.findUnique({
    where: { slug },
  });
}

export async function getTagsWithPostCount(): Promise<
  (Tag & { _count: { posts: number } })[]
> {
  return prisma.tag.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });
}
