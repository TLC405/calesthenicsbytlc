import { useEffect, useState } from 'react';
import { useMusic } from '@/providers/MusicProvider';
import { Volume2, VolumeX, Play, Pause, Music, ChevronDown, SkipBack, SkipForward, Link2, Check, X, Plus, Search, Trash2, ListMusic } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export function MusicControl() {
  const {
    isPlaying, isMuted, volume, musicEnabled, isReady, playlistUrl, library,
    togglePlay, toggleMute, setVolume, setMusicEnabled, setPlaylistUrl,
    nextTrack, prevTrack, currentTrack, playUrl, addToLibrary, removeFromLibrary,
  } = useMusic();
  const [expanded, setExpanded] = useState(false);
  const [editingUrl, setEditingUrl] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [draftUrl, setDraftUrl] = useState('');
  const [draftTitle, setDraftTitle] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const location = useLocation();

  useEffect(() => { setDraftUrl(playlistUrl || ''); }, [playlistUrl, editingUrl]);

  const hiddenPaths = ['/', '/auth'];
  if (hiddenPaths.includes(location.pathname)) return null;

  const isYtMusic = /music\.youtube\.com/i.test(playlistUrl);
  const isYtUrl = (u: string) => /(youtu\.be|youtube\.com|music\.youtube\.com)/i.test(u);

  const saveUrl = () => {
    const trimmed = draftUrl.trim();
    if (trimmed && !isYtUrl(trimmed)) {
      toast({ title: 'Invalid URL', description: 'Paste a YouTube or YT Music link.', variant: 'destructive' });
      return;
    }
    setPlaylistUrl(trimmed);
    setEditingUrl(false);
    toast({ title: trimmed ? 'Now loading' : 'Reset to default' });
  };

  const addAndPlay = () => {
    const url = draftUrl.trim();
    if (!isYtUrl(url)) {
      toast({ title: 'Paste a YouTube link', variant: 'destructive' });
      return;
    }
    addToLibrary(url, draftTitle.trim() || undefined);
    playUrl(url);
    setDraftUrl(''); setDraftTitle(''); setEditingUrl(false);
    toast({ title: 'Added & playing' });
  };

  const openYouTubeSearch = () => {
    const q = searchQ.trim() || currentTrack?.title || '';
    if (!q) return;
    window.open(`https://music.youtube.com/search?q=${encodeURIComponent(q)}`, '_blank', 'noopener');
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

              {/* Search on YouTube */}
              <div className="flex items-center gap-1 pt-2 border-t border-border/40">
                <Search className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <Input
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') openYouTubeSearch(); }}
                  placeholder="Search any song on YouTube…"
                  className="h-7 text-xs flex-1"
                />
                <button onClick={openYouTubeSearch}
                  className="h-7 px-2 rounded-lg bg-accent text-foreground text-[9px] font-mono uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors">
                  Go
                </button>
              </div>
              <p className="text-[9px] text-muted-foreground/70 leading-snug -mt-1 pl-4">
                Find a song → copy link → paste below to play here.
              </p>

              {/* Add / paste URL */}
              {!editingUrl ? (
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditingUrl(true)}
                    className="flex-1 h-8 rounded-lg bg-primary/10 text-primary text-[10px] font-mono uppercase tracking-wider flex items-center justify-center gap-1 hover:bg-primary/20 transition-colors">
                    <Plus className="w-3 h-3" /> Paste song link
                  </button>
                  <button onClick={() => setShowLibrary(v => !v)}
                    className={cn(
                      "h-8 px-2 rounded-lg text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 transition-colors",
                      showLibrary ? "bg-primary text-primary-foreground" : "bg-accent text-foreground hover:bg-accent/70"
                    )}>
                    <ListMusic className="w-3 h-3" /> {library.length}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    autoFocus
                    value={draftUrl}
                    onChange={(e) => setDraftUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addAndPlay(); if (e.key === 'Escape') setEditingUrl(false); }}
                    placeholder="youtube.com/watch?v=… or playlist link"
                    className="h-8 text-xs"
                  />
                  <Input
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    placeholder="Optional label (e.g. 'Gym mix')"
                    className="h-8 text-xs"
                  />
                  <div className="flex items-center gap-1">
                    <button onClick={addAndPlay}
                      className="flex-1 h-7 rounded-lg bg-primary text-primary-foreground text-[10px] font-mono uppercase tracking-wider flex items-center justify-center gap-1 hover:bg-primary/90 transition-colors">
                      <Play className="w-3 h-3" /> Add & Play
                    </button>
                    <button onClick={saveUrl}
                      className="h-7 px-2 rounded-lg bg-accent text-foreground text-[10px] font-mono uppercase tracking-wider hover:bg-accent/70 transition-colors">
                      <Check className="w-3 h-3" />
                    </button>
                    <button onClick={() => setEditingUrl(false)}
                      className="h-7 px-2 rounded-lg bg-muted text-muted-foreground text-[10px] font-mono uppercase tracking-wider hover:bg-accent transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Library */}
              {showLibrary && (
                <div className="max-h-52 overflow-y-auto rounded-xl border border-border/40 divide-y divide-border/40">
                  {library.length === 0 ? (
                    <div className="p-3 text-center">
                      <Music className="w-4 h-4 text-muted-foreground/50 mx-auto mb-1" />
                      <p className="text-[10px] text-muted-foreground">Your library is empty.</p>
                      <p className="text-[9px] text-muted-foreground/70 mt-0.5">Paste a link above to add songs.</p>
                    </div>
                  ) : library.map(t => (
                    <div key={t.id} className="flex items-center gap-1 p-2 hover:bg-accent/40 transition-colors">
                      <button onClick={() => playUrl(t.url)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary/15 text-primary hover:bg-primary hover:text-primary-foreground transition-colors flex-shrink-0"
                        aria-label={`Play ${t.title}`}>
                        <Play className="w-3 h-3 ml-0.5" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-foreground truncate">{t.title}</p>
                        <p className="text-[9px] font-mono text-muted-foreground/70 truncate">{t.url.replace(/^https?:\/\//, '')}</p>
                      </div>
                      <button onClick={() => removeFromLibrary(t.id)}
                        className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                        aria-label="Remove">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
