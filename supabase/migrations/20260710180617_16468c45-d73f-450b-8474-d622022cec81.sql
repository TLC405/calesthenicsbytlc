
-- 1. analytics_events: remove anonymous insert, add user select
DROP POLICY IF EXISTS "Users can create their own events" ON public.analytics_events;
CREATE POLICY "Authenticated users can log events"
  ON public.analytics_events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own events"
  ON public.analytics_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 2. workouts: restrict to authenticated role
DROP POLICY IF EXISTS "Coaches can view client workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can view their own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can update their own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can delete their own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can create their own workouts" ON public.workouts;
CREATE POLICY "Users can view their own workouts" ON public.workouts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Coaches can view client workouts" ON public.workouts
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'coach') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create their own workouts" ON public.workouts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own workouts" ON public.workouts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own workouts" ON public.workouts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 3. feature_flags: restrict SELECT to authenticated only
DROP POLICY IF EXISTS "Anyone can view feature flags" ON public.feature_flags;
CREATE POLICY "Authenticated users can view feature flags"
  ON public.feature_flags FOR SELECT TO authenticated USING (true);

-- 4. profiles: drop pin columns, drop coach broad access
DROP POLICY IF EXISTS "Coaches can view user profiles" ON public.profiles;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS pin_hash;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS pin_salt;

-- 5. user_roles: block self-assignment; only admins can write
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- 6. Storage policies for exercisetable bucket (public read, admin writes)
DROP POLICY IF EXISTS "Public read exercisetable" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload to exercisetable" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update exercisetable" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete exercisetable" ON storage.objects;
CREATE POLICY "Public read exercisetable" ON storage.objects
  FOR SELECT USING (bucket_id = 'exercisetable');
CREATE POLICY "Admins can upload to exercisetable" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'exercisetable' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update exercisetable" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'exercisetable' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete exercisetable" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'exercisetable' AND has_role(auth.uid(), 'admin'));

-- 7. Fix mutable search_path on update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
