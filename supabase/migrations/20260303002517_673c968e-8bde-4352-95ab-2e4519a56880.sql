
-- Add chain columns to exercises
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS chain_group text;
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS chain_order integer;

-- Add music columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS music_playlist_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS music_enabled boolean DEFAULT true;

-- Index for efficient chain queries
CREATE INDEX IF NOT EXISTS idx_exercises_chain_group ON public.exercises (chain_group, chain_order);
