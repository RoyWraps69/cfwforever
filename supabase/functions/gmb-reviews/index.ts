const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'GOOGLE_PLACES_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Search for the place to get the current Place ID
    const searchUrl = 'https://places.googleapis.com/v1/places:searchText';
    const searchResponse = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.userRatingCount,places.reviews',
      },
      body: JSON.stringify({
        textQuery: 'Chicago Fleet Wraps 4711 N Lamon Ave Chicago IL',
      }),
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('Google Places search error:', searchResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: `Google API error: ${searchResponse.status}`, details: errorText }),
        { status: searchResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const searchData = await searchResponse.json();
    const place = searchData.places?.[0];

    if (!place) {
      return new Response(
        JSON.stringify({ error: 'Place not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = {
      rating: place.rating || 5.0,
      reviewCount: place.userRatingCount || 0,
      placeId: place.id,
      reviews: (place.reviews || [])
        .filter((r: any) => (r.rating || 5) >= 4)
        .slice(0, 6)
        .map((r: any) => ({
        author: r.authorAttribution?.displayName || 'Customer',
        rating: r.rating || 5,
        text: r.text?.text || '',
        time: r.relativePublishTimeDescription || '',
        photo: r.authorAttribution?.photoUri || '',
      })),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' },
    });
  } catch (error) {
    console.error('Error fetching GMB data:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
