/**
 * Simulates a Vercel cold start: brand-new empty SQLite file, no migrations.
 * ensureSchema() must create the tables, and the PrayerLink row must
 * lazy-create so /api/prayers/link serves the real links.
 * Run: DATABASE_URL=file:... bun run scripts/test-ensure-schema.ts
 */
import { db, ensureSchema } from "../src/lib/db";

async function main() {
  await ensureSchema();
  console.log("ensureSchema: OK");
  const users = await db.user.count();
  console.log("User.count (fresh db):", users);
  const row =
    (await db.prayerLink.findFirst()) ??
    (await db.prayerLink.create({ data: {} }));
  console.log("PrayerLink lazy-create: OK", row.id, row.label);
  process.exit(0);
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});
