// Browser-based layout regression test using the REAL bundled exercise library.
import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
let failed = false;
const widths = [280, 320, 360, 393, 768];

function assert(condition, message) { if (!condition) throw new Error(message); }
async function inViewport(page, selector, label) {
  const box = await page.locator(selector).first().boundingBox();
  assert(box, `${label}: missing`);
  const width = page.viewportSize().width;
  assert(box.x >= -2 && box.x + box.width <= width + 2,
    `${label}: offscreen at ${width}px (x=${box.x.toFixed(1)}, right=${(box.x+box.width).toFixed(1)})`);
  return box;
}
function intersects(a,b) {
  return a.x < b.x+b.width && a.x+a.width > b.x
      && a.y < b.y+b.height && a.y+a.height > b.y;
}
for (const width of widths) {
  const context = await browser.newContext({ viewport: { width, height: width < 340 ? 670 : 850 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  page.on('pageerror', error => { console.error(`[${width}] JS error: ${error.message}`); failed=true; });
  try {
    await page.goto('http://127.0.0.1:4173/library', {waitUntil:'domcontentloaded'});
    await page.getByRole('heading', {name:'Library'}).waitFor({timeout:20000});
    await page.getByPlaceholder('Search exercises...').waitFor({timeout:20000});
    await inViewport(page, '.power-library-fab', 'Library workout shortcut').catch(err => { if(width<768) throw err; });
    if (width < 768) {
      const nav = await inViewport(page,'nav[aria-label="Primary navigation"]','Bottom navigation');
      const music = await inViewport(page,'.power-music-dock','Music dock');
      const fab = await inViewport(page,'.power-library-fab','Workout shortcut');
      assert(!intersects(music, fab),'Music dock overlaps workout shortcut');
      assert(!intersects(nav, fab),'Navigation overlaps workout shortcut');
      assert(!intersects(nav, music),'Navigation overlaps music dock');
    }
    if (width < 768) {
      await page.getByRole('button',{name:/New/i}).first().click();
      await page.getByRole('dialog').waitFor({timeout:5000});
      await inViewport(page,'[role="dialog"]','Add exercise modal');
      await page.keyboard.press('Escape');
    }
    await page.goto('http://127.0.0.1:4173/planner',{waitUntil:'domcontentloaded'});
    await page.getByText('Pick. Train. Done.').waitFor({timeout:10000});
    await page.getByRole('button',{name:'Push',exact:true}).click();
    await page.getByRole('button',{name:/Begin Guided Workout|Start Session/}).waitFor({timeout:15000});
    await page.getByRole('button',{name:/Begin Guided Workout|Start Session/}).click();
    await page.getByRole('heading',{name:/Active session/i}).count().catch(()=>{});
    await page.locator('[aria-label^="Decrease reps for set"]').first().waitFor({timeout:10000});
    await inViewport(page,'[aria-label^="Decrease reps for set"]','Reps minus');
    await inViewport(page,'[aria-label^="Increase reps for set"]','Reps plus');
    await inViewport(page,'[aria-label^="Mark set"]','Set complete');
    await page.locator('[aria-label^="Mark set"]').first().click();
    await page.getByText('Rest timer').waitFor();
    await inViewport(page,'.power-music-dock','Workout music control');
    console.log(`PASS ${width}px: library, floating buttons, modal, planner, active sets`);
  } catch (error) {
    failed=true;
    console.error(`FAIL ${width}px: ${error.message}`);
  } finally { await context.close(); }
}
await browser.close();
if (failed) process.exit(1);
