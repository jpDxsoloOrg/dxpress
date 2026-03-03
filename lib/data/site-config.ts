import { prisma } from "@/lib/prisma";
import type { SiteConfig } from "@prisma/client";

export type { SiteConfig };

export async function getSiteConfig(): Promise<SiteConfig | null> {
  return prisma.siteConfig.findFirst();
}
