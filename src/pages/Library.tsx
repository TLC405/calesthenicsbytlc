import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase, backendConfigured } from '@/integrations/supabase/client';
import { LOCAL_USER_ID, getOfflineExercises, removeLocalExercise, exportLocalExercises } from '@/lib/offlineExercises';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Sparkles, Download, Pencil, Trash2, LockKeyhole, Globe2, UserRound, PlayCircle, Dumbbell } from 'lucide-react';
import { ExerciseCard } from '@/components/Exercise/ExerciseCard';
import { ExerciseDetailModal } from '@/components/Exercise/ExerciseDetailModal';
import { CategoryTabs, CATEGORY_GROUPS } from '@/components/Exercise/CategoryTabs';
import { AddExerciseModal, type EditableExercise } from '@/components/Exercise/AddExerciseModal';
import { ExerciseCardSkeletonGrid } from '@/components/Exercise/ExerciseCardSkeleton';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from 'sonner';
import tlcUploadedExercises from '@/data/tlcUploadedExercises.json';

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
  const guestMode = !user;
  const ownerId = user?.id ?? LOCAL_USER_ID;
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>((location.state as any)?.category || null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [mineOnly, setMineOnly] = useState(() => new URLSearchParams(location.search).get('mine') === '1');
  const [videosOnly, setVideosOnly] = useState(false);

  useEffect(() => { fetchExercises(); }, []);

  const mergedFallback = () => {
    const records = [...getOfflineExercises(), ...tlcUploadedExercises] as Exercise[];
    return [...new Map(records.map(item => [item.slug, item])).values()];
  };

  const fetchExercises = async () => {
    setLoading(true);
    if (!backendConfigured) {
      setExercises(mergedFallback());
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.from('exercises').select('*').order('category').order('name');
    if (error) toast.info('Showing your saved exercise collection while the library reconnects');
    const saved = user ? [] : getOfflineExercises();
    const records = [...tlcUploadedExercises, ...(data || []), ...saved] as Exercise[];
    setExercises([...new Map(records.map(item => [item.slug, item])).values()]);
    setLoading(false);
  };

  const categories = [...new Set(exercises.map(e => e.category))];
  const categoryCounts = exercises.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + 1; return acc; }, {} as Record<string, number>);

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.primary_muscles.some(m => m.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !activeCategory || (CATEGORY_GROUPS[activeCategory] ? CATEGORY_GROUPS[activeCategory].includes(exercise.category) : exercise.category === activeCategory);
    const matchesOwner = !mineOnly || exercise.created_by === ownerId;
    const matchesVideo = !videosOnly || Boolean(exercise.youtube_url);
    return matchesSearch && matchesCategory && matchesOwner && matchesVideo;
  });

  const handleAddToWorkout = (exercise: Exercise) => {
    // The exercise is carried into the actual builder, not an empty workout dialog.
    sessionStorage.setItem('powa-builder-import', JSON.stringify({
      items: [{ name: exercise.name, section: 'workout', exercise }]
    }));
    navigate('/planner');
  };

  const deleteExercise = async (exercise: Exercise) => {
    if (!ownerId || exercise.created_by !== ownerId) return;
    if (!window.confirm(`Delete "${exercise.name}"? ${guestMode ? 'This cannot be undone without a local backup.' : 'Training history linked to it may also be removed.'}`)) return;
    if (guestMode) {
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
      <header className="power-library-head sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-8">
          <div className="min-h-14 flex items-center justify-between gap-2 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-1.5 h-6 rounded-full bg-[hsl(var(--cat-pull))]" />
              <div>
                <h1 className="font-display text-base font-bold tracking-tight leading-none">Library</h1>
                <p className="text-[8px] font-mono text-muted-foreground mt-0.5 tracking-wide">{exercises.length} exercises</p>
              </div>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button variant="ghost" size="sm" onClick={downloadExerciseList} className="hidden sm:inline-flex text-muted-foreground h-9 text-[10px] font-mono rounded-xl" disabled={filteredExercises.length === 0}>
                <Download className="h-3.5 w-3.5 mr-1" /><span className="hidden sm:inline">Export</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/ai-lab')} className="hidden sm:inline-flex text-muted-foreground h-9 text-[10px] font-mono rounded-xl">
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
          <div className="pb-3">
            <Button type="button" onClick={() => navigate('/planner')} className="power-skeuo-button w-full h-12 rounded-2xl font-display font-black uppercase tracking-wide text-sm">
              <Dumbbell className="h-5 w-5 mr-2" /> Start Workout
            </Button>
          </div>
          <div className="pb-3 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text" placeholder="Search exercises..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 rounded-xl border-border/50 bg-card focus:bg-card focus:border-ring focus:shadow-sm transition-all"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <CategoryTabs categories={categories} activeCategory={activeCategory} onCategoryChange={setActiveCategory} counts={categoryCounts} />
            </div>
            <div className="flex items-center min-w-0 gap-2 overflow-hidden">
              <Button type="button" variant={videosOnly ? 'default' : 'outline'} size="sm"
                onClick={() => setVideosOnly(v => !v)}
                className="h-10 shrink-0 gap-1 rounded-xl text-[10px] font-mono font-bold"
                aria-pressed={videosOnly}>
                <PlayCircle className="h-4 w-4" />
                {videosOnly ? 'Video tutorials ✓' : 'Video tutorials'}
                <span className="font-mono text-[9px] opacity-65">
                  {exercises.filter(e => Boolean(e.youtube_url)).length}
                </span>
              </Button>
              <span className="hidden md:inline text-[10px] text-muted-foreground">Tap Play on any video thumbnail.</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-4 md:px-8 py-3 sm:py-5 pb-32 md:pb-5">
        {guestMode && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3">
            <div>
              <p className="text-sm font-bold">Guest training · saved on this device</p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                Explore the exercise catalog. Custom exercises stay in this browser until you sign in. Export a backup before clearing browser data.
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
          <div className="grid grid-cols-1 min-[390px]:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
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
      <AddExerciseModal open={showAddModal}
        initialExercise={editingExercise as EditableExercise | null}
        onClose={() => { setShowAddModal(false); setEditingExercise(null); }}
        onSuccess={fetchExercises} />

      <button
        onClick={() => navigate('/planner')}
        className="power-library-fab fixed bottom-[calc(5.4rem+env(safe-area-inset-bottom))] right-3 z-30 md:hidden w-12 h-12 rounded-2xl text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        style={{ backgroundColor: 'hsl(var(--cat-skills))', boxShadow: '0 0 20px hsl(var(--cat-skills) / 0.3)' }}
        aria-label="Open Builder"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
