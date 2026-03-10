#!/usr/bin/env node
/**
 * Bulk find-and-replace for stat numbers across all HTML files
 */
import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

const replacements = [
  // Total wraps: 15,000+ → 9,400+
  [/15,000\+ vehicles wrapped/gi, '9,400+ vehicles wrapped'],
  [/15,000\+ Vehicles Wrapped/g, '9,400+ Vehicles Wrapped'],
  [/15,000\+ Vehicles(?![ W])/g, '9,400+ Vehicles'],
  [/15,000\+ vehicle installations/gi, '9,400+ vehicle installations'],
  [/15,000\+<\/strong>/g, '9,400+</strong>'],
  [/"15,000\+ vehicles/g, '"9,400+ vehicles'],
  // Fleet wraps: 5,000+ → 2,800+
  [/5,000\+ fleet accounts/gi, '2,800+ fleet accounts'],
  [/5,000\+ fleet/gi, '2,800+ fleet'],
  // Structured data / meta descriptions
  [/15,000\+ vehicles wrapped/g, '9,400+ vehicles wrapped'],
];

const rootDir = path.resolve(import.meta.dirname || '.', '..');
const files = globSync('**/*.html', { cwd: rootDir, ignore: ['node_modules/**'] });

let totalChanges = 0;

for (const file of files) {
  const fullPath = path.join(rootDir, file);
  let content = fs.readFileSync(fullPath, 'utf-8');
  let original = content;
  
  for (const [pattern, replacement] of replacements) {
    content = content.replace(pattern, replacement);
  }
  
  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf-8');
    totalChanges++;
    console.log(`  ✓ ${file}`);
  }
}

console.log(`\n✅ Updated ${totalChanges} files`);
