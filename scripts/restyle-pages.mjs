#!/usr/bin/env node
/**
 * restyle-pages.mjs  v2
 *
 * Post-processing script that converts every content page to the homepage's
 * visual structure:
 *   - Full-width hero banner with bold H1, breadcrumb, CTA buttons
 *   - All body text inside section.sec > .w containers
 *   - H2 headers wrapped in .sh.shc with .lbl eyebrow labels
 *   - Alternating dark/darker section backgrounds
 *   - CTA block at the bottom
 *
 * Run AFTER stamp-header-footer.mjs in the build pipeline.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '../public');

// ── Skip lists ──────────────────────────────────────────────
const SKIP_DIRS = new Set([
  'css', 'js', 'fonts', 'images', 'studio', 'originals', 'client', 'logos', 'sm',
]);
const SKIP_SLUGS = new Set([
  'portfolio', 'wrap-calculator', 'calculator', 'beforeafter', 'visualizer',
  'estimate', 'contact', 'intake', 'schedule', 'rent-the-bay', 'site',
  'custom-sitemap', 'googleac4190c5fb66b0fb', '404', 'vehicle-wrap-training-manual',
]);

// ── Fallback hero images (rotated per page) ─────────────────
const HERO_IMAGES = [
  '/images/cfw_van_1.webp',
  '/images/cfw_van_2.webp',
  '/images/cfw_van_3.webp',
  '/images/cfw_truck_1.webp',
  '/images/cfw_truck_2.webp',
  '/images/cfw_truck_3.webp',
  '/images/studio/arnold-electric-transit-van-wrap.webp',
  '/images/studio/medxwaste-transit-van-wrap.webp',
  '/images/studio/mh-equipment-cargo-van-wrap-3.webp',
  '/images/studio/improovy-painters-cargo-van-wrap-2.webp',
  '/images/studio/precision-today-transit-van-wrap.webp',
  '/images/studio/autonation-mobile-service-box-truck-wrap.webp',
  '/images/studio/chestnut-health-systems-box-truck-wrap.webp',
  '/images/studio/oakbros-box-truck-wrap-2.webp',
  '/images/studio/roza-contractors-box-truck-wrap.webp',
  '/images/studio/windy-city-movers-box-truck-wrap.webp',
  '/images/studio/dp-dough-transit-van-wrap.webp',
  '/images/studio/puroclean-cargo-van-wrap.webp',
  '/images/studio/pro-air-transit-van-wrap.webp',
  '/images/studio/blue-rivian-pickup-truck-wrap.webp',
];
let heroIdx = 0;
function nextHeroImage() {
  const img = HERO_IMAGES[heroIdx % HERO_IMAGES.length];
  heroIdx++;
  return img;
}

function escapeHtml(str) {
  if (!str) return '';
  // First decode any existing entities to avoid double-encoding
  let s = str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
  // Then encode
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Eyebrow label generator ─────────────────────────────────
function getEyebrowLabel(h2Text) {
  const t = (h2Text || '').toLowerCase();
  if (t.includes('pricing') || t.includes('cost') || t.includes('price')) return 'Transparent Pricing';
  if (t.includes('faq') || t.includes('frequently asked') || t.includes('common question')) return 'Common Questions';
  if (t.includes('why') && (t.includes('wrap') || t.includes('choose') || t.includes('should'))) return 'Why Choose Us';
  if (t.includes('service area') || t.includes('near me') || t.includes('chicagoland')) return 'Service Area';
  if (t.includes('material') || t.includes('vinyl') || t.includes('avery') || t.includes('3m')) return 'Premium Materials';
  if (t.includes('process') || t.includes('how it works') || t.includes('step') || t.includes('included')) return 'Our Process';
  if (t.includes('roi') || t.includes('return') || t.includes('investment')) return 'ROI & Results';
  if (t.includes('portfolio') || t.includes('gallery') || t.includes('recent work')) return 'Recent Work';
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
  if (t.includes('about') || t.includes('team') || t.includes('who we')) return 'About Us';
  if (t.includes('install')) return 'Installation';
  if (t.includes('warrant')) return 'Warranty';
  if (t.includes('design')) return 'Design';
  return 'Expert Insight';
}

// ── Check if page is already properly styled ────────────────
function isAlreadyStyled(html) {
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (!mainMatch) return false;
  const secCount = (mainMatch[1].match(/class="sec(?:\s|")/g) || []).length;
  return secCount >= 3;
}

// ── Extract hero image from page HTML ───────────────────────
function extractHeroImage(html) {
  // Pattern 1: hero-bg img
  const heroBg = html.match(/<img[^>]*class="hero-bg"[^>]*src="([^"]+)"/i);
  if (heroBg) return heroBg[1];
  // Pattern 2: img inside page-hero-banner
  const bannerImg = html.match(/page-hero-banner[^>]*>[\s\S]{0,500}?<img[^>]*src="([^"]+)"/i);
  if (bannerImg) return bannerImg[1];
  return null;
}

// ── Extract H1 text from page HTML ──────────────────────────
function extractH1(html) {
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) return h1Match[1].replace(/<[^>]+>/g, '').trim();
  return null;
}

// ── Extract lead/intro paragraph ────────────────────────────
function extractLead(html) {
  const leadMatch = html.match(/<p\s+class="lead[^"]*"[^>]*>([\s\S]*?)<\/p>/i);
  if (leadMatch) return leadMatch[1].replace(/<[^>]+>/g, '').trim();
  return null;
}

// ── Extract breadcrumb ──────────────────────────────────────
function extractBreadcrumb(html) {
  const bcMatch = html.match(/<nav[^>]*class="breadcrumb"[^>]*>([\s\S]*?)<\/nav>/i);
  if (bcMatch) return bcMatch[0];
  return null;
}

// ── Build proper hero banner ────────────────────────────────
function buildHero(h1Text, heroImage, breadcrumb, leadText, slug) {
  if (!h1Text) h1Text = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  if (!heroImage) heroImage = nextHeroImage();

  const bc = breadcrumb || `<nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a> &rsaquo; ${escapeHtml(h1Text)}</nav>`;
  const lead = leadText ? `<p class="lead speakable" style="max-width:680px">${escapeHtml(leadText)}</p>` : '';

  return `<section class="page-hero-banner" style="position:relative;min-height:340px;overflow:hidden">
<img src="${heroImage}" alt="${escapeHtml(h1Text)} — Chicago Fleet Wraps" loading="eager" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"/>
<div class="w" style="position:relative;z-index:2;padding:80px 0 48px">
${bc}
<h1 style="font-family:var(--H);font-size:clamp(2.4rem,5vw,4rem);font-weight:900;color:#fff;line-height:1.05;letter-spacing:.01em;margin-bottom:16px;text-shadow:0 2px 16px rgba(0,0,0,.5)">${escapeHtml(h1Text)}</h1>
${lead}
<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:24px">
<a href="/estimate/" class="btn bg">Get a Free Estimate &rarr;</a>
<a href="tel:+13125971286" class="btn bo" style="border-color:var(--gold);color:var(--gold)">&#128222; (312) 597-1286</a>
</div>
</div>
</section>`;
}

// ── Strip hero/H1/lead elements from body content ───────────
function stripHeroElements(html) {
  let c = html;
  // Remove page-hero-banner div/section (greedy within the banner)
  c = c.replace(/<(?:div|section)\s+class="page-hero-banner"[^>]*>[\s\S]*?<\/(?:div|section)>/gi, '');
  // Remove floating hero-bg images
  c = c.replace(/<img[^>]*class="hero-bg"[^>]*\/?>/gi, '');
  // Remove floating hero-text divs (nested)
  c = c.replace(/<div\s+class="hero-text"[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi, '');
  c = c.replace(/<div\s+class="hero-text"[^>]*>[\s\S]*?<\/div>/gi, '');
  // Remove the first H1 (now in hero)
  c = c.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '');
  // Remove the first lead paragraph (now in hero)
  c = c.replace(/<p\s+class="lead[^"]*"[^>]*>[\s\S]*?<\/p>/i, '');
  // Remove breadcrumb (now in hero)
  c = c.replace(/<nav[^>]*class="breadcrumb"[^>]*>[\s\S]*?<\/nav>/gi, '');
  return c;
}

// ── Remove wrapper divs ─────────────────────────────────────
function unwrapContainers(html) {
  let c = html;
  c = c.replace(/<div\s+class="(?:content|container)"[^>]*>/gi, '');
  c = c.replace(/<(?:section|div)\s+class="ip-[^"]*"[^>]*>/gi, '');
  c = c.replace(/<section\s+class="overview"[^>]*>/gi, '');
  c = c.replace(/<section\s+class="content-section[^"]*"[^>]*>/gi, '');
  c = c.replace(/<section\s+class="internal-links[^"]*"[^>]*>/gi, '');
  c = c.replace(/<nav\s+class="hub-spoke-links[^"]*"[^>]*>[\s\S]*?<\/nav>/gi, '');
  c = c.replace(/<p\s+class="last-updated"[^>]*>[\s\S]*?<\/p>/gi, '');
  c = c.replace(/style="padding:2rem 5%;max-width:1200px;margin:0 auto;"/g, '');
  return c;
}

// ── Parse content into h2-delimited sections ────────────────
function parseIntoSections(html) {
  const content = unwrapContainers(html);
  const parts = [];
  const h2Pattern = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  let lastIndex = 0;
  let match;

  while ((match = h2Pattern.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const before = content.substring(lastIndex, match.index).trim();
      if (before) {
        if (parts.length > 0) {
          parts[parts.length - 1].content += '\n' + before;
        } else {
          parts.push({ h2: '', content: before, isIntro: true });
        }
      }
    }
    parts.push({
      h2: match[1].replace(/<[^>]+>/g, '').trim(),
      content: '',
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    const remaining = content.substring(lastIndex).trim();
    if (remaining) {
      if (parts.length > 0) {
        parts[parts.length - 1].content += '\n' + remaining;
      } else {
        parts.push({ h2: '', content: remaining, isIntro: true });
      }
    }
  }

  return parts;
}

// ── Clean section content ───────────────────────────────────
function cleanContent(html) {
  let c = html;
  c = c.replace(/<div[^>]*>\s*<\/div>/g, '');
  c = c.replace(/<section[^>]*>\s*<\/section>/g, '');
  c = c.replace(/\n{3,}/g, '\n\n');
  return c.trim();
}

// ── Build the new <main> ────────────────────────────────────
function buildStyledMain(hero, sections) {
  let html = '<main role="main">\n';
  html += hero + '\n';

  let secIdx = 0;
  for (const section of sections) {
    const content = cleanContent(section.content);
    if (!section.h2 && !content) continue;

    const alt = secIdx % 2 === 1;
    const cls = alt ? 'sec sd' : 'sec';
    const label = section.h2 ? getEyebrowLabel(section.h2) : '';

    const isCta = section.h2 && /ready to|get your|free estimate|get started|contact us|get pricing/i.test(section.h2);

    if (isCta) {
      html += `\n<section class="ctab">
<div class="w">
<div class="ctai">
<div>
<h2>${section.h2}</h2>
${content}
</div>
<div style="display:flex;gap:12px;flex-wrap:wrap">
<a href="/estimate/" class="btn bg" style="font-size:1.05rem;padding:14px 36px">Get Your Free Estimate &rarr;</a>
<a href="tel:+13125971286" class="btn bo" style="border-color:var(--gold);color:var(--gold)">&#128222; (312) 597-1286</a>
</div>
</div>
</div>
</section>\n`;
    } else if (section.isIntro && !section.h2) {
      html += `\n<section class="${cls}">
<div class="w">
${content}
</div>
</section>\n`;
    } else {
      html += `\n<section class="${cls}">
<div class="w">
<div class="sh shc"><span class="lbl">${label}</span><h2>${section.h2}</h2></div>
${content}
</div>
</section>\n`;
    }
    secIdx++;
  }

  // Add CTA if none exists
  if (!html.includes('class="ctab"')) {
    html += `\n<section class="ctab">
<div class="w">
<div class="ctai">
<div>
<h2>Ready to Wrap Your <span>Fleet</span>?</h2>
<p>Free estimates within 2 hours. Free pickup anywhere in Chicagoland.</p>
</div>
<div style="display:flex;gap:12px;flex-wrap:wrap">
<a href="/estimate/" class="btn bg" style="font-size:1.05rem;padding:14px 36px">Get Your Free Estimate &rarr;</a>
<a href="tel:+13125971286" class="btn bo" style="border-color:var(--gold);color:var(--gold)">&#128222; (312) 597-1286</a>
</div>
</div>
</div>
</section>\n`;
  }

  html += '</main>';
  return html;
}

// ── Process a single file ───────────────────────────────────
function processFile(filePath, slug) {
  let html = fs.readFileSync(filePath, 'utf-8');
  const lines = html.split('\n').length;

  // Skip redirect stubs
  if (lines <= 20) return { status: 'skip-redirect' };

  // Skip already styled pages
  if (isAlreadyStyled(html)) return { status: 'skip-styled' };

  // ── Extract data from the page BEFORE modifying ──
  const heroImage = extractHeroImage(html);
  const h1Text = extractH1(html);
  const leadText = extractLead(html);
  const breadcrumb = extractBreadcrumb(html);

  // ── Get or create <main> content ──
  let mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);

  if (!mainMatch) {
    // No <main> tag — wrap content between last nav/header and footer
    const footerIdx = html.indexOf('<footer');
    if (footerIdx < 0) return { status: 'skip-no-main' };

    let contentStart = -1;

    // Try to find end of mnav
    const mnavMatch = html.match(/<div\s+class="mnav"[^>]*>[\s\S]*?<\/div>/i);
    if (mnavMatch) {
      contentStart = mnavMatch.index + mnavMatch[0].length;
    }

    // Try end of </header>
    if (contentStart < 0) {
      const headerEnd = html.indexOf('</header>');
      if (headerEnd > 0) {
        contentStart = headerEnd + '</header>'.length;
      }
    }

    // Try end of </nav>
    if (contentStart < 0) {
      const navEnd = html.lastIndexOf('</nav>');
      if (navEnd > 0 && navEnd < footerIdx) {
        contentStart = navEnd + '</nav>'.length;
      }
    }

    if (contentStart < 0 || contentStart >= footerIdx) return { status: 'skip-no-main' };

    const bodyContent = html.substring(contentStart, footerIdx);
    html = html.substring(0, contentStart) + '\n<main role="main">\n' + bodyContent + '\n</main>\n' + html.substring(footerIdx);
    mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    if (!mainMatch) return { status: 'skip-no-main' };
  }

  const mainContent = mainMatch[1];
  const fullMainTag = mainMatch[0];

  // ── Strip hero elements from body content ──
  const bodyContent = stripHeroElements(mainContent);

  // ── Parse into sections ──
  const sections = parseIntoSections(bodyContent);
  if (sections.length === 0) return { status: 'skip-empty' };

  // ── Build proper hero ──
  const hero = buildHero(h1Text, heroImage, breadcrumb, leadText, slug);

  // ── Build new styled main ──
  const newMain = buildStyledMain(hero, sections);

  // ── Replace old main with new ──
  const newHtml = html.replace(fullMainTag, newMain);
  fs.writeFileSync(filePath, newHtml, 'utf-8');
  return { status: 'restyled', sections: sections.length };
}

// ── Main execution ──────────────────────────────────────────
console.log('Restyling pages to match homepage structure...\n');
let restyled = 0, skipped = 0, errors = 0;

function walkDir(dir, depth = 0) {
  if (depth > 3) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;

      const indexPath = path.join(dir, entry.name, 'index.html');
      if (fs.existsSync(indexPath)) {
        const slug = entry.name;
        if (SKIP_SLUGS.has(slug)) {
          console.log(`  SKIP /${slug}/ (special page)`);
          skipped++;
          continue;
        }

        try {
          const result = processFile(indexPath, slug);
          switch (result.status) {
            case 'restyled':
              console.log(`  OK   /${slug}/ (${result.sections} sections)`);
              restyled++;
              break;
            case 'skip-redirect':
              skipped++;
              break;
            case 'skip-styled':
              console.log(`  DONE /${slug}/ (already styled)`);
              skipped++;
              break;
            case 'skip-no-main':
              console.log(`  WARN /${slug}/ (no main tag)`);
              skipped++;
              break;
            case 'skip-empty':
              console.log(`  WARN /${slug}/ (empty content)`);
              skipped++;
              break;
          }
        } catch (err) {
          console.error(`  ERR  /${slug}/ ${err.message}`);
          errors++;
        }
      }

      walkDir(path.join(dir, entry.name), depth + 1);
    }
  }
}

walkDir(PUBLIC_DIR);

console.log(`\nRestyle complete:`);
console.log(`   Restyled: ${restyled} pages`);
console.log(`   Skipped: ${skipped} pages`);
console.log(`   Errors: ${errors} pages`);
