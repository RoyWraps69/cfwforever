import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rotating topic pool — each day picks the next topic to ensure variety
const TOPIC_POOL = [
  // Vehicle-specific
  "cargo van wraps for small businesses",
  "box truck wraps for delivery companies",
  "sprinter van wraps for service contractors",
  "Ford Transit van wraps for fleet branding",
  "pickup truck wraps for landscapers and contractors",
  "food truck wraps that attract customers",
  "SUV wraps for real estate agents and sales teams",
  "Tesla and electric vehicle wraps — what owners need to know",
  "Rivian R1T and R1S color change wraps",
  "luxury car wraps — protecting paint on high-end vehicles",
  "trailer wraps for mobile advertising",
  "motorcycle wraps and custom graphics",
  // Industry pain points
  "HVAC companies using van wraps to generate leads",
  "plumbing fleet wraps that build trust with homeowners",
  "electrician truck wraps that stand out in neighborhoods",
  "roofing company vehicle wraps for local visibility",
  "moving company box truck wraps that build credibility",
  "landscaping truck wraps that showcase quality work",
  "pest control vehicle wraps for local branding",
  "cleaning service van wraps for professional image",
  // Technical / educational
  "3M vs Avery Dennison vinyl — which is better for fleet wraps",
  "how long do commercial vehicle wraps last in Chicago weather",
  "full wrap vs partial wrap vs lettering — ROI comparison",
  "vehicle wrap care and maintenance guide for fleet managers",
  "how to design effective fleet graphics that generate calls",
  "vehicle wrap removal process — what to expect",
  "color change wrap finishes — gloss, matte, satin, chrome explained",
  "ceramic coating over vehicle wraps — is it worth it",
  "wrap vs paint — cost, durability, and resale value comparison",
  "vehicle wrap ROI — how fleet wraps outperform digital ads",
  "how vehicle wraps protect factory paint",
  "winter vehicle wrap installation — cold weather considerations",
  // Business / strategy
  "fleet branding strategy — getting maximum impressions per vehicle",
  "tax deductions for commercial vehicle wraps under IRS Section 179",
  "how to choose a vehicle wrap company in Chicago",
  "fleet wrap project timeline — from design to delivery",
  "vehicle wrap warranties — what's covered and what's not",
  "branded vs unbranded fleet vehicles — the business case for wraps",
  "measuring ROI on fleet vehicle wraps with call tracking",
  "wrapping leased vehicles — everything you need to know",
  // Local / Chicago-specific
  "best routes in Chicago for maximum fleet wrap visibility",
  "Chicago DOT regulations for commercial vehicle graphics",
  "seasonal fleet wrap strategies for Chicago businesses",
  "why Chicago contractors are switching from magnets to wraps",
  "fleet wrap case study — Chicago HVAC company generates 40% more leads",
];

// Map topics to relevant OG images
const IMAGE_MAP: Record<string, string> = {
  'cargo van': 'cfw_van_1.png',
  'box truck': 'windy_city_box_truck.webp',
  'sprinter': 'precision_today_sprinter.jpg',
  'transit': 'small_transit_van.webp',
  'pickup': 'exalt_air_pick_up_truck.webp',
  'food truck': 'blondies_beef_truck.jpg',
  'tesla': 'color_change_tesla.webp',
  'rivian': 'rivian_blue_holographic.jpg',
  'electric': 'rivian_rad.jpg',
  'ev': 'rivian_rad.jpg',
  'hvac': 'precision_today_hvac.jpg',
  'plumb': 'cfw_van_3.png',
  'electric': 'arnold_electric_van.jpg',
  'roofing': 'sns_roofing_truck.png',
  'moving': 'cfw_truck_2.png',
  'landscape': 'cfw_truck_3.png',
  'boat': 'cutwater_boat.jpg',
  'color change': 'audi_color_shift.jpg',
  'removal': 'graphics_removal.webp',
  '3m': 'wrap_install_closeup.jpg',
  'avery': 'wrap_install_closeup.jpg',
  'fleet': 'frontier_fleet_vans.jpg',
  'luxury': 'bmw_matte_black.jpg',
  'motorcycle': 'the_d_limo_motorcycle.jpg',
  'wall': 'oakbros_wall_wrap.jpg',
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
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not configured');

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Supabase credentials not configured');

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Accept optional topic from request body
    let requestedTopic: string | null = null;
    try {
      const body = await req.json();
      if (body?.topic) requestedTopic = body.topic;
    } catch { /* no body or invalid JSON — use rotation */ }

    let topic: string;
    if (requestedTopic) {
      topic = requestedTopic;
    } else {
      // Count existing posts to rotate through topics
      const { count } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true });
      const topicIndex = (count || 0) % TOPIC_POOL.length;
      topic = TOPIC_POOL[topicIndex];
    }
    const ogImage = pickOgImage(topic);

    console.log(`Generating blog post: "${topic}"`);

    // Call Anthropic to generate the blog post
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
1. Write 1,500-1,800 words in a conversational, human tone — like a knowledgeable friend in the industry
2. Include real pain points business owners face and how wraps solve them
3. Include specific pros AND cons (be honest — builds trust)
4. Use Chicago-specific references (neighborhoods, highways, weather conditions)
5. Include actionable advice readers can use immediately
6. End with a clear CTA to get a free estimate

