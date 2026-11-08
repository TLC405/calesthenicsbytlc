import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ChainExercise {
  id: string;
  name: string;
  chain_order: number | null;
  difficulty_level: number | null;
}
interface ProgressionPathStripProps {
  exerciseId: string;
  chainGroup: string | null;
  onNavigate: (exerciseId: string) => void;
}
const difficultyNames = ['', 'Beginner', 'Novice', 'Intermediate', 'Advanced', 'Elite'];

export function ProgressionPathStrip({ exerciseId, chainGroup, onNavigate }: ProgressionPathStripProps) {
  const [chain, setChain] = useState<ChainExercise[]>([]);
  const [showAll, setShowAll] = useState(false);
  useEffect(() => {
    setShowAll(false);
    if (!chainGroup) { setChain([]); return; }
    let active = true;
    supabase.from('exercises')
      .select('id, name, chain_order, difficulty_level')
      .eq('chain_group', chainGroup)
      .order('chain_order')
      .then(({ data }) => {
        if (active) setChain((data || []) as ChainExercise[]);
      });
    return () => { active = false; };
  }, [chainGroup]);

  if (!chainGroup || chain.length < 2) return null;
  const index = chain.findIndex(ex => ex.id === exerciseId);
  const selected = index >= 0 ? index : 0;
  const visible = showAll ? chain : chain.slice(Math.max(0, selected - 1), Math.min(chain.length, selected + 2));
  return (
    <section className="rounded-2xl border border-border/70 bg-card overflow-hidden" aria-label="Exercise difficulty and alternatives">
      <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Adjust difficulty</p>
          <p className="text-xs text-muted-foreground">Choose an easier or harder variation</p>
        </div>
        {chain.length > 3 && <button className="text-xs font-semibold text-primary min-h-11 px-2" type="button"
          onClick={() => setShowAll(v => !v)} aria-expanded={showAll}>
          {showAll ? 'Show nearby' : 'All ' + chain.length + ' steps'}
          <ChevronDown size={14} className={showAll ? 'inline ml-1 rotate-180' : 'inline ml-1'}/>
        </button>}
      </div>
      <div className="p-2 space-y-1">
        {visible.map(ex => {
          const isSelected = ex.id === exerciseId;
          const position = chain.findIndex(item => item.id === ex.id);
          const label = position < selected ? 'Easier' : position > selected ? 'Harder' : 'Current';
          return (
            <button key={ex.id} type="button" disabled={isSelected} aria-current={isSelected ? 'step' : undefined}
              onClick={() => onNavigate(ex.id)}
              className={isSelected
                ? 'w-full flex items-center text-left gap-3 p-3 rounded-xl bg-primary/10 border border-primary/50'
                : 'w-full flex items-center text-left gap-3 p-3 min-h-14 rounded-xl hover:bg-accent/60 border border-transparent'}>
              <span className="shrink-0 w-11 text-[11px] font-semibold text-muted-foreground">{label}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{ex.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {difficultyNames[ex.difficulty_level || 0] || 'Not rated'}
                </span>
              </span>
              {!isSelected && <ChevronRight size={17} className="shrink-0 text-muted-foreground" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </section>
  );
}
