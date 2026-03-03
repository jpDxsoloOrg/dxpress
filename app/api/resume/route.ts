import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function PUT(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const { content } = body as { content: string };

  if (!content) {
    return NextResponse.json(
      { error: "Content is required" },
      { status: 400 }
    );
  }

  // Upsert: update existing or create new
  const existing = await prisma.resume.findFirst();

  let resume;
  if (existing) {
    resume = await prisma.resume.update({
      where: { id: existing.id },
      data: { content },
    });
  } else {
    resume = await prisma.resume.create({
      data: { content },
    });
  }

  return NextResponse.json(resume);
}

export async function GET() {
  const resume = await prisma.resume.findFirst();
  return NextResponse.json(resume);
}
