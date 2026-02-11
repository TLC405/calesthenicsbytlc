import { Play, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

interface ExerciseCardProps {
  exercise: Exercise;
  onViewDetails: (exercise: Exercise) => void;
  onAddToWorkout?: (exercise: Exercise) => void;
}

const getYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const categoryBorder: Record<string, string> = {
  'Push': 'border-l-red-500',
  'Pull': 'border-l-blue-500',
  'Legs': 'border-l-green-500',
  'Core': 'border-l-orange-500',
  'Skills': 'border-l-purple-500',
  'Mobility': 'border-l-teal-500',
};

export function ExerciseCard({ exercise, onViewDetails, onAddToWorkout }: ExerciseCardProps) {
  const videoId = exercise.youtube_url ? getYouTubeVideoId(exercise.youtube_url) : null;
  const thumbnailUrl = videoId 
    ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    : exercise.image_url || null;

  return (
    <div 
      className={cn(
        "group cursor-pointer rounded-xl border border-border bg-card overflow-hidden transition-all duration-200 hover:border-foreground/20 hover:shadow-lg border-l-[3px]",
        categoryBorder[exercise.category] || 'border-l-muted'
      )}
      onClick={() => onViewDetails(exercise)}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-muted relative overflow-hidden">
        {thumbnailUrl ? (
          <>
            <img 
              src={thumbnailUrl} 
              alt={exercise.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                if (videoId) {
                  const target = e.target as HTMLImageElement;
                  if (target.src.includes('mqdefault')) {
                    target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                  }
                }
              }}
            />
            {videoId && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-background/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300">
                  <Play className="w-5 h-5 text-foreground ml-0.5" fill="currentColor" />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <span className="text-4xl font-display font-bold text-muted-foreground/15">
              {exercise.name.charAt(0)}
            </span>
          </div>
        )}
        
        {/* Difficulty */}
        {exercise.difficulty_level && (
          <div className="absolute top-2 right-2">
            <DifficultyBadge level={exercise.difficulty_level} size="sm" showLabel={false} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">
            {exercise.category}
          </p>
          <h3 className="font-display font-semibold text-sm leading-tight line-clamp-1">
            {exercise.name}
          </h3>
        </div>
        
        {/* Muscles */}
        <div className="flex flex-wrap gap-1">
          {exercise.primary_muscles.slice(0, 3).map((muscle) => (
            <span key={muscle} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">
              {muscle}
            </span>
          ))}
          {exercise.primary_muscles.length > 3 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
              +{exercise.primary_muscles.length - 3}
            </span>
          )}
        </div>

        {/* Add button */}
        {onAddToWorkout && (
          <Button 
            size="sm" 
            variant="outline"
            className="w-full h-8 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onAddToWorkout(exercise);
            }}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add to Workout
          </Button>
        )}
      </div>
    </div>
  );
}
