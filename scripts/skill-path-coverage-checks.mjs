import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const dir=await mkdtemp(join(tmpdir(),'tlc-pathway-coverage-'));
try{
 const outfile=join(dir,'skill-paths.mjs');
 await build({entryPoints:['src/data/skillPaths.ts'],bundle:true,platform:'node',format:'esm',outfile,logLevel:'silent'});
 const {SKILL_PATHS}=await import(pathToFileURL(outfile).href);
 const catalog=JSON.parse(await readFile('src/data/publicExerciseCatalog.json','utf8'));
 const graph=JSON.parse(await readFile('src/data/masterSkillMap.json','utf8'));
 const slugs=new Set(catalog.map(x=>x.slug));
 const ids=new Set();
 for(const p of SKILL_PATHS){
  assert(!ids.has(p.id),'Duplicate pathway ID: '+p.id);ids.add(p.id);
  assert(['progression','collection'].includes(p.kind),'Path needs explicit type: '+p.id);
  assert(Array.isArray(p.slugs)&&p.slugs.length>0,'Path without exercises: '+p.id);
  assert(p.slugs.every(s=>slugs.has(s)),'Unknown exercise in '+p.id);
  assert(new Set(p.slugs).size===p.slugs.length,'Duplicate movement inside path: '+p.id);
 }
 assert.equal(SKILL_PATHS.length,54,'Protect all 54 actual paths, including four added grip/leg tracks');
 for(const id of ['foundation','rings','pancake','recovery','yoga-foundation','grip-pinch'])
  assert.equal(SKILL_PATHS.find(p=>p.id===id)?.kind,'collection','Non-sequential group should never render a compulsory ladder: '+id);
 for(const id of ['planche','handstand','pull-up','push-up','ring-muscle-up','pistol','front-lever','back-lever'])
  assert.equal(SKILL_PATHS.find(p=>p.id===id)?.kind,'progression','Ordered skill needs authentic progression: '+id);
 assert.equal(catalog.length,303,'The catalog must retain 11 chart drills and 4 progression bridge drills');
 assert.equal(graph.nodes.length,80);
 assert(graph.nodes.every(n=>n.mapping!=='missing'&&n.linkedSlugs?.length>0),'All 80 map nodes are supported');
 assert(graph.nodes.every(n=>n.linkedSlugs.every(s=>slugs.has(s))),'No dead exercise links');
 const foundation=graph.nodes.find(n=>n.id==='foundation');
 assert.equal(foundation.mapping,'compound','Foundation is five movements, not a fake single exercise');
 assert.deepEqual(foundation.linkedSlugs,['push-up','pull-up','parallel-bar-dip','hollow-body-hold','wrist-circles']);
 for(const id of ['mu_sb_dips','qd_wall_sit','qd_rev_nord_part','qd_rev_nord_full','sq_dragon','pwr_broad','pwr_tuck'])
  assert.equal(graph.nodes.find(n=>n.id===id).mapping,'exact','New catalog movement should link exactly: '+id);
 for(const id of ['pwr_skater','pwr_depth'])
  assert.equal(graph.nodes.find(n=>n.id===id).linkedSlugs.length,2,'Combined chart drill needs separate genuine movement options: '+id);
 const studio=await readFile('src/pages/SkillStudio.tsx','utf8'),browser=await readFile('src/components/Progression/SkillCategoryBrowser.tsx','utf8');
 assert(studio.includes("path.kind==='collection'?'Move options':'Skill steps'"),'Collections cannot be presented as strict ladders');
 assert(browser.includes('path.kind'), 'Browser should distinguish step-by-step progressions and movement collections');
 const skills=await readFile('src/pages/Skills.tsx','utf8'),app=await readFile('src/App.tsx','utf8');
 assert(skills.includes("raw==='paths'||raw==='all'?raw:'tree'"),'The Skills tab must show the tree by default');
 assert(app.includes('<RouteGuard>'),'Rendering errors must not leave blank pages');
 console.log('PASS: All 54 paths classified, 303 real catalog drills, 80 connected chart nodes, authentic compound hubs, Skills tree default and recoverable route errors.');
}finally{await rm(dir,{recursive:true,force:true});}
