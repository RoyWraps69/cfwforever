#!/usr/bin/env python3
"""
Two fixes applied to every HTML page:
1. Fix re-corrupted UTF-8 emoji (Ã° → 📞, Ã¢ → →, etc.) using ftfy
2. Add window.scrollTo(0,0) on page load so pages always start at top
"""

import glob, re, os

try:
    import ftfy
    HAS_FTFY = True
except ImportError:
    os.system('pip3 install ftfy -q')
    import ftfy
    HAS_FTFY = True

base = '/home/ubuntu/cfwforever/public'
SKIP = {f'{base}/index.html'}  # homepage already clean

all_pages = list(set(
    glob.glob(f'{base}/**/*.html', recursive=True) +
    glob.glob(f'{base}/*.html')
))

SCROLL_SNIPPET = '<script>if(history.scrollRestoration)history.scrollRestoration="manual";window.addEventListener("load",function(){window.scrollTo(0,0)});</script>'

fixed_enc = 0
fixed_scroll = 0
errors = []

for path in sorted(all_pages):
    if path in SKIP:
        continue
    try:
        with open(path, encoding='utf-8') as f:
            content = f.read()

        if '<html' not in content:
            continue

        changed = False

        # ── 1. Fix encoding corruption ──────────────────────────────────────
        fixed_content = ftfy.fix_text(content)
        if fixed_content != content:
            content = fixed_content
            changed = True
            fixed_enc += 1

        # ── 2. Add scroll-to-top if not already present ─────────────────────
        if 'scrollTo(0,0)' not in content and 'scrollRestoration' not in content:
            # Insert just before </body>
            if '</body>' in content:
                content = content.replace('</body>', f'{SCROLL_SNIPPET}\n</body>', 1)
            else:
                content += f'\n{SCROLL_SNIPPET}'
            changed = True
            fixed_scroll += 1

        if changed:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)

    except Exception as e:
        errors.append((path, str(e)))

print(f'Encoding fixed: {fixed_enc}')
print(f'Scroll-to-top added: {fixed_scroll}')
print(f'Errors: {len(errors)}')
for p, e in errors:
    print(f'  ERROR {p}: {e}')
