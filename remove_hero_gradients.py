#!/usr/bin/env python3
"""
Remove ALL gradient overlays from hero images across all pages and site.css.

Targets:
1. <div class="hero-overlay">...</div>  → remove entire element
2. .hero-overlay { ... }                → remove CSS rule
3. .page-hero-banner .hero-overlay { } → remove CSS rule
4. background: linear-gradient(...) on .page-hero-banner or hero containers
5. Any ::before/::after pseudo with gradient on hero elements
6. site.css hero gradient rules
"""

import re
import glob

ROOT = '/home/ubuntu/cfwforever/public'
SITE_CSS = '/home/ubuntu/cfwforever/public/css/site.css'

changed_pages = 0

def remove_hero_gradients(content):
    original = content

    # 1. Remove <div class="hero-overlay"></div> (self-closing or with content)
    content = re.sub(
        r'<div\s+class="hero-overlay"[^>]*>.*?</div>',
        '',
        content,
        flags=re.DOTALL | re.IGNORECASE
    )
    # Also handle <div class="hero-overlay"/> or <div class="hero-overlay">
    content = re.sub(
        r'<div\s+class="hero-overlay"[^>]*/?>',
        '',
        content,
        flags=re.IGNORECASE
    )

    # 2. Remove .hero-overlay CSS rules (entire rule block)
    content = re.sub(
        r'\.(?:page-hero-banner\s+)?hero-overlay\s*\{[^}]*\}',
        '',
        content,
        flags=re.DOTALL | re.IGNORECASE
    )

    # 3. Remove linear-gradient background from .page-hero-banner CSS rules
    # Pattern: background:linear-gradient(...) inside .page-hero-banner { }
    content = re.sub(
        r'(\.page-hero-banner\s*\{[^}]*?)background\s*:\s*linear-gradient\([^;]+\)\s*;?\s*',
        r'\1',
        content,
        flags=re.DOTALL | re.IGNORECASE
    )

    # 4. Remove gradient from hero section/div background properties
    # Covers: background: linear-gradient(...), url(...) linear-gradient(...)
    content = re.sub(
        r'(\.(?:hero|page-hero|hero-section|hero-banner)[^{]*\{[^}]*?)background\s*:\s*[^;]*linear-gradient[^;]+;\s*',
        r'\1',
        content,
        flags=re.DOTALL | re.IGNORECASE
    )

    # 5. Remove ::before/::after gradient overlays on hero elements
    content = re.sub(
        r'\.(?:page-hero-banner|hero-section|hero-wrap|hero-new)[^{]*::(?:before|after)\s*\{[^}]*linear-gradient[^}]*\}',
        '',
        content,
        flags=re.DOTALL | re.IGNORECASE
    )

    # 6. Remove .ph::before or .ph::after gradient overlays (homepage hero)
    content = re.sub(
        r'\.ph\s*::(?:before|after)\s*\{[^}]*linear-gradient[^}]*\}',
        '',
        content,
        flags=re.DOTALL | re.IGNORECASE
    )

    # 7. Remove overlay divs with class containing "overlay" inside hero containers
    content = re.sub(
        r'<div\s+class="[^"]*overlay[^"]*"[^>]*></div>',
        '',
        content,
        flags=re.IGNORECASE
    )

    return content, content != original


# Fix site.css
content = open(SITE_CSS, encoding='utf-8').read()
content, was_changed = remove_hero_gradients(content)
if was_changed:
    open(SITE_CSS, 'w', encoding='utf-8').write(content)
    print('Fixed site.css')

# Fix all HTML pages
pages = sorted(glob.glob(f'{ROOT}/**/index.html', recursive=True))
for path in pages:
    content = open(path, encoding='utf-8').read()
    content, was_changed = remove_hero_gradients(content)
    if was_changed:
        open(path, 'w', encoding='utf-8').write(content)
        changed_pages += 1

print(f'Fixed {changed_pages} HTML pages')

# Spot-check
import subprocess
for page in ['hvac-van-wraps-chicago', 'hvac', 'arlington-heights', 'box-truck-wraps-chicago']:
    r = subprocess.run(
        ['grep', '-c', 'hero-overlay\|linear-gradient', f'{ROOT}/{page}/index.html'],
        capture_output=True, text=True
    )
    print(f'  {page}: {r.stdout.strip()} gradient/overlay lines remaining')
