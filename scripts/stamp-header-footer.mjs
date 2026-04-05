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
<span>🏆 6th Wrap Free — Fleet Loyalty Program</span>
<span>💰 IRS Section 179 — 100% Deductible</span>
<span>✓ <em>24+ Years</em> Commercial Experience</span>
<span>✓ <em>9,400+</em> Vehicles Wrapped</span>
<span>🚐 Free Fleet Pickup — All of Chicagoland</span>
<span>⚡ 2-Hour Estimate Response</span>
<span>📞 (312) 597-1286 — Mon–Fri 8AM–5PM</span>
<span>🏆 6th Wrap Free — Fleet Loyalty Program</span>
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
<a href="/box-truck-wraps-chicago/">Box Trucks</a>
<a href="/sprinter-van-wraps/">Sprinter Vans</a>
<a href="/commercial-vehicle-wraps-chicago/">Transit Vans</a>
<a href="/color-change-wraps/">Color Change Wraps</a>
<a href="/ev-wraps/">⚡ Electric Vehicle Wraps</a>
<a href="/wallwraps/">Wall Graphics</a>
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
<a href="/rent-the-bay/">🔧 Rent the Bay</a>
<a href="/refund-policy/">Refund Policy</a>
</div></div>
</nav>
<div class="hright">
<a class="gmb-header" href="https://g.page/r/CYlPAF8xkJCsEAE/review" rel="noopener" target="_blank">
<span class="gs">★★★★★</span>
<div><span>4.9 / 4.9</span><small>49 reviews</small></div>
</a>
<a class="hphone" href="tel:+13125971286">📞 (312) 597-1286</a>
<a class="btn bg pulse" href="/portfolio/">Portfolio</a>
<a class="btn bo" href="/calculator/" style="border-color:var(--gold);color:var(--gold)">Get Instant Price</a>
<button aria-controls="mnav" aria-expanded="false" aria-label="Open menu" class="hambtn" onclick="var m=document.getElementById('mnav');m.classList.toggle('open');this.setAttribute('aria-expanded',m.classList.contains('open'))">☰</button>
</div>
</div>
</header>`;

// ─── SHARED MOBILE NAV ────────────────────────────────────────────────────────
const MOBILE_NAV = `<div class="mnav" id="mnav">
<span class="mg">Services</span>
<a href="/commercial-vehicle-wraps-chicago/">Commercial Fleets</a>
<a href="/box-truck-wraps-chicago/">Box Trucks</a>
<a href="/sprinter-van-wraps/">Sprinter Vans</a>
<a href="/color-change-wraps/">Color Change</a>
<a href="/ev-wraps/">⚡ EV Wraps</a>
<a href="/wallwraps/">Wall Graphics</a>
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
<a href="/rent-the-bay/">🔧 Rent the Bay</a>
<a href="/calculator/">Get Instant Price</a>
<a href="/contact/">Contact</a>
</div>`;

// ─── SHARED FOOTER ────────────────────────────────────────────────────────────
const FOOTER = `<footer role="contentinfo">
<div class="fg">
<div class="fb">
<div style="margin-bottom:10px"><img alt="Chicago Fleet Wraps" src="/images/logo-badge.webp" style="height:80px;width:auto"/></div>
<p>Professional fleet wrap specialists serving Chicago and all of Chicagoland since 2014.</p>
<p style="margin-top:10px"><strong style="color:rgba(255,255,255,.6)">4711 N Lamon Ave #7</strong><br/>Chicago, IL 60630</p>
<p><a href="tel:+13125971286">(312) 597-1286</a>  |  <a href="mailto:roy@chicagofleetwraps.com">roy@chicagofleetwraps.com</a></p>
<p style="color:rgba(255,255,255,.6);font-size:.74rem;margin-top:4px">Mon–Fri 8AM–5PM CT</p>
<div class="ft-sm">
<a href="https://www.facebook.com/chicagofleetwraps" target="_blank" title="Facebook">
<svg fill="rgba(255,255,255,0.6)" viewbox="0 0 24 24"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.27h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z"></path></svg>
</a>
<a href="https://www.instagram.com/chicago_fleet_wraps" target="_blank" title="Instagram">
<svg viewbox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" fill="rgba(255,255,255,0.6)"></path></svg>
</a>
<a href="https://www.linkedin.com/company/chicago-fleet-wraps" target="_blank" title="LinkedIn">
<svg fill="rgba(255,255,255,0.6)" viewbox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path></svg>
</a>
<a href="https://www.youtube.com/@chicagofleetwraps" target="_blank" title="YouTube">
<svg fill="rgba(255,255,255,0.6)" viewbox="0 0 24 24"><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"></path></svg>
</a>
<a href="https://search.google.com/local/writereview?placeid=ChIJTQl0F0vSD4gRpBz-ZmVGHuU" target="_blank" title="Google Reviews">
<svg fill="none" style="width:18px;height:18px" viewbox="0 0 48 48"><path d="M43.6 20H24v8.4h11.3C33.7 33.5 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l6-6C34.5 6.2 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10 0 19-7.3 19-20 0-1.3-.1-2.7-.4-4z" fill="rgba(255,255,255,0.6)"></path></svg>
</a>
</div>
</div>
<div class="fb">
<div class="footer-heading">Services</div>
<a href="/vehicle-wraps-chicago/">Vehicle Wraps Chicago</a>
<a href="/fleet-wraps-chicago/">Fleet Wraps Chicago</a>
<a href="/truck-wraps-chicago/">Truck Wraps Chicago</a>
<a href="/van-wraps-chicago/">Van Wraps Chicago</a>
<a href="/commercial-vehicle-wraps-chicago/">Commercial Wraps</a>
<a href="/partial-vehicle-wraps-chicago/">Partial Wraps</a>
<a href="/vehicle-wrap-cost-chicago/">Wrap Pricing</a>
<a href="/color-change-wraps/">Color Change</a>
<a href="/ev-wraps/">EV Wraps</a>
<a href="/wrap-removal/">Wrap Removal</a>
</div>
<div class="fb">
<div class="footer-heading">Industries</div>
<a href="/hvac-van-wraps-chicago/">HVAC Wraps</a>
<a href="/plumbing-van-wraps-chicago/">Plumbing Wraps</a>
<a href="/electrician-vehicle-wraps-chicago/">Electrician Wraps</a>
<a href="/contractor-vehicle-wraps-chicago/">Contractor Wraps</a>
<a href="/delivery-fleet-wraps-chicago/">Delivery Wraps</a>
<a href="/food-truck-wraps-chicago/">Food Truck Wraps</a>
<a href="/landscaping-truck-wraps-chicago/">Landscaping Wraps</a>
<a href="/boat-wraps-chicago/">Boat Wraps</a>
<a href="/moving-truck-wraps-chicago/">Moving Truck Wraps</a>
</div>
<div class="fb">
<div class="footer-heading">Company</div>
<a href="/calculator/">Get Instant Price</a>
<a href="/portfolio/">Portfolio</a>
<a href="/about/">About</a>
<a href="/faq/">FAQ</a>
<a href="/servicearea/">Service Area</a>
<a href="/contact/">Contact</a>
<a href="/warranty/">Warranty</a>
<a href="/warranty/">Refund Policy</a>
<div class="footer-heading" style="margin-top:16px">Resources</div>
<a href="/roi/">ROI Guide</a>
<a href="/stats/">Wrap Stats</a>
<a href="/materials/">Materials Guide</a>
<a href="/care/">Care Guide</a>
<a href="/rent-the-bay/">Rent the Bay</a>
<a href="/blog/">Blog</a>
</div>
<div class="fb">
<div class="footer-heading">Interactive Tools</div>
<a href="/brand-audit/">Color Visualizer</a>
<a href="/brand-audit/">Fleet Brand Audit</a>
<a href="/schedule/">Book Install</a>
<a href="/portfolio/">Before &amp; After</a>
<a href="/wrap-calculator">Wrap Price Calculator</a>
<a href="/calculator/">Cost Per Day Calculator</a>
<a href="/intake/">Fleet Intake Form</a>
<a href="/vinyl-guide/">Vinyl Guide</a>
<a href="/calculator/">Fleet Account</a>
</div>
</div>
<div class="fbot">
<span>© 2026 <a href="/" style="color:inherit;text-decoration:none;cursor:default">Chicago Fleet Wraps</a> · 4711 N Lamon Ave #7, Chicago, IL 60630 · 24+ Years Experience · 9,400+ Vehicles Wrapped</span>
<div class="fsm">
<a href="https://www.facebook.com/chicagofleetwraps" target="_blank">Facebook</a>
<a href="https://www.instagram.com/chicago_fleet_wraps" target="_blank">Instagram</a>
<a href="https://www.linkedin.com/company/chicago-fleet-wraps" target="_blank">LinkedIn</a>
<a href="https://search.google.com/local/writereview?placeid=ChIJTQl0F0vSD4gRpBz-ZmVGHuU" target="_blank">Google Reviews</a>
</div>
</div>
</footer>`;

// ─── SHARED CSS BLOCK ─────────────────────────────────────────────────────────
const SHARED_CSS = `<link rel="stylesheet" href="/css/site.v4.css"/>
<link rel="icon" type="image/png" href="/favicon.png"/>
<link rel="apple-touch-icon" href="/favicon.png"/>
<link rel="shortcut icon" href="/favicon.png"/>
<link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/bebas-neue.woff2"/>
<link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/barlow-condensed-700.woff2"/>
<link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/barlow-700.woff2"/>`;

