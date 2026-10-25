/**
 * Google Sheets backend client (server-side only).
 *
 * Talks to a Google Apps Script Web App deployed from the church's Google
 * Sheet. The script exposes two actions:
 *   GET  {WEBAPP}?secret=...&action=read&tab=Programmes  -> { ok, rows: [{}] }
 *   POST {WEBAPP}  { secret, action: "append", tab, row } -> { ok, id }
 *
 * Configure with env vars:
 *   GOOGLE_SHEETS_WEBAPP_URL  - the /exec URL of the deployed Apps Script
 *   GOOGLE_SHEETS_SECRET      - shared secret the script checks
 *
 * While no URL is configured, the app falls back to the local SQLite store
 * for accounts and shows "not connected" states for content modules.
 */

const WEBAPP_URL = process.env.GOOGLE_SHEETS_WEBAPP_URL ?? "";
const SECRET = process.env.GOOGLE_SHEETS_SECRET ?? "";

/** Apps Script cold starts + LockService can take several seconds. */
const REQUEST_TIMEOUT_MS = 20_000;
/**
 * Short in-process cache for reads. Auth touches the Users tab on every
 * request — without this, each tap would pay a 1-3s Google round-trip.
 * Appends invalidate the tab's entry so duplicate checks stay correct.
 */
const CACHE_TTL_MS = 45_000;
const readCache = new Map<string, { rows: SheetRow[]; at: number }>();

export const SHEET_TABS = {
  users: "Users",
  programmes: "Programmes",
  teachings: "Teachings",
  testimonies: "Testimonies",
  members: "Members",
} as const;

export type SheetTab = (typeof SHEET_TABS)[keyof typeof SHEET_TABS];

export type SheetRow = Record<string, string>;

export function isSheetsConfigured(): boolean {
  return WEBAPP_URL.length > 0;
}

async function request<T>(
  url: string,
  init?: RequestInit,
): Promise<T | null> {
  try {
    const res = await fetch(url, {
      ...init,
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error(`sheets request failed: HTTP ${res.status} ${url}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error("sheets request error:", err);
    return null;
  }
}

/** Read all rows of a tab (45s cache). Returns null when unreachable (caller can fall back). */
export async function sheetsRead(tab: SheetTab): Promise<SheetRow[] | null> {
  if (!isSheetsConfigured()) return null;
  const cached = readCache.get(tab);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.rows;
  const params = new URLSearchParams({
    secret: SECRET,
    action: "read",
    tab,
  });
  const data = await request<{ ok: boolean; rows?: SheetRow[] }>(
    `${WEBAPP_URL}?${params.toString()}`,
  );
  if (!data?.ok || !Array.isArray(data.rows)) return null;
  readCache.set(tab, { rows: data.rows, at: Date.now() });
  return data.rows;
}

/** Append one row. Returns the row id on success, null on failure. */
export async function sheetsAppend(
  tab: SheetTab,
  row: SheetRow,
): Promise<string | null> {
  if (!isSheetsConfigured()) return null;
  // Drop the cached read so the next lookup (e.g. duplicate-phone check)
  // sees the freshly appended row.
  readCache.delete(tab);
  const data = await request<{ ok: boolean; id?: string }>(WEBAPP_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ secret: SECRET, action: "append", tab, row }),
  });
  if (!data?.ok || !data.id) return null;
  return data.id;
}

/**
 * Google Sheets silently coerces values that look like numbers or dates when
 * a row is appended: "+234803..." loses its "+", "0803..." loses its leading
 * zero, "2026-10-18" becomes a long Date string. Wrapping such values in a
 * trivial formula (=\"...\") forces the cell to stay text. Embedded quotes
 * are escaped by doubling, per Sheets formula syntax.
 */
export function asSheetText(value: string): string {
  const coercionProne =
    value.startsWith("+") ||
    /^0\d/.test(value) ||
    /^\d{4}-\d{2}-\d{2}/.test(value);
  if (!coercionProne) return value;
  return `="${value.replace(/"/g, '""')}"`;
}

/**
 * Coerced date cells read back as JS Date toString() — e.g.
 * "Sun Oct 18 2026 00:00:00 GMT+0100 (...)". Extract the date parts straight
 * from the artifact string (no Date parsing — toISOString would shift the
 * day by the GMT offset). Anything an admin typed is untouched.
 */
const MONTH_NUM: Record<string, string> = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
  Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
};
export function cleanSheetDate(value: string): string {
  const m = /^([A-Z][a-z]{2}) ([A-Z][a-z]{2}) (\d{1,2}) (\d{4}) /.exec(value);
  const month = m ? MONTH_NUM[m[2]] : undefined;
  if (!m || !month) return value;
  return `${m[4]}-${month}-${m[3].padStart(2, "0")}`;
}
