#!/usr/bin/env node
/**
 * Standardize Header — Adds the GMB reviews badge + condensed nav to all static HTML pages.
 * 
 * Replaces the old simplified header pattern:
 *   <nav>...<a href="tel:..." class="hphone">...</a></div></header>
 * 
 * With the standard header containing:
 *   - Condensed desktop nav (no dropdowns on static pages, just key links)
 *   - GMB reviews badge (★★★★★ 4.9 · 41 reviews)
 *   - Phone number
 *   - Get Estimate CTA
 *   - gmb-live.js script inclusion
 * 
 * Run: node scripts/standardize-header.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { globSync } from 'glob';

// Standard header right section with GMB badge
const STANDARD_HRIGHT = `<div class="hright"><a href="https://g.page/r/CURezQw2lK1eEBM/review" target="_blank" class="gmb-hdr" title="Google Reviews"><svg width="16" height="16" viewBox="0 0 48 48" fill="none"><path d="M43.6 20H24v8.4h11.3C33.7 33.5 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l6-6C34.5 6.2 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10 0 19-7.3 19-20 0-1.3-.1-2.7-.4-4z" fill="#F5C518"/></svg><span>★★★★★ 4.9 · 41</span></a><a href="tel:+13125971286" class="hphone">📞 (312) 597-1286</a><a href="/estimate/" class="btn-est">Get Estimate</a></div>`;

// CSS for the GMB badge and estimate button (to inject into pages that lack it)
const GMB_CSS = `.hright{margin-left:auto;display:flex;align-items:center;gap:10px}.gmb-hdr{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border:1px solid rgba(245,197,24,.4);border-radius:999px;background:rgba(245,197,24,.08);text-decoration:none}.gmb-hdr span{color:var(--gold);font-family:var(--H);font-weight:700;font-size:.82rem;line-height:1}.btn-est{display:inline-flex;align-items:center;padding:9px 18px;border-radius:8px;font-family:var(--H);font-size:.82rem;font-weight:800;text-decoration:none;background:var(--gold);color:#000}@media(max-width:900px){.gmb-hdr{display:none}}`;

const GMB_SCRIPT = '<script src="/js/gmb-live.js" defer></script>';

const files = globSync('public/**/index.html');

let updated = 0;
let skipped = 0;
let alreadyHas = 0;

for (const file of files) {
  let html = readFileSync(file, 'utf-8');
  
  // Skip redirect stubs (they have meta-refresh)
  if (html.includes('http-equiv="refresh"')) {
    skipped++;
    continue;
  }
  
  // Skip if already has the new GMB badge
  if (html.includes('gmb-hdr') || html.includes('gmb-header')) {
    alreadyHas++;
    continue;
  }
  
  let changed = false;
  
  // Pattern 1: Generated pages — flat nav with hphone at end
  // <nav ...>...</nav><a href="tel:..." class="hphone">...</a></div></header>
  const pattern1 = /(<\/nav>)\s*(<(?:button)[^>]*class="hamburger"[^>]*>[\s\S]*?<\/button>\s*)?<a\s+href="tel:\+13125971286"\s+class="hphone">[^<]*<\/a>\s*<\/div>\s*<\/header>/;
  
  if (pattern1.test(html)) {
    html = html.replace(pattern1, `$1\n${STANDARD_HRIGHT}\n</div></header>`);
    changed = true;
  }
  
  // Pattern 2: Hand-crafted pages with different header layouts
  // Look for the phone link as the last item before </div></header>
  if (!changed) {
    const pattern2 = /<a\s+href="tel:\+13125971286"\s+class="hphone">[^<]*<\/a>\s*<\/div>\s*<\/header>/;
    if (pattern2.test(html)) {
      html = html.replace(pattern2, `${STANDARD_HRIGHT}\n</div></header>`);
      changed = true;
    }
  }
  
  // Pattern 3: Pages where phone is inline (no class="hphone")
  // e.g. <nav>...</nav><a href="tel:...">📞 (312) 597-1286</a></div></header>
  if (!changed) {
    const pattern3 = /(<\/nav>)\s*<a\s+href="tel:\+13125971286"[^>]*>(?:📞|&#x1F4DE;|\uD83D\uDCDE)?\s*\(312\)\s*597-1286<\/a>\s*<\/div>\s*<\/header>/;
    if (pattern3.test(html)) {
      html = html.replace(pattern3, `$1\n${STANDARD_HRIGHT}\n</div></header>`);
      changed = true;
    }
  }
  
  if (!changed) {
    console.log(`⚠️  No matching header pattern: ${file}`);
    continue;
  }
  
  // Inject GMB CSS if not already present
  if (!html.includes('.gmb-hdr') && !html.includes('.gmb-header')) {
    // Insert before </style>
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

console.log(`✅ Updated: ${updated} files`);
console.log(`⏭️  Already has GMB badge: ${alreadyHas} files`);
console.log(`⏭️  Redirect stubs skipped: ${skipped} files`);
console.log(`📄 Total scanned: ${files.length} files`);
