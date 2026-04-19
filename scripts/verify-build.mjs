#!/usr/bin/env node
/**
 * verify-build.mjs
 * Pre-deploy verification. Fails the build if any page regresses on:
 *   - GA4 snippet
 *   - Full page chrome (header, footer, trib ticker)
 *   - Exactly one H1
 *   - Title 30-62 chars
 *   - Meta description 80-160 chars
 *   - LocalBusiness + AggregateRating + FAQPage + BreadcrumbList schema
 *   - Banned words in body content
 *   - Links to deleted stub URLs
 *
 * Exits 1 on any failure (blocks Netlify deploy).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');

const BANNED = [
  'delve', 'tapestry', 'nuanced', 'utilize', 'paradigm', 'synergy',
  'robust', 'seamless', 'foster', 'underscore', 'certainly', 'absolutely'
];
const LEVERAGE_VERB_RE = /\bleverag(e|es|ed|ing)\b/gi;

// Pages excluded from full checks (intentional): Google verification + internal admin
const EXCLUDE_FULL = new Set([
  'googleac4190c5fb66b0fb/index.html',
  'googleac4190c5fb66b0fb.html',
  'ops/index.html',
  'dashboard.html',
  '404.html',        // Netlify root 404 — intentionally minimal
  'site.html',       // internal
  'catalog.html',    // internal
  'admin.html',      // internal
]);

// Deleted stub slugs that must NEVER appear as internal links (except in _redirects)
const DELETED_STUB_URLS = [
  '/boating/', '/boxtruck/', '/colorchange/', '/commercial/', '/contractor/',
  '/delivery/', '/electric/', '/fleet/', '/foodtruck/', '/hvac/', '/landscape/',
  '/moving/', '/partial-wraps/', '/plumber/', '/removal/', '/transit/',
  '/vehicle-wraps-vs-billboards/', '/wall-wraps/',
];

// Zones we don't want to scan for banned words (code/markup content is OK)
const SKIP_ZONE_RE = /<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<pre\b[^>]*>[\s\S]*?<\/pre>|<code\b[^>]*>[\s\S]*?<\/code>/gi;

// Proper-noun whitelist (substrings matching BANNED that are legit)
const PROPER_NOUN_PATTERNS = [
  /\bFoster\s+(?:Avenue|Ave|Road|Rd|Street|St|Park|Beach|City)\b/gi,
];

function stripSkipZones(html) {
  return html.replace(SKIP_ZONE_RE, '');
}

function applyProperNounWhitelist(text) {
  let result = text;
  for (const pat of PROPER_NOUN_PATTERNS) {
    result = result.replace(pat, m => m.replace(/[A-Za-z]/g, '_'));
  }
  return result;
}

function extractMetaContent(html) {
  // Handles both orders and both quote types (apostrophe-safe)
  let m = html.match(/<meta\s+name=["']description["']\s+content=("[^"]*"|'[^']*')/i);
  if (m) return m[1].slice(1, -1);
  m = html.match(/<meta\s+content=("[^"]*"|'[^']*')\s+name=["']description["']/i);
  if (m) return m[1].slice(1, -1);
  return null;
}

function extractTitle(html) {
  const m = html.match(/<title>([^<]+)<\/title>/i);
  return m ? m[1] : null;
}

// Collect issues per file, aggregate at end
const issuesByFile = new Map();
function addIssue(file, issue) {
  if (!issuesByFile.has(file)) issuesByFile.set(file, []);
  issuesByFile.get(file).push(issue);
}

const htmlFiles = globSync('**/*.html', { cwd: PUBLIC_DIR });
console.log(`Verifying ${htmlFiles.length} pages...\n`);

let healthyCount = 0;
let excludedCount = 0;

