# POWER — Deep Research integration (November 2026)

**Implementation mandate:** integrate the completed research into the existing React/Vite/Supabase app, preserving real exercise IDs, workout data and original branding. This document is an engineering reference, not a claim that every item is live.

## Product decision

POWER is a serious, premium calisthenics training tool. No XP, streaks, trophies, badges, leaderboards, body-angle scores, artificial mastery scores, imposed time limits or invented exercise/video data.

Adopt Calistree's linked variations; Fitloop's inline videos; Hevy's efficient logging/previous sets; Thenics' focused skill practice. Express those interactions using POWER's restrained black-and-champagne-gold design, not another app's visual identity.

Keep four main mobile destinations (Home, Exercises, Build, You); make lessons discoverable contextually from exercise details. This is more appropriate to the narrow Galaxy Fold cover than the optional five-tab architecture in the research report. Main workflow: Build → goal → difficulty → review/edit exercise list → train or save.

## Evidence and advancement

High-confidence strength training foundations: progressive resistance, specificity, appropriate repeated exposure, adequate loading and recovery. Source: ACSM 2026 https://pubmed.ncbi.nlm.nih.gov/41843416/

Evidence for skill-specific thresholds is uneven. Planche biomechanics/anthropometry: https://pmc.ncbi.nlm.nih.gov/articles/PMC10376746/ . Handstand systematic review: https://pubmed.ncbi.nlm.nih.gov/41473027/ . Still-rings loading: https://pubmed.ncbi.nlm.nih.gov/36976936/ . Street-workout injury patterns: https://pmc.ncbi.nlm.nih.gov/articles/PMC8209839/

Never tell users that a 12-second hold scientifically guarantees readiness for the next progression. "Two successful sessions → consider harder variation" is a conservative **product heuristic**, not a validated clinical norm. Recommendations must be optional, explainable and suppressed when pain/poor technique is reported.

**Data truth:** a scheduled/template set is NOT a completed workout. Only sets explicitly marked completed can inform suggestions. Earlier saved workouts without completion flags must not be retroactively assumed completed.

## Full skill scope and pathways

| Category | Example route from foundation toward elite | Measurement |
|---|---|---|
| Grip: support | dead hang → active hang → towel hang → loaded hang → assisted one-arm → one-arm | seconds, optional load |
| Grip: crush/pinch/finger/wrist/extensors | basic grip implements → controlled stronger implements → advanced support/pinch and unilateral grips | seconds/reps/load by task |
| Planche | lean → frog/crow → tuck → advanced tuck → straddle → full → advanced full variations | controlled hold seconds |
| Straight-arm strength | scapular protraction → lean → pseudo-planche → band/lever preps → advanced straight-arm supports | holds, assistance |
| Handstands | wall alignment → chest-to-wall → heel/toe pulls → freestanding → press/one-arm prep | hold reliability, controlled entries |
| Human flag | side support → vertical pole → tuck → one-leg → straddle → full | holds per side |
| Front lever | active hang → tuck → advanced tuck → one-leg → straddle → full → rows | seconds/reps |
| Back lever | controlled shoulder preparation → skin-the-cat prep → tuck → advanced → straddle/full | seconds |
| Rings | support → turned-out support → rows/dips → L-sit → muscle-up → assisted cross/scale | holds, reps, assistance |
| Pull + muscle-up | rows → assisted pull-up → strict pull-up → weighted/chest-to-bar → transition → muscle-up/one-arm prep | reps/load |
| Push | incline → floor → narrow/decline → dips → archer/advanced push | reps/load |
| Legs | squat → split/lunge → pistol/shrimp → loaded unilateral/strength | reps/load |
| Core + compression | dead bug/hollow → hanging knee raise → leg raise → L-sit → V-sit/dragon-flag routes | seconds/reps |
| Calves/tibialis | bilateral raise → unilateral → loaded/tempo + tibialis | reps/load |
| Mobility/flexibility | controlled range → active/loaded range → skill-specific end range | active control/comfort |
| Flow/balance | entry drills → assisted sequences → full controlled flow | controlled attempts |

The same planche lean should appear in Planche and Straight-arm goals; the same false-grip hang in Rings and Grip and Muscle-up. Do not copy/duplicate canonical exercise records.

