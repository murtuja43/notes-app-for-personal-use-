import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DraggableFlatList, {
  ScaleDecorator,
  type RenderItemParams,
} from "react-native-draggable-flatlist";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { NoteListItem } from "@/components/NoteListItem";
import { useAuth } from "@/context/AuthContext";
import * as api from "@/services/api";
import type { AppStackParamList } from "@/navigation/types";
import { colors, radius, spacing } from "@/theme";
import type { Note } from "@/types";

type Props = NativeStackScreenProps<AppStackParamList, "NotesList">;

/** Pinned first, then by the user's custom sortOrder. */
function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort(
    (a, b) =>
      Number(b.isPinned) - Number(a.isPinned) || a.sortOrder - b.sortOrder
  );
}

export function NotesListScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // Case-insensitive search over title + content. `notes` stays in its sorted
  // order (pinned first, then manual order), so filtering preserves that order.
  const trimmedQuery = query.trim().toLowerCase();
  const isSearching = trimmedQuery.length > 0;
  const visibleNotes = useMemo(() => {
    if (!isSearching) return notes;
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(trimmedQuery) ||
        n.content.toLowerCase().includes(trimmedQuery)
    );
  }, [notes, isSearching, trimmedQuery]);

  const load = useCallback(async (mode: "initial" | "refresh" = "initial") => {
    if (mode === "refresh") setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await api.getNotes();
      setNotes(sortNotes(data));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load notes");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Reload whenever the screen regains focus (e.g. after creating/editing).
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const header = (
    <View style={styles.header}>
      <Text style={styles.headerTitle} numberOfLines={1}>
        NoteAll
      </Text>
      <View style={styles.headerActions}>
        <Pressable
          onPress={() => navigation.navigate("CreateNote")}
          accessibilityRole="button"
          accessibilityLabel="Create note"
          hitSlop={8}
          style={({ pressed }) => [
            styles.headerAction,
            pressed ? styles.headerActionPressed : null,
          ]}
        >
          <Text style={styles.headerButton}>+ New</Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate("Profile")}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          hitSlop={8}
          style={({ pressed }) => [
            styles.headerAction,
            pressed ? styles.headerActionPressed : null,
          ]}
        >
          <Text style={styles.headerButtonMuted}>Profile</Text>
        </Pressable>
      </View>
    </View>
  );

  function confirmDelete(note: Note) {
    Alert.alert("Delete note?", `"${note.title}" will be permanently deleted.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.deleteNote(note.id);
            setNotes((prev) => prev.filter((n) => n.id !== note.id));
          } catch (e) {
            Alert.alert(
              "Error",
              e instanceof Error ? e.message : "Failed to delete note"
            );
          }
        },
      },
    ]);
  }

  async function handleTogglePin(note: Note) {
    // Optimistic update, then persist.
    const updated = { ...note, isPinned: !note.isPinned };
    setNotes((prev) =>
      sortNotes(prev.map((n) => (n.id === note.id ? updated : n)))
    );
    try {
      const saved = await api.setPinned(note, !note.isPinned);
      setNotes((prev) =>
        sortNotes(prev.map((n) => (n.id === saved.id ? saved : n)))
      );
    } catch (e) {
      setNotes((prev) =>
        sortNotes(prev.map((n) => (n.id === note.id ? note : n)))
      );
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to pin");
    }
  }

  async function handleDragEnd({ data }: { data: Note[] }) {
    // Reordering is disabled while searching, so a filtered subset is never
    // persisted as the full order.
    if (isSearching) return;
    const previous = notes;
    setNotes(data); // keep the dragged order immediately (smooth)
    try {
      const saved = await api.reorderNotes(data.map((n) => n.id));
      setNotes(sortNotes(saved));
    } catch (e) {
      setNotes(previous); // roll back
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to reorder");
    }
  }

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<Note>) => (
      <ScaleDecorator>
        <View style={styles.itemWrapper}>
          <NoteListItem
            note={item}
            onPress={() => navigation.navigate("EditNote", { note: item })}
            onDelete={() => confirmDelete(item)}
            onTogglePin={() => handleTogglePin(item)}
            // Disable drag-to-reorder while searching.
            onDrag={isSearching ? undefined : drag}
            isActive={isActive}
          />
        </View>
      </ScaleDecorator>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigation, notes, isSearching]
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        {header}
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      {header}
      <View style={styles.container}>
        {user?.name ? (
          <Text style={styles.email}>Signed in as {user.name}</Text>
        ) : null}

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {notes.length > 0 ? (
          <View style={styles.searchRow}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search notes by title or content..."
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              clearButtonMode="while-editing"
              accessibilityLabel="Search notes"
            />
            {isSearching ? (
              <Pressable
                hitSlop={8}
                onPress={() => setQuery("")}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
              >
                <Text style={styles.searchClear}>✕</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        <DraggableFlatList
          data={visibleNotes}
          onDragEnd={handleDragEnd}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load("refresh")}
            />
          }
          renderItem={renderItem}
          ListHeaderComponent={
            notes.length > 0 && !isSearching ? (
              <Text style={styles.hint}>
                Long-press a note to drag and reorder.
              </Text>
            ) : null
          }
          ListEmptyComponent={
            error ? null : isSearching ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No matching notes</Text>
                <Text style={styles.emptyText}>
                  No notes match “{query.trim()}”.
                </Text>
              </View>
            ) : (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No notes yet</Text>
                <Text style={styles.emptyText}>
                  Tap “+ New” to create your first note.
                </Text>
              </View>
            )
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  header: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginLeft: spacing.md,
  },
  headerAction: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  headerActionPressed: {
    opacity: 0.65,
  },
  email: {
    fontSize: 13,
    color: colors.muted,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    backgroundColor: colors.inputBg,
  },
  searchIcon: {
    fontSize: 15,
    color: colors.muted,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 0,
  },
  searchClear: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.muted,
    paddingHorizontal: 4,
  },
  hint: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  listContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
  itemWrapper: {
    marginBottom: spacing.sm,
  },
  headerButton: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  headerButtonMuted: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.muted,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  emptyText: {
    fontSize: 14,
    color: colors.muted,
  },
  errorBox: {
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: radius,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorText: {
    color: colors.destructive,
    fontSize: 14,
  },
});
