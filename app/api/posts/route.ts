import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { slugify } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const {
    title,
    content,
    excerpt,
    coverImage,
    published,
    tagIds,
  } = body as {
    title: string;
    content: string;
    excerpt?: string;
    coverImage?: string;
    published?: boolean;
    tagIds?: string[];
  };

  if (!title || !content) {
    return NextResponse.json(
      { error: "Title and content are required" },
      { status: 400 }
    );
  }

  const slug = slugify(title);

  // Check for duplicate slug
  const existing = await prisma.post.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(
      { error: "A post with this title already exists" },
      { status: 409 }
    );
  }

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      content,
      excerpt: excerpt || null,
      coverImage: coverImage || null,
      published: published ?? false,
      publishedAt: published ? new Date() : null,
      authorId: auth.userId,
      tags: tagIds?.length
        ? { connect: tagIds.map((id) => ({ id })) }
        : undefined,
    },
    include: {
      author: { select: { name: true } },
      tags: { select: { id: true, name: true, slug: true } },
    },
  });

  return NextResponse.json(post, { status: 201 });
}
