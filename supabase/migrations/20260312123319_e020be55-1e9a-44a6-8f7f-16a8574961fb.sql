
CREATE TABLE public.site_config (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site config"
ON public.site_config FOR SELECT TO public
USING (true);

CREATE POLICY "Admins can manage site config"
ON public.site_config FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.site_config (key, value) VALUES
  ('loading_image_url', ''),
  ('loading_video_url', ''),
  ('app_tagline', 'I GOT THE POWER');
