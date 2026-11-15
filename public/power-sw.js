/* TLC Prime offline shell v5. Never cache user/account API data. */
const CACHE='tlc-prime-offline-v5';
const BUILD_ASSETS=[];
const CORE=['/','/manifest.json','/brand/spread-tlc-original-20261115.jpg','/icons/tlc-prime-20261115-192.png','/icons/tlc-prime-20261115-512.png','/icons/tlc-prime-20261115-maskable-512.png',...BUILD_ASSETS];
const MAX_ITEMS=380;
const isPrivatePath=path=>/^\/(api|auth|admin(?:-login)?|account-settings|integrations)(\/|$)/.test(path);
const isAssetPath=path=>/^\/(assets|art|brand|icons|movement-previews|movement-photos)\//.test(path);
async function save(req,response){
 if(!response||!response.ok||response.type==='opaque'||response.type==='opaqueredirect')return;
 const cache=await caches.open(CACHE);
 await cache.put(req,response.clone());
 const keys=await cache.keys();
 if(keys.length>MAX_ITEMS){
  const removable=keys.find(k=>!CORE.includes(new URL(k.url).pathname));
  if(removable)await cache.delete(removable);
 }
}
async function warmAppShell(){
 const cache=await caches.open(CACHE);
 await Promise.allSettled(CORE.map(path=>cache.add(path)));
 // Vite emits hashed scripts/styles. Pre-cache the actual entrypoints so a fresh
 // install can start offline after its first successful online visit.
 const page=await cache.match('/');
 if(!page)return;
 const html=await page.text();
 const urls=[...html.matchAll(/(?:src|href)=["'](\/assets\/[^"']+\.(?:js|css))["']/g)].map(match=>match[1]);
 await Promise.allSettled([...new Set(urls)].map(path=>cache.add(path)));
}
self.addEventListener('install',event=>{event.waitUntil(warmAppShell());self.skipWaiting();});
self.addEventListener('activate',event=>{
 event.waitUntil(Promise.all([
  // Retain one previous shell for an already-open older tab's lazy imports.
  caches.keys().then(keys=>Promise.all(keys.filter(k=>(k.startsWith('power-public-shell-')||k.startsWith('tlc-prime-offline-'))&&k!==CACHE).slice(0,-1).map(k=>caches.delete(k)))),
  self.clients.claim()
 ]));
});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET')return;
 const url=new URL(req.url);
 if(url.origin!==self.location.origin||isPrivatePath(url.pathname))return;
 if(req.mode==='navigate'){
  event.respondWith((async()=>{
   try{
    const response=await fetch(req);
    if(response.ok)event.waitUntil(save('/',response));
    return response;
   }catch{
    return (await (await caches.open(CACHE)).match('/'))||new Response('TLC Prime is offline. Connect once to prepare the training app.',{status:503,headers:{'Content-Type':'text/plain'}});
   }
  })());
  return;
 }
 if(isAssetPath(url.pathname)||url.pathname==='/spread-more-tlc-loading.svg'||url.pathname==='/manifest.json'){
  event.respondWith((async()=>{
   const cached=(await (await caches.open(CACHE)).match(req))||(url.pathname.startsWith('/assets/')?await caches.match(req):undefined);
   if(cached&&url.pathname!=='/manifest.json')return cached;
   try{
    const response=await fetch(req);
    if(response.ok)event.waitUntil(save(req,response));
    return response;
   }catch{
    return cached||Response.error();
   }
  })());
 }
});
