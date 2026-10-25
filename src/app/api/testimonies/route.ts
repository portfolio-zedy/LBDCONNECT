import { NextResponse } from "next/server";
import { cleanSheetDate, isSheetsConfigured, SHEET_TABS, sheetsRead } from "@/lib/sheets";

/**
 * Testimonies — read from the "Testimonies" tab of the Google Sheet.
 * Columns: id | name | testimony | date
 */
export async function GET() {
  if (!isSheetsConfigured()) {
    return NextResponse.json({ configured: false, items: [] });
  }
  const rows = await sheetsRead(SHEET_TABS.testimonies);
  if (rows === null) {
    return NextResponse.json(
      { configured: true, error: "sheet-unreachable", items: [] },
      { status: 200 },
    );
  }
  const items = rows
    .filter((r) => r.testimony || r.name)
    .map((r) => ({
      id: r.id ?? "",
      name: r.name ?? "",
      testimony: r.testimony ?? "",
      date: cleanSheetDate(r.date ?? ""),
    }));
  return NextResponse.json({ configured: true, items });
}
