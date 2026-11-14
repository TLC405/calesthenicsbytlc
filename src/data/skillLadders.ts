/** Explicit user-supplied stage tests: self-reported coaching milestones, not medical standards. */
export interface LadderStep {
  title:string;
  standard:string;
  slug?:string;
  goal?:string;
  note?:string;
}
export interface SkillLadder {
  id:string;
  title:string;
  group:'Pull'|'Legs';
  description:string;
  gate?:string;
  steps:LadderStep[];
  regressions:string[];
}
export const SKILL_LADDERS:SkillLadder[]=[
  {id:'pullup',title:'Pull-up',group:'Pull',description:'From supported hanging to weighted strength',steps:[
    {title:'Grip + scapular control',standard:'Dead hang 30 sec AND 10 scap pulls',slug:'dead-hang',goal:'pull-up'},
    {title:'Negative pull-ups',standard:'5 controlled negatives, 5 sec each',slug:'band-assisted-pull-up',goal:'pull-up',note:'Linked assisted pull-up is a regression, not an exact negative.'},
    {title:'Strict pull-ups',standard:'5 strict reps',slug:'pull-up',goal:'pull-up'},
    {title:'Volume',standard:'10 strict pull-ups',slug:'pull-up',goal:'pull-up'},
    {title:'Chest-to-bar + archer',standard:'8 chest-to-bar plus 5 archer pull-ups each side',slug:'archer-pull-up',goal:'pull-up',note:'Linked archer pull-up is only one part of the paired test.'},
    {title:'Weighted pull-ups',standard:'+20% bodyweight for 5 controlled reps',slug:'weighted-pull-up',goal:'pull-up'},
  ],regressions:['Band assistance: ~22 → 11 → 6 kg, measured by load, not band color','5-sec negatives','Jump to the top and hold 10 sec with a safe landing']},
  {id:'muscleup',title:'Muscle-up',group:'Pull',description:'Straight-bar transition and high pulling',steps:[
    {title:'Strength prerequisites',standard:'10 straight-bar dips AND 10 strict pull-ups',slug:'pull-up',goal:'pull-up'},
    {title:'Explosive chest-to-bar',standard:'5 controlled explosive reps',slug:'pull-up',goal:'pull-up'},
    {title:'High pulls to waist',standard:'3 controlled reps',slug:'pull-up',goal:'pull-up'},
    {title:'Band + eccentric transition',standard:'3 band-assisted reps AND 3 slow negatives',slug:'ring-muscle-up-transition-drill',goal:'ring-muscle-up',note:'Linked transition drill is on rings, not a straight bar.'},
    {title:'Strict muscle-up',standard:'1 controlled unassisted rep',slug:'muscle-up',goal:'ring-muscle-up'},
  ],regressions:['False-grip hang','Band-assisted high pulls','Low-bar transition drill; learn the actual bar path']},
  {id:'frontlever',title:'Front lever',group:'Pull',description:'Requires 5 strict pull-ups first',gate:'5 strict pull-ups before starting',steps:[
    {title:'Tuck',standard:'3 × 15 sec',slug:'tuck-front-lever',goal:'front-lever'},
    {title:'Advanced tuck',standard:'3 × 10 sec',slug:'advanced-tuck-front-lever-on-rings',goal:'front-lever'},
    {title:'One leg',standard:'3 × 8 sec',slug:'tuck-front-lever',goal:'front-lever',note:'Catalog uses a related tuck stage; verify one-leg technique before loading.'},
    {title:'Straddle',standard:'3 × 5 sec',slug:'front-lever',goal:'front-lever',note:'Catalog includes full lever; this is a separate shorter-lever stage.'},
    {title:'Full front lever',standard:'1 hold of 3 sec',slug:'front-lever',goal:'front-lever'},
  ],regressions:['Band at hips or feet','Tuck negatives','Front lever raises']},
  {id:'backlever',title:'Back lever',group:'Pull',description:'Shoulder-extension tolerance first',steps:[
    {title:'German hang',standard:'3 × 15 sec',goal:'back-lever',note:'Only enter a controlled comfortable shoulder-extension range.'},
    {title:'Tuck',standard:'3 × 15 sec',slug:'ring-back-lever-tuck',goal:'back-lever'},
    {title:'Advanced tuck',standard:'3 × 10 sec',slug:'ring-back-lever-tuck',goal:'back-lever',note:'Linked tuck is a foundation exercise, not advanced tuck.'},
    {title:'Straddle',standard:'3 × 8 sec',slug:'back-lever',goal:'back-lever'},
    {title:'Full back lever',standard:'1 hold of 5 sec',slug:'back-lever',goal:'back-lever'},
  ],regressions:['Supported German hang','Band at hips or feet','Tuck negatives with a spotter or controlled exit']},
  {id:'singleleg',title:'Single-leg squat',group:'Legs',description:'Balance, pistol and dragon-pistol control',steps:[
    {title:'Squat base',standard:'60 sec deep squat AND 20 bodyweight squats',slug:'deep-squat-hold',goal:'pistol'},
    {title:'Bulgarian split squat',standard:'3 × 10 per leg',slug:'bulgarian-split-squat',goal:'leg-strength'},
    {title:'Box pistol',standard:'5 controlled reps per leg',slug:'assisted-box-pistol-sit',goal:'pistol'},
    {title:'Freestanding pistol',standard:'5 controlled reps per leg',slug:'pistol-squat',goal:'pistol'},
    {title:'Shrimp squat',standard:'5 controlled reps per leg',slug:'shrimp-squat',goal:'pistol'},
    {title:'Dragon pistol',standard:'3 controlled reps per leg AND a comfortable pancake prerequisite',goal:'pistol',note:'Dragon pistol is not currently a separately validated catalog demo; use spotter or box regression.'},
  ],regressions:['Higher box','Hold a secure pole','Hold a small counterweight in front','Dragon pistol: supported pole or controlled lower to box']},
  {id:'quad',title:'Quads + knee capacity',group:'Legs',description:'Build controlled end-range knee strength',steps:[
    {title:'Wall sit',standard:'60 sec hold',goal:'leg-strength'},
    {title:'Assisted sissy squat',standard:'3 × 10 reps',slug:'sissy-squat',goal:'leg-strength',note:'Catalog displays unassisted movement; this stage needs support.'},
    {title:'Partial reverse Nordic',standard:'3 × 8 controlled reps',goal:'posterior-chain'},
    {title:'Full sissy squat',standard:'3 × 8 reps',slug:'sissy-squat',goal:'leg-strength'},
    {title:'Full reverse Nordic',standard:'3 × 5 controlled reps',goal:'posterior-chain',note:'Reverse Nordic is not currently a matching standalone catalog exercise.'},
  ],regressions:['Pole for support','Shorten range','Band support; avoid sharp knee pain']},
  {id:'hamstring',title:'Hamstrings + Nordic',group:'Legs',description:'Hinge strength before difficult Nordics',steps:[
    {title:'Single-leg bridge',standard:'3 × 12 per leg',slug:'glute-bridge',goal:'posterior-chain',note:'The linked two-leg bridge is a regression.'},
    {title:'Sliding leg curl',standard:'3 × 10 reps',goal:'posterior-chain'},
    {title:'Single-leg RDL',standard:'3 × 10 per leg',goal:'posterior-chain'},
    {title:'Nordic negatives',standard:'4 × 3 reps with 5-sec lowering',slug:'nordic-curl',goal:'posterior-chain',note:'Use only 2 sets in Week 1, then build gradually.'},
    {title:'Full Nordic curl',standard:'3 full controlled reps',slug:'nordic-curl',goal:'posterior-chain'},
  ],regressions:['Secure feet with a rated loaded bar, a suitable pad or a partner','Push off the floor with your hands at the bottom','Band from a secure rack to the chest','Begin with partial-range eccentrics']},
  {id:'mobility',title:'Mobility + splits',group:'Legs',description:'Hip mobility and end-range control',steps:[
    {title:'Cossack squat',standard:'3 × 8 per side',slug:'cossack-squat',goal:'leg-strength'},
    {title:'Pancake',standard:'60 sec comfortable hold',slug:'pancake-stretch',goal:'pancake'},
    {title:'Front split',standard:'Supported, controlled front split each side',slug:'front-split-preparation',goal:'splits',note:'Use blocks and half-split regressions.'},
    {title:'Middle split',standard:'Supported, controlled middle split',slug:'middle-split-frog-stretch',goal:'splits',note:'The linked frog stretch is a regression; do not force range.'},
  ],regressions:['Blocks beneath hands','Half splits','Frog stretch; back off from pinching or joint pain']},
  {id:'jumps',title:'Power + jumps',group:'Legs',description:'Explosive reps only when landings are quiet and stable',steps:[
    {title:'Squat jumps',standard:'3 × 8 controlled landings',slug:'jump-squat',goal:'leg-strength'},
    {title:'Broad jump',standard:'3 × 5 controlled landings',goal:'leg-strength'},
    {title:'Tuck jumps',standard:'3 × 6 controlled landings',goal:'leg-strength'},
    {title:'Skater hops',standard:'3 × 6 per leg with balanced landings',goal:'leg-strength'},
    {title:'Box or depth jumps',standard:'3 × 5 controlled landings',goal:'leg-strength',note:'Advanced impact work: start with low-height box jumps; depth jumps require greater landing tolerance.'},
  ],regressions:['Lower jump height','Step onto a low box before jumping','Pause and stick each landing','Skip jumps if knee or ankle symptoms appear']},
];
