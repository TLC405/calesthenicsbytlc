import { Play, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        "group cursor-pointer border-2 border-foreground bg-card overflow-hidden transition-all duration-150 hover:shadow-sm border-l-[4px]",
        categoryBorder[exercise.category] || 'border-l-muted'
      )}
      onClick={() => onViewDetails(exercise)}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-secondary relative overflow-hidden">
        {thumbnailUrl ? (
          <>
            <img 
              src={thumbnailUrl} 
              alt={exercise.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                if (videoId) {
                  const target = e.target as HTMLImageElement;
                  if (target.src.includes('mqdefault')) {
                    target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                  } else if (target.src.includes('hqdefault')) {
                    target.src = `https://img.youtube.com/vi/${videoId}/sddefault.jpg`;
                  } else {
                    target.style.display = 'none';
                  }
                }
              }}
            />
            {videoId && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-background bg-background/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Play className="w-4 h-4 text-foreground ml-0.5" fill="currentColor" />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary relative">
            <span className="text-3xl font-display font-bold text-muted-foreground/10">
              {exercise.name.charAt(0)}
            </span>
            <span className="absolute bottom-1.5 right-2 text-[7px] font-mono text-muted-foreground/30 uppercase tracking-[0.2em]">
              {exercise.category}
            </span>
          </div>
        )}
        
        {exercise.difficulty_level && (
          <div className="absolute top-2 right-2">
            <DifficultyBadge level={exercise.difficulty_level} size="sm" showLabel={false} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <div>
          <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-[0.2em]">
            {exercise.category}
          </p>
          <h3 className="font-display font-bold text-xs uppercase tracking-wider leading-tight line-clamp-1 mt-0.5">
            {exercise.name}
          </h3>
        </div>
        
        {/* Muscles */}
        <div className="flex flex-wrap gap-1">
          {exercise.primary_muscles.slice(0, 3).map((muscle) => (
            <span key={muscle} className="text-[8px] px-1.5 py-0.5 border border-foreground/15 text-muted-foreground font-mono uppercase tracking-wider">
              {muscle}
            </span>
          ))}
          {exercise.primary_muscles.length > 3 && (
            <span className="text-[8px] px-1.5 py-0.5 border border-foreground/15 text-muted-foreground font-mono">
              +{exercise.primary_muscles.length - 3}
            </span>
          )}
        </div>

        {onAddToWorkout && (
          <Button 
            size="sm" 
            variant="outline"
            className="w-full h-7 text-[9px] font-mono uppercase tracking-wider border-2 border-foreground"
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
