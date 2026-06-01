import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { NoteListItem } from "@/components/NoteListItem";
import { useAuth } from "@/context/AuthContext";
import * as api from "@/services/api";
import type { AppStackParamList } from "@/navigation/types";
import { colors, radius, spacing } from "@/theme";
import type { Note } from "@/types";

type Props = NativeStackScreenProps<AppStackParamList, "NotesList">;

export function NotesListScreen({ navigation }: Props) {
  const { user, signOut } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (mode: "initial" | "refresh" = "initial") => {
    if (mode === "refresh") setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await api.getNotes();
      setNotes(data);
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

  // Header buttons: logout + create.
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => navigation.navigate("CreateNote")}>
          <Text style={styles.headerButton}>+ New</Text>
        </Pressable>
      ),
      headerLeft: () => (
        <Pressable onPress={confirmSignOut}>
          <Text style={styles.headerButtonMuted}>Logout</Text>
        </Pressable>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  function confirmSignOut() {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => signOut() },
    ]);
  }

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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {user?.email ? (
        <Text style={styles.email}>Signed in as {user.email}</Text>
      ) : null}

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load("refresh")}
          />
        }
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        renderItem={({ item }) => (
          <NoteListItem
            note={item}
            onPress={() => navigation.navigate("EditNote", { note: item })}
            onDelete={() => confirmDelete(item)}
          />
        )}
        ListEmptyComponent={
          !error ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No notes yet</Text>
              <Text style={styles.emptyText}>
                Tap “+ New” to create your first note.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  email: {
    fontSize: 13,
    color: colors.muted,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  listContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
  headerButton: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  headerButtonMuted: {
    fontSize: 16,
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
