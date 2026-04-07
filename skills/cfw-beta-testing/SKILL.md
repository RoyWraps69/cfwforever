---
name: cfw-beta-testing
description: >
  Full-stack website beta testing and QA for chicagofleetwraps.com (Eleventy/Netlify/GitHub static site).
  Use this skill whenever Roy asks to test the site, check pages, audit quality, find broken things,
  or verify any change worked correctly. Covers: live URL checks, HTML structure validation, CSS rule
  verification, link integrity, H1/hero presence, redirect correctness, mobile responsiveness signals,
  SEO meta completeness, schema presence, GA4/GTM tag presence, page speed signals, content completeness,
  and cross-page consistency. Always run ALL checks, never partial. Report pass/fail with exact URLs and
  exact problems. Fix every failure immediately after reporting it.
---

# CFW Beta Testing Skill

## What This Skill Covers

Every facet of website quality in 2026 — structure, content, SEO, performance, accessibility,
schema, analytics, links, CSS, redirects, and consistency across all 215+ pages.

---

## Stack Facts (never guess these)

- **Repo**: RoyWraps69/cfwforever (GitHub)
- **Deploy**: Netlify, publish dir = `public/`
- **Pages**: Static HTML only in `public/`. No build step for pages.
- **CSS**: `/css/site.v4.css` — single file, rewritten clean Apr 7 2026
- **Domain**: chicagofleetwraps.com
- **GA4**: G-54BP1GMYJ1
- **GTM**: GTM-TJVKD4QZ

---

## Test Suite — Run Every Check

### 1. STRUCTURE CHECK (every page)
For each page fetch live HTML and verify:
- `<section class="page-hero-banner">` exists
- `<img>` is direct child of banner with `fetchpriority="high"`
- `<div class="phb-content">` exists inside banner
- `<div class="w">` exists inside phb-content
- `<h1>` exists inside `.w` inside `.phb-content`
- `<div class="w page-body">` exists after the banner `</section>`
- `<main>` wraps both banner and page-body
- No content outside `.w` containers (no edge-to-edge text)

```python
STRUCTURE_CHECKS = [
    ('page-hero-banner',  'section.page-hero-banner present'),
    ('phb-content',       '.phb-content overlay present'),
    ('page-body',         '.w.page-body content container present'),
    ('<h1',               'H1 tag exists'),
    ('fetchpriority',     'Hero image has fetchpriority=high'),
    ('/css/site.v4.css',  'CSS linked'),
    ('G-54BP1GMYJ1',      'GA4 tag present'),
]
```

### 2. H1 QUALITY CHECK
- H1 must be inside `.phb-content` (on the hero image)
- H1 text must NOT be generic (not just "Vehicle Wraps Chicago")
- H1 must be consumer-facing, pain-point driven
- H1 must NOT be the same as the page `<title>`

### 3. CSS VALIDATION
Fetch `/css/site.v4.css` and verify these rules exist:
```
.phb-content h1 { color: var(--gold) !important }
.phb-content { z-index: 3 }
.page-hero-banner { min-height: 500px }
a { color: var(--gold) }
a:visited { color: var(--gold) }
.btn.bg { background: var(--gold) }
.w { max-width: 1140px }
```
Flag any rule that sets `color: #000` or `color: rgba(255,255,255` on a bare `a {}` selector.

### 4. REDIRECT CHECK
These slugs must redirect (HTTP 200 at target, not loop to homepage):
```
boxtruck      → box-truck-wraps-chicago
colorchange   → color-change-wraps
commercial    → commercial-vehicle-wraps-chicago
fleet         → fleet-wraps-chicago
hvac          → hvac-van-wraps-chicago
plumber       → plumbing-van-wraps-chicago
electric      → electrician-vehicle-wraps-chicago
contractor    → contractor-vehicle-wraps-chicago
delivery      → delivery-fleet-wraps-chicago
```
FAIL if redirect goes to `/` (homepage) instead of canonical URL.

### 5. 404 CHECK
These pages must return HTTP 200, not 404:
- All pages listed in `/tmp/april2_pages.txt` (223 pages)
- Spot check 20 random pages from the list

### 6. SEO META CHECK (every page)
- `<title>` present and unique
- `<meta name="description">` present, 120-160 chars
- `<link rel="canonical">` present and matches URL
- `<meta name="robots" content="index, follow">` present
- OG tags: `og:title`, `og:description`, `og:image`
- No duplicate `<title>` or `<meta name="description">` tags

