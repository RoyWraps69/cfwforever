#!/usr/bin/env node
// IndexNow submission script
// Runs post-build on Netlify — pings Bing, Yandex, Seznam, Naver with all site URLs

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const KEY = 'b1d95b588bc440689702668f937d2cc5';
const HOST = 'chicagofleetwraps.com';
const BASE = 'https://chicagofleetwraps.com';
const KEY_URL = ;

// IndexNow endpoints — all accept the same payload
const ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://search.seznam.cz/indexnow',
  'https://yandex.com/indexnow',
];

// Read sitemap to get all URLs
let urls = [];
try {
  const sitemap = readFileSync(join(__dirname, '../public/sitemap.xml'), 'utf-8');
  const matches = sitemap.match(/<loc>([^<]+)<\/loc>/g) || [];
  urls = matches.map(m => m.replace(/<\/?loc>/g, '').trim());
  console.log();
} catch(e) {
  console.error('Could not read sitemap:', e.message);
  process.exit(0); // Non-fatal — don't fail the build
}

if (!urls.length) {
  console.log('No URLs to submit');
  process.exit(0);
}

// IndexNow API payload (max 10,000 URLs per request)
const payload = JSON.stringify({
  host: HOST,
  key: KEY,
  keyLocation: KEY_URL,
  urlList: urls.slice(0, 10000)
});

// Ping all endpoints
async function pingAll() {
  for (const endpoint of ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: payload,
        signal: AbortSignal.timeout(10000)
      });
      const status = response.status;
      if ([200, 202].includes(status)) {
        console.log();
      } else {
        const text = await response.text().catch(() => '');
        console.log();
      }
    } catch(e) {
      console.log();
    }
  }
}

pingAll().then(() => console.log('IndexNow submission complete'));
