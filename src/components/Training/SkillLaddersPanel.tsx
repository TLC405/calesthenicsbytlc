import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, ChevronDown, ClipboardCheck, LockKeyhole, RotateCcw, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { SKILL_LADDERS, type SkillLadder } from '@/data/skillLadders';

type LadderState = {passed:Record<string,number>;clean:Record<string,number>};
const initial:LadderState={passed:{},clean:{}};
function read(owner:string):LadderState{
  try{
    const raw=JSON.parse(localStorage.getItem('power-skill-ladders-v1:'+owner)||'null');
    if(!raw||typeof raw!=='object')return initial;
    return {passed:raw.passed&&typeof raw.passed==='object'?raw.passed:{},clean:raw.clean&&typeof raw.clean==='object'?raw.clean:{}};
  }catch{return initial;}
}
function passIndex(data:LadderState,id:string):number {
  const n=Number(data.passed[id]);
  return Number.isInteger(n)?Math.max(-1,Math.min(20,n)):-1;
}
function progressGate(ladder:SkillLadder,stage:number,data:LadderState):string|null{
  if(ladder.id==='frontlever'&&passIndex(data,'pullup')<2)return 'Pass 5 strict pull-ups in the Pull-up ladder first.';
  if(ladder.id==='muscleup'&&passIndex(data,'pullup')<3)return 'Pass 10 strict pull-ups in the Pull-up ladder before advanced muscle-up work; 10 straight-bar dips are also required.';
  if(ladder.id==='singleleg'&&stage===5&&passIndex(data,'mobility')<1)return 'Pass the 60-second pancake standard in Mobility + splits before dragon pistol.';
  return null;
}
export function SkillLaddersPanel(){
  const {user}=useAuth();
  const owner=user?.id||'guest';
  const [expanded,setExpanded]=useState(false);
  const [group,setGroup]=useState<'Pull'|'Legs'>('Legs');
  const [selected,setSelected]=useState('singleleg');
  const [data,setData]=useState<LadderState>(()=>read(owner));
  const [message,setMessage]=useState('');
  useEffect(()=>{setData(read(owner));setMessage('');},[owner]);
  useEffect(()=>{try{localStorage.setItem('power-skill-ladders-v1:'+owner,JSON.stringify(data));}catch{/* Device storage is optional. */}},[owner,data]);
  const ladders=SKILL_LADDERS.filter(x=>x.group===group);
  const active=SKILL_LADDERS.find(x=>x.id===selected&&x.group===group)||ladders[0];
  const passed=passIndex(data,active.id);
  const stage=Math.min(active.steps.length-1,passed+1);
  const completed=passed>=active.steps.length-1;
  const streak=Math.max(0,Math.min(2,Number(data.clean[active.id])||0));
  const locked=!completed?progressGate(active,stage,data):null;
  function choose(id:string){setSelected(id);setMessage('');}
  function setGroupView(next:'Pull'|'Legs'){
    setGroup(next);setSelected(next==='Pull'?'pullup':'singleleg');setMessage('');
  }
  function markClean(pass:boolean){
    if(completed||locked)return;
    setData(old=>({...old,clean:{...old.clean,[active.id]:pass?Math.min(2,(Number(old.clean[active.id])||0)+1):0}}));
    setMessage(pass?'Clean session recorded. Only count this if every set met the stated standard.':'Counter reset for this stage. Repeat a comfortable regression.');
  }
  function unlock(){
    if(completed||locked||streak<2)return;
    setData(old=>({...old,passed:{...old.passed,[active.id]:stage},clean:{...old.clean,[active.id]:0}}));
    setMessage(stage+1<active.steps.length?'Step passed (self-reported). The next stage is ready for your assessment.':'All ladder steps recorded as passed (self-reported). Maintain control rather than adding difficulty automatically.');
  }

  return <section id="skill-ladders" aria-label="Skill ladders and unlock standards" className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
    <button type="button" aria-expanded={expanded} onClick={()=>setExpanded(v=>!v)}
      className="flex min-h-[83px] w-full items-center gap-3 px-4 py-3 text-left hover:bg-accent/30 sm:px-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-accent/50"><ClipboardCheck size={19} className="text-primary"/></span>
      <span className="min-w-0 flex-1"><span className="block text-[10px] font-black uppercase tracking-[0.13em] text-primary">Skill map / progression tests</span><strong className="mt-0.5 block text-lg">Nine mastery ladders</strong><span className="mt-1 block text-xs text-muted-foreground">Pull · levers · squat · quads · Nordics · splits · jumps</span></span>
      <ChevronDown className={'shrink-0 text-muted-foreground transition-transform '+(expanded?'rotate-180':'')} size={18}/>
    </button>
    {expanded&&<div className="space-y-4 border-t border-border p-4 sm:p-5">
      <p className="text-xs leading-relaxed text-muted-foreground">Work from the first unpassed standard. Two consecutive clean sessions let you record that stage as passed; pain, poor form or skipped reps reset the count. These are <strong className="text-foreground">your coaching targets, not automatic proof of readiness</strong>.</p>
      <div className="flex rounded-xl border border-border bg-background p-1" role="group" aria-label="Ladder family">
        {(['Legs','Pull'] as const).map(key=><button key={key} type="button" aria-pressed={group===key} onClick={()=>setGroupView(key)}
          className={'min-h-10 flex-1 rounded-lg text-xs font-bold '+(group===key?'bg-foreground text-background':'text-muted-foreground')}>{key==='Legs'?'Legs & mobility':'Pull & levers'}</button>)}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="group" aria-label="Skill ladder">
        {ladders.map(ladder=><button type="button" key={ladder.id} aria-pressed={active.id===ladder.id} onClick={()=>choose(ladder.id)}
          className={'min-h-[61px] rounded-xl border p-2.5 text-left transition-colors '+(active.id===ladder.id?'border-amber-500 bg-amber-500/10':'border-border bg-background hover:bg-accent')}>
          <strong className="block text-xs leading-tight">{ladder.title}</strong>
          <span className="mt-1 block text-[11px] text-muted-foreground">{Math.max(0,passIndex(data,ladder.id)+1)}/{ladder.steps.length} standards</span>
        </button>)}
      </div>
      <div className="rounded-2xl border border-border bg-background/60">
        <div className="border-b border-border p-4">
          <div className="flex flex-wrap justify-between gap-2"><h3 className="text-base font-black">{active.title}</h3><span className="text-[11px] font-semibold text-muted-foreground">{Math.max(0,passed+1)} / {active.steps.length} passed</span></div>
          <p className="mt-1 text-xs text-muted-foreground">{active.description}</p>
          {active.gate&&<p className="mt-2 text-xs font-semibold text-primary">{active.gate}</p>}
        </div>
        <ol className="divide-y divide-border/70">
          {active.steps.map((item,i)=>{
            const done=i<=passed,current=!completed&&i===stage;
            return <li key={i} className={'flex items-start gap-3 px-3.5 py-3 '+(current?'bg-amber-500/5':'')}>
              <span className={'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-[11px] font-bold '+(done?'border-primary/20 bg-primary/10 text-primary':current?'border-amber-500/50 text-foreground':'border-border text-muted-foreground')}>
                {done?<Check size={15}/>:String(i+1).padStart(2,'0')}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-[12px]">{item.title}</strong>{current&&<span className="text-[10px] font-black uppercase tracking-wide text-amber-600 dark:text-amber-300">Current</span>}</div>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.standard}</p>
                {item.note&&<p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{item.note}</p>}
                {current&&item.goal&&<Link to={'/skills/'+encodeURIComponent(item.goal)} className="mt-1.5 inline-flex min-h-8 items-center gap-1 text-[11px] font-bold text-primary">Skill map <ArrowRight size={12}/></Link>}
              </div>
            </li>;
          })}
        </ol>
        <div className="space-y-2 border-t border-border p-3.5">
          {locked&&<p role="status" className="flex items-start gap-2 text-xs font-semibold text-amber-700 dark:text-amber-300"><LockKeyhole className="mt-0.5 shrink-0" size={14}/>{locked}</p>}
          {!completed&&!locked&&<div className="flex flex-wrap items-center gap-2">
            <span className="flex-1 text-xs font-semibold text-muted-foreground">{streak}/2 consecutive clean sessions</span>
            <button type="button" onClick={()=>markClean(false)} className="min-h-10 rounded-lg border border-border px-3 text-xs font-bold"><RotateCcw className="mr-1 inline" size={13}/> Not clean</button>
            <button type="button" onClick={()=>markClean(true)} disabled={streak>=2}
              className="min-h-10 rounded-lg border border-border px-3 text-xs font-bold disabled:opacity-40"><Check className="mr-1 inline" size={14}/> Clean session</button>
          </div>}
          {!completed&&!locked&&<button type="button" disabled={streak<2} onClick={unlock}
            className="min-h-11 w-full rounded-xl bg-foreground px-3 text-xs font-bold text-background disabled:opacity-40">
            {streak>=2?'Mark this stage passed →':'Complete two clean sessions to unlock'}
          </button>}
          {completed&&<p className="text-xs font-bold text-primary">All stages marked passed. Continue to monitor quality and comfort.</p>}
          {message&&<p role="status" className="text-[11px] text-muted-foreground">{message}</p>}
        </div>
      </div>
      <details className="rounded-xl border border-border bg-background/60 p-3.5">
        <summary className="cursor-pointer text-xs font-black">Can't do it yet? Safe regressions <ChevronDown size={15} className="ml-1 inline"/></summary>
        <ul className="mt-2 space-y-2">{active.regressions.map(item=><li key={item} className="text-xs leading-relaxed text-muted-foreground">• {item}</li>)}</ul>
      </details>
      <div className="flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-primary"/><p>Self-reported progress stays on this device. For advanced jumps, Nordics and inverted holds, use proper equipment and control. Stop with wrist, elbow, front-shoulder, knee or hamstring pain.</p></div>
      <Link to="/assessment" className="inline-flex min-h-10 items-center gap-2 text-xs font-bold text-primary">Open full strength assessment <ArrowRight size={14}/></Link>
    </div>}
  </section>;
}
