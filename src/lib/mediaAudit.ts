import audit from '../data/videoAudit.json';
import repairs from '../data/videoRepairs.json';
import { getYouTubeId } from './youtube';
export const videoAudit=audit;
const byId=new Map(audit.videos.map(v=>[v.videoId,v]));
export function resolveTutorialUrl(nameOrSlug:string,url?:string|null){
 const repair=repairs.find(r=>(r.slug===nameOrSlug||r.name===nameOrSlug)&&(!url||getYouTubeId(url)===getYouTubeId(r.previousUrl)||url===r.url));
 return repair?.url||url||null;
}
export function tutorialState(url?:string|null,title=''){
 const resolved=resolveTutorialUrl(title,url);const id=getYouTubeId(resolved);const record=id?byId.get(id):undefined;
 const mapping=audit.exercises.find(e=>e.name===title&&getYouTubeId(e.url)===id);
 const repair=repairs.find(r=>r.name===title&&r.url===resolved);
 const unavailable=record?.availability==='unavailable'||record?.availability==='invalid'||record?.availability==='unchecked'&&record?.lastKnownAvailability==='unavailable'||repair?.decision==='withheld';
 return {url:resolved,id,record,mapping,repair,blocked:unavailable,
  label:!resolved?'Video coming soon':!id?'Video link needs repair':repair?.decision==='withheld'?'Wrong variation · source withheld':unavailable?'Video needs replacing':mapping?.titleSignal==='title_needs_review'&&!repair?'Exercise match needs checking':record?.availability==='reachable'?(repair?.scope==='family'?'Related lesson':'Video link checked'):'Video not checked yet',
 };
}
export type PlaybackEvidence={videoId:string;at:string;state:'loaded'|'played'|'error';code?:number};
export function playbackEvidence():PlaybackEvidence[]{
 try{const rows:unknown=JSON.parse(localStorage.getItem('power-video-playback-v1')||'[]');return Array.isArray(rows)?rows.filter((x):x is PlaybackEvidence=>x&&typeof x.videoId==='string'&&/^[A-Za-z0-9_-]{11}$/.test(x.videoId)&&['loaded','played','error'].includes(x.state)&&Number.isFinite(Date.parse(x.at))).slice(-200):[];}catch{return[];}
}
export function recordPlayback(entry:PlaybackEvidence){
 try{const next=[...playbackEvidence().filter(x=>x.videoId!==entry.videoId),entry].slice(-200);localStorage.setItem('power-video-playback-v1',JSON.stringify(next));window.dispatchEvent(new Event('power-video-playback'));}catch{/* Playback remains usable if storage is full. */}
}
