import * as React from 'react';
import { Play, Minimize2, Maximize2, Volume2, ChevronDown, ChevronUp, Target, Dumbbell, Shield, Info, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ExerciseData {
  recovery_muscle?: string | null;
  recovery_tendon?: string | null;
  recovery_nervous?: string | null;
  primary_muscles?: string[];
  secondary_muscles?: string[];
  stabilizer_muscles?: string[] | null;
  tendons_involved?: string[] | null;
  equipment?: string[];
  cues?: any;
  sets_reps?: string | null;
  difficulty_level?: number | null;
  category?: string;
}

interface VideoPlayerProps {
  youtubeUrl?: string | null;
  instagramUrl?: string | null;
  title: string;
  thumbnailMode?: boolean;
  startSec?: number;
  privacyEnhanced?: boolean;
  className?: string;
  exerciseData?: ExerciseData;
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
    controls: "1",
    iv_load_policy: "3",
    disablekb: "0",
    fs: "1",
    cc_load_policy: "0",
  });

  if (autoplay) params.set("autoplay", "1");
  if (startSec && startSec > 0) params.set("start", String(startSec));

  return `${host}/embed/${youtubeId}?${params.toString()}`;
}

const diffLabel = ['', 'Beginner', 'Easy', 'Intermediate', 'Advanced', 'Elite'];

