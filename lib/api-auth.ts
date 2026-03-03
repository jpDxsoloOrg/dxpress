import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function requireAuth(): Promise<
  | { authorized: true; userId: string }
  | { authorized: false; response: NextResponse }
> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }
  return {
    authorized: true,
    userId: (session.user as { id: string }).id,
  };
}
