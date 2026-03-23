#!/usr/bin/env python3
"""
Convert all public/*.html pages to Eleventy src/*.njk templates.
Each page keeps only its unique <main> content; the shared header/footer/nav/CSS
comes from src/_includes/base.njk.
"""

import os
import re
import glob
import shutil
from pathlib import Path

PUBLIC = Path('/home/ubuntu/cfwforever/public')
SRC = Path('/home/ubuntu/cfwforever/src')

# Ensure src directory structure exists
(SRC / '_includes').mkdir(parents=True, exist_ok=True)

# Copy all static assets to src/
for folder in ['css', 'js', 'fonts', 'images']:
    src_folder = PUBLIC / folder
    dst_folder = SRC / folder
    if src_folder.exists() and not dst_folder.exists():
        shutil.copytree(str(src_folder), str(dst_folder))
        print(f"Copied {folder}/ to src/")

# Copy root-level static files
for fname in ['favicon.png', 'robots.txt', 'sitemap.xml', 'CNAME', '_headers', '_redirects',
              'blog-feed.xml', 'cfwIndexNow2026key.txt']:
    src_f = PUBLIC / fname
    dst_f = SRC / fname
    if src_f.exists() and not dst_f.exists():
        shutil.copy2(str(src_f), str(dst_f))
        print(f"Copied {fname}")

# Copy google verification files
for f in PUBLIC.glob('google*.html'):
    dst = SRC / f.name
    if not dst.exists():
        shutil.copy2(str(f), str(dst))
        print(f"Copied {f.name}")


