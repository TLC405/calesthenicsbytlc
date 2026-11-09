import { MovementThumbnail } from '@/components/Exercise/MovementThumbnail';
import { readTrainingProfile, writeTrainingProfile, trainingBlockers } from '@/lib/skillGraph';
import { getSkillPath } from '@/data/skillPaths';
import { minimumTier } from '@/lib/trainingPolicy';
import { TrainingLevelControls } from '@/components/Progression/TrainingLevelControls';
import { WorkoutCoach } from '@/components/Workout/WorkoutCoach';
import { readCustomDraft, writeCustomDraft, startingSets, customEntryReasons, savedCustomPlans, saveCustomPlan, type CustomPlan, type PlannedSet } from '@/lib/customWorkoutDraft';
import type { SkillExercise } from '@/lib/skillWorkoutBuilder';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { getOfflineExercises } from '@/lib/offlineExercises';
import publicCatalog from '@/data/publicExerciseCatalog.json';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ExercisePickerModal } from '@/components/Workout/ExercisePickerModal';
import { SetTracker } from '@/components/Workout/SetTracker';
import { toast } from 'sonner';
import {
  Flame, Dumbbell, Snowflake, Heart, Plus, Trash2, ChevronDown, ChevronUp, Save, FileText, GripVertical, ArrowLeft, Sparkles, ArrowRight,
} from 'lucide-react';

interface Exercise {
  id: string; name: string; slug: string; category: string;
  primary_muscles: string[]; secondary_muscles?: string[];
  youtube_url?: string | null; equipment?: string[];
  cues?: unknown; image_url?: string | null; difficulty_level?: number;
  sets_reps?: string | null; description?: string | null;
  instagram_url?: string | null;
}

