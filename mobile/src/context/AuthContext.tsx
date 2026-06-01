import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import * as api from "@/services/api";
import { deleteToken, getToken, saveToken } from "@/services/storage";
import type { AuthUser } from "@/types";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  // On launch, restore any saved token so the user stays logged in, and
  // fetch the profile to populate the user's name/email.
  useEffect(() => {
    (async () => {
      try {
        const saved = await getToken();
        if (saved) {
          setToken(saved);
          try {
            const profile = await api.getProfile();
            setUser(profile);
          } catch {
            // Token is invalid/expired — clear it and stay logged out.
            await deleteToken();
            setToken(null);
          }
        }
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { token: newToken, user: newUser } = await api.login(email, password);
    await saveToken(newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const signUp = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      confirmPassword: string
    ) => {
      await api.register(name, email, password, confirmPassword);
      // Registration succeeded — log straight in.
      const { token: newToken, user: newUser } = await api.login(
        email,
        password
      );
      await saveToken(newToken);
      setToken(newToken);
      setUser(newUser);
    },
    []
  );

  const signOut = useCallback(async () => {
    await deleteToken();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, initializing, signIn, signUp, signOut, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
