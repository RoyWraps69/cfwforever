#!/usr/bin/env node
/**
 * fix-hero-assignments.mjs
 * Reassign hero images to match page topics and fix object-position for proper framing.
 * Sprinter pages get sprinter images, box truck pages get box truck images, etc.
 */
import fs from 'fs';
import path from 'path';

// ── IMAGE POOLS BY VEHICLE/TOPIC TYPE ──
const IMAGES = {
  sprinter: [
    '/images/studio/precision-today-transit-van-wrap.webp',
    '/images/studio/precision-today-transit-van-wrap-2.webp',
    '/images/studio/pro-air-transit-van-wrap.webp',
    '/images/studio/medxwaste-transit-van-wrap.webp',
    '/images/studio/dp-dough-transit-van-wrap.webp',
    '/images/studio/arnold-electric-transit-van-wrap.webp',
  ],
  box_truck: [
    '/images/windy_city_box_truck_hero.webp',
    '/images/studio/oakbros-box-truck-wrap.webp',
    '/images/studio/windy-city-movers-box-truck-wrap.webp',
    '/images/studio/autonation-mobile-service-box-truck-wrap.webp',
    '/images/studio/matte-black-box-truck-wrap.webp',
    '/images/studio/chestnut-health-systems-box-truck-wrap.webp',
    '/images/studio/roza-contractors-box-truck-wrap.webp',
  ],
  cargo_van: [
    '/images/studio/improovy-painters-cargo-van-wrap.webp',
    '/images/studio/mh-equipment-cargo-van-wrap.webp',
    '/images/studio/puroclean-cargo-van-wrap.webp',
    '/images/studio/improovy-painters-cargo-van-wrap-2.webp',
    '/images/studio/mh-equipment-cargo-van-wrap-2.webp',
  ],
  tesla: [
    '/images/color_change_tesla.webp',
    '/images/studio/matte-black-tesla-car-wrap.webp',
    '/images/studio/matte-black-tesla-ev-vehicle-wrap.webp',
    '/images/studio/green-tesla-cybertruck-wrap.webp',
    '/images/tesla_cybertruck.webp',
  ],
  rivian: [
    '/images/rivian_rad.webp',
    '/images/rivian_blue_holographic.webp',
    '/images/studio/blue-origin-rivian-wrap.webp',
    '/images/studio/rivian-rivian-full-wrap.webp',
    '/images/studio/multi-color-rivian-pickup-truck-wrap.webp',
    '/images/studio/blue-rivian-ev-vehicle-wrap.webp',
  ],
  pickup_truck: [
    '/images/studio/blue-ram-pickup-truck-wrap.webp',
    '/images/studio/central-illinois-detailing-pickup-truck-wrap.webp',
    '/images/studio/green-pickup-truck-wrap.webp',
    '/images/studio/red-pickup-truck-wrap.webp',
    '/images/studio/pink-pickup-truck-wrap.webp',
    '/images/studio/blue-matte-black-pickup-truck-wrap.webp',
  ],
  car: [
    '/images/studio/blue-car-full-wrap.webp',
    '/images/studio/holographic-car-wrap.webp',
    '/images/studio/chrome-car-wrap.webp',
    '/images/studio/carbon-fiber-car-wrap.webp',
    '/images/studio/lightning-car-wrap.webp',
    '/images/studio/red-car-wrap.webp',
  ],
  color_change: [
    '/images/color_change_tesla.webp',
    '/images/studio/holographic-car-wrap.webp',
    '/images/studio/chrome-car-wrap.webp',
    '/images/studio/multi-color-car-wrap.webp',
    '/images/sandals_color_change.webp',
  ],
  matte: [
    '/images/studio/matte-black-car-wrap.webp',
    '/images/studio/matte-black-suv-wrap.webp',
    '/images/studio/matte-black-tesla-car-wrap.webp',
    '/images/studio/matte-black-box-truck-wrap.webp',
  ],
  chrome: [
    '/images/studio/chrome-car-wrap.webp',
    '/images/studio/holographic-car-wrap.webp',
    '/images/studio/mercedes-logo-chrome-decal.webp',
  ],
  satin: [
    '/images/studio/blue-car-full-wrap.webp',
    '/images/studio/blue-car-wrap.webp',
    '/images/studio/blue-dodge-car-wrap.webp',
  ],
  suv: [
    '/images/studio/gmc-yukon-suv-wrap.webp',
    '/images/studio/matte-black-suv-wrap.webp',
    '/images/studio/pink-jeep-suv-wrap.webp',
    '/images/studio/koch-construction-suv-wrap.webp',
    '/images/studio/multi-color-rivian-suv-wrap.webp',
    '/images/studio/pro-air-suv-wrap.webp',
  ],
  trailer: [
    '/images/studio/state-farm-trailer-wrap.webp',
    '/images/studio/state-farm-trailer-wrap-2.webp',
    '/images/studio/pro-water-trailer-wrap.webp',
  ],
  semi_truck: [
    '/images/studio/chicago-fleet-wraps-semi-truck-wrap.webp',
    '/images/studio/stark-semi-truck-wrap.webp',
    '/images/studio/stark-semi-truck-wrap-2.webp',
  ],
  boat: [
    '/images/studio/1800-tequila-boat-wrap.webp',
    '/images/studio/patron-boat-wrap.webp',
    '/images/studio/fiesta-vee-320-boat-wrap.webp',
    '/images/studio/patron-tequila-boat-wrap.webp',
  ],
  wall: [
    '/images/studio/aws-wall-wrap.webp',
    '/images/studio/blue-wall-wrap.webp',
    '/images/studio/geometric-pattern-wall-wrap.webp',
    '/images/studio/multi-color-wall-wrap.webp',
    '/images/studio/white-wall-wrap.webp',
  ],
  decals: [
    '/images/studio/amazon-decals-only-wrap.webp',
    '/images/studio/boeing-decals-only-wrap.webp',
    '/images/studio/chanelles-childcare-decals-only-wrap.webp',
    '/images/studio/national-bar-crawls-decals-only-wrap.webp',
    '/images/studio/arnold-electric-decals-only-wrap.webp',
  ],
  rv: [
    '/images/studio/gene-simmons-axe-rv-wrap.webp',
    '/images/studio/gene-simmons-axe-rv-wrap-2.webp',
  ],
  fleet: [
    '/images/studio/multi-brand-multi-vehicle-wrap.webp',
    '/images/cfw_van_1.webp',
    '/images/studio/amazon-prime-ev-vehicle-wrap.webp',
    '/images/studio/state-farm-car-wrap.webp',
  ],
  ev: [
    '/images/studio/amazon-prime-ev-vehicle-wrap.webp',
    '/images/studio/blue-rivian-ev-vehicle-wrap.webp',
    '/images/studio/matte-black-tesla-ev-vehicle-wrap.webp',
    '/images/studio/green-tesla-cybertruck-wrap.webp',
  ],
  contractor: [
    '/images/exalt_air_pick_up_truck.webp',
    '/images/studio/roza-contractors-box-truck-wrap.webp',
    '/images/studio/koch-construction-suv-wrap.webp',
    '/images/arnold_electric_van.webp',
  ],
  hvac: [
    '/images/precision_today_hvac.webp',
    '/images/sbc_hvac_van.webp',
    '/images/studio/pro-air-transit-van-wrap.webp',
    '/images/studio/pro-air-suv-wrap.webp',
  ],
  plumbing: [
    '/images/arnold_electric_van.webp',
    '/images/studio/arnold-electric-transit-van-wrap.webp',
    '/images/studio/arnold-electric-transit-van-wrap-2.webp',
  ],
  electrician: [
    '/images/arnold_electric_van.webp',
    '/images/arnold_electric_truck.webp',
    '/images/studio/arnold-electric-transit-van-wrap.webp',
    '/images/studio/arnold-electric-decals-only-wrap.webp',
  ],
  food: [
    '/images/studio/dp-dough-transit-van-wrap.webp',
    '/images/blondies_beef_truck.webp',
    '/images/hunt_brothers_pizza_truck.webp',
    '/images/studio/crawfords-corner-pub-car-wrap.webp',
  ],
  // Generic fallback for city/neighborhood pages - use a variety
  generic_commercial: [
    '/images/cfw_van_1.webp',
    '/images/cfw_van_2.webp',
    '/images/cfw_van_3.webp',
    '/images/cfw_truck_1.webp',
    '/images/cfw_truck_2.webp',
    '/images/cfw_truck_3.webp',
    '/images/studio/multi-brand-multi-vehicle-wrap.webp',
    '/images/studio/improovy-painters-cargo-van-wrap.webp',
    '/images/studio/state-farm-car-wrap.webp',
    '/images/studio/blue-car-full-wrap.webp',
  ],
};

