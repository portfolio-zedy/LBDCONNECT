import { db } from "../src/lib/db";
const users = await db.user.findMany({
  select: { fullName: true, phone: true, role: true, leaderLevel: true, passwordHash: true },
});
console.log(JSON.stringify(users, null, 2));
process.exit(0);
