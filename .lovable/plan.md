

# Mobile Nav + Gym-Flow UX Redesign

## 1. Add Settings to Mobile Nav
Currently 5 tabs: Home, Train, Library, Plan, AI. Settings is only accessible via the Dashboard header icon.

**Change**: Add Settings as a 6th tab with a `Settings` (gear) icon. Reorder tabs to match the gym workflow:

```text
 Home  |  Train  |  Library  |  Plan  |  AI  |  Settings
  🏠      🔥        📚        📅      🧠      ⚙️
```

File: `MobileNav.tsx` — add `{ path: '/settings', icon: Settings, label: 'Settings', color: 'bg-muted-foreground' }` to the tabs array.

## 2. Gym-Flow UX Atomic Redesign

The core insight: when you're at the gym, the flow is **pick exercise → see how to do it → log sets**. The current UI requires too many taps.

### Train Page (primary gym screen)
- Add a prominent **"+ Add Exercise"** button that opens the `ExercisePickerModal` directly from the Train page
- Each exercise row gets a **quick-tap expand** showing sets/reps target and a mini "Log Set" inline button
- Exercise rows show YouTube thumbnail (tiny) so you can visually identify the movement
- Tapping the exercise name still opens the full detail modal with video

### Library Page
- Add a **"Start Training"** floating action button (FAB) on mobile that navigates to `/train` — so after browsing exercises you can jump straight to training

### Exercise Detail Modal
- Add a **"Add to Today's Workout"** button at the bottom of the modal so you can pick from anywhere (Library, AI, Dashboard) and add it to your active training session

### MobileNav
- Slightly increase touch target size for gym use (sweaty fingers): icons from `w-4 h-4` → `w-5 h-5`, nav height from `h-14` → `h-16`
- Active tab gets a stronger visual indicator (filled background pill instead of just top border)

## Files Changed
1. **`src/components/Layout/MobileNav.tsx`** — Add Settings tab, increase touch targets, active pill style
2. **`src/pages/Train.tsx`** — Add ExercisePickerModal integration, inline exercise thumbnails, quick-log affordance
3. **`src/pages/Library.tsx`** — Add mobile FAB "Start Training" button
4. **`src/App.tsx`** — Increase bottom padding to accommodate taller nav (`pb-[7rem]`)

