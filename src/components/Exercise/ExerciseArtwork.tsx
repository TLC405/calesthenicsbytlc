import thumbnailCache from '@/data/thumbnailCache.json';
import { useEffect, useState } from 'react';
import { Dumbbell, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

import { getYouTubeId } from '@/lib/youtube';
import { tutorialState } from '@/lib/mediaAudit';
export { getYouTubeId } from '@/lib/youtube';

interface ArtworkProps {
  title: string;
  category?: string;
  youtubeUrl?: string | null;
  imageUrl?: string | null;
  className?: string;
  showPlayHint?: boolean;
  compact?: boolean;
}

/** YouTube preview -> user image -> branded nondeceptive placeholder. No invented exercise photograph. */
export function ExerciseArtwork({ title, category = 'Training', youtubeUrl, imageUrl, className, showPlayHint = false, compact = false }: ArtworkProps) {
  const media = tutorialState(youtubeUrl,title);
  const id = media.blocked ? null : media.id;
  const [sourceIndex,setSourceIndex]=useState(0);
  const signature=`${id||''}:${imageUrl||''}`;
  useEffect(()=>setSourceIndex(0),[signature]);
  const candidates=[id&&id in thumbnailCache?`/movement-previews/${id}.jpg`:null,id?`https://i.ytimg.com/vi/${id}/hqdefault.jpg`:null,imageUrl].filter(Boolean);
  const src=candidates[sourceIndex];
  const fallback=!src;
  return (
    <div className={cn('power-artwork relative h-full w-full overflow-hidden bg-secondary', compact && 'is-compact', className)}>
      {fallback ? (
        <div className="power-artwork-fallback absolute inset-0 flex flex-col justify-between p-3 sm:p-4" role="img" aria-label={`${title}: preview image not available`}>
          <span className={cn('flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[.12em] text-primary', compact && 'hidden')}>
            <Dumbbell className="h-4 w-4" /> POWER / {category==='Push'||category==='Pull'?'Strength foundations':category}
          </span>
          <div className={cn('flex items-end justify-between gap-2', compact && 'h-full items-center justify-center')}>
            {!compact && <span className="line-clamp-2 min-w-0 text-lg font-display font-black leading-tight sm:text-xl text-foreground">{title}</span>}
            <span className={cn('power-artwork-emblem shrink-0 grid h-9 w-9 place-items-center rounded-xl', compact && 'h-8 w-8')} aria-hidden="true">
              <Dumbbell className="h-5 w-5" />
            </span>
          </div>
        </div>
      ) : (
        <img src={src||undefined} alt={`${title} tutorial preview`} loading="lazy" decoding="async"
          className="h-full w-full object-cover"
          onError={() => setSourceIndex(index=>index+1)}
          onLoad={event => {
            const img = event.currentTarget;
            // YouTube sometimes serves an empty 120x90 placeholder with HTTP 200.
            if (id && (img.naturalWidth <= 120 || img.naturalHeight <= 90)) setSourceIndex(index=>index+1);
          }}
        />
      )}
      {showPlayHint && id && <span className="pointer-events-none absolute right-2 bottom-2 flex items-center gap-1 rounded-lg bg-black/70 px-2 py-1 text-[10px] font-semibold text-white">
        <Play className="h-3 w-3" fill="currentColor" /> Video
      </span>}
    </div>
  );
}
