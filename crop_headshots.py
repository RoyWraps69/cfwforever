#!/usr/bin/env python3
"""
Smart-crop all 6 headshots to centered 800x800 squares, face-centered.
Overwrites originals in-place.

Crop strategy per image (all output 800x800 WebP q=85):
  - Take a square crop centered on the face, including head + shoulders
  - Remove excess blank wall/ceiling above the face
"""

from PIL import Image
import os

IMG_DIR = '/home/ubuntu/cfwforever/public/images'
OUT_SIZE = 800

# Per-image crop boxes (left, upper, right, lower) in original pixel coords
# Chosen to center face+shoulders in a square, cutting excess blank space
crops = {
    # 1440x1920 — face center ~x=720, y=700 (eyes at ~y=600, chin ~y=900)
    # Square: 1440 wide, so take 1440x1440 starting at y=100 to y=1540
    'roy_headshot.webp':     (0,    80,  1440, 1520),

    # 1440x1920 — face center ~x=720, y=600 (eyes ~y=500, chin ~y=800)
    # Take 1440x1440 from y=0 to y=1440
    'patti_headshot.webp':   (0,    0,   1440, 1440),

    # 978x1920 — face center ~x=489, y=800 (eyes ~y=680, chin ~y=1000)
    # Width=978, so square is 978x978. Face is in lower half, start at y=380
    'karigan_headshot.webp': (0,    350, 978,  1328),

    # 1440x1920 — face center ~x=720, y=780 (eyes ~y=660, chin ~y=960)
    # Lots of blank wall above. Take 1440x1440 from y=200
    'david_headshot.webp':   (0,    200, 1440, 1640),

    # 1440x1920 — face very close, fills top ~60%. Eyes ~y=380, chin ~y=700
    # Take 1440x1440 from y=0
    'reid_headshot.webp':    (0,    0,   1440, 1440),

    # 1920x1863 — already near-square, face centered. Eyes ~y=350, chin ~y=700
    # Take 1863x1863 centered: x=(1920-1863)/2=28 to 1891
    'brennan_headshot.webp': (28,   0,   1891, 1863),
}

for fname, box in crops.items():
    path = os.path.join(IMG_DIR, fname)
    img = Image.open(path).convert('RGB')
    w, h = img.size

    # Validate box
    left, upper, right, lower = box
    crop_w = right - left
    crop_h = lower - upper
    print(f'{fname}: {w}x{h} → crop {crop_w}x{crop_h} at ({left},{upper})')

    cropped = img.crop(box)
    resized = cropped.resize((OUT_SIZE, OUT_SIZE), Image.LANCZOS)
    resized.save(path, 'WEBP', quality=85)
    print(f'  Saved {OUT_SIZE}x{OUT_SIZE} WebP')

print('\nAll headshots cropped and saved.')
