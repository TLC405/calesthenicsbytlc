# POWER research integration — delivery ledger

This tracks the supplied **Comprehensive Calisthenics Skill Tree Architecture for POWER** against the actual app. A roadmap item is not complete merely because a page or video URL exists.

## Existing experience retained

- Same Vercel project and both existing public aliases.
- The original 233-entry exercise catalog, including restored legacy entries.
- Black-and-gold default (the later user choice supersedes the earlier cobalt concept); other gym themes remain selectable.
- Original illustrated TLC athlete; no claim that it depicts the owner's verified likeness.
- Visible, in-page official SNAP! soundtrack player; playback requires a permitted browser gesture.
- Existing workout builder, member data, admin role checks and guest records remain in place.

## Implemented in this release

| Research requirement | Implementation and actual boundary |
|---|---|
| Shared skill graph | Backend-neutral typed edge/attempt/profile models, cross-studio prerequisites, supports, alternatives and cycle/reference checks. |
| Five priority studios | Planche, Straddle/Press, Handstand, Rings, Vertical Press/HSPU; additional Ring Muscle-Up studio. Uses actual existing catalog movements, so not every proposed drill has a dedicated node yet. |
| Hierarchy separate from prescription | Graph relationships in `skillGraph.ts`; workout selection in `skillWorkoutBuilder.ts`; dose/rest are adjustable product defaults. |
| Explainable next practice | Identifies the next unassessed/unproven movement or prerequisite; no fabricated user readiness percentage. |
| Repeatable progress | Explicit user quality/result logs; Beta-style consistency estimate; repeated quality exposures across multiple sessions required for consistent status. |
| Capability checks | Equipment, current comfort and safe inverted entry/exit checked before studio-guided training and skill-workout launch. Logs are self-reported, not coach certification. |
| Multi-dimensional logging | Reps/seconds, lean distance, band assistance, negative time, foot clearance, assistance type, range, quality and discomfort note. |
| Regressions | Graph-mapped easier movement; active-session regression preserves completed sets and moves remaining work to the mapped variation. No unrelated exercise is substituted when no regression is mapped. |
| Workout integration | Studio-selected movement is carried into the actual builder and active session. Explicit technique ratings contribute to skill progress; unrated sets do not create mastery evidence. |
| Rest defaults | Skill-specific defaults and manual overrides; technique stop rule remains visible. |
| Fold layout | Under 768px: vertical path and bottom-sheet movement detail. Wider layouts: path/detail panes; active video and logging remain alongside each other. Physical Fold hardware testing remains outstanding. |
| Video integrity ledger | Owner-only review queue with source, timestamp, reviewer, six verification statuses and explicit movement/coaching/playback confirmations. Reviews are stored on that device only; they do not silently certify the global catalog. |
| Inline music | Intro keeps its existing embedded area; training routes now provide a stable visible soundtrack shelf. API loading failures show a retry explanation. |
| Integrity tests | Graph references/cycles, consistency thresholds, idempotent logging, regressions, equipment/safe-exit checks and every goal/level/duration recipe. |

## Not represented as complete

- Human verification of all video movements, coaching quality, regional/embed playback and unavailable links.
- Full twelve-studio taxonomy and all proposed planche, frogger, negative and HSPU variation records.
- Server-synced skill progress, equipment profiles and media ledger. Current persistence is explicitly device-local and account-separated.
- Coach-editable weighted readiness/ranking engine, weak-link diagnostics and user preference weighting. The implemented recommendation is transparent prerequisite-based selection.
- Global coach graph editor and public-media verification publication workflow.
- Side/front camera technique capture or automated form scoring.
- Medical diagnosis, tendon-health scores, or claims that the heuristic thresholds are physiological standards.
- Migration verification of private workout history from the former app address.

## Primary coaching references

- https://gmb.io/planche/
- https://gmb.io/handstand/
- https://gmb.io/press-handstand/
- https://gmb.io/muscle-up/

The supplied research remains the broader specification. Pending items above should remain visibly pending until their actual behavior and content are verified.
