import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const dir=await mkdtemp(path.join(tmpdir(),'tlc-tv-'));
try{
 const out=path.join(dir,'tv.mjs');await build({entryPoints:['src/lib/tlcTv.ts'],outfile:out,bundle:true,platform:'node',format:'esm',logLevel:'silent'});const tv=await import(pathToFileURL(out));
 assert.equal(tv.directVideoUrl('https://my.example/video.mp4?token=public#x'),'https://my.example/video.mp4?token=public');
 for(const url of ['http://my.example/video.mp4','javascript:alert(1)','https://youtube.com/video.mp4','https://r1.googlevideo.com/file.mp4','https://youtube-nocookie.com/video.webm','https://instagram.com/file.mp4','https://user:password@my.example/file.mp4','https://my.example/watch','https://my.example/stream.m3u8'])assert.equal(tv.directVideoUrl(url),null,url);
 assert(tv.directVideoUrl('http://127.0.0.1:4173/test.mp4',true));assert.equal(tv.directVideoUrl('http://127.0.0.1:4173/test.mp4'),null);
 const bytes=new Uint8Array([1,2,3,4,5]);const progress=[];const blob=await tv.readVideoResponse(new Response(bytes,{headers:{'content-type':'video/mp4','content-length':'5'}}),(n,total)=>progress.push([n,total]),new AbortController().signal);assert.equal(blob.size,5);assert.equal(blob.type,'video/mp4');assert.deepEqual(progress.at(-1),[5,5]);
 await assert.rejects(tv.readVideoResponse(new Response('<html/>',{headers:{'content-type':'text/html'}}),()=>{},new AbortController().signal),/webpage/);
 await assert.rejects(tv.readVideoResponse(new Response(bytes,{headers:{'content-type':'video/mp4','content-length':String(tv.TLC_VIDEO_LIMIT+1)}}),()=>{},new AbortController().signal),/150 MB/);
 await assert.rejects(tv.readVideoResponse(new Response(new Uint8Array(),{headers:{'content-type':'video/webm'}}),()=>{},new AbortController().signal),/empty/);
 const abort=new AbortController();abort.abort();await assert.rejects(tv.readVideoResponse(new Response(bytes,{headers:{'content-type':'video/mp4'}}),()=>{},abort.signal),{name:'AbortError'});
 await assert.rejects(tv.downloadTlcVideo('test','https://youtube.com/v.mp4','x',true),/official embeds/);await assert.rejects(tv.downloadTlcVideo('test','https://my.example/v.mp4','x',false),/permission/);
 console.log('PASS: direct-file validation, provider download exclusion, no credentials, bounded streaming, real progress, MIME checks, empty/oversize rejection, cancellation and rights confirmation.');
}finally{await rm(dir,{recursive:true,force:true});}
