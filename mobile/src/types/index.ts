export interface Note {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  sortOrder: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface NoteInput {
  title: string;
  content: string;
}
