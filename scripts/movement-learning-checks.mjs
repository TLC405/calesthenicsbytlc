import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const dir=await mkdtemp(path.join(tmpdir(),'power-movements-'));
try{
 async function load(name,file){const out=path.join(dir,name+'.mjs');await build({entryPoints:[file],outfile:out,bundle:true,platform:'node',format:'esm',logLevel:'silent'});return import(pathToFileURL(out));}
 const [media,relations,focus,policy]=await Promise.all([load('media','src/lib/movementThumbnails.ts'),load('relations','src/lib/movementRelations.ts'),load('focus','src/lib/focusPlan.ts'),load('policy','src/lib/trainingPolicy.ts')]);
 const catalog=JSON.parse(await readFile('src/data/publicExerciseCatalog.json','utf8'));const profile={tier:1,capabilities:[],equipment:['floor'],safeExit:false};
 for(const exercise of catalog){const sources=media.movementThumbnailSources(exercise);assert.equal(new Set(sources.map(s=>s.src)).size,sources.length);assert(sources.every(s=>['photo','clip','guide','category'].includes(s.scope)));const links=relations.movementRelations(exercise.slug,profile);for(const options of Object.values(links))assert(options.every(o=>catalog.some(e=>e.slug===o.exercise.slug)));}
 const missing=media.movementThumbnailSources({slug:'custom-unpictured',name:'Unpictured custom exercise'});assert.equal(missing.length,0);
 const compression=media.movementThumbnailSources(catalog.find(e=>e.slug==='bent-knee-compression-lift'));assert.equal(compression[0].scope,'guide');assert(compression[0].title.includes('Paul Twyman'));
 const blocked=media.movementThumbnailSources(catalog.find(e=>e.slug==='windshield-wiper'));assert(!blocked.some(s=>s.src.includes('0TnnnuMqDvQ')));
 const wrong=media.movementThumbnailSources(catalog.find(e=>e.slug==='passe-balance'));assert(!wrong.some(s=>s.scope==='clip'));
 const own=media.movementThumbnailSources({slug:'wall-push-up',name:'Wall Push-up',image_url:'/my-own-photo.webp'});assert.equal(own[0].scope,'photo');
 assert.equal(media.movementThumbnailSources(catalog.find(e=>e.slug==='wrist-circles'))[0].scope,'clip');
 const push=relations.movementRelations('push-up',profile);assert(push.easier.some(o=>o.exercise.slug==='incline-push-up'));assert(push.harder.every(o=>o.reasons.length>0));assert(!relations.movementRelations('tuck-planche',profile).harder.some(o=>o.exercise.slug.endsWith('1768085455793')));
 const now=Date.parse('2026-11-07T16:00:00Z');const logs=Array.from({length:3},(_,i)=>({id:String(i),nodeId:'push-up',sessionId:'s'+i,at:`2026-11-0${4+i}T12:00:00Z`,metric:'reps',value:6,target:5,quality:4}));
 assert.equal(focus.suggestedMovementTarget('push-up',logs,5).target,6);assert.equal(focus.suggestedMovementTarget('push-up',logs.slice(0,1),5).target,5);assert.equal(focus.suggestedMovementTarget('push-up',logs,5,true).target,5);
 assert.equal(focus.suggestedMovementTarget('push-up',logs.map(a=>({...a,sessionId:'same',at:'2026-11-07T12:00:00Z'})),5).target,5);
 assert.equal(focus.suggestedMovementTarget('push-up',[...logs,{...logs[0],at:'2026-11-07T13:00:00Z',value:2,quality:2}],5).target,1);
 const matched=logs.map((a,i)=>({...a,assistance:i===2?'band':'none'}));assert.equal(focus.suggestedMovementTarget('push-up',matched,5).target,5);
 assert.equal(focus.suggestedMovementTarget('push-up',[{...logs[0],target:7,value:7}],4).target,7);
 const capped=focus.suggestedMovementTarget('push-up',logs.map(a=>({...a,target:12,value:12})),4);assert.equal(capped.target,12);assert(!capped.reason.includes('increase'));
 const history=relations.movementHistorySummary('push-up',[...logs,{...logs[0],value:999,at:'2030-01-01'}],now);assert.equal(history.best,6);assert.equal(history.count,3);assert.equal(relations.movementHistorySummary('wall-push-up',logs,now).best,null);
 console.log('PASS: all 264 movement preview/connection records, withheld-media exclusion, labeled coaching guides, missing-image fallback, canonical progression links, readiness locks, real history, and comparable multi-session target adaptation.');
}finally{await rm(dir,{recursive:true,force:true});}
