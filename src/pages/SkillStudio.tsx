import { MovementPhotoGallery } from '@/components/Exercise/MovementPhotoGallery';
import { VideoPlayer } from '@/components/Exercise/VideoPlayer';
import { getYouTubeId } from '@/lib/youtube';
import { MovementOverview } from '@/components/Exercise/MovementOverview';
import { MovementThumbnail } from '@/components/Exercise/MovementThumbnail';
import { InlineTlcTv } from '@/components/Exercise/InlineTlcTv';
import { MovementConnections } from '@/components/Progression/MovementConnections';
import { MovementRequirementsPanel } from '@/components/Progression/MovementRequirementsPanel';
import { readProgressionGoal, writeProgressionGoal, writeProgressionFocus } from '@/lib/progressionFocus';
import { PROGRESSION_SOURCES } from '@/data/progressionSources';
import { tutorialState } from '@/lib/mediaAudit';
import { TrainingLevelControls } from '@/components/Progression/TrainingLevelControls';
import { FoundationProgram } from '@/components/Progression/FoundationProgram';
import { DifficultyBadge } from '@/components/Exercise/DifficultyBadge';
import { minimumTier, readinessReasons } from '@/lib/trainingPolicy';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, GitBranch, Play, RotateCcw, Save, Target, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { SKILL_PATHS, getSkillPath } from '@/data/skillPaths';
import { bandGuideFor } from '@/lib/bandAssistance';
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
  const navigate=useNavigate(); const [params,setParams]=useSearchParams(); const mobile=useIsMobile(900);
  const requestedMove=params.get('movement')||'';
  // Map nodes may cross lanes: allow any verified catalog exercise by deep link.
  // Such movements are labeled as support, never silently inserted into this ladder.
  const allowedMove=(slug:string)=>Boolean(path&&exerciseBySlug.has(slug));
  const session=useRef(crypto.randomUUID());
  const [attempts,setAttempts]=useState<SkillAttempt[]>(()=>deviceSkillProgress.read(owner));
  const [profile,setProfile]=useState<SkillTrainingProfile>(readTrainingProfile);
  const [selected,setSelected]=useState(allowedMove(requestedMove)?requestedMove:path?.slugs[0]||'');
  const [detailOpen,setDetailOpen]=useState(Boolean(requestedMove));
  const [showAll,setShowAll]=useState(false);
  const [goalSlug,setGoalSlug]=useState(()=>readProgressionGoal(owner,path?.id||''));
  const [comfortable,setComfortable]=useState(false);
  const [value,setValue]=useState(''); const [quality,setQuality]=useState(0);
  const [lean,setLean]=useState(''); const [band,setBand]=useState('');const [bandSetup,setBandSetup]=useState('');
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
  useEffect(()=>{setSelected(allowedMove(requestedMove)?requestedMove:path?.slugs[0]||'');setComfortable(false);setDetailOpen(Boolean(requestedMove));setShowAll(false);setGoalSlug(readProgressionGoal(owner,path?.id||''));},[path?.id,owner]);
  useEffect(()=>{if(requestedMove&&allowedMove(requestedMove))setSelected(requestedMove);},[requestedMove,path?.id]);
  useEffect(()=>{setValue('');setQuality(0);setComfortable(false);setDiscomfort('');setLean('');setBand('');setBandSetup('');setNegative('');setClearance('');},[selected]);
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
  function choose(slug:string){
    if(!exerciseBySlug.has(slug))return;
    // Preserve the list's scroll position; showing a movement is not navigation.
    setSelected(slug);setDetailOpen(true);
    setParams(previous=>{const next=new URLSearchParams(previous);next.set('movement',slug);return next;},{replace:true,preventScrollReset:true});
  }
  function updateProfile(next:SkillTrainingProfile){setProfile(next);writeTrainingProfile(next);}
  function record() {
    const actual=Number(value);
    if(!exercise||!value||!Number.isFinite(actual)||actual<0||!quality){toast.error('Enter your actual result and technique quality.');return;}
    const optional=(v:string)=>v!==''&&Number.isFinite(Number(v))?Math.max(0,Number(v)):undefined;
    saveAttempt(owner,{id:crypto.randomUUID(),nodeId:selected,sessionId:session.current,at:new Date().toISOString(),metric:dose.metric,value:actual,target:dose.target,quality,
      leanCm:optional(lean),assistanceKg:optional(band),bandSetup:assistance==='band'?bandSetup.trim().slice(0,140)||undefined:undefined,negativeSeconds:optional(negative),clearanceCm:optional(clearance),assistance,rom,discomfort:discomfort||undefined});
    toast.success('Attempt saved on this device.');setValue('');setQuality(0);
  }
  function train(){
    if(blockers.length){toast.info(blockers[0]);return;}
    navigate(`/today?goal=${path!.id}&node=${encodeURIComponent(selected)}`);
  }
  const detail=exercise&&<div className="tlc-atomic-detail">
     <section id="tlctv-studio-first" className="tlctv-studio-first" aria-label={'Watch '+exercise.name+' tutorial'}><InlineTlcTv key={exercise.slug} exercise={exercise} compact/></section>
    <div className="tlc-atomic-detail__heading"><div><p className="text-xs uppercase tracking-widest text-primary">{progress.state} · {dose.metric}</p><h2 className="font-display text-xl font-bold mt-1">{exercise.name}</h2>{!path.slugs.includes(selected)&&<small className="tlc-studio-parallel">SUPPORTING MOVEMENT · NOT A MANDATORY PATH STEP</small>}</div><MovementThumbnail exercise={exercise} className="is-small"/></div>
    <MovementOverview exercise={exercise} onChoose={choose}/><details className="power-learn-section"><summary>Movement photos</summary><MovementPhotoGallery exercise={exercise}/></details><details className="power-learn-section"><summary>Easier options & next steps</summary><MovementConnections slug={selected} profile={profile} attempts={attempts} onChoose={choose}/></details>
    <details className="power-learn-section"><summary>Other movement links</summary>
      {incoming.length?incoming.map((edge,i)=>{const slug=edge.to===selected?edge.from:edge.to;const e=exerciseBySlug.get(slug);return e&&<button key={i} className="power-related-movement w-full min-h-12 flex items-center justify-between gap-2 text-left text-xs border-b last:border-0" onClick={()=>choose(slug)}><MovementThumbnail exercise={e} className="is-small"/><span className="flex-1 min-w-0">{e.name}<small className="block text-muted-foreground mt-1">{edge.type.replace(/_/g,' ')} · {nodeProgress(slug,attempts).state}</small></span><ArrowRight className="h-4 w-4 shrink-0 text-primary"/></button>;}):<p className="text-xs text-muted-foreground">Start with a variation you can control.</p>}
    </details>
    <section className="tlc-atomic-readiness"><h3 className="font-bold text-sm">Before you train</h3>
      {/handstand|headstand|forearm-stand|elbow-stand|press-to-hs|hs-kick-up|stalder-negative|wall-toe-taps/.test(selected)&&<label className="flex gap-3 items-center min-h-12 text-xs"><input type="checkbox" checked={profile.safeExit} onChange={e=>updateProfile({...profile,safeExit:e.target.checked})} className="h-5 w-5 accent-[hsl(var(--primary))]"/>I can safely enter and exit this inversion.</label>}
      <label className="flex gap-3 items-center min-h-12 text-xs"><input type="checkbox" checked={comfortable} onChange={e=>setComfortable(e.target.checked)} className="h-5 w-5 accent-[hsl(var(--primary))]"/>This variation is comfortable today, with no joint pain.</label>
      {blockers.map(reason=><p key={reason} className="text-xs text-muted-foreground">• {reason}</p>)}
    </section>
    <div className="grid grid-cols-2 gap-2"><Button className="h-12" disabled={blockers.length>0} onClick={train}><Play className="mr-2 h-4 w-4"/>Train this</Button><Button className="h-12" variant="outline" disabled={!regression} onClick={()=>regression&&choose(regression)}><RotateCcw className="mr-2 h-4 w-4"/>Easier option</Button></div>
    <details className="rounded-xl border p-3"><summary className="min-h-11 font-bold text-sm cursor-pointer">Log my result</summary><div className="space-y-3 mt-3">
      <label className="block text-xs">Actual {dose.metric}<Input className="mt-1 h-12" type="number" min="0" max="999" value={value} onChange={e=>setValue(e.target.value)} /></label>
      <fieldset><legend className="text-xs mb-2">Technique quality · 1 lost control / 5 controlled</legend><div className="flex gap-2">{[1,2,3,4,5].map(n=><button key={n} aria-pressed={quality===n} className={`h-12 flex-1 rounded-lg border ${quality===n?'bg-primary text-primary-foreground':''}`} onClick={()=>setQuality(n)}>{n}</button>)}</div></fieldset>
      <div className="grid grid-cols-2 gap-3">{[{label:'Lean distance (cm)',value:lean,set:setLean},{label:'Band force (kg, if measured)',value:band,set:setBand},{label:'Negative duration (s)',value:negative,set:setNegative},{label:'Foot clearance (cm)',value:clearance,set:setClearance}].map(field=><label className="text-xs" key={field.label}>{field.label}<Input className="mt-1 h-12" type="number" min="0" max="999" placeholder="Optional" value={field.value} onChange={e=>field.set(e.target.value)}/></label>)}</div>
      <div className="grid grid-cols-2 gap-3"><label className="text-xs">Assistance<select className="block w-full h-12 rounded-lg border bg-card px-2 mt-1" value={assistance} onChange={e=>setAssistance(e.target.value as SkillAttempt['assistance'])}>{['none','feet','wall','band'].map(x=><option key={x}>{x}</option>)}</select></label><label className="text-xs">Range<select className="block w-full h-12 rounded-lg border bg-card px-2 mt-1" value={rom} onChange={e=>setRom(e.target.value as SkillAttempt['rom'])}><option>full</option><option>partial</option></select></label></div>
      {assistance==='band'&&<label className="block text-xs font-medium">Band setup used (brand, width, anchor & support)<Input className="mt-1 h-12" maxLength={140} value={bandSetup} placeholder="e.g. long loop, under knee, pull-up bar" onChange={e=>setBandSetup(e.target.value)}/><small className="block mt-2 leading-relaxed text-muted-foreground">Record the actual setup each session. Colors and advertised resistance do not give exact assistance force; only enter kg if independently measured.</small></label>}
      <label className="block text-xs">Discomfort / load note (optional)<Input className="h-12 mt-1" maxLength={200} value={discomfort} placeholder="Area and what you noticed" onChange={e=>setDiscomfort(e.target.value)}/></label>
      <Button className="h-12 w-full" disabled={!value||quality===0} onClick={record}><Save className="mr-2 h-4 w-4"/>Save actual attempt</Button>
    </div></details>
    {recent.length>0&&<section><h3 className="text-sm font-bold mb-2">Recent attempts</h3>{recent.map(log=><p className="text-xs py-2 border-b" key={log.id}>{new Date(log.at).toLocaleDateString()} · {log.value} {log.metric} · quality {log.quality}/5{log.discomfort?' · discomfort noted':''}</p>)}</section>}

  </div>;
  return <main className="power-skill-studio tlc-atomic-studio min-h-screen pb-32"><div className="mx-auto max-w-6xl px-3 sm:px-5 py-4 space-y-4">
    <header className="tlc-atomic-topline">
      <Link className="inline-flex items-center gap-2 min-h-11 text-xs font-bold" to="/skills"><ArrowLeft size={16}/> Skills</Link>
      <Link className="inline-flex items-center min-h-11 text-xs font-bold" to={`/today?goal=${path.id}`}>My workout <ArrowRight size={15}/></Link>
    </header>
    <section className="tlc-atomic-summary">
      <span className="tlc-atomic-eyebrow">TLC · SKILLS STUDIO</span>
      <h1>{path.title}</h1>
      <p>{path.kind==='collection'?'Choose a movement at your level. No required sequence.':'Progress from simple to demanding movements. Choose the level you control.'}</p>
      <details className="tlc-atomic-small-details"><summary>About this pathway</summary><p>{path.focus} · {consistent} movements practiced consistently out of {path.slugs.length}. Your results stay on this device.</p></details>
    </section>
    <section className="tlc-atomic-next" aria-label="Suggested movement">
      <div className="tlc-atomic-next__copy"><span>TRY NEXT</span><strong>{recommended?.name||'Choose your equipment'}</strong><small>Suggested from your current tests and equipment—not an automatic unlock.</small></div>
      <div className="tlc-atomic-next__actions">
        <Button variant="outline" className="min-h-11" disabled={!recommendation} onClick={()=>recommendation&&choose(recommendation)}><Play size={15} className="mr-2"/> Watch & steps</Button>
        <details className="tlc-atomic-next__target"><summary>Change target</summary><label>Working toward<select value={goalSlug} onChange={e=>{setGoalSlug(e.target.value);writeProgressionGoal(owner,path.id,e.target.value);}}>{path.slugs.map(slug=><option key={slug} value={slug}>{exerciseBySlug.get(slug)?.name}</option>)}</select></label></details>
      </div>
    </section>
    <div className={`power-studio-grid tlc-atomic-workspace ${!mobile?'is-detail-open':''}`}>
      <section aria-label="Skill progression" className="tlc-atomic-path">
        <div className="tlc-atomic-path__title"><h2>{path.kind==='collection'?'Movements':'Main progression'}</h2><span>{path.slugs.length} movements</span></div>
        <p className="tlc-atomic-path__intro">{path.kind==='collection'?'Pick any appropriate movement. These are not mandatory steps.':'Tap a movement to watch, see two key cues, and track it. Supporting drills are listed separately.'}</p>
        <div className="tlc-atomic-steps">
         {path.slugs.map((slug,index)=>{const e=exerciseBySlug.get(slug),status=nodeProgress(slug,attempts);
          return e&&(!mobile||showAll||index<3||slug===recommendation||slug===selected)&&<button type="button" key={slug} onClick={()=>choose(slug)} aria-pressed={slug===selected} className="tlc-atomic-step">
            <span className="tlc-atomic-step__number">{status.consistent?<Check size={15}/>:path.kind==='collection'?'·':index+1}</span>
            <MovementThumbnail exercise={e} className="is-small"/>
            <span className="tlc-atomic-step__copy"><strong>{e.name}</strong>{path.branches?.some(branch=>branch.includes(slug))&&<small className="tlc-studio-parallel">Alternate lever option</small>}<span><DifficultyBadge level={minimumTier(slug)} size="sm"/><small>{status.state}</small></span></span>
            <ArrowRight size={17} className="tlc-atomic-step__arrow"/>
          </button>;
         })}
        </div>
        {mobile&&path.slugs.length>3&&<button className="tlc-atomic-show-all" type="button" onClick={()=>setShowAll(v=>!v)} aria-expanded={showAll}>{showAll?'Show fewer movements':`Show all ${path.slugs.length} movements`}</button>}
        <div className="tlc-atomic-support">
          <MovementRequirementsPanel key={path.id} path={path} activeSlug={selected} onChoose={choose} compact/>
        </div>
        <details className="tlc-atomic-extra"><summary>My level & safety</summary><TrainingLevelControls profile={profile} onChange={updateProfile}/></details>
        {path.id==='foundation'&&<details className="tlc-atomic-extra"><summary>Foundation guide</summary><FoundationProgram attempts={attempts}/></details>}
        <p className="tlc-atomic-safety">{path.safety}</p>
      </section>
      {!mobile&&<aside key={selected} className="power-elevated tlc-atomic-desktop-detail">{detail}</aside>}
    </div>
    <Sheet open={mobile&&detailOpen&&Boolean(exercise)} onOpenChange={setDetailOpen}>
      <SheetContent side="bottom" className="tlc-atomic-movement-sheet">
        <SheetTitle className="tlc-atomic-sheet-title">{exercise?.name||'Movement'}</SheetTitle>
        <SheetDescription className="sr-only">Video, technique, difficulty, easier options and training record for the selected movement.</SheetDescription>
        <div key={selected} className="tlc-atomic-sheet-body">{detail}</div>
      </SheetContent>
    </Sheet>
    {studioLessons(path.id).length>0&&<details className="tlc-atomic-extra"><summary>More tutorials</summary><div className="space-y-4 pt-3">{studioLessons(path.id).map(source=><article key={source.url}><h3 className="font-bold text-sm mb-2">{source.title}</h3><VideoPlayer youtubeUrl={source.url} title={source.title} thumbnailMode clean/></article>)}</div></details>}
   </div></main>;
}
