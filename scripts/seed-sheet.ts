/**
 * One-time migration/seeding for the REAL Google Sheet backend.
 *
 * 1. Copies every SQLite user (with their existing scrypt passwordHash and
 *    the SAME id, so old session cookies stay valid) into the "Users" tab.
 * 2. Seeds starter rows into Programmes / Teachings / Testimonies ONLY when
 *    the tab is still empty (the church admin edits these in the sheet).
 *
 * Run with the real env inline:
 *   GOOGLE_SHEETS_WEBAPP_URL=... GOOGLE_SHEETS_SECRET=... bun run scripts/seed-sheet.ts
 */
import { db } from "../src/lib/db";
import {
  SHEET_TABS,
  sheetsAppend,
  sheetsRead,
} from "../src/lib/sheets";

async function main() {
  // ---------- 1. Users ----------
  const existingUsers = await sheetsRead(SHEET_TABS.users);
  if (existingUsers === null) {
    throw new Error("Google Sheet is not reachable — aborting seed.");
  }
  const phones = new Set(existingUsers.map((r) => r.phone));

  const users = await db.user.findMany();
  for (const u of users) {
    if (phones.has(u.phone)) {
      console.log(`users: ${u.fullName} already present — skip`);
      continue;
    }
    const id = await sheetsAppend(SHEET_TABS.users, {
      id: u.id,
      fullName: u.fullName,
      phone: u.phone,
      role: u.role,
      leaderLevel: u.leaderLevel ?? "",
      passwordHash: u.passwordHash,
      createdAt: new Date(u.createdAt).toISOString(),
    });
    console.log(`users: appended ${u.fullName} (${u.role}) -> ${id}`);
  }

  // ---------- 2. Starter content ----------
  if ((await sheetsRead(SHEET_TABS.programmes))?.length === 0) {
    const rows = [
      {
        id: "p-daily-prayers",
        title: "Bethel Daily Prayers",
        date: "Daily · 6:00 AM",
        venue: "Zoom Meeting Room",
        description:
          "Our morning altar of prayer. Signed-in leaders find the Zoom link on the home screen — join us as we lift the nation before God every day.",
      },
      {
        id: "p-sunday-glory",
        title: "Sunday Glory Service",
        date: "Every Sunday · 9:00 AM",
        venue: "Main Auditorium",
        description:
          "Weekly celebration service with worship, the Word and ministration. Come expectant, and invite somebody — someone's breakthrough is tied to your invitation.",
      },
      {
        id: "p-night-encounter",
        title: "Night of Encounter",
        date: "Last Friday monthly · 9:00 PM",
        venue: "Main Auditorium / Zoom",
        description:
          "All-night worship, intercession and the prophetic word for LBD Nation. Come hungry; leave full.",
      },
    ];
    for (const row of rows) {
      console.log("programmes: append", row.title, await sheetsAppend(SHEET_TABS.programmes, row));
    }
  } else {
    console.log("programmes: not empty — skip");
  }

  if ((await sheetsRead(SHEET_TABS.teachings))?.length === 0) {
    const rows = [
      {
        id: "t-persistent-prayer",
        title: "The Power of Persistent Prayer",
        speaker: "Pastor Emeka Ojukwu",
        date: "2026-10-18",
        scripture: "Luke 18:1-8",
        link: "",
      },
      {
        id: "t-rooted-built-up",
        title: "Rooted and Built Up: Growing in the Word",
        speaker: "LBD Nation Teaching Team",
        date: "2026-10-11",
        scripture: "Colossians 2:6-7",
        link: "",
      },
    ];
    for (const row of rows) {
      console.log("teachings: append", row.title, await sheetsAppend(SHEET_TABS.teachings, row));
    }
  } else {
    console.log("teachings: not empty — skip");
  }

  if ((await sheetsRead(SHEET_TABS.testimonies))?.length === 0) {
    const rows = [
      {
        id: "s-starter-1",
        name: "Deaconess Ruth A.",
        testimony:
          "After three weeks on the Bethel Daily Prayers altar, the delay over my documents was broken and everything came through the same week. To God be the glory!",
        date: "2026-10-20",
      },
      {
        id: "s-starter-2",
        name: "Brother Chidi O.",
        testimony:
          "I held on to the Word all through the prayer meetings while waiting on a job. This month the offer came — a bigger role than the one I lost. God is faithful!",
        date: "2026-10-12",
      },
    ];
    for (const row of rows) {
      console.log("testimonies: append", row.name, await sheetsAppend(SHEET_TABS.testimonies, row));
    }
  } else {
    console.log("testimonies: not empty — skip");
  }

  // Members tab: leave empty — it is the live registry leaders fill from the app.
  console.log("done.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("seed failed:", err);
    process.exit(1);
  });
