/* TLC Prime offline shell v5. Never cache user/account API data. */
const CACHE='tlc-prime-offline-v5';
const CORE=['/','/manifest.json','/spread-more-tlc-loading.svg','/icons/tlc-doodle-192.png','/icons/tlc-doodle-512.png'];
const MAX_ITEMS=380;
const isPrivatePath=path=>/^\/(api|auth|admin(?:-login)?|account-settings|integrations)(\/|$)/.test(path);
const isAssetPath=path=>/^\/(assets|art|icons|movement-previews|movement-photos)\//.test(path);
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
  caches.keys().then(keys=>Promise.all(keys.filter(k=>(k.startsWith('power-public-shell-')||k.startsWith('tlc-prime-offline-'))&&k!==CACHE).map(k=>caches.delete(k)))),
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
    return (await caches.match('/'))||new Response('TLC Prime is offline. Connect once to prepare the training app.',{status:503,headers:{'Content-Type':'text/plain'}});
   }
  })());
  return;
 }
 if(isAssetPath(url.pathname)||url.pathname==='/spread-more-tlc-loading.svg'||url.pathname==='/manifest.json'){
  event.respondWith((async()=>{
   const cached=await caches.match(req);
   if(cached)return cached;
   try{
    const response=await fetch(req);
    if(response.ok)event.waitUntil(save(req,response));
    return response;
   }catch{
    return Response.error();
   }
  })());
 }
});
