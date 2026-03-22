#!/usr/bin/env python3
"""
Update hero heading sizes to be large, bold, and impactful across all pages.
Targets:
  - .page-hero-banner .hero-h1  → clamp(52px, 8vw, 88px)
  - .page-hero-banner .hero-h2  → clamp(36px, 5vw, 60px)
  - .page-hero-banner .hero-eyebrow → 14px, wider letter-spacing
  - h1 (page body) → clamp(2.8rem, 6vw, 4.4rem)
  - homepage hero .hc h1 → clamp(3rem, 6vw, 5rem)
Also updates the canonical CSS block injected into all pages.
"""

import glob, re

base = '/home/ubuntu/cfwforever/public'

# ── NEW HERO CSS RULES (replaces the old ones in the canonical block) ─────────
OLD_HERO_RULES = """.page-hero-banner .hero-h1{font-family:var(--D,var(--H));font-size:clamp(36px,6vw,72px);line-height:.95;color:#fff;text-shadow:0 4px 20px rgba(0,0,0,.6);margin:0}
.page-hero-banner .hero-h1 span{color:var(--gold)}
.page-hero-banner .hero-accent{position:absolute;left:0;top:0;width:6px;height:100%;background:var(--gold)}
.page-hero-banner .hero-h2{font-family:var(--H);font-size:clamp(1.4rem,3vw,2rem);font-weight:700;color:var(--gold);margin:0;line-height:1.2;text-shadow:0 2px 12px rgba(0,0,0,.5)}"""

NEW_HERO_RULES = """.page-hero-banner .hero-h1{font-family:var(--D,var(--H));font-size:clamp(52px,8vw,88px);line-height:.92;color:#fff;text-shadow:0 4px 28px rgba(0,0,0,.7);margin:0;font-weight:900;letter-spacing:-.01em}
.page-hero-banner .hero-h1 span{color:var(--gold)}
.page-hero-banner .hero-accent{position:absolute;left:0;top:0;width:8px;height:100%;background:var(--gold)}
.page-hero-banner .hero-h2{font-family:var(--H);font-size:clamp(36px,5vw,60px);font-weight:900;color:var(--gold);margin:0;line-height:1.05;text-shadow:0 2px 16px rgba(0,0,0,.6);letter-spacing:-.01em}"""

OLD_EYEBROW = """.page-hero-banner .hero-eyebrow{font-family:var(--H);font-size:13px;font-weight:600;letter-spacing:5px;text-transform:uppercase;color:var(--gold);margin-bottom:8px}"""
NEW_EYEBROW = """.page-hero-banner .hero-eyebrow{font-family:var(--H);font-size:13px;font-weight:700;letter-spacing:6px;text-transform:uppercase;color:var(--gold);margin-bottom:12px;opacity:.9}"""

OLD_H1 = """h1{font-family:var(--D,var(--H));font-size:clamp(2.4rem,5vw,3.6rem);color:#fff;margin-bottom:16px;line-height:1.05}"""
NEW_H1 = """h1{font-family:var(--D,var(--H));font-size:clamp(2.8rem,6vw,4.4rem);color:#fff;margin-bottom:16px;line-height:1.02;font-weight:900}"""

# Mobile breakpoint update — larger hero on mobile too
OLD_MOBILE_HERO = """  .page-hero-banner{height:260px}
  .page-hero-banner .hero-text{left:24px;bottom:28px}
  .page-hero-banner .hero-h1{font-size:clamp(28px,8vw,48px)}"""
NEW_MOBILE_HERO = """  .page-hero-banner{height:300px}
  .page-hero-banner .hero-text{left:20px;bottom:24px}
  .page-hero-banner .hero-h1{font-size:clamp(36px,9vw,56px)}
  .page-hero-banner .hero-h2{font-size:clamp(28px,7vw,44px)}"""

all_pages = list(set(
    glob.glob(f'{base}/**/*.html', recursive=True) +
    glob.glob(f'{base}/*.html')
))

fixed = 0
for path in sorted(all_pages):
    try:
        with open(path, encoding='utf-8') as f:
            c = f.read()
        if '<html' not in c:
            continue

        new_c = c
        new_c = new_c.replace(OLD_HERO_RULES, NEW_HERO_RULES)
        new_c = new_c.replace(OLD_EYEBROW, NEW_EYEBROW)
        new_c = new_c.replace(OLD_H1, NEW_H1)
        new_c = new_c.replace(OLD_MOBILE_HERO, NEW_MOBILE_HERO)

        # Also fix homepage hero heading (.hc h1) — it uses a different selector
        # Update the homepage hero h1 size
        new_c = re.sub(
            r'(\.hc h1\{[^}]*font-size:)clamp\([^)]+\)',
            r'\1clamp(3rem,6vw,5rem)',
            new_c
        )

        if new_c != c:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_c)
            fixed += 1

    except Exception as e:
        print(f'ERROR {path}: {e}')

print(f'Updated: {fixed} pages')
