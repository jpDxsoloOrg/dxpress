import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(_request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth.authorized) return auth.response;

  const { id } = await context.params;

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const newPublished = !post.published;

  const updated = await prisma.post.update({
    where: { id },
    data: {
      published: newPublished,
      publishedAt: newPublished
        ? post.publishedAt ?? new Date()
        : post.publishedAt,
    },
  });

  return NextResponse.json(updated);
}
