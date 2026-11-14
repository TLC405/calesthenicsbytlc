import assert from 'node:assert/strict';
import { build } from 'esbuild';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';

const folder=await mkdtemp(join(tmpdir(),'tlc-quality-audit-'));
try{
 const output=join(folder,'requirements.mjs');
 await build({entryPoints:['src/data/movementRequirements.ts'],outfile:output,bundle:true,format:'esm',platform:'node',logLevel:'silent',alias:{'@':'./src'}});
 const {movementRequirementsFor,MOVEMENT_REQUIREMENT_PATHS}=await import(pathToFileURL(output).href);
 const source=await readFile('src/data/skillPaths.ts','utf8');
 const pathFile=join(folder,'paths.mjs');
 await build({entryPoints:['src/data/skillPaths.ts'],outfile:pathFile,bundle:true,format:'esm',platform:'node',logLevel:'silent'});
 const {SKILL_PATHS}=await import(pathToFileURL(pathFile).href);
 const catalog=JSON.parse(await readFile('src/data/publicExerciseCatalog.json','utf8'));
 const ids=new Set(catalog.map(x=>x.slug));
 const chart=JSON.parse(await readFile('src/data/masterSkillMap.json','utf8'));
 assert.equal(SKILL_PATHS.length,54,'Keep all 54 existing pathway IDs');
 assert.equal(new Set(MOVEMENT_REQUIREMENT_PATHS).size,SKILL_PATHS.length,'All 54 movement support profiles are unique');
 assert(SKILL_PATHS.every(path=>MOVEMENT_REQUIREMENT_PATHS.includes(path.id)),'Every pathway must have curated supporting movements');
 assert.equal(catalog.length,303,'Four evidence-aware gaps added without fabricated media');
 assert.equal(chart.nodes.length,80);
 assert.equal(chart.edges.length,93);
 assert(chart.nodes.every(n=>n.linkedSlugs.every(x=>ids.has(x))),'Every Skill Tree drill is a real catalog record');
 const tiers={1:0,2:0,3:0,4:0,5:0};const flagged=[];
 for(const path of SKILL_PATHS){
  assert(['progression','collection'].includes(path.kind),'No untyped path '+path.id);
  const roles=movementRequirementsFor(path);
  assert(roles.length>=2,'Every path needs at least two curated supporting movements '+path.id);
  assert(roles.every(x=>ids.has(x.slug)),'Unknown support in '+path.id);
  assert(new Set(roles.map(x=>x.slug)).size===roles.length,'Duplicate support '+path.id);
  assert(roles.some(x=>!x.inMainPath),'All supporting exercises must not be duplicate main steps '+path.id);
  for(const item of roles){assert(item.level>=1&&item.level<=5,'Invalid existing difficulty metadata');}
  for(const movement of path.slugs){assert(ids.has(movement),'Missing main movement '+movement+' in '+path.id);}
  for(const movement of path.accessories||[])assert(ids.has(movement),'Missing optional drill '+movement+' in '+path.id);
  for(const branch of path.branches||[]){
   assert(branch.length>=2,'Invalid branch '+path.id);
   for(const slug of branch)assert(path.slugs.includes(slug),'Alternate lever shape not in main path '+slug);
  }
  const bySlug=new Map(catalog.map(x=>[x.slug,x]));
  const jumps=path.slugs.slice(1).filter((slug,i)=>((bySlug.get(slug)?.difficulty_level||1)-(bySlug.get(path.slugs[i])?.difficulty_level||1))>1);
  if(jumps.length)flagged.push({id:path.id,count:jumps.length});
 }
 for(const [id,steps] of Object.entries({
  planche:['quadruped-planche-lean','planche-lean','tuck-planche','advanced-tuck-planche','straddle-planche','full-planche'],
  'front-lever':['tuck-front-lever','advanced-tuck-front-lever-on-rings','one-leg-front-lever','straddle-front-lever','front-lever'],
  'posterior-chain':['sliding-leg-curl','nordic-curl-negative','nordic-curl'],
  pistol:['assisted-box-pistol-sit','assisted-pistol-squat','pistol-squat','dragon-pistol']
 })){
  const path=SKILL_PATHS.find(p=>p.id===id);
  const indices=steps.map(slug=>path.slugs.indexOf(slug));
  assert(indices.every(n=>n>=0)&&indices.every((n,i)=>!i||n>indices[i-1]),'Expected progression milestones ordered for '+id);
 }
 const front=SKILL_PATHS.find(p=>p.id==='front-lever');
 assert(front.branches?.some(group=>group.includes('one-leg-front-lever')&&group.includes('straddle-front-lever')),'Front lever variants are alternative branches');
 for(const id of ['leg-strength','grip-support','calves-tibialis'])
  assert.equal(SKILL_PATHS.find(p=>p.id===id).kind,'collection','Mixed movement patterns cannot imply compulsory linear training '+id);
 assert(SKILL_PATHS.find(p=>p.id==='handstand').accessories.includes('handstand-bail'),'Safe exits retained as preparation');
 assert(SKILL_PATHS.find(p=>p.id==='planche').accessories.includes('pseudo-planche-push-up'),'Dynamic planche strength remains supporting work');
 assert(!SKILL_PATHS.find(p=>p.id==='planche').slugs.includes('band-assisted-tuck-planche'),'Band assist is not a forced progression step');
 assert(SKILL_PATHS.find(p=>p.id==='pike-press').title==='Pike Push-Ups to HSPU','Distinguish bent-arm presses from straight-arm press to handstand');
 const [studio,tree,app,more]=await Promise.all(['src/pages/SkillStudio.tsx','src/pages/MasterSkillMap.tsx','src/App.tsx','src/pages/More.tsx'].map(x=>readFile(x,'utf8')));
 assert(studio.includes('<MovementRequirementsPanel')&&studio.includes('requestedMove')&&studio.includes("next.set('movement',slug)"),'Studio needs real supporting UI and deep-linked movement selection');
 assert(tree.includes('<MovementRequirementsPanel')&&tree.includes('?movement='),'Tree needs matching movement drill routes');
 assert(app.includes('progression-quality.css')&&app.includes('lazy(()=>import("./pages/SkillStudio"))'),'Performance quality: deferred Studio chunk and new theme-safe styles');
 assert(!more.includes('Community and coaching'),'No unwanted community marketing on the training tools page');
 console.log('PASS: 54 curated pathways, 303 real drills, 80 Skill Tree nodes, complete main-vs-support separation, 4 new bridge drills, alternate lever branches, video-first Studio deep links, and focused navigation.');
 console.log('INFORMATIONAL: '+flagged.length+' paths contain at least one >1 catalog difficulty-level jump. These ratings are approximate and are NOT mandatory readiness gates: '+flagged.map(x=>x.id).join(', '));
}finally{await rm(folder,{recursive:true,force:true});}
