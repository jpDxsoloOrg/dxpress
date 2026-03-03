import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { slugify } from "@/lib/utils";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth.authorized) return auth.response;

  const { id } = await context.params;
  const body = await request.json();
  const {
    title,
    content,
    excerpt,
    coverImage,
    published,
    tagIds,
  } = body as {
    title?: string;
    content?: string;
    excerpt?: string;
    coverImage?: string;
    published?: boolean;
    tagIds?: string[];
  };

  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // If title changed, update slug
  let slug = existing.slug;
  if (title && title !== existing.title) {
    slug = slugify(title);
    const duplicate = await prisma.post.findFirst({
      where: { slug, id: { not: id } },
    });
    if (duplicate) {
      return NextResponse.json(
        { error: "A post with this title already exists" },
        { status: 409 }
      );
    }
  }

  // Determine publishedAt
  let publishedAt = existing.publishedAt;
  if (published === true && !existing.published) {
    publishedAt = new Date();
  } else if (published === false) {
    publishedAt = null;
  }

  const post = await prisma.post.update({
    where: { id },
    data: {
      ...(title !== undefined && { title, slug }),
      ...(content !== undefined && { content }),
      ...(excerpt !== undefined && { excerpt: excerpt || null }),
      ...(coverImage !== undefined && { coverImage: coverImage || null }),
      ...(published !== undefined && { published, publishedAt }),
      ...(tagIds !== undefined && {
        tags: { set: tagIds.map((tagId) => ({ id: tagId })) },
      }),
    },
    include: {
      author: { select: { name: true } },
      tags: { select: { id: true, name: true, slug: true } },
    },
  });

  return NextResponse.json(post);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth.authorized) return auth.response;

  const { id } = await context.params;

  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { name: true } },
      tags: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}
