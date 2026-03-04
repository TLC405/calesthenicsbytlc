import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import { supabase } from '@/integrations/supabase/client';

interface MusicContextType {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  playlistUrl: string;
  musicEnabled: boolean;
  isReady: boolean;
  togglePlay: () => void;
  toggleMute: () => void;
  setVolume: (v: number) => void;
  setPlaylistUrl: (url: string) => void;
  setMusicEnabled: (enabled: boolean) => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic must be used within MusicProvider');
  return ctx;
}

const DEFAULT_VIDEO = 'nm6DO_7px1I'; // I Got The Power

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
  const initAttempted = useRef(false);

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
    if (!musicEnabled || initAttempted.current) return;
    initAttempted.current = true;

    const init = async () => {
      await loadYouTubeAPI();
      if (!containerRef.current || playerRef.current) return;

      const config = getPlayerConfig();
      
      playerRef.current = new window.YT.Player(containerRef.current, {
        height: '0',
        width: '0',
        videoId: config.videoId,
        playerVars: {
          autoplay: 0,
          loop: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          ...config.playerVars,
        },
        events: {
          onReady: (event: any) => {
            event.target.setVolume(volume);
            setIsReady(true);
          },
          onStateChange: (event: any) => {
            // YT.PlayerState.ENDED = 0
            if (event.data === 0) {
              // Loop: replay
              event.target.playVideo();
            }
          },
          onError: (event: any) => {
            console.warn('YouTube Player error:', event.data);
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
  }, [musicEnabled]); // Only re-init when enabled/disabled

  // When playlist URL changes and player exists, load new content
  useEffect(() => {
    if (!playerRef.current || !isReady) return;
    const config = getPlayerConfig();
    try {
      if (config.playerVars.list) {
        playerRef.current.loadPlaylist({ list: config.playerVars.list, listType: 'playlist' });
      } else {
        playerRef.current.loadVideoById(config.videoId);
      }
      if (!isPlaying) {
        // Pause after loading new content if not playing
        setTimeout(() => playerRef.current?.pauseVideo(), 500);
      }
    } catch {}
  }, [playlistUrl, isReady]);

  const togglePlay = useCallback(() => {
    if (!musicEnabled || !playerRef.current || !isReady) return;
    try {
      const state = playerRef.current.getPlayerState();
      if (state === 1) { // playing
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    } catch {}
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
    }
    if (user) {
      supabase.from('profiles').update({ music_enabled: enabled }).eq('id', user.id);
    }
  }, [user]);

  return (
    <MusicContext.Provider value={{
      isPlaying, isMuted, volume, playlistUrl, musicEnabled, isReady,
      togglePlay, toggleMute, setVolume, setPlaylistUrl, setMusicEnabled
    }}>
      {/* YouTube player container — must be in DOM but invisible */}
      {musicEnabled && (
        <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div ref={containerRef} id="yt-music-player" />
        </div>
      )}
      {children}
    </MusicContext.Provider>
  );
}
