
# I GOT THE POWA — Progression Paths, Category Reorganization, and Music System

This is a large feature set covering 5 major areas. Here's the plan broken into phases:

---

## Phase 1: Database — Category Reorganization and Progression Chains

### New Categories
Currently: Push, Pull, Legs, Core, Skills, Mobility

Change to: **Push, Pull, Legs, Core, Skills, Yoga, Mobility, Flexibility**

- **Yoga**: Move yoga-specific exercises out of Mobility (Downward Dog, Pigeon Pose, Cobra Pose, Bridge Pose, Cat-Cow Stretch) and add new ones (Warrior I, Warrior II, Tree Pose, Child's Pose, Triangle Pose, Chair Pose, etc.)
- **Flexibility**: New category for static stretching and range-of-motion work (Splits progression, Pancake, Pike, Straddle, Shoulder flexibility drills)
- **Mobility**: Keeps dynamic/active mobility drills (Thoracic Extension, Shoulder Dislocate, Wrist Circles, Deep Squat Hold, Jefferson Curl, World's Greatest Stretch, Frog Stretch)

### Progression Chain System
Add a new `progression_order` column to the `exercises` table so exercises within the same category can be linked in a chain (before/after). For example in Push:
```
Wall Push-up (1) -> Incline Push-up (2) -> Pseudo Push-up (3) -> Push-up (4) -> Diamond Push-up (5) -> Archer Push-up (6) -> One Arm Push-up (7)
```

Each category gets a `progression_chain` group identifier so multiple chains can exist per category (e.g., Push has a "push-up chain" and a "dip chain").

**New DB column on exercises:**
- `chain_group` (text, nullable) — groups exercises into a progression chain (e.g., "pushup-chain", "lever-chain")
- `chain_order` (integer, nullable) — position within that chain

This lets us query: "What comes before and after this exercise?"

### Data Population
- Define chain groups and ordering for all major movement patterns across Push, Pull, Legs, Core, Skills
- Add missing standard calisthenics exercises to fill gaps in chains
- Insert 10-15 yoga exercises and 8-10 flexibility exercises

---

## Phase 2: Clickable Progression Path UI

### Exercise Detail Modal Enhancement
When viewing any exercise, show a **horizontal progression path** at the top:

```text
[Wall Push-up] -> [Incline Push-up] -> [>>PUSH-UP<<] -> [Diamond Push-up] -> [Archer Push-up]
```

- Current exercise is highlighted/enlarged
- Each step in the path is **clickable** — tapping navigates to that exercise's detail modal
- Shows difficulty level color-coding per step
- If a user has progress data, show completed steps with a checkmark

### New Component: `ProgressionPathStrip`
- Horizontal scrollable strip
- Fetches all exercises in the same `chain_group`, ordered by `chain_order`
- Each node is a clickable pill/card showing exercise name and difficulty level
- Active exercise is visually distinct (border, scale, color)

---

## Phase 3: Landing Page — Path Explorer and Calendar

### Landing Page Additions (for logged-out users)
Add two new sections to the Index page between the feature grid and CTA:

1. **Path Explorer Preview**: Show 3-4 example progression paths (Push-up chain, Handstand chain, Lever chain, Muscle-up chain) as interactive horizontal strips. Visitors can see the journey from beginner to elite. Non-clickable but visually compelling.

2. **Calendar Preview**: A compact visual showing a sample training week with color-coded session blocks, demonstrating how the planner works.

---

## Phase 4: Global Music Player

### Persistent Music Component
Create a `MusicPlayer` provider/component that:
- Persists across all page navigations (lives in App.tsx, outside Routes)
- Shows a small floating control bar (bottom-right, above MobileNav) with play/pause and volume toggle
- Stores music state in localStorage so preference survives refresh
- Default track: "I Got The Power" via YouTube embed
- On/off toggle visible on every page

### Architecture
- `MusicProvider` context wrapping the app
- Hidden YouTube iframe managed by the provider
- Floating `MusicControl` mini-bar component rendered globally
- State: `isPlaying`, `isMuted`, `currentTrack`

---

## Phase 5: YouTube Music Integration in Settings

### Settings Page — Music Section
Add a new "Music" section to Settings with:
- Toggle for background music on/off
- Input field for a YouTube playlist URL
- "Connect YouTube" button that saves the playlist URL to the user's profile
- Dropdown to select from saved playlists
- Volume slider

### Database Change
Add to `profiles` table:
- `music_playlist_url` (text, nullable) — user's YouTube playlist URL
- `music_enabled` (boolean, default true)

### How it Works
- User pastes a YouTube Music/YouTube playlist URL
- The app extracts the playlist ID and uses it in the YouTube embed iframe
- The MusicProvider reads the user's saved playlist from their profile
- Playback continues across pages via the persistent iframe

**Note**: This won't be a full YouTube Music API integration (that would require OAuth and API keys). Instead, it uses YouTube's embed player with playlist support, which works without authentication and allows users to play their public/unlisted playlists.

---

## Technical Summary

### Database Migrations
1. Add `chain_group` (text) and `chain_order` (integer) columns to `exercises`
2. Add `music_playlist_url` (text) and `music_enabled` (boolean) columns to `profiles`

### Data Inserts
1. Update existing exercises with `chain_group` and `chain_order` values
2. Re-categorize yoga exercises from Mobility to Yoga
3. Insert new Yoga exercises (10-15)
4. Insert new Flexibility exercises (8-10)

### New Files
- `src/providers/MusicProvider.tsx` — global music context
- `src/components/Music/MusicControl.tsx` — floating play/pause bar
- `src/components/Exercise/ProgressionPathStrip.tsx` — clickable chain strip

### Modified Files
- `src/App.tsx` — wrap with MusicProvider, add MusicControl
- `src/pages/Index.tsx` — add path explorer preview and calendar preview
- `src/pages/Settings.tsx` — add Music section
- `src/components/Exercise/ExerciseDetailModal.tsx` — add ProgressionPathStrip
- `src/components/Exercise/CategoryTabs.tsx` — add Yoga, Flexibility colors
- `src/components/Exercise/ExerciseCard.tsx` — add Yoga, Flexibility color styles
- `src/components/Dashboard/MasterSkillList.tsx` — add new categories
- `src/components/Layout/MobileNav.tsx` — no structural changes needed

### Estimated Scope
- 3 new components/providers
- 8-10 modified files
- 2 DB migrations
- ~50 data inserts/updates
