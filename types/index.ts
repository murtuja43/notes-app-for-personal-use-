export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

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
