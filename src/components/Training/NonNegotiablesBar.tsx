import { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface NonNegotiable {
  id: string;
  slug: string;
  title: string;
  short_cue: string;
  fix: string;
  applies_to: string[];
}

interface NonNegotiablesBarProps {
  categories?: string[];
}

const cueColors: Record<string, string> = {
  'ribs-down': 'border-[hsl(var(--cat-push))]',
  'glutes-30': 'border-[hsl(var(--cat-core))]',
  'shoulders-tall': 'border-[hsl(var(--cat-pull))]',
  'active-legs': 'border-[hsl(var(--cat-legs))]',
};

export function NonNegotiablesBar({ categories }: NonNegotiablesBarProps) {
  const [cues, setCues] = useState<NonNegotiable[]>([]);

  useEffect(() => {
    supabase
      .from('non_negotiables')
      .select('*')
      .then(({ data }) => {
        if (!data) return;
        if (categories?.length) {
          setCues(data.filter((c: any) =>
            (c.applies_to as string[]).some(cat => categories.includes(cat))
          ) as NonNegotiable[]);
        } else {
          setCues(data as NonNegotiable[]);
        }
      });
  }, [categories]);

  if (cues.length === 0) return null;

  return (
    <div className="border-2 border-foreground bg-card p-3">
      <div className="flex items-center gap-2 mb-2.5">
        <Shield className="w-3.5 h-3.5 text-foreground" />
        <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em]">Non-Negotiables</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {cues.map(cue => (
          <div
            key={cue.id}
            className={cn(
              "px-2.5 py-1.5 border-l-[3px] bg-secondary/50 group cursor-default relative",
              cueColors[cue.slug] || 'border-foreground'
            )}
            title={cue.fix}
          >
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider">{cue.title}</span>
            <span className="text-[8px] font-mono text-muted-foreground ml-1.5">{cue.short_cue}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
