import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Play, Image as ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { ExerciseDetailModal } from '@/components/Exercise/ExerciseDetailModal';
import { getYouTubeVideoId } from '@/components/Exercise/VideoPlayer';

type Exercise = NonNullable<Awaited<ReturnType<typeof fetchCatalog>>>[number];
async function fetchCatalog() {
  const { data, error } = await supabase.from('exercises').select('*').order('name');
  if (error) throw error;
  return data || [];
}
interface ExercisePickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: Exercise) => void;
}
const difficulties = ['All difficulties', 'Beginner', 'Novice', 'Intermediate', 'Advanced', 'Elite'];

export function ExercisePickerModal({ open, onClose, onSelectExercise }: ExercisePickerModalProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState('all');
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) { setSelected(null); return; }
    let active = true;
    setLoading(true); setError('');
    fetchCatalog().then(data => {
      if (active) setExercises(data);
    }).catch(() => {
      if (active) setError('Could not load exercises. Please try again.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [open]);

  const categories = useMemo(() => [...new Set(exercises.map(e => e.category).filter(Boolean))].sort(), [exercises]);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return exercises.filter(exercise =>
      (!term || exercise.name.toLowerCase().includes(term) ||
        exercise.category?.toLowerCase().includes(term) ||
        (exercise.primary_muscles || []).some(m => m.toLowerCase().includes(term))) &&
      (!category || exercise.category === category) &&
      (difficulty === 'all' || Number(exercise.difficulty_level) === Number(difficulty)));
  }, [exercises, search, category, difficulty]);

  const select = (exercise: Exercise) => { onSelectExercise(exercise); setSelected(null); onClose(); };
  return <>
    <Dialog open={open && !selected} onOpenChange={next => { if (!next) onClose(); }}>
      <DialogContent className="max-w-xl max-h-[88dvh] flex flex-col p-0 rounded-2xl overflow-hidden">
        <DialogHeader className="px-4 pt-5 pb-2 text-left">
          <DialogTitle>Choose an exercise</DialogTitle>
          <DialogDescription>Find the right variation, preview it, or add it to your workout.</DialogDescription>
        </DialogHeader>
        <div className="px-4 pb-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
            <Input value={search} onChange={e => setSearch(e.target.value)}
              className="pl-10 h-12 rounded-xl" placeholder="Search exercises or muscles" aria-label="Search exercises"/>
          </div>
          <div className="flex items-center gap-2">
            <select className="power-difficulty-select flex-1 max-w-none" aria-label="Category"
              value={category || 'all'} onChange={e => setCategory(e.target.value === 'all' ? null : e.target.value)}>
              <option value="all">All categories</option>
              {categories.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
            <select className="power-difficulty-select flex-1 max-w-none" aria-label="Difficulty"
              value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              <option value="all">All difficulties</option>
              {difficulties.slice(1).map((name, i) => <option value={i + 1} key={name}>{name}</option>)}
            </select>
          </div>
          <p className="text-xs text-muted-foreground" role="status">
            {loading ? 'Loading…' : error || filtered.length + ' exercises'}
          </p>
        </div>
        <ScrollArea className="min-h-0 flex-1 px-4 pb-4">
          {loading ? <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="h-20 rounded-xl bg-secondary animate-pulse"/>)}</div> :
            error ? <p className="text-sm text-destructive p-4">{error}</p> :
            filtered.length === 0 ? <p className="text-sm text-muted-foreground p-4">No matches. Try another difficulty or category.</p> :
            <div className="space-y-2">
              {filtered.map(exercise => {
                const videoId = getYouTubeVideoId(exercise.youtube_url);
                const image = exercise.image_url || (videoId ? 'https://i.ytimg.com/vi/' + videoId + '/mqdefault.jpg' : null);
                return <div key={exercise.id} className="flex items-center gap-2 border border-border/70 rounded-xl bg-card p-2">
                  <button type="button" className="w-16 h-14 rounded-lg overflow-hidden shrink-0 bg-secondary relative flex items-center justify-center"
                    onClick={() => setSelected(exercise)} aria-label={'Preview ' + exercise.name}>
                    {image ? <img src={image} alt="" loading="lazy" className="w-full h-full object-cover"/> :
                      <ImageIcon size={20} className="text-muted-foreground"/>}
                    {videoId && <Play size={15} className="absolute bottom-1 right-1 text-white drop-shadow-md" fill="currentColor"/>}
                  </button>
                  <button type="button" className="text-left flex-1 min-w-0 min-h-12"
                    onClick={() => setSelected(exercise)}>
                    <strong className="block truncate text-sm">{exercise.name}</strong>
                    <small className="block truncate text-muted-foreground mt-1">{exercise.category} · {difficulties[exercise.difficulty_level || 0] || 'Not rated'}</small>
                  </button>
                  <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl shrink-0"
                    onClick={() => select(exercise)} aria-label={'Add ' + exercise.name}>
                    <Plus size={18}/>
                  </Button>
                </div>;
              })}
            </div>}
        </ScrollArea>
      </DialogContent>
    </Dialog>
    <ExerciseDetailModal exercise={selected} open={!!selected} onClose={() => setSelected(null)} onAddToWorkout={select}/>
  </>;
}
