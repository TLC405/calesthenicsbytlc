import { useState } from 'react';
import { ChevronDown, ChevronUp, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SetTracker, SetData } from './SetTracker';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Exercise {
  id: string;
  name: string;
  slug: string;
  category: string;
  youtube_url?: string | null;
}

interface ExerciseLogItemProps {
  exercise: Exercise;
  sets: SetData[];
  onSetsChange: (sets: SetData[]) => void;
  onRemove: () => void;
  onViewVideo?: () => void;
}

const getYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export function ExerciseLogItem({ exercise, sets, onSetsChange, onRemove, onViewVideo }: ExerciseLogItemProps) {
  const [isOpen, setIsOpen] = useState(true);
  
  const videoId = exercise.youtube_url ? getYouTubeVideoId(exercise.youtube_url) : null;
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/default.jpg` : null;

  const totalReps = sets.reduce((sum, set) => sum + set.reps, 0);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="neumorph-inset rounded-lg overflow-hidden">
      <CollapsibleTrigger asChild>
        <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors">
          {/* Thumbnail */}
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
            {thumbnailUrl ? (
              <img src={thumbnailUrl} alt={exercise.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg font-bold text-muted-foreground">
                {exercise.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{exercise.name}</h4>
            <p className="text-sm text-muted-foreground">
              {sets.length} sets × {totalReps} reps
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {videoId && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewVideo?.();
                }}
              >
                <Play className="w-4 h-4" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-3 pb-3 pt-1 border-t border-border/50">
          <SetTracker sets={sets} onChange={onSetsChange} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
