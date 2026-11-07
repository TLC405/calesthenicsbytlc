# Movement learning update

Researched 7 November 2026 using Calistree's public product and exercise pages. POWER remains an independent app; no Calistree artwork, exercise footage or proprietary algorithm was copied.

## Product decisions

- [Public Pull-Up tree](https://calistree.app/skills_tree/pullup-e085): separates regressions, progressions and variations. POWER now exposes **Easier option**, **Next options** and **Related variations** separately. Difficulty links come from existing explicit regression rules, while equipment/grip alternatives use a small curated variation list. Adjacent supporting drills do not become mandatory prerequisites.
- [Exercise library](https://calistree.com/features/exercise-library/): puts visual demonstrations and movement information together. POWER now uses a shared thumbnail beside movement names in the focus session, skill paths, builder entries, exercise pickers and coach suggestions. It reuses eligible existing video previews and exercise photos. Related family tutorials carry a visible **Guide** label; failed images advance through eligible sources, then show a named **No image** tile. Images retain their aspect ratio.
- [Automatic progression](https://calistree.com/features/automatic-progression/): describes gradual target changes informed by training logs. POWER retains recent targets, reduces a target after a difficult latest attempt, and suggests one extra rep or two extra seconds only after three controlled comparable logs across at least two sessions and days. Matching metric, assistance, ROM and lean are required. Lighter practice does not increase targets. These are configurable product defaults, not universal training thresholds or a reproduction of Calistree's algorithm.
- [Skill trees](https://calistree.com/features/skill-trees/): makes easier and harder movements discoverable. POWER keeps working-level, equipment, capability and safe-entry/exit checks when selecting a replacement. Future movements can still be inspected in the studio without enabling them for training.

## Media and evidence limits

Existing links are not all human-verified movement demonstrations. **Video** means an eligible linked video preview, not coach certification. **Guide** identifies related instruction that can include other variations. Known blocked or mismatched media stays excluded. Missing media is not replaced with unrelated stock fitness photography or generated anatomy.

The Child's Pose family preview references [Yoga With Adriene's Extended Child's Pose](https://yogawithadriene.com/extended-childs-pose/). Paul Twyman and GMB family sources remain attributed in the app's existing source records.

History panels show actual logged attempts and controlled same-metric results. They do not invent personal records or infer readiness from absent logs. This update does not add Calistree's XP system, downloadable video library, health integrations, recovery model or multiweek programming.

## Verification

TypeScript, production build, all-catalog media/relationship checks, regression/readiness policy checks, focus-plan cases and existing graph/builder checks. Browser checks cover thumbnail loading, labeled coaching sources, replacement gating, and layouts at narrow phone and unfolded-screen widths.
