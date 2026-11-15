import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, Check, CheckCircle2, ChevronDown, Clock3, Dumbbell, Play, RotateCcw, ShieldCheck, Target } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { EmbeddedMedia } from '@/components/Exercise/EmbeddedMedia';
import { AssistedSkillsLab } from '@/components/Training/AssistedSkillsLab';
import { SkillLaddersPanel } from '@/components/Training/SkillLaddersPanel';
import { getSkillPath } from '@/data/skillPaths';
import {
  HANDSTAND_SETS, SHIFT_CYCLE, FOUR_DAY_CYCLE, FOUR_DAY_COMPRESSION, STAGE_HOLD_KEYS, STAGE_HOLD_LABELS,
  SUPERHUMAN_REELS, SUPERHUMAN_SESSIONS,
  type RoutineMove, type SessionKey, type StageHold,
} from '@/data/superHumanRoutine';

type Preferences = {
  frequency:4|5;
  day:SessionKey;
  week:number;
  best:Record<StageHold,string>;
  handstand:Record<string,number>;
  clean:Record<StageHold,number>;
};
const STORAGE_KEY='power-superhuman-blueprint-v2';
const defaults:Preferences={
  frequency:5,day:'A',week:1,
  best:{planche:'',flag:'',front:'',back:'',lsit:''},
  handstand:{},clean:{planche:0,flag:0,front:0,back:0,lsit:0},
};
function readPreferences():Preferences{
  try {
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null') as Partial<Preferences>|null;
    if(saved) return {
      frequency:saved.frequency===4?4:5,
      day:['A','B','C','D','E'].includes(saved.day||'')?saved.day as SessionKey:'A',
      week:Number.isInteger(saved.week)&&Number(saved.week)>=1&&Number(saved.week)<=12?Number(saved.week):1,
      best:Object.fromEntries(STAGE_HOLD_KEYS.map(k=>[k,typeof saved.best?.[k]==='string'?saved.best[k]:''])) as Record<StageHold,string>,
      handstand:saved.handstand && typeof saved.handstand==='object'?saved.handstand:{},
      clean:Object.fromEntries(STAGE_HOLD_KEYS.map(k=>[k,Math.max(0,Math.min(2,Number(saved.clean?.[k])||0))])) as Record<StageHold,number>,
    };
    // Migrate best-hold inputs from previous app release.
    const previous=JSON.parse(localStorage.getItem('power-superhuman-blueprint-v1')||'null') as {plancheMax?:string;lsitMax?:string;week?:number}|null;
    return previous?{...defaults,week:Number.isInteger(previous.week)&&Number(previous.week)>=1&&Number(previous.week)<=12?Number(previous.week):1,
      best:{...defaults.best,planche:typeof previous.plancheMax==='string'?previous.plancheMax:'',lsit:typeof previous.lsitMax==='string'?previous.lsitMax:''}}:defaults;
  }catch{return defaults;}
}
function bestHold(raw:string):number|undefined {
  const n=Number(raw);
  return raw.trim()!==''&&Number.isFinite(n)&&n>0&&n<=300?n:undefined;
}
function dose(move:RoutineMove, deload:boolean,best:Record<StageHold,string>,week:number):string {
  if(move.count)return String(deload?Math.ceil(move.count/2):move.count)+' '+(move.countUnit||'tries');
  const prescribed=move.sets && move.twoSetsWeekOne&&week===1?Math.min(2,move.sets):move.sets;
  const sets=prescribed?(deload?Math.max(1,Math.ceil(prescribed/2)):prescribed):undefined;
  if(move.holdMetric){
    const m=bestHold(best[move.holdMetric]);
    return String(sets||move.sets||1)+' × '+(m?Math.max(1,Math.round(m*.65))+'s':'65% best hold')+' · 2 min rest';
  }
  return sets?sets+' × '+(move.target||'clean reps'):(move.target||'controlled practice');
}
function MovementRow({move,deload,best,week}:{move:RoutineMove;deload:boolean;best:Record<StageHold,string>;week:number}) {
  return <div className="flex min-h-14 items-start gap-2.5 border-b border-border/60 py-2.5 last:border-b-0">
    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500/80"/>
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <span className="text-[13px] font-semibold leading-snug text-foreground">{move.name}</span>
        <span className="text-xs font-bold text-primary">{dose(move,deload,best,week)}</span>
      </div>
      {move.note&&<p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{move.note}</p>}
    </div>
    {move.goal && <Link to={getSkillPath(move.goal)?'/?goal='+encodeURIComponent(move.goal)+(move.slug?'&node='+encodeURIComponent(move.slug):''):'/skills'}
      className="flex min-h-9 shrink-0 items-center gap-1 rounded-lg border border-border px-2 text-[11px] font-bold text-primary hover:bg-accent"
      aria-label={'Open skill map for '+move.name}>Skill map <ArrowRight size={12}/></Link>}
  </div>;
}
export default function SuperHumanProgram(){
  const [prefs,setPrefs]=useState<Preferences>(readPreferences);
  const [selectedVideo,setSelectedVideo]=useState<string|null>(null);
  const [allVideos,setAllVideos]=useState(false);
  const [showFullHandstand,setShowFullHandstand]=useState(false);
  const [showHolds,setShowHolds]=useState(false);
  useEffect(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(prefs));}catch{/* Local device storage may be disabled. */}},[prefs]);
  const patch=(next:Partial<Preferences>)=>setPrefs(p=>({...p,...next}));
  const activeDay=prefs.frequency===4&&prefs.day==='C'?'B':prefs.day;
  const session=SUPERHUMAN_SESSIONS.find(s=>s.key===activeDay)||SUPERHUMAN_SESSIONS[0];
  const cycle=prefs.frequency===4?FOUR_DAY_CYCLE:SHIFT_CYCLE;
  const groups=[...session.groups,...(prefs.frequency===4&&(activeDay==='E'||activeDay==='B')?[FOUR_DAY_COMPRESSION[activeDay]]:[])];
  const isDeload=prefs.week%4===0;
  const isRetest=prefs.week%3===0;
  const handstandCount=Math.max(0,Math.min(5,Number(prefs.handstand[prefs.week])||0));
  const activeSet=HANDSTAND_SETS[handstandCount%2];
  const refs=useMemo(()=>allVideos?SUPERHUMAN_REELS:SUPERHUMAN_REELS.filter(r=>r.days.includes(activeDay)),[allVideos,activeDay]);
  const playing=SUPERHUMAN_REELS.find(r=>r.id===selectedVideo);
  const recordHandstand=(change:1|-1)=>setPrefs(old=>({...old,handstand:{...old.handstand,[old.week]:Math.max(0,Math.min(5,(Number(old.handstand[old.week])||0)+change))}}));
  const recordClean=(key:StageHold,done:boolean)=>setPrefs(old=>({...old,clean:{...old.clean,[key]:done?Math.min(2,(old.clean[key]||0)+1):0}}));
  return <main className="tlc-prime-program min-h-screen bg-background pb-28 text-foreground md:pb-16">
    <div className="mx-auto max-w-5xl space-y-4 px-3 py-5 sm:space-y-5 sm:px-6">
      <Link to="/" className="inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft size={15}/> Workout builder
      </Link>
      <header className="rounded-[22px] border border-amber-500/20 bg-[#171a1d] px-5 py-5 text-zinc-50 shadow-lg sm:p-7">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-400">TLC's Super Human Strength / Training Plan</p>
        <h1 className="mt-2 text-[clamp(25px,5vw,38px)] font-black leading-tight tracking-tight">Train skills. Not clutter<span className="text-amber-400">.</span></h1>
        <p className="mt-2 max-w-xl text-xs leading-relaxed text-zinc-300 sm:text-sm">Your shift-friendly A → D → E → rest → B → C cycle, with a four-day option, alternating handstands and progression tests.</p>
        <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-semibold">
          <span className="rounded-full border border-white/20 px-3 py-1.5">4 or 5 skill sessions</span>
          <span className="rounded-full border border-white/20 px-3 py-1.5">Handstand · 5× weekly</span>
          <span className="rounded-full border border-white/20 px-3 py-1.5">No fixed weekdays</span>
        </div>
      </header>

      <section aria-label="Your rotating training schedule" className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-[10px] font-black uppercase tracking-[0.13em] text-primary">01 / The training cycle</p><h2 className="mt-1 text-lg font-black">Your seven-slot split</h2></div>
          <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">Week
            <select aria-label="Training week" className="h-10 rounded-lg border border-border bg-background px-2 text-sm font-bold"
              value={prefs.week} onChange={e=>patch({week:Number(e.target.value)})}>
              {Array.from({length:12},(_,i)=>i+1).map(k=><option key={k} value={k}>Week {k}{k%4===0?' · deload':''}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-semibold text-muted-foreground">{prefs.frequency===5?'5 sessions · dedicated compression':'4 sessions · compression split across B and E'}</span>
          <div role="group" aria-label="Training frequency" className="flex rounded-xl border border-border bg-background p-1">
            {([5,4] as const).map(count=><button key={count} type="button" aria-pressed={prefs.frequency===count}
              onClick={()=>patch({frequency:count,day:count===4&&prefs.day==='C'?'B':prefs.day})}
              className={'min-h-10 rounded-lg px-3 text-xs font-bold '+(prefs.frequency===count?'bg-foreground text-background':'text-muted-foreground')}>{count} days</button>)}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1 sm:gap-2" role="group" aria-label="Cycle slots, not fixed weekdays">
          {cycle.map((key,i)=>{
            const isRest=key==='rest',active=!isRest&&key===activeDay;
            return isRest?<div key={i} className="flex min-h-[57px] flex-col items-center justify-center rounded-xl border border-border bg-background/40 text-[10px] text-muted-foreground"><span className="font-semibold">Rest</span><small>0{i+1}</small></div>
              :<button key={i} type="button" aria-pressed={active} aria-label={'Select Day '+key}
                onClick={()=>patch({day:key})}
                className={'flex min-h-[57px] flex-col items-center justify-center rounded-xl border text-sm font-black transition-colors '+
                  (active?'border-amber-500 bg-amber-500/10 text-foreground':'border-border bg-background hover:bg-accent')}>
                {key}<span className="mt-1 text-[10px] font-normal text-muted-foreground">0{i+1}</span>
              </button>;
          })}
        </div>
        <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">Slots are a sequence, not weekdays. Keep A and B apart for wrist recovery. With four days, C becomes brief compression finishers after E and B. Adapt to shift schedules and fatigue.</p>
        {(isDeload||isRetest)&&<div className="mt-3 flex flex-wrap gap-2">
          {isDeload&&<span className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold">Week {prefs.week}: half sets, not half form</span>}
          {isRetest&&<span className="rounded-lg border border-border bg-accent/50 px-3 py-2 text-xs font-semibold">Retest clean best holds while fresh</span>}
        </div>}
      </section>

      <section aria-label="Selected workout" className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-accent/40 px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.13em] text-primary">02 / Skill session · Day {session.key}</p>
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"><Clock3 size={13}/>{session.duration}{prefs.frequency===4&&(activeDay==='B'||activeDay==='E')?' +15 min':''}</span>
          </div>
          <h2 className="mt-1 text-xl font-black">{session.title}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{session.subtitle}</p>
        </div>
        <div className="p-4 sm:p-5">
          <p className="mb-3 text-xs leading-relaxed text-muted-foreground"><ShieldCheck size={14} className="mr-1 inline align-[-2px]"/>Skill holds use 65% of your best clean hold, with ~2 min rest. If a drill is too advanced, use the skill-map regression or a suitable assisted step.</p>
          <div className="space-y-2">
            {groups.map((group,i)=><details className="group rounded-xl border border-border bg-background/50" key={group.title} open={i===0?true:undefined}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3.5 py-3.5 text-left">
                <span><strong className="block text-sm">{group.title}</strong><span className="mt-0.5 block text-[11px] text-muted-foreground">{group.movements.length} drills</span></span>
                <ChevronDown size={17} className="text-muted-foreground transition-transform group-open:rotate-180"/>
              </summary>
              <div className="border-t border-border px-3.5 py-1">{group.movements.map(move=><MovementRow key={move.name} move={move} deload={isDeload} best={prefs.best} week={prefs.week}/>)}</div>
            </details>)}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Optional coaching reference—never a preloaded workout. Week 1 uses only two sets for Nordic and reverse-Nordic stages. Performing every exercise may take longer than the estimated duration; choose suitable stages rather than stacking advanced variants.</p>
        </div>
      </section>

      <section aria-label="Daily handstand practice" className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-accent/30 px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-[10px] font-black uppercase tracking-[0.13em] text-primary">03 / Handstand practice</p><span className="text-xs font-semibold text-muted-foreground">10-min target · 5× per week</span></div>
          <h2 className="mt-1 text-lg font-black">{handstandCount===5?'Handstand week complete':activeSet.name}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{handstandCount===5?'All five practices logged. The next week starts again with Set 1.':activeSet.subtitle}</p>
        </div>
        <div className="space-y-3 p-4 sm:p-5">
          <div className="flex gap-2" aria-label="Five handstand sessions this week">
            {Array.from({length:5},(_,i)=><div key={i} className={'h-2 flex-1 rounded-full '+(i<handstandCount?'bg-amber-500':'bg-accent')}/>)}
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">Alternate Heidi → Haz → Heidi → Haz → Heidi, each completed practice. For a genuine 10-minute block, choose 2–3 quality drills from the five listed; completing every prescribed set may take longer.</p>
          <div className="rounded-xl border border-border bg-background/50">
            {(handstandCount===5?HANDSTAND_SETS[0]:activeSet).drills.slice(0,showFullHandstand?5:3).map(move=>
              <div key={move.name} className="px-3.5"><MovementRow move={move} deload={isDeload} best={prefs.best} week={prefs.week}/></div>)}
            <button type="button" onClick={()=>setShowFullHandstand(v=>!v)}
              className="flex min-h-10 w-full items-center justify-center gap-1 border-t border-border text-xs font-bold text-primary">
              {showFullHandstand?'Show fewer drills':'Show all 5 drills'} <ChevronDown size={15} className={showFullHandstand?'rotate-180':''}/>
            </button>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-muted-foreground">{handstandCount} / 5 completed</span>
            <div className="flex items-center gap-2">
              <button type="button" disabled={!handstandCount} onClick={()=>recordHandstand(-1)} className="min-h-10 rounded-lg border border-border px-3 text-xs font-semibold disabled:opacity-40">Undo</button>
              <button type="button" disabled={handstandCount>=5} onClick={()=>{recordHandstand(1);setShowFullHandstand(false);}}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-foreground px-4 text-xs font-bold text-background disabled:opacity-40">
                <Check size={15}/>{handstandCount>=5?'Finished':'Mark completed'}
              </button>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">Practice on five suitable days, including one off-day if recovered. Avoid stacking hard wrist work when sore or fatigued.</p>
        </div>
      </section>

      <section aria-label="Skill progression rules and hold calculator" className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <button type="button" aria-expanded={showHolds} onClick={()=>setShowHolds(v=>!v)}
          className="flex min-h-[76px] w-full items-center gap-3 px-4 py-3 text-left sm:px-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-accent/60"><Target size={18} className="text-primary"/></span>
          <span className="min-w-0 flex-1"><strong className="block text-sm">Best holds & stage readiness</strong><span className="mt-1 block text-xs text-muted-foreground">65% calculator · two clean sessions in a row</span></span>
          <ChevronDown size={17} className={'shrink-0 text-muted-foreground transition-transform '+(showHolds?'rotate-180':'')}/>
        </button>
        {showHolds&&<div className="space-y-3 border-t border-border p-4 sm:p-5">
          <p className="text-xs leading-relaxed text-muted-foreground">Enter the longest clean hold for your current stage. Mark each practice as clean only if every prescribed set is controlled. Failed sessions reset the consecutive count; advancement still requires the skill-map readiness checks.</p>
          <div className="space-y-2">
            {STAGE_HOLD_KEYS.map(key=><div key={key} className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-xl border border-border bg-background/70 p-3 sm:grid-cols-[1fr_125px_115px]">
              <div>
                <strong className="text-xs">{STAGE_HOLD_LABELS[key]}</strong>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{bestHold(prefs.best[key])?Math.max(1,Math.round(bestHold(prefs.best[key])!*.65))+' sec per stage set':'Set best clean hold'}</p>
              </div>
              <label className="text-[10px] font-semibold text-muted-foreground">
                Best seconds
                <input type="number" min="1" max="300" inputMode="numeric" placeholder="—" value={prefs.best[key]}
                  onChange={e=>patch({best:{...prefs.best,[key]:e.target.value}})}
                  className="mt-1 h-10 w-20 rounded-lg border border-border bg-card px-2 text-sm font-bold text-foreground sm:w-full"/>
              </label>
              <div className="col-span-2 flex flex-wrap items-center gap-1.5 sm:col-span-1 sm:justify-end">
                <span className="mr-1 text-[10px] text-muted-foreground">{prefs.clean[key]}/2 clean</span>
                <button type="button" aria-label={'Record clean session for '+STAGE_HOLD_LABELS[key]} onClick={()=>recordClean(key,true)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background"><Check size={16}/></button>
                <button type="button" aria-label={'Record incomplete session for '+STAGE_HOLD_LABELS[key]} onClick={()=>recordClean(key,false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border"><RotateCcw size={14}/></button>
              </div>
            </div>)}
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground"><strong className="text-foreground">Progression rule:</strong> two consecutive clean stage sessions before considering advancement. For assisted human flag, also reach the previously established 20-sec clean per-side support hold before reducing band assistance.</p>
        </div>}
      </section>

      <SkillLaddersPanel/>
      <AssistedSkillsLab/>

      <section aria-label="Coach technique videos" className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div><p className="text-[10px] font-black uppercase tracking-[0.13em] text-primary">04 / Coach reference videos</p><h2 className="mt-1 text-lg font-black">Technique library</h2></div>
          <button type="button" className="min-h-10 rounded-lg border border-border px-3 text-xs font-bold" onClick={()=>setAllVideos(v=>!v)}>{allVideos?'This session only':'All 8 reels'}</button>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {refs.map(clip=><button key={clip.id} type="button" onClick={()=>setSelectedVideo(clip.id)}
            className="flex min-h-[70px] items-center gap-3 rounded-xl border border-border bg-background p-3 text-left hover:bg-accent">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border"><Play size={17} className="text-primary"/></span>
            <span className="min-w-0 flex-1"><strong className="block text-xs">{clip.title}</strong><span className="mt-1 block text-[11px] text-muted-foreground">{clip.teaches}</span></span>
          </button>)}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">Creator permissions determine whether public Instagram reels can play in-app. These are technique references, not independently verified demonstrations.</p>
      </section>

      <section aria-label="Safety rules" className="rounded-xl border border-border p-4 text-xs leading-relaxed text-muted-foreground">
        <strong className="text-foreground">Stop rule:</strong> A pinch or pain in the wrist, elbow, or front of the shoulder means stop that drill for the day. Never push through sharp pain, and don't force a stage change to match a calendar date. Rest sufficiently after harder straight-arm sessions.
      </section>
      <footer className="flex flex-wrap items-center justify-between gap-3 pb-3">
        <p className="max-w-xl text-[11px] leading-relaxed text-muted-foreground">These session durations are approximate; quality, rest and readiness take priority. Everything here is optional guidance.</p>
        <Link to="/" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-foreground px-4 text-xs font-bold text-background">Back to builder <ArrowRight size={16}/></Link>
      </footer>
    </div>
    <Dialog open={Boolean(playing)} onOpenChange={open=>{if(!open)setSelectedVideo(null);}}>
      <DialogContent className="max-h-[88dvh] max-w-[min(94vw,650px)] overflow-y-auto">
        <DialogTitle>{playing?.title||'Coach reel'}</DialogTitle>
        <DialogDescription>{playing?.teaches||'Movement reference'}</DialogDescription>
        {playing&&<EmbeddedMedia key={playing.id} url={playing.url} title={playing.title}/>}
      </DialogContent>
    </Dialog>
  </main>;
}
