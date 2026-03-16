#!/usr/bin/env node
/**
 * Convert all JPG images in public/images/ to WebP format
 * and update all HTML references across the site.
 * 
 * Usage: node scripts/convert-jpg-to-webp.mjs
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const IMG_DIR = path.join(ROOT, 'public', 'images');

async function convertImages() {
  const files = fs.readdirSync(IMG_DIR).filter(f => f.endsWith('.jpg'));
  console.log(`Found ${files.length} JPG files to convert`);

  let converted = 0;
  for (const file of files) {
    const src = path.join(IMG_DIR, file);
    const dest = path.join(IMG_DIR, file.replace('.jpg', '.webp'));
    
    // Skip if webp already exists and is newer
    if (fs.existsSync(dest)) {
      const srcStat = fs.statSync(src);
      const destStat = fs.statSync(dest);
      if (destStat.mtimeMs > srcStat.mtimeMs) {
        console.log(`  SKIP ${file} (webp already exists)`);
        continue;
      }
    }

    try {
      await sharp(src)
        .webp({ quality: 80, effort: 6 })
        .toFile(dest);
      
      const srcSize = fs.statSync(src).size;
      const destSize = fs.statSync(dest).size;
      const savings = ((1 - destSize / srcSize) * 100).toFixed(1);
      console.log(`  OK ${file} → .webp (${(srcSize/1024).toFixed(0)}KB → ${(destSize/1024).toFixed(0)}KB, -${savings}%)`);
      converted++;
    } catch (err) {
      console.error(`  FAIL ${file}: ${err.message}`);
    }
  }
  console.log(`\nConverted ${converted}/${files.length} images`);
}

function updateHtmlReferences() {
  const htmlFiles = [];
  
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
        walk(full);
      } else if (entry.name.endsWith('.html')) {
        htmlFiles.push(full);
      }
    }
  }
  
  walk(ROOT);
  console.log(`\nUpdating references in ${htmlFiles.length} HTML files...`);
  
  // JPG filenames in public/images/
  const jpgFiles = fs.readdirSync(IMG_DIR).filter(f => f.endsWith('.jpg'));
  const webpExists = new Set(
    fs.readdirSync(IMG_DIR).filter(f => f.endsWith('.webp')).map(f => f.replace('.webp', ''))
  );
  
  let filesUpdated = 0;
  
  for (const htmlFile of htmlFiles) {
    let content = fs.readFileSync(htmlFile, 'utf8');
    let changed = false;
    
    for (const jpg of jpgFiles) {
      const base = jpg.replace('.jpg', '');
      if (!webpExists.has(base)) continue;
      
      // Replace in src attributes and content URLs (but NOT in og:image/twitter:image/schema URLs)
      const imgSrcRegex = new RegExp(`(src=["'])/images/${base}\\.jpg(["'])`, 'g');
      if (imgSrcRegex.test(content)) {
        content = content.replace(imgSrcRegex, `$1/images/${base}.webp$2`);
        changed = true;
      }
    }
    
    if (changed) {
      fs.writeFileSync(htmlFile, content);
      filesUpdated++;
    }
  }
  
  console.log(`Updated ${filesUpdated} HTML files`);
}

async function main() {
  console.log('=== JPG → WebP Conversion ===\n');
  await convertImages();
  updateHtmlReferences();
  console.log('\nDone! Commit the new .webp files and updated HTML.');
}

main().catch(console.error);
