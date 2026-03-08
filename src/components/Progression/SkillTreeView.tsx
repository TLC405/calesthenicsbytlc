import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChevronRight, Star, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChainExercise {
  id: string;
  name: string;
  slug: string;
  chain_group: string;
  chain_order: number;
  difficulty_level: number | null;
  category: string;
  sets_reps: string | null;
}

interface SkillPath {
  group: string;
  exercises: ChainExercise[];
}

const pathColors: Record<string, string> = {
  push: 'hsl(var(--cat-push))',
  pull: 'hsl(var(--cat-pull))',
  skills: 'hsl(var(--cat-skills))',
  core: 'hsl(var(--cat-core))',
  legs: 'hsl(var(--cat-legs))',
  mobility: 'hsl(var(--cat-mobility))',
  rings: 'hsl(40, 70%, 40%)',
  flexibility: 'hsl(40, 96%, 50%)',
  yoga: 'hsl(330, 65%, 55%)',
};

const difficultyLabels: Record<number, string> = {
  1: 'BEG', 2: 'INT', 3: 'ADV', 4: 'EXP', 5: 'ELT',
};

interface SkillTreeViewProps {
  onExerciseClick?: (exerciseId: string) => void;
}

export function SkillTreeView({ onExerciseClick }: SkillTreeViewProps) {
  const [paths, setPaths] = useState<SkillPath[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaths();
  }, []);

  const loadPaths = async () => {
    const { data } = await supabase
      .from('exercises')
      .select('id, name, slug, chain_group, chain_order, difficulty_level, category, sets_reps')
      .not('chain_group', 'is', null)
      .order('chain_order');

    if (data) {
      const groups: Record<string, ChainExercise[]> = {};
      (data as ChainExercise[]).forEach(ex => {
        if (!groups[ex.chain_group]) groups[ex.chain_group] = [];
        groups[ex.chain_group].push(ex);
      });

      const sorted = Object.entries(groups)
        .filter(([, exs]) => exs.length >= 3)
        .sort((a, b) => b[1].length - a[1].length)
        .map(([group, exercises]) => ({ group, exercises }));

      setPaths(sorted);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 border border-foreground/10 animate-pulse bg-secondary/30" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {paths.map(path => {
        const color = pathColors[path.exercises[0]?.category] || 'hsl(var(--muted-foreground))';
        const pathName = path.group.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

        return (
          <div key={path.group} className="border-2 border-foreground/20 bg-card overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-foreground/10">
              <div className="w-2.5 h-2.5" style={{ backgroundColor: color }} />
              <span className="text-[9px] font-mono font-bold uppercase tracking-[0.15em]">{pathName}</span>
              <span className="text-[8px] font-mono text-muted-foreground ml-auto">{path.exercises.length} steps</span>
              <Star className="w-3 h-3 text-muted-foreground/30" />
            </div>
            <ScrollArea className="w-full">
              <div className="flex items-center gap-0.5 p-3 overflow-x-auto">
                {path.exercises.map((ex, i) => (
                  <div key={ex.id} className="flex items-center">
                    <button
                      onClick={() => onExerciseClick?.(ex.id)}
                      className={cn(
                        "min-w-max px-3 py-2 border transition-all duration-150 hover:bg-foreground/5 cursor-pointer text-left",
                        "border-foreground/20 hover:border-foreground/50"
                      )}
                      style={{
                        borderLeftWidth: i === 0 ? '3px' : '1px',
                        borderLeftColor: i === 0 ? color : undefined,
                      }}
                    >
                      <div className="text-[8px] font-mono font-bold uppercase tracking-wider leading-tight">{ex.name}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className="text-[7px] font-mono font-bold uppercase px-1 py-0.5 text-white"
                          style={{ backgroundColor: color }}
                        >
                          {difficultyLabels[ex.difficulty_level || 1] || 'L' + (ex.difficulty_level || 1)}
                        </span>
                        {ex.sets_reps && (
                          <span className="text-[7px] font-mono text-muted-foreground">{ex.sets_reps}</span>
                        )}
                      </div>
                    </button>
                    {i < path.exercises.length - 1 && (
                      <ChevronRight className="w-3 h-3 text-muted-foreground/40 flex-shrink-0 mx-0.5" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        );
      })}
    </div>
  );
}
