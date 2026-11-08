import { VideoPlayer } from '@/components/Exercise/VideoPlayer';
import { getYouTubeId } from '@/lib/youtube';
import { MovementOverview } from '@/components/Exercise/MovementOverview';
import { MovementThumbnail } from '@/components/Exercise/MovementThumbnail';
import { MovementVideo } from '@/components/Exercise/MovementVideo';
import { MovementConnections } from '@/components/Progression/MovementConnections';
import { readProgressionGoal, writeProgressionGoal, writeProgressionFocus } from '@/lib/progressionFocus';
import { PROGRESSION_SOURCES } from '@/data/progressionSources';
import { tutorialState } from '@/lib/mediaAudit';
import { TrainingLevelControls } from '@/components/Progression/TrainingLevelControls';
import { FoundationProgram } from '@/components/Progression/FoundationProgram';
import { minimumTier, readinessReasons } from '@/lib/trainingPolicy';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, GitBranch, Play, RotateCcw, Save, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { SKILL_PATHS, getSkillPath } from '@/data/skillPaths';
import { useAuth } from '@/providers/AuthProvider';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import {
  deviceSkillProgress, exerciseBySlug, nodeDose, nodeProgress, readTrainingProfile,
  recommendedNode, regressionFor, relatedNodes, saveAttempt, trainingBlockers, writeTrainingProfile,
  type SkillAttempt, type SkillTrainingProfile,
} from '@/lib/skillGraph';

