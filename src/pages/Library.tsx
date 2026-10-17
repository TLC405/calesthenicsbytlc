import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase, backendConfigured } from '@/integrations/supabase/client';
import { LOCAL_USER_ID, getOfflineExercises, removeLocalExercise, exportLocalExercises } from '@/lib/offlineExercises';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Sparkles, Download, Pencil, Trash2, LockKeyhole, Globe2, UserRound } from 'lucide-react';
import { ExerciseCard } from '@/components/Exercise/ExerciseCard';
import { ExerciseDetailModal } from '@/components/Exercise/ExerciseDetailModal';
import { CategoryTabs } from '@/components/Exercise/CategoryTabs';
import { WorkoutModal } from '@/components/Workout/WorkoutModal';
import { AddExerciseModal, type EditableExercise } from '@/components/Exercise/AddExerciseModal';
import { ExerciseCardSkeletonGrid } from '@/components/Exercise/ExerciseCardSkeleton';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from 'sonner';

interface Exercise {
  id: string; name: string; slug: string; category: string;
  primary_muscles: string[]; secondary_muscles: string[]; equipment: string[];
  cues: any; youtube_url?: string | null; instagram_url?: string | null;
  image_url?: string | null; difficulty_level?: number; sets_reps?: string | null;
  description?: string | null; stabilizer_muscles?: string[] | null;
  created_by?: string | null; visibility?: 'private' | 'public';
  tendons_involved?: string[] | null; recovery_muscle?: string | null;
  recovery_tendon?: string | null; recovery_nervous?: string | null;
}

const difficultyLabel = ['', 'Beginner', 'Easy', 'Intermediate', 'Advanced', 'Elite'];

