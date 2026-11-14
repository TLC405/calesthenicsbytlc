import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
 ArrowRight, BookOpen, BrainCircuit, Check, ClipboardCopy, Download, ExternalLink,
 Film, FlaskConical, Info, Link2, Loader2, MessageSquare, RefreshCcw, Search,
 ShieldCheck, Sparkles, Target, Video,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';
import { readSkillChecks } from '@/lib/skillCheck';
import { deviceSkillProgress, exerciseBySlug, readTrainingProfile } from '@/lib/skillGraph';
import { getSkillPath } from '@/data/skillPaths';

type Study = {id:string;title:string;authors:string;year:string;journal:string;pmid:string;doi:string;isOpenAccess:boolean;url:string};
type StudyResult = {query:string;retrievedAt:string;articles:Study[];count:number;source:string};
type SearchMode='relevance'|'recent';

const focusOptions=[
 {id:'planche',title:'Planche & straight-arm strength',query:'planche shoulder strength gymnastics'},
 {id:'handstand',title:'Handstands & presses',query:'handstand balance motor learning gymnastics'},
 {id:'grip',title:'Grip & hanging strength',query:'handgrip strength resistance training'},
 {id:'flag',title:'Human flag & anti-rotation',query:'trunk lateral flexion strength calisthenics'},
 {id:'mobility',title:'Mobility & flexibility',query:'flexibility resistance training systematic review'},
 {id:'nordic',title:'Nordic hamstring strength',query:'Nordic hamstring exercise eccentric strength'}
];
const recommendations=[
 {title:'TLCtv analyzer',subtitle:'Inspect frames or captions from exercise videos',to:'/tlctv/analyzer',icon:Film,tag:'IN APP'},
 {title:'AI workout coach',subtitle:'Catalog-grounded exercise suggestions when AI is configured',to:'/ai-lab',icon:BrainCircuit,tag:'CONNECTION NEEDED'},
 {title:'Skills assessment',subtitle:'Collect measurable baselines and progression checks',to:'/assessment',icon:Target,tag:'READY'},
 {title:'My workout plan',subtitle:'Review your training framework and adjust selections',to:'/program',icon:Video,tag:'READY'},
];
function makeBrief(owner:string,focus:string,includeRecords:boolean,study:Study|null){
 const option=focusOptions.find(x=>x.id===focus)||focusOptions[0];
 const profile=readTrainingProfile();
 const checks=Object.values(readSkillChecks(owner)).sort((a,b)=>b.at.localeCompare(a.at));
 const recent=deviceSkillProgress.read(owner).slice(-10).reverse();
 const lines=[
  "You are helping me use TLC's Super Human Strength, my skill-based calisthenics training app.",
  'Goal: '+option.title+'.',
  'Give evidence-informed explanations with a practical but optional progression recommendation.',
  'Keep the experience free of gamification, auto-generated workouts, and made-up performance data.',
  'Separate strong research evidence from coaching judgement. Do not treat one self-report as proof of mastery.',
  'Respect discomfort, safe exits, equipment restrictions, and real movement readiness.',
  'Do not invent any viewing of online videos or my ChatGPT conversation history.',
  'I will decide what to add to my workouts.',
 ];
 if(includeRecords){
  lines.push('TRAINING CONTEXT (self-reported, saved on this device):');
  lines.push('Working tier: L'+profile.tier+'; equipment: '+(profile.equipment.join(', ')||'not recorded')+'; safe inversion exit: '+(profile.safeExit?'reported yes':'not confirmed')+'.');
  if(checks.length){
   lines.push('Recent skill checks:');
   for(const c of checks.slice(0,12)){
    const path=getSkillPath(c.pathId);
    const movement=c.slug?exerciseBySlug.get(c.slug)?.name||c.slug:'not tested';
    lines.push('- '+(path?.title||c.pathId)+': '+movement+
      (c.slug?' · '+(c.value===null?'unmeasured':c.value+' '+c.metric)+', form '+c.quality+'/5, assistance '+c.assistance+', comfortable '+(c.comfortable?'yes':'no'):'')+
      ' · '+c.at.slice(0,10));
   }
  }else lines.push('No skill checks are saved yet.');
  if(recent.length){
   lines.push('Recent attempts (user logs, not independently verified):');
   for(const a of recent.slice(0,7))lines.push('- '+(exerciseBySlug.get(a.nodeId)?.name||a.nodeId)+': '+a.value+' '+a.metric+', quality '+a.quality+'/5 at '+a.at.slice(0,10));
  }
 }else lines.push('I have not shared my personal skill logs. Ask for specific baselines instead of guessing.');
 if(study){
  lines.push('ONE RESEARCH RECORD I CHOSE (bibliographic data only, not proof of conclusions):');
  lines.push(study.title+' ('+study.year+'), '+study.journal+', '+study.authors+'. '+study.url);
  lines.push('Do not claim to have read its full text or verified its findings without access.');
 }
 lines.push('Answer in this format: 1) What matters physiologically, 2) What I should measure, 3) Two optional next-step suggestions, 4) Evidence limits. Ask at most one focused follow-up question.');
 return lines.join('\n');
}
function download(name:string,body:string,type:string){
 const blob=new Blob([body],{type});const href=URL.createObjectURL(blob);
 const anchor=document.createElement('a');anchor.href=href;anchor.download=name;document.body.appendChild(anchor);anchor.click();anchor.remove();
 window.setTimeout(()=>URL.revokeObjectURL(href),2500);
}
export default function Integrations(){
 const {user}=useAuth();const owner=user?.id||'guest';
 const [focus,setFocus]=useState('planche');
 const [includeRecords,setIncludeRecords]=useState(false);
 const [recordVersion,setRecordVersion]=useState(0);
 const [selectedStudy,setSelectedStudy]=useState<Study|null>(null);
 const [query,setQuery]=useState('planche shoulder strength gymnastics');
 const [sort,setSort]=useState<SearchMode>('recent');
 const [studies,setStudies]=useState<StudyResult|null>(null);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [coachConnected,setCoachConnected]=useState<boolean|null>(null);
 useEffect(()=>{
  const update=()=>setRecordVersion(n=>n+1);
  for(const n of ['power-skill-check','power-skill-progress','power-training-profile'])window.addEventListener(n,update);
  return()=>{for(const n of ['power-skill-check','power-skill-progress','power-training-profile'])window.removeEventListener(n,update);};
 },[]);
 useEffect(()=>{
  let active=true;
  fetch('/api/discover-exercises',{cache:'no-store'}).then(r=>r.json()).then(data=>{if(active)setCoachConnected(data.configured===true);}).catch(()=>{if(active)setCoachConnected(false);});
  return()=>{active=false;};
 },[]);
 const checks=useMemo(()=>Object.keys(readSkillChecks(owner)).length,[owner,recordVersion]);
 const logs=useMemo(()=>deviceSkillProgress.read(owner).length,[owner,recordVersion]);
 const brief=useMemo(()=>makeBrief(owner,focus,includeRecords,selectedStudy),[owner,focus,includeRecords,selectedStudy,recordVersion]);
 async function copy(){
  try{await navigator.clipboard.writeText(brief);toast.success('Brief copied. Open ChatGPT and paste to continue.');}
  catch{toast.error('Copy was unavailable. Select the text below and copy manually.');}
 }
 async function share(){
  if(!navigator.share){await copy();return;}
  try{await navigator.share({title:'TLC Super Human Strength · ChatGPT brief',text:brief});}
  catch(e){if(!(e instanceof DOMException&&e.name==='AbortError'))toast.error('Share failed. Try Copy brief.');}
 }
 function chooseFocus(id:string){
  const option=focusOptions.find(x=>x.id===id);if(!option)return;
  setFocus(id);setQuery(option.query);setSelectedStudy(null);
 }
 async function search(event?:FormEvent){
  event?.preventDefault();if(busy)return;
  setBusy(true);setError('');setStudies(null);
  try{
   const response=await fetch('/api/research?q='+encodeURIComponent(query.trim())+'&sort='+sort,{cache:'no-store',signal:AbortSignal.timeout(17000)});
   const data=await response.json();
   if(!response.ok)throw Error(data.error||'Research service is not available.');
   setStudies(data as StudyResult);
  }catch(e){setError(e instanceof Error?e.message:'The research search could not complete.');}
  finally{setBusy(false);}
 }
 function exportSnapshot(){
  const rows=Object.values(readSkillChecks(owner));
  const attempts=deviceSkillProgress.read(owner);
  const payload={
   application:"TLC's Super Human Strength",exportedAt:new Date().toISOString(),
   explanation:'Self-reported records from this browser only; not a medical assessment or verified skill certification.',
   profile:readTrainingProfile(),skillChecks:rows,attempts
  };
  try{download('tlc-strength-personal-records.json',JSON.stringify(payload,null,2),'application/json');toast.success('Your skill data was exported locally.');}
  catch{toast.error('Export was unavailable on this device.');}
 }
 return <main className="tlc-integrations-page power-simple-page">
  <header className="tlc-integration-hero">
   <div className="tlc-integration-logo"><img src="/icons/tlc-doodle-180.png" width={56} height={56} alt="TLC mark"/></div>
   <p className="tlc-integration-kicker">TLC'S SUPER HUMAN STRENGTH / AI & CONNECTIONS</p>
   <h1>Your AI & Integrations Studio</h1>
   <p>Use your own ChatGPT account alongside real skill records, published exercise science, and the tools already in TLCtv.</p>
   <div className="tlc-integration-stats">
    <span><ShieldCheck size={15}/> Guest-safe local tools</span>
    <span><Target size={15}/>{checks} skill checks</span>
    <span><BookOpen size={15}/>{logs} exercise attempts</span>
   </div>
  </header>
  <section className="tlc-integration-grid">
   <article className="tlc-integration-panel tlc-integration-chatgpt">
    <div className="tlc-integration-titleline"><span className="tlc-integration-symbol"><MessageSquare size={21}/></span><div><p className="tlc-integration-kicker">01 / PERSONAL ASSISTANT</p><h2>Bring your ChatGPT.</h2></div></div>
    <p className="tlc-integration-copy">Take your live training context into the ChatGPT account you already use. You choose whether personal skill records are included; nothing is silently sent.</p>
    <div className="tlc-connection-state"><Info size={17}/><span>ChatGPT handoff is ready. Automatic account sign-in and ChatGPT plan billing are <strong>not connected</strong> to this hosted site.</span></div>
    <label className="tlc-integration-field">What should ChatGPT help with?
     <select value={focus} onChange={e=>chooseFocus(e.target.value)}>
      {focusOptions.map(x=><option key={x.id} value={x.id}>{x.title}</option>)}
     </select>
    </label>
    <label className="tlc-integration-check">
     <input type="checkbox" checked={includeRecords} onChange={e=>setIncludeRecords(e.target.checked)}/>
     <span><strong>Include my saved skill checks and training logs</strong><small>Off by default · stays local until you explicitly copy or share</small></span>
    </label>
    <details className="tlc-brief-preview"><summary>Preview exactly what will be shared</summary><textarea readOnly value={brief} aria-label="ChatGPT coaching brief" rows={10}/></details>
    <div className="tlc-integration-buttons">
     <button type="button" className="is-primary" onClick={()=>void copy()}><ClipboardCopy size={17}/> Copy coaching brief</button>
     <a href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer"><ExternalLink size={16}/> Open my ChatGPT</a>
     <button type="button" onClick={()=>void share()}><ArrowRight size={17}/> Android share</button>
    </div>
    <p className="tlc-integration-help">Open ChatGPT and paste the copied brief. ChatGPT conversations and memories are not imported into the app automatically.</p>
    <a className="tlc-integration-documentation" href="https://developers.openai.com/siwc/quickstart" target="_blank" rel="noopener noreferrer">About native ChatGPT account connection <ExternalLink size={13}/></a>
   </article>
   <article className="tlc-integration-panel tlc-integration-science">
    <div className="tlc-integration-titleline"><span className="tlc-integration-symbol"><FlaskConical size={21}/></span><div><p className="tlc-integration-kicker">02 / LIVE RESEARCH CONNECTOR</p><h2>Exercise Science.</h2></div></div>
    <p className="tlc-integration-copy">Search real published research indexed by Europe PMC. Records open at their source. A publication title is not proof of a training outcome.</p>
    <div className="tlc-integration-pill"><Check size={14}/> Public research API · no account needed</div>
    <div className="tlc-integration-topics">
     {focusOptions.map(x=><button key={x.id} type="button" aria-pressed={focus===x.id} onClick={()=>chooseFocus(x.id)}>{x.title.split(' & ')[0]}</button>)}
    </div>
    <form className="tlc-research-form" onSubmit={e=>void search(e)}>
     <label>Research question<input value={query} onChange={e=>setQuery(e.target.value)} maxLength={140} placeholder="Grip strength eccentric training"/></label>
     <div className="tlc-research-actions"><label>Order<select value={sort} onChange={e=>setSort(e.target.value as SearchMode)}><option value="recent">Newest</option><option value="relevance">Most relevant</option></select></label>
      <button type="submit" disabled={busy||query.trim().length<3}>{busy?<Loader2 size={16} className="animate-spin"/>:<Search size={16}/>} Search papers</button>
     </div>
    </form>
    {error&&<p className="tlc-research-error" role="alert">{error}</p>}
    {studies&&<div className="tlc-research-results">
      <header><strong>{studies.articles.length} papers shown</strong><small>Europe PMC · {new Date(studies.retrievedAt).toLocaleDateString()}</small></header>
      {studies.articles.length===0&&<p>No matching records were returned. Try broader terms.</p>}
      {studies.articles.map(study=><article key={study.id}>
       <div className="tlc-research-meta"><span>{study.year||'Year unknown'}</span><span>{study.journal||'Research index'}</span>{study.isOpenAccess&&<span>Open access</span>}</div>
       <h3>{study.title}</h3><p>{study.authors}</p>
       <div className="tlc-research-links">
        <a href={study.url} target="_blank" rel="noopener noreferrer">Read source <ExternalLink size={14}/></a>
        <button type="button" onClick={()=>setSelectedStudy(study)} disabled={selectedStudy?.id===study.id}><Check size={14}/>{selectedStudy?.id===study.id?'Added to brief':'Add to ChatGPT brief'}</button>
       </div>
      </article>)}
     </div>}
    <p className="tlc-integration-help">Results are bibliographic records, not AI-generated study summaries. Read the methods before applying a finding to training.</p>
   </article>
  </section>
  <section className="tlc-integration-tools">
    <div className="tlc-integration-tools-head"><div><p className="tlc-integration-kicker">03 / YOUR TOOLS</p><h2>Connected to your training workflow</h2></div><button type="button" onClick={()=>{setRecordVersion(n=>n+1);toast.success('Local training counts refreshed.');}}><RefreshCcw size={15}/> Refresh</button></div>
    <div className="tlc-integration-toolgrid">{recommendations.map(({title,subtitle,to,icon:Icon,tag})=><Link to={to} key={to} className="tlc-integration-tool">
      <span className="tlc-integration-tool-icon"><Icon size={22}/></span><span><small>{to==='/ai-lab'&&coachConnected===true?'AI SERVICE AVAILABLE':tag}</small><strong>{title}</strong><span>{subtitle}</span></span><ArrowRight size={19}/>
    </Link>)}</div>
    <div className="tlc-integration-export"><div><Download size={21}/><span><strong>Export my training records</strong><small>Download a JSON backup of saved skill checks and exercise attempts from this device</small></span></div><button onClick={exportSnapshot} type="button"><Download size={16}/> Export</button></div>
  </section>
  <footer className="tlc-integration-footer">
   <ShieldCheck size={18}/><p><strong>Privacy-first.</strong> TLC only includes personal training data in the ChatGPT briefing when you turn on sharing and take an explicit action. Research searches use your search terms, not your saved workout history. No external plugin receives account access without its own authorization.</p>
  </footer>
 </main>;
}
