import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MuscleMap, MUSCLE_GROUPS } from '@/components/Anatomy/MuscleMap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { ExerciseDetailModal } from '@/components/Exercise/ExerciseDetailModal';
import { cn } from '@/lib/utils';
import {
  ArrowLeftRight,
  Dumbbell,
  Brain,
  Zap,
  Target,
  ChevronRight,
  RotateCcw,
  Info,
  PersonStanding,
} from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  slug: string;
  category: string;
  primary_muscles: string[];
  secondary_muscles: string[];
  difficulty_level: number | null;
  youtube_url: string | null;
  sets_reps: string | null;
  description: string | null;
  equipment: string[];
  recovery_muscle: string | null;
  tendons_involved: string[] | null;
}

const difficultyLabel = ['', 'Beginner', 'Intermediate', 'Advanced', 'Elite', 'Master'];
const categoryColors: Record<string, string> = {
  Push: 'bg-[hsl(var(--cat-push))]',
  Pull: 'bg-[hsl(var(--cat-pull))]',
  Legs: 'bg-[hsl(var(--cat-legs))]',
  Core: 'bg-[hsl(var(--cat-core))]',
  Skills: 'bg-[hsl(var(--cat-skills))]',
  Mobility: 'bg-[hsl(var(--cat-mobility))]',
  Rings: 'bg-[hsl(var(--cat-push))]',
  Flexibility: 'bg-[hsl(var(--cat-mobility))]',
  Yoga: 'bg-[hsl(var(--cat-skills))]',
};

