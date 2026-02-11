import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Library, Settings, LogOut, Sparkles, ArrowRight, CalendarDays, Dumbbell } from 'lucide-react';
import { CalendarView } from '@/components/Calendar/CalendarView';
import { MasterSkillList } from '@/components/Dashboard/MasterSkillList';
import { format, parseISO } from 'date-fns';
import '@/styles/neumorph.css';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [workoutDates, setWorkoutDates] = useState<Date[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profileData);

        const { data: workoutsData } = await supabase
          .from('workouts')
          .select('date')
          .eq('user_id', user.id);

        if (workoutsData) {
          setWorkoutDates(workoutsData.map(w => parseISO(w.date)));
        }
      }
    };
    fetchData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleDateClick = (date: Date) => {
    navigate('/planner', { state: { selectedDate: date } });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top navigation bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              alt="TLC's Workout"
              className="w-9 h-9 rounded-lg border border-border object-cover"
              src="/lovable-uploads/7a4a3a95-2e51-4067-b126-c096a96fc31c.png"
            />
            <div>
              <h1 className="font-display text-lg font-bold leading-tight">TLC's Hybrid</h1>
              <p className="text-xs text-muted-foreground leading-tight">
                {profile?.display_name || 'Athlete'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => navigate('/settings')} className="text-muted-foreground hover:text-foreground">
              <Settings className="h-4 w-4" />
            </Button>
            {user ? (
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground">
                <LogOut className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>Sign In</Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-8">
        {/* Section: Calendar */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">Training Calendar</h2>
          </div>
          <CalendarView workoutDates={workoutDates} onDateClick={handleDateClick} />
        </section>

        {/* Section: Master Skills */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">Master Skills</h2>
          </div>
          <MasterSkillList />
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/library')}
            className="group flex items-center gap-4 p-5 rounded-xl border border-border bg-card hover:border-foreground/20 transition-all duration-200 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              <Library className="h-5 w-5 text-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-semibold text-foreground">Exercise Library</h3>
              <p className="text-sm text-muted-foreground">Browse 120+ premium exercises</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            onClick={() => navigate('/ai-lab')}
            className="group flex items-center gap-4 p-5 rounded-xl border border-border bg-card hover:border-foreground/20 transition-all duration-200 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-semibold text-foreground">AI Coach</h3>
              <p className="text-sm text-muted-foreground">Intelligent training guidance</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </section>
      </main>
    </div>
  );
}
