import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Bookmark, Check, ChevronLeft, ChevronRight, ExternalLink, Link2, Play, Plus, RotateCcw, Square, Trash2, TvMinimal, VideoOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';
import { movementTutorialSources, type ThumbnailExercise } from '@/lib/movementThumbnails';
import { parseEmbeddedMedia } from '@/lib/embeddedMedia';
import { EmbeddedMedia } from './EmbeddedMedia';

type Lesson={title:string;url:string;scope:'clip'|'guide'|'other';provider:'youtube'|'instagram'};
function personalKey(owner:string,slug:string){return `power-tlctv-movement-v1:${owner}:${slug}`;}
function readPersonal(owner:string,slug:string):Lesson[]{
  try{const raw=JSON.parse(localStorage.getItem(personalKey(owner,slug))||'[]');
    if(!Array.isArray(raw))return [];
    return raw.slice(0,3).flatMap(item=>{if(!item||typeof item.title!=='string'||typeof item.url!=='string')return [];
      const source=parseEmbeddedMedia(item.url);return source?[{title:item.title.slice(0,90),url:source.url,scope:'other' as const,provider:source.provider}]:[];});
  }catch{return [];}
}
function lessonsFor(exercise:ThumbnailExercise):Lesson[]{
  const urls=[...movementTutorialSources(exercise).filter(source=>source.url).map(source=>({
    title:source.title||exercise.name,
    url:source.url!,
    scope:source.scope==='guide'?'guide' as const:'clip' as const,
  })),...(exercise.instagram_url?[{title:exercise.name+' · Instagram',url:exercise.instagram_url,scope:'clip' as const}]:[])];
  const seen=new Set<string>();
  return urls.flatMap(source=>{
    const parsed=parseEmbeddedMedia(source.url);
    if(!parsed||seen.has(parsed.url))return [];
    seen.add(parsed.url);
    return [{title:source.title,url:parsed.url,scope:source.scope,provider:parsed.provider}];
  }).slice(0,12);
}

/** TLCtv is embedded directly beside movement cues and training controls.
 *  Streaming providers keep control of playback; we never fake pause, seek, or speed APIs.
 */