const MUSCLE_INFO: Record<string, { description: string; function: string; tips: string; caution?: string }> = {
  chest: { description: 'The pectoralis major/minor form the chest wall.', function: 'Horizontal pushing, adduction, internal rotation of the shoulder.', tips: 'Focus on full ROM — stretch at bottom, squeeze at top. Vary angles for complete development.', caution: 'Tight pecs pull shoulders forward — always balance with upper-back work.' },
  shoulders: { description: 'Three-headed deltoid muscle caps the shoulder.', function: 'Shoulder flexion, abduction, extension, and rotation.', tips: 'Train all 3 heads. Prioritize overhead stability and scapular health.', caution: 'Impingement risk with heavy overhead pressing if scapula isn\'t properly stabilized.' },
  biceps: { description: 'Two-headed muscle on the upper arm front.', function: 'Elbow flexion, forearm supination.', tips: 'Supinated grip targets the long head. Don\'t neglect eccentric control.', caution: 'Biceps tendon strain common in ring work and muscle-ups.' },
  triceps: { description: 'Three-headed muscle on the upper arm back.', function: 'Elbow extension, shoulder extension.', tips: 'Overhead work targets the long head. Push-ups and dips are king.', caution: 'Elbow hyperextension risk during lockouts.' },
  forearms: { description: 'Flexors and extensors of the wrist and fingers.', function: 'Grip strength, wrist flexion/extension.', tips: 'Dead hangs, farmer carries, and wrist curls build bulletproof forearms.', caution: 'Wrist pain is common in handstand and planche training.' },
  abs: { description: 'Rectus abdominis — the "six-pack" muscles.', function: 'Trunk flexion, anti-extension, breathing support.', tips: 'Train anti-extension (planks, hollow holds) before spinal flexion (crunches).', caution: 'Repeated spinal flexion under load can stress lumbar discs.' },
  obliques: { description: 'Lateral core muscles for rotation and side-bending.', function: 'Trunk rotation, lateral flexion, anti-rotation.', tips: 'Pallof presses and side planks build functional oblique strength.' },
  quads: { description: 'Four-headed muscle group on the front thigh.', function: 'Knee extension, hip flexion (rectus femoris).', tips: 'Deep squats with full ROM. Don\'t skip sissy squats for VMO development.', caution: 'Patellar tendon stress in deep squats and pistol squats.' },
  adductors: { description: 'Inner thigh muscles that draw the leg inward.', function: 'Hip adduction, stabilization during movement.', tips: 'Copenhagen planks and cossack squats are excellent adductor builders.', caution: 'High groin strain risk in pancake stretches and wide straddle work.' },
  calves: { description: 'Gastrocnemius and soleus muscles of the lower leg.', function: 'Ankle plantar flexion (pointing toes down).', tips: 'Train both bent-knee (soleus) and straight-knee (gastrocnemius) variations.' },
  traps: { description: 'Large diamond-shaped muscle of the upper back.', function: 'Scapular elevation, retraction, depression.', tips: 'Shrugs hit upper traps; rows and face pulls hit mid/lower traps.', caution: 'Overactive upper traps cause neck tension and headaches.' },
  lats: { description: 'Broadest muscle of the back — creates the V-taper.', function: 'Shoulder extension, adduction, internal rotation.', tips: 'Pull-ups are the gold standard. Focus on initiating with the lats, not the arms.', caution: 'Tight lats restrict overhead mobility.' },
  'upper-back': { description: 'Rhomboids and rear delts between the shoulder blades.', function: 'Scapular retraction, posterior shoulder stability.', tips: 'Face pulls and band pull-aparts daily keep shoulders healthy.' },
  'lower-back': { description: 'Erector spinae muscles along the spine.', function: 'Spinal extension, postural support, anti-flexion.', tips: 'Strengthen with back extensions and Jefferson curls.', caution: 'High compression during heavy deadlifts and back levers.' },
  glutes: { description: 'The largest muscle in the body — the gluteal complex.', function: 'Hip extension, abduction, external rotation.', tips: 'Bridges, thrusts, and deep squats. Activate glutes before heavy lifting.', caution: 'Weak glutes force lower back to compensate.' },
  hamstrings: { description: 'Three muscles on the posterior thigh.', function: 'Knee flexion, hip extension.', tips: 'Nordic curls are elite for hamstring strength and injury prevention.', caution: 'Very high tear risk during explosive movements.' },
  'hip-flexors': { description: 'Iliopsoas and rectus femoris cross the hip joint.', function: 'Hip flexion, lumbar stabilization.', tips: 'Stretch if tight, but also strengthen! Hanging leg raises build hip flexor power.', caution: 'Tight hip flexors cause anterior pelvic tilt and low back pain.' },
  neck: { description: 'Sternocleidomastoid and deep neck flexors/extensors.', function: 'Head rotation, flexion, extension.', tips: 'Neck curls and extensions with light resistance build resilience.', caution: '⚠️ Never load a cold neck. Build cervical endurance gradually.' },
  serratus: { description: 'Serratus anterior wraps the ribcage under the scapula.', function: 'Scapular protraction, upward rotation.', tips: 'Push-up plus and serratus punches. Essential for overhead stability.', caution: 'Weak serratus = winging scapula.' },
  tibialis: { description: 'Tibialis anterior runs along the shin.', function: 'Ankle dorsiflexion (pulling toes up).', tips: 'Tibialis raises prevent shin splints and improve squat depth.', caution: 'Shin splints are caused by weak tibialis.' },
};

