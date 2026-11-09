export interface SkillPath {id:string;title:string;short:string;focus:string;equipment:string;cue:string;safety:string;group:string;slugs:readonly string[];accessories?:readonly string[];kind?:"progression"|"collection";}
export const SKILL_PATHS: readonly SkillPath[] = [
  {
    "id": "foundation",
    "title": "Calisthenics Foundation",
    "short": "Four focus days · learn control first",
    "focus": "Joint comfort • body line • quiet control",
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
    ],
    "accessories": []
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
    ],
    "accessories": [
      "planche-plank",
      "parallette-tuck-planche",
      "band-assisted-progressions",
      "pseudo-planche-push-up"
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
    ],
    "accessories": []
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
    ],
    "accessories": []
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
    ],
    "accessories": []
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
    ],
    "accessories": [
      "press-hs-journey"
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
    ],
    "accessories": []
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
    ],
    "accessories": [
      "hs-shrugs",
      "wall-handstand-shoulder-taps",
      "wall-pull-aways",
      "straddle-hs-kick-up",
      "wall-stomach-straddle-handstand",
      "kip-to-handstand",
      "wall-toe-taps"
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
    ],
    "accessories": []
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
    ],
    "accessories": [
      "hspu-capacity-builder"
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
    ],
    "accessories": [
      "manna"
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
    ],
    "accessories": []
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
    ],
    "accessories": [
      "false-grip-hold"
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
    ],
    "accessories": [
      "front-lever-raise"
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
    ],
    "accessories": [
      "chin-up",
      "dead-hang",
      "towel-hang",
      "typewriter-pull-up"
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
    ],
    "accessories": [
      "decline-push-up",
      "wide-push-up"
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
    ],
    "accessories": [
      "parallel-bar-dip"
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
    ],
    "accessories": []
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
    ],
    "accessories": []
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
    ],
    "accessories": []
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
    ],
    "accessories": [
      "wall-compression-stretch"
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
    ],
    "accessories": [
      "skin-the-cat",
      "german-hang"
    ]
  },
  {
    "id": "human-flag",
    "title": "Human Flag",
    "short": "Supported entries, band help and sideways holds",
    "focus": "Push, pull and side-body control",
    "equipment": "Suitable stable flag apparatus for full skill",
    "cue": "Practice a controlled variation, then build repeatable quality before increasing leverage.",
    "safety": "Use stable apparatus and controlled entry and exit. Practice both sides. Band assistance does not replace the starting checks.",
    "group": "Strength",
    "slugs": [
      "side-plank",
      "active-hang",
      "scapular-pull-up",
      "feet-assisted-human-flag",
      "vertical-human-flag",
      "band-assisted-human-flag",
      "tuck-human-flag",
      "one-leg-human-flag",
      "straddle-human-flag",
      "human-flag"
    ],
    "accessories": [
      "clutch-flag"
    ]
  },
  {
    "id": "yoga-foundation",
    "title": "Yoga · Foundation",
    "short": "Resting shapes, breathing and supported floor practice",
    "focus": "Resting shapes, breathing and supported floor practice",
    "equipment": "Check the selected movement and available support",
    "cue": "Use a supported range you can control. Progress by quality, not by forcing range.",
    "safety": "Keep movement comfortable. Scale support, range and dose to your own control.",
    "group": "Yoga",
    "slugs": [
      "child-s-pose",
      "cat-cow",
      "downward-dog",
      "cobra-pose"
    ],
    "accessories": [],
    "kind": "collection"
  },
  {
    "id": "yoga-standing",
    "title": "Yoga · Standing & Balance",
    "short": "Standing shapes, then supported single-leg balance",
    "focus": "Standing shapes, then supported single-leg balance",
    "equipment": "Check the selected movement and available support",
    "cue": "Use a supported range you can control. Progress by quality, not by forcing range.",
    "safety": "Keep movement comfortable. Scale support, range and dose to your own control.",
    "group": "Yoga",
    "slugs": [
      "chair-pose",
      "warrior-i",
      "warrior-ii",
      "triangle-pose",
      "tree-pose",
      "warrior-iii",
      "half-moon-pose"
    ],
    "accessories": [],
    "kind": "collection"
  },
  {
    "id": "yoga-backbends",
    "title": "Yoga · Hips & Backbends",
    "short": "Hip opening and extension with your own range",
    "focus": "Hip opening and extension with your own range",
    "equipment": "Check the selected movement and available support",
    "cue": "Use a supported range you can control. Progress by quality, not by forcing range.",
    "safety": "Keep movement comfortable. Scale support, range and dose to your own control.",
    "group": "Yoga",
    "slugs": [
      "cat-cow",
      "glute-bridge",
      "bridge-pose",
      "pigeon-pose",
      "camel-pose",
      "wheel-pose"
    ],
    "accessories": [
      "shoulder-bridge"
    ],
    "kind": "collection"
  },
  {
    "id": "yoga-arm-balance",
    "title": "Yoga · Arm Balance",
    "short": "Floor support into crow and forearm preparation",
    "focus": "Floor support into crow and forearm preparation",
    "equipment": "Check the selected movement and available support",
    "cue": "Use a supported range you can control. Progress by quality, not by forcing range.",
    "safety": "Keep movement comfortable. Scale support, range and dose to your own control.",
    "group": "Yoga",
    "slugs": [
      "quadruped-planche-lean",
      "supported-crow-balance",
      "dolphin-pose",
      "crow-pose"
    ],
    "accessories": [
      "crocodile-pose"
    ],
    "kind": "collection"
  },
  {
    "id": "ballet-barre",
    "title": "Ballet · Barre Foundations",
    "short": "Arm carriage, foot articulation, plié and relevé",
    "focus": "Arm carriage, foot articulation, plié and relevé",
    "equipment": "Check the selected movement and available support",
    "cue": "Use a supported range you can control. Progress by quality, not by forcing range.",
    "safety": "Keep movement comfortable. Scale support, range and dose to your own control.",
    "group": "Ballet",
    "slugs": [
      "port-de-bras",
      "tendu",
      "first-position-plie",
      "releve",
      "grand-plie"
    ],
    "accessories": [],
    "kind": "collection"
  },
  {
    "id": "ballet-balance",
    "title": "Ballet · Single-Leg Balance",
    "short": "Supported passé, arabesque and attitude",
    "focus": "Supported passé, arabesque and attitude",
    "equipment": "Check the selected movement and available support",
    "cue": "Use a supported range you can control. Progress by quality, not by forcing range.",
    "safety": "Keep movement comfortable. Scale support, range and dose to your own control.",
    "group": "Ballet",
    "slugs": [
      "calf-raise",
      "passe-balance",
      "arabesque-hold",
      "attitude-hold"
    ],
    "accessories": [],
    "kind": "collection"
  },
  {
    "id": "ballet-extension",
    "title": "Ballet · Extension & Control",
    "short": "Rond de jambe, développé and controlled battement",
    "focus": "Rond de jambe, développé and controlled battement",
    "equipment": "Check the selected movement and available support",
    "cue": "Use a supported range you can control. Progress by quality, not by forcing range.",
    "safety": "Keep movement comfortable. Scale support, range and dose to your own control.",
    "group": "Ballet",
    "slugs": [
      "tendu",
      "rond-de-jambe",
      "developpe",
      "grand-battement"
    ],
    "accessories": [],
    "kind": "collection"
  },
  {
    "id": "ballet-penche",
    "title": "Ballet · Penché & Needle",
    "short": "Hip control before deeper supported extensions",
    "focus": "Hip control before deeper supported extensions",
    "equipment": "Check the selected movement and available support",
    "cue": "Use a supported range you can control. Progress by quality, not by forcing range.",
    "safety": "Keep movement comfortable. Scale support, range and dose to your own control.",
    "group": "Ballet",
    "slugs": [
      "glute-bridge",
      "single-leg-rdl",
      "arabesque-hold",
      "penche",
      "needle"
    ],
    "accessories": [],
    "kind": "collection"
  },
  {
    "id": "splits",
    "title": "Splits & Hip Opening",
    "short": "Comfortable hip range before deeper splits",
    "focus": "Comfortable hip range before deeper splits",
    "equipment": "Check the selected movement and available support",
    "cue": "Use a supported range you can control. Progress by quality, not by forcing range.",
    "safety": "Keep movement comfortable. Scale support, range and dose to your own control.",
    "group": "Mobility",
    "slugs": [
      "90-90-hip-switches",
      "frog-stretch",
      "front-split-preparation",
      "couch-stretch",
      "front-split",
      "middle-split-hold",
      "middle-split"
    ],
    "accessories": [],
    "kind": "collection"
  },
  {
    "id": "shoulder-mobility",
    "title": "Shoulder & Thoracic Mobility",
    "short": "Controlled shoulder motion and upper-back range",
    "focus": "Controlled shoulder motion and upper-back range",
    "equipment": "Check the selected movement and available support",
    "cue": "Use a supported range you can control. Progress by quality, not by forcing range.",
    "safety": "Keep movement comfortable. Scale support, range and dose to your own control.",
    "group": "Mobility",
    "slugs": [
      "cat-cow",
      "thoracic-open-book",
      "shoulder-cars",
      "thoracic-extension",
      "shoulder-dislocate"
    ],
    "accessories": [
      "german-hang"
    ],
    "kind": "collection"
  },
  {
    "id": "wrist-preparation",
    "title": "Wrist & Scapular Preparation",
    "short": "Prepare hands, wrists and shoulder support",
    "focus": "Prepare hands, wrists and shoulder support",
    "equipment": "Check the selected movement and available support",
    "cue": "Use a supported range you can control. Progress by quality, not by forcing range.",
    "safety": "Keep movement comfortable. Scale support, range and dose to your own control.",
    "group": "Mobility",
    "slugs": [
      "wrist-circles",
      "extensor-band",
      "scapular-push-up",
      "wall-support-shrug"
    ],
    "accessories": [],
    "kind": "collection"
  },
  {
    "id": "ankle-squat-mobility",
    "title": "Ankle & Squat Mobility",
    "short": "Ankle range, hip rotation and controlled deep squat",
    "focus": "Ankle range, hip rotation and controlled deep squat",
    "equipment": "Check the selected movement and available support",
    "cue": "Use a supported range you can control. Progress by quality, not by forcing range.",
    "safety": "Keep movement comfortable. Scale support, range and dose to your own control.",
    "group": "Mobility",
    "slugs": [
      "calf-raise",
      "wall-ankle-dorsiflexion",
      "90-90-hip-switches",
      "world-s-greatest-stretch",
      "deep-squat-hold"
    ],
    "accessories": [],
    "kind": "collection"
  },
  {
    "id": "core-control",
    "title": "Core · Body Line",
    "short": "Dead bug and plank into hollow-body control",
    "focus": "Dead bug and plank into hollow-body control",
    "equipment": "Check the selected movement and available support",
    "cue": "Use a supported range you can control. Progress by quality, not by forcing range.",
    "safety": "Keep movement comfortable. Scale support, range and dose to your own control.",
    "group": "Core",
    "slugs": [
      "dead-bug",
      "plank",
      "side-plank",
      "hollow-body-hold",
      "mountain-climber",
      "v-up",
      "dragon-flag"
    ],
    "accessories": [],
    "kind": "progression"
  },
  {
    "id": "hanging-core",
    "title": "Core · Hanging Strength",
    "short": "Active hang, knee raises and controlled leg lifts",
    "focus": "Active hang, knee raises and controlled leg lifts",
    "equipment": "Check the selected movement and available support",
    "cue": "Use a supported range you can control. Progress by quality, not by forcing range.",
    "safety": "Keep movement comfortable. Scale support, range and dose to your own control.",
    "group": "Core",
    "slugs": [
      "dead-bug",
      "active-hang",
      "ring-knee-raise",
      "hanging-leg-raise",
      "toes-to-bar",
      "windshield-wiper"
    ],
    "accessories": [],
    "kind": "progression"
  },
  {
    "id": "leg-strength",
    "title": "Legs · Squat & Lunge",
    "short": "Squat, split squat and stable single-leg strength",
    "focus": "Squat, split squat and stable single-leg strength",
    "equipment": "Check the selected movement and available support",
    "cue": "Use a supported range you can control. Progress by quality, not by forcing range.",
    "safety": "Keep movement comfortable. Scale support, range and dose to your own control.",
    "group": "Lower body",
    "slugs": [
      "bodyweight-squat",
      "split-squat",
      "lunge",
      "reverse-lunge",
      "step-up",
      "bulgarian-split-squat",
      "cossack-squat"
    ],
    "accessories": [
      "jump-squat",
      "sissy-squat"
    ],
    "kind": "progression"
  },
  {
    "id": "posterior-chain",
    "title": "Legs · Posterior Chain",
    "short": "Bridges and hinge control before demanding curls",
    "focus": "Bridges and hinge control before demanding curls",
    "equipment": "Check the selected movement and available support",
    "cue": "Use a supported range you can control. Progress by quality, not by forcing range.",
    "safety": "Keep movement comfortable. Scale support, range and dose to your own control.",
    "group": "Lower body",
    "slugs": [
      "glute-bridge",
      "single-leg-rdl",
      "ring-hamstring-curl",
      "nordic-curl"
    ],
    "accessories": [
      "jefferson-curl"
    ],
    "kind": "progression"
  },
  {
    "id": "ring-push",
    "title": "Rings · Pressing",
    "short": "Supported stability into controlled ring pressing",
    "focus": "Supported stability into controlled ring pressing",
    "equipment": "Check the selected movement and available support",
    "cue": "Use a supported range you can control. Progress by quality, not by forcing range.",
    "safety": "Keep movement comfortable. Scale support, range and dose to your own control.",
    "group": "Rings",
    "slugs": [
      "wall-push-up",
      "incline-push-up",
      "assisted-ring-support-hold",
      "ring-push-up",
      "ring-push-up-turnout"
    ],
    "accessories": [
      "ring-fly-regression",
      "ring-triceps-extension"
    ],
    "kind": "progression"
  },
  {
    "id": "ring-pull",
    "title": "Rings · Rows & Scapular Control",
    "short": "Upright rows before longer-lever pulling",
    "focus": "Upright rows before longer-lever pulling",
    "equipment": "Check the selected movement and available support",
    "cue": "Use a supported range you can control. Progress by quality, not by forcing range.",
    "safety": "Keep movement comfortable. Scale support, range and dose to your own control.",
    "group": "Rings",
    "slugs": [
      "incline-ring-row",
      "ring-scapular-row",
      "ring-row",
      "feet-elevated-ring-row",
      "archer-ring-row"
    ],
    "accessories": [
      "ring-face-pull",
      "ring-biceps-curl",
      "ring-scapular-depression"
    ],
    "kind": "progression"
  },
  {
    "id": "ring-core",
    "title": "Rings · Core & Support",
    "short": "Assisted support before ring tucks and L-sits",
    "focus": "Assisted support before ring tucks and L-sits",
    "equipment": "Check the selected movement and available support",
    "cue": "Use a supported range you can control. Progress by quality, not by forcing range.",
    "safety": "Keep movement comfortable. Scale support, range and dose to your own control.",
    "group": "Rings",
    "slugs": [
      "dead-bug",
      "assisted-ring-support-hold",
      "ring-tuck-hold",
      "ring-knee-raise",
      "ring-l-sit-hold"
    ],
    "accessories": [
      "ring-reverse-plank",
      "ring-body-saw",
      "ring-fallout"
    ],
    "kind": "progression"
  },
  {
    "id": "ring-legs",
    "title": "Rings · Assisted Legs",
    "short": "Ring support helps control squat and single-leg depth",
    "focus": "Ring support helps control squat and single-leg depth",
    "equipment": "Check the selected movement and available support",
    "cue": "Use a supported range you can control. Progress by quality, not by forcing range.",
    "safety": "Keep movement comfortable. Scale support, range and dose to your own control.",
    "group": "Rings",
    "slugs": [
      "bodyweight-squat",
      "ring-assisted-deep-squat",
      "ring-bulgarian-split-squat",
      "ring-assisted-pistol-squat"
    ],
    "accessories": [],
    "kind": "progression"
  },
  {
    "id": "ring-straight-arm",
    "title": "Rings · Advanced Straight Arm",
    "short": "Support foundations; elite holds require specialist coaching",
    "focus": "Support foundations; elite holds require specialist coaching",
    "equipment": "Check the selected movement and available support",
    "cue": "Use a supported range you can control. Progress by quality, not by forcing range.",
    "safety": "Keep movement comfortable. Scale support, range and dose to your own control.",
    "group": "Rings",
    "slugs": [
      "assisted-ring-support-hold",
      "ring-support-hold",
      "ring-turnout-support-hold",
      "iron-cross-assisted-hold",
      "short-lever-iron-cross",
      "band-assisted-iron-cross",
      "iron-cross"
    ],
    "accessories": [
      "maltese",
      "victorian-cross",
      "ringmaster"
    ],
    "kind": "progression"
  },
  {
    "id": "iron-cross",
    "title": "Iron Cross",
    "short": "Ring support, assisted holds and straight-arm cross strength",
    "focus": "Support control and carefully scaled cross practice",
    "equipment": "Rings; assistance is described for each movement",
    "cue": "Own the support position and a controlled return before changing assistance.",
    "safety": "This is advanced ring work. Use specialist coaching for unfamiliar cross and band setups. Stop when joint discomfort or loss of control appears.",
    "group": "Rings",
    "slugs": [
      "assisted-ring-support-hold",
      "ring-support-hold",
      "ring-turnout-support-hold",
      "short-lever-iron-cross",
      "iron-cross-assisted-hold",
      "band-assisted-iron-cross",
      "iron-cross"
    ],
    "accessories": [
      "scapular-push-up",
      "active-hang"
    ],
    "kind": "progression"
  },
  {
    "id": "forearm-balance",
    "title": "Forearm & Headstand Preparation",
    "short": "Shoulder support, wall exposure and controlled exits",
    "focus": "Shoulder support, wall exposure and controlled exits",
    "equipment": "Check the selected movement and available support",
    "cue": "Use a supported range you can control. Progress by quality, not by forcing range.",
    "safety": "Keep movement comfortable. Scale support, range and dose to your own control.",
    "group": "Press & balance",
    "slugs": [
      "pike-support-hold",
      "dolphin-pose",
      "elbow-stand-wall-hold",
      "forearm-stand-line-hold",
      "forearm-stand-toe-pulls",
      "elbow-stand-exit",
      "elbow-stand-straddle-entry",
      "headstand"
    ],
    "accessories": [],
    "kind": "collection"
  },
  {
    "id": "bent-arm-press",
    "title": "Bent-Arm Handstand Strength",
    "short": "Pike strength and crow support before bent-arm transitions",
    "focus": "Pike strength and crow support before bent-arm transitions",
    "equipment": "Check the selected movement and available support",
    "cue": "Use a supported range you can control. Progress by quality, not by forcing range.",
    "safety": "Keep movement comfortable. Scale support, range and dose to your own control.",
    "group": "Press & balance",
    "slugs": [
      "incline-pike-push-up",
      "pike-push-up",
      "frog-stand",
      "elbow-lever",
      "bent-arm-handstand",
      "l-sit-to-handstand"
    ],
    "accessories": [
      "tiger-bend-pushup",
      "tuck-planche-push-up-preparation"
    ],
    "kind": "progression"
  },
  {
    "id": "bar-transitions",
    "title": "Bar · Transitions & Dynamic Skills",
    "short": "Hanging foundations before pullovers and muscle-ups",
    "focus": "Hanging foundations before pullovers and muscle-ups",
    "equipment": "Check the selected movement and available support",
    "cue": "Use a supported range you can control. Progress by quality, not by forcing range.",
    "safety": "Keep movement comfortable. Scale support, range and dose to your own control.",
    "group": "Strength",
    "slugs": [
      "active-hang",
      "scapular-pull-up",
      "band-assisted-pull-up",
      "pull-up",
      "chin-up",
      "pullover",
      "muscle-up"
    ],
    "accessories": [
      "360-pull"
    ],
    "kind": "progression"
  },
  {
    "id": "recovery",
    "title": "Recovery & Whole-Body Mobility",
    "short": "Easy movement options and active recovery",
    "focus": "Easy movement options and active recovery",
    "equipment": "Check the selected movement and available support",
    "cue": "Use a supported range you can control. Progress by quality, not by forcing range.",
    "safety": "Keep movement comfortable. Scale support, range and dose to your own control.",
    "group": "Mobility",
    "slugs": [
      "cat-cow",
      "child-s-pose",
      "world-s-greatest-stretch"
    ],
    "accessories": [
      "swimming-freestyle"
    ],
    "kind": "collection"
  }
  {
    id: "grip-support",
    title: "Grip · Hanging & Support",
    short: "Control, load and one-arm hang foundations",
    focus: "Support grip strength and shoulder control",
    equipment: "Bar, weights or suitable carry implements",
    cue: "Start supported, load progressively and step down before grip fails.",
    safety: "Unilateral hanging is high demand; avoid sudden loading and stop for finger, elbow or shoulder pain.",
    group: "Grip",
    slugs: ["active-hang","dead-hang","farmers-carry","suitcase-carry","towel-hang","one-arm-assisted-hang","one-arm-hang"],
    accessories: ["wrist-circles","extensor-band","false-grip-hold"],
    kind: "progression"
  },
  {
    id: "grip-pinch",
    title: "Grip · Pinch & Crush",
    short: "Finger-thumb pinch and controlled crushing strength",
    focus: "Pinch, crush and forearm strength",
    equipment: "Plates, pinch block and optional gripper",
    cue: "Use suitable light implements at first and gradually increase resistance.",
    safety: "Pinch and crush tasks are not a single interchangeable progression; train each according to tolerance.",
    group: "Grip",
    slugs: ["plate-pinch-hold","block-pinch-hold","gripper-crush"],
    accessories: ["band-finger-extension","wrist-pronation-supination"],
    kind: "collection"
  },
  {
    id: "grip-wrist",
    title: "Grip · Wrists & Extensors",
    short: "Balanced wrist, finger and rotation strength",
    focus: "Wrist control, forearm rotation and finger extension",
    equipment: "Elastic band, light dumbbells or wrist roller",
    cue: "Use smooth controlled movement without forcing uncomfortable ranges.",
    safety: "Increase resistance gradually, especially after other heavy gripping sessions.",
    group: "Grip",
    slugs: ["wrist-circles","band-finger-extension","wrist-extension","wrist-flexion","wrist-pronation-supination","grip-roller"],
    accessories: ["extensor-band"],
    kind: "collection"
  },
  {
    id: "calves-tibialis",
    title: "Calves & Tibialis",
    short: "Heel raises, soleus and shin strength",
    focus: "Ankle plantar flexion and dorsiflexion",
    equipment: "Floor, wall or optional resistance",
    cue: "Control every repetition and increase resistance gradually.",
    safety: "Avoid bouncing under load or pushing through Achilles or ankle pain.",
    group: "Lower body",
    slugs: ["tibialis-raise","calf-raise","seated-calf-raise","single-leg-calf-raise","weighted-calf-raise"],
    accessories: ["wall-ankle-dorsiflexion"],
    kind: "progression"
  },
];
export const getSkillPath=(id?:string)=>SKILL_PATHS.find(p=>p.id===id);
