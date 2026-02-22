import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Settings, LogOut, Sparkles, ArrowRight, Dumbbell, Library } from 'lucide-react';
import { CalendarView } from '@/components/Calendar/CalendarView';
import { MasterSkillList } from '@/components/Dashboard/MasterSkillList';
import { parseISO } from 'date-fns';

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
      {/* Brutalist header */}
      <header className="sticky top-0 z-50 border-b-2 border-foreground bg-background">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-2 border-foreground overflow-hidden">
              <img
                alt="I GOT THE POWA"
                className="w-full h-full object-cover"
                src="/lovable-uploads/7a4a3a95-2e51-4067-b126-c096a96fc31c.png"
              />
            </div>
            <div>
              <h1 className="font-display text-sm font-bold uppercase tracking-wider leading-none">
                {profile?.display_name || 'Athlete'}
              </h1>
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.2em]">
                I GOT THE POWA
              </p>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" onClick={() => navigate('/settings')} className="text-muted-foreground hover:text-foreground h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
            {user ? (
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground h-8 w-8">
                <LogOut className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth')} className="text-xs font-mono uppercase">Sign In</Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Calendar */}
        <CalendarView workoutDates={workoutDates} onDateClick={handleDateClick} />

        {/* Skills */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-4 bg-foreground" />
            <h2 className="font-display text-xs font-bold uppercase tracking-[0.2em]">Categories</h2>
          </div>
          <MasterSkillList />
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/library')}
            className="group flex items-center gap-4 p-4 border-2 border-foreground bg-card hover:bg-foreground hover:text-background transition-colors duration-150 text-left"
          >
            <div className="w-10 h-10 border-2 border-current flex items-center justify-center flex-shrink-0">
              <Library className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-sm uppercase tracking-wider">Exercise Library</h3>
              <p className="text-[10px] font-mono opacity-60 mt-0.5">120+ exercises</p>
            </div>
            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            onClick={() => navigate('/ai-lab')}
            className="group flex items-center gap-4 p-4 border-2 border-foreground bg-card hover:bg-foreground hover:text-background transition-colors duration-150 text-left"
          >
            <div className="w-10 h-10 border-2 border-current flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-sm uppercase tracking-wider">AI Coach</h3>
              <p className="text-[10px] font-mono opacity-60 mt-0.5">Intelligent guidance</p>
            </div>
            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </section>
      </main>
    </div>
  );
}
