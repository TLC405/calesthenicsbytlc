import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Zap, ChevronRight, Play, Dumbbell, Plus, Save, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NonNegotiablesBar } from '@/components/Training/NonNegotiablesBar';
import { IntegrityBlock } from '@/components/Training/IntegrityBlock';
import { ExerciseDetailModal } from '@/components/Exercise/ExerciseDetailModal';
import { ExercisePickerModal } from '@/components/Workout/ExercisePickerModal';
import { SetTracker, type SetData } from '@/components/Workout/SetTracker';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TrainingDay { id: string; day_key: string; label: string; title: string; emphasis: string; exercise_categories: string[]; integrity_block_slugs: string[]; sort_order: number; }
interface IntegrityData { slug: string; title: string; duration: string; drills: string[]; key_cues: string[]; }
interface Exercise { id: string; name: string; slug: string; category: string; primary_muscles: string[]; secondary_muscles: string[]; equipment: string[]; cues: any; difficulty_level?: number | null; youtube_url?: string | null; instagram_url?: string | null; image_url?: string | null; chain_group?: string | null; chain_order?: number | null; sets_reps?: string | null; description?: string | null; stabilizer_muscles?: string[] | null; tendons_involved?: string[] | null; recovery_muscle?: string | null; recovery_tendon?: string | null; recovery_nervous?: string | null; }

const dayColors: Record<string, string> = { A: 'hsl(var(--cat-push))', B: 'hsl(var(--cat-pull))', C: 'hsl(var(--cat-skills))', D: 'hsl(var(--cat-legs))', E: 'hsl(var(--cat-core))' };

