import * as React from 'react';
import { Play, Pause, Maximize2, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  youtubeUrl?: string | null;
  instagramUrl?: string | null;
  title: string;
  thumbnailMode?: boolean;
  startSec?: number;
  privacyEnhanced?: boolean;
  className?: string;
}

const getYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const getStartTime = (url: string): number | undefined => {
  const match = url.match(/[?&]t=(\d+)/);
  return match ? parseInt(match[1], 10) : undefined;
};

function buildEmbedSrc(youtubeId: string, startSec?: number, privacyEnhanced = true, autoplay = false) {
  const host = privacyEnhanced 
    ? "https://www.youtube-nocookie.com" 
    : "https://www.youtube.com";
  
  const params = new URLSearchParams({
    modestbranding: "1",
    playsinline: "1",
    rel: "0",
    showinfo: "0",
    controls: "0",
    iv_load_policy: "3",
    disablekb: "0",
    fs: "0",
    cc_load_policy: "0",
  });
  
  if (autoplay) params.set("autoplay", "1");
  if (startSec && startSec > 0) params.set("start", String(startSec));
  
  return `${host}/embed/${youtubeId}?${params.toString()}`;
}

export function VideoPlayer({ 
  youtubeUrl, 
  instagramUrl, 
  title, 
  thumbnailMode = false,
  startSec,
  privacyEnhanced = true,
  className
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);

  if (!youtubeUrl && !instagramUrl) {
    return (
      <div className={cn("relative w-full overflow-hidden border-2 border-foreground/20 bg-secondary", className)}>
        <div className="aspect-video flex items-center justify-center">
          <p className="text-muted-foreground text-xs font-mono uppercase tracking-wider">No video available</p>
        </div>
      </div>
    );
  }

  if (youtubeUrl) {
    const videoId = getYouTubeVideoId(youtubeUrl);
    
    if (!videoId) {
      return (
        <div className={cn("relative w-full overflow-hidden border-2 border-foreground/20 bg-secondary", className)}>
          <div className="aspect-video flex items-center justify-center">
            <p className="text-muted-foreground text-xs font-mono uppercase tracking-wider">Invalid video URL</p>
          </div>
        </div>
      );
    }

    const effectiveStartSec = startSec ?? getStartTime(youtubeUrl);
    const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    const fallbackThumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    if (thumbnailMode && !isPlaying) {
      return (
        <div className={cn("relative w-full overflow-hidden bg-background group", className)}>
          {/* tlcTV header bar */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-foreground border-b border-foreground">
            <div className="flex items-center gap-2">
              <div className="w-1 h-3 bg-primary" />
              <span className="text-[10px] font-display font-black text-background tracking-[0.2em] uppercase">
                tlcTV
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[8px] font-mono text-background/60 uppercase tracking-wider">Ready</span>
            </div>
          </div>
          
          <div className="aspect-video relative">
            <button
              type="button"
              onClick={() => setIsPlaying(true)}
              className="group/btn relative h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={`Play tutorial: ${title}`}
            >
              <img 
                src={thumbnailUrl} 
                alt={title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = fallbackThumbnail;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 transition-opacity" />
              
              {/* Custom play button */}
              <div className="absolute inset-0 grid place-items-center">
                <div className="w-16 h-16 border-2 border-background/80 bg-foreground/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group-hover/btn:scale-110 group-hover/btn:bg-primary">
                  <Play className="w-6 h-6 text-background ml-0.5" fill="currentColor" />
                </div>
              </div>

              {/* Channel number badge */}
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 bg-primary text-primary-foreground text-[10px] font-display font-black tracking-wider uppercase">
                  CH.01
                </span>
              </div>

              {/* Title bar */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                <p className="text-background font-display font-bold text-sm uppercase tracking-wider line-clamp-1 drop-shadow-lg">
                  {title}
                </p>
                <p className="text-background/50 text-[8px] font-mono uppercase tracking-[0.2em] mt-0.5">
                  Tap to play • tlcTV
                </p>
              </div>
            </button>
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-between px-3 py-1 bg-foreground">
            <div className="flex items-center gap-3">
              <Volume2 className="w-3 h-3 text-background/50" />
              <div className="w-16 h-0.5 bg-background/20 rounded-full">
                <div className="w-3/4 h-full bg-primary rounded-full" />
              </div>
            </div>
            <Maximize2 className="w-3 h-3 text-background/50" />
          </div>
        </div>
      );
    }

    // Full iframe embed with custom overlay
    return (
      <div className={cn("relative w-full overflow-hidden bg-background", className)}>
        {/* tlcTV header bar */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-foreground">
          <div className="flex items-center gap-2">
            <div className="w-1 h-3 bg-primary" />
            <span className="text-[10px] font-display font-black text-background tracking-[0.2em] uppercase">
              tlcTV
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[8px] font-mono text-background/60 uppercase tracking-wider">Live</span>
            <span className="text-[8px] font-mono text-background/40 mx-1">|</span>
            <span className="text-[8px] font-mono text-background/60 uppercase tracking-wider truncate max-w-[120px]">
              {title}
            </span>
          </div>
        </div>
        <div className="aspect-video relative">
          <iframe
            className="h-full w-full"
            src={buildEmbedSrc(videoId, effectiveStartSec, privacyEnhanced, isPlaying)}
            title={title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
          {/* Channel watermark */}
          <div className="absolute top-2 right-2 pointer-events-none opacity-40">
            <span className="text-[9px] font-display font-black text-white tracking-[0.15em] uppercase drop-shadow-lg">
              tlcTV
            </span>
          </div>
        </div>
        {/* Bottom controls bar */}
        <div className="flex items-center justify-between px-3 py-1 bg-foreground">
          <div className="flex items-center gap-3">
            <Volume2 className="w-3 h-3 text-background/50" />
            <div className="w-16 h-0.5 bg-background/20 rounded-full">
              <div className="w-3/4 h-full bg-primary rounded-full" />
            </div>
          </div>
          <span className="text-[8px] font-mono text-background/40 uppercase tracking-wider">CH.01</span>
        </div>
      </div>
    );
  }

  // Instagram handling
  if (instagramUrl) {
    return (
      <div className={cn("relative w-full overflow-hidden bg-background", className)}>
        <div className="flex items-center px-3 py-1.5 bg-foreground">
          <div className="flex items-center gap-2">
            <div className="w-1 h-3 bg-primary" />
            <span className="text-[10px] font-display font-black text-background tracking-[0.2em] uppercase">
              tlcTV
            </span>
          </div>
        </div>
        <div className="aspect-video flex flex-col items-center justify-center gap-4 p-6 border-x-2 border-foreground/10">
          <div className="w-14 h-14 border-2 border-foreground bg-foreground flex items-center justify-center">
            <Play className="w-6 h-6 text-background ml-0.5" fill="currentColor" />
          </div>
          <p className="text-muted-foreground text-xs font-mono uppercase tracking-wider">External Tutorial</p>
          <a 
            href={instagramUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 border-2 border-foreground text-xs font-mono font-bold uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors"
          >
            Watch Tutorial →
          </a>
        </div>
      </div>
    );
  }

  return null;
}
