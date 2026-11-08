import type { SkillExercise } from './skillWorkoutBuilder';
import { nodeDose } from './skillGraph';
import { exerciseReadinessReasons, equipmentReadinessReasons } from './trainingPolicy';
import type { SkillTrainingProfile } from './skillGraph';
export type PlannedSet={reps:number;seconds?:number;weight?:number};
export type PlannedEntry={exercise:SkillExercise;sets:PlannedSet[]};
export type CustomPlan={name:string;notes:string;sections:{key:string;entries:PlannedEntry[]}[]};
const keys=['warmup','workout','cooldown','compression'];
const draftKey=(owner:string)=>`power-custom-workout-draft-v1:${owner}`;
export function startingSets(slug:string):PlannedSet[]{const dose=nodeDose(slug);return [dose.metric==='seconds'?{reps:0,seconds:dose.target}:{reps:dose.target}];}
export function customPlan(value:unknown):CustomPlan|null{
 if(!value||typeof value!=='object')return null;const raw=value as CustomPlan;if(!Array.isArray(raw.sections))return null;
 const sections=raw.sections.filter(s=>s&&keys.includes(s.key)&&Array.isArray(s.entries)).map(s=>({key:s.key,entries:s.entries.filter(e=>e?.exercise&&typeof e.exercise.slug==='string'&&typeof e.exercise.name==='string'&&Array.isArray(e.sets)).slice(0,80).map(e=>({exercise:e.exercise,sets:e.sets.slice(0,12).map(set=>({reps:Math.max(0,Math.min(999,Number(set.reps)||0)),...(typeof set.seconds==='number'?{seconds:Math.max(1,Math.min(300,set.seconds))}:{}),...(typeof set.weight==='number'?{weight:Math.max(0,Math.min(1000,set.weight))}:{})}))}))}));
 return {name:typeof raw.name==='string'?raw.name.slice(0,100):'',notes:typeof raw.notes==='string'?raw.notes.slice(0,4000):'',sections};
}
export function readCustomDraft(owner:string){try{return customPlan(JSON.parse(localStorage.getItem(draftKey(owner))||'null'));}catch{return null;}}
export function writeCustomDraft(owner:string,plan:CustomPlan){localStorage.setItem(draftKey(owner),JSON.stringify(plan));}
export function savedCustomPlans(owner:string):CustomPlan[]{try{const raw=JSON.parse(localStorage.getItem(`power-saved-plans-v1:${owner}`)||'[]');return Array.isArray(raw)?raw.map(customPlan).filter((x):x is CustomPlan=>Boolean(x)).slice(0,30):[];}catch{return[];}}
export function saveCustomPlan(owner:string,plan:CustomPlan){const name=plan.name.trim()||'My workout';const previous=savedCustomPlans(owner);localStorage.setItem(`power-saved-plans-v1:${owner}`,JSON.stringify([{...plan,name},...previous.filter(p=>p.name!==name)].slice(0,30)));writeCustomDraft(owner,{...plan,name});}
export function customEntryReasons(exercise:SkillExercise,profile:SkillTrainingProfile){return [...exerciseReadinessReasons(exercise,profile),...equipmentReadinessReasons(exercise.slug,profile)];}
