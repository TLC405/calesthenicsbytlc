
-- Phase 1: Add enrichment columns to exercises table
ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS stabilizer_muscles text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS tendons_involved text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS recovery_muscle text,
  ADD COLUMN IF NOT EXISTS recovery_tendon text,
  ADD COLUMN IF NOT EXISTS recovery_nervous text,
  ADD COLUMN IF NOT EXISTS sets_reps text,
  ADD COLUMN IF NOT EXISTS description text;

-- Learning Principles table
CREATE TABLE public.learning_principles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  micro_summary text NOT NULL,
  why_it_works text NOT NULL,
  how_to_apply text NOT NULL,
  when_to_use text NOT NULL DEFAULT 'always',
  caution text,
  sources text[] DEFAULT '{}'::text[],
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.learning_principles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view learning principles" ON public.learning_principles FOR SELECT USING (true);
CREATE POLICY "Admins can manage learning principles" ON public.learning_principles FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Non-Negotiables table
CREATE TABLE public.non_negotiables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  short_cue text NOT NULL,
  violations text[] DEFAULT '{}'::text[],
  fix text NOT NULL,
  applies_to text[] DEFAULT '{}'::text[],
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.non_negotiables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view non negotiables" ON public.non_negotiables FOR SELECT USING (true);
CREATE POLICY "Admins can manage non negotiables" ON public.non_negotiables FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Integrity Blocks table (mobility/yoga routines)
CREATE TABLE public.integrity_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  duration text NOT NULL,
  drills text[] DEFAULT '{}'::text[],
  key_cues text[] DEFAULT '{}'::text[],
  applies_to_days text[] DEFAULT '{}'::text[],
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.integrity_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view integrity blocks" ON public.integrity_blocks FOR SELECT USING (true);
CREATE POLICY "Admins can manage integrity blocks" ON public.integrity_blocks FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Training Days table (4+1 day stacked cycle)
CREATE TABLE public.training_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_key text UNIQUE NOT NULL,
  label text NOT NULL,
  title text NOT NULL,
  emphasis text NOT NULL,
  exercise_categories text[] DEFAULT '{}'::text[],
  integrity_block_slugs text[] DEFAULT '{}'::text[],
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.training_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view training days" ON public.training_days FOR SELECT USING (true);
CREATE POLICY "Admins can manage training days" ON public.training_days FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
