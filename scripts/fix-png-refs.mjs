#!/usr/bin/env node
/**
 * Bulk-replace old .png image references with .webp equivalents
 * across all static HTML files in public/
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const REPLACEMENTS = [
  ['cfw_van_1.png', 'cfw_van_1.webp'],
  ['cfw_van_2.png', 'cfw_van_2.webp'],
  ['cfw_van_3.png', 'cfw_van_3.webp'],
  ['cfw_truck_1.png', 'cfw_truck_1.webp'],
  ['cfw_truck_2.png', 'cfw_truck_2.webp'],
  ['cfw_truck_3.png', 'cfw_truck_3.webp'],
  ['sns_roofing_truck.png', 'sns_roofing_truck.webp'],
];

function walk(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...walk(full));
    } else if (full.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

let totalFixed = 0;
const files = walk('public');

for (const file of files) {
  let content = readFileSync(file, 'utf8');
  let changed = false;
  for (const [from, to] of REPLACEMENTS) {
    if (content.includes(from)) {
      content = content.replaceAll(from, to);
      changed = true;
    }
  }
  if (changed) {
    writeFileSync(file, content, 'utf8');
    totalFixed++;
    console.log(`✓ ${file}`);
  }
}

console.log(`\nDone — fixed ${totalFixed} files.`);
