import { useEffect, useState } from 'react';
import { X, Plus, Dumbbell, Target, Info, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VideoPlayer } from './VideoPlayer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DifficultyBadge } from './DifficultyBadge';
import { ProgressionPathStrip } from './ProgressionPathStrip';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface Exercise {
  id: string;
  name: string;
  slug: string;
  category: string;
  primary_muscles: string[];
  secondary_muscles: string[];
  equipment: string[];
  cues: any;
  difficulty_level?: number | null;
  youtube_url?: string | null;
  instagram_url?: string | null;
  image_url?: string | null;
  chain_group?: string | null;
  chain_order?: number | null;
}

interface Progression {
  id: string;
  name: string;
  level: number;
  description: string | null;
}

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  open: boolean;
  onClose: () => void;
  onAddToWorkout?: (exercise: Exercise) => void;
}

const levelLabels: Record<number, string> = {
  1: 'Beginner',
  2: 'Intermediate',
  3: 'Advanced',
  4: 'Expert',
  5: 'Elite',
};

const levelColors: Record<number, string> = {
  1: 'bg-green-500',
  2: 'bg-blue-500',
  3: 'bg-orange-500',
  4: 'bg-red-500',
  5: 'bg-purple-500',
};

export function ExerciseDetailModal({ exercise, open, onClose, onAddToWorkout }: ExerciseDetailModalProps) {
  const [progressions, setProgressions] = useState<Progression[]>([]);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(exercise);

  useEffect(() => {
    setCurrentExercise(exercise);
  }, [exercise]);

  useEffect(() => {
    if (currentExercise?.id && open) {
      supabase
        .from('progressions')
        .select('*')
        .eq('exercise_id', currentExercise.id)
        .order('level')
        .then(({ data }) => setProgressions(data || []));
    } else {
      setProgressions([]);
    }
  }, [currentExercise?.id, open]);

  const handleChainNavigate = async (exerciseId: string) => {
    const { data } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', exerciseId)
      .single();
    if (data) setCurrentExercise(data as unknown as Exercise);
  };

  if (!currentExercise) return null;

  const cues = Array.isArray(currentExercise.cues) 
    ? currentExercise.cues 
    : typeof currentExercise.cues === 'string' 
      ? JSON.parse(currentExercise.cues || '[]')
      : [];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden border-border">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6 space-y-6">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  {currentExercise.category}
                </span>
                {currentExercise.difficulty_level && (
                  <>
                    <span className="text-muted-foreground/30">·</span>
                    <DifficultyBadge level={currentExercise.difficulty_level} size="sm" />
                  </>
                )}
              </div>
              <DialogTitle className="text-xl font-display">{currentExercise.name}</DialogTitle>
            </DialogHeader>

            {/* Progression Path Strip */}
            <ProgressionPathStrip
              exerciseId={currentExercise.id}
              chainGroup={currentExercise.chain_group || null}
              onNavigate={handleChainNavigate}
            />

            {/* Video */}
            <VideoPlayer 
              youtubeUrl={currentExercise.youtube_url} 
              instagramUrl={currentExercise.instagram_url}
              title={currentExercise.name}
            />

            {/* Progression Ladder */}
            {progressions.length > 0 && (
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-3.5 h-3.5 text-foreground" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider">Progression Ladder</h4>
                </div>
                <div className="space-y-0">
                  {progressions.map((prog, i) => (
                    <div key={prog.id} className="flex items-start gap-3 relative">
                      {/* Vertical line */}
                      {i < progressions.length - 1 && (
                        <div className="absolute left-[11px] top-6 w-0.5 h-[calc(100%-4px)] bg-border" />
                      )}
                      {/* Level dot */}
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-mono font-bold text-white z-10",
                        levelColors[prog.level] || 'bg-muted'
                      )}>
                        {prog.level}
                      </div>
                      <div className="pb-4 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-semibold text-sm">{prog.name}</span>
                          <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">
                            {levelLabels[prog.level]}
                          </span>
                        </div>
                        {prog.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{prog.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Muscle Groups */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <Target className="w-3.5 h-3.5 text-foreground" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider">Primary</h4>
                </div>
                <div className="flex flex-wrap gap-1">
                  {currentExercise.primary_muscles.map((muscle) => (
                    <Badge key={muscle} variant="secondary" className="text-[10px] capitalize">{muscle}</Badge>
                  ))}
                </div>
              </div>
              
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <Target className="w-3.5 h-3.5 text-muted-foreground" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider">Secondary</h4>
                </div>
                <div className="flex flex-wrap gap-1">
                  {currentExercise.secondary_muscles.length > 0 ? (
                    currentExercise.secondary_muscles.map((muscle) => (
                      <Badge key={muscle} variant="outline" className="text-[10px] capitalize">{muscle}</Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">None</span>
                  )}
                </div>
              </div>
            </div>

            {/* Equipment */}
            {currentExercise.equipment.length > 0 && (
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <Dumbbell className="w-3.5 h-3.5 text-foreground" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider">Equipment</h4>
                </div>
                <div className="flex flex-wrap gap-1">
                  {currentExercise.equipment.map((item) => (
                    <Badge key={item} variant="outline" className="text-[10px] capitalize">{item}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Form Cues */}
            {cues.length > 0 && (
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-3.5 h-3.5 text-foreground" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider">Form Cues</h4>
                </div>
                <ol className="space-y-2">
                  {cues.map((cue: string, index: number) => (
                    <li key={index} className="flex items-start gap-2.5 text-sm">
                      <span className="w-5 h-5 rounded-full bg-secondary text-foreground flex items-center justify-center flex-shrink-0 text-[10px] font-mono font-bold">
                        {index + 1}
                      </span>
                      <span className="text-muted-foreground leading-relaxed">{cue}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Add to Workout */}
            {onAddToWorkout && (
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => { onAddToWorkout(currentExercise); onClose(); }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add to Today's Workout
              </Button>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
