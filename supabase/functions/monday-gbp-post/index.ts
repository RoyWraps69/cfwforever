const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ANT_KEY = Deno.env.get('ANTHROPIC_API_KEY')!
const GBP_CLIENT_ID = Deno.env.get('GBP_CLIENT_ID')!
const GBP_CLIENT_SECRET = Deno.env.get('GBP_CLIENT_SECRET')!
const GBP_REFRESH_TOKEN = Deno.env.get('GBP_REFRESH_TOKEN')!

const POST_TYPES = [
  'fleet_stat',
  'rivian_focus',
  'industry_tip',
  'behind_the_scenes',
  'promotion',
  'case_study',
]

const CFW_FACTS = [
  '9,400+ vehicles wrapped',
  '2,800+ fleet accounts',
  '600+ Rivians wrapped',
  'HP Latex certified',
  'Avery Dennison certified',
  '3M certified',
  'Chicago-based, family-owned',
  '$4,350 single van, $3,450 fleet volume pricing',
  'Fleet discounts at 3, 7, 11, and 15 units',
]

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

async function generatePost(): Promise<{ summary: string; callToAction: string }> {
  const postType = POST_TYPES[Math.floor(Math.random() * POST_TYPES.length)]
  const fact = CFW_FACTS[Math.floor(Math.random() * CFW_FACTS.length)]
  const weekNum = Math.ceil(new Date().getDate() / 7)

  const prompt = `Write a Google Business Profile post for Chicago Fleet Wraps. 

Post type: ${postType}
Anchor fact to include: ${fact}
Week: ${weekNum} of ${new Date().toLocaleString('en-US', { month: 'long' })}

Rules:
- 150-250 characters max (GBP limit)
- Active voice, direct, no fluff
- No hashtags
- No banned words: delve, tapestry, leverage, utilize, seamless, foster, synergy, robust
- End with a call to action (get a quote, call us, visit chicagofleetwraps.com)
- Written as Chicago Fleet Wraps team, not "I"

Respond with JSON only: {"summary":"the post text","callToAction":"LEARN_MORE|CALL|BOOK|ORDER|SIGN_UP"}`

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': ANT_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 300, messages: [{ role: 'user', content: prompt }] }),
  })
  const d = await r.json()
  const text = d.content?.[0]?.text || '{}'

  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    return {
      summary: `Chicago Fleet Wraps has wrapped 9,400+ vehicles across Chicagoland. Fleet pricing starts at $3,450/unit with discounts at 3+ vehicles. Get your quote today at chicagofleetwraps.com`,
      callToAction: 'LEARN_MORE',
    }
  }
}

async function publishPost(token: string, location: string, summary: string, callToAction: string): Promise<void> {
  const r = await fetch(`https://mybusiness.googleapis.com/v4/${location}/localPosts`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      languageCode: 'en-US',
      summary,
      callToAction: {
        actionType: callToAction,
        url: 'https://chicagofleetwraps.com/estimate/',
      },
      topicType: 'STANDARD',
    }),
  })
  if (!r.ok) throw new Error(`GBP post failed: ${await r.text()}`)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const body = await req.json().catch(() => ({}))
    const dryRun = body.dry_run === true || body.test === true

    // Only run on Mondays unless forced
    const day = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago', weekday: 'long' })
    if (day !== 'Monday' && !body.force && !dryRun) {
      return new Response(
        JSON.stringify({ success: true, skipped: true, message: `Not Monday — today is ${day}` }),
        { headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }

    const { summary, callToAction } = await generatePost()

    if (dryRun) {
      return new Response(
        JSON.stringify({ success: true, dry_run: true, summary, callToAction }),
        { headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }

    const token = await getGBPToken()
    const { location } = await getAccountAndLocation(token)
    await publishPost(token, location, summary, callToAction)

    return new Response(
      JSON.stringify({ success: true, published: true, summary, callToAction, ts: new Date().toISOString() }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('monday-gbp-post error:', err)
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }
})
