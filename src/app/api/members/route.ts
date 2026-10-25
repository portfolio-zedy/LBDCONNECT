import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser, normalizePhone } from "@/lib/auth";
import { isSheetsConfigured, SHEET_TABS, asSheetText, sheetsAppend, sheetsRead } from "@/lib/sheets";

/**
 * Member registry — the "Members" tab of the Google Sheet ("register new
 * member"). Leaders register members into their colonies; the tab stores the
 * record (members do not get sign-in accounts).
 * Columns: id | fullName | phone | gender | colony | registeredBy | createdAt
 */

const memberSchema = z.object({
  fullName: z.string().trim().min(3, "Please enter the member's full name.").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[0-9][0-9\s\-()]{6,18}[0-9]$/, "Please enter a valid phone number."),
  gender: z.enum(["male", "female"]),
  colony: z.string().trim().min(2, "Please enter the member's colony.").max(60),
});

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (user?.role !== "leader") {
    return NextResponse.json(
      { error: "Only signed-in leaders can view the member registry." },
      { status: 403 },
    );
  }
  if (!isSheetsConfigured()) {
    return NextResponse.json({ configured: false, items: [] });
  }
  const rows = await sheetsRead(SHEET_TABS.members);
  if (rows === null) {
    return NextResponse.json(
      { configured: true, error: "sheet-unreachable", items: [] },
      { status: 200 },
    );
  }
  const items = rows
    .filter((r) => r.fullName)
    .map((r) => ({
      id: r.id ?? "",
      fullName: r.fullName ?? "",
      phone: r.phone ?? "",
      gender: r.gender ?? "",
      colony: r.colony ?? "",
      registeredBy: r.registeredBy ?? "",
      createdAt: r.createdAt ?? "",
    }));
  return NextResponse.json({ configured: true, items });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (user?.role !== "leader") {
    return NextResponse.json(
      { error: "Only signed-in leaders can register members." },
      { status: 403 },
    );
  }

  const parsed = memberSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid details." },
      { status: 400 },
    );
  }
  const { fullName, phone, gender, colony } = parsed.data;
  const normPhone = normalizePhone(phone);

  if (!isSheetsConfigured()) {
    return NextResponse.json(
      {
        error:
          "The Google Sheet backend is not connected yet. Connect the sheet to register members.",
      },
      { status: 501 },
    );
  }

  const registeredBy = user.fullName;
  const id = await sheetsAppend(SHEET_TABS.members, {
    id: `m${Date.now().toString(36)}`,
    fullName,
    // asSheetText keeps Google from eating the leading "+"/"0" of the phone.
    phone: asSheetText(normPhone),
    gender,
    colony,
    registeredBy,
    createdAt: new Date().toISOString(),
  });
  if (!id) {
    return NextResponse.json(
      { error: "Could not write to the Google Sheet. Please try again." },
      { status: 502 },
    );
  }
  return NextResponse.json(
    {
      member: { id, fullName, phone: normPhone, gender, colony, registeredBy },
    },
    { status: 201 },
  );
}
