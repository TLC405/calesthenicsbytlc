import catalog from '../data/publicExerciseCatalog.json';
import { SKILL_PATHS } from '../data/skillPaths';
import { FOUNDATION_DAYS } from '../data/foundationProgram';
import { RULES, safeProfile, equipmentReadinessReasons, allowedAtLevel, minimumTier, approvedRegression, type TrainingReadiness } from './trainingPolicy';
const known=new Map(catalog.map(e=>[e.slug,e]));
export function coachContext(profile:TrainingReadiness,progress:unknown=[],equipment:unknown=['floor']){
 const ready=safeProfile(profile);
 const gear=Array.isArray(equipment)?equipment.filter((e):e is string=>typeof e==='string'&&['floor','wall','rings','bar','parallettes','bands','bench','pole','pool'].includes(e)):['floor'];
 const allowed=catalog.filter(e=>allowedAtLevel(e.slug,ready)&&!equipmentReadinessReasons(e.slug,{...profile,equipment:gear}).length);
 const records=Array.isArray(progress)?progress.filter(p=>p&&typeof p==='object'&&known.has(p.nodeId)&&Number.isFinite(p.value)&&Number.isInteger(p.quality)).slice(-12).map(p=>({nodeId:p.nodeId,value:p.value,metric:p.metric==='seconds'?'seconds':'reps',quality:Math.max(1,Math.min(5,p.quality))})):[];
 return {profile:ready,equipment:profile.equipmentMode==='informational'?[]:gear,equipmentMode:profile.equipmentMode,equipmentPolicy:profile.equipmentMode==='informational'?'Do not ask for equipment selection. Describe equipment needed alongside each suggested movement.':undefined,progress:records,goals:[...SKILL_PATHS,...FOUNDATION_DAYS].map(g=>({id:g.id,title:g.title,nodes:'slugs' in g?g.slugs:g.main,...('accessories' in g?{optionalDrills:g.accessories}:{}),...('kind' in g?{kind:g.kind}:{})})),allowedExercises:allowed.map(e=>({slug:e.slug,name:e.name,minimumLevel:minimumTier(e.slug),equipment:e.equipment,readiness:RULES[e.slug]?.requires||[],regression:RULES[e.slug]?.regression||null,cues:Array.isArray(e.cues)?e.cues.slice(0,3):[]}))};
}
export function validateCoachSelection(value:unknown,profile:TrainingReadiness){
 const raw=value&&typeof value==='object'?value as Record<string,unknown>:{};
 const goals=new Set([...SKILL_PATHS,...FOUNDATION_DAYS].map(g=>g.id));
 const goalId=typeof raw.goal_id==='string'&&goals.has(raw.goal_id)?raw.goal_id:'foundation-push';
 const requested=Array.isArray(raw.exercise_slugs)?raw.exercise_slugs.filter((s):s is string=>typeof s==='string').slice(0,8):[];
 const accepted=[...new Set(requested.flatMap(slug=>{if(!known.has(slug))return[];if(allowedAtLevel(slug,profile)&&!equipmentReadinessReasons(slug,profile).length)return[slug];const regression=approvedRegression(slug,profile);return regression?[regression]:[];}))];
 const changed=requested.some(slug=>!known.has(slug)||!allowedAtLevel(slug,profile)||equipmentReadinessReasons(slug,profile).length>0);
 return {goalId,focusSlug:accepted[0]||null,exercises:accepted.map(slug=>known.get(slug)!),message:changed?'Some proposed drills exceeded your level or readiness. POWER replaced or removed those drills; review the level-appropriate workout before training.':typeof raw.message==='string'?raw.message.slice(0,4000):'Review your level-appropriate workout.',adjusted:changed};
}
export function matchCoachGoal(query:string){
 const q=query.toLowerCase();
 if(/ballet|ballet|barre|pli[eé]|tendu/.test(q))return /balance|arabesque|attitude|pass[eé]/.test(q)?'ballet-balance':/pench|needle/.test(q)?'ballet-penche':/extension|battement|develop/.test(q)?'ballet-extension':'ballet-barre';if(/yoga/.test(q))return /balance|standing|warrior/.test(q)?'yoga-standing':/bridge|backbend|hips/.test(q)?'yoga-backbends':'yoga-foundation';if(/mobility|flexibility|stretch/.test(q))return /shoulder|thoracic/.test(q)?'shoulder-mobility':/split|hip/.test(q)?'splits':'pancake';if(/handstand.*push|hspu/.test(q))return 'hspu';if(/stalder/.test(q))return 'stalder';if(/straight.?arm/.test(q))return 'straight-arm';if(/straddle.*compress|compress.*straddle/.test(q))return 'straddle-compression';if(/compress|pike lift/.test(q))return 'pike-compression';if(/iron.?cross/.test(q))return 'iron-cross';if(/human.?flag|flag/.test(q))return 'human-flag';if(/planche/.test(q))return 'planche';if(/pike/.test(q))return 'pike-press';if(/press/.test(q))return 'straddle-press';if(/one.?arm.*push|push.?up/.test(q))return 'push-up';if(/front.*lever/.test(q))return 'front-lever';if(/back.*lever/.test(q))return 'back-lever';if(/muscle.?up/.test(q))return 'ring-muscle-up';if(/rings?/.test(q))return 'rings';if(/handstand.*push|hspu/.test(q))return 'hspu';if(/handstand/.test(q))return 'handstand';if(/pull/.test(q))return 'pull-up';if(/l.?sit|v.?sit/.test(q))return 'l-sit';if(/leg|pistol/.test(q))return 'foundation-legs';return 'foundation-push';
}
