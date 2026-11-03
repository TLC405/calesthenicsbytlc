import { exerciseReadinessReasons } from '@/lib/trainingPolicy';
import { readTrainingProfile } from '@/lib/skillGraph';
import { exerciseLabel } from '@/lib/exerciseLabels';
import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CategoryTabs, CATEGORY_GROUPS } from '@/components/Exercise/CategoryTabs';
import { supabase, backendConfigured } from '@/integrations/supabase/client';
import { getOfflineExercises } from '@/lib/offlineExercises';
import publicCatalog from '@/data/publicExerciseCatalog.json';
import { ExerciseArtwork } from '@/components/Exercise/ExerciseArtwork';

interface Exercise {
  id: string;
  name: string;
  slug: string;
  category: string;
  primary_muscles: string[];
  youtube_url?: string | null;
}

interface ExercisePickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: Exercise) => void;
}

export function ExercisePickerModal({ open, onClose, onSelectExercise }: ExercisePickerModalProps) {
  const merge = (remote:Exercise[]=[]) => {
    const map=new Map<string,Exercise>();
    for(const e of [...getOfflineExercises(),...publicCatalog,...remote]){const old=map.get(e.slug);map.set(e.slug,{...old,...e,youtube_url:e.youtube_url||old?.youtube_url});}
    return [...map.values()];
  };
  const [exercises,setExercises]=useState<Exercise[]>(()=>merge());
  const [searchTerm,setSearchTerm]=useState('');
  const [activeCategory,setActiveCategory]=useState<string|null>(null);
  useEffect(()=>{
    if(!open||!backendConfigured)return;
    const controller=new AbortController();
    const timeout=window.setTimeout(()=>controller.abort(),8000);
    void (async()=>{try {
      const {data}=await supabase.from('exercises').select('*').order('name').abortSignal(controller.signal);
      if(!controller.signal.aborted&&data)setExercises(merge(data));
    } catch { /* Included movements remain available. */ } finally {window.clearTimeout(timeout);}})();
    return()=>{controller.abort();window.clearTimeout(timeout);};
  },[open]);

  const profile=readTrainingProfile();
  const categories = [...new Set(exercises.map(e => e.category))];

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.primary_muscles.some(m => m.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !activeCategory || (CATEGORY_GROUPS[activeCategory] ? CATEGORY_GROUPS[activeCategory].includes(exercise.category) : exercise.category === activeCategory);
    return matchesSearch && matchesCategory && !exerciseReadinessReasons(exercise,profile).length;
  });

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-lg max-h-[90dvh] flex flex-col min-h-0 overflow-hidden rounded-2xl p-0">
        <DialogHeader className="p-3 sm:p-4 pb-0">
          <DialogTitle>Add Exercise</DialogTitle><p className="text-xs text-muted-foreground">Showing movements for L{profile.tier||1} and your readiness checks.</p>
        </DialogHeader>

        <div className="px-3 sm:px-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 neumorph-inset"
            />
          </div>

          <details><summary className="min-h-11 flex items-center cursor-pointer text-sm">Filter movements</summary><CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          /></details>
        </div>

        {/* Exercise List */}
        <ScrollArea className="flex-1 min-h-0 px-3 sm:px-4 pb-4">
          {filteredExercises.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No exercises found</div>
          ) : (
            <div className="space-y-2 pt-2">
              {filteredExercises.map((exercise) => {
                return (
                  <button
                    key={exercise.id}
                    onClick={() => {
                      onSelectExercise(exercise);
                      onClose();
                    }}
                    className="w-full flex min-h-14 items-center gap-3 p-2.5 rounded-xl power-elevated hover:bg-primary/5 transition-colors text-left"
                  >
                    <div className="w-14 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                      <ExerciseArtwork compact title={exercise.name} category={exerciseLabel(exercise.slug,exercise.category)} youtubeUrl={exercise.youtube_url}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{exercise.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {exerciseLabel(exercise.slug,exercise.category)} • {exercise.primary_muscles.join(', ')}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
