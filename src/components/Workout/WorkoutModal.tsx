import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus, Save, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExerciseLogItem } from './ExerciseLogItem';
import { ExercisePickerModal } from './ExercisePickerModal';
import { ExerciseDetailModal } from '@/components/Exercise/ExerciseDetailModal';
import { SetData } from './SetTracker';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from 'sonner';

interface Exercise {
  id: string;
  name: string;
  slug: string;
  category: string;
  primary_muscles: string[];
  secondary_muscles: string[];
  equipment: string[];
  cues: unknown;
  youtube_url?: string | null;
  instagram_url?: string | null;
  image_url?: string | null;
}

interface WorkoutEntry {
  exercise_id: string;
  exercise: Exercise;
  sets: SetData[];
  unit?: 'reps' | 'seconds';
  quality_confirmed?: boolean;
}

interface WorkoutModalProps {
  date: Date | null;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function WorkoutModal({ date, open, onClose, onSave }: WorkoutModalProps) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<WorkoutEntry[]>([]);
  const [notes, setNotes] = useState('');
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    if (open && date && user) {
      loadWorkout();
    } else {
      resetState();
    }
  }, [open, date, user]);

  const resetState = () => {
    setEntries([]);
    setNotes('');
    setWorkoutId(null);
  };

  const loadWorkout = async () => {
    if (!date || !user) return;
    
    setLoading(true);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Load workout for this date
    const { data: workout } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', dateStr)
      .maybeSingle();

    if (workout) {
      setWorkoutId(workout.id);
      setNotes(workout.notes || '');
      
      // Load exercise details for each entry
      const workoutEntries: { exercise_id: string; sets: SetData[]; unit?: 'reps' | 'seconds'; quality_confirmed?: boolean }[] =
        Array.isArray(workout.entries) ? workout.entries
          .filter((item): item is Record<string, Json | undefined> =>
            item !== null && typeof item === 'object' && !Array.isArray(item))
          .filter(item => typeof item.exercise_id === 'string')
          .map(item => ({
            exercise_id: item.exercise_id as string,
            sets: Array.isArray(item.sets) ? item.sets
              .filter((set): set is Record<string, Json | undefined> =>
                set !== null && typeof set === 'object' && !Array.isArray(set))
              .map(set => ({
                reps: typeof set.reps === 'number' ? set.reps : 0,
                seconds: typeof set.seconds === 'number' ? set.seconds : undefined,
                weight: typeof set.weight === 'number' ? set.weight : undefined,
                rpe: typeof set.rpe === 'number' ? set.rpe : undefined,
                completed: set.completed === true,
              })) : [],
            unit: item.unit === 'seconds' ? 'seconds' as const : 'reps' as const,
            quality_confirmed: item.quality_confirmed === true,
          })) : [];
      if (workoutEntries && workoutEntries.length > 0) {
        const exerciseIds = workoutEntries.map(e => e.exercise_id);
        const { data: exercises } = await supabase
          .from('exercises')
          .select('*')
          .in('id', exerciseIds);

        const entriesWithExercises = workoutEntries.map(entry => ({
          ...entry,
          exercise: exercises?.find(e => e.id === entry.exercise_id) || {
            id: entry.exercise_id,
            name: 'Unknown Exercise',
            slug: 'unknown',
            category: '',
            primary_muscles: [],
            secondary_muscles: [],
            equipment: [],
            cues: []
          }
        }));
        
        setEntries(entriesWithExercises);
      }
    }
    
    setLoading(false);
  };

  const addExercise = async (exercise: Exercise) => {
    // Fetch full exercise details
    const { data: fullExercise } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', exercise.id)
      .single();

    setEntries(prev => [...prev, {
      exercise_id: exercise.id,
      exercise: fullExercise || exercise as Exercise,
      sets: [{ reps: 10 }]
    }]);
  };

  const updateEntrySets = (index: number, sets: SetData[]) => {
    setEntries(prev => prev.map((entry, i) => 
      i === index ? { ...entry, sets } : entry
    ));
  };

  const removeEntry = (index: number) => {
    setEntries(prev => prev.filter((_, i) => i !== index));
  };

  const saveWorkout = async () => {
    if (!date || !user) return;
    
    setSaving(true);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    const entriesJson = entries.map(e => ({
      exercise_id: e.exercise_id,
      unit: e.unit || (e.sets.some(set => (set.seconds || 0) > 0) ? 'seconds' : 'reps'),
      quality_confirmed: e.quality_confirmed === true && e.sets.length > 0 && e.sets.every(set => set.completed === true),
      sets: e.sets.map(s => ({ reps: s.reps, seconds: s.seconds, weight: s.weight, rpe: s.rpe, completed: s.completed === true }))
    }));

    let error;
    
    if (workoutId) {
      // Update existing workout
      const result = await supabase
        .from('workouts')
        .update({
          notes,
          entries: entriesJson as Json
        })
        .eq('id', workoutId);
      error = result.error;
    } else {
      // Create new workout
      const result = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          date: dateStr,
          notes,
          entries: entriesJson as Json
        });
      error = result.error;
    }

    setSaving(false);

    if (error) {
      toast.error('Failed to save workout');
      console.error(error);
    } else {
      toast.success('Workout saved!');
      onSave();
      onClose();
    }
  };

  if (!date) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              {format(date, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 px-4">
            {loading ? (
              <div className="py-8 text-center text-muted-foreground">Loading workout...</div>
            ) : (
              <div className="space-y-3 py-4">
                {entries.length === 0 ? (
                  <div className="neumorph-inset rounded-lg p-8 text-center">
                    <p className="text-muted-foreground mb-4">No exercises logged yet</p>
                    <Button 
                      variant="outline" 
                      onClick={() => setPickerOpen(true)}
                      className="neumorph-flat"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Exercise
                    </Button>
                  </div>
                ) : (
                  <>
                    {entries.map((entry, index) => (
                      <ExerciseLogItem
                        key={`${entry.exercise_id}-${index}`}
                        exercise={entry.exercise}
                        sets={entry.sets}
                        onSetsChange={(sets) => updateEntrySets(index, sets)}
                        onRemove={() => removeEntry(index)}
                        onViewVideo={() => setSelectedExercise(entry.exercise)}
                      />
                    ))}
                    
                    <Button 
                      variant="outline" 
                      className="w-full neumorph-flat"
                      onClick={() => setPickerOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Exercise
                    </Button>
                  </>
                )}

                {/* Notes */}
                <div className="pt-2">
                  <label className="text-sm font-medium mb-2 block">Notes</label>
                  <Textarea
                    placeholder="How did the workout feel? Any PRs?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="neumorph-inset min-h-[80px]"
                  />
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Save Button */}
          <div className="p-4 pt-0">
            <Button 
              className="w-full neumorph" 
              size="lg"
              onClick={saveWorkout}
              disabled={saving || entries.length === 0}
            >
              <Save className="w-5 h-5 mr-2" />
              {saving ? 'Saving...' : 'Save Workout'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Exercise Picker */}
      <ExercisePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelectExercise={addExercise}
      />

      {/* Exercise Detail Modal for video viewing */}
      <ExerciseDetailModal
        exercise={selectedExercise}
        open={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
      />
    </>
  );
}
