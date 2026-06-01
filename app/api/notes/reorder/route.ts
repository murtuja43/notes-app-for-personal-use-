import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { reorderSchema } from "@/lib/validations";

// PUT /api/notes/reorder — persist a new manual order for the user's notes.
// Body: { orderedIds: string[] }. sortOrder is assigned by array index.
export async function PUT(request: Request) {
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

  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { orderedIds } = parsed.data;

  // Reject duplicate ids.
  if (new Set(orderedIds).size !== orderedIds.length) {
    return NextResponse.json(
      { error: "orderedIds contains duplicates" },
      { status: 400 }
    );
  }

  // Verify every id belongs to the current user (ownership enforcement).
  const owned = await prisma.note.findMany({
    where: { id: { in: orderedIds }, userId },
    select: { id: true },
  });
  if (owned.length !== orderedIds.length) {
    return NextResponse.json(
      { error: "One or more notes were not found" },
      { status: 404 }
    );
  }

  // Assign sortOrder = position in the array, all in a single transaction.
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.note.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );

  const notes = await prisma.note.findMany({
    where: { userId },
    orderBy: [{ isPinned: "desc" }, { sortOrder: "asc" }],
  });

  return NextResponse.json({ notes });
}
