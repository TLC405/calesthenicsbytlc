import { X, Plus, Dumbbell, Target, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VideoPlayer } from './VideoPlayer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DifficultyBadge } from './DifficultyBadge';
import { cn } from '@/lib/utils';

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
}

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  open: boolean;
  onClose: () => void;
  onAddToWorkout?: (exercise: Exercise) => void;
}

export function ExerciseDetailModal({ exercise, open, onClose, onAddToWorkout }: ExerciseDetailModalProps) {
  if (!exercise) return null;

  const cues = Array.isArray(exercise.cues) 
    ? exercise.cues 
    : typeof exercise.cues === 'string' 
      ? JSON.parse(exercise.cues || '[]')
      : [];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden border-border">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6 space-y-6">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  {exercise.category}
                </span>
                {exercise.difficulty_level && (
                  <>
                    <span className="text-muted-foreground/30">·</span>
                    <DifficultyBadge level={exercise.difficulty_level} size="sm" />
                  </>
                )}
              </div>
              <DialogTitle className="text-xl font-display">{exercise.name}</DialogTitle>
            </DialogHeader>

            {/* Video */}
            <VideoPlayer 
              youtubeUrl={exercise.youtube_url} 
              instagramUrl={exercise.instagram_url}
              title={exercise.name}
            />

            {/* Muscle Groups */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <Target className="w-3.5 h-3.5 text-foreground" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider">Primary</h4>
                </div>
                <div className="flex flex-wrap gap-1">
                  {exercise.primary_muscles.map((muscle) => (
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
                  {exercise.secondary_muscles.length > 0 ? (
                    exercise.secondary_muscles.map((muscle) => (
                      <Badge key={muscle} variant="outline" className="text-[10px] capitalize">{muscle}</Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">None</span>
                  )}
                </div>
              </div>
            </div>

            {/* Equipment */}
            {exercise.equipment.length > 0 && (
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <Dumbbell className="w-3.5 h-3.5 text-foreground" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider">Equipment</h4>
                </div>
                <div className="flex flex-wrap gap-1">
                  {exercise.equipment.map((item) => (
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
                onClick={() => { onAddToWorkout(exercise); onClose(); }}
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
