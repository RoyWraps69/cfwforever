import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

const PUBLIC_DIR = path.resolve('public');
const htmlFiles = globSync('**/*.html', { cwd: PUBLIC_DIR });

let fixed = 0;
for (const file of htmlFiles) {
  const filePath = path.join(PUBLIC_DIR, file);
  let html = fs.readFileSync(filePath, 'utf-8');
  
  // Pattern 1: Multi-line script block
  const pattern1 = /<script>\s*if\s*\(\s*window\.history[^]*?route[^]*?<\/script>/gi;
  // Pattern 2: Inline single-line variant  
  const pattern2 = /<script>[^<]*?(?:bot|crawl|spider)[^<]*?route[^<]*?<\/script>/gi;
  
  const before = html;
  html = html.replace(pattern1, '');
  html = html.replace(pattern2, '');
  
  if (html !== before) {
    fs.writeFileSync(filePath, html, 'utf-8');
    fixed++;
    console.log(`  ✓ ${file}`);
  }
}

console.log(`\n✅ Stripped redirect scripts from ${fixed} files`);
