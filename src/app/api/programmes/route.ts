import { NextResponse } from "next/server";
import { cleanSheetDate, isSheetsConfigured, SHEET_TABS, sheetsRead } from "@/lib/sheets";

/**
 * Programmes — read from the "Programmes" tab of the Google Sheet.
 * Columns: id | title | date | venue | description
 */
export async function GET() {
  if (!isSheetsConfigured()) {
    return NextResponse.json({ configured: false, items: [] });
  }
  const rows = await sheetsRead(SHEET_TABS.programmes);
  if (rows === null) {
    return NextResponse.json(
      { configured: true, error: "sheet-unreachable", items: [] },
      { status: 200 },
    );
  }
  const items = rows
    .filter((r) => r.title)
    .map((r) => ({
      id: r.id ?? "",
      title: r.title ?? "",
      date: cleanSheetDate(r.date ?? ""),
      venue: r.venue ?? "",
      description: r.description ?? "",
    }));
  return NextResponse.json({ configured: true, items });
}
