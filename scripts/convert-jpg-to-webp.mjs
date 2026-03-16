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
  const files = fs.readdirSync(IMG_DIR).filter(f => /\.jpe?g$/i.test(f));
  console.log(`Found ${files.length} JPG files to convert`);

  let converted = 0;
  for (const file of files) {
    const src = path.join(IMG_DIR, file);
    const dest = path.join(IMG_DIR, file.replace(/\.jpe?g$/i, '.webp'));

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

function toWebpUrlIfAvailable(url, webpExistsLower) {
  const m = url.match(/^(https?:\/\/(?:www\.)?chicagofleetwraps\.com)?\/images\/([^/?#]+)\.jpe?g$/i);
  if (!m) return null;

  const domain = m[1] ?? '';
  const base = m[2];
  if (!webpExistsLower.has(base.toLowerCase())) return null;

  return `${domain}/images/${base}.webp`;
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

  const webpExistsLower = new Set(
    fs.readdirSync(IMG_DIR)
      .filter(f => f.endsWith('.webp'))
      .map(f => f.replace(/\.webp$/i, '').toLowerCase())
  );

  let filesUpdated = 0;

  for (const htmlFile of htmlFiles) {
    const original = fs.readFileSync(htmlFile, 'utf8');
    let content = original;

    // src="...jpg" and poster="...jpg" (relative + absolute domain)
    content = content.replace(/(src|poster)=("|')([^"']+)(\2)/gi, (full, attr, quote, url) => {
      const converted = toWebpUrlIfAvailable(url, webpExistsLower);
      return converted ? `${attr}=${quote}${converted}${quote}` : full;
    });

    // url('...jpg') inside inline styles
    content = content.replace(/url\(("|')?([^"')]+)\1\)/gi, (full, quote = '', url) => {
      const converted = toWebpUrlIfAvailable(url, webpExistsLower);
      return converted ? `url(${quote}${converted}${quote})` : full;
    });

    // srcset="...jpg 1x, ...jpg 2x"
    content = content.replace(/srcset=("|')([^"']+)(\1)/gi, (full, quote, value) => {
      const convertedValue = value
        .split(',')
        .map((candidate) => {
          const trimmed = candidate.trim();
          if (!trimmed) return candidate;

          const parts = trimmed.split(/\s+/);
          const converted = toWebpUrlIfAvailable(parts[0], webpExistsLower);
          if (!converted) return candidate;

          parts[0] = converted;
          return parts.join(' ');
        })
        .join(', ');

      return convertedValue !== value ? `srcset=${quote}${convertedValue}${quote}` : full;
    });

    if (content !== original) {
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
