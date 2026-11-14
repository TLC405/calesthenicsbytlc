/** Optional training blueprint. Nothing is automatically preloaded into the workout builder. */
export type SessionKey = 'A' | 'B' | 'C' | 'D' | 'E';
export type StageHold = 'planche' | 'flag' | 'front' | 'back' | 'lsit';
export type TrainingBlock = SessionKey | 'rest';
export interface RoutineMove {
  name:string;
  sets?:number;
  target?:string;
  count?:number;
  countUnit?:string;
  holdMetric?:StageHold;
  twoSetsWeekOne?:boolean;
  goal?:string;
  slug?:string;
  note?:string;
}
export interface RoutineGroup { title:string; movements:RoutineMove[] }
export interface RoutineSession {
  key:SessionKey; title:string; subtitle:string; duration:string; groups:RoutineGroup[];
}
export interface CoachingReel {
  id:string; title:string; skill:string; teaches:string; url:string; days:SessionKey[];
}
export interface HandstandSet {
  id:'heidi'|'haz'; name:string; subtitle:string; drills:RoutineMove[];
}

/** Ordered shifts-friendly sequence. Rest positions can move with the user's shifts. */
export const SHIFT_CYCLE:TrainingBlock[]=['A','D','E','rest','B','C','rest'];
export const FOUR_DAY_CYCLE:TrainingBlock[]=['A','D','E','rest','B','rest','rest'];
export const STAGE_HOLD_KEYS:StageHold[]=['planche','flag','front','back','lsit'];
export const STAGE_HOLD_LABELS:Record<StageHold,string>={
  planche:'Planche',flag:'Human flag',front:'Front lever',back:'Back lever',lsit:'L-sit',
};
export const HANDSTAND_SETS:HandstandSet[]=[
  {
    id:'heidi',name:"Set 1 · Heidi's wall drills",subtitle:'Tuck control, wall hops and L-handstand practice',
    drills:[
      {name:'Tuck slides',sets:2,target:'5 reps',goal:'handstand',note:'Choose a controlled wall-supported tuck variation.'},
      {name:'Wall hops',sets:2,target:'8 reps',goal:'handstand',slug:'wall-pull-aways',note:'This linked movement is related wall practice, not an exact wall-hop demonstration.'},
      {name:'Tuck switches',sets:2,target:'6 reps',goal:'handstand'},
      {name:'Tuck holds',sets:2,target:'15 sec',goal:'handstand',slug:'chest-to-wall-handstand',note:'Wall handstand is a related regression when tuck control is not ready.'},
      {name:'Wall L-handstand',sets:2,target:'5 reps',goal:'handstand',slug:'wall-handstand',note:'Use an L-handstand variation only with safe entry and exit.'},
    ],
  },
  {
    id:'haz',name:"Set 2 · Coach Haz's drills",subtitle:'Leg extensions, knee slides and parallette stability',
    drills:[
      {name:'Box tuck leg extensions',sets:2,target:'6 reps',goal:'handstand'},
      {name:'Chest-to-wall knee slides',sets:2,target:'5 reps',goal:'handstand',slug:'chest-to-wall-handstand'},
      {name:'Back-to-wall bent-knee extensions',sets:2,target:'6 reps',goal:'handstand',slug:'wall-handstand'},
      {name:'Side-to-wall hold',sets:2,target:'20–30 sec',goal:'handstand',slug:'wall-handstand'},
      {name:'Parallette handstand hold',sets:3,target:'10–20 sec',goal:'handstand',slug:'chest-to-wall-handstand',note:'If unsupported, use a safely supported regression instead.'},
    ],
  },
];

