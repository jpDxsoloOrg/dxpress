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
    description,
    content,
    coverImage,
    githubUrl,
    liveUrl,
    techStack,
    featured,
    sortOrder,
  } = body as {
    title?: string;
    description?: string;
    content?: string;
    coverImage?: string;
    githubUrl?: string;
    liveUrl?: string;
    techStack?: string[];
    featured?: boolean;
    sortOrder?: number;
  };

  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  let slug = existing.slug;
  if (title && title !== existing.title) {
    slug = slugify(title);
    const dup = await prisma.project.findFirst({
      where: { slug, id: { not: id } },
    });
    if (dup) {
      return NextResponse.json(
        { error: "A project with this title already exists" },
        { status: 409 }
      );
    }
  }

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...(title !== undefined && { title, slug }),
      ...(description !== undefined && { description }),
      ...(content !== undefined && { content }),
      ...(coverImage !== undefined && { coverImage: coverImage || null }),
      ...(githubUrl !== undefined && { githubUrl: githubUrl || null }),
      ...(liveUrl !== undefined && { liveUrl: liveUrl || null }),
      ...(techStack !== undefined && { techStack }),
      ...(featured !== undefined && { featured }),
      ...(sortOrder !== undefined && { sortOrder }),
    },
  });

  return NextResponse.json(project);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth.authorized) return auth.response;

  const { id } = await context.params;

  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json(project);
}
