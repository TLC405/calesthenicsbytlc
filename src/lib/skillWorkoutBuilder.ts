import publicCatalog from '../data/publicExerciseCatalog.json';
import { SKILL_PATHS } from '../data/skillPaths';
import { FOUNDATION_DAYS } from '../data/foundationProgram';
import { nodeDose } from './skillGraph';
import { allowedAtLevel, equipmentReasons, minimumTier, type TrainingReadiness, type TrainingTier } from './trainingPolicy';
export type SkillLevel='foundation'|'building'|'advanced';
export type SkillMinutes=15|25|40;
export type WorkoutPhase='warmup'|'skill'|'support'|'cooldown';
export type SkillMetric='reps'|'seconds';
export interface SkillExercise {id:string;slug:string;name:string;category:string;primary_muscles:string[];secondary_muscles?:string[];equipment?:string[];cues?:unknown;youtube_url?:string|null;image_url?:string|null;difficulty_level?:number|null;}
export interface SkillWorkoutItem {key:string;phase:WorkoutPhase;exercise:SkillExercise;sets:number;target:number;metric:SkillMetric;perSide?:boolean;}
interface SkillGoal {id:string;title:string;detail:string;equipment:string;warmup:readonly string[];main:Record<SkillLevel,readonly string[]>;support:readonly string[];cooldown:readonly string[];}
const baseWarm=['wrist-circles','cat-cow','shoulder-cars'];
const supportFor=(id:string)=>/yoga|ballet|splits|mobility|recovery/.test(id)?['cat-cow','glute-bridge','wall-ankle-dorsiflexion']:/core/.test(id)?['dead-bug','hollow-body-hold']:/compression|stalder|straddle|l-sit/.test(id)?['bent-knee-compression-lift','bent-knee-straddle-lift','single-leg-pike-lift','stalder-feet-assisted-hip-lift','seated-pike-lift','hollow-body-hold']:/pull|lever|rings|dip|muscle-up/.test(id)?['incline-ring-row','australian-row','assisted-ring-support-hold','scapular-pull-up','dead-bug']:/pistol|legs/.test(id)?['glute-bridge','bodyweight-squat','split-squat','wall-ankle-dorsiflexion']:['scapular-push-up','kneeling-planche-plank','wall-support-shrug','dead-bug','hollow-body-hold'];
export const SKILL_GOALS:readonly SkillGoal[]=[...SKILL_PATHS.map(path=>({id:path.id,title:path.title,detail:path.short,equipment:path.equipment,warmup:/pistol|pancake|leg|ballet|yoga|splits|mobility|recovery/.test(path.id)?['wall-ankle-dorsiflexion','cat-cow','pike-stretch']:baseWarm,main:{foundation:path.slugs,building:path.slugs,advanced:path.slugs},support:supportFor(path.id),cooldown:['child-s-pose','pike-stretch','cat-cow']})),...FOUNDATION_DAYS.map(day=>({id:day.id,title:day.title,detail:day.detail,equipment:'Check the movement setup',warmup:baseWarm,main:{foundation:day.main,building:day.main,advanced:day.main},support:supportFor(day.id),cooldown:['child-s-pose','pike-stretch','cat-cow']}))];
export const findSkillGoal=(id:string)=>SKILL_GOALS.find(g=>g.id===id);
const catalog=new Map<string,SkillExercise>(publicCatalog.map(e=>[e.slug,e]));
export const legacyTier=(level:SkillLevel):TrainingTier=>level==='advanced'?4:level==='building'?3:1;
export function getCandidates(goalId:string,level:SkillLevel,phase:WorkoutPhase,readiness:TrainingReadiness={tier:legacyTier(level)}):SkillExercise[]{
 const goal=findSkillGoal(goalId);if(!goal)return[];
 const slugs=phase==='warmup'?goal.warmup:phase==='skill'?goal.main[level]:phase==='support'?goal.support:goal.cooldown;
 const candidates=slugs.flatMap(slug=>{const e=catalog.get(slug);return e&&allowedAtLevel(slug,readiness)&&(!readiness.equipment||!equipmentReasons(slug,readiness.equipment).length)?[e]:[];});
 // Preparation stays simple. Skill/support choices remain within the selected level and demonstrated capabilities.
 return phase==='skill'?candidates.sort((a,b)=>minimumTier(b.slug)-minimumTier(a.slug)):candidates;
}
const slots:Record<SkillMinutes,Record<WorkoutPhase,number>>={15:{warmup:1,skill:1,support:1,cooldown:1},25:{warmup:2,skill:2,support:1,cooldown:1},40:{warmup:2,skill:3,support:2,cooldown:2}};
export function buildSkillWorkout(goalId:string,level:SkillLevel,minutes:SkillMinutes,readiness:TrainingReadiness={tier:legacyTier(level)}):SkillWorkoutItem[]{
 const seen=new Set<string>();const items:SkillWorkoutItem[]=[];
 for(const phase of ['warmup','skill','support','cooldown'] as WorkoutPhase[]){
  for(const exercise of getCandidates(goalId,level,phase,readiness)){
   if(items.filter(i=>i.phase===phase).length>=slots[minutes][phase])break;if(seen.has(exercise.slug))continue;
   seen.add(exercise.slug);const dose=nodeDose(exercise.slug);const tier=readiness.tier||1;
   const sets=phase==='warmup'||phase==='cooldown'?1:tier===1?2:phase==='skill'?(minutes===40?4:3):2;
   const target=phase==='cooldown'?(dose.metric==='seconds'?20:5):phase==='warmup'?(dose.metric==='seconds'?10:5):dose.metric==='seconds'?(tier<=2?8:dose.target):tier===1?4:dose.target;
   items.push({key:`${phase}-${exercise.slug}`,phase,exercise,sets,target,metric:dose.metric,perSide:/split-squat|pistol|single-leg-pike/.test(exercise.slug)});
  }
 }
 return items;
}
export const PHASE_LABELS:Record<WorkoutPhase,string>={warmup:'Prepare',skill:'Skill practice',support:'Build strength',cooldown:'Recover'};
export function toSessionEntries(items:SkillWorkoutItem[]){return items.map(item=>({section:item.phase==='skill'?'workout':item.phase==='support'?'compression':item.phase,phaseLabel:PHASE_LABELS[item.phase]+(item.perSide?' · each side':''),restSeconds:nodeDose(item.exercise.slug).restSeconds,exercise:item.exercise,sets:Array.from({length:item.sets},()=>({reps:item.metric==='seconds'?0:item.target,...(item.metric==='seconds'?{seconds:item.target}:{}),done:false}))}));}
