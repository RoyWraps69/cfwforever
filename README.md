# Chicago Fleet Wraps — Site Repository

Production site for chicagofleetwraps.com.

## Stack
- **Static HTML** in `public/` — Eleventy build, Netlify deploy
- **CSS:** `public/css/site.v4.css` (single source of truth, no per-page `<style>`)
- **GA4:** `G-54BP1GMYJ1` injected into every `<head>`
- **Backend:** Netlify Functions (`netlify/functions/`) + Supabase Edge Functions (`supabase/functions/`)

## Quick references
- Build/deploy notes: `BUILD.md`
- Page-type diagnostic: `skills/cfw-page-types/` (4 page types, type-specific fixes)
- Audit scripts: `scripts/full-audit-v2.py`, `scripts/seo-audit.py`
- Page tools: `tools/cfw-scripts/`

## Deployment
Pure static. Netlify no longer mutates HTML on deploy (`skip_processing=true`). What's in the repo is what ships.
