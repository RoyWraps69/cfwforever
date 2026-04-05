#!/usr/bin/env node
/**
 * add-images-to-pages.mjs
 * 
 * Adds a 6-image gallery under the hero/trust bar and spreads individual
 * figure images into text sections that currently have none.
 * Matches the wall wraps page gold standard.
 */

import fs from 'fs';
import path from 'path';

const PUBLIC = path.resolve('public');

// ─── Image Library ───────────────────────────────────────────────────────────
// Categorized images for intelligent matching based on page topic

const IMAGE_POOLS = {
  // Van wraps
  van: [
    '/images/studio/medxwaste-transit-van-wrap.webp',
    '/images/studio/medxwaste-transit-van-wrap-2.webp',
    '/images/studio/precision-today-transit-van-wrap.webp',
    '/images/studio/precision-today-transit-van-wrap-2.webp',
    '/images/studio/pro-air-transit-van-wrap.webp',
    '/images/studio/puroclean-transit-van-wrap.webp',
    '/images/studio/puroclean-cargo-van-wrap.webp',
    '/images/studio/mh-equipment-cargo-van-wrap.webp',
    '/images/studio/mh-equipment-cargo-van-wrap-2.webp',
    '/images/studio/mh-equipment-cargo-van-wrap-3.webp',
    '/images/studio/mh-equipment-cargo-van-wrap-4.webp',
    '/images/studio/mh-equipment-cargo-van-wrap-5.webp',
    '/images/cfw_van_1.webp',
    '/images/cfw_van_2.webp',
    '/images/cfw_van_3.webp',
  ],
  // Truck wraps
  truck: [
    '/images/studio/oakbros-box-truck-wrap.webp',
    '/images/studio/oakbros-box-truck-wrap-2.webp',
    '/images/studio/oakbros-box-truck-wrap-3.webp',
    '/images/studio/windy-city-movers-box-truck-wrap.webp',
    '/images/studio/windy-city-movers-box-truck-wrap-2.webp',
    '/images/studio/roza-contractors-box-truck-wrap.webp',
    '/images/studio/stark-semi-truck-wrap.webp',
    '/images/studio/stark-semi-truck-wrap-2.webp',
    '/images/cfw_truck_1.webp',
    '/images/cfw_truck_2.webp',
    '/images/cfw_truck_3.webp',
  ],
  // Car wraps / color change
  car: [
    '/images/studio/matte-black-car-wrap.webp',
    '/images/studio/matte-black-car-wrap-2.webp',
    '/images/studio/matte-black-car-wrap-3.webp',
    '/images/studio/multi-color-car-wrap.webp',
    '/images/studio/multi-color-car-wrap-2.webp',
    '/images/studio/multi-color-car-wrap-3.webp',
    '/images/studio/red-car-wrap.webp',
    '/images/studio/red-car-wrap-2.webp',
    '/images/studio/white-car-wrap.webp',
    '/images/studio/white-car-wrap-2.webp',
    '/images/studio/yellow-car-wrap.webp',
    '/images/studio/pink-car-wrap.webp',
    '/images/studio/pink-car-wrap-2.webp',
    '/images/audi_color_shift.webp',
    '/images/camaro_color_shift.webp',
    '/images/bmw_matte_black.webp',
  ],
  // SUV wraps
  suv: [
    '/images/studio/matte-black-suv-wrap.webp',
    '/images/studio/pro-air-suv-wrap.webp',
    '/images/studio/the-window-washing-wizard-suv-wrap.webp',
    '/images/studio/pink-jeep-suv-wrap.webp',
    '/images/studio/multi-color-rivian-suv-wrap.webp',
    '/images/studio/multi-color-rivian-suv-wrap-2.webp',
  ],
  // Ford Transit specific
  ford: [
    '/images/studio/precision-today-transit-van-wrap.webp',
    '/images/studio/precision-today-transit-van-wrap-2.webp',
    '/images/studio/medxwaste-transit-van-wrap.webp',
    '/images/studio/medxwaste-transit-van-wrap-2.webp',
    '/images/studio/pro-air-transit-van-wrap.webp',
    '/images/studio/puroclean-transit-van-wrap.webp',
    '/images/cfw_van_1.webp',
    '/images/cfw_van_2.webp',
  ],
  // Sprinter specific
  sprinter: [
    '/images/studio/mh-equipment-cargo-van-wrap.webp',
    '/images/studio/mh-equipment-cargo-van-wrap-2.webp',
    '/images/studio/mh-equipment-cargo-van-wrap-3.webp',
    '/images/studio/mh-equipment-cargo-van-wrap-4.webp',
    '/images/studio/puroclean-cargo-van-wrap.webp',
    '/images/cfw_van_3.webp',
  ],
  // Rivian / EV
  ev: [
    '/images/studio/rivian-ev-vehicle-wrap.webp',
    '/images/studio/rivian-ev-vehicle-wrap-2.webp',
    '/images/studio/rivian-pickup-truck-wrap.webp',
    '/images/studio/rivian-rivian-full-wrap.webp',
    '/images/studio/rivian-rivian-wrap.webp',
    '/images/studio/rivian-rivian-wrap-2.webp',
    '/images/studio/multi-color-rivian-wrap.webp',
    '/images/studio/multi-color-rivian-wrap-2.webp',
    '/images/studio/matte-black-tesla-car-wrap.webp',
    '/images/studio/matte-black-tesla-ev-vehicle-wrap.webp',
    '/images/blue_origin_launch_rivian.webp',
  ],
  // Tesla
  tesla: [
    '/images/studio/matte-black-tesla-car-wrap.webp',
    '/images/studio/matte-black-tesla-ev-vehicle-wrap.webp',
    '/images/studio/rivian-ev-vehicle-wrap.webp',
    '/images/studio/multi-color-car-wrap-4.webp',
    '/images/studio/multi-color-car-wrap-5.webp',
    '/images/studio/white-car-wrap-3.webp',
  ],
  // Pickup truck
  pickup: [
    '/images/studio/red-pickup-truck-wrap.webp',
    '/images/studio/pink-pickup-truck-wrap.webp',
    '/images/studio/rivian-pickup-truck-wrap.webp',
    '/images/studio/multi-color-rivian-pickup-truck-wrap.webp',
    '/images/studio/multi-color-rivian-pickup-truck-wrap-2.webp',
    '/images/studio/rivian-pickup-truck-vehicle-shell-wrap.webp',
  ],
  // Boat wraps
  boat: [
    '/images/studio/patron-boat-wrap.webp',
    '/images/studio/patron-boat-wrap-2.webp',
    '/images/studio/patron-boat-wrap-3.webp',
    '/images/studio/patron-tequila-boat-wrap.webp',
    '/images/boat.webp',
    '/images/studio/multi-brand-multi-vehicle-wrap.webp',
  ],
  // Wall wraps
  wall: [
    '/images/studio/aws-wall-wrap.webp',
    '/images/studio/geometric-pattern-wall-wrap.webp',
    '/images/studio/blue-wall-wrap.webp',
    '/images/studio/multi-color-wall-wrap.webp',
    '/images/studio/white-wall-wrap.webp',
    '/images/studio/matte-black-wall-wrap.webp',
    '/images/studio/multi-color-wall-wrap-2.webp',
    '/images/oakbros_wall_wrap.webp',
    '/images/balloon_museum_exterior.webp',
    '/images/balloon_museum_interior.webp',
  ],
  // Trailer wraps
  trailer: [
    '/images/studio/pro-water-trailer-wrap.webp',
    '/images/studio/state-farm-trailer-wrap.webp',
    '/images/studio/state-farm-trailer-wrap-2.webp',
    '/images/studio/stark-semi-truck-wrap.webp',
    '/images/studio/stark-semi-truck-wrap-2.webp',
    '/images/studio/multi-brand-multi-vehicle-wrap.webp',
  ],
  // HVAC / contractor / plumbing / electrician (service industry)
  service: [
    '/images/studio/precision-today-transit-van-wrap.webp',
    '/images/studio/precision-today-transit-van-wrap-2.webp',
    '/images/studio/precision-today-decals-only-wrap.webp',
    '/images/studio/pro-air-transit-van-wrap.webp',
    '/images/studio/pro-air-suv-wrap.webp',
    '/images/arnold_electric_truck.webp',
    '/images/arnold_electric_van.webp',
    '/images/studio/roza-contractors-box-truck-wrap.webp',
    '/images/studio/puroclean-transit-van-wrap.webp',
    '/images/studio/puroclean-cargo-van-wrap.webp',
  ],
  // Matte / satin / gloss / chrome / camo / holographic / carbon fiber (specialty vinyl)
  specialty: [
    '/images/studio/matte-black-car-wrap.webp',
    '/images/studio/matte-black-car-wrap-2.webp',
    '/images/studio/matte-black-suv-wrap.webp',
    '/images/bmw_matte_black.webp',
    '/images/studio/multi-color-car-wrap-6.webp',
    '/images/studio/multi-color-car-wrap-7.webp',
    '/images/audi_color_shift.webp',
    '/images/camaro_color_shift.webp',
  ],
  // Fleet / commercial
  fleet: [
    '/images/studio/mh-equipment-cargo-van-wrap.webp',
    '/images/studio/mh-equipment-cargo-van-wrap-2.webp',
    '/images/studio/state-farm-car-wrap.webp',
    '/images/studio/state-farm-car-wrap-2.webp',
    '/images/studio/amazon-delivery-van-wrap.webp',
    '/images/studio/amazon-delivery-van-wrap-2.webp',
    '/images/studio/multi-brand-multi-vehicle-wrap.webp',
    '/images/studio/precision-today-transit-van-wrap.webp',
    '/images/studio/puroclean-transit-van-wrap.webp',
    '/images/cfw_truck_1.webp',
    '/images/cfw_van_1.webp',
    '/images/cfw_van_2.webp',
  ],
  // City / neighborhood pages - general mix
  city: [
    '/images/cfw_van_1.webp',
    '/images/cfw_van_2.webp',
    '/images/cfw_van_3.webp',
    '/images/cfw_truck_1.webp',
    '/images/cfw_truck_2.webp',
    '/images/cfw_truck_3.webp',
    '/images/studio/precision-today-transit-van-wrap.webp',
    '/images/studio/mh-equipment-cargo-van-wrap.webp',
    '/images/studio/oakbros-box-truck-wrap.webp',
    '/images/studio/state-farm-car-wrap.webp',
    '/images/studio/multi-brand-multi-vehicle-wrap.webp',
    '/images/studio/pro-air-transit-van-wrap.webp',
    '/images/studio/matte-black-car-wrap.webp',
    '/images/studio/rivian-ev-vehicle-wrap.webp',
    '/images/wrap_install_closeup.webp',
  ],
  // Decals / lettering
  decals: [
    '/images/studio/precision-today-decals-only-wrap.webp',
    '/images/studio/national-bar-crawls-decals-only-wrap.webp',
    '/images/studio/nike-logo-decals-only-wrap.webp',
    '/images/studio/ubs-decals-only-wrap.webp',
    '/images/studio/ubs-decals-only-wrap-2.webp',
    '/images/studio/state-farm-decals-only-wrap.webp',
    '/images/studio/state-farm-decals-only-wrap-2.webp',
    '/images/studio/red-decals-only-wrap.webp',
    '/images/studio/mercedes-logo-chrome-decal.webp',
  ],
  // General fallback
  general: [
    '/images/cfw_van_1.webp',
    '/images/cfw_van_2.webp',
    '/images/cfw_truck_1.webp',
    '/images/cfw_truck_2.webp',
    '/images/studio/precision-today-transit-van-wrap.webp',
    '/images/studio/mh-equipment-cargo-van-wrap.webp',
    '/images/studio/oakbros-box-truck-wrap.webp',
    '/images/studio/matte-black-car-wrap.webp',
    '/images/studio/multi-color-car-wrap.webp',
    '/images/studio/rivian-ev-vehicle-wrap.webp',
    '/images/studio/state-farm-car-wrap.webp',
    '/images/studio/pro-air-transit-van-wrap.webp',
    '/images/wrap_install_closeup.webp',
    '/images/studio/multi-brand-multi-vehicle-wrap.webp',
    '/images/studio/amazon-delivery-van-wrap.webp',
  ],
};

