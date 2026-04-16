const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SB_URL = Deno.env.get('SUPABASE_URL')!
const SB_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY')!
const ANT_KEY = Deno.env.get('ANTHROPIC_API_KEY')!

const ENTITIES = [
  'chicagofleetwraps.com',
  'fleetwrapguide.com',
  'rivianwraps.com',
]

const QUERIES = [
  { q: 'best fleet wrap company Chicago', platform: 'ChatGPT' },
  { q: 'Rivian vehicle wrap Chicago', platform: 'Perplexity' },
  { q: 'commercial van wraps Chicago', platform: 'Google AIO' },
  { q: 'how much does a fleet wrap cost', platform: 'Gemini' },
  { q: 'who wraps Rivian trucks', platform: 'ChatGPT' },
  { q: 'fleet vehicle graphics Chicago IL', platform: 'Perplexity' },
  { q: 'best materials for vehicle wraps', platform: 'Google AIO' },
  { q: 'Chicago fleet wrap company reviews', platform: 'Gemini' },
]

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
  if (!r.ok) throw new Error(`${table} insert failed: ${await r.text()}`)
  return r.json()
}

async function sbSelect(table: string, filter: string) {
  const r = await fetch(`${SB_URL}/rest/v1/${table}?${filter}`, {
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
  })
  return r.json()
}

async function claude(prompt: string, maxTokens = 400): Promise<string> {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANT_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  const d = await r.json()
  return d.content?.[0]?.text || ''
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const today = new Date().toISOString().split('T')[0]
    const briefs: Record<string, unknown>[] = []
    const probes: Record<string, unknown>[] = []

    // Run checks for high-priority entity+query combos
    const checks = ENTITIES.flatMap(entity =>
      QUERIES.slice(0, entity === 'chicagofleetwraps.com' ? 4 : 2).map(({ q, platform }) => ({ entity, q, platform }))
    )

    for (const { entity, q, platform } of checks) {
      const raw = await claude(
        `You are a GEO (Generative Engine Optimization) analyst. Entity: ${entity}. Query: "${q}". Platform: ${platform}.

Assess: Would ${platform} AI cite ${entity} as a result for this query today? What specific gap exists? What is the one highest-leverage fix?

Respond ONLY with valid JSON, no markdown, no preamble:
{"summary":"2 crisp sentences on current citation status","severity":"high|medium|low","action_items":["one specific fix"],"change_type":"citation_gap|ranking_drop|new_competitor|content_missing","was_cited":false}`
      )

      let parsed: Record<string, unknown> = {
        summary: `${entity} citation status unclear for "${q}" on ${platform}.`,
        severity: 'medium',
        action_items: ['Review and update entity content for this query'],
        change_type: 'citation_gap',
        was_cited: false,
      }

      try {
        parsed = { ...parsed, ...JSON.parse(raw.replace(/```json|```/g, '').trim()) }
      } catch { /* use defaults */ }

      briefs.push({
        brief_date: today,
        platform,
        change_type: parsed.change_type,
        summary: (parsed.summary as string).slice(0, 500),
        affects: [entity],
        action_items: Array.isArray(parsed.action_items) ? parsed.action_items : [parsed.action_items],
        severity: parsed.severity,
      })

      probes.push({
        probe_date: today,
        platform,
        query: q,
        entity,
        was_cited: parsed.was_cited === true,
        position: null,
        snippet: (parsed.summary as string).slice(0, 200),
      })
    }

    // Write briefs
    const insertedBriefs = await sbInsert('geo_briefs', briefs)

    // Write citation probes
    await sbInsert('citation_probes', probes)

    // Write tasks for high/medium severity items
    const tasks: Record<string, unknown>[] = []
    for (const brief of insertedBriefs) {
      if (['high', 'medium'].includes(brief.severity as string)) {
        const entity = (brief.affects as string[])[0]
        const existing = await sbSelect('geo_tasks',
          `entity=eq.${encodeURIComponent(entity)}&title=eq.${encodeURIComponent(`${brief.platform}: ${(brief.change_type as string).replace(/_/g,' ')}`)}&status=eq.todo&limit=1`
        )
        if (!Array.isArray(existing) || existing.length === 0) {
          tasks.push({
            entity,
            task_type: 'geo_citation',
            priority: brief.severity === 'high' ? 1 : 2,
            title: `${brief.platform}: ${(brief.change_type as string).replace(/_/g, ' ')}`,
            description: (brief.action_items as string[])[0] || '',
            url: `https://${entity}`,
            status: 'todo',
            source_brief: brief.id,
          })
        }
      }
    }

    if (tasks.length > 0) await sbInsert('geo_tasks', tasks)

    return new Response(
      JSON.stringify({ success: true, briefs: briefs.length, probes: probes.length, tasks: tasks.length, ts: new Date().toISOString() }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('geo-intelligence error:', err)
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }
})
