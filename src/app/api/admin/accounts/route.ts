import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser, hashPassword, normalizePhone } from "@/lib/auth";
import { createUser, findUserByPhone } from "@/lib/users";

/**
 * Admin account creation — the "Users" tab of the Google Sheet.
 * A signed-in leader creates accounts that immediately work on the front end
 * (phone + password sign-in). Role can be "leader" (with leadership level)
 * or "member". Only leaders can call this.
 */

const accountSchema = z
  .object({
    fullName: z.string().trim().min(3, "Please enter the full name.").max(80),
    phone: z
      .string()
      .trim()
      .regex(/^[+]?[0-9][0-9\s\-()]{6,18}[0-9]$/, "Please enter a valid phone number."),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters.")
      .max(100, "Password is too long."),
    role: z.enum(["member", "leader"]),
    leaderLevel: z.string().optional(),
  })
  .refine((d) => d.role !== "leader" || !!d.leaderLevel, {
    message: "Please select the leadership level.",
    path: ["leaderLevel"],
  });

export async function POST(req: NextRequest) {
  const admin = await getSessionUser(req);
  if (admin?.role !== "leader") {
    return NextResponse.json(
      { error: "Only signed-in leaders can create accounts." },
      { status: 403 },
    );
  }

  const parsed = accountSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid details." },
      { status: 400 },
    );
  }

  const { fullName, password, role } = parsed.data;
  const phone = normalizePhone(parsed.data.phone);
  const leaderLevel =
    role === "leader" ? (parsed.data.leaderLevel ?? null) : null;

  const existing = await findUserByPhone(phone);
  if (existing) {
    return NextResponse.json(
      {
        error: `An account with this phone already exists (registered as a ${existing.role}).`,
      },
      { status: 409 },
    );
  }

  try {
    const created = await createUser({
      fullName,
      phone,
      passwordHash: hashPassword(password),
      role,
      leaderLevel,
    });
    return NextResponse.json({ user: created }, { status: 201 });
  } catch (err) {
    console.error("admin account creation error:", err);
    return NextResponse.json(
      { error: "Could not create the account. Please try again." },
      { status: 502 },
    );
  }
}
