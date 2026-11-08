import { parseEmbeddedMedia } from '@/lib/embeddedMedia';
import { getYouTubeId } from '@/lib/youtube';
import { loadYouTubeApi } from '@/lib/youtubeApi';
import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { createPortal } from 'react-dom';

interface TrackInfo { title?: string; author?: string; videoId?: string }
export interface SavedTrack { id: string; url: string; title: string; addedAt: number }
interface MusicContextType {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  playlistUrl: string;
  musicEnabled: boolean;
  isReady: boolean;
  currentTrack: TrackInfo | null;
  library: SavedTrack[];
  togglePlay: () => void;
  toggleMute: () => void;
  setVolume: (v: number) => void;
  setPlaylistUrl: (url: string) => void;
  setMusicEnabled: (enabled: boolean) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  playUrl: (url: string) => void;
  playIntroAnthem: () => void;
  playbackError: string | null;
  playerVisible: boolean;
  dismissPlayer: () => void;
  addToLibrary: (url: string, title?: string) => void;
  removeFromLibrary: (id: string) => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic must be used within MusicProvider');
  return ctx;
}

export const POWER_ANTHEM_VIDEO_ID = 'nm6DO_7px1I'; // SNAP! - The Power (official YouTube source)
const DEFAULT_VIDEO = POWER_ANTHEM_VIDEO_ID;

function extractPlaylistId(url:string):string|null{const source=parseEmbeddedMedia(url);return source?.provider==='youtube'?source.playlistId||null:null;}
function extractVideoId(url:string):string|null{return getYouTubeId(url);}

// Declare YT types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

const loadYouTubeAPI=()=>loadYouTubeApi().then(()=>{});

