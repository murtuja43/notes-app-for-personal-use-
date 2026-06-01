import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/theme";
import type { Note } from "@/types";

interface NoteListItemProps {
  note: Note;
  onPress: () => void;
  onDelete: () => void;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function NoteListItem({ note, onPress, onDelete }: NoteListItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Text style={styles.title} numberOfLines={1}>
        {note.title}
      </Text>
      {note.content ? (
        <Text style={styles.content} numberOfLines={2}>
          {note.content}
        </Text>
      ) : null}
      <View style={styles.footer}>
        <Text style={styles.date}>{formatDate(note.updatedAt)}</Text>
        <Pressable hitSlop={8} onPress={onDelete}>
          <Text style={styles.delete}>Delete</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    padding: spacing.md,
    gap: 6,
  },
  pressed: {
    opacity: 0.7,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  content: {
    fontSize: 14,
    color: colors.muted,
  },
  footer: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  date: {
    fontSize: 12,
    color: colors.muted,
  },
  delete: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.destructive,
  },
});
