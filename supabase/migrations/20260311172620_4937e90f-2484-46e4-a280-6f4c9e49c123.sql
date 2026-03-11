
CREATE TABLE public.content_gaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_url text NOT NULL,
  competitor_name text NOT NULL,
  topic text NOT NULL,
  keywords text DEFAULT '',
  relevance_score integer DEFAULT 50,
  status text DEFAULT 'new',
  suggested_slug text DEFAULT '',
  suggested_title text DEFAULT '',
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.content_gaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Content gaps are publicly readable"
  ON public.content_gaps
  FOR SELECT
  TO anon, authenticated
  USING (true);
