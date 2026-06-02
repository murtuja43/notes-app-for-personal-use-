import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button } from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import * as api from "@/services/api";
import type { AppStackParamList } from "@/navigation/types";
import { colors, radius, spacing } from "@/theme";

type Props = NativeStackScreenProps<AppStackParamList, "Profile">;

export function ProfileScreen(_props: Props) {
  const { user, setUser, signOut } = useAuth();

  // ---- Edit name ----
  const [name, setName] = useState(user?.name ?? "");
  const [savingName, setSavingName] = useState(false);

  async function handleSaveName() {
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 50) {
      Alert.alert("Invalid name", "Name must be between 2 and 50 characters.");
      return;
    }
    setSavingName(true);
    try {
      const updated = await api.updateProfile(trimmed);
      setUser(updated);
      setName(updated.name);
      Alert.alert("Success", "Your name has been updated.");
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to update");
    } finally {
      setSavingName(false);
    }
  }

  // ---- Change password ----
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  async function handleChangePassword() {
    if (!currentPassword) {
      Alert.alert("Error", "Current password is required");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    setSavingPw(true);
    try {
      await api.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      Alert.alert("Success", "Your password has been changed.");
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to change");
    } finally {
      setSavingPw(false);
    }
  }

  function confirmSignOut() {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => signOut() },
    ]);
  }

  return (
    <SafeAreaView style={styles.flex} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          {/* Account */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Account</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={colors.muted}
                autoCapitalize="words"
                editable={!savingName}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.input, styles.readonly]}>
                <Text style={styles.readonlyText}>{user?.email ?? ""}</Text>
              </View>
              <Text style={styles.hint}>Email cannot be changed.</Text>
            </View>

            <Button
              title="Save name"
              onPress={handleSaveName}
              loading={savingName}
              disabled={name.trim() === (user?.name ?? "").trim()}
            />
          </View>

          {/* Change password */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Change password</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Current password</Text>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Current password"
                placeholderTextColor={colors.muted}
                secureTextEntry
                editable={!savingPw}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>New password</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="At least 6 characters"
                placeholderTextColor={colors.muted}
                secureTextEntry
                editable={!savingPw}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Confirm new password</Text>
              <TextInput
                style={styles.input}
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                placeholder="Re-enter new password"
                placeholderTextColor={colors.muted}
                secureTextEntry
                editable={!savingPw}
              />
            </View>

            <Button
              title="Change password"
              onPress={handleChangePassword}
              loading={savingPw}
            />
          </View>

          <Button
            title="Logout"
            variant="destructive"
            onPress={confirmSignOut}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: {
    padding: spacing.md,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    padding: spacing.md,
    gap: spacing.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  field: { gap: 6 },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    paddingHorizontal: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.inputBg,
    justifyContent: "center",
  },
  readonly: {
    backgroundColor: colors.background,
  },
  readonlyText: {
    fontSize: 16,
    color: colors.muted,
  },
  hint: {
    fontSize: 12,
    color: colors.muted,
  },
});
