import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CalendarView } from '@/components/Calendar/CalendarView';
import { WorkoutModal } from '@/components/Workout/WorkoutModal';
import { ArrowLeft, CalendarDays } from 'lucide-react';

export default function Planner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [workoutDates, setWorkoutDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    (location.state as any)?.selectedDate ? new Date((location.state as any).selectedDate) : null
  );

  useEffect(() => {
    if (user) fetchWorkouts();
  }, [user]);

  const fetchWorkouts = async () => {
    if (!user) return;
    const { data } = await supabase.from('workouts').select('date').eq('user_id', user.id);
    if (data) setWorkoutDates(data.map(w => new Date(w.date)));
  };

  const handleDateClick = (date: Date) => setSelectedDate(date);

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-display text-lg font-bold">Workout Planner</h1>
            <p className="text-xs text-muted-foreground">Plan and schedule your training</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-6">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Select a Date
          </h2>
        </div>
        <CalendarView onDateClick={handleDateClick} workoutDates={workoutDates} />
      </main>

      <WorkoutModal date={selectedDate} open={!!selectedDate} onClose={() => setSelectedDate(null)} onSave={fetchWorkouts} />
    </div>
  );
}
