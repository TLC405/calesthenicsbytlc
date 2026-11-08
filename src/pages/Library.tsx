import { ResultPager } from '@/components/Exercise/ResultPager';
import { pageSlice } from '@/lib/skillBrowse';
import { movementTutorialSources } from '@/lib/movementThumbnails';
import { matchesProgression, canonicalSlug } from '@/lib/exerciseProgressions';
import { resolveTutorialUrl, tutorialState } from '@/lib/mediaAudit';
import { exerciseReadinessReasons } from '@/lib/trainingPolicy';
import { addWorkoutMovement, readWorkoutDraft, writeWorkoutDraft } from '@/lib/workoutWorkspace';
import { readTrainingProfile, trainingBlockers } from '@/lib/skillGraph';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase, backendConfigured } from '@/integrations/supabase/client';
import { LOCAL_USER_ID, starterExercises, getLocalCustomExercises, removeLocalExercise, exportLocalExercises } from '@/lib/offlineExercises';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Sparkles, Download, Pencil, Trash2, LockKeyhole, Globe2, UserRound, PlayCircle, Dumbbell } from 'lucide-react';
import { ExerciseCard } from '@/components/Exercise/ExerciseCard';
import { ExerciseDetailModal } from '@/components/Exercise/ExerciseDetailModal';
import { CategoryTabs, matchesExerciseCategory } from '@/components/Exercise/CategoryTabs';
import { AddExerciseModal, type EditableExercise } from '@/components/Exercise/AddExerciseModal';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from 'sonner';
import publicCatalog from '@/data/publicExerciseCatalog.json';
import { SKILL_PATHS } from '@/data/skillPaths';
import { ArrowRight, Target } from 'lucide-react';

interface Exercise {
  id: string; name: string; slug: string; category: string;
  primary_muscles: string[]; secondary_muscles: string[]; equipment: string[];
  cues: any; youtube_url?: string | null; instagram_url?: string | null;
  image_url?: string | null; difficulty_level?: number; sets_reps?: string | null;
  description?: string | null; stabilizer_muscles?: string[] | null;
  created_by?: string | null; visibility?: 'private' | 'public';
  tendons_involved?: string[] | null; recovery_muscle?: string | null;
  recovery_tendon?: string | null; recovery_nervous?: string | null;
}

const difficultyLabel = ['', 'Beginner', 'Easy', 'Intermediate', 'Advanced', 'Elite'];

function mergeCatalog(remote: Exercise[] = [], includeLocal = true): Exercise[] {
  // Rich media from the catalog/cloud must not be overwritten by starter placeholders.
  const records = [...starterExercises, ...publicCatalog, ...remote,
    ...(includeLocal ? getLocalCustomExercises() : [])] as Exercise[];
  const bySlug = new Map<string, Exercise>();
  for (const item of records) {
    const previous = bySlug.get(item.slug);
    bySlug.set(item.slug, { ...previous, ...item,
      image_url: item.image_url || previous?.image_url || null,
      youtube_url: item.youtube_url || previous?.youtube_url || null,
      instagram_url: item.instagram_url || previous?.instagram_url || null,
    });
  }
  return [...bySlug.values()].map(e=>({...e,youtube_url:resolveTutorialUrl(e.slug,e.youtube_url)}));
}

