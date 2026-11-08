import thumbnailReview from '../data/thumbnailReview.json';
import auditMetadata from '../data/videoAudit.json';
import thumbnailCache from '../data/thumbnailCache.json';
import { MOVEMENT_MEDIA, LOCAL_MOVEMENT_PHOTOS, RING_FAMILY_GUIDE } from '../data/movementMedia';
import catalog from '../data/publicExerciseCatalog.json';
import { PROGRESSION_SOURCES } from '../data/progressionSources';
import { exercisePaths, canonicalSlug } from './exerciseProgressions';
import { tutorialState } from './mediaAudit';
import { getYouTubeId } from './youtube';
export type ThumbnailExercise={slug:string;name:string;image_url?:string|null;youtube_url?:string|null;instagram_url?:string|null};
export type ThumbnailSource={src:string;scope:'photo'|'clip'|'guide'|'category';label:string;title:string;url:string|null};
const bySlug=new Map(catalog.map(e=>[e.slug,e]));
const reviewed=new Map(thumbnailReview.exercises.map(e=>[e.slug,e]));
const videoMetadata=new Map(auditMetadata.videos.map(v=>[v.videoId,v]));
const sharedVideos=new Map<string,Set<string>>();for(const exercise of catalog){const id=getYouTubeId(exercise.youtube_url);if(id){const slugs=sharedVideos.get(id)||new Set<string>();slugs.add(canonicalSlug(exercise.slug));sharedVideos.set(id,slugs);}}
const familyGuides=[
 {paths:['planche','straight-arm','crow'],url:'https://www.youtube.com/watch?v=6snDOgFBBFA',title:'GMB · Planche preparation'},
 {paths:['handstand','hspu','pike-press'],url:'https://www.youtube.com/watch?v=d6_lcWtQDxw',title:'GMB · Handstand tutorial'},
 {paths:['rings','ring-muscle-up'],url:'https://www.youtube.com/watch?v=asnC95pkVjw',title:'GMB · Ring muscle-up components'},
];
function movementMediaSources(input:ThumbnailExercise):ThumbnailSource[]{
 const canonical=bySlug.get(canonicalSlug(input.slug));const title=canonical?.name||input.name;
 const results:ThumbnailSource[]=[];
 const slug=canonicalSlug(input.slug);
 const review=reviewed.get(slug);
 const localPhoto=null;
 for(const id of review?.approvedVideoIds||[]){const meta=videoMetadata.get(id);const url=`https://www.youtube.com/watch?v=${id}`;if(!tutorialState(url).blocked)results.push({src:`https://i.ytimg.com/vi/${id}/hqdefault.jpg`,scope:'clip',label:'Video',title:meta?`${meta.creator} · ${meta.title}`:title,url});}
 const ownPhoto=input.image_url&&input.image_url!==bySlug.get(input.slug)?.image_url&&input.image_url!==canonical?.image_url?input.image_url:null;
 const photo=ownPhoto||(review?null:input.image_url);
 const photoSource=photo&&/^(https:\/\/|\/)/.test(photo)?{src:photo,scope:'photo' as const,label:'Photo',title:input.name,url:null}:null;
 if(photoSource&&input.image_url!==canonical?.image_url)results.unshift(photoSource);
 const direct=tutorialState(input.youtube_url||canonical?.youtube_url,title);
 if(direct.id&&!review?.rejectedVideoIds.includes(direct.id)&&!direct.blocked&&(direct.mapping?.titleSignal!=='title_needs_review'||direct.repair)){
  const family=review?!review.approvedVideoIds.includes(direct.id):direct.repair?.scope==='family'||(sharedVideos.get(direct.id)?.size||0)>2;results.push({src:`https://i.ytimg.com/vi/${direct.id}/hqdefault.jpg`,scope:family?'guide':'clip',label:family?'Guide':'Video',title:family?`${title} · family tutorial`:`${title} · video preview`,url:direct.url});
 }
 if(photoSource&&input.image_url===canonical?.image_url)results.push(photoSource);
 if(localPhoto&&!results.some(s=>s.src===localPhoto))results.push({src:localPhoto,scope:'photo',label:'Photo',title:input.name,url:null});
 const curated=MOVEMENT_MEDIA[slug];
 if(curated&&!review?.rejectedVideoIds.includes(curated.id)&&!tutorialState(`https://www.youtube.com/watch?v=${curated.id}`).blocked)results.push({src:`https://i.ytimg.com/vi/${curated.id}/hqdefault.jpg`,scope:review&&!review.approvedVideoIds.includes(curated.id)?'guide':curated.scope||'clip',label:curated.scope==='guide'?'Related':'Video',title:`${curated.creator} · ${curated.title}`,url:`https://www.youtube.com/watch?v=${curated.id}`});
 const paths=exercisePaths(input.slug).map(p=>p.id);
 const sources=PROGRESSION_SOURCES.filter(s=>s.paths.some(id=>paths.includes(id))&&getYouTubeId(s.url));
 for(const source of sources){const id=getYouTubeId(source.url)!;results.push({src:`https://i.ytimg.com/vi/${id}/hqdefault.jpg`,scope:'guide',label:'Guide',title:`${source.creator} · ${source.title}`,url:source.url});}
 if(canonicalSlug(input.slug)==='child-s-pose')results.push({src:'https://i.ytimg.com/vi/eqVMAPM00DM/hqdefault.jpg',scope:'guide',label:'Guide',title:"Yoga With Adriene · Extended Child’s Pose",url:'https://www.youtube.com/watch?v=eqVMAPM00DM'});
 for(const source of familyGuides.filter(s=>s.paths.some(id=>paths.includes(id))).slice(0,1)){const id=getYouTubeId(source.url)!;const status=tutorialState(source.url);if(!status.blocked)results.push({src:`https://i.ytimg.com/vi/${id}/hqdefault.jpg`,scope:'guide',label:'Guide',title:source.title,url:source.url});}
 if(canonical&&(canonical.category==='Rings'||canonical.equipment.some(e=>/rings/i.test(e))||/ring-|skin-the-cat|german-hang|front-lever|back-lever/.test(slug)))results.push({src:`https://i.ytimg.com/vi/${RING_FAMILY_GUIDE.id}/hqdefault.jpg`,scope:'guide',label:'Guide',title:RING_FAMILY_GUIDE.title,url:RING_FAMILY_GUIDE.source});
 if(/kneeling-planche-plank/.test(slug))results.push({src:'https://i.ytimg.com/vi/6snDOgFBBFA/hqdefault.jpg',scope:'guide',label:'Guide',title:'GMB · Planche foundations',url:'https://www.youtube.com/watch?v=6snDOgFBBFA'});
 const withLocal=results.filter(source=>!source.url||(!review?.rejectedVideoIds.includes(getYouTubeId(source.url)||'')&&!tutorialState(source.url).blocked)).flatMap(source=>{const id=source.url?getYouTubeId(source.url):null;return id&&id in thumbnailCache?[{...source,src:`/movement-previews/${id}.jpg`},source]:[source];});
 const seen=new Set<string>();return withLocal.filter(source=>{if(seen.has(source.src))return false;seen.add(source.src);return true;});
}