export default function Library() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const ownerId = backendConfigured ? user?.id : LOCAL_USER_ID;
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>((location.state as any)?.category || null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [workoutModalDate, setWorkoutModalDate] = useState<Date | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [mineOnly, setMineOnly] = useState(() => new URLSearchParams(location.search).get('mine') === '1');

  useEffect(() => { fetchExercises(); }, []);

  const fetchExercises = async () => {
    setLoading(true);
    if (!backendConfigured) {
      setExercises(getOfflineExercises());
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.from('exercises').select('*').order('category').order('name');
    if (error) toast.error('Could not load your exercise library');
    setExercises(data || []);
    setLoading(false);
  };

  const categories = [...new Set(exercises.map(e => e.category))];
  const categoryCounts = exercises.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + 1; return acc; }, {} as Record<string, number>);

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.primary_muscles.some(m => m.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !activeCategory || exercise.category === activeCategory;
    const matchesOwner = !mineOnly || exercise.created_by === ownerId;
    return matchesSearch && matchesCategory && matchesOwner;
  });

  const handleAddToWorkout = (exercise: Exercise) => setWorkoutModalDate(new Date());

  const deleteExercise = async (exercise: Exercise) => {
    if (!ownerId || exercise.created_by !== ownerId) return;
    if (!window.confirm(`Delete "${exercise.name}"? ${backendConfigured ? 'Training history linked to it may also be removed.' : 'This cannot be undone without a local backup.'}`)) return;
    if (!backendConfigured) {
      removeLocalExercise(exercise.id);
      toast.success('Removed from this device');
      void fetchExercises();
      return;
    }
    const { data, error } = await supabase.from('exercises')
      .delete().eq('id', exercise.id).eq('created_by', ownerId).select('id');
    if (error || !data?.length) {
      toast.error(error?.message || 'Could not delete your exercise');
      return;
    }
    toast.success('Your exercise has been deleted');
    void fetchExercises();
  };

  const downloadExerciseList = () => {
    const data = filteredExercises.map(e => ({
      Name: e.name, Category: e.category, Difficulty: difficultyLabel[e.difficulty_level || 1],
      'Primary Muscles': e.primary_muscles.join('; '), 'Secondary Muscles': e.secondary_muscles.join('; '),
      Equipment: e.equipment.join('; '), 'Sets/Reps': e.sets_reps || '', Description: e.description || '',
      'YouTube URL': e.youtube_url || '',
    }));
    const headers = Object.keys(data[0] || {});
    const csvRows = [headers.join(','), ...data.map(row => headers.map(h => `"${String((row as any)[h] || '').replace(/"/g, '""')}"`).join(','))];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `power-exercises${activeCategory ? `-${activeCategory.toLowerCase()}` : ''}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${data.length} exercises`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-border/30">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 rounded-full bg-[hsl(var(--cat-pull))]" />
              <div>
                <h1 className="font-display text-base font-bold tracking-tight leading-none">Library</h1>
                <p className="text-[8px] font-mono text-muted-foreground mt-0.5 tracking-wide">{exercises.length} exercises</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <Button variant="ghost" size="sm" onClick={downloadExerciseList} className="text-muted-foreground h-9 text-[10px] font-mono rounded-xl" disabled={filteredExercises.length === 0}>
                <Download className="h-3.5 w-3.5 mr-1" /><span className="hidden sm:inline">Export</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/ai-lab')} className="text-muted-foreground h-9 text-[10px] font-mono rounded-xl">
                <Sparkles className="h-3.5 w-3.5 mr-1" /><span className="hidden sm:inline">AI</span>
              </Button>
              {ownerId && (
                <>
                  <Button type="button" variant={mineOnly ? 'default' : 'outline'} size="sm"
                    onClick={() => setMineOnly(prev => !prev)}
                    className="h-9 rounded-xl px-2.5 text-[10px] font-mono font-bold" aria-pressed={mineOnly}>
                    <UserRound className="mr-1 h-3.5 w-3.5" /><span className="hidden sm:inline">My exercises</span><span className="sm:hidden">Mine</span>
                  </Button>
                  <Button size="sm" onClick={() => { setEditingExercise(null); setShowAddModal(true); }}
                    className="h-9 text-[10px] font-mono uppercase tracking-wider rounded-xl">
                    <Plus className="h-3.5 w-3.5 mr-1" /><span className="hidden sm:inline">Create</span><span className="sm:hidden">New</span>
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="pb-3 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text" placeholder="Search exercises..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 rounded-xl border-border/50 bg-card focus:bg-card focus:border-ring focus:shadow-sm transition-all"
              />
            </div>
            <CategoryTabs categories={categories} activeCategory={activeCategory} onCategoryChange={setActiveCategory} counts={categoryCounts} />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-5 pb-28 md:pb-5">
        {!backendConfigured && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3">
            <div>
              <p className="text-sm font-bold">Guest training · saved on this device</p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                35 starter exercises. Custom exercises stay in this browser until you connect a cloud account. Export a backup before clearing browser data.
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => exportLocalExercises()}
              className="h-9 rounded-xl text-xs font-bold">
              <Download className="mr-2 h-3.5 w-3.5" /> Backup mine
            </Button>
          </div>
        )}
        {loading ? (
          <ExerciseCardSkeletonGrid count={9} />
        ) : filteredExercises.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-muted-foreground text-xs font-mono">{mineOnly ? 'You haven’t created any exercises yet.' : 'No exercises found.'}</p>
            {ownerId && mineOnly && (
              <Button className="mt-4 rounded-xl" onClick={() => { setEditingExercise(null); setShowAddModal(true); }}>
                <Plus className="mr-2 h-4 w-4" /> Create your first exercise
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {filteredExercises.map(exercise => (
              <div key={exercise.id} className="relative">
                <ExerciseCard exercise={exercise} onViewDetails={setSelectedExercise} onAddToWorkout={handleAddToWorkout} />
                {ownerId && exercise.created_by === ownerId && (
                  <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
                    <span title={exercise.visibility === 'public' ? 'Shared with members' : 'Private exercise'}
                      className="flex h-8 items-center gap-1 rounded-lg bg-card/95 px-2 text-[9px] font-semibold shadow-lg backdrop-blur-md">
                      {exercise.visibility === 'public' ? <Globe2 className="h-3.5 w-3.5" /> : <LockKeyhole className="h-3.5 w-3.5" />}
                      <span className="hidden sm:inline">{exercise.visibility === 'public' ? 'Shared' : 'Private'}</span>
                    </span>
                    <button type="button" title="Edit your exercise" aria-label={`Edit ${exercise.name}`}
                      onClick={e => { e.stopPropagation(); setEditingExercise(exercise); setShowAddModal(true); }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-card/95 text-foreground shadow-lg backdrop-blur-md hover:text-primary">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" title="Delete your exercise" aria-label={`Delete ${exercise.name}`}
                      onClick={e => { e.stopPropagation(); void deleteExercise(exercise); }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-card/95 text-foreground shadow-lg backdrop-blur-md hover:text-red-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <ExerciseDetailModal exercise={selectedExercise} open={!!selectedExercise} onClose={() => setSelectedExercise(null)} onAddToWorkout={handleAddToWorkout} />
      <WorkoutModal date={workoutModalDate} open={!!workoutModalDate} onClose={() => setWorkoutModalDate(null)} onSave={fetchExercises} />
      <AddExerciseModal open={showAddModal}
        initialExercise={editingExercise as EditableExercise | null}
        onClose={() => { setShowAddModal(false); setEditingExercise(null); }}
        onSuccess={fetchExercises} />

      <button
        onClick={() => navigate('/planner')}
        className="fixed bottom-28 right-4 z-40 md:hidden w-14 h-14 rounded-2xl text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        style={{ backgroundColor: 'hsl(var(--cat-skills))', boxShadow: '0 0 20px hsl(var(--cat-skills) / 0.3)' }}
        aria-label="Open Builder"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
