#!/usr/bin/env python3
"""
Replace every incorrect address variant with the correct address:
  4711 N Lamon Ave #7 #7, Chicago, IL 60630
across all HTML pages, scripts, and template files.
"""
import os
import re
import glob

CORRECT = '4711 N Lamon Ave #7 #7, Chicago, IL 60630'
CORRECT_STREET = '4711 N Lamon Ave #7 #7'
CORRECT_FULL_SCHEMA = '4711 N Lamon Ave #7 #7'

# All the wrong variants to replace
REPLACEMENTS = [
    # Wrong street number / wrong street
    ('4711 N Lamon Ave #7 #7, Chicago, IL 60630', CORRECT),
    ('4711 N Lamon Ave #7 #7, Chicago, IL 60630', CORRECT),
    ('4711 N Lamon Ave #7 #7, Chicago, IL 60630', CORRECT),
    ('4711 N Lamon Ave #7 #7, Chicago, IL 60630', CORRECT),
    ('4711 N Lamon Ave #7 #7', '4711 N Lamon Ave #7 #7'),
    # Correct street but missing suite
    ('4711 N Lamon Ave #7 #7, Chicago, IL 60630', CORRECT),
    ('4711 N Lamon Ave #7 #7, Chicago, IL 60630', CORRECT),
    ('4711 N Lamon Ave #7 #7, Chicago, IL 60630', CORRECT),
    ('4711 N Lamon Ave #7 #7, Chicago, IL 60630', CORRECT),
    ('4711 N Lamon Ave #7 #7, Chicago, IL 60630', CORRECT),
    # Street only variants
    ('4711 N Lamon Ave #7 #7', CORRECT_STREET),
    ('4711 N Lamon Ave #7', CORRECT_STREET),
    # Wrong zip
    ('Chicago, IL 60630', 'Chicago, IL 60630'),
    ('Chicago, IL 60630', 'Chicago, IL 60630'),
    # Footer copyright line variants
    ('4711 N Lamon Ave #7 #7, Chicago, IL 60630', CORRECT),
    ('4711 N Lamon Ave #7', '4711 N Lamon Ave #7 #7'),
]

# File patterns to process
patterns = [
    '/home/ubuntu/cfwforever/public/**/*.html',
    '/home/ubuntu/cfwforever/public/*.html',
    '/home/ubuntu/cfwforever/scripts/*.mjs',
    '/home/ubuntu/cfwforever/scripts/*.js',
    '/home/ubuntu/cfwforever/src/**/*.njk',
    '/home/ubuntu/cfwforever/src/**/*.html',
    '/home/ubuntu/cfwforever/*.py',
    '/home/ubuntu/cfwforever/*.html',
]

files_changed = 0
total_replacements = 0

processed = set()
all_files = []
for pattern in patterns:
    all_files.extend(glob.glob(pattern, recursive=True))

for fp in all_files:
    if fp in processed:
        continue
    processed.add(fp)
    
    try:
        with open(fp, encoding='utf-8') as f:
            content = f.read()
    except Exception:
        continue
    
    original = content
    for wrong, right in REPLACEMENTS:
        content = content.replace(wrong, right)
    
    if content != original:
        with open(fp, 'w', encoding='utf-8') as f:
            f.write(content)
        count = sum(original.count(w) for w, _ in REPLACEMENTS)
        files_changed += 1
        total_replacements += count
        print(f'  Fixed: {fp.replace("/home/ubuntu/cfwforever/", "")}')

print(f'\nDone: {files_changed} files updated, ~{total_replacements} replacements')
