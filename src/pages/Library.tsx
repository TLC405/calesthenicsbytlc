import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Plus, Sparkles } from 'lucide-react';
import { ExerciseCard } from '@/components/Exercise/ExerciseCard';
import { ExerciseDetailModal } from '@/components/Exercise/ExerciseDetailModal';
import { CategoryTabs } from '@/components/Exercise/CategoryTabs';
import { WorkoutModal } from '@/components/Workout/WorkoutModal';
import { AddExerciseModal } from '@/components/Exercise/AddExerciseModal';
import { ExerciseCardSkeletonGrid } from '@/components/Exercise/ExerciseCardSkeleton';
import { useAuth } from '@/providers/AuthProvider';

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
}

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

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-muted-foreground">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="font-display text-lg font-bold">Exercise Library</h1>
                <p className="text-xs text-muted-foreground">{exercises.length} exercises</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/ai-lab')} className="text-muted-foreground">
                <Sparkles className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">AI Coach</span>
              </Button>
              {user && (
                <Button size="sm" onClick={() => setShowAddModal(true)}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  <span className="hidden sm:inline">Add</span>
                </Button>
              )}
            </div>
          </div>

          {/* Search & Filters */}
          <div className="pb-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, muscle, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 bg-secondary/50 border-border"
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
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-6">
        {loading ? (
          <ExerciseCardSkeletonGrid count={9} />
        ) : filteredExercises.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-muted-foreground text-sm">No exercises found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
      <WorkoutModal date={workoutModalDate} open={!!workoutModalDate} onClose={() => setWorkoutModalDate(null)} onSave={() => {}} />
      <AddExerciseModal open={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={fetchExercises} />
    </div>
  );
}
