import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const origin='https://tlc.test';
const worker=readFileSync('dist/power-sw.js','utf8');
const revision=JSON.parse(readFileSync('dist/power-version.json','utf8')).revision;
const current='tlc-prime-offline-'+revision;
const html='<html><meta name="tlc-build" content="'+revision+'"></html>';
const reply=(body,type='text/html',status=200)=>new Response(body,{status,headers:{'Content-Type':type}});
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let passed=0;
async function test(name,run){await run();passed++;console.log('PASS cache recovery: '+name);}
function harness(){
 const events={},stores=new Map(),deleted=[];let skipped=0,claimed=0;
 const key=req=>new URL(typeof req==='string'?req:req.url,origin).href;
 const open=async name=>{
  if(!stores.has(name))stores.set(name,new Map());
  const data=stores.get(name);
  return {async keys(){return [...data.keys()].map(url=>({url}));},async match(req,options={}){
   const url=key(req);const item=options.ignoreSearch?[...data.entries()].find(([stored])=>stored.split('?')[0]===url.split('?')[0])?.[1]:data.get(url);
   return item?.clone();
  },async put(req,response){data.set(key(req),response.clone());},async delete(req){return data.delete(key(req));}};
 };
 const caches={open,async keys(){return [...stores.keys()];},async delete(name){deleted.push(name);return stores.delete(name);},async match(req){for(const name of stores.keys()){const result=await (await open(name)).match(req);if(result)return result;}}};
 const state={fetch:async req=>{
  const path=new URL(typeof req==='string'?req:req.url,origin).pathname;
  return path.endsWith('.js')?reply('/* bundle */','text/javascript'):path.endsWith('.css')?reply('body{}','text/css'):path.endsWith('.json')?reply('{}','application/json'):/\.(png|jpg|svg)$/.test(path)?reply('image','image/png'):reply(html);
 }};
 class LocalRequest extends Request{constructor(input,options){super(typeof input==='string'?new URL(input,origin):input,options);}}
 const scope={location:{origin},registration:{navigationPreload:{async enable(){}}},clients:{async claim(){claimed++;}},async skipWaiting(){skipped++;},addEventListener(name,fn){events[name]=fn;}};
 vm.runInNewContext(worker,{self:scope,caches,fetch:(...args)=>state.fetch(...args),Request:LocalRequest,Response,URL,AbortController,console,setTimeout:(fn,ms)=>setTimeout(fn,Math.min(ms,30)),clearTimeout});
 return {caches,stores,deleted,state,get skipped(){return skipped;},get claimed(){return claimed;},async event(name){let work;events[name]({waitUntil(value){work=value;}});await work;},request(path,options={}){
  let work;const waits=[];events.fetch({request:{url:new URL(path,origin).href,method:'GET',mode:'cors',headers:new Headers(),...options},preloadResponse:options.preloadResponse,respondWith(value){work=value;},waitUntil(value){waits.push(value);}});
  return work?Promise.resolve(work).then(async response=>{await Promise.all(waits);return response;}):undefined;
 }};
}
await test('complete install and activation retain one older release',async()=>{
 const h=harness();await h.caches.open('unrelated');await h.caches.open('tlc-prime-offline-oldest');await h.caches.open('tlc-prime-offline-previous');
 await h.event('install');assert.equal(h.skipped,1);assert.ok(h.stores.get(current).size>100);await h.event('activate');
 assert.equal(h.claimed,1);assert.deepEqual(await h.caches.keys(),['unrelated','tlc-prime-offline-previous',current]);
});
await test('incomplete or wrong-MIME downloads never replace the complete release',async()=>{
 const h=harness();await h.caches.open('tlc-prime-offline-previous');const normal=h.state.fetch;
 h.state.fetch=req=>req.url.endsWith('.js')?Promise.resolve(reply('<html>fallback</html>')):normal(req);
 await assert.rejects(h.event('install'));assert.equal(h.skipped,0);assert.ok(!h.stores.has(current));assert.ok(h.stores.has('tlc-prime-offline-previous'));
});
await test('stuck network and navigation preload return the offline document',async()=>{
 const h=harness();await (await h.caches.open(current)).put('/',reply(html));h.state.fetch=()=>new Promise(()=>{});
 assert.equal(await (await h.request('/skills',{mode:'navigate'})).text(),html);
 assert.equal(await (await h.request('/workout',{mode:'navigate',preloadResponse:new Promise(()=>{})})).text(),html);
});
await test('new online HTML cannot overwrite an older worker’s complete shell',async()=>{
 const h=harness();await (await h.caches.open(current)).put('/',reply(html));h.state.fetch=async()=>reply('<html>new deployment</html>');
 assert.equal(await (await h.request('/',{mode:'navigate'})).text(),'<html>new deployment</html>');
 assert.equal(await (await (await h.caches.open(current)).match('/')).text(),html);
});
await test('storage denial and quota errors do not block a usable network response',async()=>{
 const h=harness();h.caches.open=async()=>{throw Error('quota or storage denial');};h.state.fetch=async()=>reply(html);
 assert.equal((await h.request('/',{mode:'navigate'})).status,200);
});
await test('fingerprinted older bundles work; HTML masquerading as JS is rejected',async()=>{
 const h=harness();await (await h.caches.open('tlc-prime-offline-old')).put('/assets/older-abc.js',reply('old bundle','text/javascript'));
 assert.equal(await (await h.request('/assets/older-abc.js')).text(),'old bundle');
 await (await h.caches.open(current)).put('/assets/broken.js',reply('<html>bad cache</html>'));
 h.state.fetch=async()=>reply('recovered bundle','text/javascript');assert.equal(await (await h.request('/assets/broken.js')).text(),'recovered bundle');
});
await test('versioned icon URLs reuse the original image offline',async()=>{
 const h=harness();await (await h.caches.open(current)).put('/icons/spread-more-tlc.svg',reply('icon','image/svg+xml'));h.state.fetch=async()=>{throw Error('offline');};
 assert.equal(await (await h.request('/icons/spread-more-tlc.svg?v=2')).text(),'icon');
});
await test('API, account, cross-origin, authenticated, and partial requests bypass caching',async()=>{
 const h=harness();for(const path of ['/api/research','/auth','/admin','/account-settings','/integrations','https://foreign.test/assets/a.js'])assert.equal(h.request(path),undefined,path);
 for(const headers of [new Headers({Authorization:'Bearer test'}),new Headers({Range:'bytes=0-9'})])assert.equal(h.request('/assets/a.js',{headers}),undefined);
 assert.equal(h.request('/assets/a.js',{method:'POST'}),undefined);
});
await test('authentication walls never become an offline public shell',async()=>{
 const h=harness();await (await h.caches.open(current)).put('/',reply(html));h.state.fetch=async()=>reply('unauthorized','text/plain',401);
 assert.equal((await h.request('/',{mode:'navigate'})).status,401);
});

