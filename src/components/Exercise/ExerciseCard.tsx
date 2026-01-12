import { Play, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DifficultyBadge } from './DifficultyBadge';

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

const categoryColors: Record<string, string> = {
  'Push': 'bg-red-500/20 text-red-600 border-red-500/30',
  'Pull': 'bg-blue-500/20 text-blue-600 border-blue-500/30',
  'Legs': 'bg-green-500/20 text-green-600 border-green-500/30',
  'Core': 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
  'Skills': 'bg-purple-500/20 text-purple-600 border-purple-500/30',
  'Mobility': 'bg-teal-500/20 text-teal-600 border-teal-500/30',
};

export function ExerciseCard({ exercise, onViewDetails, onAddToWorkout }: ExerciseCardProps) {
  const videoId = exercise.youtube_url ? getYouTubeVideoId(exercise.youtube_url) : null;
  const thumbnailUrl = videoId 
    ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    : exercise.image_url || null;

  return (
    <div 
      className="premium-card overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300 animate-fade-in"
      onClick={() => onViewDetails(exercise)}
    >
      {/* Thumbnail/Image Section */}
      <div className="aspect-video bg-muted relative overflow-hidden">
        {thumbnailUrl ? (
          <>
            <img 
              src={thumbnailUrl} 
              alt={exercise.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                if (videoId) {
                  const target = e.target as HTMLImageElement;
                  if (target.src.includes('mqdefault')) {
                    target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                  } else if (target.src.includes('hqdefault')) {
                    target.src = `https://img.youtube.com/vi/${videoId}/default.jpg`;
                  }
                }
              }}
            />
            {videoId && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                  <Play className="w-6 h-6 text-foreground ml-0.5" fill="currentColor" />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <span className="text-5xl font-display font-bold text-muted-foreground/20">
              {exercise.name.charAt(0)}
            </span>
          </div>
        )}
        
        {/* Category Badge */}
        <Badge 
          className={`absolute top-3 left-3 ${categoryColors[exercise.category] || 'bg-muted'} font-medium`}
        >
          {exercise.category}
        </Badge>

        {/* Difficulty Badge */}
        {exercise.difficulty_level && (
          <div className="absolute top-3 right-3">
            <DifficultyBadge level={exercise.difficulty_level} size="sm" />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {exercise.name}
        </h3>
        
        {/* Muscle Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {exercise.primary_muscles.slice(0, 3).map((muscle) => (
            <span
              key={muscle}
              className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium"
            >
              {muscle}
            </span>
          ))}
          {exercise.primary_muscles.length > 3 && (
            <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
              +{exercise.primary_muscles.length - 3}
            </span>
          )}
        </div>

        {/* Quick Actions */}
        {onAddToWorkout && (
          <Button 
            size="sm" 
            variant="outline"
            className="w-full premium-hover"
            onClick={(e) => {
              e.stopPropagation();
              onAddToWorkout(exercise);
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add to Workout
          </Button>
        )}
      </div>
    </div>
  );
}
