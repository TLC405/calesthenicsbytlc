import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Settings, LogOut, Sparkles, ArrowRight, Library, Zap, Flame, TrendingUp, Palette, FileText, Users,
} from 'lucide-react';
import { ExerciseDetailModal } from '@/components/Exercise/ExerciseDetailModal';
import { useTheme } from '@/components/ThemeSwitcher';
import { format, parseISO } from 'date-fns';
import { NotificationBell } from '@/components/Community/NotificationBell';
import { InstallPowerApp } from '@/components/InstallPowerApp';

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
  const [recent, setRecent] = useState<any[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const { theme, setTheme, themes } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const [{ data: profileData }, { data: workoutsData }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('workouts').select('id, date, notes, entries').eq('user_id', user.id).order('date', { ascending: false }).limit(5),
      ]);
      setProfile(profileData);
      setRecent(workoutsData || []);
    };
    fetchData();
  }, [user]);

  const handleSignOut = async () => { await signOut(); navigate('/dashboard'); };

  const streak = profile?.streak_days || 0;
  const totalXp = profile?.total_xp || 0;
  const level = profile?.level || 1;
  const displayName = profile?.display_name || 'Athlete';
  const weekCount = recent.filter(w => {
    const d = parseISO(w.date);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;

  const cycleTheme = () => {
    const ids = themes.map(t => t.id);
    const idx = ids.indexOf(theme);
    setTheme(ids[(idx + 1) % ids.length]);
  };

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-0">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-border/30">
        <div className="max-w-3xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[hsl(var(--electric))] to-[hsl(var(--cat-pull))] flex items-center justify-center shadow-sm flex-shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-base font-bold tracking-tight leading-none truncate">
                {getGreeting()}, {displayName}
              </h1>
              <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-[0.2em] mt-1">
                I Got The Power
              </p>
            </div>
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <InstallPowerApp compact />
            <NotificationBell userId={user?.id} />
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
              <Button variant="ghost" size="sm" onClick={() => navigate('/library')} className="text-xs font-mono uppercase">Explore</Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-6 space-y-5">
        {/* Hero CTA */}
        <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-[hsl(var(--electric))]/10 blur-3xl pointer-events-none" />
          <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-muted-foreground">Today</p>
          <h2 className="font-display text-2xl font-black tracking-tight mt-2 leading-tight">
            Build today's <span className="gradient-text">workout</span>.
          </h2>
          <p className="text-xs text-muted-foreground mt-2 max-w-md leading-relaxed">
            Stack warm-up, work, cool-down, and compression in one clean sheet.
          </p>
          <div className="flex gap-2 mt-5">
            <Button
              onClick={() => navigate('/planner')}
              className="h-11 px-5 rounded-xl font-display font-bold uppercase tracking-wider text-xs gap-2"
            >
              <FileText className="w-4 h-4" />
              Open Builder
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/ai-lab')}
              className="h-11 px-4 rounded-xl border-border/50 font-mono uppercase tracking-wider text-[10px] gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Ask Coach
            </Button>
          </div>
        </section>

        {/* Stat strip */}
        <section className="grid grid-cols-3 gap-3">
          {[
            { label: 'Streak', value: `${streak}d`, icon: Flame, color: 'hsl(var(--cat-core))' },
            { label: 'XP', value: totalXp.toLocaleString(), icon: Zap, color: 'hsl(var(--electric))' },
            { label: 'This Week', value: `${weekCount}`, icon: TrendingUp, color: 'hsl(var(--cat-pull))' },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="relative overflow-hidden rounded-2xl bg-card border border-border/50 p-4">
                <div className="absolute top-0 left-3 right-3 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)` }} />
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}20` }}>
                    <Icon className="w-3 h-3" style={{ color: stat.color }} />
                  </div>
                  <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-[0.15em]">{stat.label}</span>
                </div>
                <div className="text-2xl font-display font-black leading-none tracking-tight font-stats">
                  {stat.value}
                </div>
              </div>
            );
          })}
        </section>

        {/* Recent activity */}
        <section>
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-1.5 h-5 rounded-full bg-[hsl(var(--cat-pull))]" />
            <h2 className="font-display text-sm font-bold tracking-tight">Recent</h2>
            <span className="text-[9px] font-mono text-muted-foreground ml-auto">Lvl {level}</span>
          </div>
          {recent.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/50 p-6 text-center">
              <p className="text-xs text-muted-foreground">No workouts yet — build your first one.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/50 bg-card divide-y divide-border/40 overflow-hidden">
              {recent.map(w => {
                const entries = Array.isArray(w.entries) ? w.entries : [];
                return (
                  <button
                    key={w.id}
                    onClick={() => navigate('/planner')}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/30 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-xl bg-accent/50 border border-border/30 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">
                        {w.notes?.split('\n')[0] || 'Workout'}
                      </p>
                      <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mt-0.5">
                        {format(parseISO(w.date), 'MMM d')} · {entries.length} exercises
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Quick links — every page reachable from home */}
        <section className="grid grid-cols-2 gap-3">
          {[
            { label: 'Build', desc: 'Workout builder', path: '/planner', icon: FileText, color: 'hsl(var(--cat-skills))' },
            { label: 'AI Coach', desc: 'Plan with AI', path: '/ai-lab', icon: Sparkles, color: 'hsl(var(--electric))' },
            { label: 'Library', desc: 'Browse exercises', path: '/library', icon: Library, color: 'hsl(var(--cat-pull))' },
            { label: 'Train', desc: 'Start a session', path: '/train', icon: Flame, color: 'hsl(var(--cat-core))' },
            { label: 'Power Circle', desc: 'Post, like & connect', path: '/community', icon: Users, color: 'hsl(var(--cat-legs))' },
            { label: 'Anatomy', desc: 'Muscle atlas', path: '/anatomy', icon: TrendingUp, color: 'hsl(var(--cat-push))' },
            { label: 'Settings', desc: 'Profile & admin', path: '/settings', icon: Settings, color: 'hsl(var(--cat-core))' },
          ].map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="group flex flex-col gap-3 p-4 rounded-2xl bg-card border border-border/50 hover:border-border hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 text-left"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-border/30" style={{ backgroundColor: `${action.color}15` }}>
                  <Icon className="h-4 w-4" style={{ color: action.color }} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm tracking-tight">{action.label}</h3>
                  <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{action.desc}</p>
                </div>
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
