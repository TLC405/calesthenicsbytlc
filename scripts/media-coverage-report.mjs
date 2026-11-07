import {build} from 'esbuild';
import {mkdtemp,readFile,writeFile,rm,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const temp=await mkdtemp(path.join(tmpdir(),'power-coverage-'));
try{
 await build({entryPoints:['src/lib/movementThumbnails.ts'],outfile:path.join(temp,'media.mjs'),bundle:true,platform:'node',format:'esm',logLevel:'silent'});
 const {movementThumbnailSources}=await import(pathToFileURL(path.join(temp,'media.mjs')));
 const catalog=JSON.parse(await readFile('src/data/publicExerciseCatalog.json','utf8')),audit=JSON.parse(await readFile('src/data/videoAudit.json','utf8'));
 const rows=catalog.map(e=>{const sources=movementThumbnailSources(e);const lesson=sources.find(s=>s.url);return {slug:e.slug,name:e.name,image:sources[0]?.scope||'none',lesson:lesson?.scope||'missing',url:lesson?.url||'',title:lesson?.title||''};});
 const counts={records:rows.length,image:rows.filter(r=>r.image!=='none').length,exactCandidate:rows.filter(r=>r.lesson==='clip').length,relatedOnly:rows.filter(r=>r.lesson==='guide').length,noLesson:rows.filter(r=>r.lesson==='missing').length};
 const net=['reachable','unavailable','unchecked'].map(k=>`${audit.videos.filter(v=>v.availability===k).length} ${k}`).join(', ');
 const safe=x=>String(x).replaceAll('|','/').replaceAll('\n',' ');
 const lines=['# POWER media sweep — November 7, 2026','',`Checked ${counts.records} catalog records and ${audit.videos.length} unique provider URLs: ${net}.`, '',`Image fallback coverage: ${counts.image}/${counts.records}. ${counts.exactCandidate} records offer an exercise-specific video candidate; ${counts.relatedOnly} offer only a clearly labeled related lesson; ${counts.noLesson} still need a suitable tutorial.`, '', 'The scan checks public YouTube oEmbed metadata and thumbnail dimensions. It does not prove playback on a phone, technique quality, or movement identity. Existing withheld/wrong-variation decisions remain excluded. Cached previews preserve provider bytes and source hashes. Category images are labeled and never create a tutorial link. Aliases are counted as catalog records, not new movements.','', '## Catalog coverage','', '| Exercise | Slug | First preview | Lesson type | Eligible lesson |','|---|---|---|---|---|',...rows.map(r=>`| ${safe(r.name)} | ${r.slug} | ${r.image} | ${r.lesson==='clip'?'Exercise candidate':r.lesson==='guide'?'Related lesson':'Still needed'} | ${r.url?`[${safe(r.title)}](${r.url})`:'—'} |`),'', '## Unavailable or unchecked URLs','', '| Provider ID | Metadata result | Last checked |','|---|---|---|',...audit.videos.filter(v=>v.availability!=='reachable').map(v=>`| ${v.videoId} | ${v.availability} | ${v.checkedAt} |`),''];
 await mkdir('audits',{recursive:true});await writeFile('audits/MEDIA_SWEEP_2026-11-07.md',lines.join('\n'));console.log(JSON.stringify({...counts,uniqueVideos:audit.videos.length,network:net}));
}finally{await rm(temp,{recursive:true,force:true});}
