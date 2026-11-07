/* Public app shell and static images only. Private APIs and account data stay network-only. */
const CACHE='power-public-shell-v1';
const ASSETS=['/','/manifest.json','/icon-192.png','/icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('power-public-shell-')&&key!==CACHE).map(key=>caches.delete(key)))),self.clients.claim()]));});
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==self.location.origin||/^\/(api|auth|admin(?:-login)?|account-settings)(\/|$)/.test(url.pathname))return;
 if(req.mode==='navigate'){event.respondWith(fetch(req).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put('/',copy)));}return response;}).catch(()=>caches.match('/')));return;}
 if(!/^\/(assets|art|movement-previews|movement-photos)\//.test(url.pathname))return;
 event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(async cache=>{await cache.put(req,copy);const keys=await cache.keys();if(keys.length>220)await cache.delete(keys.find(key=>!ASSETS.includes(new URL(key.url).pathname))||keys[0]);}));}return response;})));
});
