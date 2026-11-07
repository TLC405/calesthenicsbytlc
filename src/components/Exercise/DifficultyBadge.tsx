import { TRAINING_LEVELS } from '@/lib/trainingPolicy';
import { cn } from '@/lib/utils';

interface DifficultyBadgeProps {
  level: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const difficultyConfig=Object.fromEntries(TRAINING_LEVELS.map(level=>[level.id,{label:level.label,className:'bg-primary/10 text-primary border-primary/25'}]));

export function DifficultyBadge({ level, showLabel = true, size = 'sm' }: DifficultyBadgeProps) {
  const config = difficultyConfig[level] || difficultyConfig[1];
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1 rounded-full border font-medium',
        config.className,
        sizeClasses[size]
      )}
    >
      <span className="flex gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              i < level ? 'bg-current' : 'bg-current/20'
            )}
          />
        ))}
      </span>
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}

export function getDifficultyLabel(level: number): string {
  return difficultyConfig[level]?.label || 'Unknown';
}