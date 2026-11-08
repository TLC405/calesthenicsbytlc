import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const temp=await mkdtemp(path.join(tmpdir(),'power-compact-'));
try{
 async function load(name,file){const out=path.join(temp,name+'.mjs');await build({entryPoints:[file],outfile:out,bundle:true,platform:'node',format:'esm',logLevel:'silent'});return import(pathToFileURL(out));}
 const [graph,workspace,focus,coach,calendar,paths]=await Promise.all([load('graph','src/lib/skillGraph.ts'),load('workspace','src/lib/workoutWorkspace.ts'),load('focus','src/lib/focusPlan.ts'),load('coach','src/lib/coachGrounding.ts'),load('calendar','src/lib/practiceCalendar.ts'),load('paths','src/data/skillPaths.ts')]);
 const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};globalThis.window={dispatchEvent:()=>{}};
 const profile=graph.readTrainingProfile();assert.equal(profile.equipmentMode,'informational');assert.deepEqual(profile.equipment,['floor'],'Must not pretend that a user owns all equipment');
 assert.equal(graph.trainingBlockers('incline-ring-row',profile,true).length,0,'A beginner ring row must not require equipment selection');
 assert.equal(graph.trainingBlockers('wall-support-shrug',profile,true).length,0);
 assert(graph.trainingBlockers('one-arm-push-up',profile,true).length,'Beginner restrictions must remain');assert(graph.trainingBlockers('chest-to-wall-handstand',{...profile,tier:5},true).some(r=>r.includes('exit')),'Inversion exit checks must remain');
 let items=workspace.addWorkoutMovement([],'incline-ring-row','skill',profile);assert.equal(items.length,1);assert.equal(workspace.workoutBlockers(items,profile,[]).length,0);
 for(const goalId of ['rings','straight-arm','planche','pike-compression','stalder','yoga-foundation','ballet-barre']){
  const prefs={goalId,focus:'auto',energy:'normal',minutes:15};const plan=focus.buildFocusPlan(prefs,profile,[],{automaticVolume:true});const other=focus.buildFocusPlan({...prefs,minutes:40},profile,[],{automaticVolume:true});
  assert.deepEqual(plan.items,other.items,'Old duration choices must not impose a session length');assert(plan.items.length);assert(plan.items.every(i=>graph.trainingBlockers(i.exercise.slug,profile,true).length===0));
 }
 const context=coach.coachContext(profile,[],profile.equipment);assert(context.allowedExercises.some(e=>e.slug==='incline-ring-row'));assert(!context.allowedExercises.some(e=>e.slug==='one-arm-push-up'));assert.deepEqual(context.equipment,[],'Do not tell the coach that floor is the only available equipment');
 const selection=coach.validateCoachSelection({goal_id:'rings',exercise_slugs:['incline-ring-row','one-arm-push-up'],message:'Try these'},profile);assert(selection.exercises.some(e=>e.slug==='incline-ring-row'));assert(!selection.exercises.some(e=>e.slug==='one-arm-push-up'));
 const all=workspace.workspaceMovements(paths.getSkillPath('foundation'),true);const ready=all.filter(e=>!graph.trainingBlockers(e.slug,profile,true).length).slice(0,15);assert.equal(ready.length,15);items=[];for(const e of ready)items=workspace.addWorkoutMovement(items,e.slug,'skill',profile);assert.equal(items.length,15,'No arbitrary 12-movement cutoff');
 workspace.writeWorkoutDraft('guest',items);assert.equal(workspace.readWorkoutDraft('guest').length,15);assert.equal(workspace.readWorkoutDraft('other').length,0);
 calendar.saveScheduledPractice('guest',{date:'2026-11-08',goalId:'foundation',title:'Longer practice',items,savedAt:new Date().toISOString()});assert.equal(calendar.readScheduledPractice('guest')[0].items.length,15,'Scheduling must preserve the whole workout');
 assert([...storage.keys()].every(k=>!k.includes('attempt')&&!k.includes('history')),'Planning must never fabricate completed work');
 console.log('PASS: no equipment selection for default and migrated profiles, equipment remains descriptive, beginner/inversion gates, coach filtering, duration-independent suggestions, drafts and calendars preserve 15 movements, owner isolation and no fake history.');
}finally{await rm(temp,{recursive:true,force:true});}