export const SUPERHUMAN_SESSIONS:RoutineSession[]=[
  {
    key:'A',title:'Planche + Human Flag',subtitle:'Straight-arm support, ring work and lateral strength',duration:'~60 min',
    groups:[
      {title:'Preparation',movements:[
        {name:'Wrist warm-up',target:'5 min',goal:'planche',slug:'wrist-circles'},
        {name:'Ring support',sets:3,target:'20–30 sec',goal:'rings',slug:'ring-support-hold'},
        {name:'Ring circles',sets:2,target:'5 reps',goal:'rings',note:'Small, controlled ring circles while supported; regress to static support if unstable.'},
      ]},
      {title:'Planche',movements:[
        {name:'Ring planche lean',sets:3,target:'15 sec',goal:'planche',slug:'planche-lean',note:'Catalog link is the floor lean, not a ring variation. Rings increase instability.'},
        {name:'Planche — your current stage (frog stand)',sets:5,holdMetric:'planche',goal:'planche',slug:'frog-stand',note:'Use frog stand now. Move toward tuck only when quality and readiness checks allow.'},
        {name:'Pike lean → high planche',sets:3,target:'5 reps',goal:'straight-arm',slug:'planche-lean',note:'Controlled transition. The linked lean is a foundational related movement.'},
        {name:'Tuck planche press',sets:3,target:'3 reps',goal:'planche',slug:'tuck-planche-push-up-preparation',note:'Assisted step if necessary; skip if the straight-arm shape breaks.'},
      ]},
      {title:'Human flag',movements:[
        {name:'Vertical flag',sets:4,target:'10–15 sec',goal:'human-flag',slug:'vertical-human-flag'},
        {name:'Flag — your current stage',sets:5,holdMetric:'flag',goal:'human-flag',slug:'feet-assisted-human-flag',note:'Begin with flag plank and readiness check; weak side first. Do not assume full flag readiness.'},
        {name:'Bottom tuck flag lifts',sets:3,target:'5 reps / side',goal:'human-flag',slug:'tuck-human-flag',note:'Related tuck flag progression; lower assistance before adding height.'},
        {name:'Ring side presses',sets:3,target:'5 reps / side',goal:'human-flag',note:'Use a controlled side-body support regression if shoulder or ring control is not ready.'},
      ]},
      {title:'Flag finishers + strength',movements:[
        {name:'Flag negatives · 3–5-sec lowering',sets:3,target:'3 reps',goal:'human-flag',slug:'feet-assisted-human-flag',note:'Moved from the former D. Only after controlled support and safe exits; otherwise regress.'},
        {name:'Side plank',sets:2,target:'30 sec / side',goal:'human-flag',slug:'side-plank',note:'Moved from the former D.'},
        {name:'Ring push-ups',sets:3,target:'8 reps',goal:'rings',slug:'ring-push-up'},
      ]},
    ],
  },
  {
    key:'C',title:'Compression',subtitle:'Active hip flexion, straddle control and press preparation',duration:'~50 min',
    groups:[
      {title:'Seated compression',movements:[
        {name:'Seated pike lifts · 2-sec top',sets:3,target:'10 reps',goal:'pike-compression',slug:'seated-pike-lift'},
        {name:'Seated straddle lifts · 2-sec top',sets:3,target:'8 reps',goal:'straddle-compression',slug:'seated-straddle-lift'},
        {name:'Toe-to-wrist taps',sets:3,target:'10 reps',goal:'pike-compression',slug:'seated-pike-lift',note:'Related seated compression only, not an exact movement.'},
        {name:'Sliding straddle on blocks',sets:3,target:'6 reps',goal:'straddle-compression',slug:'seated-straddle-compression-lift',note:'Use firm, non-slip blocks; catalog link is related compression work.'},
        {name:'Block lift-offs · 3-sec float',sets:4,target:'3 reps',goal:'straddle-press',slug:'stalder-feet-assisted-hip-lift'},
        {name:'Active hamstring compression',sets:3,target:'10 reps',goal:'pike-compression',slug:'seated-pike-lift'},
      ]},
      {title:'Pike to press',movements:[
        {name:'Block pike lean',sets:3,target:'20 sec',goal:'straight-arm',slug:'pike-support-hold'},
        {name:'Pike walk-in · hips over shoulders',sets:3,target:'5 reps',goal:'straddle-press',slug:'pike-support-hold',note:'Walk in only as far as shoulders and wrists stay controlled.'},
        {name:'Ankle-weight leg lift (1–2 lb)',sets:3,target:'10 reps',goal:'pike-compression',slug:'single-leg-pike-lift',note:'Use no weight until strict unweighted reps are comfortable.'},
        {name:'Box pike-up sliders',sets:3,target:'8 reps',goal:'straddle-press',slug:'elevated-straddle-press'},
      ]},
      {title:'Integrated strength',movements:[
        {name:'L-sit → toes-to-bar',sets:3,target:'5 reps',goal:'l-sit',slug:'toes-to-bar',note:'Use distinct L-sit and toes-to-bar progressions until both are controlled.'},
        {name:'Ring L-sit',sets:3,target:'10 sec',goal:'l-sit',slug:'ring-l-sit-hold'},
      ]},
    ],
  },
  {
    key:'B',title:'Press to Handstand',subtitle:'Strength transfer, supported straddle press and eccentric control',duration:'~60 min',
    groups:[
      {title:'Preparation',movements:[
        {name:'Dead hang',sets:2,target:'30 sec',goal:'front-lever',slug:'active-hang'},
        {name:'L-handstand float · box or wall',sets:4,target:'10 sec',goal:'handstand',slug:'wall-handstand',note:'Linked wall hold is a related regression.'},
      ]},
      {title:'Press mechanics',movements:[
        {name:'Handstand lowers',sets:3,target:'3 reps',goal:'straddle-press',slug:'wall-press-negative'},
        {name:'Back-supported straddle press',sets:3,target:'5 reps',goal:'straddle-press',slug:'elevated-straddle-press',note:'The linked press is related, not identical to back support.'},
        {name:'Puppy press',sets:4,target:'3 reps',goal:'straddle-press',slug:'stalder-toe-assisted-press',note:'Use a safe assisted press regression when exact drill is not familiar.'},
        {name:'Ayesha lift',sets:3,target:'5 reps',goal:'human-flag',note:'Advanced side-support drill; only after flag/shoulder readiness checks.'},
        {name:'Box pike feet-drop negative',sets:3,target:'5 reps',goal:'straddle-press',slug:'wall-press-negative',note:'The linked wall press negative is a related eccentric progression.'},
        {name:'Pike loads',sets:3,target:'6 reps',goal:'pike-compression',slug:'pike-support-hold'},
        {name:'Wall press compression',sets:3,target:'5 reps',goal:'straddle-press',slug:'wall-press-negative'},
      ]},
      {title:'Floor pressing',movements:[
        {name:'Lolasana',sets:3,target:'10 sec',goal:'l-sit',slug:'tuck-sit',note:'Related tuck support only, not a lolasana tutorial.'},
        {name:'Lifted L-sit',sets:3,target:'10 sec',goal:'l-sit',slug:'l-sit'},
        {name:'Floor press attempts',sets:3,target:'2 reps',goal:'straddle-press',slug:'straddle-press-to-hs',note:'Use foot or band assistance unless an unassisted press is already controlled.'},
      ]},
      {title:'Mobility',movements:[
        {name:'Weighted pike stretch + flutter',sets:3,target:'30 sec',goal:'pike-compression',slug:'pike-stretch',note:'Begin unloaded; weighted end-range stretches are optional.'},
        {name:'Pancake stretch',sets:2,target:'60 sec',goal:'straddle-compression',slug:'pancake-stretch'},
      ]},
    ],
  },
  {
    key:'D',title:'Pull + Levers + Muscle-up',subtitle:'Pulling strength, front/back lever stages and bar transitions',duration:'~65 min',
    groups:[
      {title:'Prepare',movements:[
        {name:'Scapular pulls',sets:2,target:'10 reps',goal:'pull-up',slug:'scapular-pull-up'},
        {name:'Dead hang',sets:2,target:'30 sec',goal:'pull-up',slug:'dead-hang'},
      ]},
      {title:'Main skills',movements:[
        {name:'Muscle-up — current stage',sets:5,target:'2–3 reps',goal:'ring-muscle-up',slug:'ring-muscle-up-transition-drill',note:'Use 4–5 quality sets; linked movement is a related ring transition, not an exact straight-bar drill.'},
        {name:'Front lever — current stage (band OK)',sets:5,holdMetric:'front',goal:'front-lever',slug:'tuck-front-lever',note:'Front-lever ladder requires 5 strict pull-ups first.'},
        {name:'Back lever — current stage',sets:4,holdMetric:'back',goal:'back-lever',slug:'ring-back-lever-tuck',note:'Regress for discomfort in shoulder extension.'},
      ]},
      {title:'Pull strength',movements:[
        {name:'Pull-ups — current stage',sets:4,target:'stop 1–2 reps short',goal:'pull-up',slug:'pull-up'},
        {name:'Straight-bar dips',sets:3,target:'8 reps',goal:'dip',slug:'parallel-bar-dip',note:'Catalog links to a parallel-bar dip; straight-bar version needs a secure bar and clear transition.'},
        {name:'Tuck front lever raises',sets:3,target:'5 reps',goal:'front-lever',slug:'front-lever-raise'},
        {name:'Hanging straddle leg lift / invert',sets:3,target:'5 reps',goal:'hanging-core',slug:'hanging-leg-raise',note:'Related hanging leg raise, not an exact straddle inversion.'},
        {name:'End-range hip-flexor leg lifts',sets:3,target:'10 reps',goal:'pike-compression',slug:'single-leg-pike-lift'},
        {name:'Ring rows',sets:3,target:'12 reps',goal:'ring-pull',slug:'ring-row'},
      ]},
    ],
  },
  {
    key:'E',title:'Leg Strength + Mobility',subtitle:'Single-leg strength, Nordic hinge, knee capacity and splits',duration:'~60 min',
    groups:[
      {title:'Warm-up',movements:[
        {name:'Deep squat hold + ankle rocks',sets:2,target:'60 sec',goal:'ankle-squat-mobility',slug:'deep-squat-hold',note:'Linked drill is the squat hold; add controlled ankle rocks separately.'},
        {name:'Cossack squats',sets:2,target:'6 reps / side',goal:'leg-strength',slug:'cossack-squat'},
      ]},
      {title:'Power first',movements:[
        {name:'Jumps — current ladder stage',sets:3,target:'5–8 reps',goal:'leg-strength',slug:'jump-squat',note:'Choose your current jump stage. Broad, depth and box jumps are distinct drills; progress only with soft landings and adequate clearance.'},
      ]},
      {title:'Main strength',movements:[
        {name:'Single-leg squat — current stage',sets:4,target:'5 reps / leg',goal:'pistol',slug:'assisted-pistol-squat',note:'Pistol, shrimp and dragon pistol are later ladder steps, not simultaneous required exercises.'},
        {name:'Nordic — current stage · 5 sec down for negatives',sets:4,target:'3 reps',twoSetsWeekOne:true,goal:'posterior-chain',slug:'nordic-curl',note:'2 sets in Week 1. Strong foot anchor, controlled assistance, and appropriate range.'},
        {name:'Sissy squat OR reverse Nordic — current stage',sets:3,target:'8 reps',twoSetsWeekOne:true,goal:'leg-strength',slug:'sissy-squat',note:'2 sets in Week 1. Choose one knee-dominant progression; link shows a related sissy squat, not reverse Nordic.'},
        {name:'Bulgarian split squat',sets:3,target:'10 reps / leg',goal:'leg-strength',slug:'bulgarian-split-squat'},
        {name:'Sliding leg curl OR single-leg RDL',sets:3,target:'10 reps',goal:'posterior-chain',slug:'glute-bridge',note:'Use a hamstring-regression drill that fits your equipment; the linked bridge is related, not an exact match.'},
      ]},
      {title:'Lower legs',movements:[
        {name:'Single-leg calf raise',sets:3,target:'15 reps / leg',goal:'leg-strength',slug:'single-leg-calf-raise'},
        {name:'Tibialis raise',sets:2,target:'20 reps',goal:'leg-strength',slug:'tibialis-raise'},
        {name:'Wall sit finisher',sets:1,target:'60 sec',goal:'leg-strength',note:'Hold pain-free knee depth; reduce or skip after demanding knee work.'},
      ]},
      {title:'Mobility',movements:[
        {name:'Pancake stretch',sets:2,target:'60 sec',goal:'pancake',slug:'pancake-stretch'},
        {name:'Front split · each side',sets:2,target:'60 sec / side',goal:'splits',slug:'front-split-preparation',note:'Use a supported half split if full range is not comfortable.'},
        {name:'Middle split',sets:2,target:'60 sec',goal:'splits',slug:'middle-split-frog-stretch',note:'The linked frog stretch is a regression, not the full split.'},
      ]},
    ],
  },
];

