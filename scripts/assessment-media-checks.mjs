import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const dir=await mkdtemp(join(tmpdir(),'power-assessment-'));
async function load(name,entry){const outfile=join(dir,name+'.mjs');await build({entryPoints:[entry],outfile,bundle:true,platform:'node',format:'esm',logLevel:'silent'});return import(pathToFileURL(outfile).href);}
try{
 const a=await load('assessment','src/lib/trainingAssessment.ts');const media=await load('media','src/lib/mediaAudit.ts');
 const graph=await load('graph','src/lib/skillGraph.ts');const policy=await load('policy','src/lib/trainingPolicy.ts');
 assert.equal(a.assessStartingLevel({}).tier,1);
 const max=Object.fromEntries(a.ASSESSMENT_QUESTIONS.map(q=>[q.id,q.options.length-1]));
 assert.equal(a.assessStartingLevel(max).tier,3,'A questionnaire must never assign advanced or elite');
 assert.equal(a.assessStartingLevel({push:900,pull:-1,core:1}).tier,1);
 assert.equal(a.assessStartingLevel({inversion:2}).tier,1,'A single strong dimension must not promote the entire athlete');
 const base={tier:1,capabilities:[],equipment:['floor','wall'],safeExit:false};
 assert(!policy.allowedAtLevel('one-arm-push-up',{...a.assessStartingLevel(max)}));
 const now=Date.parse('2026-11-07T12:00:00Z');
 const logs=[];for(const slug of ['dead-bug','wall-push-up'])for(let n=0;n<6;n++)logs.push({id:slug+n,nodeId:slug,sessionId:'s'+Math.floor(n/2),at:new Date(now-(3-Math.floor(n/2))*86400000+n*1000).toISOString(),metric:'reps',value:5,target:5,quality:5});
 assert(a.levelReview(base,logs,now).ready);
 assert(!a.levelReview(base,logs.map(x=>({...x,sessionId:'same'})),now).ready);
 assert(!a.levelReview(base,logs.filter(x=>x.nodeId==='dead-bug'),now).ready);
 assert(!a.levelReview(base,logs.map(x=>({...x,target:1})),now).ready);
 assert(!a.levelReview(base,logs.map(x=>({...x,discomfort:'reported'})),now).ready);
 assert(!a.levelReview(base,logs,now+90*86400000).ready);
 assert(!a.levelReview(base,logs.map(x=>({...x,at:new Date(now+100000).toISOString()})),now).ready);
 assert.equal(graph.recommendedNode('planche',[],base,'quadruped-planche-lean'),'quadruped-planche-lean');
 const prefs=await load('themes','src/lib/themePreference.ts');
 const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)};
 assert.equal(prefs.initialTheme(),'vasa');memory.set('power-theme','default');assert.equal(prefs.initialTheme(),'default','A later deliberate choice must persist');
 memory.clear();memory.set('power-theme','ymca');assert.equal(prefs.initialTheme(),'ymca');
 memory.clear();memory.set('power-theme','default');assert.equal(prefs.initialTheme(),'vasa','The old default migrates once');
 const startup=await readFile('src/main.tsx','utf8');assert(!startup.includes('gold-2026-11'));assert(startup.includes('initialTheme()'));
 const catalog=JSON.parse(await readFile('src/data/publicExerciseCatalog.json','utf8'));
 const audit=media.videoAudit;assert.equal(audit.exercises.length,catalog.length);
 for(const exercise of catalog){const e=audit.exercises.find(x=>x.slug===exercise.slug);assert(e);assert.equal(e.url,exercise.youtube_url);if(e.url)assert(media.tutorialState(e.url,e.name).record);}
 assert.equal(media.resolveTutorialUrl('frog-stand','https://www.youtube.com/watch?v=7MNNGqec0Dc'),'https://www.youtube.com/watch?v=SrYBD4yCI84');
 assert(media.tutorialState('https://www.youtube.com/watch?v=0TnnnuMqDvQ','Windshield Wiper').blocked);
 for(const v of audit.videos){assert.equal(v.playback,'not_tested');assert.equal(v.movement,'not_reviewed');}
 console.log('PASS: conservative assessment, repeated-session advancement, stale/poor evidence rejection, goal boundary, full-catalog video coverage and corrected mappings.');
}finally{await rm(dir,{recursive:true,force:true});}
