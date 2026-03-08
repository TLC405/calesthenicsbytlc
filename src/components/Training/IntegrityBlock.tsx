import { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IntegrityBlockProps {
  title: string;
  duration: string;
  drills: string[];
  keyCues: string[];
}

export function IntegrityBlock({ title, duration, drills, keyCues }: IntegrityBlockProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-2 border-foreground/30 bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3 hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--cat-mobility))]" />
          <span className="text-xs font-display font-bold uppercase tracking-wider">{title}</span>
          <span className="text-[9px] font-mono text-muted-foreground">{duration}</span>
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2 border-t border-border">
          <div className="pt-2 space-y-1">
            {drills.map((drill, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-4 h-4 bg-[hsl(var(--cat-mobility))]/20 text-[hsl(var(--cat-mobility))] flex items-center justify-center text-[9px] font-mono font-bold flex-shrink-0">{i + 1}</span>
                <span className="text-xs text-muted-foreground">{drill}</span>
              </div>
            ))}
          </div>
          {keyCues.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {keyCues.map((cue, i) => (
                <span key={i} className="text-[8px] font-mono uppercase tracking-wider px-2 py-0.5 bg-[hsl(var(--cat-mobility))]/10 text-[hsl(var(--cat-mobility))] border border-[hsl(var(--cat-mobility))]/20">
                  {cue}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
