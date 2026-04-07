# CLAUDE.md — Chicago Fleet Wraps
# chicagofleetwraps.com

This file gives Claude Code full context on this project.
Read it completely before touching anything.

---

## WHO YOU ARE WORKING FOR

**Roy** — founder, 24+ year wrap industry veteran.
- Communicates directly. No fluff. No explanations unless asked.
- Wants the best fix, not the fastest fix.
- Every fix must be verified live before reporting done.
- Never push blind. Always check the result.
- Fix it right the first time or don't touch it.

---

## THE SITE

**URL**: https://chicagofleetwraps.com  
**Repo**: RoyWraps69/cfwforever  
**Token**: ghp_YOUR_GITHUB_TOKEN  
**Deploy**: Netlify  
**Site ID**: YOUR_NETLIFY_SITE_ID  
**Netlify Token**: nfp_YOUR_NETLIFY_TOKEN  
**Build Hook**: https://api.netlify.com/build_hooks/YOUR_BUILD_HOOK_ID  
**Shop address**: 4711 N Lamon Ave #7, Chicago IL 60630  
**Phone**: (312) 597-1286  
**Email**: roy@chicagofleetwraps.com  

---

## STACK — READ THIS BEFORE TOUCHING ANYTHING

```
public/          ← Netlify serves this directory as static files
  css/
    site.v4.css  ← SINGLE CSS FILE. Rewritten clean Apr 7 2026. 30k.
  images/        ← All site images
  fonts/         ← Bebas Neue, Barlow Condensed, Barlow woff2
  js/            ← Minimal JS (sticky-cta.js, chat-widget.js)
  [slug]/
    index.html   ← Every page is a complete standalone HTML file
scripts/
  stamp-header-footer.mjs  ← Injects header/footer into pages
  generate-static-pages.mjs ← BROKEN. DO NOT USE.
netlify.toml     ← Build config
```

**Netlify publish dir**: `public/`  
**Build command**: exists but DO NOT rely on it for page generation  
**Node version**: 22+  

---

## ARCHITECTURE — THE ONE RULE THAT MATTERS

> **Every page is a complete, standalone HTML file in `public/`.**
> Netlify serves static files. That's it. No SSG. No build-time generation.
> Push HTML → Netlify serves it → done.

### What this means in practice:
- Adding a page = write a complete HTML file, push to `public/{slug}/index.html`
- Changing content = edit the HTML file directly, push
- Changing global elements (nav, footer) = edit all pages OR edit stamp script and run it
- **Never** rely on Netlify's build step to generate page content
- **Never** use `generate-static-pages.mjs` — it is broken and has a PRESERVE bug
- **Never** push redirect stubs expecting the build to replace them

---

## PAGE TEMPLATE — THE ONE CORRECT STRUCTURE

Every inner page must follow this exact structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>{H1} | Chicago Fleet Wraps</title>
  <meta name="description" content="{DESC}"/>
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"/>
  <link rel="canonical" href="https://chicagofleetwraps.com/{SLUG}/"/>
  <link rel="stylesheet" href="/css/site.v4.css"/>
  <link rel="icon" type="image/png" href="/favicon.png"/>
  <link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/bebas-neue.woff2"/>
  <link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/barlow-condensed-700.woff2"/>
  <link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/barlow-700.woff2"/>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-YOUR_GA4_ID"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-YOUR_GA4_ID');</script>
  <!-- schema JSON-LD here -->
</head>
<body>
  <!-- scroll to top -->
  <script>history.scrollRestoration='manual';window.scrollTo(0,0);</script>

  <!-- ticker -->
  <div class="trib" ...>...</div>

  <!-- header -->
  <header role="banner">...</header>

  <!-- mobile nav -->
  <div class="mnav" id="mnav">...</div>

  <main>
    <!-- HERO — image fills section, H1 overlaid in gold -->
    <section class="page-hero-banner">
      <img src="/images/{HERO}" alt="{H1} — Chicago Fleet Wraps"
           loading="eager" fetchpriority="high"/>
      <div class="phb-content">
        <div class="w">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="/">Home</a> › {BREADCRUMB}
          </nav>
          <h1>{H1}</h1>
        </div>
      </div>
    </section>

    <!-- BODY — all content centered, never full-width -->
    <div class="w page-body">
      {CONTENT}
    </div>
  </main>

  <!-- footer -->
  <footer role="contentinfo">...</footer>
