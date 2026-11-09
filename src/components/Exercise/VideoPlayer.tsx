import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Play, VideoOff, ShieldCheck, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ExerciseData {
  recovery_muscle?: string | null;
  recovery_tendon?: string | null;
  recovery_nervous?: string | null;
  primary_muscles?: string[];
  secondary_muscles?: string[];
  stabilizer_muscles?: string[] | null;
  tendons_involved?: string[] | null;
  equipment?: string[];
  cues?: unknown;
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
  videoVerified?: boolean | null;
}

export function getYouTubeVideoId(url?: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    let id: string | null = null;
    if (hostname === 'youtu.be' || hostname === 'www.youtu.be') id = parsed.pathname.split('/')[1];
    else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(hostname)) {
      if (parsed.pathname === '/watch') id = parsed.searchParams.get('v');
      else if (parsed.pathname.startsWith('/embed/') || parsed.pathname.startsWith('/shorts/')) id = parsed.pathname.split('/')[2];
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

const validInstagramUrl = (url?: string | null) => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return null;
    if (!['instagram.com', 'www.instagram.com'].includes(parsed.hostname.toLowerCase())) return null;
    return parsed.toString();
  } catch {
    return null;
  }
};

const readCues = (cues: unknown): string[] => {
  if (Array.isArray(cues)) return cues.filter((item): item is string => typeof item === 'string');
  if (typeof cues !== 'string') return [];
  try {
    const parsed: unknown = JSON.parse(cues);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [cues];
  } catch {
    return cues.trim() ? [cues] : [];
  }
};

export function VideoPlayer({
  youtubeUrl, instagramUrl, title, thumbnailMode = false,
  startSec, privacyEnhanced = true, className, exerciseData, videoVerified,
}: VideoPlayerProps) {
  const [playing, setPlaying] = useState(!thumbnailMode);
  const [showDetails, setShowDetails] = useState(false);
  const videoId = getYouTubeVideoId(youtubeUrl);
  const instagram = validInstagramUrl(instagramUrl);
  const cues = useMemo(() => readCues(exerciseData?.cues), [exerciseData?.cues]);

  useEffect(() => { setPlaying(!thumbnailMode); }, [videoId, thumbnailMode]);

  const start = Math.max(0, Math.floor(startSec || 0));
  const embedUrl = videoId ? 'https://' + (privacyEnhanced ? 'www.youtube-nocookie.com' : 'www.youtube.com') +
    '/embed/' + videoId + '?playsinline=1&rel=0' + (start ? '&start=' + start : '') : null;
  const youtubeWatch = videoId ? 'https://www.youtube.com/watch?v=' + videoId : null;
  const source = youtubeWatch || instagram;

  return (
    <section className={cn('overflow-hidden rounded-2xl border border-border/70 bg-card', className)} aria-label={'Tutorial for ' + title}>
      {videoId && embedUrl ? (
        <div className="aspect-video relative bg-black">
          {playing ? (
            <iframe key={embedUrl} className="w-full h-full" src={embedUrl} title={'Video tutorial: ' + title}
              loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
          ) : (
            <button type="button" className="relative w-full h-full flex items-center justify-center group"
              onClick={() => setPlaying(true)} aria-label={'Play tutorial for ' + title}>
              <img src={'https://i.ytimg.com/vi/' + videoId + '/hqdefault.jpg'} alt="" loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-75"/>
              <span className="relative z-10 rounded-full bg-primary text-primary-foreground w-14 h-14 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Play size={23} fill="currentColor"/>
              </span>
            </button>
          )}
        </div>
      ) : (
        <div className="aspect-video bg-secondary/40 flex flex-col items-center justify-center gap-2 px-6 text-center">
          <VideoOff size={26} className="text-muted-foreground"/>
          <p className="text-sm font-semibold">No embedded demonstration available</p>
          <p className="text-xs text-muted-foreground">Use the form cues below, or choose a different variation.</p>
        </div>
      )}
      <div className="px-4 py-3 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{title}</p>
            <p className="text-xs text-muted-foreground">
              {videoVerified === true ? 'Video source reviewed' : source ? 'External video · movement match not yet reviewed' : 'Demonstration not yet available'}
            </p>
          </div>
          {source && <a href={source} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary min-h-11 shrink-0">
            Source <ExternalLink size={15}/>
          </a>}
        </div>
        {videoVerified === true && <p className="text-xs flex items-center gap-1.5 text-muted-foreground"><ShieldCheck size={14}/> Video record marked reviewed</p>}
        {exerciseData && <div>
          <Button variant="outline" className="w-full min-h-11 justify-between rounded-xl" type="button"
            onClick={() => setShowDetails(value => !value)} aria-expanded={showDetails}>
            <span className="flex items-center gap-2"><Info size={16}/> Form cues & movement details</span>
            <span className="text-xs text-muted-foreground">{showDetails ? 'Hide' : 'Show'}</span>
          </Button>
          {showDetails && <div className="pt-3 space-y-3 text-sm">
            {cues.length > 0 && <div>
              <h4 className="font-semibold mb-1.5">Technique cues</h4>
              <ol className="list-decimal pl-5 space-y-1.5 text-muted-foreground">
                {cues.map((cue, index) => <li key={index}>{cue}</li>)}
              </ol>
            </div>}
            {(exerciseData.primary_muscles?.length || 0) > 0 && <p><strong>Primary muscles:</strong> <span className="text-muted-foreground">{exerciseData.primary_muscles?.join(', ')}</span></p>}
            {(exerciseData.equipment?.length || 0) > 0 && <p><strong>Equipment:</strong> <span className="text-muted-foreground">{exerciseData.equipment?.join(', ')}</span></p>}
            {exerciseData.sets_reps && <p><strong>Typical prescription:</strong> <span className="text-muted-foreground">{exerciseData.sets_reps}</span></p>}
          </div>}
        </div>}
      </div>
    </section>
  );
}
