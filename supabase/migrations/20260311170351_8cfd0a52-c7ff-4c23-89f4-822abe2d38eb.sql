
-- City pages table
CREATE TABLE IF NOT EXISTS public.city_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'IL',
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  keywords TEXT NOT NULL,
  content TEXT NOT NULL,
  faq_json JSONB DEFAULT '[]'::jsonb,
  schema_json JSONB DEFAULT '{}'::jsonb,
  og_image TEXT DEFAULT 'chicago_neighborhoods_map.png',
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.city_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "City pages are publicly readable" ON public.city_pages FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX idx_city_pages_slug ON public.city_pages(slug);

-- Case studies table
CREATE TABLE IF NOT EXISTS public.case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  keywords TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  before_image TEXT,
  after_image TEXT,
  og_image TEXT DEFAULT 'cfw_truck_1.png',
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Case studies are publicly readable" ON public.case_studies FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX idx_case_studies_slug ON public.case_studies(slug);

-- FAQ entries table
CREATE TABLE IF NOT EXISTS public.faq_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  source TEXT DEFAULT 'ai-generated',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.faq_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "FAQ entries are publicly readable" ON public.faq_entries FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX idx_faq_entries_page ON public.faq_entries(page_slug);

-- Growth log table
CREATE TABLE IF NOT EXISTS public.growth_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.growth_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Growth log is publicly readable" ON public.growth_log FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX idx_growth_log_type ON public.growth_log(action_type);
CREATE INDEX idx_growth_log_created ON public.growth_log(created_at DESC);