function DataSidebar({ data }: { data: ExerciseData }) {
  const cues = Array.isArray(data.cues) ? data.cues
    : typeof data.cues === 'string' ? JSON.parse(data.cues || '[]') : [];
  const hasRecovery = data.recovery_muscle || data.recovery_tendon || data.recovery_nervous;
  const hasMuscles = (data.primary_muscles?.length || 0) > 0;
  const hasCues = cues.length > 0;

  return (
    <div className="space-y-3 text-xs">
      {/* Quick stats row */}
      <div className="flex flex-wrap gap-1.5">
        {data.sets_reps && (
          <span className="px-2 py-1 bg-primary/10 border border-primary/20 text-primary font-mono font-bold text-[9px] uppercase tracking-wider">
            {data.sets_reps}
          </span>
        )}
        {data.difficulty_level && (
          <span className="px-2 py-1 bg-secondary border border-border text-foreground font-mono font-bold text-[9px] uppercase tracking-wider">
            {diffLabel[data.difficulty_level]}
          </span>
        )}
        {data.category && (
          <span className="px-2 py-1 bg-secondary border border-border text-muted-foreground font-mono text-[9px] uppercase tracking-wider">
            {data.category}
          </span>
        )}
      </div>

      {/* Recovery windows */}
      {hasRecovery && (
        <div className="border border-border p-2.5 space-y-1.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-[8px] font-mono font-bold uppercase tracking-[0.15em] text-muted-foreground">Recovery</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {data.recovery_muscle && (
              <div className="text-center p-1.5 bg-secondary/50">
                <span className="text-[10px]">💪</span>
                <p className="text-[8px] font-mono font-bold text-foreground mt-0.5">{data.recovery_muscle}</p>
              </div>
            )}
            {data.recovery_tendon && (
              <div className="text-center p-1.5 bg-secondary/50">
                <span className="text-[10px]">🦴</span>
                <p className="text-[8px] font-mono font-bold text-foreground mt-0.5">{data.recovery_tendon}</p>
              </div>
            )}
            {data.recovery_nervous && (
              <div className="text-center p-1.5 bg-secondary/50">
                <span className="text-[10px]">🧠</span>
                <p className="text-[8px] font-mono font-bold text-foreground mt-0.5">{data.recovery_nervous}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Muscles */}
      {hasMuscles && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Target className="w-3 h-3 text-muted-foreground" />
            <span className="text-[8px] font-mono font-bold uppercase tracking-[0.15em] text-muted-foreground">Muscles</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {data.primary_muscles?.map(m => (
              <span key={m} className="px-1.5 py-0.5 bg-foreground text-background text-[8px] font-mono font-bold uppercase tracking-wider">{m}</span>
            ))}
            {data.secondary_muscles?.map(m => (
              <span key={m} className="px-1.5 py-0.5 border border-border text-muted-foreground text-[8px] font-mono uppercase tracking-wider">{m}</span>
            ))}
          </div>
        </div>
      )}

      {/* Tendons & Stabilizers */}
      {((data.tendons_involved?.length || 0) > 0 || (data.stabilizer_muscles?.length || 0) > 0) && (
        <div className="space-y-1.5">
          <span className="text-[8px] font-mono font-bold uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-1.5">
            <Shield className="w-3 h-3" />Tendons & Stabilizers
          </span>
          <div className="flex flex-wrap gap-1">
            {data.tendons_involved?.map(t => (
              <span key={t} className="px-1.5 py-0.5 border border-destructive/30 text-destructive text-[8px] font-mono uppercase tracking-wider">{t}</span>
            ))}
            {data.stabilizer_muscles?.map(s => (
              <span key={s} className="px-1.5 py-0.5 border border-primary/30 text-primary text-[8px] font-mono uppercase tracking-wider">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Equipment */}
      {(data.equipment?.length || 0) > 0 && data.equipment![0] !== 'None' && (
        <div className="flex items-center gap-1.5">
          <Dumbbell className="w-3 h-3 text-muted-foreground" />
          <div className="flex flex-wrap gap-1">
            {data.equipment!.map(e => (
              <span key={e} className="px-1.5 py-0.5 border border-border text-foreground text-[8px] font-mono uppercase tracking-wider">{e}</span>
            ))}
          </div>
        </div>
      )}

      {/* Cues */}
      {hasCues && (
        <div className="border border-border p-2.5 space-y-1.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Info className="w-3 h-3 text-muted-foreground" />
            <span className="text-[8px] font-mono font-bold uppercase tracking-[0.15em] text-muted-foreground">Form Cues</span>
          </div>
          <ol className="space-y-1">
            {cues.map((cue: string, i: number) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="w-4 h-4 bg-foreground text-background flex items-center justify-center flex-shrink-0 text-[8px] font-mono font-bold">{i + 1}</span>
                <span className="text-[9px] text-muted-foreground leading-tight">{cue}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export function VideoPlayer({
  youtubeUrl,
  instagramUrl,
  title,
  thumbnailMode = false,
  startSec,
  privacyEnhanced = true,
  className,
  exerciseData,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [showData, setShowData] = React.useState(true);

  if (!youtubeUrl && !instagramUrl) {
    return (
      <div className={cn("relative w-full overflow-hidden border-2 border-border bg-secondary", className)}>
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
        <div className={cn("relative w-full overflow-hidden border-2 border-border bg-secondary", className)}>
          <div className="aspect-video flex items-center justify-center">
            <p className="text-muted-foreground text-xs font-mono uppercase tracking-wider">Invalid video URL</p>
          </div>
        </div>
      );
    }

    const effectiveStartSec = startSec ?? getStartTime(youtubeUrl);
    const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    const fallbackThumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    // Minimized bar
    if (isMinimized && isPlaying) {
      return (
        <div className={cn("border-2 border-foreground bg-foreground flex items-center gap-3 p-2", className)}>
          <div className="w-20 h-12 flex-shrink-0 overflow-hidden">
            <iframe
              className="w-[160px] h-[90px] scale-50 origin-top-left pointer-events-none"
              src={buildEmbedSrc(videoId, effectiveStartSec, privacyEnhanced, true)}
              title={title}
              allow="autoplay"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-display font-bold text-background uppercase tracking-wider truncate">{title}</p>
            <p className="text-[8px] font-mono text-background/50 uppercase tracking-wider">tlcTV • Playing</p>
          </div>
          <button onClick={() => setIsMinimized(false)} className="p-1.5 hover:bg-background/10 transition-colors">
            <Maximize2 className="w-4 h-4 text-background/70" />
          </button>
        </div>
      );
    }

    // Thumbnail mode
    if (thumbnailMode && !isPlaying) {
      return (
        <div className={cn("relative w-full overflow-hidden bg-background group", className)}>
          <HeaderBar title="" isLive={false} onMinimize={null} />
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
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                onError={(e) => { (e.target as HTMLImageElement).src = fallbackThumbnail; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
              <div className="absolute inset-0 grid place-items-center">
                <div className="w-16 h-16 border-2 border-background/80 bg-foreground/80 backdrop-blur-sm flex items-center justify-center transition-all duration-200 group-hover/btn:scale-110 group-hover/btn:bg-primary">
                  <Play className="w-6 h-6 text-background ml-0.5" fill="currentColor" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                <p className="text-background font-display font-bold text-sm uppercase tracking-wider line-clamp-1">{title}</p>
                <p className="text-background/50 text-[8px] font-mono uppercase tracking-[0.2em] mt-0.5">Tap to play • tlcTV</p>
              </div>
            </button>
          </div>
          <BottomBar />
          {exerciseData && showData && (
            <div className="p-3 border-t border-border bg-background">
              <DataSidebar data={exerciseData} />
            </div>
          )}
        </div>
      );
    }

    // Full player with embedded data
    return (
      <div className={cn("relative w-full overflow-hidden bg-background", className)}>
        <HeaderBar title={title} isLive={isPlaying} onMinimize={() => setIsMinimized(true)} />
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
        </div>
        <BottomBar onToggleData={exerciseData ? () => setShowData(!showData) : undefined} showingData={showData} />
        {exerciseData && showData && (
          <div className="p-3 border-t border-border bg-background">
            <DataSidebar data={exerciseData} />
          </div>
        )}
      </div>
    );
  }

  // Instagram
  if (instagramUrl) {
    return (
      <div className={cn("relative w-full overflow-hidden bg-background", className)}>
        <HeaderBar title="" isLive={false} onMinimize={null} />
        <div className="aspect-video flex flex-col items-center justify-center gap-4 p-6 border-x-2 border-border">
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

function HeaderBar({ title, isLive, onMinimize }: { title: string; isLive: boolean; onMinimize: (() => void) | null }) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-foreground border-b border-foreground">
      <div className="flex items-center gap-2">
        <div className="w-1 h-3 bg-primary" />
        <span className="text-[10px] font-display font-black text-background tracking-[0.2em] uppercase">tlcTV</span>
      </div>
      <div className="flex items-center gap-2">
        {isLive && (
          <>
            <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
            <span className="text-[8px] font-mono text-background/60 uppercase tracking-wider">Live</span>
          </>
        )}
        {!isLive && (
          <>
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[8px] font-mono text-background/60 uppercase tracking-wider">Ready</span>
          </>
        )}
        {title && (
          <>
            <span className="text-[8px] font-mono text-background/40 mx-1">|</span>
            <span className="text-[8px] font-mono text-background/60 uppercase tracking-wider truncate max-w-[120px]">{title}</span>
          </>
        )}
        {onMinimize && (
          <button onClick={onMinimize} className="ml-1 p-0.5 hover:bg-background/10 transition-colors">
            <Minimize2 className="w-3 h-3 text-background/50" />
          </button>
        )}
      </div>
    </div>
  );
}

function BottomBar({ onToggleData, showingData }: { onToggleData?: () => void; showingData?: boolean }) {
  return (
    <div className="flex items-center justify-between px-3 py-1 bg-foreground">
      <div className="flex items-center gap-3">
        <Volume2 className="w-3 h-3 text-background/50" />
        <div className="w-16 h-0.5 bg-background/20 rounded-full">
          <div className="w-3/4 h-full bg-primary rounded-full" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onToggleData && (
          <button onClick={onToggleData} className="flex items-center gap-1 hover:bg-background/10 px-1.5 py-0.5 transition-colors">
            {showingData ? <ChevronUp className="w-3 h-3 text-background/50" /> : <ChevronDown className="w-3 h-3 text-background/50" />}
            <span className="text-[7px] font-mono text-background/40 uppercase tracking-wider">Data</span>
          </button>
        )}
        <span className="text-[8px] font-mono text-background/40 uppercase tracking-wider">CH.01</span>
      </div>
    </div>
  );
}
