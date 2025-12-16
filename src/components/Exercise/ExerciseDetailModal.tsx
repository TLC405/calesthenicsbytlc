import { X, Plus, Dumbbell, Target, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VideoPlayer } from './VideoPlayer';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Exercise {
  id: string;
  name: string;
  slug: string;
  category: string;
  primary_muscles: string[];
  secondary_muscles: string[];
  equipment: string[];
  cues: any;
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

const categoryColors: Record<string, string> = {
  'Push': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Pull': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Legs': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Core': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Skills': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Mobility': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
};

export function ExerciseDetailModal({ exercise, open, onClose, onAddToWorkout }: ExerciseDetailModalProps) {
  if (!exercise) return null;

  const cues = Array.isArray(exercise.cues) 
    ? exercise.cues 
    : typeof exercise.cues === 'string' 
      ? JSON.parse(exercise.cues || '[]')
      : [];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            <DialogHeader className="mb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge className={`mb-2 ${categoryColors[exercise.category] || 'bg-muted'}`}>
                    {exercise.category}
                  </Badge>
                  <DialogTitle className="text-2xl">{exercise.name}</DialogTitle>
                </div>
              </div>
            </DialogHeader>

            {/* Video Player */}
            <div className="mb-6">
              <VideoPlayer 
                youtubeUrl={exercise.youtube_url} 
                instagramUrl={exercise.instagram_url}
                title={exercise.name}
              />
            </div>

            {/* Muscle Groups */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="neumorph-inset rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold text-sm">Primary Muscles</h4>
                </div>
                <div className="flex flex-wrap gap-1">
                  {exercise.primary_muscles.map((muscle) => (
                    <Badge key={muscle} variant="secondary" className="capitalize">
                      {muscle}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="neumorph-inset rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <h4 className="font-semibold text-sm">Secondary Muscles</h4>
                </div>
                <div className="flex flex-wrap gap-1">
                  {exercise.secondary_muscles.length > 0 ? (
                    exercise.secondary_muscles.map((muscle) => (
                      <Badge key={muscle} variant="outline" className="capitalize">
                        {muscle}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">None</span>
                  )}
                </div>
              </div>
            </div>

            {/* Equipment */}
            {exercise.equipment.length > 0 && (
              <div className="neumorph-inset rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Dumbbell className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold text-sm">Equipment</h4>
                </div>
                <div className="flex flex-wrap gap-1">
                  {exercise.equipment.map((item) => (
                    <Badge key={item} variant="outline" className="capitalize">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Form Cues */}
            {cues.length > 0 && (
              <div className="neumorph-inset rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold text-sm">Form Cues</h4>
                </div>
                <ul className="space-y-2">
                  {cues.map((cue: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-medium">
                        {index + 1}
                      </span>
                      <span>{cue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Add to Workout Button */}
            {onAddToWorkout && (
              <Button 
                className="w-full neumorph" 
                size="lg"
                onClick={() => {
                  onAddToWorkout(exercise);
                  onClose();
                }}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add to Today's Workout
              </Button>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