</body>
</html>
```

### Critical rules about this template:
- **Exactly ONE `<h1>` per page** — inside `.phb-content` only
- **H1 must be on the hero image** — inside `.phb-content > .w`
- **All body content inside `.w`** — never edge to edge
- **`<section class="page-hero-banner">`** not `<div>`
- **`<img>` is direct child of `.page-hero-banner`** — no wrapper div around it
- **`.phb-content` has `z-index: 3`** in CSS — sits above image

---

## CSS — SITE.V4.CSS

**Location**: `public/css/site.v4.css`  
**Size**: ~30k (rewritten clean Apr 7 2026)  
**Rule**: Single source of truth. Never append garbage. If conflicted, rewrite the full file.

### Key rules (verify these exist, never remove them):
```css
/* H1 on hero — gold, large */
.phb-content h1 {
  color: var(--gold) !important;
  font-size: clamp(2.2rem, 5vw, 4rem) !important;
  font-weight: 900 !important;
}

/* Hero banner */
.page-hero-banner { position: relative; min-height: 500px; }
.page-hero-banner > img { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; }
.phb-content { position: relative; z-index: 3; }

/* Links — gold everywhere */
a { color: var(--gold); text-decoration: none; }
a:visited { color: var(--gold); }

/* Container */
.w { max-width: 1140px; margin: 0 auto; padding: 0 24px; }

