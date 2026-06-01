"use client";

import { useCallback, useEffect, useState } from "react";
import type { Note } from "@/types";
import type { NoteInput } from "@/lib/validations";

interface UseNotesResult {
  notes: Note[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createNote: (input: NoteInput) => Promise<void>;
  updateNote: (id: string, input: NoteInput) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data.error ?? "Something went wrong";
  } catch {
    return "Something went wrong";
  }
}

/**
 * Client-side hook that owns the notes list and talks to /api/notes.
 * Uses the NextAuth cookie session, so no token handling is needed on web.
 */
export function useNotes(): UseNotesResult {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/notes");
      if (!res.ok) throw new Error(await parseError(res));
      const data = await res.json();
      setNotes(data.notes);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createNote = useCallback(async (input: NoteInput) => {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(await parseError(res));
    const data = await res.json();
    setNotes((prev) => [data.note, ...prev]);
  }, []);

  const updateNote = useCallback(async (id: string, input: NoteInput) => {
    const res = await fetch(`/api/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(await parseError(res));
    const data = await res.json();
    setNotes((prev) =>
      prev
        .map((n) => (n.id === id ? data.note : n))
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
    );
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(await parseError(res));
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notes, loading, error, refresh, createNote, updateNote, deleteNote };
}
