import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MuscleMap, MUSCLE_GROUPS } from '@/components/Anatomy/MuscleMap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
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
  chest: { description: 'The pectoralis major/minor form the chest wall.', function: 'Horizontal pushing, adduction, internal rotation of the shoulder.', tips: 'Focus on full ROM — stretch at bottom, squeeze at top. Vary angles for complete development.', caution: 'Tight pecs pull shoulders forward — always balance with upper-back work. Avoid excessive dip depth with shoulder issues.' },
  shoulders: { description: 'Three-headed deltoid muscle caps the shoulder.', function: 'Shoulder flexion, abduction, extension, and rotation.', tips: 'Train all 3 heads. Prioritize overhead stability and scapular health.', caution: 'Impingement risk with heavy overhead pressing if scapula isn\'t properly stabilized. Warm up rotator cuff before any pressing.' },
  biceps: { description: 'Two-headed muscle on the upper arm front.', function: 'Elbow flexion, forearm supination.', tips: 'Supinated grip targets the long head. Don\'t neglect eccentric control.', caution: 'Biceps tendon strain common in ring work and muscle-ups. Ease into supinated pulling.' },
  triceps: { description: 'Three-headed muscle on the upper arm back.', function: 'Elbow extension, shoulder extension.', tips: 'Overhead work targets the long head. Push-ups and dips are king.', caution: 'Elbow hyperextension risk during lockouts. Control the end range, especially on dips and HSPU.' },
  forearms: { description: 'Flexors and extensors of the wrist and fingers.', function: 'Grip strength, wrist flexion/extension.', tips: 'Dead hangs, farmer carries, and wrist curls build bulletproof forearms.', caution: 'Wrist pain is common in handstand and planche training. Always warm up with wrist circles and loaded extensions.' },
  abs: { description: 'Rectus abdominis — the "six-pack" muscles.', function: 'Trunk flexion, anti-extension, breathing support.', tips: 'Train anti-extension (planks, hollow holds) before spinal flexion (crunches).', caution: 'Repeated spinal flexion under load can stress lumbar discs. Prioritize hollow body and anti-extension work.' },
  obliques: { description: 'Lateral core muscles for rotation and side-bending.', function: 'Trunk rotation, lateral flexion, anti-rotation.', tips: 'Pallof presses and side planks build functional oblique strength.' },
  quads: { description: 'Four-headed muscle group on the front thigh.', function: 'Knee extension, hip flexion (rectus femoris).', tips: 'Deep squats with full ROM. Don\'t skip sissy squats for VMO development.', caution: 'Patellar tendon stress in deep squats and pistol squats. Build up progressively — don\'t rush depth.' },
  adductors: { description: 'Inner thigh muscles that draw the leg inward.', function: 'Hip adduction, stabilization during movement.', tips: 'Copenhagen planks and cossack squats are excellent adductor builders.', caution: 'High groin strain risk in pancake stretches and wide straddle work. Warm up thoroughly.' },
  calves: { description: 'Gastrocnemius and soleus muscles of the lower leg.', function: 'Ankle plantar flexion (pointing toes down).', tips: 'Train both bent-knee (soleus) and straight-knee (gastrocnemius) variations.' },
  traps: { description: 'Large diamond-shaped muscle of the upper back.', function: 'Scapular elevation, retraction, depression.', tips: 'Shrugs hit upper traps; rows and face pulls hit mid/lower traps.', caution: 'Overactive upper traps cause neck tension and headaches. Balance with lower trap work (Y-raises, prone shrugs).' },
  lats: { description: 'Broadest muscle of the back — creates the V-taper.', function: 'Shoulder extension, adduction, internal rotation.', tips: 'Pull-ups are the gold standard. Focus on initiating with the lats, not the arms.', caution: 'Tight lats restrict overhead mobility. If handstand line is compromised, stretch lats with wall slides.' },
  'upper-back': { description: 'Rhomboids and rear delts between the shoulder blades.', function: 'Scapular retraction, posterior shoulder stability.', tips: 'Face pulls and band pull-aparts daily keep shoulders healthy.' },
  'lower-back': { description: 'Erector spinae muscles along the spine.', function: 'Spinal extension, postural support, anti-flexion.', tips: 'Strengthen with back extensions and Jefferson curls. Never neglect this area.', caution: 'High compression during heavy deadlifts and back levers. Never train lower back fatigued — it protects your spine.' },
  glutes: { description: 'The largest muscle in the body — the gluteal complex.', function: 'Hip extension, abduction, external rotation.', tips: 'Bridges, thrusts, and deep squats. Activate glutes before heavy lifting.', caution: 'Weak glutes force lower back to compensate. If you get low back pain in squats, your glutes may be underactive.' },
  hamstrings: { description: 'Three muscles on the posterior thigh.', function: 'Knee flexion, hip extension.', tips: 'Nordic curls are elite for hamstring strength and injury prevention.', caution: 'Very high tear risk during explosive movements. Nordic curls are the #1 injury prevention exercise — do them weekly.' },
  'hip-flexors': { description: 'Iliopsoas and rectus femoris cross the hip joint.', function: 'Hip flexion, lumbar stabilization.', tips: 'Stretch if tight, but also strengthen! Hanging leg raises build hip flexor power.', caution: 'Tight hip flexors cause anterior pelvic tilt and low back pain. Stretch daily if you sit for long periods.' },
  neck: { description: 'Sternocleidomastoid and deep neck flexors/extensors.', function: 'Head rotation, flexion, extension.', tips: 'Neck curls and extensions with light resistance build resilience.', caution: '⚠️ HIGH PRESSURE in handstands, headstands, and neck bridges! Never load a cold neck. Build cervical endurance gradually. Compression injuries are serious and slow to heal.' },
  serratus: { description: 'Serratus anterior wraps the ribcage under the scapula.', function: 'Scapular protraction, upward rotation.', tips: 'Push-up plus and serratus punches. Essential for overhead stability.', caution: 'Weak serratus = winging scapula. If your shoulder blade sticks out during push-ups, prioritize this muscle.' },
  tibialis: { description: 'Tibialis anterior runs along the shin.', function: 'Ankle dorsiflexion (pulling toes up).', tips: 'Tibialis raises prevent shin splints and improve squat depth.', caution: 'Shin splints are caused by weak tibialis. 25 reps of tib raises daily fixes this for most people.' },
};

