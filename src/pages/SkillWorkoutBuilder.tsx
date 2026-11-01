import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, ChevronDown, Clock3, Dumbbell, Play, RefreshCw, RotateCcw, ShieldCheck, Sparkles, Trash2, Video } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ExerciseArtwork } from '@/components/Exercise/ExerciseArtwork';
import {
  SKILL_GOALS, PHASE_LABELS, buildSkillWorkout, findSkillGoal, getCandidates, toSessionEntries,
  type SkillLevel, type SkillMinutes, type SkillWorkoutItem, type WorkoutPhase
} from '@/lib/skillWorkoutBuilder';
import { ACTIVE_WORKOUT_KEY } from '@/pages/ActiveWorkout';

const MINUTES: SkillMinutes[] = [15,25,40];
const LEVELS: {id:SkillLevel;name:string;note:string}[] = [
  {id:'foundation',name:'Starting',note:'Learn the fundamentals'},
  {id:'building',name:'Building',note:'Working on the movement'},
  {id:'advanced',name:'Advanced',note:'Advanced variations'}
];
const PHASE_ORDER: WorkoutPhase[] = ['warmup','skill','support','cooldown'];

export default function SkillWorkoutBuilder() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialGoal = findSkillGoal(params.get('skill') || '')?.id || 'planche';
  const [goalId,setGoalId] = useState(initialGoal);
  const [minutes,setMinutes] = useState<SkillMinutes>(25);
  const [level,setLevel] = useState<SkillLevel>('foundation');
  const [items,setItems] = useState<SkillWorkoutItem[]>(() => buildSkillWorkout(initialGoal,'foundation',25));
  const [showAdjust,setShowAdjust] = useState(false);
  const goal = findSkillGoal(goalId) || SKILL_GOALS[0];
  const exerciseCount = items.length;
  const totalSets = useMemo(()=>items.reduce((n,i)=>n+i.sets,0),[items]);
  const groups = PHASE_ORDER.map(phase=>({phase,items:items.filter(item=>item.phase===phase)})).filter(group=>group.items.length);

  function regenerate(nextGoal: string, nextLevel: SkillLevel, nextMinutes: SkillMinutes) {
    setGoalId(nextGoal);
    setLevel(nextLevel);
    setMinutes(nextMinutes);
    setItems(buildSkillWorkout(nextGoal,nextLevel,nextMinutes));
  }
  function nextAlternative(item:SkillWorkoutItem): boolean {
    const options = getCandidates(goalId,level,item.phase);
    return options.some(e=>e.slug !== item.exercise.slug && !items.some(other=>other.key!==item.key && other.exercise.slug===e.slug));
  }
  function swap(item:SkillWorkoutItem) {
    const options = getCandidates(goalId,level,item.phase);
    const index = options.findIndex(e=>e.slug===item.exercise.slug);
    const replacement = Array.from({length:options.length},(_,i)=>options[(index+i+1)%options.length])
      .find(e=>e.slug!==item.exercise.slug && !items.some(other=>other.key!==item.key && other.exercise.slug===e.slug));
    if (!replacement) { toast.info('No other matching drill in this skill phase'); return; }
    setItems(old=>old.map(x=>x.key===item.key
      ? {...x,key:`${x.phase}-${replacement.slug}`,exercise:replacement} : x));
  }
  function adjust(key:string,field:'sets'|'target',delta:number) {
    setItems(old=>old.map(item=>item.key===key?{...item,
      [field]:Math.max(field==='sets'?1:1,Math.min(field==='sets'?8:120,item[field]+delta))
    }:item));
  }
  function startWorkout() {
    if (!items.length) {toast.error('Add a skill routine first');return;}
    if (localStorage.getItem(ACTIVE_WORKOUT_KEY)) {
      if (!window.confirm('An unfinished workout is saved. Replace it with this skill workout? Cancel keeps your previous workout.')) return;
    }
    const entries = toSessionEntries(items);
    localStorage.setItem(ACTIVE_WORKOUT_KEY,JSON.stringify({
      name:`${goal.title} · ${minutes} min focus`,
      notes:`Skill workout · ${LEVELS.find(x=>x.id===level)?.name} · ${goal.equipment}. Duration is a planning target, not a timed guarantee. Work within good form and comfortable range.`,
      entries,index:0,restEnd:null,startedAt:Date.now(),
    }));
    navigate('/workout');
  }

  return (
    <main className="power-skill-builder min-h-[100dvh] pb-32">
      <div className="mx-auto max-w-3xl px-3 sm:px-5 pt-3 sm:pt-7 space-y-4">
        <header className="flex items-center justify-between gap-2">
          <Button variant="outline" type="button" onClick={()=>navigate('/planner')} className="min-h-11 rounded-xl">
            <ArrowLeft className="h-4 w-4 mr-1.5"/> Train
          </Button>
          <span className="text-[10px] uppercase font-black tracking-[.17em] text-primary">POWER / SKILL BUILDER</span>
        </header>
        <div className="power-elevated relative overflow-hidden p-4 sm:p-6 space-y-2">
          <p className="text-[10px] font-mono font-bold tracking-[.17em] uppercase text-primary">Your goal, your workout</p>
          <h1 className="font-display text-[clamp(1.6rem,6vw,2.35rem)] font-black leading-tight">Pick a skill. Press play.</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">No complicated programming. POWER selects real drills for your skill, from warm-up to cool-down.</p>
        </div>

        <section className="space-y-2" aria-label="Choose a training skill">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black">1 · Choose your skill</h2>
            <span className="text-[10px] text-muted-foreground">Swipe for more →</span>
          </div>
          <div className="power-builder-goals flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Skill goals">
            {SKILL_GOALS.map(option=>(
              <button key={option.id} type="button" aria-pressed={goalId===option.id}
                onClick={()=>regenerate(option.id,level,minutes)}
                className={`power-builder-goal shrink-0 w-[156px] min-h-[86px] rounded-2xl border p-3 text-left flex flex-col justify-between gap-2 ${goalId===option.id?'is-active border-primary':'border-border bg-card'}`}>
                <span className="text-sm font-black leading-tight">{option.title}</span>
                <span className="text-[11px] leading-snug text-muted-foreground">{option.detail}</span>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground"><Dumbbell className="h-3.5 w-3.5 inline mr-1 text-primary"/>{goal.equipment}</p>
        </section>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <section className="space-y-2">
            <h2 className="text-sm font-black">2 · Time available</h2>
            <div className="power-elevated flex gap-1.5 p-1.5">
              {MINUTES.map(value=>(
                <button key={value} type="button" aria-pressed={minutes===value}
                  onClick={()=>regenerate(goalId,level,value)}
                  className={`power-builder-choice min-h-11 flex-1 rounded-xl font-bold text-sm ${minutes===value?'is-active':''}`}>
                  {value}<span className="text-[10px] ml-1">min</span>
                </button>
              ))}
            </div>
          </section>
          <section className="space-y-2">
            <h2 className="text-sm font-black">3 · Where are you now?</h2>
            <div className="power-elevated flex gap-1 p-1.5">
              {LEVELS.map(option=>(
                <button type="button" key={option.id} aria-pressed={level===option.id}
                  title={option.note} onClick={()=>regenerate(goalId,option.id,minutes)}
                  className={`power-builder-choice min-h-11 flex-1 rounded-xl text-[11px] font-black ${level===option.id?'is-active':''}`}>
                  {option.name}
                </button>
              ))}
            </div>
          </section>
        </div>
        <section aria-label="Suggested skill workout" className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-[.15em] font-bold text-primary">Built from your real library</p>
              <h2 className="font-display text-xl font-black">{goal.title} session</h2>
              <p className="text-[11px] text-muted-foreground">{exerciseCount} exercises · {totalSets} sets · {minutes}-minute target</p>
            </div>
            <button type="button" onClick={()=>regenerate(goalId,level,minutes)}
              className="power-hardware h-11 px-3 inline-flex items-center gap-1.5 text-xs font-bold"
              aria-label="Reset generated workout"><RotateCcw className="h-4 w-4"/> Reset</button>
          </div>
          {groups.map(group=>(
            <div key={group.phase} className="power-elevated p-3 sm:p-4 space-y-2">
              <div className="flex justify-between items-center gap-2 pb-1">
                <p className="text-[11px] font-black uppercase tracking-widest text-primary">{PHASE_LABELS[group.phase]}</p>
                <span className="text-[10px] text-muted-foreground">{group.items.length} exercises</span>
              </div>
              {group.items.map(item=>(
                <div key={item.key} className="power-builder-movement flex gap-3 items-center rounded-xl border border-border/50 bg-secondary/30 p-2">
                  <div className="h-[64px] w-[72px] shrink-0 overflow-hidden rounded-xl bg-secondary">
                    <ExerciseArtwork compact title={item.exercise.name} category={item.exercise.category}
                      youtubeUrl={item.exercise.youtube_url} imageUrl={item.exercise.image_url}/>
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="font-bold text-[13px] leading-snug break-words">{item.exercise.name}</p>
                    <p className="text-[11px] text-muted-foreground">{item.sets} × {item.target} {item.metric==='seconds'?'sec':'reps'}</p>
                    <div className="flex gap-2 items-center">
                      {item.exercise.youtube_url && <span className="inline-flex gap-1 items-center text-[10px] text-primary"><Video className="h-3 w-3"/> Tutorial</span>}
                      <span className="text-[10px] text-muted-foreground truncate">{item.exercise.category}</span>
                    </div>
                  </div>
                  <div className="flex flex-col shrink-0 gap-1">
                    <button type="button" className="power-hardware h-9 w-10 grid place-items-center"
                      disabled={!nextAlternative(item)} onClick={()=>swap(item)}
                      aria-label={`Swap ${item.exercise.name}`} title="Swap for another suitable drill"><RefreshCw className="h-4 w-4"/></button>
                    <button type="button" className="power-hardware h-9 w-10 grid place-items-center"
                      onClick={()=>setItems(old=>old.filter(x=>x.key!==item.key))}
                      aria-label={`Remove ${item.exercise.name}`} title="Remove exercise"><Trash2 className="h-4 w-4"/></button>
                  </div>
                </div>
              ))}
            </div>
          ))}
          <button type="button" onClick={()=>setShowAdjust(v=>!v)} aria-expanded={showAdjust}
            className="power-hardware w-full min-h-11 px-3 inline-flex items-center justify-center gap-2 text-xs font-bold">
            {showAdjust?'Hide':'Adjust'} sets and targets <ChevronDown className={`h-4 w-4 transition-transform ${showAdjust?'rotate-180':''}`}/>
          </button>
          {showAdjust && <div className="power-elevated p-3 space-y-2">
            {items.map(item=>(
              <div key={item.key} className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 py-2 last:border-0">
                <span className="flex-1 min-w-[110px] text-xs font-semibold">{item.exercise.name}</span>
                <div className="flex gap-2 items-center">
                  <button type="button" className="power-hardware h-9 w-9" onClick={()=>adjust(item.key,'sets',-1)} aria-label={`Decrease sets for ${item.exercise.name}`}>−</button>
                  <span className="min-w-10 text-center text-xs tabular-nums">{item.sets} sets</span>
                  <button type="button" className="power-hardware h-9 w-9" onClick={()=>adjust(item.key,'sets',1)} aria-label={`Increase sets for ${item.exercise.name}`}>+</button>
                </div>
                <div className="flex gap-2 items-center">
                  <button type="button" className="power-hardware h-9 w-9" onClick={()=>adjust(item.key,'target',item.metric==='seconds'?-5:-1)} aria-label={`Decrease target for ${item.exercise.name}`}>−</button>
                  <span className="min-w-12 text-center text-xs tabular-nums">{item.target}{item.metric==='seconds'?'s':' reps'}</span>
                  <button type="button" className="power-hardware h-9 w-9" onClick={()=>adjust(item.key,'target',item.metric==='seconds'?5:1)} aria-label={`Increase target for ${item.exercise.name}`}>+</button>
                </div>
              </div>
            ))}
          </div>}
          <div className="flex gap-2 items-start rounded-xl border-l-4 border-primary bg-primary/5 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary"/>
            <p>Starting, Building, and Advanced are choices—not medical clearance. Skill work comes before fatiguing strength work. Choose a comfortable variation and stop when technique deteriorates or pain appears.</p>
          </div>
        </section>
        <div className="power-builder-launch sticky z-30 bottom-[calc(4.6rem+env(safe-area-inset-bottom))] md:bottom-0 rounded-2xl border border-border/70 bg-card/95 p-2 shadow-xl backdrop-blur-lg">
          <Button type="button" onClick={startWorkout} disabled={!items.length}
            className="power-primary-action min-h-[55px] w-full rounded-xl font-display font-black text-sm">
            <Play className="h-5 w-5 mr-2" fill="currentColor"/> Start This Skill Workout <ArrowRight className="h-5 w-5 ml-2"/>
          </Button>
        </div>
      </div>
    </main>
  );
}
