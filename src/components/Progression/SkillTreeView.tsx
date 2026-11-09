import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ChainExercise {
  id: string; name: string; chain_group: string; chain_order: number | null;
  difficulty_level: number | null; category: string; sets_reps: string | null;
}
interface SkillPath { group: string; exercises: ChainExercise[] }
interface SkillTreeViewProps { onExerciseClick?: (exerciseId: string) => void }
const difficulty = ['', 'Beginner', 'Novice', 'Intermediate', 'Advanced', 'Elite'];

export function SkillTreeView({ onExerciseClick }: SkillTreeViewProps) {
  const [paths, setPaths] = useState<SkillPath[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data } = await supabase.from('exercises')
        .select('id, name, chain_group, chain_order, difficulty_level, category, sets_reps')
        .not('chain_group', 'is', null).order('chain_order');
      if (!active) return;
      const grouped: Record<string, ChainExercise[]> = {};
      ((data || []) as ChainExercise[]).forEach(exercise => {
        (grouped[exercise.chain_group] ||= []).push(exercise);
      });
      setPaths(Object.entries(grouped).filter(([, items]) => items.length >= 2)
        .map(([group, exercises]) => ({
          group,
          exercises: [...exercises].sort((a, b) => (a.chain_order || 0) - (b.chain_order || 0)),
        }))
        .sort((a, b) => a.group.localeCompare(b.group)));
      setLoading(false);
    };
    void load();
    return () => { active = false; };
  }, []);

  if (loading) return <div className="space-y-3" aria-label="Loading progressions">
    {[1, 2, 3].map(i => <div className="h-16 bg-card border border-border rounded-xl animate-pulse" key={i}/>)}
  </div>;
  if (paths.length === 0) return <p className="text-sm text-muted-foreground py-10 text-center">
    No progression paths are available yet. Browse individual exercises instead.
  </p>;

  return <div className="space-y-2">
    {paths.map(path => {
      const isOpen = expanded === path.group;
      const title = path.group.replace(/[-_]/g, ' ').replace(/\b\w/g, m => m.toUpperCase());
      return <section key={path.group} className="overflow-hidden rounded-2xl border border-border/60 bg-card">
        <button type="button" aria-expanded={isOpen} onClick={() => setExpanded(isOpen ? null : path.group)}
          className="w-full flex items-center gap-3 p-4 text-left min-h-16 hover:bg-accent/30 transition-colors">
          <span className="flex-1 min-w-0">
            <strong className="block text-sm font-display">{title}</strong>
            <small className="text-xs text-muted-foreground">{path.exercises.length} progressions · easier to harder</small>
          </span>
          <ChevronDown className={isOpen ? 'rotate-180 transition-transform text-primary' : 'transition-transform text-muted-foreground'} size={18}/>
        </button>
        {isOpen && <div className="px-3 pb-3">
          {path.exercises.map((exercise, idx) => <button key={exercise.id} type="button"
            onClick={() => onExerciseClick?.(exercise.id)}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-3 min-h-14 text-left hover:bg-accent/40 focus-visible:outline-2 focus-visible:outline-primary">
            <span className="w-7 h-7 flex shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold tabular-nums">{idx + 1}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{exercise.name}</span>
              <span className="block text-xs text-muted-foreground">{difficulty[exercise.difficulty_level || 0] || 'Not rated'}{exercise.sets_reps ? ' · ' + exercise.sets_reps : ''}</span>
            </span>
            <ChevronRight size={17} className="text-muted-foreground shrink-0"/>
          </button>)}
        </div>}
      </section>;
    })}
  </div>;
}
