import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { CalendarView } from '@/components/Calendar/CalendarView';
import { WorkoutModal } from '@/components/Workout/WorkoutModal';

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
      {/* Brutalist header */}
      <header className="sticky top-0 z-50 border-b-2 border-foreground bg-background">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-14 flex items-center gap-3">
          <div className="w-1.5 h-6 bg-foreground" />
          <div>
            <h1 className="font-display text-sm font-bold uppercase tracking-wider leading-none">Planner</h1>
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.2em]">Schedule training</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-6">
        <CalendarView onDateClick={handleDateClick} workoutDates={workoutDates} />
      </main>

      <WorkoutModal date={selectedDate} open={!!selectedDate} onClose={() => setSelectedDate(null)} onSave={fetchWorkouts} />
    </div>
  );
}
