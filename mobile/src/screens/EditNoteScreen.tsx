import React from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { NoteForm } from "@/components/NoteForm";
import * as api from "@/services/api";
import type { AppStackParamList } from "@/navigation/types";
import type { NoteInput } from "@/types";

type Props = NativeStackScreenProps<AppStackParamList, "EditNote">;

export function EditNoteScreen({ navigation, route }: Props) {
  const { note } = route.params;

  async function handleSubmit(input: NoteInput) {
    await api.updateNote(note.id, input);
    navigation.goBack();
  }

  return (
    <NoteForm
      initialTitle={note.title}
      initialContent={note.content}
      submitLabel="Save changes"
      onSubmit={handleSubmit}
      onCancel={() => navigation.goBack()}
    />
  );
}