interface WorkoutEntry {
  exercise: Exercise;
  sets: PlannedSet[];
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

interface QuickTemplate { label: string; tag: string; categories: string[]; pathId?: string }
const QUICK_TEMPLATES: QuickTemplate[] = [
  { label: 'Push', tag: 'Push Strength', categories: ['Push'] },
  { label: 'Pull', tag: 'Pull Strength', categories: ['Pull'] },
  { label: 'Legs', tag: 'Lower Body Strength', categories: ['Legs'] },
  { label: 'Full', tag: 'Full Body', categories: ['Push', 'Pull', 'Legs','Core'] },
  { label: 'Planche', tag: 'Planche Skill Practice', categories: [], pathId: 'planche' },
  { label: 'Straight Arm', tag: 'Straight-Arm Strength', categories: [], pathId: 'straight-arm' },
  { label: 'Handstand', tag: 'Handstands', categories: [], pathId: 'handstand' },
  { label: 'Grip', tag: 'Grip & Hangs', categories: [], pathId: 'grip-support' },
  { label: 'Pinch', tag: 'Pinch & Crush Grip', categories: [], pathId: 'grip-pinch' },
  { label: 'Wrist', tag: 'Wrist & Forearm Strength', categories: [], pathId: 'grip-wrist' },
  { label: 'Human Flag', tag: 'Human Flag', categories: [], pathId: 'human-flag' },
  { label: 'Front Lever', tag: 'Front Lever', categories: [], pathId: 'front-lever' },
  { label: 'Back Lever', tag: 'Back Lever', categories: [], pathId: 'back-lever' },
  { label: 'Rings', tag: 'Rings', categories: [], pathId: 'rings' },
  { label: 'Ring Muscle-up', tag: 'Ring Muscle-up', categories: [], pathId: 'ring-muscle-up' },
  { label: 'Iron Cross', tag: 'Iron Cross Preparation', categories: [], pathId: 'iron-cross' },
  { label: 'Core', tag: 'Core & Compression', categories: [], pathId: 'core-control' },
  { label: 'Calves', tag: 'Calves & Tibialis', categories: [], pathId: 'calves-tibialis' },
  { label: 'Mobility', tag: 'Mobility', categories: [], pathId: 'recovery' },
  { label: 'Press', tag: 'Press Handstands', categories: [], pathId: 'straddle-press' },
];

export default function Planner(){const {user,loading}=useAuth();if(loading)return <main className="power-simple-page"><p>Opening your workout builder…</p></main>;return <PlannerEditor key={user?.id||'guest'} owner={user?.id||'guest'}/>;}
function PlannerEditor({owner}:{owner:string}) {
  const navigate = useNavigate();
  const [initialDraft]=useState(()=>readCustomDraft(owner));
  const [guestDraft]=useState(()=>owner!=='guest'?readCustomDraft('guest'):null);
  const [savedPlans,setSavedPlans]=useState(()=>savedCustomPlans(owner));
  const [workoutName, setWorkoutName] = useState(initialDraft?.name||'');
  const [notes, setNotes] = useState(initialDraft?.notes||'');
  const [sections, setSections] = useState<WorkoutSection[]>(
    SECTION_DEFAULTS.map(s => ({ ...s, entries: initialDraft?.sections.find(section=>section.key===s.key)?.entries as WorkoutEntry[]||[], open: s.key === 'workout' }))
  );
  const [pickerSection, setPickerSection] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [templateDifficulty, setTemplateDifficulty] = useState(0);
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [coachOpen, setCoachOpen] = useState(()=>new URLSearchParams(window.location.search).get('coach')==='1');
  const [profile,setProfile]=useState(readTrainingProfile);
  const [comfortable,setComfortable]=useState(false);
  useEffect(()=>{try{writeCustomDraft(owner,{name:workoutName,notes,sections});}catch{toast.error('Device storage is full. This draft could not be saved.');}},[owner,workoutName,notes,sections]);
  const addCoachExercises=(exercises:SkillExercise[])=>{
    const profile=readTrainingProfile();const existing=new Set(sections.flatMap(s=>s.entries.map(e=>e.exercise.slug)));
    const accepted=exercises.filter(e=>!existing.has(e.slug)&&!customEntryReasons(e,profile).length);
    if(!accepted.length){toast.info('Already added, or preparation is needed.');return;}
    setSections(prev=>prev.map(s=>s.key==='workout'?{...s,open:true,entries:[...s.entries,...accepted.map(exercise=>({exercise,sets:startingSets(exercise.slug)}))]}:s));
    toast.success(`${accepted.length} movement${accepted.length===1?'':'s'} added to your workout`);
  };
  function loadSaved(plan:CustomPlan){
    if(sections.some(s=>s.entries.length)&&!window.confirm('Replace the current custom draft with this saved plan?'))return;
    setWorkoutName(plan.name);setNotes(plan.notes);setSections(SECTION_DEFAULTS.map(s=>({...s,entries:plan.sections.find(p=>p.key===s.key)?.entries as WorkoutEntry[]||[],open:s.key==='workout'})));setComfortable(false);
  }

  useEffect(()=>{const sync=()=>setProfile(readTrainingProfile());window.addEventListener('power-training-profile',sync);return()=>window.removeEventListener('power-training-profile',sync);},[]);
  // Consume AI Coach handoff (sessionStorage)
  useEffect(() => {
    const raw = sessionStorage.getItem('powa-builder-import');
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { name?: string; items: { name: string; section: string; exercise?: Exercise }[] };
      if (parsed.name) setWorkoutName(parsed.name);
      setSections(prev => prev.map(s => {
        const items = parsed.items.filter(i => i.section === s.key && i.exercise && !customEntryReasons(i.exercise,readTrainingProfile()).length);
        return {
          ...s,
          open: s.key === 'workout' || items.length > 0,
          entries: [
            ...s.entries,
            ...items.map(i => ({
              exercise: i.exercise || ({ id: i.name, name: i.name, slug: i.name, category: '', primary_muscles: [] } as Exercise),
              sets: startingSets(i.exercise?.slug||''),
            })),
          ],
        };
      }));
      sessionStorage.removeItem('powa-builder-import');
      toast.success('Added to your custom workout');
    } catch {/* noop */}
  }, []);

