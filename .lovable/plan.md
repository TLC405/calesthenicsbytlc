# Mega Data Import + Exercise Enrichment + Architecture Upgrade

Plus redesigned architect to your upgraded chice. Be super creative 

The user has provided a comprehensive exercise data dump from their other repo (CONTROL by TLC) with rich anatomy data (tendons, recovery times, stabilizers, form cues), motor-learning principles, non-negotiables coaching cues, integrity blocks (mobility/yoga routines), skill progression trees, and a 4-day stacked training cycle. The goal is to merge all of this into the current app.

## Current State

- **99 exercises** across 8 categories (Push 18, Pull 12, Legs 12, Core 11, Skills 14, Yoga 15, Mobility 7, Flexibility 10)
- **14 chain groups** with progression ordering
- **44 progressions** in the progressions table
- Music system, loading screen, settings all functional
- Exercise detail modal shows progression path strip, video, muscles, equipment, cues

## What Needs to Happen

### Phase 1: Database Schema Enrichment

Add new columns to `exercises` table for the rich anatomy data from the other repo:

- `stabilizer_muscles` (text[]) — e.g. "Deep Neck Flexors, Wrist Extensors"
- `tendons_involved` (text[]) — e.g. "Supraspinatus Tendon, Biceps Long Head"
- `recovery_muscle` (text) — e.g. "24-36h"
- `recovery_tendon` (text) — e.g. "36-48h"  
- `recovery_nervous` (text) — e.g. "18-24h"
- `sets_reps` (text) — e.g. "3×5", "4×12", "5×20s"
- `description` (text) — short description of the exercise

Create new tables:

- `learning_principles` — 8 motor-learning research principles (distributed practice, external focus, variability, etc.)
- `non_negotiables` — 4 global coaching cues (Ribs Down, Glutes 30%, Shoulders Tall, Active Legs)
- `integrity_blocks` — 5 mobility/yoga routines (wrist prep, thoracic, hip opening, pancake, ankle)
- `training_days` — the 4-day stacked cycle definition (Day A-E with labels and emphasis)

All new tables get public SELECT RLS policies (read-only for everyone, admin-managed).

### Phase 2: Data Population Migration

A single large migration that:

1. Updates existing exercises with anatomy enrichment data (stabilizers, tendons, recovery times) for all exercises that match the provided data
2. Inserts missing exercises from the dump (swimming, dynamic showstoppers, etc.)
3. Populates the `learning_principles` table with all 8 principles
4. Populates `non_negotiables` with the 4 coaching cues
5. Populates `integrity_blocks` with the 5 routines
6. Populates `training_days` with the 4+1 day cycle

### Phase 3: Enhanced Exercise Detail Modal

Upgrade `ExerciseDetailModal.tsx` to show the new data:

- **Recovery Times section**: Show muscle/tendon/nervous recovery as color-coded pills
- **Tendons & Stabilizers section**: New collapsible section showing tendons involved and stabilizer muscles
- **Recommended Sets/Reps**: Display the `sets_reps` field prominently
- **Non-Negotiables**: Show relevant coaching cues based on the exercise category (e.g. "Ribs Down" for planche exercises)
- **Learning Tips**: Show 1-2 relevant motor-learning principles as expandable cards

### Phase 4: Training View (New Page)

Create a new **Train** page (`/train`) that implements the 4-day stacked cycle:

- Auto-rotating day selection (A/B/C/D/E based on last workout)
- Each day shows its exercise blocks with the exercises from that day's focus
- Each exercise row is expandable with quick-log capability
- Non-negotiables bar at the top of every training session
- Link to integrity blocks relevant to the day

### Phase 5: Skill Tree / Progression Explorer

Create a new **Progressions** page or section (`/progressions` or integrated into Library):

- Visual skill trees for the 6 full progression paths (Planche, Pull-up, Handstand, Core, Front Lever, Legs)
- Each node shows name, level, sets/reps, hold time, weeks estimate, prerequisites
- Clickable nodes open exercise detail
- Current user progress indicated (if logged in)

### Phase 6: Landing Page — Path Explorer Enhancement

Update `Index.tsx` to use real progression data instead of hardcoded arrays. Add:

- Non-Negotiables preview section
- Training cycle preview (4-day rotation visual)

## Files to Create/Modify


| File                                              | Action                                                             |
| ------------------------------------------------- | ------------------------------------------------------------------ |
| Migration SQL                                     | Add columns to exercises + create 4 new tables + populate data     |
| `src/components/Exercise/ExerciseDetailModal.tsx` | Add recovery, tendons, stabilizers, non-negotiables, learning tips |
| `src/components/Exercise/RecoveryIndicator.tsx`   | New: recovery time pills component                                 |
| `src/components/Training/TrainingView.tsx`        | New: 4-day cycle training page                                     |
| `src/components/Training/NonNegotiablesBar.tsx`   | New: coaching cues sticky bar                                      |
| `src/components/Training/IntegrityBlock.tsx`      | New: mobility/yoga routine component                               |
| `src/components/Progression/SkillTreeView.tsx`    | New: visual progression tree                                       |
| `src/pages/Train.tsx`                             | New: training page                                                 |
| `src/App.tsx`                                     | Add /train route                                                   |
| `src/components/Layout/MobileNav.tsx`             | Update nav to include Train tab                                    |
| `src/pages/Index.tsx`                             | Enhanced previews with real data                                   |


## Technical Notes

- The `exercises` table schema changes are additive (all nullable columns), so existing data is unaffected
- New tables use simple structures with public SELECT policies
- The training cycle is stored in DB but could also be client-side constants — DB gives flexibility for coach customization later
- Motor-learning principles are displayed contextually per exercise, not as a separate section