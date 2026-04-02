#!/usr/bin/env node
/**
 * PARALLEL MASTER FIX — processes 10 pages concurrently
 * Only processes pages NOT already done by the sequential run
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, '..', 'public');
const API_URL = process.env.BUILT_IN_FORGE_API_URL || 'https://forge.manus.ai';
const API_KEY = process.env.BUILT_IN_FORGE_API_KEY;
const LOG_FILE = path.join(__dirname, '..', 'master-fix-log.txt');
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

async function callLLM(prompt) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const resp = await fetch(`${API_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
        body: JSON.stringify({
          model: 'gemini-2.5-flash',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: prompt }
          ],
          max_tokens: 16000,
          temperature: 0.7,
        }),
      });
      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`API ${resp.status}: ${err.slice(0, 200)}`);
      }
      const data = await resp.json();
      return data.choices[0].message.content;
    } catch (e) {
      log(`  LLM attempt ${attempt + 1} failed: ${e.message}`);
      if (attempt < 2) await new Promise(r => setTimeout(r, 3000 * (attempt + 1)));
    }
  }
  return null;
}

const SYSTEM_PROMPT = `You are an expert SEO content writer for Chicago Fleet Wraps (CFW), a premium vehicle wrap company in Chicago since 2001. 9,400+ vehicles wrapped. Avery Dennison MPI 1105 and 3M IJ180-CV3 cast vinyl exclusively. Zero verified paint damage claims. 2-year workmanship warranty. Free fleet pickup across Chicagoland.

Key facts:
- Location: 4711 N Lamon Ave #7, Chicago, IL 60630
- Phone: (312) 597-1286
- Services: fleet wraps, truck wraps, van wraps, car wraps, color change wraps, commercial wraps, box truck wraps, sprinter wraps, EV wraps, boat wraps, wall wraps, partial wraps, full wraps, lettering, decals
- Premium materials ONLY: Avery Dennison MPI 1105, 3M IJ180-CV3 cast vinyl
- Industries: HVAC, plumbing, electrical, landscaping, construction, delivery, food trucks, real estate, nonprofits
- Service area: All of Chicago and suburbs

RULES:
- Professional but approachable tone
- Every paragraph UNIQUE — never repeat content from other pages
- Include specific Chicago-area references
- Include specific pricing ranges where appropriate
- Naturally incorporate target keywords
- Write for humans first, search engines second
- Do NOT mention die cut vinyl, magnetics, or window tint
- Output raw HTML only — no markdown, no code fences`;

function classifyPage(slug) {
  const s = slug.replace(/^\/|\/$/g, '');
  if (!s) return { type: 'homepage', topic: 'Chicago Fleet Wraps' };
  if (s.startsWith('post/')) return { type: 'blog', topic: s.replace('post/', '').replace(/-/g, ' ') };
  if (s.startsWith('video/') || s === 'video') return { type: 'video', topic: s.replace(/-/g, ' ') };
  
  const utility = ['estimate','contact','calculator','wrap-calculator','schedule','intake','404',
    'googleac4190c5fb66b0fb','estimate/thank-you','refund-policy','custom-sitemap','boating',
    'brandaudit','visualizer','stats','roi','vsads','beforeafter','portfolio','materials',
    'vinyl','vinyl-guide','apparel','care','removal','lettering','blog','faq','about','brand-audit'];
  if (utility.includes(s)) return { type: 'utility', topic: s.replace(/-/g, ' ') };
  
  if (s.endsWith('-fleet-wrap') && !s.includes('fleet-wraps-chicago'))
    return { type: 'portfolio', topic: s.replace(/-/g, ' ') };
  
  const neighborhoods = ['albany-park','austin','belmont-cragin','bronzeville','cicero','downtown-chicago',
    'dunning','edgewater','forest-glen','garfield-park','gold-coast','hermosa','humboldt-park',
    'kenwood','loop','montclaire','north-lawndale','norwood-park','south-lawndale','ukrainian-village',
    'andersonville','avondale','bridgeport','bucktown','hyde-park','irving-park','jefferson-park',
    'lakeview','lincoln-park','lincoln-square','logan-square','old-town','pilsen','portage-park',
    'ravenswood','rogers-park','roscoe-village','south-loop','uptown','west-loop','west-town',
    'wicker-park','woodlawn','chicago','river-north','wilmette'];
  if (neighborhoods.includes(s)) return { type: 'geo_neighborhood', topic: s.replace(/-/g, ' ') };
  
  const suburbs = ['addison','arlington-heights','aurora','bartlett','berwyn','bloomingdale',
    'bolingbrook','carol-stream','downers-grove','elmhurst','glendale-heights','hanover-park',
    'hoffman-estates','itasca','lombard','naperville','oak-brook','oak-park','palatine','roselle',
    'schaumburg','skokie','villa-park','wheaton','wood-dale','des-plaines','elgin','evanston','joliet',
    'tinley-park','orland-park','plainfield'];
  if (suburbs.includes(s)) return { type: 'geo_suburb', topic: s.replace(/-/g, ' ') };
  
  if (s.match(/^(ford|chevy|ram|gmc|mercedes|freightliner|hino|isuzu|rivian|tesla|nissan)/))
    return { type: 'vehicle_model', topic: s.replace(/-/g, ' ') };
  
  return { type: 'service', topic: s.replace(/-/g, ' ') };
}

const SHARED_BLOCKS = [
  { name: 'why-cfw', regex: /<h2>Why Chicago Fleet Wraps<\/h2>[\s\S]*?(?=<h2>What Every Wrap Includes<\/h2>|<h2>Fleet Wrap Pricing<\/h2>|<h2>The Wrap Process<\/h2>|<h2>Frequently Asked|<\/section>|<footer)/i },
  { name: 'includes', regex: /<h2>What Every Wrap Includes<\/h2>[\s\S]*?(?=<h2>Fleet Wrap Pricing<\/h2>|<h2>The Wrap Process<\/h2>|<h2>Frequently Asked|<\/section>|<footer)/i },
  { name: 'pricing', regex: /<h2>Fleet Wrap Pricing<\/h2>[\s\S]*?(?=<h2>The Wrap Process<\/h2>|<h2>Frequently Asked|<\/section>|<footer)/i },
  { name: 'process', regex: /<h2>The Wrap Process<\/h2>[\s\S]*?(?=<h2>Frequently Asked|<\/section>|<footer)/i },
  { name: 'premium-solutions', regex: /<h2>Premium Vehicle Wrap Solutions<\/h2>[\s\S]*?(?=<h2>Why Choose Chicago Fleet Wraps|<\/section>|<footer)/i },
  { name: 'why-choose', regex: /<h2>Why Choose Chicago Fleet Wraps for Your Needs\?<\/h2>[\s\S]*?(?=<h2>Industry Expertise|<\/section>|<footer)/i },
  { name: 'industry', regex: /<h2>Industry Expertise &amp; Specialization<\/h2>[\s\S]*?(?=<h2>Our Proven Wrap Process|<\/section>|<footer)/i },
  { name: 'proven-process', regex: /<h2>Our Proven Wrap Process<\/h2>[\s\S]*?(?=<h2>Return on Investment|<\/section>|<footer)/i },
  { name: 'roi', regex: /<h2>Return on Investment: The Business Case for Vehicle Wraps<\/h2>[\s\S]*?(?=<h2>Common Questions|<\/section>|<footer)/i },
  { name: 'common-questions', regex: /<h2>Common Questions About Our Services<\/h2>[\s\S]*?(?=<h2>What Our Clients Say|<\/section>|<footer)/i },
  { name: 'testimonials', regex: /<h2>What Our Clients Say<\/h2>[\s\S]*?(?=<h2>Ready to Transform|<\/section>|<footer)/i },
  { name: 'cta', regex: /<h2>Ready to Transform Your Vehicle\?<\/h2>[\s\S]*?(?=<\/section>|<footer)/i },
];

function removeSharedBlocks(html) {
  let modified = html;
  const removed = [];
  for (const block of SHARED_BLOCKS) {
    if (block.regex.test(modified)) {
      modified = modified.replace(block.regex, '<!-- REPLACED: ' + block.name + ' -->');
      removed.push(block.name);
    }
  }
  let count = 0;
  modified = modified.replace(/<h2[^>]*>Frequently Asked Questions<\/h2>[\s\S]*?(?=<h2|<\/section>|<footer|$)/gi, (match) => {
    count++;
    if (count > 1) { removed.push('duplicate-faq-' + count); return ''; }
    return match;
  });
  return { html: modified, removed };
}

function existingSchemas(html) {
  const schemas = new Set();
  const matches = html.matchAll(/application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi);
  for (const m of matches) {
    try {
      const data = JSON.parse(m[1]);
      if (data['@type']) schemas.add(data['@type']);
    } catch {}
  }
  return schemas;
}

function getH1(html) {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return m ? m[1].replace(/<[^>]+>/g, '').trim() : '';
}

function getTitle(html) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1] : '';
}

function localBusinessSchema() {
  return JSON.stringify({"@context":"https://schema.org","@type":"LocalBusiness","name":"Chicago Fleet Wraps","telephone":"(312) 597-1286","address":{"@type":"PostalAddress","streetAddress":"4711 N Lamon Ave #7","addressLocality":"Chicago","addressRegion":"IL","postalCode":"60630","addressCountry":"US"},"geo":{"@type":"GeoCoordinates","latitude":41.9667,"longitude":-87.7264},"aggregateRating":{"@type":"AggregateRating","ratingValue":"4.9","reviewCount":"42"},"priceRange":"$$-$$$"});
}

function breadcrumbSchema(slug, title) {
  const parts = slug.replace(/^\/|\/$/g, '').split('/').filter(Boolean);
  const items = [{"@type":"ListItem","position":1,"name":"Home","item":"https://chicagofleetwraps.com/"}];
  let p = '';
  parts.forEach((part, i) => {
    p += '/' + part;
    items.push({"@type":"ListItem","position":i+2,"name":title||part.replace(/-/g,' '),"item":`https://chicagofleetwraps.com${p}/`});
  });
  return JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":items});
}

function faqSchema(pairs) {
  return JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":pairs.map(([q,a])=>({"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}}))});
}

function buildPrompt(classification, slug, h1, title, wordsNeeded, removedBlocks, currentWords) {
  const topicName = h1 || title || classification.topic;
  const pageType = classification.type;
  
  const typeGuide = {
    geo_neighborhood: `NEIGHBORHOOD page for "${topicName}" in Chicago. Hyper-local content: specific streets, landmarks, local businesses, driving directions to CFW shop, nearby highways.`,
    geo_suburb: `SUBURB page for "${topicName}". Reference population, business districts, major employers, local events, distance to CFW shop, commercial corridors.`,
    service: `SERVICE page for "${topicName}". Definitive guide: pricing ranges, material specs, installation timelines, before/after, maintenance, ROI data, industry use cases.`,
    vehicle_model: `VEHICLE MODEL page for "${topicName}". Cover surface area, panel count, installation challenges, pricing for this vehicle, which industries use it.`,
    portfolio: `PORTFOLIO/CASE STUDY for "${topicName}". Tell the project story: client challenge, design process, material selection, installation, measurable results.`,
    blog: `BLOG POST about "${topicName}". Educational, in-depth, authoritative. Expert insights, data points, comparisons, actionable advice. Author: Roy Wraps.`,
    utility: `UTILITY page for "${topicName}". Add supporting content that helps users and provides SEO value.`,
    video: `VIDEO page for "${topicName}". Add descriptive content about the video topic.`,
    homepage: `HOMEPAGE. Establish CFW as Chicago's premier vehicle wrap company. Key differentiators, service range, social proof.`,
  };
  
  const blocksInfo = removedBlocks.length > 0
    ? `\nRemoved shared blocks needing UNIQUE replacements: ${removedBlocks.join(', ')}`
    : '';
  
  return `Generate unique SEO content for: ${slug}
Title: "${title || topicName}" | H1: "${h1 || topicName}" | Type: ${pageType}
Current words: ${currentWords} | Need: ${wordsNeeded} more words to reach 1800
${typeGuide[pageType] || typeGuide.service}${blocksInfo}

RESPOND WITH VALID JSON ONLY. No markdown fences. Structure:
{"meta_description":"Unique 150-160 char description mentioning Chicago + specific topic","unique_sections":[{"heading":"Unique H2","content":"<p>2-4 unique paragraphs, 50-80 words each</p>"}],"unique_faq":[{"question":"Specific question about ${topicName}","answer":"40-60 word detailed answer"}]}

Generate ${Math.max(4, Math.ceil(wordsNeeded / 150))} sections and 6-8 unique FAQ items. ALL content must be 100% unique to this page. NO generic wrap questions.`;
}

function applyChanges(html, generated, slug, schemas, pageTitle) {
  // Update meta description
  if (generated.meta_description) {
    const desc = generated.meta_description.replace(/"/g, '&quot;');
    if (html.match(/<meta\s+name=["']description["']/i)) {
      html = html.replace(/<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?>/i, `<meta name="description" content="${desc}"/>`);
    } else {
      html = html.replace('</head>', `<meta name="description" content="${desc}"/>\n</head>`);
    }
    if (html.match(/<meta\s+property=["']og:description["']/i)) {
      html = html.replace(/<meta\s+property=["']og:description["']\s+content=["'][^"']*["']\s*\/?>/i, `<meta property="og:description" content="${desc}"/>`);
    }
  }
  
  // Insert unique sections
  if (generated.unique_sections?.length > 0) {
    let sectionsHtml = generated.unique_sections.map(s => `\n<h2>${s.heading}</h2>\n${s.content}\n`).join('');
    
    const markers = [...html.matchAll(/<!-- REPLACED: [^>]+ -->/g)];
    if (markers.length > 0) {
      let first = false;
      html = html.replace(/<!-- REPLACED: [^>]+ -->/g, () => {
        if (!first) { first = true; return sectionsHtml; }
        return '';
      });
    } else {
      const points = [/<h2[^>]*>Frequently Asked Questions<\/h2>/i, /<footer/i, /<\/main>/i, /<\/body>/i];
      for (const p of points) {
        if (p.test(html)) {
          html = html.replace(p, sectionsHtml + '\n' + html.match(p)[0]);
          break;
        }
      }
    }
  }
  
  // Replace FAQ
  if (generated.unique_faq?.length > 0) {
    const faqHtml = `<h2>Frequently Asked Questions</h2>\n` +
      generated.unique_faq.map(f =>
        `<div class="faq-item"><h3>${f.question}</h3><p>${f.answer}</p></div>`
      ).join('\n');
    
    const faqRegex = /<h2[^>]*>Frequently Asked Questions<\/h2>[\s\S]*?(?=<h2[^>]*>(?!Frequently)|<\/section>|<footer|<!-- |<div[^>]*class="[^"]*(?:cta|contact|footer))/i;
    if (faqRegex.test(html)) html = html.replace(faqRegex, faqHtml + '\n');
    
    const commonQ = /<h2[^>]*>Common Questions[^<]*<\/h2>[\s\S]*?(?=<h2|<\/section>|<footer)/i;
    if (commonQ.test(html)) html = html.replace(commonQ, faqHtml + '\n');
    
    if (!schemas.has('FAQPage')) {
      const pairs = generated.unique_faq.map(f => [f.question, f.answer]);
      html = html.replace('</head>', `<script type="application/ld+json">${faqSchema(pairs)}</script>\n</head>`);
    }
  }
  
  // Add missing schemas
  if (!schemas.has('LocalBusiness')) {
    html = html.replace('</head>', `<script type="application/ld+json">${localBusinessSchema()}</script>\n</head>`);
  }
  if (!schemas.has('BreadcrumbList') && slug !== '/') {
    html = html.replace('</head>', `<script type="application/ld+json">${breadcrumbSchema(slug, pageTitle)}</script>\n</head>`);
  }
  
  return html;
}

async function processPage(slug, filepath, idx, total) {
  let html = fs.readFileSync(filepath, 'utf8');
  const classification = classifyPage(slug);
  const currentWords = wordCount(html);
  const h1 = getH1(html);
  const title = getTitle(html);
  const schemas = existingSchemas(html);
  
  log(`[${idx}/${total}] ${slug} — ${classification.type} — ${currentWords} words`);
  
  const skipSlugs = ['404','googleac4190c5fb66b0fb','estimate/thank-you'];
  if (skipSlugs.includes(slug.replace(/^\/|\/$/g, ''))) {
    log(`  SKIP: non-content`);
    return 'skipped';
  }
  
  const { html: cleaned, removed } = removeSharedBlocks(html);
  if (removed.length > 0) {
    log(`  Removed ${removed.length} shared blocks`);
    html = cleaned;
  }
  
  const cleanedWords = wordCount(html);
  const wordsNeeded = Math.max(0, 1800 - cleanedWords);
  
  const prompt = buildPrompt(classification, slug, h1, title, wordsNeeded, removed, cleanedWords);
  const llmResponse = await callLLM(prompt);
  
  if (!llmResponse) {
    log(`  ERROR: LLM failed`);
    return 'error';
  }
  
  let generated;
  try {
    let jsonStr = llmResponse;
    const fence = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence) jsonStr = fence[1];
    // Try to fix common JSON issues
    jsonStr = jsonStr.replace(/[\x00-\x1f]/g, ' ').trim();
    generated = JSON.parse(jsonStr);
  } catch (e) {
    // Try to extract JSON from the response
    try {
      const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generated = JSON.parse(jsonMatch[0].replace(/[\x00-\x1f]/g, ' '));
      } else {
        log(`  ERROR: JSON parse failed`);
        return 'error';
      }
    } catch {
      log(`  ERROR: JSON parse failed completely`);
      return 'error';
    }
  }
  
  html = applyChanges(html, generated, slug, schemas, h1 || title);
  fs.writeFileSync(filepath, html);
  const finalWords = wordCount(html);
  log(`  DONE: ${cleanedWords} → ${finalWords} words (${finalWords >= 1800 ? '✅' : '⚠️ still under 1800'})`);
  return finalWords >= 1800 ? 'ok' : 'under';
}

async function main() {
  log('\n=== PARALLEL MASTER FIX STARTED ===');
  
  // Read remaining pages
  const remaining = fs.readFileSync('/tmp/remaining.txt', 'utf8').trim().split('\n').slice(1); // skip count line
  log(`Processing ${remaining.length} remaining pages with concurrency ${CONCURRENCY}`);
  
  const results = { ok: 0, under: 0, skipped: 0, errors: 0 };
  
  // Process in batches of CONCURRENCY
  for (let i = 0; i < remaining.length; i += CONCURRENCY) {
    const batch = remaining.slice(i, i + CONCURRENCY);
    const promises = batch.map((slug, j) => {
      const s = slug.replace(/^\/|\/$/g, '') || '.';
      const filepath = path.join(PUBLIC, s === '.' ? 'index.html' : `${s}/index.html`);
      if (!fs.existsSync(filepath)) {
        log(`  SKIP: ${slug} — file not found`);
        return Promise.resolve('skipped');
      }
      return processPage(slug, filepath, i + j + 1, remaining.length);
    });
    
    const batchResults = await Promise.all(promises);
    for (const r of batchResults) {
      if (r === 'ok') results.ok++;
      else if (r === 'under') results.under++;
      else if (r === 'skipped') results.skipped++;
      else results.errors++;
    }
    
    log(`  Batch ${Math.floor(i/CONCURRENCY) + 1} complete. Progress: ${Math.min(i + CONCURRENCY, remaining.length)}/${remaining.length}`);
  }
  
  log(`\n=== PARALLEL FIX SUMMARY ===`);
  log(`At 1800+: ${results.ok}`);
  log(`Under 1800: ${results.under}`);
  log(`Skipped: ${results.skipped}`);
  log(`Errors: ${results.errors}`);
  log('=== DONE ===');
}

main().catch(e => { log(`FATAL: ${e.message}`); process.exit(1); });
