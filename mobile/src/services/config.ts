import Constants from "expo-constants";

/**
 * Base URL of the backend API.
 *
 * Resolved from (in order):
 *   1. EXPO_PUBLIC_API_URL environment variable (see .env.example)
 *   2. the `extra.apiUrl` value in app.json
 *   3. the production deployment fallback
 */
export const API_URL: string =
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  "https://noteall-seven.vercel.app";
