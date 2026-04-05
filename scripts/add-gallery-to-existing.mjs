#!/usr/bin/env node
/**
 * add-gallery-to-existing.mjs
 * 
 * Adds a 6-image gallery under the hero/trust bar to pages that already have
 * images but don't have the gallery-under-hero pattern. Also adds inline
 * figure images to text sections that lack them.
 */

import fs from 'fs';
import path from 'path';

const PUBLIC = path.resolve('public');

// Pages that were skipped by add-images-to-pages.mjs because they had 6+ images
// but they don't have the gallery-under-hero pattern
const PAGES_TO_FIX = [
  'contractor-vehicle-wraps-chicago',
  'delivery-fleet-wraps-chicago',
  'ev-wraps',
  'fleet-wraps-chicago',
  'food-truck-wraps-chicago',
  'hvac-van-wraps-chicago',
  'landscaping-truck-wraps-chicago',
  'moving-truck-wraps-chicago',
  'partial-vehicle-wraps-chicago',
  'plumbing-van-wraps-chicago',
  'sprinter',
  'truck-wraps-chicago',
  'van-wraps-chicago',
  'vehicle-wraps-chicago',
];

// Image pools by topic
const IMAGE_POOLS = {
  contractor: [
    '/images/studio/roza-contractors-box-truck-wrap.webp',
    '/images/studio/precision-today-transit-van-wrap.webp',
    '/images/arnold_electric_truck.webp',
    '/images/studio/pro-air-transit-van-wrap.webp',
    '/images/studio/puroclean-transit-van-wrap.webp',
    '/images/studio/oakbros-box-truck-wrap.webp',
    '/images/cfw_van_1.webp',
    '/images/cfw_truck_1.webp',
    '/images/studio/mh-equipment-cargo-van-wrap.webp',
    '/images/studio/precision-today-decals-only-wrap.webp',
  ],
  delivery: [
    '/images/studio/amazon-delivery-van-wrap.webp',
    '/images/studio/amazon-delivery-van-wrap-2.webp',
    '/images/studio/medxwaste-transit-van-wrap.webp',
    '/images/studio/medxwaste-transit-van-wrap-2.webp',
    '/images/studio/mh-equipment-cargo-van-wrap.webp',
    '/images/studio/mh-equipment-cargo-van-wrap-2.webp',
    '/images/cfw_van_1.webp',
    '/images/cfw_van_2.webp',
    '/images/studio/puroclean-transit-van-wrap.webp',
    '/images/studio/state-farm-car-wrap.webp',
  ],
  ev: [
    '/images/studio/rivian-ev-vehicle-wrap.webp',
    '/images/studio/rivian-ev-vehicle-wrap-2.webp',
    '/images/studio/rivian-rivian-full-wrap.webp',
    '/images/studio/matte-black-tesla-car-wrap.webp',
    '/images/studio/matte-black-tesla-ev-vehicle-wrap.webp',
    '/images/studio/multi-color-rivian-wrap.webp',
    '/images/studio/multi-color-rivian-wrap-2.webp',
    '/images/studio/rivian-pickup-truck-wrap.webp',
    '/images/blue_origin_launch_rivian.webp',
    '/images/studio/rivian-rivian-wrap.webp',
  ],
  fleet: [
    '/images/studio/multi-brand-multi-vehicle-wrap.webp',
    '/images/studio/state-farm-car-wrap.webp',
    '/images/studio/mh-equipment-cargo-van-wrap.webp',
    '/images/studio/precision-today-transit-van-wrap.webp',
    '/images/studio/amazon-delivery-van-wrap.webp',
    '/images/cfw_van_1.webp',
    '/images/cfw_van_2.webp',
    '/images/cfw_truck_1.webp',
    '/images/studio/puroclean-transit-van-wrap.webp',
    '/images/studio/oakbros-box-truck-wrap.webp',
  ],
  food: [
    '/images/studio/oakbros-box-truck-wrap.webp',
    '/images/studio/oakbros-box-truck-wrap-2.webp',
    '/images/studio/windy-city-movers-box-truck-wrap.webp',
    '/images/cfw_truck_1.webp',
    '/images/cfw_truck_2.webp',
    '/images/studio/roza-contractors-box-truck-wrap.webp',
    '/images/studio/multi-brand-multi-vehicle-wrap.webp',
    '/images/studio/precision-today-transit-van-wrap.webp',
    '/images/cfw_van_1.webp',
    '/images/studio/mh-equipment-cargo-van-wrap.webp',
  ],
  hvac: [
    '/images/studio/precision-today-transit-van-wrap.webp',
    '/images/studio/precision-today-transit-van-wrap-2.webp',
    '/images/studio/precision-today-decals-only-wrap.webp',
    '/images/studio/pro-air-transit-van-wrap.webp',
    '/images/studio/pro-air-suv-wrap.webp',
    '/images/arnold_electric_truck.webp',
    '/images/arnold_electric_van.webp',
    '/images/studio/puroclean-transit-van-wrap.webp',
    '/images/cfw_van_1.webp',
    '/images/studio/mh-equipment-cargo-van-wrap.webp',
  ],
  landscaping: [
    '/images/studio/roza-contractors-box-truck-wrap.webp',
    '/images/cfw_truck_1.webp',
    '/images/cfw_truck_2.webp',
    '/images/studio/oakbros-box-truck-wrap.webp',
    '/images/studio/pro-air-transit-van-wrap.webp',
    '/images/studio/precision-today-transit-van-wrap.webp',
    '/images/cfw_van_1.webp',
    '/images/studio/mh-equipment-cargo-van-wrap.webp',
    '/images/studio/multi-brand-multi-vehicle-wrap.webp',
    '/images/studio/puroclean-transit-van-wrap.webp',
  ],
  moving: [
    '/images/studio/windy-city-movers-box-truck-wrap.webp',
    '/images/studio/windy-city-movers-box-truck-wrap-2.webp',
    '/images/studio/oakbros-box-truck-wrap.webp',
    '/images/studio/oakbros-box-truck-wrap-2.webp',
    '/images/cfw_truck_1.webp',
    '/images/cfw_truck_2.webp',
    '/images/studio/roza-contractors-box-truck-wrap.webp',
    '/images/studio/stark-semi-truck-wrap.webp',
    '/images/studio/multi-brand-multi-vehicle-wrap.webp',
    '/images/cfw_van_1.webp',
  ],
  partial: [
    '/images/studio/precision-today-decals-only-wrap.webp',
    '/images/studio/state-farm-decals-only-wrap.webp',
    '/images/studio/ubs-decals-only-wrap.webp',
    '/images/studio/nike-logo-decals-only-wrap.webp',
    '/images/studio/national-bar-crawls-decals-only-wrap.webp',
    '/images/studio/red-decals-only-wrap.webp',
    '/images/cfw_van_1.webp',
    '/images/studio/precision-today-transit-van-wrap.webp',
    '/images/studio/mh-equipment-cargo-van-wrap.webp',
    '/images/studio/state-farm-car-wrap.webp',
  ],
  plumbing: [
    '/images/studio/precision-today-transit-van-wrap.webp',
    '/images/studio/precision-today-transit-van-wrap-2.webp',
    '/images/studio/pro-air-transit-van-wrap.webp',
    '/images/studio/puroclean-transit-van-wrap.webp',
    '/images/studio/puroclean-cargo-van-wrap.webp',
    '/images/arnold_electric_van.webp',
    '/images/cfw_van_1.webp',
    '/images/cfw_van_2.webp',
    '/images/studio/mh-equipment-cargo-van-wrap.webp',
    '/images/studio/medxwaste-transit-van-wrap.webp',
  ],
  sprinter: [
    '/images/studio/mh-equipment-cargo-van-wrap.webp',
    '/images/studio/mh-equipment-cargo-van-wrap-2.webp',
    '/images/studio/mh-equipment-cargo-van-wrap-3.webp',
    '/images/studio/mh-equipment-cargo-van-wrap-4.webp',
    '/images/studio/puroclean-cargo-van-wrap.webp',
    '/images/cfw_van_3.webp',
    '/images/studio/medxwaste-transit-van-wrap.webp',
    '/images/studio/precision-today-transit-van-wrap.webp',
    '/images/cfw_van_1.webp',
    '/images/studio/pro-air-transit-van-wrap.webp',
  ],
  truck: [
    '/images/studio/oakbros-box-truck-wrap.webp',
    '/images/studio/oakbros-box-truck-wrap-2.webp',
    '/images/studio/windy-city-movers-box-truck-wrap.webp',
    '/images/studio/roza-contractors-box-truck-wrap.webp',
    '/images/studio/stark-semi-truck-wrap.webp',
    '/images/cfw_truck_1.webp',
    '/images/cfw_truck_2.webp',
    '/images/cfw_truck_3.webp',
    '/images/studio/multi-brand-multi-vehicle-wrap.webp',
    '/images/studio/windy-city-movers-box-truck-wrap-2.webp',
  ],
  van: [
    '/images/studio/medxwaste-transit-van-wrap.webp',
    '/images/studio/precision-today-transit-van-wrap.webp',
    '/images/studio/pro-air-transit-van-wrap.webp',
    '/images/studio/puroclean-transit-van-wrap.webp',
    '/images/studio/puroclean-cargo-van-wrap.webp',
    '/images/studio/mh-equipment-cargo-van-wrap.webp',
    '/images/cfw_van_1.webp',
    '/images/cfw_van_2.webp',
    '/images/cfw_van_3.webp',
    '/images/studio/medxwaste-transit-van-wrap-2.webp',
  ],
  vehicle: [
    '/images/cfw_van_1.webp',
    '/images/cfw_van_2.webp',
    '/images/cfw_truck_1.webp',
    '/images/cfw_truck_2.webp',
    '/images/studio/matte-black-car-wrap.webp',
    '/images/studio/multi-color-car-wrap.webp',
    '/images/studio/rivian-ev-vehicle-wrap.webp',
    '/images/studio/precision-today-transit-van-wrap.webp',
    '/images/studio/oakbros-box-truck-wrap.webp',
    '/images/studio/state-farm-car-wrap.webp',
  ],
};

