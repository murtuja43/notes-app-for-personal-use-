"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut, Plus, NotebookPen, Loader2, FileText, User } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Button, buttonVariants } from "@/components/ui/button";
import { SortableNoteCard } from "@/components/sortable-note-card";
import { NoteEditorDialog } from "@/components/note-editor-dialog";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { useNotes } from "@/hooks/use-notes";
import type { Note } from "@/types";

export function Dashboard({ userName }: { userName: string }) {
  const {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    reorder,
  } = useNotes();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

  // Require a small drag distance so clicking the buttons isn't treated as a drag.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = notes.findIndex((n) => n.id === active.id);
    const newIndex = notes.findIndex((n) => n.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const orderedIds = arrayMove(notes, oldIndex, newIndex).map((n) => n.id);
    reorder(orderedIds).catch(() => {
      /* hook rolls back on failure */
    });
  }

  function openCreate() {
    setEditingNote(null);
    setEditorOpen(true);
  }

  function openEdit(note: Note) {
    setEditingNote(note);
    setEditorOpen(true);
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <NotebookPen className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">NoteAll</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium sm:inline">
              {userName}
            </span>
            <Link
              href="/profile"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Your notes</h1>
            <p className="text-sm text-muted-foreground">
              {notes.length} {notes.length === 1 ? "note" : "notes"}
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create note</span>
          </Button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading notes...
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && notes.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20 text-center">
            <FileText className="mb-3 h-10 w-10 text-muted-foreground" />
            <h2 className="text-lg font-medium">No notes yet</h2>
            <p className="mb-4 mt-1 text-sm text-muted-foreground">
              Create your first note to get started.
            </p>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Create note
            </Button>
          </div>
        )}

        {/* Notes grid (drag the grip handle to reorder) */}
        {!loading && !error && notes.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={notes.map((n) => n.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {notes.map((note) => (
                  <SortableNoteCard
                    key={note.id}
                    note={note}
                    onEdit={openEdit}
                    onDelete={setNoteToDelete}
                    onTogglePin={togglePin}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </main>

      <NoteEditorDialog
        open={editorOpen}
        note={editingNote}
        onClose={() => setEditorOpen(false)}
        onSubmit={(input) =>
          editingNote
            ? updateNote(editingNote.id, input)
            : createNote(input)
        }
      />

      <ConfirmDeleteDialog
        note={noteToDelete}
        onClose={() => setNoteToDelete(null)}
        onConfirm={deleteNote}
      />
    </div>
  );
}
