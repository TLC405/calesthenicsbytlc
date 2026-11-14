import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';

const dir=await mkdtemp(path.join(tmpdir(),'tlc-video-checks-'));
try{
 const output=path.join(dir,'video-lesson-coverage.mjs');
 await build({entryPoints:['src/lib/videoLessonCoverage.ts'],outfile:output,
  bundle:true,platform:'node',format:'esm',logLevel:'silent',
  alias:{'@':'./src'}});
 const {videoLessonCoverage,tutorialSearchUrl}=await import(pathToFileURL(output).href);
 const catalog=JSON.parse(await readFile('src/data/publicExerciseCatalog.json','utf8'));
 const missing=[],invalid=[],families=[],exact=[];
 for(const exercise of catalog){
   const video=videoLessonCoverage(exercise);
   if(!video.hasVideo||!video.lessons.length){missing.push(exercise.name);continue;}
   for(const lesson of video.lessons){
     if(!/^https:\/\/(www\.)?(youtube\.com\/watch\?v=|instagram\.com\/)/.test(lesson.url))
       invalid.push(exercise.slug+': invalid video URL');
     if(lesson.scope==='guide'&&!/guide|related|tutorial|coaching|basics|preparation|progressions|ring strength|levers|skills/i.test(lesson.title))
       invalid.push(exercise.slug+': broader video must be clearly labeled as related');
   }
   if(video.exactCount)exact.push(exercise.slug);
   else families.push(exercise.slug);
   const search=tutorialSearchUrl(exercise.name);
   assert(search.startsWith('https://www.youtube.com/results?search_query='),'Search link must not be embedded as an iframe');
 }
 assert.deepEqual(missing,[],'Each catalog movement must display a valid video player for an exercise or an honestly labeled related lesson');
 assert.deepEqual(invalid,[],'Video URLs and labels must not be misleading');
 const source=await readFile('src/components/Exercise/InlineTlcTv.tsx','utf8');
 const page=await readFile('src/pages/SkillStudio.tsx','utf8');
 const guide=await readFile('src/components/Exercise/MovementOverview.tsx','utf8');
 const button=await readFile('src/components/Exercise/MovementTutorialButton.tsx','utf8');
 const skills=await readFile('src/pages/Skills.tsx','utf8');
 const library=await readFile('src/pages/Library.tsx','utf8');
 const style=await readFile('src/App.tsx','utf8');
 assert(source.includes('videoLessonCoverage(exercise)'),'TLCtv uses the coverage layer');
 assert(source.includes('Find exact video'),'Related lessons must offer an exact demo search');
 assert(source.includes('<details className="tlctv-inline__more">'),'Additional video controls must be collapsed');
 assert(page.indexOf('tlctv-studio-first')>=0&&page.indexOf('tlctv-studio-first')<page.indexOf('Your current progression step'),'TV must be above the skill ladder');
 assert(guide.includes('Full instructions')&&guide.includes('Safety & form tips'),'Complete coaching detail remains available');
 assert(button.includes('InlineTlcTv')&&!button.includes('if(!available)return null'),'Every exercise card exposes video');
 assert(skills.includes('<TlcTvTopBar')&&library.includes('<TlcTvTopBar'),'TLCtv must be at the top of browsing screens');
 assert(style.includes('tlctv-first.css'),'Video-first styles must load');
 console.log(`PASS: ${catalog.length} exercise video stages; ${exact.length} exercise-specific video matches; ${families.length} related guides clearly labeled; 0 missing. Video-first page order and full coaching details verified.`);
}finally{await rm(dir,{recursive:true,force:true});}
