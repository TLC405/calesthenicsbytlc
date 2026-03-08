import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecoveryIndicatorProps {
  muscle?: string | null;
  tendon?: string | null;
  nervous?: string | null;
}

const getRecoveryColor = (time: string): string => {
  if (time.includes('12') || time.includes('6')) return 'bg-[hsl(var(--cat-legs))] text-white';
  if (time.includes('24') || time.includes('18')) return 'bg-[hsl(var(--cat-pull))] text-white';
  if (time.includes('36') || time.includes('48')) return 'bg-[hsl(var(--cat-push))] text-white';
  if (time.includes('72') || time.includes('96')) return 'bg-[hsl(var(--cat-skills))] text-white';
  return 'bg-muted text-muted-foreground';
};

export function RecoveryIndicator({ muscle, tendon, nervous }: RecoveryIndicatorProps) {
  if (!muscle && !tendon && !nervous) return null;

  const items = [
    { label: 'Muscle', value: muscle, icon: '💪' },
    { label: 'Tendon', value: tendon, icon: '🦴' },
    { label: 'CNS', value: nervous, icon: '🧠' },
  ].filter(i => i.value);

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-3.5 h-3.5 text-foreground" />
        <h4 className="text-xs font-semibold uppercase tracking-wider">Recovery Windows</h4>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map(({ label, value, icon }) => (
          <div
            key={label}
            className={cn(
              "px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider border border-foreground/20",
              getRecoveryColor(value!)
            )}
          >
            {icon} {label}: {value}
          </div>
        ))}
      </div>
    </div>
  );
}