// ─── Topic Detection ─────────────────────────────────────────────────────────

function detectTopic(slug) {
  const s = slug.toLowerCase();
  
  if (s.includes('wall') || s.includes('mural')) return 'wall';
  if (s.includes('boat')) return 'boat';
  if (s.includes('tesla')) return 'tesla';
  if (s.includes('rivian') || s.includes('ev-wrap') || s.includes('electric-vehicle')) return 'ev';
  if (s.includes('sprinter')) return 'sprinter';
  if (s.includes('ford-transit') || s.includes('ford-e-series') || s.includes('ford-f')) return 'ford';
  if (s.includes('chevy') || s.includes('silverado')) return 'pickup';
  if (s.includes('ram-promaster')) return 'van';
  if (s.includes('pickup') || s.includes('f350') || s.includes('f-350')) return 'pickup';
  if (s.includes('trailer')) return 'trailer';
  if (s.includes('box-truck') || s.includes('step-van') || s.includes('truck') || s.includes('freightliner') || s.includes('hino') || s.includes('isuzu')) return 'truck';
  if (s.includes('van-wrap') || s.includes('cargo-van')) return 'van';
  if (s.includes('hvac') || s.includes('plumb') || s.includes('electric') || s.includes('contractor') || s.includes('construction') || s.includes('landscap') || s.includes('moving')) return 'service';
  if (s.includes('fleet') || s.includes('commercial') || s.includes('delivery') || s.includes('amazon')) return 'fleet';
  if (s.includes('matte') || s.includes('satin') || s.includes('gloss') || s.includes('chrome') || s.includes('camo') || s.includes('holographic') || s.includes('carbon-fiber')) return 'specialty';
  if (s.includes('color-change') || s.includes('car-wrap') || s.includes('full-vehicle') || s.includes('partial-vehicle')) return 'car';
  if (s.includes('decal') || s.includes('lettering') || s.includes('spot-graphic')) return 'decals';
  if (s.includes('wrap-removal') || s.includes('ceramic') || s.includes('ppf') || s.includes('tint')) return 'car';
  
  // City / neighborhood pages
  const cityNames = ['chicago','naperville','aurora','joliet','evanston','schaumburg','bolingbrook',
    'des-plaines','downers-grove','elgin','elmhurst','tinley-park','wheaton','wilmette','skokie',
    'cicero','berwyn','arlington','oak-park','lincoln-park','lakeview','wicker-park','logan-square',
    'bucktown','pilsen','hyde-park','bridgeport','bronzeville','uptown','edgewater','andersonville',
    'rogers-park','avondale','humboldt','garfield','irving','jefferson','albany','austin','belmont',
    'dunning','forest-glen','hermosa','kenwood','south-loop','south-lawndale','ukrainian','gold-coast',
    'downtown','river-north','west-loop','ravenswood','north-center'];
  
  for (const city of cityNames) {
    if (s.includes(city)) return 'city';
  }
  
  return 'general';
}

