#!/usr/bin/env node
/**
 * stamp-header-footer.mjs
 * Injects shared ticker, header, mobile nav, and footer into every page.
 *
 * RULES:
 *   - Strips NOTHING from <head> (no style removal, no link removal)
 *   - Strips NOTHING from <main> or body content
 *   - Only removes old <header>, <div class="trib">, <div id="mnav">, <footer> blocks
 *   - Skips SKIP_SLUGS and redirect stubs under 500 chars
 */

import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');

const SKIP_SLUGS = new Set([
  'googleac4190c5fb66b0fb',
  'catalog',
  'admin',
  'test-hero',
]);

const TICKER = `<div aria-label="Trust indicators" class="trib" role="region">
<div class="trib-inner">
<span>✓ <strong>24+ Years</strong> Commercial Experience</span>
<span>✓ <strong>9,400+</strong> Vehicles Wrapped</span>
<span>🚐 Free Fleet Pickup — All of Chicagoland</span>
<span>⚡ 2-Hour Estimate Response</span>
<span>📞 (312) 597-1286 — Mon–Fri 8AM–5PM</span>
<span>💰 IRS Section 179 — 100% Deductible</span>
<span>🏆 6th Wrap Free — Fleet Loyalty Program</span>
<span>✓ <strong>24+ Years</strong> Commercial Experience</span>
<span>✓ <strong>9,400+</strong> Vehicles Wrapped</span>
<span>🚐 Free Fleet Pickup — All of Chicagoland</span>
<span>⚡ 2-Hour Estimate Response</span>
<span>📞 (312) 597-1286 — Mon–Fri 8AM–5PM</span>
<span>💰 IRS Section 179 — 100% Deductible</span>
<span>🏆 6th Wrap Free — Fleet Loyalty Program</span>
</div>
</div>`;

const HEADER = `<header role="banner">
<div class="hbar">
<a aria-label="Chicago Fleet Wraps - Home" class="logo" href="/"><img alt="Chicago Fleet Wraps" height="38" src="/images/logo-horizontal.webp" style="height:38px;width:auto" width="180"/></a>
<nav aria-label="Main navigation" role="navigation">
<div class="ni"><button aria-haspopup="true">Services <svg height="6" viewBox="0 0 10 6" width="10"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"/></svg></button>
<div class="drop">
<a href="/commercial-vehicle-wraps-chicago/">Commercial Fleets</a>
<a href="/boxtruck/">Box Trucks</a>
<a href="/sprinter/">Sprinter Vans</a>
<a href="/commercial/">Transit Vans</a>
<a href="/colorchange/">Color Change Wraps</a>
<a href="/ev-wraps/">⚡ Electric Vehicle Wraps</a>
<a href="/wall-wraps/">Wall Graphics</a>
<a href="/wrap-removal/">Wrap Removal</a>
</div></div>
<div class="ni"><button aria-haspopup="true">Industries <svg height="6" viewBox="0 0 10 6" width="10"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"/></svg></button>
<div class="drop">
<a href="/hvac-van-wraps-chicago/">❄ HVAC</a>
<a href="/plumbing-van-wraps-chicago/">🚰 Plumbing</a>
<a href="/electrician-vehicle-wraps-chicago/">⚡ Electrical</a>
<a href="/contractor-vehicle-wraps-chicago/">🔨 Contractors</a>
<a href="/delivery-fleet-wraps-chicago/">📦 Delivery</a>
<a href="/food-truck-wraps-chicago/">🍔 Food Trucks</a>
<a href="/landscaping-truck-wraps-chicago/">🌿 Landscaping</a>
<a href="/boat-wraps-chicago/">⛵ Boating</a>
<a href="/moving-truck-wraps-chicago/">🚚 Moving</a>
</div></div>
<div class="ni"><button aria-haspopup="true">Resources <svg height="6" viewBox="0 0 10 6" width="10"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"/></svg></button>
<div class="drop">
<a href="/wrap-calculator">Wrap Price Calculator</a>
<a href="/roi/">ROI Calculator Guide</a>
<a href="/stats/">Wrap Industry Stats</a>
<a href="/vsads/">Wraps vs. Ads</a>
<a href="/blog/">Blog</a>
<a href="/faq/">FAQ</a>
<a href="/warranty/">Warranty</a>
</div></div>
<div class="ni"><button aria-haspopup="true">Cities <svg height="6" viewBox="0 0 10 6" width="10"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"/></svg></button>
<div class="drop">
<a href="/chicago/">Chicago</a>
<a href="/schaumburg/">Schaumburg</a>
<a href="/naperville/">Naperville</a>
<a href="/aurora/">Aurora</a>
<a href="/elgin/">Elgin</a>
<a href="/joliet/">Joliet</a>
<a href="/evanston/">Evanston</a>
<a href="/skokie/">Skokie</a>
<a href="/oak-park/">Oak Park</a>
<a href="/servicearea/">📍 All 75 Cities</a>
</div></div>
<div class="ni"><button aria-haspopup="true">Company <svg height="6" viewBox="0 0 10 6" width="10"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"/></svg></button>
<div class="drop">
<a href="/about/">About the Team</a>
<a href="/portfolio/">Portfolio</a>
<a href="/contact/">Contact</a>
<a href="/refund-policy/">Refund Policy</a>
</div></div>
<a class="ni-rtb-btn" href="/rent-the-bay/" style="background:var(--gold);color:#0A0A0A;font-family:var(--H);font-size:.88rem;font-weight:900;letter-spacing:.08em;padding:8px 16px;border-radius:6px;text-decoration:none;white-space:nowrap;display:flex;align-items:center;gap:6px;margin-left:4px">🔧 RENT THE BAY</a>
</nav>
<div class="hright">
<a class="gmb-header" href="https://g.page/r/CYlPAF8xkJCsEAE/review" rel="noopener" target="_blank">
<span class="gs">★★★★★</span>
<div><span>4.9 / 5.0</span><small>42 reviews</small></div>
</a>
<a class="hphone" href="tel:+13125971286">📞 (312) 597-1286</a>
<a class="btn bg pulse" href="/portfolio/">Portfolio</a>
<a class="btn bo" href="/estimate/" style="border-color:var(--gold);color:var(--gold)">Get Estimate</a>
<button aria-controls="mnav" aria-expanded="false" aria-label="Open menu" class="hambtn" onclick="var m=document.getElementById('mnav');m.classList.toggle('open');this.setAttribute('aria-expanded',m.classList.contains('open'))">☰</button>
</div>
</div>
</header>`;

