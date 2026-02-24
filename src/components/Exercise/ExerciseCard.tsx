import { Play, Plus, Zap, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

const categoryStyle: Record<string, { border: string; bg: string; text: string }> = {
  'Push': { border: 'border-l-red-500', bg: 'bg-red-500', text: 'text-red-500' },
  'Pull': { border: 'border-l-blue-500', bg: 'bg-blue-500', text: 'text-blue-500' },
  'Legs': { border: 'border-l-green-500', bg: 'bg-green-500', text: 'text-green-500' },
  'Core': { border: 'border-l-orange-500', bg: 'bg-orange-500', text: 'text-orange-500' },
  'Skills': { border: 'border-l-purple-500', bg: 'bg-purple-500', text: 'text-purple-500' },
  'Mobility': { border: 'border-l-teal-500', bg: 'bg-teal-500', text: 'text-teal-500' },
};

const difficultyLabel = ['', 'Beginner', 'Easy', 'Intermediate', 'Advanced', 'Elite'];

export function ExerciseCard({ exercise, onViewDetails, onAddToWorkout }: ExerciseCardProps) {
  const videoId = exercise.youtube_url ? getYouTubeVideoId(exercise.youtube_url) : null;
  const thumbnailUrl = videoId 
    ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    : exercise.image_url || null;
  const style = categoryStyle[exercise.category] || { border: 'border-l-muted', bg: 'bg-muted', text: 'text-muted-foreground' };
  const level = exercise.difficulty_level || 1;

  return (
    <div 
      className={cn(
        "group cursor-pointer border-2 border-foreground bg-card overflow-hidden transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm border-l-[5px]",
        style.border
      )}
      onClick={() => onViewDetails(exercise)}
    >
      {/* Thumbnail */}
      <div className="aspect-[16/10] bg-secondary relative overflow-hidden">
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
            <span className="text-4xl font-display font-black text-muted-foreground/8 uppercase">
              {exercise.name.substring(0, 3)}
            </span>
            <div className={cn("absolute top-0 left-0 w-full h-1", style.bg)} />
          </div>
        )}
        
        {/* Category pill */}
        <div className="absolute top-2 left-2">
          <span className={cn("text-[8px] font-mono font-bold uppercase tracking-[0.15em] px-1.5 py-0.5 bg-background/90 border border-foreground/20", style.text)}>
            {exercise.category}
          </span>
        </div>

        {/* Difficulty bar */}
        <div className="absolute bottom-0 left-0 right-0 flex">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className={cn("h-[3px] flex-1", i <= level ? style.bg : 'bg-foreground/10')} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-1.5">
        <div>
          <h3 className="font-display font-bold text-sm uppercase tracking-wider leading-tight line-clamp-1">
            {exercise.name}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-wider">
              {difficultyLabel[level]}
            </span>
            {exercise.equipment.length > 0 && exercise.equipment[0] !== 'None' && (
              <>
                <span className="text-muted-foreground/30">·</span>
                <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-0.5">
                  <Dumbbell className="w-2.5 h-2.5" />
                  {exercise.equipment[0]}
                </span>
              </>
            )}
          </div>
        </div>
        
        {/* Muscles */}
        <div className="flex flex-wrap gap-1">
          {exercise.primary_muscles.slice(0, 3).map((muscle) => (
            <span key={muscle} className="text-[8px] px-1.5 py-0.5 border border-foreground/15 text-foreground font-mono uppercase tracking-wider bg-secondary/50">
              {muscle}
            </span>
          ))}
          {exercise.primary_muscles.length > 3 && (
            <span className="text-[8px] px-1.5 py-0.5 text-muted-foreground font-mono">
              +{exercise.primary_muscles.length - 3}
            </span>
          )}
        </div>

        {onAddToWorkout && (
          <Button 
            size="sm" 
            variant="outline"
            className="w-full h-7 text-[9px] font-mono uppercase tracking-wider border-2 border-foreground mt-1"
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
