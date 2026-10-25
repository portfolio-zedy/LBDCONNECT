import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createSessionToken,
  normalizePhone,
  SESSION_COOKIE,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/auth";
import { findUserByPhone } from "@/lib/users";

/**
 * Sign-in. There is no self sign-up on this app — every account is created by
 * an admin/leader (Users tab of the Google Sheet / local fallback store), so
 * any stored account (member or leader) may sign in. The role that gates
 * leader-only areas comes from the stored account.
 */
const loginSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[0-9][0-9\s\-()]{6,18}[0-9]$/, "Please enter a valid phone number."),
  password: z.string().min(1, "Please enter your password."),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid details." },
        { status: 400 },
      );
    }

    const { password } = parsed.data;
    const phone = normalizePhone(parsed.data.phone);

    const user = await findUserByPhone(phone);
    if (!user) {
      return NextResponse.json(
        { error: "No account found with this phone number. Ask your admin to create one for you." },
        { status: 401 },
      );
    }

    if (!verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: "Incorrect password. Please try again." },
        { status: 401 },
      );
    }

    const res = NextResponse.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        leaderLevel: user.leaderLevel,
      },
    });
    res.cookies.set(
      SESSION_COOKIE,
      createSessionToken(user.id, user.role),
      sessionCookieOptions,
    );
    return res;
  } catch (err) {
    console.error("login error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