// ── PAGE-TO-IMAGE MAPPING RULES ──
// Explicit overrides for specific pages
const EXPLICIT_MAP = {
  // Sprinter pages
  'sprinter': '/images/studio/precision-today-transit-van-wrap.webp',
  'sprinter-van-wraps': '/images/studio/arnold-electric-transit-van-wrap.webp',
  'sprinter-van-wrap-cost': '/images/studio/medxwaste-transit-van-wrap.webp',
  'sprinter-high-roof-wrap-chicago': '/images/studio/pro-air-transit-van-wrap.webp',
  // Box truck pages
  'box-truck-wraps-chicago': '/images/studio/oakbros-box-truck-wrap.webp',
  'box-truck-wrap-cost-chicago': '/images/studio/windy-city-movers-box-truck-wrap.webp',
  'step-van-wrap-chicago': '/images/studio/autonation-mobile-service-box-truck-wrap.webp',
  // Tesla pages
  'tesla-wrap-chicago': '/images/color_change_tesla.webp',
  'tesla-wraps-chicago': '/images/studio/matte-black-tesla-car-wrap.webp',
  // Rivian pages
  'rivian-wrap-chicago': '/images/rivian_blue_holographic.webp',
  'rivian-wraps-chicago': '/images/studio/rivian-rivian-full-wrap.webp',
  'rivian-fleet-wrap-illinois': '/images/studio/blue-origin-rivian-wrap.webp',
  // Pickup truck pages
  'pickup-truck-wraps': '/images/studio/blue-ram-pickup-truck-wrap.webp',
  'pickup-truck': '/images/studio/central-illinois-detailing-pickup-truck-wrap.webp',
  // Car wrap pages
  'car-wraps-chicago': '/images/studio/blue-car-full-wrap.webp',
  'color-change-wraps-chicago': '/images/studio/holographic-car-wrap.webp',
  'matte-vehicle-wraps': '/images/studio/matte-black-car-wrap.webp',
  'chrome-wraps-chicago': '/images/studio/chrome-car-wrap.webp',
  'satin-wraps-chicago': '/images/studio/blue-car-wrap.webp',
  // Van pages
  'van-wraps-chicago': '/images/studio/improovy-painters-cargo-van-wrap.webp',
  'cargo-van-wraps-chicago': '/images/studio/mh-equipment-cargo-van-wrap.webp',
  // Trailer pages
  'trailer-wraps-chicago': '/images/studio/state-farm-trailer-wrap.webp',
  // Semi truck
  'semi-truck-wraps-chicago': '/images/studio/chicago-fleet-wraps-semi-truck-wrap.webp',
  // Boat pages
  'boat-wraps-chicago': '/images/studio/patron-boat-wrap.webp',
  // Wall wraps
  'wallwraps': '/images/studio/aws-wall-wrap.webp',
  // Decals
  'custom-decals-chicago': '/images/studio/amazon-decals-only-wrap.webp',
  'decals-and-lettering': '/images/studio/boeing-decals-only-wrap.webp',
  // EV pages
  'ev-fleet-wraps-chicago': '/images/studio/amazon-prime-ev-vehicle-wrap.webp',
  'electric-vehicle-wraps-chicago': '/images/studio/blue-rivian-ev-vehicle-wrap.webp',
  // Industry pages
  'contractor-vehicle-wraps-chicago': '/images/exalt_air_pick_up_truck.webp',
  'hvac-van-wraps-chicago': '/images/precision_today_hvac.webp',
  'plumbing-van-wraps-chicago': '/images/studio/arnold-electric-transit-van-wrap-2.webp',
  'electrician-van-wraps-chicago': '/images/arnold_electric_van.webp',
  'food-truck-wraps-chicago': '/images/studio/dp-dough-transit-van-wrap.webp',
  'landscaping-truck-wraps-chicago': '/images/studio/green-pickup-truck-wrap.webp',
  'pest-control-wraps-chicago': '/images/studio/improovy-painters-cargo-van-wrap-2.webp',
  'cleaning-service-wraps-chicago': '/images/studio/puroclean-cargo-van-wrap.webp',
  'moving-company-wraps-chicago': '/images/studio/windy-city-movers-box-truck-wrap-2.webp',
  'real-estate-vehicle-wraps': '/images/studio/state-farm-car-wrap.webp',
  'nonprofit-vehicle-wraps': '/images/studio/chanelles-childcare-decals-only-wrap.webp',
  // Specific vehicle model pages
  'ford-transit-wrap-chicago': '/images/studio/medxwaste-transit-van-wrap-2.webp',
  'ford-e-transit-wrap-chicago': '/images/studio/amazon-prime-ev-vehicle-wrap.webp',
  'ford-f150-wrap-chicago': '/images/studio/red-pickup-truck-wrap.webp',
  'ford-f250-wrap-chicago': '/images/studio/blue-matte-black-pickup-truck-wrap.webp',
  'ford-f350-wrap-chicago': '/images/studio/central-illinois-detailing-pickup-truck-wrap-2.webp',
  'ford-ranger-wrap-chicago': '/images/studio/green-pickup-truck-wrap.webp',
  'ford-maverick-wrap-chicago': '/images/studio/pink-pickup-truck-wrap.webp',
  'ford-econoline-wrap-chicago': '/images/studio/mh-equipment-cargo-van-wrap-3.webp',
  'chevy-express-wrap-chicago': '/images/studio/improovy-painters-cargo-van-wrap-3.webp',
  'chevy-silverado-wrap-chicago': '/images/studio/blue-ram-pickup-truck-wrap.webp',
  'chevy-colorado-wrap-chicago': '/images/studio/central-illinois-detailing-pickup-truck-wrap-3.webp',
  'gmc-savana-wrap-chicago': '/images/studio/mh-equipment-cargo-van-wrap-4.webp',
  'gmc-sierra-wrap-chicago': '/images/studio/red-pickup-truck-wrap.webp',
  'ram-promaster-wrap-chicago': '/images/studio/dp-dough-transit-van-wrap-2.webp',
  'ram-promaster-city-wrap-chicago': '/images/studio/puroclean-transit-van-wrap.webp',
  'ram-1500-wrap-chicago': '/images/studio/blue-ram-pickup-truck-wrap.webp',
  'nissan-nv-wrap-chicago': '/images/studio/mh-equipment-cargo-van-wrap-5.webp',
  'toyota-tacoma-wrap-chicago': '/images/studio/green-pickup-truck-wrap.webp',
  'freightliner-m2-wrap-chicago': '/images/studio/chestnut-health-systems-box-truck-wrap.webp',
  'hino-truck-wrap-chicago': '/images/studio/roza-contractors-box-truck-wrap.webp',
  'isuzu-npr-wrap-chicago': '/images/studio/matte-black-box-truck-wrap.webp',
  'international-cv-wrap-chicago': '/images/studio/autonation-mobile-service-box-truck-wrap.webp',
  // Service pages
  'full-vehicle-wraps-chicago': '/images/studio/blue-car-full-wrap.webp',
  'partial-vehicle-wraps-chicago': '/images/studio/state-farm-decals-only-wrap.webp',
  'partial-vehicle-wraps': '/images/studio/national-bar-crawls-decals-only-wrap.webp',
  'fleet-wraps-chicago': '/images/studio/multi-brand-multi-vehicle-wrap.webp',
  'fleet-graphics-chicago': '/images/studio/amazon-prime-ev-vehicle-wrap.webp',
  'vehicle-wraps-chicago': '/images/studio/blue-car-full-wrap.webp',
  'vinyl-wrap-chicago': '/images/studio/carbon-fiber-car-wrap.webp',
  'wrap-removal': '/images/studio/none-car-wrap.webp',
  'vinyl-wrap-removal': '/images/studio/none-car-wrap-2.webp',
  'paint-protection-film-ppf': '/images/studio/white-car-wrap.webp',
  'window-tinting-chicago': '/images/studio/blue-dodge-car-wrap.webp',
  'one-day-wraps': '/images/studio/red-car-wrap-2.webp',
  'signsandgraphics': '/images/studio/lingmelia-tattoo-shop-photo-wrap.webp',
  // Comparison pages
  'vehicle-wraps-vs-billboards-chicago': '/images/studio/multi-brand-multi-vehicle-wrap.webp',
  'vehicle-wraps-vs-facebook-ads-chicago': '/images/studio/state-farm-car-wrap-2.webp',
  'vehicle-wraps-vs-magnetic-signs': '/images/studio/arnold-electric-decals-only-wrap-2.webp',
  'vehicle-wraps-vs-painted-trucks': '/images/studio/blue-chevy-car-wrap.webp',
  'vehicle-wraps-vs-radio-ads-chicago': '/images/studio/golden-tixx-car-wrap.webp',
  // Blog posts
  'post/fleet-wrap-roi-for-contractors': '/images/studio/roza-contractors-box-truck-wrap.webp',
  'post/cargo-van-wraps-small-business-chicago-guide': '/images/studio/improovy-painters-cargo-van-wrap.webp',
  'post/cargo-van-wraps-small-businesses-chicago-guide': '/images/studio/mh-equipment-cargo-van-wrap.webp',
  'post/cargo-van-wraps-small-businesses-chicago': '/images/studio/puroclean-cargo-van-wrap.webp',
  'post/chicago-trailer-wraps-mobile-advertising-fleet-branding': '/images/studio/state-farm-trailer-wrap.webp',
  'post/suv-wraps-business-branding-chicago-sales-real-estate': '/images/studio/gmc-yukon-suv-wrap.webp',
  'post/chicago-emergency-vehicle-wraps-first-responder-graphics': '/images/studio/red-car-wrap-3.webp',
  'post/chicago-window-graphics-perforated-vinyl-commercial-vehicles-storefronts': '/images/studio/blue-dodge-car-wrap-2.webp',
  'post/how-much-does-a-car-wrap-cost': '/images/studio/multi-color-car-wrap-2.webp',
  'post/what-is-the-downside-of-wrapping-a-car': '/images/studio/white-car-wrap-2.webp',
  'post/vehicle-wrap-vs-paint-cost': '/images/studio/yellow-car-wrap.webp',
  'post/full-wrap-vs-partial-wrap': '/images/studio/red-black-car-wrap.webp',
  'post/how-long-do-vehicle-wraps-last': '/images/studio/blue-car-wrap-3.webp',
  'post/top-benefits-of-custom-decals': '/images/studio/nike-logo-decals-only-wrap.webp',
  'post/best-vinyl-for-commercial-vehicle-wraps': '/images/studio/multi-color-car-wrap-3.webp',
  'post/3m-vinyl-wraps-chicago-fleet': '/images/studio/corn-belt-energy-car-wrap.webp',
  'post/3m-vs-avery-dennison-vehicle-wraps': '/images/studio/multi-color-car-wrap-4.webp',
  'post/5-tips-for-designing-effective-vehicle-branding-for-your-fleet': '/images/studio/multi-brand-multi-vehicle-wrap.webp',
  'post/chicago-vehicle-wraps-vs-traditional-advertising': '/images/studio/state-farm-car-wrap.webp',
  // Video pages
  'video/arnold-electric-fleet-wrap-review': '/images/arnold_electric_van.webp',
  'video/oak-bros-wall-wrap-review': '/images/studio/oakbros-box-truck-wrap-2.webp',
};