SEO/AEO/GEO REQUIREMENTS:
- Write for both humans AND AI answer engines
- Include 2-3 "People Also Ask" style Q&A sections that AI assistants can extract
- Use natural keyword variations throughout (don't stuff)
- Include specific numbers, stats, and data points
- Write sentences that could be directly quoted by Google's AI Overview or ChatGPT
- Include local Chicago references for GEO (geographic search optimization)
- Structure with clear H2/H3 headings for featured snippet eligibility

FORMAT — Return ONLY valid JSON with this exact structure:
{
  "title": "SEO-optimized title under 60 characters with primary keyword",
  "slug": "url-friendly-slug-with-keywords",
  "meta_description": "Compelling meta description under 155 characters with CTA",
  "keywords": "comma-separated list of 12-15 long-tail keywords",
  "excerpt": "2-3 sentence compelling excerpt for the blog index page",
  "category": "one of: Vehicle Wraps, Fleet Branding, Industry Guides, Materials & Care, Chicago Local",
  "content": "Full blog post in HTML with h2, h3, p, ul, li, strong, em tags. Include speakable class on key answer paragraphs."
}

CRITICAL: Return ONLY the JSON object. No markdown code fences. No explanation before or after.`
        }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic error:', response.status, err);
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const aiResult = await response.json();
    const rawText = aiResult.content?.[0]?.text || '';
    
    // Parse JSON from response (handle potential markdown fences)
    let cleaned = rawText.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    
    let post;
    try {
      post = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('Failed to parse AI response:', cleaned.substring(0, 500));
      throw new Error('Failed to parse blog post JSON from AI');
    }

    // Validate required fields
    if (!post.title || !post.content || !post.slug) {
      throw new Error('AI response missing required fields (title, content, or slug)');
    }

    // Ensure slug is URL-safe
    const finalSlug = slugify(post.slug);

    // Check for duplicate slug
    const { data: existing } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', finalSlug)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ message: 'Post with this slug already exists', slug: finalSlug }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert the post
    const { data: inserted, error: insertErr } = await supabase
      .from('blog_posts')
      .insert({
        title: post.title,
        slug: finalSlug,
        meta_description: post.meta_description || post.title,
        keywords: post.keywords || topic,
        content: post.content,
        excerpt: post.excerpt || post.meta_description || '',
        og_image: ogImage,
        category: post.category || 'Vehicle Wraps',
      })
      .select()
      .single();

    if (insertErr) {
      console.error('Insert error:', insertErr);
      throw new Error(`Database insert failed: ${insertErr.message}`);
    }

    console.log(`✅ Blog post published: "${post.title}" → /post/${finalSlug}/`);

    return new Response(
      JSON.stringify({
        success: true,
        post: {
          id: inserted.id,
          title: inserted.title,
          slug: inserted.slug,
          url: `/post/${inserted.slug}/`,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Blog generation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
