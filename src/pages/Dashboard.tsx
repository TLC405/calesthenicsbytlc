import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from '@/components/ThemeSwitcher';
import { PowerAthleteArt } from '@/components/Brand/PowerAthleteArt';
import { SkillTreeView } from '@/components/Progression/SkillTreeView';
import {
  Settings, LogOut, Sparkles, ArrowRight, Library, Zap, Flame, TrendingUp,
  Palette, FileText, CircleDot, Hand, Dumbbell, Move, Shield, CalendarDays,
  GitBranch, ChevronDown, ChevronUp
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { NotificationBell } from '@/components/NotificationBell';
import { MessageCircle } from 'lucide-react';

const disciplines = [
  { label: 'Rings', search: 'rings', icon: CircleDot },
  { label: 'Handstand', search: 'handstand', icon: Hand },
  { label: 'Muscle-up', search: 'muscle-up', icon: Dumbbell },
  { label: 'Mobility', search: 'mobility', icon: Move },
  { label: 'Core', search: 'core', icon: Shield },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 6) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const [treeOpen, setTreeOpen] = useState(false);
  const { theme, setTheme, themes } = useTheme();

  useEffect(() => {
    if (!user) return;
    let active = true;
    const load = async () => {
      const [{ data: profileData }, { data: workoutsData }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('workouts').select('id, date, notes, entries').eq('user_id', user.id).order('date', { ascending: false }).limit(5),
      ]);
      if (active) { setProfile(profileData); setRecent(workoutsData || []); }
    };
    load();
    return () => { active = false; };
  }, [user]);

  const streak = profile?.streak_days ?? 0;
  const xp = profile?.total_xp ?? 0;
  const level = profile?.level ?? 1;
  const name = profile?.display_name || 'Athlete';
  const weekCount = recent.filter(w => {
    if (!w.date) return false;
    const diff = (Date.now() - parseISO(w.date).getTime()) / 86400000;
    return diff >= 0 && diff < 7;
  }).length;

  const cycleTheme = () => {
    const ids = themes.map(t => t.id);
    setTheme(ids[(ids.indexOf(theme) + 1) % ids.length]);
  };
  const openLibrary = (search: string) => navigate('/library', { state: { search } });

  return (
    <div className="power-shell">
      <header className="power-topbar">
        <div className="power-container power-topinner">
          <div className="power-brand">
            <span className="power-mark">TLC</span>
            <span className="power-brand-line" />
            <div>
              <div className="power-brand-label">Performance system</div>
              <div className="power-smallprint" style={{ fontSize: 9 }}>{greeting()}, {name}</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="power-icon-button" aria-label="Change color theme" title="Change theme" onClick={cycleTheme}><Palette size={20} /></button>
            <NotificationBell />
            <button className="power-icon-button" aria-label="Community" onClick={() => navigate('/community')}><MessageCircle size={20} /></button>
            <button className="power-icon-button" aria-label="Settings" onClick={() => navigate('/settings')}><Settings size={20} /></button>
            {user ? (
              <button className="power-icon-button" aria-label="Sign out" onClick={async () => { await signOut(); navigate('/auth'); }}><LogOut size={20} /></button>
            ) : (
              <button className="power-button power-button-outline" onClick={() => navigate('/auth')}>Sign in</button>
            )}
          </div>
        </div>
      </header>

      <main className="power-container">
        <section className="power-hero" aria-labelledby="power-dashboard-title">
          <PowerAthleteArt />
          <div className="power-hero-content">
            <p className="power-kicker">Calisthenics by TLC</p>
            <h1 id="power-dashboard-title" className="power-hero-title"><span>Build</span><span>Your</span><span>Power</span></h1>
            <p className="power-hero-copy">Train <span aria-hidden="true">·</span> Master <span aria-hidden="true">·</span> Evolve</p>
            <div className="power-hero-actions">
              <button className="power-button power-button-primary" onClick={() => navigate('/planner')}>
                Build workout <ArrowRight size={18} />
              </button>
              <button className="power-button power-button-outline" onClick={() => navigate('/train')}>
                Start training <Flame size={16} />
              </button>
            </div>
          </div>
        </section>

        <section className="power-rail" aria-label="Explore calisthenics disciplines">
          <p className="power-rail-label">Choose your discipline</p>
          <div className="power-rail-grid">
            {disciplines.map(({ label, search, icon: Icon }) => (
              <button className="power-skill" key={label} onClick={() => openLibrary(search)} title={'Browse ' + label + ' exercises'}>
                <span className="power-skill-icon"><Icon size={30} strokeWidth={1.6} /></span>
                <span className="power-skill-name">{label}</span>
                <span className="power-skill-underline" aria-hidden="true" />
              </button>
            ))}
          </div>
        </section>

        <div className="power-main">
          <div className="power-section-heading">
            <h2>Your performance</h2>
            <span className="power-section-meta">Level {level}</span>
          </div>
          <section className="power-metrics" aria-label="Your actual performance stats">
            {[
              { label: 'Streak', value: String(streak) + 'd', icon: Flame },
              { label: 'Total XP', value: Number(xp).toLocaleString(), icon: Zap },
              { label: 'Last 7 days', value: String(weekCount), icon: TrendingUp },
            ].map(({ label, value, icon: Icon }) => (
              <div className="power-metric" key={label}>
                <div className="power-metric-top"><Icon size={15} color="#E9BC68" /><span>{label}</span></div>
                <div className="power-metric-number">{value}</div>
              </div>
            ))}
          </section>

          <div className="power-section-heading">
            <h2>Power controls</h2>
            <span className="power-section-meta">Tap to explore</span>
          </div>
          <section className="power-feature-grid" aria-label="Main features">
            <button className="power-feature" onClick={() => navigate('/train')}>
              <CalendarDays className="power-feature-icon" size={31} strokeWidth={1.6} />
              <span className="power-feature-title">Today's focus</span>
              <span className="power-feature-desc">Open training session</span>
              <ArrowRight className="power-feature-arrow" size={17} />
            </button>
            <button className="power-feature" onClick={() => setTreeOpen(v => !v)} aria-expanded={treeOpen} aria-controls="power-skill-tree">
              <GitBranch className="power-feature-icon" size={31} strokeWidth={1.6} />
              <span className="power-feature-title">Skill tree</span>
              <span className="power-feature-desc">Real progression chains</span>
              {treeOpen ? <ChevronUp className="power-feature-arrow" size={17} /> : <ChevronDown className="power-feature-arrow" size={17} />}
            </button>
            <button className="power-feature" onClick={() => navigate('/ai-lab')}>
              <Sparkles className="power-feature-icon" size={31} strokeWidth={1.6} />
              <span className="power-feature-title">AI coach</span>
              <span className="power-feature-desc">Build with guidance</span>
              <ArrowRight className="power-feature-arrow" size={17} />
            </button>
          </section>

          {treeOpen && (
            <section id="power-skill-tree" className="power-tree-panel" aria-label="Skill progression tree">
              <div className="power-section-heading">
                <h2>Skill progressions</h2>
                <button className="power-icon-button ml-auto" onClick={() => setTreeOpen(false)} aria-label="Close skill tree"><ChevronUp size={18}/></button>
              </div>
              <SkillTreeView onExerciseClick={() => navigate('/library')} />
            </section>
          )}

          <div className="power-section-heading">
            <h2>Recent training</h2>
            <button onClick={() => navigate('/library')} className="power-smallprint ml-auto flex items-center gap-1 hover:underline">
              <Library size={13}/> Library <ArrowRight size={13}/>
            </button>
          </div>
          {recent.length ? (
            <div className="power-recent-list">
              {recent.map(workout => {
                const entries = Array.isArray(workout.entries) ? workout.entries : [];
                return (
                  <button key={workout.id} className="power-recent-row" onClick={() => navigate('/planner')}>
                    <FileText size={22} color="#E9BC68"/>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-bold truncate">{workout.notes?.split('\n')[0] || 'Workout'}</span>
                      <span className="block power-smallprint">{workout.date ? format(parseISO(workout.date), 'MMM d') : 'Date unavailable'} · {entries.length} exercises</span>
                    </span>
                    <ArrowRight size={16} color="#E9BC68"/>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="power-tree-panel">
              <p className="power-smallprint mb-3">Your completed training sessions will appear here. Build your first session when you're ready.</p>
              <button className="power-button power-button-outline" onClick={() => navigate('/planner')}><FileText size={15}/> Open builder</button>
            </div>
          )}
          <div className="flex justify-between items-center mt-9 mb-5">
            <p className="power-smallprint uppercase" style={{ letterSpacing: '.16em' }}>Truth · Love · Community</p>
            <p className="power-smallprint">Powered by TLC</p>
          </div>
        </div>
      </main>
    </div>
  );
}
