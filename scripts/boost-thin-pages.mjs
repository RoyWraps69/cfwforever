#!/usr/bin/env node
/**
 * BOOST THIN PAGES — second pass to get all pages to 1800+ words
 * Processes 10 pages concurrently, requests larger content blocks
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, '..', 'public');
const API_URL = process.env.BUILT_IN_FORGE_API_URL || 'https://forge.manus.ai';
const API_KEY = process.env.BUILT_IN_FORGE_API_KEY;
const LOG_FILE = path.join(__dirname, '..', 'boost-log.txt');
const CONCURRENCY = 10;

if (!API_KEY) { console.error('BUILT_IN_FORGE_API_KEY not set'); process.exit(1); }

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

function stripTags(html) {
  return html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function wordCount(html) {
  return stripTags(html).split(/\s+/).filter(Boolean).length;
}

function getH1(html) {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return m ? m[1].replace(/<[^>]+>/g, '').trim() : '';
}

function getTitle(html) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1] : '';
}

async function callLLM(prompt) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const resp = await fetch(`${API_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
        body: JSON.stringify({
          model: 'gemini-2.5-flash',
          messages: [
            { role: 'system', content: `You are an expert SEO content writer for Chicago Fleet Wraps (CFW), a premium vehicle wrap company in Chicago since 2001. 9,400+ vehicles wrapped. Avery Dennison MPI 1105 and 3M IJ180-CV3 cast vinyl exclusively. Zero verified paint damage claims. 2-year workmanship warranty. Free fleet pickup across Chicagoland. Location: 4711 N Lamon Ave #7, Chicago, IL 60630. Phone: (312) 971-3828. Write professional, unique, keyword-rich content. Output raw HTML only.` },
            { role: 'user', content: prompt }
          ],
          max_tokens: 16000,
          temperature: 0.7,
        }),
      });
      if (!resp.ok) throw new Error(`API ${resp.status}`);
      const data = await resp.json();
      return data.choices[0].message.content;
    } catch (e) {
      log(`  Attempt ${attempt + 1} failed: ${e.message}`);
      if (attempt < 2) await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
    }
  }
  return null;
}

// Pages to skip (non-content)
const SKIP = new Set(['404', 'googleac4190c5fb66b0fb', 'estimate/thank-you']);

async function boostPage(slug, filepath, idx, total) {
  const s = slug.replace(/^\/|\/$/g, '');
  if (SKIP.has(s)) { log(`[${idx}/${total}] ${slug} — SKIP`); return 'skipped'; }
  
  let html = fs.readFileSync(filepath, 'utf8');
  const currentWords = wordCount(html);
  if (currentWords >= 1800) { return 'already_ok'; }
  
  const h1 = getH1(html);
  const title = getTitle(html);
  const wordsNeeded = 1800 - currentWords + 200; // request extra buffer
  const topicName = h1 || title || s.replace(/-/g, ' ');
  
  log(`[${idx}/${total}] ${slug} — ${currentWords} words — need ${wordsNeeded} more`);
  
  const prompt = `I need ${wordsNeeded} words of UNIQUE SEO content for the page "${topicName}" at chicagofleetwraps.com${slug}

This is a Chicago Fleet Wraps page about: ${topicName}

Generate ${Math.ceil(wordsNeeded / 120)} sections of content. Each section should have:
- An H2 heading relevant to the specific topic
- 2-3 paragraphs of 60-80 words each
- Natural keyword usage for "${topicName}" and related Chicago terms

RESPOND WITH ONLY RAW HTML. No JSON, no markdown fences. Just H2 headings and paragraphs.
Example format:
<h2>Heading About ${topicName}</h2>
<p>Paragraph of content...</p>
<p>Another paragraph...</p>

Make every section 100% unique. Include Chicago-specific references, pricing ranges, material specs, and local area mentions. Do NOT repeat any generic wrap content.`;

  const response = await callLLM(prompt);
  if (!response) { log(`  ERROR: LLM failed`); return 'error'; }
  
  // Clean the response
  let newContent = response.replace(/```html?\s*/gi, '').replace(/```/g, '').trim();
  
  // Find insertion point — before FAQ, footer, or closing tags
  const insertPoints = [
    /<h2[^>]*>Frequently Asked Questions<\/h2>/i,
    /<h2[^>]*>Related Fleet Wrap Services<\/h2>/i,
    /<!-- Near Me/i,
    /<footer/i,
    /<\/main>/i,
    /<\/article>/i,
  ];
  
  let inserted = false;
  for (const regex of insertPoints) {
    if (regex.test(html)) {
      const match = html.match(regex);
      html = html.replace(regex, '\n' + newContent + '\n' + match[0]);
      inserted = true;
      break;
    }
  }
  
  if (!inserted) {
    // Last resort: insert before </body>
    html = html.replace('</body>', '\n<section class="boost-content">\n' + newContent + '\n</section>\n</body>');
  }
  
  fs.writeFileSync(filepath, html);
  const finalWords = wordCount(html);
  log(`  DONE: ${currentWords} → ${finalWords} words (${finalWords >= 1800 ? '✅' : '⚠️ still under'})`);
  return finalWords >= 1800 ? 'ok' : 'under';
}

async function main() {
  log('\n=== BOOST THIN PAGES STARTED ===');
  
  // Find all pages under 1800 words
  const pages = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (['images','js','css','fonts','icons','node_modules','.git'].includes(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === 'index.html') {
        const html = fs.readFileSync(full, 'utf8');
        const wc = wordCount(html);
        if (wc < 1800) {
          const rel = path.relative(PUBLIC, path.dirname(full));
          const slug = rel === '' ? '/' : '/' + rel + '/';
          pages.push({ slug, filepath: full, words: wc });
        }
      }
    }
  };
  walk(PUBLIC);
  
  log(`Found ${pages.length} pages under 1800 words`);
  
  const results = { ok: 0, under: 0, skipped: 0, errors: 0, already: 0 };
  
  for (let i = 0; i < pages.length; i += CONCURRENCY) {
    const batch = pages.slice(i, i + CONCURRENCY);
    const promises = batch.map((p, j) => boostPage(p.slug, p.filepath, i + j + 1, pages.length));
    const batchResults = await Promise.all(promises);
    for (const r of batchResults) {
      if (r === 'ok') results.ok++;
      else if (r === 'under') results.under++;
      else if (r === 'skipped') results.skipped++;
      else if (r === 'already_ok') results.already++;
      else results.errors++;
    }
    log(`Batch ${Math.floor(i/CONCURRENCY) + 1} done. ${Math.min(i + CONCURRENCY, pages.length)}/${pages.length}`);
  }
  
  log(`\n=== BOOST SUMMARY ===`);
  log(`Boosted to 1800+: ${results.ok}`);
  log(`Still under: ${results.under}`);
  log(`Skipped: ${results.skipped}`);
  log(`Errors: ${results.errors}`);
  log('=== DONE ===');
}

main().catch(e => { log(`FATAL: ${e.message}`); process.exit(1); });
