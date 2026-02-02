import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Library, Settings, LogOut, Sparkles, ArrowRight } from 'lucide-react';
import { WeeklyCalendar } from '@/components/Dashboard/WeeklyCalendar';
import { QuickStats } from '@/components/Dashboard/QuickStats';
import { TodayFocus } from '@/components/Dashboard/TodayFocus';
import { XPBadge } from '@/components/Gamification/XPBadge';
import { format, startOfWeek, endOfWeek, parseISO, isToday } from 'date-fns';
import logo from '@/assets/logo.png';
import '@/styles/neumorph.css';
const motivationalQuotes = ["Every rep brings you closer to mastery.", "Consistency beats intensity.", "Your body can stand almost anything. It's your mind you have to convince.", "Progress, not perfection.", "The only bad workout is the one that didn't happen."];
export default function Dashboard() {
  const {
    user,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [workoutDates, setWorkoutDates] = useState<Date[]>([]);
  const [todayWorkout, setTodayWorkout] = useState<any>(null);
  const [workoutsThisWeek, setWorkoutsThisWeek] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [quote] = useState(() => motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        // Fetch profile
        const {
          data: profileData
        } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(profileData);

        // Fetch workouts for calendar
        const weekStart = startOfWeek(new Date(), {
          weekStartsOn: 1
        });
        const weekEnd = endOfWeek(new Date(), {
          weekStartsOn: 1
        });
        const {
          data: workoutsData
        } = await supabase.from('workouts').select('date').eq('user_id', user.id).gte('date', format(weekStart, 'yyyy-MM-dd')).lte('date', format(weekEnd, 'yyyy-MM-dd'));
        if (workoutsData) {
          setWorkoutDates(workoutsData.map(w => parseISO(w.date)));
          setWorkoutsThisWeek(workoutsData.length);

          // Check for today's workout
          const today = workoutsData.find(w => isToday(parseISO(w.date)));
          if (today) {
            const {
              data: fullWorkout
            } = await supabase.from('workouts').select('*').eq('user_id', user.id).eq('date', format(new Date(), 'yyyy-MM-dd')).single();
            setTodayWorkout(fullWorkout);
          }
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
    setSelectedDate(date);
    navigate('/planner', {
      state: {
        selectedDate: date
      }
    });
  };
  return <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Premium Header */}
        <header className="premium-card p-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-gold/30 to-primary/30 rounded-xl blur-lg" />
                <img alt="TLC's Workout" className="relative w-14 h-14 rounded-xl border-4 border-destructive object-fill" src="/lovable-uploads/7a4a3a95-2e51-4067-b126-c096a96fc31c.png" />
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
            <div className="flex items-center gap-3">
              {profile && <XPBadge xp={profile.total_xp || 0} level={profile.level || 1} />}
              {user ? <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground">
                  <LogOut className="h-4 w-4" />
                </Button> : <Button variant="ghost" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>}
            </div>
          </div>

          {/* Motivational Quote */}
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground italic text-center">
              "{quote}"
            </p>
          </div>
        </header>

        {/* Quick Stats */}
        <QuickStats streak={profile?.streak_days || 0} totalXp={profile?.total_xp || 0} level={profile?.level || 1} workoutsThisWeek={workoutsThisWeek} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Calendar */}
          <WeeklyCalendar workoutDates={workoutDates} onDateClick={handleDateClick} selectedDate={selectedDate} />

          {/* Today's Focus */}
          <TodayFocus hasWorkout={!!todayWorkout} exerciseCount={todayWorkout?.entries ? Object.keys(todayWorkout.entries).length : 0} onStartWorkout={() => navigate('/planner')} onPlanWorkout={() => navigate('/planner')} />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={() => navigate('/library')} className="premium-card p-6 text-left group hover:shadow-xl transition-all duration-300 animate-slide-up" style={{
          animationDelay: '100ms'
        }}>
            <div className="flex items-center justify-between mb-4">
              <Library className="h-8 w-8 text-primary" />
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
            <h2 className="font-display text-xl font-semibold mb-1">Exercise Library</h2>
            <p className="text-sm text-muted-foreground">
              Browse 120+ premium exercises
            </p>
          </button>

          <button onClick={() => navigate('/ai-lab')} className="premium-card p-6 text-left group hover:shadow-xl transition-all duration-300 animate-slide-up" style={{
          animationDelay: '200ms'
        }}>
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

          <button onClick={() => navigate('/settings')} className="premium-card p-6 text-left group hover:shadow-xl transition-all duration-300 animate-slide-up" style={{
          animationDelay: '300ms'
        }}>
            <div className="flex items-center justify-between mb-4">
              <Settings className="h-8 w-8 text-muted-foreground" />
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
            <h2 className="font-display text-xl font-semibold mb-1">Settings</h2>
            <p className="text-sm text-muted-foreground">
              Manage your profile
            </p>
          </button>
        </div>
      </div>
    </div>;
}