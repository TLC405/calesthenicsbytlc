import type { SkillPath } from '../data/skillPaths';
export const WORKOUT_CATEGORIES=['All','Rings','Straight arms','Handstands','Leg lifts & core','Balance','Mobility','Yoga','Ballet','Leg strength','Basics'] as const;
export function workoutCategory(path:SkillPath){if(path.id==='foundation')return'Basics';if(path.id.startsWith('ring')||path.group==='Rings')return'Rings';if(path.group==='Yoga'||path.group==='Ballet')return path.group;if(path.group==='Lower body')return'Leg strength';if(path.group==='Mobility'||path.id==='pancake')return'Mobility';if(path.group==='Compression'||path.group==='Core')return'Leg lifts & core';if(path.group==='Press & balance'||['hspu','pike-press'].includes(path.id))return'Handstands';return'Straight arms';}
const friendly:Record<string,{title:string;detail:string}>={
 'foundation':{title:'Start with the basics',detail:'Simple strength, balance and body control'},
 'straight-arm':{title:'Straight-arm strength',detail:'Build strong shoulders with straight elbows'},
 'pike-compression':{title:'Sitting leg lifts',detail:'Bring your legs toward your body · pike compression'},
 'straddle-compression':{title:'Wide sitting leg lifts',detail:'Practice lifting with your legs apart'},
 'straddle-press':{title:'Press up to a handstand',detail:'Lift your hips with your legs apart'},
 'stalder':{title:'Stalder press',detail:'Work from a low sitting hold toward a handstand'},
 'pike-press':{title:'Pike push-ups',detail:'Build overhead pressing strength with feet supported'},
 'handstand':{title:'Handstand balance',detail:'Start at the wall and build steady balance'},
 'planche':{title:'Planche',detail:'Build straight-arm strength, one step at a time'},
 'hspu':{title:'Handstand push-ups',detail:'Build toward controlled upside-down pressing'},
 'rings':{title:'Rings',detail:'Start with supported rows and steady holds'},
 'pancake':{title:'Wide-leg forward bend',detail:'Build a comfortable forward fold with legs apart'},
 'yoga-foundation':{title:'Gentle yoga',detail:'Easy floor poses, breathing and warm-ups'},
 'ballet-extension':{title:'Ballet leg lifts',detail:'Supported leg circles and controlled extensions'},
 'ballet-penche':{title:'Ballet forward balances',detail:'Build hip control before deeper leg lifts'},
 'shoulder-mobility':{title:'Shoulder & upper-back mobility',detail:'Comfortable shoulder circles and upper-back movement'},
 'ballet-barre':{title:'Ballet basics',detail:'Supported arm, foot and balance practice'},
 'posterior-chain':{title:'Hips & back of legs',detail:'Build your glutes, hamstrings and body control'},
 'forearm-balance':{title:'Forearm balance',detail:'Learn supported balance on your forearms'},
 'recovery':{title:'Easy recovery',detail:'Gentle movement for a lighter day'},
};
export function presentWorkout(path:SkillPath){return friendly[path.id]||{title:path.title.replace('Yoga · ','Yoga: ').replace('Ballet · ','Ballet: '),detail:plainTrainingText(path.short)};}
export function plainTrainingText(text:string){return text.replace(/scapular protraction/gi,'pushing your shoulder blades apart').replace(/scapular depression/gi,'pressing your shoulders down').replace(/scapular elevation/gi,'lifting through your shoulders').replace(/scapular/gi,'shoulder-blade').replace(/protraction/gi,'pushing the shoulder blades apart').replace(/eccentric(?:s)?/gi,'slow lowering').replace(/concentric/gi,'lifting').replace(/\bROM\b/g,'movement range').replace(/readiness/gi,'starting checks').replace(/regression/gi,'easier version').replace(/prescription/gi,'workout plan').replace(/\bdose\b/gi,'sets and reps').replace(/supination/gi,'palms-up grip').replace(/pronation/gi,'palms-down grip').replace(/active compression/gi,'controlled leg lifting').replace(/leverage/gi,'body position').replace(/unilateral/gi,'one-sided').replace(/hip flexion/gi,'lifting at the hips').replace(/abduction/gi,'moving the legs apart');}

const balancePaths=new Set(['handstand','forearm-balance','crow','elbow-lever','bent-arm-press','yoga-standing','yoga-arm-balance','ballet-barre','ballet-balance','ballet-penche']);
const mobilityPaths=new Set(['yoga-foundation','yoga-standing','yoga-backbends','ballet-barre','ballet-extension','ballet-penche','pancake']);
export function matchesWorkoutCategory(path:SkillPath,category:string){return category==='All'||category==='Featured'||category==='Balance'&&balancePaths.has(path.id)||category==='Mobility'&&(path.group==='Mobility'||mobilityPaths.has(path.id))||workoutCategory(path)===category;}