const sessionCode=ts.transpileModule(readFileSync('src/lib/sessionStartup.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const sessionModule={exports:{}};vm.runInNewContext(sessionCode,{exports:sessionModule.exports,module:sessionModule,setTimeout,clearTimeout});
const {watchInitialSession}=sessionModule.exports;
await test('a stalled sign-in unblocks local training; a late sign-in still arrives',async()=>{
 let listener,finish=0;const sessions=[];
 const stop=watchInitialSession({onAuthStateChange(fn){listener=fn;return {data:{subscription:{unsubscribe(){}}}};},getSession(){return new Promise(()=>{});}},s=>sessions.push(s),()=>finish++,10);
 await delay(20);assert.equal(finish,1);listener('SIGNED_IN',{user:{id:'late'}});assert.equal(sessions[0].user.id,'late');stop();
});
await test('sign-out wins over a stale initial read and cleanup ignores late events',async()=>{
 let listener,resolve,unsubscribed=0;const sessions=[];
 const stop=watchInitialSession({onAuthStateChange(fn){listener=fn;return {data:{subscription:{unsubscribe(){unsubscribed++;}}}};},getSession(){return new Promise(r=>{resolve=r;});}},s=>sessions.push(s),()=>{},30);
 await delay(0);listener('SIGNED_OUT',null);resolve({data:{session:{user:{id:'stale'}}}});await delay(0);assert.deepEqual(sessions,[null]);
 stop();listener('SIGNED_IN',{user:{id:'ignored'}});assert.deepEqual(sessions,[null]);assert.equal(unsubscribed,1);
});

function bootHarness({online=true,reachable=true,url=origin+'/skills?goal=planche#position'}={}){
 const deleted=[],unregistered=[],storage=new Map();let replaced;
 const element=()=>({style:{},classList:{remove(){},add(){}},append(){},replaceChildren(){},setAttribute(){},remove(){}});
 const document={readyState:'loading',querySelector:()=>({content:revision}),getElementById:()=>element(),createElement:element,body:element(),addEventListener(){}};
 const location={...Object.fromEntries(['href','origin','pathname'].map(k=>[k,new URL(url)[k]])),replace(value){replaced=value;},reload(){}};
 const caches={async keys(){return ['tlc-prime-offline-old','power-public-shell-old','other-app-cache'];},async delete(name){deleted.push(name);}};
 const navigator={onLine:online,serviceWorker:{async getRegistrations(){return ['power-sw.js','other-sw.js'].map(name=>({active:{scriptURL:origin+'/'+name},async unregister(){unregistered.push(name);}}));}}};
 const context={window:null,document,location,navigator,caches,URL,AbortController,Response,HTMLScriptElement:class{},history:{},Date,console,sessionStorage:{getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)},fetch:async()=>reachable?Response.json({revision}):reply('unavailable','text/plain',503),setTimeout:(fn,ms)=>setTimeout(fn,Math.min(ms,10)),clearTimeout,addEventListener(){}};
 context.window=context;Object.defineProperty(context,'localStorage',{get(){throw Error('training storage must not be touched');}});Object.defineProperty(context,'indexedDB',{get(){throw Error('training storage must not be touched');}});
 vm.runInNewContext(readFileSync('public/power-boot.js','utf8'),context);
 return {api:context.TLCBoot,deleted,unregistered,storage,get replaced(){return replaced;}};
}
await test('automatic repair preserves training storage, unrelated caches and current route',async()=>{
 const h=bootHarness();await h.api.repair();assert.deepEqual(h.deleted,['tlc-prime-offline-old','power-public-shell-old']);assert.deepEqual(h.unregistered,['power-sw.js']);
 const next=new URL(h.replaced);assert.equal(next.pathname,'/skills');assert.equal(next.hash,'#position');assert.equal(next.searchParams.get('goal'),'planche');assert.equal(next.searchParams.get('__tlc_retry'),'1');
});
await test('offline, unreachable, and already-retried startups never erase caches or loop',async()=>{
 for(const options of [{online:false},{reachable:false},{url:origin+'/?__tlc_retry=1'}]){const h=bootHarness(options);await h.api.repair();assert.equal(h.replaced,undefined);assert.equal(h.deleted.length,0);}
});
console.log(`PASS: ${passed} behavioral cache, startup, and session recovery checks.`);
