import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import { supabase } from '@/integrations/supabase/client';

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

function extractPlaylistId(url: string): string | null {
  const match = url.match(/[?&]list=([^&#]+)/);
  return match ? match[1] : null;
}

function extractVideoId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|v=|embed\/)([^&#?]{11})/);
  return match ? match[1] : null;
}

// Declare YT types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

let apiLoaded = false;
let apiReady = false;
const apiReadyCallbacks: (() => void)[] = [];

function loadYouTubeAPI(): Promise<void> {
  return new Promise((resolve) => {
    if (apiReady) { resolve(); return; }
    apiReadyCallbacks.push(resolve);
    if (apiLoaded) return; // script already loading
    apiLoaded = true;
    
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      apiReady = true;
      prev?.();
      apiReadyCallbacks.forEach(cb => cb());
      apiReadyCallbacks.length = 0;
    };
    
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  });
}

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
  const [playerVisible, setPlayerVisible] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

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

    const init = async () => {
      await loadYouTubeAPI();
      if (!containerRef.current || playerRef.current) return;

      const config = getPlayerConfig();
      
      playerRef.current = new window.YT.Player(containerRef.current, {
        height: '224',
        width: '224',
        videoId: config.videoId,
        playerVars: {
          autoplay: 0,
          loop: 1,
          controls: 1,
          disablekb: 0,
          fs: 1,
          playsinline: 1,
          ...config.playerVars,
        },
        events: {
          onReady: (event: any) => {
            event.target.setVolume(volume);
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

    init();

    return () => {
      if (playerRef.current?.destroy) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }
      initAttempted.current = false;
      setIsReady(false);
    };
  }, [musicEnabled, playerVisible]); // Never create a hidden YouTube player

  // When playlist URL changes and player exists, load new content
  useEffect(() => {
    if (!playerRef.current || !isReady) return;
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
      try { playerRef.current.pauseVideo(); setIsPlaying(false); } catch {}
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
      {/* Visible YouTube player: required viewport >= 200x200; closing also pauses it. */}
      {musicEnabled && playerVisible && (
        <section className="power-music-video" aria-label="POWER music video player">
          <div className="power-music-video-header">
            <span>POWER / NOW PLAYING</span>
            <button type="button" aria-label="Close music video and stop playback" onClick={dismissPlayer}>
              Close ×
            </button>
          </div>
          <div className="power-music-video-screen">
            <div ref={containerRef} id="yt-music-player" />
          </div>
          {playbackError && <p className="power-music-video-error" role="status">{playbackError}</p>}
          <p className="power-music-video-credit">YouTube player · playback depends on creator permissions</p>
        </section>
      )}
      {children}
    </MusicContext.Provider>
  );
}
