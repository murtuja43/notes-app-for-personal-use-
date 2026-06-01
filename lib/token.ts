import jwt from "jsonwebtoken";

const TOKEN_TTL = "30d";

function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is not set");
  }
  return secret;
}

/**
 * Signs a long-lived API token for mobile clients.
 * The token simply carries the user id in `sub`.
 */
export function signApiToken(userId: string): string {
  return jwt.sign({ sub: userId }, getSecret(), { expiresIn: TOKEN_TTL });
}

/**
 * Verifies a Bearer token and returns the user id, or null if invalid.
 */
export function verifyApiToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, getSecret());
    if (typeof payload === "object" && payload.sub) {
      return String(payload.sub);
    }
    return null;
  } catch {
    return null;
  }
}
