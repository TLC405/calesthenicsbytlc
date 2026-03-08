

# Complete Visual Redesign — World-Class Component System

## Problem
The current UI feels flat and utilitarian. While the brutalist foundation is strong, the execution lacks visual depth, hierarchy, and polish. Cards feel boxy, typography lacks rhythm, spacing is inconsistent, and there's no visual "wow" factor. The app looks like a developer prototype, not a premium fitness product.

## Design Direction
Evolve from "raw brutalist" to **"Premium Athletic Brutalism"** — keeping the sharp edges, mono typography, and category colors, but adding:
- Layered depth via subtle gradients and micro-shadows
- Better typographic hierarchy with size contrast
- Breathing room through improved spacing
- Visual rhythm with staggered layouts and asymmetry
- Polished micro-interactions
- A cohesive header system across all pages

## Files to Change

### 1. `src/index.css` — Design Token Refresh
- Soften the base: `--radius: 0.375rem` (subtle rounding, not flat boxes)
- Add new tokens: `--surface`, `--surface-raised`, `--glow-primary`
- Refine shadow system: add colored shadow variants per category
- Add a subtle body texture/grain background

### 2. `src/components/Layout/MobileNav.tsx` — Premium Bottom Nav
- Reduce to 5 tabs max (merge Atlas into Library, remove separate Settings tab — add settings gear to headers instead)
- Tabs: Home, Train, Library, Atlas, AI
- Active tab: filled icon + category color dot indicator (not background fill)
- Larger touch targets, better icon sizing
- Frosted glass backdrop effect (`backdrop-blur-xl bg-background/80`)

### 3. `src/pages/Dashboard.tsx` — Hero Dashboard
- **Hero greeting section**: Large display name with time-of-day greeting, subtle gradient accent
- **Stats row**: Redesign as horizontal scroll cards with icon + large number + sparkline placeholder, each with category border-left accent
- **Calendar**: Keep but add subtle card elevation
- **Categories grid**: Redesign `MasterSkillList` cards with icon backgrounds, better hover states, and a "featured" larger card for the most recent category
- **Quick actions**: Redesign as full-width stacked action cards with left icon, description, and right arrow

### 4. `src/components/Dashboard/MasterSkillList.tsx` — Category Cards V2
- Larger cards with gradient backgrounds (subtle)
- Icon in a colored circle, not a colored square
- Better hover: scale + shadow lift
- Exercise count badge per category

### 5. `src/components/Calendar/CalendarView.tsx` — Calendar Polish
- Softer borders, better day cell styling
- Active day: filled circle background instead of ring
- Workout indicator: small colored dot below number, not a full-width bar

### 6. `src/components/Exercise/ExerciseCard.tsx` — Premium Exercise Cards
- Add subtle hover elevation (translateY + shadow increase)
- Better thumbnail overlay: gradient from bottom for text readability
- Category pill: use filled badge with white text instead of bordered
- Muscle tags: pill-shaped with subtle background
- "Add to Workout" button: primary color fill, not outline

### 7. `src/pages/Library.tsx` — Library Page Polish
- Sticky header with frosted glass effect
- Search bar: larger, with subtle shadow focus state
- Category tabs: pill-shaped with filled active state
- Grid: increase gap, add staggered animation on scroll

### 8. `src/pages/Train.tsx` — Training Page Overhaul
- Day selector: horizontal scroll with card-style buttons, active day gets a thick bottom border + colored background
- Current day info: hero card with large title, emphasis subtitle
- Exercise list: cards with left color accent, thumbnail, better expand animation
- Set tracker area: cleaner layout with better contrast

### 9. `src/pages/Index.tsx` — Landing Page Premium
- Hero section: add a subtle radial gradient glow behind the logo
- Feature cards: add glassmorphism effect
- Path explorer: better visual connectors between steps
- CTA button: add pulse/glow animation

### 10. `src/pages/Auth.tsx` — Auth Page Polish
- Left panel: add animated gradient or pattern
- Form: softer inputs with better focus states
- Submit button: add loading spinner, gradient background

### 11. `src/pages/Anatomy.tsx` — Muscle Atlas Polish
- Better panel layout on mobile
- Muscle pills: rounded, larger touch targets
- Detail panel: card elevation, better section dividers

### 12. `src/pages/Settings.tsx` — Settings Cleanup
- Section cards: softer borders, better spacing
- Form elements: consistent styling

### 13. `src/components/Exercise/ExerciseDetailModal.tsx` — Modal Redesign
- Better header with category color accent
- Cleaner section separation
- Progression ladder: better visual timeline

### 14. `src/components/LoadingScreen.tsx` — Loading Screen
- Add branded animation (pulsing logo with category colors cycling)

## Implementation Order
1. CSS tokens and base styles (foundation)
2. MobileNav (most visible, sets the tone)
3. Dashboard + MasterSkillList + CalendarView (home screen impact)
4. ExerciseCard + Library (content browsing)
5. Train page (core workflow)
6. Remaining pages (Index, Auth, Anatomy, Settings)
7. Modals and loading screen

## Scope
~14 files modified across 7 implementation steps. Each step produces a visually complete improvement. No backend/database changes needed — this is purely frontend styling and component restructuring.

