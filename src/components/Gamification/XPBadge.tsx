import { cn } from '@/lib/utils';
import { Zap, Star, Trophy } from 'lucide-react';

interface XPBadgeProps {
  xp: number;
  level: number;
  showLevel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function XPBadge({ xp, level, showLevel = true, size = 'md' }: XPBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className="flex items-center gap-2">
      {showLevel && (
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full font-bold',
            'bg-gradient-to-r from-amber-500 to-yellow-400 text-amber-950',
            sizeClasses[size]
          )}
        >
          <Star className={cn(iconSizes[size], 'fill-current')} />
          Lvl {level}
        </span>
      )}
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full font-medium',
          'bg-primary/20 text-primary border border-primary/30',
          sizeClasses[size]
        )}
      >
        <Zap className={cn(iconSizes[size], 'fill-current')} />
        {xp.toLocaleString()} XP
      </span>
    </div>
  );
}

interface LevelProgressProps {
  level: number;
  xp: number;
  className?: string;
}

export function LevelProgress({ level, xp, className }: LevelProgressProps) {
  // XP required for each level (increases exponentially)
  const xpForLevel = (lvl: number) => Math.floor(100 * Math.pow(1.5, lvl - 1));
  const currentLevelXP = xpForLevel(level);
  const nextLevelXP = xpForLevel(level + 1);
  const progressInLevel = xp - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  const progressPercent = Math.min(100, (progressInLevel / xpNeeded) * 100);

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between text-sm">
        <span className="flex items-center gap-1 font-medium">
          <Trophy className="w-4 h-4 text-amber-500" />
          Level {level}
        </span>
        <span className="text-muted-foreground">
          {progressInLevel} / {xpNeeded} XP
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}