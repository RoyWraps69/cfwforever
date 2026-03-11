import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const IMAGE_MAP: Record<string, string> = {
  'trailer': 'cfw_truck_2.png',
  'marketing': 'frontier_fleet_vans.jpg',
  'emergency': 'diecut_sheriff_k9.webp',
  'suv': 'small_suv.webp',
  'window': 'oakbros_wall_wrap.jpg',
  'cargo van': 'cfw_van_1.png',
  'box truck': 'windy_city_box_truck.webp',
  'fleet': 'frontier_fleet_vans.jpg',
  'hvac': 'precision_today_hvac.jpg',
  'food truck': 'blondies_beef_truck.jpg',
  'boat': 'cutwater_boat.jpg',
  'color change': 'audi_color_shift.jpg',
  'tesla': 'color_change_tesla.webp',
  'rivian': 'rivian_blue_holographic.jpg',
  'chicago': 'chicago_neighborhoods_map.png',
};

function pickOgImage(topic: string): string {
  const lower = topic.toLowerCase();
  for (const [key, img] of Object.entries(IMAGE_MAP)) {
    if (lower.includes(key)) return img;
  }
  return 'cfw_truck_1.png';
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 80);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topics } = await req.json();
    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      throw new Error('Provide an array of topics');
    }

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not configured');

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const results: Array<{ topic: string; status: string; slug?: string; title?: string; error?: string }> = [];

    for (const topic of topics) {
      try {
        console.log(`Generating: "${topic}"`);
        const ogImage = pickOgImage(topic);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 300000); // 5 min per request
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4096,
            messages: [{
              role: 'user',
              content: `Write a blog post for Chicago Fleet Wraps (chicagofleetwraps.com) about: "${topic}"

COMPANY CONTEXT:
- Chicago Fleet Wraps, 4711 N Lamon Ave, Chicago IL 60630
- Phone: (312) 597-1286
- 24+ years experience, 9,400+ vehicles wrapped, 2,800+ fleet accounts
- Materials: Avery Dennison MPI 1105, 3M IJ180-CV3 cast vinyl
- Free pickup & delivery across Chicagoland
- 2-year workmanship warranty
- Fleet discounts: 3% for 2-4 vehicles, 7% for 5-9, 11% for 10-24, 15% for 25+

WRITING REQUIREMENTS:
1. Write 1,500-1,800 words in a conversational, human tone
2. Include real pain points business owners face and how wraps solve them
3. Include specific pros AND cons (be honest)
4. Use Chicago-specific references (neighborhoods, highways, weather)
5. Include actionable advice readers can use immediately
6. End with a clear CTA to get a free estimate

SEO/AEO REQUIREMENTS:
- Write for both humans AND AI answer engines
- Include 2-3 "People Also Ask" style Q&A sections
- Use natural keyword variations throughout
- Include specific numbers, stats, and data points
- Structure with clear H2/H3 headings for featured snippet eligibility
- Include local Chicago references for GEO optimization

FORMAT — Return ONLY valid JSON:
{
  "title": "SEO-optimized title under 60 chars",
  "slug": "url-friendly-slug",
  "meta_description": "Under 155 chars with CTA",
  "keywords": "12-15 comma-separated long-tail keywords",
  "excerpt": "2-3 sentence excerpt",
  "category": "one of: Vehicle Wraps, Fleet Branding, Industry Guides, Materials & Care, Chicago Local",
  "content": "Full HTML blog post with h2, h3, p, ul, li, strong, em tags"
}

CRITICAL: Return ONLY the JSON object. No markdown fences.`
            }],
          }),
        });
        clearTimeout(timeout);

        if (!response.ok) {
          const err = await response.text();
          console.error(`Anthropic error for "${topic}":`, response.status, err);
          results.push({ topic, status: 'error', error: `API error: ${response.status}` });
          continue;
        }

        const aiResult = await response.json();
        let cleaned = (aiResult.content?.[0]?.text || '').trim();
        if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        }

        const post = JSON.parse(cleaned);
        if (!post.title || !post.content || !post.slug) {
          results.push({ topic, status: 'error', error: 'Missing required fields' });
          continue;
        }

        const finalSlug = slugify(post.slug);
        const { data: existing } = await supabase.from('blog_posts').select('id').eq('slug', finalSlug).maybeSingle();
        if (existing) {
          results.push({ topic, status: 'skipped', slug: finalSlug, title: post.title });
          continue;
        }

        const { error: insertErr } = await supabase.from('blog_posts').insert({
          title: post.title,
          slug: finalSlug,
          meta_description: post.meta_description || post.title,
          keywords: post.keywords || topic,
          content: post.content,
          excerpt: post.excerpt || '',
          og_image: ogImage,
          category: post.category || 'Vehicle Wraps',
        });

        if (insertErr) {
          results.push({ topic, status: 'error', error: insertErr.message });
          continue;
        }

        console.log(`✅ Published: "${post.title}" → /post/${finalSlug}/`);
        results.push({ topic, status: 'published', slug: finalSlug, title: post.title });
      } catch (e) {
        console.error(`Error for "${topic}":`, e);
        results.push({ topic, status: 'error', error: e instanceof Error ? e.message : 'Unknown' });
      }
    }

    // Log to growth_log
    await supabase.from('growth_log').insert({
      action_type: 'Batch Blog Posts',
      status: 'completed',
      details: { count: results.filter(r => r.status === 'published').length, results },
    });

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Batch blog error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