function getYouTubeThumb(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|v=|\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/default.jpg` : null;
}

export default function Train() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [days, setDays] = useState<TrainingDay[]>([]);
  const [activeDay, setActiveDay] = useState<string>('A');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [integrityBlocks, setIntegrityBlocks] = useState<IntegrityData[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [exerciseSets, setExerciseSets] = useState<Record<string, SetData[]>>({});
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => { if (!user) { navigate('/auth'); return; } loadData(); }, [user]);
  useEffect(() => { if (days.length > 0) loadDayExercises(); }, [activeDay, days]);

  const loadData = async () => {
    const [{ data: daysData }, { data: blocksData }] = await Promise.all([
      supabase.from('training_days').select('*').order('sort_order'),
      supabase.from('integrity_blocks').select('*'),
    ]);
    if (daysData) setDays(daysData as TrainingDay[]);
    if (blocksData) setIntegrityBlocks(blocksData as IntegrityData[]);
    setLoading(false);
  };

  const loadDayExercises = async () => {
    const day = days.find(d => d.day_key === activeDay);
    if (!day) return;
    const { data } = await supabase.from('exercises').select('*').in('category', day.exercise_categories).order('difficulty_level').order('name');
    if (data) setExercises(data as unknown as Exercise[]);
  };

  const getExerciseSets = (exId: string): SetData[] => exerciseSets[exId] || [{ reps: 10 }];
  const updateExerciseSets = (exId: string, sets: SetData[]) => {
    setExerciseSets(prev => ({ ...prev, [exId]: sets }));
    setSavedIds(prev => { const n = new Set(prev); n.delete(exId); return n; });
  };

  const saveExerciseLog = useCallback(async (ex: Exercise) => {
    if (!user) return;
    setSavingId(ex.id);
    const today = new Date().toISOString().slice(0, 10);
    const sets = getExerciseSets(ex.id);
    try {
      const { data: existing } = await supabase.from('workouts').select('id, entries').eq('user_id', user.id).eq('date', today).maybeSingle();
      const newEntry = { exercise_id: ex.id, exercise_name: ex.name, exercise_slug: ex.slug, category: ex.category, sets };
      if (existing) {
        const entries = (existing.entries as any[]) || [];
        const idx = entries.findIndex((e: any) => e.exercise_id === ex.id);
        if (idx >= 0) entries[idx] = newEntry; else entries.push(newEntry);
        await supabase.from('workouts').update({ entries: entries as any, updated_at: new Date().toISOString() }).eq('id', existing.id);
      } else {
        await supabase.from('workouts').insert({ user_id: user.id, date: today, entries: [newEntry] as any });
      }
      setSavedIds(prev => new Set(prev).add(ex.id));
      toast.success(`${ex.name} logged — ${sets.length} set${sets.length > 1 ? 's' : ''}`);
    } catch { toast.error('Failed to save'); }
    finally { setSavingId(null); }
  }, [user, exerciseSets]);

  const currentDay = days.find(d => d.day_key === activeDay);
  const dayIntegrity = integrityBlocks.filter(b => currentDay?.integrity_block_slugs?.includes(b.slug));

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground font-mono text-xs">Loading cycle...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-border/30">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center border border-border/30" style={{ backgroundColor: `${dayColors[activeDay]}15` }}>
              <Zap className="w-5 h-5" style={{ color: dayColors[activeDay] }} />
            </div>
            <div>
              <h1 className="font-display text-base font-bold tracking-tight leading-none">Stacked Cycle</h1>
              <p className="text-[8px] font-mono text-muted-foreground mt-0.5 tracking-wide">4-Day Auto-Rotating</p>
            </div>
          </div>
          <Button size="sm" onClick={() => setShowPicker(true)} className="h-9 text-[10px] font-mono uppercase tracking-wider rounded-xl">
            <Plus className="h-3.5 w-3.5 mr-1" />Exercise
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-5 pb-28 md:pb-6">
        {/* Day Selector */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {days.map(day => (
            <button key={day.day_key} onClick={() => setActiveDay(day.day_key)}
              className={cn("flex-1 min-w-[4.5rem] rounded-2xl p-3.5 text-center transition-all duration-200 relative overflow-hidden border",
                activeDay === day.day_key ? "border-transparent text-white" : "border-border/40 bg-card hover:bg-accent/30"
              )}
              style={activeDay === day.day_key ? { backgroundColor: dayColors[day.day_key], boxShadow: `0 0 20px ${dayColors[day.day_key]}30` } : undefined}
            >
              <div className="text-[9px] font-mono font-bold uppercase tracking-wider">{day.label}</div>
            </button>
          ))}
        </div>

        {currentDay && (
          <div className="rounded-2xl border border-border/40 bg-card p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full rounded-r-full" style={{ backgroundColor: dayColors[activeDay] }} />
            <div className="flex items-center gap-2 mb-1 ml-2">
              <span className="text-[9px] font-mono font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-lg text-white" style={{ backgroundColor: dayColors[activeDay] }}>Day {activeDay}</span>
              <span className="font-display font-bold text-sm tracking-tight">{currentDay.title}</span>
            </div>
            <p className="text-xs text-muted-foreground font-mono ml-2">{currentDay.emphasis}</p>
          </div>
        )}

        <NonNegotiablesBar categories={currentDay?.exercise_categories} />

        {dayIntegrity.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 rounded-full bg-[hsl(var(--cat-mobility))]" />
              <h2 className="text-[10px] font-mono font-bold uppercase tracking-[0.15em]">Warm-Up / Integrity</h2>
            </div>
            {dayIntegrity.map(block => <IntegrityBlock key={block.slug} title={block.title} duration={block.duration} drills={block.drills} keyCues={block.key_cues} />)}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 rounded-full" style={{ backgroundColor: dayColors[activeDay] }} />
            <h2 className="text-[10px] font-mono font-bold uppercase tracking-[0.15em]">Exercises</h2>
            <span className="text-[9px] font-mono text-muted-foreground">{exercises.length}</span>
          </div>

          <div className="space-y-1.5">
            {exercises.map(ex => {
              const thumb = getYouTubeThumb(ex.youtube_url);
              const isExpanded = expandedId === ex.id;
              return (
                <div key={ex.id} className={cn("rounded-2xl border bg-card transition-all duration-200", isExpanded ? "border-border/60 shadow-sm" : "border-border/30 hover:border-border/50")}>
                  <button onClick={() => setExpandedId(isExpanded ? null : ex.id)} className="w-full flex items-center gap-3 p-3 text-left group">
                    {thumb ? (
                      <img src={thumb} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl border border-border/30 flex items-center justify-center flex-shrink-0 bg-accent/30">
                        <Dumbbell className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-semibold text-xs tracking-tight truncate">{ex.name}</div>
                      <div className="text-[9px] font-mono text-muted-foreground mt-0.5">
                        {ex.sets_reps || `Level ${ex.difficulty_level || 1}`}
                        {ex.primary_muscles?.length > 0 && ` · ${ex.primary_muscles.slice(0, 2).join(', ')}`}
                      </div>
                    </div>
                    <ChevronRight className={cn("w-3.5 h-3.5 text-muted-foreground/40 transition-transform", isExpanded && "rotate-90")} />
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-border/20 space-y-3">
                      <SetTracker sets={getExerciseSets(ex.id)} onChange={(sets) => updateExerciseSets(ex.id, sets)} showWeight />
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-8 text-[10px] font-mono uppercase tracking-wider rounded-xl border-border/40" onClick={() => setSelectedExercise(ex)}>
                          <Play className="w-3 h-3 mr-1" /> Details
                        </Button>
                        <Button size="sm"
                          className={cn("flex-1 h-8 text-[10px] font-mono uppercase tracking-wider rounded-xl transition-colors", savedIds.has(ex.id) && "text-white")}
                          style={savedIds.has(ex.id) ? { backgroundColor: 'hsl(var(--cat-legs))' } : undefined}
                          disabled={savingId === ex.id} onClick={() => saveExerciseLog(ex)}
                        >
                          {savingId === ex.id ? <span className="animate-pulse">Saving...</span> : savedIds.has(ex.id) ? <><Check className="w-3 h-3 mr-1" /> Saved</> : <><Save className="w-3 h-3 mr-1" /> Save Sets</>}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {exercises.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border/30 p-8 text-center">
              <p className="text-xs font-mono text-muted-foreground">No exercises for this day yet</p>
            </div>
          )}
        </div>

        <Button onClick={() => navigate('/planner')} size="lg"
          className="w-full py-6 font-display font-bold uppercase tracking-wider text-sm rounded-2xl text-white"
          style={{ backgroundColor: dayColors[activeDay], boxShadow: `0 0 30px ${dayColors[activeDay]}30` }}
        >
          <Play className="w-4 h-4 mr-2" />Start Day {activeDay} Workout
        </Button>
      </main>

      <ExerciseDetailModal exercise={selectedExercise} open={!!selectedExercise} onClose={() => setSelectedExercise(null)} />
      <ExercisePickerModal open={showPicker} onClose={() => setShowPicker(false)} onSelectExercise={(ex) => setSelectedExercise(ex as Exercise)} />
    </div>
  );
}
