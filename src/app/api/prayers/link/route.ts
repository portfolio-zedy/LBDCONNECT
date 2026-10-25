import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, ensureSchema } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

/**
 * Join Daily Prayers — session-aware meeting link.
 *
 * GET  → signed-in leader : { mode: "zoom",     url: <zoomLink> }
 *        everyone else    : { mode: "whatsapp", url: <whatsappLink> }
 *
 * Link resolution order:
 *   1. env ZOOM_LINK / WHATSAPP_LINK (pinned — used on hosts like Vercel
 *      where the SQLite file is throwaway)
 *   2. the PrayerLink row in the local SQLite store (leader-editable via PUT)
 *   3. built-in defaults below (the real Bethel meeting links)
 *
 * The Zoom link only ever leaves the server for authenticated leaders.
 * Guests on the landing page are pointed to the WhatsApp orientation platform.
 */

const DEFAULT_ZOOM =
  "https://app.zoom.us/wc/85079858028/join?ref_from=launch&pwd=dThLSmN3MXRLUUU4VDB0UkJJWENFQT09&_x_zm_rtaid=icnGPZ2jS2-L9j5jwK5_Eg.1784841843999.040b545f9a3cdacfc35604f20663936d&_x_zm_rhtaid=473&fromPWA=1";
const DEFAULT_WHATSAPP = "https://chat.whatsapp.com/LBD-Nation-Orientation";

function envLinks() {
  return {
    zoom: process.env.ZOOM_LINK?.trim() || undefined,
    whatsapp: process.env.WHATSAPP_LINK?.trim() || undefined,
  };
}

async function loadRow() {
  try {
    await ensureSchema();
    return (
      (await db.prayerLink.findFirst()) ??
      (await db.prayerLink.create({ data: {} }))
    );
  } catch (err) {
    console.error("prayers/link db unavailable, using defaults:", err);
    return null;
  }
}

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  const isLeader = user?.role === "leader";

  const env = envLinks();
  // Fast path: when both links are pinned via env (e.g. on serverless hosts),
  // skip the local store entirely — no failed Prisma calls, no noise.
  if (env.zoom && env.whatsapp) {
    return NextResponse.json({
      mode: isLeader ? "zoom" : "whatsapp",
      label: "Bethel Daily Prayers",
      url: isLeader ? env.zoom : env.whatsapp,
    });
  }

  const row = await loadRow();
  return NextResponse.json({
    mode: isLeader ? "zoom" : "whatsapp",
    label: row?.label ?? "Bethel Daily Prayers",
    url: isLeader
      ? env.zoom ?? row?.zoomLink ?? DEFAULT_ZOOM
      : env.whatsapp ?? row?.whatsappLink ?? DEFAULT_WHATSAPP,
  });
}

const putSchema = z.object({
  zoomLink: z.string().url("Enter a valid Zoom link.").optional(),
  whatsappLink: z.string().url("Enter a valid WhatsApp link.").optional(),
  label: z.string().trim().min(2).max(80).optional(),
});

/** PUT → leaders only: update the meeting links from the (upcoming) leader dashboard. */
export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (user?.role !== "leader") {
      return NextResponse.json(
        { error: "Only signed-in leaders can update the prayer meeting links." },
        { status: 403 },
      );
    }

    const parsed = putSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid details." },
        { status: 400 },
      );
    }

    const row =
      (await loadRow()) ??
      (await db.prayerLink.create({ data: {} }));

    const updated = await db.prayerLink.update({
      where: { id: row.id },
      data: parsed.data,
    });

    return NextResponse.json({
      label: updated.label,
      zoomLink: updated.zoomLink,
      whatsappLink: updated.whatsappLink,
    });
  } catch (err) {
    console.error("prayers/link PUT error:", err);
    return NextResponse.json(
      { error: "Could not update the prayer meeting links. Please try again." },
      { status: 500 },
    );
  }
}
