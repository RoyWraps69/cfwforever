#!/usr/bin/env node
/**
 * Inject "Related Services" internal linking sections into key service pages.
 * Each page gets links to related pages + universal links to /wrap-calculator/ and /estimate/.
 */
import fs from 'fs';
import path from 'path';

const PUBLIC = path.resolve('public');

// Define the link map: each page gets specific related pages
const LINK_MAP = {
  'fleet-wraps-chicago': {
    title: 'Related Fleet Wrap Services',
    links: [
      { url: '/truck-wraps-chicago/', text: 'Truck Wraps Chicago' },
      { url: '/van-wraps-chicago/', text: 'Van Wraps Chicago' },
      { url: '/commercial-vehicle-wraps-chicago/', text: 'Commercial Vehicle Wraps' },
      { url: '/box-truck-wraps-chicago/', text: 'Box Truck Wraps' },
      { url: '/sprinter-van-wraps-chicago/', text: 'Sprinter Van Wraps' },
      { url: '/trailer-wraps-chicago/', text: 'Trailer Wraps Chicago' },
    ]
  },
  'truck-wraps-chicago': {
    title: 'Related Truck Wrap Services',
    links: [
      { url: '/fleet-wraps-chicago/', text: 'Fleet Wraps Chicago' },
      { url: '/box-truck-wraps-chicago/', text: 'Box Truck Wraps' },
      { url: '/pickup-truck-wraps/', text: 'Pickup Truck Wraps' },
      { url: '/commercial-vehicle-wraps-chicago/', text: 'Commercial Vehicle Wraps' },
      { url: '/construction-vehicle-wraps/', text: 'Construction Vehicle Wraps' },
      { url: '/van-wraps-chicago/', text: 'Van Wraps Chicago' },
    ]
  },
  'van-wraps-chicago': {
    title: 'Related Van Wrap Services',
    links: [
      { url: '/fleet-wraps-chicago/', text: 'Fleet Wraps Chicago' },
      { url: '/sprinter-van-wraps-chicago/', text: 'Sprinter Van Wraps' },
      { url: '/hvac-van-wraps-chicago/', text: 'HVAC Van Wraps' },
      { url: '/plumbing-van-wraps-chicago/', text: 'Plumbing Van Wraps' },
      { url: '/truck-wraps-chicago/', text: 'Truck Wraps Chicago' },
      { url: '/commercial-vehicle-wraps-chicago/', text: 'Commercial Vehicle Wraps' },
    ]
  },
  'commercial-vehicle-wraps-chicago': {
    title: 'Related Commercial Wrap Services',
    links: [
      { url: '/fleet-wraps-chicago/', text: 'Fleet Wraps Chicago' },
      { url: '/truck-wraps-chicago/', text: 'Truck Wraps Chicago' },
      { url: '/van-wraps-chicago/', text: 'Van Wraps Chicago' },
      { url: '/box-truck-wraps-chicago/', text: 'Box Truck Wraps' },
      { url: '/construction-vehicle-wraps/', text: 'Construction Vehicle Wraps' },
      { url: '/trailer-wraps-chicago/', text: 'Trailer Wraps Chicago' },
    ]
  },
  'box-truck-wraps-chicago': {
    title: 'Related Box Truck Services',
    links: [
      { url: '/truck-wraps-chicago/', text: 'Truck Wraps Chicago' },
      { url: '/fleet-wraps-chicago/', text: 'Fleet Wraps Chicago' },
      { url: '/commercial-vehicle-wraps-chicago/', text: 'Commercial Vehicle Wraps' },
      { url: '/trailer-wraps-chicago/', text: 'Trailer Wraps Chicago' },
      { url: '/construction-vehicle-wraps/', text: 'Construction Vehicle Wraps' },
      { url: '/van-wraps-chicago/', text: 'Van Wraps Chicago' },
    ]
  },
  'sprinter-van-wraps': {
    title: 'Related Sprinter Van Services',
    links: [
      { url: '/van-wraps-chicago/', text: 'Van Wraps Chicago' },
      { url: '/fleet-wraps-chicago/', text: 'Fleet Wraps Chicago' },
      { url: '/hvac-van-wraps-chicago/', text: 'HVAC Van Wraps' },
      { url: '/plumbing-van-wraps-chicago/', text: 'Plumbing Van Wraps' },
      { url: '/commercial-vehicle-wraps-chicago/', text: 'Commercial Vehicle Wraps' },
      { url: '/truck-wraps-chicago/', text: 'Truck Wraps Chicago' },
    ]
  },
  'color-change-wraps': {
    title: 'Related Color Change Services',
    links: [
      { url: '/matte-vehicle-wraps/', text: 'Matte Vehicle Wraps' },
      { url: '/vehicle-wraps-chicago/', text: 'Vehicle Wraps Chicago' },
      { url: '/fleet-wraps-chicago/', text: 'Fleet Wraps Chicago' },
      { url: '/ev-wraps/', text: 'EV Wraps' },
    ]
  },
  'ev-wraps': {
    title: 'Related EV Wrap Services',
    links: [
      { url: '/color-change-wraps/', text: 'Color Change Wraps' },
      { url: '/vehicle-wraps-chicago/', text: 'Vehicle Wraps Chicago' },
      { url: '/fleet-wraps-chicago/', text: 'Fleet Wraps Chicago' },
      { url: '/matte-vehicle-wraps/', text: 'Matte Vehicle Wraps' },
    ]
  },
  'hvac-van-wraps-chicago': {
    title: 'Related HVAC Wrap Services',
    links: [
      { url: '/van-wraps-chicago/', text: 'Van Wraps Chicago' },
      { url: '/sprinter-van-wraps-chicago/', text: 'Sprinter Van Wraps' },
      { url: '/plumbing-van-wraps-chicago/', text: 'Plumbing Van Wraps' },
      { url: '/electrician-van-wraps-chicago/', text: 'Electrician Van Wraps' },
      { url: '/fleet-wraps-chicago/', text: 'Fleet Wraps Chicago' },
      { url: '/commercial-vehicle-wraps-chicago/', text: 'Commercial Vehicle Wraps' },
    ]
  },
  'plumbing-van-wraps-chicago': {
    title: 'Related Plumbing Wrap Services',
    links: [
      { url: '/van-wraps-chicago/', text: 'Van Wraps Chicago' },
      { url: '/hvac-van-wraps-chicago/', text: 'HVAC Van Wraps' },
      { url: '/electrician-van-wraps-chicago/', text: 'Electrician Van Wraps' },
      { url: '/contractor-truck-wraps-chicago/', text: 'Contractor Truck Wraps' },
      { url: '/fleet-wraps-chicago/', text: 'Fleet Wraps Chicago' },
    ]
  },
  'electrician-vehicle-wraps-chicago': {
    title: 'Related Electrician Wrap Services',
    links: [
      { url: '/van-wraps-chicago/', text: 'Van Wraps Chicago' },
      { url: '/hvac-van-wraps-chicago/', text: 'HVAC Van Wraps' },
      { url: '/plumbing-van-wraps-chicago/', text: 'Plumbing Van Wraps' },
      { url: '/contractor-vehicle-wraps-chicago/', text: 'Contractor Vehicle Wraps' },
      { url: '/fleet-wraps-chicago/', text: 'Fleet Wraps Chicago' },
    ]
  },
  'contractor-vehicle-wraps-chicago': {
    title: 'Related Contractor Wrap Services',
    links: [
      { url: '/truck-wraps-chicago/', text: 'Truck Wraps Chicago' },
      { url: '/construction-vehicle-wraps/', text: 'Construction Vehicle Wraps' },
      { url: '/hvac-van-wraps-chicago/', text: 'HVAC Van Wraps' },
      { url: '/plumbing-van-wraps-chicago/', text: 'Plumbing Van Wraps' },
      { url: '/fleet-wraps-chicago/', text: 'Fleet Wraps Chicago' },
    ]
  },
  'construction-vehicle-wraps': {
    title: 'Related Construction Wrap Services',
    links: [
      { url: '/contractor-truck-wraps-chicago/', text: 'Contractor Truck Wraps' },
      { url: '/truck-wraps-chicago/', text: 'Truck Wraps Chicago' },
      { url: '/box-truck-wraps-chicago/', text: 'Box Truck Wraps' },
      { url: '/trailer-wraps-chicago/', text: 'Trailer Wraps Chicago' },
      { url: '/fleet-wraps-chicago/', text: 'Fleet Wraps Chicago' },
    ]
  },
  'trailer-wraps-chicago': {
    title: 'Related Trailer Wrap Services',
    links: [
      { url: '/fleet-wraps-chicago/', text: 'Fleet Wraps Chicago' },
      { url: '/box-truck-wraps-chicago/', text: 'Box Truck Wraps' },
      { url: '/truck-wraps-chicago/', text: 'Truck Wraps Chicago' },
      { url: '/construction-vehicle-wraps/', text: 'Construction Vehicle Wraps' },
      { url: '/commercial-vehicle-wraps-chicago/', text: 'Commercial Vehicle Wraps' },
    ]
  },
  'one-day-wraps': {
    title: 'Related Quick Wrap Services',
    links: [
      { url: '/fleet-wraps-chicago/', text: 'Fleet Wraps Chicago' },
      { url: '/van-wraps-chicago/', text: 'Van Wraps Chicago' },
      { url: '/truck-wraps-chicago/', text: 'Truck Wraps Chicago' },
      { url: '/commercial-vehicle-wraps-chicago/', text: 'Commercial Vehicle Wraps' },
    ]
  },
  'matte-vehicle-wraps': {
    title: 'Related Matte Wrap Services',
    links: [
      { url: '/color-change-wrap-chicago/', text: 'Color Change Wraps' },
      { url: '/vehicle-wraps-chicago/', text: 'Vehicle Wraps Chicago' },
      { url: '/ev-wraps-chicago/', text: 'EV Wraps Chicago' },
      { url: '/fleet-wraps-chicago/', text: 'Fleet Wraps Chicago' },
    ]
  },
  'vehicle-wraps-chicago': {
    title: 'Related Vehicle Wrap Services',
    links: [
      { url: '/fleet-wraps-chicago/', text: 'Fleet Wraps Chicago' },
      { url: '/truck-wraps-chicago/', text: 'Truck Wraps Chicago' },
      { url: '/van-wraps-chicago/', text: 'Van Wraps Chicago' },
      { url: '/color-change-wrap-chicago/', text: 'Color Change Wraps' },
      { url: '/commercial-vehicle-wraps-chicago/', text: 'Commercial Vehicle Wraps' },
      { url: '/ev-wraps-chicago/', text: 'EV Wraps Chicago' },
    ]
  },
};

