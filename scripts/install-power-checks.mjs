import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import {build} from 'esbuild';
import {pathToFileURL} from 'node:url';
const handlers={},writes=[],deletes=[];const shell={status:200};const cache={addAll:async urls=>writes.push(...urls),put:async(k)=>writes.push(k),keys:async()=>[],delete:async()=>true};
const ctx={URL,Promise,caches:{open:async()=>cache,keys:async()=>['power-public-shell-old','other-app-cache'],delete:async k=>deletes.push(k),match:async()=>shell},fetch:async()=>{throw Error('Offline')},self:{location:{origin:'https://power.example'},addEventListener:(name,fn)=>handlers[name]=fn,skipWaiting:()=>{},clients:{claim:async()=>{}}}};
vm.runInNewContext(await readFile('public/power-sw.js','utf8'),ctx);
let pending=[];handlers.install({waitUntil:p=>pending.push(p)});await Promise.all(pending);assert(writes.includes('/'));assert(writes.includes('/icon-192.png'));pending=[];handlers.activate({waitUntil:p=>pending.push(p)});await Promise.all(pending);assert.deepEqual(deletes,['power-public-shell-old']);
for(const [url,method,mode] of [['https://power.example/api/chat','GET','cors'],['https://power.example/admin-login','GET','navigate'],['https://power.example/auth','GET','navigate'],['https://power.example/account-settings','GET','navigate'],['https://backend.example/profile','GET','cors'],['https://power.example/workout','POST','cors']]){let intercepted=false;handlers.fetch({request:{url,method,mode},respondWith:()=>intercepted=true});assert(!intercepted,`${url} must remain network-only`);}
let fallback;handlers.fetch({request:{url:'https://power.example/skills',method:'GET',mode:'navigate'},respondWith:p=>fallback=p});assert.equal(await fallback,shell,'Offline navigation should retain app shell');
const temp=await mkdtemp(path.join(tmpdir(),'power-install-'));
try{const out=path.join(temp,'install.mjs');await build({entryPoints:['src/lib/installPower.ts'],outfile:out,bundle:true,platform:'node',format:'esm',logLevel:'silent'});const listeners={};globalThis.window={addEventListener:(k,fn)=>listeners[k]=fn,dispatchEvent:()=>{},matchMedia:()=>({matches:false})};Object.defineProperty(globalThis,'navigator',{value:{standalone:false},configurable:true});const app=await import(pathToFileURL(out));app.preparePowerInstall();assert.equal(await app.promptPowerInstall(),'unavailable');let prompts=0,prevented=false;listeners.beforeinstallprompt({preventDefault:()=>prevented=true,prompt:async()=>prompts++,userChoice:Promise.resolve({outcome:'accepted'})});assert(prevented);assert.equal(prompts,0,'Capturing installation must never auto-install');assert.equal(await app.promptPowerInstall(),'accepted');assert.equal(prompts,1);assert.equal(await app.promptPowerInstall(),'unavailable','Native event must be consumed once');assert(!app.isPowerStandalone());}finally{await rm(temp,{recursive:true,force:true});}
console.log('PASS: public-shell offline fallback, network-only private routes/API/posts, isolated cache cleanup, early install-event capture, explicit user prompt and single-use installation event.');
