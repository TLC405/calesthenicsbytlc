-- Add video/image URL columns to exercises table
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS image_url TEXT;