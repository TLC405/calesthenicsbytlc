export interface SkillPath {id:string;title:string;short:string;focus:string;equipment:string;cue:string;safety:string;group:string;slugs:readonly string[];}
export const SKILL_PATHS: readonly SkillPath[] = [
  {
    "id": "foundation",
    "title": "Calisthenics Foundation",
    "short": "Four focus days \u00b7 learn control first",
    "focus": "Joint comfort \u2022 body line \u2022 quiet control",
    "equipment": "Check the selected focus day",
    "cue": "Exhale. Ribs down. Push tall. End the set when technique deteriorates.",
    "safety": "Stop for sharp or joint pain. Scale the movement and dose to current control.",
    "group": "Start here",
    "slugs": [
      "wall-push-up",
      "incline-push-up",
      "kneeling-planche-plank",
      "dead-bug",
      "hollow-body-hold",
      "incline-ring-row",
      "assisted-ring-support-hold",
      "active-hang",
      "wall-support-shrug",
      "pike-support-hold",
      "split-squat",
      "assisted-box-pistol-sit"
    ]
  },
  {
    "id": "planche",
    "title": "Planche",
    "short": "Lean, tuck, straddle and full planche",
    "focus": "Lean, tuck, straddle and full planche",
    "equipment": "Floor; check each movement",
    "cue": "Practice a controlled variation, then build repeatable quality before increasing leverage.",
    "safety": "Use a comfortable range and stop when technique deteriorates or joint pain appears.",
    "group": "Strength",
    "slugs": [
      "quadruped-planche-lean",
      "planche-lean",
      "planche-scapular-pulse",
      "band-assisted-tuck-planche",
      "tuck-planche",
      "advanced-tuck-planche",
      "straddle-planche",
      "full-planche"
    ]
  },
  {
    "id": "straight-arm",
    "title": "Straight-Arm Strength",
    "short": "Scapular control and locked-arm loading",
    "focus": "Scapular control and locked-arm loading",
    "equipment": "Floor; check each movement",
    "cue": "Practice a controlled variation, then build repeatable quality before increasing leverage.",
    "safety": "Use a comfortable range and stop when technique deteriorates or joint pain appears.",
    "group": "Strength",
    "slugs": [
      "wall-support-shrug",
      "scapular-push-up",
      "quadruped-planche-lean",
      "planche-lean",
      "planche-scapular-pulse",
      "band-assisted-tuck-planche",
      "tuck-planche"
    ]
  },
  {
    "id": "pike-compression",
    "title": "Pike Compression",
    "short": "Active hip flexion and straight-leg lifts",
    "focus": "Active hip flexion and straight-leg lifts",
    "equipment": "Floor; check each movement",
    "cue": "Practice a controlled variation, then build repeatable quality before increasing leverage.",
    "safety": "Use a comfortable range and stop when technique deteriorates or joint pain appears.",
    "group": "Compression",
    "slugs": [
      "bent-knee-compression-lift",
      "single-leg-pike-lift",
      "seated-pike-lift",
      "pike-compression-hold",
      "elevated-chair-compression"
    ]
  },
  {
    "id": "straddle-compression",
    "title": "Straddle Compression",
    "short": "Active straddle lift and low support",
    "focus": "Active straddle lift and low support",
    "equipment": "Floor; check each movement",
    "cue": "Practice a controlled variation, then build repeatable quality before increasing leverage.",
    "safety": "Use a comfortable range and stop when technique deteriorates or joint pain appears.",
    "group": "Compression",
    "slugs": [
      "bent-knee-straddle-lift",
      "seated-straddle-lift",
      "seated-straddle-compression-lift",
      "straddle-compression-hold",
      "stalder-feet-assisted-hip-lift"
    ]
  },
  {
    "id": "straddle-press",
    "title": "Straddle Press",
    "short": "Hip lifts, froggers, negatives and presses",
    "focus": "Hip lifts, froggers, negatives and presses",
    "equipment": "Floor; check each movement",
    "cue": "Practice a controlled variation, then build repeatable quality before increasing leverage.",
    "safety": "Use a comfortable range and stop when technique deteriorates or joint pain appears.",
    "group": "Press & balance",
    "slugs": [
      "hip-lift-setup",
      "slow-frogger-toe-pull",
      "straight-leg-frogger",
      "elevated-straddle-press",
      "wall-press-negative",
      "straddle-press-to-hs"
    ]
  },
  {
    "id": "stalder",
    "title": "Stalder Press",
    "short": "Low support to straddle press",
    "focus": "Low support to straddle press",
    "equipment": "Floor; check each movement",
    "cue": "Practice a controlled variation, then build repeatable quality before increasing leverage.",
    "safety": "Use a comfortable range and stop when technique deteriorates or joint pain appears.",
    "group": "Press & balance",
    "slugs": [
      "bent-knee-straddle-lift",
      "stalder-feet-assisted-hip-lift",
      "stalder-toe-assisted-press",
      "straddle-compression-hold",
      "stalder-negative",
      "stalder-press-to-hs"
    ]
  },
  {
    "id": "handstand",
    "title": "Handstand",
    "short": "Wall line, exits and freestanding balance",
    "focus": "Wall line, exits and freestanding balance",
    "equipment": "Floor; check each movement",
    "cue": "Practice a controlled variation, then build repeatable quality before increasing leverage.",
    "safety": "Use a comfortable range and stop when technique deteriorates or joint pain appears.",
    "group": "Press & balance",
    "slugs": [
      "wall-support-shrug",
      "chest-to-wall-handstand",
      "handstand-bail",
      "chest-to-wall-handstand-hold",
      "handstand-heel-pull",
      "freestanding-handstand-kick-up",
      "freestanding-handstand",
      "handstand-walking"
    ]
  },
  {
    "id": "pike-press",
    "title": "Pike Pressing",
    "short": "Incline pike to vertical pressing",
    "focus": "Incline pike to vertical pressing",
    "equipment": "Floor; check each movement",
    "cue": "Practice a controlled variation, then build repeatable quality before increasing leverage.",
    "safety": "Use a comfortable range and stop when technique deteriorates or joint pain appears.",
    "group": "Strength",
    "slugs": [
      "pike-support-hold",
      "incline-pike-push-up",
      "pike-push-up",
      "elevated-pike-push-up",
      "wall-hspu-negative",
      "partial-rom-wall-hspu",
      "handstand-push-up"
    ]
  },
  {
    "id": "hspu",
    "title": "Handstand Push-Up",
    "short": "Overhead support, range and pressing",
    "focus": "Overhead support, range and pressing",
    "equipment": "Floor; check each movement",
    "cue": "Practice a controlled variation, then build repeatable quality before increasing leverage.",
    "safety": "Use a comfortable range and stop when technique deteriorates or joint pain appears.",
    "group": "Strength",
    "slugs": [
      "pike-support-hold",
      "incline-pike-push-up",
      "pike-push-up",
      "wall-handstand",
      "elevated-pike-push-up",
      "wall-hspu-negative",
      "partial-rom-wall-hspu",
      "handstand-push-up"
    ]
  },
  {
    "id": "l-sit",
    "title": "L-Sit & V-Sit",
    "short": "Support strength plus compression",
    "focus": "Support strength plus compression",
    "equipment": "Floor; check each movement",
    "cue": "Practice a controlled variation, then build repeatable quality before increasing leverage.",
    "safety": "Use a comfortable range and stop when technique deteriorates or joint pain appears.",
    "group": "Compression",
    "slugs": [
      "bent-knee-compression-lift",
      "tuck-sit",
      "l-sit-tuck-hold",
      "one-leg-l-sit",
      "l-sit",
      "v-sit-preparation"
    ]
  },
  {
    "id": "rings",
    "title": "Rings",
    "short": "Supported rows, support and dips",
    "focus": "Supported rows, support and dips",
    "equipment": "Gymnastic rings",
    "cue": "Practice a controlled variation, then build repeatable quality before increasing leverage.",
    "safety": "Use a comfortable range and stop when technique deteriorates or joint pain appears.",
    "group": "Strength",
    "slugs": [
      "incline-ring-row",
      "ring-row",
      "assisted-ring-support-hold",
      "ring-support-hold",
      "assisted-ring-dip",
      "ring-dip",
      "ring-turnout-support-hold"
    ]
  },
  {
    "id": "ring-muscle-up",
    "title": "Ring Muscle-Up",
    "short": "False grip, pull, transition and dip",
    "focus": "False grip, pull, transition and dip",
    "equipment": "Gymnastic rings",
    "cue": "Practice a controlled variation, then build repeatable quality before increasing leverage.",
    "safety": "Use a comfortable range and stop when technique deteriorates or joint pain appears.",
    "group": "Strength",
    "slugs": [
      "incline-ring-row",
      "false-grip-ring-row",
      "false-grip-ring-hang",
      "ring-muscle-up-transition-drill",
      "low-ring-muscle-up-assisted",
      "ring-muscle-up"
    ]
  },
  {
    "id": "front-lever",
    "title": "Front Lever",
    "short": "Pulling base into horizontal holds",
    "focus": "Pulling base into horizontal holds",
    "equipment": "Bar or rings; check each movement",
    "cue": "Practice a controlled variation, then build repeatable quality before increasing leverage.",
    "safety": "Use a comfortable range and stop when technique deteriorates or joint pain appears.",
    "group": "Strength",
    "slugs": [
      "active-hang",
      "scapular-pull-up",
      "australian-row",
      "tuck-front-lever",
      "tuck-front-lever-on-rings",
      "advanced-tuck-front-lever-on-rings",
      "front-lever"
    ]
  },
  {
    "id": "pull-up",
    "title": "Pull-Ups",
    "short": "Rows, hangs and progressive pulling",
    "focus": "Rows, hangs and progressive pulling",
    "equipment": "Bar or rings; check each movement",
    "cue": "Practice a controlled variation, then build repeatable quality before increasing leverage.",
    "safety": "Use a comfortable range and stop when technique deteriorates or joint pain appears.",
    "group": "Strength",
    "slugs": [
      "active-hang",
      "australian-row",
      "scapular-pull-up",
      "band-assisted-pull-up",
      "pull-up",
      "weighted-pull-up",
      "archer-pull-up",
      "one-arm-chin-up"
    ]
  },
  {
    "id": "push-up",
    "title": "Push-Ups",
    "short": "Wall to advanced one-arm pressing",
    "focus": "Wall to advanced one-arm pressing",
    "equipment": "Floor; check each movement",
    "cue": "Practice a controlled variation, then build repeatable quality before increasing leverage.",
    "safety": "Use a comfortable range and stop when technique deteriorates or joint pain appears.",
    "group": "Strength",
    "slugs": [
      "wall-push-up",
      "incline-push-up",
      "push-up",
      "diamond-push-up",
      "archer-push-up",
      "incline-one-arm-push-up",
      "one-arm-push-up"
    ]
  },
  {
    "id": "dip",
    "title": "Dips",
    "short": "Assisted support to controlled dips",
    "focus": "Assisted support to controlled dips",
    "equipment": "Rings",
    "cue": "Practice a controlled variation, then build repeatable quality before increasing leverage.",
    "safety": "Use a comfortable range and stop when technique deteriorates or joint pain appears.",
    "group": "Strength",
    "slugs": [
      "assisted-ring-support-hold",
      "ring-support-hold",
      "assisted-ring-dip",
      "ring-dip-negative",
      "ring-dip"
    ]
  },
  {
    "id": "crow",
    "title": "Crow Balance",
    "short": "Supported balance into crow",
    "focus": "Supported balance into crow",
    "equipment": "Floor; check each movement",
    "cue": "Practice a controlled variation, then build repeatable quality before increasing leverage.",
    "safety": "Use a comfortable range and stop when technique deteriorates or joint pain appears.",
    "group": "Press & balance",
    "slugs": [
      "quadruped-planche-lean",
      "supported-crow-balance",
      "frog-stand",
      "crow-pose"
    ]
  },
  {
    "id": "elbow-lever",
    "title": "Elbow Lever",
    "short": "Assisted support into lever balance",
    "focus": "Assisted support into lever balance",
    "equipment": "Floor; check each movement",
    "cue": "Practice a controlled variation, then build repeatable quality before increasing leverage.",
    "safety": "Use a comfortable range and stop when technique deteriorates or joint pain appears.",
    "group": "Press & balance",
    "slugs": [
      "quadruped-planche-lean",
      "assisted-elbow-lever",
      "elbow-lever",
      "single-arm-elbow-lever"
    ]
  },
  {
    "id": "pistol",
    "title": "Pistol Squat",
    "short": "Split squats to single-leg strength",
    "focus": "Split squats to single-leg strength",
    "equipment": "Floor; check each movement",
    "cue": "Practice a controlled variation, then build repeatable quality before increasing leverage.",
    "safety": "Use a comfortable range and stop when technique deteriorates or joint pain appears.",
    "group": "Lower body",
    "slugs": [
      "bodyweight-squat",
      "split-squat",
      "reverse-lunge",
      "assisted-pistol-squat",
      "pistol-squat",
      "shrimp-squat"
    ]
  },
  {
    "id": "pancake",
    "title": "Pancake & Mobility",
    "short": "Usable pike and straddle range",
    "focus": "Usable pike and straddle range",
    "equipment": "Floor; check each movement",
    "cue": "Practice a controlled variation, then build repeatable quality before increasing leverage.",
    "safety": "Use a comfortable range and stop when technique deteriorates or joint pain appears.",
    "group": "Compression",
    "slugs": [
      "pike-stretch",
      "standing-pike",
      "straddle-stretch",
      "pancake-good-morning",
      "pancake-stretch",
      "middle-split-frog-stretch"
    ]
  },
  {
    "id": "back-lever",
    "title": "Back Lever",
    "short": "Support and controlled shoulder extension",
    "focus": "Support and controlled shoulder extension",
    "equipment": "Bar or rings",
    "cue": "Practice a controlled variation, then build repeatable quality before increasing leverage.",
    "safety": "Use a comfortable range and stop when technique deteriorates or joint pain appears.",
    "group": "Strength",
    "slugs": [
      "active-hang",
      "ring-support-hold",
      "skin-the-cat-preparation",
      "german-hang-preparation",
      "ring-back-lever-tuck",
      "back-lever"
    ]
  },
  {
    "id": "human-flag",
    "title": "Human Flag",
    "short": "Hanging control, side support and flag",
    "focus": "Hanging control, side support and flag",
    "equipment": "Suitable stable flag apparatus for full skill",
    "cue": "Practice a controlled variation, then build repeatable quality before increasing leverage.",
    "safety": "Use a comfortable range and stop when technique deteriorates or joint pain appears.",
    "group": "Strength",
    "slugs": [
      "side-plank",
      "active-hang",
      "scapular-pull-up",
      "clutch-flag",
      "human-flag"
    ]
  }
];
export const getSkillPath=(id?:string)=>SKILL_PATHS.find(p=>p.id===id);
