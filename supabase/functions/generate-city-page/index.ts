import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Chicagoland cities NOT yet covered by static pages
const CITY_POOL = [
  { city: 'Berwyn', county: 'Cook' },
  { city: 'Cicero', county: 'Cook' },
  { city: 'Oak Lawn', county: 'Cook' },
  { city: 'Park Ridge', county: 'Cook' },
  { city: 'Niles', county: 'Cook' },
  { city: 'Morton Grove', county: 'Cook' },
  { city: 'Glenview', county: 'Cook' },
  { city: 'Northbrook', county: 'Cook' },
  { city: 'Highland Park', county: 'Lake' },
  { city: 'Lake Forest', county: 'Lake' },
  { city: 'Waukegan', county: 'Lake' },
  { city: 'Crystal Lake', county: 'McHenry' },
  { city: 'Plainfield', county: 'Will' },
  { city: 'Romeoville', county: 'Will' },
  { city: 'Mokena', county: 'Will' },
  { city: 'Frankfort', county: 'Will' },
  { city: 'New Lenox', county: 'Will' },
  { city: 'Burbank', county: 'Cook' },
  { city: 'Evergreen Park', county: 'Cook' },
  { city: 'Blue Island', county: 'Cook' },
  { city: 'Calumet City', county: 'Cook' },
  { city: 'Homewood', county: 'Cook' },
  { city: 'Hinsdale', county: 'DuPage' },
  { city: 'La Grange', county: 'Cook' },
  { city: 'Brookfield', county: 'Cook' },
  { city: 'Riverside', county: 'Cook' },
  { city: 'Forest Park', county: 'Cook' },
  { city: 'Melrose Park', county: 'Cook' },
  { city: 'Elk Grove Village', county: 'Cook' },
  { city: 'Mount Prospect', county: 'Cook' },
  { city: 'Buffalo Grove', county: 'Lake' },
  { city: 'Vernon Hills', county: 'Lake' },
  { city: 'Libertyville', county: 'Lake' },
  { city: 'Mundelein', county: 'Lake' },
  { city: 'Geneva', county: 'Kane' },
  { city: 'St. Charles', county: 'Kane' },
  { city: 'Batavia', county: 'Kane' },
  { city: 'West Chicago', county: 'DuPage' },
  { city: 'Carol Stream', county: 'DuPage' },
  { city: 'Hanover Park', county: 'Cook' },
  { city: 'Bartlett', county: 'DuPage' },
  { city: 'Addison', county: 'DuPage' },
  { city: 'Villa Park', county: 'DuPage' },
  { city: 'Lisle', county: 'DuPage' },
  { city: 'Woodridge', county: 'DuPage' },
  { city: 'Darien', county: 'DuPage' },
  { city: 'Lemont', county: 'Cook' },
  { city: 'Lockport', county: 'Will' },
  { city: 'Crest Hill', county: 'Will' },
  { city: 'Shorewood', county: 'Will' },
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

    // Get existing city slugs
    const { data: existing } = await supabase.from('city_pages').select('slug');
    const existingSlugs = new Set((existing || []).map(c => c.slug));

    // Also exclude cities that already have static pages
    const staticCities = ['arlington-heights','aurora','bolingbrook','chicago','des-plaines','downers-grove','elgin','elmhurst','evanston','joliet','lombard','naperville','oak-park','orland-park','palatine','schaumburg','skokie','tinley-park','wheaton','wilmette'];
    staticCities.forEach(s => existingSlugs.add(s));

    // Find next city to generate
    const nextCity = CITY_POOL.find(c => !existingSlugs.has(slugify(c.city)));
    if (!nextCity) {
      return new Response(JSON.stringify({ message: 'All cities generated!' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const citySlug = slugify(nextCity.city);
    console.log(`Generating city page: ${nextCity.city}, IL`);

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
          content: `Write a vehicle wrap landing page for Chicago Fleet Wraps targeting ${nextCity.city}, ${nextCity.county} County, Illinois.

COMPANY: Chicago Fleet Wraps, 4711 N Lamon Ave, Chicago IL 60630
Phone: (312) 597-1286 | 24+ years experience | 9,400+ vehicles wrapped
Free pickup & delivery across Chicagoland | 2-year workmanship warranty

REQUIREMENTS:
1. Write 1,500-1,800 words in conversational, expert tone
2. Reference ${nextCity.city}-specific landmarks, neighborhoods, business districts, highways
3. Cover: commercial wraps, fleet wraps, color change, partial wraps
4. Include local business types that benefit from wraps in ${nextCity.city}
5. Mention distance/drive time from ${nextCity.city} to our shop
6. Include 8-10 FAQ entries specific to ${nextCity.city} vehicle wrap customers
7. Write for SEO + AEO + voice search (natural phrasing, "People Also Ask" style)
8. Include .speakable class on key answer paragraphs

FORMAT — Return ONLY valid JSON:
{
  "title": "Vehicle Wraps ${nextCity.city} IL | Commercial Fleet Wraps",
  "meta_description": "under 155 chars with CTA",
  "keywords": "12-15 comma-separated long-tail keywords",
  "content": "Full HTML with h2, h3, p, ul, li, strong, em tags",
  "faq": [{"q": "question", "a": "answer"}],
  "schema": { LocalBusiness + FAQPage JSON-LD combined }
}

CRITICAL: Return ONLY the JSON. No markdown fences.`
        }],
      }),
    });

    if (!response.ok) throw new Error(`Anthropic error: ${response.status}`);

    const aiResult = await response.json();
    let cleaned = (aiResult.content?.[0]?.text || '').trim();
    if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');

    const post = JSON.parse(cleaned);

    const { data: inserted, error: insertErr } = await supabase.from('city_pages').insert({
      city: nextCity.city,
      state: 'IL',
      slug: citySlug,
      title: post.title || `Vehicle Wraps ${nextCity.city} IL`,
      meta_description: post.meta_description || '',
      keywords: post.keywords || '',
      content: post.content || '',
      faq_json: post.faq || [],
      schema_json: post.schema || {},
    }).select().single();

    if (insertErr) throw new Error(`Insert failed: ${insertErr.message}`);

    // Log to growth_log
    await supabase.from('growth_log').insert({
      action_type: 'city-page-generated',
      details: { city: nextCity.city, slug: citySlug, title: post.title },
    });

    // Chain: trigger sitemap + llms.txt update
    const fnUrl = SUPABASE_URL + '/functions/v1/';
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}` };
    await Promise.allSettled([
      fetch(fnUrl + 'update-sitemap', { method: 'POST', headers, body: '{}' }),
      fetch(fnUrl + 'update-llms-txt', { method: 'POST', headers, body: '{}' }),
    ]);

    console.log(`✅ City page published: ${nextCity.city} → /${citySlug}/`);
    return new Response(JSON.stringify({ success: true, city: nextCity.city, slug: citySlug }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('City page generation error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
