import { useMusic } from '@/providers/MusicProvider';
import { Volume2, VolumeX, Play, Pause, Music } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MusicControl() {
  const { isPlaying, isMuted, musicEnabled, togglePlay, toggleMute } = useMusic();

  if (!musicEnabled) return null;

  return (
    <div className="fixed bottom-[72px] md:bottom-4 right-3 z-50 flex items-center gap-1">
      {/* Play/Pause */}
      <button
        onClick={togglePlay}
        className={cn(
          "w-9 h-9 border-2 border-foreground flex items-center justify-center transition-all duration-150",
          isPlaying
            ? "bg-[hsl(var(--cat-skills))] text-white"
            : "bg-background text-foreground hover:bg-foreground hover:text-background"
        )}
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
      </button>

      {/* Mute toggle */}
      <button
        onClick={toggleMute}
        className={cn(
          "w-9 h-9 border-2 border-foreground flex items-center justify-center transition-all duration-150",
          isMuted
            ? "bg-muted text-muted-foreground"
            : "bg-background text-foreground hover:bg-foreground hover:text-background"
        )}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
      </button>

      {/* Music indicator */}
      {isPlaying && (
        <div className="w-5 h-9 flex items-end justify-center gap-[2px] pb-2">
          <div className="w-[2px] bg-[hsl(var(--cat-skills))] animate-pulse" style={{ height: '8px', animationDelay: '0ms' }} />
          <div className="w-[2px] bg-[hsl(var(--cat-push))] animate-pulse" style={{ height: '12px', animationDelay: '150ms' }} />
          <div className="w-[2px] bg-[hsl(var(--cat-pull))] animate-pulse" style={{ height: '6px', animationDelay: '300ms' }} />
        </div>
      )}
    </div>
  );
}
