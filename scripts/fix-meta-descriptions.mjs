import fs from 'fs';
import path from 'path';

const API_URL = process.env.BUILT_IN_FORGE_API_URL;
const API_KEY = process.env.BUILT_IN_FORGE_API_KEY;

// Pages that need new meta descriptions (duplicates + short + long)
const PAGES_TO_FIX = [
  // Duplicate group 1: "Boost your brand..."
  'chicago', 'downtown-chicago', 'river-north', 'schaumburg', 'skokie', 'west-loop', 'wheaton', 'south-loop',
  // Duplicate group 2: "Transform your vehicle..."
  'chrome-delete-chicago', 'color-change-wraps', 'colorchange',
  // Duplicate group 3: "Protect your vehicle..."
  'ceramic-coating-chicago', 'paint-protection-film-ppf',
  // Duplicate group 4: "Discover Chicago Fleet Wraps..."
  'servicearea', 'warranty',
  // Short meta descriptions
  'about', 'apparel', 'brand-audit', 'care', 'food-truck-wraps-chicago',
  'materials', 'moving', 'nonprofit-vehicle-wraps', 'old-town', 'portfolio',
  'tesla-wraps-chicago', 'vehicle-wrap-cost-chicago', 'brandaudit', 'beforeafter',
  'refund-policy', 'blue-origin-rivian-fleet-wrap',
  'contractor-vehicle-wraps-chicago', 'delivery-fleet-wraps-chicago',
  'electrician-vehicle-wraps-chicago',
  // Long meta descriptions
  'video',
];

async function callLLM(messages) {
  const resp = await fetch(`${API_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({ messages, temperature: 0.7 }),
  });
  const data = await resp.json();
  return data.choices?.[0]?.message?.content || '';
}

function getTitle(html) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1] : '';
}

function getH1(html) {
  const m = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);
  return m ? m[1].replace(/<[^>]+>/g, '') : '';
}

function stripHtml(html) {
  let text = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<[^>]+>/g, ' ');
  return text.replace(/\s+/g, ' ').trim();
}

const CONCURRENCY = 10;

async function processPage(slug) {
  const dir = slug === '' ? 'public' : `public/${slug}`;
  const filepath = `${dir}/index.html`;
  
  if (!fs.existsSync(filepath)) {
    console.log(`  SKIP: ${slug} — file not found`);
    return;
  }
  
  let html = fs.readFileSync(filepath, 'utf-8');
  const title = getTitle(html);
  const h1 = getH1(html);
  const textContent = stripHtml(html).slice(0, 1500);
  
  const prompt = `Write a unique meta description for this webpage. Requirements:
- EXACTLY 130-155 characters (this is critical — count carefully)
- Include the primary keyword from the title
- Include "Chicago" if relevant
- Include a call to action (e.g., "Get a free estimate", "Call today", "Learn more")
- Must be unique and specific to THIS page's content
- Do NOT start with "Discover" or "Boost" — use varied openers
- Return ONLY the meta description text, nothing else

Page title: ${title}
Page H1: ${h1}
Page content excerpt: ${textContent.slice(0, 500)}`;

  try {
    const desc = (await callLLM([
      { role: 'system', content: 'You write SEO meta descriptions. Return ONLY the description text, no quotes, no explanation.' },
      { role: 'user', content: prompt }
    ])).trim().replace(/^["']|["']$/g, '');
    
    if (desc.length < 80 || desc.length > 200) {
      console.log(`  WARNING: ${slug} — desc length ${desc.length}: ${desc.slice(0, 60)}...`);
    }
    
    // Replace existing meta description
    const metaPat1 = /<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?>/i;
    const metaPat2 = /<meta\s+content=["'][^"']*["']\s+name=["']description["']\s*\/?>/i;
    
    const newTag = `<meta name="description" content="${desc.replace(/"/g, '&quot;')}">`;
    
    if (metaPat1.test(html)) {
      html = html.replace(metaPat1, newTag);
    } else if (metaPat2.test(html)) {
      html = html.replace(metaPat2, newTag);
    } else {
      // No meta description — insert after <head>
      html = html.replace(/<head[^>]*>/i, `$&\n${newTag}`);
    }
    
    // Also update og:description to match
    const ogDescPat = /<meta\s+property=["']og:description["']\s+content=["'][^"']*["']\s*\/?>/i;
    const newOgTag = `<meta property="og:description" content="${desc.replace(/"/g, '&quot;')}">`;
    if (ogDescPat.test(html)) {
      html = html.replace(ogDescPat, newOgTag);
    }
    
    fs.writeFileSync(filepath, html);
    console.log(`  DONE: /${slug}/ (${desc.length} chars)`);
  } catch (e) {
    console.log(`  ERROR: ${slug} — ${e.message}`);
  }
}

async function main() {
  console.log(`Fixing meta descriptions for ${PAGES_TO_FIX.length} pages...`);
  
  // Process in batches of CONCURRENCY
  for (let i = 0; i < PAGES_TO_FIX.length; i += CONCURRENCY) {
    const batch = PAGES_TO_FIX.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(slug => processPage(slug)));
    console.log(`  Batch ${Math.floor(i/CONCURRENCY) + 1} complete (${Math.min(i + CONCURRENCY, PAGES_TO_FIX.length)}/${PAGES_TO_FIX.length})`);
  }
  
  console.log('\n=== DONE ===');
}

main().catch(console.error);
