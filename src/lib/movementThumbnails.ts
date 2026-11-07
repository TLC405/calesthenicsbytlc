import thumbnailCache from '../data/thumbnailCache.json';
import { MOVEMENT_MEDIA, LOCAL_MOVEMENT_PHOTOS, RING_FAMILY_GUIDE } from '../data/movementMedia';
import catalog from '../data/publicExerciseCatalog.json';
import { PROGRESSION_SOURCES } from '../data/progressionSources';
import { exercisePaths, canonicalSlug } from './exerciseProgressions';
import { tutorialState } from './mediaAudit';
import { getYouTubeId } from './youtube';
export type ThumbnailExercise={slug:string;name:string;image_url?:string|null;youtube_url?:string|null};
export type ThumbnailSource={src:string;scope:'photo'|'clip'|'guide'|'category';label:string;title:string;url:string|null};
const bySlug=new Map(catalog.map(e=>[e.slug,e]));
const familyGuides=[
 {paths:['planche','straight-arm','crow'],url:'https://www.youtube.com/watch?v=6snDOgFBBFA',title:'GMB · Planche preparation'},
 {paths:['handstand','hspu','pike-press'],url:'https://www.youtube.com/watch?v=d6_lcWtQDxw',title:'GMB · Handstand tutorial'},
 {paths:['rings','ring-muscle-up'],url:'https://www.youtube.com/watch?v=asnC95pkVjw',title:'GMB · Ring muscle-up components'},
];
export function movementThumbnailSources(input:ThumbnailExercise):ThumbnailSource[]{
 const canonical=bySlug.get(canonicalSlug(input.slug));const title=canonical?.name||input.name;
 const results:ThumbnailSource[]=[];
 const slug=canonicalSlug(input.slug);
 const localPhoto=LOCAL_MOVEMENT_PHOTOS.has(slug)?`/movement-photos/${slug}.jpg`:null;
 const photo=input.image_url||localPhoto||canonical?.image_url;
 const photoSource=photo&&/^(https:\/\/|\/)/.test(photo)?{src:photo,scope:'photo' as const,label:'Photo',title:input.name,url:null}:null;
 if(photoSource&&input.image_url!==canonical?.image_url)results.push(photoSource);
 const direct=tutorialState(input.youtube_url||canonical?.youtube_url,title);
 if(direct.id&&!direct.blocked&&(direct.mapping?.titleSignal!=='title_needs_review'||direct.repair)){
  const family=direct.repair?.scope==='family';results.push({src:`https://i.ytimg.com/vi/${direct.id}/hqdefault.jpg`,scope:family?'guide':'clip',label:family?'Guide':'Video',title:family?`${title} · family tutorial`:`${title} · video preview`,url:direct.url});
 }
 if(photoSource&&input.image_url===canonical?.image_url)results.push(photoSource);
 if(localPhoto&&!results.some(s=>s.src===localPhoto))results.push({src:localPhoto,scope:'photo',label:'Photo',title:input.name,url:null});
 const curated=MOVEMENT_MEDIA[slug];
 if(curated&&!tutorialState(`https://www.youtube.com/watch?v=${curated.id}`).blocked)results.push({src:`https://i.ytimg.com/vi/${curated.id}/hqdefault.jpg`,scope:curated.scope||'clip',label:curated.scope==='guide'?'Related':'Video',title:`${curated.creator} · ${curated.title}`,url:`https://www.youtube.com/watch?v=${curated.id}`});
 const paths=exercisePaths(input.slug).map(p=>p.id);
 const sources=PROGRESSION_SOURCES.filter(s=>s.paths.some(id=>paths.includes(id))&&getYouTubeId(s.url));
 for(const source of sources.slice(0,1)){const id=getYouTubeId(source.url)!;results.push({src:`https://i.ytimg.com/vi/${id}/hqdefault.jpg`,scope:'guide',label:'Guide',title:`${source.creator} · ${source.title}`,url:source.url});}
 if(canonicalSlug(input.slug)==='child-s-pose')results.push({src:'https://i.ytimg.com/vi/eqVMAPM00DM/hqdefault.jpg',scope:'guide',label:'Guide',title:"Yoga With Adriene · Extended Child’s Pose",url:'https://www.youtube.com/watch?v=eqVMAPM00DM'});
 for(const source of familyGuides.filter(s=>s.paths.some(id=>paths.includes(id))).slice(0,1)){const id=getYouTubeId(source.url)!;const status=tutorialState(source.url);if(!status.blocked)results.push({src:`https://i.ytimg.com/vi/${id}/hqdefault.jpg`,scope:'guide',label:'Guide',title:source.title,url:source.url});}
 if(canonical&&(canonical.category==='Rings'||canonical.equipment.some(e=>/rings/i.test(e))||/ring-|skin-the-cat|german-hang|front-lever|back-lever/.test(slug)))results.push({src:`https://i.ytimg.com/vi/${RING_FAMILY_GUIDE.id}/hqdefault.jpg`,scope:'guide',label:'Guide',title:RING_FAMILY_GUIDE.title,url:RING_FAMILY_GUIDE.source});
 if(/kneeling-planche-plank/.test(slug))results.push({src:'https://i.ytimg.com/vi/6snDOgFBBFA/hqdefault.jpg',scope:'guide',label:'Guide',title:'GMB · Planche foundations',url:'https://www.youtube.com/watch?v=6snDOgFBBFA'});
 const categoryId=canonical?(/Rings/.test(canonical.category)?'fsl08Copg-U':/Yoga|Flexibility|Mobility/.test(canonical.category)?'eqVMAPM00DM':/Legs/.test(canonical.category)?'qW5OGJ62ZjY':/Core/.test(canonical.category)?'LlDNef_Ztsc':/Pull/.test(canonical.category)?'asnC95pkVjw':'6snDOgFBBFA'):null;
 if(categoryId)results.push({src:`/movement-previews/${categoryId}.jpg`,scope:'category',label:'Category',title:`${canonical?.category} category image · not this exact movement`,url:null});
 const withLocal=results.filter(source=>!source.url||!tutorialState(source.url).blocked).flatMap(source=>{const id=source.url?getYouTubeId(source.url):null;return id&&id in thumbnailCache?[{...source,src:`/movement-previews/${id}.jpg`},source]:[source];});
 const seen=new Set<string>();return withLocal.filter(source=>{if(seen.has(source.src))return false;seen.add(source.src);return true;});
}
