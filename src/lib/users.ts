import { randomBytes } from "crypto";
import { db, ensureSchema } from "@/lib/db";
import {
  SHEET_TABS,
  asSheetText,
  sheetsAppend,
  sheetsRead,
  type SheetRow,
} from "@/lib/sheets";
import type { Role } from "@/lib/auth";

/**
 * User repository — Google Sheets "Users" tab first, local SQLite fallback.
 *
 * All accounts are provisioned by an admin/leader (there is no self sign-up
 * for members), so the Users tab holds every account that can sign in on the
 * front end:
 *   id | fullName | phone | role | leaderLevel | passwordHash | createdAt
 */

export type StoredUser = {
  id: string;
  fullName: string;
  phone: string;
  role: Role;
  leaderLevel: string | null;
  passwordHash: string;
};

function newId(): string {
  // cuid-like, no deps
  return `c${Date.now().toString(36)}${randomBytes(6).toString("hex")}`;
}

/** Digits-only phone key — Google may strip "+"/leading zeros from stored cells. */
function phoneKey(phone: string): string {
  return phone.replace(/\D/g, "");
}

function rowToUser(row: SheetRow): StoredUser | null {
  if (!row.id || !row.phone) return null;
  return {
    id: row.id,
    fullName: row.fullName ?? "",
    phone: row.phone,
    role: (row.role === "leader" ? "leader" : "member") as Role,
    leaderLevel: row.leaderLevel || null,
    passwordHash: row.passwordHash ?? "",
  };
}

function userToRow(u: Omit<StoredUser, "id"> & { id: string }): SheetRow {
  return {
    id: u.id,
    fullName: u.fullName,
    // asSheetText stops Google from eating the leading "+"/"0" of phone numbers.
    phone: asSheetText(u.phone),
    role: u.role,
    leaderLevel: u.leaderLevel ?? "",
    passwordHash: u.passwordHash,
    createdAt: new Date().toISOString(),
  };
}

function toSafe(u: StoredUser) {
  return {
    id: u.id,
    fullName: u.fullName,
    phone: u.phone,
    role: u.role,
    leaderLevel: u.leaderLevel,
  };
}

export type SafeStoredUser = ReturnType<typeof toSafe>;

export async function findUserByPhone(
  phone: string,
): Promise<StoredUser | null> {
  const key = phoneKey(phone);
  const rows = await sheetsRead(SHEET_TABS.users);
  if (rows !== null) {
    return rows.map(rowToUser).find((u) => u?.phone && phoneKey(u.phone) === key) ?? null;
  }
  // Fallback: local SQLite (ensure the table exists on throwaway DB files)
  await ensureSchema();
  const u = await db.user.findUnique({ where: { phone } });
  return u
    ? {
        id: u.id,
        fullName: u.fullName,
        phone: u.phone,
        role: u.role as Role,
        leaderLevel: u.leaderLevel,
        passwordHash: u.passwordHash,
      }
    : null;
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  const rows = await sheetsRead(SHEET_TABS.users);
  if (rows !== null) {
    return rows.map(rowToUser).find((u) => u?.id === id) ?? null;
  }
  await ensureSchema();
  const u = await db.user.findUnique({ where: { id } });
  return u
    ? {
        id: u.id,
        fullName: u.fullName,
        phone: u.phone,
        role: u.role as Role,
        leaderLevel: u.leaderLevel,
        passwordHash: u.passwordHash,
      }
    : null;
}

export async function createUser(input: {
  fullName: string;
  phone: string;
  passwordHash: string;
  role: Role;
  leaderLevel: string | null;
}): Promise<SafeStoredUser> {
  const id = newId();
  const record = { id, ...input };

  const rows = await sheetsRead(SHEET_TABS.users);
  if (rows !== null) {
    // Google Sheets is the active backend
    const appended = await sheetsAppend(SHEET_TABS.users, userToRow(record));
    if (appended) return toSafe(record);
    throw new Error("sheet-append-failed");
  }

  // Fallback: local SQLite
  await ensureSchema();
  await db.user.create({
    data: {
      id,
      fullName: input.fullName,
      phone: input.phone,
      passwordHash: input.passwordHash,
      role: input.role,
      leaderLevel: input.leaderLevel,
    },
  });
  return toSafe(record);
}
