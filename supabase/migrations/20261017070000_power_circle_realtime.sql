-- I GOT THE POWER / Power Circle
-- Apply this migration in Lovable Cloud (Supabase) BEFORE merging frontend changes.
-- User-authored public training posts, one like per user, and private notifications.
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name text NOT NULL DEFAULT 'Athlete',
  body text NOT NULL CHECK (char_length(btrim(body)) BETWEEN 1 AND 2000),
  like_count integer NOT NULL DEFAULT 0 CHECK (like_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX messages_recent_idx ON public.messages (created_at DESC, id DESC);
CREATE INDEX messages_popular_idx ON public.messages (like_count DESC, created_at DESC);

CREATE TABLE public.message_likes (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, message_id)
);
CREATE INDEX message_likes_message_idx ON public.message_likes (message_id);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('message_like')),
  entity_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT notifications_no_self CHECK (recipient_id <> actor_id),
  -- Protect authors against unlike/re-like notification spam.
  CONSTRAINT notifications_unique_like UNIQUE (recipient_id, actor_id, type, entity_id)
);
CREATE INDEX notifications_inbox_idx ON public.notifications
  (recipient_id, created_at DESC);
CREATE INDEX notifications_unread_idx ON public.notifications
  (recipient_id, created_at DESC) WHERE is_read = false;

-- Keep the author display name server-owned, without exposing users' emails.
CREATE FUNCTION public.prepare_community_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  NEW.author_name := coalesce(
    (SELECT nullif(left(btrim(p.display_name), 80), '')
       FROM public.profiles AS p WHERE p.id = NEW.author_id),
    'Athlete'
  );
  RETURN NEW;
END;
$$;
CREATE TRIGGER prepare_community_message
BEFORE INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.prepare_community_message();

-- Atomic counter maintenance; ordinary users cannot write like_count directly.
CREATE FUNCTION public.sync_message_like_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.messages
       SET like_count = like_count + 1 WHERE id = NEW.message_id;
    RETURN NEW;
  ELSE
    UPDATE public.messages
       SET like_count = greatest(0, like_count - 1) WHERE id = OLD.message_id;
    RETURN OLD;
  END IF;
END;
$$;
CREATE TRIGGER sync_message_like_count
AFTER INSERT OR DELETE ON public.message_likes
FOR EACH ROW EXECUTE FUNCTION public.sync_message_like_count();

-- The notification is created in the same database transaction as the like.
CREATE FUNCTION public.on_message_liked()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  target_author uuid;
  liker_name text;
BEGIN
  SELECT author_id INTO target_author
    FROM public.messages WHERE id = NEW.message_id;
  IF target_author IS NULL OR target_author = NEW.user_id THEN
    RETURN NEW;
  END IF;

  SELECT coalesce(nullif(left(btrim(display_name), 80), ''), 'An athlete')
    INTO liker_name FROM public.profiles WHERE id = NEW.user_id;

  INSERT INTO public.notifications
    (recipient_id, actor_id, type, entity_id, message)
  VALUES
    (target_author, NEW.user_id, 'message_like', NEW.message_id,
     coalesce(liker_name, 'An athlete') || ' liked your post in Power Circle.')
  ON CONFLICT (recipient_id, actor_id, type, entity_id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_message_liked
AFTER INSERT ON public.message_likes
FOR EACH ROW EXECUTE FUNCTION public.on_message_liked();

-- Immutable notification metadata: recipients may change read status only.
CREATE FUNCTION public.protect_notification_fields()
RETURNS trigger LANGUAGE plpgsql SET search_path = ''
AS $$
BEGIN
  IF ROW(NEW.id, NEW.recipient_id, NEW.actor_id, NEW.type, NEW.entity_id,
         NEW.message, NEW.created_at)
     IS DISTINCT FROM
     ROW(OLD.id, OLD.recipient_id, OLD.actor_id, OLD.type, OLD.entity_id,
         OLD.message, OLD.created_at) THEN
    RAISE EXCEPTION 'Only notification read status may be changed';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER protect_notification_fields
BEFORE UPDATE ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.protect_notification_fields();

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read community posts" ON public.messages
FOR SELECT TO authenticated USING (true);
CREATE POLICY "Members can publish their own posts" ON public.messages
FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can delete their posts" ON public.messages
FOR DELETE TO authenticated USING (auth.uid() = author_id);

CREATE POLICY "Members can see community likes" ON public.message_likes
FOR SELECT TO authenticated USING (true);
CREATE POLICY "Members can like posts once" ON public.message_likes
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members can remove their own likes" ON public.message_likes
FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Recipients can see their notifications" ON public.notifications
FOR SELECT TO authenticated USING (auth.uid() = recipient_id);
CREATE POLICY "Recipients can mark notifications read" ON public.notifications
FOR UPDATE TO authenticated
USING (auth.uid() = recipient_id)
WITH CHECK (auth.uid() = recipient_id);

-- No client-side INSERT/DELETE policies for notifications.
-- Only the trusted database trigger creates notifications.
ALTER PUBLICATION supabase_realtime
  ADD TABLE public.messages, public.message_likes, public.notifications;

GRANT SELECT, INSERT, DELETE ON public.messages TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.message_likes TO authenticated;
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
