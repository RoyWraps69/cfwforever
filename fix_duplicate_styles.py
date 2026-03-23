#!/usr/bin/env python3
"""
Remove old/duplicate inline <style> blocks from pages that already have
the shared-template-css injected. Handles both minified and multi-line CSS.
"""
import glob
import re

# If a style block contains ALL of these it's a full design-system duplicate
SHARED_MARKERS = [
    '--gold',
    '--black',
    'trib',
    'hbar',
]

# Page-specific content — if present, keep the block even if it looks like shared CSS
PAGE_SPECIFIC_MARKERS = [
    'swiper', 'splide', 'glide', 'slider',
    'lightbox',
    'calculator', 'calc-',
    'team-port', 'team-card',
    'background-image:url', 'background:url(',
    '.hero-bg{',
    '--page-',
    'video-',
    'wrap-calculator',
]

files = glob.glob('/home/ubuntu/cfwforever/public/**/*.html', recursive=True)
fixed = 0

for fp in files:
    try:
        html = open(fp, encoding='utf-8').read()
    except Exception:
        continue

    # Only process pages that have the shared template CSS already injected
    if 'id="shared-template-css"' not in html:
        continue

    style_pattern = re.compile(r'(<style[^>]*>)(.*?)(</style>)', re.DOTALL | re.IGNORECASE)
    matches = list(style_pattern.finditer(html))

    if len(matches) < 2:
        continue

    blocks_to_remove = []
    for m in matches:
        tag = m.group(1)
        content = m.group(2)
        full_block = m.group(0)

        # Never remove the shared template CSS block itself
        if 'id="shared-template-css"' in tag:
            continue

        # Check if this is a duplicate of the shared design system
        # (contains the core design system variables and components)
        is_dupe = all(marker in content for marker in SHARED_MARKERS)

        # Check for page-specific content that must be preserved
        has_page_specific = any(marker in content for marker in PAGE_SPECIFIC_MARKERS)

        if is_dupe and not has_page_specific:
            blocks_to_remove.append(full_block)

    if blocks_to_remove:
        modified = html
        for block in blocks_to_remove:
            modified = modified.replace(block, '', 1)
        modified = re.sub(r'\n{3,}', '\n\n', modified)

        with open(fp, 'w', encoding='utf-8') as f:
            f.write(modified)
        fixed += 1
        slug = fp.replace('/home/ubuntu/cfwforever/public/', '').replace('/index.html', '')
        print(f'  Fixed: {slug}')

print(f'\nDone: {fixed} pages deduplicated')