export function InlineTlcTv({exercise,compact=false}:{exercise:ThumbnailExercise;compact?:boolean}){
  const {user}=useAuth();
  const owner=user?.id||'guest';
  const [personal,setPersonal]=useState<Lesson[]>(()=>readPersonal(owner,exercise.slug));
  const [addOpen,setAddOpen]=useState(false);
  const [customUrl,setCustomUrl]=useState('');
  const [customTitle,setCustomTitle]=useState('');
  const lessons=useMemo(()=>[...lessonsFor(exercise),...personal],[exercise.slug,exercise.youtube_url,exercise.instagram_url,personal]);
  const [selected,setSelected]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [revision,setRevision]=useState(0);
  const [saved,setSaved]=useState(false);
  const lesson=lessons[Math.min(selected,Math.max(lessons.length-1,0))];
  const libraryKey='power-watch-library-v1:'+owner;
  useEffect(()=>{setSelected(0);setPlaying(false);setRevision(0);setPersonal(readPersonal(owner,exercise.slug));setCustomUrl('');setCustomTitle('');setAddOpen(false);},[exercise.slug,owner]);
  useEffect(()=>{
    try{const rows=JSON.parse(localStorage.getItem(libraryKey)||'[]');
      setSaved(Boolean(lesson&&Array.isArray(rows)&&rows.some((row:{url?:string})=>row?.url===lesson.url)));
    }catch{setSaved(false);}
  },[lesson?.url,libraryKey]);

  function attach(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const source=parseEmbeddedMedia(customUrl);
    if(!source){toast.error('Use a public YouTube video or Instagram reel/post URL.');return;}
    if(personal.some(v=>v.url===source.url)){toast.info('This video is already attached to the exercise.');return;}
    if(personal.length>=3){toast.error('Limit 3 personal video links per exercise. Remove one first.');return;}
    const next=[...personal,{url:source.url,title:(customTitle.trim()||'My '+exercise.name+' lesson').slice(0,90),scope:'other' as const,provider:source.provider}];
    try{localStorage.setItem(personalKey(owner,exercise.slug),JSON.stringify(next));setPersonal(next);setCustomUrl('');setCustomTitle('');setAddOpen(false);setPlaying(false);setSelected(lessonsFor(exercise).length+next.length-1);toast.success('Video linked to '+exercise.name+' on this device.');}
    catch{toast.error('This browser could not save your video link.');}
  }
  function removePersonal(){
    if(!lesson||lesson.scope!=='other')return;
    const next=personal.filter(v=>v.url!==lesson.url);
    try{localStorage.setItem(personalKey(owner,exercise.slug),JSON.stringify(next));setPersonal(next);setPlaying(false);setSelected(0);toast('Personal video removed from this exercise.');}
    catch{toast.error('Could not update this exercise on your device.');}
  }
  function choose(index:number){
    if(index<0||index>=lessons.length)return;
    setSelected(index);setPlaying(false);setRevision(0);
  }
  function save(){
    if(!lesson)return;
    try{
      const raw=JSON.parse(localStorage.getItem(libraryKey)||'[]');
      const rows=Array.isArray(raw)?raw.filter(x=>x&&typeof x.url==='string'&&typeof x.title==='string'&&parseEmbeddedMedia(x.url)):[];
      localStorage.setItem(libraryKey,JSON.stringify([{url:lesson.url,title:(exercise.name+' · '+lesson.title).slice(0,100)},...rows.filter(x=>x.url!==lesson.url)].slice(0,40)));
      setSaved(true);
      toast.success('Saved in TLCtv · Tutorials & live');
    }catch{toast.error('Could not save this lesson on this device.');}
  }
  return <section className={'tlctv-inline '+(compact?'tlctv-inline--compact':'')} aria-label={'TLCtv videos for '+exercise.name}>
    <header className="tlctv-inline__head">
      <span className="tlctv-inline__identity">
        <img src="/icons/tlc-doodle-180.png" width={44} height={44} alt="TLC doodle mark"/>
        <span className="tlctv-inline__branding"><strong>TLC<span>tv</span></strong><small>SPREAD TLC / SKILL CINEMA</small></span>
      </span>
      <span className="tlctv-inline__counter"><TvMinimal size={15}/>{lessons.length?String(lessons.length).padStart(2,'0')+' LESSON'+(lessons.length===1?'':'S'):'NO VIDEO YET'}</span>
    </header>
    {lesson?<>
      <div className="tlctv-inline__stage">
        {playing
          ?<div className="tlctv-inline__embedded" key={lesson.url+'-'+revision}><EmbeddedMedia url={lesson.url} title={lesson.title}/></div>
          :<button type="button" className="tlctv-inline__poster" onClick={()=>setPlaying(true)} aria-label={'Play '+lesson.title+' here'}>
            <span className="tlctv-inline__poster-mark" aria-hidden="true"><img src="/icons/tlc-doodle-180.png" alt=""/></span>
            <span className="tlctv-inline__poster-center"><span className="tlctv-inline__play-disc"><Play size={30} fill="currentColor"/></span><strong>PLAY SKILL FILM</strong><small>{lesson.provider==='instagram'?'INSTAGRAM REEL':'YOUTUBE LESSON'}</small></span>
            <span className="tlctv-inline__poster-label">{exercise.name}</span>
          </button>
        }
      </div>
      <div className="tlctv-inline__console">
        <div className="tlctv-inline__now">
          <div className="tlctv-inline__now-copy">
            <p className="tlctv-inline__eyebrow">NOW SELECTED / {String(selected+1).padStart(2,'0')}</p>
            <h3>{lesson.title}</h3>
            <span>{lesson.scope==='guide'?'RELATED COACHING · BROADER SKILL':lesson.scope==='other'?'PERSONAL LINK · USER ADDED':'EXERCISE VIDEO'} <span aria-hidden="true">·</span> {lesson.provider==='youtube'?'YOUTUBE':'INSTAGRAM'}</span>
          </div>
          <div className="tlctv-inline__source-stepper" aria-label="Choose tutorial">
            <button type="button" onClick={()=>choose(selected-1)} disabled={selected===0} aria-label="Previous tutorial" title="Previous tutorial"><ChevronLeft size={19}/></button>
            <span>{selected+1}/{lessons.length}</span>
            <button type="button" onClick={()=>choose(selected+1)} disabled={selected>=lessons.length-1} aria-label="Next tutorial" title="Next tutorial"><ChevronRight size={19}/></button>
          </div>
        </div>
        <div className="tlctv-inline__buttons" aria-label="TLCtv playback controls">
          <button type="button" className="tlctv-inline__primary" onClick={()=>setPlaying(v=>!v)}>
            {playing?<><Square size={15}/>Stop video</>:<><Play size={16} fill="currentColor"/>Play here</>}
          </button>
          <button type="button" onClick={()=>{setRevision(v=>v+1);setPlaying(true);}} aria-label="Restart the selected tutorial" title="Restart lesson"><RotateCcw size={17}/><span>Replay</span></button>
          <button type="button" onClick={save} aria-label={saved?'Lesson saved in TLCtv':'Save lesson to TLCtv'} disabled={saved} title={saved?'Saved':'Save to TLCtv'}>{saved?<Check size={17}/>:<Bookmark size={17}/>}<span>{saved?'Saved':'Save'}</span></button>
          <a href={lesson.url} target="_blank" rel="noopener noreferrer" aria-label="Open original video in new tab" title="Open original source"><ExternalLink size={17}/><span>Source</span></a>
        </div>
        {lessons.length>1&&<div className="tlctv-inline__channels" role="group" aria-label="Available tutorials">
          {lessons.map((source,i)=><button key={source.url} type="button" aria-pressed={selected===i} onClick={()=>choose(i)}>
            {String(i+1).padStart(2,'0')} {source.scope==='guide'?'SKILL GUIDE':source.scope==='other'?'MY CLIP':'DEMO'}
          </button>)}
        </div>}
        <div className="tlctv-inline__personal-actions">
          <button type="button" onClick={()=>setAddOpen(v=>!v)} aria-expanded={addOpen}><Plus size={15}/> Add my video</button>
          {lesson.scope==='other'&&<button type="button" onClick={removePersonal}><Trash2 size={15}/> Remove this link</button>}
        </div>
        {addOpen&&<form className="tlctv-inline__personal-form" onSubmit={attach}>
          <label>Video link<input type="url" required value={customUrl} placeholder="https://www.youtube.com/watch?v=…" onChange={e=>setCustomUrl(e.target.value)}/></label>
          <label>Lesson name (optional)<input type="text" maxLength={90} placeholder="My tuck planche tutorial" value={customTitle} onChange={e=>setCustomTitle(e.target.value)}/></label>
          <button type="submit" disabled={personal.length>=3}><Link2 size={15}/> Attach to {exercise.name}</button>
          <p>Public YouTube/Instagram links only. Attached per exercise on this device; videos remain hosted by their creators.</p>
        </form>}
        <p className="tlctv-inline__footnote">TLCtv keeps the video beside your exercise. Use playback controls inside YouTube or Instagram for pause, speed and fullscreen. External creators may restrict embeds.</p>
      </div>
    </>:<div className="tlctv-inline__empty">
      <VideoOff size={23}/>
      <div><strong>No approved video attached yet.</strong><p>Keep training with the instructions below. You can attach a personal video link here without leaving the exercise.</p>
        <button className="tlctv-inline__empty-action" type="button" onClick={()=>setAddOpen(v=>!v)}><Plus size={15}/> Add my video link</button>
        {addOpen&&<form className="tlctv-inline__personal-form" onSubmit={attach}>
          <label>Public YouTube or Instagram URL<input type="url" required value={customUrl} placeholder="https://www.youtube.com/watch?v=…" onChange={e=>setCustomUrl(e.target.value)}/></label>
          <label>Title (optional)<input type="text" maxLength={90} value={customTitle} placeholder="My exercise tutorial" onChange={e=>setCustomTitle(e.target.value)}/></label>
          <button type="submit"><Link2 size={15}/> Attach video</button>
        </form>}
      </div>
    </div>}
  </section>;
}
