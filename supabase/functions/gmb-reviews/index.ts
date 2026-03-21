const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Real 5-star Google reviews from Chicago Fleet Wraps GBP
const STATIC_REVIEWS = [
  {
    author: 'Marcus Barbee',
    rating: 5,
    text: 'Best car wrap on the planet. Love working with Roy!',
    time: '17 hours ago',
    photo: '',
  },
  {
    author: 'Clifford Dunigan',
    rating: 5,
    text: "Chicago Fleet Wraps did an incredible job wrapping my C8 Corvette, turning it from torch red to a sleek matte black finish. The craftsmanship is flawless—every edge, curve, and detail was executed with precision. The wrap looks like factory paint. Highly recommend Chicago Fleet Wraps for anyone wanting a showroom-quality wrap!",
    time: '10 months ago',
    photo: 'https://lh3.googleusercontent.com/a-/ALV-UjXGiOi8nV9WrP49YWHOuFoECNdKrP9sNRkej_0-XlqbtE26xFvt=s128-c0x00000000-cc-rp-mo-ba2',
  },
  {
    author: 'Ivan J. Miranda',
    rating: 5,
    text: "Roy and his team were a blessing to work with. From the beginning, Roy was extremely responsive and attentive. My wrap had to be done within a certain time frame for an event and he delivered! They did not hesitate to do revisions until I was 110% happy with the design. It turned out sick!!",
    time: '5 months ago',
    photo: 'https://lh3.googleusercontent.com/a/ACg8ocJBhUJ-pyKXlM0NrMeCXoGdXp7qSLzZbgdYBFLk0SF7mA0tyGc=s128-c0x00000000-cc-rp-mo-ba2',
  },
  {
    author: 'Alicia Harvey',
    rating: 5,
    text: "Had a great experience with Chicago Fleet Wraps. They were super responsive with a great turn around time. We even had to update the QR code that we had built into our wrap and they handled that within a day! I highly recommend them - we continue to get compliments!",
    time: '10 months ago',
    photo: 'https://lh3.googleusercontent.com/a-/ALV-UjURphD0YYzmzI8aT19jkUDpfZd482tVNyqCsrTMW_W1kWoo0Jy8=s128-c0x00000000-cc-rp-mo',
  },
  {
    author: 'Arnold Electric Services',
    rating: 5,
    text: "We are so happy that Chicago Fleet Wraps reached out to us. The differentiator here is the communication and overall process which really translates to: Amazing Customer Service!!! They have their ducks in a row which made the process of working with Chicago Fleet Wraps enjoyable. The installation was better than expected. Looking forward to getting the rest of the fleet done and any new vehicles we add in the coming years. Thank you so much! - Jack Arnold",
    time: '11 months ago',
    photo: 'https://lh3.googleusercontent.com/a-/ALV-UjUaL2u33YN89AFPhEWdcmV0zVKmz5EfpX0t2I0lK7v4hiRt2FU=s128-c0x00000000-cc-rp-mo',
  },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    
    // Try live API first if key is available
    if (apiKey && apiKey !== 'PLACEHOLDER') {
      try {
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

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          const place = searchData.places?.[0];
          if (place) {
            const apiReviews = (place.reviews || [])
              .filter((r: any) => (r.rating || 5) === 5)
              .map((r: any) => ({
                author: r.authorAttribution?.displayName || 'Customer',
                rating: 5,
                text: r.text?.text || '',
                time: r.relativePublishTimeDescription || '',
                photo: r.authorAttribution?.photoUri || '',
              }));

            // Supplement with static reviews if fewer than 5
            let reviews = [...apiReviews];
            if (reviews.length < 5) {
              const existingAuthors = new Set(reviews.map((r: any) => r.author));
              for (const staticReview of STATIC_REVIEWS) {
                if (reviews.length >= 5) break;
                if (!existingAuthors.has(staticReview.author)) {
                  reviews.push(staticReview);
                  existingAuthors.add(staticReview.author);
                }
              }
            }

            return new Response(JSON.stringify({
              rating: place.rating || 4.9,
              reviewCount: place.userRatingCount || 42,
              placeId: place.id,
              reviews: reviews.slice(0, 6),
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' },
            });
          }
        }
      } catch (_e) {
        // Fall through to static reviews
      }
    }

    // Return static reviews as fallback
    return new Response(JSON.stringify({
      rating: 4.9,
      reviewCount: 42,
      reviews: STATIC_REVIEWS.slice(0, 5),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      rating: 4.9,
      reviewCount: 42,
      reviews: STATIC_REVIEWS.slice(0, 5),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
