const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ANT_KEY = Deno.env.get('ANTHROPIC_API_KEY')!
const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN')!
const NETLIFY_TOKEN = Deno.env.get('NETLIFY_TOKEN')!

const REPO = 'RoyWraps69/cfwforever'
const NETLIFY_HOOK = 'https://api.netlify.com/build_hooks/69d4bc7aadc9eee597add807'

const MICROSITES: Record<string, { domain: string; focus: string; parent: string }> = {
  'fleetwrapguide': {
    domain: 'fleetwrapguide.com',
    focus: 'fleet wrap industry reference — costs, materials, ROI, how-to guides',
    parent: 'chicagofleetwraps.com',
  },
  'rivianwraps': {
    domain: 'rivianwraps.com',
    focus: 'Rivian EV vehicle wraps — R1T, R1S, R2, cost, installation, portfolio',
    parent: 'chicagofleetwraps.com',
  },
}

const GEO_PAGES: Record<string, string[]> = {
  'fleetwrapguide': [
    'fleet-wrap-cost-guide',
    'best-vehicle-wrap-materials',
    'fleet-wrap-roi-calculator',
    'how-long-does-a-fleet-wrap-last',
    '3m-vs-avery-dennison-wrap-comparison',
  ],
  'rivianwraps': [
    'rivian-r1t-wrap-cost',
    'rivian-r1s-wrap-options',
    'rivian-ev-wrap-installation',
    'best-colors-for-rivian-wraps',
    'rivian-wrap-chicago',
  ],
}

async function githubGet(path: string): Promise<{ content: string; sha: string } | null> {
  const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github+json' },
  })
  if (r.status === 404) return null
  const d = await r.json()
  return { content: atob(d.content.replace(/\n/g, '')), sha: d.sha }
}

async function githubPut(path: string, content: string, message: string, sha?: string): Promise<void> {
  const body: Record<string, unknown> = {
    message,
    content: btoa(unescape(encodeURIComponent(content))),
  }
  if (sha) body.sha = sha

  const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!r.ok) throw new Error(`GitHub put failed: ${await r.text()}`)
}

async function generatePage(site: string, slug: string, siteConfig: { domain: string; focus: string; parent: string }): Promise<string> {
  const prompt = `Write a complete, SEO-optimized HTML page for ${siteConfig.domain}.

Page slug: /${slug}/
Site focus: ${siteConfig.focus}
Parent brand: ${siteConfig.parent} (Chicago Fleet Wraps — 9,400+ vehicles, 2,800+ accounts, 600+ Rivians)

Requirements:
- Full HTML document with head, meta tags, og tags, schema.org JSON-LD
- 600-900 words of authoritative body content
- H1, H2s, one data table or comparison, one FAQ section (3 questions)
- Internal link to ${siteConfig.parent} at least once
- Canonical URL: https://${siteConfig.domain}/${slug}/
- Title tag: [topic] | ${siteConfig.domain.split('.')[0].charAt(0).toUpperCase() + siteConfig.domain.split('.')[0].slice(1)}
- Author: Roy Wraps
- No generic filler. Specific data, numbers, facts.
- Style: dark background #0A0A0A, gold #FFD700 accent, font: system-ui

Return ONLY the complete HTML document, nothing else.`

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': ANT_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  const d = await r.json()
  return d.content?.[0]?.text || `<html><body><h1>${slug}</h1></body></html>`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const body = await req.json().catch(() => ({}))
    const targetSite = body.site as string | undefined
    const dryRun = body.dry_run === true
    const forceRefresh = body.force === true

    const sites = targetSite && MICROSITES[targetSite]
      ? { [targetSite]: MICROSITES[targetSite] }
      : MICROSITES

    const results: Record<string, unknown>[] = []
    let built = 0
    let skipped = 0

    for (const [siteKey, siteConfig] of Object.entries(sites)) {
      const pages = GEO_PAGES[siteKey] || []

      // Pick one page to refresh per run (rotate through them)
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
      const pageIndex = dayOfYear % pages.length
      const slug = body.slug || pages[pageIndex]

      const path = `public/${siteKey}/${slug}/index.html`

      // Check if page exists and was recently updated
      const existing = await githubGet(path)
      if (existing && !forceRefresh) {
        // Check if content mentions current year — if not, refresh
        const currentYear = new Date().getFullYear().toString()
        if (existing.content.includes(currentYear)) {
          skipped++
          results.push({ site: siteKey, slug, status: 'skipped', reason: 'fresh' })
          continue
        }
      }

      if (dryRun) {
        results.push({ site: siteKey, slug, status: 'dry_run', path })
        continue
      }

      const html = await generatePage(siteKey, slug, siteConfig)
      await githubPut(path, html, `[microsite] Refresh ${siteConfig.domain}/${slug}/ — ${new Date().toISOString().split('T')[0]}`, existing?.sha)

      built++
      results.push({ site: siteKey, slug, status: 'built', path })
    }

    // Trigger Netlify deploy if anything was built
    if (built > 0) {
      await fetch(NETLIFY_HOOK, { method: 'POST' })
    }

    return new Response(
      JSON.stringify({ success: true, built, skipped, dry_run: dryRun, results, deploy_triggered: built > 0 }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('microsite-builder error:', err)
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }
})
