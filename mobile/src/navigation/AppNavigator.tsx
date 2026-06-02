import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NotesListScreen } from "@/screens/NotesListScreen";
import { CreateNoteScreen } from "@/screens/CreateNoteScreen";
import { EditNoteScreen } from "@/screens/EditNoteScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";
import type { AppStackParamList } from "./types";
import { colors } from "@/theme";

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Stack.Screen
        name="NotesList"
        component={NotesListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateNote"
        component={CreateNoteScreen}
        options={{ title: "New Note" }}
      />
      <Stack.Screen
        name="EditNote"
        component={EditNoteScreen}
        options={{ title: "Edit Note" }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
    </Stack.Navigator>
  );
}
