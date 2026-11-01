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
interface WorkoutSet { reps: number; weight?: number; rpe?: number; done: boolean }
interface SessionEntry { section: string; exercise: ActiveExercise; sets: WorkoutSet[] }
interface SessionDraft { name: string; notes: string; entries: SessionEntry[]; index: number; restEnd: number | null; startedAt: number }

function readDraft(): SessionDraft | null {
  try {
    const raw = localStorage.getItem(ACTIVE_WORKOUT_KEY);
    if (!raw) return null;
    const value: SessionDraft = JSON.parse(raw);
    if (!Array.isArray(value.entries) || !value.entries.length) return null;
    const entries = value.entries.filter(entry => entry.exercise && Array.isArray(entry.sets))
      .map(entry => ({
        ...entry,
        sets: entry.sets.map(set => ({ reps: Math.max(0, Number(set.reps) || 0), weight: set.weight, rpe: set.rpe, done: Boolean(set.done) }))
      }));
    if (!entries.length) return null;
    return { name: value.name || 'Workout', notes: value.notes || '', entries,
      index: Math.max(0, Math.min(entries.length - 1, Number(value.index) || 0)),
      restEnd: typeof value.restEnd === 'number' ? value.restEnd : null,
      startedAt: Number(value.startedAt) || Date.now() };
  } catch { return null; }
}

const timeLabel = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

