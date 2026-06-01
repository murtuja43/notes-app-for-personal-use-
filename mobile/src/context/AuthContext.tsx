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
    email: string,
    password: string,
    confirmPassword: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  // On launch, restore any saved token so the user stays logged in.
  useEffect(() => {
    (async () => {
      try {
        const saved = await getToken();
        if (saved) {
          setToken(saved);
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
    async (email: string, password: string, confirmPassword: string) => {
      await api.register(email, password, confirmPassword);
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
      value={{ user, token, initializing, signIn, signUp, signOut }}
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
