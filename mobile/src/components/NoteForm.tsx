import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Button } from "@/components/Button";
import { colors, radius, spacing } from "@/theme";
import type { NoteInput } from "@/types";

interface NoteFormProps {
  initialTitle?: string;
  initialContent?: string;
  submitLabel: string;
  onSubmit: (input: NoteInput) => Promise<void>;
  onCancel: () => void;
}

export function NoteForm({
  initialTitle = "",
  initialContent = "",
  submitLabel,
  onSubmit,
  onCancel,
}: NoteFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setSaving(true);
    try {
      await onSubmit({ title: title.trim(), content });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save note");
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.field}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Note title"
            placeholderTextColor={colors.muted}
            editable={!saving}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Content</Text>
          <TextInput
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            placeholder="Write something..."
            placeholderTextColor={colors.muted}
            multiline
            textAlignVertical="top"
            editable={!saving}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.actions}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={onCancel}
            disabled={saving}
            style={styles.actionButton}
          />
          <Button
            title={submitLabel}
            onPress={handleSubmit}
            loading={saving}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: {
    padding: spacing.md,
    gap: spacing.md,
  },
  field: { gap: 6 },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  titleInput: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    paddingHorizontal: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.inputBg,
  },
  contentInput: {
    minHeight: 200,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.inputBg,
  },
  error: {
    color: colors.destructive,
    fontSize: 14,
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
