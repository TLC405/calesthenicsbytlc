import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Zap, ChevronRight, Play, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NonNegotiablesBar } from '@/components/Training/NonNegotiablesBar';
import { IntegrityBlock } from '@/components/Training/IntegrityBlock';
import { ExerciseDetailModal } from '@/components/Exercise/ExerciseDetailModal';
import { cn } from '@/lib/utils';

interface TrainingDay {
  id: string;
  day_key: string;
  label: string;
  title: string;
  emphasis: string;
  exercise_categories: string[];
  integrity_block_slugs: string[];
  sort_order: number;
}

interface IntegrityData {
  slug: string;
  title: string;
  duration: string;
  drills: string[];
  key_cues: string[];
}

interface Exercise {
  id: string;
  name: string;
  slug: string;
  category: string;
  primary_muscles: string[];
  secondary_muscles: string[];
  equipment: string[];
  cues: any;
  difficulty_level?: number | null;
  youtube_url?: string | null;
  instagram_url?: string | null;
  image_url?: string | null;
  chain_group?: string | null;
  chain_order?: number | null;
  sets_reps?: string | null;
  description?: string | null;
}

const dayColors: Record<string, string> = {
  A: 'hsl(var(--cat-push))',
  B: 'hsl(var(--cat-pull))',
  C: 'hsl(var(--cat-skills))',
  D: 'hsl(var(--cat-legs))',
  E: 'hsl(var(--cat-core))',
};

const dayEmojis: Record<string, string> = {
  A: '🔶', B: '🔵', C: '🟣', D: '🟢', E: '🟡'
};

export default function Train() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [days, setDays] = useState<TrainingDay[]>([]);
  const [activeDay, setActiveDay] = useState<string>('A');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [integrityBlocks, setIntegrityBlocks] = useState<IntegrityData[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    loadData();
  }, [user]);

  useEffect(() => {
    if (days.length > 0) loadDayExercises();
  }, [activeDay, days]);

  const loadData = async () => {
    const [{ data: daysData }, { data: blocksData }] = await Promise.all([
      supabase.from('training_days').select('*').order('sort_order'),
      supabase.from('integrity_blocks').select('*'),
    ]);
    if (daysData) setDays(daysData as TrainingDay[]);
    if (blocksData) setIntegrityBlocks(blocksData as IntegrityData[]);

    // Determine active day based on last workout
    const { data: lastWorkout } = await supabase
      .from('workouts')
      .select('entries')
      .eq('user_id', user!.id)
      .order('date', { ascending: false })
      .limit(1);

    // Simple rotation - default to A
    setLoading(false);
  };

  const loadDayExercises = async () => {
    const day = days.find(d => d.day_key === activeDay);
    if (!day) return;

    const { data } = await supabase
      .from('exercises')
      .select('*')
      .in('category', day.exercise_categories)
      .order('difficulty_level')
      .order('name');

    if (data) setExercises(data as unknown as Exercise[]);
  };

  const currentDay = days.find(d => d.day_key === activeDay);
  const dayIntegrity = integrityBlocks.filter(b =>
    currentDay?.integrity_block_slugs?.includes(b.slug)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground font-mono text-xs uppercase tracking-widest">Loading cycle...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b-2 border-foreground bg-background">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-2 border-foreground bg-[hsl(var(--cat-skills))] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-display text-sm font-bold uppercase tracking-wider leading-none">Stacked Cycle</h1>
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.2em]">4-Day Auto-Rotating</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-5">
        {/* Day Selector */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {days.map(day => (
            <button
              key={day.day_key}
              onClick={() => setActiveDay(day.day_key)}
              className={cn(
                "flex-1 min-w-[4rem] border-2 p-2.5 text-center transition-all duration-150 relative overflow-hidden",
                activeDay === day.day_key
                  ? "border-foreground bg-foreground text-background"
                  : "border-foreground/30 hover:border-foreground"
              )}
            >
              {activeDay === day.day_key && (
                <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: dayColors[day.day_key] }} />
              )}
              <div className="text-lg leading-none mb-0.5">{dayEmojis[day.day_key]}</div>
              <div className="text-[9px] font-mono font-bold uppercase tracking-wider">{day.label}</div>
            </button>
          ))}
        </div>

        {/* Current Day Info */}
        {currentDay && (
          <div className="border-2 border-foreground p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: dayColors[activeDay] }} />
            <div className="flex items-center gap-2 mb-1 mt-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] px-2 py-0.5 text-white" style={{ backgroundColor: dayColors[activeDay] }}>
                Day {activeDay}
              </span>
              <span className="font-display font-bold text-sm uppercase tracking-wider">{currentDay.title}</span>
            </div>
            <p className="text-xs text-muted-foreground font-mono">{currentDay.emphasis}</p>
          </div>
        )}

        {/* Non-Negotiables */}
        <NonNegotiablesBar categories={currentDay?.exercise_categories} />

        {/* Integrity Blocks */}
        {dayIntegrity.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 bg-[hsl(var(--cat-mobility))]" />
              <h2 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]">Warm-Up / Integrity</h2>
            </div>
            {dayIntegrity.map(block => (
              <IntegrityBlock
                key={block.slug}
                title={block.title}
                duration={block.duration}
                drills={block.drills}
                keyCues={block.key_cues}
              />
            ))}
          </div>
        )}

        {/* Exercise List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4" style={{ backgroundColor: dayColors[activeDay] }} />
              <h2 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]">Exercises</h2>
              <span className="text-[9px] font-mono text-muted-foreground">{exercises.length}</span>
            </div>
          </div>

          <div className="space-y-1">
            {exercises.map(ex => (
              <button
                key={ex.id}
                onClick={() => setSelectedExercise(ex)}
                className="w-full flex items-center gap-3 p-3 border border-foreground/20 hover:border-foreground bg-card hover:bg-secondary/50 transition-all text-left group"
              >
                <div
                  className="w-8 h-8 border border-foreground/30 flex items-center justify-center flex-shrink-0"
                  style={{ borderLeftWidth: 3, borderLeftColor: dayColors[activeDay] }}
                >
                  <Dumbbell className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-semibold text-xs uppercase tracking-wider truncate">{ex.name}</div>
                  <div className="text-[9px] font-mono text-muted-foreground mt-0.5">
                    {ex.sets_reps || `Level ${ex.difficulty_level || 1}`}
                    {ex.primary_muscles?.length > 0 && ` · ${ex.primary_muscles.slice(0, 2).join(', ')}`}
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>

          {exercises.length === 0 && (
            <div className="border-2 border-dashed border-foreground/20 p-8 text-center">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">No exercises for this day yet</p>
            </div>
          )}
        </div>

        {/* Start Workout CTA */}
        <Button
          onClick={() => navigate('/planner')}
          size="lg"
          className="w-full py-6 font-display font-bold uppercase tracking-wider text-sm border-2 border-foreground"
          style={{ backgroundColor: dayColors[activeDay] }}
        >
          <Play className="w-4 h-4 mr-2" />
          Start Day {activeDay} Workout
        </Button>
      </main>

      <ExerciseDetailModal
        exercise={selectedExercise}
        open={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
      />
    </div>
  );
}
