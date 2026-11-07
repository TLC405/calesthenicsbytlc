import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const dir=await mkdtemp(path.join(tmpdir(),'power-beginner-'));
try{
 async function load(name,file){const out=path.join(dir,name+'.mjs');await build({entryPoints:[file],outfile:out,bundle:true,platform:'node',format:'esm',logLevel:'silent'});return import(pathToFileURL(out));}
 const [launch,focus,graph,media]=await Promise.all([load('launch','src/lib/launchHome.ts'),load('focus','src/lib/focusPlan.ts'),load('graph','src/lib/skillGraph.ts'),load('media','src/lib/movementThumbnails.ts')]);
 assert(launch.shouldLaunchHome(true,'/skills/rings',true));assert(!launch.shouldLaunchHome(false,'/skills/rings',true));assert(!launch.shouldLaunchHome(true,'/workout',false));assert(!launch.shouldLaunchHome(true,'/',true));assert(!launch.shouldLaunchHome(true,'/admin-login',true));
 const manifest=JSON.parse(await readFile('public/manifest.json','utf8'));assert.equal(manifest.start_url,'/?launch=home');assert.equal(manifest.id,'/power-independent-guest');assert.deepEqual(manifest.shortcuts.map(s=>s.url),['/','/skills','/today']);
 for(const goalId of ['rings','straight-arm','planche','yoga-foundation'])for(const warmup of ['yoga','mobility'])for(const tier of [1,2,3]){
  const profile={tier,capabilities:[],equipment:['floor','wall','rings'],safeExit:false};const plan=focus.buildFocusPlan({goalId,focus:'auto',minutes:25,energy:'normal',warmup},profile,[]);
  assert(plan.items.every(i=>graph.trainingBlockers(i.exercise.slug,profile,true).length===0));assert(!plan.items.some(i=>i.exercise.slug==='one-arm-push-up'));
  if(warmup==='yoga')assert(plan.items.some(i=>i.exercise.slug==='cat-cow'&&i.phase==='warmup'));
 }
 const cache=JSON.parse(await readFile('src/data/thumbnailCache.json','utf8'));for(const [id,entry] of Object.entries(cache)){const bytes=await readFile(`public/movement-previews/${id}.jpg`);assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.sha256);assert(entry.width>120&&entry.height>90);}
 const catalog=JSON.parse(await readFile('src/data/publicExerciseCatalog.json','utf8'));
 for(const slug of ['chair-pose','dolphin-pose','camel-pose','warrior-ii','half-moon-pose'])assert(media.movementThumbnailSources(catalog.find(e=>e.slug===slug)).some(s=>s.scope==='clip'));
 for(const e of catalog.filter(e=>e.category==='Rings'))assert(media.movementThumbnailSources(e).length>0,`Missing ring preview ${e.slug}`);
 for(const slug of ['wrist-circles','frog-stretch','deep-squat-hold'])assert(media.movementThumbnailSources(catalog.find(e=>e.slug===slug)).some(s=>s.src.startsWith('/movement-photos/')));
 console.log('PASS: installed-app Home launch without overriding browser links or in-app navigation, preserved installation identity, 24 safe ring/straight-arm/yoga warm-up cases, all Rings preview coverage, five newly sourced yoga previews and local photo fallbacks.');
}finally{await rm(dir,{recursive:true,force:true});}
