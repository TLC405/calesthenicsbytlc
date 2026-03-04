import { useState } from 'react';
import { useMusic } from '@/providers/MusicProvider';
import { Volume2, VolumeX, Play, Pause, Music, Power } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

export function MusicControl() {
  const { isPlaying, isMuted, volume, musicEnabled, isReady, togglePlay, toggleMute, setVolume, setMusicEnabled } = useMusic();
  const [showVolume, setShowVolume] = useState(false);
  const location = useLocation();

  // Hide on landing and auth
  const hiddenPaths = ['/', '/auth'];
  if (hiddenPaths.includes(location.pathname)) return null;

  return (
    <div className="fixed bottom-14 md:bottom-0 left-0 right-0 z-40 border-t-2 border-foreground bg-background">
      <div className="max-w-6xl mx-auto px-3 h-12 flex items-center gap-2">
        {/* On/Off toggle */}
        <div className="flex items-center gap-1.5">
          <Power className={cn("w-3 h-3", musicEnabled ? "text-[hsl(var(--cat-skills))]" : "text-muted-foreground")} />
          <Switch
            checked={musicEnabled}
            onCheckedChange={setMusicEnabled}
            className="scale-75 origin-left"
          />
        </div>

        <div className="w-px h-6 bg-foreground/10" />

        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          disabled={!musicEnabled || !isReady}
          className={cn(
            "w-8 h-8 border-2 border-foreground flex items-center justify-center transition-all duration-150 flex-shrink-0",
            !musicEnabled || !isReady
              ? "opacity-30 cursor-not-allowed"
              : isPlaying
                ? "bg-[hsl(var(--cat-skills))] text-white"
                : "bg-background text-foreground hover:bg-foreground hover:text-background"
          )}
          aria-label={isPlaying ? 'Pause music' : 'Play music'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
        </button>

        {/* Equalizer bars when playing */}
        {isPlaying && (
          <div className="flex items-end gap-[2px] h-6">
            {[8, 14, 6, 10, 12].map((h, i) => (
              <div
                key={i}
                className="w-[2px] bg-[hsl(var(--cat-skills))] animate-pulse"
                style={{
                  height: `${h}px`,
                  animationDelay: `${i * 120}ms`,
                  animationDuration: '0.6s',
                }}
              />
            ))}
          </div>
        )}

        {/* Track label */}
        <div className="flex-1 min-w-0 px-2">
          <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-muted-foreground truncate">
            {!musicEnabled ? 'Music Off' : !isReady ? 'Loading...' : isPlaying ? '♪ Now Playing' : 'Paused'}
          </p>
          <p className="text-[8px] font-mono text-muted-foreground/50 truncate">
            {musicEnabled ? 'I Got The Power' : ''}
          </p>
        </div>

        {/* Volume section */}
        <div className="flex items-center gap-1.5">
          {showVolume && musicEnabled && (
            <div className="w-20">
              <Slider
                value={[volume]}
                onValueChange={([v]) => setVolume(v)}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          )}
          <button
            onClick={() => {
              if (showVolume) { toggleMute(); }
              setShowVolume(!showVolume);
            }}
            disabled={!musicEnabled}
            className={cn(
              "w-8 h-8 border-2 border-foreground flex items-center justify-center transition-all duration-150 flex-shrink-0",
              !musicEnabled
                ? "opacity-30 cursor-not-allowed"
                : isMuted
                  ? "bg-muted text-muted-foreground"
                  : "bg-background text-foreground hover:bg-foreground hover:text-background"
            )}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* YouTube source indicator */}
        <div className="hidden sm:flex items-center gap-1 text-muted-foreground/40">
          <Music className="w-3 h-3" />
          <span className="text-[7px] font-mono uppercase tracking-wider">YT</span>
        </div>
      </div>
    </div>
  );
}
