import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";
import { findUserById } from "@/lib/users";

/**
 * LBD Nation Connect auth helpers.
 * - Passwords: scrypt (salt:hash, node:crypto — no extra deps)
 * - Sessions: HMAC-SHA256 signed token in an httpOnly cookie
 */

export const SESSION_COOKIE = "lbd_session";
const SESSION_DAYS = 30;
const SECRET = process.env.AUTH_SECRET ?? "lbd-nation-connect-dev-secret";

export type Role = "member" | "leader";

export type SafeUser = {
  id: string;
  fullName: string;
  phone: string;
  role: Role;
  leaderLevel: string | null;
};

/* ---------------- passwords ---------------- */

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return (
    candidate.length === expected.length && timingSafeEqual(candidate, expected)
  );
}

/* ---------------- session tokens ---------------- */

type SessionPayload = { uid: string; role: Role; exp: number };

function sign(data: string): string {
  return createHmac("sha256", SECRET).update(data).digest("base64url");
}

export function createSessionToken(uid: string, role: Role): string {
  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = Buffer.from(
    JSON.stringify({ uid, role, exp } satisfies SessionPayload),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString(),
    ) as SessionPayload;
    if (!parsed.uid || !parsed.role || parsed.exp < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

/* ---------------- cookies ---------------- */

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: false, // preview runs over http
  path: "/",
  maxAge: SESSION_DAYS * 24 * 60 * 60,
};

/* ---------------- current user ---------------- */

export async function getSessionUser(
  req: NextRequest,
): Promise<SafeUser | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = verifySessionToken(token);
  if (!session) return null;
  const user = await findUserById(session.uid);
  if (!user) return null;
  return {
    id: user.id,
    fullName: user.fullName,
    phone: user.phone,
    role: user.role as Role,
    leaderLevel: user.leaderLevel,
  };
}

/* ---------------- misc ---------------- */

/** Normalise phone numbers for storage/lookup: strip spaces, dashes, brackets. */
export function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-()]/g, "").trim();
}

export const LEADER_LEVELS = [
  "international",
  "colony",
  "hub",
  "tribe",
] as const;

export function isValidLeaderLevel(v: unknown): v is (typeof LEADER_LEVELS)[number] {
  return (
    typeof v === "string" && (LEADER_LEVELS as readonly string[]).includes(v)
  );
}
