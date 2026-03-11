-- Drop public read policies on sensitive internal tables
DROP POLICY IF EXISTS "Content gaps are publicly readable" ON public.content_gaps;
DROP POLICY IF EXISTS "Growth log is publicly readable" ON public.growth_log;

-- Replace with restrictive policies (no public access)
CREATE POLICY "Content gaps are restricted" ON public.content_gaps
  FOR SELECT TO authenticated
  USING (false);

CREATE POLICY "Growth log is restricted" ON public.growth_log
  FOR SELECT TO authenticated
  USING (false);