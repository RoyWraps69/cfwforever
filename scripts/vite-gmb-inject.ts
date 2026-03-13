/**
 * Vite plugin: Injects GMB reviews badge into all static HTML files in public/.
 * Runs at dev server start and build time.
 * 
 * For each HTML file that has class="hphone" but NOT gmb-hdr:
 *  1. Replaces the phone-only header ending with .hright (GMB badge + phone + Get Estimate)
 *  2. Injects .gmb-hdr / .hright / .btn-est CSS
 *  3. Injects <script src="/js/gmb-live.js" defer></script>
 */

import { readFileSync, writeFileSync } from 'fs';
import { globSync } from 'glob';
import type { Plugin } from 'vite';

const HRIGHT_HTML =
  '<div class="hright">' +
  '<a href="https://g.page/r/CURezQw2lK1eEBM/review" target="_blank" class="gmb-hdr" title="Google Reviews">' +
  '<svg width="16" height="16" viewBox="0 0 48 48" fill="none"><path d="M43.6 20H24v8.4h11.3C33.7 33.5 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l6-6C34.5 6.2 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10 0 19-7.3 19-20 0-1.3-.1-2.7-.4-4z" fill="#F5C518"/></svg>' +
  '<span>\u2605\u2605\u2605\u2605\u2605 4.9 \u00b7 41</span></a>' +
  '<a href="tel:+13125971286" class="hphone">\uD83D\uDCDE (312) 597-1286</a>' +
  '<a href="/estimate/" class="btn-est">Get Estimate</a></div>';

const GMB_CSS =
  '.hright{margin-left:auto;display:flex;align-items:center;gap:10px}' +
  '.gmb-hdr{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border:1px solid rgba(245,197,24,.4);border-radius:999px;background:rgba(245,197,24,.08);text-decoration:none}' +
  '.gmb-hdr span{color:var(--gold);font-family:var(--H);font-weight:700;font-size:.82rem;line-height:1}' +
  '.btn-est{display:inline-flex;align-items:center;padding:9px 18px;border-radius:8px;font-family:var(--H);font-size:.82rem;font-weight:800;text-decoration:none;background:var(--gold);color:#000}' +
  '@media(max-width:900px){.gmb-hdr{display:none}}';

const GMB_SCRIPT = '<script src="/js/gmb-live.js" defer></script>';

function injectGmb() {
  const files = globSync('public/**/index.html');
  let updated = 0;

  for (const file of files) {
    let html = readFileSync(file, 'utf-8');

    // Skip redirects
    if (html.includes('http-equiv="refresh"') || html.includes("http-equiv='refresh'")) continue;
    // Skip if already has GMB badge
    if (html.includes('gmb-hdr')) continue;
    // Skip if no hphone
    if (!html.includes('class="hphone"')) continue;

    let changed = false;

    // Pattern: <a href="tel:+13125971286" class="hphone">...</a></div></header>
    const p1 = /(<a\s+href="tel:\+13125971286"\s+class="hphone">)[^<]*<\/a>\s*<\/div>\s*<\/header>/;
    if (p1.test(html)) {
      html = html.replace(p1, `${HRIGHT_HTML}</div></header>`);
      changed = true;
    }

    // Pattern: class="hphone" appears but </div></header> is further away (multi-element)
    if (!changed) {
      const p2 = /(<a\s+href="tel:\+13125971286"\s+class="hphone">)[^<]*<\/a>/;
      if (p2.test(html)) {
        // Replace just the phone link + what follows until </header>
        html = html.replace(
          /(<a\s+href="tel:\+13125971286"\s+class="hphone">)[^<]*<\/a>\s*<\/div>\s*<\/header>/,
          `${HRIGHT_HTML}</div></header>`
        );
        if (html.includes('gmb-hdr')) changed = true;
      }
    }

    if (!changed) continue;

    // Remove margin-left:auto from .hphone since .hright now has it
    html = html.replace(/\.hphone\{([^}]*)margin-left:\s*auto;?/g, '.hphone{$1');

    // Inject CSS
    if (!html.includes('.gmb-hdr{') && !html.includes('.gmb-hdr {')) {
      // Insert before last </style>
      const lastStyleIdx = html.lastIndexOf('</style>');
      if (lastStyleIdx > -1) {
        html = html.slice(0, lastStyleIdx) + '\n' + GMB_CSS + '\n' + html.slice(lastStyleIdx);
      }
    }

    // Inject gmb-live.js
    if (!html.includes('gmb-live.js')) {
      if (html.includes('</body>')) {
        html = html.replace('</body>', `${GMB_SCRIPT}\n</body>`);
      }
    }

    writeFileSync(file, html);
    updated++;
  }

  if (updated > 0) {
    console.log(`✅ GMB badge injected into ${updated} HTML files`);
  }
}

export default function gmbInjectPlugin(): Plugin {
  return {
    name: 'gmb-inject',
    buildStart() {
      injectGmb();
    },
    configureServer() {
      injectGmb();
    },
  };
}