### 7. SCHEMA CHECK
Service/industry pages must have at least one of:
- `LocalBusiness` schema
- `Service` schema
- `FAQPage` schema
Blog posts must have `Article` or `BlogPosting` schema.

### 8. ANALYTICS CHECK
Every page must have:
- `G-54BP1GMYJ1` (GA4)
- `GTM-TJVKD4QZ` (GTM) — acceptable if deferred

### 9. LINK INTEGRITY
- All `<a href>` internal links must return 200 (not 404)
- No `<a href="#">` placeholder links in body content
- No `href="javascript:void(0)"` in body
- Nav links must all resolve

### 10. IMAGE CHECK
- Hero images must exist at the `/images/` path referenced
- No `alt=""` on hero images
- No images wider than viewport with no `max-width`

### 11. CONTENT COMPLETENESS
Flag pages under 5,000 characters in `<main>` as THIN.
Flag pages where `.page-body` is empty or under 500 chars.

### 12. MOBILE SIGNALS
Check `<meta name="viewport">` is present.
Check no fixed widths above 100vw in inline styles.

### 13. PERFORMANCE SIGNALS
- `loading="eager" fetchpriority="high"` on hero image
- `loading="lazy"` on below-fold images
- No inline `<style>` blocks (stamp script strips them, verify)
- CSS file under 100k

### 14. CONSISTENCY CHECK
Run checks on sample of 10 pages:
- Same header/nav on all pages
- Same footer on all pages
- Same ticker on all pages
- No page missing header or footer

---

## Agent Specializations

When Roy asks to spin up specialized agents, assign tasks as follows:

| Agent | Responsibility |
|-------|---------------|
| **Structure Agent** | Checks 1, 2 — HTML structure and H1 quality across all pages |
| **CSS Agent** | Check 3 — CSS validation, conflict detection, rule completeness |
| **SEO Agent** | Checks 6, 7, 8 — Meta tags, schema, analytics |
| **Links Agent** | Checks 4, 5, 9 — Redirects, 404s, link integrity |
| **Content Agent** | Checks 11, 14 — Thin pages, consistency, content quality |
| **Performance Agent** | Checks 10, 12, 13 — Images, mobile, perf signals |

Each agent reports: PASS / FAIL / count of failures / exact URLs that failed.

---

## How to Run

```python
# Quick spot check (5 pages)
pages = ['sprinter','hvac-van-wraps-chicago','fleet-wraps-chicago','andersonville','post/3m-vs-avery-dennison-vehicle-wraps']

# Full audit (all pages)
pages = open('/tmp/april2_pages.txt').read().strip().split('\n')

for slug in pages:
    html = fetch(f'https://chicagofleetwraps.com/{slug}/')
    run_all_checks(html, slug)
```

Report format:
```
PAGE                    STRUCT  H1    SEO   LINKS  CONTENT  STATUS
sprinter                ✓       ✓     ✓     ✓      ✓        PASS
hvac-van-wraps-chicago  ✓       ✓     ✓     ✓      ✓        PASS
andersonville           ✗       ✓     ✗     ✓      ✓        FAIL (missing schema, no phb-content)
```

Fix every FAIL immediately after reporting. Never just report and stop.

---

## Fix Protocols

| Failure | Fix |
|---------|-----|
| Missing phb-content/H1 on hero | Rebuild page with correct template from `/tmp/stamp.json` parts |
| H1 white not gold | CSS already fixed — if still wrong, check for inline style override |
| Links go to homepage | Check for redirect stub — rebuild page with full HTML |
| 404 on service page | Page missing from `public/` — rebuild from April 2 git state |
| Thin content | Pull from `git show 0607c8f4:public/{slug}/index.html` and rebuild |
| Duplicate meta tags | Strip duplicates from `<head>` |
| Missing GA4 | Add to `<head>` via stamp parts |
| CSS conflict | Never patch CSS — rewrite the full rule block |

---

## Standards (2026)

- Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms
- All pages indexed (no accidental noindex)
- All canonical URLs match live URL exactly
- Zero 404s on any internal link
- Zero pages redirecting to homepage unintentionally
- All H1s unique, consumer-facing, on hero image, gold color
- Schema on every service/industry page
- GA4 on every page
- Mobile viewport meta on every page
