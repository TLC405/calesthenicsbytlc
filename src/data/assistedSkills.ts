/** Assisted-skill reference only. Drills are not added to workout drafts automatically. */
export type AssistedArea = 'planche' | 'handstand' | 'compression' | 'flag';

export interface AssistedDrill {
  id: string;
  title: string;
  tool: string;
  when: string;
  dose?: string;
  note?: string;
  goal?: string;
  relatedSlug?: string; // A related movement in the catalog, not necessarily this exact equipment variation.
}

export interface AssistedCategory {
  id: AssistedArea;
  title: string;
  short: string;
  progression: string;
  drills: AssistedDrill[];
}

export const ASSISTED_SKILLS: AssistedCategory[] = [
  {
    id: 'planche',
    title: 'Planche assistance',
    short: 'Straight-arm shape before lower band help',
    progression: 'Tuck under 5 sec → supported tuck → stable 3 × 12 sec tuck → advanced tuck → 3 × 10 sec advanced tuck → assisted straddle/full.',
    drills: [
      { id:'band-tuck', title:'Band tuck planche', tool:'Band at hips or knees', when:'Tuck planche is under 5 sec (current starting point)', dose:'5–8 × 5–12 sec · rest ~2 min', goal:'planche', relatedSlug:'band-assisted-tuck-planche' },
      { id:'box-tuck', title:'Box tuck planche', tool:'Soft plyo box under shins', when:'Build time and control in the tuck position', goal:'planche', relatedSlug:'tuck-planche', note:'Keep box stable; this is a regression, not a substitute for a freestanding tuck.' },
      { id:'band-lean', title:'Band planche lean', tool:'Band supported at hips', when:'Practice a deeper lean than you can hold unassisted', goal:'planche', relatedSlug:'planche-lean', note:'Still lean forward actively; the band should never pull you into the position.' },
      { id:'band-advanced', title:'Band advanced tuck', tool:'Light band at hips', when:'After 3 × 12 sec clean tuck holds', goal:'planche', relatedSlug:'advanced-tuck-planche' },
      { id:'band-full', title:'Band straddle / full planche', tool:'Band at hips', when:'After 3 × 10 sec clean advanced tuck holds', goal:'planche', relatedSlug:'straddle-planche', note:'Progress through assisted straddle before attempting full planche.' },
    ],
  },
  {
    id: 'handstand',
    title: 'Handstand support',
    short: 'Blocks, bail practice, controlled wall work',
    progression: 'Controlled wall line → safe bail → kick-ups → unsupported balance; assistance is optional.',
    drills: [
      { id:'block-kickups', title:'Kick-ups with hands on blocks', tool:'2 firm yoga blocks', when:'Controlled entries without collapsing onto the wrists', dose:'5 controlled tries', goal:'handstand', relatedSlug:'freestanding-handstand-kick-up', note:'Use only rigid, stable blocks with a non-slip contact surface.' },
      { id:'bail-practice', title:'Bail practice', tool:'Mat / crash pad', when:'Before freestanding handstand attempts', dose:'5 each direction', goal:'handstand', relatedSlug:'handstand-bail', note:'Practice on a clear floor with a trained spotter if you are not confident exiting.' },
      { id:'band-wall-hold', title:'Wall hold, band above wrists', tool:'Light loop band above wrists', when:'Shoulder positioning and active outward pressure', dose:'3 × 30 sec', goal:'handstand', relatedSlug:'chest-to-wall-handstand', note:'Band is around the arms, not overhead suspension; keep wrists comfortable.' },
      { id:'roller-wall-walks', title:'Wall walks with feet on roller', tool:'Foam roller', when:'Advanced shoulder loading and body-line control', dose:'3 × 5 reps', goal:'handstand', relatedSlug:'wall-handstand', note:'The roller can slip. Keep this drill optional and use stable wall walks if balance is not controlled.' },
    ],
  },
  {
    id: 'compression',
    title: 'Compression & press',
    short: 'Active hip flexion and straight-arm press assistance',
    progression: 'Tuck L-sit → longer holds → pike/straddle lifts → elevated press → band-assisted straddle press.',
    drills: [
      { id:'block-lsit', title:'L-sit on blocks', tool:'2 firm yoga blocks', when:'Start elevated; progress to floor after a controlled 30-sec hold', dose:'5 quality holds', goal:'l-sit', relatedSlug:'l-sit-tuck-hold', note:'Use the tuck version first when full-leg compression is not ready.' },
      { id:'block-pike', title:'Pike lifts with hands on blocks', tool:'2 firm yoga blocks', when:'Increase active hip flexion without leaning back', dose:'3 × 10 reps', goal:'pike-compression', relatedSlug:'seated-pike-lift' },
      { id:'pike-slides', title:'Pike slides', tool:'Foam roller', when:'Train controlled pike compression movement', dose:'3 × 8 reps', goal:'pike-compression', relatedSlug:'seated-pike-lift', note:'The linked catalog movement is a related regression, not this roller variation.' },
      { id:'reverse-plank', title:'Reverse plank to pike', tool:'Foam roller', when:'Explore active trunk compression with controlled shoulders', dose:'3 × 8 reps', goal:'pike-compression', relatedSlug:'pike-support-hold', note:'Move only in a comfortable shoulder range.' },
      { id:'elevated-press', title:'Elevated press', tool:'Soft plyo box', when:'Build the press while reducing the compression requirement', dose:'3 × 3 reps', goal:'straddle-press', relatedSlug:'elevated-straddle-press', note:'Box must not shift under load.' },
      { id:'band-straddle', title:'Band-assisted straddle press', tool:'Band supporting hips', when:'Controlled lowering and rising through the press path', dose:'3 × 3 slow reps', goal:'straddle-press', relatedSlug:'straddle-press-to-hs', note:'Overhead anchor must be rated and secure. A band is not fall protection.' },
    ],
  },
  {
    id: 'flag',
    title: 'Human flag support',
    short: 'Only after your support and readiness checks',
    progression: 'Flag plank / support press readiness → band at feet → knees → hips → thinner band → unassisted flag.',
    drills: [
      { id:'flag-feet', title:'Band-assisted flag · feet', tool:'Heavy band at feet', when:'First supported flag stage after readiness checks', dose:'4 × 8–10 sec per side', goal:'human-flag', relatedSlug:'band-assisted-human-flag' },
      { id:'flag-knees', title:'Band-assisted flag · knees', tool:'Medium band at knees', when:'After controlled holds in the feet-assisted stage', dose:'4 × 8–10 sec per side', goal:'human-flag', relatedSlug:'band-assisted-human-flag' },
      { id:'flag-hips', title:'Band-assisted flag · hips', tool:'Light band at hips', when:'After controlled holds with knee support', dose:'4 × 8–10 sec per side', goal:'human-flag', relatedSlug:'band-assisted-human-flag' },
      { id:'flag-box', title:'Hip-supported flag', tool:'Soft plyo box', when:'Practice a stable side-body position with minimal resistance', dose:'4 × 10 sec per side', goal:'human-flag', relatedSlug:'feet-assisted-human-flag', note:'The linked catalog entry is related assisted flag work, not the box drill.' },
    ],
  },
];

export const ASSISTED_GEAR = [
  'Light, medium and heavy loop bands',
  '2 firm, non-slip yoga blocks',
  'Foam roller',
  'Stable soft plyo box',
  'Mat or crash pad',
  'Load-rated fixed anchor when using overhead assistance',
];