// ─── SCROLL TO TOP SCRIPT ─────────────────────────────────────────────────────
const SCROLL_TOP = `<script>history.scrollRestoration='manual';window.scrollTo(0,0);</script>`;

// ─── PAGES TO SKIP (homepage, special pages) ──────────────────────────────────
const SKIP_SLUGS = new Set([
  'googleac4190c5fb66b0fb',
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
  
  // Skip redirect stubs (very short pages)
  if (html.length < 1000) {
    skipped++;
    continue;
  }
  
  let modified = html;
  
  // 0) Strip ALL inline <style> blocks — everything is in site.v4.css
  modified = modified.replace(/\s*<style>[\s\S]*?<\/style>\s*/gi, '\n');
  
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
  
  // 3) ALWAYS replace header — unified across all pages
  // First, remove ALL existing mnav blocks
  while (/<div[^>]*(?:class="mnav"|id="mnav")[^>]*>[\s\S]*?<\/div>/i.test(modified)) {
    modified = modified.replace(/<div[^>]*(?:class="mnav"|id="mnav")[^>]*>[\s\S]*?<\/div>/i, '');
  }
  // Remove ALL existing ticker bars
  while (/<div[^>]*class="trib"[^>]*>[\s\S]*?<\/div>/i.test(modified)) {
    modified = modified.replace(/<div[^>]*class="trib"[^>]*>[\s\S]*?<\/div>/i, '');
  }
  // Remove ALL existing headers
  while (/<header[\s\S]*?<\/header>/i.test(modified)) {
    modified = modified.replace(/<header[\s\S]*?<\/header>/i, '');
  }
  // Now inject the single canonical ticker + header + mobile nav after the scroll-to-top script or body tag
  const insertPoint = modified.indexOf(SCROLL_TOP);
  if (insertPoint !== -1) {
    const after = insertPoint + SCROLL_TOP.length;
    modified = modified.slice(0, after) + '\n' + TICKER + '\n' + HEADER + '\n' + MOBILE_NAV + modified.slice(after);
  } else {
    modified = modified.replace(/<body[^>]*>/i, (match) => match + '\n' + TICKER + '\n' + HEADER + '\n' + MOBILE_NAV);
  }
  
  // 4) ALWAYS replace footer — unified across all pages
  // First, remove ALL existing footers
  while (/<footer[\s\S]*?<\/footer>/i.test(modified)) {
    modified = modified.replace(/<footer[\s\S]*?<\/footer>/i, '<!--FOOTER_PLACEHOLDER-->');
  }
  // Replace the first placeholder with the new footer, remove any extras
  if (modified.includes('<!--FOOTER_PLACEHOLDER-->')) {
    modified = modified.replace('<!--FOOTER_PLACEHOLDER-->', FOOTER);
    // Remove any remaining placeholders (from duplicate footers)
    modified = modified.replace(/<!--FOOTER_PLACEHOLDER-->/g, '');
  } else if (modified.includes('</body>')) {
    // No footer found at all, insert before </body>
    modified = modified.replace('</body>', FOOTER + '\n</body>');
  }
  
  // Write back
  fs.writeFileSync(fp, modified, 'utf-8');
  updated++;
}

console.log(`\n✅ stamp-header-footer complete:`);
console.log(`   Updated: ${updated} pages`);
console.log(`   Already new template: ${alreadyNew} pages`);
console.log(`   Skipped: ${skipped} pages`);
