import { movementTutorialSources, type ThumbnailExercise } from './movementThumbnails';
import { parseEmbeddedMedia } from './embeddedMedia';
import { tutorialState } from './mediaAudit';
import catalog from '@/data/publicExerciseCatalog.json';

export type LessonSource={url:string;title:string;scope:'clip'|'guide';provider:'youtube'|'instagram';origin:'catalog'|'related'};
const bySlug=new Map(catalog.map(x=>[x.slug,x]));

/** Reviewed broad-skill lessons. These are NOT represented as exact demonstrations.
 * A direct, playable exercise-specific tutorial always takes priority. */
const guides:Record<string,{url:string;title:string}>={
 Core:{url:'https://www.youtube.com/watch?v=cu0fHp8HCDo',title:'L-sit & core strength · related lesson'},
 Flexibility:{url:'https://www.youtube.com/watch?v=LWmjrFXEy5Q',title:'Daniela Suarez · split and flexibility practice · related lesson'},
 Legs:{url:'https://www.youtube.com/watch?v=cB0cOX7gePg',title:'Squat and leg technique · related lesson'},
 Mobility:{url:'https://www.youtube.com/watch?v=BMUmyW1jepU',title:'Hip mobility basics · related lesson'},
 Pull:{url:'https://www.youtube.com/watch?v=Fl0UMfdEzsE',title:'Rowing and pull strength · related lesson'},
 Push:{url:'https://www.youtube.com/watch?v=6snDOgFBBFA',title:'Planche and pushing preparation · related lesson'},
 Rings:{url:'https://www.youtube.com/watch?v=fsl08Copg-U',title:'GMB Fitness · ring training basics and progressions'},
 Skills:{url:'https://www.youtube.com/watch?v=J2JHDavNZB4',title:'Calisthenics skill progressions · related lesson'},
 Yoga:{url:'https://www.youtube.com/watch?v=kqnua4rHVVA',title:'Cat–cow and yoga movement basics · related lesson'},
 Grip:{url:'https://www.youtube.com/watch?v=YpQCysZfOhE',title:'Alexander Bromley · complete grip-strength guide'}
};
const matchedFamilies=[
 {pattern:/ring|false-grip|iron-cross|maltese|victorian/,url:'https://www.youtube.com/watch?v=fsl08Copg-U',title:'GMB Fitness · ring skills · related lesson'},
 {pattern:/finger|pinch|towel|grip|wrist|hang|carry|gripper|crush/,url:'https://www.youtube.com/watch?v=YpQCysZfOhE',title:'Grip strength · related lesson'},
 {pattern:/planche|straight.arm|pseudo/,url:'https://www.youtube.com/watch?v=6snDOgFBBFA',title:'GMB Fitness · planche preparation · related lesson'},
 {pattern:/handstand|press.to.hs|hspu|pike.press|stalder|inversion/,url:'https://www.youtube.com/watch?v=d6_lcWtQDxw',title:'GMB Fitness · handstand skills · related lesson'},
 {pattern:/front.lever|back.lever|tuck.lever|muscle.up/,url:'https://www.youtube.com/watch?v=fsl08Copg-U',title:'GMB Fitness · ring strength and levers · related lesson'},
 {pattern:/split|pancake|straddle.stretch/,url:'https://www.youtube.com/watch?v=LWmjrFXEy5Q',title:'Daniela Suarez · split flexibility · related lesson'},
 {pattern:/plie|tendu|developpe|arabesque|attitude|battement|releve|pass[eé]|port.de.bras|penche/,url:'https://www.youtube.com/watch?v=trFLciNB1hA',title:'Kathryn Morgan · ballet barre foundations · related lesson'},
 {pattern:/pull.up|chin.up|row/,url:'https://www.youtube.com/watch?v=Fl0UMfdEzsE',title:'Rows and pull progressions · related lesson'},
 {pattern:/push.up|dip|press/,url:'https://www.youtube.com/watch?v=0JUrOH--Kdk',title:'Push-up technique and progressions · related lesson'},
 {pattern:/pistol|squat|lunge/,url:'https://www.youtube.com/watch?v=cB0cOX7gePg',title:'Bodyweight squat basics · related lesson'},
 {pattern:/yoga|pose|cobra|bridge/,url:'https://www.youtube.com/watch?v=kqnua4rHVVA',title:'Yoga movement foundations · related lesson'}
];
function fallback(input:ThumbnailExercise):LessonSource|null{
 const exercise=bySlug.get(input.slug);
 if(!exercise)return null; // custom user exercises need their own video.
 const special=matchedFamilies.find(x=>x.pattern.test(input.slug));
 const source=special||guides[exercise.category];
 if(!source)return null;
 const parsed=parseEmbeddedMedia(source.url);
 if(!parsed||tutorialState(source.url).blocked)return null;
 return {url:parsed.url,title:source.title,scope:'guide',provider:parsed.provider,origin:'related'};
}
export function videoLessonCoverage(exercise:ThumbnailExercise){
 const seen=new Set<string>();
 const existing:LessonSource[]=movementTutorialSources(exercise).flatMap(s=>{
  if(!s.url)return [];
  const parsed=parseEmbeddedMedia(s.url);
  if(!parsed||seen.has(parsed.url)||tutorialState(parsed.url).blocked)return [];
  seen.add(parsed.url);
  return [{url:parsed.url,title:s.scope==='clip'?(s.title||exercise.name):/related|guide/i.test(s.title)?s.title:(s.title||exercise.name)+' · related lesson',scope:s.scope==='clip'?'clip' as const:'guide' as const,provider:parsed.provider,origin:'catalog' as const}];
 });
 const instagram=parseEmbeddedMedia(exercise.instagram_url||'');
 if(instagram&&instagram.provider==='instagram'&&!seen.has(instagram.url))existing.unshift({url:instagram.url,title:exercise.name+' · unverified Instagram link',scope:'guide',provider:'instagram',origin:'catalog'});
 const direct=existing.filter(s=>s.scope==='clip');
 const related=existing.filter(s=>s.scope==='guide');
 const extra=fallback(exercise);
 if(extra&&!seen.has(extra.url)){related.push(extra);seen.add(extra.url);}
 const all=[...direct,...related].slice(0,12);
 return {lessons:all,exactCount:direct.length,hasRelated:related.length>0,hasVideo:all.length>0};
}
export function tutorialSearchUrl(name:string){
 return 'https://www.youtube.com/results?search_query='+encodeURIComponent(name.trim()+' exercise tutorial proper form progression');
}
