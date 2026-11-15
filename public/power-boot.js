/* Runs before React: a failed bundle must not strand the app behind artwork. */
(function(){
 'use strict';
 var build=document.querySelector('meta[name="tlc-build"]')?.content||'development';
 var started=Date.now(),ready=false,repairing=false,released=false;
 var retryKey='tlc-shell-repair-v1';
 var owned=function(name){return name.startsWith('tlc-prime-offline-')||name.startsWith('power-public-shell-');};
 function hasRetried(){
  if(new URL(location.href).searchParams.has('__tlc_retry'))return true;
  try{var value=JSON.parse(sessionStorage.getItem(retryKey)||'null');return value&&Date.now()-value.at<120000;}catch{return false;}
 }
 function show(message){
  var boot=document.getElementById('tlc-prime-boot');
  if(!boot){boot=document.createElement('div');boot.id='tlc-prime-boot';document.body.append(boot);}
  boot.classList.remove('is-leaving');
  boot.style.cssText='position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;padding:24px;background:#fafafa;color:#082b4a;font:16px/1.5 system-ui';
  var panel=document.createElement('section');panel.style.cssText='max-width:400px;padding:24px;border:1px solid #b6c1ca;border-radius:18px;background:white';
  var heading=document.createElement('h1');heading.textContent='Opening your training';heading.style.cssText='font-size:23px;line-height:1.2;margin:0 0 12px';
  var copy=document.createElement('p');copy.setAttribute('role','status');copy.textContent=message;
  var note=document.createElement('p');note.textContent='Your saved workouts and sign-in stay on this device.';note.style.cssText='font-size:13px;color:#4b5968';
  panel.append(heading,copy,note);
  if(!repairing){var button=document.createElement('button');button.textContent='Try again';button.style.cssText='min-height:48px;padding:10px 18px;margin-top:12px;border:0;border-radius:10px;background:#082b4a;color:white;font:700 15px system-ui';button.onclick=function(){location.reload();};panel.append(button);}
  boot.replaceChildren(panel);
 }
 async function reachable(){
  var controller=new AbortController();var timer;
  try{
   var response=await Promise.race([fetch('/power-version.json?check='+Date.now(),{cache:'no-store',signal:controller.signal}),new Promise(function(_,reject){timer=setTimeout(function(){controller.abort();reject(Error('connection timeout'));},4000);})]);
   if(!response.ok||!(response.headers.get('Content-Type')||'').includes('application/json'))return false;
   return Boolean((await response.json()).revision);
  }catch{return false;}finally{clearTimeout(timer);}
 }
 async function repair(reason,force){
  if(repairing)return;
  if(!navigator.onLine){show('You’re offline. Reconnect to finish opening this screen.');return;}
  if(!force&&hasRetried()){show('This screen still cannot connect. Your training is safe; the app will try again when the connection returns.');return;}
  repairing=true;show('Restoring the latest app automatically…');
  if(!await reachable()){repairing=false;show('The connection is taking too long. Your saved training is safe.');return;}
  try{sessionStorage.setItem(retryKey,JSON.stringify({at:Date.now(),build:build}));}catch{}
  var work=[];
  try{if('caches' in window)work.push(caches.keys().then(function(keys){return Promise.all(keys.filter(owned).map(function(key){return caches.delete(key);}));}));}catch{}
  try{if('serviceWorker' in navigator)work.push(navigator.serviceWorker.getRegistrations().then(function(regs){return Promise.all(regs.filter(function(reg){var script=reg.active?.scriptURL||reg.waiting?.scriptURL||reg.installing?.scriptURL||'';return new URL(script||location.href).pathname==='/power-sw.js';}).map(function(reg){return reg.unregister();}));}));}catch{}
  await Promise.race([Promise.allSettled(work),new Promise(function(resolve){setTimeout(resolve,2500);})]);
  var url=new URL(location.href);
  if(location.pathname==='/recover.html'){
   var target=url.searchParams.get('return')||'/';
   try{var safe=new URL(target,location.origin);url=safe.origin===location.origin&&safe.pathname!=='/recover.html'?safe:new URL('/',location.origin);}catch{url=new URL('/',location.origin);}
  }
  url.searchParams.set('__tlc_retry','1');url.searchParams.set('__tlc_fresh',String(Date.now()));
  location.replace(url.href);
 }
 function release(){
  if(released)return;released=true;
  var boot=document.getElementById('tlc-prime-boot');
  if(boot){boot.classList.add('is-leaving');setTimeout(function(){boot.remove();},360);}
  var url=new URL(location.href);
  if(url.searchParams.has('__tlc_retry')){url.searchParams.delete('__tlc_retry');url.searchParams.delete('__tlc_fresh');history.replaceState(history.state,'',url.href);}
 }
 function poll(){
  if(repairing||released)return;
  var elapsed=Date.now()-started;
  var screen=document.querySelector('.power-app-shell main,.power-app-shell .power-shell');
  var pending=document.querySelector('[data-route-loading],[data-auth-loading]');
  if(ready&&screen&&!pending&&elapsed>=3400){release();return;}
  if(elapsed>=14000){void repair('startup-timeout');return;}
  setTimeout(poll,100);
 }
 var chunkError=function(error){return /Loading chunk|Failed to fetch dynamically imported module|Importing a module script failed|dynamically imported module|Unable to preload CSS|Expected a JavaScript-or-Wasm module script/i.test(String(error?.message||error?.reason?.message||error||''));};
 window.addEventListener('vite:preloadError',function(event){event.preventDefault();void repair('stale-chunk');});
 window.addEventListener('error',function(event){var target=event.target;if((target instanceof HTMLScriptElement&&target.type==='module')||chunkError(event.error||event.message))void repair('bundle-error');},true);
 window.addEventListener('unhandledrejection',function(event){if(chunkError(event.reason)){event.preventDefault();void repair('bundle-rejection');}});
 window.addEventListener('online',function(){if(!released&&!repairing)void repair('connection-restored');});
 window.TLCBoot={ready:function(){ready=true;},repair:function(){return repair('route-error');},isChunkError:chunkError};
 if(location.pathname==='/recover.html'){
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){void repair('recovery-page',true);},{once:true});else void repair('recovery-page',true);
 }else if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',poll,{once:true});else poll();
})();
