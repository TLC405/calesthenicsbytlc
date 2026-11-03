CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  author_name text NOT NULL DEFAULT 'Athlete',
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read messages" ON public.messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users post own messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own messages" ON public.messages FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.message_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.message_likes TO authenticated;
GRANT ALL ON public.message_likes TO service_role;
ALTER TABLE public.message_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read likes" ON public.message_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users like as themselves" ON public.message_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users unlike own" ON public.message_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  actor_id uuid,
  kind text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  body text,
  message_id uuid REFERENCES public.messages(id) ON DELETE CASCADE,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own notifications" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Send a notification to everyone who liked a message (author only)
CREATE OR REPLACE FUNCTION public.notify_message_likers(_message_id uuid, _title text, _body text)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n integer;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM messages WHERE id = _message_id AND (user_id = auth.uid() OR has_role(auth.uid(),'admin'))) THEN
    RAISE EXCEPTION 'Only the message author can notify likers';
  END IF;
  IF char_length(coalesce(_title,'')) < 1 OR char_length(_title) > 120 OR char_length(coalesce(_body,'')) > 500 THEN
    RAISE EXCEPTION 'Invalid title or body length';
  END IF;
  INSERT INTO notifications (user_id, actor_id, kind, title, body, message_id)
  SELECT l.user_id, auth.uid(), 'broadcast', _title, _body, _message_id
  FROM message_likes l WHERE l.message_id = _message_id AND l.user_id <> auth.uid();
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$;
REVOKE EXECUTE ON FUNCTION public.notify_message_likers(uuid,text,text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.notify_message_likers(uuid,text,text) TO authenticated;

-- Tell authors when someone likes their message
CREATE OR REPLACE FUNCTION public.on_message_liked()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE author uuid;
BEGIN
  SELECT user_id INTO author FROM messages WHERE id = NEW.message_id;
  IF author IS NOT NULL AND author <> NEW.user_id THEN
    INSERT INTO notifications (user_id, actor_id, kind, title, message_id)
    VALUES (author, NEW.user_id, 'like', 'Someone liked your message', NEW.message_id);
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_message_liked AFTER INSERT ON public.message_likes FOR EACH ROW EXECUTE FUNCTION public.on_message_liked();

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;