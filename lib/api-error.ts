import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

/**
 * Converts an unexpected error thrown inside an API route into a JSON response.
 *
 * The full error is logged with `console.error` so it shows up in the server
 * logs (e.g. the Vercel function logs), which is the fastest way to diagnose a
 * production-only failure such as a bad DATABASE_URL or a missing Prisma query
 * engine. A short, safe message is returned to the client.
 */
export function handleApiError(context: string, error: unknown): NextResponse {
  console.error(`[api:${context}]`, error);

  // Surface common, actionable database/configuration problems explicitly so a
  // 500 is never silent.
  if (
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientUnknownRequestError
  ) {
    return NextResponse.json(
      {
        error:
          "Database connection failed. Check the server configuration (DATABASE_URL).",
      },
      { status: 500 }
    );
  }

  if (error instanceof Error && /NEXTAUTH_SECRET/.test(error.message)) {
    return NextResponse.json(
      { error: "Server auth is misconfigured (NEXTAUTH_SECRET)." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { error: "Something went wrong on the server." },
    { status: 500 }
  );
}
