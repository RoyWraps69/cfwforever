
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  meta_description TEXT NOT NULL,
  keywords TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  og_image TEXT DEFAULT 'cfw_truck_1.png',
  category TEXT DEFAULT 'Vehicle Wraps',
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Blog posts are publicly readable"
  ON public.blog_posts
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON public.blog_posts(published_at DESC);
