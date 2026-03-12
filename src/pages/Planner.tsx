import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ExercisePickerModal } from '@/components/Workout/ExercisePickerModal';
import { SetTracker } from '@/components/Workout/SetTracker';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Flame, Dumbbell, Snowflake, Heart, Plus, Trash2, ChevronDown, ChevronUp, Save, FileText, GripVertical,
} from 'lucide-react';

interface Exercise {
  id: string; name: string; slug: string; category: string;
  primary_muscles: string[]; secondary_muscles: string[];
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

export default function Planner() {
  const { user } = useAuth();
  const [workoutName, setWorkoutName] = useState('');
  const [notes, setNotes] = useState('');
  const [sections, setSections] = useState<WorkoutSection[]>(
    SECTION_DEFAULTS.map(s => ({ ...s, entries: [], open: true }))
  );
  const [pickerSection, setPickerSection] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
        }))
      );
      const { error } = await supabase.from('workouts').insert({
        user_id: user.id,
        date: new Date().toISOString().slice(0, 10),
        entries,
        notes: `${workoutName ? workoutName + '\n' : ''}${notes}`,
      });
      if (error) throw error;
      toast.success('Workout saved!');
      // Reset
      setSections(SECTION_DEFAULTS.map(s => ({ ...s, entries: [], open: true })));
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
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-border/30">
        <div className="max-w-3xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-border/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-base font-bold tracking-tight">Workout Builder</h1>
              <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-[0.2em]">
                {totalExercises} exercise{totalExercises !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
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
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-5 space-y-4">
        {/* Workout name */}
        <Input
          placeholder="Workout name (e.g. Push Day, Full Body)"
          value={workoutName}
          onChange={e => setWorkoutName(e.target.value)}
          className="h-12 rounded-xl border-border/50 bg-card font-display font-bold text-base placeholder:font-normal placeholder:text-muted-foreground"
        />

        {/* Sections */}
        {sections.map(section => {
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
