#!/usr/bin/env node
/**
 * inject-image-geo.mjs
 * 
 * Injects ImageObject JSON-LD with contentLocation (geo-coordinates) into
 * all static HTML pages under public/. This associates photos with geographic
 * locations for Google Image Search ranking signals.
 * 
 * - Service/industry pages → Chicago HQ coordinates (41.9536, -87.7467)
 * - City pages → city-specific coordinates from geo.position meta tag
 * - Skips logo, favicon, and placeholder images
 * - Avoids license/acquireLicensePage fields (handled by fix-image-schema.mjs)
 * 
 * Usage: node scripts/inject-image-geo.mjs
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const BASE_URL = 'https://www.chicagofleetwraps.com';
const CHICAGO_HQ = { lat: 41.9536, lng: -87.7467, name: 'Chicago, IL' };

// Images to skip (logos, placeholders, icons)
const SKIP_IMAGES = ['logo-horizontal.png', 'logo-badge.png', 'logo-text.png', 'favicon.ico', 'placeholder.svg'];

// Schema marker to detect if already injected
const SCHEMA_MARKER = '"@type":"ImageObject","contentUrl"';

function extractImages(html) {
  const imgRegex = /img\s+[^>]*src="(\/images\/[^"]+)"/g;
  const images = [];
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1];
    const filename = path.basename(src);
    if (SKIP_IMAGES.includes(filename)) continue;
    // Skip video poster attributes that happen to match
    if (src.includes('.mp4')) continue;
    
    // Extract alt text
    const imgTag = html.substring(match.index, html.indexOf('>', match.index) + 1);
    const altMatch = imgTag.match(/alt="([^"]*)"/);
    const alt = altMatch ? altMatch[1] : `Vehicle wrap photo — Chicago Fleet Wraps`;
    
    images.push({ src, alt });
  }
  // Deduplicate by src
  const seen = new Set();
  return images.filter(img => {
    if (seen.has(img.src)) return false;
    seen.add(img.src);
    return true;
  });
}

function extractOgImage(html) {
  const match = html.match(/property="og:image"\s+content="([^"]+)"/);
  if (!match) return null;
  const url = match[1];
  // Convert absolute URL to relative path
  const relative = url.replace(BASE_URL, '');
  const filename = path.basename(relative);
  if (SKIP_IMAGES.includes(filename)) return null;
  return { src: relative, alt: 'Featured image — Chicago Fleet Wraps', absoluteUrl: url };
}

function extractGeoPosition(html) {
  const match = html.match(/name="geo\.position"\s+content="([^"]+)"/);
  if (!match) return null;
  const parts = match[1].split(';');
  if (parts.length !== 2) return null;
  return { lat: parseFloat(parts[0]), lng: parseFloat(parts[1]) };
}

function extractPlacename(html) {
  const match = html.match(/name="geo\.placename"\s+content="([^"]+)"/);
  return match ? match[1] : 'Chicago';
}

function extractPageTitle(html) {
  const match = html.match(/<title>([^<]+)<\/title>/);
  return match ? match[1].replace(' | Chicago Fleet Wraps', '') : '';
}

function buildImageObjectSchema(images, location) {
  const imageObjects = images.map(img => ({
    '@type': 'ImageObject',
    'contentUrl': `${BASE_URL}${img.src}`,
    'name': img.alt,
    'contentLocation': {
      '@type': 'Place',
      'name': location.name,
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': location.lat,
        'longitude': location.lng
      }
    }
  }));

  return {
    '@context': 'https://schema.org',
    '@graph': imageObjects
  };
}

async function main() {
  const htmlFiles = await glob('public/*/index.html');
  
  // Also include top-level pages
  if (fs.existsSync('public/site.html')) {
    htmlFiles.push('public/site.html');
  }

  let injected = 0;
  let skipped = 0;
  let noImages = 0;

  for (const filePath of htmlFiles.sort()) {
    const html = fs.readFileSync(filePath, 'utf-8');
    
    // Skip if already has ImageObject contentLocation schema
    if (html.includes(SCHEMA_MARKER)) {
      skipped++;
      continue;
    }

    // Skip non-content pages
    const dirName = path.basename(path.dirname(filePath));
    const skipDirs = ['css', 'js', 'images', 'elementor-hf', 'category', 'custom-sitemap', 'stats', 'vsads', 'hello-world'];
    if (skipDirs.includes(dirName)) {
      continue;
    }

    // Extract images from page body
    let images = extractImages(html);
    
    // If no body images, use og:image as fallback
    if (images.length === 0) {
      const ogImage = extractOgImage(html);
      if (ogImage) {
        images = [ogImage];
      }
    }

    if (images.length === 0) {
      noImages++;
      continue;
    }

    // Determine geo coordinates
    const geoPos = extractGeoPosition(html);
    const placename = extractPlacename(html);
    const location = geoPos
      ? { lat: geoPos.lat, lng: geoPos.lng, name: `${placename}, IL` }
      : { ...CHICAGO_HQ };

    // Build schema
    const schema = buildImageObjectSchema(images, location);
    const schemaTag = `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;

    // Inject before </head>
    const updatedHtml = html.replace('</head>', `${schemaTag}</head>`);
    
    if (updatedHtml === html) {
      console.warn(`⚠️  Could not find </head> in ${filePath}`);
      continue;
    }

    fs.writeFileSync(filePath, updatedHtml, 'utf-8');
    console.log(`✅ ${filePath} — ${images.length} image(s) geo-tagged to ${location.name} (${location.lat}, ${location.lng})`);
    injected++;
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Injected: ${injected} pages`);
  console.log(`   ⏭️  Already done: ${skipped} pages`);
  console.log(`   📷 No images: ${noImages} pages`);
}

main().catch(console.error);
