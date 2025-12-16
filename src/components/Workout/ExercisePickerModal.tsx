import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CategoryTabs } from '@/components/Exercise/CategoryTabs';
import { supabase } from '@/integrations/supabase/client';

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

const getYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export function ExercisePickerModal({ open, onClose, onSelectExercise }: ExercisePickerModalProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchExercises();
    }
  }, [open]);

  const fetchExercises = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('exercises')
      .select('id, name, slug, category, primary_muscles, youtube_url')
      .order('category')
      .order('name');
    
    setExercises(data || []);
    setLoading(false);
  };

  const categories = [...new Set(exercises.map(e => e.category))];

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.primary_muscles.some(m => m.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !activeCategory || exercise.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>Add Exercise</DialogTitle>
        </DialogHeader>

        <div className="px-4 space-y-4">
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

          {/* Category Tabs */}
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>

        {/* Exercise List */}
        <ScrollArea className="flex-1 px-4 pb-4">
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading exercises...</div>
          ) : filteredExercises.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No exercises found</div>
          ) : (
            <div className="space-y-2 pt-2">
              {filteredExercises.map((exercise) => {
                const videoId = exercise.youtube_url ? getYouTubeVideoId(exercise.youtube_url) : null;
                const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/default.jpg` : null;

                return (
                  <button
                    key={exercise.id}
                    onClick={() => {
                      onSelectExercise(exercise);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 p-2 rounded-lg neumorph-flat hover:bg-primary/5 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                      {thumbnailUrl ? (
                        <img src={thumbnailUrl} alt={exercise.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground">
                          {exercise.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{exercise.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {exercise.category} • {exercise.primary_muscles.join(', ')}
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
