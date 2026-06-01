import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { verifyApiToken } from "@/lib/token";

/**
 * Returns the currently authenticated user's id, or null if not signed in.
 *
 * Supports two auth methods so the same API serves both clients:
 *   1. Web  — NextAuth cookie session (JWT strategy).
 *   2. Mobile — `Authorization: Bearer <token>` issued by /api/auth/login.
 */
export async function getCurrentUserId(
  request?: Request
): Promise<string | null> {
  // 1. Bearer token (mobile / API clients).
  const authHeader = request?.headers.get("authorization");
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.slice(7).trim();
    const userId = verifyApiToken(token);
    if (userId) {
      return userId;
    }
  }

  // 2. NextAuth cookie session (web).
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}