/** Exercise cards never borrow an unrelated family lesson as their picture. */
export function movementThumbnailSources(input:ThumbnailExercise):ThumbnailSource[]{return movementMediaSources(input).filter(source=>source.scope==='photo'||source.scope==='clip');}
export function movementTutorialSources(input:ThumbnailExercise):ThumbnailSource[]{const seen=new Set<string>();return movementMediaSources(input).filter(source=>{if(!source.url||seen.has(source.url))return false;seen.add(source.url);return true;});}
export function movementVisualDetails(input:ThumbnailExercise){const e=bySlug.get(canonicalSlug(input.slug));const path=exercisePaths(input.slug)[0];return {family:path?.title||e?.category||'Your movement',cue:Array.isArray(e?.cues)?String(e.cues[0]||''):''};}
const coverSlugs:Record<string,string[]>={'iron-cross':['band-assisted-iron-cross'],'human-flag':['band-assisted-human-flag'],planche:['tuck-planche','straddle-planche','planche-lean'],'straight-arm':['planche-lean','scapular-push-up'],rings:['ring-row','ring-dip'],'handstand':['freestanding-handstand','chest-to-wall-handstand'],'straddle-press':['straddle-press-to-hs','wall-press-negative'],stalder:['stalder-press-to-hs','stalder-negative'],'pike-compression':['seated-pike-lift'],'straddle-compression':['seated-straddle-lift'],'yoga-foundation':['downward-dog','cat-cow'],'ballet-barre':['first-position-plie','tendu'],'ballet-balance':['arabesque-hold','attitude-hold']};
export function skillCoverMovement(path:{id:string;slugs:readonly string[]}){const slugs=[...(coverSlugs[path.id]||[]),...path.slugs];return slugs.map(slug=>bySlug.get(canonicalSlug(slug))).find(e=>e&&movementThumbnailSources(e).length)||bySlug.get(canonicalSlug(path.slugs[0]));}