function getImagesForPage(slug, existingImages) {
  const topic = detectTopic(slug);
  let pool = [...(IMAGE_POOLS[topic] || IMAGE_POOLS.general)];
  
  // Add some general variety images if pool is small
  if (pool.length < 12) {
    const extras = IMAGE_POOLS.general.filter(img => !pool.includes(img));
    pool.push(...extras.slice(0, 12 - pool.length));
  }
  
  // Filter out images already on the page
  const existingSet = new Set(existingImages);
  pool = pool.filter(img => !existingSet.has(img));
  
  // Shuffle deterministically based on slug
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
  }
  pool.sort((a, b) => {
    const ha = ((hash * 31 + a.length) ^ a.charCodeAt(a.length - 5)) & 0x7fffffff;
    const hb = ((hash * 31 + b.length) ^ b.charCodeAt(b.length - 5)) & 0x7fffffff;
    return ha - hb;
  });
  
  return pool;
}

// ─── HTML Manipulation ───────────────────────────────────────────────────────

function slugToTitle(slug) {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/\bChicago\b/i, 'Chicago')
    .replace(/\bIl\b/, 'IL');
}

function makeGalleryHTML(images, slug) {
  const title = slugToTitle(slug);
  const items = images.slice(0, 6).map(img => {
    const alt = path.basename(img, path.extname(img))
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
    return `<div class="cfw-gallery-item"><img src="${img}" alt="${alt} — Chicago Fleet Wraps" loading="lazy" width="600" height="400"></div>`;
  }).join('\n');
  
  return `<div class="cfw-gallery cfw-gallery-cols-3" style="margin:24px 0">
${items}
</div>
<p style="text-align:center;color:rgba(255,255,255,.6);font-size:.88rem;margin-top:8px">Recent vehicle wrap projects by Chicago Fleet Wraps — serving ${title} and all of Chicagoland</p>`;
}

