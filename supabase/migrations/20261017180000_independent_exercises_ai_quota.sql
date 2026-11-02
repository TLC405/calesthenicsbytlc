-- Independent hosting: community exercises private by default and quotas for self-funded OpenAI calls.
ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('private', 'public'));
CREATE INDEX IF NOT EXISTS exercises_owner_visibility_idx
  ON public.exercises (created_by, visibility);

-- Existing curated exercises stay public; user submissions remain private unless opted in.
DROP POLICY IF EXISTS "Anyone can view exercises" ON public.exercises;
CREATE POLICY "View curated shared and personal exercises"
  ON public.exercises FOR SELECT TO authenticated
  USING (created_by IS NULL OR visibility = 'public' OR created_by = (select auth.uid()));
CREATE POLICY "Guests view curated and shared exercises"
  ON public.exercises FOR SELECT TO anon
  USING (created_by IS NULL OR visibility = 'public');

-- Prevent changing authorship after creation: a member cannot make their
-- custom record look like a built-in exercise, nor take over another record.
CREATE FUNCTION public.protect_exercise_author()
RETURNS trigger LANGUAGE plpgsql SET search_path = ''
AS $$
BEGIN
  IF NEW.created_by IS DISTINCT FROM OLD.created_by THEN
    RAISE EXCEPTION 'Exercise ownership cannot be changed';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS protect_exercise_author ON public.exercises;
CREATE TRIGGER protect_exercise_author
BEFORE UPDATE ON public.exercises
FOR EACH ROW EXECUTE FUNCTION public.protect_exercise_author();

-- The server checks an authenticated member's daily budget before calling OpenAI.
CREATE TABLE public.ai_daily_usage (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date date NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date,
  requests integer NOT NULL DEFAULT 0 CHECK (requests >= 0),
  PRIMARY KEY (user_id, usage_date)
);
ALTER TABLE public.ai_daily_usage ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ai_daily_usage FROM anon, authenticated;
CREATE FUNCTION public.consume_ai_request()
RETURNS boolean LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  accepted int;
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  INSERT INTO public.ai_daily_usage (user_id, usage_date, requests)
  VALUES (auth.uid(), (now() AT TIME ZONE 'UTC')::date, 1)
  ON CONFLICT (user_id, usage_date)
  DO UPDATE SET requests = public.ai_daily_usage.requests + 1
  WHERE public.ai_daily_usage.requests < 30
  RETURNING requests INTO accepted;
  RETURN accepted IS NOT NULL;
END;
$$;
REVOKE ALL ON FUNCTION public.consume_ai_request() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_ai_request() TO authenticated;
