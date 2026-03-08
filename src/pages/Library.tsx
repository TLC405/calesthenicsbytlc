import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Sparkles, Download, Flame } from 'lucide-react';
import { ExerciseCard } from '@/components/Exercise/ExerciseCard';
import { ExerciseDetailModal } from '@/components/Exercise/ExerciseDetailModal';
import { CategoryTabs } from '@/components/Exercise/CategoryTabs';
import { WorkoutModal } from '@/components/Workout/WorkoutModal';
import { AddExerciseModal } from '@/components/Exercise/AddExerciseModal';
import { ExerciseCardSkeletonGrid } from '@/components/Exercise/ExerciseCardSkeleton';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from 'sonner';

interface Exercise {
  id: string;
  name: string;
  slug: string;
  category: string;
  primary_muscles: string[];
  secondary_muscles: string[];
  equipment: string[];
  cues: any;
  youtube_url?: string | null;
  instagram_url?: string | null;
  image_url?: string | null;
  difficulty_level?: number;
  sets_reps?: string | null;
  description?: string | null;
  stabilizer_muscles?: string[] | null;
  tendons_involved?: string[] | null;
  recovery_muscle?: string | null;
  recovery_tendon?: string | null;
  recovery_nervous?: string | null;
}

const difficultyLabel = ['', 'Beginner', 'Easy', 'Intermediate', 'Advanced', 'Elite'];

export default function Library() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(
    (location.state as any)?.category || null
  );
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [workoutModalDate, setWorkoutModalDate] = useState<Date | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('exercises')
      .select('*')
      .order('category')
      .order('name');
    setExercises(data || []);
    setLoading(false);
  };

  const categories = [...new Set(exercises.map(e => e.category))];
  const categoryCounts = exercises.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.primary_muscles.some(m => m.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !activeCategory || exercise.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToWorkout = (exercise: Exercise) => {
    setWorkoutModalDate(new Date());
  };

  const downloadExerciseList = () => {
    const data = filteredExercises.map(e => ({
      Name: e.name,
      Category: e.category,
      Difficulty: difficultyLabel[e.difficulty_level || 1],
      'Primary Muscles': e.primary_muscles.join('; '),
      'Secondary Muscles': e.secondary_muscles.join('; '),
      Equipment: e.equipment.join('; '),
      'Sets/Reps': e.sets_reps || '',
      Description: e.description || '',
      'Stabilizer Muscles': e.stabilizer_muscles?.join('; ') || '',
      'Tendons Involved': e.tendons_involved?.join('; ') || '',
      'Recovery (Muscle)': e.recovery_muscle || '',
      'Recovery (Tendon)': e.recovery_tendon || '',
      'Recovery (Nervous)': e.recovery_nervous || '',
      'YouTube URL': e.youtube_url || '',
    }));

    const headers = Object.keys(data[0] || {});
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(h => {
          const val = String((row as any)[h] || '');
          return `"${val.replace(/"/g, '""')}"`;
        }).join(',')
      )
    ];
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tlc-exercises${activeCategory ? `-${activeCategory.toLowerCase()}` : ''}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${data.length} exercises`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Frosted glass header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 rounded-full bg-[hsl(var(--cat-pull))]" />
              <div>
                <h1 className="font-display text-sm font-bold tracking-tight leading-none">Library</h1>
                <p className="text-[9px] font-mono text-muted-foreground mt-0.5">{exercises.length} exercises</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <Button variant="ghost" size="sm" onClick={downloadExerciseList} className="text-muted-foreground h-8 text-[10px] font-mono rounded-lg" disabled={filteredExercises.length === 0}>
                <Download className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/ai-lab')} className="text-muted-foreground h-8 text-[10px] font-mono rounded-lg">
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">AI</span>
              </Button>
              {user && (
                <Button size="sm" onClick={() => setShowAddModal(true)} className="h-8 text-[10px] font-mono uppercase tracking-wider rounded-lg">
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  <span className="hidden sm:inline">Add</span>
                </Button>
              )}
            </div>
          </div>

          {/* Search & Filters */}
          <div className="pb-3 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 rounded-xl border-border bg-accent/50 focus:bg-card focus:shadow-sm transition-all"
              />
            </div>
            <CategoryTabs
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              counts={categoryCounts}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-5 pb-24 md:pb-5">
        {loading ? (
          <ExerciseCardSkeletonGrid count={9} />
        ) : filteredExercises.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-muted-foreground text-xs font-mono">No exercises found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {filteredExercises.map(exercise => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onViewDetails={setSelectedExercise}
                onAddToWorkout={handleAddToWorkout}
              />
            ))}
          </div>
        )}
      </main>

      <ExerciseDetailModal exercise={selectedExercise} open={!!selectedExercise} onClose={() => setSelectedExercise(null)} onAddToWorkout={handleAddToWorkout} />
      <WorkoutModal date={workoutModalDate} open={!!workoutModalDate} onClose={() => setWorkoutModalDate(null)} onSave={fetchExercises} />
      <AddExerciseModal open={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={fetchExercises} />

      {/* Mobile FAB */}
      <button
        onClick={() => navigate('/train')}
        className="fixed bottom-24 right-4 z-40 md:hidden w-14 h-14 rounded-2xl bg-[hsl(var(--cat-core))] text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Start Training"
      >
        <Flame className="w-6 h-6" />
      </button>
    </div>
  );
}
