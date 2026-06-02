import React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { AuthNavigator } from "./AuthNavigator";
import { AppNavigator } from "./AppNavigator";
import { colors } from "@/theme";

export function RootNavigator() {
  const { token, initializing } = useAuth();

  if (initializing) {
    return (
      <SafeAreaView style={styles.center} edges={["top", "bottom"]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      {token ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
