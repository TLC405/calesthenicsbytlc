import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search } from 'lucide-react';
import { ExerciseCard } from '@/components/Exercise/ExerciseCard';
import { ExerciseDetailModal } from '@/components/Exercise/ExerciseDetailModal';
import { CategoryTabs } from '@/components/Exercise/CategoryTabs';
import { WorkoutModal } from '@/components/Workout/WorkoutModal';
import '@/styles/neumorph.css';

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
}

export default function Library() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [workoutModalDate, setWorkoutModalDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    const { data } = await supabase
      .from('exercises')
      .select('*')
      .order('category')
      .order('name');

    setExercises(data || []);
  };

  const categories = [...new Set(exercises.map(e => e.category))];

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
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="neumorph p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="neumorph-flat neumorph-hover"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-navy">Exercise Library</h1>
                <p className="text-muted-foreground">
                  Browse and learn calisthenics movements
                </p>
              </div>
            </div>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 neumorph-inset"
            />
          </div>

          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </header>

        {filteredExercises.length === 0 ? (
          <div className="neumorph p-12 text-center">
            <p className="text-muted-foreground">
              No exercises found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </div>

      <ExerciseDetailModal
        exercise={selectedExercise}
        open={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
        onAddToWorkout={handleAddToWorkout}
      />

      <WorkoutModal
        date={workoutModalDate}
        open={!!workoutModalDate}
        onClose={() => setWorkoutModalDate(null)}
        onSave={() => {}}
      />
    </div>
  );
}
