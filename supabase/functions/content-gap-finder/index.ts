import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Top Chicago vehicle wrap competitors to monitor
const COMPETITORS = [
  { name: 'Wrapmate', url: 'https://www.wrapmate.com' },
  { name: 'Fleet Wraps HQ', url: 'https://fleetwrapshq.com' },
  { name: 'Graphic Installers', url: 'https://graphicinstallers.com' },
  { name: 'Wrap Works Chicago', url: 'https://wrapworkschicago.com' },
  { name: 'Signs By Tomorrow', url: 'https://www.signsbytomorrow.com/chicagonorthwest' },
];

// Our existing content topics (slugs/keywords we already cover)
async function getOurTopics(supabase: any): Promise<Set<string>> {
  const topics = new Set<string>();

  // Get blog post keywords
  const { data: posts } = await supabase.from('blog_posts').select('keywords, title, slug');
  (posts || []).forEach((p: any) => {
    topics.add(p.slug);
    (p.keywords || '').split(',').forEach((k: string) => topics.add(k.trim().toLowerCase()));
  });

  // Get city pages
  const { data: cities } = await supabase.from('city_pages').select('slug, keywords');
  (cities || []).forEach((c: any) => {
    topics.add(c.slug);
    (c.keywords || '').split(',').forEach((k: string) => topics.add(k.trim().toLowerCase()));
  });

  // Get case studies
  const { data: cases } = await supabase.from('case_studies').select('slug, keywords');
  (cases || []).forEach((c: any) => {
    topics.add(c.slug);
    (c.keywords || '').split(',').forEach((k: string) => topics.add(k.trim().toLowerCase()));
  });

  // Static page topics we know we cover
  const staticTopics = [
    'commercial', 'fleet', 'boxtruck', 'sprinter', 'colorchange', 'ev-wraps',
    'partial-wraps', 'wallwraps', 'boat', 'foodtruck', 'pickup-truck',
    'hvac', 'plumber', 'electrician', 'contractor', 'delivery', 'moving',
    'landscape', 'vehicle-wrap-cost', 'wrap-removal', 'vinyl-guide',
    'materials', 'warranty', 'care', 'faq', 'roi', 'calculator',
  ];
  staticTopics.forEach(t => topics.add(t));

  return topics;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!FIRECRAWL_API_KEY) throw new Error('FIRECRAWL_API_KEY not configured');
    if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not configured');
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing Supabase config');

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const ourTopics = await getOurTopics(supabase);

    console.log(`Our coverage: ${ourTopics.size} topics tracked`);

    const allGaps: any[] = [];

    for (const competitor of COMPETITORS) {
      console.log(`Scanning ${competitor.name}: ${competitor.url}`);

      try {
        // Step 1: Map the competitor's site to discover all URLs
        const mapRes = await fetch('https://api.firecrawl.dev/v1/map', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: competitor.url,
            limit: 200,
            includeSubdomains: false,
          }),
        });

        if (!mapRes.ok) {
          console.error(`Map failed for ${competitor.name}: ${mapRes.status}`);
          await mapRes.text();
          continue;
        }

        const mapData = await mapRes.json();
        const urls = mapData.links || mapData.data?.links || [];
        console.log(`Found ${urls.length} URLs on ${competitor.name}`);

        if (urls.length === 0) continue;

        // Step 2: Use AI to analyze URLs and identify content gaps
        const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2048,
            messages: [{
              role: 'user',
              content: `You are a competitive SEO analyst for Chicago Fleet Wraps, a commercial vehicle wrap company.

Below are URLs from competitor "${competitor.name}" (${competitor.url}).
Our site already covers these topics: ${Array.from(ourTopics).slice(0, 100).join(', ')}

Analyze the competitor URLs and identify content GAPS — topics they cover that we DON'T.
Focus on:
- Service pages we're missing (specific vehicle types, wrap types)
- Industry verticals we haven't targeted
- City/location pages we don't have
- Educational content topics we haven't written about
- Comparison or "vs" content
- Pricing/cost content angles
- Process/how-to content

Competitor URLs:
${urls.slice(0, 100).join('\n')}

Return ONLY valid JSON array (no markdown fences):
[
  {
    "topic": "brief topic description",
    "keywords": "3-5 target keywords",
    "relevance_score": 1-100,
    "suggested_slug": "url-slug",
    "suggested_title": "SEO-optimized page title",
    "source_url": "competitor URL that inspired this"
  }
]

Only include genuinely missing topics with relevance_score > 40. Max 10 items.`
            }],
          }),
        });

        if (!aiRes.ok) {
          console.error(`AI analysis failed: ${aiRes.status}`);
          await aiRes.text();
          continue;
        }

        const aiData = await aiRes.json();
        let cleaned = (aiData.content?.[0]?.text || '').trim();
        if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');

        const gaps = JSON.parse(cleaned);

        for (const gap of gaps) {
          allGaps.push({
            competitor_url: gap.source_url || competitor.url,
            competitor_name: competitor.name,
            topic: gap.topic,
            keywords: gap.keywords || '',
            relevance_score: gap.relevance_score || 50,
            suggested_slug: gap.suggested_slug || '',
            suggested_title: gap.suggested_title || '',
            details: { source_url: gap.source_url },
          });
        }

        console.log(`Found ${gaps.length} gaps from ${competitor.name}`);

      } catch (compErr) {
        console.error(`Error scanning ${competitor.name}:`, compErr);
        continue;
      }
    }

    // Deduplicate by topic similarity
    const seen = new Set<string>();
    const uniqueGaps = allGaps.filter(g => {
      const key = g.suggested_slug || g.topic.toLowerCase().replace(/\s+/g, '-');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort by relevance
    uniqueGaps.sort((a, b) => b.relevance_score - a.relevance_score);

    // Insert into database
    if (uniqueGaps.length > 0) {
      const { error: insertErr } = await supabase.from('content_gaps').insert(uniqueGaps);
      if (insertErr) console.error('Insert error:', insertErr.message);
    }

    // Log to growth_log
    await supabase.from('growth_log').insert({
      action_type: 'content-gap-scan',
      details: {
        competitors_scanned: COMPETITORS.length,
        gaps_found: uniqueGaps.length,
        top_gaps: uniqueGaps.slice(0, 5).map(g => g.topic),
      },
    });

    console.log(`✅ Content gap scan complete: ${uniqueGaps.length} gaps identified`);

    return new Response(JSON.stringify({
      success: true,
      competitors_scanned: COMPETITORS.length,
      gaps_found: uniqueGaps.length,
      gaps: uniqueGaps,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Content gap finder error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
