import { useEffect, useState } from 'react';
import { Plus, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from './VideoPlayer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DifficultyBadge } from './DifficultyBadge';
import { ProgressionPathStrip } from './ProgressionPathStrip';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface Exercise {
  id: string; name: string; slug: string; category: string;
  primary_muscles: string[]; secondary_muscles: string[]; equipment: string[];
  cues: any; difficulty_level?: number | null; youtube_url?: string | null;
  instagram_url?: string | null; image_url?: string | null;
  chain_group?: string | null; chain_order?: number | null;
  stabilizer_muscles?: string[] | null; tendons_involved?: string[] | null;
  recovery_muscle?: string | null; recovery_tendon?: string | null;
  recovery_nervous?: string | null; sets_reps?: string | null; description?: string | null;
}

interface Progression { id: string; name: string; level: number; description: string | null; }
interface ExerciseDetailModalProps { exercise: Exercise | null; open: boolean; onClose: () => void; onAddToWorkout?: (exercise: Exercise) => void; }

const levelLabels: Record<number, string> = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced', 4: 'Expert', 5: 'Elite' };
const levelColors: Record<number, string> = { 1: 'bg-[hsl(var(--cat-legs))]', 2: 'bg-[hsl(var(--cat-pull))]', 3: 'bg-[hsl(var(--cat-core))]', 4: 'bg-[hsl(var(--cat-push))]', 5: 'bg-[hsl(var(--cat-skills))]' };
const categoryAccent: Record<string, string> = {
  Push: 'hsl(var(--cat-push))', Pull: 'hsl(var(--cat-pull))', Legs: 'hsl(var(--cat-legs))',
  Core: 'hsl(var(--cat-core))', Skills: 'hsl(var(--cat-skills))', Mobility: 'hsl(var(--cat-mobility))',
  Yoga: 'hsl(330,65%,55%)', Flexibility: 'hsl(45,93%,47%)', Rings: 'hsl(45,80%,40%)',
};

export function ExerciseDetailModal({ exercise, open, onClose, onAddToWorkout }: ExerciseDetailModalProps) {
  const [progressions, setProgressions] = useState<Progression[]>([]);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(exercise);

  useEffect(() => { setCurrentExercise(exercise); }, [exercise]);
  useEffect(() => {
    if (currentExercise?.id && open) {
      supabase.from('progressions').select('*').eq('exercise_id', currentExercise.id).order('level')
        .then(({ data }) => setProgressions(data || []));
    } else setProgressions([]);
  }, [currentExercise?.id, open]);

  const handleChainNavigate = async (exerciseId: string) => {
    const { data } = await supabase.from('exercises').select('*').eq('id', exerciseId).single();
    if (data) setCurrentExercise(data as unknown as Exercise);
  };

  if (!currentExercise) return null;
  const accent = categoryAccent[currentExercise.category] || 'hsl(var(--primary))';

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden rounded-2xl border-border/50 bg-card">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-5 space-y-5">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-1.5 h-5 rounded-full" style={{ backgroundColor: accent }} />
                <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">{currentExercise.category}</span>
                {currentExercise.difficulty_level && (
                  <><span className="text-border">·</span><DifficultyBadge level={currentExercise.difficulty_level} size="sm" /></>
                )}
              </div>
              <DialogTitle className="text-xl font-display font-bold tracking-tight">{currentExercise.name}</DialogTitle>
              {currentExercise.description && <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{currentExercise.description}</p>}
            </DialogHeader>

            <ProgressionPathStrip exerciseId={currentExercise.id} chainGroup={currentExercise.chain_group || null} onNavigate={handleChainNavigate} />

            <VideoPlayer youtubeUrl={currentExercise.youtube_url} instagramUrl={currentExercise.instagram_url} title={currentExercise.name}
              exerciseData={{ recovery_muscle: currentExercise.recovery_muscle, recovery_tendon: currentExercise.recovery_tendon, recovery_nervous: currentExercise.recovery_nervous, primary_muscles: currentExercise.primary_muscles, secondary_muscles: currentExercise.secondary_muscles, stabilizer_muscles: currentExercise.stabilizer_muscles, tendons_involved: currentExercise.tendons_involved, equipment: currentExercise.equipment, cues: currentExercise.cues, sets_reps: currentExercise.sets_reps, difficulty_level: currentExercise.difficulty_level, category: currentExercise.category }} />

            {progressions.length > 0 && (
              <div className="rounded-2xl border border-border/40 p-4 bg-accent/20">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-3.5 h-3.5 text-foreground" />
                  <h4 className="text-xs font-display font-bold tracking-tight">Progression Ladder</h4>
                </div>
                <div className="space-y-0">
                  {progressions.map((prog, i) => (
                    <div key={prog.id} className="flex items-start gap-3 relative">
                      {i < progressions.length - 1 && <div className="absolute left-[11px] top-6 w-0.5 h-[calc(100%-4px)] bg-border/30" />}
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-mono font-bold text-white z-10", levelColors[prog.level] || 'bg-muted')}>{prog.level}</div>
                      <div className="pb-4 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-semibold text-sm">{prog.name}</span>
                          <span className="text-[8px] font-mono text-muted-foreground">{levelLabels[prog.level]}</span>
                        </div>
                        {prog.description && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{prog.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {onAddToWorkout && (
              <Button className="w-full rounded-2xl h-12 font-display font-bold uppercase tracking-wider" size="lg"
                style={{ background: `linear-gradient(135deg, ${accent}, hsl(var(--electric)))` }}
                onClick={() => { onAddToWorkout(currentExercise); onClose(); }}>
                <Plus className="w-4 h-4 mr-2" />Add to Today's Workout
              </Button>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
