/** Optional coaching reference — never automatically populates a workout draft. */
export type SessionKey = 'A' | 'B' | 'C' | 'D';
export type HoldMetric = 'planche' | 'lsit';
export interface RoutineMove {
  name: string;
  sets?: number;
  target?: string;
  count?: number;
  countUnit?: string;
  holdMetric?: HoldMetric;
  slug?: string;
  goal?: string;
  note?: string;
}
export interface RoutineGroup { title: string; movements: RoutineMove[] }
export interface RoutineSession {
  key: SessionKey;
  name: string;
  focus: string;
  duration: string;
  groups: RoutineGroup[];
}
export interface CoachingReel {
  id: string;
  title: string;
  skill: string;
  teaches: string;
  url: string;
  days: SessionKey[];
}

export const SUPERHUMAN_SESSIONS: RoutineSession[] = [
  {
    key: 'A', name: 'Handstand · Planche · Push', focus: 'Alignment, straight-arm strength, pushing', duration: '~60 min',
    groups: [
      { title: '01 / Handstand', movements: [
        { name: 'Side-to-wall handstand', sets: 3, target: '25 sec', slug: 'chest-to-wall-handstand', goal: 'handstand', note: 'Side-to-wall drill; linked catalog movement is a wall-supported alternative, not the same variation.' },
        { name: 'Handstand heel pulls', sets: 3, target: '5 reps', slug: 'handstand-heel-pull', goal: 'handstand' },
        { name: 'Free handstand attempts', count: 8, countUnit: 'controlled tries', slug: 'freestanding-handstand-kick-up', goal: 'handstand' },
      ] },
      { title: '02 / Planche', movements: [
        { name: 'Planche lean', sets: 3, target: '20 sec', slug: 'planche-lean', goal: 'planche' },
        { name: 'Straight-arm frog stand', sets: 3, target: '15 sec', slug: 'frog-stand', goal: 'planche', note: 'Straight-arm variation only when the shoulders and wrists tolerate it.' },
        { name: 'Tuck planche — current stage', sets: 3, holdMetric: 'planche', slug: 'tuck-planche', goal: 'planche', note: 'Hold for 65% of your tested best; use frog stand if tuck control is not ready.' },
        { name: 'Pseudo planche push-ups', sets: 3, target: '8 reps', slug: 'pseudo-planche-push-up', goal: 'planche' },
      ] },
      { title: '03 / Push strength', movements: [
        { name: 'Pike push-ups', sets: 3, target: '8 reps', slug: 'pike-push-up', goal: 'handstand' },
        { name: 'Dips', sets: 3, target: '8 reps', slug: 'parallel-bar-dip', goal: 'rings' },
        { name: 'Hollow body hold', sets: 3, target: '30 sec', slug: 'hollow-body-hold', goal: 'l-sit' },
      ] },
    ],
  },
  {
    key: 'B', name: 'Handstand · Compression · Press', focus: 'Active compression, press negatives and control', duration: '~60 min',
    groups: [
      { title: '01 / Handstand control', movements: [
        { name: 'Box tuck leg extensions', sets: 3, target: '6 reps', note: 'Box-supported tuck to straight-leg control.' },
        { name: 'Knee slides', sets: 3, target: '5 reps', note: 'Smooth compression and weight transfer.' },
        { name: 'Parallette handstand holds', sets: 4, target: '15 sec', note: 'Use a supported hold if free balance is not ready.' },
      ] },
      { title: '02 / Compression', movements: [
        { name: 'L-sit — current stage', sets: 3, holdMetric: 'lsit', slug: 'l-sit-tuck-hold', goal: 'l-sit', note: 'Start with tuck L-sit; choose the stage you can hold without collapsing.' },
        { name: 'Seated pike lifts', sets: 3, target: '10 reps', slug: 'seated-pike-lift', goal: 'pike-compression' },
        { name: 'Seated straddle lifts', sets: 3, target: '8 reps', slug: 'seated-straddle-lift', goal: 'straddle-compression' },
        { name: 'Hip lift off blocks', sets: 4, target: '3 reps', slug: 'stalder-feet-assisted-hip-lift', goal: 'straddle-press', note: 'The linked exercise is a feet-assisted regression.' },
      ] },
      { title: '03 / Press', movements: [
        { name: 'Controlled press negatives', sets: 3, target: '3 reps · 3–5 sec down', slug: 'wall-press-negative', goal: 'straddle-press', note: 'Assisted variation first; only lower as far as you control.' },
        { name: 'Pike push-ups', sets: 3, target: '8 reps', slug: 'pike-push-up', goal: 'handstand' },
      ] },
    ],
  },
  {
    key: 'C', name: 'Human Flag · Pull', focus: 'Side-body strength, grip and vertical pulling', duration: '~60 min',
    groups: [
      { title: '01 / Handstand touchpoint', movements: [
        { name: 'Free handstand attempts', count: 8, countUnit: 'controlled tries', slug: 'freestanding-handstand-kick-up', goal: 'handstand' },
      ] },
      { title: '02 / Human flag', movements: [
        { name: 'Human flag — current stage', sets: 4, target: 'holds / side', slug: 'feet-assisted-human-flag', goal: 'human-flag', note: 'Weak side first. Begin with flag plank until you pass the readiness assessment; catalog link shows an assisted flag step.' },
        { name: 'Hanging side pulls', sets: 3, target: '5 reps / side', note: 'Train both sides; resist torso rotation.' },
      ] },
      { title: '03 / Pull + core', movements: [
        { name: 'Pull-ups', sets: 4, target: '8 reps', slug: 'pull-up', goal: 'front-lever' },
        { name: 'Hanging leg raises', sets: 3, target: '10 reps', slug: 'hanging-leg-raise', goal: 'l-sit' },
        { name: 'Side plank', sets: 2, target: '45 sec / side', slug: 'side-plank', goal: 'human-flag' },
        { name: 'Shoulder external rotations', sets: 2, target: '15 reps', note: 'Light controlled resistance; do not substitute unrelated shoulder exercises.' },
      ] },
    ],
  },
  {
    key: 'D', name: 'Technique & Mobility', focus: 'Fourth-day option — easy volume only', duration: '~45 min',
    groups: [
      { title: '01 / Technique', movements: [
        { name: 'Free handstand attempts', count: 10, countUnit: 'easy tries', slug: 'freestanding-handstand-kick-up', goal: 'handstand' },
        { name: 'Planche — one stage easier', count: 5, countUnit: 'easy holds', slug: 'planche-lean', goal: 'planche', note: 'Use the regression below your current tested skill.' },
        { name: 'Human flag — one stage easier', count: 5, countUnit: 'easy holds / side', slug: 'feet-assisted-human-flag', goal: 'human-flag', note: 'Use an easier stage than Day C; skip loaded flag work if not ready.' },
        { name: 'Tuck L-sit', sets: 3, target: '15 sec', slug: 'l-sit-tuck-hold', goal: 'l-sit' },
      ] },
      { title: '02 / Mobility', movements: [
        { name: 'Pancake stretch', target: 'comfortable range', slug: 'pancake-stretch', goal: 'straddle-compression' },
        { name: 'Pike stretch', target: 'comfortable range', slug: 'pike-stretch', goal: 'pike-compression' },
        { name: 'Wrist mobility', target: 'gentle, pain-free range', slug: 'wrist-circles', goal: 'handstand' },
      ] },
    ],
  },
];

