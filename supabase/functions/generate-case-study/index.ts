import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Template scenarios for auto-generation (when no specific details provided)
const SCENARIOS = [
  { client: 'Midwest HVAC Pros', industry: 'HVAC', vehicle: 'Sprinter Van', fleet_size: 8, challenge: 'Low brand recognition in competitive suburban market' },
  { client: 'Green Thumb Landscaping', industry: 'Landscaping', vehicle: 'F-250 Pickup', fleet_size: 5, challenge: 'Needed professional image to win HOA contracts' },
  { client: 'City Spark Electric', industry: 'Electrician', vehicle: 'Transit Van', fleet_size: 12, challenge: 'Expanding to new Chicago suburbs, needed consistent fleet branding' },
  { client: 'Clean Sweep Services', industry: 'Cleaning', vehicle: 'Cargo Van', fleet_size: 6, challenge: 'Competing against national franchise brands' },
  { client: 'Supreme Plumbing', industry: 'Plumbing', vehicle: 'Box Truck', fleet_size: 4, challenge: 'Emergency service visibility in residential neighborhoods' },
  { client: 'FastTrack Delivery', industry: 'Delivery', vehicle: 'Box Truck', fleet_size: 15, challenge: 'Brand consistency across rapidly growing fleet' },
  { client: 'Rooftop Masters', industry: 'Roofing', vehicle: 'F-350 Pickup', fleet_size: 7, challenge: 'Standing out in storm-chasing roofing market' },
  { client: 'Pest Shield Solutions', industry: 'Pest Control', vehicle: 'Cargo Van', fleet_size: 9, challenge: 'Building trust in residential neighborhoods' },
  { client: 'Iron Gate Security', industry: 'Security', vehicle: 'SUV', fleet_size: 20, challenge: 'Professional authority appearance for property management contracts' },
  { client: 'Fresh Bites Food Co', industry: 'Food Truck', vehicle: 'Food Truck', fleet_size: 3, challenge: 'Eye-catching design for festival and event circuit' },
];

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 80);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!ANTHROPIC_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing config');

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check for custom input or pick from scenarios
    let scenario;
    try {
      const body = await req.json();
      if (body.client_name) {
        scenario = {
          client: body.client_name,
          industry: body.industry || 'General',
          vehicle: body.vehicle_type || 'Fleet Vehicle',
          fleet_size: body.fleet_size || 5,
          challenge: body.challenge || 'Needed professional fleet branding',
        };
      }
    } catch {}

    if (!scenario) {
      const { count } = await supabase.from('case_studies').select('*', { count: 'exact', head: true });
      const idx = (count || 0) % SCENARIOS.length;
      scenario = SCENARIOS[idx];
    }

    console.log(`Generating case study: ${scenario.client}`);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
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
          content: `Write a vehicle wrap case study for Chicago Fleet Wraps.

CLIENT: ${scenario.client} (${scenario.industry})
VEHICLE: ${scenario.vehicle} × ${scenario.fleet_size} vehicles
CHALLENGE: ${scenario.challenge}

COMPANY: Chicago Fleet Wraps, Chicago IL | (312) 597-1286 | 24+ years, 9,400+ vehicles
Materials: Avery Dennison MPI 1105, 3M IJ180-CV3 | 2-year warranty

WRITE A 1,200-1,500 WORD CASE STUDY INCLUDING:
1. Client background and challenge (with ${scenario.industry}-specific pain points)
2. Why they chose Chicago Fleet Wraps (consultation process, design phase)
3. Solution details (materials, design choices, installation timeline)
4. Results with SPECIFIC metrics:
   - Lead increase % (generate realistic numbers: 25-65%)
   - Cost per impression vs digital ads
   - Monthly call volume change
   - ROI timeline (payback period)
5. Client quote template (realistic testimonial)
6. Before/after narrative
7. Key takeaways for similar businesses

SEO: Target "${scenario.industry.toLowerCase()} vehicle wraps Chicago" and related long-tails.
Include AEO-optimized summary paragraph and FAQ section (3-5 Qs).

FORMAT — Return ONLY valid JSON:
{
  "title": "SEO title under 60 chars",
  "slug": "url-slug",
  "meta_description": "under 155 chars",
  "keywords": "comma-separated keywords",
  "excerpt": "2-3 sentence summary",
  "content": "Full HTML with h2, h3, p, ul, li, strong, em, blockquote tags"
}

CRITICAL: Return ONLY JSON. No fences.`
        }],
      }),
    });

    if (!response.ok) throw new Error(`Anthropic error: ${response.status}`);

    const aiResult = await response.json();
    let cleaned = (aiResult.content?.[0]?.text || '').trim();
    if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');

    const post = JSON.parse(cleaned);
    const finalSlug = slugify(post.slug || scenario.client);

    // Check duplicate
    const { data: existing } = await supabase.from('case_studies').select('id').eq('slug', finalSlug).maybeSingle();
    if (existing) {
      return new Response(JSON.stringify({ message: 'Case study already exists', slug: finalSlug }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { error: insertErr } = await supabase.from('case_studies').insert({
      title: post.title,
      slug: finalSlug,
      client_name: scenario.client,
      industry: scenario.industry,
      vehicle_type: scenario.vehicle,
      meta_description: post.meta_description || '',
      keywords: post.keywords || '',
      content: post.content || '',
      excerpt: post.excerpt || '',
    });

    if (insertErr) throw new Error(`Insert failed: ${insertErr.message}`);

    await supabase.from('growth_log').insert({
      action_type: 'case-study-generated',
      details: { client: scenario.client, industry: scenario.industry, slug: finalSlug },
    });

    // Chain updates
    const fnUrl = SUPABASE_URL + '/functions/v1/';
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}` };
    await Promise.allSettled([
      fetch(fnUrl + 'update-sitemap', { method: 'POST', headers, body: '{}' }),
      fetch(fnUrl + 'update-llms-txt', { method: 'POST', headers, body: '{}' }),
    ]);

    console.log(`✅ Case study published: ${post.title}`);
    return new Response(JSON.stringify({ success: true, slug: finalSlug, title: post.title }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Case study error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
