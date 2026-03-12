#!/usr/bin/env node
/**
 * Strip redirect scripts from all static HTML files.
 * These redirects cause Google to interpret the pages as cloaking/soft-redirects,
 * preventing indexing of 81+ pages.
 * 
 * Run: node scripts/strip-redirects.mjs
 */
import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const htmlFiles = globSync('**/*.html', { cwd: PUBLIC_DIR });

let fixed = 0;
for (const file of htmlFiles) {
  const filePath = path.join(PUBLIC_DIR, file);
  let html = fs.readFileSync(filePath, 'utf-8');
  const original = html;

  // Pattern 1: Multi-line script block with window.history and route redirect
  html = html.replace(/<script>\s*if\s*\(\s*window\.history[\s\S]*?route[\s\S]*?<\/script>/gi, '');
  
  // Pattern 2: Single-line minified redirect with bot detection
  html = html.replace(/<script>[^<]*?(?:bot|crawl|spider)[^<]*?route[^<]*?<\/script>/gi, '');

  if (html !== original) {
    fs.writeFileSync(filePath, html, 'utf-8');
    fixed++;
    console.log(`  ✓ Stripped redirect from ${file}`);
  }
}

console.log(`\n✅ Stripped redirect scripts from ${fixed} of ${htmlFiles.length} HTML files`);
if (fixed === 0) {
  console.log('   (All files were already clean)');
}
