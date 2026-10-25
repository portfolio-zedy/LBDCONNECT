# LBD Nation Connect — Hosting & Android APK Guide

Everything you need to put the app online and install it as an Android app —
enough to demo to your employer, then keep iterating.

## What you're deploying

- A **Next.js 16 web app** (mobile-first, installable PWA).
- Your **Google Sheet is the database** — no SQL server, no extra bills.
  The app only needs two env vars to talk to the sheet.
- Everything below is free tier friendly.

---

## Part 1 — Host it on Vercel (~15 minutes)

### Path A — GitHub + Vercel dashboard (recommended)

1. **Get the code** — unzip `lbd-nation-connect-source.zip` to a folder on
   your machine.
2. **Push it to GitHub** (private repo is fine):
   ```bash
   cd lbd-nation-connect
   git init
   git add .
   git commit -m "LBD Nation Connect — initial release"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/lbd-nation-connect.git
   git push -u origin main
   ```
3. **Import to Vercel** — go to [vercel.com](https://vercel.com), sign up
   with your GitHub account, click **Add New → Project**, and import the
   repo. Leave all build settings at their defaults (Next.js is
   auto-detected).
4. **Add environment variables** (see table below) before clicking Deploy.
5. **Deploy** — about 2 minutes. You get a live URL like
   `https://lbd-nation-connect.vercel.app`.
6. From now on, every `git push` auto-redeploys the site.

### Path B — Vercel CLI (no GitHub needed)

```bash
# requires Node 20+
npm install          # or: bun install
npm i -g vercel
vercel login
vercel               # link the project, accept the defaults
vercel env add GOOGLE_SHEETS_WEBAPP_URL production   # paste the value
vercel env add GOOGLE_SHEETS_SECRET production
vercel --prod
```

### Environment variables

| Variable                 | Required | Value                                                                 |
| ------------------------ | -------- | --------------------------------------------------------------------- |
| `GOOGLE_SHEETS_WEBAPP_URL` | ✅ yes  | Your Apps Script Web App URL (ends in `/exec`) — same one the app uses today |
| `GOOGLE_SHEETS_SECRET`     | ✅ yes  | Must match the `SECRET` constant inside the Apps Script               |
| `AUTH_SECRET`              | 🔶 recommended | Any long random string — signs the login session cookies          |
| `ZOOM_LINK`                | ⬜ optional | Pins the leader Zoom link (recommended; see "Before the demo")    |
| `WHATSAPP_LINK`            | ⬜ optional | Pins the guest WhatsApp orientation link                          |
| `DATABASE_URL`             | ⬜ optional | `file:/tmp/lbd-fallback.db` — only keeps the local fallback store functional; the sheet doesn't need it |

### Post-deploy checklist (5 minutes)

1. Open the URL — landing page loads, **Programmes** and **Testimonies**
   show your sheet content.
2. **Leader sign-in** — `+234 803 111 2222` / `leader123` → all six cards
   unlock.
3. **Join Daily Prayers** — as a leader it opens the Zoom room; signed out
   it opens the WhatsApp orientation platform.
4. **Register a Member** — submit once, then check the `Members` tab of
   your Google Sheet: the row is there.
5. Sign out and confirm guests are back to the locked/grayed-out view.

---

## Part 2 — Get the Android app (APK)

### Option 1 — Add to Home Screen (2 minutes, zero tools)

Open the Vercel URL in **Chrome on Android** → tap **⋮ → Add to Home
screen**. You get a real LBD icon on the home screen that launches the app
fullscreen. For most demos this is already enough.

(iPhone: Safari → Share → Add to Home Screen — works the same.)

### Option 2 — Real APK via PWABuilder (~20 minutes)

The project is already PWA-ready (web manifest at `/manifest.webmanifest`,
192/512 + maskable icons, service worker, HTTPS comes free on Vercel).

1. Go to [pwabuilder.com](https://www.pwabuilder.com), paste your Vercel
   URL, click **Start**. Manifest / Service worker / Security should score
   green.
2. Click **Package for stores → Android**.
3. Options:
   - **Package ID**: `com.lbdnation.connect`
   - **App name**: `LBD Nation Connect`
   - **Version**: `1.0.0`
   - **Signing key**: choose *Create new*, then **download and keep the
     `.keystore` file and passwords** — every future update must be signed
     with the same key.
   - Toggle **Include an Android App Bundle (.aab)** if you plan to ship to
     Google Play later.
4. **Download** and unzip — you get a signed `.apk` (plus the `.aab`).
5. **Install on a phone**: send the APK to the phone (Drive, WhatsApp to
   yourself, or USB) → tap it → when Android warns, allow *Install unknown
   apps* for the app you opened it with → **Install**.
6. It launches fullscreen with the LBD icon and splash — it looks and feels
   native because it *is* a native wrapper (TWA) around your hosted app.

### Option 3 — Bubblewrap CLI (advanced)

Same result as Option 2, from your terminal:

```bash
npx @bubblewrap/cli init --manifest https://YOUR-APP.vercel.app/manifest.webmanifest
npx @bubblewrap/cli build
```

**Google Play (optional, after the demo):** one-time $25 developer account,
then upload the `.aab` + screenshots. The TWA packaging is Play-compliant.

---

## Before the demo — 10-minute housekeeping

1. **Change the Apps Script SECRET** (it is still the default placeholder):
   Apps Script editor → change the `SECRET` constant → **Deploy → Manage
   deployments → ✏️ → Version: New version → Deploy**. Then set the same
   value as `GOOGLE_SHEETS_SECRET` in Vercel and redeploy.
2. **Delete the test row** `Test Member (E2E — safe to delete)` from the
   `Members` tab of the sheet.
3. **Zoom link**: the stored link contains Zoom tracking tokens. If it ever
   stops opening the room, set `ZOOM_LINK` in Vercel to a fresh link and
   redeploy.
4. Optional polish: add a custom domain in Vercel (Settings → Domains).

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| Logins fail / "sheet-unreachable" | `SECRET` mismatch. Test in a browser: `{WEBAPP_URL}?secret=YOURSECRET&action=ping` → should return `{"ok":true}` |
| First content tap takes 2–5 s | Apps Script cold start — normal; the next taps are fast (45 s cache) |
| PWABuilder says "no manifest" | You tested `localhost` — use the deployed `https://` URL |
| Phone refuses the APK | Settings → Apps → (Files/Drive) → *Allow from unknown sources* |
| Sheet edits don't show in the app | Reads are cached ~45 s; wait a moment and reload |

## Known limitations (fine for the demo, revisit later)

- `PUT /api/prayers/link` — the in-app meeting-link editor for the upcoming
  Leader Dashboard — writes to the local SQLite fallback, which doesn't
  exist on serverless hosts, so it returns an error on Vercel. The current
  UI never calls it; links are pinned by env vars / built-in defaults.
- Members never sign in by design — accounts are leader-provisioned.
- Natural next step after the demo: move the meeting links into a
  `Settings` tab of the Google Sheet (small Apps Script update) so leaders
  can edit them in-app from any host.

## Local development quick reference

```bash
bun install      # install dependencies
bun run dev      # http://localhost:3000
bun run lint     # ESLint
bun run build    # production build (same as Vercel runs)
```
