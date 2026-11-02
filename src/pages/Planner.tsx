import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { saveGuestWorkout } from '@/lib/offlineWorkouts';
import { getOfflineExercises, type OfflineExercise } from '@/lib/offlineExercises';
import publicCatalog from '@/data/publicExerciseCatalog.json';
import { useTheme } from '@/components/ThemeSwitcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ExercisePickerModal } from '@/components/Workout/ExercisePickerModal';
import { SetTracker } from '@/components/Workout/SetTracker';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Flame, Dumbbell, Snowflake, Heart, Plus, Trash2, ChevronDown, ChevronUp, Save, FileText, GripVertical, ArrowLeft, Sparkles, Loader2, Target, ArrowRight,
} from 'lucide-react';

interface Exercise {
  id: string; name: string; slug: string; category: string;
  primary_muscles: string[]; secondary_muscles?: string[];
  youtube_url?: string | null; equipment?: string[];
  cues?: any; image_url?: string | null; difficulty_level?: number;
  sets_reps?: string | null; description?: string | null;
  instagram_url?: string | null;
}

interface WorkoutEntry {
  exercise: Exercise;
  sets: { reps: number; weight?: number }[];
}

interface WorkoutSection {
  key: string;
  label: string;
  icon: typeof Flame;
  color: string;
  entries: WorkoutEntry[];
  open: boolean;
}

const SECTION_DEFAULTS: Omit<WorkoutSection, 'entries' | 'open'>[] = [
  { key: 'warmup', label: 'Warm-Up', icon: Flame, color: 'hsl(var(--cat-core))' },
  { key: 'workout', label: 'Workout', icon: Dumbbell, color: 'hsl(var(--cat-pull))' },
  { key: 'cooldown', label: 'Cool-Down', icon: Snowflake, color: 'hsl(var(--cat-mobility))' },
  { key: 'compression', label: 'Compression', icon: Heart, color: 'hsl(var(--cat-push))' },
];

const QUICK_TEMPLATES = [
  { label: 'Push', tag: 'Push Day', categories: ['Push'] },
  { label: 'Pull', tag: 'Pull Day', categories: ['Pull'] },
  { label: 'Legs', tag: 'Leg Day', categories: ['Legs'] },
  { label: 'Full', tag: 'Full Body', categories: ['Push', 'Pull', 'Legs'] },
];

