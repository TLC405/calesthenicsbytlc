import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
const dir=await mkdtemp(path.join(tmpdir(),'power-graph-'));
const values=new Map();
globalThis.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v))};
globalThis.window=new EventTarget();
try {
 const output=path.join(dir,'graph.mjs');
 await build({entryPoints:['src/lib/skillGraph.ts'],outfile:output,bundle:true,platform:'node',format:'esm',alias:{'@':path.resolve('src')},logLevel:'silent'});
 const graph=await import(pathToFileURL(output));
 assert.deepEqual(graph.graphProblems(),[],'Graph must have no missing references or prerequisite cycles');
 assert.equal(graph.nodeProgress('tuck-planche',[]).state,'Untried');
 const entry={id:'test-1',nodeId:'tuck-planche',sessionId:'session-1',at:'2026-11-01T10:00:00Z',metric:'seconds',value:8,target:8,quality:4};
 assert.equal(graph.nodeProgress('tuck-planche',[entry]).consistent,false,'One attempt cannot establish consistency');
 const logs=[entry,{...entry,id:'test-2',sessionId:'session-2'},{...entry,id:'test-3',sessionId:'session-2'}];
 assert.equal(graph.nodeProgress('tuck-planche',logs).consistent,true);
 assert.equal(graph.nodeProgress('tuck-planche',[...logs,{...entry,id:'failed',quality:1,at:'2026-11-02T10:00:00Z',discomfort:'wrist'}]).consistent,false);
 graph.saveAttempt('test',entry);graph.saveAttempt('test',entry);
 assert.equal(graph.deviceSkillProgress.read('test').length,1,'Re-saving one set must not inflate progress');
 graph.removeAttempt('test',entry.id);assert.equal(graph.deviceSkillProgress.read('test').length,0);
 assert.equal(graph.regressionFor('tuck-planche'),'frog-stand');
 assert(graph.trainingBlockers('ring-dip',{equipment:['floor'],safeExit:false},true).some(x=>x.includes('rings')));
 assert(graph.trainingBlockers('freestanding-handstand',{equipment:['floor'],safeExit:false},true).some(x=>x.includes('exit')));
 assert.deepEqual(graph.trainingBlockers('planche-lean',{equipment:['floor'],safeExit:false},true),[]);
 assert.equal(graph.recommendedNode('planche',[]),'planche-lean');
 assert.equal(graph.nodeDose('handstand-push-up').metric,'reps');
 assert.equal(graph.nodeDose('ring-support-hold').metric,'seconds');
 const builderFile=path.join(dir,'builder.mjs');
 await build({entryPoints:['src/lib/skillWorkoutBuilder.ts'],outfile:builderFile,bundle:true,platform:'node',format:'esm',alias:{'@':path.resolve('src')},logLevel:'silent'});
 const builder=await import(pathToFileURL(builderFile));
 for(const goal of builder.SKILL_GOALS)for(const level of ['foundation','building','advanced'])for(const minutes of [15,25,40]){
  const items=builder.buildSkillWorkout(goal.id,level,minutes);
  assert(items.some(x=>x.phase==='skill'),`${goal.id}/${level}: no actual skill drill`);
  assert(items.every(x=>graph.exerciseBySlug.has(x.exercise.slug)));
  assert.equal(new Set(items.map(x=>x.exercise.slug)).size,items.length,'Routine repeats a movement');
  assert(builder.toSessionEntries(items).every(x=>Number.isFinite(x.restSeconds)&&x.sets.length>0));
 }
 console.log('PASS: graph integrity, evidence thresholds, storage, regressions, equipment/exit checks, and every goal/level/duration routine.');
} finally {values.clear();await rm(dir,{recursive:true,force:true});}
