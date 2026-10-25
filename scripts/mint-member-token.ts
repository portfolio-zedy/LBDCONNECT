/**
 * E2E helper: mint a valid signed session token for the demo member account
 * (Grace) using the app's own auth lib, to prove /api/auth/me now voids
 * stale member sessions. Prints token to stdout.
 */
import { db } from "../src/lib/db";
import { createSessionToken } from "../src/lib/auth";

const member = await db.user.findFirst({
  where: { role: "member" },
  select: { id: true, fullName: true },
});

if (!member) {
  console.error("no member account found");
  process.exit(1);
}

console.log(
  JSON.stringify({ fullName: member.fullName, token: createSessionToken(member.id, "member") }),
);
process.exit(0);
