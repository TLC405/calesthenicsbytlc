import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

const categoryHeartColor: Record<string, string> = {
  Push: 'text-[hsl(var(--cat-push))]',
  Pull: 'text-[hsl(var(--cat-pull))]',
  Legs: 'text-[hsl(var(--cat-legs))]',
  Core: 'text-[hsl(var(--cat-core))]',
  Skills: 'text-[hsl(var(--cat-skills))]',
  Mobility: 'text-[hsl(var(--cat-mobility))]',
  Yoga: 'text-[hsl(330,65%,55%)]',
  Flexibility: 'text-[hsl(45,93%,47%)]',
  Rings: 'text-[hsl(45,80%,40%)]',
};

interface TlcPlayIconProps {
  category?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TlcPlayIcon({ category, size = 'md', className }: TlcPlayIconProps) {
  const heartColor = category ? categoryHeartColor[category] || 'text-primary' : 'text-primary';
  const sizes = {
    sm: { outer: 'w-8 h-8', heart: 'w-3.5 h-3.5', text: 'text-[5px]' },
    md: { outer: 'w-12 h-12', heart: 'w-5 h-5', text: 'text-[6px]' },
    lg: { outer: 'w-16 h-16', heart: 'w-7 h-7', text: 'text-[8px]' },
  };
  const s = sizes[size];

  return (
    <div className={cn(
      "relative flex flex-col items-center justify-center border-2 border-background/80 bg-background/90 backdrop-blur-sm",
      s.outer,
      className
    )}>
      <Heart className={cn(s.heart, heartColor)} fill="currentColor" />
      <span className={cn("font-display font-black uppercase tracking-[0.15em] text-foreground mt-0.5", s.text)}>
        TLC
      </span>
    </div>
  );
}
