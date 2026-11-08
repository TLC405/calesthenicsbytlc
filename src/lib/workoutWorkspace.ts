import type { SkillPath } from '../data/skillPaths';
import { SKILL_PATHS } from '../data/skillPaths';
import { usableFocusHistory } from './focusPlan';
import { canonicalSlug } from './exerciseProgressions';
import { exerciseBySlug, nodeDose, trainingBlockers, type SkillTrainingProfile, type SkillAttempt } from './skillGraph';
import { minimumTier } from './trainingPolicy';
import type { SkillWorkoutItem, WorkoutPhase } from './skillWorkoutBuilder';
export const WORKOUT_PHASES:WorkoutPhase[]=['warmup','skill','support','cooldown'];
export const BUILDER_PHASE_LABELS:Record<WorkoutPhase,string>={warmup:'Warm-up',skill:'Main practice',support:'Extra strength',cooldown:'Cool-down'};
export function cleanWorkoutItems(raw:unknown):SkillWorkoutItem[]{
 if(!Array.isArray(raw))return[];const seen=new Set<string>();
 return raw.flatMap(item=>{const slug=typeof item?.exercise?.slug==='string'?canonicalSlug(item.exercise.slug):'';const exercise=exerciseBySlug.get(slug);
  if(!exercise||seen.has(slug)||!WORKOUT_PHASES.includes(item.phase)||!Number.isInteger(item.sets)||item.sets<1||item.sets>12||!Number.isFinite(item.target)||item.target<1||item.target>999)return[];
  seen.add(slug);const dose=nodeDose(slug);return [{key:slug,exercise,phase:item.phase,sets:item.sets,target:item.target,metric:dose.metric,perSide:/split-squat|pistol|single-leg|one-leg|human-flag|clutch-flag/.test(slug)}];
 }).slice(0,exerciseBySlug.size);
}
export function addWorkoutMovement(items:SkillWorkoutItem[],slug:string,phase:WorkoutPhase,profile:SkillTrainingProfile):SkillWorkoutItem[]{
 const canonical=canonicalSlug(slug);const exercise=exerciseBySlug.get(canonical);
 if(!exercise||items.some(i=>i.exercise.slug===canonical)||trainingBlockers(canonical,profile,true).length)return items;
 const dose=nodeDose(canonical);return [...items,{key:canonical,phase,exercise,sets:phase==='warmup'||phase==='cooldown'?1:(profile.tier||1)<=2?2:3,target:dose.metric==='seconds'?8:(profile.tier||1)===1?4:dose.target,metric:dose.metric,perSide:/split-squat|pistol|single-leg|one-leg|human-flag|clutch-flag/.test(canonical)}];
}
export function readWorkoutDraft(owner:string){try{return cleanWorkoutItems(JSON.parse(localStorage.getItem(`power-home-workout-v1:${owner}`)||'[]'));}catch{return[];}}
export function writeWorkoutDraft(owner:string,items:SkillWorkoutItem[]){localStorage.setItem(`power-home-workout-v1:${owner}`,JSON.stringify(cleanWorkoutItems(items)));if(typeof window!=='undefined')window.dispatchEvent(new Event('power-workout-draft'));}
export function orderedWorkout(items:SkillWorkoutItem[]){return WORKOUT_PHASES.flatMap(phase=>items.filter(i=>i.phase===phase));}

export function workoutBlockers(items:SkillWorkoutItem[],profile:SkillTrainingProfile,attempts:SkillAttempt[],now=Date.now()){
 const loading=new Set(items.map(i=>canonicalSlug(i.exercise.slug)));
 const related=SKILL_PATHS.filter(p=>p.id!=='foundation'&&[...p.slugs,...(p.accessories||[])].some(s=>loading.has(canonicalSlug(s))));
 const recent=usableFocusHistory(attempts,now).find(a=>a.discomfort&&Date.parse(a.at)>=now-48*3600000&&(loading.has(a.nodeId)||related.some(p=>[...p.slugs,...(p.accessories||[])].some(s=>canonicalSlug(s)===a.nodeId))));
 return [...new Set([...items.flatMap(i=>trainingBlockers(i.exercise.slug,profile,true)),...(recent?[`You noted discomfort during ${exerciseBySlug.get(recent.nodeId)?.name||'related practice'} in the last 48 hours. Review that before loading this progression again.`]:[])])];
}

export function workspaceMovements(path:SkillPath,all=false){
 const families=path.id==='rings'?SKILL_PATHS.filter(p=>p.id==='rings'||p.id==='ring-muscle-up'||p.group==='Rings'):path.id==='straight-arm'?SKILL_PATHS.filter(p=>['straight-arm','planche','straddle-press','stalder','l-sit','front-lever','back-lever','ring-straight-arm'].includes(p.id)):[path];
 const slugs=all?[...exerciseBySlug.keys()]:families.flatMap(p=>[...p.slugs,...(p.accessories||[])]);
 return [...new Set(slugs.map(canonicalSlug))].flatMap(slug=>exerciseBySlug.get(slug)?[exerciseBySlug.get(slug)!]:[]).sort((a,b)=>minimumTier(a.slug)-minimumTier(b.slug));
}

/** Move only within a training section; phase order stays meaningful. */
export function moveWorkoutItem(items:SkillWorkoutItem[],key:string,direction:-1|1){
 const index=items.findIndex(i=>i.key===key);if(index<0)return items;
 const siblings=items.map((item,i)=>({item,i})).filter(row=>row.item.phase===items[index].phase);
 const position=siblings.findIndex(row=>row.i===index);const neighbor=siblings[position+direction];if(!neighbor)return items;
 const next=[...items];[next[index],next[neighbor.i]]=[next[neighbor.i],next[index]];return next;
}
/** Browsing yoga for a warm-up must not rename a rings workout. */
export function workoutIdentity(items:SkillWorkoutItem[],selectedPathId:string){
 const selected=SKILL_PATHS.find(p=>p.id===selectedPathId)||SKILL_PATHS[0];
 const main=items.find(i=>i.phase==='skill'&&[...selected.slugs,...(selected.accessories||[])].some(s=>canonicalSlug(s)===i.exercise.slug))||items.find(i=>i.phase==='skill')||items.find(i=>i.phase==='support')||items[0];
 const contains=(path:SkillPath)=>Boolean(main&&[...path.slugs,...(path.accessories||[])].some(s=>canonicalSlug(s)===main.exercise.slug));
 const path=contains(selected)?selected:SKILL_PATHS.find(p=>p.id!=='foundation'&&contains(p))||selected;
 return {pathId:path.id,slug:main?.exercise.slug,title:items.length?`My workout · ${items.length} movements`:'My workout'};
}
