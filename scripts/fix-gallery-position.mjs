#!/usr/bin/env node
/**
 * fix-gallery-position.mjs
 * 
 * Finds pages where the cfw-gallery-cols-3 gallery ended up inside the 
 * page-hero-banner section and moves it to its own standalone section
 * right after the logo-belt or stats section.
 */

import fs from 'fs';
import path from 'path';

const PUBLIC = path.resolve('public');
let fixed = 0;

function findAllPages(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findAllPages(full));
    else if (entry.name === 'index.html') results.push(full);
  }
  return results;
}

const allPages = findAllPages(PUBLIC);

for (const filePath of allPages) {
  let html = fs.readFileSync(filePath, 'utf-8');
  
  // Skip pages without gallery
  if (!html.includes('cfw-gallery-cols-3')) continue;
  
  // Check if gallery is inside the hero section
  const heroStart = html.indexOf('<section class="page-hero-banner"');
  if (heroStart === -1) continue;
  
  // Find the end of the hero section
  const heroEnd = html.indexOf('</section>', heroStart);
  if (heroEnd === -1) continue;
  
  const heroContent = html.substring(heroStart, heroEnd + '</section>'.length);
  
  // Is the gallery inside the hero?
  if (!heroContent.includes('cfw-gallery-cols-3')) continue;
  
  const slug = path.relative(PUBLIC, path.dirname(filePath));
  
  // Extract the gallery block (from <div class="cfw-gallery to closing caption <p>)
  const galleryStartIdx = heroContent.indexOf('<div class="cfw-gallery cfw-gallery-cols-3"');
  if (galleryStartIdx === -1) continue;
  
  // Find the end of the gallery block - it ends with the caption paragraph
  let galleryEndSearch = heroContent.indexOf('</p>', heroContent.indexOf('Recent', galleryStartIdx));
  if (galleryEndSearch === -1) {
    // Try without the caption
    galleryEndSearch = heroContent.indexOf('</div>\n', heroContent.lastIndexOf('</div>', heroContent.indexOf('</div>', galleryStartIdx + 50)));
  }
  
  // More robust: extract from gallery start to the caption end
  const captionMatch = heroContent.substring(galleryStartIdx).match(/<div class="cfw-gallery cfw-gallery-cols-3"[\s\S]*?<\/div>\s*\n<p style="text-align:center[^"]*">[^<]*<\/p>/);
  
  if (!captionMatch) {
    // Try without caption
    const noCaptionMatch = heroContent.substring(galleryStartIdx).match(/<div class="cfw-gallery cfw-gallery-cols-3"[\s\S]*?<\/div>\s*\n<\/div>/);
    if (!noCaptionMatch) {
      console.log(`  skip ${slug}: could not extract gallery block`);
      continue;
    }
  }
  
  const galleryBlock = captionMatch ? captionMatch[0] : '';
  if (!galleryBlock) {
    console.log(`  skip ${slug}: empty gallery block`);
    continue;
  }
  
  // Remove gallery from hero
  const absoluteGalleryStart = heroStart + galleryStartIdx;
  const absoluteGalleryEnd = absoluteGalleryStart + galleryBlock.length;
  html = html.substring(0, absoluteGalleryStart) + html.substring(absoluteGalleryEnd);
  
  // Create a standalone gallery section
  const gallerySection = `
<section class="sec sd" style="padding:32px 0 40px">
<div class="w">
<div class="sh"><div class="shc"><span class="lbl">OUR WORK</span><h2>Recent Projects</h2></div></div>
${galleryBlock}
</div>
</section>`;
  
  // Find the best insertion point: after logo-belt-section, or after stats section, or after hero
  let insertPoint = -1;
  
  // Try after logo-belt-section
  const logoBeltEnd = html.indexOf('</section>', html.indexOf('logo-belt-section'));
  if (logoBeltEnd > -1) {
    insertPoint = logoBeltEnd + '</section>'.length;
  }
  
  // Try after stats section (cstat)
  if (insertPoint === -1) {
    const statsEnd = html.indexOf('</section>', html.indexOf('class="sec cstat"'));
    if (statsEnd > -1) {
      insertPoint = statsEnd + '</section>'.length;
    }
  }
  
  // Fallback: after hero section
  if (insertPoint === -1) {
    const newHeroEnd = html.indexOf('</section>', html.indexOf('page-hero-banner'));
    if (newHeroEnd > -1) {
      insertPoint = newHeroEnd + '</section>'.length;
    }
  }
  
  if (insertPoint === -1) {
    console.log(`  skip ${slug}: no insertion point found`);
    continue;
  }
  
  html = html.substring(0, insertPoint) + gallerySection + html.substring(insertPoint);
  
  fs.writeFileSync(filePath, html);
  fixed++;
  console.log(`✓ ${slug}: moved gallery out of hero`);
}

console.log(`\nFixed: ${fixed} pages`);
