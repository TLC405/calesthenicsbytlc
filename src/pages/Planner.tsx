import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ExercisePickerModal } from '@/components/Workout/ExercisePickerModal';
import { SetTracker } from '@/components/Workout/SetTracker';
import { ExerciseDetailModal } from '@/components/Exercise/ExerciseDetailModal';
import { getYouTubeVideoId } from '@/components/Exercise/VideoPlayer';
import { buildExerciseHistory, formatCompletedSets, type StoredWorkout, type ExerciseHistory } from '@/lib/trainingHistory';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Flame, Dumbbell, Snowflake, Heart, Plus, Trash2, ChevronDown, ChevronUp, Save, FileText, GripVertical, ArrowLeft, Sparkles, Loader2,
} from 'lucide-react';

interface Exercise {
  id: string; name: string; slug: string; category: string;
  primary_muscles: string[]; secondary_muscles?: string[];
  youtube_url?: string | null; equipment?: string[];
  cues?: unknown; image_url?: string | null; difficulty_level?: number;
  sets_reps?: string | null; description?: string | null;
  chain_group?: string | null; video_verified?: boolean | null;
  instagram_url?: string | null;
}

interface WorkoutEntry {
  exercise: Exercise;
  sets: { reps: number; weight?: number; seconds?: number; completed?: boolean }[];
  unit?: 'reps' | 'seconds';
  qualityConfirmed?: boolean;
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
  { label: 'Push', tag: 'Push Strength', categories: ['Push'], terms: [] },
  { label: 'Pull', tag: 'Pull Strength', categories: ['Pull'], terms: [] },
  { label: 'Legs', tag: 'Leg Strength', categories: ['Legs'], terms: [] },
  { label: 'Full', tag: 'Full Body', categories: ['Push', 'Pull', 'Legs', 'Core'], terms: [] },
  { label: 'Planche', tag: 'Planche', categories: [], terms: ['planche', 'scapular protraction', 'straight arm pulldown', 'wrist preparation'] },
  { label: 'Handstand', tag: 'Handstands', categories: [], terms: ['handstand'] },
  { label: 'Grip', tag: 'Grip Strength', categories: [], terms: ['grip', 'hang', 'pinch', 'farmer', 'wrist', 'finger', 'towel', 'extensor', 'crush'] },
  { label: 'Rings', tag: 'Rings', categories: ['Rings'], terms: ['ring', 'iron cross', 'false grip'] },
  { label: 'Flag', tag: 'Human Flag', categories: [], terms: ['flag'] },
  { label: 'Levers', tag: 'Levers', categories: [], terms: ['lever', 'skin the cat'] },
  { label: 'Front lever', tag: 'Front Lever', categories: [], terms: ['front lever'] },
  { label: 'Back lever', tag: 'Back Lever', categories: [], terms: ['back lever', 'skin the cat'] },
  { label: 'Straight arm', tag: 'Straight-arm Strength', categories: [], terms: ['straight-arm', 'straight arm', 'scapular protraction', 'planche lean', 'ring support'] },
  { label: 'Muscle-up', tag: 'Muscle-up', categories: [], terms: ['muscle-up', 'muscle up', 'false grip', 'transition drill'] },
  { label: 'Core', tag: 'Core & Compression', categories: ['Core'], terms: ['hollow', 'l-sit', 'v-sit', 'compression'] },
  { label: 'Flow', tag: 'Balance & Flow', categories: [], terms: ['flow', 'balance', 'crow', 'elbow lever', 'handstand walk'] },
  { label: 'Calves', tag: 'Calves & Tibialis', categories: [], terms: ['calf', 'calves', 'tibial'] },
  { label: 'Mobility', tag: 'Mobility', categories: ['Mobility', 'Flexibility', 'Yoga'], terms: [] },
];
const difficultyNames = ['All difficulties', 'Beginner', 'Novice', 'Intermediate', 'Advanced', 'Elite'];
const exerciseIsHold = (name: string) => {
  const n = name.toLowerCase();
  return !/(push.?up|pull.?up|press|dip|row|squat|raise|curl|rep)/.test(n) &&
    /(hold|hang|planche|lever|flag|handstand|l.?sit|v.?sit|plank|support|cross|lean)/.test(n);
};
const suggestedSets = (exercise: Exercise) => exerciseIsHold(exercise.name)
  ? [{ reps: 0, seconds: 15 }, { reps: 0, seconds: 15 }, { reps: 0, seconds: 15 }]
  : [{ reps: 8 }, { reps: 8 }, { reps: 8 }];