export default function Anatomy() {
  const [view, setView] = useState<'front' | 'back'>('front');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);

  useEffect(() => {
    supabase.from('exercises').select('id, name, slug, category, primary_muscles, secondary_muscles, difficulty_level, youtube_url, sets_reps, description, equipment, recovery_muscle, tendons_involved')
      .order('name')
      .then(({ data }) => {
        setExercises((data as Exercise[]) || []);
        setLoading(false);
      });
  }, []);

  const muscleGroup = MUSCLE_GROUPS.find(m => m.id === selectedMuscle);
  const muscleInfo = selectedMuscle ? MUSCLE_INFO[selectedMuscle] : null;

  const matchingExercises = useMemo(() => {
    if (!muscleGroup) return { primary: [], secondary: [] };
    const aliases = muscleGroup.aliases.map(a => a.toLowerCase());
    const primary = exercises.filter(e =>
      e.primary_muscles.some(m => aliases.includes(m.toLowerCase()))
    );
    const secondary = exercises.filter(e =>
      e.secondary_muscles.some(m => aliases.includes(m.toLowerCase())) &&
      !primary.find(p => p.id === e.id)
    );
    return { primary, secondary };
  }, [muscleGroup, exercises]);

  const totalExercises = matchingExercises.primary.length + matchingExercises.secondary.length;

  const handleExerciseClick = async (exercise: Exercise) => {
    // Fetch full exercise data for the detail modal
    const { data } = await supabase.from('exercises').select('*').eq('id', exercise.id).single();
    if (data) setSelectedExercise(data);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Frosted glass header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-border/30">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-border/30 flex items-center justify-center">
                <PersonStanding className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-base font-bold tracking-tight">Muscle Atlas</h1>
                <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-[0.2em]">
                  {exercises.length} Exercises Mapped
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-[10px] font-mono uppercase tracking-wider rounded-xl border-border/50 gap-1.5"
                onClick={() => setView(v => v === 'front' ? 'back' : 'front')}
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                {view === 'front' ? 'Back' : 'Front'}
              </Button>
              {selectedMuscle && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 rounded-xl"
                  onClick={() => setSelectedMuscle(null)}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Body map */}
          <div className="relative">
            {/* Front/Back toggle */}
            <div className="flex items-center justify-center gap-1 mb-4">
              <button
                onClick={() => setView('front')}
                className={cn(
                  "px-5 py-2 text-[10px] font-mono font-bold uppercase tracking-[0.15em] rounded-l-xl border border-border/50 transition-all",
                  view === 'front'
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                Front View
              </button>
              <button
                onClick={() => setView('back')}
                className={cn(
                  "px-5 py-2 text-[10px] font-mono font-bold uppercase tracking-[0.15em] rounded-r-xl border border-border/50 transition-all",
                  view === 'back'
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                Back View
              </button>
            </div>
            <div className="rounded-2xl border border-border/40 bg-card/50 p-4 flex items-center justify-center min-h-[55vh]">
              <MuscleMap
                selectedMuscle={selectedMuscle}
                onSelectMuscle={setSelectedMuscle}
                view={view}
              />
            </div>
            {/* Muscle pills */}
            <div className="flex flex-wrap gap-1.5 mt-4 justify-center">
              {MUSCLE_GROUPS.map(m => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMuscle(selectedMuscle === m.id ? null : m.id);
                    const backMuscles = ['traps', 'lats', 'upper-back', 'lower-back', 'glutes', 'hamstrings'];
                    const frontMuscles = ['chest', 'abs', 'adductors', 'serratus', 'tibialis', 'hip-flexors'];
                    if (backMuscles.includes(m.id)) setView('back');
                    else if (frontMuscles.includes(m.id)) setView('front');
                  }}
                  className={cn(
                    "px-3 py-1.5 text-[9px] font-mono uppercase tracking-wider rounded-xl border transition-all",
                    selectedMuscle === m.id
                      ? "border-primary bg-primary/10 text-primary font-bold"
                      : "border-border/40 text-muted-foreground hover:border-border hover:text-foreground"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Muscle detail panel */}
          <div>
            {!selectedMuscle ? (
              <div className="rounded-2xl border border-dashed border-border/40 h-full min-h-[40vh] flex items-center justify-center p-8">
                <div className="text-center space-y-4 max-w-xs">
                  <div className="w-14 h-14 rounded-2xl bg-accent/60 border border-border/30 flex items-center justify-center mx-auto">
                    <Target className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-display text-base font-bold tracking-tight">Select a Muscle</p>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      Tap any muscle on the body or use the pills below to explore anatomy, exercises, and training tips.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-10rem)]">
                <div className="space-y-4 pr-2">
                  {/* Muscle header */}
                  <div className="rounded-2xl border border-border/50 bg-card p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-11 h-11 bg-primary/10 border border-primary/30 rounded-xl flex items-center justify-center">
                        <Zap className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="font-display text-lg font-bold tracking-tight">{muscleGroup?.label}</h2>
                        <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">
                          {totalExercises} exercises available
                        </p>
                      </div>
                    </div>
                    {muscleInfo && (
                      <div className="space-y-3 text-xs">
                        <p className="text-muted-foreground leading-relaxed">{muscleInfo.description}</p>
                        <div className="grid grid-cols-1 gap-2">
                          <div className="rounded-xl border border-border/40 bg-accent/20 p-3">
                            <p className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Function</p>
                            <p className="text-foreground text-[11px]">{muscleInfo.function}</p>
                          </div>
                          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
                            <p className="text-[8px] font-mono uppercase tracking-wider text-primary mb-1">Pro Tip</p>
                            <p className="text-foreground text-[11px]">{muscleInfo.tips}</p>
                          </div>
                          {muscleInfo.caution && (
                            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3">
                              <p className="text-[8px] font-mono uppercase tracking-wider text-destructive mb-1">⚠️ Caution</p>
                              <p className="text-foreground text-[11px]">{muscleInfo.caution}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Primary exercises */}
                  {matchingExercises.primary.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Dumbbell className="w-3.5 h-3.5 text-primary" />
                        <h3 className="text-[10px] font-mono uppercase tracking-wider font-bold">
                          Primary — {matchingExercises.primary.length}
                        </h3>
                      </div>
                      <div className="space-y-1.5">
                        {matchingExercises.primary.map(ex => (
                          <ExerciseRow key={ex.id} exercise={ex} onClick={() => handleExerciseClick(ex)} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Secondary exercises */}
                  {matchingExercises.secondary.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="w-3.5 h-3.5 text-muted-foreground" />
                        <h3 className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground">
                          Secondary — {matchingExercises.secondary.length}
                        </h3>
                      </div>
                      <div className="space-y-1.5">
                        {matchingExercises.secondary.map(ex => (
                          <ExerciseRow key={ex.id} exercise={ex} secondary onClick={() => handleExerciseClick(ex)} />
                        ))}
                      </div>
                    </div>
                  )}

                  {totalExercises === 0 && !loading && (
                    <div className="text-center py-8">
                      <p className="text-xs text-muted-foreground font-mono">No exercises found for this muscle group.</p>
                    </div>
                  )}

                  {loading && (
                    <div className="space-y-2">
                      {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </main>

      {/* Exercise Detail Modal — opens in-place */}
      <ExerciseDetailModal
        exercise={selectedExercise}
        open={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
      />
    </div>
  );
}

function ExerciseRow({ exercise, secondary, onClick }: { exercise: Exercise; secondary?: boolean; onClick: () => void }) {
  const catColor = categoryColors[exercise.category] || 'bg-muted';
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-xl border p-3 flex items-center gap-3 transition-all hover:border-border hover:shadow-sm",
        secondary ? "border-border/30 bg-accent/10" : "border-border/50 bg-card"
      )}
    >
      <div className={cn("w-2 h-8 rounded-full shrink-0", catColor)} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold truncate">{exercise.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge variant="outline" className="text-[7px] px-1.5 py-0 h-4 font-mono uppercase rounded-md">
            {exercise.category}
          </Badge>
          {exercise.difficulty_level && (
            <span className="text-[8px] font-mono text-muted-foreground">
              {difficultyLabel[exercise.difficulty_level]}
            </span>
          )}
        </div>
        {exercise.sets_reps && (
          <p className="text-[9px] font-mono text-muted-foreground mt-0.5">{exercise.sets_reps}</p>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </button>
  );
}