for (const file of htmlFiles) {
  if (EXCLUDE_FULL.has(file)) { excludedCount++; continue; }

  const full = path.join(PUBLIC_DIR, file);
  const html = fs.readFileSync(full, 'utf-8');

  // Skip tiny redirect stubs (shouldn't exist after cleanup, but just in case)
  if (html.length < 1000) continue;

  // === Required content tokens ===
  const required = {
    'G-54BP1GMYJ1': 'NO_GA4',
    '<header': 'NO_HEADER',
    '<footer': 'NO_FOOTER',
    'class="trib"': 'NO_TRIB',
    'LocalBusiness': 'NO_LOCALBUSINESS',
    'AggregateRating': 'NO_AGGREGATERATING',
    '"FAQPage"': 'NO_FAQ',
    '"BreadcrumbList"': 'NO_BREADCRUMB',
  };
  for (const [token, label] of Object.entries(required)) {
    if (!html.includes(token)) addIssue(file, label);
  }

  // === H1 count (exactly 1) ===
  const h1Count = (html.match(/<h1\b[^>]*>/gi) || []).length;
  if (h1Count === 0) addIssue(file, 'NO_H1');
  if (h1Count > 1) addIssue(file, `DUPE_H1(${h1Count})`);

  // === Title length ===
  const title = extractTitle(html);
  if (!title) addIssue(file, 'NO_TITLE');
  else {
    if (title.length > 62) addIssue(file, `TITLE_TOO_LONG(${title.length})`);
    if (title.length < 30) addIssue(file, `TITLE_TOO_SHORT(${title.length})`);
  }

  // === Meta description length ===
  const meta = extractMetaContent(html);
  if (!meta) addIssue(file, 'NO_META');
  else {
    if (meta.length > 160) addIssue(file, `META_TOO_LONG(${meta.length})`);
    if (meta.length < 80) addIssue(file, `META_TOO_SHORT(${meta.length})`);
  }

  // === Duplicate meta description tags (confuses Google) ===
  const metaTagCount = (html.match(/<meta\s+[^>]*name=["']description["'][^>]*>/gi) || []).length;
  if (metaTagCount > 1) addIssue(file, `DUP_META_TAGS(${metaTagCount})`);

  // === Duplicate canonical tags ===
  const canonCount = (html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*>/gi) || []).length;
  if (canonCount > 1) addIssue(file, `DUP_CANONICAL(${canonCount})`);

  // === Banned words (body content, excluding script/style/pre/code) ===
  const bodyOnly = applyProperNounWhitelist(stripSkipZones(html));
  for (const bw of BANNED) {
    const re = new RegExp(`\\b${bw}\\b`, 'i');
    if (re.test(bodyOnly)) addIssue(file, `BANNED:${bw}`);
  }
  if (LEVERAGE_VERB_RE.test(bodyOnly)) addIssue(file, 'BANNED:leverage(verb)');
  LEVERAGE_VERB_RE.lastIndex = 0; // reset regex state

  // === Links to deleted stubs ===
  for (const stub of DELETED_STUB_URLS) {
    if (html.includes(`href="${stub}"`) || html.includes(`href='${stub}'`)) {
      addIssue(file, `STALE_LINK:${stub}`);
    }
  }

  if (!issuesByFile.has(file)) healthyCount++;
}

// === Report ===
const failedCount = issuesByFile.size;
console.log(`━━━ RESULTS ━━━`);
console.log(`CLEAN:    ${healthyCount}`);
console.log(`EXCLUDED: ${excludedCount} (Google verification, internal ops)`);
console.log(`FAILED:   ${failedCount}`);

if (failedCount === 0) {
  console.log('\n✅ 100% verification passed. Deploy OK.');
  process.exit(0);
}

// Print issue summary
const issueCounts = {};
for (const issues of issuesByFile.values()) {
  for (const i of issues) {
    const key = i.split('(')[0].split(':')[0];
    issueCounts[key] = (issueCounts[key] || 0) + 1;
  }
}
console.log('\n━━━ Issue breakdown ━━━');
for (const [k, c] of Object.entries(issueCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k}: ${c}`);
}

console.log('\n━━━ First 15 failing pages ━━━');
let shown = 0;
for (const [file, issues] of issuesByFile) {
  if (shown >= 15) break;
  console.log(`  ${file}`);
  console.log(`    ${issues.slice(0, 5).join(', ')}`);
  shown++;
}
if (failedCount > 15) console.log(`  ... and ${failedCount - 15} more\n`);

console.error(`\n❌ Verification failed. Deploy blocked.`);
process.exit(1);
