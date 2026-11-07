import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const dir=await mkdtemp(path.join(tmpdir(),'power-focus-'));const values=new Map();globalThis.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v))};
try{
 async function load(name,file){const out=path.join(dir,name+'.mjs');await build({entryPoints:[file],outfile:out,bundle:true,platform:'node',format:'esm',logLevel:'silent'});return import(pathToFileURL(out));}
 const [focus,paths,policy,graph]=await Promise.all([load('focus','src/lib/focusPlan.ts'),load('paths','src/data/skillPaths.ts'),load('policy','src/lib/trainingPolicy.ts'),load('graph','src/lib/skillGraph.ts')]);
 const now=Date.parse('2026-11-07T16:00:00Z');const base={tier:1,capabilities:[],equipment:['floor'],safeExit:false};let cases=0;
 for(const goal of paths.SKILL_PATHS)for(const tier of [1,2,3,4,5])for(const capabilities of [[],policy.CAPABILITIES.map(c=>c.id)])for(const minutes of [15,25,40])for(const energy of ['normal','light']){
  const profile={...base,tier,capabilities,equipment:['floor','wall','bar','rings','parallettes','bands','bench','pole','pool'],safeExit:capabilities.includes('inversion-control')};
  const plan=focus.buildFocusPlan({goalId:goal.id,focus:'auto',minutes,energy},profile,[],{now});
  assert(plan.items.some(i=>i.phase==='skill'),`No main drill: ${goal.id}/${tier}`);
  assert(plan.items.every(i=>graph.trainingBlockers(i.exercise.slug,profile,true).length===0),`Readiness bypass: ${goal.id}`);
  assert.equal(new Set(plan.items.map(i=>i.exercise.slug)).size,plan.items.length);
  assert(plan.items.every(i=>Number.isFinite(i.target)&&i.target>0&&i.sets>0));
  if(energy==='light')assert(plan.items.filter(i=>i.phase==='skill'||i.phase==='support').every(i=>i.sets===1));
  cases++;
 }
 const prefs={goalId:'stalder',focus:'auto',minutes:25,energy:'normal'};const plan=focus.buildFocusPlan(prefs,base,[],{now});assert.equal(plan.focus,'compression');assert.equal(plan.primarySlug,'bent-knee-compression-lift');assert(plan.reasons.some(r=>r.includes('not confirmed')));assert.equal(plan.evidenceCount,0);assert(!plan.items.some(i=>i.exercise.slug==='stalder-press-to-hs'));
 const good=Array.from({length:3},(_,i)=>({id:'good-'+i,nodeId:'bent-knee-compression-lift',sessionId:'session-'+i,at:`2026-11-0${4+i}T14:00:00Z`,metric:'reps',value:5,target:5,quality:4}));
 const progressed=focus.buildFocusPlan(prefs,base,good,{now});assert.equal(progressed.primarySlug,'bent-knee-straddle-lift','Repeated quality should move the suggested practice within the same safe level');
 const attempt={id:'a',nodeId:'planche-lean',sessionId:'s',at:'2026-11-07T14:00:00Z',metric:'seconds',value:3,target:8,quality:2};
 const repeat=focus.buildFocusPlan({...prefs,goalId:'planche'},{...base,tier:3,capabilities:['straight-arm-base']},[attempt],{now});assert.equal(repeat.focus,'control');assert.equal(repeat.primarySlug,'quadruped-planche-lean');
 const pain=focus.buildFocusPlan({...prefs,goalId:'planche'},base,[{...attempt,discomfort:'wrist'}],{now});assert(pain.reviewRequired);
 const future=focus.buildFocusPlan({...prefs,goalId:'planche'},base,[{...attempt,at:'2026-12-01T00:00:00Z'}],{now});assert.equal(future.evidenceCount,0);assert(!future.reviewRequired);
 const stale=focus.buildFocusPlan({...prefs,goalId:'planche'},base,[{...attempt,at:'2025-11-01T00:00:00Z'}],{now});assert.equal(stale.evidenceCount,0);
 const auto=focus.buildFocusPlan({...prefs,goalId:'auto'},base,[],{now});assert.equal(auto.goal.id,'foundation');
 const resume=focus.buildFocusPlan({...prefs,goalId:'auto'},base,[],{now,recentPathId:'pike-compression'});assert.equal(resume.goal.id,'pike-compression');
 for(const choice of focus.FOCUS_CHOICES){const selected=focus.buildFocusPlan({...prefs,focus:choice.id},base,[],{now});assert(selected.items.every(i=>!graph.trainingBlockers(i.exercise.slug,base,true).length));}
 focus.writeFocusPreferences('guest',prefs);assert.deepEqual(focus.readFocusPreferences('guest'),prefs);assert.equal(focus.readFocusPreferences('another-owner').goalId,'auto');assert.deepEqual(focus.sanitizeFocusPreferences({goalId:'invented',focus:'elite',minutes:999,energy:'intense'}),focus.DEFAULT_FOCUS);
 console.log(`PASS: ${cases} personalized goal/level/readiness/time/energy sessions, safe equipment/exit filtering, weak-link selection, regression after difficulty, discomfort review, stale/future evidence exclusion, no fabricated history, and owner-isolated preferences.`);
}finally{values.clear();await rm(dir,{recursive:true,force:true});}
