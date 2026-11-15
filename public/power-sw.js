/* TLC Prime: transactional offline shell, bounded navigation and private-data bypass. */
const CACHE='tlc-prime-offline-source';
const BUILD_ASSETS=[];
const CORE=['/','/manifest.json','/recover.html','/power-boot.js','/icons/spread-more-tlc.svg','/brand/spread-tlc-original-20261115.jpg','/icons/tlc-prime-20261115-192.png','/icons/tlc-prime-20261115-512.png','/icons/tlc-prime-20261115-maskable-512.png',...BUILD_ASSETS];
const MAX_ITEMS=380;
const NETWORK_TIMEOUT=2500;
const isPrivatePath=path=>/^\/(api|auth|admin(?:-login)?|account-settings|integrations)(\/|$)/.test(path);
const isAssetPath=path=>/^\/(assets|art|brand|icons|movement-previews|movement-photos)\//.test(path);
const isOwnedCache=name=>name.startsWith('tlc-prime-offline-')||name.startsWith('power-public-shell-');
function validResponse(path,response){
 if(!response||!response.ok||response.type==='opaque'||response.type==='opaqueredirect'||response.redirected)return false;
 const type=response.headers.get('Content-Type')||'';
 if(/\.(?:m?js)$/.test(path))return /(?:java|ecma)script/i.test(type);
 if(/\.css$/.test(path))return /text\/css/i.test(type);
 if(/\.json$/.test(path))return /application\/json/i.test(type);
 if(/\.(?:svg|png|jpe?g|webp|ico)$/.test(path))return /^image\//i.test(type);
 return path==='/'||path.endsWith('.html')?/text\/html/i.test(type):!/text\/html/i.test(type);
}
async function save(req,response){
 const path=new URL(typeof req==='string'?req:req.url,self.location.origin).pathname;
 if(!validResponse(path,response))return;
 try{
  const cache=await caches.open(CACHE);
  const keys=await cache.keys();
  if(keys.length>=MAX_ITEMS){
   const removable=keys.find(k=>!CORE.includes(new URL(k.url).pathname));
   if(removable)await cache.delete(removable);
  }
  await cache.put(req,response.clone());
 }catch{/* Storage denial/quota must never prevent a network response from rendering. */}
}
async function cached(req){
 try{
  const path=new URL(typeof req==='string'?req:req.url,self.location.origin).pathname;
  const cache=await caches.open(CACHE);
  const response=await cache.match(req,{ignoreSearch:/^\/(?:icons|brand)\//.test(path)});
  if(validResponse(path,response))return response;
  // A previously open document may still request an older fingerprinted bundle.
  if(path.startsWith('/assets/')){
   const old=await caches.match(req);
   if(validResponse(path,old))return old;
  }
 }catch{}
}
async function warmAppShell(){
 const cache=await caches.open(CACHE);
 try{
  const pending=[...new Set(CORE)];
  // Bound concurrency to avoid starving first paint and mobile connections.
  const results=await Promise.allSettled(Array.from({length:6},async()=>{
   while(pending.length){
    const path=pending.shift();if(!path)break;
    const controller=new AbortController();
    let timer;
    const response=await Promise.race([fetch(new Request(path,{cache:'reload',signal:controller.signal})),new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('Offline download timed out'));},10000);})]).finally(()=>clearTimeout(timer));
    if(!validResponse(path,response))throw Error('Offline resource unavailable: '+path);
    if(path==='/'){
     const html=await response.clone().text();
     if(!html.includes('name="tlc-build" content="'+CACHE.slice('tlc-prime-offline-'.length)+'"'))throw Error('Offline shell version mismatch');
    }
    await cache.put(path,response);
   }
  }));
  const failed=results.find(result=>result.status==='rejected');
  if(failed)throw failed.reason;
 }catch(error){
  await caches.delete(CACHE);
  throw error; // The previous complete worker stays installed when any required asset fails.
 }
}
self.addEventListener('install',event=>{
 event.waitUntil(warmAppShell().then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  // Retain one previous complete release for older open documents.
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>isOwnedCache(k)&&k!==CACHE).slice(0,-1).map(k=>caches.delete(k)));
  try{await self.registration.navigationPreload?.enable();}catch{}
  await self.clients.claim();
 })());
});
async function navigate(event){
 const request=event.request;
 const controller=new AbortController();
 let timer;
 try{
  const network=(async()=>{const preloaded=await event.preloadResponse;return preloaded||await fetch(request,{cache:'no-cache',signal:controller.signal});})();
  const response=await Promise.race([network,new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('Navigation timed out'));},NETWORK_TIMEOUT);})]);
  if(response.status===401||response.status===403||response.redirected)return response;
  if(!response.ok)throw Error('Navigation unavailable');
  // Never replace this release's offline HTML with a newer release's document.
  const html=await response.clone().text();
  if(html.includes('name="tlc-build" content="'+CACHE.slice('tlc-prime-offline-'.length)+'"')){
   event.waitUntil(save('/',response));
  }
  return response;
 }catch{
  return await cached('/')||new Response('TLC Prime cannot connect yet. Your saved training has not been cleared.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
 }finally{clearTimeout(timer);}
}
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET'||req.headers.has('Range')||req.headers.has('Authorization'))return;
 const url=new URL(req.url);
 if(url.origin!==self.location.origin||isPrivatePath(url.pathname))return;
 if(req.mode==='navigate'){event.respondWith(navigate(event));return;}
 const metadata=url.pathname==='/manifest.json';
 if(isAssetPath(url.pathname)||metadata||['/power-boot.js','/recover.html'].includes(url.pathname)){
  event.respondWith((async()=>{
   const hit=await cached(req);
   if(hit&&!metadata)return hit;
   try{
    const response=await fetch(req);
    if(validResponse(url.pathname,response))event.waitUntil(save(req,response));
    return response;
   }catch{return hit||Response.error();}
  })());
 }
});
