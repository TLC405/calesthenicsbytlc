import {build} from 'esbuild';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const temp=await mkdtemp(path.join(tmpdir(),'power-media-sweep-'));
try{await build({entryPoints:['src/lib/movementThumbnails.ts'],outfile:path.join(temp,'sources.mjs'),bundle:true,platform:'node',format:'esm',logLevel:'silent'});const {movementThumbnailSources}=await import(pathToFileURL(path.join(temp,'sources.mjs')));const catalog=JSON.parse(await readFile('src/data/publicExerciseCatalog.json','utf8'));const rows=catalog.map(e=>({...e,candidates:movementThumbnailSources(e).filter(s=>s.url).filter((s,i,list)=>list.findIndex(x=>x.url===s.url)===i)}));await writeFile(process.argv[2]||'/tmp/power-media-sweep-input.json',JSON.stringify(rows));}finally{await rm(temp,{recursive:true,force:true});}
