import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/theme";
import type { Note } from "@/types";

interface NoteListItemProps {
  note: Note;
  onPress: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  /** Begin a drag (from DraggableFlatList's `drag`). */
  onDrag: () => void;
  isActive: boolean;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function NoteListItem({
  note,
  onPress,
  onDelete,
  onTogglePin,
  onDrag,
  isActive,
}: NoteListItemProps) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onDrag}
      delayLongPress={200}
      style={({ pressed }) => [
        styles.card,
        note.isPinned && styles.pinnedCard,
        (pressed || isActive) && styles.pressed,
      ]}
    >
      <View style={styles.titleRow}>
        <Text style={styles.title} numberOfLines={1}>
          {note.isPinned ? "📌 " : ""}
          {note.title}
        </Text>
        <Pressable hitSlop={8} onPress={onTogglePin}>
          <Text style={[styles.pinAction, note.isPinned && styles.pinActive]}>
            {note.isPinned ? "Unpin" : "Pin"}
          </Text>
        </Pressable>
      </View>
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
  pinnedCard: {
    borderColor: colors.primary,
  },
  pressed: {
    opacity: 0.7,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  pinAction: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.muted,
  },
  pinActive: {
    color: colors.primary,
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
