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

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError(null);
    if (!email.trim() || !password) {
      setError("Email and password are required");
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
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
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to access your notes.</Text>

          <View style={styles.form}>
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
              placeholder="Your password"
              secureTextEntry
              editable={!loading}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button title="Sign in" onPress={handleLogin} loading={loading} />
          </View>

          <Pressable
            onPress={() => navigation.navigate("Register")}
            disabled={loading}
          >
            <Text style={styles.footer}>
              Don&apos;t have an account?{" "}
              <Text style={styles.link}>Create one</Text>
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
