#!/usr/bin/env node
/**
 * fix-hero-images.mjs
 * 
 * Strips <picture><source srcset="...avif" .../><img .../></picture> wrappers
 * and replaces them with just the <img> tag (webp fallback).
 * 
 * This fixes hero images that reference non-existent .avif files,
 * causing the hero background to not render.
 */

import fs from 'fs';
import path from 'path';

const PUBLIC = path.resolve('public');
let fixed = 0;
let skipped = 0;

function findHtmlFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findHtmlFiles(full));
    } else if (entry.name === 'index.html') {
      results.push(full);
    }
  }
  return results;
}

const files = findHtmlFiles(PUBLIC);

for (const file of files) {
  let html = fs.readFileSync(file, 'utf8');
  
  // Pattern: <picture><source srcset="...avif" type="image/avif"/><img .../></picture>
  // Replace with just the <img .../> tag
  const pictureRegex = /<picture><source[^>]*\.avif[^>]*>(<img[^]*?)<\/picture>/gi;
  
  const matches = html.match(pictureRegex);
  if (!matches || matches.length === 0) {
    skipped++;
    continue;
  }
  
  html = html.replace(pictureRegex, '$1');
  
  fs.writeFileSync(file, html);
  const rel = path.relative(PUBLIC, file);
  console.log(`✓ ${rel}: removed ${matches.length} picture/avif wrapper(s)`);
  fixed++;
}

console.log(`\nFixed: ${fixed} pages`);
console.log(`Skipped: ${skipped} pages (no avif references)`);
