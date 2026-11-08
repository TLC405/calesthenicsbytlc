import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronRight, Plus, BookOpen, Dumbbell, CalendarDays } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface RecentWorkout {
  id: string;
  date: string | null;
  notes: string | null;
  entries: unknown;
}

const focusAreas = [
  { label: 'Planche', search: 'planche' },
  { label: 'Handstands', search: 'handstand' },
  { label: 'Grip', search: 'grip' },
  { label: 'Human flag', search: 'flag' },
  { label: 'Pull & levers', search: 'lever' },
  { label: 'Rings', search: 'rings' },
  { label: 'Legs', search: 'squat' },
  { label: 'Mobility', search: 'mobility' },
] as const;

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recent, setRecent] = useState<RecentWorkout[]>([]);

  useEffect(() => {
    if (!user) { setRecent([]); return; }
    let active = true;
    supabase.from('workouts')
      .select('id, date, notes, entries')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(3)
      .then(({ data }) => { if (active) setRecent((data || []) as RecentWorkout[]); });
    return () => { active = false; };
  }, [user]);

  const browse = (search: string) => navigate('/library', { state: { search } });

  return (
    <div className="power-shell power-quiet-home">
      <header className="power-topbar">
        <div className="power-container power-topinner">
          <div className="power-brand">
            <img className="w-9 h-9 shrink-0 object-contain" src="/lovable-uploads/7a4a3a95-2e51-4067-b126-c096a96fc31c.png" alt="Power" />
            <div>
              <div className="power-brand-label">I GOT THE POWER</div>
              <div className="power-smallprint">Training, without the noise.</div>
            </div>
          </div>
          <Button variant="ghost" className="power-icon-button" onClick={() => navigate('/planner')} aria-label="New workout">
            <Plus size={21} />
          </Button>
        </div>
      </header>

      <main className="power-container power-home-content">
        <section className="power-home-hero" aria-labelledby="power-home-title">
          <p className="power-kicker">YOUR TRAINING STUDIO</p>
          <h1 id="power-home-title">Train for <em>what's next.</em></h1>
          <p className="power-home-subtitle">Find the right variation. Build a workout. Get stronger.</p>
          <div className="power-home-actions">
            <Button className="power-home-primary" onClick={() => navigate('/planner')}>
              <Plus size={19} /> Build workout <ArrowRight size={17} className="ml-auto" />
            </Button>
            <Button variant="outline" className="power-home-secondary" onClick={() => navigate('/library')}>
              <BookOpen size={18} /> Browse exercises
            </Button>
          </div>
        </section>

        <section className="power-home-section" aria-label="Find exercises by training goal">
          <div className="power-home-heading">
            <div>
              <p className="power-kicker">EXPLORE</p>
              <h2>Choose your focus</h2>
            </div>
            <Button variant="ghost" className="power-home-text-action" onClick={() => navigate('/library')}>All exercises <ChevronRight size={16}/></Button>
          </div>
          <div className="power-focus-list">
            {focusAreas.map((item) => (
              <button key={item.label} type="button" className="power-focus-item" onClick={() => browse(item.search)}>
                <span>{item.label}</span>
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            ))}
          </div>
        </section>

        <section className="power-home-section" aria-label="Recent sessions">
          <div className="power-home-heading">
            <div>
              <p className="power-kicker">HISTORY</p>
              <h2>Recent workouts</h2>
            </div>
          </div>
          {recent.length === 0 ? (
            <div className="power-home-empty">
              <Dumbbell size={21} aria-hidden="true" />
              <p>Your completed sessions will appear here.</p>
              <Button variant="link" onClick={() => navigate('/planner')}>Create a workout <ArrowRight size={14}/></Button>
            </div>
          ) : (
            <div className="power-home-history">
              {recent.map((workout) => {
                const entries = Array.isArray(workout.entries) ? workout.entries : [];
                const name = workout.notes?.split('\n')[0]?.trim() || 'Workout';
                const dateLabel = workout.date ? format(parseISO(workout.date), 'MMM d') : 'Date unavailable';
                return (
                  <button key={workout.id} className="power-history-row" type="button" onClick={() => navigate('/planner')}>
                    <CalendarDays size={18} aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate">{name}</strong>
                      <small>{entries.length} exercises</small>
                    </span>
                    <span className="power-history-date">{dateLabel}</span>
                    <ChevronRight size={16} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
