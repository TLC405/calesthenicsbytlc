import { useState } from 'react';
import { Plus, Dumbbell, X, Play } from 'lucide-react';
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
  const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  return match && match[2].length === 11 ? match[2] : null;
};

const categoryStyle: Record<string, { color: string }> = {
  Push: { color: 'hsl(var(--cat-push))' },
  Pull: { color: 'hsl(var(--cat-pull))' },
  Legs: { color: 'hsl(var(--cat-legs))' },
  Core: { color: 'hsl(var(--cat-core))' },
  Skills: { color: 'hsl(var(--cat-skills))' },
  Yoga: { color: 'hsl(330,65%,55%)' },
  Mobility: { color: 'hsl(var(--cat-mobility))' },
  Flexibility: { color: 'hsl(45,93%,47%)' },
  Rings: { color: 'hsl(45,80%,40%)' },
};

const difficultyLabel = ['', 'Beginner', 'Easy', 'Intermediate', 'Advanced', 'Elite'];

export function ExerciseCard({ exercise, onViewDetails, onAddToWorkout }: ExerciseCardProps) {
  const [playing, setPlaying] = useState(false);
  const videoId = exercise.youtube_url ? getYouTubeVideoId(exercise.youtube_url) : null;
  const thumbnailUrl = videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : exercise.image_url || null;
  const style = categoryStyle[exercise.category] || { color: 'hsl(var(--muted-foreground))' };
  const level = exercise.difficulty_level || 1;

  return (
    <div
      className="power-skeuo-card group cursor-pointer rounded-2xl border border-border/40 bg-card overflow-hidden transition-all duration-300 hover:border-border hover:shadow-lg"
      onClick={() => { if (!playing) onViewDetails(exercise); }}
      style={{ '--glow-color': `${style.color}20` } as any}
    >
      {/* Thumbnail */}
      <div className="power-skeuo-screen aspect-[16/10] bg-muted/30 relative overflow-hidden">
        {playing && videoId ? (
          <div className="relative h-full w-full bg-black" onClick={(event) => event.stopPropagation()}>
            <iframe
              className="h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0`}
              title={`${exercise.name} video tutorial`}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); setPlaying(false); }}
              className="power-skeuo-button absolute right-2 top-2 z-20 grid h-9 w-9 place-items-center rounded-xl bg-black/80 text-white"
              aria-label={`Close ${exercise.name} video`}
            ><X className="h-4 w-4" /></button>
          </div>
        ) : thumbnailUrl ? (
          <>
            <img
              src={thumbnailUrl}
              alt={exercise.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                if (videoId) {
                  const target = e.target as HTMLImageElement;
                  if (target.src.includes('mqdefault')) target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                  else target.style.display = 'none';
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            {videoId && (
              <button
                type="button"
                aria-label={`Play ${exercise.name} tutorial here`}
                className="absolute inset-0 z-10 flex items-center justify-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary"
                onClick={(event) => { event.stopPropagation(); setPlaying(true); }}
              >
                <span className="power-skeuo-play flex h-16 w-16 items-center justify-center rounded-full text-white transition-transform group-hover:scale-105">
                  <Play className="ml-1 h-7 w-7" fill="currentColor"/>
                </span>
              </button>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center relative">
            <span className="text-4xl font-display font-black text-muted-foreground/5 uppercase select-none">
              {exercise.name.substring(0, 3)}
            </span>
          </div>
        )}

        {/* Category pill */}
        <div className="absolute top-3 left-3">
          <span
            className="text-[8px] font-mono font-bold uppercase tracking-[0.12em] px-2 py-1 rounded-lg text-white backdrop-blur-sm"
            style={{ backgroundColor: `${style.color}cc` }}
          >
            {exercise.category}
          </span>
        </div>

        {/* Difficulty */}
        <div className="absolute bottom-3 right-3 flex gap-[3px]">
          {[1,2,3,4,5].map(i => (
            <div key={i} className={cn("w-[5px] h-[5px] rounded-full", i <= level ? 'bg-white' : 'bg-white/20')} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 space-y-2.5">
        <div>
          <h3 className="font-display font-bold text-sm tracking-tight leading-tight line-clamp-1">{exercise.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[9px] font-mono text-muted-foreground tracking-wide">{difficultyLabel[level]}</span>
            {exercise.equipment.length > 0 && exercise.equipment[0] !== 'None' && (
              <>
                <span className="text-border">·</span>
                <span className="text-[9px] font-mono text-muted-foreground tracking-wide flex items-center gap-0.5">
                  <Dumbbell className="w-2.5 h-2.5" />{exercise.equipment[0]}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Muscles */}
        <div className="flex flex-wrap gap-1">
          {exercise.primary_muscles.slice(0, 3).map(muscle => (
            <span key={muscle} className="text-[7px] px-1.5 py-0.5 rounded-md bg-accent/60 text-muted-foreground font-mono border border-border/30">
              {muscle}
            </span>
          ))}
          {exercise.primary_muscles.length > 3 && (
            <span className="text-[7px] px-1.5 py-0.5 text-muted-foreground/50 font-mono">+{exercise.primary_muscles.length - 3}</span>
          )}
        </div>

        {onAddToWorkout && (
          <Button
            size="sm"
            className="w-full h-8 text-[8px] font-mono uppercase tracking-wider rounded-xl mt-1 bg-accent hover:bg-accent/80 text-foreground border border-border/50"
            variant="ghost"
            onClick={(e) => { e.stopPropagation(); onAddToWorkout(exercise); }}
          >
            <Plus className="w-3 h-3 mr-1" />Add to Workout
          </Button>
        )}
      </div>
    </div>
  );
}