function makeFigureHTML(img, altContext) {
  const alt = path.basename(img, path.extname(img))
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
  return `<figure class="supp-image-block" style="margin-top:24px"><img src="${img}" alt="${alt} — ${altContext}" loading="lazy" width="1200" height="420"><figcaption>${alt} — professional installation by Chicago Fleet Wraps · (312) 597-1286</figcaption></figure>`;
}

function processFile(filePath, slug) {
  let html = fs.readFileSync(filePath, 'utf-8');
  
  // Count existing body images
  const mainMatch = html.match(/<main[\s\S]*?<\/main>/i);
  if (!mainMatch) return { status: 'skip', reason: 'no main tag' };
  
  const mainContent = mainMatch[0];
  const existingImgCount = (mainContent.match(/<img/g) || []).length;
  
  // Skip if already has enough images (like wallwraps)
  if (existingImgCount >= 6) return { status: 'skip', reason: `already has ${existingImgCount} images` };
  
  // Extract existing image srcs to avoid duplicates
  const existingImages = [];
  const imgSrcRegex = /src="([^"]*\.(webp|jpg|png))"/gi;
  let m;
  while ((m = imgSrcRegex.exec(mainContent)) !== null) {
    existingImages.push(m[1]);
  }
  
  // Get topic-appropriate images
  const pool = getImagesForPage(slug, existingImages);
  if (pool.length < 6) return { status: 'skip', reason: 'not enough unique images' };
  
  let galleryImages = pool.slice(0, 6);
  let figureImages = pool.slice(6);
  
  let modified = html;
  let imagesAdded = 0;
  
  // 1. Add gallery under hero/trust bar
  // Find the first section.sec that contains the trust bar or is the first content section after hero
  const trustBarEnd = modified.indexOf('</div>\n</section>', modified.indexOf('class="trust"'));
  if (trustBarEnd > -1) {
    // Check if there's already a gallery in this section
    const trustSection = modified.substring(modified.lastIndexOf('<section', trustBarEnd), trustBarEnd + 20);
    if (!trustSection.includes('cfw-gallery')) {
      // Insert gallery before the closing </div></section> of the trust bar section
      const insertPoint = trustBarEnd;
      const gallery = '\n' + makeGalleryHTML(galleryImages, slug);
      modified = modified.substring(0, insertPoint) + gallery + modified.substring(insertPoint);
      imagesAdded += 6;
    }
  } else {
    // No trust bar — find the first section after hero and add gallery there
    const heroEnd = modified.indexOf('</section>', modified.indexOf('page-hero-banner'));
    if (heroEnd > -1) {
      const nextSectionStart = modified.indexOf('<section', heroEnd + 10);
      if (nextSectionStart > -1) {
        const nextSectionW = modified.indexOf('<div class="w">', nextSectionStart);
        if (nextSectionW > -1) {
          const afterW = nextSectionW + '<div class="w">'.length;
          // Find if there's content before the first heading
          const firstH2 = modified.indexOf('<div class="sh', afterW);
          if (firstH2 > -1 && firstH2 - afterW < 200) {
            // Insert gallery before the heading
            const gallery = '\n' + makeGalleryHTML(galleryImages, slug);
            modified = modified.substring(0, firstH2) + gallery + '\n' + modified.substring(firstH2);
            imagesAdded += 6;
          }
        }
      }
    }
  }
  
  // 2. Spread figure images into text sections that have no images
  // Find all section.sec blocks and add a figure to ones without images
  const sectionRegex = /<section class="sec[^"]*">\s*<div class="w">([\s\S]*?)<\/div>\s*<\/section>/g;
  let figIdx = 0;
  
  modified = modified.replace(sectionRegex, (match) => {
    // Skip if section already has an image
    if (match.includes('<img') || match.includes('cfw-gallery') || match.includes('supp-image-block')) {
      return match;
    }
    // Skip if section is too short (like CTA or map sections)
    if (match.length < 300) return match;
    // Skip FAQ sections (they're dense enough)
    if (match.includes('faq-item') && match.split('faq-item').length > 4) return match;
    // Skip sections with iframes (maps)
    if (match.includes('<iframe')) return match;
    
    if (figIdx < figureImages.length) {
      const img = figureImages[figIdx++];
      const altContext = slugToTitle(slug);
      const figure = makeFigureHTML(img, altContext);
      
      // Insert before the closing </div></section>
      const closingIdx = match.lastIndexOf('</div>');
      if (closingIdx > -1) {
        imagesAdded++;
        return match.substring(0, closingIdx) + '\n' + figure + '\n' + match.substring(closingIdx);
      }
    }
    return match;
  });
  
  if (imagesAdded === 0) return { status: 'skip', reason: 'no insertion points found' };
  
  fs.writeFileSync(filePath, modified);
  return { status: 'updated', imagesAdded };
}

