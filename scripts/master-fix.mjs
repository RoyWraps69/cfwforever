#!/usr/bin/env node
/**
 * MASTER FIX SCRIPT
 * Processes every page on chicagofleetwraps.com to:
 * 1. Remove all shared/duplicate content blocks
 * 2. Generate unique replacement content via LLM
 * 3. Add unique meta descriptions
 * 4. Add missing schema (LocalBusiness, FAQPage, BreadcrumbList)
 * 5. Ensure proper H1/H2/H3 hierarchy
 * 6. Target 1800+ words per page
 * 7. Optimize for geo/AIO/AEO/LLM/AI/SEO
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, '..', 'public');
const API_URL = process.env.BUILT_IN_FORGE_API_URL || 'https://forge.manus.ai';
const API_KEY = process.env.BUILT_IN_FORGE_API_KEY;
const LOG_FILE = path.join(__dirname, '..', 'master-fix-log.txt');

if (!API_KEY) { console.error('BUILT_IN_FORGE_API_KEY not set'); process.exit(1); }

// ── Helpers ──────────────────────────────────────────────────────────────
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

async function callLLM(prompt, maxTokens = 16000) {
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
          max_tokens: maxTokens,
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
      if (attempt < 2) await new Promise(r => setTimeout(r, 5000 * (attempt + 1)));
    }
  }
  return null;
}

const SYSTEM_PROMPT = `You are an expert SEO content writer for Chicago Fleet Wraps (CFW), a premium vehicle wrap company in Chicago since 2001. They've wrapped 9,400+ vehicles. They use Avery Dennison MPI 1105 and 3M IJ180-CV3 cast vinyl exclusively. Zero verified paint damage claims. 2-year workmanship warranty. Free fleet pickup across Chicagoland.

Key facts:
- Location: 4711 N Lamon Ave #7, Chicago, IL 60630
- Phone: (312) 971-3828
- Services: fleet wraps, truck wraps, van wraps, car wraps, color change wraps, commercial wraps, box truck wraps, sprinter wraps, EV wraps, boat wraps, wall wraps, partial wraps, full wraps, lettering, decals
- Premium materials ONLY: Avery Dennison MPI 1105, 3M IJ180-CV3 cast vinyl
- Industries served: HVAC, plumbing, electrical, landscaping, construction, delivery, food trucks, real estate, nonprofits
- Service area: All of Chicago and suburbs (Naperville, Schaumburg, Elmhurst, Oak Brook, Evanston, etc.)

RULES:
- Write in a professional but approachable tone
- Every paragraph must be UNIQUE — never repeat content from other pages
- Include specific Chicago-area references (neighborhoods, highways, landmarks)
- Include specific pricing ranges where appropriate
- Include specific vehicle models where relevant
- Naturally incorporate target keywords without stuffing
- Write for humans first, search engines second
- All facts must be verifiable and accurate
- Do NOT mention die cut vinyl, magnetics, or window tint
- Author attribution: Roy Wraps
- Output raw HTML only — no markdown, no code fences`;

// ── Page Discovery ───────────────────────────────────────────────────────
function discoverPages() {
  const pages = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        const skip = ['images', 'js', 'css', 'fonts', 'icons', 'node_modules', '.git'];
        if (!skip.includes(entry.name)) walk(path.join(dir, entry.name));
      } else if (entry.name === 'index.html') {
        const filepath = path.join(dir, entry.name);
        const rel = path.relative(PUBLIC, dir);
        const slug = rel === '.' ? '/' : '/' + rel.replace(/\\/g, '/') + '/';
        pages.push({ slug, filepath });
      }
    }
  }
  walk(PUBLIC);
  return pages.sort((a, b) => a.slug.localeCompare(b.slug));
}

// ── Classify Page Type ───────────────────────────────────────────────────
function classifyPage(slug) {
  const s = slug.replace(/^\/|\/$/g, '');
  if (!s || s === '') return { type: 'homepage', topic: 'Chicago Fleet Wraps' };
  if (s.startsWith('post/')) return { type: 'blog', topic: s.replace('post/', '').replace(/-/g, ' ') };
  if (s.startsWith('video/') || s === 'video') return { type: 'video', topic: s.replace(/-/g, ' ') };
  if (['estimate', 'contact', 'calculator', 'wrap-calculator', 'schedule', 'intake', '404',
       'googleac4190c5fb66b0fb', 'estimate/thank-you', 'refund-policy', 'custom-sitemap',
       'boating', 'brandaudit', 'visualizer', 'stats', 'roi', 'vsads', 'beforeafter',
       'portfolio', 'materials', 'vinyl', 'vinyl-guide', 'apparel', 'care', 'removal',
       'lettering', 'blog', 'faq', 'about', 'brand-audit'].includes(s))
    return { type: 'utility', topic: s.replace(/-/g, ' ') };
  
  // Portfolio case studies
  if (s.endsWith('-fleet-wrap') && !s.includes('fleet-wraps-chicago'))
    return { type: 'portfolio', topic: s.replace(/-/g, ' ') };
  
  // Neighborhoods
  const neighborhoods = ['albany-park','austin','belmont-cragin','bronzeville','cicero','downtown-chicago',
    'dunning','edgewater','forest-glen','garfield-park','gold-coast','hermosa','humboldt-park',
    'kenwood','loop','montclaire','north-lawndale','norwood-park','south-lawndale','ukrainian-village',
    'andersonville','avondale','bridgeport','bucktown','hyde-park','irving-park','jefferson-park',
    'lakeview','lincoln-park','lincoln-square','logan-square','old-town','pilsen','portage-park',
    'ravenswood','rogers-park','roscoe-village','south-loop','uptown','west-loop','west-town',
    'wicker-park','woodlawn','chicago'];
  if (neighborhoods.includes(s)) return { type: 'geo_neighborhood', topic: s.replace(/-/g, ' ') };
  
  // Suburbs
  const suburbs = ['addison','arlington-heights','aurora','bartlett','berwyn','bloomingdale',
    'bolingbrook','carol-stream','downers-grove','elmhurst','glendale-heights','hanover-park',
    'hoffman-estates','itasca','lombard','naperville','oak-brook','oak-park','palatine','roselle',
    'schaumburg','skokie','villa-park','wheaton','wood-dale','des-plaines','elgin','evanston','joliet',
    'tinley-park','orland-park','plainfield'];
  if (suburbs.includes(s)) return { type: 'geo_suburb', topic: s.replace(/-/g, ' ') };
  
  // Vehicle model pages
  if (s.match(/^(ford|chevy|ram|gmc|mercedes|freightliner|hino|isuzu|rivian|tesla)/))
    return { type: 'vehicle_model', topic: s.replace(/-/g, ' ') };
  
  // Service pages (everything else with wraps/wrap in the name)
  return { type: 'service', topic: s.replace(/-/g, ' ') };
}

// ── Shared Content Block Patterns ────────────────────────────────────────
const SHARED_BLOCKS = [
  // Block 1: "Why Chicago Fleet Wraps" (hand-crafted template)
  { name: 'why-cfw', regex: /<h2>Why Chicago Fleet Wraps<\/h2>[\s\S]*?(?=<h2>What Every Wrap Includes<\/h2>|<h2>Fleet Wrap Pricing<\/h2>|<h2>The Wrap Process<\/h2>|<h2>Frequently Asked|<\/section>|<footer)/i },
  // Block 2: "What Every Wrap Includes"
  { name: 'includes', regex: /<h2>What Every Wrap Includes<\/h2>[\s\S]*?(?=<h2>Fleet Wrap Pricing<\/h2>|<h2>The Wrap Process<\/h2>|<h2>Frequently Asked|<\/section>|<footer)/i },
  // Block 3: "Fleet Wrap Pricing" (shared generic version)
  { name: 'pricing', regex: /<h2>Fleet Wrap Pricing<\/h2>[\s\S]*?(?=<h2>The Wrap Process<\/h2>|<h2>Frequently Asked|<\/section>|<footer)/i },
  // Block 4: "The Wrap Process"
  { name: 'process', regex: /<h2>The Wrap Process<\/h2>[\s\S]*?(?=<h2>Frequently Asked|<\/section>|<footer)/i },
  // Block 5: Generated template "Premium Vehicle Wrap Solutions"
  { name: 'premium-solutions', regex: /<h2>Premium Vehicle Wrap Solutions<\/h2>[\s\S]*?(?=<h2>Why Choose Chicago Fleet Wraps|<\/section>|<footer)/i },
  // Block 6: Generated "Why Choose Chicago Fleet Wraps for Your Needs?"
  { name: 'why-choose', regex: /<h2>Why Choose Chicago Fleet Wraps for Your Needs\?<\/h2>[\s\S]*?(?=<h2>Industry Expertise|<\/section>|<footer)/i },
  // Block 7: Generated "Industry Expertise & Specialization"
  { name: 'industry', regex: /<h2>Industry Expertise &amp; Specialization<\/h2>[\s\S]*?(?=<h2>Our Proven Wrap Process|<\/section>|<footer)/i },
  // Block 8: Generated "Our Proven Wrap Process"
  { name: 'proven-process', regex: /<h2>Our Proven Wrap Process<\/h2>[\s\S]*?(?=<h2>Return on Investment|<\/section>|<footer)/i },
  // Block 9: Generated "Return on Investment"
  { name: 'roi', regex: /<h2>Return on Investment: The Business Case for Vehicle Wraps<\/h2>[\s\S]*?(?=<h2>Common Questions|<\/section>|<footer)/i },
  // Block 10: Generated "Common Questions About Our Services"
  { name: 'common-questions', regex: /<h2>Common Questions About Our Services<\/h2>[\s\S]*?(?=<h2>What Our Clients Say|<\/section>|<footer)/i },
  // Block 11: Generated "What Our Clients Say"
  { name: 'testimonials', regex: /<h2>What Our Clients Say<\/h2>[\s\S]*?(?=<h2>Ready to Transform|<\/section>|<footer)/i },
  // Block 12: Generated "Ready to Transform Your Vehicle?"
  { name: 'cta', regex: /<h2>Ready to Transform Your Vehicle\?<\/h2>[\s\S]*?(?=<\/section>|<footer)/i },
];

// ── Remove Shared Blocks ─────────────────────────────────────────────────
function removeSharedBlocks(html) {
  let modified = html;
  const removed = [];
  for (const block of SHARED_BLOCKS) {
    if (block.regex.test(modified)) {
      modified = modified.replace(block.regex, '<!-- REPLACED: ' + block.name + ' -->');
      removed.push(block.name);
    }
  }
  // Also remove duplicate FAQ sections (second "Frequently Asked Questions")
  const faqMatches = [...modified.matchAll(/<h2[^>]*>Frequently Asked Questions<\/h2>/gi)];
  if (faqMatches.length > 1) {
    // Remove all but the first FAQ section
    let count = 0;
    modified = modified.replace(/<h2[^>]*>Frequently Asked Questions<\/h2>[\s\S]*?(?=<h2|<\/section>|<footer|$)/gi, (match) => {
      count++;
      if (count > 1) {
        removed.push('duplicate-faq-' + count);
        return '<!-- REPLACED: duplicate-faq -->';
      }
      return match;
    });
  }
  return { html: modified, removed };
}

// ── Schema Generators ────────────────────────────────────────────────────
function localBusinessSchema() {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Chicago Fleet Wraps",
    "image": "https://chicagofleetwraps.com/images/cfw-logo.png",
    "url": "https://chicagofleetwraps.com",
    "telephone": "(312) 971-3828",
    "email": "roy@chicagofleetwraps.com",
    "address": { "@type": "PostalAddress", "streetAddress": "4711 N Lamon Ave #7", "addressLocality": "Chicago", "addressRegion": "IL", "postalCode": "60625", "addressCountry": "US" },
    "geo": { "@type": "GeoCoordinates", "latitude": 41.9667, "longitude": -87.7264 },
    "openingHoursSpecification": [
      { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "08:00", "closes": "18:00" },
      { "@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "09:00", "closes": "14:00" }
    ],
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "42" },
    "priceRange": "$$-$$$"
  }, null, 0);
}

function breadcrumbSchema(slug, pageTitle) {
  const parts = slug.replace(/^\/|\/$/g, '').split('/').filter(Boolean);
  const items = [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://chicagofleetwraps.com/" }];
  let path = '';
  parts.forEach((p, i) => {
    path += '/' + p;
    items.push({ "@type": "ListItem", "position": i + 2, "name": pageTitle || p.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), "item": `https://chicagofleetwraps.com${path}/` });
  });
  return JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": items }, null, 0);
}

function faqSchema(faqPairs) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqPairs.map(([q, a]) => ({
      "@type": "Question",
      "name": q,
      "acceptedAnswer": { "@type": "Answer", "text": a }
    }))
  }, null, 0);
}

// ── Check What Schema Exists ─────────────────────────────────────────────
function existingSchemas(html) {
  const schemas = new Set();
  const matches = html.matchAll(/application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi);
  for (const m of matches) {
    try {
      const data = JSON.parse(m[1]);
      if (data['@type']) schemas.add(data['@type']);
      if (Array.isArray(data)) data.forEach(d => d['@type'] && schemas.add(d['@type']));
    } catch {}
  }
  return schemas;
}

// ── Extract Existing Meta Description ────────────────────────────────────
function getMetaDesc(html) {
  const m = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  return m ? m[1] : '';
}

function getTitle(html) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1] : '';
}

function getH1(html) {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return m ? m[1].replace(/<[^>]+>/g, '').trim() : '';
}

// ── Main Processing ──────────────────────────────────────────────────────
async function processPage(page, index, total) {
  const { slug, filepath } = page;
  let html = fs.readFileSync(filepath, 'utf8');
  const classification = classifyPage(slug);
  const currentWords = wordCount(html);
  const h1 = getH1(html);
  const title = getTitle(html);
  const metaDesc = getMetaDesc(html);
  const schemas = existingSchemas(html);
  
  log(`[${index + 1}/${total}] ${slug} — ${classification.type} — ${currentWords} words`);
  
  // Skip non-content pages
  if (['404', 'googleac4190c5fb66b0fb', 'estimate/thank-you'].includes(slug.replace(/^\/|\/$/g, ''))) {
    log(`  SKIP: utility/non-content page`);
    return { slug, status: 'skipped', reason: 'non-content' };
  }
  
  // Step 1: Remove shared/duplicate blocks
  const { html: cleaned, removed } = removeSharedBlocks(html);
  if (removed.length > 0) {
    log(`  Removed ${removed.length} shared blocks: ${removed.join(', ')}`);
    html = cleaned;
  }
  
  // Step 2: Calculate how many words we need to add
  const cleanedWords = wordCount(html);
  const wordsNeeded = Math.max(0, 1800 - cleanedWords);
  
  // Step 3: Generate unique replacement content via LLM
  const prompt = buildPrompt(classification, slug, h1, title, metaDesc, wordsNeeded, removed, cleanedWords);
  const llmResponse = await callLLM(prompt);
  
  if (!llmResponse) {
    log(`  ERROR: LLM failed after 3 attempts`);
    // Restore original if we stripped content
    if (removed.length > 0) {
      fs.writeFileSync(filepath, fs.readFileSync(filepath, 'utf8'));
    }
    return { slug, status: 'error', reason: 'LLM failed' };
  }
  
  // Step 4: Parse LLM response (expects JSON with specific fields)
  let generated;
  try {
    // Extract JSON from response (may be wrapped in code fences)
    let jsonStr = llmResponse;
    const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) jsonStr = fenceMatch[1];
    generated = JSON.parse(jsonStr);
  } catch (e) {
    log(`  ERROR: Failed to parse LLM response as JSON: ${e.message}`);
    log(`  Response preview: ${llmResponse.slice(0, 200)}`);
    return { slug, status: 'error', reason: 'JSON parse failed' };
  }
  
  // Step 5: Apply changes to HTML
  html = applyChanges(html, generated, slug, schemas, h1 || title);
  
  // Step 6: Write back
  fs.writeFileSync(filepath, html);
  const finalWords = wordCount(html);
  log(`  DONE: ${cleanedWords} → ${finalWords} words (${finalWords >= 1800 ? '✅' : '⚠️ still under 1800'})`);
  
  return { slug, status: 'fixed', wordsBefore: currentWords, wordsAfter: finalWords, removed: removed.length };
}

function buildPrompt(classification, slug, h1, title, metaDesc, wordsNeeded, removedBlocks, currentWords) {
  const topicName = h1 || title || classification.topic;
  const pageType = classification.type;
  const cleanSlug = slug.replace(/^\/|\/$/g, '');
  
  let typeGuidance = '';
  switch (pageType) {
    case 'geo_neighborhood':
      typeGuidance = `This is a NEIGHBORHOOD page for "${topicName}" in Chicago. Content must be hyper-local: mention specific streets, landmarks, local businesses, and why vehicle wraps matter for businesses in this specific neighborhood. Include driving directions from this neighborhood to CFW's shop. Mention nearby highways (I-90, I-94, I-290, etc.) and how wrapped vehicles get visibility on them.`;
      break;
    case 'geo_suburb':
      typeGuidance = `This is a SUBURB page for "${topicName}" near Chicago. Content must reference specific local details: population, business districts, major employers, local events, and why businesses in this suburb benefit from fleet wraps. Include distance/drive time to CFW's shop. Mention the suburb's commercial corridors and high-traffic areas where wrapped vehicles get maximum exposure.`;
      break;
    case 'service':
      typeGuidance = `This is a SERVICE page for "${topicName}". Content must be the definitive guide to this specific service. Include detailed pricing ranges, material specifications, installation timelines, before/after expectations, maintenance tips, and ROI data. Compare this service to alternatives. Include industry-specific use cases.`;
      break;
    case 'vehicle_model':
      typeGuidance = `This is a VEHICLE MODEL page for "${topicName}". Content must cover this specific vehicle's wrap specifications: surface area, panel count, installation challenges unique to this model, pricing for this specific vehicle, which industries commonly use this vehicle, and why CFW has specialized experience with this model.`;
      break;
    case 'portfolio':
      typeGuidance = `This is a PORTFOLIO/CASE STUDY page for "${topicName}". Content must tell the story of this specific project: the client's business challenge, the design process, material selection, installation details, and measurable results (increased calls, brand recognition, etc.). Make it read like a compelling business case study.`;
      break;
    case 'blog':
      typeGuidance = `This is a BLOG POST about "${topicName}". Content must be educational, in-depth, and authoritative. Include expert insights, data points, comparisons, and actionable advice. Write as "Roy Wraps" — the author. Include internal links to relevant service pages.`;
      break;
    case 'utility':
      typeGuidance = `This is a UTILITY page for "${topicName}". Add relevant supporting content that helps users understand the purpose of this page and provides SEO value. Include contextual information about CFW's services that relates to this page's function.`;
      break;
    case 'homepage':
      typeGuidance = `This is the HOMEPAGE. Content must establish CFW as Chicago's premier vehicle wrap company. Highlight key differentiators, service range, and social proof. Every section must be unique and compelling.`;
      break;
    default:
      typeGuidance = `Content must be specific to "${topicName}" and provide genuine value to someone searching for this topic in the Chicago area.`;
  }
  
  const blocksToReplace = removedBlocks.length > 0
    ? `\nI removed these shared/duplicate content blocks that need UNIQUE replacements:\n${removedBlocks.map(b => `- ${b}`).join('\n')}\nGenerate unique replacement content for each removed block that is specific to "${topicName}".`
    : '';
  
  return `Generate unique SEO content for the page: ${slug}
Page title: "${title || topicName}"
H1: "${h1 || topicName}"
Page type: ${pageType}
Current word count: ${currentWords}
Words needed to reach 1800: ${wordsNeeded}
${typeGuidance}
${blocksToReplace}

RESPOND WITH VALID JSON ONLY (no markdown fences). The JSON must have these fields:
{
  "meta_description": "A unique 150-160 char meta description specific to this exact page and topic. Must mention Chicago and the specific service/location.",
  "unique_sections": [
    {
      "heading": "H2 heading text — must be unique and keyword-rich for this specific topic",
      "content": "2-4 paragraphs of HTML (<p> tags). Each paragraph 50-80 words. Content must be 100% unique to this page. Include specific details, data, pricing, or local references."
    }
  ],
  "unique_faq": [
    {
      "question": "A specific question about ${topicName} — NOT generic wrap questions",
      "answer": "A detailed 40-60 word answer specific to this topic. Include pricing, timelines, or specifications."
    }
  ]
}

REQUIREMENTS:
- meta_description: exactly 1, unique, 150-160 chars, mentions Chicago + specific topic
- unique_sections: generate ${Math.max(3, Math.ceil(wordsNeeded / 200))} sections to reach 1800+ total words
- unique_faq: generate 6-8 questions, ALL specific to "${topicName}" — NO generic "how long do wraps last" or "can wraps be removed" questions
- Every word must be UNIQUE — never seen on any other page of this site
- Include Chicago-specific references (neighborhoods, highways, landmarks)
- Include specific pricing where relevant ($X,XXX-$X,XXX ranges)
- Include specific vehicle models, materials, or industry details where relevant`;
}

function applyChanges(html, generated, slug, existingSchemas, pageTitle) {
  // 1. Replace meta description
  if (generated.meta_description) {
    const desc = generated.meta_description.replace(/"/g, '&quot;');
    if (html.match(/<meta\s+name=["']description["']/i)) {
      html = html.replace(/<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?>/i,
        `<meta name="description" content="${desc}"/>`);
    } else {
      html = html.replace('</head>', `<meta name="description" content="${desc}"/>\n</head>`);
    }
    // Also update og:description
    if (html.match(/<meta\s+property=["']og:description["']/i)) {
      html = html.replace(/<meta\s+property=["']og:description["']\s+content=["'][^"']*["']\s*\/?>/i,
        `<meta property="og:description" content="${desc}"/>`);
    }
  }
  
  // 2. Insert unique sections (replace the <!-- REPLACED: ... --> markers)
  if (generated.unique_sections && generated.unique_sections.length > 0) {
    let sectionsHtml = '';
    for (const section of generated.unique_sections) {
      sectionsHtml += `\n<h2>${section.heading}</h2>\n${section.content}\n`;
    }
    
    // Find the best insertion point
    // Try to insert before FAQ section, or before footer, or before </main>, or before </body>
    const insertionPoints = [
      /<h2[^>]*>Frequently Asked Questions<\/h2>/i,
      /<!-- REPLACED: [^>]+ -->/,
      /<footer/i,
      /<\/main>/i,
      /<\/body>/i,
    ];
    
    let inserted = false;
    // First, replace all <!-- REPLACED: --> markers with the new content
    const markers = [...html.matchAll(/<!-- REPLACED: [^>]+ -->/g)];
    if (markers.length > 0) {
      // Replace the first marker with all new content, remove the rest
      let firstReplaced = false;
      html = html.replace(/<!-- REPLACED: [^>]+ -->/g, (match) => {
        if (!firstReplaced) {
          firstReplaced = true;
          return sectionsHtml;
        }
        return ''; // Remove subsequent markers
      });
      inserted = true;
    }
    
    if (!inserted) {
      // Insert before FAQ or footer
      for (const point of insertionPoints) {
        if (point.test(html)) {
          html = html.replace(point, sectionsHtml + '\n' + html.match(point)[0]);
          inserted = true;
          break;
        }
      }
    }
    
    if (!inserted) {
      // Last resort: insert before </body>
      html = html.replace('</body>', sectionsHtml + '\n</body>');
    }
  }
  
  // 3. Replace or add FAQ section with unique questions
  if (generated.unique_faq && generated.unique_faq.length > 0) {
    const faqHtml = `<h2>Frequently Asked Questions</h2>\n` +
      generated.unique_faq.map(faq =>
        `<div class="faq-item" itemscope itemtype="https://schema.org/Question">\n` +
        `<h3 itemprop="name">${faq.question}</h3>\n` +
        `<div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">\n` +
        `<p itemprop="text">${faq.answer}</p>\n</div>\n</div>`
      ).join('\n');
    
    // Replace existing FAQ section
    const faqRegex = /<h2[^>]*>Frequently Asked Questions<\/h2>[\s\S]*?(?=<h2[^>]*>(?!Frequently)|<\/section>|<footer|<!-- |<div[^>]*class="[^"]*(?:cta|contact|footer))/i;
    if (faqRegex.test(html)) {
      html = html.replace(faqRegex, faqHtml + '\n');
    }
    
    // Also replace "Common Questions" sections
    const commonQRegex = /<h2[^>]*>Common Questions[^<]*<\/h2>[\s\S]*?(?=<h2|<\/section>|<footer)/i;
    if (commonQRegex.test(html)) {
      html = html.replace(commonQRegex, faqHtml + '\n');
    }
    
    // Add FAQ schema if not present
    if (!existingSchemas.has('FAQPage')) {
      const faqPairs = generated.unique_faq.map(f => [f.question, f.answer]);
      const schemaTag = `<script type="application/ld+json">${faqSchema(faqPairs)}</script>`;
      html = html.replace('</head>', schemaTag + '\n</head>');
    }
  }
  
  // 4. Add missing schemas
  if (!existingSchemas.has('LocalBusiness')) {
    html = html.replace('</head>', `<script type="application/ld+json">${localBusinessSchema()}</script>\n</head>`);
  }
  if (!existingSchemas.has('BreadcrumbList') && slug !== '/') {
    html = html.replace('</head>', `<script type="application/ld+json">${breadcrumbSchema(slug, pageTitle)}</script>\n</head>`);
  }
  
  return html;
}

// ── Main ─────────────────────────────────────────────────────────────────
async function main() {
  fs.writeFileSync(LOG_FILE, '');
  log('=== MASTER FIX SCRIPT STARTED ===');
  
  const pages = discoverPages();
  log(`Found ${pages.length} pages to process`);
  
  const results = { fixed: 0, skipped: 0, errors: 0 };
  const errors = [];
  
  // Process pages sequentially (to avoid rate limits)
  for (let i = 0; i < pages.length; i++) {
    try {
      const result = await processPage(pages[i], i, pages.length);
      if (result.status === 'fixed') results.fixed++;
      else if (result.status === 'skipped') results.skipped++;
      else { results.errors++; errors.push(result); }
    } catch (e) {
      results.errors++;
      errors.push({ slug: pages[i].slug, status: 'error', reason: e.message });
      log(`  EXCEPTION: ${e.message}`);
    }
    
    // Small delay between pages to avoid rate limits
    if (i < pages.length - 1) await new Promise(r => setTimeout(r, 1000));
  }
  
  log(`\n=== SUMMARY ===`);
  log(`Fixed: ${results.fixed}`);
  log(`Skipped: ${results.skipped}`);
  log(`Errors: ${results.errors}`);
  if (errors.length > 0) {
    log(`\nError details:`);
    errors.forEach(e => log(`  ${e.slug}: ${e.reason}`));
  }
  log('=== MASTER FIX SCRIPT COMPLETE ===');
}

main().catch(e => { log(`FATAL: ${e.message}`); process.exit(1); });
