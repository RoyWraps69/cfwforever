"""
Context-aware replacement of CFW-branded images with real client work.
Picks category based on page URL/slug.
"""
import re
import urllib.request
import json
import base64
import pickle
import time

TOKEN = "<GITHUB_TOKEN_FROM_MEMORY>"
REPO = "RoyWraps69/cfwforever"

CFW_PATTERN = re.compile(r'cfw_(?:van|truck)_\d\.webp')

# Category → list of replacement image paths (cycled per page)
POOLS = {
    'hvac': [
        '/images/sbc_hvac_van.webp',
        '/images/precision_today_hvac.webp',
        '/images/precision_today_after.webp',
        '/images/precision_today_before.webp',
    ],
    'electric': [
        '/images/arnold_electric_van.webp',
        '/images/arnold_electric_truck.webp',
        '/images/arnold_electric_sales.webp',
        '/images/studio/arnold-electric-decals-only-wrap-2.webp',
    ],
    'rivian': [
        '/images/rivian_green_r1s.webp',
        '/images/rivian_blue_holographic.webp',
        '/images/rivian_pink_r1s.webp',
        '/images/blue_origin_launch_rivian.webp',
        '/images/rivian_rad.webp',
    ],
    'boat_marine': [
        '/images/patron_boat.webp',
        '/images/studio/1800-tequila-boat-wrap.webp',
        '/images/studio/fiesta-vee-320-boat-wrap.webp',
        '/images/cutwater_boat.webp',
        '/images/green_patron_boat.webp',
        '/images/studio/patron-boat-wrap-2.webp',
    ],
    'food_truck': [
        '/images/blondies_beef_truck.webp',
        '/images/healthy_in_a_hurry_food_truck.webp',
    ],
    'color_change': [
        '/images/audi_color_shift.webp',
        '/images/camaro_color_shift.webp',
        '/images/bmw_matte_black.webp',
    ],
    'rent_bay': [
        '/images/balloon_museum_exterior.webp',
        '/images/balloon_museum_interior.webp',
        '/images/balloon_museum_massive.webp',
    ],
    'suv': [
        '/images/4aces_suv.webp',
        '/images/studio/gmc-yukon-suv-wrap.webp',
        '/images/studio/koch-construction-suv-wrap.webp',
        '/images/studio/matte-black-suv-wrap.webp',
    ],
    # Generic fleet/commercial work — Instagram exports of real CFW jobs
    'generic': [
        '/images/497515435_24330598833209840_7307182871652909685_n.webp',
        '/images/496928478_24317780384491685_4884906545053314507_n.webp',
        '/images/497639999_24317780324491691_6025330273556081540_n.webp',
        '/images/498082014_24330598523209871_6738588666879214947_n.webp',
        '/images/497767279_24332472089689181_2225150346793984394_n.webp',
        '/images/498587882_24363965446539845_8040426383196277230_n.webp',
        '/images/499031832_24357754093827647_8285045186686109093_n.webp',
        '/images/503510088_24485339417735780_5558300970756617480_n.webp',
    ],
}

def category_for_path(path):
    """Map page path to image category."""
    p = path.lower()
    if any(k in p for k in ['hvac', 'plumb', 'heat']): return 'hvac'
    if 'electric' in p or 'electrician' in p: return 'electric'
    if 'rivian' in p: return 'rivian'
    if any(k in p for k in ['boat','marine','yacht','pontoon','fishing-boat','jet-ski','jetski']): return 'boat_marine'
    if 'food-truck' in p or 'foodtruck' in p: return 'food_truck'
    if any(k in p for k in ['color-change','colour-change','matte','satin','gloss','metallic','holograph']): return 'color_change'
    if 'rent-the-bay' in p or 'bay-rental' in p: return 'rent_bay'
    if 'suv' in p or '4aces' in p or 'yukon' in p: return 'suv'
    return 'generic'

# Replacement logo for meta/schema (clean brand, no photo)
META_LOGO = "/images/logo-horizontal.webp"

