import catalog from './publicExerciseCatalog.json';
import { type SkillPath } from './skillPaths';

/** Supporting movements are curated OPTIONAL assistance, never hard prerequisites.
 * Source: movements already present in the TLC catalog, curated by movement pattern.
 * Do not mistake different drills sharing a difficulty tier for equivalent standards.
 */
export type MovementNeed='strength'|'mobility'|'control'|'preparation'|'variation';
export type MovementRequirement={slug:string;name:string;role:MovementNeed;why:string;level:number;inMainPath:boolean};
const known=new Map(catalog.map(e=>[e.slug,e]));
const roleCopy:Record<MovementNeed,{title:string;why:string}>={
 strength:{title:'Strength',why:'Complementary strength practice, not a required pass test'},
 mobility:{title:'Mobility',why:'Range-of-motion option to use only when relevant and comfortable'},
 control:{title:'Control',why:'Balance, positioning or scapular-control practice'},
 preparation:{title:'Preparation',why:'Gradual exposure and joint-ready movement preparation'},
 variation:{title:'Extra variation',why:'Optional alternate movement; not necessarily the next progression step'}
};
export const MOVEMENT_NEED_LABELS=roleCopy;
// Written as pathway | role | existing catalog slugs. Different roles are deliberately independent.
const REQUIREMENT_ROWS=String.raw`
grip|strength|plate-pinch-hold,gripper-crush,false-grip-ring-hang|preparation|wrist-circles,band-finger-extension|control|scapular-pull-up
foundation|strength|push-up,pull-up,parallel-bar-dip,bodyweight-squat|preparation|wrist-circles,wall-ankle-dorsiflexion|control|scapular-push-up
planche|strength|pseudo-planche-push-up,hollow-body-hold|preparation|wrist-circles,scapular-push-up|control|planche-plank
straight-arm|strength|pseudo-planche-push-up,hollow-body-hold|preparation|wrist-circles,shoulder-cars|control|ring-support-hold
pike-compression|strength|hollow-body-hold,l-sit-tuck-hold|mobility|pike-stretch,standing-pike|control|dead-bug
straddle-compression|strength|hollow-body-hold,seated-pike-lift|mobility|pancake-stretch,frog-stretch|control|straddle-stretch
straddle-press|strength|pike-compression-hold,hollow-body-hold|mobility|pancake-stretch,standing-pike|control|freestanding-handstand,handstand-bail
stalder|strength|seated-straddle-compression-lift,l-sit|mobility|pancake-stretch,straddle-stretch|control|freestanding-handstand
handstand|strength|pike-push-up,hollow-body-hold|preparation|wrist-circles,scapular-push-up|control|wall-toe-taps
pike-press|strength|scapular-push-up,hollow-body-hold|preparation|wrist-circles,shoulder-cars|control|handstand-bail
hspu|strength|scapular-push-up,parallel-bar-dip|preparation|wrist-circles,shoulder-cars|control|handstand-bail
l-sit|strength|hollow-body-hold,ring-knee-raise|mobility|pike-stretch,seated-pike-lift|control|dead-bug
rings|strength|incline-push-up,scapular-pull-up|preparation|wrist-circles,shoulder-cars|control|false-grip-ring-hang
ring-muscle-up|strength|ring-dip,scapular-pull-up|preparation|wrist-circles|control|ring-support-hold,parallel-bar-dip
front-lever|strength|ring-row,hollow-body-hold|preparation|shoulder-cars,scapular-pull-up|control|front-lever-raise
pull-up|strength|ring-row,chin-up|preparation|wrist-circles|control|dead-hang,scapular-pull-up
push-up|strength|scapular-push-up,planche-plank|preparation|wrist-circles|control|hollow-body-hold
dip|strength|parallel-bar-dip,scapular-push-up|preparation|shoulder-cars|control|ring-support-hold
crow|strength|scapular-push-up,hollow-body-hold|preparation|wrist-circles|control|wall-support-shrug
elbow-lever|strength|scapular-push-up,hollow-body-hold|preparation|wrist-circles,shoulder-cars|control|crow-pose
pistol|strength|bulgarian-split-squat,single-leg-rdl|mobility|wall-ankle-dorsiflexion,cossack-squat,pancake-stretch|control|deep-squat-hold
pancake|strength|seated-straddle-compression-lift|mobility|frog-stretch,90-90-hip-switches|control|pancake-good-morning
back-lever|strength|ring-row,hollow-body-hold|preparation|shoulder-cars,ring-biceps-curl|control|ring-support-hold
human-flag|strength|pull-up,ring-row|preparation|shoulder-cars,scapular-push-up|control|chest-to-wall-handstand,side-plank
yoga-foundation|preparation|wrist-circles,thoracic-open-book|control|dead-bug
yoga-standing|strength|bodyweight-squat,calf-raise|mobility|wall-ankle-dorsiflexion|control|side-plank
yoga-backbends|strength|hollow-body-hold,glute-bridge|mobility|shoulder-cars,thoracic-extension|control|dead-bug
yoga-arm-balance|strength|scapular-push-up,hollow-body-hold|preparation|wrist-circles|control|side-plank
ballet-barre|strength|calf-raise,bodyweight-squat|mobility|wall-ankle-dorsiflexion|control|single-leg-rdl
ballet-balance|strength|single-leg-rdl,calf-raise|mobility|90-90-hip-switches|control|dead-bug
ballet-extension|strength|single-leg-rdl,glute-bridge|mobility|couch-stretch,90-90-hip-switches|control|dead-bug
ballet-penche|strength|single-leg-rdl,glute-bridge|mobility|front-split-preparation,pancake-stretch|control|arabesque-hold
splits|strength|glute-bridge,single-leg-rdl|mobility|pancake-stretch,couch-stretch|control|90-90-hip-switches
shoulder-mobility|strength|scapular-push-up,ring-row|mobility|pike-stretch|control|dead-bug
wrist-preparation|strength|wrist-extension,wrist-flexion|mobility|shoulder-cars|control|plank
ankle-squat-mobility|strength|calf-raise,tibialis-raise|mobility|cossack-squat|control|split-squat
core-control|strength|ring-knee-raise,l-sit-tuck-hold|mobility|pike-stretch|control|dead-bug
hanging-core|strength|hollow-body-hold,pull-up|preparation|wrist-circles|control|scapular-pull-up
leg-strength|strength|single-leg-rdl,calf-raise|mobility|wall-ankle-dorsiflexion|control|deep-squat-hold
posterior-chain|strength|ring-hamstring-curl,reverse-nordic-partial|mobility|couch-stretch|control|bodyweight-squat
ring-push|strength|parallel-bar-dip,scapular-push-up|preparation|wrist-circles|control|ring-support-hold
ring-pull|strength|pull-up,scapular-pull-up|preparation|wrist-circles|control|false-grip-ring-hang
ring-core|strength|hollow-body-hold,side-plank|preparation|wrist-circles|control|l-sit
ring-legs|strength|bulgarian-split-squat,single-leg-rdl|mobility|wall-ankle-dorsiflexion|control|cossack-squat
ring-straight-arm|strength|ring-row,hollow-body-hold|preparation|shoulder-cars,ring-biceps-curl|control|ring-support-hold
iron-cross|strength|ring-row,ring-biceps-curl|preparation|shoulder-cars,wrist-circles|control|ring-turnout-support-hold
forearm-balance|strength|pike-push-up,scapular-push-up|mobility|shoulder-cars|control|handstand-bail
bent-arm-press|strength|parallel-bar-dip,hollow-body-hold|preparation|wrist-circles|control|handstand-bail
bar-transitions|strength|straight-bar-dip,ring-row|preparation|wrist-circles|control|hollow-body-hold
recovery|mobility|pike-stretch,90-90-hip-switches|preparation|shoulder-cars|control|dead-bug
grip-support|strength|plate-pinch-hold,gripper-crush|preparation|wrist-circles|control|scapular-pull-up
grip-pinch|strength|farmers-carry,grip-roller|preparation|wrist-circles,band-finger-extension
grip-wrist|strength|farmers-carry,plate-pinch-hold|mobility|shoulder-cars|control|dead-hang
calves-tibialis|strength|single-leg-calf-raise,seated-calf-raise|mobility|wall-ankle-dorsiflexion|control|bodyweight-squat
`;

const raw=new Map(REQUIREMENT_ROWS.trim().split('\n').map(line=>{
 const fields=line.split('|'),entries:{role:MovementNeed;slug:string}[]=[];
 for(let i=1;i<fields.length;i+=2){
  const role=fields[i] as MovementNeed;
  for(const slug of fields[i+1].split(','))entries.push({role,slug});
 }
 return [fields[0],entries] as const;
}));
export function movementRequirementsFor(path:SkillPath){
 const steps=new Set(path.slugs),seen=new Set<string>();
 const configured=[...(raw.get(path.id)||[]),...(path.accessories||[]).map(slug=>({role:'variation' as const,slug}))];
 const requirements:MovementRequirement[]=[];
 for(const item of configured){
  if(seen.has(item.slug))continue;seen.add(item.slug);
  const e=known.get(item.slug);if(!e)continue;
  requirements.push({slug:e.slug,name:e.name,role:item.role,why:roleCopy[item.role].why,level:e.difficulty_level,inMainPath:steps.has(e.slug)});
 }
 return requirements;
}
export const MOVEMENT_REQUIREMENT_PATHS=[...raw.keys()];