export const SUPERHUMAN_BALANCE:RoutineGroup[]=[];

/** Four-day option: split the most useful compression moves into two short optional finishers. */
export const FOUR_DAY_COMPRESSION:Record<'B'|'E',RoutineGroup>={
  E:{title:'+15 min compression · 4-day version',movements:[
    {name:'Seated pike lifts · 2-sec top',sets:2,target:'8 reps',goal:'pike-compression',slug:'seated-pike-lift'},
    {name:'Seated straddle lifts · 2-sec top',sets:2,target:'6 reps',goal:'straddle-compression',slug:'seated-straddle-lift'},
    {name:'Block lift-offs',sets:2,target:'3 reps',goal:'straddle-press',slug:'stalder-feet-assisted-hip-lift'},
  ]},
  B:{title:'+15 min compression · 4-day version',movements:[
    {name:'Toe-to-wrist taps',sets:2,target:'8 reps',goal:'pike-compression',slug:'seated-pike-lift',note:'Related compression drill; exact tap variation not in catalog.'},
    {name:'Active hamstring compression',sets:2,target:'10 reps',goal:'pike-compression',slug:'seated-pike-lift'},
    {name:'Ring L-sit or tuck L-sit',sets:2,target:'10 sec',goal:'l-sit',slug:'ring-l-sit-hold'},
  ]},
};


