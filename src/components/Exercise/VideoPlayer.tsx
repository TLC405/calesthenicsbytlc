import * as React from 'react';
import { Play, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  youtubeUrl?: string | null;
  instagramUrl?: string | null;
  title: string;
  thumbnailMode?: boolean;
  startSec?: number;
  privacyEnhanced?: boolean;
  showExternalLink?: boolean;
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
  showExternalLink = true,
  className
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);

  // No video available state
  if (!youtubeUrl && !instagramUrl) {
    return (
      <div className={cn("relative w-full overflow-hidden rounded-xl border border-border/50 shadow-sm bg-muted/50", className)}>
        <div className="aspect-video flex items-center justify-center">
          <p className="text-muted-foreground text-sm">No video available</p>
        </div>
      </div>
    );
  }

  // YouTube handling
  if (youtubeUrl) {
    const videoId = getYouTubeVideoId(youtubeUrl);
    
    if (!videoId) {
      return (
        <div className={cn("relative w-full overflow-hidden rounded-xl border border-border/50 shadow-sm bg-muted/50", className)}>
          <div className="aspect-video flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Invalid video URL</p>
          </div>
        </div>
      );
    }

    // Parse start time from URL if not provided as prop
    const effectiveStartSec = startSec ?? getStartTime(youtubeUrl);
    
    // High quality thumbnail (try maxres first, fallback to hq)
    const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    const fallbackThumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    // Thumbnail-first, click-to-load pattern (recommended for grids/lists)
    if (thumbnailMode && !isPlaying) {
      return (
        <div className={cn("relative w-full overflow-hidden rounded-xl border border-border/50 shadow-lg bg-background", className)}>
          <div className="aspect-video">
            <button
              type="button"
              onClick={() => setIsPlaying(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsPlaying(true);
                }
              }}
              className="group relative h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
              aria-label={`Play tutorial: ${title}`}
            >
              <img 
                src={thumbnailUrl} 
                alt={title}
                loading="lazy"
                className="h-full w-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-[1.02]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = fallbackThumbnail;
                }}
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent rounded-xl transition-opacity group-hover:opacity-90" />
              
              {/* Play button */}
              <div className="absolute inset-0 grid place-items-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-focus-visible:scale-110">
                  <Play className="w-7 h-7 md:w-8 md:h-8 text-primary-foreground ml-1" fill="currentColor" />
                </div>
              </div>

              {/* Title overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-medium text-sm md:text-base line-clamp-2 drop-shadow-lg">
                  {title}
                </p>
              </div>
            </button>
          </div>

          {/* External link option */}
          {showExternalLink && (
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-white text-xs hover:bg-black/80 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-3 h-3" />
                YouTube
              </a>
            </div>
          )}
        </div>
      );
    }

    // Full iframe embed (for detail pages or after click)
    return (
      <div className={cn("relative w-full overflow-hidden rounded-xl border border-border/50 shadow-lg bg-background", className)}>
        <div className="aspect-video">
          <iframe
            className="h-full w-full rounded-xl"
            src={buildEmbedSrc(videoId, effectiveStartSec, privacyEnhanced, isPlaying)}
            title={title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
        
        {/* External link for full embed */}
        {showExternalLink && (
          <div className="absolute top-3 right-3">
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-white text-xs hover:bg-black/80 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              YouTube
            </a>
          </div>
        )}
      </div>
    );
  }

  // Instagram handling
  if (instagramUrl) {
    return (
      <div className={cn("relative w-full overflow-hidden rounded-xl border border-border/50 shadow-lg bg-muted/30", className)}>
        <div className="aspect-video flex flex-col items-center justify-center gap-4 p-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
              <Play className="w-5 h-5 text-foreground ml-0.5" />
            </div>
          </div>
          <p className="text-muted-foreground text-center text-sm">Instagram Video</p>
          <Button variant="outline" size="sm" asChild className="gap-2">
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
              Open in Instagram
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
