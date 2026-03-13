// Run: node scripts/fix-image-schema.mjs
// Replaces all ImageObject schemas with plain URL strings directly in source HTML.
// This is a one-time fix — safe to re-run (idempotent).

import { readFileSync, writeFileSync } from 'fs';

const file = 'public/site.html';
let html = readFileSync(file, 'utf-8');

const pattern = /"image":\{"@type":"ImageObject","url":"([^"]+)"[^}]*\}/g;
const before = (html.match(pattern) || []).length;

// Replace ImageObject with plain URL string
html = html.replace(/"image":\{"@type":"ImageObject","url":"([^"]+)"[^}]*\}/g, '"image":"$1"');

// Also fix dead WordPress URLs to real asset paths  
html = html.replaceAll(
  'https://www.chicagofleetwraps.com/wp-content/themes/cfw-theme/assets/images/og-resource.jpg',
  'https://www.chicagofleetwraps.com/images/cfw_truck_1.webp'
);

const after = (html.match(/"image":\{"@type":"ImageObject"/g) || []).length;
console.log(`Fixed ${before} ImageObject → plain URL (${after} remaining)`);

writeFileSync(file, html);
console.log('✅ site.html updated.');
