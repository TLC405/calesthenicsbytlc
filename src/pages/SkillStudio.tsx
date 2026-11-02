import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, GitBranch, Play, RotateCcw, Save, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { VideoPlayer } from '@/components/Exercise/VideoPlayer';
import { SKILL_PATHS, getSkillPath } from '@/data/skillPaths';
import { useAuth } from '@/providers/AuthProvider';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import {
  deviceSkillProgress, exerciseBySlug, nodeDose, nodeProgress, readTrainingProfile,
  recommendedNode, regressionFor, relatedNodes, saveAttempt, trainingBlockers, writeTrainingProfile,
  type SkillAttempt, type SkillTrainingProfile, type TrainingEquipment,
} from '@/lib/skillGraph';

const equipmentOptions:TrainingEquipment[]=['floor','wall','rings','bar','parallettes','bands'];
const research:Record<string,string>={planche:'https://gmb.io/planche/',handstand:'https://gmb.io/handstand/','straddle-press':'https://gmb.io/press-handstand/',rings:'https://gmb.io/muscle-up/','ring-muscle-up':'https://gmb.io/muscle-up/'};
export default function SkillStudio() {
  const {skillId}=useParams<{skillId:string}>();
  const path=getSkillPath(skillId);
  const {user}=useAuth(); const owner=user?.id||'guest';
  const navigate=useNavigate(); const mobile=useIsMobile();
  const session=useRef(crypto.randomUUID());
  const [attempts,setAttempts]=useState<SkillAttempt[]>(()=>deviceSkillProgress.read(owner));
  const [profile,setProfile]=useState<SkillTrainingProfile>(readTrainingProfile);
  const [selected,setSelected]=useState(path?.slugs[0]||'');
  const [detailOpen,setDetailOpen]=useState(false);
  const [comfortable,setComfortable]=useState(false);
  const [value,setValue]=useState(''); const [quality,setQuality]=useState(0);
  const [lean,setLean]=useState(''); const [band,setBand]=useState('');
  const [negative,setNegative]=useState(''); const [clearance,setClearance]=useState('');
  const [assistance,setAssistance]=useState<SkillAttempt['assistance']>('none');
  const [rom,setRom]=useState<SkillAttempt['rom']>('full');
  const [discomfort,setDiscomfort]=useState('');
  useEffect(()=>{
    const sync=()=>setAttempts(deviceSkillProgress.read(owner));sync();
    window.addEventListener('power-skill-progress',sync);
    return()=>window.removeEventListener('power-skill-progress',sync);
  },[owner]);
  useEffect(()=>{setSelected(path?.slugs[0]||'');setComfortable(false);setDetailOpen(false);},[path?.id]);
  useEffect(()=>{setValue('');setQuality(0);setComfortable(false);setDiscomfort('');setLean('');setBand('');setNegative('');setClearance('');},[selected]);
  if(!path)return <main className="p-6"><h1>Choose a skill studio</h1><Link to="/library">Return to library</Link></main>;
  const exercise=exerciseBySlug.get(selected);
  const dose=nodeDose(selected); const progress=nodeProgress(selected,attempts);
  const recommendation=recommendedNode(path.id,attempts);
  const recommended=exerciseBySlug.get(recommendation||'');
  const blockers=trainingBlockers(selected,profile,comfortable&&!discomfort);
  const incoming=relatedNodes(selected);
  const regression=regressionFor(selected);
  const recent=progress.logs.slice(-4).reverse();
  const consistent=path.slugs.filter(s=>nodeProgress(s,attempts).consistent).length;
  function choose(slug:string){setSelected(slug);setDetailOpen(true);}
  function updateProfile(next:SkillTrainingProfile){setProfile(next);writeTrainingProfile(next);}
  function record() {
    const actual=Number(value);
    if(!exercise||!value||!Number.isFinite(actual)||actual<0||!quality){toast.error('Enter your actual result and technique quality.');return;}
    const optional=(v:string)=>v!==''&&Number.isFinite(Number(v))?Math.max(0,Number(v)):undefined;
    saveAttempt(owner,{id:crypto.randomUUID(),nodeId:selected,sessionId:session.current,at:new Date().toISOString(),metric:dose.metric,value:actual,target:dose.target,quality,
      leanCm:optional(lean),assistanceKg:optional(band),negativeSeconds:optional(negative),clearanceCm:optional(clearance),assistance,rom,discomfort:discomfort||undefined});
    toast.success('Attempt saved on this device.');setValue('');setQuality(0);
  }
  function train(){
    if(blockers.length){toast.info(blockers[0]);return;}
    navigate(`/build?skill=${path!.id}&node=${encodeURIComponent(selected)}`);
  }
  const detail=exercise&&<div className="space-y-4">
    <div className="flex items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-widest text-primary">{progress.state} · {dose.metric}</p><h2 className="font-display text-2xl font-bold mt-1">{exercise.name}</h2></div><GitBranch className="text-primary h-6 w-6 shrink-0"/></div>
    <VideoPlayer key={selected} youtubeUrl={exercise.youtube_url} title={exercise.name} thumbnailMode />
    <p className="text-xs text-muted-foreground">{exercise.youtube_url?'Tutorial link available · movement verification pending':'No tutorial mapped. Use the documented cues; no substitute video is marked verified.'}</p>
    <div className="grid grid-cols-3 gap-2 text-center text-xs"><div className="rounded-xl border p-3"><strong className="block text-lg">{progress.logs.length}</strong>Attempts</div><div className="rounded-xl border p-3"><strong className="block text-lg">{progress.sessions}</strong>Quality sessions</div><div className="rounded-xl border p-3"><strong className="block text-lg">{progress.logs.length?Math.round(progress.confidence*100)+'%':'—'}</strong>Consistency estimate</div></div>
    <p className="text-[11px] text-muted-foreground">Based on your logs. Consistency needs repeated quality attempts across separate sessions; this is not a coach assessment.</p>
    <section className="rounded-xl border p-3 space-y-2"><h3 className="font-bold text-sm">What supports this movement?</h3>
      {incoming.length?incoming.map((edge,i)=>{const slug=edge.to===selected?edge.from:edge.to;const e=exerciseBySlug.get(slug);return e&&<button key={i} className="w-full min-h-12 flex items-center justify-between gap-2 text-left text-xs border-b last:border-0" onClick={()=>choose(slug)}><span>{e.name}<small className="block text-muted-foreground mt-1">{edge.type.replace(/_/g,' ')} · {nodeProgress(slug,attempts).state}</small></span><ArrowRight className="h-4 w-4 shrink-0 text-primary"/></button>;}):<p className="text-xs text-muted-foreground">Start with a variation you can control.</p>}
    </section>
    <section className="rounded-xl border p-3 space-y-3"><h3 className="font-bold text-sm">Training check</h3><div className="flex flex-wrap gap-2">{equipmentOptions.map(option=><button key={option} aria-pressed={profile.equipment.includes(option)} className={`min-h-12 rounded-xl border px-3 text-xs capitalize ${profile.equipment.includes(option)?'border-primary bg-primary/10 text-primary':''}`} onClick={()=>updateProfile({...profile,equipment:profile.equipment.includes(option)?profile.equipment.filter(e=>e!==option):[...profile.equipment,option]})}>{option}</button>)}</div>
      <label className="flex gap-3 items-center min-h-12 text-xs"><input type="checkbox" checked={profile.safeExit} onChange={e=>updateProfile({...profile,safeExit:e.target.checked})} className="h-5 w-5 accent-[hsl(var(--primary))]"/>I can safely enter and exit inversions.</label>
      <label className="flex gap-3 items-center min-h-12 text-xs"><input type="checkbox" checked={comfortable} onChange={e=>setComfortable(e.target.checked)} className="h-5 w-5 accent-[hsl(var(--primary))]"/>This variation is comfortable today, with no joint pain.</label>
      {blockers.map(reason=><p key={reason} className="text-xs text-muted-foreground">• {reason}</p>)}
    </section>
    <div className="grid grid-cols-2 gap-2"><Button className="h-12" disabled={blockers.length>0} onClick={train}><Play className="mr-2 h-4 w-4"/>Train this</Button><Button className="h-12" variant="outline" disabled={!regression} onClick={()=>regression&&choose(regression)}><RotateCcw className="mr-2 h-4 w-4"/>Use regression</Button></div>
    <p className="text-xs text-muted-foreground">Suggested starting dose: {dose.sets} × {dose.target} {dose.metric}; {dose.restSeconds}s rest. Adjust to your capacity. {dose.stopRule}</p>
    <details className="rounded-xl border p-3"><summary className="min-h-8 font-bold text-sm cursor-pointer">Log an attempt · seconds, leverage and quality</summary><div className="space-y-3 mt-3">
      <label className="block text-xs">Actual {dose.metric}<Input className="mt-1 h-12" type="number" min="0" max="999" value={value} onChange={e=>setValue(e.target.value)} /></label>
      <fieldset><legend className="text-xs mb-2">Technique quality · 1 lost control / 5 controlled</legend><div className="flex gap-2">{[1,2,3,4,5].map(n=><button key={n} aria-pressed={quality===n} className={`h-12 flex-1 rounded-lg border ${quality===n?'bg-primary text-primary-foreground':''}`} onClick={()=>setQuality(n)}>{n}</button>)}</div></fieldset>
      <div className="grid grid-cols-2 gap-3">{[{label:'Lean distance (cm)',value:lean,set:setLean},{label:'Band assistance (kg)',value:band,set:setBand},{label:'Negative duration (s)',value:negative,set:setNegative},{label:'Foot clearance (cm)',value:clearance,set:setClearance}].map(field=><label className="text-xs" key={field.label}>{field.label}<Input className="mt-1 h-12" type="number" min="0" max="999" placeholder="Optional" value={field.value} onChange={e=>field.set(e.target.value)}/></label>)}</div>
      <div className="grid grid-cols-2 gap-3"><label className="text-xs">Assistance<select className="block w-full h-12 rounded-lg border bg-card px-2 mt-1" value={assistance} onChange={e=>setAssistance(e.target.value as SkillAttempt['assistance'])}>{['none','feet','wall','band'].map(x=><option key={x}>{x}</option>)}</select></label><label className="text-xs">Range<select className="block w-full h-12 rounded-lg border bg-card px-2 mt-1" value={rom} onChange={e=>setRom(e.target.value as SkillAttempt['rom'])}><option>full</option><option>partial</option></select></label></div>
      <label className="block text-xs">Discomfort / load note (optional)<Input className="h-12 mt-1" maxLength={200} value={discomfort} placeholder="Area and what you noticed" onChange={e=>setDiscomfort(e.target.value)}/></label>
      <Button className="h-12 w-full" disabled={!value||quality===0} onClick={record}><Save className="mr-2 h-4 w-4"/>Save actual attempt</Button>
    </div></details>
    {recent.length>0&&<section><h3 className="text-sm font-bold mb-2">Recent attempts</h3>{recent.map(log=><p className="text-xs py-2 border-b" key={log.id}>{new Date(log.at).toLocaleDateString()} · {log.value} {log.metric} · quality {log.quality}/5{log.discomfort?' · discomfort noted':''}</p>)}</section>}
    {research[path.id]&&<a className="text-xs text-primary underline" href={research[path.id]} target="_blank" rel="noreferrer">Coaching source · GMB tutorial</a>}
  </div>;
  return <main className="power-skill-studio min-h-screen pb-32"><div className="mx-auto max-w-6xl px-4 py-5 space-y-5">
    <header className="flex items-center justify-between"><Link className="inline-flex items-center gap-2 min-h-12 text-sm" to="/skills"><ArrowLeft className="h-4 w-4"/>All skills</Link><Link className="text-xs text-primary min-h-12 inline-flex items-center" to="/build">Build a workout</Link></header>
    <section className="power-elevated p-5 sm:p-7"><p className="text-primary text-xs uppercase tracking-widest">POWER / Skill navigation</p><h1 className="font-display text-3xl sm:text-4xl font-bold mt-2">{path.title}</h1><p className="mt-3 text-sm text-muted-foreground">{path.focus}</p><p className="mt-3 text-xs text-muted-foreground">{consistent} consistent / {path.slugs.length} movements · Progress saved on this device for {user?'your account':'guest training'}.</p></section>

    <section className="rounded-xl border border-primary/40 bg-primary/5 p-4 flex flex-wrap justify-between items-center gap-3"><div><p className="text-xs text-primary uppercase tracking-wider">Practice next</p><h2 className="font-bold mt-1">{recommended?.name||path.title}</h2><p className="text-xs text-muted-foreground mt-1">Based on recorded prerequisites. Unlogged movements remain unassessed.</p></div><Button className="min-h-12" onClick={()=>recommendation&&choose(recommendation)}>See why <ArrowRight className="h-4 w-4 ml-2"/></Button></section>
    <div className="power-studio-grid"><section aria-label="Skill progression" className="space-y-3"><h2 className="font-bold text-lg">Your path and connections</h2>{path.slugs.map((slug,index)=>{const e=exerciseBySlug.get(slug);const status=nodeProgress(slug,attempts);return e&&<button key={slug} onClick={()=>choose(slug)} aria-pressed={slug===selected} className={`power-studio-node w-full p-4 min-h-24 flex items-center gap-4 rounded-xl border text-left ${slug===selected?'border-primary bg-primary/5':'bg-card'}`}><span className="h-10 w-10 rounded-full border border-primary/40 text-primary grid place-items-center shrink-0">{status.consistent?<Check className="h-5 w-5"/>:String(index+1).padStart(2,'0')}</span><span className="min-w-0 flex-1"><strong className="block text-sm">{e.name}</strong><small className="block text-muted-foreground mt-1">{status.state} · {status.logs.length} attempts · {relatedNodes(slug).length} connections</small></span><ArrowRight className="w-4 h-4 shrink-0 text-primary"/></button>;})}<p className="text-xs leading-relaxed text-muted-foreground">{path.safety} These paths are guidance, not universal medical or coaching clearance.</p></section>{!mobile&&<aside className="power-elevated power-studio-detail p-5">{detail}</aside>}</div>
    {mobile&&<Sheet open={detailOpen} onOpenChange={setDetailOpen}><SheetContent side="bottom" className="h-[88dvh] overflow-y-auto rounded-t-2xl px-4 pt-14 pb-12"><SheetTitle className="sr-only">{exercise?.name||path.title} movement details</SheetTitle><SheetDescription className="sr-only">Technique, dependencies, training checks and actual performance logs.</SheetDescription>{detail}</SheetContent></Sheet>}
  </div></main>;
}
