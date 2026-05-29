import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  hint?: string;
  action?: { label: string; onClick: () => void };
  accent?: string;
}

export function EmptyState({ icon: Icon, title, hint, action, accent = 'hsl(var(--electric))' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div
        className="w-14 h-14 rounded-2xl border border-border/40 flex items-center justify-center mb-4"
        style={{ backgroundColor: `${accent}12` }}
      >
        <Icon className="w-6 h-6" style={{ color: accent }} />
      </div>
      <h3 className="font-display text-sm font-bold tracking-tight">{title}</h3>
      {hint && <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">{hint}</p>}
      {action && (
        <Button
          onClick={action.onClick}
          size="sm"
          className="mt-5 h-9 text-[10px] font-mono uppercase tracking-wider rounded-xl"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
