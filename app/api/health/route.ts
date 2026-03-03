import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, string> = {};

  // Check env vars (masked)
  checks.DATABASE_URL = process.env.DATABASE_URL
    ? `set (${process.env.DATABASE_URL.substring(0, 30)}...)`
    : "MISSING";
  checks.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ? "set" : "MISSING";
  checks.NEXTAUTH_URL = process.env.NEXTAUTH_URL ?? "MISSING";

  // Check database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "connected";
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    checks.database = `error: ${message}`;
  }

  // Check user count
  try {
    const count = await prisma.user.count();
    checks.users = String(count);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    checks.users = `error: ${message}`;
  }

  // Check S3 config
  checks.S3_BUCKET = process.env.S3_BUCKET ?? "MISSING";
  checks.S3_REGION = process.env.S3_REGION ?? "MISSING";
  checks.S3_ACCESS_KEY = process.env.S3_ACCESS_KEY ? "set" : "MISSING";
  checks.S3_SECRET_KEY = process.env.S3_SECRET_KEY ? "set" : "MISSING";
  checks.S3_ENDPOINT = process.env.S3_ENDPOINT ?? "not set (using AWS default)";

  return NextResponse.json(checks);
}
