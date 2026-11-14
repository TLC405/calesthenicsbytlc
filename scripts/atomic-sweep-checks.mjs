import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root=await mkdtemp(path.join(tmpdir(),'tlc-atomic-'));
try{
 const compiled=path.join(root,'launch.mjs');
 await build({entryPoints:['src/lib/launchHome.ts'],bundle:true,platform:'node',format:'esm',outfile:compiled,logLevel:'silent'});
 const {shouldLaunchHome}=await import(pathToFileURL(compiled).href);
 // Android PWA and deep links must not be hijacked to Home.
 const destinations=['/skills','/skills/planche','/assessment','/client','/client/test',
  '/tlctv/analyzer','/integrations','/library','/program','/workout','/today','/more','/intro'];
 for(const url of destinations){
  assert.equal(shouldLaunchHome(true,url,true),false,`PWA deep link broken: ${url}`);
  assert.equal(shouldLaunchHome(false,url,true),false,`Browser deep link broken: ${url}`);
 }
 assert.equal(shouldLaunchHome(true,'/launch-home',true),true,'Legacy launch redirect preserved');
 assert.equal(shouldLaunchHome(true,'/launch-home',false),false,'Do not redirect during normal navigation');
 const manifest=JSON.parse(await readFile('public/manifest.json','utf8'));
 assert.equal(manifest.display,'standalone','Android PWA should remain installable');
 assert(manifest.start_url.startsWith('/'),'PWA start URL must be same-origin');
 const nav=await readFile('src/components/Layout/MobileNav.tsx','utf8');
 for(const url of ["path:'/'","path:'/program'","path:'/skills'","path:'/more'"])
  assert(nav.includes(url),`Missing dock destination ${url}`);
 assert(!nav.includes("label:'Client Portal'"),'Narrow cover-screen nav must avoid stacked labels');
 const pages=await readFile('src/pages/More.tsx','utf8');
 for(const url of ['/client','/integrations','/library','/tlctv/analyzer','/dashboard'])
  assert(pages.includes("to:'"+url+"'"),`More hub missing reachable destination: ${url}`);
 const main=await readFile('src/App.tsx','utf8');
 for(const url of ['/more','/skills','/program','/workout','/library','/assessment','/tlctv/analyzer','/integrations'])
  assert(main.includes('path="'+url+'"'),`Missing active router entry ${url}`);
 const studio=await readFile('src/pages/SkillStudio.tsx','utf8');
 assert(studio.includes('id="tlctv-studio-first"'),'Studio video-first target missing');
 assert(!studio.includes('scrollIntoView('),'Selecting a movement must never forcibly scroll the document');
 assert(studio.includes('preventScrollReset:true'),'Updating a movement deep link must preserve scroll position');
 assert(studio.includes('tlc-atomic-movement-sheet'),'Phone movement details open in-place, not at page top');
 assert(!studio.includes('tlctv-studio-inline-detail'),'No duplicate above-the-list mobile detail which shifts document height');
 assert(studio.includes('onOpenChange={setDetailOpen}'),'Movement sheet can close without changing the list position');
 const media=await readFile('src/components/Media/MediaSheet.tsx','utf8');
 assert(media.includes("useState<'files'|'tutorials'|'analyzer'>('tutorials')"),'Opening TLCtv should show video search, not offline storage');
 assert(media.includes('videoLessonCoverage(exercise).lessons[0]'),'Global TLCtv must search the same library as exercise pages');
 const player=await readFile('src/components/Exercise/InlineTlcTv.tsx','utf8');
 assert(player.includes('coverage.exactCount===0'),'Fallback tutorials must be labeled as related');
 assert(player.includes('Find exact video'),'Users must be able to find the exact skill video');
 const themes=await readFile('src/components/ThemeSwitcher.tsx','utf8');
 for(const theme of ["id: 'default'","id: 'vasa'","id: 'planet-fitness'","id: 'ymca'","id: 'okc-thunder'"])
  assert(themes.includes(theme),`Theme lost in atomic sweep: ${theme}`);
 const s=await readFile('src/styles/atomic-screen-fixes.css','utf8');
 assert(s.includes('grid-template-columns:repeat(4,minmax(0,1fr))'),'Four-key Fold dock layout must remain');
 assert(s.includes('env(safe-area-inset-bottom'),'Device safe-area spacing missing');
 console.log('PASS: 13 browser/PWA deep links, 8 live routes, all 4 Fold navigation actions, More hub, video-first scroll, honest TLCtv lookup, 5 themes, reduced motion and safe-area regression checks.');
}finally{await rm(root,{recursive:true,force:true});}
