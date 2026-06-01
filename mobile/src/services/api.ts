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
  email: string,
  password: string,
  confirmPassword: string
) {
  return request<{ user: AuthUser }>("/api/auth/register", {
    method: "POST",
    body: { email, password, confirmPassword },
    auth: false,
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
