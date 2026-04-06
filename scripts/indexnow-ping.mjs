#!/usr/bin/env node
// IndexNow submission — runs post-build on Netlify
// Pings Bing, api.indexnow.org, Yandex, Seznam with every URL in sitemap

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const KEY = 'b1d95b588bc440689702668f937d2cc5';
const HOST = 'chicagofleetwraps.com';
const KEY_URL = `https://${HOST}/${KEY}.txt`;

const ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
  'https://search.seznam.cz/indexnow',
];

let urls = [];
try {
  const sitemap = readFileSync(join(__dirname, '../public/sitemap.xml'), 'utf-8');
  const matches = sitemap.match(/<loc>([^<]+)<\/loc>/g) || [];
  urls = matches
    .map(m => m.replace(/<\/?loc>/g, '').trim())
    .filter(u => !u.includes('/admin/'));
  console.log(`IndexNow: ${urls.length} URLs to submit`);
} catch(e) {
  console.error('Could not read sitemap:', e.message);
  process.exit(0);
}

if (!urls.length) { console.log('No URLs.'); process.exit(0); }

const payload = JSON.stringify({
  host: HOST,
  key: KEY,
  keyLocation: KEY_URL,
  urlList: urls.slice(0, 10000)
});

async function pingAll() {
  for (const endpoint of ENDPOINTS) {
    try {
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: payload,
        signal: AbortSignal.timeout(15000)
      });
      if ([200, 202].includes(r.status)) {
        console.log(`✓ ${endpoint} — HTTP ${r.status}`);
      } else {
        const t = await r.text().catch(() => '');
        console.log(`✗ ${endpoint} — HTTP ${r.status}: ${t.slice(0, 120)}`);
      }
    } catch(e) {
      console.log(`✗ ${endpoint} — ${e.message}`);
    }
  }
  console.log('IndexNow submission complete.');
}

pingAll();