// Universal links added to every page
const UNIVERSAL_LINKS = [
  { url: '/wrap-calculator/', text: 'Instant Wrap Price Calculator' },
  { url: '/estimate/', text: 'Get a Free Estimate' },
];

function buildLinkSection(config) {
  const allLinks = [...config.links, ...UNIVERSAL_LINKS];
  const linkItems = allLinks.map(l => 
    `<a href="${l.url}" style="display:inline-block;padding:8px 16px;background:rgba(255,215,0,.08);border:1px solid rgba(255,215,0,.2);border-radius:6px;color:#FFD700;text-decoration:none;font-size:.85rem;transition:background .2s">${l.text}</a>`
  ).join('\n      ');
  
  return `
<section class="internal-links-section" style="margin:48px 0;padding:32px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:12px">
  <h2 style="font-size:1.1rem;color:#fff;margin-bottom:20px">${config.title}</h2>
  <div style="display:flex;flex-wrap:wrap;gap:10px">
      ${linkItems}
  </div>
</section>`;
}

let injected = 0;
let skipped = 0;

for (const [slug, config] of Object.entries(LINK_MAP)) {
  const filePath = path.join(PUBLIC, slug, 'index.html');
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  Skipped ${slug} — file not found`);
    skipped++;
    continue;
  }
  
  let html = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already has internal links section
  if (html.includes('internal-links-section')) {
    console.log(`  ⏭️  Skipped ${slug} — already has internal links`);
    skipped++;
    continue;
  }
  
  const section = buildLinkSection(config);
  
  // Try to insert before the FAQ section, or before the footer
  if (html.includes('Frequently Asked Questions')) {
    // Insert before the FAQ h2 tag directly (works for both <section><h2> and bare <h2>)
    html = html.replace(
      /<h2[^>]*>Frequently Asked Questions/,
      section + '\n<h2>Frequently Asked Questions'
    );
  } else if (html.includes('class="footer"') || html.includes('id="footer"')) {
    html = html.replace(
      /(<(?:div|footer)[^>]*(?:class|id)="footer")/,
      section + '\n$1'
    );
  } else if (html.includes('<!-- FOOTER -->')) {
    html = html.replace('<!-- FOOTER -->', section + '\n<!-- FOOTER -->');
  } else {
    // Fallback: insert before the last </main> or </body>
    const insertPoint = html.lastIndexOf('</main>');
    if (insertPoint > -1) {
      html = html.slice(0, insertPoint) + section + '\n' + html.slice(insertPoint);
    } else {
      html = html.replace('</body>', section + '\n</body>');
    }
  }
  
  fs.writeFileSync(filePath, html);
  console.log(`  ✅ Injected internal links into ${slug}`);
  injected++;
}

console.log(`\n📎 Internal links: ${injected} pages updated, ${skipped} skipped`);
