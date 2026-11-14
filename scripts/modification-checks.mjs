import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';

const dir=await mkdtemp(path.join(tmpdir(),'tlc-modification-checks-'));
try{
 const output=path.join(dir,'modifications.mjs');
 await build({entryPoints:['src/lib/movementModifications.ts'],outfile:output,
  bundle:true,platform:'node',format:'esm',logLevel:'silent',
  alias:{'@':'./src'}});
 const {movementModifications}=await import(pathToFileURL(output).href);
 const catalog=JSON.parse(await readFile('src/data/publicExerciseCatalog.json','utf8'));
 let applicable=0,foundations=0,elite=0,named=0,setup=0;
 const missing=[];const violations=[];
 const known=new Map(catalog.map(e=>[e.slug,e]));
 for(const exercise of catalog){
  const plan=movementModifications(exercise.slug);
  if(plan.kind==='foundation'){
   foundations++;
   if(plan.options.length>0)violations.push(exercise.slug+': starting variation should remain simple');
   continue;
  }
  if(plan.kind==='elite'){
   elite++;
   if(plan.options.some(x=>x.source==='setup'))violations.push(exercise.slug+': no generic elite substitutions');
  }else{
   applicable++;
   if(plan.options.length===0)missing.push(exercise.slug);
  }
  const ids=new Set();
  for(const option of plan.options){
   if(ids.has(option.id))violations.push(exercise.slug+': duplicate modification');
   ids.add(option.id);
   if(option.slug){
    named++;
    if(!known.has(option.slug))violations.push(exercise.slug+': unknown linked modification '+option.slug);
    const next=movementModifications(option.slug);
    if(next.level>plan.level)violations.push(exercise.slug+': harder linked modification '+option.slug);
    if(option.slug===exercise.slug)violations.push(exercise.slug+': self loop');
   }else{
    setup++;
    if(!option.detail||option.detail.length<25)violations.push(exercise.slug+': missing safety instruction');
   }
  }
 }
 assert.deepEqual(missing,[], 'All intermediate exercises must offer modification guidance');
 assert.deepEqual(violations,[], 'Options must remain valid and avoid misleading mappings');
 const push=movementModifications('push-up');
 assert.deepEqual(push.options.slice(0,2).map(x=>x.slug),['incline-push-up','wall-push-up'],'Full push-ups should show two established regressions');
 assert.equal(movementModifications('dead-bug').kind,'foundation','Starting moves should not have extra complexity');
 assert.equal(movementModifications('iron-cross').kind,'elite','Elite movements require prerequisite warnings');
 const overview=await readFile('src/components/Exercise/MovementOverview.tsx','utf8');
 const app=await readFile('src/App.tsx','utf8');
 assert(overview.includes('<MovementModifications'), 'Modification UI must appear in every exercise guide');
 assert(app.includes('movement-modifications.css'), 'Five-theme styles must load');
 console.log(`PASS: ${catalog.length} catalog movements checked — ${applicable} intermediate with modification guidance, ${foundations} starting, ${elite} elite; ${named} named links and ${setup} setup options validated.`);
}finally{await rm(dir,{recursive:true,force:true});}
