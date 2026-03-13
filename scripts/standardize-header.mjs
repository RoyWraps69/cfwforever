#!/usr/bin/env node
/**
 * Standardize Header — Adds the GMB reviews badge to all static HTML pages.
 * 
 * Replaces the phone-only header ending with a full hright section:
 *   GMB badge + phone + Get Estimate button
 * 
 * Also injects the CSS for .gmb-hdr and .btn-est, and gmb-live.js
 * 
 * Run: node scripts/standardize-header.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { globSync } from 'glob';

const HRIGHT_HTML = '<div class="hright"><a href="https://g.page/r/CURezQw2lK1eEBM/review" target="_blank" class="gmb-hdr" title="Google Reviews"><svg width="16" height="16" viewBox="0 0 48 48" fill="none"><path d="M43.6 20H24v8.4h11.3C33.7 33.5 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l6-6C34.5 6.2 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10 0 19-7.3 19-20 0-1.3-.1-2.7-.4-4z" fill="#F5C518"/></svg><span>\u2605\u2605\u2605\u2605\u2605 4.9 \u00b7 41</span></a><a href="tel:+13125971286" class="hphone">\uD83D\uDCDE (312) 597-1286</a><a href="/estimate/" class="btn-est">Get Estimate</a></div>';

const GMB_CSS = '.hright{margin-left:auto;display:flex;align-items:center;gap:10px}.gmb-hdr{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border:1px solid rgba(245,197,24,.4);border-radius:999px;background:rgba(245,197,24,.08);text-decoration:none}.gmb-hdr span{color:var(--gold);font-family:var(--H);font-weight:700;font-size:.82rem;line-height:1}.btn-est{display:inline-flex;align-items:center;padding:9px 18px;border-radius:8px;font-family:var(--H);font-size:.82rem;font-weight:800;text-decoration:none;background:var(--gold);color:#000}@media(max-width:900px){.gmb-hdr{display:none}}';

const GMB_SCRIPT = '<script src="/js/gmb-live.js" defer></script>';

const files = globSync('public/**/index.html');

let updated = 0;
let skipped = 0;
let alreadyHas = 0;
let noMatch = 0;

for (const file of files) {
  let html = readFileSync(file, 'utf-8');
  
  // Skip redirect stubs
  if (html.includes('http-equiv="refresh"') || html.includes('http-equiv=\\'refresh\\'')) {
    skipped++;
    continue;
  }
  
  // Skip if already has the GMB badge
  if (html.includes('gmb-hdr') || html.includes('gmb-header')) {
    alreadyHas++;
    continue;
  }
  
  // Skip if no header element
  if (!html.includes('<header')) {
    skipped++;
    continue;
  }
  
  let changed = false;
  
  // Main pattern: <a href="tel:+13125971286" class="hphone">...</a></div></header>
  // This covers both generated pages (inline) and hand-crafted pages
  const phonePattern = /<a\s+href="tel:\+13125971286"\s+class="hphone">[^<]*<\/a>\s*<\/div>\s*<\/header>/;
  
  if (phonePattern.test(html)) {
    html = html.replace(phonePattern, `${HRIGHT_HTML}</div></header>`);
    changed = true;
  }
  
  // Alternative: phone link without hphone class
  if (!changed) {
    const altPattern = /<a\s+href="tel:\+13125971286"[^>]*>(?:\uD83D\uDCDE|📞|&#x1F4DE;)?\s*\(312\)\s*597-1286<\/a>\s*<\/div>\s*<\/header>/;
    if (altPattern.test(html)) {
      html = html.replace(altPattern, `${HRIGHT_HTML}</div></header>`);
      changed = true;
    }
  }
  
  if (!changed) {
    noMatch++;
    console.log(`\u26A0\uFE0F  No matching header pattern: ${file}`);
    continue;
  }
  
  // Inject GMB CSS if not present
  if (!html.includes('.gmb-hdr')) {
    if (html.includes('</style>')) {
      html = html.replace('</style>', `\n${GMB_CSS}\n</style>`);
    }
  }
  
  // Inject gmb-live.js if not present
  if (!html.includes('gmb-live.js')) {
    if (html.includes('</body>')) {
      html = html.replace('</body>', `${GMB_SCRIPT}\n</body>`);
    }
  }
  
  writeFileSync(file, html);
  updated++;
}

console.log(`\u2705 Updated: ${updated} files`);
console.log(`\u23ED\uFE0F  Already has GMB badge: ${alreadyHas} files`);
console.log(`\u23ED\uFE0F  Skipped (redirects/no header): ${skipped} files`);
if (noMatch) console.log(`\u26A0\uFE0F  No match: ${noMatch} files`);
console.log(`\uD83D\uDCC4 Total scanned: ${files.length} files`);
