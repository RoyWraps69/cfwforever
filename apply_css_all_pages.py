#!/usr/bin/env python3
"""
Apply consistent CSS styling across all pages:
1. Add <link rel="stylesheet" href="/css/site.css"> to every page that lacks it
2. Change h2 color from #fff / white to var(--gold, #F5C518) in all inline <style> blocks
3. Change h3 color from #fff / white to var(--gold, #F5C518) in all inline <style> blocks
4. Fix any inline style="...color:#fff..." on h2/h3 elements to use gold
"""

import re
import glob
import os

ROOT = '/home/ubuntu/cfwforever/public'
pages = sorted(glob.glob(f'{ROOT}/**/index.html', recursive=True))

SITE_CSS_LINK = '<link rel="stylesheet" href="/css/site.css">'

# Patterns to replace in <style> blocks
H2_WHITE = re.compile(r'(h2\s*\{[^}]*?)color\s*:\s*#fff\b', re.IGNORECASE)
H2_WHITE2 = re.compile(r'(h2\s*\{[^}]*?)color\s*:\s*white\b', re.IGNORECASE)
H3_WHITE = re.compile(r'(h3\s*\{[^}]*?)color\s*:\s*#fff\b', re.IGNORECASE)
H3_WHITE2 = re.compile(r'(h3\s*\{[^}]*?)color\s*:\s*white\b', re.IGNORECASE)

# Inline style on h2/h3 tags: color:#fff or color:white
H2_INLINE = re.compile(r'(<h[23][^>]*style="[^"]*?)color\s*:\s*#fff\b', re.IGNORECASE)
H2_INLINE2 = re.compile(r'(<h[23][^>]*style="[^"]*?)color\s*:\s*white\b', re.IGNORECASE)

GOLD = 'var(--gold,#F5C518)'

changed = []
skipped = []

for path in pages:
    rel = path.replace(ROOT + '/', '')
    try:
        content = open(path, encoding='utf-8').read()
    except Exception as e:
        skipped.append((rel, str(e)))
        continue

    original = content

    # 1. Add site.css link if missing
    if 'site.css' not in content:
        # Insert before </head> or before first <style>
        if '</head>' in content:
            content = content.replace('</head>', f'{SITE_CSS_LINK}\n</head>', 1)
        elif '<style>' in content:
            content = content.replace('<style>', f'{SITE_CSS_LINK}\n<style>', 1)

    # 2. Fix h2 color in <style> blocks
    content = H2_WHITE.sub(lambda m: m.group(1) + f'color:{GOLD}', content)
    content = H2_WHITE2.sub(lambda m: m.group(1) + f'color:{GOLD}', content)

    # 3. Fix h3 color in <style> blocks (only if currently white)
    content = H3_WHITE.sub(lambda m: m.group(1) + f'color:{GOLD}', content)
    content = H3_WHITE2.sub(lambda m: m.group(1) + f'color:{GOLD}', content)

    # 4. Fix inline style attributes on h2/h3 tags
    content = H2_INLINE.sub(lambda m: m.group(1) + f'color:{GOLD}', content)
    content = H2_INLINE2.sub(lambda m: m.group(1) + f'color:{GOLD}', content)

    if content != original:
        open(path, 'w', encoding='utf-8').write(content)
        changed.append(rel)

print(f"Modified: {len(changed)} pages")
print(f"Skipped:  {len(skipped)} pages")
print(f"Unchanged: {len(pages) - len(changed) - len(skipped)} pages")
if skipped:
    print("\nSkipped files:")
    for r, e in skipped:
        print(f"  {r}: {e}")
print("\nFirst 20 modified:")
for r in changed[:20]:
    print(f"  {r}")