const MOBILE_NAV = `<div class="mnav" id="mnav">
<span class="mg">Services</span>
<a href="/commercial-vehicle-wraps-chicago/">Commercial Fleets</a>
<a href="/boxtruck/">Box Trucks</a>
<a href="/sprinter/">Sprinter Vans</a>
<a href="/colorchange/">Color Change</a>
<a href="/ev-wraps/">⚡ EV Wraps</a>
<a href="/wall-wraps/">Wall Graphics</a>
<a href="/wrap-removal/">Wrap Removal</a>
<span class="mg">Industries</span>
<a href="/hvac-van-wraps-chicago/">HVAC</a>
<a href="/plumbing-van-wraps-chicago/">Plumbing</a>
<a href="/electrician-vehicle-wraps-chicago/">Electrical</a>
<a href="/contractor-vehicle-wraps-chicago/">Contractors</a>
<a href="/delivery-fleet-wraps-chicago/">Delivery</a>
<a href="/food-truck-wraps-chicago/">Food Trucks</a>
<a href="/landscaping-truck-wraps-chicago/">Landscaping</a>
<a href="/boat-wraps-chicago/">Boating</a>
<a href="/moving-truck-wraps-chicago/">Moving Companies</a>
<span class="mg">Cities</span>
<a href="/chicago/">Chicago</a>
<a href="/schaumburg/">Schaumburg</a>
<a href="/naperville/">Naperville</a>
<a href="/servicearea/">All 75 Cities</a>
<span class="mg">More</span>
<a href="/portfolio/">Portfolio</a>
<a href="/blog/">Blog</a>
<a href="/about/">About</a>
<a href="/faq/">FAQ</a>
<a href="/rent-the-bay/" style="color:var(--gold);font-weight:700">🔧 Rent the Bay</a>
<a href="/estimate/">Get Estimate</a>
<a href="/contact/">Contact</a>
</div>`;

