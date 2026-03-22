#!/usr/bin/env python3
"""
Fix all corrupted UTF-8 characters across all HTML pages and CSS files
using the ftfy library which correctly handles mojibake (encoding corruption).
"""

import glob
import ftfy

ROOT = '/home/ubuntu/cfwforever/public'
SITE_CSS = '/home/ubuntu/cfwforever/public/css/site.css'

changed = 0
failed = 0

all_files = sorted(glob.glob(f'{ROOT}/**/index.html', recursive=True))
all_files.append(SITE_CSS)

for path in all_files:
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        fixed = ftfy.fix_text(content)
        
        if fixed != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(fixed)
            changed += 1
    except Exception as e:
        print(f'FAILED: {path}: {e}')
        failed += 1

print(f'Fixed {changed} files, {failed} failures')

# Spot-check several pages
import os
checks = [
    'hvac-van-wraps-chicago',
    'hvac',
    'arlington-heights',
    'plumber',
    'electric',
    'contractor',
    'sprinter',
]

for slug in checks:
    path = f'{ROOT}/{slug}/index.html'
    if os.path.exists(path):
        with open(path, encoding='utf-8') as f:
            content = f.read()
        # Find trust/stat bar
        idx = content.find('24+ Years')
        if idx >= 0:
            snippet = content[idx-15:idx+50]
            print(f'{slug}: {snippet}')
        else:
            print(f'{slug}: no "24+ Years" found')
