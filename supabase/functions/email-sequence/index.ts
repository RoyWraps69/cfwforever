const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SB_URL = Deno.env.get('SUPABASE_URL')!
const SB_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY')!
const ANT_KEY = Deno.env.get('ANTHROPIC_API_KEY')!
const GMAIL_CLIENT_ID = Deno.env.get('GMAIL_CLIENT_ID')!
const GMAIL_CLIENT_SECRET = Deno.env.get('GMAIL_CLIENT_SECRET')!
const GMAIL_REFRESH_TOKEN = Deno.env.get('GMAIL_REFRESH_TOKEN')!

const FROM_EMAIL = 'roy@chicagofleetwraps.com'
const FROM_NAME = 'Roy Wraps — Chicago Fleet Wraps'

// EMAIL TEMPLATES by type
const TEMPLATES: Record<string, (data: Record<string, string>) => { subject: string; html: string }> = {
  quote_followup: (d) => ({
    subject: `Your fleet wrap quote — Chicago Fleet Wraps`,
    html: `<p>Hey ${d.customer_name || 'there'},</p>
<p>Just checking in on your fleet wrap project. We put together pricing on ${d.vehicle_type || 'your vehicles'} and want to make sure you have everything you need to move forward.</p>
<p>Quick recap: ${d.vehicle_type ? `${d.vehicle_type} wraps` : 'Fleet wraps'} at Chicago Fleet Wraps run $3,450–$4,350 per unit depending on vehicle size and coverage. Fleet discounts kick in at 3 units.</p>
<p>If you have questions or want to lock in a bay date, reply here or call us directly.</p>
<p>— Roy Wraps<br>Chicago Fleet Wraps<br>(312) 000-0000</p>`,
  }),

  review_request: (d) => ({
    subject: `How did we do? — Chicago Fleet Wraps`,
    html: `<p>Hey ${d.customer_name || 'there'},</p>
<p>Your ${d.vehicle_type || 'vehicle'} wrap is done and we hope it's turning heads.</p>
<p>If you have 60 seconds, a Google review means everything to a shop like ours. Honest feedback helps other fleet managers find us.</p>
<p><a href="https://g.page/r/CURezQw2lK1eEBM/review" style="background:#FFD700;color:#000;padding:10px 20px;text-decoration:none;font-weight:bold;display:inline-block;margin:10px 0;">Leave a Google Review</a></p>
<p>Thank you for trusting us with your fleet.</p>
<p>— Roy Wraps<br>Chicago Fleet Wraps</p>`,
  }),

  appointment_reminder: (d) => ({
    subject: `Reminder: Your wrap appointment — Chicago Fleet Wraps`,
    html: `<p>Hey ${d.customer_name || 'there'},</p>
<p>This is a reminder that your wrap appointment is coming up.</p>
<p><strong>What to bring:</strong> Vehicle with a full tank, any specific color/design approvals signed off, and your fleet manager contact if applicable.</p>
<p><strong>Our shop:</strong> Chicago, IL — we'll confirm the exact address when you're on your way.</p>
<p>Questions? Reply here or text us.</p>
<p>— Roy Wraps<br>Chicago Fleet Wraps</p>`,
  }),

  welcome: (d) => ({
    subject: `Welcome to Chicago Fleet Wraps`,
    html: `<p>Hey ${d.customer_name || 'there'},</p>
<p>Thanks for reaching out. You're working with the team that's wrapped 9,400+ vehicles — including 600+ Rivians.</p>
<p>Here's what happens next:</p>
<ol>
<li>We'll review your vehicle details and send pricing within 24 hours</li>
<li>Once approved, we schedule your bay time</li>
<li>Most installs complete in 1–3 days depending on fleet size</li>
</ol>
<p>— Roy Wraps<br>Chicago Fleet Wraps</p>`,
  }),
}

async function getGmailToken(): Promise<string> {
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GMAIL_CLIENT_ID,
      client_secret: GMAIL_CLIENT_SECRET,
      refresh_token: GMAIL_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  })
  const d = await r.json()
  if (!d.access_token) throw new Error(`Gmail token error: ${JSON.stringify(d)}`)
  return d.access_token
}

