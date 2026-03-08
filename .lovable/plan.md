

# Add Rings Category + Enrich All 99 Exercises with Missing Data

## Current State (from DB audit)
- **99 exercises** across 8 categories — but **ALL 99 are missing** anatomy data (stabilizers, tendons, recovery times, sets/reps, descriptions)
- Ring exercises exist but are buried in Skills (Back Lever, Iron Cross, Maltese, Victorian Cross) with no beginner/intermediate entries
- Missing exercises from the CONTROL repo: Ring Support Hold, Ring Dips, Ring Muscle-Up, Swimming, Kip to Handstand, 360 Pull, Wall Stomach Straddle Handstand, Australian Rows (as distinct from Australian Row), Weighted Pull-ups, etc.
- Flexibility exercises have no progression chains
- CategoryTabs has no "Rings" color

## Plan

### 1. Add "Rings" category + insert missing ring exercises
- Insert: **Ring Support Hold** (beginner), **Ring Rows** (beginner), **Ring Dips** (intermediate), **Ring Push-ups** (intermediate), **Ring Muscle-Up** (advanced), **Skin the Cat** (intermediate), **Ring L-Sit** (advanced)
- Move existing ring-chain exercises (Back Lever, Iron Cross, Maltese, Victorian Cross) from Skills → Rings
- Build a full ring progression chain: Ring Support Hold → Ring Rows → Ring Dips → Ring Push-ups → Skin the Cat → Ring Muscle-Up → Ring L-Sit → Back Lever → Iron Cross → Maltese → Victorian Cross

### 2. Insert missing exercises from CONTROL repo
- **Push**: Pseudo Planche Push-up, Wall Push-up, Incline Push-up
- **Pull**: Weighted Pull-ups, Scapular Pulls, Band-Assisted Pull-up, Front Lever Progressions (tuck/adv tuck/straddle detail)
- **Skills**: Wall Stomach Straddle Handstand, Kip to Handstand, Handstand Walking, One-Arm Handstand Prep
- **Dynamic/Skills**: 360 Pull
- **Swimming/Cardio**: Swimming Laps Freestyle, Vasa Trainer (as new "Cardio" category or under Mobility)

### 3. Enrich ALL exercises with anatomy data
Bulk UPDATE all 99+ exercises with:
- `stabilizer_muscles` — array of stabilizer muscles
- `tendons_involved` — array of tendons
- `recovery_muscle` / `recovery_tendon` / `recovery_nervous` — recovery windows
- `sets_reps` — recommended programming
- `description` — short technical description

This is the biggest piece — every exercise gets real data based on the CONTROL repo dump and standard calisthenics anatomy knowledge.

### 4. Add Flexibility progression chains
- **splits-chain**: Pike Stretch → Standing Pike → Front Split → Middle Split
- **pancake-chain**: Pancake Stretch → Pancake Good Morning → Straddle Stretch
- **shoulder-flex-chain**: Shoulder Bridge → German Hang

### 5. UI updates
- Add "Rings" color to `CategoryTabs.tsx`, `ExerciseCard.tsx`, `MasterSkillList.tsx`, and `SkillTreeView.tsx`
- Add "Rings" icon/nav entry

### Technical Approach
- All data changes via the **insert tool** (UPDATE/INSERT statements, not migrations)
- One UI update pass for the Rings category color across 4 component files
- No schema changes needed — all columns already exist

### Estimated scope
- ~120 UPDATE statements for anatomy enrichment
- ~15 INSERT statements for new exercises
- ~4 UPDATE statements for category moves (ring exercises)
- 4 component files edited for Rings color support

