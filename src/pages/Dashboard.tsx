import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Settings, LogOut, Sparkles, ArrowRight, Library, Zap, TrendingUp, Calendar, Flame } from 'lucide-react';
import { CalendarView } from '@/components/Calendar/CalendarView';
import { MasterSkillList } from '@/components/Dashboard/MasterSkillList';
import { SkillTreeView } from '@/components/Progression/SkillTreeView';
import { ExerciseDetailModal } from '@/components/Exercise/ExerciseDetailModal';
import { parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

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

  const streak = profile?.streak_days || 0;
  const totalXp = profile?.total_xp || 0;
  const level = profile?.level || 1;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b-2 border-foreground bg-background">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-2 border-foreground bg-[hsl(270,76%,55%)] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
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

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-5">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Streak', value: `${streak}d`, color: 'bg-[hsl(25,95%,53%)]', icon: '🔥' },
            { label: 'XP', value: totalXp.toLocaleString(), color: 'bg-[hsl(270,76%,55%)]', icon: '⚡' },
            { label: 'Level', value: level, color: 'bg-[hsl(217,91%,60%)]', icon: '🎯' },
          ].map(stat => (
            <div key={stat.label} className="border-2 border-foreground p-3 relative overflow-hidden">
              <div className={cn("absolute top-0 left-0 w-full h-1", stat.color)} />
              <div className="text-lg font-display font-black leading-none mt-1">
                {stat.icon} {stat.value}
              </div>
              <div className="text-[8px] font-mono text-muted-foreground uppercase tracking-[0.2em] mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Calendar */}
        <CalendarView workoutDates={workoutDates} onDateClick={handleDateClick} />

        {/* Categories */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-4 bg-[hsl(270,76%,55%)]" />
            <h2 className="font-display text-xs font-bold uppercase tracking-[0.2em]">Categories</h2>
          </div>
          <MasterSkillList />
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/library')}
            className="group flex items-center gap-4 p-4 border-2 border-foreground bg-card hover:bg-[hsl(217,91%,60%)] hover:text-white transition-colors duration-150 text-left"
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
            className="group flex items-center gap-4 p-4 border-2 border-foreground bg-card hover:bg-[hsl(270,76%,55%)] hover:text-white transition-colors duration-150 text-left"
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
