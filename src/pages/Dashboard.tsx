import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { PowerAthleteArt } from '@/components/Brand/PowerAthleteArt';
import { PowerDisciplineIcon, type PowerDiscipline } from '@/components/Brand/PowerDisciplineIcon';
import { readGuestWorkouts } from '@/lib/offlineWorkouts';
import {
  Settings, LogOut, Sparkles, ArrowRight, ArrowUpRight, Library, Zap, Flame, TrendingUp,
  Palette, FileText, CalendarDays, GitBranch, ChevronDown, ChevronUp, Users, Crown, Target,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

type Profile = Pick<Database['public']['Tables']['profiles']['Row'], 'display_name' | 'streak_days' | 'total_xp' | 'level'>;
type RecentWorkout = { id: string; date: string; notes: string | null; entries: unknown };
const disciplines: { label: string; search: string; icon: PowerDiscipline; category?: string; studio?: string }[] = [
  { label: 'Planche', search: 'planche', icon: 'planche', studio: 'planche' },
  { label: 'Handstand', search: 'handstand', icon: 'handstand', studio: 'handstand' },
  { label: 'Rings', search: '', category: 'Rings', icon: 'rings', studio: 'rings' },
  { label: 'Muscle-up', search: 'muscle-up', icon: 'muscle-up', studio: 'ring-muscle-up' },
  { label: 'Mobility', search: '', category: 'Mobility', icon: 'mobility' },
  { label: 'Core', search: '', category: 'Core', icon: 'core' },
];
function greeting() {
  const hour = new Date().getHours();
  return hour < 6 ? 'Your next chapter starts here' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recent, setRecent] = useState<RecentWorkout[]>([]);
  const [guestWorkouts, setGuestWorkouts] = useState(readGuestWorkouts);
  const [sevenDayWorkouts, setSevenDayWorkouts] = useState(0);
  const [statsLoading, setStatsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      const local = readGuestWorkouts();
      setGuestWorkouts(local);
      setProfile(null);
      setRecent(local.slice(0, 5).map(workout => ({ ...workout, id: `local-${workout.date}` })));
      setLoadError(false);
      setStatsLoading(false);
      return;
    }
    let active = true;
    setStatsLoading(true);
    setLoadError(false);
    const load = async () => {
      try {
        const weekStart = format(new Date(Date.now() - 6 * 86400000), 'yyyy-MM-dd');
        const [profileResult, workoutsResult, countResult] = await Promise.all([
          supabase.from('profiles').select('display_name, streak_days, total_xp, level').eq('id', user.id).single(),
          supabase.from('workouts').select('id, date, notes, entries').eq('user_id', user.id).order('date', { ascending: false }).limit(5),
          supabase.from('workouts').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('date', weekStart),
        ]);
        if (active) {
          setProfile(profileResult.data);
          setRecent(workoutsResult.data || []);
          setSevenDayWorkouts(countResult.count ?? 0);
          setLoadError(Boolean(profileResult.error || workoutsResult.error || countResult.error));
        }
      } catch {
        if (active) { setLoadError(true); setProfile(null); setRecent([]); }
      } finally {
        if (active) setStatsLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [user, authLoading, reload]);

  const weekStart = format(new Date(Date.now() - 6 * 86400000), 'yyyy-MM-dd');
  const guestWeekCount = guestWorkouts.filter(workout => workout.date >= weekStart).length;
  const guestExerciseCount = guestWorkouts.reduce((sum, workout) => sum + workout.entries.length, 0);
  const name = profile?.display_name;
  const unavailable = authLoading || statsLoading || loadError;
  const metrics = user ? [
    { label: 'Day streak', value: `${profile?.streak_days ?? 0}`, unit: 'days', icon: Flame },
    { label: 'Total XP', value: Number(profile?.total_xp ?? 0).toLocaleString(), unit: 'earned', icon: Zap },
    { label: 'Last 7 days', value: `${sevenDayWorkouts}`, unit: 'sessions', icon: TrendingUp },
  ] : [
    { label: 'Training days', value: `${guestWorkouts.length}`, unit: 'logged', icon: CalendarDays },
    { label: 'Exercises', value: `${guestExerciseCount}`, unit: 'logged', icon: Target },
    { label: 'Last 7 days', value: `${guestWeekCount}`, unit: 'days trained', icon: TrendingUp },
  ];


  return <div className="power-shell">
    <a href="#power-main" className="power-skip-link">Skip to training</a>
    <header className="power-topbar">
      <div className="power-container power-topinner">
        <Link to="/" className="power-brand" aria-label="POWER home">
          <Crown className="power-brand-crown" size={27} strokeWidth={1.4} />
          <span className="power-brand-wordmark"><small>I GOT THE</small><strong>POWER<span>.</span></strong></span>
          <span className="power-brand-line" /><span className="power-brand-label">BY TLC</span>
        </Link>
        <Link className="power-icon-button" to="/more" aria-label="More tools"><Settings size={20}/></Link>
      </div>
    </header>
    <main id="power-main" className="power-container">
      <div className="power-welcome"><p>{greeting()}{name ? `, ${name}` : ''}<span className="power-welcome-dot">.</span></p><span className="power-smallprint">YOUR BODY. YOUR POSSIBILITIES.</span></div>
      <section className="power-hero" aria-labelledby="power-dashboard-title">
        <PowerAthleteArt />
        <div className="power-hero-content">
          <p className="power-kicker">The calisthenics collection</p>
          <h1 id="power-dashboard-title" className="power-hero-title"><span>Build</span><span>Your</span><span>Power<span className="power-title-stop">.</span></span></h1>
          <p className="power-hero-copy"><span className="power-speed-mark" aria-hidden="true" />Train <i aria-hidden="true">/</i> Master <i aria-hidden="true">/</i> Evolve</p>
          <p className="power-hero-description">Strength is a skill. Make it yours.</p>
          <div className="power-hero-actions">
            <Link className="power-button power-button-primary" to="/skills">Choose a skill <ArrowUpRight size={18} /></Link>
            <Link className="power-button power-button-outline" to="/build">Build workout <ArrowRight size={17} /></Link>
          </div>
        </div>
        <span className="power-hero-side-label" aria-hidden="true">STRENGTH / CONTROL / MASTERY</span>
        <span className="power-hero-corner power-hero-corner-top" aria-hidden="true" /><span className="power-hero-corner power-hero-corner-bottom" aria-hidden="true" />
      </section>
      <section className="power-rail" aria-label="Explore calisthenics disciplines">
        <div className="power-rail-caption"><span>Find your focus</span><span>Explore the movements <ArrowUpRight size={12} /></span></div>
        <div className="power-rail-grid">{disciplines.map(({ label, search, category, icon, studio }) => <Link className="power-skill" key={label} to={studio ? `/skills/${studio}` : "/library"} state={{ search, category }} title={`Browse ${label} exercises`}>
          <span className="power-skill-icon"><PowerDisciplineIcon discipline={icon} /></span><span className="power-skill-name">{label}</span><span className="power-skill-underline" aria-hidden="true" />
        </Link>)}</div>
      </section>
      <div className="power-main">
        <div className="power-section-heading"><h2>Your training room</h2><span className="power-section-meta">Make your next move</span></div>
        <section className="power-feature-grid" aria-label="Main features">
          <Link className="power-feature" to="/build"><span className="power-feature-index">01 / TRAIN</span><CalendarDays className="power-feature-icon" size={27} strokeWidth={1.4} /><span className="power-feature-title">Today's focus</span><span className="power-feature-desc">Step into your session</span><ArrowUpRight className="power-feature-arrow" size={18} /></Link>
          <Link className="power-feature" to="/skills"><span className="power-feature-index">02 / MASTER</span><GitBranch className="power-feature-icon" size={27} strokeWidth={1.4}/><span className="power-feature-title">Skills</span><span className="power-feature-desc">Choose your progression</span><ArrowRight className="power-feature-arrow" size={18}/></Link>
          <Link className="power-feature" to="/ai-lab"><span className="power-feature-index">03 / EVOLVE</span><Sparkles className="power-feature-icon" size={27} strokeWidth={1.4} /><span className="power-feature-title">AI coach</span><span className="power-feature-desc">Find your next breakthrough</span><ArrowUpRight className="power-feature-arrow" size={18} /></Link>
          <Link className="power-feature" to="/community"><span className="power-feature-index">04 / CONNECT</span><Users className="power-feature-icon" size={27} strokeWidth={1.4} /><span className="power-feature-title">Power Circle</span><span className="power-feature-desc">Progress is better together</span><ArrowUpRight className="power-feature-arrow" size={18} /></Link>
        </section>

        <div className="power-training-grid">
          <section className="power-progress-section" aria-labelledby="power-progress-title">
            <div className="power-section-heading"><h2 id="power-progress-title">Your progress</h2><span className="power-section-meta">{user ? profile && !unavailable ? `LEVEL ${profile.level ?? 1}` : 'YOUR ACCOUNT' : 'ON THIS DEVICE'}</span></div>
            <div className="power-metrics" aria-label="Your recorded performance" aria-busy={unavailable}>{metrics.map(({ label, value, unit, icon: Icon }) => <div className="power-metric" key={label}><div className="power-metric-top"><Icon size={15} /><span>{label}</span></div><div className="power-metric-number">{unavailable ? '—' : value}<span>{unit}</span></div></div>)}</div>
            <p className="power-progress-note">{loadError ? 'Progress could not be loaded.' : user ? 'Built one session at a time.' : 'Your completed workouts stay on this device.'}{loadError && <button onClick={() => setReload(value => value + 1)}>Try again</button>}</p>
          </section>
          <section aria-labelledby="power-recent-title">
            <div className="power-section-heading"><h2 id="power-recent-title">Recent training</h2><Link to="/library" className="power-text-link"><Library size={13} /> Library <ArrowUpRight size={13} /></Link></div>
            {statsLoading || authLoading ? <div className="power-training-empty" role="status"><p>Loading your training…</p></div> : recent.length ? <div className="power-recent-list">{recent.map(workout => <Link key={workout.id} className="power-recent-row" to="/planner"><FileText size={20} /><span className="flex-1 min-w-0"><span className="block text-sm font-bold truncate">{workout.notes?.split('\n')[0] || 'Workout'}</span><span className="block power-smallprint">{workout.date ? format(parseISO(workout.date), 'MMM d') : 'Date unavailable'} · {Array.isArray(workout.entries) ? workout.entries.length : 0} exercises</span></span><ArrowUpRight size={16} /></Link>)}</div> : <div className="power-training-empty"><span className="power-empty-icon"><PowerDisciplineIcon discipline="rings" width={29} height={29} /></span><div><h3>{loadError ? 'Training is taking a moment' : 'Your story starts with a session.'}</h3><p>{loadError ? 'Try loading your progress again.' : 'Build a workout. Make your first mark.'}</p><Link to="/planner" className="power-text-link">Open workout builder <ArrowRight size={14} /></Link></div></div>}
          </section>
        </div>
        <footer className="power-footer"><span className="power-footer-tlc">TLC<span>TRUTH / LOVE / COMMUNITY</span></span><p>Built with purpose. <span>Powered by TLC.</span></p></footer>
      </div>
    </main>
  </div>;
}