const familyLessons:Record<string,{url:string;title:string}[]>={planche:[{url:'https://www.youtube.com/watch?v=6snDOgFBBFA',title:'GMB · Planche tutorial'}],handstand:[{url:'https://www.youtube.com/watch?v=d6_lcWtQDxw',title:'GMB · Handstand tutorial'}],'straddle-press':[{url:'https://www.youtube.com/watch?v=SfLaCKaljU4',title:'GMB · Press-to-handstand tutorial'}],rings:[{url:'https://www.youtube.com/watch?v=fsl08Copg-U',title:'GMB · Ring training'}],'ring-muscle-up':[{url:'https://www.youtube.com/watch?v=asnC95pkVjw',title:'GMB · Ring muscle-up'}]};
function studioLessons(pathId:string){const all=[...PROGRESSION_SOURCES.filter(source=>source.paths.includes(pathId)&&getYouTubeId(source.url)),...(familyLessons[pathId]||[])].filter(source=>!tutorialState(source.url).blocked);return [...new Map(all.map(source=>[source.url,source])).values()];}
export default function SkillStudio() {
  const {skillId}=useParams<{skillId:string}>();
  const path=getSkillPath(skillId);
  const {user}=useAuth(); const owner=user?.id||'guest';
  const navigate=useNavigate(); const mobile=useIsMobile(900);
  const session=useRef(crypto.randomUUID());
  const [attempts,setAttempts]=useState<SkillAttempt[]>(()=>deviceSkillProgress.read(owner));
  const [profile,setProfile]=useState<SkillTrainingProfile>(readTrainingProfile);
  const [selected,setSelected]=useState(path?.slugs[0]||'');
  const [detailOpen,setDetailOpen]=useState(false);
  const [showAll,setShowAll]=useState(false);
  const [goalSlug,setGoalSlug]=useState(()=>readProgressionGoal(owner,path?.id||''));
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
  useEffect(()=>{const sync=()=>setProfile(readTrainingProfile());window.addEventListener('power-training-profile',sync);return()=>window.removeEventListener('power-training-profile',sync);},[]);
  useEffect(()=>{setSelected(path?.slugs[0]||'');setComfortable(false);setDetailOpen(false);setShowAll(false);setGoalSlug(readProgressionGoal(owner,path?.id||''));},[path?.id,owner]);
  useEffect(()=>{setValue('');setQuality(0);setComfortable(false);setDiscomfort('');setLean('');setBand('');setNegative('');setClearance('');},[selected]);
  if(!path)return <main className="p-6"><h1>Choose a skill studio</h1><Link to="/library">Return to library</Link></main>;
  const exercise=exerciseBySlug.get(selected);
  const dose=nodeDose(selected); const progress=nodeProgress(selected,attempts);
  const recommendation=recommendedNode(path.id,attempts,profile,goalSlug);
  const recommended=exerciseBySlug.get(recommendation||'');
  const blockers=trainingBlockers(selected,profile,comfortable&&!discomfort);
  const incoming=relatedNodes(selected);
  const regression=regressionFor(selected);
  const recent=progress.logs.slice(-4).reverse();
  const consistent=path.slugs.filter(s=>nodeProgress(s,attempts).consistent).length;
  function practice(){if(!recommendation)return;writeProgressionFocus(owner,{pathId:path!.id,slug:recommendation});navigate(`/today?goal=${path!.id}&node=${encodeURIComponent(recommendation)}`);}
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
    navigate(`/today?goal=${path!.id}&node=${encodeURIComponent(selected)}`);
  }
  const detail=exercise&&<div className="space-y-4">
    <div className="flex items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-widest text-primary">{progress.state} · {dose.metric}</p><h2 className="font-display text-2xl font-bold mt-1">{exercise.name}</h2></div><MovementThumbnail exercise={exercise} className="is-small"/></div>
    <MovementOverview exercise={exercise}/><details className="power-learn-section"><summary>Watch tutorial</summary><MovementVideo key={selected} exercise={exercise}/></details><details className="power-learn-section"><summary>Easier options & next steps</summary><MovementConnections slug={selected} profile={profile} attempts={attempts} onChoose={choose}/></details>
    <details className="power-learn-section"><summary>Supporting drills</summary>
      {incoming.length?incoming.map((edge,i)=>{const slug=edge.to===selected?edge.from:edge.to;const e=exerciseBySlug.get(slug);return e&&<button key={i} className="power-related-movement w-full min-h-12 flex items-center justify-between gap-2 text-left text-xs border-b last:border-0" onClick={()=>choose(slug)}><MovementThumbnail exercise={e} className="is-small"/><span className="flex-1 min-w-0">{e.name}<small className="block text-muted-foreground mt-1">{edge.type.replace(/_/g,' ')} · {nodeProgress(slug,attempts).state}</small></span><ArrowRight className="h-4 w-4 shrink-0 text-primary"/></button>;}):<p className="text-xs text-muted-foreground">Start with a variation you can control.</p>}
    </details>
    <section className="rounded-xl border p-3 space-y-3"><h3 className="font-bold text-sm">Ready to practice?</h3>
      {/handstand|headstand|forearm-stand|elbow-stand|press-to-hs|hs-kick-up|stalder-negative|wall-toe-taps/.test(selected)&&<label className="flex gap-3 items-center min-h-12 text-xs"><input type="checkbox" checked={profile.safeExit} onChange={e=>updateProfile({...profile,safeExit:e.target.checked})} className="h-5 w-5 accent-[hsl(var(--primary))]"/>I can safely enter and exit this inversion.</label>}
      <label className="flex gap-3 items-center min-h-12 text-xs"><input type="checkbox" checked={comfortable} onChange={e=>setComfortable(e.target.checked)} className="h-5 w-5 accent-[hsl(var(--primary))]"/>This variation is comfortable today, with no joint pain.</label>
      {blockers.map(reason=><p key={reason} className="text-xs text-muted-foreground">• {reason}</p>)}
    </section>
    <div className="grid grid-cols-2 gap-2"><Button className="h-12" disabled={blockers.length>0} onClick={train}><Play className="mr-2 h-4 w-4"/>Train this</Button><Button className="h-12" variant="outline" disabled={!regression} onClick={()=>regression&&choose(regression)}><RotateCcw className="mr-2 h-4 w-4"/>Easier option</Button></div>
    <details className="rounded-xl border p-3"><summary className="min-h-8 font-bold text-sm cursor-pointer">Log an attempt · seconds, leverage and quality</summary><div className="space-y-3 mt-3">
      <label className="block text-xs">Actual {dose.metric}<Input className="mt-1 h-12" type="number" min="0" max="999" value={value} onChange={e=>setValue(e.target.value)} /></label>
      <fieldset><legend className="text-xs mb-2">Technique quality · 1 lost control / 5 controlled</legend><div className="flex gap-2">{[1,2,3,4,5].map(n=><button key={n} aria-pressed={quality===n} className={`h-12 flex-1 rounded-lg border ${quality===n?'bg-primary text-primary-foreground':''}`} onClick={()=>setQuality(n)}>{n}</button>)}</div></fieldset>
      <div className="grid grid-cols-2 gap-3">{[{label:'Lean distance (cm)',value:lean,set:setLean},{label:'Band assistance (kg)',value:band,set:setBand},{label:'Negative duration (s)',value:negative,set:setNegative},{label:'Foot clearance (cm)',value:clearance,set:setClearance}].map(field=><label className="text-xs" key={field.label}>{field.label}<Input className="mt-1 h-12" type="number" min="0" max="999" placeholder="Optional" value={field.value} onChange={e=>field.set(e.target.value)}/></label>)}</div>
      <div className="grid grid-cols-2 gap-3"><label className="text-xs">Assistance<select className="block w-full h-12 rounded-lg border bg-card px-2 mt-1" value={assistance} onChange={e=>setAssistance(e.target.value as SkillAttempt['assistance'])}>{['none','feet','wall','band'].map(x=><option key={x}>{x}</option>)}</select></label><label className="text-xs">Range<select className="block w-full h-12 rounded-lg border bg-card px-2 mt-1" value={rom} onChange={e=>setRom(e.target.value as SkillAttempt['rom'])}><option>full</option><option>partial</option></select></label></div>
      <label className="block text-xs">Discomfort / load note (optional)<Input className="h-12 mt-1" maxLength={200} value={discomfort} placeholder="Area and what you noticed" onChange={e=>setDiscomfort(e.target.value)}/></label>
      <Button className="h-12 w-full" disabled={!value||quality===0} onClick={record}><Save className="mr-2 h-4 w-4"/>Save actual attempt</Button>
    </div></details>
    {recent.length>0&&<section><h3 className="text-sm font-bold mb-2">Recent attempts</h3>{recent.map(log=><p className="text-xs py-2 border-b" key={log.id}>{new Date(log.at).toLocaleDateString()} · {log.value} {log.metric} · quality {log.quality}/5{log.discomfort?' · discomfort noted':''}</p>)}</section>}

  </div>;
  return <main className="power-skill-studio min-h-screen pb-32"><div className="mx-auto max-w-6xl px-4 py-5 space-y-5">
    <header className="flex items-center justify-between"><Link className="inline-flex items-center gap-2 min-h-12 text-sm" to="/skills"><ArrowLeft className="h-4 w-4"/>Movements</Link><Link className="text-xs text-primary min-h-12 inline-flex items-center" to={`/today?goal=${path.id}`}>Build my session</Link></header>
    <section className="power-elevated p-5 sm:p-7"><p className="text-primary text-xs uppercase tracking-widest">MOVEMENTS / YOUR PROGRESSION</p><h1 className="font-display text-3xl sm:text-4xl font-bold mt-2">{path.title}</h1><p className="mt-3 text-sm text-muted-foreground">{path.focus}</p><p className="mt-3 text-xs text-muted-foreground">{consistent} consistent / {path.slugs.length} movements · Progress saved on this device for {user?'your account':'guest training'}.</p></section>

    <section className="power-practice-card rounded-2xl border border-primary/40 bg-primary/5 p-4 space-y-3" aria-label="Your current progression step"><p className="text-xs text-primary uppercase tracking-wider">{path.kind==='collection'?'Suggested practice':'Your current step'}</p><div className="power-recommended-movement">{recommended&&<MovementThumbnail exercise={recommended}/>}<h2 className="font-bold text-2xl">{recommended?.name||'Choose your equipment'}</h2></div><p className="text-xs text-muted-foreground">{path.kind==='collection'?'Explore these variations at your own range.':`Working toward ${exerciseBySlug.get(goalSlug)?.name||path.title}.`} {recommendation?'Start here at your current level; build repeatable control.':'Add the required equipment or choose Foundation.'}</p><div className="power-practice-actions"><Button className="min-h-12 h-auto whitespace-normal py-3" disabled={!recommendation} onClick={practice}><Play className="h-4 w-4 mr-2 shrink-0"/>Practice this step</Button><Button className="min-h-12 h-auto whitespace-normal py-3" variant="outline" disabled={!recommendation} onClick={()=>recommendation&&choose(recommendation)}>Technique + my results</Button></div><details><summary className="min-h-11 flex items-center cursor-pointer text-xs font-bold">Change my goal</summary><label className="block text-xs">Working toward<select className="block w-full h-12 mt-2 border rounded-xl bg-card px-3" value={goalSlug} onChange={e=>{setGoalSlug(e.target.value);writeProgressionGoal(owner,path.id,e.target.value);}}>{path.slugs.map(slug=><option key={slug} value={slug}>{exerciseBySlug.get(slug)?.name}</option>)}</select></label></details></section>
    <details className="rounded-xl border p-3"><summary className="min-h-11 flex items-center cursor-pointer text-xs font-bold">Level & starting checks · L{profile.tier||1}</summary><TrainingLevelControls profile={profile} onChange={updateProfile}/></details>{path.id==='foundation'&&<details className="power-learn-section"><summary>Beginner foundation guide</summary><FoundationProgram attempts={attempts}/></details>}
    <div className={`power-studio-grid ${detailOpen?'is-detail-open':''}`}><section aria-label="Skill progression" className="space-y-3"><h2 className="font-bold text-lg">{path.kind==='collection'?'Poses and practice options':'Your progression'}</h2>{path.kind==='collection'&&<p className="text-xs text-muted-foreground">These are related practices, not a mandatory sequence. Support and range can change the difficulty.</p>}{path.slugs.map((slug,index)=>{const e=exerciseBySlug.get(slug);const status=nodeProgress(slug,attempts);return e&&(!mobile||showAll||index<3||slug===recommendation||slug===selected)&&<button key={slug} onClick={()=>choose(slug)} aria-pressed={slug===selected} className={`power-studio-node w-full p-3 min-h-20 flex items-center gap-4 rounded-xl border text-left ${slug===selected?'border-primary bg-primary/5':'bg-card'}`}><span className="power-studio-thumb"><MovementThumbnail exercise={e}/><span className="power-studio-step">{status.consistent?<Check size={12}/>:path.kind==='collection'?'•':String(index+1).padStart(2,'0')}</span></span><span className="min-w-0 flex-1"><strong className="block text-sm">{e.name}</strong><small className="block text-muted-foreground mt-1">L{minimumTier(slug)} · {readinessReasons(slug,profile).length?'Prep first':status.state} · {status.logs.length?`${status.logs.length} logged attempts`:'Tap for technique & starting dose'}</small></span><ArrowRight className="w-4 h-4 shrink-0 text-primary"/></button>;})}{mobile&&path.slugs.length>3&&<button className="power-assessment-action w-full text-xs" type="button" onClick={()=>setShowAll(v=>!v)}>{showAll?'Show fewer steps':`Show all ${path.slugs.length} steps`}</button>}{Boolean(path.accessories?.length)&&<details className="rounded-xl border p-3"><summary className="min-h-12 cursor-pointer text-sm font-bold">Related drills and variations · {path.accessories!.length}</summary><div className="space-y-2">{path.accessories!.map(slug=><button type="button" key={slug} onClick={()=>choose(slug)} className="power-related-movement flex w-full min-h-14 items-center justify-between gap-3 border-t text-left text-xs"><MovementThumbnail exercise={exerciseBySlug.get(slug)!} className="is-small"/><span className="flex-1 min-w-0">{exerciseBySlug.get(slug)?.name}<small className="block text-muted-foreground mt-1">L{minimumTier(slug)} · optional related practice</small></span><ArrowRight size={16} className="shrink-0"/></button>)}</div></details>}
      <p className="text-xs leading-relaxed text-muted-foreground">{path.safety} These paths are guidance, not universal medical or coaching clearance.</p></section>{!mobile&&detailOpen&&<aside className="power-elevated power-studio-detail p-5">{detail}</aside>}</div>
    {studioLessons(path.id).length>0&&<details className="power-studio-lessons rounded-xl border p-4"><summary className="min-h-12 cursor-pointer font-bold text-sm">More lessons · watch in POWER</summary><div className="space-y-4 pt-3">{studioLessons(path.id).map(source=><article key={source.url}><h3 className="font-bold text-sm mb-2">{source.title}</h3><VideoPlayer youtubeUrl={source.url} title={source.title} thumbnailMode clean/></article>)}</div></details>}

    {mobile&&<Sheet open={detailOpen} onOpenChange={setDetailOpen}><SheetContent side="bottom" className="power-movement-sheet h-[88dvh] overflow-y-auto rounded-t-2xl px-4 pt-14 pb-12"><SheetTitle className="sr-only">{exercise?.name||path.title} movement details</SheetTitle><SheetDescription className="sr-only">Technique, dependencies, training checks and actual performance logs.</SheetDescription>{detail}</SheetContent></Sheet>}
  </div></main>;
}