// ─── Main ────────────────────────────────────────────────────────────────────

const SKIP_DIRS = new Set([
  'calculator', 'portfolio', 'before-after', 'visualizer', 'contact', 'estimate',
  '404', 'privacy', 'terms', 'wallwraps', 'wrap-calculator', 'vehicle-wrap-training-manual',
  'window-tinting-chicago'
]);

let updated = 0;
let skipped = 0;
let errors = 0;

const dirs = fs.readdirSync(PUBLIC, { withFileTypes: true });

function processDir(dirPath, slug) {
  const indexPath = path.join(dirPath, 'index.html');
  if (!fs.existsSync(indexPath)) return;
  
  // Skip special pages
  if (SKIP_DIRS.has(slug)) {
    skipped++;
    return;
  }
  
  // Skip tiny/redirect pages
  const stat = fs.statSync(indexPath);
  if (stat.size < 5000) {
    skipped++;
    return;
  }
  
  try {
    const result = processFile(indexPath, slug);
    if (result.status === 'updated') {
      updated++;
      console.log(`✓ ${slug}: +${result.imagesAdded} images`);
    } else {
      skipped++;
      if (result.reason !== 'no main tag') {
        // Only log interesting skips
        console.log(`  skip ${slug}: ${result.reason}`);
      }
    }
  } catch (err) {
    errors++;
    console.error(`✗ ${slug}: ${err.message}`);
  }
}

// Process root index.html (homepage) — skip it
// Process all subdirectories
for (const entry of dirs) {
  if (!entry.isDirectory()) continue;
  if (entry.name === 'css' || entry.name === 'js' || entry.name === 'images' || entry.name === 'fonts') continue;
  
  const dirPath = path.join(PUBLIC, entry.name);
  processDir(dirPath, entry.name);
  
  // Also process subdirectories (e.g., post/*, video/*)
  if (entry.name === 'post' || entry.name === 'video' || entry.name === 'author') {
    const subDirs = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const sub of subDirs) {
      if (sub.isDirectory()) {
        processDir(path.join(dirPath, sub.name), `${entry.name}/${sub.name}`);
      }
    }
  }
}

console.log(`\n=== Summary ===`);
console.log(`Updated: ${updated}`);
console.log(`Skipped: ${skipped}`);
console.log(`Errors: ${errors}`);