export const SUPERHUMAN_BALANCE: RoutineGroup[] = [
  { title: '10-minute off-day practice', movements: [
    { name: 'Wrist warm-up', target: 'easy, controlled range', slug: 'wrist-circles', goal: 'handstand' },
    { name: 'Chest-to-wall handstand', sets: 2, target: '40 sec', slug: 'chest-to-wall-handstand', goal: 'handstand' },
    { name: 'Wall toe pulls', sets: 3, target: '3 reps', slug: 'wall-pull-aways', goal: 'handstand', note: 'A linked wall-pull-away drill; check form before substituting.' },
    { name: 'Kick-up practice', target: '5 min of controlled attempts', slug: 'freestanding-handstand-kick-up', goal: 'handstand' },
  ] },
];

export const SUPERHUMAN_REELS: CoachingReel[] = [
  { id: 'press-strength', title: 'Press strength progressions', skill: 'Press to handstand', teaches: 'Lifted L-sits, lolasana, handstand lowers and floor press', url: 'https://www.instagram.com/reel/DXNqiJnjrRU', days: ['A','B'] },
  { id: 'press-drills', title: 'Drills that got my press', skill: 'Press to handstand', teaches: 'Back-supported straddle press and hand placement', url: 'https://www.instagram.com/reel/DPZtZUBDknp?hl=en', days: ['B'] },
  { id: 'ty-press', title: 'ty.mfeldman press workout', skill: 'Press to handstand', teaches: 'Straddle lifts 2 × 5–10, toe-to-wrist taps and pancake', url: 'https://www.instagram.com/reel/DZyZpR6qBfu', days: ['B'] },
  { id: 'straddle-compression', title: 'Straddle press and compression', skill: 'Compression', teaches: 'Seated straddle lift and sliding straddle on blocks', url: 'https://www.instagram.com/p/DSNA2XciKHG', days: ['B'] },
  { id: 'press-carryover', title: 'Press drills that carry over', skill: 'Compression', teaches: 'Block lift-offs and active hamstring compression', url: 'https://www.instagram.com/reel/DTlvC1NkfPQ', days: ['B'] },
  { id: 'press-planche', title: 'Press or planche bridge', skill: 'Planche and press', teaches: 'Pike lean to high planche and tuck planche press', url: 'https://www.instagram.com/reel/DQt1XJiDaiY', days: ['A','D'] },
  { id: 'front-lever', title: '6 front lever progressions', skill: 'Front lever', teaches: 'Six levels with and without band assistance', url: 'https://www.instagram.com/reel/DcZLRXxsP1P', days: ['C'] },
  { id: 'back-lever', title: '3 back lever drills', skill: 'Back lever', teaches: 'Starter to advanced holds and front-lever crossover', url: 'https://www.instagram.com/reel/DdY6mXEsd_Q', days: ['C'] },
];
