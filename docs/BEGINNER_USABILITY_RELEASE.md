# Beginner practice and navigation repair

7 November 2026. Updates the existing POWER app and both existing Vercel aliases.

## Problems found and corrected

- Primary entry points led to three different builders. **Home, Movements, Train** are now the three main sections. Legacy `/build` and `/train` links enter the guided training flow while preserving the selected goal and node. The manual builder and its coach remain available from Train.
- Settings was treated as account-only and redirected guests. A shared settings drawer now works on Home, Movements, Train, the custom builder and the active session. Equipment, level and appearance changes preserve the current page and draft. Account administration retains its authenticated route.
- Installed app launches could reopen a deep page. The manifest starts at Home and a standalone cold-document launch returns to Home. Ordinary browser deep links and in-app navigation retain their destinations. Existing installation identity and saved training data are preserved. An Android home-screen bookmark that opens a normal browser remains controlled by its saved URL.
- The library used an older thumbnail component. All movement rows now use the same source selection and fallback policy. 114 eligible public provider previews are bundled on POWER's own origin, with remote fallback and source/hash metadata. Eight existing movement photographs also have local fallback paths. Broken 120×90 provider placeholders are excluded.
- 87 bundled exercise records originally had no eligible preview source. Coverage is now 221 of 264 records through existing clips, five newly sourced yoga clips, movement photos and clearly labeled related ring/family coaching. Some records still have no suitable preview; a named missing-image card stays explicit. This is image-source coverage, not human verification of every movement or video playback.
- Movement pages duplicated descriptions and dose panels, showed inconsistent legacy level names, and exposed support graphs and logging controls before basic instructions. Shared movement details now group level, equipment, plain-language cues, starting dose and technique checkpoints. Tutorials, progression options and manual logs open on request.
- Home used a legacy CSS class that added unwanted spacing and enlarged the hero. The compact home uses a distinct class and the beginner stylesheet loads after legacy themes.
- Legacy CSS could override a hidden soundtrack shelf. Its hidden state now stays hidden until requested.
- Active sessions placed a large video before set logging. They now show a thumbnail, movement name and level, followed by accessible set controls; tutorials and instructions expand inline.

## Preparation and sources

The guided setup offers yoga plus mobility or movement preparation. Yoga mode includes Cat-Cow without removing the selected skill's preparation. Every drill still passes working-level, equipment and inversion-entry checks. Levels and logged results are never silently promoted or fabricated.

Public sources: [GMB training preparation](https://gmb.io/prepare/), [ring training overview](https://gmb.io/rings/), [three ring workout levels](https://www.youtube.com/watch?v=fsl08Copg-U). Yoga source records in `src/data/movementMedia.ts` link to the creator's Chair, Dolphin, Camel, Warrior II and Half Moon instruction. New plain-language notes are product coaching defaults, not clinical screening or universal performance thresholds.

## Verification and limits

TypeScript, production build, existing graph/builder/readiness checks, 2,880 focus-plan cases, warm-up/launch checks, and integrity checks for all bundled preview hashes. Browser QA covers Home, movement filtering and details, settings, ring-session generation, active-session entry and narrow/Fold layouts.

An actual Android standalone installation and every third-party video's playback were not tested in this environment. A preview image does not prove that an external video is playable or correctly matched in every detail. The no-login workout and progress data remain saved on the current device and address.
