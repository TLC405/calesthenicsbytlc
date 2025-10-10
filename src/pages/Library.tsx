import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search } from 'lucide-react';
import '@/styles/neumorph.css';

export default function Library() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    const { data } = await supabase
      .from('exercises')
      .select('*')
      .order('name');

    setExercises(data || []);
  };

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 neumorph-inset"
            />
          </div>
        </header>

        {filteredExercises.length === 0 ? (
          <div className="neumorph p-12 text-center">
            <p className="text-muted-foreground">
              No exercises found. The library is currently empty.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises.map(exercise => (
              <div key={exercise.id} className="neumorph p-6 neumorph-hover cursor-pointer">
                <h3 className="text-lg font-bold mb-2">{exercise.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{exercise.category}</p>
                {exercise.primary_muscles.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {exercise.primary_muscles.map((muscle: string) => (
                      <span
                        key={muscle}
                        className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                      >
                        {muscle}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
