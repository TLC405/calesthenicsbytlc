import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Video, Image, Dumbbell, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Globe2, LockKeyhole } from 'lucide-react';
import { DifficultyBadge, getDifficultyLabel } from './DifficultyBadge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const categories = ['Push', 'Pull', 'Legs', 'Core', 'Skills', 'Mobility', 'Rings', 'Yoga', 'Flexibility'];

const muscles = [
  'Chest', 'Shoulders', 'Triceps', 'Biceps', 'Forearms',
  'Lats', 'Traps', 'Rhomboids', 'Lower Back', 'Abs',
  'Obliques', 'Hip Flexors', 'Glutes', 'Quads', 'Hamstrings', 'Calves'
];

const equipmentOptions = [
  'None (Bodyweight)', 'Pull-up Bar', 'Parallel Bars', 'Rings',
  'Resistance Bands', 'Weight Vest', 'Parallettes'
];

const exerciseSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  category: z.string().min(1, 'Select a category'),
  youtube_url: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  instagram_url: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  image_url: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  cues: z.string().optional(),
});

type ExerciseFormData = z.infer<typeof exerciseSchema>;

export interface EditableExercise {
  id: string;
  created_by?: string | null;
  name: string;
  category: string;
  youtube_url?: string | null;
  instagram_url?: string | null;
  image_url?: string | null;
  cues?: unknown;
  primary_muscles: string[];
  secondary_muscles: string[];
  equipment: string[];
  difficulty_level?: number | null;
  visibility?: 'public' | 'private' | null;
}

interface AddExerciseModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialExercise?: EditableExercise | null;
}

