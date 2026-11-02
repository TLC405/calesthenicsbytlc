-- Admin/member write policies apply only to signed-in users.
-- Guest SELECT remains governed by the existing curated/shared read policy.
ALTER POLICY "Admins can manage exercises" ON public.exercises TO authenticated;
ALTER POLICY "Users can create their own exercises" ON public.exercises TO authenticated;
ALTER POLICY "Users can update their own exercises" ON public.exercises TO authenticated;
ALTER POLICY "Users can delete their own exercises" ON public.exercises TO authenticated;