export const SUPERHUMAN_REELS: CoachingReel[] = [
  { id: 'press-strength', title: 'Press strength progressions', skill: 'Press to handstand', teaches: 'Lifted L-sits, lolasana, handstand lowers and floor press', url: 'https://www.instagram.com/reel/DXNqiJnjrRU', days: ['A','B'] },
  { id: 'press-drills', title: 'Drills that got my press', skill: 'Press to handstand', teaches: 'Back-supported straddle press and hand placement', url: 'https://www.instagram.com/reel/DPZtZUBDknp?hl=en', days: ['B','C'] },
  { id: 'ty-press', title: 'ty.mfeldman press workout', skill: 'Press to handstand', teaches: 'Straddle lifts 2 × 5–10, toe-to-wrist taps and pancake', url: 'https://www.instagram.com/reel/DZyZpR6qBfu', days: ['B'] },
  { id: 'straddle-compression', title: 'Straddle press and compression', skill: 'Compression', teaches: 'Seated straddle lift and sliding straddle on blocks', url: 'https://www.instagram.com/p/DSNA2XciKHG', days: ['B'] },
  { id: 'press-carryover', title: 'Press drills that carry over', skill: 'Compression', teaches: 'Block lift-offs and active hamstring compression', url: 'https://www.instagram.com/reel/DTlvC1NkfPQ', days: ['B'] },
  { id: 'press-planche', title: 'Press or planche bridge', skill: 'Planche and press', teaches: 'Pike lean to high planche and tuck planche press', url: 'https://www.instagram.com/reel/DQt1XJiDaiY', days: ['A'] },
  { id: 'front-lever', title: '6 front lever progressions', skill: 'Front lever', teaches: 'Six levels with and without band assistance', url: 'https://www.instagram.com/reel/DcZLRXxsP1P', days: ['D'] },
  { id: 'back-lever', title: '3 back lever drills', skill: 'Back lever', teaches: 'Starter to advanced holds and front-lever crossover', url: 'https://www.instagram.com/reel/DdY6mXEsd_Q', days: ['C'] },
];
