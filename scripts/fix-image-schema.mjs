// Run: node scripts/fix-image-schema.mjs
// Replaces all ImageObject schemas with plain URL strings in ALL HTML files.
// Safe to re-run (idempotent).

import { readFileSync, writeFileSync } from 'fs';
import { globSync } from 'fs';
import { resolve } from 'path';

// Use glob from the installed package
import { glob } from 'glob';

const files = await glob('public/**/*.html');
// Also include root index.html and site.html
if (!files.includes('index.html')) files.push('index.html');

const pattern = /"image":\{"@type":"ImageObject","url":"([^"]+)"[^}]*\}/g;
const wpUrl = 'https://www.chicagofleetwraps.com/wp-content/themes/cfw-theme/assets/images/og-resource.jpg';
const goodUrl = 'https://www.chicagofleetwraps.com/images/cfw_truck_1.webp';

let totalFixed = 0;
let filesChanged = 0;

for (const file of files) {
  let html;
  try {
    html = readFileSync(file, 'utf-8');
  } catch { continue; }

  const before = (html.match(pattern) || []).length;
  let changed = false;

  // Replace ImageObject with plain URL string
  if (before > 0) {
    html = html.replace(/"image":\{"@type":"ImageObject","url":"([^"]+)"[^}]*\}/g, '"image":"$1"');
    totalFixed += before;
    changed = true;
  }

  // Fix dead WordPress URLs
  if (html.includes(wpUrl)) {
    html = html.replaceAll(wpUrl, goodUrl);
    changed = true;
  }

  if (changed) {
    writeFileSync(file, html);
    filesChanged++;
  }
}

console.log(`✅ Fixed ${totalFixed} ImageObject → plain URL across ${filesChanged} files.`);
