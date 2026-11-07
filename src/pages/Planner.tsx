import { readTrainingProfile, writeTrainingProfile, trainingBlockers, type TrainingEquipment } from '@/lib/skillGraph';
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

const QUICK_TEMPLATES = [
  { label: 'Push', tag: 'Push Day', categories: ['Push'] },
  { label: 'Pull', tag: 'Pull Day', categories: ['Pull'] },
  { label: 'Legs', tag: 'Leg Day', categories: ['Legs'] },
  { label: 'Full', tag: 'Full Body', categories: ['Push', 'Pull', 'Legs'] },
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
  const [coachOpen, setCoachOpen] = useState(()=>new URLSearchParams(window.location.search).get('coach')==='1');
  const [profile,setProfile]=useState(readTrainingProfile);
  const [comfortable,setComfortable]=useState(false);
  useEffect(()=>{try{writeCustomDraft(owner,{name:workoutName,notes,sections});}catch{toast.error('Device storage is full. This draft could not be saved.');}},[owner,workoutName,notes,sections]);
  const addCoachExercises=(exercises:SkillExercise[])=>{
    const profile=readTrainingProfile();const existing=new Set(sections.flatMap(s=>s.entries.map(e=>e.exercise.slug)));
    const accepted=exercises.filter(e=>!existing.has(e.slug)&&!customEntryReasons(e,profile).length);
    if(!accepted.length){toast.info('Already added, or preparation/equipment is needed.');return;}
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

  const loadTemplate = async (tpl: typeof QUICK_TEMPLATES[number]) => {
    // Templates must work for guests and during Supabase outages.
    const builtIn = [...publicCatalog, ...getOfflineExercises()] as Exercise[];
    let catalog: Exercise[] = builtIn;
    try {
      const { data } = await supabase.from('exercises').select('*')
        .in('category', tpl.categories).order('name').limit(300);
      if (data?.length) catalog = [...data as Exercise[], ...builtIn];
    } catch { /* Keep locally bundled catalog usable. */ }
    const matched = [...new Map(catalog.filter(e => tpl.categories.includes(e.category)&&!customEntryReasons(e,readTrainingProfile()).length)
      .map(e => [e.slug || e.name.toLowerCase(), e])).values()];
    const chosen = matched.slice(0, Math.min(5, matched.length));
    if (!chosen.length) { toast.error('No matching exercises found'); return; }
    setWorkoutName(tpl.tag);
    setSections(prev => prev.map(s => s.key === 'workout'
      ? { ...s, open: true, entries: chosen.map(e => ({
          exercise: e, sets: startingSets(e.slug)
        })) } : s));
    toast.success(`${tpl.tag} ready · ${chosen.length} exercises`);
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
              <h1 className="font-display text-sm sm:text-base font-bold tracking-tight truncate">Workout builder</h1>
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
        <div className="rounded-2xl border bg-card p-4"><p className="font-bold text-lg">Your workout, your way</p><p className="text-sm text-muted-foreground mt-2">Add movements or plan together with your coach.</p><Button variant="outline" className="min-h-12 mt-4 gap-2" onClick={()=>setCoachOpen(true)}><Sparkles className="w-4 h-4"/>Chat with workout coach</Button></div>

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

        <details className="rounded-xl border p-3"><summary className="min-h-12 font-bold text-sm cursor-pointer">L{profile.tier||1} · My level and equipment</summary><TrainingLevelControls profile={profile} onChange={next=>{setProfile(next);writeTrainingProfile(next);setComfortable(false);}}/><fieldset className="mt-3"><legend className="text-xs font-bold mb-2">Available equipment</legend><div className="flex flex-wrap gap-2">{(['floor','wall','rings','bar','parallettes','bands','bench','pole','pool'] as TrainingEquipment[]).map(gear=><button type="button" key={gear} aria-pressed={profile.equipment.includes(gear)} className={`min-h-12 px-3 rounded-xl border text-xs capitalize ${profile.equipment.includes(gear)?'border-primary text-primary bg-primary/5':''}`} onClick={()=>{const next={...profile,equipment:profile.equipment.includes(gear)?profile.equipment.filter(g=>g!==gear):[...profile.equipment,gear]};setProfile(next);writeTrainingProfile(next);setComfortable(false);}}>{gear}</button>)}</div></fieldset></details>
        <details className="rounded-xl border p-3"><summary className="min-h-12 font-bold text-sm cursor-pointer">Strength templates (optional)</summary>
          <div className="pt-3">
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
        </details>

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
                    <div key={idx} className="rounded-xl border border-border/40 bg-accent/10 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <GripVertical className="w-3 h-3 text-muted-foreground/40" />
                          <p className="text-xs font-bold truncate">{entry.exercise.name}</p>
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
