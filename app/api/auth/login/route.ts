import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { signApiToken } from "@/lib/token";
import { handleApiError } from "@/lib/api-error";

/**
 * POST /api/auth/login
 *
 * Token-based login for mobile / API clients. Validates email + password and
 * returns a long-lived Bearer token. (The web app uses NextAuth cookies via
 * /api/auth/[...nextauth] instead.)
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const email = parsed.data.email.toLowerCase();

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // Same generic message whether the email or password is wrong.
    const invalid = NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );

    if (!user) {
      return invalid;
    }

    const isValid = await bcrypt.compare(parsed.data.password, user.password);
    if (!isValid) {
      return invalid;
    }

    const token = signApiToken(user.id);

    return NextResponse.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    return handleApiError("login", error);
  }
}
