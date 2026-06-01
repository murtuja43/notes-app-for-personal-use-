import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { noteSchema } from "@/lib/validations";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// PUT /api/notes/[id] — update a note the current user owns.
export async function PUT(request: Request, { params }: RouteContext) {
  const userId = await getCurrentUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

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

  // Ensure the note exists AND belongs to this user before updating.
  const existing = await prisma.note.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  const note = await prisma.note.update({
    where: { id },
    data: {
      title: parsed.data.title,
      content: parsed.data.content ?? "",
    },
  });

  return NextResponse.json({ note });
}

// DELETE /api/notes/[id] — delete a note the current user owns.
export async function DELETE(request: Request, { params }: RouteContext) {
  const userId = await getCurrentUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.note.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  await prisma.note.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
