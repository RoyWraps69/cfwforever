#!/usr/bin/env python3
"""
Fix double-encoded UTF-8 characters across all HTML pages.

Root cause: Python scripts opened files without encoding='utf-8', causing
the default system encoding (latin-1/cp1252) to misread multi-byte UTF-8
sequences, then re-write them as corrupted bytes.

Fix: For each file, read raw bytes, attempt to fix double-encoding by
decoding as latin-1 then re-encoding as latin-1 to get original bytes,
then decode as UTF-8. Write back as clean UTF-8.
"""

import glob
import os

ROOT = '/home/ubuntu/cfwforever/public'
SITE_CSS = '/home/ubuntu/cfwforever/public/css/site.css'

def fix_double_encoded(raw_bytes):
    """
    Detect and fix double-encoded UTF-8.
    If the file contains sequences like C3 83 C2 B0 (Ã°) which are
    double-encoded UTF-8 of F0 (start of 4-byte emoji), fix them.
    """
    # Check if file has double-encoded sequences
    # Double-encoded: C3 83 = Ã, followed by C2 XX patterns
    if b'\xc3\x83\xc2' not in raw_bytes and b'\xc3\x82\xc2' not in raw_bytes:
        return raw_bytes, False  # No double-encoding detected
    
    try:
        # Step 1: decode the raw bytes as latin-1 (treats each byte as a character)
        latin1_str = raw_bytes.decode('latin-1')
        # Step 2: encode back to bytes as latin-1 (recovers original byte values)
        recovered_bytes = latin1_str.encode('latin-1')
        # Step 3: try to decode as UTF-8 to verify it's valid
        recovered_bytes.decode('utf-8')
        return recovered_bytes, True
    except (UnicodeDecodeError, UnicodeEncodeError):
        return raw_bytes, False

changed = 0
failed = 0

all_files = sorted(glob.glob(f'{ROOT}/**/index.html', recursive=True))
all_files.append(SITE_CSS)

for path in all_files:
    with open(path, 'rb') as f:
        raw = f.read()
    
    fixed, was_changed = fix_double_encoded(raw)
    
    if was_changed:
        # Verify the fixed content is valid UTF-8
        try:
            fixed.decode('utf-8')
            with open(path, 'wb') as f:
                f.write(fixed)
            changed += 1
        except UnicodeDecodeError:
            print(f'  FAILED to fix: {path}')
            failed += 1

print(f'Fixed {changed} files, {failed} failures')

# Spot-check
with open(f'{ROOT}/hvac-van-wraps-chicago/index.html', 'rb') as f:
    content = f.read().decode('utf-8')
idx = content.find('24+ Years')
if idx >= 0:
    print(f'Spot check HVAC van: ...{content[idx-20:idx+60]}...')

with open(f'{ROOT}/hvac/index.html', 'rb') as f:
    content = f.read().decode('utf-8')
idx = content.find('24+ Years')
if idx >= 0:
    print(f'Spot check HVAC: ...{content[idx-20:idx+60]}...')
