import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Library, Settings, LogOut, Sparkles, ArrowRight } from 'lucide-react';
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
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profileData);

        // Fetch all workouts for calendar
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
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="premium-card p-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-gold/30 to-primary/30 rounded-xl blur-lg" />
                <img
                  alt="TLC's Workout"
                  className="relative w-14 h-14 rounded-xl border-2 border-primary/20 object-cover"
                  src="/lovable-uploads/7a4a3a95-2e51-4067-b126-c096a96fc31c.png"
                />
              </div>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold">
                  <span className="gradient-text">TLC's</span>{' '}
                  <span className="text-foreground">Hybrid</span>
                </h1>
                <p className="text-sm text-muted-foreground">
                  {user ? `Welcome back, ${profile?.display_name || 'Athlete'}` : 'Start your journey'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/settings')}
                className="text-muted-foreground hover:text-foreground"
              >
                <Settings className="h-5 w-5" />
              </Button>
              {user ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              ) : (
                <Button variant="ghost" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Training Calendar */}
        <CalendarView workoutDates={workoutDates} onDateClick={handleDateClick} />

        {/* Master Skill List */}
        <MasterSkillList />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/library')}
            className="premium-card p-6 text-left group hover:shadow-xl transition-all duration-300 animate-slide-up"
            style={{ animationDelay: '100ms' }}
          >
            <div className="flex items-center justify-between mb-4">
              <Library className="h-8 w-8 text-primary" />
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
            <h2 className="font-display text-xl font-semibold mb-1">Exercise Library</h2>
            <p className="text-sm text-muted-foreground">
              Browse 120+ premium exercises
            </p>
          </button>

          <button
            onClick={() => navigate('/ai-lab')}
            className="premium-card p-6 text-left group hover:shadow-xl transition-all duration-300 animate-slide-up"
            style={{ animationDelay: '200ms' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="relative">
                <Sparkles className="h-8 w-8 text-gold" />
                <div className="absolute inset-0 animate-pulse-glow rounded-full" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
            <h2 className="font-display text-xl font-semibold mb-1">AI Coach</h2>
            <p className="text-sm text-muted-foreground">
              Intelligent training guidance
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