## Workout architecture

A template is an editable one-session structure. A program schedules templates and changes them over time.

A true semantic planche template fills skill exposure, easier skill variation, strength accessory, straight-arm conditioning and compression/mobility—not the first six alphabetically sorted exercises. Similar semantic slots apply to grip, handstand, flag, rings, levers and full-body work. Until those movements are reviewed and in the catalog, show an honest limited template; do not invent records.

Recommended progression:
- Consider harder only after at least two distinct sessions with every prescribed set explicitly marked completed and user confirming good technique/comfort.
- Stay with current when completion is partial or evidence insufficient.
- Easier remains one tap away; reduce load and avoid advancement if symptoms are reported.
- No auto-replacement without user acceptance.

## Media and coach network

Candidate educators to evaluate, not licensed partners:
- FitnessFAQs / Daniel Vadnal: https://fitnessfaqs.com/
- Calisthenicmovement / Cali Move: https://www.calimove.com/
- GMB Fitness: https://gmb.io/
- Handstand Factory: https://handstandfactory.com/
- Add specialized reviewers for grip/fingers, flag and extreme rings skills.

TLC TV tiers: short movement demonstration, technique lesson, deep training lesson and progression series. Every video needs canonical exercise ID, stage, coach attribution, provider, accurate media URL/thumbnail, caption/license metadata and content review status. Third-party YouTube must retain supported attribution/controls and be embedded under its policies: https://developers.google.com/youtube/iframe_api_reference . Do not download, rehost, or claim commercial rights without permission. Mark unverified links honestly.

## Future normalized data model (not applied)

Current verified repository shape: exercises with category, chain_group and chain_order; workouts with JSON entries. Preserve all existing IDs and history.

Additive target entities:
- power_goals: stable id, slug, title, learning objective
- power_goal_exercises: goal and canonical exercise many-to-many; role, phase, display order
- power_exercise_relations: from/to canonical exercises, relation kind (progression/regression/prerequisite/transfer/substitute), evidence metadata
- power_coaches: name, specialties, verification and attribution
- power_tutorials: canonical exercise, coach, provider/url, exact stage, review and license
- power_templates and power_template_slots: semantic focus-slot definitions
- normalized user session/set data only after safe migration and testing; do not delete original JSON history.

Backend mismatch: repository Supabase config declares ajcmyrhxmwwjkhlwylyu; the accessible account separately lists "POWER Independent" at cdwckujpvrtdkvjqjfej. These are not confirmed identical. **Do not execute migrations against either as an assumption.**

All public-schema tables require appropriate RLS, explicit ownership policies for user data, private content editing, source trust/rights checks, unique keys and FK integrity.

## User experience and acceptance criteria

Visual: matte black, layered graphite, warm light text, restrained gold, real movement photography, precise hierarchy, rounded cards and practical 44–48px controls. No neon or playful charts.

- Home: one strong Build action, Browse Exercises, concise goal shortcuts, actual recent workouts.
- Library: search first; difficulty/category/goal; clean list of movement thumbnails and honest media quality.
- Exercise: exact tutorial when available, essential form cues, Easier/Current/Harder, previous completion, Add/Swap.
- Builder: templates by focus + difficulty; exercise rows collapsed by default; optional reps or hold seconds, load, checked completion; previous valid session cues. Save safely.
- Learn: contextual tutorials; a standalone curated directory is future work, not a fifth tab requirement.
- Profile: settings, export, history and account.
- Accessibility: WCAG 2.2 AA ambition, semantic labels, captions, color-independent states, focus styles, reduced motion and Fold5 cover/open testing.

Verification gates:
1. Build/TypeScript/lint tests on branch.
2. Workout JSON compatibility with existing data.
3. Exercise ID preservation, guest/auth and RLS.
4. Video rights and exact variation match per exercise.
5. Closed/open Fold5, Android, responsive and low-bandwidth tests.
6. Offline behavior and update/rollback checks.
7. Confirm live app's actual repo and Supabase backend before merging/deploying.

Current status: the UX branch has initial library, templates, navigation and player work, but NOT a fully curated exercise graph, reviewed content library, licensed coach partnership or verified production rollout. Add features incrementally and never silently claim completion.
