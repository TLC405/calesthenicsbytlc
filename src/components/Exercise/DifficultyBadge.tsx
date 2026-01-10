import { cn } from '@/lib/utils';

interface DifficultyBadgeProps {
  level: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const difficultyConfig: Record<number, { label: string; className: string }> = {
  1: { label: 'Beginner', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  2: { label: 'Easy', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  3: { label: 'Intermediate', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  4: { label: 'Advanced', className: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  5: { label: 'Master', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

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
        'inline-flex items-center gap-1 rounded-full border font-medium',
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