def clean_and_swap(html, path):
    """
    Swap CFW-branded images with contextually-appropriate client work.
    Returns (new_html, stats).
    """
    stats = {
        'img_swapped': 0, 'vbg_removed': 0, 'meta_swapped': 0,
        'schema_swapped': 0, 'plain_swapped': 0,
    }
    
    cat = category_for_path(path)
    pool = POOLS[cat]
    pool_idx = [0]  # mutable counter
    
    def next_img():
        img = pool[pool_idx[0] % len(pool)]
        pool_idx[0] += 1
        return img
    
    # 1. Decorative .vbg-img collage blocks on homepage — just remove
    # (The homepage has a collage with multiple images; the CFW ones should disappear cleanly)
    def remove_vbg(m):
        stats['vbg_removed'] += 1
        return ''
    html = re.sub(
        r'<div[^>]*class="vbg-img"[^>]*background-image:url\([\'"]?/images/cfw_(?:van|truck)_\d\.webp[\'"]?\)[^>]*>\s*</div>\s*',
        remove_vbg, html, flags=re.DOTALL
    )
    
    # 2. Swap CFW src references in <img> tags (preserves wrapping div/figure, keeps alt text flexible)
    def swap_img_src(m):
        stats['img_swapped'] += 1
        full = m.group(0)
        new_img = next_img()
        return re.sub(r'src="/images/cfw_(?:van|truck)_\d\.webp"', f'src="{new_img}"', full)
    
    html = re.sub(
        r'<img[^>]*src="/images/cfw_(?:van|truck)_\d\.webp"[^>]*/?>',
        swap_img_src, html
    )
    
    # 3. Swap CFW src in srcset, data-src, etc.
    html = re.sub(
        r'(srcset|data-src|data-original)="[^"]*cfw_(?:van|truck)_\d\.webp[^"]*"',
        lambda m: f'{m.group(1)}="{next_img()}"',
        html
    )
    
    # 4. Swap meta og:image / twitter:image to logo (clean brand, no photo)
    def swap_meta(m):
        stats['meta_swapped'] += 1
        return re.sub(
            r'(https?://[^"]*)?/images/cfw_(?:van|truck)_\d\.webp',
            META_LOGO if '"/images/' in m.group(0) else 'https://chicagofleetwraps.com' + META_LOGO,
            m.group(0)
        )
    html = re.sub(
        r'<meta[^>]*(?:og:image|twitter:image)[^>]*cfw_(?:van|truck)_\d\.webp[^>]*/?>',
        swap_meta, html
    )
    html = re.sub(
        r'<meta[^>]*cfw_(?:van|truck)_\d\.webp[^>]*(?:og:image|twitter:image)[^>]*/?>',
        swap_meta, html
    )
    
    # 5. Swap schema "image" fields to logo
    def swap_schema(m):
        stats['schema_swapped'] += 1
        old = m.group(0)
        has_https = 'https://' in old
        replacement = (('https://chicagofleetwraps.com' if has_https else '') + META_LOGO)
        return re.sub(r'(https?://[^"]*)?/images/cfw_(?:van|truck)_\d\.webp', replacement, old)
    
    html = re.sub(
        r'"(?:image|url|contentUrl|thumbnailUrl)":\s*"[^"]*cfw_(?:van|truck)_\d\.webp"',
        swap_schema, html
    )
    
    # 6. Background-image in inline styles (non-vbg) — replace URL
    def swap_bg(m):
        stats['plain_swapped'] += 1
        return re.sub(r'/images/cfw_(?:van|truck)_\d\.webp', next_img(), m.group(0))
    html = re.sub(
        r"background(?:-image)?:\s*url\(['\"]?/images/cfw_(?:van|truck)_\d\.webp['\"]?\)",
        swap_bg, html
    )
    
    # 7. Any remaining standalone URL references (catch-all for stragglers)
    def catch_all(m):
        stats['plain_swapped'] += 1
        return next_img()
    html = re.sub(r'/images/cfw_(?:van|truck)_\d\.webp', catch_all, html)
    
    return html, stats


def fetch_raw(path):
    url = f"https://raw.githubusercontent.com/{REPO}/main/{path}"
    req = urllib.request.Request(url, headers={"User-Agent": "CFW"})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.read().decode('utf-8', 'ignore')
    except:
        return None


if __name__ == '__main__':
    # Load the list of affected pages
    with open('cfw_img_hits.pkl','rb') as f:
        hits = pickle.load(f)
    
    # Ensure the 3 stragglers are included even if they weren't in the hit map
    for extra in ['public/index.html', 'public/site/index.html', 'public/vehicle-wraps-chicago/index.html']:
        if extra not in hits:
            hits[extra] = []
    
    print(f"Processing {len(hits)} pages with CFW-image cleanup + context swap...\n")
    
    updates = {}
    cat_counts = {}
    total_stats = {'img_swapped': 0, 'vbg_removed': 0, 'meta_swapped': 0, 'schema_swapped': 0, 'plain_swapped': 0}
    still_has_cfw = []
    
    for i, path in enumerate(sorted(hits.keys()), 1):
        html = fetch_raw(path)
        if not html:
            print(f"  [{i}/{len(hits)}] FETCH FAIL {path}")
            continue
        
        # Skip if no CFW refs (shouldn't happen but safety)
        if 'cfw_van' not in html and 'cfw_truck' not in html:
            continue
        
        cat = category_for_path(path)
        cat_counts[cat] = cat_counts.get(cat, 0) + 1
        
        cleaned, stats = clean_and_swap(html, path)
        
        # Verify
        remaining = len(CFW_PATTERN.findall(cleaned))
        if remaining > 0:
            still_has_cfw.append((path, remaining))
        
        if cleaned != html:
            updates[path] = cleaned
            for k in stats:
                total_stats[k] += stats[k]
        
        if i % 40 == 0:
            print(f"  [{i}/{len(hits)}] — {len(updates)} changed, {len(still_has_cfw)} straggler")
        time.sleep(0.008)
    
    print(f"\n=== CATEGORY DISTRIBUTION ===")
    for cat, n in sorted(cat_counts.items(), key=lambda x: -x[1]):
        print(f"  {cat:<15} {n:>4} pages")
    
    print(f"\n=== SWAP STATS ===")
    for k, v in total_stats.items():
        print(f"  {k:<20} {v:>5}")
    
    print(f"\nPages updated: {len(updates)}/{len(hits)}")
    if still_has_cfw:
        print(f"\n⚠️ {len(still_has_cfw)} pages still have CFW refs:")
        for p, n in still_has_cfw:
            print(f"  {n} refs — {p}")
    else:
        print(f"\n✅ ZERO CFW-branded image references remain across all pages")
    
    with open('cfw_swap_updates.pkl','wb') as f:
        pickle.dump(updates, f)
    print(f"\n✓ Saved {len(updates)} page updates for commit")
