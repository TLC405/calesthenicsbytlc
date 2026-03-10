import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { CalendarView } from '@/components/Calendar/CalendarView';
import { WorkoutModal } from '@/components/Workout/WorkoutModal';
import { CalendarDays } from 'lucide-react';

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
      {/* Frosted glass header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-border/30">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-border/30 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-base font-bold tracking-tight">Planner</h1>
            <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-[0.2em]">Schedule Training</p>
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
