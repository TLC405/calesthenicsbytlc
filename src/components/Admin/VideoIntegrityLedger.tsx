import { useState } from 'react';
import catalog from '@/data/publicExerciseCatalog.json';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VideoPlayer } from '@/components/Exercise/VideoPlayer';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { tutorialState } from '@/lib/mediaAudit';

type ReviewStatus='unverified'|'reachable'|'playable'|'movement_verified'|'rejected'|'stale';
type Review={slug:string;url:string|null;status:ReviewStatus;creator:string;reason:string;checkedAt:string;reviewer:string;movement:boolean;coaching:boolean;playback:boolean};
const statuses:ReviewStatus[]=['unverified','reachable','playable','movement_verified','rejected','stale'];
/** Human review evidence is separate from merely having a URL. This ledger is device-local. */
export function VideoIntegrityLedger({owner}:{owner:string}) {
  const key=`power-video-reviews-v1:${owner}`;
  const [reviews,setReviews]=useState<Review[]>(()=>{try{const x=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(x)?x.filter((r:unknown):r is Review=>!!r&&typeof r==='object'&&typeof (r as Review).slug==='string'&&statuses.includes((r as Review).status)&&typeof (r as Review).checkedAt==='string'):[];}catch{return[];}});
  const [search,setSearch]=useState('');const [slug,setSlug]=useState(catalog[0].slug);
  const [status,setStatus]=useState<ReviewStatus>('unverified');
  const [creator,setCreator]=useState('');const [reason,setReason]=useState('');
  const [movement,setMovement]=useState(false),[coaching,setCoaching]=useState(false),[playback,setPlayback]=useState(false);
  const exercise=catalog.find(e=>e.slug===slug)||catalog[0];
  const prior=reviews.find(r=>r.slug===slug&&r.url===exercise.youtube_url);
  const visible=catalog.filter(e=>`${e.name} ${e.category}`.toLowerCase().includes(search.toLowerCase()));
  function choose(next:string){setSlug(next);const e=catalog.find(x=>x.slug===next);const r=reviews.find(x=>x.slug===next&&x.url===e?.youtube_url);setStatus(r?.status||'unverified');setCreator(r?.creator||'');setReason(r?.reason||'');setMovement(r?.movement||false);setCoaching(r?.coaching||false);setPlayback(r?.playback||false);}
  function save(){
    if(status==='movement_verified'&&(!movement||!coaching||!playback||!creator.trim())){toast.error('Confirm movement, coaching, playback and creator before marking verified.');return;}
    if(status==='playable'&&!playback){toast.error('Confirm embedded playback first.');return;}
    if(status!=='unverified'&&!exercise.youtube_url){toast.error('This movement has no mapped tutorial to verify.');return;}
    if(status==='rejected'&&!reason.trim()){toast.error('Record why this tutorial was rejected.');return;}
    const entry:Review={slug,url:exercise.youtube_url,status,creator:creator.trim(),reason:reason.trim(),checkedAt:new Date().toISOString(),reviewer:owner,movement,coaching,playback};
    const next=[...reviews.filter(x=>x.slug!==slug),entry];localStorage.setItem(key,JSON.stringify(next));setReviews(next);toast.success('Review saved on this device.');
  }
  return <section className="mt-8 border rounded-2xl bg-card p-4 sm:p-6 space-y-5" aria-label="Video integrity ledger">
    <div><p className="text-primary text-xs uppercase tracking-widest">Coach / media review</p><h2 className="font-display text-2xl font-bold mt-2">Video Integrity Ledger</h2><p className="text-xs text-muted-foreground mt-2">Owner reviews on this device. These records do not certify the public library or sync to other devices.</p></div>
    <div className="grid grid-cols-3 gap-3 text-xs"><div className="border rounded-xl p-3"><strong className="block text-xl">{catalog.filter(e=>!e.youtube_url).length}</strong>Missing links</div><div className="border rounded-xl p-3"><strong className="block text-xl">{reviews.length}</strong>Recorded reviews</div><div className="border rounded-xl p-3"><strong className="block text-xl">{reviews.filter(r=>r.status==='movement_verified').length}</strong>Movement verified</div></div>
    <div className="grid md:grid-cols-2 gap-5"><div className="space-y-3"><label className="block text-sm">Find a movement<Input className="mt-2 h-12" placeholder="Search video review queue" value={search} onChange={e=>setSearch(e.target.value)}/></label><div className="max-h-80 overflow-y-auto border rounded-xl">{visible.map(e=><button key={e.slug} onClick={()=>choose(e.slug)} aria-pressed={slug===e.slug} className={`min-h-14 w-full border-b px-3 py-2 text-left text-xs ${slug===e.slug?'bg-primary/10 text-primary':''}`}><strong>{e.name}</strong><small className="block mt-1 text-muted-foreground">{e.youtube_url?(reviews.find(r=>r.slug===e.slug&&r.url===e.youtube_url)?.status||'unverified'):'missing tutorial'}</small></button>)}</div></div>
      <div className="space-y-3"><h3 className="font-bold">{exercise.name}</h3><VideoPlayer key={slug} youtubeUrl={exercise.youtube_url} title={exercise.name} thumbnailMode auditPreview/>
        <p className="text-xs text-muted-foreground">Provider audit: {tutorialState(exercise.youtube_url,exercise.name).label}</p><Link className="inline-flex min-h-11 items-center text-xs text-primary underline" to={`/videos?exercise=${exercise.slug}`}>View source and playback evidence</Link>
        {prior&&<p className="text-xs text-muted-foreground">Last reviewed {new Date(prior.checkedAt).toLocaleString()}</p>}
        <label className="block text-xs">Status<select className="h-12 mt-1 w-full bg-card border rounded-xl px-2" value={status} onChange={e=>setStatus(e.target.value as ReviewStatus)}>{statuses.map(s=><option value={s} key={s}>{s.replace(/_/g,' ')}</option>)}</select></label>
        <label className="block text-xs">Creator / coaching source<Input className="h-12 mt-1" maxLength={160} value={creator} onChange={e=>setCreator(e.target.value)}/></label>
        {[{label:'Movement and variation match this exercise',value:movement,set:setMovement},{label:'Coaching quality reviewed',value:coaching,set:setCoaching},{label:'Embedded video played successfully',value:playback,set:setPlayback}].map(x=><label key={x.label} className="flex items-center gap-3 min-h-12 text-xs"><input className="h-5 w-5" type="checkbox" checked={x.value} onChange={e=>x.set(e.target.checked)}/>{x.label}</label>)}
        <label className="block text-xs">Review notes / rejection reason<Input className="mt-1 h-12" maxLength={300} value={reason} onChange={e=>setReason(e.target.value)}/></label><Button className="h-12 w-full" onClick={save}>Save review evidence</Button>
      </div></div>
  </section>;
}
