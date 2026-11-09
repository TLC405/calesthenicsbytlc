# POWER 2026 — Research-Led Premium UX and Progression Upgrade

**Status:** Design and engineering specification. GitHub proposal is not an assertion that the live published app has changed.

## Product position

POWER is a clean, adult, premium calisthenics workout builder—not a game or an analytics laboratory.

Core path: **Home → Build → Pick template and difficulty → Review exercises → Train → Save.**

No XP, achievements, badges, streak pressure, leaderboards, quantified mastery scores, mandatory equipment questionnaires, joint-angle measurements, time limits, or fabricated exercise/video data. Use practical difficulty descriptions rather than pretending subjective skill levels are clinically validated.

## Competitor findings (November 2026)

| Product | Adopt its interaction principle | Avoid |
| --- | --- | --- |
| [Calistree](https://calistree.com/features/) | Linked easier/harder variants, searchable movement library, adaptive progressions | Crowded visual skill maps, game-like levels, excessive scores |
| [Fitloop](https://fitloop.app/) | In-workout playable demonstrations, fast variation swaps, one-tap logging | Unnecessary game-unlock visual styling |
| [Hevy](https://help.hevyapp.com/hc/en-us/articles/33106320824727-Everything-You-Need-to-Know-About-the-Hevy-App-2026-Features-Guide) | Reusable routine templates, previous performance, simple set editing | Social gamification |
| [Calisteniapp](https://help.calisteniapp.com/en/docs/explore) | Organized programs, adaptive routines and user-created sessions | Challenge-first navigation |
| [Thenics](https://apps.apple.com/us/app/thenics/id1509531048) | Skill-specific movement ladders and technique explanation | Disconnected skill silos |
| [Movement Athlete](https://play.google.com/store/apps/details?id=com.themovementathlete.app) | Starting-level assessment and adaptable exercise selection | Mandatory long onboarding |

The founder's [Calistree 2026 comparative review](https://calistree.com/blog/best-calisthenics-apps-2026/) is a first-party source with disclosed bias; use original app documentation for claims about implemented features.

Google's [Material 3 Expressive research](https://design.google/library/expressive-material-design-google-research) supports clear hierarchy, purposeful use of color, and motion that improves usability. POWER should implement calmer execution than the more playful expressive examples. [WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) supports sufficiently sized and spaced controls; prefer 44–48px functional hit areas for one-hand gym use. Samsung's [Galaxy Z Fold5 specifications](https://news.samsung.com/global/samsung-galaxy-z-flip5-and-galaxy-z-fold5-delivering-flexibility-and-versatility-without-compromise) require separate cover and unfolded layout testing.

## Visual design — distinctive but not distracting

Signature look: matte near-black, layered graphite, restrained champagne-gold accents, real movement photography, subtle physical-material depth, generous whitespace, strong but quiet typography, finely controlled corner radii and borders. No neon, huge decorative charts, excessive gradients, holographic controls, or generic gaming dashboards.

Hero typography may use one editorial italic accent; the rest should remain legible modern sans-serif. Avoid tiny 7px or 8px labels. Preserve reduced-motion settings.

Mobile navigation: Home, Exercises, Build, You. The optional coach is accessible inside Build, not a primary navigation distraction. Four large destinations work better than five cramped tabs on the Fold5 cover.

## Screen and flow specification

### Home
One primary **Build Workout** button, one **Browse Exercises** alternative, concise goal shortcuts, and up to three real recent workouts. No XP/streak widgets. The home should fit a phone without a dense dashboard.

### Exercise library
Search first, real category chips, one difficulty selector. Compact list rows containing a matching exercise thumbnail, exercise name, category/difficulty and an add control. Tap thumbnail/row directly to open the exact demonstration and details; no TV icon prerequisite.

An Exercises / Progressions switch reveals each skill's easier and harder variations. Use clear text lists, not zoomable, connection-heavy diagrams. Render a manageable initial number of rows and provide Show More.

### Exercise detail
Name, difficulty, one authoritative image/video, brief form cues, adjacent easier/current/harder options, Add to Workout. Never imply a video matches a specific exercise if no content verification has been performed.

### Templates
User picks **focus and difficulty only**. Available intent: Push, Pull, Legs, Full Body, Planche, Handstand, Grip, Rings, Human Flag, Levers, Calves/Tibialis, Mobility. Templates should use existing canonical exercises, not randomly selected drills or synthetic content. The initial code branch selects real catalog records; expert-curated program ordering is a separate content task.

### Builder
Compact exercise rows with picture, name, difficulty and set count; individual set controls start collapsed. Expanded controls permit reps or hold-seconds, optional added weight, and editing. No compulsory equipment selector or timers. Save the routine to actual workout history.

### Tutorials
For every future approved tutorial, store exact exercise variant, stage, creator, canonical URL, rights/embedding policy, verified thumbnail, duration, instructional cues, last checked date and an alternative link. Candidate teachers to evaluate include FitnessFAQs, Calisthenicmovement, GMB Fitness, Handstand Factory, plus specialists for rings, grip and flag. Their public work does not establish commercial third-party licensing permission.

[YouTube developer policies](https://developers.google.com/youtube/terms/developer-policies/) apply to embedded YouTube content. A fully custom offline TLC TV player requires original or properly licensed video; do not promise to strip platform branding or cache creators' videos without permission.

## Calisthenics content architecture

Exercises must be **canonical and reusable** across many goals and categories. The same planche lean belongs to Planche, Straight-Arm Strength, Wrist Load Preparation and Scapular Control; ring false-grip hangs belong to Grip, Rings and Muscle-Up; human flag preparation overlaps Pull, Push, Shoulder Control and Lateral Core. Do not clone rows simply to make them appear in multiple categories.

Future schema additions: exercise-category join, skill-goal join, directed progression edges, stage-specific video mappings, coach profiles and content review status. Preserve original exercise IDs and existing workout data.

Cover these paths with explicit regressions and advanced variants: all grip types (support, crush, pinch, finger, wrist, extensors, false grip, towel, unilateral), full planche and other straight-arm skills, human flag, handstands and presses, front/back lever, rings and iron cross preparation, pull-up and muscle-up, push, core compression, lower-body weighted and unilateral work, calves/tibialis, mobility/flexibility, dynamic flow and conditioning.

Power should use meaningful user-facing inputs (reps, hold seconds, external resistance, user-reported comfort where appropriate) and science-backed progressive overload principles without displaying pseudo-precise scores. See [ACSM resistance training position stand](https://pubmed.ncbi.nlm.nih.gov/41843416/). Do not state arbitrary holds or progression cutoffs as validated norms.

## Engineering strategy

Existing repository: React/TypeScript/Vite with Supabase and an exercise library, workout builder, skill paths and PWA tooling. **Upgrade rather than rewrite first.** Preserve authentication, workout history, app installation and deployed theme support. Rebuild only if a verified technical audit identifies a platform-level blocker.

This GitHub branch delivers UX structure first. It does **not** claim to deliver the complete many-to-many skill graph, a freshly audited exercise library, licensed creator video collection, or verified deployment.

Next phases:
1. Run CI, lint, build, and real-device Fold5 cover/open UX test on the exact version deployed.
2. Audit and deduplicate all exercise/video records, especially thumbnail-to-movement matches.
3. Expand the database into many-to-many category/skill links and controlled progression graphs.
4. Review progression safety with qualified strength/gymnastics coaching, particularly cross, tendons, fingers and straight-arm skills.
5. Add licensed stage-specific coaches and tutorial content, plus dead-link testing.
6. Optimize offline-ready navigation, image stability, resume-and-save behavior, accessibility and PWA updates.

## Release acceptance tests

- Real exercises only. No randomly fabricated entries or AI placeholder IDs.
- Build → template → difficulty opens a workout with existing library items.
- Library category, search and difficulty filters match catalog data.
- Exercise thumbnails and details are accessible from each row; unverified videos must not masquerade as validated.
- Users can switch easier/current/harder variants.
- Reps and hold seconds are independently loggable; no mandatory workout duration.
- Home and builder are free of visible game scoring, XP and joint-angle UI.
- Narrow Fold5 cover and unfolded layouts show no overlap or horizontal scrolling; buttons remain reachable above navigation.
- Rest of app still builds, works with guest/auth permissions, persists workouts, respects reduced motion and passes tests.

## Verification limits

A candidate POWER repository was inspected via connected GitHub, but the live ChatGPT-sites deployment has not been mapped to that repo. The repository cannot be cloned into the local build runner in this session, so **lint, TypeScript compilation, browser QA and media QA are not verified**. Treat the pull request as a reviewable implementation proposal and perform CI/device tests before merge.
