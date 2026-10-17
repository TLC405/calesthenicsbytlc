# POWER Independent — no Lovable runtime or subscription

POWER is a **GitHub-owned Vite/React progressive web app** with a self-owned
**Supabase** backend, **Vercel** hosting + server functions, and the **OpenAI API**.
ChatGPT is the development workspace; it is not an always-on hosting service.
None of the app's production code invokes Lovable, its API gateway, or its preview auth broker.

## Start your own backend (required before users can sign in)

1. Create a Supabase project under **your own Supabase account**; not Lovable Cloud.
2. For a **new empty installation**, run the checked-in migrations in chronological order:
   `supabase/migrations/`. Use the Supabase CLI and your linked project.
3. For an **existing Lovable Cloud application**, transfer/copy the **actual database,
   Auth users, storage objects, policies, and custom functions** first using the official
   Supabase backup/restore procedure:
   https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore
   Preserve user IDs and foreign keys. Export all Auth tables if maintaining user
   accounts and password hashes; otherwise require users to sign up again.
   Existing sessions generally need a new login after an Auth project move.
   Do not rerun historical CREATE TABLE migrations over an imported database.
   Instead, apply only migrations missing from the restored database.
4. Apply the new Power Circle and independent-platform migrations if not already part
   of the backup:
   - `20261017070000_power_circle_realtime.sql`
   - `20261017180000_independent_exercises_ai_quota.sql`
5. Confirm Auth redirect URLs for your independent domain, `supabase_realtime`
   replication, storage policies and transferred media, roles, row-level security,
   exercise catalog counts and community data before switching DNS.
6. Freeze writes on old backend briefly for a final delta export during cutover.
   Never publish old database passwords, JWT secrets, service-role keys or OpenAI keys.

This repository's historical `supabase/migrations` directory is **source code**
for reconstructing the schema; it does not migrate existing data by itself.

## Deploy and install

1. Import your GitHub repository into Vercel as a **Vite** project.
2. Set Build = `npm run build`, Output Directory = `dist`.
3. Set Vercel environment variables for Production and Preview:
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
   (public browser values for **your** Supabase project).
   `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (same project, for server
   functions), and `OPENAI_API_KEY` (secret, server-only).
   Optional `OPENAI_MODEL` defaults to `gpt-5-mini`.
4. Deploy a preview, validate two-account flow and the AI coach, then promote.
5. For Android Chrome, tap **Install** in the app. For iPhone, open in Safari,
   choose Share → Add to Home Screen. The PWA runs in its own app window.
   This is **not** a Play Store/APK or App Store/IPA submission. Native packages
   could be added later using Capacitor and signing keys.

## AI security / costs

- Browser sends an authenticated request to same-origin `/api/discover-exercises`;
  the Vercel function validates its Supabase access token and debits a per-user,
  UTC daily quota atomically. It then calls OpenAI with `OPENAI_API_KEY`.
- Max 30 AI requests per authenticated user per UTC day at database level.
  Set your OpenAI project spending budget and alert thresholds too; a per-user
  limit is **not** a global dollar ceiling against signup abuse.
- Token use is charged through **OpenAI API billing**, separately from ChatGPT
  Plus, Pro or Business subscriptions.
- Hosting, database, bandwidth, email, domains and AI usage can all incur bills.
  You stop paying *Lovable* only after your new deployment and user data are
  independently hosted, tested, and the old plan is canceled.
- Do **not** place secret keys in `VITE_` env vars, frontend files,
  the GitHub repository or source maps.

## Member-created exercises

Create from Library → **Create**, or manage the **My exercises** filter.
Custom exercises start **private**. Owner can edit, delete or opt in to
public community sharing. Curated exercises remain discoverable by everyone.
Postgres RLS—not just the UI—enforces visibility. Exercise media currently
uses user-supplied YouTube/Instagram/image URLs; uploads require separate
owner-owned Supabase Storage configuration.

## Development

```bash
npm install --legacy-peer-deps
cp .env.example .env  # Enter only your own project's values; never commit .env
npm run dev
npm run build
npx tsc --noEmit -p tsconfig.api.json
```

For local testing of the Vercel API function, use the Vercel dev environment
(`vercel dev`) with your own backend. Plain `vite` serves the frontend
but does **not** run `/api/discover-exercises`.

## Reusable architecture for future TLC apps

```
GitHub (source + CI + releases)
   ├── Vite/React/TypeScript + Tailwind + PWA (mobile UI)
   ├── Vercel CDN (website + home-screen installation)
   ├── Vercel /api server functions (authenticated business logic)
   │     └── OpenAI API (server-only per-project key, quotas & budget)
   └── Supabase project YOU own (Auth + Postgres + RLS + Realtime + Storage)
```

For each future app: fork the architecture, name your own Vercel project and
Supabase instance, apply migrations, configure new OpenAI project key & budget,
and configure installability. Keep one app per independent repository/project
to avoid coupling billing or user data. Reuse CI, design components, and
privacy patterns, not hard-coded service IDs.

## Go-live verification checklist

- [ ] New Supabase project owned by you and data/auth successfully migrated
- [ ] Environment variables use NEW project values, not Lovable Cloud
- [ ] Protected OpenAI key works only on server functions; quota applies
- [ ] Fresh signup/signin and redirects work on independent domain
- [ ] Curated exercise catalog preserved, counts spot-checked
- [ ] Two users verify private exercise isolation; public exercise is shared
- [ ] Two users verify Power Circle like/unlike notification + unread badge
- [ ] Android PWA install tested; iOS Add to Home Screen tested
- [ ] Existing app URLs redirect only when independent site verified
- [ ] Backups, monitoring, API alerts/budgets configured
- [ ] Cancel Lovable plan only **after** the independent switch is verified
