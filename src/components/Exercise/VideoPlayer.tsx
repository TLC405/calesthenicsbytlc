import { useState } from 'react';
import { Play, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  youtubeUrl?: string | null;
  instagramUrl?: string | null;
  title: string;
  thumbnailMode?: boolean;
}

const getYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export function VideoPlayer({ youtubeUrl, instagramUrl, title, thumbnailMode = false }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!youtubeUrl && !instagramUrl) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">No video available</p>
      </div>
    );
  }

  if (youtubeUrl) {
    const videoId = getYouTubeVideoId(youtubeUrl);
    
    if (!videoId) {
      return (
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
          <p className="text-muted-foreground">Invalid video URL</p>
        </div>
      );
    }

    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    if (thumbnailMode && !isPlaying) {
      return (
        <div 
          className="aspect-video bg-muted rounded-lg relative cursor-pointer group overflow-hidden"
          onClick={() => setIsPlaying(true)}
        >
          <img 
            src={thumbnailUrl} 
            alt={title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            onError={(e) => {
              // Fallback to hqdefault if maxresdefault doesn't exist
              (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            }}
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Play className="w-8 h-8 text-primary-foreground ml-1" fill="currentColor" />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="aspect-video rounded-lg overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  if (instagramUrl) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center gap-3 p-4">
        <p className="text-muted-foreground text-center">Instagram Video</p>
        <Button variant="outline" size="sm" asChild>
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in Instagram
          </a>
        </Button>
      </div>
    );
  }

  return null;
}
