# Complete Video Fix + Homepage + UI Optimization Overhaul

## Part 1: Broken Video Audit Results

I verified every single YouTube URL in the database using YouTube's oembed API. **20 out of 42 exercises have broken/dead video links.** Here is the full breakdown:

### BROKEN Videos (20 exercises) - Need Replacement


| Exercise                | Category | Current Video Status             | Replacement URL     | Source                 |
| ----------------------- | -------- | -------------------------------- | ------------------- | ---------------------- |
| Dragon Flag             | Core     | DEAD (mjCMq2OKzKY)               | watch?v=qNbAyeLVMeY | School of Calisthenics |
| Shrimp Squat            | Legs     | DEAD (5cKDVmrWBgw)               | watch?v=_FBuC-VPbRY | Al Kavadlo             |
| Nordic Curl             | Legs     | DEAD (HUXS3S2xSV4)               | watch?v=dJ8LBl3U85g | Simonster Strength     |
| Deep Squat Hold         | Mobility | DEAD (M7GOMfsj8ig)               | watch?v=zJBLDJMJiDE | GMB Fitness            |
| Pigeon Pose             | Mobility | DEAD (_cU4fjffARI)               | watch?v=0RQVD6viVXo | YouAligned             |
| Worlds Greatest Stretch | Mobility | DEAD (gYVY4EvB8Hc)               | watch?v=-CiWQ2IvY34 | Squat University       |
| Archer Pull-up          | Pull     | DEAD (Ry1N4jI7W8A)               | watch?v=_LGLKUiQH5k | Pullup & Dip           |
| Australian Row          | Pull     | DEAD (PGcTxvw6-JM)               | watch?v=Fl0UMfdEzsE | Zack Henderson         |
| Front Lever Raise       | Pull     | DEAD (cVUoatKZQKM)               | watch?v=-kI16UUefGs | Pullup & Dip           |
| Muscle-up               | Pull     | DEAD (NEeEBIjNBpY)               | watch?v=BbkFT3HlrIg | Vitality               |
| Archer Push-up          | Push     | DEAD (LYJnKdLqnyo)               | watch?v=A0r8ploEnZY | Victory Calisthenics   |
| Pike Push-up            | Push     | FORBIDDEN (sposDXWEB0A)          | watch?v=2avz4xI25vQ | School of Calisthenics |
| Planche Lean            | Push     | DEAD (1i2bl-vT2Tg)               | watch?v=wKV5zVJTYBo | Vitality               |
| Straddle Planche        | Push     | UNAUTHORIZED (yjHcyYvPfg8)       | watch?v=V9LWMkorWoc | Calisthenics Family    |
| Back Lever              | Skills   | DEAD (F-fGyIOB7Nc)               | watch?v=HXaG8mJmSnU | FitnessFAQs            |
| Elbow Lever             | Skills   | DEAD (O-6Y5JTBCTU)               | watch?v=w_XvThlKMrU | Calisthenics Family    |
| Freestanding Handstand  | Skills   | DEAD (DTvkwkqQMgE)               | watch?v=d6_lcWtQDxw | GMB Fitness            |
| Front Lever             | Skills   | DEAD (same as Front Lever Raise) | watch?v=AGhb8V8M758 | FitnessFAQs            |
| Human Flag              | Skills   | DEAD (yJXMYohiS2c)               | watch?v=TF9XhvYh_m8 | Chris Heria            |
| Planche                 | Skills   | DEAD (kv8kCQnqVFQ)               | watch?v=bn-HZm7bpy0 | FitnessFAQs            |


### Title Mismatch Issues (2 exercises)


| Exercise              | Video Title                                         | Issue                                                |
| --------------------- | --------------------------------------------------- | ---------------------------------------------------- |
| Tuck Planche          | "How to Improve Active Pike Compression" (Antranik) | Wrong video - pike compression, not planche tutorial |
| Advanced Tuck Planche | Same video with &t=180                              | Same wrong video                                     |


These will be replaced with proper planche tutorial videos from FitnessFAQs (watch?v=bn-HZm7bpy0).

### WORKING Videos (20 exercises) - Verified correct

Hollow Body Hold, Hanging Leg Raise, L-Sit, Plank, Bodyweight Squat, Bulgarian Split Squat, Calf Raise, Pistol Squat, Bridge Pose, Cat-Cow Stretch, Cobra Pose, Downward Dog, Shoulder Dislocate, Chin-up, Pull-up, Diamond Push-up, Handstand Push-up, Parallel Bar Dip, Pseudo Planche Push-up, Push-up

---

## Part 2: Homepage Redesign

The current homepage is functional but visually flat -- the logo area shows a small dark square, and the layout feels like a template. The redesign will:

- Make the logo larger and more prominent with a glow effect
- Add an animated hero section with staggered text reveals
- Replace static feature chips with interactive, hover-responsive feature cards showing icons and descriptions
- Add a subtle scroll indicator at the bottom
- Improve mobile layout with better spacing and touch targets
- Add a secondary "Learn More" link alongside the main CTA

### Dashboard Cleanup

- Confirm no gamification (XP, streaks, levels) appears anywhere in the header or dashboard
- The current dashboard already has Calendar + Master Skill List -- this is correct
- Improve the visual weight and spacing of the quick action cards

---

## Part 3: UI Optimization for All Devices

### Current Issues Found

1. `--radius: 0rem` makes all components have sharp corners -- this is intentional for the bold design, but some elements need subtle rounding
2. The ExerciseCard thumbnail fallback chain only goes mqdefault -> hqdefault, missing the final fallback to a branded placeholder
3. No bottom navigation on mobile -- users have to use the back button constantly
4. Homepage logo appears as a tiny dark square (barely visible against the dark background)

### Planned Improvements

- Add a mobile-optimized bottom navigation bar for Dashboard, Library, Planner, AI Coach
- Improve ExerciseCard thumbnail fallback to include a styled placeholder with the exercise initial letter when all YouTube thumbnails fail
- Fine-tune responsive breakpoints for the exercise grid (better card sizing on tablets)
- Ensure the homepage logo has proper contrast and visibility

---

## Technical Implementation

### Database Updates (20 broken videos + 2 mismatched)

```sql
-- All 22 exercises updated with verified, working YouTube URLs
UPDATE exercises SET youtube_url = '...', video_verified = true WHERE name = '...';
```

### Files to Modify


| File                                       | Changes                                                                                       |
| ------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `src/pages/Index.tsx`                      | Redesigned homepage with better hero, larger logo, animated sections, mobile-optimized layout |
| `src/pages/Dashboard.tsx`                  | Confirm no gamification, improve spacing and card visual weight                               |
| `src/components/Exercise/ExerciseCard.tsx` | Better thumbnail fallback chain (mqdefault -> hqdefault -> sddefault -> branded placeholder)  |
| `src/components/Layout/MobileNav.tsx`      | NEW: Bottom navigation bar for mobile (Dashboard, Library, Planner, AI)                       |
| `src/App.tsx`                              | Integrate MobileNav into the app layout                                                       |


### New Component

**MobileNav** -- A fixed bottom navigation bar that appears only on mobile (<768px). Shows 4 tabs: Dashboard, Library, Planner, AI Coach. Uses active state highlighting based on current route.

&nbsp;

i dont want any text from youtube on the screen i want our own world class and youtuge is insdie tbscreen bo that is bradined tlcTV. 

### Summary

- Fix all 22 broken/mismatched exercise videos with verified replacements
- Redesign the homepage for world-class first impression
- Add mobile bottom navigation for better device optimization
- Improve thumbnail fallback system so no card ever shows a gray YouTube placeholder