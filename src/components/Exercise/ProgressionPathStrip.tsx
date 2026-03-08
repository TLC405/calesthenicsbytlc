import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface ChainExercise {
  id: string;
  name: string;
  slug: string;
  chain_order: number;
  difficulty_level: number | null;
  category: string;
}

interface ProgressionPathStripProps {
  exerciseId: string;
  chainGroup: string | null;
  onNavigate: (exerciseId: string) => void;
}

const difficultyColor: Record<number, string> = {
  1: 'bg-[hsl(var(--cat-legs))]',
  2: 'bg-[hsl(var(--cat-pull))]',
  3: 'bg-[hsl(var(--cat-core))]',
  4: 'bg-[hsl(var(--cat-push))]',
  5: 'bg-[hsl(var(--cat-skills))]',
};

const difficultyLabel: Record<number, string> = {
  1: 'BEG',
  2: 'EASY',
  3: 'INT',
  4: 'ADV',
  5: 'ELITE',
};

export function ProgressionPathStrip({ exerciseId, chainGroup, onNavigate }: ProgressionPathStripProps) {
  const [chain, setChain] = useState<ChainExercise[]>([]);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!chainGroup) return;
    supabase
      .from('exercises')
      .select('id, name, slug, chain_order, difficulty_level, category')
      .eq('chain_group', chainGroup)
      .order('chain_order')
      .then(({ data }) => {
        if (data) setChain(data as ChainExercise[]);
      });
  }, [chainGroup]);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [chain, exerciseId]);

  if (!chainGroup || chain.length < 2) return null;

  return (
    <div className="border-2 border-foreground bg-card p-3">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-4 bg-foreground" />
        <h4 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Progression Path
        </h4>
        <span className="text-[9px] font-mono text-muted-foreground/60 ml-auto">
          {chain.length} steps
        </span>
      </div>

      <ScrollArea className="w-full">
        <div className="flex items-center gap-1 pb-2 min-w-max">
          {chain.map((ex, i) => {
            const isActive = ex.id === exerciseId;
            const level = ex.difficulty_level || 1;
            const color = difficultyColor[level] || 'bg-muted';

            return (
              <div key={ex.id} className="flex items-center">
                <button
                  ref={isActive ? activeRef : undefined}
                  onClick={() => onNavigate(ex.id)}
                  className={cn(
                    "relative flex flex-col items-center px-3 py-2 border-2 transition-all duration-150 min-w-[80px]",
                    isActive
                      ? "border-foreground bg-foreground text-background scale-105 shadow-sm"
                      : "border-foreground/20 bg-card hover:border-foreground/50 hover:bg-secondary/50"
                  )}
                >
                  {/* Difficulty dot */}
                  <div className={cn("w-2 h-2 rounded-full mb-1.5", isActive ? 'bg-background' : color)} />
                  
                  <span className={cn(
                    "text-[9px] font-display font-bold uppercase tracking-wider leading-tight text-center line-clamp-2",
                    isActive ? "text-background" : "text-foreground"
                  )}>
                    {ex.name}
                  </span>
                  
                  <span className={cn(
                    "text-[7px] font-mono uppercase tracking-wider mt-1",
                    isActive ? "text-background/70" : "text-muted-foreground"
                  )}>
                    {difficultyLabel[level]}
                  </span>

                  {/* Active indicator bar */}
                  {isActive && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[hsl(var(--cat-skills))]" />}
                </button>
                
                {i < chain.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-muted-foreground/40 flex-shrink-0 mx-0.5" />
                )}
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
