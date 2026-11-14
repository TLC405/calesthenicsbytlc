import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

// Runs only after vite build. The budgets cover the entry shell, not
// the route-specific exercise catalog that users choose to open.
const path='dist/assets';
const files=readdirSync(path);
const jsFiles=files.filter(name=>name.endsWith('.js'));
const assets=jsFiles.map(name=>({name,bytes:statSync(join(path,name)).size})).sort((a,b)=>b.bytes-a.bytes);
const find=(prefix)=>assets.filter(row=>row.name.startsWith(prefix+'-')).sort((a,b)=>b.bytes-a.bytes)[0];
const app=find('index'),framework=find('framework'),backend=find('backend-sdk');
assert(app,'Missing application entry bundle');
assert(framework,'Framework cache chunk missing');
assert(backend,'Backend SDK cache chunk missing');
assert(app.bytes<350000,'App startup bundle too large: '+app.bytes+' bytes');
assert(framework.bytes<210000,'React framework chunk grew unexpectedly: '+framework.bytes+' bytes');
assert(backend.bytes<280000,'Backend SDK chunk grew unexpectedly: '+backend.bytes+' bytes');
for(const name of ['Index','Library','MediaSheet','TrainingSettings','Skills','ClientPortal']){
 assert(find(name),'Expected lazy screen chunk missing: '+name);
}
const pkg=JSON.parse(readFileSync('package.json','utf8'));
const vite=readFileSync('vite.config.ts','utf8');
const appSrc=readFileSync('src/App.tsx','utf8');
const controls=readFileSync('src/components/Layout/AppControls.tsx','utf8');
const planner=readFileSync('src/pages/FocusPlanner.tsx','utf8');
const tutorial=readFileSync('src/components/Exercise/MovementTutorialButton.tsx','utf8');
const vercel=JSON.parse(readFileSync('vercel.json','utf8'));
assert(vite.includes('manualChunks('),'Stable framework chunking must be configured');
assert(vite.includes('backend-sdk'),'Stable backend SDK chunking missing');
assert(controls.includes("lazy(() => import('@/components/Media/MediaSheet')"),'Video sheet is no longer deferred');
assert(controls.includes("lazy(() => import('@/components/Settings/TrainingSettings')"),'Settings sheet is no longer deferred');
assert(!controls.includes("from '@/lib/skillGraph'"),'Header must not eagerly import full exercise graph');
for(const symbol of ['MovementLearningPanel','WorkoutCoach','SkillCategoryBrowser']){
 assert(planner.includes(symbol+'=lazy('),'Training should defer the '+symbol+' panel');
}
assert(planner.includes('(coachOpen||coachActivated)'),'Coach should not mount until explicitly opened');
assert(tutorial.includes('InlineTlcTv = lazy('),'Inline tutorial video should wait for a Watch click');
assert(appSrc.includes('const TrainingEntry=lazy('),'TrainingEntry redirects must not load the catalog at startup');
assert(pkg.scripts.build.includes('performance-checks.mjs'),'Production build must enforce performance budgets');
const immutable=vercel.headers.find(h=>h.source==='/assets/(.*)');
assert(immutable?.headers.some(h=>h.key==='Cache-Control'&&h.value.includes('immutable')&&h.value.includes('31536000')),'Fingerprint assets must be immutable');
for(const pathname of ['/power-sw.js','/manifest.json','/index.html']){
 assert(vercel.headers.find(h=>h.source===pathname)?.headers.some(h=>h.key==='Cache-Control'&&h.value.includes('must-revalidate')),'Freshness policy missing '+pathname);
}
const serviceWorker=readFileSync('public/power-sw.js','utf8');
assert(serviceWorker.includes("url.origin!==self.location.origin"),'Service worker must not cache foreign origins');
assert(serviceWorker.includes('admin(?:-login)?') && serviceWorker.includes('(api|auth|admin'),'Service worker must bypass private API paths');
const css=files.filter(name=>name.endsWith('.css')).sort((a,b)=>statSync(join(path,b)).size-statSync(join(path,a)).size)[0];
assert(css&&statSync(join(path,css)).size<600000,'CSS output exceeds agreed budget');
function summary(asset){
 const raw=readFileSync(join(path,asset.name));
 return {kilobytes:Math.round(raw.length/1024),gzipKilobytes:Math.round(gzipSync(raw).length/1024)};
}
console.log('PERF app-shell',JSON.stringify(summary(app)));
console.log('PERF framework',JSON.stringify(summary(framework)));
console.log('PERF backend-sdk',JSON.stringify(summary(backend)));
console.log('PERF CSS',JSON.stringify(summary({name:css})));
console.log('PASS: production asset budgets, stable vendor caching, lazy media/settings, route splitting, and service-worker privacy bounds.');