// Keyword-based fallback matching for pages not in EXPLICIT_MAP
function getImageForPage(slug) {
  // Check explicit map first
  if (EXPLICIT_MAP[slug]) return EXPLICIT_MAP[slug];

  const s = slug.toLowerCase();

  // Vehicle type keywords
  if (s.includes('sprinter') || s.includes('transit-van')) return pickRandom(IMAGES.sprinter);
  if (s.includes('box-truck') || s.includes('step-van')) return pickRandom(IMAGES.box_truck);
  if (s.includes('cargo-van')) return pickRandom(IMAGES.cargo_van);
  if (s.includes('tesla') || s.includes('cybertruck')) return pickRandom(IMAGES.tesla);
  if (s.includes('rivian')) return pickRandom(IMAGES.rivian);
  if (s.includes('pickup') || s.includes('f150') || s.includes('f250') || s.includes('f350') || s.includes('silverado') || s.includes('sierra') || s.includes('ram-1500') || s.includes('tacoma') || s.includes('ranger') || s.includes('maverick') || s.includes('colorado')) return pickRandom(IMAGES.pickup_truck);
  if (s.includes('semi-truck') || s.includes('freightliner') || s.includes('international-cv')) return pickRandom(IMAGES.semi_truck);
  if (s.includes('trailer')) return pickRandom(IMAGES.trailer);
  if (s.includes('boat')) return pickRandom(IMAGES.boat);
  if (s.includes('rv-') || s.includes('-rv')) return pickRandom(IMAGES.rv);
  if (s.includes('suv') || s.includes('yukon') || s.includes('jeep')) return pickRandom(IMAGES.suv);
  if (s.includes('wall') || s.includes('mural')) return pickRandom(IMAGES.wall);
  if (s.includes('decal') || s.includes('lettering')) return pickRandom(IMAGES.decals);

  // Style keywords
  if (s.includes('matte')) return pickRandom(IMAGES.matte);
  if (s.includes('chrome')) return pickRandom(IMAGES.chrome);
  if (s.includes('satin')) return pickRandom(IMAGES.satin);
  if (s.includes('color-change') || s.includes('color_change')) return pickRandom(IMAGES.color_change);

  // Industry keywords
  if (s.includes('contractor')) return pickRandom(IMAGES.contractor);
  if (s.includes('hvac') || s.includes('heating') || s.includes('cooling')) return pickRandom(IMAGES.hvac);
  if (s.includes('plumb')) return pickRandom(IMAGES.plumbing);
  if (s.includes('electric')) return pickRandom(IMAGES.electrician);
  if (s.includes('food') || s.includes('pizza') || s.includes('catering') || s.includes('restaurant')) return pickRandom(IMAGES.food);
  if (s.includes('ev-') || s.includes('electric-vehicle')) return pickRandom(IMAGES.ev);
  if (s.includes('fleet')) return pickRandom(IMAGES.fleet);

  // Service keywords
  if (s.includes('car-wrap') || s.includes('vehicle-wrap') || s.includes('vinyl-wrap') || s.includes('full-wrap') || s.includes('partial-wrap')) return pickRandom(IMAGES.car);

  // Default for city/neighborhood/generic pages - use generic commercial
  return pickRandom(IMAGES.generic_commercial);
}