export function MusicProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(50);
  const [playlistUrl, setPlaylistUrlState] = useState('');
  const [musicEnabled, setMusicEnabledState] = useState(() => localStorage.getItem('music_enabled') !== 'false');
  const [isReady, setIsReady] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<TrackInfo | null>(null);
  const [library, setLibrary] = useState<SavedTrack[]>(() => {
    try { return JSON.parse(localStorage.getItem('music_library') || '[]'); } catch { return []; }
  });
  const initAttempted = useRef(false);
  const pendingIntroRef = useRef(false);
  const pendingPlaybackRef = useRef(false);
  const appliedUrlRef = useRef<string | null>(null);
  const transferRef = useRef<{ videoId: string; seconds: number; playing: boolean; index: number } | null>(null);
  const [playerVisible, setPlayerVisible] = useState(false);
  const [inlineTarget, setInlineTarget] = useState<HTMLElement | null>(null);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const placementRef = useRef({ musicEnabled, playerVisible, inlineTarget });
  placementRef.current = { musicEnabled, playerVisible, inlineTarget };

  // Home intro supplies an inline mount point, keeping the YouTube embed in the page rather than a floating popup.
  useEffect(() => {
    const handle = (event: Event) => setInlineTarget((event as CustomEvent<HTMLElement | null>).detail);
    window.addEventListener('power-music-inline-target', handle);
    setInlineTarget(document.getElementById('power-inline-youtube'));
    return () => window.removeEventListener('power-music-inline-target', handle);
  }, []);

  // Load user prefs
  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('music_playlist_url, music_enabled').eq('id', user.id).single()
      .then(({ data }) => {
        if (data) {
          if (data.music_playlist_url) setPlaylistUrlState(data.music_playlist_url);
          if (data.music_enabled !== null && data.music_enabled !== undefined) {
            setMusicEnabledState(data.music_enabled);
            localStorage.setItem('music_enabled', String(data.music_enabled));
          }
        }
      });
  }, [user]);

  // Build video config
  const getPlayerConfig = useCallback(() => {
    const playlistId = playlistUrl ? extractPlaylistId(playlistUrl) : null;
    const videoId = playlistUrl ? extractVideoId(playlistUrl) : null;
    
    if (playlistId) {
      return { videoId: '', playerVars: { listType: 'playlist' as const, list: playlistId } };
    }
    return { videoId: videoId || DEFAULT_VIDEO, playerVars: {} };
  }, [playlistUrl]);

  // Initialize YouTube player
  useEffect(() => {
    // The YouTube embed is created only when it can stay visibly displayed.
    if (!musicEnabled || !playerVisible || initAttempted.current) return;
    initAttempted.current = true;

    let cancelled = false;
    const init = async () => {
      let timeout: ReturnType<typeof setTimeout> | undefined;
      try {
        await Promise.race([loadYouTubeAPI(),new Promise<never>((_,reject)=>{timeout=setTimeout(()=>reject(new Error('YouTube did not connect. Close the player and try again.')),12000);})]);
      } finally { if(timeout)clearTimeout(timeout); }
      if(cancelled)return;
      if (!containerRef.current || playerRef.current) return;

      const config = getPlayerConfig();
      const transfer = transferRef.current;
      
      playerRef.current = new window.YT.Player(containerRef.current, {
        height: '224',
        width: '224',
        videoId: transfer?.videoId || config.videoId,
        playerVars: {
          autoplay: 0,
          loop: 1,
          controls: 1,
          disablekb: 0,
          fs: 1,
          playsinline: 1,
          ...config.playerVars,
          ...(transfer ? { start: Math.floor(transfer.seconds), index: transfer.index } : {}),
        },
        events: {
          onReady: (event: any) => {
            event.target.setVolume(volume);
            appliedUrlRef.current = playlistUrl;
            transferRef.current = null;
            if (transfer) {
              try { event.target.seekTo(transfer.seconds, true); } catch {}
              if (transfer.playing) pendingPlaybackRef.current = true;
            }
            setIsReady(true);
            if (pendingIntroRef.current || pendingPlaybackRef.current) {
              try {
                if (pendingIntroRef.current) {
                  event.target.unMute();
                  event.target.loadVideoById(DEFAULT_VIDEO);
                }
                event.target.playVideo();
              } catch { setPlaybackError('Playback was blocked. Tap Play in the visible YouTube player.'); }
            }
            try {
              const d = event.target.getVideoData?.();
              if (d) setCurrentTrack({ title: d.title, author: d.author, videoId: d.video_id });
            } catch {}
          },
          onStateChange: (event: any) => {
            // 1 playing, 2 paused, 0 ended
            if (event.data === 1) { setIsPlaying(true); pendingIntroRef.current = false; pendingPlaybackRef.current = false; setPlaybackError(null); }
            if (event.data === 2) setIsPlaying(false);
            if (event.data === 0) event.target.playVideo();
            try {
              const d = event.target.getVideoData?.();
              if (d?.title) setCurrentTrack({ title: d.title, author: d.author, videoId: d.video_id });
            } catch {}
          },
          onError: (event: any) => {
            console.warn('YouTube Player error:', event.data);
            pendingIntroRef.current = false;
            setIsPlaying(false);
            setPlaybackError('This YouTube video is unavailable for playback in POWER.');
          },
          onAutoplayBlocked: () => {
            setIsPlaying(false);
            setPlaybackError('Your browser blocked autoplay. Tap Play on the visible YouTube video.');
          },
        },
      });
    };

    void init().catch(error=>{if(!cancelled){setIsPlaying(false);setPlaybackError(error instanceof Error?error.message:'YouTube could not load.');}});

    return () => {
      cancelled=true;
      if (playerRef.current?.destroy) {
        const next = placementRef.current;
        if (next.musicEnabled && next.playerVisible && next.inlineTarget !== inlineTarget) {
          try {
            const player = playerRef.current;
            const videoId = player.getVideoData?.().video_id;
            if (videoId) transferRef.current = { videoId, seconds: player.getCurrentTime?.() || 0, playing: player.getPlayerState?.() === 1, index: player.getPlaylistIndex?.() || 0 };
          } catch {}
        }
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }
      initAttempted.current = false;
      setIsReady(false);
      setIsPlaying(false);
    };
  }, [musicEnabled, playerVisible, inlineTarget]); // Reattach safely if the intro mount unmounts

  // When playlist URL changes and player exists, load new content
  useEffect(() => {
    if (!playerRef.current || !isReady || appliedUrlRef.current === playlistUrl) return;
    appliedUrlRef.current = playlistUrl;
    const config = getPlayerConfig();
    try {
      if (pendingIntroRef.current) {
        playerRef.current.loadVideoById(DEFAULT_VIDEO);
      } else if (config.playerVars.list) {
        playerRef.current.cuePlaylist({ list: config.playerVars.list, listType: 'playlist' });
      } else {
        playerRef.current.cueVideoById(config.videoId);
      }
      if (pendingIntroRef.current || pendingPlaybackRef.current) {
        playerRef.current.playVideo();
      }
    } catch {}
  }, [playlistUrl, isReady]);

  const togglePlay = useCallback(() => {
    if (playerRef.current && isReady && playerRef.current.getPlayerState?.() === 1) {
      try { pendingPlaybackRef.current = false; playerRef.current.pauseVideo(); setIsPlaying(false); } catch {}
      return;
    }
    setPlaybackError(null);
    pendingPlaybackRef.current = true;
    if (!musicEnabled) {
      setMusicEnabledState(true);
      localStorage.setItem('music_enabled', 'true');
    }
    setPlayerVisible(true);
    if (playerRef.current && isReady) {
      try { playerRef.current.playVideo(); } catch { setPlaybackError('Tap Play in the visible player.'); }
    }
  }, [musicEnabled, isReady]);

  const toggleMute = useCallback(() => {
    if (!playerRef.current || !isReady) return;
    try {
      if (isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    } catch {}
  }, [isMuted, isReady]);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    try { playerRef.current?.setVolume(v); } catch {}
  }, []);

  const setPlaylistUrl = useCallback((url: string) => {
    setPlaylistUrlState(url);
    if (user) {
      supabase.from('profiles').update({ music_playlist_url: url }).eq('id', user.id);
    }
  }, [user]);

  const setMusicEnabled = useCallback((enabled: boolean) => {
    setMusicEnabledState(enabled);
    localStorage.setItem('music_enabled', String(enabled));
    if (!enabled) {
      transferRef.current = null;
      try { playerRef.current?.pauseVideo(); } catch {}
      setIsPlaying(false);
      setPlayerVisible(false);
      pendingPlaybackRef.current = false;
      pendingIntroRef.current = false;
    }
    if (user) {
      supabase.from('profiles').update({ music_enabled: enabled }).eq('id', user.id);
    }
  }, [user]);

  const nextTrack = useCallback(() => {
    try { playerRef.current?.nextVideo?.(); } catch {}
  }, []);
  const prevTrack = useCallback(() => {
    try { playerRef.current?.previousVideo?.(); } catch {}
  }, []);

  const playIntroAnthem = useCallback(() => {
    transferRef.current = null;
    pendingIntroRef.current = true;
    pendingPlaybackRef.current = true;
    setPlaybackError(null);
    setPlayerVisible(true);
    if (!musicEnabled) {
      setMusicEnabledState(true);
      localStorage.setItem('music_enabled', 'true');
    }
    setPlaylistUrlState(`https://www.youtube.com/watch?v=${DEFAULT_VIDEO}`);
    if (playerRef.current && isReady) {
      try {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume);
        playerRef.current.loadVideoById(DEFAULT_VIDEO);
        playerRef.current.playVideo();
      } catch { setPlaybackError('Soundtrack could not start. Try the music controls.'); }
    }
  }, [musicEnabled, isReady, volume]);

  const playUrl = useCallback((url: string) => {
    transferRef.current = null;
    pendingIntroRef.current = false;
    pendingPlaybackRef.current = true;
    setPlaybackError(null);
    setPlayerVisible(true);
    if (!musicEnabled) {
      setMusicEnabledState(true);
      localStorage.setItem('music_enabled', 'true');
    }
    setPlaylistUrlState(url);
  }, [musicEnabled]);

  const dismissPlayer = useCallback(() => {
    transferRef.current = null;
    try { playerRef.current?.pauseVideo?.(); } catch {}
    pendingIntroRef.current = false;
    pendingPlaybackRef.current = false;
    setIsPlaying(false);
    setPlaybackError(null);
    setPlayerVisible(false);
  }, []);

  const persistLibrary = (next: SavedTrack[]) => {
    setLibrary(next);
    localStorage.setItem('music_library', JSON.stringify(next));
  };

  const addToLibrary = useCallback((url: string, title?: string) => {
    if (!url.trim()) return;
    const id = crypto.randomUUID();
    const clean = url.trim();
    const label = (title?.trim()) || clean.replace(/^https?:\/\//, '').slice(0, 60);
    persistLibrary([{ id, url: clean, title: label, addedAt: Date.now() }, ...library].slice(0, 50));
  }, [library]);

  const removeFromLibrary = useCallback((id: string) => {
    persistLibrary(library.filter(t => t.id !== id));
  }, [library]);

  return (
    <MusicContext.Provider value={{
      isPlaying, isMuted, volume, playlistUrl, musicEnabled, isReady, currentTrack, library,
      togglePlay, toggleMute, setVolume, setPlaylistUrl, setMusicEnabled,
      nextTrack, prevTrack, playUrl, playIntroAnthem, playbackError, playerVisible, dismissPlayer, addToLibrary, removeFromLibrary,
    }}>
      {children}
      {/* The player is embedded in the intro. On other routes it lives in the normal page flow,
          not in a floating pop-up. The third-party iframe is always >= 200px. */}
      {musicEnabled && playerVisible && (() => {
        const player = (
          <section className="power-music-video" aria-label="POWER music video player">
            <div className="power-music-video-header">
              <span>POWER / MUSIC</span>
              <button type="button" aria-label="Close music video and stop playback" onClick={dismissPlayer}>
                Close ×
              </button>
            </div>
            <div className="power-music-video-screen">
              <div ref={containerRef} id="yt-music-player" />
            </div>
            {playbackError && <p className="power-music-video-error" role="status">{playbackError}</p>}
            <p className="power-music-video-credit">Official YouTube embed · plays when allowed · visible controls</p>
          </section>
        );
        return inlineTarget ? createPortal(player, inlineTarget) : player;
      })()}
    </MusicContext.Provider>
  );
}
