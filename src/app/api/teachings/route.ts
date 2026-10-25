import { NextResponse } from "next/server";
import { cleanSheetDate, isSheetsConfigured, SHEET_TABS, sheetsRead } from "@/lib/sheets";

/**
 * Word & Teachings — read from the "Teachings" tab of the Google Sheet.
 * Columns: id | title | speaker | date | scripture | link
 */
export async function GET() {
  if (!isSheetsConfigured()) {
    return NextResponse.json({ configured: false, items: [] });
  }
  const rows = await sheetsRead(SHEET_TABS.teachings);
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
      speaker: r.speaker ?? "",
      date: cleanSheetDate(r.date ?? ""),
      scripture: r.scripture ?? "",
      link: r.link ?? "",
    }));
  return NextResponse.json({ configured: true, items });
}