let usedImages = new Set();
function pickRandom(arr) {
  // Try to pick one not yet used
  const unused = arr.filter(i => !usedImages.has(i));
  if (unused.length > 0) {
    const pick = unused[Math.floor(Math.random() * unused.length)];
    usedImages.add(pick);
    return pick;
  }
  // All used, just pick random
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── PROCESS ALL PAGES ──
const publicDir = path.join(process.cwd(), 'public');
let fixed = 0;
let skipped = 0;
let errors = 0;

function processFile(filePath) {
  const relDir = path.relative(publicDir, path.dirname(filePath));
  let html = fs.readFileSync(filePath, 'utf8');

  // Skip pages without hero banner
  if (!html.includes('page-hero-banner')) {
    return;
  }

  // Extract current hero image
  const heroMatch = html.match(/page-hero-banner[\s\S]*?<\/section>/);
  if (!heroMatch) return;

  const heroSection = heroMatch[0];
  const imgMatch = heroSection.match(/src="([^"]+)"/);
  if (!imgMatch) return;

  const currentImg = imgMatch[1];
  const newImg = getImageForPage(relDir);

  // Check if new image file exists
  const newImgPath = path.join(publicDir, newImg);
  if (!fs.existsSync(newImgPath)) {
    console.log(`  WARN: Image not found: ${newImg} for ${relDir}`);
    errors++;
    return;
  }

  // Replace the image src
  if (currentImg !== newImg) {
    // Replace the src in the hero section only (first img src after page-hero-banner)
    const heroStart = html.indexOf('page-hero-banner');
    const heroEnd = html.indexOf('</section>', heroStart);
    const heroPart = html.substring(heroStart, heroEnd);
    const newHeroPart = heroPart.replace(`src="${currentImg}"`, `src="${newImg}"`);
    html = html.substring(0, heroStart) + newHeroPart + html.substring(heroEnd);
  }

  // Fix object-position: use "center center" for most, "center 30%" for trucks/vans to show the vehicle better
  const s = relDir.toLowerCase();
  let objPos = 'center center';
  if (s.includes('truck') || s.includes('van') || s.includes('sprinter') || s.includes('transit') || s.includes('cargo') || s.includes('box')) {
    objPos = 'center 40%';
  } else if (s.includes('car') || s.includes('sedan') || s.includes('coupe')) {
    objPos = 'center 50%';
  }

  // Update object-position in the hero img style
  html = html.replace(
    /(page-hero-banner[\s\S]*?<img[^>]*style="[^"]*?)object-position:\s*[^;"]+([\s\S]*?")/,
    `$1object-position:${objPos}$2`
  );

  fs.writeFileSync(filePath, html);
  if (currentImg !== newImg) {
    console.log(`  ${relDir}: ${currentImg} → ${newImg}`);
    fixed++;
  } else {
    skipped++;
  }
}

// Find all index.html files
function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.name === 'index.html') {
      try {
        processFile(fullPath);
      } catch (e) {
        console.log(`  ERROR: ${fullPath}: ${e.message}`);
        errors++;
      }
    }
  }
}

console.log('=== Reassigning hero images by page topic ===');
walkDir(publicDir);
console.log(`\n=== DONE: ${fixed} reassigned, ${skipped} already correct, ${errors} errors ===`);
