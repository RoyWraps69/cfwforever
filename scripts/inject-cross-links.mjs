#!/usr/bin/env node
/**
 * Cross-Link Injection Script
 * 
 * Injects contextual "Related Pages" sections into hand-crafted static HTML files
 * that don't already have cross-links. Adds a styled section before the CTA bar
 * or before the footer.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '../public');

// ── Cross-link map: page path → related links ──
const CROSS_LINKS = {
  // ── Blog Posts ──
  'post/how-much-does-a-car-wrap-cost': {
    title: 'Related Articles & Services',
    links: [
      { href: '/vehicle-wrap-cost-chicago/', label: 'Vehicle Wrap Cost Chicago — Full Pricing Guide' },
      { href: '/post/full-wrap-vs-partial-wrap/', label: 'Full Wrap vs Partial Wrap Comparison' },
      { href: '/post/vehicle-wrap-vs-paint-cost/', label: 'Vehicle Wrap vs Paint: Cost Comparison' },
      { href: '/calculator/', label: 'Instant Wrap Price Calculator' },
      { href: '/fleet-wraps-chicago/', label: 'Fleet Wraps Chicago — Commercial Services' },
      { href: '/post/how-long-do-vehicle-wraps-last/', label: 'How Long Do Vehicle Wraps Last?' },
    ]
  },
  'post/how-long-do-vehicle-wraps-last': {
    title: 'Related Articles & Services',
    links: [
      { href: '/post/3m-vs-avery-dennison-vehicle-wraps/', label: '3M vs Avery Dennison — Which Vinyl Lasts Longer?' },
      { href: '/post/best-vinyl-for-commercial-vehicle-wraps/', label: 'Best Vinyl for Commercial Vehicle Wraps' },
      { href: '/care/', label: 'Wrap Care & Maintenance Guide' },
      { href: '/materials/', label: 'Wrap Materials Guide' },
      { href: '/warranty/', label: 'Our Warranty Policy' },
      { href: '/wrap-removal/', label: 'When to Remove & Replace a Wrap' },
    ]
  },
  'post/full-wrap-vs-partial-wrap': {
    title: 'Related Articles & Services',
    links: [
      { href: '/post/how-much-does-a-car-wrap-cost/', label: 'How Much Does a Car Wrap Cost?' },
      { href: '/partial-vehicle-wraps-chicago/', label: 'Partial Vehicle Wraps Chicago' },
      { href: '/fleet-wraps-chicago/', label: 'Fleet Wraps Chicago' },
      { href: '/commercial-vehicle-wraps-chicago/', label: 'Commercial Vehicle Wraps Chicago' },
      { href: '/post/fleet-wrap-roi-for-contractors/', label: 'Fleet Wrap ROI for Contractors' },
      { href: '/calculator/', label: 'Instant Wrap Price Calculator' },
    ]
  },
  'post/fleet-wrap-roi-for-contractors': {
    title: 'Related Articles & Services',
    links: [
      { href: '/contractor-vehicle-wraps-chicago/', label: 'Contractor Vehicle Wraps Chicago' },
      { href: '/roi/', label: 'Fleet Wrap ROI Calculator Guide' },
      { href: '/vsads/', label: 'Vehicle Wraps vs Google Ads' },
      { href: '/post/how-much-does-a-car-wrap-cost/', label: 'How Much Does a Car Wrap Cost?' },
      { href: '/hvac-van-wraps-chicago/', label: 'HVAC Van Wraps Chicago' },
      { href: '/plumbing-van-wraps-chicago/', label: 'Plumbing Van Wraps Chicago' },
    ]
  },
  'post/3m-vs-avery-dennison-vehicle-wraps': {
    title: 'Related Articles & Services',
    links: [
      { href: '/post/best-vinyl-for-commercial-vehicle-wraps/', label: 'Best Vinyl for Commercial Wraps' },
      { href: '/post/3m-vinyl-wraps-chicago-fleet/', label: '3M Vinyl Wraps for Chicago Fleets' },
      { href: '/materials/', label: 'Wrap Materials Guide' },
      { href: '/post/how-long-do-vehicle-wraps-last/', label: 'How Long Do Vehicle Wraps Last?' },
      { href: '/care/', label: 'Wrap Care & Maintenance' },
      { href: '/fleet-wraps-chicago/', label: 'Fleet Wraps Chicago' },
    ]
  },
  'post/vehicle-wrap-vs-paint-cost': {
    title: 'Related Articles & Services',
    links: [
      { href: '/post/how-much-does-a-car-wrap-cost/', label: 'Car Wrap Cost in Chicago' },
      { href: '/post/does-wrapping-a-car-devalue-it/', label: 'Does Wrapping a Car Devalue It?' },
      { href: '/colorchange/', label: 'Color Change Wraps Chicago' },
      { href: '/post/what-is-the-downside-of-wrapping-a-car/', label: 'Downsides of Wrapping a Car' },
      { href: '/calculator/', label: 'Instant Wrap Price Calculator' },
      { href: '/vehicle-wraps-chicago/', label: 'Vehicle Wraps Chicago' },
    ]
  },
  'post/does-wrapping-a-car-devalue-it': {
    title: 'Related Articles & Services',
    links: [
      { href: '/post/vehicle-wrap-vs-paint-cost/', label: 'Vehicle Wrap vs Paint Cost' },
      { href: '/post/what-is-the-downside-of-wrapping-a-car/', label: 'Downsides of Wrapping a Car' },
      { href: '/post/how-long-do-vehicle-wraps-last/', label: 'How Long Do Wraps Last?' },
      { href: '/colorchange/', label: 'Color Change Wraps Chicago' },
      { href: '/wrap-removal/', label: 'Professional Wrap Removal' },
      { href: '/care/', label: 'Wrap Care Guide' },
    ]
  },
  'post/what-is-the-downside-of-wrapping-a-car': {
    title: 'Related Articles & Services',
    links: [
      { href: '/post/does-wrapping-a-car-devalue-it/', label: 'Does Wrapping a Car Devalue It?' },
      { href: '/post/how-long-do-vehicle-wraps-last/', label: 'How Long Do Wraps Last?' },
      { href: '/post/vehicle-wrap-vs-paint-cost/', label: 'Wrap vs Paint Cost' },
      { href: '/care/', label: 'Wrap Care & Maintenance' },
      { href: '/materials/', label: 'Materials Guide' },
      { href: '/wrap-removal/', label: 'Wrap Removal Services' },
    ]
  },
  'post/best-vinyl-for-commercial-vehicle-wraps': {
    title: 'Related Articles & Services',
    links: [
      { href: '/post/3m-vs-avery-dennison-vehicle-wraps/', label: '3M vs Avery Dennison Head-to-Head' },
      { href: '/post/3m-vinyl-wraps-chicago-fleet/', label: '3M Vinyl Wraps for Fleets' },
      { href: '/materials/', label: 'Complete Materials Guide' },
      { href: '/commercial-vehicle-wraps-chicago/', label: 'Commercial Vehicle Wraps Chicago' },
      { href: '/fleet-wraps-chicago/', label: 'Fleet Wraps Chicago' },
      { href: '/post/how-long-do-vehicle-wraps-last/', label: 'How Long Do Wraps Last?' },
    ]
  },
  'post/3m-vinyl-wraps-chicago-fleet': {
    title: 'Related Articles & Services',
    links: [
      { href: '/post/3m-vs-avery-dennison-vehicle-wraps/', label: '3M vs Avery Dennison Comparison' },
      { href: '/post/best-vinyl-for-commercial-vehicle-wraps/', label: 'Best Vinyl for Commercial Wraps' },
      { href: '/materials/', label: 'Wrap Materials Guide' },
      { href: '/fleet-wraps-chicago/', label: 'Fleet Wraps Chicago' },
      { href: '/post/how-long-do-vehicle-wraps-last/', label: 'How Long Do Wraps Last?' },
      { href: '/commercial-vehicle-wraps-chicago/', label: 'Commercial Vehicle Wraps' },
    ]
  },
  'post/top-benefits-of-custom-decals': {
    title: 'Related Articles & Services',
    links: [
      { href: '/post/full-wrap-vs-partial-wrap/', label: 'Full Wrap vs Partial Wrap' },
      { href: '/partial-vehicle-wraps-chicago/', label: 'Partial Vehicle Wraps Chicago' },
      { href: '/post/how-much-does-a-car-wrap-cost/', label: 'Car Wrap Cost Guide' },
      { href: '/fleet-wraps-chicago/', label: 'Fleet Wraps Chicago' },
      { href: '/lettering/', label: 'Vehicle Lettering Services' },
      { href: '/commercial-vehicle-wraps-chicago/', label: 'Commercial Vehicle Wraps' },
    ]
  },
  'post/cargo-van-wraps-small-business-chicago-guide': {
    title: 'Related Articles & Services',
    links: [
      { href: '/van-wraps-chicago/', label: 'Van Wraps Chicago — Full Service Page' },
      { href: '/commercial-vehicle-wraps-chicago/', label: 'Commercial Vehicle Wraps Chicago' },
      { href: '/post/how-much-does-a-car-wrap-cost/', label: 'Car Wrap Cost Guide' },
      { href: '/post/fleet-wrap-roi-for-contractors/', label: 'Fleet Wrap ROI for Contractors' },
      { href: '/hvac-van-wraps-chicago/', label: 'HVAC Van Wraps' },
      { href: '/plumbing-van-wraps-chicago/', label: 'Plumbing Van Wraps' },
    ]
  },
  'post/chicago-vehicle-wraps-vs-traditional-advertising': {
    title: 'Related Articles & Services',
    links: [
      { href: '/roi/', label: 'Fleet Wrap ROI Calculator' },
      { href: '/vsads/', label: 'Vehicle Wraps vs Google Ads' },
      { href: '/post/fleet-wrap-roi-for-contractors/', label: 'Fleet Wrap ROI for Contractors' },
      { href: '/stats/', label: 'Vehicle Wrap Statistics' },
      { href: '/fleet-wraps-chicago/', label: 'Fleet Wraps Chicago' },
      { href: '/post/how-much-does-a-car-wrap-cost/', label: 'Car Wrap Cost Guide' },
    ]
  },
  'post/chicago-trailer-wraps-mobile-advertising-fleet-branding': {
    title: 'Related Articles & Services',
    links: [
      { href: '/fleet-wraps-chicago/', label: 'Fleet Wraps Chicago' },
      { href: '/commercial-vehicle-wraps-chicago/', label: 'Commercial Vehicle Wraps' },
      { href: '/post/fleet-wrap-roi-for-contractors/', label: 'Fleet Wrap ROI' },
      { href: '/truck-wraps-chicago/', label: 'Truck Wraps Chicago' },
      { href: '/contractor-vehicle-wraps-chicago/', label: 'Contractor Vehicle Wraps' },
      { href: '/post/how-much-does-a-car-wrap-cost/', label: 'Wrap Cost Guide' },
    ]
  },
  'post/chicago-window-graphics-perforated-vinyl-commercial-vehicles-storefronts': {
    title: 'Related Articles & Services',
    links: [
      { href: '/partial-vehicle-wraps-chicago/', label: 'Partial Vehicle Wraps Chicago' },
      { href: '/commercial-vehicle-wraps-chicago/', label: 'Commercial Vehicle Wraps' },
      { href: '/wallwraps/', label: 'Wall Wraps & Murals Chicago' },
      { href: '/post/full-wrap-vs-partial-wrap/', label: 'Full Wrap vs Partial Wrap' },
      { href: '/fleet-wraps-chicago/', label: 'Fleet Wraps Chicago' },
      { href: '/signsandgraphics/', label: 'Signs & Graphics' },
    ]
  },
  'post/chicago-emergency-vehicle-wraps-first-responder-graphics': {
    title: 'Related Articles & Services',
    links: [
      { href: '/fleet-wraps-chicago/', label: 'Fleet Wraps Chicago' },
      { href: '/commercial-vehicle-wraps-chicago/', label: 'Commercial Vehicle Wraps' },
      { href: '/post/best-vinyl-for-commercial-vehicle-wraps/', label: 'Best Vinyl for Commercial Wraps' },
      { href: '/materials/', label: 'Materials Guide' },
      { href: '/truck-wraps-chicago/', label: 'Truck Wraps Chicago' },
      { href: '/van-wraps-chicago/', label: 'Van Wraps Chicago' },
    ]
  },
  'post/suv-wraps-business-branding-chicago-sales-real-estate': {
    title: 'Related Articles & Services',
    links: [
      { href: '/vehicle-wraps-chicago/', label: 'Vehicle Wraps Chicago' },
      { href: '/colorchange/', label: 'Color Change Wraps Chicago' },
      { href: '/post/how-much-does-a-car-wrap-cost/', label: 'Car Wrap Cost Guide' },
      { href: '/commercial-vehicle-wraps-chicago/', label: 'Commercial Vehicle Wraps' },
      { href: '/post/fleet-wrap-roi-for-contractors/', label: 'Fleet Wrap ROI' },
      { href: '/partial-vehicle-wraps-chicago/', label: 'Partial Vehicle Wraps' },
    ]
  },

  // ── Long-keyword service pages ──
  'fleet-wraps-chicago': {
    title: 'Related Services & Resources',
    links: [
      { href: '/commercial-vehicle-wraps-chicago/', label: 'Commercial Vehicle Wraps Chicago' },
      { href: '/van-wraps-chicago/', label: 'Van Wraps Chicago' },
      { href: '/truck-wraps-chicago/', label: 'Truck Wraps Chicago' },
      { href: '/vehicle-wrap-cost-chicago/', label: 'Vehicle Wrap Cost Guide' },
      { href: '/post/fleet-wrap-roi-for-contractors/', label: 'Fleet Wrap ROI for Contractors' },
      { href: '/roi/', label: 'Fleet Wrap ROI Calculator' },
    ]
  },
  'commercial-vehicle-wraps-chicago': {
    title: 'Related Services & Resources',
    links: [
      { href: '/fleet-wraps-chicago/', label: 'Fleet Wraps Chicago' },
      { href: '/van-wraps-chicago/', label: 'Van Wraps Chicago' },
      { href: '/truck-wraps-chicago/', label: 'Truck Wraps Chicago' },
      { href: '/vehicle-wrap-cost-chicago/', label: 'Vehicle Wrap Cost Guide' },
      { href: '/contractor-vehicle-wraps-chicago/', label: 'Contractor Vehicle Wraps' },
      { href: '/hvac-van-wraps-chicago/', label: 'HVAC Van Wraps' },
    ]
  },
  'van-wraps-chicago': {
    title: 'Related Services & Resources',
    links: [
      { href: '/fleet-wraps-chicago/', label: 'Fleet Wraps Chicago' },
      { href: '/sprinter/', label: 'Sprinter Van Wraps' },
      { href: '/commercial-vehicle-wraps-chicago/', label: 'Commercial Vehicle Wraps' },
      { href: '/post/cargo-van-wraps-small-business-chicago-guide/', label: 'Cargo Van Wraps for Small Business' },
      { href: '/vehicle-wrap-cost-chicago/', label: 'Vehicle Wrap Cost Guide' },
      { href: '/hvac-van-wraps-chicago/', label: 'HVAC Van Wraps Chicago' },
    ]
  },
  'truck-wraps-chicago': {
    title: 'Related Services & Resources',
    links: [
      { href: '/boxtruck/', label: 'Box Truck Wraps Chicago' },
      { href: '/fleet-wraps-chicago/', label: 'Fleet Wraps Chicago' },
      { href: '/commercial-vehicle-wraps-chicago/', label: 'Commercial Vehicle Wraps' },
      { href: '/vehicle-wrap-cost-chicago/', label: 'Vehicle Wrap Cost Guide' },
      { href: '/contractor-vehicle-wraps-chicago/', label: 'Contractor Vehicle Wraps' },
      { href: '/post/how-much-does-a-car-wrap-cost/', label: 'Car Wrap Cost Guide' },
    ]
  },
  'vehicle-wraps-chicago': {
    title: 'Related Services & Resources',
    links: [
      { href: '/fleet-wraps-chicago/', label: 'Fleet Wraps Chicago' },
      { href: '/van-wraps-chicago/', label: 'Van Wraps Chicago' },
      { href: '/truck-wraps-chicago/', label: 'Truck Wraps Chicago' },
      { href: '/colorchange/', label: 'Color Change Wraps' },
      { href: '/vehicle-wrap-cost-chicago/', label: 'Vehicle Wrap Cost Guide' },
      { href: '/ev-wraps/', label: 'EV Wraps Chicago' },
    ]
  },
  'vehicle-wrap-cost-chicago': {
    title: 'Related Services & Resources',
    links: [
      { href: '/post/how-much-does-a-car-wrap-cost/', label: 'How Much Does a Car Wrap Cost?' },
      { href: '/post/full-wrap-vs-partial-wrap/', label: 'Full Wrap vs Partial Wrap' },
      { href: '/calculator/', label: 'Instant Wrap Price Calculator' },
      { href: '/fleet-wraps-chicago/', label: 'Fleet Wraps Chicago' },
      { href: '/roi/', label: 'Fleet Wrap ROI Calculator' },
      { href: '/post/vehicle-wrap-vs-paint-cost/', label: 'Wrap vs Paint Cost' },
    ]
  },
  'partial-vehicle-wraps-chicago': {
    title: 'Related Services & Resources',
    links: [
      { href: '/post/full-wrap-vs-partial-wrap/', label: 'Full Wrap vs Partial Wrap' },
      { href: '/lettering/', label: 'Vehicle Lettering Services' },
      { href: '/vehicle-wrap-cost-chicago/', label: 'Vehicle Wrap Cost Guide' },
      { href: '/fleet-wraps-chicago/', label: 'Fleet Wraps Chicago' },
      { href: '/commercial-vehicle-wraps-chicago/', label: 'Commercial Vehicle Wraps' },
      { href: '/post/top-benefits-of-custom-decals/', label: 'Benefits of Custom Decals' },
    ]
  },
  'wrap-removal': {
    title: 'Related Services & Resources',
    links: [
      { href: '/post/how-long-do-vehicle-wraps-last/', label: 'How Long Do Wraps Last?' },
      { href: '/care/', label: 'Wrap Care & Maintenance' },
      { href: '/fleet-wraps-chicago/', label: 'Fleet Wraps Chicago' },
      { href: '/post/what-is-the-downside-of-wrapping-a-car/', label: 'Downsides of Wrapping a Car' },
      { href: '/vehicle-wrap-cost-chicago/', label: 'Vehicle Wrap Cost Guide' },
      { href: '/materials/', label: 'Materials Guide' },
    ]
  },

  // ── Industry pages ──
  'hvac-van-wraps-chicago': {
    title: 'Related Services & Resources',
    links: [
      { href: '/van-wraps-chicago/', label: 'Van Wraps Chicago' },
      { href: '/fleet-wraps-chicago/', label: 'Fleet Wraps Chicago' },
      { href: '/post/fleet-wrap-roi-for-contractors/', label: 'Fleet Wrap ROI for Contractors' },
      { href: '/plumbing-van-wraps-chicago/', label: 'Plumbing Van Wraps' },
      { href: '/electrician-vehicle-wraps-chicago/', label: 'Electrician Vehicle Wraps' },
      { href: '/contractor-vehicle-wraps-chicago/', label: 'Contractor Vehicle Wraps' },
    ]
  },
  'plumbing-van-wraps-chicago': {
    title: 'Related Services & Resources',
    links: [
      { href: '/van-wraps-chicago/', label: 'Van Wraps Chicago' },
      { href: '/fleet-wraps-chicago/', label: 'Fleet Wraps Chicago' },
      { href: '/hvac-van-wraps-chicago/', label: 'HVAC Van Wraps' },
      { href: '/electrician-vehicle-wraps-chicago/', label: 'Electrician Vehicle Wraps' },
      { href: '/post/fleet-wrap-roi-for-contractors/', label: 'Fleet Wrap ROI' },
      { href: '/contractor-vehicle-wraps-chicago/', label: 'Contractor Wraps' },
    ]
  },
  'electrician-vehicle-wraps-chicago': {
    title: 'Related Services & Resources',
    links: [
      { href: '/van-wraps-chicago/', label: 'Van Wraps Chicago' },
      { href: '/fleet-wraps-chicago/', label: 'Fleet Wraps Chicago' },
      { href: '/hvac-van-wraps-chicago/', label: 'HVAC Van Wraps' },
      { href: '/plumbing-van-wraps-chicago/', label: 'Plumbing Van Wraps' },
      { href: '/post/fleet-wrap-roi-for-contractors/', label: 'Fleet Wrap ROI' },
      { href: '/contractor-vehicle-wraps-chicago/', label: 'Contractor Wraps' },
    ]
  },
  'contractor-vehicle-wraps-chicago': {
    title: 'Related Services & Resources',
    links: [
      { href: '/fleet-wraps-chicago/', label: 'Fleet Wraps Chicago' },
      { href: '/truck-wraps-chicago/', label: 'Truck Wraps Chicago' },
      { href: '/hvac-van-wraps-chicago/', label: 'HVAC Van Wraps' },
      { href: '/plumbing-van-wraps-chicago/', label: 'Plumbing Van Wraps' },
      { href: '/electrician-vehicle-wraps-chicago/', label: 'Electrician Wraps' },
      { href: '/post/fleet-wrap-roi-for-contractors/', label: 'Fleet Wrap ROI' },
    ]
  },
  'delivery-fleet-wraps-chicago': {
    title: 'Related Services & Resources',
    links: [
      { href: '/fleet-wraps-chicago/', label: 'Fleet Wraps Chicago' },
      { href: '/van-wraps-chicago/', label: 'Van Wraps Chicago' },
      { href: '/truck-wraps-chicago/', label: 'Truck Wraps Chicago' },
      { href: '/boxtruck/', label: 'Box Truck Wraps' },
      { href: '/commercial-vehicle-wraps-chicago/', label: 'Commercial Vehicle Wraps' },
      { href: '/post/fleet-wrap-roi-for-contractors/', label: 'Fleet Wrap ROI' },
    ]
  },
  'food-truck-wraps-chicago': {
    title: 'Related Services & Resources',
    links: [
      { href: '/truck-wraps-chicago/', label: 'Truck Wraps Chicago' },
      { href: '/boxtruck/', label: 'Box Truck Wraps' },
      { href: '/commercial-vehicle-wraps-chicago/', label: 'Commercial Vehicle Wraps' },
      { href: '/vehicle-wrap-cost-chicago/', label: 'Vehicle Wrap Cost' },
      { href: '/fleet-wraps-chicago/', label: 'Fleet Wraps Chicago' },
      { href: '/post/how-much-does-a-car-wrap-cost/', label: 'Car Wrap Cost Guide' },
    ]
  },
  'landscaping-truck-wraps-chicago': {
    title: 'Related Services & Resources',
    links: [
      { href: '/truck-wraps-chicago/', label: 'Truck Wraps Chicago' },
      { href: '/contractor-vehicle-wraps-chicago/', label: 'Contractor Vehicle Wraps' },
      { href: '/fleet-wraps-chicago/', label: 'Fleet Wraps Chicago' },
      { href: '/post/fleet-wrap-roi-for-contractors/', label: 'Fleet Wrap ROI' },
      { href: '/vehicle-wrap-cost-chicago/', label: 'Vehicle Wrap Cost' },
      { href: '/van-wraps-chicago/', label: 'Van Wraps Chicago' },
    ]
  },
  'moving-truck-wraps-chicago': {
    title: 'Related Services & Resources',
    links: [
      { href: '/truck-wraps-chicago/', label: 'Truck Wraps Chicago' },
      { href: '/boxtruck/', label: 'Box Truck Wraps' },
      { href: '/fleet-wraps-chicago/', label: 'Fleet Wraps Chicago' },
      { href: '/commercial-vehicle-wraps-chicago/', label: 'Commercial Vehicle Wraps' },
      { href: '/vehicle-wrap-cost-chicago/', label: 'Vehicle Wrap Cost' },
      { href: '/delivery-fleet-wraps-chicago/', label: 'Delivery Fleet Wraps' },
    ]
  },
  'boat-wraps-chicago': {
    title: 'Related Services & Resources',
    links: [
      { href: '/vehicle-wraps-chicago/', label: 'Vehicle Wraps Chicago' },
      { href: '/colorchange/', label: 'Color Change Wraps' },
      { href: '/vehicle-wrap-cost-chicago/', label: 'Vehicle Wrap Cost Guide' },
      { href: '/materials/', label: 'Materials Guide' },
      { href: '/care/', label: 'Wrap Care & Maintenance' },
      { href: '/portfolio/', label: 'Our Portfolio' },
    ]
  },
};

// CSS for the cross-link section (inline to work in static HTML)
const CROSS_LINK_CSS = `
<style>
.cross-links{margin:36px 0;padding:24px;background:rgba(245,197,24,.03);border:1px solid rgba(245,197,24,.10);border-radius:12px}
.cross-links h2{font-family:'Barlow Condensed',sans-serif;font-size:1.2rem;color:#F5C518;margin:0 0 16px;font-weight:800}
.cross-links-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:8px}
.cross-links-grid a{display:block;padding:10px 14px;color:rgba(255,255,255,.7);text-decoration:none;font-size:.9rem;border-radius:6px;border:1px solid rgba(255,255,255,.06);transition:all .15s}
.cross-links-grid a:hover{color:#F5C518;border-color:rgba(245,197,24,.25);background:rgba(245,197,24,.04)}
</style>`;

function generateCrossLinkHtml(config) {
  let html = `\n<section class="cross-links">\n<h2>${config.title}</h2>\n<div class="cross-links-grid">\n`;
  for (const link of config.links) {
    html += `<a href="${link.href}">${link.label}</a>\n`;
  }
  html += `</div>\n</section>\n`;
  return html;
}

let injected = 0;
let skipped = 0;

for (const [pagePath, config] of Object.entries(CROSS_LINKS)) {
  const filePath = path.join(PUBLIC_DIR, pagePath, 'index.html');
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    skipped++;
    continue;
  }

  let html = fs.readFileSync(filePath, 'utf-8');

  // Skip if already has cross-links
  if (html.includes('class="cross-links"') || html.includes('class="related-links"')) {
    console.log(`⏭️  Already has links: ${pagePath}`);
    skipped++;
    continue;
  }

  const crossLinkHtml = generateCrossLinkHtml(config);

  // Inject before cta-bar if present, otherwise before </main> or before <footer
  if (html.includes('class="cta-bar"')) {
    html = html.replace(/<div class="cta-bar"/, CROSS_LINK_CSS + crossLinkHtml + '<div class="cta-bar"');
  } else if (html.includes('</main>')) {
    html = html.replace('</main>', CROSS_LINK_CSS + crossLinkHtml + '</main>');
  } else if (html.includes('<footer')) {
    html = html.replace('<footer', CROSS_LINK_CSS + crossLinkHtml + '<footer');
  } else {
    console.log(`⚠️  No injection point: ${pagePath}`);
    skipped++;
    continue;
  }

  fs.writeFileSync(filePath, html, 'utf-8');
  console.log(`✅ Injected ${config.links.length} links → ${pagePath}`);
  injected++;
}

console.log(`\n🔗 Cross-linking complete: ${injected} pages updated, ${skipped} skipped`);
