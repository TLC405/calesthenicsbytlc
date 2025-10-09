import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CalendarView } from '@/components/Calendar/CalendarView';
import { ArrowLeft } from 'lucide-react';
import '@/styles/neumorph.css';

export default function Planner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workoutDates, setWorkoutDates] = useState<Date[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchWorkouts();
  }, [user, navigate]);

  const fetchWorkouts = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('workouts')
      .select('date')
      .eq('user_id', user.id);

    if (data) {
      setWorkoutDates(data.map(w => new Date(w.date)));
    }
  };

  const handleDateClick = (date: Date) => {
    console.log('Selected date:', date);
    // TODO: Open workout editor
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="neumorph p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="neumorph-flat neumorph-hover"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-navy">Workout Planner</h1>
                <p className="text-muted-foreground">
                  Plan and schedule your training sessions
                </p>
              </div>
            </div>
          </div>
        </header>

        <CalendarView
          onDateClick={handleDateClick}
          workoutDates={workoutDates}
        />
      </div>
    </div>
  );
}
