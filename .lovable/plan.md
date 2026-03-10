

# Complete UI Overhaul — White Theme, Music Bar Fix, Exercise Navigation, Brand Themes

## Issues Identified

1. **Dark theme forced** — `html` has `@apply dark` hardcoded in CSS. Need to switch to light/white as default.
2. **Music bar sinking under nav** — MusicControl is `z-40` at `bottom-14`, MobileNav is `z-50` at `bottom-0`. The music bar renders behind the nav. Also has redundant Power icon + Switch (two controls for on/off).
3. **Exercise clicks in Anatomy navigate to `/library`** instead of opening the exercise detail modal in-place.
4. **Pages missing the UI refresh**: Planner, AILab, Anatomy still use old brutalist `border-2 border-foreground` styling.
5. **No theme system** — need a comprehensive theme switcher with 5 themes: Default (white), Vasa, Planet Fitness, YMCA, OKC Thunder.

## Plan

### 1. Switch to White/Light Theme Default (`src/index.css`)
- Remove `html { @apply dark; }` — make light the default
- Refine the `.light` / `:root` tokens so the white theme looks polished (current light tokens already exist)
- Adjust body background to remove dark radial gradient, use clean white with subtle noise

### 2. Rebuild Music Bar (`src/components/Music/MusicControl.tsx`)
- Remove the separate `Power` icon — keep only the `Switch` toggle (one control for on/off)
- Move music bar **into the header area** of each page or make it a collapsible floating mini-player in the top-right corner (not competing with bottom nav)
- Alternative: Place music bar **above** the mobile nav with proper z-indexing (`z-50`, `bottom-[4.5rem]`) so it doesn't overlap
- Redesign to match the new rounded-2xl premium aesthetic — remove `border-2 border-foreground` brutalist style

### 3. Fix Exercise Click in Anatomy (`src/pages/Anatomy.tsx`)
- Replace `onNavigate={() => navigate('/library')}` with opening `ExerciseDetailModal` in-place
- Add `ExerciseDetailModal` import and state management to Anatomy page
- `ExerciseRow` click loads full exercise data and opens the modal

### 4. Update Remaining Pages to Match New Design System

**Planner (`src/pages/Planner.tsx`)**:
- Replace `border-b-2 border-foreground` header with frosted glass `bg-background/80 backdrop-blur-2xl border-b border-border/30`
- Add rounded accent bar and proper typography

**AILab (`src/pages/AILab.tsx`)**:
- Same header treatment — frosted glass, rounded elements
- Replace `border-2 border-foreground` cards with `rounded-2xl border border-border/50 bg-card`
- Polish the unauthenticated state cards

**Anatomy (`src/pages/Anatomy.tsx`)**:
- Replace `border-b-2 border-foreground` header with frosted glass header
- Replace `border-2` cards/panels with `rounded-2xl border border-border/40 bg-card`
- Update muscle pills from `border-2 rounded-sm` to `rounded-xl border border-border/40`
- Update ExerciseRow from `border-2 rounded-lg` to `rounded-2xl border border-border/40`

### 5. Comprehensive Theme System — 5 Brand Themes

Create `src/components/ThemeSwitcher.tsx` and add theme CSS variables.

**Theme definitions** (all as CSS custom property overrides on `<html>`):

| Theme | Primary | Accent | Background | Card | Category Accent |
|-------|---------|--------|------------|------|-----------------|
| **Default** | Purple `270 100% 55%` | Electric blue | White `0 0% 98%` | White `0 0% 100%` | Current category colors |
| **Vasa Fitness** | Orange `16 100% 50%` | Teal `170 87% 33%` | White `0 0% 98%` | White | Orange-teal accent system |
| **Planet Fitness** | Purple `310 62% 40%` (#A4278D) | Yellow `59 95% 58%` (#F9F72E) | Black `0 0% 0%` | Dark gray | Purple-yellow pop |
| **YMCA** | Red `346 100% 44%` (#E00034) | Navy `210 80% 25%` | White `0 0% 98%` | White | Red-blue classic |
| **OKC Thunder** | Blue `204 100% 38%` (#007AC1) | Sunset `8 86% 54%` (#EF3B24) | Navy `214 100% 19%` (#002D62) | Dark navy | Blue-orange-yellow electric |

**Implementation**:
- Store theme choice in `localStorage` and optionally in Supabase `profiles.theme`
- Each theme sets `data-theme="vasa|pf|ymca|thunder"` on `<html>`
- CSS: `[data-theme="pf"] { --background: ...; --primary: ...; }` etc.
- Theme switcher UI in Settings page with branded preview cards showing each theme's colors
- Also accessible from Dashboard header via a palette icon

### 6. Update `App.tsx`
- Adjust `pb-[7rem]` padding to account for new music bar placement
- Ensure z-index layering is correct

## Files to Change
1. `src/index.css` — light default, 5 theme definitions
2. `src/components/Music/MusicControl.tsx` — rebuild, single toggle, proper placement
3. `src/App.tsx` — adjust layout padding
4. `src/pages/Anatomy.tsx` — exercise detail modal instead of navigate, UI refresh
5. `src/pages/Planner.tsx` — frosted glass header, rounded cards
6. `src/pages/AILab.tsx` — frosted glass header, rounded cards
7. `src/components/ThemeSwitcher.tsx` — new theme picker component
8. `src/pages/Settings.tsx` — add theme section with ThemeSwitcher
9. `src/pages/Dashboard.tsx` — add theme icon in header

## Implementation Order
1. CSS: white default + 5 theme definitions
2. Music bar rebuild + z-index fix
3. Anatomy exercise click fix
4. Planner + AILab + Anatomy UI refresh
5. Theme switcher component + Settings integration

