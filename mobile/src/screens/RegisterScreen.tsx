import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { TextField } from "@/components/TextField";
import { Button } from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import type { AuthStackParamList } from "@/navigation/types";
import { colors, spacing } from "@/theme";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export function RegisterScreen({ navigation }: Props) {
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setError(null);

    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      setError("Name must be between 2 and 50 characters");
      return;
    }
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await signUp(trimmedName, email.trim(), password, confirmPassword);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.flex} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Create an account</Text>
          <Text style={styles.subtitle}>
            Enter your email and a password to get started.
          </Text>

          <View style={styles.form}>
            <TextField
              label="Name"
              value={name}
              onChangeText={setName}
              placeholder="John Doe"
              autoCapitalize="words"
              autoCorrect={false}
              editable={!loading}
            />
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            <TextField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="At least 6 characters"
              secureTextEntry
              editable={!loading}
            />
            <TextField
              label="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter your password"
              secureTextEntry
              editable={!loading}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button
              title="Create account"
              onPress={handleRegister}
              loading={loading}
            />
          </View>

          <Pressable
            onPress={() => navigation.navigate("Login")}
            disabled={loading}
          >
            <Text style={styles.footer}>
              Already have an account? <Text style={styles.link}>Sign in</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: colors.muted,
    marginTop: -spacing.sm,
  },
  form: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  error: {
    color: colors.destructive,
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    textAlign: "center",
    color: colors.muted,
    fontSize: 14,
    marginTop: spacing.sm,
  },
  link: {
    color: colors.primary,
    fontWeight: "600",
  },
});
