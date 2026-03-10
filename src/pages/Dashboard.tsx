import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Settings, LogOut, Sparkles, ArrowRight, Library, Zap, Flame, TrendingUp, Palette } from 'lucide-react';
import { CalendarView } from '@/components/Calendar/CalendarView';
import { MasterSkillList } from '@/components/Dashboard/MasterSkillList';
import { SkillTreeView } from '@/components/Progression/SkillTreeView';
import { ExerciseDetailModal } from '@/components/Exercise/ExerciseDetailModal';
import { useTheme } from '@/components/ThemeSwitcher';
import { parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return 'Night owl';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [workoutDates, setWorkoutDates] = useState<Date[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const { theme, setTheme, themes } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles').select('*').eq('id', user.id).single();
        setProfile(profileData);
        const { data: workoutsData } = await supabase
          .from('workouts').select('date').eq('user_id', user.id);
        if (workoutsData) setWorkoutDates(workoutsData.map(w => parseISO(w.date)));
      }
    };
    fetchData();
  }, [user]);

  const handleSignOut = async () => { await signOut(); navigate('/auth'); };
  const handleDateClick = (date: Date) => navigate('/planner', { state: { selectedDate: date } });

  const streak = profile?.streak_days || 0;
  const totalXp = profile?.total_xp || 0;
  const level = profile?.level || 1;
  const displayName = profile?.display_name || 'Athlete';

  const stats = [
    { label: 'Streak', value: `${streak}d`, icon: Flame, color: 'hsl(var(--cat-core))' },
    { label: 'XP', value: totalXp.toLocaleString(), icon: Zap, color: 'hsl(var(--electric))' },
    { label: 'Level', value: level, icon: TrendingUp, color: 'hsl(var(--cat-pull))' },
  ];

  // Cycle through themes
  const cycleTheme = () => {
    const ids = themes.map(t => t.id);
    const idx = ids.indexOf(theme);
    setTheme(ids[(idx + 1) % ids.length]);
  };

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-border/30">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[hsl(var(--electric))] to-[hsl(var(--cat-pull))] flex items-center justify-center shadow-sm">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-base font-bold tracking-tight leading-none">
                {getGreeting()}, <span className="text-foreground">{displayName}</span>
              </h1>
              <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-[0.2em] mt-0.5">
                I GOT THE POWA
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={cycleTheme} className="text-muted-foreground hover:text-foreground h-10 w-10 rounded-xl">
              <Palette className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/settings')} className="text-muted-foreground hover:text-foreground h-10 w-10 rounded-xl">
              <Settings className="h-4 w-4" />
            </Button>
            {user ? (
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground h-10 w-10 rounded-xl">
                <LogOut className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth')} className="text-xs font-mono uppercase">Sign In</Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="relative overflow-hidden rounded-2xl bg-card border border-border/50 p-4 group hover:border-border transition-all duration-200">
                {/* Top glow line */}
                <div className="absolute top-0 left-3 right-3 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)` }} />
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}20` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
                  </div>
                  <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-[0.15em]">{stat.label}</span>
                </div>
                <div className="text-3xl font-display font-black leading-none tracking-tight">
                  {stat.value}
                </div>
              </div>
            );
          })}
        </div>

        {/* Calendar */}
        <CalendarView workoutDates={workoutDates} onDateClick={handleDateClick} />

        {/* Categories */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-5 rounded-full bg-primary" />
            <h2 className="font-display text-sm font-bold tracking-tight">Categories</h2>
          </div>
          <MasterSkillList />
        </section>

        {/* Progression Paths */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-5 rounded-full bg-[hsl(var(--cat-push))]" />
            <h2 className="font-display text-sm font-bold tracking-tight">Progression Paths</h2>
          </div>
          <SkillTreeView onExerciseClick={async (id) => {
            const { data } = await supabase.from('exercises').select('*').eq('id', id).single();
            if (data) setSelectedExercise(data);
          }} />
        </section>

        {/* Quick Actions */}
        <section className="space-y-2">
          {[
            { label: 'Start Training', desc: 'Stacked 4-day cycle', path: '/train', icon: Flame, color: 'hsl(var(--cat-core))' },
            { label: 'Exercise Library', desc: 'Browse all exercises', path: '/library', icon: Library, color: 'hsl(var(--cat-pull))' },
            { label: 'AI Coach', desc: 'Smart training guidance', path: '/ai-lab', icon: Sparkles, color: 'hsl(var(--electric))' },
          ].map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="group w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:border-border hover:shadow-sm transition-all duration-200 text-left"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border border-border/30" style={{ backgroundColor: `${action.color}15` }}>
                  <Icon className="h-5 w-5" style={{ color: action.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-sm tracking-tight">{action.label}</h3>
                  <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{action.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
              </button>
            );
          })}
        </section>
      </main>

      <ExerciseDetailModal
        exercise={selectedExercise}
        open={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
      />
    </div>
  );
}
