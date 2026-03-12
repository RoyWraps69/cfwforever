
-- Service-role-only write policies for all 6 tables

-- blog_posts
CREATE POLICY "Service role can insert blog_posts" ON public.blog_posts FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can update blog_posts" ON public.blog_posts FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can delete blog_posts" ON public.blog_posts FOR DELETE TO service_role USING (true);

-- case_studies
CREATE POLICY "Service role can insert case_studies" ON public.case_studies FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can update case_studies" ON public.case_studies FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can delete case_studies" ON public.case_studies FOR DELETE TO service_role USING (true);

-- city_pages
CREATE POLICY "Service role can insert city_pages" ON public.city_pages FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can update city_pages" ON public.city_pages FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can delete city_pages" ON public.city_pages FOR DELETE TO service_role USING (true);

-- content_gaps
CREATE POLICY "Service role can insert content_gaps" ON public.content_gaps FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can update content_gaps" ON public.content_gaps FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can delete content_gaps" ON public.content_gaps FOR DELETE TO service_role USING (true);

-- faq_entries
CREATE POLICY "Service role can insert faq_entries" ON public.faq_entries FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can update faq_entries" ON public.faq_entries FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can delete faq_entries" ON public.faq_entries FOR DELETE TO service_role USING (true);

-- growth_log
CREATE POLICY "Service role can insert growth_log" ON public.growth_log FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can update growth_log" ON public.growth_log FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can delete growth_log" ON public.growth_log FOR DELETE TO service_role USING (true);
