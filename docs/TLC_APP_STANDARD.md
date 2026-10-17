# TLC App Standard — reusable starting point for every new app

**Baseline:** [POWER Independent](https://github.com/TLC405/calesthenicsbytlc/tree/feature/realtime-community-likes)  
**Live independent preview:** https://tlc-power-independent.vercel.app  
**Last revised:** 2026-10-17

## Standing request

When building a new TLC app, **start from the working patterns in POWER Independent and improve them**. Do not start over from scratch or make a simpler version without a strong technical reason. Carry forward proven components, security controls and UX refinements. For each new app, actively identify and implement useful upgrades relevant to the app's purpose.

This reference document is the canonical, code-adjacent checklist. These principles are defaults, not an excuse to force fitness-specific features into unrelated apps.

## Non-negotiable technical defaults

1. **Independent ownership:** Source in the user's GitHub organization/repositories. User-controlled domain, Vercel or equivalent portable hosting and Supabase or other user-controlled Postgres. No dependence on Lovable editor, AI gateway, preview auth or subscriptions.
2. **Mobile-first:** Fully responsive at narrow Android/iPhone widths, comfortable tap targets, mobile-friendly bottom navigation, no horizontal overflow, usable with one hand, keyboard-aware forms, Android/iOS browser compatibility.
3. **Installable:** Modern PWA with web manifest, service worker, stable identity/icons, actionable Android Chrome install button and simple iOS Share → Add to Home Screen guidance. Native APK, Play Store, or App Store packaging only if specifically needed; don't falsely claim PWAs are APKs.
4. **Good design:** High visual quality, strong hierarchy and typography, polished interactions, app-specific brand identity, accessible contrast, dark-mode support when appropriate; avoid generic boilerplate and unnecessary gradient/neon UI.
5. **Your own AI:** Route any OpenAI calls through a secure server function with per-user authentication, request validation, cost control, quotas, logging and budgets. Never leak API keys or put them in `VITE_` frontend variables. Explain that API billing is distinct from ChatGPT subscriptions. AI should add real user value, not decorate the interface.
6. **Private and customizable:** Users can add, edit, delete and export their own content when it makes sense (exercises in fitness apps; places/events in discovery apps; notes/tests in other apps). New user data private by default; community publication opt-in, database-enforced row-level security.
7. **Offline and resilient:** Useful no-account experience when feasible, meaningful loading/error/empty states, honest demo vs connected-live labels, reliable syncing and export/backup. Do not misrepresent local-only data as shared or preserved after clearing browser storage.
8. **Tested and deployable:** TypeScript, production build, automated database/security checks, responsive and accessibility tests, and a preview URL that actual users can access. Protect existing production data; use staging/preview, migration backups and a cutover checklist.
9. **Modular and reusable:** Well-structured React/TypeScript UI, reusable components, validated schemas, documented environment configuration, versioned migrations, CI/CD pipelines, structured error handling, deploy steps and simple repository transfer.
10. **Operational costs & security:** Usage ceilings/alerts for AI and cloud services, least-privileged access, rate limiting, abuse/moderation protections for public content, backup/restore guidance, privacy disclosures and logout/data-deletion workflows. Don't promise free hosting forever.

## Continuous upgrade rule

Before declaring an app release ready:
- Audit the original goal, mobile UX, data privacy, speed, accessibility and installation.
- Identify at least three concrete *app-specific* improvements over the previous version.
- Implement the highest-impact feasible improvements; clearly separate completed features from proposals.
- Confirm routes work and relevant backend permissions/migrations are deployed. Report actual test and deployment status, not anticipated success.
- Leave a concise changelog and maintain a realistic backlog.

## POWER source features to reuse appropriately

- React, TypeScript, Vite, Tailwind/shadcn UI components
- PWA installation controls and responsive mobile layouts
- Supabase Postgres/Auth/RLS/Realtime patterns
- Server-only OpenAI API endpoint with authenticated daily quota
- Guest demo and offline storage with explicit local-only labeling
- Member-created exercise data, private-by-default and optional sharing
- Power Circle community/likes/notifications where appropriate
- GitHub Actions for typecheck, build and database smoke tests
- Independent Vercel deployment via GitHub source SHA
- Self-serve setup and migration instructions

## Known limitations / next improvements

- An owner-controlled Supabase deployment, account/user-data migration, secure OpenAI environment configuration, and live two-account verification are **not yet complete**.
- PWA install ≠ Android APK/iPhone App Store binary.
- Guest-created exercises/workouts are currently stored only in one browser; they need backup/import and opt-in account migration.
- Publishable community apps should add moderation/reporting, abuse rate limits, pagination, privacy policy and account deletion before wide release.
- A reusable **separate, clean TLC starter repository** should eventually split generalized infrastructure from fitness-specific components, but the current working reference is POWER Independent.
- Vercel GitHub repository integration requires authorization for automatic deploy-on-push; manual Git SHA deployments work.

## How to use with ChatGPT

Say: **"Build this using the TLC App Standard; improve the baseline, keep it mobile and installable, deploy independently, and show what is done versus blocked."**

Do not request users to paste secret keys in chat; instruct users to configure Vercel/Supabase secrets in their own account.
