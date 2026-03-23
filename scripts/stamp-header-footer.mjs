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
<span>★ 4.9 Google Rating — 42 Reviews</span>
<span>💰 IRS Section 179 — 100% Deductible</span>
<span>✓ <strong>24+ Years</strong> Commercial Experience</span>
<span>✓ <strong>9,400+</strong> Vehicles Wrapped</span>
<span>🚐 Free Fleet Pickup — All of Chicagoland</span>
<span>⚡ 2-Hour Estimate Response</span>
<span>📞 (312) 597-1286 — Mon–Fri 8AM–5PM</span>
<span>★ 4.9 Google Rating — 42 Reviews</span>
<span>💰 IRS Section 179 — 100% Deductible</span>
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
const SHARED_CSS = `<style id="shared-template-css">
:root{--gold:#F5C518;--gold-dark:#d4a800;--black:#0A0A0A;--dark:#111;--surface:#161616;--text:rgba(255,255,255,.88);--text-muted:rgba(255,255,255,.52);--border:rgba(255,255,255,.08);--border-hover:rgba(255,255,255,.16);--border-gold:rgba(245,197,24,.3);--H:'Bebas Neue','Barlow Condensed',sans-serif;--B:'Barlow',sans-serif;--radius:12px}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{background:var(--black);color:var(--text);font-family:var(--B);font-size:16px;line-height:1.6;overflow-x:hidden}
.trib{background:#111;border-bottom:1px solid var(--border);padding:7px 0;overflow:hidden;white-space:nowrap}
.trib-inner{display:inline-flex;gap:40px;animation:ticker 35s linear infinite}
.trib-inner span{font-size:.74rem;color:rgba(255,255,255,.72);font-family:var(--H);font-weight:600;text-transform:uppercase;letter-spacing:.06em;white-space:nowrap}
.trib-inner span strong{color:var(--gold)}
@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
header{position:sticky;top:0;z-index:1000;background:rgba(10,10,10,.97);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);overflow:visible}
.hbar{max-width:1200px;margin:0 auto;padding:0 24px;display:flex;align-items:center;gap:20px;height:62px;overflow:visible}
.logo{font-family:var(--H);font-size:1.25rem;font-weight:900;color:#fff;cursor:pointer;flex-shrink:0;letter-spacing:.02em;text-decoration:none}
.logo span{color:var(--gold)}
nav{display:flex;align-items:center;gap:4px;margin-left:10px}
.ni{position:relative}
.ni>button{background:none;border:none;color:rgba(255,255,255,.7);font-family:var(--B);font-size:.84rem;padding:8px 12px;cursor:pointer;border-radius:6px;display:flex;align-items:center;gap:4px;min-height:44px}
.ni>button:hover{color:#fff;background:rgba(255,255,255,.07)}
.drop{display:none;position:absolute;top:100%;left:0;background:#181818;border:1px solid var(--border);border-radius:10px;padding:6px;min-width:220px;box-shadow:0 8px 32px rgba(0,0,0,.5);z-index:200}
.drop::before{content:'';position:absolute;top:-10px;left:0;right:0;height:10px}
.ni:hover .drop,.ni:focus-within .drop{display:block}
.drop a{display:block;padding:8px 12px;color:rgba(255,255,255,.7);font-size:.82rem;border-radius:6px;cursor:pointer;text-decoration:none;transition:.12s}
.drop a:hover{background:rgba(255,255,255,.07);color:#fff}
.hright{margin-left:auto;display:flex;align-items:center;gap:10px}
.hphone{color:var(--gold);font-family:var(--H);font-weight:800;font-size:.95rem;text-decoration:none;letter-spacing:.12em}
.gmb-header{display:flex;align-items:center;gap:6px;padding:5px 10px;background:rgba(245,197,24,.08);border:1px solid rgba(245,197,24,.2);border-radius:20px;text-decoration:none}
.gmb-header span{font-size:.74rem;font-weight:700;color:var(--gold);font-family:var(--H);letter-spacing:.04em}
.gmb-header small{font-size:.68rem;color:rgba(255,255,255,.7);display:block;line-height:1}
.gmb-header .gs{color:var(--gold);font-size:.8rem}
.mnav{display:none}
.mnav.open{display:flex;flex-direction:column;gap:2px;padding:12px 16px;background:#111;border-top:1px solid var(--border)}
.hambtn{display:none;background:none;border:1px solid var(--border);color:#fff;padding:8px 12px;border-radius:6px;cursor:pointer;font-size:.9rem}
.mnav a{display:block;padding:9px 14px;color:rgba(255,255,255,.75);font-size:.88rem;border-radius:6px;text-decoration:none;transition:.12s}
.mnav a:hover{background:rgba(255,255,255,.06);color:#fff}
.mg{display:block;padding:10px 14px 4px;font-family:var(--H);font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:rgba(255,255,255,.3)}
.btn{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:8px;font-family:var(--H);font-size:.95rem;font-weight:800;cursor:pointer;text-decoration:none;border:2px solid transparent;transition:.18s;letter-spacing:.02em}
.btn.bg{background:var(--gold);color:#000;border-color:var(--gold)}
.btn.bg:hover{background:#e6b800;transform:translateY(-2px)}
.btn.bo{background:transparent;border-color:rgba(255,255,255,.22);color:#fff}
.btn.bo:hover{border-color:var(--gold);color:var(--gold)}
.pulse{animation:pulse 2.4s infinite}
@keyframes pulse{0%,100%{transform:scale(1)}60%{transform:scale(1.04)}}
h1{font-family:var(--H);font-size:clamp(2.8rem,6vw,4.4rem);font-weight:900;line-height:1.05;color:#fff;margin-bottom:16px}
h2{font-family:var(--H);font-size:clamp(1.8rem,4vw,2.6rem);font-weight:900;color:var(--gold);line-height:1.1;margin:40px 0 16px}
h3{font-family:var(--H);font-size:clamp(1.2rem,2.5vw,1.6rem);font-weight:700;color:var(--gold);line-height:1.2;margin:28px 0 10px}
h4{font-family:var(--H);font-size:1.1rem;font-weight:700;color:var(--gold);margin-bottom:8px}
p{color:rgba(255,255,255,.72);line-height:1.7;margin-bottom:14px}
a{color:var(--gold);text-decoration:none}
a:hover{text-decoration:underline}
.lead{font-size:1.1rem;color:rgba(255,255,255,.78);line-height:1.72;margin-bottom:28px}
.btn-primary{background:var(--gold);color:#000;border-color:var(--gold)}
.btn-primary:hover{background:#e0b000}
.btn-est{display:inline-flex;align-items:center;padding:9px 18px;border-radius:8px;font-family:var(--H);font-size:.82rem;font-weight:800;text-decoration:none;background:var(--gold);color:#000}
.cta-bar{margin-top:32px;display:flex;gap:12px;flex-wrap:wrap;align-items:center}
.page-hero-banner{position:relative;width:100%;height:380px;overflow:hidden;display:flex;align-items:flex-end;padding-bottom:40px}
.page-hero-banner img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center}
.page-hero-banner .hero-content{position:relative;z-index:2;max-width:900px;margin:0 auto;padding:0 24px;width:100%}
.page-hero-banner h1,.page-hero-banner .hero-h1{font-family:var(--H);font-size:clamp(52px,8vw,88px);font-weight:900;line-height:1;color:#fff;text-shadow:0 2px 20px rgba(0,0,0,.7);margin-bottom:8px}
.page-hero-banner .hero-sub,.page-hero-banner .hero-h2{font-size:1.1rem;color:rgba(255,255,255,.85);text-shadow:0 1px 8px rgba(0,0,0,.6)}
footer{background:#080808;border-top:2px solid var(--gold);padding:56px 0 28px}
.fg{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr;gap:40px;max-width:1140px;margin:0 auto;padding:0 24px}
.fb h4{font-family:var(--H);font-size:.8rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,255,255,.3);margin-bottom:14px}
.fb p,.fb a{display:block;font-size:.82rem;color:rgba(255,255,255,.52);text-decoration:none;margin-bottom:6px;line-height:1.5;transition:.12s}
.fb a:hover{color:var(--gold)}
.fbot{max-width:1140px;margin:36px auto 0;padding:20px 24px 0;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
.fbot span{font-size:.75rem;color:rgba(255,255,255,.2)}
.fbot .fsm{display:flex;gap:10px}
.fbot .fsm a{color:rgba(255,255,255,.3);font-size:.75rem;text-decoration:none;transition:.12s}
.fbot .fsm a:hover{color:var(--gold)}
@media(max-width:900px){.hright .gmb-header{display:none}}
@media(max-width:768px){nav{display:none}.hambtn{display:block}.page-hero-banner{height:260px}.page-hero-banner h1,.page-hero-banner .hero-h1{font-size:clamp(36px,9vw,56px)}.fg{grid-template-columns:1fr 1fr}}
@media(max-width:480px){.fg{grid-template-columns:1fr}}
</style>`;

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
  
  // 1) Inject shared CSS before </head> if not already present
  if (!modified.includes('id="shared-template-css"')) {
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