export default function Anatomy() {
  const navigate = useNavigate();
  const [view, setView] = useState<'front' | 'back'>('front');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Epic Header */}
      <header className="sticky top-0 z-50 border-b-2 border-foreground bg-background overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          {/* Top row */}
          <div className="h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-primary" />
              <div>
                <div className="flex items-center gap-2">
                  <PersonStanding className="w-4 h-4 text-primary" />
                  <h1 className="font-display text-sm font-black uppercase tracking-[0.15em]">
                    Muscle Atlas
                  </h1>
                </div>
                <p className="text-[7px] font-mono text-muted-foreground uppercase tracking-[0.25em] -mt-0.5">
                  Interactive Anatomy · {exercises.length} Exercises Mapped
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-[10px] font-mono uppercase tracking-wider border-2 border-foreground/30 gap-1.5"
                onClick={() => setView(v => v === 'front' ? 'back' : 'front')}
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                {view === 'front' ? 'Back' : 'Front'}
              </Button>
              {selectedMuscle && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-[10px] font-mono uppercase"
                  onClick={() => setSelectedMuscle(null)}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
          {/* Sub-strip — context bar */}
          <div className="flex items-center gap-3 pb-2 -mt-1">
            <div className="flex items-center gap-1.5">
              {['Push', 'Pull', 'Legs', 'Core', 'Skills', 'Mobility'].map(cat => (
                <div key={cat} className={cn("w-4 h-1", categoryColors[cat])} title={cat} />
              ))}
            </div>
            <span className="text-[7px] font-mono text-muted-foreground/60 uppercase tracking-[0.2em]">
              Tap any muscle · Explore exercises · Train smarter
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Body map */}
          <div className="relative">
            {/* Front/Back toggle tabs directly on body map */}
            <div className="flex items-center justify-center gap-0 mb-3">
              <button
                onClick={() => setView('front')}
                className={cn(
                  "px-4 py-1.5 text-[9px] font-mono font-bold uppercase tracking-[0.2em] border-2 border-foreground transition-all",
                  view === 'front'
                    ? "bg-foreground text-background"
                    : "bg-background text-foreground hover:bg-muted"
                )}
              >
                ◉ Front View
              </button>
              <button
                onClick={() => setView('back')}
                className={cn(
                  "px-4 py-1.5 text-[9px] font-mono font-bold uppercase tracking-[0.2em] border-2 border-foreground border-l-0 transition-all",
                  view === 'back'
                    ? "bg-foreground text-background"
                    : "bg-background text-foreground hover:bg-muted"
                )}
              >
                ◉ Back View
              </button>
            </div>
            <div className="border-2 border-foreground/20 rounded-lg p-4 bg-muted/30 flex items-center justify-center min-h-[55vh]">
              <MuscleMap
                selectedMuscle={selectedMuscle}
                onSelectMuscle={setSelectedMuscle}
                view={view}
              />
            </div>
            {/* ALL muscle pills — always visible */}
            <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
              {MUSCLE_GROUPS.map(m => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMuscle(selectedMuscle === m.id ? null : m.id);
                    // Auto-switch view if the muscle is primarily on the other side
                    const backMuscles = ['traps', 'lats', 'upper-back', 'lower-back', 'glutes', 'hamstrings'];
                    const frontMuscles = ['chest', 'abs', 'adductors', 'serratus', 'tibialis', 'hip-flexors'];
                    if (backMuscles.includes(m.id)) setView('back');
                    else if (frontMuscles.includes(m.id)) setView('front');
                  }}
                  className={cn(
                    "px-2 py-0.5 text-[8px] font-mono uppercase tracking-wider border-2 rounded-sm transition-all",
                    selectedMuscle === m.id
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-foreground/15 text-muted-foreground hover:border-foreground/40"
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
              <div className="border-2 border-dashed border-foreground/15 rounded-lg h-full min-h-[40vh] flex items-center justify-center p-8">
                <div className="text-center space-y-4 max-w-xs">
                  <div className="w-12 h-12 border-2 border-foreground/20 flex items-center justify-center mx-auto rounded-sm">
                    <Target className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-display text-sm font-bold uppercase tracking-tight">Select a Muscle</p>
                    <p className="text-[10px] font-mono text-muted-foreground mt-1">
                      Tap any muscle on the body or use the pills below to explore anatomy, exercises, and training tips.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-10rem)]">
                <div className="space-y-4 pr-2">
                  {/* Muscle header */}
                  <div className="border-2 border-foreground rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-primary/20 border-2 border-primary rounded-sm flex items-center justify-center">
                        <Zap className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="font-display text-lg font-bold uppercase tracking-tight">{muscleGroup?.label}</h2>
                        <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">
                          {totalExercises} exercises available
                        </p>
                      </div>
                    </div>
                    {muscleInfo && (
                      <div className="space-y-3 text-xs">
                        <p className="text-muted-foreground">{muscleInfo.description}</p>
                        <div className="grid grid-cols-1 gap-2">
                          <div className="border border-foreground/15 rounded-sm p-2.5">
                            <p className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Function</p>
                            <p className="text-foreground text-[11px]">{muscleInfo.function}</p>
                          </div>
                          <div className="border border-primary/30 bg-primary/5 rounded-sm p-2.5">
                            <p className="text-[8px] font-mono uppercase tracking-wider text-primary mb-1">Pro Tip</p>
                            <p className="text-foreground text-[11px]">{muscleInfo.tips}</p>
                          </div>
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
                          <ExerciseRow key={ex.id} exercise={ex} onNavigate={() => navigate('/library')} />
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
                          <ExerciseRow key={ex.id} exercise={ex} secondary onNavigate={() => navigate('/library')} />
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
                      {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function ExerciseRow({ exercise, secondary, onNavigate }: { exercise: Exercise; secondary?: boolean; onNavigate: () => void }) {
  const catColor = categoryColors[exercise.category] || 'bg-muted';
  return (
    <button
      onClick={onNavigate}
      className={cn(
        "w-full text-left border-2 rounded-lg p-3 flex items-center gap-3 transition-all hover:border-foreground/40",
        secondary ? "border-foreground/10 bg-muted/20" : "border-foreground/20"
      )}
    >
      <div className={cn("w-2 h-8 rounded-full shrink-0", catColor)} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold truncate">{exercise.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge variant="outline" className="text-[7px] px-1.5 py-0 h-4 font-mono uppercase">
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
