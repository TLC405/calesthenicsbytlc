import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import { supabase } from '@/integrations/supabase/client';

interface MusicContextType {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  playlistUrl: string;
  musicEnabled: boolean;
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

const DEFAULT_VIDEO = 'nm6DO_7px1I';

function extractPlaylistId(url: string): string | null {
  const match = url.match(/[?&]list=([^&#]+)/);
  return match ? match[1] : null;
}

function extractVideoId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|v=|embed\/)([^&#?]{11})/);
  return match ? match[1] : null;
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState(() => localStorage.getItem('music_playing') === 'true');
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(50);
  const [playlistUrl, setPlaylistUrlState] = useState('');
  const [musicEnabled, setMusicEnabledState] = useState(() => localStorage.getItem('music_enabled') !== 'false');

  // Load user prefs
  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('music_playlist_url, music_enabled').eq('id', user.id).single()
      .then(({ data }) => {
        if (data) {
          if (data.music_playlist_url) setPlaylistUrlState(data.music_playlist_url);
          if (data.music_enabled !== null) setMusicEnabledState(data.music_enabled);
        }
      });
  }, [user]);

  const postCommand = useCallback((func: string) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args: '' }), '*'
    );
  }, []);

  const togglePlay = useCallback(() => {
    if (!musicEnabled) return;
    const next = !isPlaying;
    postCommand(next ? 'playVideo' : 'pauseVideo');
    setIsPlaying(next);
    localStorage.setItem('music_playing', String(next));
  }, [isPlaying, musicEnabled, postCommand]);

  const toggleMute = useCallback(() => {
    const next = !isMuted;
    postCommand(next ? 'mute' : 'unMute');
    setIsMuted(next);
  }, [isMuted, postCommand]);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: 'setVolume', args: [v] }), '*'
    );
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
      postCommand('pauseVideo');
      setIsPlaying(false);
      localStorage.setItem('music_playing', 'false');
    }
    if (user) {
      supabase.from('profiles').update({ music_enabled: enabled }).eq('id', user.id);
    }
  }, [user, postCommand]);

  // Build iframe src
  const playlistId = playlistUrl ? extractPlaylistId(playlistUrl) : null;
  const videoId = playlistUrl ? extractVideoId(playlistUrl) : null;
  const embedSrc = playlistId
    ? `https://www.youtube.com/embed/videoseries?list=${playlistId}&enablejsapi=1&autoplay=${isPlaying ? 1 : 0}&loop=1`
    : `https://www.youtube.com/embed/${videoId || DEFAULT_VIDEO}?enablejsapi=1&autoplay=${isPlaying ? 1 : 0}&loop=1&playlist=${videoId || DEFAULT_VIDEO}`;

  return (
    <MusicContext.Provider value={{
      isPlaying, isMuted, volume, playlistUrl, musicEnabled,
      togglePlay, toggleMute, setVolume, setPlaylistUrl, setMusicEnabled
    }}>
      {musicEnabled && (
        <iframe
          ref={iframeRef}
          src={embedSrc}
          allow="autoplay"
          className="hidden"
          title="background music"
        />
      )}
      {children}
    </MusicContext.Provider>
  );
}