export default function ActiveWorkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, setTheme, themes } = useTheme();
  const [draft, setDraft] = useState<SessionDraft | null>(readDraft);
  const [now, setNow] = useState(Date.now());
  const [restDuration, setRestDuration] = useState(60);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (draft) localStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(draft));
  }, [draft]);
  const item = draft?.entries[draft.index];
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
    const wasDone = Boolean(item?.sets[setIndex]?.done);
    modifySet(setIndex, set => ({ ...set, done: !set.done }));
    if (!wasDone) {
      setDraft(old => old ? { ...old, restEnd: Date.now() + restDuration * 1000 } : old);
    }
  }
  function changeExercise(next: number) {
    setDraft(old => old ? { ...old, index: Math.max(0, Math.min(old.entries.length - 1, next)), restEnd: null } : null);
  }
  function leave() {
    toast.info('Workout saved as a draft on this device.');
    navigate('/planner');
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
      navigate('/planner');
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
        <Button className="h-12 w-full" onClick={() => navigate('/planner')}>Choose a workout <ArrowRight className="ml-2 h-4 w-4"/></Button>
      </div>
    </main>
  );
  return (
    <main className="power-session min-h-screen pb-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-[max(1rem,env(safe-area-inset-top))] space-y-4">
        <header className="flex items-center justify-between gap-3">
          <button type="button" onClick={leave} aria-label="Leave workout and save draft"
            className="power-hardware h-11 px-3 flex items-center gap-2 text-xs font-bold"><ArrowLeft className="h-4 w-4"/> Exit</button>
          <div className="text-center min-w-0">
            <p className="text-[10px] font-mono uppercase tracking-[.18em] text-muted-foreground">Active session</p>
            <h1 className="text-sm font-black truncate">{draft.name}</h1>
          </div>
          <button type="button" className="power-hardware h-11 w-11 flex items-center justify-center" aria-label="Change gym colors"
            onClick={() => { const idx=themes.findIndex(t => t.id === theme); setTheme(themes[(idx + 1) % themes.length].id); }}>
            <span className="h-5 w-5 rounded-full border-2 border-card" style={{ background: themes.find(t => t.id === theme)?.primary }} />
          </button>
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
        <section className="space-y-3" aria-label="Current exercise">
          <div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">{item.exercise.category}</p>
              <p className="text-xs font-mono text-muted-foreground"><Clock3 className="w-3 h-3 inline"/> {timeLabel(elapsed)}</p>
            </div>
            <h2 className="mt-1 text-3xl font-display font-black leading-tight tracking-tight">{item.exercise.name}</h2>
            {!!item.exercise.primary_muscles?.length && <p className="mt-1 text-xs text-muted-foreground">{item.exercise.primary_muscles.join(' · ')}</p>}
          </div>
          {item.exercise.youtube_url ? (
            <div className="power-recessed overflow-hidden rounded-2xl border-4 border-secondary">
              <VideoPlayer key={item.exercise.id} thumbnailMode youtubeUrl={item.exercise.youtube_url}
                title={item.exercise.name} className="border-0 rounded-none"/>
            </div>
          ) : (
            <div className="power-recessed rounded-2xl p-5 flex gap-3 items-center text-muted-foreground text-sm">
              <Video className="h-5 w-5 shrink-0"/> Tutorial unavailable; form cues and logging still work.
            </div>
          )}
          {cues.length > 0 && (
            <details className="power-elevated rounded-2xl p-3">
              <summary className="cursor-pointer font-bold text-xs uppercase tracking-wider">Form cues · tap for guidance</summary>
              <ol className="mt-3 space-y-2">{cues.map((cue,i)=><li key={i} className="text-xs text-muted-foreground">{i+1}. {cue}</li>)}</ol>
            </details>
          )}
        </section>
        <section className="power-elevated p-4 space-y-3" aria-label="Log your sets">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-black text-base">Log your sets</h3>
            <span className="text-xs text-muted-foreground">{item.sets.filter(s => s.done).length} of {item.sets.length} done</span>
          </div>
          {item.sets.map((set,index) => (
            <div key={index} className={`power-set-row grid grid-cols-[auto_1fr_auto] gap-3 items-center p-3 rounded-xl ${set.done?'is-done':''}`}>
              <span className="w-7 text-xs font-mono font-bold text-muted-foreground">{index+1}</span>
              <div className="flex justify-center items-center gap-2">
                <button type="button" disabled={set.done} onClick={() => modifySet(index, s => ({ ...s, reps: Math.max(0, s.reps - 1) }))}
                  className="power-hardware power-rep-button" aria-label={`Decrease reps for set ${index+1}`}><Minus className="w-5 h-5"/></button>
                <div className="text-center power-recessed rounded-xl px-3 py-1.5 min-w-[70px]">
                  <span className="text-2xl font-black tabular-nums">{set.reps}</span>
                  <span className="block text-[9px] uppercase tracking-widest text-muted-foreground">reps</span>
                </div>
                <button type="button" disabled={set.done} onClick={() => modifySet(index, s => ({ ...s, reps: Math.min(999, s.reps + 1) }))}
                  className="power-hardware power-rep-button" aria-label={`Increase reps for set ${index+1}`}><Plus className="w-5 h-5"/></button>
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
              i === old.index ? { ...e, sets: [...e.sets, { reps: e.sets[e.sets.length-1]?.reps ?? 10, done: false }] } : e) } : null)}>
            <Plus className="h-4 w-4"/> Add another set
          </button>
        </section>
        <section className="power-elevated p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-mono tracking-wider uppercase text-muted-foreground">Rest timer</p>
              <p className="font-display text-3xl font-black tabular-nums">{timeLabel(seconds)}</p>
            </div>
            <div className="flex gap-2 items-center">
              <button type="button" className="power-hardware h-11 px-3 text-xs font-bold"
                onClick={() => setRestDuration(v => v===60?90:v===90?120:60)} aria-label="Change rest duration">
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
          <p className="text-[11px] text-muted-foreground">Automatically starts when you complete a set. Change rest to 60, 90, or 120 seconds.</p>
        </section>
        <div className="grid grid-cols-3 gap-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button variant="outline" className="h-14 font-bold rounded-2xl" disabled={draft.index===0}
            onClick={() => changeExercise(draft.index-1)}><ChevronLeft className="h-5 w-5 mr-1"/> Back</Button>
          <Button className="h-14 rounded-2xl font-black text-sm col-span-2"
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