def extract_page_meta(html):
    """Extract title, description, canonical, keywords, og_image from <head>."""
    meta = {}
    
    # Title
    m = re.search(r'<title>([^<]+)</title>', html)
    if m:
        meta['title'] = m.group(1).strip()
    
    # Description
    m = re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)["\']', html, re.I)
    if not m:
        m = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']description["\']', html, re.I)
    if m:
        meta['description'] = m.group(1).strip()
    
    # Keywords
    m = re.search(r'<meta[^>]+name=["\']keywords["\'][^>]+content=["\']([^"\']+)["\']', html, re.I)
    if not m:
        m = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']keywords["\']', html, re.I)
    if m:
        meta['keywords'] = m.group(1).strip()
    
    # Canonical
    m = re.search(r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']+)["\']', html, re.I)
    if not m:
        m = re.search(r'<link[^>]+href=["\']([^"\']+)["\'][^>]+rel=["\']canonical["\']', html, re.I)
    if m:
        meta['canonical'] = m.group(1).strip()
    
    # OG image
    m = re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']', html, re.I)
    if not m:
        m = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']', html, re.I)
    if m:
        meta['og_image'] = m.group(1).strip()
    
    # OG title
    m = re.search(r'<meta[^>]+property=["\']og:title["\'][^>]+content=["\']([^"\']+)["\']', html, re.I)
    if not m:
        m = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:title["\']', html, re.I)
    if m:
        meta['og_title'] = m.group(1).strip()
    
    # OG description
    m = re.search(r'<meta[^>]+property=["\']og:description["\'][^>]+content=["\']([^"\']+)["\']', html, re.I)
    if not m:
        m = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:description["\']', html, re.I)
    if m:
        meta['og_description'] = m.group(1).strip()
    
    return meta


def extract_page_specific_head(html):
    """Extract page-specific head elements (schema, page-specific scripts, etc.)"""
    head_match = re.search(r'<head>(.*?)</head>', html, re.DOTALL)
    if not head_match:
        return ''
    head = head_match.group(1)
    
    # Keep only page-specific LD+JSON schemas (not LocalBusiness - that's in base)
    page_schemas = []
    for schema in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', head, re.DOTALL):
        content = schema.group(1)
        if '"LocalBusiness"' not in content:
            page_schemas.append(schema.group(0))
    
    # Keep page-specific inline styles that are NOT in the base template
    # (e.g., hero slider CSS, portfolio grid CSS, calculator CSS)
    page_styles = []
    for style in re.finditer(r'<style[^>]*>(.*?)</style>', head, re.DOTALL):
        content = style.group(1)
        # Skip font-face, CLS fix, and shared critical CSS blocks
        if ('@font-face' in content or 
            'font-display:swap' in content and len(content) < 500 or
            ':root{--gold' in content or
            'content-visibility:auto' in content):
            continue
        # Keep page-specific styles (hero slider, portfolio, calculator, etc.)
        if any(k in content for k in ['.hero-new', '.pgrid', '.calc', '.portfolio', 
                                        '.slider', '.swiper', '.team-port', '.about-',
                                        '.video-', '.blog-', '.faq-page', '.est-form',
                                        '.contact-', '.roi-', '.brand-', '.care-',
                                        '.warranty-', '.rent-', '.stats-']):
            page_styles.append(style.group(0))
    
    result = '\n'.join(page_schemas + page_styles)
    return result


def extract_main_content(html):
    """Extract the unique page content between <main> and </main>."""
    # Try to find <main> tag
    main_match = re.search(r'<main[^>]*>(.*?)</main>', html, re.DOTALL)
    if main_match:
        return main_match.group(1).strip()
    
    # Fallback: extract content between </header> (or </nav>) and <footer>
    # Strip the shared elements
    content = html
    
    # Remove everything up to and including </header>
    header_end = content.find('</header>')
    if header_end != -1:
        content = content[header_end + len('</header>'):]
    
    # Remove the mnav div
    mnav_start = content.find('<div class="mnav"')
    if mnav_start != -1:
        # Find end of mnav
        depth = 0
        pos = mnav_start
        while pos < len(content):
            if content[pos:pos+4] == '<div':
                depth += 1
            elif content[pos:pos+6] == '</div>':
                depth -= 1
                if depth == 0:
                    content = content[:mnav_start] + content[pos+6:]
                    break
            pos += 1
    
    # Remove footer and everything after
    footer_start = content.find('<footer')
    if footer_start != -1:
        content = content[:footer_start]
    
    # Remove sticky CTA bar
    sticky_start = content.find('id="sticky-cta"')
    if sticky_start != -1:
        div_start = content.rfind('<div', 0, sticky_start)
        if div_start != -1:
            depth = 0
            pos = div_start
            while pos < len(content):
                if content[pos:pos+4] == '<div':
                    depth += 1
                elif content[pos:pos+6] == '</div>':
                    depth -= 1
                    if depth == 0:
                        content = content[:div_start] + content[pos+6:]
                        break
                pos += 1
    
    # Remove trib bar if it appears in the body
    trib_start = content.find('class="trib"')
    if trib_start != -1:
        div_start = content.rfind('<div', 0, trib_start)
        if div_start != -1:
            depth = 0
            pos = div_start
            while pos < len(content):
                if content[pos:pos+4] == '<div':
                    depth += 1
                elif content[pos:pos+6] == '</div>':
                    depth -= 1
                    if depth == 0:
                        content = content[:div_start] + content[pos+6:]
                        break
                pos += 1
    
    return content.strip()


def build_frontmatter(meta):
    """Build YAML frontmatter from meta dict."""
    lines = ['---']
    lines.append(f'layout: base.njk')
    
    title = meta.get('title', 'Chicago Fleet Wraps')
    # Escape quotes in title
    title = title.replace('"', '\\"')
    lines.append(f'title: "{title}"')
    
    desc = meta.get('description', 'Chicago Fleet Wraps — Commercial vehicle wraps, fleet graphics, and color change wraps.')
    desc = desc.replace('"', '\\"')
    lines.append(f'description: "{desc}"')
    
    if 'keywords' in meta:
        kw = meta['keywords'].replace('"', '\\"')
        lines.append(f'keywords: "{kw}"')
    
    if 'canonical' in meta:
        lines.append(f'canonical: "{meta["canonical"]}"')
    
    if 'og_image' in meta:
        lines.append(f'og_image: "{meta["og_image"]}"')
    
    if 'og_title' in meta:
        og_t = meta['og_title'].replace('"', '\\"')
        lines.append(f'og_title: "{og_t}"')
    
    if 'og_description' in meta:
        og_d = meta['og_description'].replace('"', '\\"')
        lines.append(f'og_description: "{og_d}"')
    
    lines.append('---')
    return '\n'.join(lines)


# Process all HTML files
html_files = list(PUBLIC.glob('**/*.html'))
# Also include root-level HTML files
html_files.extend(PUBLIC.glob('*.html'))
html_files = list(set(html_files))

skip_files = {'google', 'cfwIndex'}  # Skip verification files

converted = 0
skipped = 0
errors = []

for html_path in sorted(html_files):
    # Skip google verification files
    if any(s in html_path.name for s in skip_files):
        skipped += 1
        continue
    
    # Determine output path in src/
    rel_path = html_path.relative_to(PUBLIC)
    
    # Convert index.html -> index.njk, other.html -> other.njk
    if rel_path.name == 'index.html':
        out_path = SRC / rel_path.parent / 'index.njk'
    else:
        out_path = SRC / rel_path.with_suffix('.njk')
    
    out_path.parent.mkdir(parents=True, exist_ok=True)
    
    try:
        with open(html_path, encoding='utf-8') as f:
            html = f.read()
        
        # Skip if it's a redirect/placeholder page (< 500 chars of body content)
        body_match = re.search(r'<body[^>]*>(.*?)</body>', html, re.DOTALL)
        if body_match and len(body_match.group(1).strip()) < 200:
            # Simple redirect page - copy as-is
            shutil.copy2(str(html_path), str(out_path.with_suffix('.html')))
            skipped += 1
            continue
        
        # Extract metadata
        meta = extract_page_meta(html)
        
        # Extract page-specific head elements
        page_head = extract_page_specific_head(html)
        if page_head:
            meta['head_extra'] = page_head
        
        # Extract main content
        content = extract_main_content(html)
        
        # Build the njk file
        frontmatter = build_frontmatter(meta)
        
        # Add page-specific head as a head block if present
        njk_content = frontmatter + '\n'
        if page_head:
            njk_content += f'{{% set head %}}\n{page_head}\n{{% endset %}}\n\n'
        njk_content += content
        
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(njk_content)
        
        converted += 1
        
    except Exception as e:
        errors.append(f"{html_path}: {e}")
        print(f"ERROR: {html_path}: {e}")

print(f"\nConversion complete:")
print(f"  Converted: {converted}")
print(f"  Skipped: {skipped}")
print(f"  Errors: {len(errors)}")
if errors:
    for e in errors[:10]:
        print(f"  {e}")
