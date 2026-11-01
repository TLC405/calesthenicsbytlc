import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CircleCheck, Dumbbell, Info, Layers3, Play, ShieldCheck, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExerciseCard } from '@/components/Exercise/ExerciseCard';
import { ExerciseDetailModal } from '@/components/Exercise/ExerciseDetailModal';
import { backendConfigured, supabase } from '@/integrations/supabase/client';
import { getOfflineExercises } from '@/lib/offlineExercises';
import publicCatalog from '@/data/publicExerciseCatalog.json';
import { SKILL_PATHS, getSkillPath } from '@/data/skillPaths';

interface Exercise {
  id: string; slug: string; name: string; category: string;
  primary_muscles: string[]; secondary_muscles: string[]; equipment: string[];
  cues: unknown; difficulty_level?: number | null; youtube_url?: string | null;
  image_url?: string | null; instagram_url?: string | null;
}

export default function SkillStudio() {
  const { skillId } = useParams<{skillId: string}>();
  const path = getSkillPath(skillId);
  const navigate = useNavigate();
  const [all, setAll] = useState<Exercise[]>([...publicCatalog, ...getOfflineExercises()] as Exercise[]);
  const [selected, setSelected] = useState<Exercise | null>(null);
  useEffect(() => {
    if (!backendConfigured) return;
    let active = true;
    supabase.from('exercises').select('*').then(({data})=>{
      if (active && data) setAll([...publicCatalog, ...data, ...getOfflineExercises()] as Exercise[]);
    });
    return ()=>{active=false};
  }, []);
  const bySlug = useMemo(()=>new Map(all.map(exercise=>[exercise.slug,exercise])),[all]);
  const entries = path ? path.slugs.map((slug,index)=>({slug, index, exercise:bySlug.get(slug)})).filter((e): e is typeof e & {exercise: Exercise}=>Boolean(e.exercise)) : [];
  function addToWorkout(exercise: Exercise) {
    sessionStorage.setItem('powa-builder-import', JSON.stringify({items:[{name:exercise.name,section:'workout',exercise}]}));
    navigate('/planner');
  }
  if (!path) return <main className="max-w-lg mx-auto p-5 space-y-4"><h1 className="text-2xl font-black">Unknown training studio</h1><Button onClick={()=>navigate('/library')}>Back to exercises</Button></main>;
  return (
    <main className="power-skill-studio min-h-screen pb-32">
      <div className="mx-auto max-w-5xl px-3 sm:px-5 py-4 sm:py-8 space-y-5">
        <header className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <Button type="button" variant="outline" className="h-11 rounded-xl" onClick={()=>navigate('/library')}>
              <ArrowLeft className="mr-1.5 h-4 w-4"/> Library
            </Button>
            <span className="text-[10px] font-bold uppercase tracking-[.2em] text-primary">POWER SKILL STUDIO</span>
          </div>
          <div className="power-elevated power-skill-hero p-4 sm:p-6 space-y-3">
            <div className="flex justify-between items-start gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-black tracking-widest text-primary uppercase">{path.short}</p>
                <h1 className="mt-1 font-display text-[clamp(1.6rem,7vw,2.8rem)] leading-tight font-black">{path.title}</h1>
              </div>
              <span className="power-theme-emblem h-12 w-12 grid place-items-center shrink-0"><Target className="h-6 w-6"/></span>
            </div>
            <p className="text-sm text-muted-foreground">{path.focus}</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-lg border border-border bg-secondary px-3 py-2"><Dumbbell className="h-3 w-3 inline mr-1"/>{path.equipment}</span>
              <span className="rounded-lg border border-border bg-secondary px-3 py-2"><Layers3 className="h-3 w-3 inline mr-1"/>{entries.length} drills available</span>
            </div>
            <div className="rounded-xl border-l-4 border-primary bg-primary/5 px-3 py-2.5 text-xs leading-relaxed"><strong className="block mb-1">Technique focus</strong>{path.cue}</div>
            <p className="flex gap-2 text-xs leading-relaxed text-muted-foreground"><ShieldCheck className="w-4 h-4 shrink-0 text-primary"/>{path.safety}</p>
          </div>
        </header>
        <nav className="flex gap-2 overflow-x-auto pb-2" aria-label="Choose a skill studio">
          {SKILL_PATHS.map(item=><Button key={item.id} variant={item.id===path.id?'default':'outline'}
            className="h-11 shrink-0 rounded-xl text-xs sm:text-sm" onClick={()=>navigate(`/skills/${item.id}`)}>
            {item.title}
          </Button>)}
        </nav>
        <section aria-label="Skill progression" className="space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="font-display font-black text-xl">Your movement ladder</h2>
            <span className="text-xs text-muted-foreground">Tap a card to study form</span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">A practice sequence—not a promise of fast progress. Use drills appropriate for your current control and mobility.</p>
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 gap-3">
            {entries.map(({slug,index,exercise})=>(
              <div className="relative min-w-0" key={slug}>
                <div className="absolute z-20 top-2 right-2 bg-card/95 border border-border rounded-lg py-1 px-2 font-mono text-xs font-bold shadow">STAGE {index+1}</div>
                <ExerciseCard exercise={exercise as any} onViewDetails={setSelected as any} onAddToWorkout={addToWorkout as any}/>
                {index!==entries.length-1 && <div className="hidden lg:flex absolute -right-3 top-1/2 z-20 bg-primary text-primary-foreground h-6 w-6 items-center justify-center rounded-full"><ArrowRight className="h-4 w-4"/></div>}
              </div>
            ))}
          </div>
        </section>
        <div className="power-elevated p-4 flex items-start gap-3 text-xs text-muted-foreground leading-relaxed">
          <Info className="w-5 h-5 shrink-0 text-primary"/>
          Tutorial availability depends on source permissions. If a movement has no verified video, POWER displays its name and form cues instead of a broken thumbnail.
        </div>
      </div>
      <ExerciseDetailModal exercise={selected as any} open={Boolean(selected)}
        onClose={()=>setSelected(null)} onAddToWorkout={addToWorkout as any}/>
    </main>
  );
}
