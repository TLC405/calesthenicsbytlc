-- Only the verified owner of this exact mailbox can receive the admin role.
-- Never rely on user_metadata or unverified email text for authorization.
CREATE OR REPLACE FUNCTION public.ensure_power_owner_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF lower(NEW.email) = 'inspirelawton@gmail.com'
     AND NEW.email_confirmed_at IS NOT NULL
     AND NEW.is_anonymous IS NOT TRUE THEN
    INSERT INTO public.user_roles(user_id,role)
    VALUES (NEW.id,'admin'::public.app_role)
    ON CONFLICT(user_id,role) DO NOTHING;
    UPDATE public.profiles SET role='admin'::public.app_role
    WHERE id=NEW.id;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.ensure_power_owner_admin() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS power_owner_verified_admin ON auth.users;
CREATE TRIGGER power_owner_verified_admin
AFTER INSERT OR UPDATE OF email, email_confirmed_at ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.ensure_power_owner_admin();

-- If the confirmed account already exists, promote it without changing passwords.
INSERT INTO public.user_roles(user_id,role)
SELECT id,'admin'::public.app_role FROM auth.users
WHERE lower(email)='inspirelawton@gmail.com'
AND email_confirmed_at IS NOT NULL AND is_anonymous IS NOT TRUE
ON CONFLICT(user_id,role) DO NOTHING;
UPDATE public.profiles SET role='admin'::public.app_role
WHERE id IN (SELECT id FROM auth.users WHERE lower(email)='inspirelawton@gmail.com'
AND email_confirmed_at IS NOT NULL AND is_anonymous IS NOT TRUE);

CREATE OR REPLACE FUNCTION public.get_power_admin_overview()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM public.user_roles
      WHERE user_id=auth.uid() AND role='admin'::public.app_role)
    THEN jsonb_build_object(
      'users',(SELECT count(*) FROM auth.users),
      'exercises',(SELECT count(*) FROM public.exercises),
      'videos',(SELECT count(*) FROM public.exercises WHERE youtube_url IS NOT NULL),
      'custom_exercises',(SELECT count(*) FROM public.exercises WHERE created_by IS NOT NULL),
      'workouts',(SELECT count(*) FROM public.workouts),
      'community_posts',(SELECT count(*) FROM public.messages),
      'likes',(SELECT count(*) FROM public.message_likes),
      'notifications',(SELECT count(*) FROM public.notifications),
      'ai_requests_today',(SELECT coalesce(sum(requests),0) FROM public.ai_daily_usage WHERE usage_date=(now() AT TIME ZONE 'UTC')::date)
    )
    ELSE NULL::jsonb END
$$;
REVOKE ALL ON FUNCTION public.get_power_admin_overview() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_power_admin_overview() TO authenticated;
