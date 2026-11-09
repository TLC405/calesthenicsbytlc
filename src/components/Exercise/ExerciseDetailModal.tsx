import { useEffect, useState } from 'react';
import { Plus, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from './VideoPlayer';
import { CoachResources } from './CoachResources';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProgressionPathStrip } from './ProgressionPathStrip';
import { supabase } from '@/integrations/supabase/client';

interface Exercise {
  id: string; name: string; slug: string; category: string;
  primary_muscles?: string[]; secondary_muscles?: string[]; equipment?: string[];
  cues?: unknown; difficulty_level?: number | null; youtube_url?: string | null;
  instagram_url?: string | null; image_url?: string | null;
  chain_group?: string | null; chain_order?: number | null;
  stabilizer_muscles?: string[] | null; tendons_involved?: string[] | null;
  recovery_muscle?: string | null; recovery_tendon?: string | null;
  recovery_nervous?: string | null; sets_reps?: string | null; description?: string | null;
  video_verified?: boolean | null;
}
interface Progression { id: string; name: string; level: number; description: string | null; }
interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  open: boolean;
  onClose: () => void;
  onAddToWorkout?: (exercise: Exercise) => void;
  actionLabel?: string;
}
const difficulty = ['Not rated', 'Beginner', 'Novice', 'Intermediate', 'Advanced', 'Elite'];

export function ExerciseDetailModal({ exercise, open, onClose, onAddToWorkout, actionLabel = 'Add to workout' }: ExerciseDetailModalProps) {
  const [current, setCurrent] = useState<Exercise | null>(exercise);
  const [progressions, setProgressions] = useState<Progression[]>([]);
  useEffect(() => { setCurrent(exercise); }, [exercise]);
  useEffect(() => {
    if (!current?.id || !open) { setProgressions([]); return; }
    let active = true;
    supabase.from('progressions').select('id, name, level, description')
      .eq('exercise_id', current.id).order('level')
      .then(({ data }) => { if (active) setProgressions((data || []) as Progression[]); });
    return () => { active = false; };
  }, [current?.id, open]);

  const navigateVariation = async (id: string) => {
    const { data } = await supabase.from('exercises').select('*').eq('id', id).maybeSingle();
    if (data) setCurrent(data as Exercise);
  };

  if (!current) return null;
  return (
    <Dialog open={open} onOpenChange={next => { if (!next) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90dvh] p-0 overflow-hidden rounded-2xl border-border/70 bg-background">
        <ScrollArea className="max-h-[90dvh]">
          <div className="p-4 sm:p-6 space-y-5">
            <DialogHeader className="text-left pr-6">
              <p className="text-xs font-semibold text-primary">{current.category} · {difficulty[current.difficulty_level || 0] || 'Not rated'}</p>
              <DialogTitle className="text-2xl font-display font-bold tracking-tight">{current.name}</DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                {current.description || 'View the demonstration, review technique, and choose a suitable variation.'}
              </DialogDescription>
            </DialogHeader>

            <VideoPlayer key={current.id} youtubeUrl={current.youtube_url}
              instagramUrl={current.instagram_url} title={current.name}
              thumbnailMode videoVerified={current.video_verified}
              exerciseData={{
                primary_muscles: current.primary_muscles,
                secondary_muscles: current.secondary_muscles,
                stabilizer_muscles: current.stabilizer_muscles,
                tendons_involved: current.tendons_involved,
                equipment: current.equipment, cues: current.cues,
                sets_reps: current.sets_reps, difficulty_level: current.difficulty_level,
                category: current.category,
              }}/>
            <CoachResources exerciseName={current.name} category={current.category}/>
            <ProgressionPathStrip exerciseId={current.id} chainGroup={current.chain_group || null}
              onNavigate={navigateVariation}/>
            {progressions.length > 0 && (
              <section className="rounded-2xl border border-border/70 bg-card p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-sm">Technique stages</h3>
                  <p className="text-xs text-muted-foreground">Reference steps for this movement</p>
                </div>
                {progressions.map((stage, index) => (
                  <div key={stage.id} className="flex items-start gap-3">
                    <span className="rounded-full bg-secondary h-7 w-7 flex items-center justify-center shrink-0 text-xs font-semibold">{index + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{stage.name}</p>
                      {stage.description && <p className="text-xs text-muted-foreground leading-relaxed mt-1">{stage.description}</p>}
                    </div>
                    <ChevronRight size={15} className="text-muted-foreground mt-1"/>
                  </div>
                ))}
              </section>
            )}
            {onAddToWorkout && (
              <Button className="w-full min-h-12 rounded-xl font-semibold" onClick={() => {
                onAddToWorkout(current); onClose();
              }}>
                <Plus size={18} className="mr-2"/> {actionLabel}
              </Button>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