export default function Library({embedded=false}:{embedded?:boolean}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [page,setPage]=useState(0);
  const [exercises, setExercises] = useState<Exercise[]>(() => mergeCatalog());
  const guestMode = !user;
  const [profile,setProfile]=useState(readTrainingProfile);
  useEffect(()=>{const sync=()=>setProfile(readTrainingProfile());window.addEventListener('power-training-profile',sync);return()=>window.removeEventListener('power-training-profile',sync);},[]);
  const [workoutSlugs,setWorkoutSlugs]=useState(()=>readWorkoutDraft(user?.id||'guest').map(i=>i.exercise.slug));
  useEffect(()=>{const sync=()=>setWorkoutSlugs(readWorkoutDraft(user?.id||'guest').map(i=>i.exercise.slug));sync();window.addEventListener('power-workout-draft',sync);return()=>window.removeEventListener('power-workout-draft',sync);},[user?.id]);
  const ownerId = user?.id ?? LOCAL_USER_ID;
  const [syncState, setSyncState] = useState<'refreshing' | 'ready' | 'offline' | 'error'>('refreshing');
  const requestId = useRef(0);
  const requestController = useRef<AbortController | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>((location.state as { search?: string } | null)?.search || '');
  const [activeCategory, setActiveCategory] = useState<string | null>((location.state as any)?.category || null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [mineOnly, setMineOnly] = useState(() => new URLSearchParams(location.search).get('mine') === '1');
  const [videosOnly, setVideosOnly] = useState(false);
  const [showAliases,setShowAliases]=useState(false);
  const [pathId,setPathId]=useState(new URLSearchParams(location.search).get('progression')||'');

  const fetchExercises = useCallback(async () => {
    const currentRequest = ++requestId.current;
    requestController.current?.abort();
    setExercises(mergeCatalog([], !user));
    if (!backendConfigured) {
      setSyncState('offline');
      return;
    }
    setSyncState('refreshing');
    const controller = new AbortController();
    requestController.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    try {
      const { data, error } = await supabase.from('exercises').select('*')
        .order('category').order('name').abortSignal(controller.signal);
      if (currentRequest !== requestId.current) return;
      if (error) { setSyncState('error'); return; }
      setExercises(mergeCatalog((data || []) as Exercise[], !user));
      setSyncState('ready');
    } catch {
      if (currentRequest === requestId.current) setSyncState('error');
    } finally {
      window.clearTimeout(timeout);
    }
  }, [user?.id]);

  useEffect(() => {
    void fetchExercises();
    return () => { ++requestId.current; requestController.current?.abort(); };
  }, [fetchExercises]);

  const categories = [...new Set(exercises.map(e => e.category))];
  const categoryCounts = exercises.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + 1; return acc; }, {} as Record<string, number>);

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.primary_muscles.some(m => m.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = matchesExerciseCategory(exercise,activeCategory);
    const matchesOwner = !mineOnly || exercise.created_by === ownerId;
    const matchesVideo = !videosOnly || movementTutorialSources(exercise).some(source=>source.url);
    return (showAliases||canonicalSlug(exercise.slug)===exercise.slug) && matchesSearch && matchesCategory && matchesOwner && matchesVideo && matchesProgression(exercise.slug,pathId);
  });

  useEffect(()=>setPage(0),[searchTerm,activeCategory,mineOnly,videosOnly,pathId,showAliases]);
  const resultPage=pageSlice(filteredExercises,page,10);

  const handleAddToWorkout = (exercise: Exercise) => {
    const profile=readTrainingProfile();const reasons=exerciseReadinessReasons(exercise,profile);
    if(reasons.length){toast.info(reasons[0]+' Review your working level in Settings.');return false;}
    const owner=user?.id||'guest';const draft=readWorkoutDraft(owner);
    const next=addWorkoutMovement(draft,exercise.slug,'skill',profile);
    if(next!==draft){try{writeWorkoutDraft(owner,next);toast.success('Added to your Home workout',{action:{label:'View workout',onClick:()=>navigate('/?view=workout')}});return true;}catch{toast.error('Could not save this movement. Your current workout is preserved.');return false;}}
    if(publicCatalog.some(e=>canonicalSlug(e.slug)===canonicalSlug(exercise.slug))){toast.info(draft.some(i=>i.exercise.slug===canonicalSlug(exercise.slug))?'Already in your Home workout.':'Review the movement’s starting checks before adding it.');return false;}
    // Personal movements outside the included catalog retain the custom-plan flow.
    sessionStorage.setItem('powa-builder-import',JSON.stringify({items:[{name:exercise.name,section:'workout',exercise}]}));navigate('/planner');return true;
  };

  const deleteExercise = async (exercise: Exercise) => {
    if (!ownerId || exercise.created_by !== ownerId) return;
    if (!window.confirm(`Delete "${exercise.name}"? ${guestMode ? 'This cannot be undone without a local backup.' : 'Training history linked to it may also be removed.'}`)) return;
    if (guestMode) {
      removeLocalExercise(exercise.id);
      toast.success('Removed from this device');
      void fetchExercises();
      return;
    }
    const { data, error } = await supabase.from('exercises')
      .delete().eq('id', exercise.id).eq('created_by', ownerId).select('id');
    if (error || !data?.length) {
      toast.error(error?.message || 'Could not delete your exercise');
      return;
    }
    toast.success('Your exercise has been deleted');
    void fetchExercises();
  };

  const downloadExerciseList = () => {
    const data = filteredExercises.map(e => ({
      Name: e.name, Category: e.category, Difficulty: difficultyLabel[e.difficulty_level || 1],
      'Primary Muscles': e.primary_muscles.join('; '), 'Secondary Muscles': e.secondary_muscles.join('; '),
      Equipment: e.equipment.join('; '), 'Sets/Reps': e.sets_reps || '', Description: e.description || '',
      'YouTube URL': e.youtube_url || '',
    }));
    const headers = Object.keys(data[0] || {});
    const csvRows = [headers.join(','), ...data.map(row => headers.map(h => `"${String((row as any)[h] || '').replace(/"/g, '""')}"`).join(','))];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `power-exercises${activeCategory ? `-${activeCategory.toLowerCase()}` : ''}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${data.length} exercises`);
  };

  return (
    <div className={`power-movement-library ${embedded?'is-embedded':''}`}>
      <header className="power-library-head relative bg-background border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 py-5 space-y-4">
          {!embedded&&<div className="flex items-center justify-between gap-3"><div className="min-w-0"><h1 className="font-display text-2xl font-bold">Find a movement</h1><p className="text-xs text-muted-foreground mt-1">{exercises.filter(e=>showAliases||canonicalSlug(e.slug)===e.slug).length} movements</p></div><Button variant="outline" className="min-h-12 shrink-0" onClick={()=>navigate('/skills')}><Target className="w-4 h-4 mr-2"/>Skills</Button></div>}
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/><Input aria-label="Search exercises" placeholder="Search exercises…" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="pl-10 h-12 rounded-xl"/></div>
          <CategoryTabs exercises={exercises.filter(e=>showAliases||canonicalSlug(e.slug)===e.slug)} categories={categories} activeCategory={activeCategory} onCategoryChange={setActiveCategory} counts={categoryCounts}/>
          <details className="power-library-tools"><summary className="min-h-12 flex items-center cursor-pointer font-bold text-sm">Filters and tools</summary><div className="space-y-3 pt-3">
            <label className="block text-xs font-bold mb-3">Progression<select className="w-full h-12 border rounded-xl bg-card px-3 mt-2" value={pathId} onChange={e=>setPathId(e.target.value)}><option value="">All progression families</option>{SKILL_PATHS.map(path=><option key={path.id} value={path.id}>{path.title}</option>)}</select></label>
        <label className="flex min-h-11 items-center gap-3 text-xs mb-2"><input type="checkbox" className="h-5 w-5" checked={showAliases} onChange={e=>setShowAliases(e.target.checked)}/>Include legacy duplicate records</label>
            <div className="flex flex-wrap gap-2"><Button variant={videosOnly?'default':'outline'} className="min-h-12" aria-pressed={videosOnly} onClick={()=>setVideosOnly(v=>!v)}><PlayCircle className="h-4 w-4 mr-2"/>With tutorials</Button><Button variant={mineOnly?'default':'outline'} className="min-h-12" aria-pressed={mineOnly} onClick={()=>setMineOnly(v=>!v)}>My exercises</Button><Button variant="outline" className="min-h-12" onClick={()=>{setEditingExercise(null);setShowAddModal(true);}}><Plus className="h-4 w-4 mr-2"/>New movement</Button><Button variant="outline" className="min-h-12" disabled={!filteredExercises.length} onClick={downloadExerciseList}><Download className="h-4 w-4 mr-2"/>Export</Button></div>
            {(activeCategory||mineOnly||videosOnly)&&<Button variant="ghost" className="min-h-12" onClick={()=>{setActiveCategory(null);setMineOnly(false);setVideosOnly(false);}}>Clear filters</Button>}
          </div></details>
        </div>
      </header>
      <main className="power-library-results max-w-6xl mx-auto px-3 sm:px-4 md:px-8 py-3 sm:py-5 pb-32 md:pb-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground" role="status" aria-live="polite">
          <span>{syncState === 'refreshing' ? 'Refreshing your saved movements…' : syncState === 'error' ? 'Included movements are ready. Saved movements could not connect.' : syncState === 'offline' ? 'Included and device-saved movements' : `${filteredExercises.length} movements`}</span>
          {syncState === 'error' && <Button type="button" variant="outline" size="sm" onClick={() => void fetchExercises()}>Reconnect library</Button>}
        </div>
        {guestMode&&!embedded&&<details className="power-device-note"><summary>Saved on this device · backup options</summary><p>Your custom movements stay in this browser. Export a copy before clearing browser data.</p><Button type="button" variant="outline" size="sm" onClick={()=>exportLocalExercises()}><Download size={15}/>Back up my movements</Button></details>}
        {filteredExercises.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-muted-foreground text-xs font-mono">{mineOnly ? 'No personal exercises are available for this session.' : 'No exercises match these filters.'}</p>
            {mineOnly && guestMode && <p className="mx-auto mt-3 max-w-md text-xs leading-relaxed text-muted-foreground">Personal exercises saved at another app address do not automatically appear here. This view shows items saved in this browser at this address.</p>}
            <Button className="mt-4 mx-2 rounded-xl" variant="outline" onClick={() => { setSearchTerm(''); setActiveCategory(null); setVideosOnly(false); setMineOnly(false);setPathId(''); }}>Show all exercises</Button>
            {ownerId && mineOnly && (
              <Button className="mt-4 rounded-xl" onClick={() => { setEditingExercise(null); setShowAddModal(true); }}>
                <Plus className="mr-2 h-4 w-4" /> Create your first exercise
              </Button>
            )}
          </div>
        ) : (
          <div className="power-exercise-rows">
            {resultPage.items.map(exercise => (
              <div key={exercise.id} className="power-library-record">
                <ExerciseCard exercise={exercise} addDisabledReason={publicCatalog.some(e=>e.slug===exercise.slug)?trainingBlockers(canonicalSlug(exercise.slug),profile,true)[0]:exerciseReadinessReasons(exercise,profile)[0]} onViewDetails={setSelectedExercise} onAddToWorkout={handleAddToWorkout} isAdded={workoutSlugs.includes(canonicalSlug(exercise.slug))} />
                {ownerId && exercise.created_by === ownerId && (
                  <div className="power-library-owner-tools">
                    <span title={exercise.visibility === 'public' ? 'Shared with members' : 'Private exercise'}
                      className="flex h-8 items-center gap-1 rounded-lg bg-card/95 px-2 text-[9px] font-semibold shadow-lg backdrop-blur-md">
                      {exercise.visibility === 'public' ? <Globe2 className="h-3.5 w-3.5" /> : <LockKeyhole className="h-3.5 w-3.5" />}
                      <span className="hidden sm:inline">{exercise.visibility === 'public' ? 'Shared' : 'Private'}</span>
                    </span>
                    <button type="button" title="Edit your exercise" aria-label={`Edit ${exercise.name}`}
                      onClick={e => { e.stopPropagation(); setEditingExercise(exercise); setShowAddModal(true); }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-card/95 text-foreground shadow-lg backdrop-blur-md hover:text-primary">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" title="Delete your exercise" aria-label={`Delete ${exercise.name}`}
                      onClick={e => { e.stopPropagation(); void deleteExercise(exercise); }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-card/95 text-foreground shadow-lg backdrop-blur-md hover:text-red-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <ResultPager result={resultPage} onPage={next=>{setPage(next);document.querySelector('.power-library-results')?.scrollIntoView({block:'start'});}}/>
      </main>

      <ExerciseDetailModal workoutSlugs={workoutSlugs} exercise={selectedExercise} open={!!selectedExercise} onClose={() => setSelectedExercise(null)} onAddToWorkout={handleAddToWorkout} />
      <AddExerciseModal open={showAddModal}
        initialExercise={editingExercise as EditableExercise | null}
        onClose={() => { setShowAddModal(false); setEditingExercise(null); }}
        onSuccess={fetchExercises} />

    </div>
  );
}
