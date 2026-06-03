import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { noteSchema } from "@/lib/validations";
import { handleApiError } from "@/lib/api-error";

// GET /api/notes — list the current user's notes (most recently updated first).
export async function GET(request: Request) {
  try {
    const userId = await getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notes = await prisma.note.findMany({
      where: { userId },
      // Pinned notes first, then by the user's custom manual order.
      orderBy: [{ isPinned: "desc" }, { sortOrder: "asc" }],
    });

    return NextResponse.json({ notes });
  } catch (error) {
    return handleApiError("notes:list", error);
  }
}

// POST /api/notes — create a note owned by the current user.
export async function POST(request: Request) {
  const userId = await getCurrentUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = noteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  try {
    // New notes go to the top: give them a sortOrder lower than any existing note.
    const min = await prisma.note.aggregate({
      where: { userId },
      _min: { sortOrder: true },
    });
    const nextSortOrder = (min._min.sortOrder ?? 0) - 1;

    const note = await prisma.note.create({
      data: {
        title: parsed.data.title,
        content: parsed.data.content ?? "",
        sortOrder: nextSortOrder,
        userId,
      },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    return handleApiError("notes:create", error);
  }
}