  const loadTemplate = async (tpl: QuickTemplate) => {
    // Work offline, preserve canonical exercise slugs, and never invent video media.
    const builtIn = [...publicCatalog, ...getOfflineExercises()] as Exercise[];
    let remote: Exercise[] = [];
    try {
      const query = supabase.from('exercises').select('*').order('name').limit(500);
      const { data } = await query;
      if (data) remote = data as Exercise[];
    } catch { /* The bundled exercise catalog remains usable offline. */ }
    const catalog = [...new Map([...remote, ...builtIn]
      .filter(ex => Boolean(ex.slug))
      .map(ex => [ex.slug, ex])).values()];
    const bySlug = new Map(catalog.map(ex => [ex.slug, ex]));
    const path = tpl.pathId ? getSkillPath(tpl.pathId) : undefined;
    const requestedLevel = templateDifficulty || profile.tier || 1;
    const available = (path
      ? [...path.slugs, ...(path.accessories || [])].map(slug => bySlug.get(slug))
        .filter((ex): ex is Exercise => !!ex)
      : catalog.filter(ex => tpl.categories.includes(ex.category)))
      .filter(ex => minimumTier(ex.slug) <= requestedLevel)
      .filter(ex => templateDifficulty === 0 || minimumTier(ex.slug) === templateDifficulty)
      .filter(ex => customEntryReasons(ex, profile).length === 0);
    const eligible = [...new Map(available.map(ex => [ex.slug, ex])).values()];
    const selected: Exercise[] = [];
    const append = (exercise?: Exercise) => {
      if (exercise && !selected.some(ex => ex.slug === exercise.slug) && selected.length < 6) selected.push(exercise);
    };
    if (path) {
      const main = path.slugs.map(slug => eligible.find(ex => ex.slug === slug)).filter((ex): ex is Exercise => !!ex);
      // Current reachable stage and a nearby regression; no blind "elite" auto-advancement.
      const current = main.slice(-2);
      current.forEach(append);
      (path.accessories || []).forEach(slug => append(eligible.find(ex => ex.slug === slug)));
      for (const ex of main) append(ex);
    } else {
      // Balance broad templates across actual movement categories and exercise families.
      const usedFamilies = new Set<string>();
      for (const category of tpl.categories) {
        const candidate = eligible.find(ex => ex.category === category && !usedFamilies.has(ex.slug.split('-')[0]));
        if (candidate) {
          append(candidate);
          usedFamilies.add(candidate.slug.split('-')[0]);
        }
      }
      for (const ex of eligible) {
        if (selected.length >= 6) break;
        if (usedFamilies.has(ex.slug.split('-')[0])) continue;
        append(ex);
        usedFamilies.add(ex.slug.split('-')[0]);
      }
    }
    if (!selected.length) {
      toast.info('No suitable exercises at this difficulty. Adjust the difficulty or review your training level.');
      return;
    }
    if (sections.some(section => section.entries.length) &&
      !window.confirm('Replace your current draft with this template? Cancel keeps it.')) return;
    setWorkoutName(tpl.tag);
    setSections(prev => prev.map(section => section.key === 'workout'
      ? { ...section, open: true, entries: selected.map(exercise => ({
          exercise, sets: startingSets(exercise.slug)
        })) } : { ...section, entries: [] }));
    toast.success(tpl.tag + ' · ' + selected.length + ' exercises ready to edit');
  };


  const toggleSection = (key: string) => {
    setSections(prev => prev.map(s => s.key === key ? { ...s, open: !s.open } : s));
  };

