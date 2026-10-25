import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

/**
 * Session restore. Accounts are admin-provisioned (Users tab of the Google
 * Sheet), so any stored role — member or leader — is a valid signed-in user.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    return NextResponse.json({ user });
  } catch (err) {
    console.error("me error:", err);
    return NextResponse.json({ user: null });
  }
}
