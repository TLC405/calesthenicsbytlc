-- Remove owner authorization if the privileged mailbox is changed or becomes unverified.
CREATE OR REPLACE FUNCTION public.ensure_power_owner_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF lower(coalesce(NEW.email,'')) = 'inspirelawton@gmail.com'
     AND NEW.email_confirmed_at IS NOT NULL
     AND NEW.is_anonymous IS NOT TRUE THEN
    INSERT INTO public.user_roles(user_id,role)
    VALUES (NEW.id,'admin'::public.app_role)
    ON CONFLICT(user_id,role) DO NOTHING;
    UPDATE public.profiles SET role='admin'::public.app_role WHERE id=NEW.id;
  ELSIF (TG_OP = 'UPDATE' AND lower(coalesce(OLD.email,''))='inspirelawton@gmail.com') THEN
    DELETE FROM public.user_roles WHERE user_id=NEW.id AND role='admin'::public.app_role;
    UPDATE public.profiles SET role='user'::public.app_role WHERE id=NEW.id AND role='admin'::public.app_role;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.ensure_power_owner_admin() FROM PUBLIC, anon, authenticated;