const difficultyName = (level?: number | null) => difficultyNames[level || 0] || 'Not rated';


export default function Planner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workoutName, setWorkoutName] = useState('');
  const [notes, setNotes] = useState('');
  const [sections, setSections] = useState<WorkoutSection[]>(
    SECTION_DEFAULTS.map(s => ({ ...s, entries: [], open: s.key === 'workout' }))
  );
  const [pickerSection, setPickerSection] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [coachOpen, setCoachOpen] = useState(false);
  const [coachPrompt, setCoachPrompt] = useState('');
  const [coachLoading, setCoachLoading] = useState(false);
  const [templateDifficulty, setTemplateDifficulty] = useState('all');
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [openExerciseDetails, setOpenExerciseDetails] = useState<Record<string, boolean>>({});
  const [previewTarget, setPreviewTarget] = useState<{ sectionKey: string; index: number; exercise: Exercise } | null>(null);
  const [historyIndex, setHistoryIndex] = useState<Map<string, ExerciseHistory>>(new Map());

  useEffect(() => {
    if (!user) { setHistoryIndex(new Map()); return; }
    let active = true;
    supabase.from('workouts').select('date,created_at,entries')
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(80)
      .then(({ data, error }) => {
        if (active && !error) setHistoryIndex(buildExerciseHistory((data || []) as StoredWorkout[]));
      });
    return () => { active = false; };
  }, [user]);


  const runSuperCoach = async (prompt: string) => {
    if (!prompt.trim()) return;
    setCoachLoading(true);
    try {
      const res = await supabase.functions.invoke('discover-exercises', {
        body: { query: `Build a complete workout with warm-up, main workout, cool-down and compression sections. Request: ${prompt}` },
      });
      if (res.error) throw new Error(res.error.message);
      // Accept only exercises that exist in the real exercise database.
      // AI suggestions cannot create placeholder exercise IDs or fake tutorials.
      const suggestions = Array.isArray(res.data?.exercises) ? res.data.exercises : [];
      if (!suggestions.length) { toast.error('Coach returned no exercises'); return; }
      const { data: catalog, error: catalogError } = await supabase.from('exercises').select('*');
      if (catalogError) throw catalogError;
      const library = (catalog || []) as Exercise[];
      const exercises: Exercise[] = suggestions.map((suggestion: Record<string, unknown>) => {
        const id = String(suggestion?.id || suggestion?.exercise_id || '');
        const name = String(suggestion?.name || '').trim().toLowerCase();
        const slug = String(suggestion?.slug || '').trim().toLowerCase();
        return library.find(e => (id && e.id === id) ||
          (name && e.name.toLowerCase() === name) ||
          (slug && e.slug.toLowerCase() === slug)) || null;
      }).filter((item: Exercise | null): item is Exercise => item !== null);
      const unique = [...new Map(exercises.map(e => [e.id, e])).values()];
      if (!unique.length) {
        toast.error('No verified exercise matches found. Try choosing a workout template.');
        return;
      }
      const sectionFor = (cat: string): string => {
        const c = (cat || '').toLowerCase();
        if (['mobility', 'flexibility'].includes(c)) return 'warmup';
        if (c === 'yoga') return 'cooldown';
        return 'workout';
      };
      setWorkoutName(prev => prev || 'Coach: ' + prompt.slice(0, 40));
      setSections(prev => prev.map(section => {
        const items = unique.filter(e => sectionFor(e.category) === section.key);
        return {
          ...section,
          open: section.key === 'workout' || items.length > 0,
          entries: [
            ...section.entries,
            ...items.map(exercise => ({
              exercise, sets: suggestedSets(exercise),
              unit: exerciseIsHold(exercise.name) ? 'seconds' as const : 'reps' as const,
            })),
          ],
        };
      }));
      toast.success(`Coach added ${unique.length} verified exercises`);
      setCoachOpen(false);
      setCoachPrompt('');
    } catch (err: unknown) {
      toast.error((err instanceof Error ? err.message : 'Coach failed'));
    } finally {
      setCoachLoading(false);
    }
  };

  // Import only canonical catalog records; do not accept fake exercise IDs from handoffs.
  useEffect(() => {
    const raw = sessionStorage.getItem('powa-builder-import');
    if (!raw) return;
    let active = true;
    const importExercises = async () => {
      try {
        const parsed: unknown = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || !('items' in parsed)) throw new Error('Invalid handoff');
        const payload = parsed as { name?: string; items?: { name?: string; section?: string; exercise?: Partial<Exercise> }[] };
        if (!Array.isArray(payload.items)) throw new Error('Invalid exercise list');
        const { data, error } = await supabase.from('exercises').select('*');
        if (error) throw error;
        if (!active) return;
        const catalog = (data || []) as Exercise[];
        const verified = payload.items.map(item => {
          const source = item.exercise;
          const match = catalog.find(ex =>
            (!!source?.id && ex.id === source.id) ||
            (!!source?.slug && ex.slug === source.slug) ||
            (!!item.name && ex.name.toLowerCase() === item.name.toLowerCase()));
          return match ? { section: item.section || 'workout', exercise: match } : null;
        }).filter((item): item is { section: string; exercise: Exercise } => item !== null);
        if (!verified.length) { toast.error('No matching catalog exercises to import'); return; }
        if (payload.name) setWorkoutName(payload.name);
        setSections(prev => prev.map(section => {
          const items = verified.filter(item => item.section === section.key);
          return { ...section, open: section.key === 'workout' || items.length > 0,
            entries: [...section.entries, ...items.map(item => ({
              exercise: item.exercise, sets: suggestedSets(item.exercise),
              unit: exerciseIsHold(item.exercise.name) ? 'seconds' as const : 'reps' as const,
            }))] };
        }));
        sessionStorage.removeItem('powa-builder-import');
        toast.success(verified.length + ' exercises imported');
      } catch {
        toast.error('Could not import exercises. Choose them from the library.');
      }
    };
    void importExercises();
    return () => { active = false; };
  }, []);

  const loadTemplate = async (tpl: typeof QUICK_TEMPLATES[number]) => {
    try {
      const { data, error } = await supabase.from('exercises').select('*').order('name');
      if (error) throw error;
      const library = (data || []) as Exercise[];
      const selected = library.filter(ex => {
        const name = ex.name.toLowerCase();
        const category = ex.category.toLowerCase();
        const categoryMatch = tpl.categories.some(c => c.toLowerCase() === category);
        const termMatch = tpl.terms.some(term => name.includes(term));
        return (categoryMatch || termMatch) &&
          (templateDifficulty === 'all' || Number(ex.difficulty_level) === Number(templateDifficulty));
      });
      if (!selected.length) {
        toast.error('No matching exercises at that difficulty. Try another difficulty or template.');
        return;
      }
      // Prefer varied movement families and intermediate loading when the user has not selected a level.
      const byDifficulty = [...selected].sort((a, b) => {
        const target = templateDifficulty === 'all' ? 2 : Number(templateDifficulty);
        return Math.abs((a.difficulty_level || 2) - target) -
          Math.abs((b.difficulty_level || 2) - target) || a.name.localeCompare(b.name);
      });
      const priority = tpl.label === 'Full' ? ['Push', 'Pull', 'Legs', 'Core'] : [];
      const chosen: Exercise[] = [];
      const usedFamilies = new Set<string>();
      const add = (exercise?: Exercise) => {
        if (!exercise || chosen.some(e => e.id === exercise.id)) return;
        const family = exercise.chain_group || exercise.slug || exercise.name;
        if (usedFamilies.has(family)) return;
        chosen.push(exercise);
        usedFamilies.add(family);
      };
      for (const category of priority) {
        add(byDifficulty.find(e => e.category.toLowerCase() === category.toLowerCase() && !usedFamilies.has(e.chain_group || e.slug || e.name)));
      }
      for (const exercise of byDifficulty) {
        if (chosen.length >= 6) break;
        add(exercise);
      }
      if (chosen.length < 3) {
        for (const exercise of byDifficulty) {
          if (chosen.length >= Math.min(6, byDifficulty.length)) break;
          if (!chosen.some(e => e.id === exercise.id)) chosen.push(exercise);
        }
      }
      setWorkoutName(tpl.tag);
      setSections(prev => prev.map(section => section.key === 'workout'
        ? {
            ...section, open: true,
            entries: chosen.map(exercise => ({
              exercise, sets: suggestedSets(exercise),
              unit: exerciseIsHold(exercise.name) ? 'seconds' as const : 'reps' as const,
            })),
          }
        : section));
      setOpenExerciseDetails({});
      toast.success(tpl.tag + ' template loaded — customize any exercise.');
    } catch (err: unknown) {
      toast.error((err instanceof Error ? err.message : 'Could not load template'));
    }
  };


  const toggleSection = (key: string) => {
    setSections(prev => prev.map(s => s.key === key ? { ...s, open: !s.open } : s));
  };

  const addExercise = (sectionKey: string, exercise: Exercise) => {
    setSections(prev => prev.map(s =>
      s.key === sectionKey
        ? { ...s, entries: [...s.entries, { exercise, sets: suggestedSets(exercise), unit: exerciseIsHold(exercise.name) ? 'seconds' as const : 'reps' as const }] }
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

  const updateSets = (sectionKey: string, idx: number, sets: { reps: number; weight?: number; seconds?: number; completed?: boolean }[]) => {
    setSections(prev => prev.map(s =>
      s.key === sectionKey
        ? { ...s, entries: s.entries.map((e, i) => i === idx ? { ...e, sets, qualityConfirmed: false } : e) }
        : s
    ));
  };

  const totalExercises = sections.reduce((sum, s) => sum + s.entries.length, 0);

  const saveWorkout = async () => {
    if (!user) { toast.error('Sign in to save workouts'); return; }
    if (totalExercises === 0) { toast.error('Add at least one exercise'); return; }
    setSaving(true);
    try {
      const entries = sections.flatMap(s =>
        s.entries.map(e => ({
          section: s.key,
          exercise_id: e.exercise.id,
          exercise_name: e.exercise.name,
          sets: e.sets,
          unit: e.unit || 'reps',
          quality_confirmed: e.qualityConfirmed === true && e.sets.length > 0 && e.sets.every(set => set.completed === true),
        }))
      );
      const { error } = await supabase.from('workouts').insert({
        user_id: user.id,
        date: format(new Date(), 'yyyy-MM-dd'),
        entries,
        notes: `${workoutName ? workoutName + '\n' : ''}${notes}`,
      });
      if (error) throw error;
      toast.success('Workout saved!');
      const { data: freshHistory } = await supabase.from('workouts').select('date,created_at,entries')
        .eq('user_id', user.id).order('created_at', { ascending: false }).limit(80);
      if (freshHistory) setHistoryIndex(buildExerciseHistory(freshHistory as StoredWorkout[]));
      // Reset
      setSections(SECTION_DEFAULTS.map(s => ({ ...s, entries: [], open: s.key === 'workout' })));
      setWorkoutName('');
      setNotes('');
    } catch (err: unknown) {
      toast.error((err instanceof Error ? err.message : 'Failed to save'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-0">
      <header className="page-header sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 md:px-8 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="h-10 w-10 rounded-xl flex-shrink-0" aria-label="Back to home">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="hidden sm:flex w-10 h-10 rounded-xl bg-primary/10 border border-border/30 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-base font-bold tracking-tight truncate">Build workout</h1>
              <p className="text-xs text-muted-foreground">
                {totalExercises} exercise{totalExercises !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Button
              onClick={() => setCoachOpen(true)}
              size="sm"
              variant="outline"
              className="h-9 text-[10px] font-mono uppercase tracking-wider rounded-xl gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--electric))]" />
              Coach
            </Button>
            <Button
              onClick={saveWorkout}
              disabled={saving || totalExercises === 0}
              size="sm"
              className="h-9 text-[10px] font-mono uppercase tracking-wider rounded-xl gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </header>

      <Dialog open={coachOpen} onOpenChange={setCoachOpen}>
        <DialogContent className="max-w-md rounded-2xl">
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
            placeholder="e.g. Intermediate planche strength with grip accessories"
            value={coachPrompt}
            onChange={e => setCoachPrompt(e.target.value)}
            rows={4}
            className="rounded-xl"
          />
          <div className="flex flex-wrap gap-1.5">
            {['Full body', 'Push + core', 'Pull intermediate', 'Grip + rings', 'Mobility'].map(s => (
              <Button variant="ghost"
                key={s}
                onClick={() => setCoachPrompt(s)}
                className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-lg border border-border/60 hover:bg-accent/40"
              >{s}</Button>
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

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-5 space-y-4">
        {/* Workout name */}
        <Input
          aria-label="Workout name" placeholder="Workout name"
          value={workoutName}
          onChange={e => setWorkoutName(e.target.value)}
          className="h-12 rounded-xl border-border bg-card font-display font-bold text-base placeholder:font-normal placeholder:text-muted-foreground"
        />

        {/* Simple difficulty-first templates: no equipment setup or duration limits. */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-foreground">Workout templates</p>
            <select className="power-difficulty-select" aria-label="Template exercise difficulty"
              value={templateDifficulty} onChange={e => setTemplateDifficulty(e.target.value)}>
              <option value="all">All difficulties</option>
              {difficultyNames.slice(1).map((name, index) => <option value={index + 1} key={name}>{name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {QUICK_TEMPLATES.slice(0, showAllTemplates ? QUICK_TEMPLATES.length : 9).map(tpl => <Button key={tpl.label} variant="outline" onClick={() => loadTemplate(tpl)}
              className="h-11 rounded-xl bg-card border-border/70 text-xs font-semibold">
              {tpl.label}
            </Button>)}
          </div>
          <Button type="button" variant="ghost" className="w-full min-h-11 text-xs font-medium"
            onClick={() => setShowAllTemplates(value => !value)} aria-expanded={showAllTemplates}>
            {showAllTemplates ? 'Show fewer focuses' : 'See all ' + QUICK_TEMPLATES.length + ' training focuses'}
          </Button>
          <p className="text-xs text-muted-foreground">Choose a focus and difficulty. Every template uses existing exercises, and you can change anything.</p>
        </div>


        {/* Sections */}
        {sections.map(section => {
          const Icon = section.icon;
          return (
            <div key={section.key} className="border-b border-border bg-card overflow-hidden">
              {/* Section header */}
              <Button variant="ghost"
                onClick={() => toggleSection(section.key)}
                aria-expanded={section.open}
                className="h-auto w-full justify-start flex items-center gap-3 p-4 text-left hover:bg-accent/30 transition-colors"
              >
                
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" >
                  <Icon className="w-4 h-4" style={{ color: section.color }} />
                </div>
                <div className="flex-1">
                  <p className="font-display text-sm font-bold tracking-tight">{section.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {section.entries.length} exercise{section.entries.length !== 1 ? 's' : ''}
                  </p>
                </div>
                {section.open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </Button>

              {/* Section content */}
              {section.open && (
                <div className="px-4 pb-4 space-y-2">
                  {section.entries.map((entry, idx) => {
                    const key = section.key + ':' + idx;
                    const open = !!openExerciseDetails[key];
                    const videoId = getYouTubeVideoId(entry.exercise.youtube_url);
                    const thumbnail = entry.exercise.image_url || (videoId ? 'https://i.ytimg.com/vi/' + videoId + '/mqdefault.jpg' : null);
                    return <div key={key} className="rounded-xl border border-border/70 bg-card overflow-hidden">
                      <div className="flex items-center gap-3 p-2.5">
                        <button type="button" className="h-12 w-14 shrink-0 bg-secondary rounded-lg overflow-hidden flex items-center justify-center"
                          onClick={() => setPreviewTarget({ sectionKey: section.key, index: idx, exercise: entry.exercise })}
                          aria-label={'Preview or change ' + entry.exercise.name}>
                          {thumbnail ? <img src={thumbnail} alt="" className="w-full h-full object-cover" loading="lazy"/> : <Dumbbell className="w-5 h-5 text-muted-foreground"/>}
                        </button>
                        <button type="button" onClick={() => setOpenExerciseDetails(v => ({ ...v, [key]: !v[key] }))}
                          className="min-w-0 flex-1 text-left py-1" aria-expanded={open}>
                          <span className="block text-sm font-semibold truncate">{entry.exercise.name}</span>
                          <span className="block text-xs text-muted-foreground">{difficultyName(entry.exercise.difficulty_level)} · {entry.sets.length} sets</span>
                        </button>
                        <Button variant="ghost" size="icon" aria-label={'Edit ' + entry.exercise.name + ' sets'}
                          className="h-11 w-11 shrink-0" onClick={() => setOpenExerciseDetails(v => ({ ...v, [key]: !v[key] }))}>
                          {open ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
                        </Button>
                        <Button variant="ghost" size="icon" aria-label={'Remove ' + entry.exercise.name}
                          className="h-11 w-11 shrink-0 text-muted-foreground" onClick={() => removeEntry(section.key, idx)}>
                          <Trash2 className="w-4 h-4"/>
                        </Button>
                      </div>
                      {open && <div className="px-3 pb-3 border-t border-border/50 pt-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Measure each set by</span>
                          <div className="flex gap-1">
                            {(['reps', 'seconds'] as const).map(unit => <Button key={unit} variant={(entry.unit || 'reps') === unit ? 'default' : 'outline'}
                              size="sm" className="h-9 rounded-lg" onClick={() => setSections(prev => prev.map(s => s.key !== section.key ? s : {
                                ...s, entries: s.entries.map((e, i) => i !== idx ? e : {
                                  ...e, unit, qualityConfirmed: false, sets: unit === 'seconds'
                                    ? e.sets.map(set => ({ ...set, seconds: set.seconds || 15, completed: false }))
                                    : e.sets.map(set => ({ ...set, reps: set.reps || 8, completed: false })),
                                }),
                              }))}>{unit === 'seconds' ? 'Hold (sec)' : 'Reps'}</Button>)}
                          </div>
                        </div>
                        <SetTracker unit={entry.unit || 'reps'} sets={entry.sets} onChange={sets => updateSets(section.key, idx, sets)}/>
                        {historyIndex.get(entry.exercise.id)?.previous && (
                          <div className="rounded-xl bg-secondary/50 px-3 py-2 text-xs text-muted-foreground" role="note">
                            <span className="font-medium text-foreground">Previous completed:</span>{' '}
                            {formatCompletedSets(historyIndex.get(entry.exercise.id)!.previous!)}
                          </div>
                        )}
                        <button type="button" aria-pressed={entry.qualityConfirmed === true}
                          disabled={!entry.sets.length || !entry.sets.every(set => set.completed === true)}
                          onClick={() => setSections(prev => prev.map(s => s.key !== section.key ? s : ({
                            ...s, entries: s.entries.map((e, i) => i !== idx ? e : ({
                              ...e, qualityConfirmed: !e.qualityConfirmed,
                            })),
                          })))}
                          className="w-full min-h-11 rounded-xl border border-border/70 p-3 text-left text-xs font-medium disabled:opacity-50">
                          {entry.qualityConfirmed ? '✓' : '○'} Technique felt controlled and comfortable
                        </button>
                        {historyIndex.get(entry.exercise.id)?.eligibleToReviewVariation && (
                          <p className="text-xs text-muted-foreground">
                            Two completed, comfortable sessions logged. You may review a harder variation when ready;
                            advancement is never automatic.
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">Use the exercise thumbnail to review the video or swap difficulty.</p>
                      </div>}
                    </div>;
                  })}


                  <Button variant="ghost"
                    onClick={() => setPickerSection(section.key)}
                    className="h-12 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-border transition-all text-xs font-mono"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Exercise
                  </Button>
                </div>
              )}
            </div>
          );
        })}

        {/* Notes */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Notes</p>
          <Textarea
            placeholder="Workout notes, how you felt, etc..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="min-h-[80px] rounded-xl border-border bg-accent/10 text-sm"
          />
        </div>
      </main>

      {/* Exercise Picker */}
      <ExerciseDetailModal
        exercise={previewTarget?.exercise || null}
        open={!!previewTarget}
        onClose={() => setPreviewTarget(null)}
        actionLabel="Use this variation"
        onAddToWorkout={(replacement) => {
          if (!previewTarget) return;
          const { sectionKey, index } = previewTarget;
          setSections(prev => prev.map(section => section.key !== sectionKey ? section : {
            ...section,
            entries: section.entries.map((entry, idx) => idx !== index ? entry : {
              exercise: replacement as Exercise,
              unit: exerciseIsHold(replacement.name) ? 'seconds' as const : 'reps' as const,
              sets: suggestedSets(replacement as Exercise),
              qualityConfirmed: false,
            }),
          }));
          setPreviewTarget(null);
          toast.success('Exercise variation updated');
        }}
      />
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
