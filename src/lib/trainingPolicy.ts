import catalog from '../data/publicExerciseCatalog.json';
import aliases from '../data/catalogAliases.json';
export type TrainingTier=1|2|3|4|5;
export const TRAINING_LEVELS=[{id:1,label:'L1 · Starting',note:'Supported positions and simple movement'},{id:2,label:'L2 · Foundation',note:'Repeatable basic strength and control'},{id:3,label:'L3 · Building',note:'Tuck skills, active compression and assisted presses'},{id:4,label:'L4 · Advanced',note:'Inversion strength and longer levers'},{id:5,label:'L5 · Elite',note:'Full skills and demanding unilateral work'}] as const;
export const CAPABILITIES=[{id:'push-base',label:'Controlled basic push-ups'},{id:'pull-base',label:'Controlled pulling and hanging'},{id:'support-base',label:'Stable straight-arm support'},{id:'inversion-control',label:'Controlled handstand entry and exit'},{id:'compression-control',label:'Controlled straight-leg compression lifts'},{id:'straight-arm-base',label:'Comfortable planche lean with straight elbows'}] as const;
export type Capability=typeof CAPABILITIES[number]['id'];
export type TrainingReadiness={tier?:TrainingTier;capabilities?:Capability[];equipment?:readonly string[]};
type Rule={tier?:TrainingTier;requires?:Capability[];regression?:string;metric?:'seconds'|'reps';target?:number};
export const RULES:Record<string,Rule>={
 'diamond-push-up':{tier:3,requires:['push-base'],regression:'push-up'},'bulgarian-split-squat':{tier:3,regression:'split-squat'},'cossack-squat':{tier:3,regression:'bodyweight-squat'},'headstand':{tier:3,requires:['inversion-control']},'ring-push-ups':{tier:3,requires:['push-base'],regression:'incline-push-up'},'skin-the-cat':{tier:4,requires:['pull-base','support-base']},'band-assisted-pull-up':{tier:2,regression:'australian-row'},
 'child-s-pose':{tier:1,metric:'seconds'},'childs-pose':{tier:1,metric:'seconds'},'standing-pike':{tier:2,metric:'seconds'},
 'kneeling-planche-plank':{tier:1,metric:'seconds'},'pike-support-hold':{tier:1,metric:'seconds'},'wall-toe-taps':{tier:3,requires:['inversion-control'],regression:'pike-support-hold'},
 'push-up':{tier:2,regression:'incline-push-up'},'incline-push-up':{tier:1,regression:'wall-push-up'},'bodyweight-squat':{tier:1},
 'one-arm-push-up':{tier:5,requires:['push-base','support-base'],regression:'incline-one-arm-push-up'},'one-arm-chin-up':{tier:5,requires:['pull-base'],regression:'archer-pull-up'},
 'incline-one-arm-push-up':{tier:4,requires:['push-base'],regression:'archer-push-up'},'archer-push-up':{tier:3,requires:['push-base'],regression:'push-up'},
 'chin-up':{tier:3,requires:['pull-base'],regression:'band-assisted-pull-up'},'pull-up':{tier:3,requires:['pull-base'],regression:'australian-row'},'weighted-pull-up':{tier:4,requires:['pull-base'],regression:'pull-up'},
 'planche-lean':{tier:2,regression:'quadruped-planche-lean',metric:'seconds'},'planche-plank':{tier:2,regression:'quadruped-planche-lean',metric:'seconds'},'quadruped-planche-lean':{tier:1,metric:'seconds'},
 'tuck-planche':{tier:3,requires:['straight-arm-base'],regression:'planche-lean',metric:'seconds'},'band-assisted-tuck-planche':{tier:3,requires:['straight-arm-base'],regression:'planche-lean',metric:'seconds'},
 'parallette-tuck-planche':{tier:3,requires:['straight-arm-base'],regression:'planche-lean',metric:'seconds'},'advanced-tuck-planche':{tier:4,requires:['straight-arm-base','support-base'],regression:'tuck-planche',metric:'seconds'},
 'straddle-planche':{tier:5,requires:['straight-arm-base','support-base'],regression:'advanced-tuck-planche',metric:'seconds'},'full-planche':{tier:5,requires:['straight-arm-base','support-base'],regression:'advanced-tuck-planche',metric:'seconds'},
 'straddle-hs-kick-up':{tier:3,requires:['inversion-control'],regression:'slow-frogger-toe-pull'},'freestanding-handstand-kick-up':{tier:3,requires:['inversion-control'],regression:'chest-to-wall-handstand'},
 'freestanding-handstand':{tier:4,requires:['inversion-control'],regression:'chest-to-wall-handstand',metric:'seconds'},'handstand-walking':{tier:5,requires:['inversion-control'],regression:'freestanding-handstand'},
 'wall-handstand':{tier:2,regression:'wall-support-shrug',metric:'seconds'},'chest-to-wall-handstand':{tier:2,regression:'wall-support-shrug',metric:'seconds'},'chest-to-wall-handstand-hold':{tier:3,regression:'chest-to-wall-handstand',metric:'seconds'},
 'handstand-heel-pull':{tier:3,requires:['inversion-control'],regression:'chest-to-wall-handstand',metric:'seconds'},'handstand-bail':{tier:2,regression:'hip-lift-setup'},
 'straddle-press-to-hs':{tier:4,requires:['inversion-control','compression-control','support-base'],regression:'straight-leg-frogger'},'stalder-press-to-hs':{tier:5,requires:['inversion-control','compression-control','straight-arm-base'],regression:'stalder-toe-assisted-press'},
 'stalder-negative':{tier:5,requires:['inversion-control','compression-control'],regression:'stalder-toe-assisted-press'},'stalder-toe-assisted-press':{tier:3,requires:['support-base'],regression:'stalder-feet-assisted-hip-lift'},
 'wall-press-negative':{tier:4,requires:['inversion-control'],regression:'straight-leg-frogger'},'elevated-straddle-press':{tier:4,requires:['inversion-control','compression-control'],regression:'straight-leg-frogger'},
 'handstand-push-up':{tier:4,requires:['inversion-control','push-base'],regression:'elevated-pike-push-up'},'wall-hspu-negative':{tier:4,requires:['inversion-control','push-base'],regression:'elevated-pike-push-up'},'partial-rom-wall-hspu':{tier:4,requires:['inversion-control','push-base'],regression:'elevated-pike-push-up'},
 'pike-push-up':{tier:2,regression:'incline-pike-push-up'},'elevated-pike-push-up':{tier:3,requires:['push-base'],regression:'pike-push-up'},
 'seated-straddle-lift':{tier:2,regression:'bent-knee-straddle-lift'},'seated-straddle-compression-lift':{tier:3,regression:'bent-knee-straddle-lift'},'seated-pike-lift':{tier:2,regression:'bent-knee-compression-lift'},
 'pike-compression-hold':{tier:3,regression:'single-leg-pike-lift',metric:'seconds'},'straddle-compression-hold':{tier:3,regression:'bent-knee-straddle-lift',metric:'seconds'},
 'tuck-sit':{tier:2,metric:'seconds'},'l-sit-tuck-hold':{tier:2,metric:'seconds'},'l-sit':{tier:3,requires:['support-base','compression-control'],regression:'tuck-sit',metric:'seconds'},'one-leg-l-sit':{tier:3,requires:['support-base'],regression:'tuck-sit',metric:'seconds'},'v-sit-preparation':{tier:4,requires:['support-base','compression-control'],regression:'l-sit',metric:'seconds'},
 'ring-support-hold':{tier:2,regression:'assisted-ring-support-hold',metric:'seconds'},'ring-dip':{tier:3,requires:['support-base'],regression:'assisted-ring-dip'},'ring-dips':{tier:3,requires:['support-base'],regression:'assisted-ring-dip'},'parallel-bar-dip':{tier:3,requires:['support-base'],regression:'wall-push-up'},
 'ring-push-up':{tier:3,requires:['push-base'],regression:'incline-push-up'},'ring-muscle-up':{tier:5,requires:['pull-base','support-base'],regression:'low-ring-muscle-up-assisted'},'low-ring-muscle-up-assisted':{tier:4,requires:['pull-base','support-base'],regression:'false-grip-ring-row'},
 'tuck-front-lever':{tier:3,requires:['pull-base'],regression:'australian-row',metric:'seconds'},'front-lever':{tier:5,requires:['pull-base','support-base'],regression:'tuck-front-lever',metric:'seconds'},
 'back-lever':{tier:5,requires:['pull-base','support-base'],regression:'ring-support-hold',metric:'seconds'},'human-flag':{tier:5,requires:['pull-base','support-base'],regression:'side-plank',metric:'seconds'},'clutch-flag':{tier:4,requires:['pull-base'],regression:'side-plank',metric:'seconds'},
 'assisted-pistol-squat':{tier:3,regression:'split-squat'},'pistol-squat':{tier:4,regression:'split-squat'},'crow-pose':{tier:3,regression:'supported-crow-balance',metric:'seconds'},'supported-crow-balance':{tier:2,metric:'seconds'},'frog-stand':{tier:2,regression:'supported-crow-balance',metric:'seconds'},
 'assisted-elbow-lever':{tier:2,metric:'seconds'},'elbow-lever':{tier:3,regression:'assisted-elbow-lever',metric:'seconds'},'single-arm-elbow-lever':{tier:5,requires:['support-base'],regression:'elbow-lever',metric:'seconds'},
 'hollow-body-hold':{tier:2,regression:'dead-bug',metric:'seconds'},'active-hang':{tier:1,metric:'seconds'},'side-plank':{tier:2,regression:'dead-bug',metric:'seconds'},
};
// Static shapes are timed; movement quality and support are more useful than rep counts here.
for(const slug of ['bridge-pose','camel-pose','chair-pose','cobra-pose','dolphin-pose','downward-dog','half-moon-pose','pigeon-pose','tree-pose','triangle-pose','warrior-i','warrior-ii','warrior-iii','wheel-pose','passe-balance','arabesque-hold','attitude-hold','penche','needle','middle-split','front-split','front-split-preparation','deep-squat-hold','wall-compression-stretch'])RULES[slug]={...RULES[slug],metric:'seconds'};
Object.assign(RULES,{
 'grand-plie':{tier:3,regression:'first-position-plie'},'first-position-plie':{tier:1},'port-de-bras':{tier:1},'tendu':{tier:1},'calf-raise':{tier:1},'releve':{tier:2,regression:'calf-raise'},
 'passe-balance':{tier:2,regression:'calf-raise',metric:'seconds'},'wheel-pose':{tier:4,regression:'bridge-pose',metric:'seconds'},
 'iron-cross':{tier:5,requires:['support-base','straight-arm-base'],regression:'ring-turnout-support-hold',metric:'seconds'},
 'maltese':{tier:5,requires:['support-base','straight-arm-base'],regression:'ring-turnout-support-hold',metric:'seconds'},
 'victorian-cross':{tier:5,requires:['support-base','pull-base','straight-arm-base'],regression:'ring-support-hold',metric:'seconds'},
 'bent-arm-handstand':{tier:4,requires:['push-base','inversion-control'],regression:'pike-push-up',metric:'seconds'},
 'l-sit-to-handstand':{tier:5,requires:['support-base','compression-control','inversion-control'],regression:'stalder-feet-assisted-hip-lift'},
 'muscle-up':{tier:5,requires:['pull-base','support-base'],regression:'pull-up'},
 'hspu-capacity-builder':{tier:4,requires:['push-base','inversion-control'],regression:'elevated-pike-push-up'},
 'press-hs-journey':{tier:4,requires:['support-base','compression-control','inversion-control'],regression:'bent-knee-compression-lift'},
 'forearm-stand-line-hold':{tier:3,requires:['inversion-control'],regression:'dolphin-pose',metric:'seconds'},
 'forearm-stand-toe-pulls':{tier:4,requires:['inversion-control'],regression:'dolphin-pose'},
 'elbow-stand-wall-hold':{tier:3,requires:['inversion-control'],regression:'dolphin-pose',metric:'seconds'},
 'elbow-stand-straddle-entry':{tier:4,requires:['inversion-control'],regression:'dolphin-pose'},
 'elbow-stand-exit':{tier:3,requires:['inversion-control'],regression:'dolphin-pose'},
});
for(const [alias,canonical] of Object.entries(aliases)){const e=catalog.find(e=>e.slug===canonical);RULES[alias]={tier:Math.max(1,Math.min(5,e?.difficulty_level||1)) as TrainingTier,...RULES[canonical]};}
const bySlug=new Map(catalog.map(e=>[e.slug,e]));
export function minimumTier(slug:string):TrainingTier {return RULES[slug]?.tier || Math.max(1,Math.min(5,bySlug.get(slug)?.difficulty_level||1)) as TrainingTier;}
export function readinessReasons(slug:string,profile:TrainingReadiness):string[]{
 const reasons:string[]=[];const tier=profile.tier||1;
 if(minimumTier(slug)>tier)reasons.push(`L${minimumTier(slug)} movement; your current level is L${tier}.`);
 for(const cap of RULES[slug]?.requires||[])if(!profile.capabilities?.includes(cap))reasons.push(`Readiness: ${CAPABILITIES.find(c=>c.id===cap)?.label||cap}.`);
 return reasons;
}
export function allowedAtLevel(slug:string,profile:TrainingReadiness){return readinessReasons(slug,profile).length===0;}
export function safeProfile(value:unknown):{tier:TrainingTier;capabilities:Capability[]}{
 const x=value&&typeof value==='object'?value as TrainingReadiness:{};
 return {tier:([1,2,3,4,5].includes(Number(x.tier))?Number(x.tier):1) as TrainingTier,capabilities:Array.isArray(x.capabilities)?CAPABILITIES.filter(c=>x.capabilities.includes(c.id)).map(c=>c.id):[]};
}
export function approvedRegression(slug:string,profile:TrainingReadiness):string|null {
 const seen=new Set<string>();let current=RULES[slug]?.regression;
 while(current&&!seen.has(current)){seen.add(current);if(allowedAtLevel(current,profile)&&(!profile.equipment||!equipmentReasons(current,profile.equipment).length))return current;current=RULES[current]?.regression;}
 return null;
}
export function exerciseReadinessReasons(exercise:{slug:string;name?:string;difficulty_level?:number|null},profile:TrainingReadiness){
 if(bySlug.has(exercise.slug))return readinessReasons(exercise.slug,profile);
 const tier=/one[ -]?arm.*push[ -]?up/i.test(exercise.name||'')?5:Math.max(1,Math.min(5,Number(exercise.difficulty_level)||1));
 return tier>(profile.tier||1)?[`L${tier} movement; your current level is L${profile.tier||1}.`]:[];
}
export function equipmentReasons(slug:string,available:readonly string[]):string[]{
 const exercise=bySlug.get(slug);if(!exercise)return[];const eq=(exercise.equipment||[]).map(e=>e.toLowerCase());const reasons:string[]=[];
 const ring=eq.some(e=>/rings/.test(e))||/ring|false-grip/.test(slug);const bar=eq.some(e=>/pull.?up bar|horizontal bar/.test(e));
 if(ring&&bar&&!/ring/.test(slug)){if(!available.includes('bar')&&!available.includes('rings'))reasons.push('A pull-up bar or gymnastic rings are required.');}
 else{if(ring&&!available.includes('rings'))reasons.push('Gymnastic rings are required.');if(bar&&!available.includes('bar'))reasons.push('A pull-up bar is required.');}
 if(eq.some(e=>/chair|bench|box/.test(e))&&!available.includes('bench'))reasons.push('A stable bench, box or chair is required.');
 if(eq.some(e=>/band/.test(e))&&!available.includes('bands'))reasons.push('A suitable resistance band is required.');
 if((/parallette/.test(slug)||eq.some(e=>/parallettes|parallel bars/.test(e))&&!eq.includes('floor'))&&!available.includes('parallettes'))reasons.push('Parallettes or suitable parallel bars are required.');
 if((eq.includes('wall')||/wall|chest-to-wall/.test(slug))&&!available.includes('wall'))reasons.push('A clear wall is required.');
 if(eq.includes('pool')&&!available.includes('pool'))reasons.push('Access to a suitable swimming pool is required.');
 if(/human-flag|clutch-flag/.test(slug)&&!available.includes('pole'))reasons.push('Suitable stable flag apparatus is required.');
 return reasons;
}
