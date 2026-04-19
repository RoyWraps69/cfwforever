# Build workflow

> **Core principle:** what's in the repo IS what ships. Netlify no longer mutates HTML on deploy.

## What Netlify runs on deploy

```
node scripts/verify-build.mjs && node scripts/indexnow-ping.mjs
```

That's it. No stamping, no page generation. If verify passes, `public/` ships exactly as committed.

If verify fails, the deploy is blocked. You'll see the full issue list in the Netlify build log.

---

## `npm run verify` — the gatekeeper

Runs `scripts/verify-build.mjs`. Read-only. Checks every page for:

- Missing GA4 snippet
- Missing `<header>`, `<footer>`, or `.trib` ticker
- Zero or multiple `<h1>` tags
- Title outside 30–62 chars or missing
- Meta description outside 80–160 chars or missing
- Missing LocalBusiness, AggregateRating, FAQPage, or BreadcrumbList schema
- Duplicate meta description tags
- Duplicate canonical tags
- Banned words in body content (`delve`, `tapestry`, `nuanced`, `utilize`, `paradigm`, `synergy`, `robust`, `seamless`, `foster`, `underscore`, `certainly`, `absolutely`, `leverage` as verb)
- Links to deleted stub URLs (`/boxtruck/`, `/colorchange/`, `/fleet/`, etc.)

Fails with exit 1 on any issue. Run it anytime before committing.

---

## `npm run prepare` — use with care

Runs the two historical mutating scripts:
1. `generate-static-pages.mjs` — creates missing pages, regenerates redirect stubs, rebuilds sitemap
2. `stamp-header-footer.mjs` — replaces `<header>`, `<footer>`, `.trib`, and `.mnav` with hardcoded templates

**⚠️ This can introduce regressions.** The generator's templates are older than our current SEO standards and may produce pages that:
- Lack GA4
- Lack LocalBusiness/AggregateRating schema
- Have titles over 62 chars
- Regenerate stub directories you intentionally deleted

**Only run `npm run prepare` if:**
- You added new pages to the `PAGES` array in `generate-static-pages.mjs`
- You edited the header/footer templates in `stamp-header-footer.mjs`
- You know you want those template changes applied sitewide

**After running `npm run prepare`:**
1. Run `npm run verify` — if it fails, fix regressions in the generator's templates first
2. Review `git diff --stat` — 200+ file changes are normal; no changes means nothing was needed
3. Never commit prepare's output without running verify first

---

## GitHub Actions

`.github/workflows/verify-build.yml` runs `verify-build.mjs` on every push and PR to main. If verify fails, the PR or push is flagged.

---

## Normal editing workflow

1. Edit HTML under `public/` directly
2. `npm run verify` — confirm no regressions
3. `git add -A && git commit -m "..." && git push`
4. Netlify runs verify + indexnow. Deploy green in ~2 min.

## Exclusions from verification

These files are intentionally excluded (they don't need full site chrome):

- `googleac4190c5fb66b0fb.html`, `googleac4190c5fb66b0fb/index.html` — Google Site Verification
- `ops/index.html`, `dashboard.html` — internal admin tools
- `404.html` — Netlify's minimal root 404
- `site.html`, `catalog.html`, `admin.html` — internal

To add an exclusion, update `EXCLUDE_FULL` in `scripts/verify-build.mjs`.

---

## Modernizing `prepare` (future work)

The `generate-static-pages.mjs` templates predate our current SEO standards. To make `prepare` safe to run at any time, its page-generation template needs to:

1. Inject the full GA4 snippet on every page
2. Inject the full LocalBusiness + AggregateRating JSON-LD block
3. Enforce title length (30–62 chars)
4. Enforce meta length (80–160 chars)
5. Skip regenerating stub directories (remove from REDIRECTS / redirect-stub array in the generator)

Until that refactor happens, treat `prepare` as a manual tool that requires cleanup after use.
