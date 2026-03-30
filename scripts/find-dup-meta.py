#!/usr/bin/env python3
import re, os
from collections import defaultdict

descs = defaultdict(list)
meta_pat = re.compile(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']*)["\']', re.I)
meta_pat2 = re.compile(r'<meta\s+content=["\']([^"\']*)["\'].*?name=["\']description["\']', re.I)

for root, dirs, files in os.walk('public'):
    dirs[:] = [d for d in dirs if d not in {'images','js','css','fonts','icons'}]
    if 'index.html' in files:
        html = open(os.path.join(root, 'index.html')).read()
        m = meta_pat.search(html)
        if not m:
            m = meta_pat2.search(html)
        if m:
            desc = m.group(1).strip()
            slug = os.path.relpath(root, 'public')
            slug = '/' if slug == '.' else '/' + slug + '/'
            descs[desc].append(slug)

print('=== DUPLICATE META DESCRIPTIONS ===')
for desc, slugs in sorted(descs.items(), key=lambda x: -len(x[1])):
    if len(slugs) > 1:
        print(f'\nDESC ({len(slugs)} pages): {desc[:100]}...')
        for s in slugs:
            print(f'  {s}')

# Also find short (<120 chars) and long (>160 chars) meta descriptions
print('\n=== SHORT META DESCRIPTIONS (<120 chars) ===')
for desc, slugs in descs.items():
    if len(desc) < 120:
        for s in slugs:
            print(f'  {s} ({len(desc)} chars): {desc[:80]}...')

print('\n=== LONG META DESCRIPTIONS (>160 chars) ===')
for desc, slugs in descs.items():
    if len(desc) > 160:
        for s in slugs:
            print(f'  {s} ({len(desc)} chars): {desc[:80]}...')
