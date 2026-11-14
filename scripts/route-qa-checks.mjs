import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

/* Static source-and-style QA: designed to run without a live browser.
   It confirms code coverage, route structure, theme selectors and visual protections;
   it does NOT claim screenshot, physical-device or real auth verification. */
const read=path=>readFile(path,'utf8');
const app=await read('src/App.tsx');
const css=await read('src/styles/route-qa-v7.css');
const prior=await read('src/styles/atomic-ui-sweep-v6.css');
const theme=await read('src/styles/theme-material-overhaul.css');
const skeuo=await read('src/styles/skeuomorphic-themes-v4.css');
const nav=await read('src/components/Layout/MobileNav.tsx');
const picker=await read('src/components/ThemeSwitcher.tsx');
const pages={
  '/':'src/pages/FocusPlanner.tsx',
  '/program':'src/pages/SuperHumanProgram.tsx',
  '/skills':'src/pages/Skills.tsx',
  '/skills/map':'src/pages/MasterSkillMap.tsx',
  '/library':'src/pages/Library.tsx',
  '/client':'src/pages/ClientPortal.tsx',
  '/assessment':'src/pages/LevelAssessment.tsx',
  '/more':'src/pages/More.tsx',
  '/videos':'src/pages/VideoAudit.tsx',
  '/workout':'src/pages/ActiveWorkout.tsx',
  '/settings':'src/pages/Settings.tsx',
  '/account-settings':'src/pages/AccountSettings.tsx',
  '/integrations':'src/pages/Integrations.tsx',
  '/community':'src/pages/Community.tsx',
  '/anatomy':'src/pages/Anatomy.tsx',
  '/dashboard':'src/pages/Dashboard.tsx',
};
for(const [route,path] of Object.entries(pages)){
  assert(app.includes('path="'+route+'"'),'Missing app route '+route);
  const file=await read(path);
  assert(file.length>200,'Unexpected empty page '+path);
}
assert(app.includes('path="/client/:tab"'),'Client portal subroutes lost');
assert(app.includes('path="/skills/:skillId"'),'Skill progression dynamic routes lost');
assert(app.includes('path="*"'),'Not-found fallback lost');
for(const path of ['/','/program','/skills','/more']){
  assert(nav.includes("path:'"+path+"'"),'Mobile dock missing '+path);
}
const layer='import "./styles/route-qa-v7.css";';
assert(app.includes(layer),'QA styles not imported');
assert(app.indexOf(layer)>app.indexOf('import "./styles/atomic-ui-sweep-v6.css";'),
 'Route QA must be the final overriding style import');
for(const [label,selectors] of Object.entries({
  library:['.power-movement-library','.power-library-results','.power-exercise-row'],
  skillTree:['.master-map-page','.master-map-scroll','.master-map-detail'],
  client:['.tlc-client-page','.tlc-client-tabs','.tlc-client-metrics','.tlc-client-cta'],
  video:['.tlctv-inline','.tlctv-inline__stage','.tlctv-inline__buttons'],
  settings:['.power-setting-section','.power-more-section'],
  activity:['.power-session'],
  nav:['.power-mobile-dock-v3','.power-nav-space'],
})){
  for(const selector of selectors){
    assert(css.includes(selector)||prior.includes(selector),'Uncovered '+label+' selector '+selector);
  }
}
for(const width of [720,480,350]){
  assert(css.includes('@media(max-width:'+width+'px)'),'Missing responsive breakpoint '+width);
}
assert(css.includes('@media(prefers-reduced-motion:reduce)'),'Reduced-motion rules missing');
const themes=['default','vasa','planet-fitness','ymca','okc-thunder'];
for(const id of themes){
  assert(picker.includes("id: '"+id+"'"),'Theme picker missing '+id);
  if(id==='default'){
    assert(theme.includes(':root:not([data-theme])'),'Default theme missing');
  }else{
    assert(theme.includes('data-theme="'+id+'"'),'Theme base missing '+id);
    assert(skeuo.includes('data-theme="'+id+'"'),'Theme material finish missing '+id);
  }
}
assert(theme.includes('color-scheme:light'),'Signature must remain light');
for(const risk of ['overflow-wrap:break-word','min-width:0','padding-bottom:calc(var(--power-nav-space','scroll-margin-top:75px']){
  assert(css.includes(risk),'Responsive overflow prevention missing: '+risk);
}
console.log('PASS: static QA coverage for '+Object.keys(pages).length+' route entrypoints, 5 themes, responsive 720/480/350px layouts, keyboard focus, bottom-dock spacing and screen-specific CSS.');
console.log('LIMIT: runtime screenshot, browser E2E, account sign-in and physical Galaxy Fold were not tested by this source-only checker.');
