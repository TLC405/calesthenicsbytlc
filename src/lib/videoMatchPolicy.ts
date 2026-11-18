import review from '@/data/thumbnailReview.json';
import audit from '@/data/videoAudit.json';
import { getYouTubeId } from './youtube';

/**
 * A title or reachable URL is not proof of the demonstrated movement.
 * "Reviewed" below means the supplied thumbnail/mapping was reviewed.
 * It does NOT certify every repetition, technique, or video playback.
 */
const reviewedBySlug = new Map(review.exercises.map(item => [item.slug,item]));
const videos = new Map(audit.videos.map(item => [item.videoId,item]));

/** An approved preview can still be a DIFFERENT variation. */
// Distinct movements are not interchangeable just because they appear in the same skill family.
const wrongExercise: Readonly<Record<string,readonly string[]>> = {
  'frog-stand':['SrYBD4yCI84'], // Crow pose: do not offer as the Frog Stand demonstration.
  'bridge-pose':['wPM8icPu6H8'], // Glute bridge is not the Yoga Bridge backbend.
};
const variationMismatch: Readonly<Record<string,readonly string[]>> = {
  'toes-to-bar':['_03pCKOv4l4'], // Kipping demonstration must not be labelled strict toes-to-bar.
  'ring-support-hold':['9PKChU9Ozs8'], // Rings-turned-out support is not a basic ring support.
  'headstand':['_ZTSkpBjhu0'], // Tripod variation is not generic headstand technique.
  'l-sit':['cu0fHp8HCDo'], // "Best exercises to increase L-sit" is a progression lesson.
  'first-position-plie':['DrBhcopjDZQ'], // General plié tutorial, not specifically first-position.
  'world-s-greatest-stretch':['aiN-2yAIkec'], // Broad mobility video; cannot verify exact stretch.
};
export type ExerciseVideoMatch='reviewed'|'related'|'unverified'|'unavailable'|'rejected'|'missing';
export function videoMatch(slug:string,url?:string|null):ExerciseVideoMatch{
  const id=getYouTubeId(url);
  if(!id)return 'missing';
  const item=reviewedBySlug.get(slug);
  if(item?.rejectedVideoIds.includes(id))return 'rejected';
  if(wrongExercise[slug]?.includes(id))return 'rejected';
  const video=videos.get(id);
  if(video?.availability==='unavailable'||video?.availability==='invalid')return 'unavailable';
  if(item?.approvedVideoIds.includes(id)){
    if(variationMismatch[slug]?.includes(id))return 'related';
    return video?.availability==='reachable'?'reviewed':'unverified';
  }
  if(item?.relatedVideoIds.includes(id)||variationMismatch[slug]?.includes(id))return 'related';
  return 'unverified';
}
export function reviewedVideoForExercise(slug:string,id:string):boolean{
 return videoMatch(slug,'https://www.youtube.com/watch?v='+id)==='reviewed';
}
export function relatedVideoForExercise(slug:string,id:string):boolean{
 return videoMatch(slug,'https://www.youtube.com/watch?v='+id)==='related';
}
export const VIDEO_MATCH_LIMIT='Reviewed preview and title mapping; the full video technique and playback are not independently certified.';