/* Homepage hero H1 */
.hero-h2 { color: var(--gold) !important; font-size: clamp(2.4rem, 6vw, 4.8rem) !important; }
```

### CSS rules that BREAK the site (never add these):
- `.page-hero-banner::after { z-index: 2 }` — covers H1
- `a { color: #000 }` — makes links invisible on dark bg
- `a { color: blue }` — browser default on dark bg
- Any `overflow: hidden` with no `min-height` on `.page-hero-banner`
- Multiple conflicting `.page-hero-banner` rules — causes collapse

### CSS variables:
```css
--gold:   #FFD700
--black:  #0A0A0A
--dark:   #111111
--H:      'Bebas Neue', 'Barlow Condensed', sans-serif
--D:      'Barlow Condensed', 'Bebas Neue', sans-serif
--B:      'Barlow', system-ui, sans-serif
```

---

## BRAND

- **Primary color**: Gold `#FFD700`
- **Background**: Black `#0A0A0A`
- **Dark panels**: `#111111`
- **All links**: Gold
- **All H1s**: Gold, large, Bebas Neue, on hero image
- **Body text**: `rgba(255,255,255,.78)`
- **Muted text**: `rgba(255,255,255,.6)`
- **Tone**: Direct. Field manual. 20-year veteran voice. Short sentences. No fluff.
- **Never**: purple links, blue links, black links, white H1 (unless homepage hero-h2 span)

---

## ANALYTICS & TRACKING

Every page must have:
- **GA4**: `G-YOUR_GA4_ID` — Google Analytics 4
- **GTM**: `GTM-YOUR_GTM_ID` — Google Tag Manager (deferred load acceptable)
- **Facebook Pixel**: `YOUR_FB_PIXEL_ID` (deferred)
- **Microsoft Clarity**: `YOUR_CLARITY_ID` (deferred)

---

## SECRETS

Actual tokens/keys are stored in:
- Roy's password manager
- Claude.ai memory (ask "what are my CFW credentials")
- NOT committed to this file for security

---

## GITHUB — HOW TO PUSH

Always use Git Tree API for multi-file commits. Never use Contents API PUT for more than one file.

```python
# Pattern: get ref → get commit → get tree → create blobs → 
#          create tree → create commit → PATCH ref

def push_files(files_dict, message):
    # files_dict = { 'public/slug/index.html': html_content, ... }
    ref    = get_ref()           # current HEAD sha
    tree   = get_tree_sha(ref)   # current tree sha
    blobs  = [(path, create_blob(content)) for path, content in files_dict.items()]
    ntree  = create_tree(tree, blobs)
    commit = create_commit(ntree, ref, message)
    patch_ref(commit)
```

Push in batches of 60 files max per commit.
After pushing, verify live at `https://chicagofleetwraps.com/{slug}/` before reporting done.

---

## PAGES — CURRENT STATE

- **215 pages** live as static HTML in `public/`
- **Content source of truth**: git commit `0607c8f4` (April 2 2026 restore)
- **To recover lost content**: `git show 0607c8f4:public/{slug}/index.html`
- **Known redirects** (these are stubs, not full pages — correct behavior):
  - `/boxtruck/` → `/box-truck-wraps-chicago/`
  - `/colorchange/` → `/color-change-wraps/`
  - `/commercial/` → `/commercial-vehicle-wraps-chicago/`
  - `/fleet/` → `/fleet-wraps-chicago/`
  - `/hvac/` → `/hvac-van-wraps-chicago/`
  - `/plumber/` → `/plumbing-van-wraps-chicago/`
  - `/electric/` → `/electrician-vehicle-wraps-chicago/`
  - `/contractor/` → `/contractor-vehicle-wraps-chicago/`
  - `/delivery/` → `/delivery-fleet-wraps-chicago/`
  - `/transit/` → `/ford-transit-wrap-chicago/`
  - `/removal/` → `/wrap-removal/`

---

## STAMP SCRIPT

`scripts/stamp-header-footer.mjs` — run this to inject header/footer/ticker into all pages.

Contains: TICKER, HEADER, FOOTER, MOBILE_NAV, SCROLL_TOP, SHARED_CSS as template literals.
Run: `node scripts/stamp-header-footer.mjs` from repo root.
Safe to run — it only modifies HTML files in `public/`, skips SKIP_SLUGS set.

---

## NETLIFY

- Build command: `node scripts/generate-static-pages.mjs && node scripts/stamp-header-footer.mjs`
- **The generate script is broken** — do not rely on it
- Netlify build runs but only the stamp script matters
- To force a deploy without a code change: POST to build hook
- Clear cache when deploying CSS changes: `{"clear_cache": true}` in build POST body

```bash
# Trigger deploy
curl -X POST https://api.netlify.com/build_hooks/YOUR_BUILD_HOOK_ID
```

---

## PRICING

| Vehicle | Single | Fleet (15%) |
|---------|--------|-------------|
| Cargo van | $3,750 | $3,187 |
| Sprinter van | $4,700 | $3,995 |
| Box truck 14ft | $5,000 | $4,250 |
| Box truck 16ft | $6,500 | $5,525 |
| Box truck 20ft | $7,800 | $6,630 |
| Box truck 24ft | $9,200 | $7,820 |
| Box truck 26ft | $10,900 | $9,265 |

Fleet discounts: 3% (3-4 units), 7% (5-9), 11% (10-14), 15% (25+)

---

## WHAT NEVER TO DO

1. **Never push redirect stubs** expecting the build to replace them — it doesn't
2. **Never use `generate-static-pages.mjs`** — broken, has PRESERVE bug, skips existing pages
3. **Never append CSS** without reading the full file first — causes rule conflicts
4. **Never add `::after` with z-index on `.page-hero-banner`** — covers H1
5. **Never set `a { color: #000 }`** — invisible on dark background
6. **Never put two H1 tags on one page** — duplicate H1 = SEO failure
7. **Never put H1 above or outside the hero image** — H1 must be overlaid on image
8. **Never put content outside a `.w` container** — causes full-width text
9. **Never patch CSS with `!important` overrides** — fix the rule properly
10. **Never report a fix as done without verifying live** — always fetch the URL and check

---

## WHAT ALWAYS TO DO

1. Read the file completely before editing
2. Verify live after every push: `fetch('https://chicagofleetwraps.com/{slug}/')`
3. Check H1 is inside `.phb-content` on every page you touch
4. Check CSS file size stays under 50k
5. Run checks on a sample of 5+ pages after any global change
6. Fix the root cause, not the symptom
7. Push via Git Tree API for multi-file commits
8. Use the April 2 git state (`0607c8f4`) to recover any lost content
9. Keep stamp parts (header/footer/ticker) in sync across all pages

---

## QA CHECKLIST (run before reporting done)

```python
# Minimum checks after any change:
checks = [
    'page-hero-banner',   # hero section exists
    'phb-content',        # overlay div exists
    'page-body',          # content container exists
    'phb-content h1',     # H1 inside overlay (check CSS)
    'G-YOUR_GA4_ID',       # GA4 present
    'site.v4.css',        # CSS linked
]
# H1 count must be exactly 1
# Page size must be > 10,000 chars (not a stub)
# No redirect to homepage
```

---

## SKILLS AVAILABLE

Skills are in `/mnt/skills/` (Claude.ai) and `skills/` (this repo):

- `cfw-beta-testing` — 18-point full QA suite, run with "run beta test"
- `wrap-design-pillars` — 10 pillars of vehicle wrap design
- `docx`, `pdf`, `pptx`, `xlsx` — document generation
- `frontend-design` — production-grade UI components
- `skill-creator` — create and iterate on new skills

---

## SUPABASE (GBP Control Panel)

- **Project**: CFW-GBP
- **URL**: https://YOUR_SUPABASE_PROJECT.supabase.co
- **Publishable key**: YOUR_SUPABASE_KEY
- **Region**: AWS us-east-2

---

## GOOGLE OAUTH (GBP API)

- **Client ID**: YOUR_GOOGLE_CLIENT_ID
- **Client Secret**: YOUR_GOOGLE_CLIENT_SECRET
- **Refresh Token**: YOUR_GOOGLE_REFRESH_TOKEN

---

## ACTIVE BUSINESS CONTEXT

- **Fleet push**: HVAC fleet sales to top 10 underbranded HVAC companies in Chicagoland
- **Precision Today**: active client, 130+ vehicle fleet
- **Rivian**: Illinois #1 installer, 600+ wrapped
- **Legal**: Cook County Case No. 2026L003113 (bar equipment dispute, attorney hired)

---

*Last updated: April 7, 2026*
*CSS rewritten: April 7, 2026*
*Content restored: April 7, 2026 (from commit 0607c8f4)*

---

## FRONTEND DESIGN SKILL — MASTER RULES

### Design Thinking (Do This First)

Before writing a single line of code, lock in:
- **Purpose** — What problem does it solve? Who's using it?
- **Tone** — Pick one extreme and own it: brutally minimal, maximalist chaos, retro-futuristic, luxury/refined, brutalist/raw, editorial/magazine, art deco, industrial. No middle ground.
- **Differentiation** — What's the one thing a visitor remembers 10 minutes later?
- **Constraints** — Framework, performance needs, accessibility requirements.

Commit to the direction. Execute with precision.

### Typography

- Pick fonts that are unexpected and characterful — not Inter, Roboto, Arial, or any system font.
- Pair a bold display font with a refined body font.
- Typography should carry personality on its own, before color or layout does anything.

### Color & Theme

- Use CSS variables for every color — no inline hex values scattered through the code.
- One or two dominant colors + one sharp accent. No timid, evenly-distributed palettes.
- Commit fully. Don't hedge between light and dark — pick one.

### Motion & Animation

- CSS-only for HTML artifacts. Motion library for React.
- One well-orchestrated page load with staggered reveals (`animation-delay`) beats 20 scattered micro-interactions.
- Scroll-trigger effects and hover states that surprise.

### Spatial Composition

- Asymmetry. Overlap. Diagonal flow. Grid-breaking elements.
- Either generous negative space OR controlled density — not the blah middle.
- No predictable 3-column-card layouts unless the concept demands it.

### Backgrounds & Atmosphere

- Never default to a solid color background.
- Use: gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, grain overlays, decorative borders, custom cursors.
- The background should feel intentional, not like a placeholder.

### What to Never Do

- Purple gradients on white backgrounds
- Space Grotesk (or any overused font of the moment)
- Cookie-cutter card layouts
- Generic AI aesthetic — if it looks like every other AI-generated site, redo it
- Same aesthetic twice — every build should be distinct

### Code Quality

- Production-grade and functional — not demo fluff
- Visually striking AND technically solid
- Every detail refined — spacing, kerning, border-radius, shadow depth, transition timing

### Complexity Matching

- Maximalist vision = elaborate code, extensive animations, layered effects
- Minimalist vision = restraint, precision spacing, subtle micro-details
- Execution quality determines whether either works

---

## CFW TONE DIRECTION — INDUSTRIAL / HIGH-IMPACT / FIELD-MANUAL

Not soft. Not corporate. Not SaaS-startup. This is a shop floor brand — heat, vinyl, precision, speed. The site should feel like it was built by people who wrap 9,400 vehicles, not people who talk about wrapping them.

### Typography (CFW-specific)

- **Display**: Something wide, compressed, or slab — Bebas Neue, Dharma Gothic, Aktiv Grotesk Condensed, or similar. Headers hit hard.
- **Body**: Barlow Condensed, DM Sans, or a tight grotesque — readable at speed.
- **Never**: Inter, Roboto, Arial, Montserrat (overused in this exact industry).

### Color (CFW-specific)

- **Primary**: `#FFD700` (CFW Yellow) — dominant, aggressive accent
- **Base**: `#0A0A0A` (near-black) — dark-mode-first
- **Supporting**: mid-grey `#2A2A2A` for card surfaces, `#555` for secondary text
- No white backgrounds. No pastel anything.
- Yellow hits like caution tape on black — own it.

### Layout & Composition (CFW-specific)

- Grid-breaking hero — vehicle imagery bleeds edge-to-edge, no padding cages
- Asymmetric sections — text left-offset, image overhangs, diagonal dividers between sections
- Overlap elements — stat blocks over vehicle photos, badge/cert marks layered on imagery
- Dense data blocks — fleet counts, certifications, vehicle categories in tight grid formats (not bullet lists)
- No 3-column card grids unless it's a vehicle category browser

### Motion & Animation (CFW-specific)

- Hero text: staggered reveal on load — each line drops in with `animation-delay`
- Vehicle imagery: subtle parallax or Ken Burns on scroll
- CTA buttons: yellow fill sweeps left-to-right on hover
- Section transitions: fast fade-up (200–300ms), not slow floats
- No autoplay video unless muted and purposeful

### Backgrounds & Atmosphere (CFW-specific)

- Dark base (`#0A0A0A`) with subtle carbon fiber texture or dot-grid overlay
- Section breaks using diagonal clips (`clip-path: polygon`) — no flat horizontal lines
- Yellow rule lines (1–2px) as structural dividers
- Grain overlay at 3–5% opacity on hero for tactile depth

### What to Never Do (CFW-specific)

- Stock photo people pointing at vehicles in suits
- Blue/white "corporate fleet" aesthetics
- Rounded-corner card grids that look like a SaaS dashboard
- Purple gradients, glass morphism, soft shadows
- Anything that looks like a competitor's site

### Key Sections Architecture

1. **Hero** — Full-bleed wrapped vehicle, headline, fleet count stat, single CTA
2. **Trust Bar** — HP Latex / Avery / 3M certs + "9,400+ vehicles / 2,800+ accounts"
3. **Services** — Asymmetric grid: full wraps, partial wraps, fleet programs, EV wraps
4. **Fleet Gallery** — Edge-to-edge masonry or horizontal scroll, vehicle type filters
5. **Why CFW** — Stat-heavy, no fluff — years, certs, turnaround, coverage area
6. **Industries** — HVAC, logistics, telecom, delivery, municipalities — icon + count format
7. **Quote CTA** — Full-width yellow section, black text, single form or mailto trigger
8. **Footer** — Dark, tight, address + nav + cert badges

---

## 10 PILLARS OF WEBSITE DESIGN (Apply to Every Page)

### 1. INSTANT CLARITY
Visitor knows what you do in 3 seconds or they're gone.
- Hero headline = what you do + who you serve + where
- No clever taglines. No mystery. "Chicago's #1 Commercial Fleet Wrap Installer" beats "Transforming Brands on the Move."
- Sub-headline handles the proof: "9,400+ vehicles wrapped. 2,800+ active fleet accounts."

### 2. VISUAL PROOF FIRST
Show the work before you say a word about it.
- Full-bleed vehicle imagery above the fold — no stock, no illustrations
- Real wrapped fleets. Real clients. Real logos on real vans.
- Humans trust what they can see. Proof beats copy every time.

### 3. TRUST ARCHITECTURE
Stack credibility signals early and often.
- Certifications (HP Latex, Avery, 3M) visible in the first scroll
- Years in business, vehicle count, client count — hard numbers, not ranges
- Named clients where possible. Logos beat testimonials.
- Review count + rating above the fold or immediately below hero

### 4. ONE DOMINANT CTA
One ask per page. Not three. One.
- "Get a Fleet Quote" — that's the action
- Yellow button. Black text. Every section has a path back to it.
- Don't split attention between "Contact Us," "Learn More," "See Gallery," and "Get a Quote" — pick the money action and repeat it

### 5. SPEED & MOBILE PERFORMANCE
A slow site is a closed door.
- Sub-2 second load on mobile — non-negotiable
- Fleet buyers research on phones in parking lots and job sites
- Compressed images, no render-blocking scripts, lazy load below fold
- Core Web Vitals green across the board

### 6. NAVIGATION THAT SERVES THE BUYER JOURNEY
Menu = the buyer's decision map.
- Structure nav around how buyers think, not how you're organized internally
- Fleet buyer nav: Services → Industries → Gallery → Pricing → Get a Quote
- No more than 5 top-level items. No mega-menus for a service business.
- Sticky nav so the CTA is always reachable

### 7. CONTENT THAT ANSWERS BEFORE THEY ASK
Kill objections on the page before sales has to.
- How long does a wrap take? Answer it.
- What's the cost per vehicle? Give ranges.
- Do you handle fleet accounts over 50 units? Say yes explicitly.
- FAQ schema + real answers = trust + SEO + reduced sales friction simultaneously

### 8. EMOTIONAL MOMENTUM
Logic makes them consider. Emotion makes them call.
- Show the before/after transformation
- Lead with outcomes: "Your drivers become moving billboards. Every mile, every stoplight, every job site."
- Tie fleet wraps to revenue and brand presence — not just aesthetics
- Testimonials from decision-makers (fleet managers, ops directors), not generic praise

### 9. FRICTIONLESS CONVERSION PATH
Every extra click kills a conversion.
- Quote form: Company name, fleet size, vehicle type, email. Four fields. Done.
- No phone-only CTAs for a commercial buyer who's comparing 3 vendors at 11pm
- Instant confirmation after form submit — "We'll have a proposal to you within 24 hours"
- Calendar booking option for bigger fleet accounts

### 10. AUTHORITY SIGNALS THROUGHOUT
Be the obvious expert, not just another option.
- Original content: cost guides, fleet wrap ROI calculators, industry-specific pages
- Case studies by vertical: HVAC fleets, logistics fleets, municipal fleets
- The `/fleet-wrap-cost-report-2026/` page — that's pillar 10 in action
- Schema markup so Google and AI engines cite you as the source

---

*Design rules last updated: April 7, 2026*
