import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DOMAIN = 'https://www.chicagofleetwraps.com';

// All known static pages
const STATIC_URLS = [
  { path: '/', priority: '1.0', freq: 'daily' },
  { path: '/commercial/', priority: '0.9', freq: 'weekly' },
  { path: '/fleet-wraps-chicago/', priority: '0.9', freq: 'weekly' },
  { path: '/truck-wraps-chicago/', priority: '0.9', freq: 'weekly' },
  { path: '/van-wraps-chicago/', priority: '0.9', freq: 'weekly' },
  { path: '/colorchange/', priority: '0.8', freq: 'weekly' },
  { path: '/boxtruck/', priority: '0.8', freq: 'weekly' },
  { path: '/sprinter/', priority: '0.8', freq: 'weekly' },
  { path: '/portfolio/', priority: '0.7', freq: 'weekly' },
  { path: '/blog/', priority: '0.8', freq: 'daily' },
  { path: '/estimate/', priority: '0.8', freq: 'monthly' },
  { path: '/contact/', priority: '0.7', freq: 'monthly' },
  { path: '/about/', priority: '0.6', freq: 'monthly' },
  { path: '/faq/', priority: '0.7', freq: 'weekly' },
  { path: '/materials/', priority: '0.6', freq: 'monthly' },
  { path: '/care/', priority: '0.6', freq: 'monthly' },
  { path: '/warranty/', priority: '0.5', freq: 'monthly' },
  { path: '/roi/', priority: '0.7', freq: 'monthly' },
  { path: '/servicearea/', priority: '0.7', freq: 'monthly' },
  { path: '/calculator/', priority: '0.7', freq: 'monthly' },
  { path: '/vehicle-wrap-cost-chicago/', priority: '0.8', freq: 'weekly' },
  { path: '/vehicle-wraps-chicago/', priority: '0.8', freq: 'weekly' },
  { path: '/commercial-vehicle-wraps-chicago/', priority: '0.8', freq: 'weekly' },
  { path: '/partial-vehicle-wraps-chicago/', priority: '0.7', freq: 'weekly' },
  { path: '/fleet/', priority: '0.7', freq: 'weekly' },
  { path: '/partial-wraps/', priority: '0.7', freq: 'weekly' },
  { path: '/lettering/', priority: '0.6', freq: 'monthly' },
  { path: '/removal/', priority: '0.6', freq: 'monthly' },
  { path: '/wrap-removal/', priority: '0.6', freq: 'monthly' },
  { path: '/vinyl-guide/', priority: '0.6', freq: 'monthly' },
  { path: '/signsandgraphics/', priority: '0.6', freq: 'monthly' },
  { path: '/wallwraps/', priority: '0.6', freq: 'monthly' },
  { path: '/ev-wraps/', priority: '0.7', freq: 'weekly' },
  { path: '/electric/', priority: '0.7', freq: 'weekly' },
  { path: '/boating/', priority: '0.6', freq: 'monthly' },
  { path: '/boat-wraps-chicago/', priority: '0.7', freq: 'weekly' },
  { path: '/food-truck-wraps-chicago/', priority: '0.7', freq: 'weekly' },
  { path: '/foodtruck/', priority: '0.7', freq: 'weekly' },
  { path: '/hvac/', priority: '0.7', freq: 'weekly' },
  { path: '/hvac-van-wraps-chicago/', priority: '0.7', freq: 'weekly' },
  { path: '/plumber/', priority: '0.7', freq: 'weekly' },
  { path: '/plumbing-van-wraps-chicago/', priority: '0.7', freq: 'weekly' },
  { path: '/electrician-vehicle-wraps-chicago/', priority: '0.7', freq: 'weekly' },
  { path: '/contractor/', priority: '0.7', freq: 'weekly' },
  { path: '/contractor-vehicle-wraps-chicago/', priority: '0.7', freq: 'weekly' },
  { path: '/delivery/', priority: '0.7', freq: 'weekly' },
  { path: '/delivery-fleet-wraps-chicago/', priority: '0.7', freq: 'weekly' },
  { path: '/landscape/', priority: '0.7', freq: 'weekly' },
  { path: '/landscaping-truck-wraps-chicago/', priority: '0.7', freq: 'weekly' },
  { path: '/moving/', priority: '0.7', freq: 'weekly' },
  { path: '/moving-truck-wraps-chicago/', priority: '0.7', freq: 'weekly' },
  { path: '/pickup-truck/', priority: '0.7', freq: 'weekly' },
  // City pages (static)
  ...['arlington-heights','aurora','bolingbrook','chicago','des-plaines','downers-grove','elgin','elmhurst','evanston','joliet','lombard','naperville','oak-park','orland-park','palatine','schaumburg','skokie','tinley-park','wheaton','wilmette'].map(c => ({ path: `/${c}/`, priority: '0.6', freq: 'monthly' })),
  // Tools
  { path: '/brand-audit/', priority: '0.6', freq: 'monthly' },
  { path: '/schedule/', priority: '0.6', freq: 'monthly' },
  { path: '/stats/', priority: '0.5', freq: 'monthly' },
  { path: '/rent-the-bay/', priority: '0.5', freq: 'monthly' },
  { path: '/vsads/', priority: '0.6', freq: 'monthly' },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing config');

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const today = new Date().toISOString().split('T')[0];

    // Fetch dynamic content
    const [blogRes, cityRes, caseRes] = await Promise.all([
      supabase.from('blog_posts').select('slug,published_at').order('published_at', { ascending: false }),
      supabase.from('city_pages').select('slug,published_at').order('published_at', { ascending: false }),
      supabase.from('case_studies').select('slug,published_at').order('published_at', { ascending: false }),
    ]);

    // Build XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Static pages
    for (const p of STATIC_URLS) {
      xml += `  <url><loc>${DOMAIN}${p.path}</loc><lastmod>${today}</lastmod><changefreq>${p.freq}</changefreq><priority>${p.priority}</priority></url>\n`;
    }

    // Blog posts
    for (const post of blogRes.data || []) {
      const lastmod = post.published_at?.split('T')[0] || today;
      xml += `  <url><loc>${DOMAIN}/post/${post.slug}/</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n`;
    }

    // Existing static blog posts
    const staticBlogSlugs = [
      'fleet-wrap-roi-for-contractors','vehicle-wrap-vs-paint-cost','best-vinyl-for-commercial-vehicle-wraps',
      'how-long-do-vehicle-wraps-last','full-wrap-vs-partial-wrap','how-much-does-a-car-wrap-cost',
      '3m-vs-avery-dennison-vehicle-wraps','3m-vinyl-wraps-chicago-fleet','top-benefits-of-custom-decals',
      'what-is-the-downside-of-wrapping-a-car','how-vehicle-wraps-transform-your-car-into-a-moving-billboard',
      'creative-ways-to-promote-your-business-using-vinyl-graphics','the-art-of-customizing-apparel-a-guide-to-unique-branding',
      'why-businesses-are-choosing-vehicle-graphics-to-boost-visibility',
      'uncover-the-power-of-fleet-visibility-transform-your-business-with-eye-catching-wraps',
      'does-wrapping-a-car-devalue-it','5-tips-for-designing-effective-vehicle-branding-for-your-fleet',
      'understanding-the-impact-of-custom-graphics-on-business-branding',
      'how-vehicle-graphics-can-help-promote-your-business',
      'maximizing-your-business-s-mobile-advertising-with-tailgate-wraps',
      'why-vehicle-wraps-are-the-smart-choice-for-your-fleet-in-bloomington',
      'how-to-choose-the-right-truck-graphics-to-match-your-company-s-branding',
      'unleashing-the-untold-profits-how-vehicle-wraps-skyrocketed-roi-for-chicago-fleet-businesses',
      'exploring-the-benefits-of-custom-apparel-for-your-team',
    ];
    const dbSlugs = new Set((blogRes.data || []).map(p => p.slug));
    for (const slug of staticBlogSlugs) {
      if (!dbSlugs.has(slug)) {
        xml += `  <url><loc>${DOMAIN}/post/${slug}/</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n`;
      }
    }

    // City pages (dynamic)
    for (const city of cityRes.data || []) {
      const lastmod = city.published_at?.split('T')[0] || today;
      xml += `  <url><loc>${DOMAIN}/${city.slug}/</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>\n`;
    }

    // Case studies
    for (const cs of caseRes.data || []) {
      const lastmod = cs.published_at?.split('T')[0] || today;
      xml += `  <url><loc>${DOMAIN}/case-study/${cs.slug}/</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n`;
    }

    xml += '</urlset>';

    const totalUrls = STATIC_URLS.length + (blogRes.data?.length || 0) + staticBlogSlugs.filter(s => !dbSlugs.has(s)).length + (cityRes.data?.length || 0) + (caseRes.data?.length || 0);

    await supabase.from('growth_log').insert({
      action_type: 'sitemap-updated',
      details: { total_urls: totalUrls, blog_posts: blogRes.data?.length || 0, city_pages: cityRes.data?.length || 0, case_studies: caseRes.data?.length || 0 },
    });

    console.log(`✅ Sitemap generated: ${totalUrls} URLs`);
    return new Response(xml, {
      headers: { ...corsHeaders, 'Content-Type': 'application/xml; charset=utf-8' }
    });
  } catch (error) {
    console.error('Sitemap error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
