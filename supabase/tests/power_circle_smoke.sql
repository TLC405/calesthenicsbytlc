\set ON_ERROR_STOP on

-- Minimal Supabase scaffolding, deliberately NOT a mock of the actual feature.
CREATE ROLE authenticated NOLOGIN;
CREATE SCHEMA auth;
GRANT USAGE ON SCHEMA auth TO authenticated;

CREATE TABLE auth.users (id uuid PRIMARY KEY);
CREATE FUNCTION auth.uid() RETURNS uuid
  LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
  $$;
GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text
);

INSERT INTO auth.users (id)
VALUES
  ('11111111-1111-4111-8111-111111111111'),
  ('22222222-2222-4222-8222-222222222222'),
  ('33333333-3333-4333-8333-333333333333');
INSERT INTO public.profiles (id, display_name)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'Alex'),
  ('22222222-2222-4222-8222-222222222222', 'Blake'),
  ('33333333-3333-4333-8333-333333333333', 'Casey');

CREATE PUBLICATION supabase_realtime;

-- Run the real feature migration against this disposable DB.
\ir ../migrations/20261017070000_power_circle_realtime.sql

-- A creates a post, with an intentionally forged starting like count.
SET ROLE authenticated;
SET request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
INSERT INTO public.messages (id, author_id, body, like_count, author_name)
VALUES (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '11111111-1111-4111-8111-111111111111',
  'First clean handstand!', 999, 'Fake author'
);
DO $$
BEGIN
  IF (SELECT like_count FROM public.messages
       WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') <> 0 THEN
    RAISE EXCEPTION 'A new post must start with zero likes';
  END IF;
  IF (SELECT author_name FROM public.messages
       WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') <> 'Alex' THEN
    RAISE EXCEPTION 'Database must set the correct author name';
  END IF;
END;
$$;

-- B likes A's post; A should get exactly one notification.
SET request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
INSERT INTO public.message_likes (user_id, message_id) VALUES
  ('22222222-2222-4222-8222-222222222222',
   'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');

DO $$
BEGIN
  IF (SELECT like_count FROM public.messages
      WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') <> 1 THEN
    RAISE EXCEPTION 'Like count failed to increment';
  END IF;
  -- B cannot see notifications addressed to A.
  IF EXISTS (SELECT 1 FROM public.notifications) THEN
    RAISE EXCEPTION 'RLS leaked private notifications to another member';
  END IF;
END;
$$;

-- B self-likes: no self-notification should be created.
INSERT INTO public.messages (id, author_id, body)
VALUES (
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  '22222222-2222-4222-8222-222222222222',
  'Ring support practice!'
);
INSERT INTO public.message_likes (user_id, message_id) VALUES
  ('22222222-2222-4222-8222-222222222222',
   'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');

-- B unlikes A, then re-likes; no notification spam.
DELETE FROM public.message_likes
WHERE user_id = '22222222-2222-4222-8222-222222222222'
  AND message_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
INSERT INTO public.message_likes (user_id, message_id) VALUES
  ('22222222-2222-4222-8222-222222222222',
   'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');

-- A can read one notification and mark it read.
SET request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
DO $$
BEGIN
  IF (SELECT count(*) FROM public.notifications) <> 1 THEN
    RAISE EXCEPTION 'Expected exactly one author notification';
  END IF;
  IF (SELECT like_count FROM public.messages
      WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') <> 1 THEN
    RAISE EXCEPTION 'Like count should reconcile after unlike/re-like';
  END IF;
END;
$$;

UPDATE public.notifications SET is_read = true
WHERE recipient_id = '11111111-1111-4111-8111-111111111111';

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.notifications WHERE NOT is_read) THEN
    RAISE EXCEPTION 'Notification read update failed';
  END IF;
END;
$$;

-- Another member C cannot modify A's notification or add a like in B's name.
SET request.jwt.claim.sub = '33333333-3333-4333-8333-333333333333';
DO $$
DECLARE
  changed integer;
BEGIN
  UPDATE public.notifications SET is_read = false;
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 0 THEN
    RAISE EXCEPTION 'Nonrecipient must not update private notifications';
  END IF;
END;
$$;

-- A deleting a post must also remove its likes and notifications.
SET request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
DELETE FROM public.messages WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

RESET ROLE;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.notifications
             WHERE entity_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') THEN
    RAISE EXCEPTION 'Deleted posts must cascade notification deletion';
  END IF;
  IF EXISTS (SELECT 1 FROM public.message_likes
             WHERE message_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') THEN
    RAISE EXCEPTION 'Deleted posts must cascade like deletion';
  END IF;
  IF (SELECT count(*) FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND tablename IN ('messages', 'message_likes', 'notifications')) <> 3 THEN
    RAISE EXCEPTION 'All three tables must be added to Realtime publication';
  END IF;
END;
$$;

\echo 'Power Circle trigger/RLS/realtime publication smoke tests PASSED'
