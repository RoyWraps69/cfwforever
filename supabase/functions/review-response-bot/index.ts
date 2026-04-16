const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SB_URL = Deno.env.get('SUPABASE_URL')!
const SB_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY')!
const ANT_KEY = Deno.env.get('ANTHROPIC_API_KEY')!
const GBP_CLIENT_ID = Deno.env.get('GBP_CLIENT_ID')!
const GBP_CLIENT_SECRET = Deno.env.get('GBP_CLIENT_SECRET')!
const GBP_REFRESH_TOKEN = Deno.env.get('GBP_REFRESH_TOKEN')!

async function getGBPToken(): Promise<string> {
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GBP_CLIENT_ID,
      client_secret: GBP_CLIENT_SECRET,
      refresh_token: GBP_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  })
  const d = await r.json()
  if (!d.access_token) throw new Error(`GBP token error: ${JSON.stringify(d)}`)
  return d.access_token
}

async function getAccountAndLocation(token: string): Promise<{ account: string; location: string }> {
  const ar = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
    headers: { Authorization: `Bearer ${token}` },
  })
  const ad = await ar.json()
  const account = ad.accounts?.[0]?.name
  if (!account) throw new Error('No GBP account found')

  const lr = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${account}/locations?pageSize=10`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const ld = await lr.json()
  const location = ld.locations?.[0]?.name
  if (!location) throw new Error('No GBP location found')

  return { account, location }
}

async function fetchUnansweredReviews(token: string, location: string): Promise<Record<string, unknown>[]> {
  const r = await fetch(
    `https://mybusiness.googleapis.com/v4/${location}/reviews?pageSize=20&orderBy=updateTime+desc`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const d = await r.json()
  const reviews = d.reviews || []
  return reviews.filter((rev: Record<string, unknown>) => !rev.reviewReply)
}

async function generateResponse(review: Record<string, unknown>): Promise<string> {
  const rating = (review.starRating as string) || 'unknown'
  const text = (review.comment as string) || '(no text)'
  const reviewer = ((review.reviewer as Record<string, string>)?.displayName) || 'customer'

  const ratingMap: Record<string, string> = { ONE: '1', TWO: '2', THREE: '3', FOUR: '4', FIVE: '5' }
  const stars = ratingMap[rating] || rating

  const prompt = `You are Roy Wraps at Chicago Fleet Wraps responding to a Google review. Write a response that is:
- Direct and genuine, not corporate
- 2-4 sentences max
- Thanks them by first name if possible
- For 4-5 stars: grateful and specific to what they said
- For 1-3 stars: acknowledge the issue, offer to make it right, give contact info
- NEVER use: "delve", "tapestry", "leverage", "utilize", "seamless", "foster"
- Sign off as: — The Chicago Fleet Wraps Team

Reviewer: ${reviewer}
Star rating: ${stars}/5
Review text: "${text}"

Write ONLY the response text, no quotes, no JSON.`

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': ANT_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 200, messages: [{ role: 'user', content: prompt }] }),
  })
  const d = await r.json()
  return d.content?.[0]?.text?.trim() || 'Thank you for your review. — The Chicago Fleet Wraps Team'
}

async function postReply(token: string, reviewName: string, comment: string): Promise<void> {
  const r = await fetch(`https://mybusiness.googleapis.com/v4/${reviewName}/reply`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ comment }),
  })
  if (!r.ok) throw new Error(`Reply failed: ${await r.text()}`)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const body = await req.json().catch(() => ({}))
    const dryRun = body.dry_run === true || body.test === true

    const token = await getGBPToken()
    const { location } = await getAccountAndLocation(token)
    const reviews = await fetchUnansweredReviews(token, location)

    if (reviews.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No unanswered reviews', replied: 0 }),
        { headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }

    const results: Record<string, unknown>[] = []
    let replied = 0

    for (const review of reviews.slice(0, 10)) {
      try {
        const response = await generateResponse(review)

        if (!dryRun) {
          await postReply(token, review.name as string, response)
          replied++
        }

        results.push({
          reviewer: (review.reviewer as Record<string, string>)?.displayName,
          rating: review.starRating,
          response: response.slice(0, 100) + '...',
          posted: !dryRun,
        })
      } catch (err) {
        results.push({
          reviewer: (review.reviewer as Record<string, string>)?.displayName,
          error: (err as Error).message,
          posted: false,
        })
      }
    }

    return new Response(
      JSON.stringify({ success: true, found: reviews.length, replied, dry_run: dryRun, results }),
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
