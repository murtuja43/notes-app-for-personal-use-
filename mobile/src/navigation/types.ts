import type { Note } from "@/types";

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppStackParamList = {
  NotesList: undefined;
  CreateNote: undefined;
  EditNote: { note: Note };
  Profile: undefined;
};
