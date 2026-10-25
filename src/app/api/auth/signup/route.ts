import { NextRequest, NextResponse } from "next/server";

/**
 * Self sign-up is permanently disabled — every account is created by an
 * admin/leader via the Leader Admin area (POST /api/admin/accounts), which
 * writes to the Users tab of the Google Sheet.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Self sign-up is disabled. Accounts are created by your admin or leader.",
    },
    { status: 403 },
  );
}
