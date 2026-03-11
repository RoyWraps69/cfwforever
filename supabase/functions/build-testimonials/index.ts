import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PLACE_ID = 'ChIJTQl0F0vSD4gRpBz-ZmVGHuU';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!GOOGLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing config');

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch reviews from Google Places API
    const placesUrl = `https://places.googleapis.com/v1/places/${PLACE_ID}?fields=reviews,rating,userRatingCount&key=${GOOGLE_API_KEY}`;
    const placesResp = await fetch(placesUrl);
    if (!placesResp.ok) throw new Error(`Google API error: ${placesResp.status}`);

    const placesData = await placesResp.json();
    const reviews = placesData.reviews || [];
    const rating = placesData.rating || 4.9;
    const totalReviews = placesData.userRatingCount || 200;

    // Filter for 4+ star reviews with substantial text
    const goodReviews = reviews
      .filter((r: any) => r.rating >= 4 && r.text?.text?.length > 50)
      .map((r: any) => ({
        author: r.authorAttribution?.displayName || 'Customer',
        rating: r.rating,
        text: r.text?.text || '',
        time: r.publishTime || '',
        photoUri: r.authorAttribution?.photoUri || '',
      }));

    // Use AI to categorize and highlight key themes
    let categories: any[] = [];
    if (LOVABLE_API_KEY && goodReviews.length > 0) {
      try {
        const aiResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash-lite',
            messages: [{
              role: 'user',
              content: `Analyze these customer reviews for Chicago Fleet Wraps and categorize them. Return JSON array of categories with the best review excerpt for each.

Reviews:
${goodReviews.map((r: any, i: number) => `${i+1}. "${r.text}" — ${r.author}`).join('\n')}

Return ONLY JSON: [{"category": "Quality", "highlight": "best quote from a review", "author": "name"}]
Categories to use: Quality, Professionalism, Design, Turnaround, Value, Communication
No fences.`
            }],
          }),
        });
        if (aiResp.ok) {
          const aiData = await aiResp.json();
          let content = aiData.choices?.[0]?.message?.content || '';
          if (content.startsWith('```')) content = content.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
          categories = JSON.parse(content);
        }
      } catch (e) {
        console.error('AI categorization failed, continuing without:', e);
      }
    }

    // Build testimonials HTML page content
    const testimonialData = {
      rating,
      totalReviews,
      reviews: goodReviews,
      categories,
      updatedAt: new Date().toISOString(),
    };

    // Store in growth_log for the SPA to pull
    await supabase.from('growth_log').insert({
      action_type: 'testimonials-built',
      details: testimonialData,
    });

    console.log(`✅ Testimonials built: ${goodReviews.length} reviews, ${categories.length} categories`);
    return new Response(JSON.stringify({ success: true, ...testimonialData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Testimonials error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
