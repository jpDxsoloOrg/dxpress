import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  });
  return NextResponse.json(tags);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const { name } = body as { name: string };

  if (!name) {
    return NextResponse.json(
      { error: "Tag name is required" },
      { status: 400 }
    );
  }

  const slug = slugify(name);
  const existing = await prisma.tag.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(existing);
  }

  const tag = await prisma.tag.create({
    data: { name, slug },
  });

  return NextResponse.json(tag, { status: 201 });
}
