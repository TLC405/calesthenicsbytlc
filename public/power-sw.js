/* TLC Prime offline-first public shell. Account APIs and personal data are never cached. */
const CACHE='tlc-prime-offline-v4';
const CORE=['/','/manifest.json','/spread-more-tlc-loading.svg','/icons/tlc-doodle-192.png','/icons/tlc-doodle-512.png'];
const MAX_ITEMS=320;
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(async cache=>{
  await Promise.allSettled(CORE.map(url=>cache.add(url)));
 }));
 self.skipWaiting();
});
self.addEventListener('activate',event=>{
 event.waitUntil(Promise.all([
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('power-public-shell-')||k.startsWith('tlc-prime-offline-')&&k!==CACHE).map(k=>caches.delete(k)))),
  self.clients.claim()
 ]));
});
const blocked=path=>/^\/(api|auth|admin(?:-login)?|account-settings|integrations)(\/|$)/.test(path);
async function store(req,res){
 if(!res||!res.ok||res.type==='opaque')return res;
 const cache=await caches.open(CACHE);await cache.put(req,res.clone());
 const keys=await cache.keys();if(keys.length>MAX_ITEMS){
  const old=keys.find(k=>!CORE.includes(new URL(k.url).pathname));if(old)await cache.delete(old);
 }return res;
}
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==self.location.origin||blocked(url.pathname))return;
 if(req.mode==='navigate'){
  event.respondWith(fetch(req).then(res=>{if(res.ok)event.waitUntil(store('/',res));return res}).catch(async()=>await caches.match('/')||new Response('Offline: open TLC Prime once while connected to save its interface.',{status:503,headers:{'Content-Type':'text/plain'}})));
  return;
 }
 if(/^\/(assets|art|icons|movement-previews|movement-photos)\//.test(url.pathname)){
  event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{event.waitUntil(store(req,res));return res})));
 }
});
