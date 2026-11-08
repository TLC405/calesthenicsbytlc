import { MovementThumbnail } from '@/components/Exercise/MovementThumbnail';
import { MovementVideo } from '@/components/Exercise/MovementVideo';
import { MovementOverview } from '@/components/Exercise/MovementOverview';
import { minimumTier, TRAINING_LEVELS } from '@/lib/trainingPolicy';
import { exerciseReadinessReasons, approvedRegression } from '@/lib/trainingPolicy';
import { TrainingLevelControls } from '@/components/Progression/TrainingLevelControls';
import { readTrainingProfile, writeTrainingProfile } from '@/lib/skillGraph';
import { exerciseLabel } from '@/lib/exerciseLabels';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronLeft, Clock3, Dumbbell, Minus, Pause, Play, Plus, TimerReset, Trophy, Video } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/Exercise/VideoPlayer';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { saveGuestWorkout } from '@/lib/offlineWorkouts';
import { getOfflineExercises, type OfflineExercise } from '@/lib/offlineExercises';
import { deviceSkillProgress, exerciseBySlug, nodeDose, regressionFor, saveAttempt, removeAttempt } from '@/lib/skillGraph';
import { useTheme } from '@/components/ThemeSwitcher';

export const ACTIVE_WORKOUT_KEY = 'power-active-workout-v2';

interface ActiveExercise {
  id: string;
  slug: string;
  name: string;
  category: string;
  primary_muscles: string[];
  secondary_muscles?: string[];
  equipment?: string[];
  youtube_url?: string | null;
  description?: string | null;
  cues?: unknown;
  difficulty_level?: number | null;
}
interface WorkoutSet { progressId?: string; reps: number; seconds?: number; weight?: number; rpe?: number; done: boolean }
interface SessionEntry { restSeconds?: number; section: string; phaseLabel?: string; exercise: ActiveExercise; sets: WorkoutSet[] }
interface SessionDraft { returnTo?:'/'|'/planner'; name: string; notes: string; entries: SessionEntry[]; index: number; restEnd: number | null; startedAt: number }

function readDraft(): SessionDraft | null {
  try {
    const raw = localStorage.getItem(ACTIVE_WORKOUT_KEY);
    if (!raw) return null;
    const value: SessionDraft = JSON.parse(raw);
    if (!Array.isArray(value.entries) || !value.entries.length) return null;
    const entries = value.entries.filter(entry => entry.exercise && Array.isArray(entry.sets))
      .map(entry => ({
        ...entry,
        sets: entry.sets.map((set, setIndex) => ({ progressId: set.progressId || `${value.startedAt}:${entry.exercise.slug}:${setIndex}`, reps: Math.max(0, Number(set.reps) || 0), seconds: typeof set.seconds === 'number' ? Math.max(0, set.seconds) : undefined, weight: set.weight, rpe: set.rpe, done: Boolean(set.done) }))
      }));
    if (!entries.length) return null;
    return { returnTo:value.returnTo==='/'?'/':'/planner', name: value.name || 'Workout', notes: value.notes || '', entries,
      index: Math.max(0, Math.min(entries.length - 1, Number(value.index) || 0)),
      restEnd: typeof value.restEnd === 'number' ? value.restEnd : null,
      startedAt: Number(value.startedAt) || Date.now() };
  } catch { return null; }
}

const timeLabel = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