const FOOTER = `<footer role="contentinfo">
<div class="fg">
<div class="fb">
<a class="logo" href="/"><img alt="Chicago Fleet Wraps" height="32" src="/images/logo-horizontal.webp" style="height:32px;width:auto" width="160"/></a>
<p style="margin-top:12px">Chicago's highest-rated commercial fleet wrap company. 24+ years, 9,400+ vehicles wrapped.</p>
<p style="margin-top:8px"><a href="tel:+13125971286" style="color:var(--gold);font-family:var(--H);font-weight:800;font-size:.95rem;letter-spacing:.08em">(312) 597-1286</a></p>
<p style="margin-top:4px"><a href="mailto:roy@chicagofleetwraps.com">roy@chicagofleetwraps.com</a></p>
</div>
<div class="fb">
<h4>Services</h4>
<a href="/commercial-vehicle-wraps-chicago/">Vehicle Wraps Chicago</a>
<a href="/boxtruck/">Box Truck Wraps</a>
<a href="/sprinter/">Sprinter Van Wraps</a>
<a href="/colorchange/">Color Change</a>
<a href="/ev-wraps/">EV Wraps</a>
<a href="/wrap-removal/">Wrap Removal</a>
</div>
<div class="fb">
<h4>Industries</h4>
<a href="/hvac-van-wraps-chicago/">HVAC Wraps</a>
<a href="/plumbing-van-wraps-chicago/">Plumbing Wraps</a>
<a href="/electrician-vehicle-wraps-chicago/">Electrician Wraps</a>
<a href="/contractor-vehicle-wraps-chicago/">Contractor Wraps</a>
<a href="/delivery-fleet-wraps-chicago/">Delivery Wraps</a>
<a href="/food-truck-wraps-chicago/">Food Truck Wraps</a>
<a href="/landscaping-truck-wraps-chicago/">Landscaping Wraps</a>
<a href="/boat-wraps-chicago/">Boat Wraps</a>
</div>
<div class="fb">
<h4>Company</h4>
<a href="/about/">About the Team</a>
<a href="/portfolio/">Portfolio</a>
<a href="/faq/">FAQ</a>
<a href="/blog/">Blog</a>
<a href="/contact/">Contact</a>
<a href="/estimate/">Get Estimate</a>
<a href="/rent-the-bay/" style="color:var(--gold)">🔧 Rent the Bay</a>
<a href="/warranty/">Warranty</a>
</div>
<div class="fb">
<h4>Service Area</h4>
<a href="/chicago/">Chicago</a>
<a href="/schaumburg/">Schaumburg</a>
<a href="/naperville/">Naperville</a>
<a href="/aurora/">Aurora</a>
<a href="/elgin/">Elgin</a>
<a href="/joliet/">Joliet</a>
<a href="/servicearea/">All 75 Cities →</a>
</div>
</div>
<div class="fbot">
<span>© 2025 Chicago Fleet Wraps LLC · 4711 N Lamon Ave #7, Chicago, IL 60630 · Licensed &amp; Insured</span>
<div class="fsm">
<a href="https://www.facebook.com/chicagofleetwraps" rel="noopener" target="_blank">Facebook</a>
<a href="https://www.instagram.com/chicago_fleet_wraps" rel="noopener" target="_blank">Instagram</a>
<a href="https://www.linkedin.com/company/chicago-fleet-wraps" rel="noopener" target="_blank">LinkedIn</a>
<a href="https://www.youtube.com/@chicagofleetwraps" rel="noopener" target="_blank">YouTube</a>
</div>
</div>
</footer>`;

const SCROLL_TOP = `<script>if(history.scrollRestoration)history.scrollRestoration='manual';window.addEventListener('load',function(){window.scrollTo(0,0)});</script>`;

const htmlFiles = globSync('**/*.html', { cwd: PUBLIC_DIR });
let updated = 0, skipped = 0;

for (const file of htmlFiles) {
  const slug = file.replace(/\/index\.html$/, '').replace(/\.html$/, '');

  if (SKIP_SLUGS.has(slug)) { skipped++; continue; }

  const fp = path.join(PUBLIC_DIR, file);
  let html = fs.readFileSync(fp, 'utf-8');

  // Skip redirect stubs (too short to be real pages)
  if (html.length < 500) { skipped++; continue; }

  let mod = html;

  // ── STEP 1: Remove old ticker (trib block) ─────────────────────────────
  // Only remove the trib div — nothing else
  mod = mod.replace(/<div[^>]*class="trib"[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi, '');

  // ── STEP 2: Remove old header block ────────────────────────────────────
  mod = mod.replace(/<header[\s\S]*?<\/header>/gi, '');

  // ── STEP 3: Remove old mobile nav block ────────────────────────────────
  mod = mod.replace(/<div[^>]*(?:class="mnav"|id="mnav")[^>]*>[\s\S]*?<\/div>/gi, '');

  // ── STEP 4: Remove old footer ──────────────────────────────────────────
  mod = mod.replace(/<footer[\s\S]*?<\/footer>/gi, '');

  // ── STEP 5: Ensure CSS link in <head> (only if missing) ────────────────
  if (!mod.includes('site.v4.css')) {
    mod = mod.replace('</head>', '<link rel="stylesheet" href="/css/site.v4.css"/>
</head>');
  }
  // Upgrade old CSS versions
  mod = mod.replace(/site\.v[123]\.css/g, 'site.v4.css');

  // ── STEP 6: Inject scroll-to-top (only if missing) ─────────────────────
  if (!mod.includes('scrollTo(0,0)') && !mod.includes('scrollRestoration')) {
    mod = mod.replace(/<body([^>]*)>/i, (m) => m + '
' + SCROLL_TOP);
  }

  // ── STEP 7: Inject ticker + header + mobile nav after <body> ───────────
  if (!mod.includes('class="trib"')) {
    mod = mod.replace(/<body([^>]*)>([\s\S]{0,200})/i, (m, attrs, after) => {
      // Insert after body tag (and after any existing scroll-to-top)
      return `<body${attrs}>${after}
${TICKER}
${HEADER}
${MOBILE_NAV}`;
    });
  }

  // ── STEP 8: Inject footer before </body> ───────────────────────────────
  if (!mod.includes('class="fg"')) {
    mod = mod.replace('</body>', FOOTER + '
</body>');
  }

  if (mod !== html) {
    fs.writeFileSync(fp, mod, 'utf-8');
    updated++;
  }
}

console.log(`
✅ stamp complete: ${updated} updated, ${skipped} skipped`);
