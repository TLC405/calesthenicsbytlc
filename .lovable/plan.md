
# TLC's Workout App Overhaul Plan

## Issues Identified

### Critical Bugs
1. **Auth page logo broken** - Still importing from `@/assets/logo.png` causing download issues on click
2. **"Ab Wheel Rollout" exercise in database** - User requested removal

### Gamification Removal
3. **XP/Streak/Level system throughout app** - Currently displayed in:
   - Dashboard header (XPBadge component)
   - QuickStats component (Streak, XP, Level, This Week stats)
   - Profiles table stores `total_xp`, `level`, `streak_days`

### UI/Navigation Overhaul
4. **Homepage redesign needed** - Replace gamification stats with:
   - Full training calendar (already exists in CalendarView)
   - Master skill list navigation (categories: Push, Pull, Legs, Core, Skills, Mobility)

### Video Issues
5. **4 exercises missing videos**:
   - Advanced Tuck Planche
   - Planche Lean
   - Straddle Planche
   - Tuck Planche

6. **NotFound page uses outdated styling** - Gray background instead of premium design

---

## Implementation Plan

### Phase 1: Fix Critical Bugs

**1.1 Fix Auth Page Logo**
- Remove import `logo from '@/assets/logo.png'`
- Replace with public path `/lovable-uploads/7a4a3a95-2e51-4067-b126-c096a96fc31c.png`

**1.2 Remove Ab Wheel Rollout**
- Delete exercise from database: `DELETE FROM exercises WHERE name = 'Ab Wheel Rollout'`
- Also remove "Ab Wheel" from equipment options in AddExerciseModal

---

### Phase 2: Remove Gamification

**2.1 Update Dashboard**
- Remove XPBadge from header
- Remove motivational quotes section
- Remove QuickStats component entirely

**2.2 Replace Dashboard with Calendar + Skills**
New dashboard layout:
```text
+----------------------------------+
|  Header (simplified)             |
|  TLC's Hybrid | Settings/Logout  |
+----------------------------------+
|                                  |
|  Full Month Calendar             |
|  (using CalendarView component)  |
|                                  |
+----------------------------------+
|  Master Skill List               |
|  +------+ +------+ +------+      |
|  | Push | | Pull | | Legs |      |
|  +------+ +------+ +------+      |
|  +------+ +------+ +--------+    |
|  | Core | |Skills| |Mobility|    |
|  +------+ +------+ +--------+    |
+----------------------------------+
|  Quick Actions                   |
|  [Exercise Library] [AI Coach]   |
+----------------------------------+
```

**2.3 Update Components**
- Modify `WeeklyCalendar.tsx` to support full month view OR replace with `CalendarView`
- Update `TodayFocus.tsx` to remove gamification language

**2.4 Files to Potentially Remove**
- `src/components/Gamification/XPBadge.tsx` (if no longer used anywhere)
- `src/components/Dashboard/QuickStats.tsx` (gamification focused)

---

### Phase 3: Add Missing Video URLs

Update database with verified tutorial videos:
- **Advanced Tuck Planche**: Find appropriate YouTube tutorial
- **Planche Lean**: Find appropriate YouTube tutorial
- **Straddle Planche**: Find appropriate YouTube tutorial
- **Tuck Planche**: Find appropriate YouTube tutorial

---

### Phase 4: Polish & Consistency

**4.1 Update NotFound Page**
- Apply premium design system (dark background, premium-card styling)
- Add TLC branding

**4.2 Video Verification**
- Manual review required to verify all 43 exercise videos match their titles
- Create a verification checklist or add a "video_verified" flag system

---

## Technical Details

### Database Changes
```sql
-- Remove Ab Wheel Rollout
DELETE FROM exercises WHERE name = 'Ab Wheel Rollout';

-- Add videos to planche progressions (example URLs - need verification)
UPDATE exercises SET youtube_url = 'https://www.youtube.com/watch?v=...' 
WHERE name = 'Tuck Planche';

UPDATE exercises SET youtube_url = 'https://www.youtube.com/watch?v=...' 
WHERE name = 'Advanced Tuck Planche';

UPDATE exercises SET youtube_url = 'https://www.youtube.com/watch?v=...' 
WHERE name = 'Straddle Planche';

UPDATE exercises SET youtube_url = 'https://www.youtube.com/watch?v=...' 
WHERE name = 'Planche Lean';
```

### Files to Modify
| File | Changes |
|------|---------|
| `src/pages/Auth.tsx` | Fix logo import |
| `src/pages/Dashboard.tsx` | Remove gamification, add calendar + skill list |
| `src/components/Dashboard/QuickStats.tsx` | Remove or repurpose |
| `src/components/Dashboard/WeeklyCalendar.tsx` | Expand to full month |
| `src/components/Exercise/AddExerciseModal.tsx` | Remove "Ab Wheel" equipment |
| `src/pages/NotFound.tsx` | Apply premium styling |

### New Component
**MasterSkillList** - Grid of category cards linking to filtered Library view

---

## Summary
This overhaul transforms the app from a gamified workout tracker to a clean, professional training calendar and skill library. The focus shifts from XP/streaks to practical training planning and skill progression.

**Estimated Scope:**
- 6-8 files to modify
- 1 new component (MasterSkillList)
- 1 database migration (remove Ab Wheel, add videos)
- 1 potential component removal (XPBadge if unused)
