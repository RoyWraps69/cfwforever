#!/usr/bin/env python3
"""
Remove opacity from all hero images across all pages and site.css.
Targets:
  1. .page-hero-banner img{...opacity:.55;...}  → remove opacity:.55
  2. .page-hero-banner img{...opacity:.6;...}   → remove opacity:.6
  3. .page-hero-banner img{...opacity:.5;...}   → remove opacity:.5
  4. Any other opacity value on .page-hero-banner img
  5. Also fix site.css hero image rule
  6. Also fix any inline style="opacity:..." on hero <img> tags
"""

import re
import glob

ROOT = '/home/ubuntu/cfwforever/public'
SITE_CSS = '/home/ubuntu/cfwforever/public/css/site.css'

# Pattern: remove opacity:N.NN from .page-hero-banner img CSS rules
# Works on minified CSS (no spaces around colons/semicolons)
HERO_IMG_OPACITY = re.compile(
    r'(\.page-hero-banner\s+img\s*\{[^}]*?)opacity\s*:\s*[\d.]+\s*;?\s*',
    re.DOTALL
)

# Also catch hero-bg class opacity in inline styles
HERO_BG_OPACITY = re.compile(
    r'(\.hero-bg\s*\{[^}]*?)opacity\s*:\s*[\d.]+\s*;?\s*',
    re.DOTALL
)

# Inline style on img tags inside hero banners: style="...opacity:.55..."
INLINE_IMG_OPACITY = re.compile(
    r'(<img[^>]*class="[^"]*hero[^"]*"[^>]*style="[^"]*?)opacity\s*:\s*[\d.]+\s*;?\s*',
    re.DOTALL | re.IGNORECASE
)

# Also: img inside .page-hero-banner with inline opacity
# Pattern: <img ... style="...opacity:0.55..." ...>
IMG_INLINE_OPACITY = re.compile(
    r'(<img\b[^>]*?)(\bopacity\s*:\s*[\d.]+\s*;?\s*)([^>]*>)',
    re.DOTALL | re.IGNORECASE
)

changed = 0

# Fix site.css first
content = open(SITE_CSS, encoding='utf-8').read()
original = content
# Remove opacity from .ph img,.hbg,.page-hero-banner img rule
content = re.sub(
    r'(\.ph\s+img\s*,\s*\.hbg\s*,\s*\.page-hero-banner\s+img\s*\{[^}]*?)opacity\s*:\s*[\d.]+\s*;?\s*',
    r'\1',
    content, flags=re.DOTALL
)
if content != original:
    open(SITE_CSS, 'w', encoding='utf-8').write(content)
    print('Fixed site.css hero opacity')
    changed += 1

# Fix all HTML pages
pages = sorted(glob.glob(f'{ROOT}/**/index.html', recursive=True))
page_changed = 0

for path in pages:
    content = open(path, encoding='utf-8').read()
    original = content

    # Remove opacity from .page-hero-banner img CSS rules in <style> blocks
    content = HERO_IMG_OPACITY.sub(r'\1', content)

    # Remove opacity from .hero-bg rules
    content = HERO_BG_OPACITY.sub(r'\1', content)

    # Remove inline opacity from img tags that are hero images
    # Target: img tags inside page-hero-banner with opacity in style attr
    # Pattern: .page-hero-banner img{...opacity:.55...} already handled above
    # Also handle: <img ... style="...opacity:.55..." class="hero-bg">
    def remove_img_opacity(m):
        full = m.group(0)
        # Only remove opacity if this img is a hero image (class contains hero or is inside hero banner)
        if 'hero' in full.lower() or 'page-hero' in full.lower():
            return re.sub(r'opacity\s*:\s*[\d.]+\s*;?\s*', '', full)
        return full

    # Find all img tags and remove opacity from hero ones
    content = re.sub(
        r'<img\b[^>]*(?:class="[^"]*hero[^"]*"|hero-bg)[^>]*>',
        lambda m: re.sub(r'opacity\s*:\s*[\d.]+\s*;?\s*', '', m.group(0)),
        content,
        flags=re.DOTALL | re.IGNORECASE
    )

    if content != original:
        open(path, 'w', encoding='utf-8').write(content)
        page_changed += 1

print(f'Fixed {page_changed} HTML pages')
print(f'Total files changed: {changed + page_changed}')

# Verify spot check
import subprocess
result = subprocess.run(
    ['grep', '-c', 'opacity:.55', f'{ROOT}/hvac/index.html'],
    capture_output=True, text=True
)
print(f'HVAC page opacity:.55 occurrences remaining: {result.stdout.strip()}')