export default function Planner() {
  const { user } = useAuth();
  const { theme, setTheme, themes } = useTheme();
  const navigate = useNavigate();
  const [workoutName, setWorkoutName] = useState('');
  const [notes, setNotes] = useState('');
  const [sections, setSections] = useState<WorkoutSection[]>(
    SECTION_DEFAULTS.map(s => ({ ...s, entries: [], open: s.key === 'workout' }))
  );
  const [pickerSection, setPickerSection] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [coachOpen, setCoachOpen] = useState(false);
  const [coachPrompt, setCoachPrompt] = useState('');
  const [coachLoading, setCoachLoading] = useState(false);

  const runSuperCoach = async (prompt: string) => {
    if (!prompt.trim()) return;
    setCoachLoading(true);
    try {
      const res = await supabase.functions.invoke('discover-exercises', {
        body: { query: `Build a complete workout with warm-up, main workout, cool-down and compression sections. Request: ${prompt}` },
      });
      if (res.error) throw new Error(res.error.message);
      const exercises = res.data?.exercises || [];
      if (!exercises.length) { toast.error('Coach returned no exercises'); return; }
      const sectionFor = (cat: string): string => {
        const c = (cat || '').toLowerCase();
        if (['mobility', 'flexibility'].includes(c)) return 'warmup';
        if (['yoga'].includes(c)) return 'cooldown';
        return 'workout';
      };
      setWorkoutName(prev => prev || `Coach: ${prompt.slice(0, 40)}`);
      setSections(prev => prev.map(s => {
        const items = exercises.filter((e: any) => sectionFor(e.category) === s.key);
        return {
          ...s,
          open: s.key === 'workout' || items.length > 0,
          entries: [
            ...s.entries,
            ...items.map((e: any) => ({
              exercise: {
                id: e.name, name: e.name, slug: e.name, category: e.category,
                primary_muscles: e.primary_muscles || [], cues: e.cues,
                youtube_url: e.youtube_url || null, difficulty_level: e.difficulty,
              } as Exercise,
              sets: [{ reps: 10 }, { reps: 10 }, { reps: 10 }],
            })),
          ],
        };
      }));
      toast.success(`Coach added ${exercises.length} exercises`);
      setCoachOpen(false);
      setCoachPrompt('');
    } catch (err: any) {
      toast.error(err.message || 'Coach failed');
    } finally {
      setCoachLoading(false);
    }
  };

  // Consume AI Coach handoff (sessionStorage)
  useEffect(() => {
    const raw = sessionStorage.getItem('powa-builder-import');
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { name?: string; items: { name: string; section: string; exercise?: Exercise }[] };
      if (parsed.name) setWorkoutName(parsed.name);
      setSections(prev => prev.map(s => {
        const items = parsed.items.filter(i => i.section === s.key);
        return {
          ...s,
          open: s.key === 'workout' || items.length > 0,
          entries: [
            ...s.entries,
            ...items.map(i => ({
              exercise: i.exercise || ({ id: i.name, name: i.name, slug: i.name, category: '', primary_muscles: [] } as Exercise),
              sets: [{ reps: 10 }],
            })),
          ],
        };
      }));
      sessionStorage.removeItem('powa-builder-import');
      toast.success('Imported from AI Coach');
    } catch {/* noop */}
  }, []);

  const loadTemplate = async (tpl: typeof QUICK_TEMPLATES[number]) => {
    // Templates must work for guests and during Supabase outages.
    const builtIn = [...publicCatalog, ...getOfflineExercises()] as Exercise[];
    let catalog: Exercise[] = builtIn;
    try {
      const { data } = await supabase.from('exercises').select('*')
        .in('category', tpl.categories).order('name').limit(300);
      if (data?.length) catalog = [...data as Exercise[], ...builtIn];
    } catch { /* Keep locally bundled catalog usable. */ }
    const matched = [...new Map(catalog.filter(e => tpl.categories.includes(e.category))
      .map(e => [e.slug || e.name.toLowerCase(), e])).values()];
    const chosen = matched.slice(0, Math.min(5, matched.length));
    if (!chosen.length) { toast.error('No matching exercises found'); return; }
    setWorkoutName(tpl.tag);
    setSections(prev => prev.map(s => s.key === 'workout'
      ? { ...s, open: true, entries: chosen.map(e => ({
          exercise: e, sets: [{ reps: 10 }, { reps: 10 }, { reps: 10 }]
        })) } : s));
    toast.success(`${tpl.tag} ready · ${chosen.length} exercises`);
  };

  const toggleSection = (key: string) => {
    setSections(prev => prev.map(s => s.key === key ? { ...s, open: !s.open } : s));
  };

  const addExercise = (sectionKey: string, exercise: Exercise) => {
    setSections(prev => prev.map(s =>
      s.key === sectionKey
        ? { ...s, entries: [...s.entries, { exercise, sets: [{ reps: 10 }] }] }
        : s
    ));
  };

  const removeEntry = (sectionKey: string, idx: number) => {
    setSections(prev => prev.map(s =>
      s.key === sectionKey
        ? { ...s, entries: s.entries.filter((_, i) => i !== idx) }
        : s
    ));
  };

  const updateSets = (sectionKey: string, idx: number, sets: { reps: number; weight?: number }[]) => {
    setSections(prev => prev.map(s =>
      s.key === sectionKey
        ? { ...s, entries: s.entries.map((e, i) => i === idx ? { ...e, sets } : e) }
        : s
    ));
  };

  const totalExercises = sections.reduce((sum, s) => sum + s.entries.length, 0);
  const beginActiveWorkout = () => {
    if (localStorage.getItem('power-active-workout-v2') && !window.confirm('Replace the unfinished workout? Choose Cancel to preserve it, then use Resume.')) return;
    const entries = sections.flatMap(section => section.entries.map(entry => ({
      section: section.key,
      exercise: entry.exercise,
      sets: entry.sets.map(set => ({ ...set, done: false })),
    })));
    if (!entries.length) { toast.error('Choose a routine or add an exercise first'); return; }
    localStorage.setItem('power-active-workout-v2', JSON.stringify({
      name: workoutName.trim() || 'My Workout',
      notes, entries, index: 0, restEnd: null, startedAt: Date.now(),
    }));
    navigate('/workout');
  };


  const saveWorkout = async () => {
    if (totalExercises === 0) { toast.error('Add at least one exercise'); return; }
    setSaving(true);
    try {
      const entries = sections.flatMap(s =>
        s.entries.map(e => ({
          section: s.key,
          exercise_id: e.exercise.id,
          exercise_name: e.exercise.name,
          sets: e.sets,
        }))
      );
      if (!user) {
        const library = getOfflineExercises();
        saveGuestWorkout({
          date: new Date().toISOString().slice(0, 10),
          notes: `${workoutName ? workoutName + '\n' : ''}${notes}`,
          entries: sections.flatMap(s => s.entries.map(e => ({
            exercise_id: e.exercise.id,
            exercise: (library.find(item => item.id === e.exercise.id) || {
              ...e.exercise, created_by: null, visibility: 'public',
              secondary_muscles: [], equipment: e.exercise.equipment || [],
              cues: Array.isArray(e.exercise.cues) ? e.exercise.cues : [],
              difficulty_level: e.exercise.difficulty_level || 2,
            }) as OfflineExercise,
            sets: e.sets,
          }))),
        });
        toast.success('Workout saved on this device');
        setSections(SECTION_DEFAULTS.map(s => ({ ...s, entries: [], open: s.key === 'workout' })));
        setWorkoutName('');
        setNotes('');
        return;
      }
      const { error } = await supabase.from('workouts').insert({
        user_id: user.id,
        date: new Date().toISOString().slice(0, 10),
        entries,
        notes: `${workoutName ? workoutName + '\n' : ''}${notes}`,
      });
      if (error) throw error;
      toast.success('Workout saved!');
      // Reset
      setSections(SECTION_DEFAULTS.map(s => ({ ...s, entries: [], open: s.key === 'workout' })));
      setWorkoutName('');
      setNotes('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-0">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 md:px-8 min-h-14 py-1 flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="h-10 w-10 rounded-xl flex-shrink-0" aria-label="Back to home">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="hidden sm:flex w-10 h-10 rounded-xl bg-primary/10 border border-border/30 items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-sm sm:text-base font-bold tracking-tight truncate">Start Workout</h1>
              <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-[0.2em]">
                {totalExercises} exercise{totalExercises !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              onClick={() => setCoachOpen(true)}
              size="sm"
              variant="outline"
              className="h-10 w-10 sm:w-auto sm:px-3 text-[10px] font-mono uppercase tracking-wider rounded-xl gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--electric))]" />
              <span className="hidden sm:inline">Coach</span>
            </Button>
            <Button
              onClick={saveWorkout}
              disabled={saving || totalExercises === 0}
              size="sm"
              className="h-9 text-[10px] font-mono uppercase tracking-wider rounded-xl gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save'}</span>
            </Button>
          </div>
        </div>
      </header>

      <Dialog open={coachOpen} onOpenChange={setCoachOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-md max-h-[90dvh] overflow-y-auto rounded-2xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <Sparkles className="w-4 h-4 text-[hsl(var(--electric))]" />
              Super Coach
            </DialogTitle>
            <DialogDescription>
              Describe your goal — Coach will build a full workout with warm-up, main sets, cool-down and compression.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="e.g. Push day focused on planche progressions, 45 minutes, intermediate"
            value={coachPrompt}
            onChange={e => setCoachPrompt(e.target.value)}
            rows={4}
            className="rounded-xl"
          />
          <div className="flex flex-wrap gap-1.5">
            {['Full body 40min', 'Push + core', 'Pull day intermediate', 'Mobility flow', 'Beginner legs'].map(s => (
              <button
                key={s}
                onClick={() => setCoachPrompt(s)}
                className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-lg border border-border/60 hover:bg-accent/40"
              >{s}</button>
            ))}
          </div>
          <Button
            onClick={() => runSuperCoach(coachPrompt)}
            disabled={coachLoading || !coachPrompt.trim()}
            className="w-full h-11 rounded-xl gap-2"
          >
            {coachLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {coachLoading ? 'Building...' : 'Build Workout'}
          </Button>
        </DialogContent>
      </Dialog>

      <main className="max-w-3xl mx-auto px-3 sm:px-4 md:px-8 py-4 space-y-4 pb-28 md:pb-8">
        <section className="power-theme-stage power-elevated relative overflow-hidden p-4 sm:p-5 space-y-4">
          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-mono font-bold uppercase tracking-[.2em] text-primary">POWER / TRAINING STUDIO</p>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl font-black tracking-tight">Pick. Train. Done.</h2>
              <p className="mt-2 max-w-sm text-xs sm:text-sm leading-relaxed text-muted-foreground">Choose your routine, follow your exercises, and track your progress without the clutter.</p>
            </div>
            <span className="power-theme-emblem flex h-12 w-12 shrink-0 items-center justify-center" aria-hidden="true">
              <Dumbbell className="h-6 w-6" />
            </span>
          </div>
          <div className="relative z-10 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">Choose your gym atmosphere</p>
              <span className="text-[10px] font-bold text-primary">{themes.find(item=>item.id===theme)?.name}</span>
            </div>
            <div className="power-theme-rail flex gap-2 overflow-x-auto pb-2" aria-label="Gym themes">
              {themes.map(item => (
                <button type="button" key={item.id} aria-pressed={theme === item.id}
                  onClick={() => setTheme(item.id)}
                  className={`power-theme-option flex shrink-0 min-w-[124px] flex-col gap-1.5 rounded-xl border px-3 py-2.5 text-left transition-[border-color,box-shadow] ${theme === item.id ? 'is-selected border-primary' : 'border-border bg-card'}`}>
                  <span className="flex h-2.5 w-14 overflow-hidden rounded-full">
                    <span className="h-full flex-[3]" style={{backgroundColor:item.primary}}/>
                    <span className="h-full flex-[2]" style={{backgroundColor:item.accent}}/>
                    <span className="h-full flex-1 border-l border-border/40" style={{backgroundColor:item.bg}}/>
                  </span>
                  <span className="text-xs font-bold whitespace-nowrap">{item.name}</span>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{item.tagline.split(' · ').slice(0,2).join(' · ')}</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {theme === 'vasa' ? 'Studio steel · racing-red performance markings · white instrument faces' :
               theme === 'ymca' ? 'Blue-and-teal movement studio · rounded controls · welcoming light surfaces' :
               theme === 'planet-fitness' ? 'Carbon-black equipment panels · rich violet · warm-gold highlights' :
               theme === 'okc-thunder' ? 'Midnight-blue arena · court-line details · energetic orange trim' :
               'Obsidian training hardware · metallic-gold controls · dark premium surfaces'}
            </p>
          </div>
        </section>

        {localStorage.getItem('power-active-workout-v2') && (
          <Button type="button" variant="outline" className="power-elevated h-12 w-full rounded-2xl font-bold"
            onClick={() => navigate('/workout')}>
            Resume Unfinished Workout <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
          </Button>
        )}

        <button type="button" onClick={()=>navigate('/build')}
          className="power-skill-builder-cta power-elevated flex w-full items-center gap-3 p-3.5 text-left focus-visible:outline-4 focus-visible:outline-primary">
          <span className="power-theme-emblem flex h-12 w-12 shrink-0 items-center justify-center"><Target className="h-6 w-6"/></span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-base font-black">Build by Skill</span>
            <span className="block text-[11px] leading-relaxed text-muted-foreground">Planche, Handstand, Rings + more · pick your time · start</span>
          </span>
          <ArrowRight className="h-5 w-5 shrink-0 text-primary"/>
        </button>

        {/* Workout name */}
        <Input
          placeholder="Workout name (e.g. Push Day, Full Body)"
          value={workoutName}
          onChange={e => setWorkoutName(e.target.value)}
          className="h-12 rounded-xl border-border/50 bg-card font-display font-bold text-base placeholder:font-normal placeholder:text-muted-foreground"
        />

        {/* Quick start templates */}
        <div>
          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2 px-1">Quick Start</p>
          <div className="grid grid-cols-4 gap-2">
            {QUICK_TEMPLATES.map(tpl => (
              <button
                key={tpl.label}
                onClick={() => loadTemplate(tpl)}
                className="h-11 rounded-xl border border-border/50 bg-card hover:border-border hover:-translate-y-0.5 hover:shadow-sm transition-all text-[10px] font-mono uppercase tracking-[0.15em] font-bold"
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>


        <Button type="button" size="lg" onClick={() => setPickerSection('workout')}
          className="w-full h-14 rounded-2xl font-display font-black text-sm uppercase tracking-wide power-skeuo-button">
          <Plus className="h-5 w-5 mr-2" /> Add an Exercise
        </Button>
        <button type="button" className="text-xs text-muted-foreground underline underline-offset-4"
          onClick={() => setShowAdvanced(value => !value)}>
          {showAdvanced ? 'Hide warm-up and recovery sections' : 'Add warm-up, mobility, or cool-down'}
        </button>

        {totalExercises > 0 && (
          <Button type="button" onClick={beginActiveWorkout}
            className="power-primary-action sticky top-[4rem] z-20 w-full min-h-14 px-2 rounded-2xl text-xs sm:text-sm font-display font-black tracking-wide uppercase">
            <Dumbbell className="h-5 w-5 mr-1 shrink-0" /> <span className="sm:hidden">Start Session · {totalExercises}</span><span className="hidden sm:inline">Begin Guided Workout · {totalExercises} Exercises</span>
          </Button>
        )}

        {/* Sections */}
        {sections.filter(section => section.key === 'workout' || showAdvanced || section.entries.length > 0).map(section => {
          const Icon = section.icon;
          return (
            <div key={section.key} className="rounded-2xl border border-border/50 bg-card overflow-hidden">
              {/* Section header */}
              <button
                onClick={() => toggleSection(section.key)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-accent/30 transition-colors"
              >
                <div
                  className="w-1.5 h-10 rounded-full flex-shrink-0"
                  style={{ backgroundColor: section.color }}
                />
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${section.color}20` }}>
                  <Icon className="w-4 h-4" style={{ color: section.color }} />
                </div>
                <div className="flex-1">
                  <p className="font-display text-sm font-bold tracking-tight">{section.label}</p>
                  <p className="text-[9px] font-mono text-muted-foreground">
                    {section.entries.length} exercise{section.entries.length !== 1 ? 's' : ''}
                  </p>
                </div>
                {section.open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>

              {/* Section content */}
              {section.open && (
                <div className="px-4 pb-4 space-y-2">
                  {section.entries.map((entry, idx) => (
                    <div key={idx} className="rounded-xl border border-border/40 bg-accent/10 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-3 h-3 text-muted-foreground/40" />
                          <p className="text-xs font-bold truncate">{entry.exercise.name}</p>
                        </div>
                        <button onClick={() => removeEntry(section.key, idx)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <SetTracker
                        sets={entry.sets}
                        onChange={sets => updateSets(section.key, idx, sets)}
                      />
                    </div>
                  ))}

                  <button
                    onClick={() => setPickerSection(section.key)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-border/50 text-muted-foreground hover:text-foreground hover:border-border transition-all text-xs font-mono"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Exercise
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Notes */}
        <div className="rounded-2xl border border-border/50 bg-card p-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Notes</p>
          <Textarea
            placeholder="Workout notes, how you felt, etc..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="min-h-[80px] rounded-xl border-border/40 bg-accent/10 text-sm"
          />
        </div>
      </main>

      {/* Exercise Picker */}
      <ExercisePickerModal
        open={!!pickerSection}
        onClose={() => setPickerSection(null)}
        onSelectExercise={(exercise) => {
          if (pickerSection) addExercise(pickerSection, exercise);
          setPickerSection(null);
        }}
      />
    </div>
  );
}
