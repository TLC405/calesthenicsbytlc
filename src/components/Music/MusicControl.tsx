import { useState } from 'react';
import { useMusic } from '@/providers/MusicProvider';
import { Volume2, VolumeX, Play, Pause, Music, ChevronUp, ChevronDown } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

export function MusicControl() {
  const { isPlaying, isMuted, volume, musicEnabled, isReady, togglePlay, toggleMute, setVolume, setMusicEnabled } = useMusic();
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();

  // Hide on landing and auth
  const hiddenPaths = ['/', '/auth'];
  if (hiddenPaths.includes(location.pathname)) return null;

  return (
    <div className="fixed right-3 bottom-[5.5rem] md:bottom-4 z-50">
      {/* Expanded panel */}
      {expanded && (
        <div className="mb-2 w-56 rounded-2xl bg-card/95 backdrop-blur-2xl border border-border/50 shadow-lg p-3 space-y-3 animate-in slide-in-from-bottom-2 duration-200">
          {/* Enable toggle */}
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-muted-foreground">Music</span>
            <Switch
              checked={musicEnabled}
              onCheckedChange={setMusicEnabled}
              className="scale-75"
            />
          </div>

          {/* Play/Pause */}
          {musicEnabled && (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  disabled={!isReady}
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 flex-shrink-0",
                    !isReady
                      ? "opacity-30 cursor-not-allowed bg-muted"
                      : isPlaying
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-accent text-foreground hover:bg-primary hover:text-primary-foreground"
                  )}
                  aria-label={isPlaying ? 'Pause music' : 'Play music'}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-mono uppercase tracking-[0.1em] text-foreground truncate">
                    {!isReady ? 'Loading...' : isPlaying ? '♪ Now Playing' : 'Paused'}
                  </p>
                  <p className="text-[8px] font-mono text-muted-foreground truncate">I Got The Power</p>
                </div>
              </div>

              {/* Equalizer bars when playing */}
              {isPlaying && (
                <div className="flex items-end justify-center gap-[2px] h-4">
                  {[8, 14, 6, 10, 12, 8, 14].map((h, i) => (
                    <div
                      key={i}
                      className="w-[2px] rounded-full bg-primary animate-pulse"
                      style={{
                        height: `${h}px`,
                        animationDelay: `${i * 100}ms`,
                        animationDuration: '0.6s',
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Volume */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-accent transition-colors flex-shrink-0"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-muted-foreground" /> : <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
                <Slider
                  value={[volume]}
                  onValueChange={([v]) => setVolume(v)}
                  max={100}
                  step={1}
                  className="flex-1"
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* FAB toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200 border",
          musicEnabled && isPlaying
            ? "bg-primary text-primary-foreground border-primary/50"
            : "bg-card text-muted-foreground border-border/50 hover:text-foreground hover:border-border"
        )}
        aria-label="Toggle music controls"
      >
        {expanded ? (
          <ChevronDown className="w-5 h-5" />
        ) : isPlaying ? (
          <div className="flex items-end gap-[2px] h-4">
            {[6, 10, 4, 8].map((h, i) => (
              <div
                key={i}
                className="w-[2px] rounded-full bg-current animate-pulse"
                style={{
                  height: `${h}px`,
                  animationDelay: `${i * 120}ms`,
                  animationDuration: '0.6s',
                }}
              />
            ))}
          </div>
        ) : (
          <Music className="w-4.5 h-4.5" />
        )}
      </button>
    </div>
  );
}
