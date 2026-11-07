import catalog from '../data/publicExerciseCatalog.json';
import { PROGRESSION_SOURCES } from '../data/progressionSources';
import { exercisePaths, canonicalSlug } from './exerciseProgressions';
import { tutorialState } from './mediaAudit';
import { getYouTubeId } from './youtube';
export type ThumbnailExercise={slug:string;name:string;image_url?:string|null;youtube_url?:string|null};
export type ThumbnailSource={src:string;scope:'photo'|'clip'|'guide';label:string;title:string;url:string|null};
const bySlug=new Map(catalog.map(e=>[e.slug,e]));
const familyGuides=[
 {paths:['planche','straight-arm','crow'],url:'https://www.youtube.com/watch?v=6snDOgFBBFA',title:'GMB · Planche preparation'},
 {paths:['handstand','hspu','pike-press'],url:'https://www.youtube.com/watch?v=d6_lcWtQDxw',title:'GMB · Handstand tutorial'},
 {paths:['rings','ring-muscle-up'],url:'https://www.youtube.com/watch?v=asnC95pkVjw',title:'GMB · Ring muscle-up components'},
];
export function movementThumbnailSources(input:ThumbnailExercise):ThumbnailSource[]{
 const canonical=bySlug.get(canonicalSlug(input.slug));const title=canonical?.name||input.name;
 const results:ThumbnailSource[]=[];
 const photo=input.image_url||canonical?.image_url;
 const photoSource=photo&&/^(https:\/\/|\/)/.test(photo)?{src:photo,scope:'photo' as const,label:'Photo',title:input.name,url:null}:null;
 if(photoSource&&input.image_url!==canonical?.image_url)results.push(photoSource);
 const direct=tutorialState(input.youtube_url||canonical?.youtube_url,title);
 if(direct.id&&!direct.blocked&&(direct.mapping?.titleSignal!=='title_needs_review'||direct.repair)){
  const family=direct.repair?.scope==='family';results.push({src:`https://i.ytimg.com/vi/${direct.id}/hqdefault.jpg`,scope:family?'guide':'clip',label:family?'Guide':'Video',title:family?`${title} · family tutorial`:`${title} · video preview`,url:direct.url});
 }
 if(photoSource&&input.image_url===canonical?.image_url)results.push(photoSource);
 const paths=exercisePaths(input.slug).map(p=>p.id);
 const sources=PROGRESSION_SOURCES.filter(s=>s.paths.some(id=>paths.includes(id))&&getYouTubeId(s.url));
 for(const source of sources.slice(0,1)){const id=getYouTubeId(source.url)!;results.push({src:`https://i.ytimg.com/vi/${id}/hqdefault.jpg`,scope:'guide',label:'Guide',title:`${source.creator} · ${source.title}`,url:source.url});}
 if(canonicalSlug(input.slug)==='child-s-pose')results.push({src:'https://i.ytimg.com/vi/eqVMAPM00DM/hqdefault.jpg',scope:'guide',label:'Guide',title:"Yoga With Adriene · Extended Child’s Pose",url:'https://www.youtube.com/watch?v=eqVMAPM00DM'});
 for(const source of familyGuides.filter(s=>s.paths.some(id=>paths.includes(id))).slice(0,1)){const id=getYouTubeId(source.url)!;const status=tutorialState(source.url);if(!status.blocked)results.push({src:`https://i.ytimg.com/vi/${id}/hqdefault.jpg`,scope:'guide',label:'Guide',title:source.title,url:source.url});}
 return [...new Map(results.map(source=>[source.src,source])).values()];
}
