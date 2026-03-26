#!/usr/bin/env node
/**
 * stamp-header-footer.mjs
 * 
 * Post-build script: injects the canonical shared header, ticker bar, mobile nav,
 * and footer into every hand-crafted HTML page in public/.
 * 
 * Run after generate-static-pages.mjs so all 165+ pages share the same nav/footer.
 */

import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');

// ─── SHARED TICKER BAR ────────────────────────────────────────────────────────
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

// ─── SHARED HEADER ────────────────────────────────────────────────────────────
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

// ─── SHARED MOBILE NAV ────────────────────────────────────────────────────────
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

// ─── SHARED FOOTER ────────────────────────────────────────────────────────────
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

// ─── SHARED CSS BLOCK ─────────────────────────────────────────────────────────
const SHARED_CSS = `<link rel="stylesheet" href="/css/site.v4.css"/>
<link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/bebas-neue.woff2"/>
<link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/barlow-condensed-700.woff2"/>
<link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/barlow-700.woff2"/>`;

// ─── SCROLL TO TOP SCRIPT ─────────────────────────────────────────────────────
const SCROLL_TOP = `<script>history.scrollRestoration='manual';window.scrollTo(0,0);</script>`;

// ─── PAGES TO SKIP (homepage, special pages) ──────────────────────────────────
const SKIP_SLUGS = new Set([
  '', // homepage
  'googleac4190c5fb66b0fb',
  'site',
]);

// ─── PROCESS ALL HTML FILES ───────────────────────────────────────────────────
const htmlFiles = globSync('**/*.html', { cwd: PUBLIC_DIR });
let updated = 0;
let skipped = 0;
let alreadyNew = 0;

for (const file of htmlFiles) {
  const slug = file.replace(/\/index\.html$/, '').replace(/\.html$/, '');
  
  if (SKIP_SLUGS.has(slug)) {
    skipped++;
    continue;
  }
  
  const fp = path.join(PUBLIC_DIR, file);
  let html = fs.readFileSync(fp, 'utf-8');
  
  // Skip if already has the new template (has .ni class = dropdown nav)
  if (html.includes('class="ni"')) {
    alreadyNew++;
    continue;
  }
  
  // Skip redirect stubs (very short pages)
  if (html.length < 1000) {
    skipped++;
    continue;
  }
  
  let modified = html;
  
  // 1) Always ensure site.v4.css is the only CSS — replace old versions or inject fresh
  modified = modified.replace(/site\.v1\.css/g, 'site.v4.css');
  modified = modified.replace(/site\.v2\.css/g, 'site.v4.css');
  if (!modified.includes('/css/site.v4.css') && !modified.includes('/css/site.css')) {
    modified = modified.replace(/<\/head>/i, SHARED_CSS + '\n</head>');
  }
  
  // 2) Inject scroll-to-top after <body> tag
  if (!modified.includes('scrollTo(0,0)')) {
    modified = modified.replace(/<body[^>]*>/i, (match) => match + '\n' + SCROLL_TOP);
  }
  
  // 3) Replace old header with new header + ticker + mobile nav
  // Find and remove old header
  const oldHeaderMatch = modified.match(/<header[\s\S]*?<\/header>/i);
  if (oldHeaderMatch) {
    // Also remove old mobile nav if present (div with class mnav or mobile-nav)
    let withoutOldHeader = modified.replace(/<header[\s\S]*?<\/header>/i, '');
    // Remove old mobile nav
    withoutOldHeader = withoutOldHeader.replace(/<div[^>]*(?:class="mnav"|id="mnav"|class="mobile-nav")[^>]*>[\s\S]*?<\/div>\s*/i, '');
    // Remove old ticker/trib if present
    withoutOldHeader = withoutOldHeader.replace(/<div[^>]*class="trib"[^>]*>[\s\S]*?<\/div>\s*/i, '');
    
    // Insert new ticker + header + mobile nav after <body> scroll script
    const insertPoint = withoutOldHeader.indexOf(SCROLL_TOP);
    if (insertPoint !== -1) {
      const after = insertPoint + SCROLL_TOP.length;
      modified = withoutOldHeader.slice(0, after) + '\n' + TICKER + '\n' + HEADER + '\n' + MOBILE_NAV + withoutOldHeader.slice(after);
    } else {
      // Fallback: insert after <body>
      modified = withoutOldHeader.replace(/<body[^>]*>/i, (match) => match + '\n' + TICKER + '\n' + HEADER + '\n' + MOBILE_NAV);
    }
  }
  
  // 4) Replace old footer with new footer
  const oldFooterMatch = modified.match(/<footer[\s\S]*?<\/footer>/i);
  if (oldFooterMatch) {
    modified = modified.replace(/<footer[\s\S]*?<\/footer>/i, FOOTER);
  }
  
  // Write back
  fs.writeFileSync(fp, modified, 'utf-8');
  updated++;
}

console.log(`\n✅ stamp-header-footer complete:`);
console.log(`   Updated: ${updated} pages`);
console.log(`   Already new template: ${alreadyNew} pages`);
console.log(`   Skipped: ${skipped} pages`);
