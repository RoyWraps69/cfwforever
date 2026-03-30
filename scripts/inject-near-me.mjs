#!/usr/bin/env node
/**
 * Inject "Near Me" service area sections into hand-crafted service pages
 * that don't already have one.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';

const PAGES = [
  { slug: 'commercial-vehicle-wraps-chicago', service: 'commercial vehicle wraps' },
  { slug: 'vehicle-wrap-cost-chicago', service: 'vehicle wrap pricing' },
  { slug: 'partial-vehicle-wraps-chicago', service: 'partial vehicle wraps' },
  { slug: 'ev-wraps', service: 'EV wraps' },
  { slug: 'hvac-van-wraps-chicago', service: 'HVAC van wraps' },
  { slug: 'plumbing-van-wraps-chicago', service: 'plumbing van wraps' },
  { slug: 'electrician-vehicle-wraps-chicago', service: 'electrician vehicle wraps' },
  { slug: 'contractor-vehicle-wraps-chicago', service: 'contractor vehicle wraps' },
  { slug: 'delivery-fleet-wraps-chicago', service: 'delivery fleet wraps' },
  { slug: 'food-truck-wraps-chicago', service: 'food truck wraps' },
  { slug: 'landscaping-truck-wraps-chicago', service: 'landscaping truck wraps' },
  { slug: 'boat-wraps-chicago', service: 'boat wraps' },
  { slug: 'box-truck-wraps-chicago', service: 'box truck wraps' },
  { slug: 'sprinter-van-wraps', service: 'Sprinter van wraps' },
  { slug: 'wrap-removal', service: 'wrap removal' },
  { slug: 'full-vehicle-wraps', service: 'full vehicle wraps' },
];

function nearMeSection(service) {
  return `<h2>${service.charAt(0).toUpperCase() + service.slice(1)} Near Me — Chicagoland Service Area</h2>
<p class="body-text">Chicago Fleet Wraps provides professional ${service} across the entire Chicagoland metro area. Whether your vehicles are based in the city or the suburbs, we offer free pickup and delivery for all projects. Our ${service} near me shop serves businesses in:</p>
<ul class="services" style="columns:2;column-gap:40px">
<li><strong><a href="/chicago/" style="color:var(--gold)">Chicago</a></strong> — All 77 neighborhoods including the Loop, Lincoln Park, Wicker Park, Logan Square, and Lakeview</li>
<li><strong><a href="/elmhurst/" style="color:var(--gold)">Elmhurst</a></strong> — DuPage County businesses and contractors</li>
<li><strong><a href="/naperville/" style="color:var(--gold)">Naperville</a></strong> — Western suburban commercial fleets</li>
<li><strong><a href="/aurora/" style="color:var(--gold)">Aurora</a></strong> — Kane County service companies</li>
<li><strong><a href="/schaumburg/" style="color:var(--gold)">Schaumburg</a></strong> — Northwest suburban businesses</li>
<li><strong><a href="/evanston/" style="color:var(--gold)">Evanston</a></strong> — North Shore and north suburban fleets</li>
<li><strong><a href="/oak-park/" style="color:var(--gold)">Oak Park</a></strong> — Near west suburban service companies</li>
<li><strong><a href="/joliet/" style="color:var(--gold)">Joliet</a></strong> — Will County commercial vehicles</li>
<li><strong>Downers Grove &amp; Lombard</strong> — Western suburban fleets</li>
<li><strong>Orland Park &amp; Tinley Park</strong> — South suburban businesses</li>
<li><strong>Arlington Heights &amp; Palatine</strong> — Northwest Cook County</li>
<li><strong><a href="/elgin/" style="color:var(--gold)">Elgin</a></strong> — Fox Valley area businesses</li>
</ul>
<p class="body-text">Free pickup and delivery for all projects. <a href="/servicearea/" style="color:var(--gold)">View all 75+ cities we serve →</a></p>`;
}

let updated = 0;
let skipped = 0;

for (const page of PAGES) {
  const filePath = `public/${page.slug}/index.html`;
  if (!existsSync(filePath)) {
    console.log(`SKIP (not found): ${filePath}`);
    skipped++;
    continue;
  }

  let html = readFileSync(filePath, 'utf8');

  // Skip if already has a Near Me section
  if (html.includes('Near Me') && html.includes('Chicagoland Service Area')) {
    console.log(`SKIP (already has Near Me): ${page.slug}`);
    skipped++;
    continue;
  }

  const section = nearMeSection(page.service);

  // Strategy: Insert before the FAQ section if it exists
  const faqH2 = html.match(/<h2[^>]*>.*?Frequently Asked Questions.*?<\/h2>/i);
  if (faqH2) {
    html = html.replace(faqH2[0], section + '\n' + faqH2[0]);
    writeFileSync(filePath, html);
    console.log(`UPDATED (before FAQ): ${page.slug}`);
    updated++;
    continue;
  }

  // Fallback: Insert before the gallery section
  const gallery = html.match(/<div class="cfw-gallery">/);
  if (gallery) {
    html = html.replace(gallery[0], section + '\n' + gallery[0]);
    writeFileSync(filePath, html);
    console.log(`UPDATED (before gallery): ${page.slug}`);
    updated++;
    continue;
  }

  // Fallback: Insert before </main>
  html = html.replace('</main>', section + '\n</main>');
  writeFileSync(filePath, html);
  console.log(`UPDATED (before </main>): ${page.slug}`);
  updated++;
}

console.log(`\n✅ Done: ${updated} updated, ${skipped} skipped`);
