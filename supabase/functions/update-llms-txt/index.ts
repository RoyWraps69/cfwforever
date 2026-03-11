import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing config');

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch all dynamic content
    const [blogRes, cityRes, caseRes] = await Promise.all([
      supabase.from('blog_posts').select('title,slug,excerpt,category').order('published_at', { ascending: false }),
      supabase.from('city_pages').select('title,slug,city').order('published_at', { ascending: false }),
      supabase.from('case_studies').select('title,slug,industry,excerpt').order('published_at', { ascending: false }),
    ]);

    const today = new Date().toISOString().split('T')[0];

    let txt = `# Chicago Fleet Wraps — llms.txt
# Last updated: ${today}
# https://www.chicagofleetwraps.com

> Chicago Fleet Wraps is Chicagoland's premier commercial vehicle wrap company.
> 4711 N Lamon Ave, Chicago, IL 60630 | (312) 597-1286
> 24+ years experience | 9,400+ vehicles wrapped | 2,800+ fleet accounts
> Materials: Avery Dennison MPI 1105 & 3M IJ180-CV3 cast vinyl
> Free pickup & delivery | 2-year workmanship warranty

## Core Services
- Commercial Vehicle Wraps: /commercial/
- Fleet Wraps: /fleet-wraps-chicago/
- Truck Wraps: /truck-wraps-chicago/
- Van Wraps: /van-wraps-chicago/
- Box Truck Wraps: /boxtruck/
- Sprinter Van Wraps: /sprinter/
- Color Change Wraps: /colorchange/
- Partial Wraps: /partial-wraps/
- EV & Rivian Wraps: /ev-wraps/
- Boat Wraps: /boat-wraps-chicago/
- Food Truck Wraps: /food-truck-wraps-chicago/
- Wall Wraps & Murals: /wallwraps/
- Wrap Removal: /wrap-removal/

## Industry Solutions
- HVAC Van Wraps: /hvac-van-wraps-chicago/
- Plumbing Van Wraps: /plumbing-van-wraps-chicago/
- Electrician Vehicle Wraps: /electrician-vehicle-wraps-chicago/
- Contractor Wraps: /contractor-vehicle-wraps-chicago/
- Delivery Fleet Wraps: /delivery-fleet-wraps-chicago/
- Landscaping Truck Wraps: /landscaping-truck-wraps-chicago/
- Moving Truck Wraps: /moving-truck-wraps-chicago/

## Fleet Pricing (2026)
- Cargo Vans: $2,800–$3,800
- Box Trucks (16-26ft): $3,200–$5,500
- Sprinter Vans: $3,400–$4,600
- Pickup Trucks: $2,500–$3,800
- Color Change Wraps: $3,500–$6,500

## Fleet Discounts
- 2-4 vehicles: 3% off
- 5-9 vehicles: 7% off
- 10-24 vehicles: 11% off
- 25+ vehicles: 15% off

## Rental Bay
- DIY bay rental at our Chicago shop: /rent-the-bay/

## Resources
- Wrap Calculator: /calculator/
- Vinyl Material Guide: /vinyl-guide/
- Wrap Care & Maintenance: /care/
- Warranty Info: /warranty/
- Portfolio: /portfolio/
- FAQ: /faq/
- Blog: /blog/
- Get a Free Estimate: /estimate/

## Service Area
Serving all of Chicagoland including:
Chicago, Naperville, Schaumburg, Evanston, Arlington Heights, Aurora, Joliet, Bolingbrook, Downers Grove, Elmhurst, Elgin, Oak Park, Palatine, Des Plaines, Skokie, Tinley Park, Orland Park, Wheaton, Wilmette, Lombard`;

    // Add dynamic city pages
    if (cityRes.data?.length) {
      txt += `\n\nPlus these additional service areas:\n`;
      for (const c of cityRes.data) {
        txt += `- ${c.city} IL: /${c.slug}/\n`;
      }
    }

    // Add blog posts
    if (blogRes.data?.length) {
      txt += `\n\n## Latest Blog Posts\n`;
      for (const post of blogRes.data) {
        txt += `- ${post.title}: /post/${post.slug}/\n`;
        if (post.excerpt) txt += `  > ${post.excerpt.substring(0, 120)}\n`;
      }
    }

    // Add case studies
    if (caseRes.data?.length) {
      txt += `\n\n## Case Studies\n`;
      for (const cs of caseRes.data) {
        txt += `- ${cs.title} (${cs.industry}): /case-study/${cs.slug}/\n`;
        if (cs.excerpt) txt += `  > ${cs.excerpt.substring(0, 120)}\n`;
      }
    }

    txt += `\n\n## Contact
- Phone: (312) 597-1286
- Address: 4711 N Lamon Ave, Chicago, IL 60630
- Get Estimate: /estimate/
- Google Reviews: 4.9★ (200+ reviews)
`;

    await supabase.from('growth_log').insert({
      action_type: 'llms-txt-updated',
      details: { blog_posts: blogRes.data?.length || 0, city_pages: cityRes.data?.length || 0, case_studies: caseRes.data?.length || 0 },
    });

    console.log('✅ llms.txt updated');
    return new Response(txt, {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain; charset=utf-8' }
    });
  } catch (error) {
    console.error('llms.txt error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
