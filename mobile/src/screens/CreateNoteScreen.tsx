import React from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { NoteForm } from "@/components/NoteForm";
import * as api from "@/services/api";
import type { AppStackParamList } from "@/navigation/types";
import type { NoteInput } from "@/types";

type Props = NativeStackScreenProps<AppStackParamList, "CreateNote">;

export function CreateNoteScreen({ navigation }: Props) {
  async function handleSubmit(input: NoteInput) {
    await api.createNote(input);
    navigation.goBack();
  }

  return (
    <NoteForm
      submitLabel="Save"
      onSubmit={handleSubmit}
      onCancel={() => navigation.goBack()}
    />
  );
}
