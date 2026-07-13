import { useEffect, useState } from 'react';
import { useMusic } from '@/providers/MusicProvider';
import { Volume2, VolumeX, Play, Pause, Music, ChevronDown, SkipBack, SkipForward, Link2, Check, X } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export function MusicControl() {
  const {
    isPlaying, isMuted, volume, musicEnabled, isReady, playlistUrl,
    togglePlay, toggleMute, setVolume, setMusicEnabled, setPlaylistUrl,
    nextTrack, prevTrack, currentTrack,
  } = useMusic();
  const [expanded, setExpanded] = useState(false);
  const [editingUrl, setEditingUrl] = useState(false);
  const [draftUrl, setDraftUrl] = useState('');
  const location = useLocation();

  useEffect(() => { setDraftUrl(playlistUrl || ''); }, [playlistUrl, editingUrl]);

  const hiddenPaths = ['/', '/auth'];
  if (hiddenPaths.includes(location.pathname)) return null;

  const isYtMusic = /music\.youtube\.com/i.test(playlistUrl);

  const saveUrl = () => {
    const trimmed = draftUrl.trim();
    if (trimmed && !/(youtu\.be|youtube\.com|music\.youtube\.com)/i.test(trimmed)) {
      toast({ title: 'Invalid URL', description: 'Paste a YouTube or YouTube Music link.', variant: 'destructive' });
      return;
    }
    setPlaylistUrl(trimmed);
    setEditingUrl(false);
    toast({ title: trimmed ? 'Playlist connected' : 'Reset to default' });
  };

  return (
    <div className="fixed right-3 bottom-[5.5rem] md:bottom-4 z-50">
      {expanded && (
        <div className="mb-2 w-[min(88vw,20rem)] rounded-2xl bg-card/95 backdrop-blur-2xl border border-border/50 shadow-xl p-4 space-y-3 animate-in slide-in-from-bottom-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-6 h-6 rounded-lg flex items-center justify-center",
                isYtMusic ? "bg-red-500/15 text-red-500" : "bg-primary/15 text-primary"
              )}>
                <Music className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-muted-foreground leading-none">
                  {isYtMusic ? 'YouTube Music' : 'YouTube'}
                </span>
                <span className="text-[8px] font-mono text-muted-foreground/70 leading-none mt-0.5">
                  {musicEnabled ? (isReady ? 'connected' : 'connecting…') : 'off'}
                </span>
              </div>
            </div>
            <Switch checked={musicEnabled} onCheckedChange={setMusicEnabled} className="scale-75" />
          </div>

          {musicEnabled && (
            <>
              {/* Now Playing */}
              <div className="rounded-xl bg-muted/40 p-3 border border-border/40">
                <p className="text-[8px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-1">
                  {!isReady ? 'Loading' : isPlaying ? 'Now Playing' : 'Paused'}
                </p>
                <p className="text-xs font-semibold text-foreground truncate">
                  {currentTrack?.title || 'I Got The Power'}
                </p>
                {currentTrack?.author && (
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">{currentTrack.author}</p>
                )}
                {isPlaying && (
                  <div className="flex items-end gap-[2px] h-3 mt-2">
                    {[6, 12, 4, 10, 8, 12, 6, 10].map((h, i) => (
                      <div key={i} className="w-[2px] rounded-full bg-primary animate-pulse"
                        style={{ height: `${h}px`, animationDelay: `${i * 90}ms`, animationDuration: '0.6s' }} />
                    ))}
                  </div>
                )}
              </div>

              {/* Transport */}
              <div className="flex items-center justify-center gap-2">
                <button onClick={prevTrack} disabled={!isReady}
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-accent text-foreground hover:bg-accent/70 disabled:opacity-30 transition-colors"
                  aria-label="Previous track">
                  <SkipBack className="w-3.5 h-3.5" />
                </button>
                <button onClick={togglePlay} disabled={!isReady}
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                    !isReady ? "opacity-30 bg-muted"
                      : isPlaying ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-primary/90 text-primary-foreground hover:bg-primary shadow-md"
                  )}
                  aria-label={isPlaying ? 'Pause' : 'Play'}>
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <button onClick={nextTrack} disabled={!isReady}
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-accent text-foreground hover:bg-accent/70 disabled:opacity-30 transition-colors"
                  aria-label="Next track">
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <button onClick={toggleMute}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-accent transition-colors flex-shrink-0"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}>
                  {isMuted ? <VolumeX className="w-4 h-4 text-muted-foreground" /> : <Volume2 className="w-4 h-4 text-muted-foreground" />}
                </button>
                <Slider value={[isMuted ? 0 : volume]} onValueChange={([v]) => setVolume(v)} max={100} step={1} className="flex-1" />
                <span className="text-[9px] font-mono text-muted-foreground w-6 text-right tabular-nums">{isMuted ? 0 : volume}</span>
              </div>

              {/* Playlist URL */}
              <div className="pt-2 border-t border-border/40">
                {!editingUrl ? (
                  <button onClick={() => setEditingUrl(true)}
                    className="w-full flex items-center gap-2 text-left group">
                    <Link2 className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-[10px] font-mono text-muted-foreground truncate flex-1 group-hover:text-foreground transition-colors">
                      {playlistUrl ? playlistUrl.replace(/^https?:\/\//, '') : 'Connect YouTube / YT Music playlist'}
                    </span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <Input
                      autoFocus
                      value={draftUrl}
                      onChange={(e) => setDraftUrl(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveUrl(); if (e.key === 'Escape') setEditingUrl(false); }}
                      placeholder="music.youtube.com/playlist?list=…"
                      className="h-8 text-xs"
                    />
                    <div className="flex items-center gap-1">
                      <button onClick={saveUrl}
                        className="flex-1 h-7 rounded-lg bg-primary text-primary-foreground text-[10px] font-mono uppercase tracking-wider flex items-center justify-center gap-1 hover:bg-primary/90 transition-colors">
                        <Check className="w-3 h-3" /> Save
                      </button>
                      <button onClick={() => setEditingUrl(false)}
                        className="h-7 px-2 rounded-lg bg-muted text-muted-foreground text-[10px] font-mono uppercase tracking-wider flex items-center justify-center hover:bg-accent transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-[9px] text-muted-foreground/80 leading-relaxed">
                      Tip: On YT Music, tap Share → Copy link on any playlist.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "w-14 h-14 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200 border active:scale-95",
          musicEnabled && isPlaying
            ? "bg-primary text-primary-foreground border-primary/50"
            : "bg-card text-muted-foreground border-border/50 hover:text-foreground hover:border-border"
        )}
        aria-label="Toggle music controls">
        {expanded ? (
          <ChevronDown className="w-5 h-5" />
        ) : isPlaying ? (
          <div className="flex items-end gap-[2px] h-4">
            {[6, 10, 4, 8].map((h, i) => (
              <div key={i} className="w-[2px] rounded-full bg-current animate-pulse"
                style={{ height: `${h}px`, animationDelay: `${i * 120}ms`, animationDuration: '0.6s' }} />
            ))}
          </div>
        ) : (
          <Music className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
