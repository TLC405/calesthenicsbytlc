# ⚡ I GOT THE POWER — Independent by TLC

**A premium, mobile-first calisthenics app with an installable PWA, independent AI coach,
personal exercise creator, workout planner, progressions and realtime Power Circle.**

**Owner-controlled infrastructure — no Lovable account, subscription, preview broker
or gateway required to run the independent version.**

## Technology

- Frontend: React + TypeScript + Vite + Tailwind/shadcn/ui
- Install: PWA with Android install control and iPhone Add to Home Screen walkthrough
- Hosting: Vercel (CDN + server-side AI endpoint)
- Data: independent Supabase project owned by the app operator (Postgres, Auth, RLS, Realtime)
- AI: server-side OpenAI API, with authenticated daily request quotas
- Automation: GitHub Actions checks for TypeScript, production build and PostgreSQL policies

## What members can do

- Explore exercises, progression paths and training plans
- Create **private** custom exercises, edit/delete them, or opt in to share them
- Use AI coach to suggest exercises and build workouts
- Participate in Power Circle with posts, likes and realtime notification badges
- Install POWER from the mobile browser — no Lovable app wrapper or store submission needed

## Run / Deploy

See **[Independent Platform Setup](docs/INDEPENDENT_PLATFORM.md)** for the
data migration, self-owned Supabase setup, Vercel deployment, API key security
and Android/iOS installation instructions.

```bash
npm install --legacy-peer-deps
cp .env.example .env
npm run dev
npm run build
npx tsc --noEmit -p tsconfig.api.json
```

The in-browser Vite development server does **not** provide Vercel server functions.
Use `vercel dev` to exercise the AI endpoint locally. Never expose `OPENAI_API_KEY`
to the browser, repository or frontend env variables.

## Demo

Visit **/community?demo=1** to explore example athlete posts and interaction
without backend credentials. Demo posts are not persisted.

## Ownership and costs

You own your code in GitHub and decide when to deploy. ChatGPT can help you
write and maintain it; ChatGPT subscriptions are distinct from usage-based
OpenAI API billing. Vercel, Supabase, domains and other third-party services
can also have charges. **Migration files are not a data transfer**—back up
and restore all real user data before cutting over from the old app.