  const addExercise = (sectionKey: string, exercise: Exercise) => {
    const reasons=customEntryReasons(exercise,readTrainingProfile());if(reasons.length){toast.info(reasons[0]);return;}
    setSections(prev => prev.map(s =>
      s.key === sectionKey
        ? { ...s, entries: [...s.entries, { exercise, sets: startingSets(exercise.slug) }] }
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

  const updateSets = (sectionKey: string, idx: number, sets: PlannedSet[]) => {
    setSections(prev => prev.map(s =>
      s.key === sectionKey
        ? { ...s, entries: s.entries.map((e, i) => i === idx ? { ...e, sets } : e) }
        : s
    ));
  };

  const totalExercises = sections.reduce((sum, s) => sum + s.entries.length, 0);
  const beginActiveWorkout = () => {
    const reasons=sections.flatMap(s=>s.entries.flatMap(e=>[...customEntryReasons(e.exercise,readTrainingProfile()),...trainingBlockers(e.exercise.slug,readTrainingProfile(),comfortable)]));if(reasons.length){toast.info(reasons[0]);return;}
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


  const saveWorkout = () => {
    if(!totalExercises){toast.info('Add a movement first.');return;}
    setSaving(true);
    try{saveCustomPlan(owner,{name:workoutName.trim()||'My workout',notes,sections});setSavedPlans(savedCustomPlans(owner));toast.success('Plan saved on this device. Training results are logged when you complete sets.');}
    catch{toast.error('Could not save the plan. Check device storage.');}finally{setSaving(false);}
  };

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-0">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 md:px-8 min-h-14 py-1 flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <Button variant="ghost" size="icon" onClick={() => navigate('/skills')} className="h-11 w-11 rounded-xl flex-shrink-0" aria-label="Back to skills">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="hidden sm:flex w-10 h-10 rounded-xl bg-primary/10 border border-border/30 items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-sm sm:text-base font-bold tracking-tight truncate">My plans</h1>
              <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-[0.2em]">
                {totalExercises} exercise{totalExercises !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              onClick={() => setCoachOpen(true)}
              aria-label="Open workout coach"
              size="sm"
              variant="outline"
              className="h-11 w-11 sm:w-auto sm:px-3 text-[10px] font-mono uppercase tracking-wider rounded-xl gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--electric))]" />
              <span className="hidden sm:inline">Coach</span>
            </Button>
            <Button
              onClick={saveWorkout}
              aria-label="Save custom workout plan"
              disabled={saving || totalExercises === 0}
              size="sm"
              className="h-11 min-w-11 text-[10px] font-mono uppercase tracking-wider rounded-xl gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save plan'}</span>
            </Button>
          </div>
        </div>
      </header>

      <WorkoutCoach open={coachOpen} onOpenChange={setCoachOpen} workoutSlugs={sections.flatMap(s=>s.entries.map(e=>e.exercise.slug))} onAdd={addCoachExercises}/>

      <main className="max-w-3xl mx-auto px-3 sm:px-4 md:px-8 py-4 space-y-4 pb-28 md:pb-8">
        <div className="rounded-2xl border bg-card p-4"><p className="font-bold text-lg">Create a custom plan</p><p className="text-sm text-muted-foreground mt-2">Save a repeatable routine, or build with your coach.</p><Button variant="outline" className="min-h-12 mt-4 gap-2" onClick={()=>setCoachOpen(true)}><Sparkles className="w-4 h-4"/>Chat with workout coach</Button></div>

        {localStorage.getItem('power-active-workout-v2') && (
          <Button type="button" variant="outline" className="power-elevated h-12 w-full rounded-2xl font-bold"
            onClick={() => navigate('/workout')}>
            Resume Unfinished Workout <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
          </Button>
        )}

        {guestDraft?.sections.some(s=>s.entries.length>0)&&<button type="button" className="w-full min-h-12 rounded-xl border p-3 text-left text-xs" onClick={()=>loadSaved(guestDraft)}>A guest draft is saved on this device. <strong>Load it into this builder</strong></button>}
        {savedPlans.length>0&&<details className="rounded-xl border p-3"><summary className="min-h-11 cursor-pointer font-bold text-sm">My saved plans · {savedPlans.length}</summary><div className="space-y-2">{savedPlans.map(plan=><button className="w-full min-h-12 text-left border-t text-sm" key={plan.name} onClick={()=>loadSaved(plan)}>{plan.name}<span className="block text-xs text-muted-foreground">{plan.sections.reduce((n,s)=>n+s.entries.length,0)} movements · load into builder</span></button>)}</div></details>}
        {/* Workout name */}
        <Input
          aria-label="Workout name"
          placeholder="Name your workout"
          value={workoutName}
          onChange={e => setWorkoutName(e.target.value)}
          className="h-12 rounded-xl border-border/50 bg-card font-display font-bold text-base placeholder:font-normal placeholder:text-muted-foreground"
        />

        <details className="rounded-xl border p-3"><summary className="min-h-12 font-bold text-sm cursor-pointer">L{profile.tier||1} · My level</summary><TrainingLevelControls profile={profile} onChange={next=>{setProfile(next);writeTrainingProfile(next);setComfortable(false);}}/></details>
        <section className="rounded-2xl border border-border/60 bg-card p-3 space-y-3" aria-label="Workout templates">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div><h2 className="font-display font-bold text-sm">Choose a workout</h2><p className="text-xs text-muted-foreground mt-1">Exercises first. No time limits or games.</p></div>
            <label className="text-xs text-muted-foreground flex items-center gap-2">Difficulty
              <select value={templateDifficulty} aria-label="Template exercise difficulty"
                onChange={e=>setTemplateDifficulty(Number(e.target.value))}
                className="min-h-11 rounded-xl border border-border bg-background px-2 text-foreground text-xs">
                <option value={0}>My current level</option>
                <option value={1}>Beginner</option><option value={2}>Foundation</option>
                <option value={3}>Building</option><option value={4}>Advanced</option><option value={5}>Elite</option>
              </select>
            </label>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {QUICK_TEMPLATES.slice(0,showAllTemplates?QUICK_TEMPLATES.length:9).map(tpl=>(
              <button key={tpl.label} type="button" onClick={()=>void loadTemplate(tpl)}
                className="min-h-12 rounded-xl border border-border/70 bg-background px-2 py-2 text-xs font-semibold hover:border-primary/60 focus-visible:outline-2 focus-visible:outline-primary">
                {tpl.label}
              </button>
            ))}
          </div>
          <button type="button" onClick={()=>setShowAllTemplates(v=>!v)} aria-expanded={showAllTemplates}
            className="min-h-11 w-full text-xs font-semibold text-primary">
            {showAllTemplates?'Show fewer workouts':'Explore all '+QUICK_TEMPLATES.length+' workout focuses'}
          </button>
          <p className="text-xs text-muted-foreground">Templates are editable suggestions based on existing exercises and your current training readiness.</p>
        </section>

        <button type="button" className="text-xs text-muted-foreground underline underline-offset-4"
          onClick={() => setShowAdvanced(value => !value)}>
          {showAdvanced ? 'Hide warm-up and recovery sections' : 'Add warm-up, mobility, or cool-down'}
        </button>

        {totalExercises>0&&<label className="flex items-start gap-3 text-xs leading-relaxed rounded-xl border p-3"><input type="checkbox" className="h-5 w-5 shrink-0 accent-[hsl(var(--primary))]" checked={comfortable} onChange={e=>setComfortable(e.target.checked)}/>These variations are comfortable today, and I can safely enter and exit them.</label>}
        {totalExercises > 0 && (
          <Button type="button" onClick={beginActiveWorkout}
            className="power-primary-action w-full min-h-14 px-2 rounded-2xl text-xs sm:text-sm font-display font-black tracking-wide uppercase">
            <Dumbbell className="h-5 w-5 mr-1 shrink-0" /> <span className="sm:hidden">Start Session · {totalExercises}</span><span className="hidden sm:inline">Start workout · {totalExercises} movements</span>
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
                    <div key={idx} className="power-custom-movement rounded-xl border border-border/40 bg-accent/10 p-3">
                      <MovementThumbnail exercise={entry.exercise}/>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <p className="text-xs font-bold break-words">{entry.exercise.name}</p>
                        </div>
                        <button onClick={() => removeEntry(section.key, idx)} aria-label={`Remove ${entry.exercise.name}`} className="h-11 w-11 shrink-0 grid place-items-center text-muted-foreground hover:text-destructive transition-colors">
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

        <Link to="/build" className="flex items-center justify-between min-h-12 text-sm font-bold">Prefer a guided skill workout?<ArrowRight size={18}/></Link>
        {/* Notes */}
        <div className="rounded-2xl border border-border/50 bg-card p-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Notes</p>
          <Textarea
            aria-label="Workout notes"
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
