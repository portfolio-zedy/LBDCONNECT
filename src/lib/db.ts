import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

/**
 * Runtime schema bootstrap for throwaway SQLite databases (e.g. serverless
 * hosts where the DB file lives in /tmp and is recreated per instance).
 * The Google Sheet is the primary store; SQLite is only the automatic
 * fallback — but the fallback must work even on a brand-new database file.
 * Memoized so the DDL runs at most once per process.
 */
let schemaPromise: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      await db.$executeRawUnsafe(
        `CREATE TABLE IF NOT EXISTS "User" (
           "id" TEXT PRIMARY KEY NOT NULL,
           "fullName" TEXT NOT NULL,
           "phone" TEXT NOT NULL,
           "passwordHash" TEXT NOT NULL,
           "role" TEXT NOT NULL,
           "leaderLevel" TEXT,
           "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
           "updatedAt" DATETIME NOT NULL
         )`,
      );
      await db.$executeRawUnsafe(
        `CREATE UNIQUE INDEX IF NOT EXISTS "User_phone_key" ON "User"("phone")`,
      );
      await db.$executeRawUnsafe(
        `CREATE TABLE IF NOT EXISTS "PrayerLink" (
           "id" TEXT PRIMARY KEY NOT NULL,
           "label" TEXT NOT NULL DEFAULT 'Bethel Daily Prayers',
           "zoomLink" TEXT NOT NULL DEFAULT 'https://app.zoom.us/wc/85079858028/join?ref_from=launch&pwd=dThLSmN3MXRLUUU4VDB0UkJJWENFQT09&_x_zm_rtaid=icnGPZ2jS2-L9j5jwK5_Eg.1784841843999.040b545f9a3cdacfc35604f20663936d&_x_zm_rhtaid=473&fromPWA=1',
           "whatsappLink" TEXT NOT NULL DEFAULT 'https://chat.whatsapp.com/LBD-Nation-Orientation',
           "updatedAt" DATETIME NOT NULL
         )`,
      );
    })().catch((err) => {
      schemaPromise = null; // allow retry on next call
      throw err;
    });
  }
  return schemaPromise;
}