function getPool(slug) {
  if (slug.includes('contractor')) return IMAGE_POOLS.contractor;
  if (slug.includes('delivery')) return IMAGE_POOLS.delivery;
  if (slug.includes('ev-')) return IMAGE_POOLS.ev;
  if (slug.includes('food')) return IMAGE_POOLS.food;
  if (slug.includes('hvac')) return IMAGE_POOLS.hvac;
  if (slug.includes('landscap')) return IMAGE_POOLS.landscaping;
  if (slug.includes('moving')) return IMAGE_POOLS.moving;
  if (slug.includes('partial')) return IMAGE_POOLS.partial;
  if (slug.includes('plumb')) return IMAGE_POOLS.plumbing;
  if (slug.includes('sprinter')) return IMAGE_POOLS.sprinter;
  if (slug.includes('truck')) return IMAGE_POOLS.truck;
  if (slug.includes('van')) return IMAGE_POOLS.van;
  if (slug.includes('fleet')) return IMAGE_POOLS.fleet;
  return IMAGE_POOLS.vehicle;
}

function slugToTitle(slug) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function makeGalleryHTML(images, slug) {
  const title = slugToTitle(slug);
  const items = images.slice(0, 6).map(img => {
    const alt = path.basename(img, path.extname(img)).replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return `<div class="cfw-gallery-item"><img src="${img}" alt="${alt} — Chicago Fleet Wraps" loading="lazy" width="600" height="400"></div>`;
  }).join('\n');
  return `<div class="cfw-gallery cfw-gallery-cols-3" style="margin:24px 0">
${items}
</div>
<p style="text-align:center;color:rgba(255,255,255,.6);font-size:.88rem;margin-top:8px">Recent wrap projects by Chicago Fleet Wraps — serving ${title} and all of Chicagoland</p>`;
}

