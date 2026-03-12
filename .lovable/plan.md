# Workout Builder + AI Notepad + Library Simplification + Branding Fix

## What You Asked For

1. **Workout Builder** (not calendar planner) — build workouts with Warm-up, Workout, Cool-down, Compression sections
2. **AI Workout Notepad** — split screen: AI on one side, notepad/workout sheet on the other. AI can build the workout for you
3. **Simplify Library** — too many category tabs, reduce visual clutter
4. **Branding** — app should say "I Got The Power" everywhere (not "POWA")
5. **Admin panel** — ability to change loading screen image/video and other features
6. **Login code** — 73507

## Plan

### 1. Rename Planner → Workout Builder (`src/pages/Planner.tsx` — full rewrite)

Replace the calendar-only planner with a structured workout builder:

- **4-section notepad layout**: Warm-Up → Workout → Cool-Down → Compression
- Each section is a collapsible card with a colored left accent
- Users can add exercises to each section from a mini-picker
- Each exercise row has inline set/rep tracker
- "Save Workout" button persists to the `workouts` table
- Name the workout, tag it (e.g. "Push Day", "Full Body")
- Remove CalendarView from this page entirely

### 2. AI Workout Notepad (`src/pages/AILab.tsx` + `src/components/AILab/AILabChat.tsx` — redesign)

Transform AI Lab into a split-pane workout builder:

- **Left side**: AI chat (simplified, clean rounded cards instead of `border-2` brutalist)
- **Right side (desktop) / bottom sheet (mobile)**: Live workout notepad that AI populates
- AI can suggest a full workout with warm-up/workout/cooldown/compression sections
- User can drag exercises between sections or remove them
- "Apply to Builder" button sends the AI-generated workout to the Planner/Builder
- Update `AILabChat.tsx` to remove all `border-2 border-foreground` brutalist styling → use `rounded-2xl border border-border/50 bg-card`

### 3. Simplify Library (`src/pages/Library.tsx` + `src/components/Exercise/CategoryTabs.tsx`)

- Reduce categories: group into **4 main tabs**: Strength (Push+Pull+Rings), Lower Body (Legs+Core), Skills (Skills+Yoga), Recovery (Mobility+Flexibility)
- Show sub-categories as smaller pills within each main tab
- Remove the `border-2` styling from CategoryTabs → use `rounded-xl` pill buttons
- Cleaner card grid with less visual noise

### 4. Branding — "I Got The Power" (`src/pages/Index.tsx`, `src/pages/Dashboard.tsx`, `src/pages/Auth.tsx`, `src/components/LoadingScreen.tsx`, `public/manifest.json`)

- Replace all instances of "POWA" with "POWER" and "I GOT THE POWA" with "I GOT THE POWER"
- Update manifest.json name/short_name
- Update the loading screen text
- Update Index.tsx hero
- Update Auth.tsx branding
- Update Dashboard header subtitle

### 5. Admin Panel — Loading Screen Config (`src/pages/Settings.tsx` + database)

- Add an admin-only section in Settings (check `has_role(uid, 'admin')`)
- Admin can set a custom loading screen image URL (stored in a `site_config` table)
- Admin can toggle feature flags
- Create `site_config` table with key/value pairs for: `loading_image_url`, `loading_video_url`, `app_tagline`
- `LoadingScreen.tsx` reads from this config on mount

### 6. Fix remaining brutalist styling in `AILabChat.tsx`

- Replace `border-2 border-foreground` on chat bubbles, input bar, exercise cards, and video dialog
- Use consistent `rounded-2xl border border-border/50 bg-card` styling

## Database Changes

- Create `site_config` table: `key TEXT PRIMARY KEY`, `value TEXT`, `updated_at TIMESTAMPTZ`
- RLS: Anyone can SELECT, only admins can UPDATE/INSERT/DELETE
- Seed with default values for loading screen

## Files to Change

1. `src/pages/Planner.tsx` — full rewrite as Workout Builder
2. `src/pages/AILab.tsx` — split-pane AI + notepad layout
3. `src/components/AILab/AILabChat.tsx` — remove brutalist styling, add workout generation
4. `src/pages/Library.tsx` — simplify category grouping
5. `src/components/Exercise/CategoryTabs.tsx` — grouped tabs with pill styling
6. `src/pages/Index.tsx` — "POWER" branding
7. `src/pages/Dashboard.tsx` — "POWER" branding
8. `src/pages/Auth.tsx` — "POWER" branding
9. `src/components/LoadingScreen.tsx` — "POWER" + dynamic image/video from site_config
10. `public/manifest.json` — name update
11. `src/pages/Settings.tsx` — admin panel section
12. `src/components/Layout/MobileNav.tsx` — rename "AI" tab to "Build" or update icon
13. Database migration for `site_config` table

## Implementation Order

1. Database: create `site_config` table
2. Branding: rename POWA → POWER across all files
3. Workout Builder: rewrite Planner page
4. AI Notepad: redesign AILab with split-pane
5. Library simplification
6. Admin panel in Settings with modern admin tools. Custom super agent 
7. Loading screen dynamic config