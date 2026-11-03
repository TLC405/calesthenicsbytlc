import { minimumTier } from '@/lib/trainingPolicy';
import { useState } from 'react';
import { Plus, Dumbbell, X, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { exerciseLabel } from '@/lib/exerciseLabels';
import { ExerciseArtwork, getYouTubeId } from './ExerciseArtwork';

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

const difficultyLabel = ['', 'L1 · Starting', 'L2 · Foundation', 'L3 · Building', 'L4 · Advanced', 'L5 · Elite'];

export function ExerciseCard({ exercise, onViewDetails, onAddToWorkout }: ExerciseCardProps) {
  const [playing, setPlaying] = useState(false);
  const videoId = getYouTubeId(exercise.youtube_url);
  const style = categoryStyle[exercise.category] || { color: 'hsl(var(--muted-foreground))' };
  const level = minimumTier(exercise.slug);

  return (
    <div
      className="power-skeuo-card group relative min-w-0 cursor-pointer rounded-2xl border border-border/60 bg-card overflow-hidden transition-[border-color,box-shadow,transform] duration-200 hover:border-primary/40"
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
        ) : (
          <>
            <ExerciseArtwork title={exercise.name} category={exerciseLabel(exercise.slug,exercise.category)}
              youtubeUrl={exercise.youtube_url} imageUrl={exercise.image_url}
              className="absolute inset-0" />
            {videoId && (
              <button type="button" aria-label={`Play ${exercise.name} tutorial here`}
                className="absolute inset-0 z-10 grid place-items-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary"
                onClick={(event) => { event.stopPropagation(); setPlaying(true); }}>
                <span className="power-skeuo-play flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-transform group-hover:scale-105">
                  <Play className="ml-1 h-7 w-7" fill="currentColor" />
                </span>
              </button>
            )}
          </>
        )}

        {/* Category pill */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 pointer-events-none">
          <span
            className="text-[9px] font-mono font-bold uppercase tracking-[0.08em] px-2 py-1 rounded-lg text-white backdrop-blur-sm"
            style={{ backgroundColor: `${style.color}cc` }}
          >
            {exerciseLabel(exercise.slug,exercise.category)}
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
      <div className="p-3 sm:p-3.5 space-y-2.5">
        <div>
          <h3 className="font-display font-black text-sm sm:text-base tracking-tight leading-snug line-clamp-2 min-h-[2.4em]">{exercise.name}</h3>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
            <span className="text-[9px] font-mono text-muted-foreground tracking-wide">{difficultyLabel[level]}</span>
            {exercise.equipment?.length > 0 && exercise.equipment[0] !== 'None' && (
              <>
                <span className="text-border">·</span>
                <span className="text-[9px] font-mono text-muted-foreground tracking-wide flex items-center gap-0.5 min-w-0 truncate">
                  <Dumbbell className="w-2.5 h-2.5" />{exercise.equipment[0]}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Muscles */}
        <div className="flex flex-wrap gap-1">
          {exercise.primary_muscles.slice(0, 3).map(muscle => (
            <span key={muscle} className="text-[10px] px-1.5 py-0.5 rounded-md bg-accent/60 text-muted-foreground font-medium border border-border/30">
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
            className="w-full min-h-11 text-[11px] font-sans font-bold rounded-xl mt-1 bg-primary/10 hover:bg-primary/20 text-foreground border border-primary/20"
            variant="ghost"
            onClick={(e) => { e.stopPropagation(); onAddToWorkout(exercise); }}
          >
            <Plus className="w-4 h-4 mr-1" />Add to Workout
          </Button>
        )}
      </div>
    </div>
  );
}
