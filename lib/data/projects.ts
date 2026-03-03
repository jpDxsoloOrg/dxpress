import { prisma } from "@/lib/prisma";
import type { Project } from "@prisma/client";

export type { Project };

export async function getProjects(): Promise<Project[]> {
  return prisma.project.findMany({
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function getFeaturedProjects(limit = 4): Promise<Project[]> {
  return prisma.project.findMany({
    where: { featured: true },
    orderBy: { sortOrder: "asc" },
    take: limit,
  });
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return prisma.project.findUnique({
    where: { slug },
  });
}