export function AddExerciseModal({ open, onClose, onSuccess, initialExercise }: AddExerciseModalProps) {
  const [difficultyLevel, setDifficultyLevel] = useState(2);
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [secondaryMuscles, setSecondaryMuscles] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const { toast } = useToast();

  const form = useForm<ExerciseFormData>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: '',
      category: '',
      youtube_url: '',
      instagram_url: '',
      image_url: '',
      cues: '',
    },
  });

  useEffect(() => {
    if (!open) return;
    const exercise = initialExercise;
    form.reset({
      name: exercise?.name || '',
      category: exercise?.category || '',
      youtube_url: exercise?.youtube_url || '',
      instagram_url: exercise?.instagram_url || '',
      image_url: exercise?.image_url || '',
      cues: Array.isArray(exercise?.cues) ? exercise.cues.join('\n') : '',
    });
    setDifficultyLevel(exercise?.difficulty_level || 2);
    setSelectedMuscles(exercise?.primary_muscles || []);
    setSecondaryMuscles(exercise?.secondary_muscles || []);
    setSelectedEquipment(exercise?.equipment || []);
    setIsPublic(exercise?.visibility === 'public');
  // Reinitialize only when the selected exercise changes or the modal opens.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialExercise?.id]);

  const toggleMuscle = (muscle: string, isPrimary: boolean) => {
    if (isPrimary) {
      setSelectedMuscles(prev =>
        prev.includes(muscle) ? prev.filter(m => m !== muscle) : [...prev, muscle]
      );
      setSecondaryMuscles(prev => prev.filter(m => m !== muscle));
    } else {
      setSecondaryMuscles(prev =>
        prev.includes(muscle) ? prev.filter(m => m !== muscle) : [...prev, muscle]
      );
      setSelectedMuscles(prev => prev.filter(m => m !== muscle));
    }
  };

  const toggleEquipment = (eq: string) => {
    setSelectedEquipment(prev =>
      prev.includes(eq) ? prev.filter(e => e !== eq) : [...prev, eq]
    );
  };

  const onSubmit = async (data: ExerciseFormData) => {
    if (selectedMuscles.length === 0) {
      toast({
        title: 'Missing muscles',
        description: 'Select at least one primary muscle group',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({
          title: 'Not authenticated',
          description: 'Please sign in to add exercises',
          variant: 'destructive',
        });
        return;
      }

      const slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const cuesArray = data.cues
        ? data.cues.split('\n').filter(c => c.trim())
        : [];

      if (initialExercise && initialExercise.created_by !== userData.user.id) {
        throw new Error('Only the exercise creator can edit this exercise');
      }

      const values = {
        name: data.name.trim(),
        category: data.category,
        youtube_url: data.youtube_url || null,
        instagram_url: data.instagram_url || null,
        image_url: data.image_url || null,
        primary_muscles: selectedMuscles,
        secondary_muscles: secondaryMuscles,
        equipment: selectedEquipment.length > 0 ? selectedEquipment : ['None (Bodyweight)'],
        cues: cuesArray,
        difficulty_level: difficultyLevel,
        visibility: isPublic ? 'public' : 'private',
      };
      const { error } = initialExercise
        ? await supabase.from('exercises').update(values)
            .eq('id', initialExercise.id).eq('created_by', userData.user.id)
        : await supabase.from('exercises').insert({
            ...values, slug: `${slug}-${crypto.randomUUID().slice(0, 8)}`,
            created_by: userData.user.id,
          });

      if (error) throw error;

      toast({
        title: initialExercise ? 'Exercise updated! 💪' : 'Exercise added! 💪',
        description: isPublic
          ? `${data.name} is shared with the community`
          : `${data.name} is saved to your personal library`,
      });

      form.reset();
      setSelectedMuscles([]);
      setSecondaryMuscles([]);
      setSelectedEquipment([]);
      setDifficultyLevel(2);
      setIsPublic(false);
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error adding exercise',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Plus className="w-5 h-5 text-primary" />
            {initialExercise ? 'Edit Your Exercise' : 'Create Your Exercise'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Exercise Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., One-Arm Push-up"
                  {...form.register('name')}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={form.watch('category')}
                  onValueChange={val => form.setValue('category', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Media URLs */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Video className="w-4 h-4" /> Media Links
              </h4>
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="youtube_url" className="text-sm text-muted-foreground">
                    YouTube URL
                  </Label>
                  <Input
                    id="youtube_url"
                    placeholder="https://youtube.com/watch?v=..."
                    {...form.register('youtube_url')}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="instagram_url" className="text-sm text-muted-foreground">
                    Instagram URL
                  </Label>
                  <Input
                    id="instagram_url"
                    placeholder="https://instagram.com/p/..."
                    {...form.register('instagram_url')}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="image_url" className="text-sm text-muted-foreground">
                    <Image className="w-3 h-3 inline mr-1" /> Image URL
                  </Label>
                  <Input
                    id="image_url"
                    placeholder="https://..."
                    {...form.register('image_url')}
                  />
                </div>
              </div>
            </div>

            {/* Difficulty */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Difficulty Level</Label>
                <DifficultyBadge level={difficultyLevel} size="md" />
              </div>
              <Slider
                value={[difficultyLevel]}
                onValueChange={([val]) => setDifficultyLevel(val)}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Beginner</span>
                <span>Master</span>
              </div>
            </div>

            {/* Primary Muscles */}
            <div className="space-y-3">
              <Label>Primary Muscles *</Label>
              <div className="flex flex-wrap gap-2">
                {muscles.map(muscle => (
                  <Badge
                    key={muscle}
                    variant={selectedMuscles.includes(muscle) ? 'default' : 'outline'}
                    className="cursor-pointer transition-all hover:scale-105"
                    onClick={() => toggleMuscle(muscle, true)}
                  >
                    {muscle}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Secondary Muscles */}
            <div className="space-y-3">
              <Label className="text-muted-foreground">Secondary Muscles (optional)</Label>
              <div className="flex flex-wrap gap-2">
                {muscles.filter(m => !selectedMuscles.includes(m)).map(muscle => (
                  <Badge
                    key={muscle}
                    variant={secondaryMuscles.includes(muscle) ? 'secondary' : 'outline'}
                    className="cursor-pointer opacity-70 hover:opacity-100 transition-all"
                    onClick={() => toggleMuscle(muscle, false)}
                  >
                    {muscle}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Equipment */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4" /> Equipment
              </Label>
              <div className="flex flex-wrap gap-2">
                {equipmentOptions.map(eq => (
                  <Badge
                    key={eq}
                    variant={selectedEquipment.includes(eq) ? 'default' : 'outline'}
                    className="cursor-pointer transition-all hover:scale-105"
                    onClick={() => toggleEquipment(eq)}
                  >
                    {eq}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Visibility: a member's custom exercise is private by default. */}
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-accent/30 p-4">
              <div className="flex min-w-0 items-start gap-3">
                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                  {isPublic ? <Globe2 className="h-4 w-4" /> : <LockKeyhole className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm font-semibold">{isPublic ? 'Share with the community' : 'Private to you'}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {isPublic
                      ? 'Other members can discover and use your exercise. You can switch it back to private.'
                      : 'Only you can see this exercise. Turn on sharing when you want others to discover it.'}
                  </p>
                </div>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} aria-label="Share exercise publicly" />
            </div>

            {/* Form Cues */}
            <div className="space-y-2">
              <Label htmlFor="cues">Form Cues (one per line)</Label>
              <Textarea
                id="cues"
                placeholder="Keep core tight&#10;Squeeze at the top&#10;Full range of motion"
                rows={4}
                {...form.register('cues')}
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {initialExercise ? 'Saving...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    {initialExercise ? 'Save Exercise' : 'Create Exercise'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}