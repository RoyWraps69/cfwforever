#!/usr/bin/env node
/**
 * restyle-pages.mjs
 * 
 * Post-processing script that converts all page body content from old
 * div.content / div.container / ip- structure to proper homepage-matching
 * section.sec / .w / .sh.shc / .lbl structure.
 * 
 * Run AFTER stamp-header-footer.mjs in the build pipeline.
 * 
 * Usage: node scripts/restyle-pages.mjs [--force]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const FORCE = process.argv.includes('--force');

// Pages to SKIP (already styled correctly or special pages)
const SKIP_PAGES = new Set([
  'index.html',  // homepage
  'css', 'js', 'fonts', 'images', 'studio', 'originals', 'client', 'logos', 'sm',
]);

// Pages that should NOT be restyled (functional pages with special layouts)
const SKIP_SLUGS = new Set([
  'portfolio', 'wrap-calculator', 'calculator', 'beforeafter', 'visualizer',
  'estimate', 'contact', 'intake', 'schedule', 'rent-the-bay', 'site',
  'custom-sitemap', 'googleac4190c5fb66b0fb', '404', 'vehicle-wrap-training-manual',
]);

// Eyebrow labels for different section types
function getEyebrowLabel(h2Text, pageSlug) {
  const t = h2Text.toLowerCase();
  if (t.includes('pricing') || t.includes('cost') || t.includes('price')) return 'Transparent Pricing';
  if (t.includes('faq') || t.includes('frequently asked') || t.includes('common question')) return 'Common Questions';
  if (t.includes('why') && (t.includes('wrap') || t.includes('choose') || t.includes('should'))) return 'Why Choose Us';
  if (t.includes('service area') || t.includes('near me') || t.includes('chicagoland')) return 'Service Area';
  if (t.includes('material') || t.includes('vinyl') || t.includes('avery') || t.includes('3m')) return 'Premium Materials';
  if (t.includes('process') || t.includes('how it works') || t.includes('step') || t.includes('included')) return 'Our Process';
  if (t.includes('roi') || t.includes('return') || t.includes('investment') || t.includes('measuring')) return 'ROI & Results';
  if (t.includes('portfolio') || t.includes('gallery') || t.includes('recent work') || t.includes('real client')) return 'Recent Work';
  if (t.includes('review') || t.includes('testimonial') || t.includes('client say')) return 'Client Reviews';
  if (t.includes('industry') || t.includes('industries') || t.includes('we serve')) return 'Industries Served';
  if (t.includes('fleet') || t.includes('vehicle type') || t.includes('what we wrap')) return 'Fleet Services';
  if (t.includes('benefit') || t.includes('advantage')) return 'Key Benefits';
  if (t.includes('getting') || t.includes('route') || t.includes('drive') || t.includes('location')) return 'Getting Here';
  if (t.includes('business district') || t.includes('high-traffic') || t.includes('corridor')) return 'High-Traffic Areas';
  if (t.includes('landmark') || t.includes('local area')) return 'Local Area';
  if (t.includes('explore') || t.includes('related') || t.includes('more service')) return 'Explore More';
  if (t.includes('brand') || t.includes('elevate') || t.includes('boost')) return 'Brand Impact';
  if (t.includes('durable') || t.includes('damage') || t.includes('protect')) return 'Durability';
  if (t.includes('tailored') || t.includes('custom') || t.includes('solution')) return 'Custom Solutions';
  if (t.includes('seamless') || t.includes('turnaround') || t.includes('rapid')) return 'Fast Turnaround';
  if (t.includes('tax') || t.includes('deduct') || t.includes('179') || t.includes('irs')) return 'Tax Benefits';
  if (t.includes('color') || t.includes('finish') || t.includes('option')) return 'Options & Finishes';
  if (t.includes('care') || t.includes('maintain') || t.includes('wash')) return 'Wrap Care';
  if (t.includes('compare') || t.includes('vs') || t.includes('versus')) return 'Comparison';
  return 'Expert Insight';
}

// Check if a page already has proper .sec structure
function isAlreadyStyled(html) {
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (!mainMatch) return false;
  const mainContent = mainMatch[1];
  const secCount = (mainContent.match(/class="sec(?:\s|")/g) || []).length;
  return secCount >= 3; // At least 3 .sec sections means it's already styled
}

// Extract the hero banner section (keep as-is)
function extractHero(mainContent) {
  // Match page-hero-banner div or section
  const heroMatch = mainContent.match(/<(?:div|section)\s+class="page-hero-banner"[^>]*>[\s\S]*?<\/(?:div|section)>/i);
  if (heroMatch) {
    return { hero: heroMatch[0], rest: mainContent.replace(heroMatch[0], '') };
  }
  return { hero: '', rest: mainContent };
}

// Parse content into h2-delimited sections
function parseIntoSections(html) {
  const sections = [];
  
  // Remove wrapper divs (content, container, ip-main, etc.)
  let content = html;
  content = content.replace(/<div\s+class="(?:content|container)"[^>]*>/gi, '');
  content = content.replace(/<main\s+[^>]*>/gi, '');
  content = content.replace(/<\/main>/gi, '');
  
  // Remove ip- wrapper elements
  content = content.replace(/<(?:section|div)\s+class="ip-[^"]*"[^>]*>/gi, '');
  
  // Remove old overview sections wrappers but keep content
  content = content.replace(/<section\s+class="overview"[^>]*>/gi, '');
  
  // Remove closing tags for removed wrappers (rough cleanup)
  // We'll handle this by splitting on h2 tags
  
  // Split on h2 tags, keeping the h2 content
  const h2Pattern = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  const parts = [];
  let lastIndex = 0;
  let match;
  
  while ((match = h2Pattern.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const before = content.substring(lastIndex, match.index).trim();
      if (before && parts.length > 0) {
        parts[parts.length - 1].content += before;
      } else if (before) {
        parts.push({ h2: '', h2Html: '', content: before, isIntro: true });
      }
    }
    parts.push({ h2: match[1].replace(/<[^>]+>/g, '').trim(), h2Html: match[0], content: '' });
    lastIndex = match.index + match[0].length;
  }
  
  if (lastIndex < content.length) {
    const remaining = content.substring(lastIndex).trim();
    if (remaining && parts.length > 0) {
      parts[parts.length - 1].content += remaining;
    } else if (remaining) {
      parts.push({ h2: '', h2Html: '', content: remaining, isIntro: true });
    }
  }
  
  return parts;
}

// Clean up content - remove stray closing divs/sections, fix nesting
function cleanContent(html) {
  let clean = html;
  
  // Remove stray closing tags from removed wrappers
  clean = clean.replace(/<\/section>\s*<\/section>/g, '</section>');
  
  // Remove empty divs
  clean = clean.replace(/<div[^>]*>\s*<\/div>/g, '');
  
  // Remove old content-section wrappers
  clean = clean.replace(/<section\s+class="content-section[^"]*"[^>]*>/gi, '');
  
  // Remove old internal-links-section wrappers
  clean = clean.replace(/<section\s+class="internal-links-section[^"]*"[^>]*>/gi, '');
  
  // Remove hub-spoke-links nav
  clean = clean.replace(/<nav\s+class="hub-spoke-links[^"]*"[^>]*>[\s\S]*?<\/nav>/gi, '');
  
  // Remove last-updated paragraphs
  clean = clean.replace(/<p\s+class="last-updated"[^>]*>[\s\S]*?<\/p>/gi, '');
  
  // Clean up excessive whitespace
  clean = clean.replace(/\n{3,}/g, '\n\n');
  
  return clean.trim();
}

// Convert a section's content to proper card/grid layout where appropriate
function enhanceContent(content, h2Text) {
  let enhanced = content;
  const t = h2Text.toLowerCase();
  
  // Convert pricing tables - keep them but ensure they have the class
  enhanced = enhanced.replace(/<table(?!\s+class)/g, '<table class="pricing-table"');
  
  // Convert inline-style link blocks to proper .ic grid
  const linkBlockMatch = enhanced.match(/<div\s+style="display:flex;flex-wrap:wrap;gap:[^"]*"[^>]*>([\s\S]*?)<\/div>/gi);
  if (linkBlockMatch) {
    linkBlockMatch.forEach(block => {
      const links = block.match(/<a\s+[^>]*>[\s\S]*?<\/a>/gi) || [];
      if (links.length > 0) {
        const cleanLinks = links.map(link => {
          // Extract href and text
          const hrefMatch = link.match(/href="([^"]*)"/);
          const textMatch = link.replace(/<[^>]+>/g, '').trim();
          const href = hrefMatch ? hrefMatch[1] : '#';
          return `<a class="ic" href="${href}" style="text-decoration:none;color:inherit">${textMatch}</a>`;
        }).join('\n');
        const grid = `<div class="sgrid" style="margin-top:16px">\n${cleanLinks}\n</div>`;
        enhanced = enhanced.replace(block, grid);
      }
    });
  }
  
  // Convert trust spans
  enhanced = enhanced.replace(/<div\s+class="trust"[^>]*>/g, '<div class="trust" style="margin-top:16px">');
  
  // Remove old inline styles from sections
  enhanced = enhanced.replace(/style="padding:2rem 5%;max-width:1200px;margin:0 auto;"/g, '');
  
  return enhanced;
}

// Build the new <main> content with proper .sec structure
function buildStyledMain(hero, sections, pageSlug) {
  let html = '<main role="main">\n';
  
  // Add hero if present
  if (hero) {
    html += hero + '\n';
  }
  
  let sectionIndex = 0;
  
  for (const section of sections) {
    if (!section.h2 && !section.content.trim()) continue;
    
    const isAlternate = sectionIndex % 2 === 1;
    const secClass = isAlternate ? 'sec sd' : 'sec';
    const label = section.h2 ? getEyebrowLabel(section.h2, pageSlug) : '';
    
    // Clean the content
    let content = cleanContent(section.content);
    
    // Skip empty sections
    if (!section.h2 && !content) continue;
    
    // Enhance content with proper layouts
    if (section.h2) {
      content = enhanceContent(content, section.h2);
    }
    
    // Check if this is a CTA-type section
    const isCta = section.h2 && (
      section.h2.toLowerCase().includes('ready to') ||
      section.h2.toLowerCase().includes('get your') ||
      section.h2.toLowerCase().includes('free estimate') ||
      section.h2.toLowerCase().includes('get started') ||
      section.h2.toLowerCase().includes('contact us')
    );
    
    if (isCta) {
      // CTA block
      html += `\n<section class="ctab">
<div class="w">
<div class="ctai">
<div>
<h2>${section.h2}</h2>
${content}
</div>
<div style="display:flex;gap:12px;flex-wrap:wrap">
<a href="/estimate/" class="btn bg" style="font-size:1.05rem;padding:14px 36px">Get Your Free Estimate →</a>
<a href="tel:+13125971286" class="btn bo" style="border-color:var(--gold);color:var(--gold)">📞 (312) 597-1286</a>
</div>
</div>
</div>
</section>\n`;
    } else if (section.isIntro && !section.h2) {
      // Intro section - first content before any h2
      html += `\n<section class="sec">
<div class="w">
${content}
</div>
</section>\n`;
    } else {
      // Regular section with h2
      html += `\n<section class="${secClass}">
<div class="w">
<div class="sh shc"><span class="lbl">${label}</span><h2>${section.h2}</h2></div>
${content}
</div>
</section>\n`;
    }
    
    sectionIndex++;
  }
  
  // Add CTA if none exists
  const hasCta = html.includes('class="ctab"');
  if (!hasCta) {
    html += `\n<section class="ctab">
<div class="w">
<div class="ctai">
<div>
<h2>Ready to Wrap Your <span>Fleet</span>?</h2>
<p>Free estimates within 2 hours. Free pickup anywhere in Chicagoland.</p>
</div>
<div style="display:flex;gap:12px;flex-wrap:wrap">
<a href="/estimate/" class="btn bg" style="font-size:1.05rem;padding:14px 36px">Get Your Free Estimate →</a>
<a href="tel:+13125971286" class="btn bo" style="border-color:var(--gold);color:var(--gold)">📞 (312) 597-1286</a>
</div>
</div>
</div>
</section>\n`;
  }
  
  html += '</main>';
  return html;
}

// Process a single HTML file
function processFile(filePath, slug) {
  let html = fs.readFileSync(filePath, 'utf-8');
  const lines = html.split('\n').length;
  
  // Skip redirect stubs
  if (lines <= 20) return { status: 'skip-redirect' };
  
  // Skip already styled pages
  if (isAlreadyStyled(html)) return { status: 'skip-styled' };
  
  // Extract <main> content
  let mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  
  // If no <main> tag, wrap content between header and footer in <main>
  if (!mainMatch) {
    const footerIdx = html.indexOf('<footer');
    if (footerIdx > 0) {
      const headerEndIdx = html.indexOf('</header>');
      let contentStart = -1;
      
      if (headerEndIdx > 0) {
        const afterHeader = html.substring(headerEndIdx);
        const contentMatch = afterHeader.match(/<(?:div\s+class="(?:content|container|page-hero|hero)|h1|nav\s+class="breadcrumb)/i);
        if (contentMatch) {
          contentStart = headerEndIdx + contentMatch.index;
        }
      }
      
      if (contentStart > 0 && contentStart < footerIdx) {
        const bodyContent = html.substring(contentStart, footerIdx);
        html = html.substring(0, contentStart) + '<main role="main">\n' + bodyContent + '\n</main>\n' + html.substring(footerIdx);
        mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
      }
    }
    
    if (!mainMatch) return { status: 'skip-no-main' };
  }
  
  const mainContent = mainMatch[1];
  const fullMainTag = mainMatch[0];
  
  // Extract hero
  const { hero, rest } = extractHero(mainContent);
  
  // Parse into sections
  const sections = parseIntoSections(rest);
  
  if (sections.length === 0) return { status: 'skip-empty' };
  
  // Build new styled main
  const newMain = buildStyledMain(hero, sections, slug);
  
  // Replace old main with new
  const newHtml = html.replace(fullMainTag, newMain);
  
  fs.writeFileSync(filePath, newHtml, 'utf-8');
  return { status: 'restyled', sections: sections.length };
}

// Main execution
console.log('🎨 Restyling pages to match homepage structure...\n');

let restyled = 0;
let skipped = 0;
let errors = 0;

// Process all HTML files in public directory
function walkDir(dir, depth = 0) {
  if (depth > 3) return; // Don't go too deep
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_PAGES.has(entry.name)) continue;
      
      const indexPath = path.join(dir, entry.name, 'index.html');
      if (fs.existsSync(indexPath)) {
        const slug = entry.name;
        
        if (SKIP_SLUGS.has(slug)) {
          console.log(`  ⏭  /${slug}/ — skipped (special page)`);
          skipped++;
          continue;
        }
        
        try {
          const result = processFile(indexPath, slug);
          
          switch (result.status) {
            case 'restyled':
              console.log(`  ✅ /${slug}/ — restyled (${result.sections} sections)`);
              restyled++;
              break;
            case 'skip-redirect':
              skipped++;
              break;
            case 'skip-styled':
              console.log(`  ✓  /${slug}/ — already styled`);
              skipped++;
              break;
            case 'skip-no-main':
              console.log(`  ⚠  /${slug}/ — no <main> tag found`);
              skipped++;
              break;
            case 'skip-empty':
              console.log(`  ⚠  /${slug}/ — empty content`);
              skipped++;
              break;
          }
        } catch (err) {
          console.error(`  ❌ /${slug}/ — error: ${err.message}`);
          errors++;
        }
      }
      
      // Also process subdirectories (for post/ etc.)
      walkDir(path.join(dir, entry.name), depth + 1);
    }
  }
}

walkDir(PUBLIC_DIR);

console.log(`\n🎨 Restyle complete:`);
console.log(`   Restyled: ${restyled} pages`);
console.log(`   Skipped: ${skipped} pages`);
console.log(`   Errors: ${errors} pages`);