export default function ActiveWorkout() {
  const navigate = useNavigate();
  const [readiness,setReadiness]=useState(readTrainingProfile);
  const { user } = useAuth();
  useEffect(()=>{const sync=()=>setReadiness(readTrainingProfile());window.addEventListener('power-training-profile',sync);return()=>window.removeEventListener('power-training-profile',sync);},[]);
  const { theme, setTheme, themes } = useTheme();
  const [draft, setDraft] = useState<SessionDraft | null>(readDraft);
  const [now, setNow] = useState(Date.now());
  const [restDuration, setRestDuration] = useState(60);
  const [saving, setSaving] = useState(false);
  const [techniqueQuality, setTechniqueQuality] = useState<number | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (draft) localStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(draft));
  }, [draft]);
  const item = draft?.entries[draft.index];
  useEffect(() => {
    if(item) setRestDuration(item.restSeconds || nodeDose(item.exercise.slug).restSeconds);
    setTechniqueQuality(null);
  }, [item?.exercise.slug]);
  const progressOwner=user?.id || 'guest';
  const setCount = draft?.entries.reduce((sum, entry) => sum + entry.sets.length, 0) || 0;
  const completed = draft?.entries.reduce((sum, entry) => sum + entry.sets.filter(set => set.done).length, 0) || 0;
  const seconds = draft?.restEnd ? Math.max(0, Math.ceil((draft.restEnd - now) / 1000)) : 0;
  const elapsed = draft ? Math.floor((now - draft.startedAt) / 1000) : 0;
  const percentage = setCount ? Math.round((completed / setCount) * 100) : 0;
  const cues = useMemo(() => {
    const raw = item?.exercise.cues;
    if (Array.isArray(raw)) return raw.filter((v): v is string => typeof v === 'string').slice(0, 4);
    if (typeof raw === 'string') { try { const v: unknown = JSON.parse(raw); return Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string').slice(0, 4) : []; } catch { return []; } }
    return [];
  }, [item?.exercise.cues]);

  function modifySet(setIndex: number, update: (set: WorkoutSet) => WorkoutSet) {
    setDraft(old => {
      if (!old) return old;
      const entries = old.entries.map((entry, index) => index === old.index
        ? { ...entry, sets: entry.sets.map((set, j) => j === setIndex ? update(set) : set) }
        : entry);
      return { ...old, entries };
    });
  }
  function finishSet(setIndex: number) {
    if(item&&!item.sets[setIndex]?.done){const reasons=exerciseReadinessReasons(item.exercise,readiness);if(reasons.length){toast.info(reasons[0]);return;}}
    const wasDone = Boolean(item?.sets[setIndex]?.done);
    if(item&&draft) {
      const id=item.sets[setIndex].progressId || `${draft.startedAt}:${item.exercise.slug}:${setIndex}`;
      try {
        if(wasDone) removeAttempt(progressOwner,id);
        else if(techniqueQuality!==null) {
          const set=item.sets[setIndex];
          saveAttempt(progressOwner,{id,nodeId:item.exercise.slug,sessionId:String(draft.startedAt),at:new Date().toISOString(),metric:set.seconds!==undefined?'seconds':'reps',value:set.seconds??set.reps,target:set.seconds??set.reps,quality:techniqueQuality});
        }
      } catch {toast.error('Skill progress could not be saved. Workout controls still work.');}
    }
    modifySet(setIndex, set => ({ ...set, done: !set.done }));
    if (!wasDone) {
      setDraft(old => old ? { ...old, restEnd: Date.now() + restDuration * 1000 } : old);
    }
  }
  function regressMovement() {
    if(!draft||!item)return;
    const slug=approvedRegression(item.exercise.slug,readiness);
    const easier=slug?exerciseBySlug.get(slug):null;
    if(!easier){toast.info('Choose an appropriate movement in the builder, or review your level and readiness.');return;}
    const dose=nodeDose(easier.slug);
    // Switching to preparation does not invent a failed attempt.
    const remaining=Math.max(1,item.sets.filter(s=>!s.done).length);
    const replacement:SessionEntry={section:item.section,phaseLabel:'Regression / preserve technique',exercise:easier,restSeconds:dose.restSeconds,sets:Array.from({length:remaining},()=>({progressId:crypto.randomUUID(),reps:dose.metric==='reps'?dose.target:0,...(dose.metric==='seconds'?{seconds:dose.target}:{}),done:false}))};
    setDraft(old=>{
      if(!old)return old;
      const entries=old.entries.map((entry,i)=>i===old.index?{...entry,sets:entry.sets.filter(set=>set.done)}:entry);
      entries.splice(old.index+1,0,replacement);
      return {...old,entries,index:old.index+1,restEnd:null};
    });
    toast.info(`Switched to ${easier.name}. Completed sets are preserved.`);
  }
  function changeExercise(next: number) {
    setDraft(old => old ? { ...old, index: Math.max(0, Math.min(old.entries.length - 1, next)), restEnd: null } : null);
  }
  function leave() {
    toast.info('Workout saved as a draft on this device.');
    navigate(draft?.returnTo||'/planner');
  }
  async function finishWorkout() {
    if (!draft || saving) return;
    const doneCount = draft.entries.reduce((n, e) => n + e.sets.filter(s => s.done).length, 0);
    if (!doneCount) { toast.error('Complete at least one set before finishing.'); return; }
    setSaving(true);
    try {
      const localNow = new Date();
      const day = new Date(localNow.getTime() - localNow.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
      const entries = draft.entries.filter(e => e.sets.some(s => s.done));
      const notes = `${draft.name}\n${draft.notes}\nDuration: ${timeLabel(Math.floor((Date.now() - draft.startedAt) / 1000))}`;
      if (user) {
        const payload = entries.map(e => ({ section: e.section, exercise_id: e.exercise.id,
          exercise_name: e.exercise.name, sets: e.sets.filter(s => s.done).map(({ done: _done, ...s }) => s) }));
        const { error } = await supabase.from('workouts').insert({ user_id: user.id, date: day, notes, entries: payload });
        if (error) throw error;
      } else {
        const local = getOfflineExercises();
        saveGuestWorkout({
          date: day, notes,
          entries: entries.map(e => {
            const match = local.find(x => x.slug === e.exercise.slug || x.id === e.exercise.id);
            const exercise = match || ({
              id: e.exercise.id, slug: e.exercise.slug || e.exercise.id,
              name: e.exercise.name, category: e.exercise.category,
              primary_muscles: e.exercise.primary_muscles || [],
              secondary_muscles: e.exercise.secondary_muscles || [],
              equipment: e.exercise.equipment || [], cues: e.exercise.cues || [],
              difficulty_level: e.exercise.difficulty_level || 2,
              youtube_url: e.exercise.youtube_url || null,
              created_by: null, visibility: 'public'
            } as OfflineExercise);
            return { exercise_id: e.exercise.id, exercise,
              sets: e.sets.filter(s => s.done).map(({ done: _done, ...s }) => s) };
          })
        });
      }
      localStorage.removeItem(ACTIVE_WORKOUT_KEY);
      setDraft(null);
      toast.success(`Workout finished · ${doneCount} sets recorded!`);
      navigate(draft?.returnTo||'/planner');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save workout. Draft preserved.');
    } finally { setSaving(false); }
  }

  if (!draft || !item) return (
    <main className="power-session min-h-[90vh] flex items-center justify-center px-5">
      <div className="power-elevated max-w-sm w-full p-7 text-center space-y-4">
        <Dumbbell className="mx-auto h-12 w-12 text-primary" />
        <h1 className="text-2xl font-display font-black">Ready when you are.</h1>
        <p className="text-sm text-muted-foreground">Choose a routine or add an exercise to start training.</p>
        <Button className="h-12 w-full" onClick={() => navigate('/build')}>Choose a workout <ArrowRight className="ml-2 h-4 w-4"/></Button>
      </div>
    </main>
  );
  return (
    <main className="power-session min-h-[100dvh] overflow-x-hidden pb-12">
      <div className="max-w-2xl mx-auto px-2.5 min-[360px]:px-4 sm:px-6 pt-[max(0.75rem,env(safe-area-inset-top))] space-y-3 sm:space-y-4">
        <header className="flex items-center justify-between gap-3">
          <button type="button" onClick={leave} aria-label="Leave workout and save draft"
            className="power-hardware shrink-0 h-11 px-3 flex items-center gap-2 text-xs font-bold"><ArrowLeft className="h-4 w-4"/> Exit</button>
          <div className="text-center min-w-0 flex-1">
            <p className="text-[10px] font-mono uppercase tracking-[.18em] text-muted-foreground">Active session</p>
            <h1 className="text-xs sm:text-sm font-black truncate max-w-full">{draft.name}</h1>
          </div>
        </header>
        <div className="power-elevated p-4 space-y-2">
          <div className="flex justify-between items-center text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            <span>Movement {draft.index + 1} / {draft.entries.length}</span>
            <span>{completed}/{setCount} sets</span>
          </div>
          <div role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}
            aria-label="Workout completion" className="h-2.5 rounded-full bg-secondary power-recessed overflow-hidden">
            <div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${percentage}%` }} />
          </div>
        </div>

        {exerciseReadinessReasons(item.exercise,readiness).length>0&&<section className="rounded-xl border border-primary p-4 text-sm" role="status"><p className="font-bold">Use a suitable preparation first</p>{exerciseReadinessReasons(item.exercise,readiness).map(r=><p key={r} className="text-xs mt-2">{r}</p>)}<Button className="min-h-12 mt-3" variant="outline" onClick={regressMovement}>Choose a suitable regression</Button></section>}
        <div className="power-training-cockpit">
        <section id="power-current-exercise" className="space-y-3" aria-label="Current exercise">
          <div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">{item.phaseLabel || exerciseLabel(item.exercise.slug,item.exercise.category)}</p>
              <p className="text-xs font-mono text-muted-foreground"><Clock3 className="w-3 h-3 inline"/> {timeLabel(elapsed)}</p>
            </div>
            <div className="power-active-movement-title"><MovementThumbnail exercise={item.exercise}/><div><h2>{item.exercise.name}</h2><p>{TRAINING_LEVELS[minimumTier(item.exercise.slug)-1].label}</p></div></div>
          </div>
          <details className="power-learn-section"><summary>Watch tutorial</summary><MovementVideo key={item.exercise.id} exercise={item.exercise}/></details>
          <details className="power-learn-section"><summary>How to perform this movement</summary><MovementOverview exercise={item.exercise}/></details>
        </section>
        <section className="power-elevated p-2.5 sm:p-4 space-y-3" aria-label="Log your sets">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-black text-base">Log your sets</h3>
            <span className="text-xs text-muted-foreground">{item.sets.filter(s => s.done).length} of {item.sets.length} done</span>
          </div>
          <details className="border rounded-xl p-3"><summary className="text-xs font-bold cursor-pointer">Technique quality · optional progress logging</summary><label className="text-xs block mt-3">Your quality for these attempts<select className="h-12 w-full bg-card border rounded-lg mt-1 px-2" value={techniqueQuality??''} onChange={e=>setTechniqueQuality(e.target.value?Number(e.target.value):null)}><option value="">Not assessed · workout only</option>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n}/5 · {n<3?'lost control':n===3?'mixed quality':'controlled technique'}</option>)}</select></label><p className="text-[11px] text-muted-foreground mt-2">Only your explicit quality rating contributes to skill consistency. Stop when form deteriorates.</p></details>
          <div className="grid grid-cols-2 gap-2"><Button variant="outline" className="min-h-12 h-auto whitespace-normal py-2 text-xs" disabled={!regressionFor(item.exercise.slug)} onClick={regressMovement}>Use easier step</Button><a className="border rounded-xl min-h-12 grid place-items-center text-xs text-primary" href="#power-current-exercise">Technique / video</a></div>
          {item.sets.map((set,index) => (
            <div key={index} className={`power-set-row grid grid-cols-[1.15rem_minmax(0,1fr)_2.6rem] sm:grid-cols-[1.5rem_minmax(0,1fr)_3rem] gap-1.5 sm:gap-3 items-center p-2 sm:p-3 rounded-xl ${set.done?'is-done':''}`}>
              <span className="w-5 text-xs font-mono font-bold text-muted-foreground">{index+1}</span>
              <div className="flex min-w-0 justify-center items-center gap-1 sm:gap-2">
                <button type="button" disabled={set.done} onClick={() => modifySet(index, s => s.seconds !== undefined ? { ...s, seconds: Math.max(1, s.seconds - 5) } : { ...s, reps: Math.max(0, s.reps - 1) })}
                  className="power-hardware power-rep-button" aria-label={`Decrease ${set.seconds !== undefined ? 'seconds' : 'reps'} for set ${index+1}`}><Minus className="w-5 h-5"/></button>
                <div className="text-center power-recessed rounded-xl px-1.5 py-1.5 min-w-[46px] sm:min-w-[70px]">
                  <span className="text-2xl font-black tabular-nums">{set.seconds !== undefined ? set.seconds : set.reps}</span>
                  <span className="block text-[9px] uppercase tracking-widest text-muted-foreground">{set.seconds !== undefined ? 'seconds' : 'reps'}</span>
                </div>
                <button type="button" disabled={set.done} onClick={() => modifySet(index, s => s.seconds !== undefined ? { ...s, seconds: Math.min(300, s.seconds + 5) } : { ...s, reps: Math.min(999, s.reps + 1) })}
                  className="power-hardware power-rep-button" aria-label={`Increase ${set.seconds !== undefined ? 'seconds' : 'reps'} for set ${index+1}`}><Plus className="w-5 h-5"/></button>
              </div>
              <button type="button" onClick={() => finishSet(index)} aria-pressed={set.done}
                className={`power-hardware h-12 w-12 grid place-items-center ${set.done ? 'power-done' : ''}`}
                aria-label={`Mark set ${index+1} ${set.done ? 'incomplete' : 'complete'}`}>
                {set.done ? <CheckCircle2 className="h-6 w-6"/> : <Check className="h-6 w-6"/>}
              </button>
            </div>
          ))}
          <button type="button" className="power-hardware min-h-11 w-full text-sm font-bold flex items-center justify-center gap-2"
            onClick={() => setDraft(old => old ? { ...old, entries: old.entries.map((e,i) =>
              i === old.index ? { ...e, sets: [...e.sets, { progressId: crypto.randomUUID(), reps: e.sets[e.sets.length-1]?.reps ?? 10, ...(e.sets[e.sets.length-1]?.seconds !== undefined ? {seconds:e.sets[e.sets.length-1].seconds} : {}), done: false }] } : e) } : null)}>
            <Plus className="h-4 w-4"/> Add another set
          </button>
        </section>
        <section className="power-elevated p-3 sm:p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-mono tracking-wider uppercase text-muted-foreground">Rest timer</p>
              <p className="font-display text-3xl font-black tabular-nums">{timeLabel(seconds)}</p>
            </div>
            <div className="flex gap-1.5 items-center">
              <button type="button" className="power-hardware h-11 px-3 text-xs font-bold"
                onClick={() => setRestDuration(v => v===60?90:v===90?120:v===120?150:v===150?180:60)} aria-label="Change rest duration">
                {restDuration}s
              </button>
              <button type="button" className="power-hardware h-11 w-11 grid place-items-center"
                onClick={() => setDraft(old => old ? { ...old, restEnd: seconds>0 ? null : Date.now()+restDuration*1000 } : null)}
                aria-label={seconds>0?"Cancel rest timer":"Start rest timer"}>
                {seconds>0?<Pause className="h-5 w-5"/>:<Play className="h-5 w-5"/>}
              </button>
              <button type="button" className="power-hardware h-11 w-11 grid place-items-center"
                onClick={() => setDraft(old=> old?{...old,restEnd:Date.now()+restDuration*1000}:null)}
                aria-label="Restart rest timer"><TimerReset className="h-5 w-5"/></button>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">Automatically starts when you complete a set. Skill-specific starting rest; adjust between 60 and 180 seconds.</p>
        </section>
        </div>
        <div className="power-workout-actions sticky bottom-0 z-30 grid grid-cols-3 gap-2 rounded-t-2xl border-t border-border/60 bg-background/95 p-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-lg">
          <Button variant="outline" className="h-14 font-bold rounded-2xl" disabled={draft.index===0}
            onClick={() => changeExercise(draft.index-1)}><ChevronLeft className="h-5 w-5 mr-1"/> Back</Button>
          <Button className="min-h-14 rounded-2xl px-2 font-black text-xs min-[360px]:text-sm col-span-2"
            onClick={draft.index===draft.entries.length-1 ? finishWorkout : () => changeExercise(draft.index+1)}
            disabled={saving}>
            {draft.index===draft.entries.length-1 ? (saving?'Saving…':'Finish & Save') : 'Next Exercise'}
            {draft.index===draft.entries.length-1 ? <Trophy className="ml-2 h-5 w-5"/> : <ArrowRight className="ml-2 h-5 w-5"/>}
          </Button>
        </div>
        {draft.index!==draft.entries.length-1 && <button type="button" className="block mx-auto pb-5 text-xs text-muted-foreground underline"
          onClick={finishWorkout} disabled={saving}>Finish early and save completed sets</button>}
      </div>
    </main>
  );
}
