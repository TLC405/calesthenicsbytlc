import { Play, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  'Push': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Pull': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Legs': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Core': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Skills': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Mobility': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
};

export function ExerciseCard({ exercise, onViewDetails, onAddToWorkout }: ExerciseCardProps) {
  const videoId = exercise.youtube_url ? getYouTubeVideoId(exercise.youtube_url) : null;
  const thumbnailUrl = videoId 
    ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    : exercise.image_url || null;

  return (
    <div 
      className="neumorph rounded-xl overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300"
      onClick={() => onViewDetails(exercise)}
    >
      {/* Thumbnail/Image Section */}
      <div className="aspect-video bg-muted relative overflow-hidden">
        {thumbnailUrl ? (
          <>
            <img 
              src={thumbnailUrl} 
              alt={exercise.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                if (videoId) {
                  (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                }
              }}
            />
            {videoId && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
                  <Play className="w-6 h-6 text-primary-foreground ml-0.5" fill="currentColor" />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <span className="text-4xl font-bold text-muted-foreground/30">
              {exercise.name.charAt(0)}
            </span>
          </div>
        )}
        
        {/* Category Badge */}
        <Badge 
          className={`absolute top-2 left-2 ${categoryColors[exercise.category] || 'bg-muted'}`}
        >
          {exercise.category}
        </Badge>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
          {exercise.name}
        </h3>
        
        {/* Muscle Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {exercise.primary_muscles.slice(0, 3).map((muscle) => (
            <span
              key={muscle}
              className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
            >
              {muscle}
            </span>
          ))}
        </div>

        {/* Quick Actions */}
        {onAddToWorkout && (
          <Button 
            size="sm" 
            variant="outline"
            className="w-full neumorph-flat"
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
