import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(p,'utf8');
const [nav,dock,studio,map,library,browser,strip,requirements,skills,app]=await Promise.all([
 'src/components/Layout/MobileNav.tsx','src/styles/mobile-dock-v3.css',
 'src/pages/SkillStudio.tsx','src/pages/MasterSkillMap.tsx',
 'src/pages/Library.tsx','src/components/Progression/SkillCategoryBrowser.tsx',
 'src/components/Exercise/ProgressionPathStrip.tsx',
 'src/components/Progression/MovementRequirementsPanel.tsx',
 'src/pages/Skills.tsx','src/App.tsx'
].map(read));
for(const label of ["Train","My Plan","Skills","More"])
 assert(nav.includes("label:'"+label+"'"),'Bottom dock lost '+label);
assert(nav.includes("path:'/'")&&nav.includes("path:'/program'")&&nav.includes("path:'/skills'")&&nav.includes("path:'/more'"),'Four persistent destinations');
assert(nav.includes("if(path===pathname)event.preventDefault()"),'Tapping active tab must not alter view or scroll');
assert(nav.includes("if(from===pathname || navigationType==='POP')return"),'Query edits must not reset page scrolling');
assert(nav.includes('scrollPositions.current.set(pathname,window.scrollY)'),'Destination switches save scroll history');
assert(nav.includes('scrollPositions.current.get(pathname)'),'Returning to destination should restore scroll');
assert(nav.includes('window.visualViewport')&&nav.includes('keyboardOpen'),'Keyboard does not cover the dock');
assert(nav.includes("aria-current={active ? 'page' : undefined}"),'Active destination must be announced');
assert(dock.includes('repeat(4,minmax(0,1fr))'),'Dock may not drop to 3 columns on Fold cover');
assert(dock.includes('width:calc(100vw - 14px)'),'Cover-screen dock must fit the available width');
assert(dock.includes('min-height:64px!important'),'Each destination needs a reliable tap target');
assert(dock.includes('env(safe-area-inset-bottom,0px)'),'Bottom system gesture clearance required');
assert(dock.includes('@media(max-width:350px)'),'Fold 280px sizing required');
assert(dock.includes('focus-visible')&&dock.includes('aria-current="page"'),'Visible keyboard focus and active state required');
assert(app.includes('mobile-dock-v3.css'),'Dock overrides must load after older theme CSS');
assert(studio.includes('preventScrollReset:true'),'Skill deep links must preserve document position');
assert(!studio.includes('scrollIntoView('),'Selecting a skill cannot force a jump');
assert(studio.includes('key={selected} className="tlc-atomic-sheet-body"'),'New movement resets only internal mobile sheet position');
assert(studio.includes('<aside key={selected}'),'Desktop inspector must reset its own scroll on movement change');
assert(studio.includes('!showAll&&path.slugs.length>3'),'Expanded pathway should not collapse and shift document height');
assert(map.includes('preventScrollReset:true'),'Map selection must preserve page position');
assert(map.includes('Keep the selected lane filter stable'),'Map node selection must not silently narrow list');
assert(map.includes('key={selectedId} className="tlc-atomic-sheet-body"'),'Map mobile inspector must reset its own scroll');
assert(!library.includes('scrollIntoView('),'Library should not jump to top on page changes');
assert(library.includes('visibleExercises=filteredExercises.slice(0,(page+1)*10)'),'Library uses append-only reveal');
assert(library.includes('Math.min(10,remainingExercises)'),'Library has progressive reveal');
assert(browser.includes('visible=matches.slice(0,(page+1)*6)'),'Skill groups do not replace prior rows when expanded');
assert(!browser.includes('<ResultPager'),'Skill paths use progressive reveal, not replacing pages');
assert(!strip.includes('scrollIntoView('),'Horizontal progression strip may not reposition entire document');
assert(strip.includes("viewport.scrollLeft+=delta"),'Horizontal progression strip limits motion to its own viewport');
assert(requirements.includes("!expanded&&extras.length"),'Support list does not collapse and shift page');
assert(skills.includes('preventScrollReset:true'),'Skills sub-tabs preserve document scroll');
console.log('PASS: four-tab Fold dock at 280px, 44px+ targets, active/focus states, safe areas, keyboard clearance, per-tab scroll persistence, non-jumping skills/map/library/strip browsing and stable supporting-movement reveals.');
