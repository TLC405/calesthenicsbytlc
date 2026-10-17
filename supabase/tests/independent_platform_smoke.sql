\set ON_ERROR_STOP on

-- Disposable PostgreSQL validation of the actual independence migration.
DO $ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
END $;
CREATE SCHEMA auth;
GRANT USAGE ON SCHEMA auth TO authenticated, anon;
CREATE FUNCTION auth.uid() RETURNS uuid
  LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
  $$;
GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated;

CREATE TABLE auth.users (id uuid PRIMARY KEY);
INSERT INTO auth.users VALUES
 ('11111111-1111-4111-8111-111111111111'),
 ('22222222-2222-4222-8222-222222222222');

CREATE TABLE public.exercises (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  created_by uuid REFERENCES auth.users(id)
);
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view exercises" ON public.exercises FOR SELECT USING (true);
CREATE POLICY "Owner inserts" ON public.exercises FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Owner updates" ON public.exercises FOR UPDATE TO authenticated
  USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);

INSERT INTO public.exercises (id, name, created_by) VALUES
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Official rings',null),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Alex private skill','11111111-1111-4111-8111-111111111111');

\ir ../migrations/20261017180000_independent_exercises_ai_quota.sql

SET ROLE authenticated;
SET request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
DO $$
BEGIN
  IF (SELECT count(*) FROM public.exercises) <> 1 THEN
    RAISE EXCEPTION 'Other member must only see curated exercise';
  END IF;
END;
$$;

SET request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
DO $$
BEGIN
  IF (SELECT count(*) FROM public.exercises) <> 2 THEN
    RAISE EXCEPTION 'Owner must see their private exercise';
  END IF;
END;
$$;

UPDATE public.exercises SET visibility = 'public'
WHERE id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

SET request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
DO $$
BEGIN
  IF (SELECT count(*) FROM public.exercises) <> 2 THEN
    RAISE EXCEPTION 'Public user submissions should be discoverable';
  END IF;
END;
$$;

-- Verify the daily quota atomically increments to 30 and then denies request 31.
SET request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
DO $$
DECLARE n int;
BEGIN
  FOR n IN 1..30 LOOP
    IF NOT public.consume_ai_request() THEN
      RAISE EXCEPTION 'Quota denied legal request %', n;
    END IF;
  END LOOP;
  IF public.consume_ai_request() THEN
    RAISE EXCEPTION 'Quota exceeded daily limit';
  END IF;
END;
$$;

RESET ROLE;
DO $$
BEGIN
  IF (SELECT requests FROM public.ai_daily_usage
       WHERE user_id = '11111111-1111-4111-8111-111111111111') <> 30 THEN
    RAISE EXCEPTION 'Incorrect usage counter';
  END IF;
END;
$$;

\echo 'Independent exercise visibility and AI quotas PASSED'
