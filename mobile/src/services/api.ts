import { API_URL } from "./config";
import { getToken } from "./storage";
import type { AuthUser, Note, NoteInput } from "@/types";

/** Error thrown by the API client carrying a user-friendly message. */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {}
): Promise<T> {
  const { method = "GET", body, auth = true } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = await getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      "Cannot reach the server. Check your connection and API URL.",
      0
    );
  }

  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const message =
      (data as { error?: string } | null)?.error ?? "Something went wrong";
    throw new ApiError(message, res.status);
  }

  return data as T;
}

// ---- Auth ----------------------------------------------------------------

export function login(email: string, password: string) {
  return request<{ token: string; user: AuthUser }>("/api/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
}

export function register(
  name: string,
  email: string,
  password: string,
  confirmPassword: string
) {
  return request<{ user: AuthUser }>("/api/auth/register", {
    method: "POST",
    body: { name, email, password, confirmPassword },
    auth: false,
  });
}

// ---- Profile -------------------------------------------------------------

export async function getProfile(): Promise<AuthUser> {
  const data = await request<{ user: AuthUser }>("/api/profile");
  return data.user;
}

export async function updateProfile(name: string): Promise<AuthUser> {
  const data = await request<{ user: AuthUser }>("/api/profile", {
    method: "PUT",
    body: { name },
  });
  return data.user;
}

export function changePassword(input: {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}) {
  return request<{ success: boolean }>("/api/profile/change-password", {
    method: "POST",
    body: input,
  });
}

// ---- Notes ---------------------------------------------------------------

export async function getNotes(): Promise<Note[]> {
  const data = await request<{ notes: Note[] }>("/api/notes");
  return data.notes;
}

export async function createNote(input: NoteInput): Promise<Note> {
  const data = await request<{ note: Note }>("/api/notes", {
    method: "POST",
    body: input,
  });
  return data.note;
}

export async function updateNote(id: string, input: NoteInput): Promise<Note> {
  const data = await request<{ note: Note }>(`/api/notes/${id}`, {
    method: "PUT",
    body: input,
  });
  return data.note;
}

export async function deleteNote(id: string): Promise<void> {
  await request(`/api/notes/${id}`, { method: "DELETE" });
}

/** Pin or unpin a note (keeps title/content unchanged). */
export async function setPinned(note: Note, isPinned: boolean): Promise<Note> {
  const data = await request<{ note: Note }>(`/api/notes/${note.id}`, {
    method: "PUT",
    body: { title: note.title, content: note.content, isPinned },
  });
  return data.note;
}

/** Persist a new manual order; returns the full re-sorted list. */
export async function reorderNotes(orderedIds: string[]): Promise<Note[]> {
  const data = await request<{ notes: Note[] }>("/api/notes/reorder", {
    method: "PUT",
    body: { orderedIds },
  });
  return data.notes;
}
