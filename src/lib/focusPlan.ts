import { presentWorkout } from './workoutPresentation';
import { SKILL_PATHS, getSkillPath } from '../data/skillPaths';
import { buildSkillWorkout, getCandidates, type SkillMinutes, type SkillWorkoutItem, type WorkoutPhase } from './skillWorkoutBuilder';
import { exerciseBySlug, nodeDose, nodeProgress, recommendedNode, trainingBlockers, type SkillAttempt, type SkillTrainingProfile } from './skillGraph';
import { approvedRegression, type Capability } from './trainingPolicy';
import { canonicalSlug } from './exerciseProgressions';

export const FOCUS_CHOICES=[
 {id:'auto',title:'Help me choose',detail:'Use my readiness and recent results'},
 {id:'compression',title:'Leg lifts & core',detail:'Build controlled leg lifts toward your body'},
 {id:'straight-arm',title:'Straight-arm strength',detail:'Push tall and lean with straight elbows'},
 {id:'balance',title:'Balance',detail:'Build steady support before balancing alone'},
 {id:'strength',title:'Strength base',detail:'Build repeatable pushing and pulling'},
 {id:'mobility',title:'Flexibility',detail:'Build comfortable movement in your hips and shoulders'},
 {id:'control',title:'Technique & consistency',detail:'Repeat the current step with better control'},
] as const;
export type FocusId=typeof FOCUS_CHOICES[number]['id'];
export type FocusPreferences={goalId:string;focus:FocusId;minutes:SkillMinutes;energy:'normal'|'light';warmup?:'yoga'|'mobility'};
export const DEFAULT_FOCUS:FocusPreferences={goalId:'auto',focus:'auto',minutes:25,energy:'normal'};
const validGoal=(id:string)=>id==='auto'||SKILL_PATHS.some(p=>p.id===id);
export function sanitizeFocusPreferences(value:unknown):FocusPreferences {
 const x=value&&typeof value==='object'?value as Partial<FocusPreferences>:{};
 return {goalId:typeof x.goalId==='string'&&validGoal(x.goalId)?x.goalId:'auto',focus:FOCUS_CHOICES.some(f=>f.id===x.focus)?x.focus!:'auto',minutes:x.minutes===15||x.minutes===40?x.minutes:25,energy:x.energy==='light'?'light':'normal',...(x.warmup==='yoga'||x.warmup==='mobility'?{warmup:x.warmup}:{})};
}
export function readFocusPreferences(owner:string){try{return sanitizeFocusPreferences(JSON.parse(localStorage.getItem(`power-focus-plan-v1:${owner}`)||'null'));}catch{return {...DEFAULT_FOCUS};}}
export function writeFocusPreferences(owner:string,preferences:FocusPreferences){localStorage.setItem(`power-focus-plan-v1:${owner}`,JSON.stringify(sanitizeFocusPreferences(preferences)));}
const needs=(id:string):[Capability,FocusId][]=>/planche|straight-arm/.test(id)?[['straight-arm-base','straight-arm'],['support-base','strength']]:/straddle-press|stalder/.test(id)?[['compression-control','compression'],['inversion-control','balance'],['support-base','straight-arm']]:/compression|l-sit/.test(id)?[['compression-control','compression'],['support-base','straight-arm']]:/handstand|hspu|pike-press|bent-arm/.test(id)?[['support-base','straight-arm'],['inversion-control','balance'],['push-base','strength']]:/ring|pull|lever|flag/.test(id)?[['pull-base','strength'],['support-base','straight-arm']]:[];
const pools:Record<Exclude<FocusId,'auto'>,readonly string[]>={
 compression:['bent-knee-compression-lift','single-leg-pike-lift','bent-knee-straddle-lift','seated-pike-lift','seated-straddle-lift','straddle-compression-hold'],
 'straight-arm':['quadruped-planche-lean','kneeling-planche-plank','scapular-push-up','planche-lean','band-assisted-tuck-planche'],
 balance:['wall-support-shrug','pike-support-hold','hip-lift-setup','handstand-bail','chest-to-wall-handstand','handstand-heel-pull'],
 strength:['wall-push-up','incline-push-up','push-up','dead-bug'],
 mobility:['cat-cow','pike-stretch','bent-knee-straddle-lift','straddle-stretch','pancake-good-morning'],
 control:['dead-bug','kneeling-planche-plank','hollow-body-hold'],
};
const labels:Record<Exclude<FocusId,'auto'>,string>={compression:'Build your leg lift','straight-arm':'Build straight-arm control',balance:'Own your balance',strength:'Build your strength base',mobility:'Move more comfortably',control:'Make this step repeatable'};
const capNames:Record<Capability,string>={'compression-control':'straight-leg compression','inversion-control':'controlled inversion','support-base':'stable support','straight-arm-base':'straight-arm lean','push-base':'basic pressing','pull-base':'controlled pulling'};
export function usableFocusHistory(attempts:SkillAttempt[],now:number){return attempts.filter(a=>{const date=Date.parse(a.at);return Number.isFinite(date)&&date<=now&&date>=now-60*86400000&&Number.isFinite(a.value)&&a.value>=0&&Number.isFinite(a.target)&&a.target>0&&Number.isInteger(a.quality)&&a.quality>=1&&a.quality<=5;}).map(a=>({...a,nodeId:canonicalSlug(a.nodeId)})).sort((a,b)=>a.at.localeCompare(b.at));}
export function estimateFocusMinutes(items:readonly SkillWorkoutItem[]){return Math.ceil(items.reduce((sum,item)=>sum+item.sets*(item.metric==='seconds'?item.target:item.target*4)+Math.max(0,item.sets-1)*nodeDose(item.exercise.slug).restSeconds+30,0)/60);}
/** Modest target changes need repeatable, comparable results; never changes working level. */
export function suggestedMovementTarget(slug:string,history:SkillAttempt[],base:number,light=false){
 const dose=nodeDose(slug);const cap=dose.metric==='seconds'?20:12;
 const logs=history.filter(a=>a.nodeId===slug&&a.metric===dose.metric);const last=logs[logs.length-1];
 if(last&&(last.quality<3||last.value<last.target||last.discomfort))return {target:Math.max(1,Math.min(base,Math.floor(last.value*.8))),reason:'Reduced after your latest difficult attempt. Keep the variation controlled.'};
 const setup=(a:SkillAttempt)=>JSON.stringify([a.assistance||'none',a.rom||'full',a.assistanceKg||0,a.leanCm??null]);
 const comparable=last?logs.filter(a=>setup(a)===setup(last)&&a.target===last.target).slice(-3):[];
 const repeated=!light&&last&&comparable.length===3&&comparable.every(a=>a.quality>=4&&a.value>=a.target&&!a.discomfort)&&new Set(comparable.map(a=>a.sessionId)).size>=2&&new Set(comparable.map(a=>a.at.slice(0,10))).size>=2;
 const retained=Math.min(cap,Math.max(base,last?.target||base));
 const target=light?Math.min(base,retained):repeated?Math.min(cap,retained+(dose.metric==='seconds'?2:1)):retained;
 return {target,reason:light?'Conservative target for a lighter practice day.':repeated&&target>retained?'Small increase after 3 controlled logs across at least 2 sessions and days, with matching setup.':last?'Repeat your recent target with control before adding more.':'Starting target; repeated controlled logs will inform the next suggestion.'};
}
export function buildFocusPlan(preferences:FocusPreferences,profile:SkillTrainingProfile,attempts:SkillAttempt[],options:{now?:number;recentPathId?:string;targetSlug?:string;automaticVolume?:boolean}={}){
 const stored=sanitizeFocusPreferences(preferences);const prefs={...stored,...(options.automaticVolume?{minutes:((profile.tier||1)>=3?40:25) as SkillMinutes}:{})};const now=options.now??Date.now();const history=usableFocusHistory(attempts,now);
 const recentPath=getSkillPath(options.recentPathId);const last=history[history.length-1];
 const inferred=last?SKILL_PATHS.find(p=>p.id!=='foundation'&&p.slugs.includes(last.nodeId)):undefined;
 const goal=getSkillPath(prefs.goalId==='auto'?(recentPath?.id||inferred?.id||'foundation'):prefs.goalId)||SKILL_PATHS[0];
 const stage=(profile.tier||1)>=4?'advanced':(profile.tier||1)>=3?'building':'foundation';
 const goalSlugs=new Set([...goal.slugs,...(goal.accessories||[])]);const goalLogs=history.filter(a=>goalSlugs.has(a.nodeId));
 const recentConcern=goalLogs.filter(a=>Date.parse(a.at)>=now-48*3600000&&a.discomfort).slice(-1)[0];
 const lastGoal=goalLogs[goalLogs.length-1];const poor=Boolean(lastGoal&&(lastGoal.quality<3||lastGoal.value<lastGoal.target));
 const missing=needs(goal.id).find(([cap])=>!profile.capabilities?.includes(cap));
 const natural:Exclude<FocusId,'auto'>=poor?'control':missing?.[1] as Exclude<FocusId,'auto'>||(/yoga|ballet|mobility|pancake|splits|recovery/.test(goal.id)?'mobility':'control');
 const focus:Exclude<FocusId,'auto'>=prefs.focus==='auto'?natural:prefs.focus;
 const reasons:string[]=[];
 if(prefs.goalId==='auto')reasons.push(recentPath?'Continues the progression you last practiced.':inferred?'Continues a movement family in your recent logs.':'No goal history yet: start with a broad foundation session.');
 if(prefs.focus!=='auto')reasons.push(`You chose ${FOCUS_CHOICES.find(f=>f.id===focus)?.title.toLowerCase()} as today’s emphasis.`);
 else if(poor)reasons.push('Your latest logged attempt was below target or lost control. Repeat an easier variation before increasing difficulty.');
 else if(missing)reasons.push(`${capNames[missing[0]]} readiness is not confirmed in your profile. Start with preparation for that component.`);
 else reasons.push(goal.kind==='collection'?'Explore a comfortable practice option; these poses are not a mandatory ladder.':'Build repeatable technique at your current step before adding difficulty.');
 reasons.push(goalLogs.length?`${goalLogs.length} recent goal-related attempt${goalLogs.length===1?'':'s'} inform this plan. Technique ratings are self-reported.`:'No recent goal-specific results yet. This is a conservative starting suggestion, not a measured weakness.');
 const safe=(slug:string)=>exerciseBySlug.has(slug)&&trainingBlockers(slug,profile,true).length===0;
 let primary=recommendedNode(goal.id,history,profile,options.targetSlug);
 if(poor&&lastGoal){const regression=approvedRegression(lastGoal.nodeId,profile);if(regression&&safe(regression))primary=regression;}
 const componentFocus=prefs.focus!=='auto'||Boolean(missing);
 const candidates=focus==='strength'&&/ring|pull|lever/.test(goal.id)?['incline-ring-row','australian-row','assisted-ring-support-hold','dead-bug']:focus==='straight-arm'&&/ring|lever/.test(goal.id)?['assisted-ring-support-hold','ring-support-hold','ring-scapular-row']:pools[focus];
 const availableFocus=candidates.filter(safe);
 const focusPrimary=componentFocus?(availableFocus.find(slug=>!nodeProgress(slug,history).consistent)||availableFocus[availableFocus.length-1]):null;
 const chosen=poor&&prefs.focus==='auto'?(primary||focusPrimary):(focusPrimary||primary);
 if(!goal.slugs.some(safe))reasons.push(profile.equipmentMode==='informational'?'The main skill needs more preparation at your current level. This session works on its starting steps.':'The main skill is not available with your current equipment or readiness. This session uses preparation; adjust your setup to practice the skill itself.');
 const base=buildSkillWorkout(goal.id,stage,prefs.minutes,profile);
 const items:SkillWorkoutItem[]=[];const seen=new Set<string>();
 const add=(slug:string,phase:WorkoutPhase)=>{
  if(!safe(slug))return;
  if(seen.has(slug)){if(phase!=='skill')return;const previous=items.findIndex(i=>i.exercise.slug===slug);if(previous>=0)items.splice(previous,1);seen.delete(slug);}
  const exercise=exerciseBySlug.get(slug)!;const dose=nodeDose(slug);const prep=phase==='warmup'||phase==='cooldown';
  const starting=dose.metric==='seconds'?8:(profile.tier||1)===1?4:dose.target;
  const suggestion=suggestedMovementTarget(slug,history,starting,prefs.energy==='light');
  items.push({key:`${phase}-${slug}`,phase,exercise,sets:prep?1:prefs.energy==='light'?1:(profile.tier||1)<=2?2:3,target:prep?(dose.metric==='seconds'?15:5):suggestion.target,targetReason:prep?undefined:suggestion.reason,metric:dose.metric,perSide:/split-squat|pistol|single-leg|one-leg/.test(slug)});seen.add(slug);
 };
 const warm=base.filter(i=>i.phase==='warmup');warm.slice(0,prefs.minutes===15?1:2).forEach(i=>add(i.exercise.slug,'warmup'));
 if(prefs.warmup!=='mobility')add('cat-cow','warmup');
 if(chosen)add(chosen,'skill');
 if(prefs.minutes>=25&&primary&&safe(primary))add(primary,'skill');
 const supportPool=[...(componentFocus?candidates:[]),...getCandidates(goal.id,stage,'support',profile).map(e=>e.slug)];
 for(const slug of supportPool){if(items.filter(i=>i.phase==='support').length>=(prefs.minutes===40?2:1))break;add(slug,'support');}
 base.filter(i=>i.phase==='cooldown').slice(0,1).forEach(i=>add(i.exercise.slug,'cooldown'));
 const main=items.find(i=>i.phase==='skill');
 const nextIndex=main?goal.slugs.indexOf(main.exercise.slug):-1;
 const next=nextIndex>=0?goal.slugs[nextIndex+1]:undefined;
 const checkpoints=needs(goal.id).map(([cap,dimension])=>({id:cap,label:capNames[cap],state:profile.capabilities?.includes(cap)?'Confirmed by you':'Preparation first',focus:dimension,confirmed:Boolean(profile.capabilities?.includes(cap))}));
 const estimatedMinutes=estimateFocusMinutes(items);
 return {goal,focus,title:goal.kind==='collection'&&prefs.focus==='auto'?`${presentWorkout(goal).title} practice`:labels[focus],reasons,items,checkpoints,primarySlug:main?.exercise.slug||null,nextSlug:next||null,estimatedMinutes,light:prefs.energy==='light',reviewRequired:Boolean(recentConcern),reviewNote:recentConcern?`You noted discomfort during ${exerciseBySlug.get(recentConcern.nodeId)?.name||'this progression'} in the last 48 hours. Review that before loading this progression again.`:'',evidenceCount:goalLogs.length,consistentCount:goal.slugs.filter(s=>nodeProgress(s,history).consistent).length};
}
