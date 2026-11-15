import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import ts from 'typescript';

const source=await readFile('src/lib/themePreference.ts','utf8');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
function themeStore(blocked=false){
 const values=new Map([['power-vasa-default-v1','1'],['power-theme','vasa']]);
 const events=new EventTarget(),root={dataset:{},removeAttribute(key){if(key==='data-theme')delete this.dataset.theme;}};
 const meta={content:''};
 const sandbox={exports:{},Event,window:events,document:{documentElement:root,querySelector:()=>meta},localStorage:{
  getItem:key=>{if(blocked)throw Error('blocked');return values.get(key)||null;},
  setItem:(key,value)=>{if(blocked)throw Error('blocked');values.set(key,value);}
 }};
 vm.runInNewContext(code,sandbox);
 return {api:sandbox.exports,root,meta,events};
}
const store=themeStore();
assert.equal(store.api.themeSnapshot(),'vasa');
let first=0,second=0;
const off1=store.api.subscribeTheme(()=>first++),off2=store.api.subscribeTheme(()=>second++);
store.api.selectTheme('planet-fitness');
assert.equal(store.api.themeSnapshot(),'planet-fitness');
assert.equal(store.root.dataset.theme,'planet-fitness');
assert.equal(store.meta.content,'#140D1B');
assert.equal(first,1);assert.equal(second,1);
const remote=new Event('storage');Object.assign(remote,{key:'power-theme',newValue:'ymca'});store.events.dispatchEvent(remote);
assert.equal(store.api.themeSnapshot(),'ymca');assert.equal(store.root.dataset.theme,'ymca');
store.api.selectTheme('default');assert.equal(store.root.dataset.theme,undefined);
store.api.selectTheme('invalid');assert.equal(store.api.themeSnapshot(),'default');
off1();off2();
const restricted=themeStore(true);assert.doesNotThrow(()=>restricted.api.selectTheme('okc-thunder'));
assert.equal(restricted.api.themeSnapshot(),'okc-thunder');
console.log('PASS: shared theme subscriptions, direct selection, cross-tab sync, invalid values, system chrome, and blocked storage.');

const manifest=JSON.parse(await readFile('public/manifest.json','utf8'));
assert.equal(manifest.id,'/power-independent-guest','Install identity must remain stable');
for(const icon of manifest.icons){
 if(icon.type==='image/svg+xml'){
  const svg=await readFile('public'+icon.src,'utf8');
  assert(svg.includes('SPREAD MORE')&&svg.includes('TLC'),'Primary SVG icon must feature large TLC and Spread More');
  continue;
 }
 const bytes=await readFile('public'+icon.src),[width,height]=icon.sizes.split('x').map(Number);
 assert.equal(bytes.readUInt32BE(16),width);assert.equal(bytes.readUInt32BE(20),height);
 assert(icon.src.includes('20261115'));
}
const original=await readFile('public/brand/spread-tlc-original-20261115.jpg');
assert.equal(createHash('sha256').update(original).digest('hex'),'da9f18c0d4b29ca0d86c51c951d2b4643f53cf49b051b5243381ad8148c837a6','Loading artwork must remain the exact original bytes');
const main=await readFile('src/main.tsx','utf8');
assert(main.indexOf('import "./index.css"')<main.indexOf('import App'),'Base styles must load before theme styles');
assert(!main.includes('elapsed>=1350'),'Startup must not force a fake wait');
assert(main.includes('[data-route-loading]'),'Startup must wait for the actual routed screen');
const loading=await readFile('src/components/LoadingScreen.tsx','utf8');
assert(!loading.includes('setInterval'),'No fabricated load percentage');
const builtWorker=await readFile('dist/power-sw.js','utf8');
const assets=JSON.parse(builtWorker.match(/const BUILD_ASSETS=(\[[^;]*\]);/)[1]);
const built=(await readdir('dist/assets')).filter(n=>/\.(js|css)$/.test(n));
for(const name of built)assert(assets.includes('/assets/'+name),'Offline screen omitted: '+name);
assert(builtWorker.includes("(await caches.open(CACHE)).match('/')"),'Offline navigation must use the current shell');
console.log('PASS: versioned 192/512/maskable icon dimensions, original-resolution loading art, stable install identity, style order, real startup readiness and '+assets.length+' offline scripts/styles.');