function makeFigureHTML(img, altContext) {
  const alt = path.basename(img, path.extname(img)).replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return `<figure class="supp-image-block" style="margin-top:24px"><img src="${img}" alt="${alt} — ${altContext}" loading="lazy" width="1200" height="420"><figcaption>${alt} — professional installation by Chicago Fleet Wraps · (312) 597-1286</figcaption></figure>`;
}

let updated = 0;

for (const slug of PAGES_TO_FIX) {
  const filePath = path.join(PUBLIC, slug, 'index.html');
  if (!fs.existsSync(filePath)) {
    console.log(`  skip ${slug}: file not found`);
    continue;
  }
  
  let html = fs.readFileSync(filePath, 'utf-8');
  
  // Already has gallery? Skip
  if (html.includes('cfw-gallery-cols-3')) {
    console.log(`  skip ${slug}: already has gallery`);
    continue;
  }
  
  // Get existing image srcs
  const existingImages = new Set();
  const imgRegex = /src="([^"]*\.(webp|jpg|png))"/gi;
  let m;
  while ((m = imgRegex.exec(html)) !== null) {
    existingImages.add(m[1]);
  }
  
  const pool = getPool(slug).filter(img => !existingImages.has(img));
  if (pool.length < 6) {
    console.log(`  skip ${slug}: not enough unique images (${pool.length})`);
    continue;
  }
  
  const galleryImages = pool.slice(0, 6);
  const figureImages = pool.slice(6);
  let imagesAdded = 0;
  
  // 1. Add gallery under trust bar or after hero
  const trustBarEnd = html.indexOf('</div>\n</section>', html.indexOf('class="trust"'));
  if (trustBarEnd > -1) {
    const gallery = '\n' + makeGalleryHTML(galleryImages, slug);
    html = html.substring(0, trustBarEnd) + gallery + html.substring(trustBarEnd);
    imagesAdded += 6;
  } else {
    // Find first section after hero
    const heroEnd = html.indexOf('</section>', html.indexOf('page-hero-banner'));
    if (heroEnd > -1) {
      const nextSection = html.indexOf('<section', heroEnd + 10);
      if (nextSection > -1) {
        const wDiv = html.indexOf('<div class="w">', nextSection);
        if (wDiv > -1) {
          const afterW = wDiv + '<div class="w">'.length;
          const gallery = '\n' + makeGalleryHTML(galleryImages, slug);
          html = html.substring(0, afterW) + gallery + html.substring(afterW);
          imagesAdded += 6;
        }
      }
    }
  }
  
  // 2. Add inline figures to sections without images
  const sectionRegex = /<section class="sec[^"]*">\s*<div class="w">([\s\S]*?)<\/div>\s*<\/section>/g;
  let figIdx = 0;
  
  html = html.replace(sectionRegex, (match) => {
    if (match.includes('<img') || match.includes('cfw-gallery') || match.includes('supp-image-block')) return match;
    if (match.length < 300) return match;
    if (match.includes('<iframe')) return match;
    
    if (figIdx < figureImages.length) {
      const img = figureImages[figIdx++];
      const figure = makeFigureHTML(img, slugToTitle(slug));
      const closingIdx = match.lastIndexOf('</div>');
      if (closingIdx > -1) {
        imagesAdded++;
        return match.substring(0, closingIdx) + '\n' + figure + '\n' + match.substring(closingIdx);
      }
    }
    return match;
  });
  
  if (imagesAdded > 0) {
    fs.writeFileSync(filePath, html);
    updated++;
    console.log(`✓ ${slug}: +${imagesAdded} images`);
  }
}

console.log(`\nUpdated: ${updated} pages`);
