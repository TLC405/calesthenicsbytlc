import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowUpRight, BrainCircuit, Check, ChevronDown, Clipboard, ExternalLink, Eye, FileVideo2, Film, Link2, Loader2, LockKeyhole, RefreshCcw, Save, ScanEye, ShieldAlert, Sparkles, UploadCloud } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { parseEmbeddedMedia } from '@/lib/embeddedMedia';
import { EmbeddedMedia } from '@/components/Exercise/EmbeddedMedia';
import { toast } from 'sonner';

type Analysis={
  at:string;sourceBasis:string;confidence:'low'|'medium'|'high';skill:string;summary:string;
  observations:string[];techniqueCues:string[];suggestedProgressions:string[];
  safetyConsiderations:string[];evidenceLimits:string;provider:'ai';
};
const sites=['youtube.com','youtu.be','instagram.com','tiktok.com','facebook.com','fb.watch','x.com','twitter.com','threads.net','vimeo.com','reddit.com'];
const maxBytes=150*1024*1024;
function safeSocialUrl(value:string):string|null{
  if(!value.trim())return null;
  try{const u=new URL(value.trim());const hostname=u.hostname.toLowerCase().replace(/^(www\.|m\.|mobile\.)/,'');
    if(u.protocol!=='https:'||u.username||u.password||u.port||!sites.some(s=>hostname===s||hostname.endsWith('.'+s)))return null;
    u.hash='';return u.href;
  }catch{return null;}
}
async function sampleVideo(file:File,onFrame:(frame:string)=>void):Promise<string[]>{
  if(file.size>maxBytes)throw Error('Choose a video under 150 MB. The full file stays on your device.');
  if(!['video/mp4','video/webm','video/x-m4v','video/quicktime'].includes(file.type.toLowerCase())&&!/\.(mp4|webm|m4v|mov)$/i.test(file.name))throw Error('Choose an MP4, M4V, WebM or MOV video.');
  const video=document.createElement('video');
  video.preload='auto';video.muted=true;video.playsInline=true;
  const src=URL.createObjectURL(file);video.src=src;
  try{
    await new Promise<void>((resolve,reject)=>{
      const timer=window.setTimeout(()=>reject(Error('The video could not load on this device. Try MP4 or WebM.')),16000);
      const done=(error?:Error)=>{window.clearTimeout(timer);error?reject(error):resolve();};
      video.onloadedmetadata=()=>done();video.onerror=()=>done(Error('This video format cannot be decoded on your device.'));
      video.load();
    });
    if(!Number.isFinite(video.duration)||video.duration<=0||video.videoWidth<32||video.videoHeight<32)throw Error('Could not read a usable video timeline.');
    const w=Math.min(520,video.videoWidth),h=Math.max(1,Math.round(w*video.videoHeight/video.videoWidth));
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
    const ctx=canvas.getContext('2d');if(!ctx)throw Error('Frame capture is not available on this device.');
    const output:string[]=[];
    for(const fraction of [.12,.5,.88]){
      const time=Math.max(0,Math.min(video.duration-.04,video.duration*fraction));
      await new Promise<void>((resolve,reject)=>{
        const timer=window.setTimeout(()=>reject(Error('Video frame capture timed out. Try a shorter clip.')),14000);
        video.onseeked=()=>{window.clearTimeout(timer);resolve();};
        video.onerror=()=>{window.clearTimeout(timer);reject(Error('Video seek failed.'));};
        video.currentTime=time;
      });
      ctx.drawImage(video,0,0,w,h);
      const encoded=canvas.toDataURL('image/jpeg',.55);
      if(encoded.length>215000)throw Error('Frame is too large for analysis. Try a smaller video.');
      output.push(encoded);onFrame(encoded);
    }
    return output;
  }finally{video.pause();video.removeAttribute('src');video.load();URL.revokeObjectURL(src);}
}
function reportText(report:Analysis){
  const section=(name:string,items:string[])=>items.length?name+'\n'+items.map(v=>'• '+v).join('\n')+'\n\n':'';
  return ['TLCtv / AI SOCIAL VIDEO ANALYZER',report.skill,report.summary,'',
    section('EVIDENCE OBSERVED',report.observations),
    section('TECHNIQUE CUES',report.techniqueCues),
    section('OPTIONAL PROGRESSIONS',report.suggestedProgressions),
    section('SAFETY CONSIDERATIONS',report.safetyConsiderations),
    'LIMITS: '+report.evidenceLimits,
    'Evidence: '+report.sourceBasis+' · Confidence: '+report.confidence+' · '+new Date(report.at).toLocaleString(),
    'AI observations are not a validated form or injury assessment.'].join('\n');
}
function readReports(owner:string):Analysis[]{
  try{const rows=JSON.parse(localStorage.getItem('power-tlctv-analysis-v1:'+owner)||'[]');return Array.isArray(rows)?rows.slice(0,8).filter(r=>r&&r.provider==='ai'&&typeof r.summary==='string'):[];}catch{return[];}
}
export function SocialVideoAnalyzer({initialUrl='',exerciseName=''}:{initialUrl?:string;exerciseName?:string}){
  const {user}=useAuth();const owner=user?.id||'guest';
  const [url,setUrl]=useState(initialUrl),[notes,setNotes]=useState(''),[title,setTitle]=useState(''),[exercise,setExercise]=useState(exerciseName);
  const [file,setFile]=useState<File|null>(null),[preview,setPreview]=useState<string|null>(null),[frames,setFrames]=useState<string[]>([]);
  const [busy,setBusy]=useState<'sampling'|'analyzing'|null>(null),[error,setError]=useState('');
  const [configured,setConfigured]=useState<boolean|null>(null);
  const [report,setReport]=useState<Analysis|null>(null);
  const [history,setHistory]=useState<Analysis[]>(()=>readReports(owner));
  const [viewSaved,setViewSaved]=useState(false);
  const normalized=safeSocialUrl(url);
  const playable=normalized?parseEmbeddedMedia(normalized):null;
  const [showPlayer,setShowPlayer]=useState(false);
  useEffect(()=>{let alive=true;fetch('/api/analyze-social-video',{cache:'no-store'}).then(r=>r.json()).then(data=>{if(alive)setConfigured(data.configured===true);}).catch(()=>{if(alive)setConfigured(false);});return()=>{alive=false;};},[]);
  useEffect(()=>{setHistory(readReports(owner));},[owner]);
  useEffect(()=>{setUrl(initialUrl);setExercise(exerciseName);setShowPlayer(false);},[initialUrl,exerciseName]);
  useEffect(()=>{setFrames([]);setReport(null);if(!file){setPreview(null);return;}const objectUrl=URL.createObjectURL(file);setPreview(objectUrl);return()=>URL.revokeObjectURL(objectUrl);},[file]);
  const basis=frames.length?'visual frames':notes.trim().length>=25?'caption / transcript':null;
  const canAnalyze=Boolean(configured&&user&&!busy&&basis&&(!url.trim()||normalized));

  async function capture(){
    if(!file)return;setError('');setFrames([]);setReport(null);setBusy('sampling');
    try{const result:string[]=[];await sampleVideo(file,frame=>{result.push(frame);setFrames([...result]);});toast.success('Three local frames captured. Full video stays on your device.');}
    catch(e){setError(e instanceof Error?e.message:'Video sampling failed.');setFrames([]);}
    finally{setBusy(null);}
  }
  async function analyze(event:FormEvent){
    event.preventDefault();
    if(busy)return;
    setError('');setReport(null);
    if(url.trim()&&!normalized){setError('Use a supported public HTTPS social-video link.');return;}
    if(!frames.length&&notes.trim().length<25){setError('Sample a local video, or paste at least 25 characters of captions or transcript. A URL alone is not video evidence.');return;}
    const {data}=await supabase.auth.getSession();const token=data.session?.access_token;
    if(!token){setError('Sign in to run AI analysis. Your local video preview and frame capture work without sign-in.');return;}
    if(!configured){setError('The AI provider has not been connected to this app.');return;}
    setBusy('analyzing');
    try{
      const response=await fetch('/api/analyze-social-video',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},
        body:JSON.stringify({url:normalized||'',title:title.trim(),exercise:exercise.trim(),notes:notes.trim(),frames}),signal:AbortSignal.timeout(60000)});
      const result=await response.json();
      if(!response.ok)throw Error(result.error||'AI analysis was unavailable.');
      if(!result||result.provider!=='ai'||typeof result.summary!=='string')throw Error('The AI response was incomplete.');
      setReport(result as Analysis);
    }catch(e){setError(e instanceof Error?e.message:'Could not analyze this video.');}
    finally{setBusy(null);}
  }
  function save(){
    if(!report)return;
    const next=[report,...history.filter(r=>r.at!==report.at)].slice(0,8);
    try{localStorage.setItem('power-tlctv-analysis-v1:'+owner,JSON.stringify(next));setHistory(next);toast.success('Report saved to this device (without frames or video).');}
    catch{toast.error('Could not save this report locally.');}
  }
  const sections=useMemo(()=>report?[{title:'What the evidence shows',data:report.observations,icon:Eye},
    {title:'Technique cues to consider',data:report.techniqueCues,icon:ScanEye},
    {title:'Optional progression ideas',data:report.suggestedProgressions,icon:ArrowUpRight},
    {title:'Safety and uncertainty',data:report.safetyConsiderations,icon:ShieldAlert}]:[],[report]);
  return <section className="tlc-analyzer" aria-label="TLCtv social video analyzer">
    <header className="tlc-analyzer-hero">
      <div className="tlc-analyzer-mark"><img src="/icons/tlc-doodle-180.png" width={48} height={48} alt="TLC logo"/></div>
      <div><p className="tlc-analyzer-eyebrow"><Sparkles size={14}/> TLCtv / TECHNIQUE INTELLIGENCE</p><h2>Social Video Analyzer</h2><p>Turn a clip into evidence-aware exercise notes, technique cues, and optional skill progressions.</p></div>
    </header>
    <div className="tlc-analyzer-status"><span className={configured?'is-ready':''}><span className="tlc-analyzer-dot"/>{configured===null?'Checking AI service…':configured?'AI service connected':'AI service not configured'}</span><span>{user?'Signed in':'AI requires sign-in'}</span></div>
    <form onSubmit={e=>void analyze(e)} className="tlc-analyzer-form">
      <label><span><Link2 size={15}/> Social video link <small>(optional)</small></span>
        <input type="url" inputMode="url" placeholder="YouTube, Instagram, TikTok, Facebook, X…" value={url} onChange={e=>{setUrl(e.target.value);setShowPlayer(false);}} maxLength={1500}/>
      </label>
      {url.trim()&&<div className="tlc-analyzer-source">
        <span>{normalized?'Public video link recognized':'Check the link: unsupported or invalid URL'}</span>
        {normalized&&<a href={normalized} target="_blank" rel="noopener noreferrer">Open original <ExternalLink size={14}/></a>}
        {playable&&<button type="button" onClick={()=>setShowPlayer(v=>!v)}>{showPlayer?'Hide player':'Watch source here'}</button>}
      </div>}
      {showPlayer&&playable&&<div className="tlc-analyzer-embed"><EmbeddedMedia url={playable.url} title={title||'Social video'}/></div>}
      <div className="tlc-analyzer-pair">
        <label><span>Video title <small>(optional)</small></span><input maxLength={140} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Press-to-handstand tutorial"/></label>
        <label><span>Skill to evaluate</span><input maxLength={110} value={exercise} onChange={e=>setExercise(e.target.value)} placeholder="Planche, grip, handstand…"/></label>
      </div>
      <label className="tlc-analyzer-upload">
        <span><UploadCloud size={19}/> Select a local video <small>MP4, WebM or MOV · up to 150 MB</small></span>
        <input type="file" accept="video/mp4,video/webm,video/x-m4v,video/quicktime,.mp4,.webm,.m4v,.mov" onChange={e=>{setError('');setFile(e.target.files?.[0]||null);}}/>
      </label>
      {file&&<div className="tlc-analyzer-local">
        <div className="tlc-analyzer-file"><FileVideo2 size={17}/><span>{file.name}<small>{(file.size/1024/1024).toFixed(1)} MB · local only</small></span></div>
        {preview&&<video controls playsInline preload="metadata" src={preview} aria-label="Local selected video preview"/>}
        <button type="button" className="tlc-analyzer-sample" onClick={()=>void capture()} disabled={Boolean(busy)}>{busy==='sampling'?<Loader2 size={16} className="animate-spin"/>:<Film size={16}/>} {busy==='sampling'?'Sampling video…':'Extract 3 frames for AI'}</button>
        {frames.length>0&&<div className="tlc-analyzer-frames" aria-label="Extracted video frames">{frames.map((src,i)=><img key={i} src={src} alt={`Locally sampled video frame ${i+1} of ${frames.length}`}/>)}</div>}
        <p className="tlc-analyzer-small">Only these still frames—not your complete video file—are sent to AI when you choose Analyze.</p>
      </div>}
      <label><span><Clipboard size={15}/> Caption, transcript or your own observations <small>(optional with frames)</small></span>
        <textarea rows={4} maxLength={3500} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Paste the creator's instructions, spoken transcript, or your own notes. A URL by itself does not let AI watch the clip."/>
        <small>{notes.length}/3,500 characters</small>
      </label>
      <div className="tlc-analyzer-actions">
        <button className="tlc-analyzer-run" type="submit" disabled={!canAnalyze}>{busy==='analyzing'?<Loader2 className="animate-spin" size={18}/>:<BrainCircuit size={18}/>} {busy==='analyzing'?'Analyzing evidence…':'Analyze technique'}</button>
        <button type="button" onClick={()=>{setFile(null);setFrames([]);setReport(null);setError('');setNotes('');}}><RefreshCcw size={15}/> Reset</button>
      </div>
      {configured===false&&<p className="tlc-analyzer-warning"><LockKeyhole size={15}/> The analyzer interface and local frame capture are available. The AI provider still needs to be connected to this Vercel app before analysis can run.</p>}
      {!user&&<p className="tlc-analyzer-warning"><LockKeyhole size={15}/> AI results require an account. <Link to="/admin-login">Sign in</Link> to use the existing protected AI service.</p>}
      {error&&<p role="alert" className="tlc-analyzer-error">{error}</p>}
      <p className="tlc-analyzer-fine">Evidence policy: public social links are not scraped or downloaded. Frame analysis sees a few stills; caption analysis sees only text. Neither is a complete biomechanical assessment.</p>
    </form>
    {report&&<section className="tlc-analyzer-report" aria-label="AI video analysis result">
      <header><div><p className="tlc-analyzer-eyebrow"><Check size={15}/> AI REPORT / {report.sourceBasis.replaceAll('-',' ').toUpperCase()}</p><h3>{report.skill||'Technique assessment'}</h3></div><span className="tlc-analyzer-confidence">Confidence: {report.confidence}</span></header>
      <p className="tlc-analyzer-summary">{report.summary}</p>
      <div className="tlc-analyzer-section-grid">{sections.filter(s=>s.data.length>0).map(({title,data,icon:Icon})=><section key={title}><h4><Icon size={16}/>{title}</h4><ul>{data.map((item,i)=><li key={i}>{item}</li>)}</ul></section>)}</div>
      <p className="tlc-analyzer-limits"><ShieldAlert size={16}/>{report.evidenceLimits}</p>
      <div className="tlc-analyzer-report-actions"><button type="button" onClick={save}><Save size={16}/>Save report</button><button type="button" onClick={()=>void navigator.clipboard.writeText(reportText(report)).then(()=>toast.success('Report copied')).catch(()=>toast.error('Copy unavailable'))}><Clipboard size={16}/>Copy report</button></div>
    </section>}
    {history.length>0&&<details open={viewSaved} onToggle={e=>setViewSaved(e.currentTarget.open)} className="tlc-analyzer-history"><summary>My saved analyses · {history.length} <ChevronDown size={15}/></summary><div>{history.map(r=><button type="button" key={r.at} onClick={()=>setReport(r)}><strong>{r.skill||'Technique review'}</strong><small>{new Date(r.at).toLocaleDateString()} · {r.sourceBasis.replaceAll('-',' ')} · {r.confidence} confidence</small></button>)}</div></details>}
  </section>;
}
