#!/usr/bin/env node
/**
 * Converts all onclick="go('slug')" SPA navigation in index.html
 * to proper <a href="/url/"> links that Google can crawl.
 * 
 * Run: node scripts/convert-spa-to-html-links.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INDEX = path.resolve(__dirname, '../index.html');

// Complete slug → canonical URL mapping
const SLUG_TO_URL = {
  'home': '/',
  // Services
  'commercial': '/commercial-vehicle-wraps-chicago/',
  'boxtruck': '/boxtruck/',
  'sprinter': '/sprinter/',
  'transit': '/commercial/', // no dedicated static page
  'colorchange': '/colorchange/',
  'ev': '/ev-wraps/',
  'ev-wraps': '/ev-wraps/',
  'wallwraps': '/wall-wraps/',
  'removal': '/wrap-removal/',
  'partial-wraps': '/partial-vehicle-wraps-chicago/',
  'lettering': '/lettering/',
  'pickup-truck': '/pickup-truck/',
  'signsandgraphics': '/signsandgraphics/',
  // Industries
  'hvac': '/hvac-van-wraps-chicago/',
  'plumber': '/plumbing-van-wraps-chicago/',
  'electric': '/electrician-vehicle-wraps-chicago/',
  'contractor': '/contractor-vehicle-wraps-chicago/',
  'delivery': '/delivery-fleet-wraps-chicago/',
  'foodtruck': '/food-truck-wraps-chicago/',
  'landscape': '/landscaping-truck-wraps-chicago/',
  'boating': '/boat-wraps-chicago/',
  'moving': '/moving-truck-wraps-chicago/',
  // Core pages
  'portfolio': '/portfolio/',
  'blog': '/blog/',
  'faq': '/faq/',
  'about': '/about/',
  'estimate': '/estimate/',
  'warranty': '/warranty/',
  'servicearea': '/servicearea/',
  'contact': '/contact/',
  'apparel': '/apparel/',
  // Resources
  'roi': '/roi/',
  'stats': '/stats/',
  'vsads': '/vsads/',
  'wrap-calculator': '/wrap-calculator.html',
  'materials': '/materials/',
  'care': '/care/',
  // Tools
  'visualizer': '/brand-audit/', // closest static page
  'brandaudit': '/brand-audit/',
  'schedule': '/schedule/',
  'beforeafter': '/portfolio/', // no dedicated page
  'calculator': '/calculator/',
  'intake': '/intake/',
  'vinyl': '/vinyl-guide/',
  'fleetaccount': '/estimate/', // no dedicated page
  'refund': '/warranty/', // no dedicated page
  // Cities
  'geo-chicago': '/chicago/',
  'geo-schaumburg': '/schaumburg/',
  'geo-naperville': '/naperville/',
  'geo-aurora': '/aurora/',
  'geo-elgin': '/elgin/',
  'geo-joliet': '/joliet/',
  'geo-evanston': '/evanston/',
  'geo-skokie': '/skokie/',
  'geo-oak-park': '/oak-park/',
  'geo-berwyn': '/berwyn/',
  'geo-wilmette': '/wilmette/',
  'geo-arlington-heights': '/arlington-heights/',
  'geo-des-plaines': '/des-plaines/',
  'geo-palatine': '/palatine/',
  'geo-wheaton': '/wheaton/',
  'geo-downers-grove': '/downers-grove/',
  'geo-lombard': '/lombard/',
  'geo-elmhurst': '/elmhurst/',
  'geo-tinley-park': '/tinley-park/',
  'geo-orland-park': '/orland-park/',
  'geo-bolingbrook': '/bolingbrook/',
  // Pillar pages (already have href but may appear in go() calls)
  'vehicle-wraps-chicago': '/vehicle-wraps-chicago/',
  'fleet-wraps-chicago': '/fleet-wraps-chicago/',
  'truck-wraps-chicago': '/truck-wraps-chicago/',
  'van-wraps-chicago': '/van-wraps-chicago/',
  'commercial-vehicle-wraps-chicago': '/commercial-vehicle-wraps-chicago/',
  'partial-vehicle-wraps-chicago': '/partial-vehicle-wraps-chicago/',
  'vehicle-wrap-cost-chicago': '/vehicle-wrap-cost-chicago/',
  // Growth dashboard (internal tool, keep as-is)
  'growth-dashboard': '/growth-dashboard/',
};

function resolveUrl(slug) {
  if (SLUG_TO_URL[slug]) return SLUG_TO_URL[slug];
  // Blog posts
  if (slug.startsWith('post-') || slug.startsWith('post/')) {
    const postSlug = slug.replace(/^post[-\\/]/, '');
    return '/post/' + postSlug + '/';
  }
  // Fallback: use slug as URL
  return '/' + slug + '/';
}

function processFile(filePath, label) {
  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  ${label} not found, skipping`);
    return;
  }
  let html = fs.readFileSync(filePath, 'utf-8');
  let changes = 0;

  // 1. Remove the early redirect/routing script
  html = html.replace(/<script>\s*\/\/ If this is a direct URL hit[\s\S]*?<\/script>/i, () => {
    changes++;
    return '<!-- SPA redirect removed — all navigation is now pure HTML links -->';
  });

  // 2. Convert <a onclick="go('slug')"> (no href) → <a href="/url/">
  html = html.replace(/<a\s+onclick="go\('([^']+)'\)">/g, (match, slug) => {
    changes++;
    return `<a href="${resolveUrl(slug)}">`;
  });

  // 3. Convert <a onclick="go('slug');document.getElementById('mnav').classList.remove('open')"> → <a href="/url/">
  html = html.replace(/<a\s+onclick="go\('([^']+)'\);document\.getElementById\('mnav'\)\.classList\.remove\('open'\)">/g, (match, slug) => {
    changes++;
    return `<a href="${resolveUrl(slug)}">`;
  });

  // 4. Remove onclick="go('slug');return false" from <a> tags that already have href
  html = html.replace(/(<a\s+href="[^"]+?")\s+onclick="go\('([^']+)'\);return false"/g, (match, aTag) => {
    changes++;
    return aTag;
  });

  // 5. Remove onclick="event.preventDefault();go('slug')" from <a> tags that already have href  
  html = html.replace(/(<a\s+href="[^"]+?")\s+onclick="event\.preventDefault\(\);go\('([^']+)'\)"/g, (match, aTag) => {
    changes++;
    return aTag;
  });

  // 6. Convert <button class="..." onclick="go('slug')"> → <a href="/url/" class="...">
  html = html.replace(/<button\s+class="([^"]*?)"\s+onclick="go\('([^']+)'\)"([^>]*)>/g, (match, cls, slug, rest) => {
    changes++;
    return `<a href="${resolveUrl(slug)}" class="${cls}"${rest}>`;
  });

  // 7. Convert <button onclick="go('slug')"> (no class) → <a href="/url/">
  html = html.replace(/<button\s+onclick="go\('([^']+)'\)">/g, (match, slug) => {
    changes++;
    return `<a href="${resolveUrl(slug)}">`;
  });

  // 8. Convert <div ... onclick="go('slug')"> → <a ... href="/url/"> (service cards etc.)
  html = html.replace(/<div\s+(class="[^"]*?")\s+onclick="go\('([^']+)'\)">/g, (match, cls, slug) => {
    changes++;
    return `<a ${cls} href="${resolveUrl(slug)}" style="text-decoration:none;color:inherit;display:block">`;
  });

  // 9. Convert onclick="go('slug')" on div.logo → wrap in <a href>
  html = html.replace(/<div\s+class="logo"\s+onclick="go\('home'\)"\s+role="link"\s+tabindex="0"\s+aria-label="([^"]*)">/g, () => {
    changes++;
    return `<a href="/" class="logo" aria-label="Chicago Fleet Wraps - Home">`;
  });

  // 10. Convert <button onclick="go('estimate')"> → <a href="/estimate/">
  html = html.replace(/<button\s+onclick="go\('estimate'\)">/g, () => {
    changes++;
    return `<a href="/estimate/" style="display:inline-flex;align-items:center;justify-content:center">`;
  });

  // 11. Fix city buttons: <button class="rlink" onclick="go('geo-x')">
  html = html.replace(/<button\s+class="rlink"\s+onclick="go\('([^']+)'\)">/g, (match, slug) => {
    changes++;
    return `<a href="${resolveUrl(slug)}" class="rlink">`;
  });

  // 12. Convert remaining onclick="go('x');return false"
  html = html.replace(/\s+onclick="go\('([^']+)'\);return false"/g, () => {
    changes++;
    return '';
  });

  // 13. Convert remaining onclick="go('x')" anywhere
  html = html.replace(/\s+onclick="go\('([^']+)'\)"/g, () => {
    changes++;
    return '';
  });

  fs.writeFileSync(filePath, html, 'utf-8');
  console.log(`✅ Converted ${changes} SPA go() calls to HTML links in ${label}`);
}

// Process both files
processFile(path.resolve(__dirname, '../index.html'), 'index.html');
processFile(path.resolve(__dirname, '../public/site.html'), 'public/site.html');
