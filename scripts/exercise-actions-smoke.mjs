// Functional interactions, scrolling and theming in an actual Chromium browser.
// No fake users, no backend writes: guest mode uses the project's real bundled catalog.
import { chromium } from 'playwright';
const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
let errors=0;
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function verify(condition,message){if(!condition)throw Error(message);}
async function fingerSwipe(page, x1, y1, x2, y2) {
  const cdp=await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x1,y:y1}]});
  for(let i=1;i<=12;i++){
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x1+(x2-x1)*i/12,y:y1+(y2-y1)*i/12}]});
    await wait(14);
  }
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await cdp.detach();
  await wait(220);
}
for(const width of [320,393]) {
  const context=await browser.newContext({viewport:{width,height:800},isMobile:true,hasTouch:true});
  const page=await context.newPage();
  page.setDefaultTimeout(9000);
  page.on('pageerror',err=>{console.error(`JS ${width}: ${err.message}`);errors++;});
  const test=async(label,run)=>{
    try { await run();console.log(`PASS ${width}: ${label}`); }
    catch(err){console.error(`FAIL ${width}: ${label} – ${err.message}`);errors++;}
  };
  await page.goto('http://127.0.0.1:4173/library');
  await page.getByPlaceholder('Search exercises...').waitFor({timeout:15000});
  await page.locator('.power-skeuo-card').first().waitFor({timeout:15000});
  await test('exercise document vertical scroll',async()=>{
    const before=await page.evaluate(()=>window.scrollY);
    const tall=await page.evaluate(()=>document.scrollingElement.scrollHeight>window.innerHeight+600);
    verify(tall,'Exercise catalog not tall enough to scroll');
    await page.mouse.move(Math.floor(width/2),520);
    await page.mouse.wheel(0,610);
    await wait(300);
    const after=await page.evaluate(()=>window.scrollY);
    verify(after>before+100,`Exercise list did not scroll (${before} -> ${after})`);
    await page.evaluate(()=>window.scrollTo(0,0));
    await wait(100);
    await fingerSwipe(page,Math.floor(width/2),625,Math.floor(width/2),260);
    const touched=await page.evaluate(()=>window.scrollY);
    verify(touched>60,`Finger swipe did not move the exercise catalog (scrollY=${touched})`);
    await page.evaluate(()=>window.scrollTo(0,0));
  });
  await test('category strip horizontal scroll',async()=>{
    const track=page.locator('.power-category-track');
    const dims=await track.evaluate(e=>({scrollWidth:e.scrollWidth,clientWidth:e.clientWidth}));
    verify(dims.scrollWidth>dims.clientWidth+40,'Category strip has no overflow');
    await track.evaluate(e=>e.scrollLeft=140);
    await wait(150);
    verify(await track.evaluate(e=>e.scrollLeft)>45,'Could not scroll category tabs');
    await track.evaluate(e=>e.scrollLeft=0);
    const box=await track.boundingBox();
    await fingerSwipe(page,box.x+box.width*.88,box.y+box.height*.5,box.x+box.width*.15,box.y+box.height*.5);
    const swiped=await track.evaluate(e=>e.scrollLeft);
    verify(swiped>30,`Finger swipe did not move the category strip (scrollLeft=${swiped})`);
    await track.evaluate(e=>e.scrollLeft=0);
  });
  await test('category filter actions',async()=>{
    await page.getByRole('button',{name:/Strength/}).first().click();
    verify(await page.locator('.power-skeuo-card').count()>0,'Strength filter empty');
    await page.getByRole('button',{name:/Recovery/}).first().click();
    verify(await page.locator('.power-skeuo-card').count()>0,'Recovery filter empty');
    await page.getByRole('button',{name:/All/}).first().click();
    verify(await page.locator('.power-skeuo-card').count()>=90,'All categories missing catalog items');
  });
  await test('search and video filter',async()=>{
    const search=page.getByPlaceholder('Search exercises...');
    await search.fill('ring');
    verify(await page.locator('.power-skeuo-card').count()>0,'Search ring found no entries');
    await search.fill('');
    const toggle=page.getByRole('button',{name:/Video tutorials/}).first();
    await toggle.click();
    verify(await toggle.getAttribute('aria-pressed')==='true','Video filter did not activate');
    await toggle.click();
  });
  await test('thumbnail play stays within app',async()=>{
    const play=page.getByRole('button',{name:/Play .* tutorial here/}).first();
    await play.click();
    verify(await page.locator('.power-skeuo-card iframe[src*="youtube-nocookie.com"]').count()>=1,'In-card video not inserted');
    await page.getByRole('button',{name:/Close .* video/}).first().click();
    verify(await page.locator('.power-skeuo-card iframe[src*="youtube-nocookie.com"]').count()===0,'In-card video not closed');
  });
  await test('exercise details modal',async()=>{
    await page.locator('.power-skeuo-card').first().click({position:{x:10,y:200}});
    await page.getByRole('dialog').waitFor({timeout:5000});
    await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({state:'hidden',timeout:5000});
  });
  await test('create exercise modal opens and closes',async()=>{
    await page.getByRole('button',{name:/^New$/}).first().click();
    await page.getByRole('dialog').waitFor({timeout:5000});
    await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({state:'hidden',timeout:5000});
  });
  await test('music dock opens, closes without page navigation',async()=>{
    await page.getByRole('button',{name:'Toggle music controls'}).click();
    verify(await page.getByPlaceholder('Search saved tracks…').count()===1,'Music controls not expanded');
    await page.getByPlaceholder('Search saved tracks…').fill('training');
    await page.getByPlaceholder('Search saved tracks…').press('Enter');
    verify(new URL(page.url()).pathname==='/library','Music search left the app');
    await page.getByRole('button',{name:'Toggle music controls'}).click();
    verify(new URL(page.url()).pathname==='/library','Music dock navigated away unexpectedly');
  });
  await test('add exercise to builder',async()=>{
    await page.getByRole('button',{name:/Add to Workout/}).first().click();
    await page.waitForURL('**/planner',{timeout:5000});
    verify((await page.getByText('Workout',{exact:true}).count())>0,'Selected workout section missing');
  });
  await test('theme switching and persistence',async()=>{
    for(const theme of ['vasa','ymca','planet-fitness','okc-thunder','default']){
      await page.locator('.power-theme-option').nth(['default','vasa','planet-fitness','ymca','okc-thunder'].indexOf(theme)).click();
      const applied=await page.evaluate(()=>document.documentElement.getAttribute('data-theme')||'default');
      verify(applied===theme,`Theme expected ${theme}, got ${applied}`);
    }
    await page.reload();
    await page.getByText('Pick. Train. Done.').waitFor();
    verify((await page.evaluate(()=>document.documentElement.getAttribute('data-theme')||'default'))==='default','Theme not restored');
  });
  await test('workout routine, set actions, guided session',async()=>{
    await page.getByRole('button',{name:'Pull',exact:true}).click();
    await page.getByRole('button',{name:/Begin Guided Workout|Start Session/}).click();
    await page.waitForURL('**/workout',{timeout:10000});
    const minus=page.locator('[aria-label^="Decrease reps for set"]').first();
    const plus=page.locator('[aria-label^="Increase reps for set"]').first();
    const rep=page.locator('.power-set-row').first().locator('.tabular-nums').first();
    const initial=Number(await rep.textContent());
    await plus.click();
    verify(Number(await rep.textContent())===initial+1,'Plus reps did not increment');
    await minus.click();
    verify(Number(await rep.textContent())===initial,'Minus reps did not decrement');
    await page.locator('[aria-label^="Mark set"]').first().click();
    verify((await page.locator('[aria-pressed="true"][aria-label^="Mark set"]').count())>=1,'Set completion did not toggle');
    await page.getByRole('button',{name:'Leave workout and save draft'}).click();
    await page.waitForURL('**/planner',{timeout:5000});
    await page.getByRole('button',{name:/Resume Unfinished Workout/}).click();
    await page.waitForURL('**/workout',{timeout:5000});
    await page.getByRole('button',{name:/Next Exercise/}).click();
    verify(await page.getByText(/Movement 2 \/ /).count()>0,'Next exercise did not advance');
    await page.getByRole('button',{name:/Finish early and save/}).click();
    await page.waitForURL('**/planner',{timeout:10000});
    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('tlc-power-workouts-v1')||'[]'));
    verify(saved.some(e=>e.entries?.length>0),'Guest workout not saved');
  });
  await test('215 real exercises and independently navigable skill studios',async()=>{
    await page.goto('http://127.0.0.1:4173/library',{waitUntil:'domcontentloaded'});
    await page.locator('.power-skeuo-card').first().waitFor({timeout:10000});
    verify(await page.locator('.power-skeuo-card').count()>=210,'Full curated exercise catalog missing');
    await page.getByRole('button',{name:/Planche Straight-arm strength/}).click();
    await page.waitForURL('**/skills/planche');
    verify(await page.getByText('STAGE 1').count()>0,'Planche progressions missing');
    verify(await page.locator('.power-skeuo-card').count()>=6,'Planche drill ladder incomplete');
    await page.getByRole('button',{name:/Straddle → Handstand/}).first().click();
    await page.waitForURL('**/skills/straddle-press');
    verify(await page.locator('.power-skeuo-card').count()>=5,'Straddle press drill ladder incomplete');
    await page.getByRole('button',{name:'Handstand',exact:true}).first().click();
    await page.waitForURL('**/skills/handstand');
    verify(await page.locator('.power-skeuo-card').count()>=5,'Handstand ladder incomplete');
    await page.getByRole('button',{name:/Library/}).first().click();
    await page.waitForURL('**/library');
    await page.locator('nav[aria-label="Primary navigation"]').getByRole('button',{name:'TRAIN',exact:true}).click();
    await page.waitForURL('**/planner');
  });
  await test('three-tap skill workout builder, swap, remove, and timed hold logging',async()=>{
    await page.goto('http://127.0.0.1:4173/planner',{waitUntil:'domcontentloaded'});
    await page.getByRole('button',{name:/Build by Skill/}).click();
    await page.waitForURL('**/build');
    await page.getByRole('heading',{name:'Pick a skill. Press play.'}).waitFor();
    verify(await page.locator('.power-builder-goal').count()>=8,'Skill picker missing goals');
    await page.locator('.power-builder-goal').filter({hasText:'Ring Muscle-Up'}).click();
    verify(await page.getByRole('heading',{name:'Ring Muscle-Up session'}).isVisible(),'Skill selector failed');
    await page.locator('.power-builder-goal').filter({hasText:'Planche'}).first().click();
    await page.getByRole('button',{name:'15min'}).click();
    verify(await page.locator('.power-builder-movement').count()===4,'15 min session should have four movements');
    await page.getByRole('button',{name:'25min'}).click();
    verify(await page.locator('.power-builder-movement').count()===6,'25 min session should have six movements');
    await page.getByRole('button',{name:'40min'}).click();
    verify(await page.locator('.power-builder-movement').count()===8,'40 min session should have eight movements');
    await page.getByRole('button',{name:'15min'}).click();
    await page.getByRole('button',{name:'Swap Planche Lean'}).click();
    verify(await page.getByText('Frog Stand',{exact:true}).count()>0,'Skill variation swap failed');
    await page.getByRole('button',{name:'Reset generated workout'}).click();
    verify(await page.getByText('Planche Lean',{exact:true}).count()>0,'Reset failed');
    await page.getByRole('button',{name:'Adjust sets and targets'}).click();
    await page.getByRole('button',{name:'Increase target for Planche Lean'}).click();
    await page.getByRole('button',{name:'Hide sets and targets'}).click();
    page.once('dialog',dialog=>dialog.accept());
    await page.getByRole('button',{name:/Start This Skill Workout/}).click();
    await page.waitForURL('**/workout');
    await page.getByRole('button',{name:/Next Exercise/}).click();
    await page.getByRole('heading',{name:'Planche Lean'}).waitFor();
    const seconds=page.locator('.power-set-row').first().locator('.tabular-nums').first();
    const first=Number(await seconds.textContent());
    await page.getByRole('button',{name:'Increase seconds for set 1'}).click();
    verify(Number(await seconds.textContent())===first+5,'Timed hold adjustment failed');
    await page.getByRole('button',{name:'Mark set 1 complete'}).click();
    await page.getByRole('button',{name:/Finish early and save completed sets/}).click();
    await page.waitForURL('**/planner');
    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('tlc-power-workouts-v1')||'[]'));
    verify(saved.some(w=>w.entries?.some(e=>e.sets?.some(set=>set.seconds===first+5))),'Timed hold seconds not saved');
    await page.goto('http://127.0.0.1:4173/skills/straddle-press',{waitUntil:'domcontentloaded'});
    await page.getByRole('button',{name:/Build a Straddle → Handstand Workout/}).click();
    await page.waitForURL('**/build?skill=straddle-press');
    verify(await page.getByRole('heading',{name:'Straddle Press session'}).isVisible(),'Skill Studio handoff failed');
  });
  await test('bottom navigation three tabs',async()=>{
    await page.locator('nav[aria-label="Primary navigation"]').getByRole('button',{name:'EXERCISES',exact:true}).click();
    await page.waitForURL('**/library');
    await page.locator('nav[aria-label="Primary navigation"]').getByRole('button',{name:'MORE',exact:true}).click();
    await page.waitForURL('**/dashboard');
    await page.locator('nav[aria-label="Primary navigation"]').getByRole('button',{name:'TRAIN',exact:true}).click();
    await page.waitForURL('**/planner');
  });
  await context.close();
}
await browser.close();
if(errors)process.exit(1);
