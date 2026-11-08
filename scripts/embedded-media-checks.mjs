import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const dir=await mkdtemp(path.join(tmpdir(),'power-inline-media-'));
try{
 async function load(name,file){const out=path.join(dir,name+'.mjs');await build({entryPoints:[file],outfile:out,bundle:true,platform:'node',format:'esm',logLevel:'silent'});return import(pathToFileURL(out));}
 const [parser,media,paths]=await Promise.all([load('parser','src/lib/embeddedMedia.ts'),load('media','src/lib/movementThumbnails.ts'),load('paths','src/data/skillPaths.ts')]);const parse=parser.parseEmbeddedMedia;
 for(const url of ['https://www.youtube.com/watch?v=LlDNef_Ztsc','https://youtu.be/LlDNef_Ztsc','https://m.youtube.com/watch?v=LlDNef_Ztsc','https://www.youtube.com/live/LlDNef_Ztsc','https://www.youtube.com/shorts/LlDNef_Ztsc'])assert.equal(parse(url).videoId,'LlDNef_Ztsc');
 assert.equal(parse('https://www.youtube.com/watch?v=LlDNef_Ztsc&t=1m12s').startSeconds,72);assert.equal(parse('https://www.youtube.com/playlist?list=PLdemo12345').playlistId,'PLdemo12345');assert.equal(parse('https://www.instagram.com/reel/C0abcde1234/?igsh=tracking').embedUrl,'https://www.instagram.com/reel/C0abcde1234/embed/');
 for(const url of ['javascript:alert(1)','http://youtube.com/watch?v=LlDNef_Ztsc','https://youtube.com.evil.example/watch?v=LlDNef_Ztsc','https://evil.example/?v=LlDNef_Ztsc','https://user:password@youtube.com/watch?v=LlDNef_Ztsc','https://youtube.com:444/watch?v=LlDNef_Ztsc','https://instagram.com/pault8_upsidedown/','https://youtube.com/@creator/live','https://youtube.com/results?search_query=yoga','https://youtube.com/playlist?list=<script>'])assert.equal(parse(url),null,url);
 const catalog=JSON.parse(await readFile('src/data/publicExerciseCatalog.json','utf8'));for(const e of catalog){assert(media.movementThumbnailSources(e).every(s=>s.scope==='photo'||s.scope==='clip'));for(const s of media.movementTutorialSources(e))assert(parse(s.url),`Non-embedded lesson ${e.slug}`);}
 const compression=catalog.find(e=>e.slug==='bent-knee-compression-lift');assert.equal(media.movementThumbnailSources(compression).length,0);assert(media.movementTutorialSources(compression).length>0,'Related lesson must remain available even without a movement picture');
 const main=['rings','straight-arm','planche','pike-compression','handstand','straddle-press','stalder','yoga-foundation'];const covers=main.map(id=>{const p=paths.SKILL_PATHS.find(p=>p.id===id),e=media.skillCoverMovement(p);return {id,slug:e.slug,src:media.movementThumbnailSources(e)[0]?.src||'named:'+id};});assert(new Set(covers.map(c=>c.src)).size===8,JSON.stringify(covers));
 const timers=new Map();let counter=0,script=null,inserted=0;globalThis.window={setTimeout:fn=>{timers.set(++counter,fn);return counter;},clearTimeout:id=>timers.delete(id),onYouTubeIframeAPIReady:()=>{throw Error('Unrelated callback failed');}};globalThis.document={querySelector:()=>script,createElement:()=>({dataset:{},remove(){script=null;}}),head:{appendChild:s=>{script=s;inserted++;}}};
 const api=await load('api','src/lib/youtubeApi.ts');const first=api.loadYouTubeApi(),second=api.loadYouTubeApi();assert.equal(first,second);assert.equal(inserted,1);window.YT={Player:function(){}};window.onYouTubeIframeAPIReady();assert.equal(await first,window.YT);assert.equal(await second,window.YT);assert.equal(timers.size,0);await api.loadYouTubeApi();assert.equal(inserted,1,'Music and lessons must share one provider script');
 console.log('PASS: supported in-app video/live/playlist/Instagram sources; hostile/profile/search URL rejection; distinct Home covers; no guide pictures on exercise cards; related lesson preservation; and one shared player API despite callback failures.');console.log(JSON.stringify(covers));
}finally{await rm(dir,{recursive:true,force:true});}
