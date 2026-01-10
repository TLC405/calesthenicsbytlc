-- Add difficulty levels, user exercises support, and progress tracking

-- Add new columns to exercises table
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5);
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS progression_parent_id UUID REFERENCES exercises(id);
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS video_verified BOOLEAN DEFAULT false;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Update exercises RLS to allow user-created exercises
CREATE POLICY "Users can create their own exercises" 
ON public.exercises 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own exercises" 
ON public.exercises 
FOR UPDATE 
USING (auth.uid() = created_by OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete their own exercises" 
ON public.exercises 
FOR DELETE 
USING (auth.uid() = created_by OR has_role(auth.uid(), 'admin'::app_role));

-- Create user exercise progress table for tracking mastery
CREATE TABLE public.user_exercise_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  mastered BOOLEAN DEFAULT false,
  personal_best JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, exercise_id)
);

-- Enable RLS on user_exercise_progress
ALTER TABLE public.user_exercise_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_exercise_progress
CREATE POLICY "Users can view their own progress"
ON public.user_exercise_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress"
ON public.user_exercise_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON public.user_exercise_progress
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress"
ON public.user_exercise_progress
FOR DELETE
USING (auth.uid() = user_id);

-- Add gamification columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_workout_date DATE;

-- Create trigger for updated_at on user_exercise_progress
CREATE TRIGGER update_user_exercise_progress_updated_at
BEFORE UPDATE ON public.user_exercise_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update existing exercises with difficulty levels
UPDATE exercises SET difficulty_level = 1 WHERE category = 'Mobility' OR name ILIKE '%plank%' OR name ILIKE '%dead hang%';
UPDATE exercises SET difficulty_level = 2 WHERE name ILIKE '%push-up%' AND name NOT ILIKE '%archer%' AND name NOT ILIKE '%one-arm%';
UPDATE exercises SET difficulty_level = 2 WHERE name ILIKE '%row%' OR name ILIKE '%squat%';
UPDATE exercises SET difficulty_level = 3 WHERE name ILIKE '%pull-up%' OR name ILIKE '%dip%' OR name ILIKE '%pike%';
UPDATE exercises SET difficulty_level = 3 WHERE name ILIKE '%pistol%' OR name ILIKE '%dragon flag%';
UPDATE exercises SET difficulty_level = 4 WHERE name ILIKE '%muscle-up%' OR name ILIKE '%handstand%' OR name ILIKE '%L-sit%';
UPDATE exercises SET difficulty_level = 4 WHERE name ILIKE '%archer%' OR name ILIKE '%front lever%' OR name ILIKE '%back lever%';
UPDATE exercises SET difficulty_level = 5 WHERE name ILIKE '%planche%' OR name ILIKE '%human flag%' OR name ILIKE '%maltese%' OR name ILIKE '%iron cross%';