function buildEmail(to: string, subject: string, html: string): string {
  const msg = [
    `From: ${FROM_NAME} <${FROM_EMAIL}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=utf-8`,
    ``,
    html,
  ].join('\r\n')
  return btoa(unescape(encodeURIComponent(msg)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function sendEmail(token: string, to: string, subject: string, html: string): Promise<void> {
  const r = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: buildEmail(to, subject, html) }),
  })
  if (!r.ok) throw new Error(`Gmail send failed: ${await r.text()}`)
}

async function sbUpdate(table: string, id: string, data: Record<string, unknown>) {
  const r = await fetch(`${SB_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(data),
  })
  if (!r.ok) throw new Error(`Update ${table} failed: ${await r.text()}`)
}

async function sbInsert(table: string, rows: Record<string, unknown>[]) {
  const r = await fetch(`${SB_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(rows),
  })
  if (!r.ok) throw new Error(`Insert ${table} failed: ${await r.text()}`)
}

async function generateEmailWithAI(type: string, jobData: Record<string, string>): Promise<{ subject: string; html: string }> {
  const template = TEMPLATES[type]
  if (template) return template(jobData)

  // Fallback: generate with AI
  const prompt = `Write a short, direct email from Roy Wraps at Chicago Fleet Wraps to ${jobData.customer_name || 'a fleet customer'}.
Email type: ${type}
Vehicle: ${jobData.vehicle_type || 'fleet vehicle'}
Tone: professional, direct, no fluff. Active voice. Short sentences.
Respond with JSON: {"subject":"email subject","html":"html email body — use <p> tags"}`

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': ANT_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 600, messages: [{ role: 'user', content: prompt }] }),
  })
  const d = await r.json()
  const text = d.content?.[0]?.text || '{}'
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    return { subject: `Message from Chicago Fleet Wraps`, html: `<p>Hi ${jobData.customer_name || 'there'},</p><p>Thank you for working with Chicago Fleet Wraps.</p>` }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const now = new Date().toISOString()

    // Fetch pending emails due now
    const r = await fetch(
      `${SB_URL}/rest/v1/scheduled_emails?status=eq.pending&scheduled_for=lte.${now}&order=scheduled_for.asc&limit=20`,
      { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
    )
    const pending = await r.json()

    if (!Array.isArray(pending) || pending.length === 0) {
      return new Response(JSON.stringify({ success: true, processed: 0, message: 'No pending emails' }), {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const token = await getGmailToken()
    let sent = 0
    let failed = 0
    const errors: string[] = []

    for (const email of pending) {
      try {
        // Get job details for template data
        let jobData: Record<string, string> = { customer_name: '', vehicle_type: '' }
        if (email.job_id) {
          const jr = await fetch(`${SB_URL}/rest/v1/jobs?id=eq.${email.job_id}&limit=1`, {
            headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
          })
          const jobs = await jr.json()
          if (jobs?.[0]) {
            jobData = {
              customer_name: jobs[0].customer_name || '',
              vehicle_type: jobs[0].vehicle_type || '',
              job_type: jobs[0].job_type || '',
            }
          }
        }

        const { subject, html } = await generateEmailWithAI(email.type, jobData)
        await sendEmail(token, email.email, subject, html)

        // Mark sent
        await sbUpdate('scheduled_emails', email.id, { status: 'sent', processed_at: new Date().toISOString() })
        await sbInsert('email_log', [{ job_id: email.job_id || null, email: email.email, subject, type: email.type, status: 'sent', sent_at: new Date().toISOString() }])

        // If review request, mark job review_sent
        if (email.type === 'review_request' && email.job_id) {
          await sbUpdate('jobs', email.job_id, { review_sent: true })
        }

        sent++
      } catch (err) {
        failed++
        errors.push(`${email.email}: ${(err as Error).message}`)
        await sbUpdate('scheduled_emails', email.id, { status: 'failed', processed_at: new Date().toISOString() })
        await sbInsert('email_log', [{ job_id: email.job_id || null, email: email.email, subject: 'FAILED', type: email.type, status: 'failed', sent_at: new Date().toISOString() }])
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: pending.length, sent, failed, errors }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('email-sequence error:', err)
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }
})
