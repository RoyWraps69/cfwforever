const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SB_URL = Deno.env.get('SUPABASE_URL')!
const SB_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY')!
const ANT_KEY = Deno.env.get('ANTHROPIC_API_KEY')!

// Recent CFW reviews to respond to (fetched from GBP or manually seeded)
// Since GBP token is expired, we generate responses for any reviews stored in DB
// or process reviews passed directly in the request body

async function generateResponse(reviewer: string, rating: number, text: string): Promise<string> {
  const prompt = `You are writing a Google review response for Chicago Fleet Wraps (Roy Wraps).

Reviewer: ${reviewer}
Star rating: ${rating}/5
Review: "${text}"

Rules:
- 2-4 sentences max
- Direct, genuine, not corporate
- Thank them by first name if possible
- 4-5 stars: grateful, specific to what they said
- 1-3 stars: acknowledge the issue, offer to make it right, give phone (312) 597-1286
- Never use: seamless, leverage, utilize, foster, synergy, robust, delve
- Sign off: — The Chicago Fleet Wraps Team

Write ONLY the response, no quotes, no JSON.`

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANT_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  const d = await r.json()
  return d.content?.[0]?.text?.trim() || 'Thank you for your review. — The Chicago Fleet Wraps Team'
}

async function sbInsert(table: string, rows: Record<string, unknown>[]) {
  const r = await fetch(`${SB_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(rows),
  })
  if (!r.ok) throw new Error(`Insert ${table} failed: ${await r.text()}`)
  return r.json()
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const body = await req.json().catch(() => ({}))

    // Accept reviews passed directly in request body
    // Format: { reviews: [{ reviewer, rating, text, review_id }] }
    const reviews: Array<{ reviewer: string; rating: number; text: string; review_id?: string }> =
      body.reviews || []

    // If no reviews passed, return instructions
    if (reviews.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Pass reviews in body: { reviews: [{ reviewer, rating, text, review_id }] }',
          example: {
            reviews: [
              { reviewer: 'John Smith', rating: 5, text: 'Amazing wrap on our fleet vans!' },
              { reviewer: 'Jane D', rating: 3, text: 'Good work but took longer than expected.' },
            ],
          },
        }),
        { headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }

    const results = []

    for (const review of reviews) {
      const response = await generateResponse(
        review.reviewer || 'customer',
        review.rating || 5,
        review.text || ''
      )

      // Store draft response in geo_tasks for review/approval
      await sbInsert('geo_tasks', [{
        entity: 'chicagofleetwraps.com',
        task_type: 'review_response',
        priority: review.rating <= 3 ? 1 : 3,
        title: `Review response: ${review.reviewer} (${review.rating}★)`,
        description: `DRAFT RESPONSE:\n\n${response}\n\n---\nOriginal review: "${review.text}"`,
        url: 'https://g.page/r/CURezQw2lK1eEBM/review',
        status: 'todo',
      }])

      results.push({
        reviewer: review.reviewer,
        rating: review.rating,
        draft_response: response,
        stored: true,
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        message: 'Draft responses stored in geo_tasks — review in ops dashboard',
        results,
      }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('review-response-bot error:', err)
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }
})
