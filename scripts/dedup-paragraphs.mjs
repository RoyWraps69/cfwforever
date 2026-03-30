import fs from 'fs';
import path from 'path';

const API_URL = process.env.BUILT_IN_FORGE_API_URL;
const API_KEY = process.env.BUILT_IN_FORGE_API_KEY;

async function callLLM(messages) {
  const resp = await fetch(`${API_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
    body: JSON.stringify({ messages, temperature: 0.8 }),
  });
  const data = await resp.json();
  return data.choices?.[0]?.message?.content || '';
}

// Shared paragraphs to replace — first 80 chars as identifier
const SHARED_PARAGRAPHS = [
  // Vehicle model pages (20 pages)
  "Every configuration gets a custom design mockup on its exact vehicle template before we cut",
  "All pricing includes design, cast vinyl, installation, and 2-year warranty. Fleet discounts",
  "Every wrap receives DOL 1360 gloss overlaminate",
  "Running more than one vehicle? Fleet pricing applies automatically",
  "Most wrap shops expect you to bring your vehicles to them",
  "Chicago Fleet Wraps eliminates that friction entirely",
  "For fleet programs, we phase pickups and returns",
  "Every wrap comes with a 2-year workmanship warranty covering lifting",
  "To maximize wrap life: hand wash with mild soap",
  "When you add vehicles to your fleet months or years later",
  // Portfolio/blog pages (15 pages)
  "The commercial vehicle wrap industry has a material quality problem",
  "Calendered vinyl is manufactured by extruding liquid PVC",
  "Cast vinyl — specifically Avery Dennison MPI 1105 and 3M IJ180-CV3",
  "Chicago Fleet Wraps operates from a dedicated wrap facility at 4711",
  // Neighborhood pages (20 pages)
  "Fleet discounts: 3% (2–4 vehicles), 7% (5–9), 11% (10–24), 15% (25+)",
  "Standard cargo vans: 1–2 business days. Sprinter vans: 2–3 days",
  "The wrap process for businesses in Chicago neighborhoods is straightforward",
  "Our designer creates mockups on your exact vehicle template",
  "Every installation uses Avery Dennison MPI 1105 or 3M IJ180-CV3 cast vinyl",
  "For a Chicago neighborhood business operating one service van",
  "The wrap targets your exact service territory",
  "Chicago Fleet Wraps uses exclusively Avery Dennison MPI 1105 and 3M IJ180-CV3",
  "On top of the manufacturer warranty, every Chicago Fleet Wraps installation",
  // Geo suburb pages
  "Fleet discounts: 5% off 3–4 vehicles",
  "Call us at (312) 597-1286 or submit an online estimate request",
  "With 9,400+ successful installations and premium materials",
];

function getTitle(html) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1] : '';
}

function getH1(html) {
  const m = html.match(/<h1[^>]*>(.*?)<\/h1>/is);
  return m ? m[1].replace(/<[^>]+>/g, '') : '';
}

function findAndReplaceParagraphs(html) {
  // Find all <p> tags and check if they start with any shared paragraph
  const matches = [];
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let m;
  while ((m = pRegex.exec(html)) !== null) {
    const clean = m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    for (const shared of SHARED_PARAGRAPHS) {
      if (clean.startsWith(shared)) {
        matches.push({
          fullMatch: m[0],
          text: clean,
          index: m.index,
        });
        break;
      }
    }
  }
  return matches;
}

const CONCURRENCY = 8;

async function processPage(filepath) {
  let html = fs.readFileSync(filepath, 'utf-8');
  const title = getTitle(html);
  const h1 = getH1(html);
  const slug = path.basename(path.dirname(filepath));
  
  const matches = findAndReplaceParagraphs(html);
  if (matches.length === 0) {
    return { slug, status: 'skip', count: 0 };
  }
  
  // Build a prompt to rewrite all shared paragraphs at once
  const paraTexts = matches.map((m, i) => `PARAGRAPH ${i+1}:\n${m.text.slice(0, 300)}`).join('\n\n');
  
  const prompt = `You are rewriting duplicate content for the page "${title}" (${slug}).
This page is about: ${h1}

The following ${matches.length} paragraphs appear identically on many other pages on this site. 
Rewrite EACH paragraph to be unique to THIS specific page topic (${h1}).
Keep the same factual information but:
- Use different sentence structures and word choices
- Add specific details relevant to "${slug}" or "${h1}"
- Vary the opening words
- Keep similar length (within 20% of original)
- Keep any phone numbers, addresses, or specific data points accurate
- Do NOT add HTML tags — return plain text only

Return EXACTLY ${matches.length} rewritten paragraphs, separated by "---PARA---" on its own line.

${paraTexts}`;

  try {
    const result = await callLLM([
      { role: 'system', content: 'You rewrite duplicate content to be unique. Return ONLY the rewritten paragraphs separated by ---PARA--- markers. No explanations.' },
      { role: 'user', content: prompt }
    ]);
    
    const newParas = result.split('---PARA---').map(p => p.trim()).filter(p => p.length > 20);
    
    if (newParas.length !== matches.length) {
      console.log(`  WARNING: ${slug} — expected ${matches.length} paragraphs, got ${newParas.length}`);
      // Use what we can
    }
    
    // Replace each matched paragraph with its rewritten version
    let modified = html;
    for (let i = Math.min(newParas.length, matches.length) - 1; i >= 0; i--) {
      const match = matches[i];
      // Extract the opening <p> tag to preserve classes/styles
      const pTagMatch = match.fullMatch.match(/^<p[^>]*>/i);
      const openTag = pTagMatch ? pTagMatch[0] : '<p>';
      const newParagraph = `${openTag}${newParas[i]}</p>`;
      modified = modified.slice(0, match.index) + newParagraph + modified.slice(match.index + match.fullMatch.length);
    }
    
    fs.writeFileSync(filepath, modified);
    const replaced = Math.min(newParas.length, matches.length);
    console.log(`  DONE: /${slug}/ — ${replaced}/${matches.length} paragraphs rewritten`);
    return { slug, status: 'done', count: replaced };
  } catch (e) {
    console.log(`  ERROR: ${slug} — ${e.message}`);
    return { slug, status: 'error', count: 0 };
  }
}

async function main() {
  // Find all pages with shared paragraphs
  const skipDirs = new Set(['images','js','css','fonts','icons','public-backup']);
  const pagesToFix = [];
  
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory() && !skipDirs.has(entry.name)) {
        walk(path.join(dir, entry.name));
      }
      if (entry.name === 'index.html') {
        const filepath = path.join(dir, entry.name);
        const html = fs.readFileSync(filepath, 'utf-8');
        const matches = findAndReplaceParagraphs(html);
        if (matches.length > 0) {
          pagesToFix.push({ filepath, count: matches.length });
        }
      }
    }
  }
  
  walk('public');
  console.log(`Found ${pagesToFix.length} pages with shared paragraphs to rewrite`);
  console.log(`Total paragraphs to rewrite: ${pagesToFix.reduce((s, p) => s + p.count, 0)}`);
  
  // Process in batches
  let done = 0;
  let errors = 0;
  let totalReplaced = 0;
  
  for (let i = 0; i < pagesToFix.length; i += CONCURRENCY) {
    const batch = pagesToFix.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(p => processPage(p.filepath)));
    for (const r of results) {
      if (r.status === 'done') { done++; totalReplaced += r.count; }
      else if (r.status === 'error') errors++;
    }
    console.log(`  Batch ${Math.floor(i/CONCURRENCY) + 1} done (${Math.min(i + CONCURRENCY, pagesToFix.length)}/${pagesToFix.length})`);
  }
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Pages processed: ${done}`);
  console.log(`Paragraphs replaced: ${totalReplaced}`);
  console.log(`Errors: ${errors}`);
}

main().catch(console.error);
