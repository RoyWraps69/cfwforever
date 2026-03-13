// Run: node scripts/fix-image-object.mjs
// Replaces ImageObject schema with plain URL strings in site.html
// to resolve Google's "missing acquireLicensePage" warning.
import { readFileSync, writeFileSync } from 'fs';

const file = 'public/site.html';
let html = readFileSync(file, 'utf-8');

const before = (html.match(/"image":\{"@type":"ImageObject"/g) || []).length;

html = html.replaceAll(
  '"image":{"@type":"ImageObject","url":"https://www.chicagofleetwraps.com/wp-content/themes/cfw-theme/assets/images/og-resource.jpg","width":1200,"height":630}',
  '"image":"https://www.chicagofleetwraps.com/images/cfw_truck_1.webp"'
);

const after = (html.match(/"image":\{"@type":"ImageObject"/g) || []).length;
console.log(`Replaced ${before - after} ImageObject instances (${after} remaining)`);

writeFileSync(file, html);
console.log('Done.');
