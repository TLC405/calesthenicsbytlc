# Finish Updates + Pro UI Polish + Comprehensive Simplification

## Goals
1. Finish any half-built flows from prior turns
2. Add professional, refined UI details across the app
3. Comprehensively simplify — fewer surfaces, clearer hierarchy, less noise

## 1. Finish outstanding work
- **Admin Panel (Settings.tsx)**: confirm `site_config` editor (loading image/video URL + tagline) is wired with admin role check; add live preview + reset to default
- **LoadingScreen.tsx**: ensure it reads dynamic media from `site_config` with graceful fallback
- **Branding sweep**: verify every "POWA" → "I GOT THE POWER" (Index, Auth, Dashboard, Loading, manifest, meta tags in index.html)
- **AI Notepad → Builder export**: wire the "Apply to Builder" action from AILab → Planner via sessionStorage handoff
- **MobileNav labels**: finalize 5 tabs (Home, Library, Build, Coach, You)

## 2. Professional UI details
Applied globally, not page-by-page reinvention:
- **Typography rhythm**: consistent `text-[10px] font-mono uppercase tracking-[0.2em]` for eyebrows, `font-display` for all headings, tabular numerals for stats
- **Card system**: unify on `rounded-2xl border border-border/50 bg-card shadow-sm` + subtle hover lift (`-translate-y-0.5`, `shadow-md`). Remove any leftover `border-2 border-foreground` brutalist remnants
- **Headers**: every page gets the same 64px frosted header (`backdrop-blur-2xl bg-background/80 border-b border-border/30`) with icon-chip + title + eyebrow + right-side action
- **Empty states**: shared `<EmptyState>` component (icon chip, title, hint, optional CTA) — used in Library, Planner, AILab, Anatomy
- **Section dividers**: thin accent bar (1.5×40px rounded) using category color — already in Planner, extend to Library/Dashboard
- **Micro-interactions**: 180ms `cubic-bezier(0.23,1,0.32,1)` on all interactive elements; focus rings using `ring-2 ring-ring/40`
- **Skeletons**: replace spinners with shimmer skeletons matching final card shape
- **Toasts**: standardize on sonner with icon + short copy

## 3. Comprehensive simplification

### Navigation (5 tabs, locked)
Home · Library · Build · Coach · You — remove Anatomy from the nav (move into Library as a tab/filter), remove Planner duplicate

### Dashboard (Home)
Reduce from current sprawl to 4 blocks:
1. Hero greeting + today's focus (1 card)
2. Streak / XP / weekly count (3 inline stats, no separate cards)
3. Continue / Start workout (1 primary CTA)
4. Recent activity (compact list, max 5)
Remove: MasterSkillList from home (lives in Library), WeeklyCalendar (lives in Build), separate "today focus" duplication

### Library
- 4 tabs only: Strength · Lower · Skills · Recovery (already done)
- Remove sub-pill clutter — use a single search + tag chips revealed on demand
- Card grid: 2-col mobile, 3-col tablet, 4-col desktop, uniform aspect ratio
- Merge Anatomy muscle-map as a 5th tab "Body" — tap a muscle filters the grid

### Build (Planner)
- Keep 4-section notepad
- Collapse all sections by default except "Workout"
- Add a top "Quick Start" row: Push / Pull / Legs / Full Body templates (1-tap fill)
- Move workout history to a slide-up sheet, not a separate page

### Coach (AILab)
- Single-pane on mobile (notepad as bottom sheet), split on desktop
- Strip auxiliary buttons; keep: New chat, Apply to Builder, Clear notepad
- Prompt chips above input: "Build push day", "Mobility flow", "30-min full body"

### You (Settings)
Three sections only: Profile · Themes · Admin (conditional). Collapse everything else into an "Advanced" accordion.

### Music FAB
Single floating pill above nav (`bottom-[5.5rem] right-4`), 1 toggle + volume only — confirm prior fix holds, remove any duplicate controls

### Remove / retire
- `CalendarView` component (no longer referenced after Build rewrite)
- `WeeklyCalendar` from Dashboard
- Duplicate `NonNegotiablesBar`/`IntegrityBlock` if unused on Train
- Any leftover dark-forced classes

## Files to touch
- `src/index.css` — finalize tokens, add `.eyebrow`, `.section-header`, `.pro-card` utilities
- `src/components/Layout/MobileNav.tsx` — lock 5 tabs
- `src/components/ui/empty-state.tsx` — new shared component
- `src/pages/Dashboard.tsx` — slim to 4 blocks
- `src/pages/Library.tsx` — add Body tab, simplify chips
- `src/pages/Planner.tsx` — quick-start templates, default-collapse
- `src/pages/AILab.tsx` + `src/components/AILab/AILabChat.tsx` — prompt chips, simplify actions, wire export
- `src/pages/Settings.tsx` — 3-section layout + Advanced accordion, finalize admin panel
- `src/pages/Anatomy.tsx` — retire route (redirect to Library?tab=body)
- `src/components/LoadingScreen.tsx` — dynamic media + branding
- `src/components/Music/MusicControl.tsx` — verify single toggle
- `src/App.tsx` — remove Anatomy route or alias to Library
- `index.html` + `public/manifest.json` — branding/meta sweep

## Out of scope
- No DB schema changes (site_config already exists)
- No new backend logic
- No new third-party libs
