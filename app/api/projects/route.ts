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
    description,
    content,
    coverImage,
    githubUrl,
    liveUrl,
    techStack,
    featured,
    sortOrder,
  } = body as {
    title: string;
    description: string;
    content: string;
    coverImage?: string;
    githubUrl?: string;
    liveUrl?: string;
    techStack?: string[];
    featured?: boolean;
    sortOrder?: number;
  };

  if (!title || !description || !content) {
    return NextResponse.json(
      { error: "Title, description, and content are required" },
      { status: 400 }
    );
  }

  const slug = slugify(title);
  const existing = await prisma.project.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(
      { error: "A project with this title already exists" },
      { status: 409 }
    );
  }

  const project = await prisma.project.create({
    data: {
      title,
      slug,
      description,
      content,
      coverImage: coverImage || null,
      githubUrl: githubUrl || null,
      liveUrl: liveUrl || null,
      techStack: techStack ?? [],
      featured: featured ?? false,
      sortOrder: sortOrder ?? 0,
    },
  });

  return NextResponse.json(project, { status: 201 });
}
