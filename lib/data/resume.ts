import { prisma } from "@/lib/prisma";
import type { Resume } from "@prisma/client";

export type { Resume };

export async function getResume(): Promise<Resume | null> {
  return prisma.resume.findFirst();
}
