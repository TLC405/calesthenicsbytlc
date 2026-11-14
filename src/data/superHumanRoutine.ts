/** Optional training blueprint. Nothing is automatically preloaded into the workout builder. */
export type SessionKey = 'A' | 'B' | 'C' | 'D';
export type StageHold = 'planche' | 'flag' | 'front' | 'back' | 'lsit';
export type TrainingBlock = SessionKey | 'rest';
export interface RoutineMove {
  name:string;
  sets?:number;
  target?:string;
  count?:number;
  countUnit?:string;
  holdMetric?:StageHold;
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
export const SHIFT_CYCLE:TrainingBlock[]=['A','C','rest','B','D','rest','rest'];
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
      {title:'Strength',movements:[
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
    key:'D',title:'Levers + Pull',subtitle:'Front/back lever and secondary lateral pulling',duration:'~45 min',
    groups:[
      {title:'Lever skill holds',movements:[
        {name:'Front lever — your current stage',sets:5,holdMetric:'front',goal:'front-lever',slug:'tuck-front-lever',note:'Band-assisted tuck allowed. Avoid progressing into longer levers without the skill check.'},
        {name:'Back lever — your current stage',sets:4,holdMetric:'back',goal:'back-lever',slug:'ring-back-lever-tuck',note:'Shoulders should be comfortable in extension; use an assisted step first.'},
      ]},
      {title:'Pull and compression',movements:[
        {name:'Hanging straddle leg lift / invert',sets:3,target:'5 reps',goal:'front-lever',slug:'hanging-leg-raise',note:'Linked movement is a related hanging leg raise, not a straddle inversion.'},
        {name:'End-range hip-flexor leg lifts',sets:3,target:'10 reps',goal:'pike-compression',slug:'single-leg-pike-lift'},
      ]},
      {title:'Flag accessory',movements:[
        {name:'Flag negatives · 3–5-sec down',sets:3,target:'3 reps',goal:'human-flag',slug:'feet-assisted-human-flag',note:'Only if flag support and exits are controlled; otherwise keep the assisted stage.'},
        {name:'Side plank with hip raise',sets:2,target:'30 sec / side',goal:'human-flag',slug:'side-plank',note:'Side plank is a related regression, not the exact hip-raise drill.'},
      ]},
    ],
  },
];

export const SUPERHUMAN_BALANCE:RoutineGroup[]=[];

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
