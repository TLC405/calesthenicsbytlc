import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Play, ChevronRight, List, GitBranch, Image as ImageIcon } from 'lucide-react';
import { ExerciseDetailModal } from '@/components/Exercise/ExerciseDetailModal';
import { AddExerciseModal } from '@/components/Exercise/AddExerciseModal';
import { SkillTreeView } from '@/components/Progression/SkillTreeView';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from 'sonner';
import { movementGoals, matchesMovementGoal } from '@/lib/movementGoals';
import { getYouTubeVideoId } from '@/components/Exercise/VideoPlayer';

interface Exercise {
  id: string; name: string; slug: string; category: string;
  primary_muscles: string[]; secondary_muscles: string[]; equipment: string[];
  cues: unknown; youtube_url?: string | null; instagram_url?: string | null;
  image_url?: string | null; difficulty_level?: number | null; sets_reps?: string | null;
  description?: string | null; chain_group?: string | null; chain_order?: number | null;
  video_verified?: boolean | null;
}
const difficultyLabels = ['Not rated', 'Beginner', 'Novice', 'Intermediate', 'Advanced', 'Elite'];


export default function Library() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState((location.state as { search?: string } | null)?.search || '');
  const [category, setCategory] = useState<string | null>((location.state as { category?: string } | null)?.category || null);
  const [difficulty, setDifficulty] = useState('all');
  const [goal, setGoal] = useState((location.state as { goal?: string } | null)?.goal || 'all');
  const [view, setView] = useState<'list' | 'paths'>('list');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [visibleCount, setVisibleCount] = useState(40);
  const loadExercises = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('exercises').select('*').order('name');
    if (error) toast.error('Could not load the exercise library');
    setExercises((data || []) as Exercise[]);
    setLoading(false);
  };
  useEffect(() => { void loadExercises(); }, []);
  useEffect(() => { 
    const state = location.state as { search?: string; category?: string; goal?: string } | null;
    if (state?.search !== undefined) { setSearchTerm(state.search); setCategory(null); setView('list'); }
    if (state?.category) setCategory(state.category);
    if (state?.goal) { setGoal(state.goal); setSearchTerm(''); setCategory(null); setView('list'); }
  }, [location.state]);

  const categories = useMemo(() => [...new Set(exercises.map(e => e.category).filter(Boolean))].sort(), [exercises]);
  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return exercises.filter(e => {
      const searchMatch = !q || e.name.toLowerCase().includes(q) || e.category?.toLowerCase().includes(q) ||
        (e.primary_muscles || []).some(m => m.toLowerCase().includes(q));
      return searchMatch && (!category || e.category === category) &&
        (goal === 'all' || matchesMovementGoal(e, goal)) &&
        (difficulty === 'all' || Number(e.difficulty_level) === Number(difficulty));
    });
  }, [exercises, searchTerm, category, difficulty, goal]);

  const addToBuilder = (exercise: Exercise) => {
    try {
      sessionStorage.setItem('powa-builder-import', JSON.stringify({
        items: [{ name: exercise.name, section: 'workout', exercise }],
      }));
      navigate('/planner');
      toast.success('Added to workout builder');
    } catch {
      toast.error('Could not open workout builder');
    }
  };
  const detailFor = (id: string) => {
    setSelectedExercise(exercises.find(e => e.id === id) || null);
    setView('list');
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="page-header sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 pt-4 pb-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="power-kicker">DISCOVER MOVEMENT</p>
              <h1 className="text-xl font-display font-extrabold tracking-tight">Exercise library</h1>
            </div>
            {user && <Button variant="outline" size="sm" className="min-h-11 rounded-xl gap-1.5" onClick={() => setShowAddModal(true)}>
              <Plus size={16}/> <span>Add custom</span>
            </Button>}
          </div>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true"/>
            <Input value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setVisibleCount(40); }}
              placeholder="Search exercises or skills" aria-label="Search exercises" className="pl-10 h-12 rounded-xl bg-card"/>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex rounded-xl border border-border/70 bg-card p-1">
              <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}
                className={view === 'list' ? 'power-view-tab power-view-active' : 'power-view-tab'}><List size={15}/> Exercises</button>
              <button type="button" aria-pressed={view === 'paths'} onClick={() => setView('paths')}
                className={view === 'paths' ? 'power-view-tab power-view-active' : 'power-view-tab'}><GitBranch size={15}/> Progressions</button>
            </div>
            {view === 'list' && <select aria-label="Filter by difficulty" value={difficulty} onChange={e => { setDifficulty(e.target.value); setVisibleCount(40); }}
              className="power-difficulty-select">
              <option value="all">All difficulties</option>
              {difficultyLabels.slice(1).map((label, i) => <option key={i} value={i + 1}>{label}</option>)}
            </select>}
          </div>
          {view === 'list' && <div className="flex items-center gap-2">
            <label htmlFor="movement-goal" className="text-xs text-muted-foreground shrink-0">Training focus</label>
            <select id="movement-goal" className="power-difficulty-select max-w-none flex-1" value={goal}
              onChange={e => { setGoal(e.target.value); setVisibleCount(40); }}>
              <option value="all">All movements</option>
              {movementGoals.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </div>}
          {view === 'list' && <div className="power-category-scroll" role="group" aria-label="Exercise categories">
            <button type="button" className={!category ? 'power-category-chip selected' : 'power-category-chip'} onClick={() => { setCategory(null); setVisibleCount(40); }}>All</button>
            {categories.map(c => <button type="button" key={c} className={category === c ? 'power-category-chip selected' : 'power-category-chip'}
              onClick={() => { setCategory(category === c ? null : c); setVisibleCount(40); }}>{c}</button>)}
          </div>}
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-4">
        {view === 'paths' ? (
          <div>
            <p className="text-sm text-muted-foreground mb-4">Explore easier and harder variations. Choose the exercise that fits your current strength.</p>
            <SkillTreeView onExerciseClick={detailFor}/>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm text-muted-foreground">{loading ? 'Loading exercises…' : filtered.length + ' exercises'}</p>
              {difficulty !== 'all' && <Button variant="ghost" size="sm" onClick={() => setDifficulty('all')}>Clear difficulty</Button>}
            </div>
            {loading ? <div className="space-y-2" aria-label="Loading exercises">
              {Array.from({ length: 6 }, (_, i) => <div key={i} className="h-20 rounded-2xl bg-card border border-border/40 animate-pulse"/>)}
            </div> : filtered.length === 0 ? <div className="power-home-empty">
              <Search size={23}/><p>No matching exercises. Try another term or difficulty.</p>
            </div> : <div className="power-exercise-list">
              {filtered.slice(0, visibleCount).map(exercise => {
                const id = getYouTubeVideoId(exercise.youtube_url);
                const thumbnail = exercise.image_url || (id ? 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg' : null);
                return <div className="power-exercise-row" key={exercise.id}>
                  <button type="button" className="power-exercise-open" onClick={() => setSelectedExercise(exercise)} aria-label={'View ' + exercise.name + ' and tutorial'}>
                    <span className="power-exercise-thumb">
                      {thumbnail ? <img src={thumbnail} alt="" loading="lazy" onError={e => { e.currentTarget.style.display = 'none'; }}/> : <ImageIcon size={21} aria-hidden="true"/>}
                      {id && <Play size={15} className="power-thumb-play" fill="currentColor" aria-hidden="true"/>}
                    </span>
                    <span className="power-exercise-copy">
                      <strong>{exercise.name}</strong>
                      <small>{exercise.category} · {difficultyLabels[exercise.difficulty_level || 0] || 'Not rated'}</small>
                    </span>
                    <ChevronRight className="power-row-chevron" size={17} aria-hidden="true"/>
                  </button>
                  <Button variant="outline" size="icon" className="power-exercise-add" aria-label={'Add ' + exercise.name + ' to workout'} onClick={() => addToBuilder(exercise)}>
                    <Plus size={18}/>
                  </Button>
                </div>;
              })}
              {filtered.length > visibleCount && <Button variant="outline" className="w-full h-12 mt-3" onClick={() => setVisibleCount(v => v + 40)}>
                Show more exercises ({filtered.length - visibleCount} remaining)
              </Button>}
            </div>}
          </>
        )}
      </main>
      <ExerciseDetailModal exercise={selectedExercise} open={!!selectedExercise} onClose={() => setSelectedExercise(null)} onAddToWorkout={addToBuilder}/>
      <AddExerciseModal open={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={loadExercises}/>
    </div>
  );
}
