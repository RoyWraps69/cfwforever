#!/usr/bin/env python3
"""
inject_photos.py
Weaves contextually-correct photos into every static page HTML.
Rules:
- Electrical pages → electrical company vehicles only (any body type)
- Sprinter pages  → any company, Sprinters only
- HVAC pages      → hvac/plumbing/service vans
- Contractor/construction → trucks, box trucks
- Delivery pages  → vans, cargo vans
- Food truck pages → food trucks
- Boat pages      → boats
- Color change    → color change cars / Rivians
- Box truck pages → box trucks only
- Moving pages    → box trucks / moving vans
- Landscaping     → trucks / pickups
- City/neighborhood pages → fleet vans, generic commercial
- etc.
At least 2 photos per page, in different positions, styled inline as float-right/float-left
or full-width section breaks.
"""

import re
import os
from pathlib import Path

PUBLIC = Path("/app/cfw-repo/public")

# ── Photo library, tagged by category ──────────────────────────────────────
PHOTOS = {
    # ELECTRICAL
    "electrical": [
        ("/images/arnold_electric_van.webp",   "Arnold Electric service van wrap — electrician vehicle graphics Chicago"),
        ("/images/arnold_electric_truck.webp",  "Arnold Electric truck wrap — commercial electrician vehicle branding"),
        ("/images/arnold_electric_sales.webp",  "Arnold Electric fleet wrap — electrical contractor vehicle graphics"),
        ("/images/studio/arnold-electric-transit-van-wrap.webp",  "Arnold Electric transit van wrap Chicago"),
        ("/images/studio/arnold-electric-transit-van-wrap-2.webp","Arnold Electric van fleet wrap — Chicago electrician"),
        ("/images/studio/arnold-electric-transit-van-wrap-3.webp","Arnold Electric van wrap — commercial electrician branding"),
    ],
    # HVAC / PLUMBING / SERVICE VAN
    "hvac": [
        ("/images/precision_today_hvac.webp",   "Precision Today HVAC van wrap Chicago"),
        ("/images/sbc_hvac_van.webp",            "SBC HVAC van wrap — service vehicle graphics Chicago"),
        ("/images/studio/pro-air-transit-van-wrap.webp", "Pro Air HVAC transit van wrap Chicago"),
        ("/images/studio/pro-air-suv-wrap.webp", "Pro Air HVAC SUV wrap — commercial vehicle graphics"),
        ("/images/studio/puroclean-transit-van-wrap.webp","PuroClean transit van wrap — commercial service vehicle"),
        ("/images/studio/puroclean-cargo-van-wrap.webp",  "PuroClean cargo van wrap Chicago"),
    ],
    # SPRINTER VANS
    "sprinter": [
        ("/images/precision_today_sprinter.webp","Precision Today Sprinter van wrap Chicago"),
        ("/images/studio/precision-today-transit-van-wrap.webp",  "Precision Today Sprinter van wrap — commercial fleet graphics"),
        ("/images/studio/precision-today-transit-van-wrap-2.webp","Precision Today Sprinter wrap — professional vehicle branding"),
        ("/images/studio/medxwaste-transit-van-wrap.webp",  "MedXWaste Sprinter van wrap Chicago"),
        ("/images/studio/medxwaste-transit-van-wrap-2.webp","MedXWaste Sprinter fleet wrap — commercial vehicle graphics"),
        ("/images/studio/dp-dough-transit-van-wrap.webp",   "DP Dough Sprinter van wrap Chicago"),
    ],
    # TRANSIT / CARGO VAN / DELIVERY
    "van": [
        ("/images/cfw_van_1.webp", "Chicago Fleet Wraps commercial cargo van wrap"),
        ("/images/cfw_van_2.webp", "Commercial van wrap Chicago — fleet vehicle graphics"),
        ("/images/cfw_van_3.webp", "Fleet van wrap Chicago — commercial branding"),
        ("/images/frontier_fleet_vans.webp","Frontier fleet van wraps — commercial vehicle graphics Chicago"),
        ("/images/small_transit_van_opt.webp","Transit van wrap Chicago — commercial fleet graphics"),
        ("/images/studio/improovy-painters-cargo-van-wrap.webp",  "Improovy Painters cargo van wrap Chicago"),
        ("/images/studio/improovy-painters-cargo-van-wrap-2.webp","Improovy cargo van fleet wrap — commercial vehicle branding"),
        ("/images/studio/mh-equipment-cargo-van-wrap.webp",  "MH Equipment cargo van wrap Chicago"),
        ("/images/studio/mh-equipment-cargo-van-wrap-2.webp","MH Equipment fleet van wrap — commercial graphics Chicago"),
    ],
    # BOX TRUCK
    "boxtruck": [
        ("/images/windy_city_box_truck.webp",      "Windy City Movers box truck wrap Chicago"),
        ("/images/windy_city_box_truck_hero.webp",  "Box truck wrap Chicago — commercial vehicle graphics"),
        ("/images/studio/oakbros-box-truck-wrap.webp",  "Oak Bros box truck wrap Chicago"),
        ("/images/studio/oakbros-box-truck-wrap-2.webp","Oak Bros box truck fleet wrap — commercial branding"),
        ("/images/studio/matte-black-box-truck-wrap.webp","Matte black box truck wrap Chicago — custom vehicle graphics"),
        ("/images/studio/chestnut-health-systems-box-truck-wrap.webp","Commercial box truck wrap Chicago — fleet graphics"),
        ("/images/studio/autonation-mobile-service-box-truck-wrap.webp","AutoNation mobile service box truck wrap Chicago"),
    ],
    # FOOD TRUCK
    "foodtruck": [
        ("/images/hunt_brothers_pizza_truck.webp", "Hunt Brothers Pizza food truck wrap Chicago"),
        ("/images/blondies_beef_truck.webp",        "Blondie's Beef food truck wrap — commercial vehicle graphics Chicago"),
    ],
    # BOAT
    "boat": [
        ("/images/patron_boat.webp",    "Patron Tequila boat wrap Chicago"),
        ("/images/cutwater_boat.webp",  "Cutwater boat wrap — custom marine graphics Chicago"),
        ("/images/green_patron_boat.webp","Patron boat wrap green — custom marine vehicle graphics"),
        ("/images/studio/patron-boat-wrap.webp",  "Patron boat wrap Chicago — custom marine graphics"),
        ("/images/studio/1800-tequila-boat-wrap.webp","1800 Tequila boat wrap — custom marine wrap Chicago"),
    ],
    # COLOR CHANGE / EXOTIC
    "colorchange": [
        ("/images/audi_color_shift.webp",    "Audi color change wrap Chicago — premium vinyl wrap"),
        ("/images/camaro_color_shift.webp",  "Camaro color shift wrap — custom vehicle graphics Chicago"),
        ("/images/bmw_matte_black.webp",     "BMW matte black color change wrap Chicago"),
        ("/images/rivian_blue_holographic.webp","Rivian holographic wrap — EV color change Chicago"),
        ("/images/rivian_rad.webp",          "Rivian R1S custom color change wrap Chicago"),
        ("/images/color_change_tesla.webp",  "Tesla color change wrap Chicago — premium vinyl"),
        ("/images/studio/matte-black-car-wrap.webp","Matte black car wrap Chicago — color change vinyl"),
        ("/images/studio/holographic-car-wrap.webp","Holographic car wrap Chicago — custom color change"),
    ],
    # TRUCKS / CONTRACTOR / CONSTRUCTION / LANDSCAPING
    "truck": [
        ("/images/cfw_truck_1.webp",  "Chicago Fleet Wraps pickup truck wrap"),
        ("/images/cfw_truck_2.webp",  "Contractor truck wrap Chicago — commercial vehicle graphics"),
        ("/images/cfw_truck_3.webp",  "Fleet truck wrap Chicago — commercial branding"),
        ("/images/sns_roofing_truck.webp","SNS Roofing truck wrap — contractor vehicle graphics Chicago"),
        ("/images/exalt_air_pick_up_truck.webp","Exalt Air pickup truck wrap — HVAC contractor vehicle branding"),
        ("/images/studio/roza-contractors-box-truck-wrap.webp","Roza Contractors box truck wrap Chicago"),
        ("/images/studio/central-illinois-detailing-pickup-truck-wrap.webp","Pickup truck wrap Chicago — contractor vehicle graphics"),
        ("/images/studio/koch-construction-suv-wrap.webp","Koch Construction SUV wrap — contractor vehicle branding"),
    ],
    # EV / RIVIAN / TESLA
    "ev": [
        ("/images/rivian_blue_holographic.webp","Rivian EV holographic wrap Chicago"),
        ("/images/rivian_rad.webp",             "Rivian R1S custom EV wrap Chicago"),
        ("/images/rivian_green_r1s.webp",       "Rivian R1S green EV wrap Chicago"),
        ("/images/tesla_cybertruck.webp",        "Tesla Cybertruck wrap Chicago — EV vehicle graphics"),
        ("/images/color_change_tesla.webp",      "Tesla color change EV wrap Chicago"),
        ("/images/studio/amazon-prime-ev-vehicle-wrap.webp","Amazon Prime EV vehicle wrap Chicago"),
        ("/images/studio/matte-black-tesla-ev-vehicle-wrap.webp","Matte black Tesla EV wrap Chicago"),
        ("/images/studio/green-tesla-cybertruck-wrap.webp","Green Tesla Cybertruck wrap Chicago"),
    ],
    # WALL WRAPS
    "wall": [
        ("/images/oakbros_wall_wrap.webp",         "Oak Bros wall wrap mural Chicago"),
        ("/images/balloon_museum_interior.webp",    "Balloon Museum interior wall wrap Chicago"),
        ("/images/balloon_museum_exterior.webp",    "Balloon Museum exterior wall graphics Chicago"),
        ("/images/studio/aws-wall-wrap.webp",       "AWS wall wrap — corporate interior graphics Chicago"),
        ("/images/studio/geometric-pattern-wall-wrap.webp","Geometric wall wrap — commercial interior graphics"),
    ],
    # SEMI / LARGE COMMERCIAL
    "semi": [
        ("/images/studio/stark-semi-truck-wrap.webp",  "Stark semi truck wrap Chicago — commercial vehicle graphics"),
        ("/images/studio/stark-semi-truck-wrap-2.webp","Stark semi truck fleet wrap — commercial branding Chicago"),
        ("/images/studio/chicago-fleet-wraps-semi-truck-wrap.webp","Chicago Fleet Wraps semi truck — commercial vehicle graphics"),
    ],
    # GENERIC COMMERCIAL / FLEET (city pages, general pages)
    "fleet": [
        ("/images/frontier_fleet_vans.webp",  "Frontier fleet vans — commercial vehicle wraps Chicago"),
        ("/images/cfw_van_1.webp",            "Commercial fleet van wrap Chicago"),
        ("/images/cfw_truck_1.webp",          "Commercial fleet truck wrap Chicago"),
        ("/images/wrap_install_closeup.webp", "Vehicle wrap installation closeup — professional install Chicago"),
        ("/images/studio/multi-brand-multi-vehicle-wrap.webp","Multi-brand fleet wraps — commercial vehicle graphics Chicago"),
        ("/images/studio/precision-today-shop-photo-wrap.webp","Professional wrap shop — Chicago Fleet Wraps installation"),
    ],
}

# ── Page-type → photo category mapping ──────────────────────────────────────
PAGE_MAP = {
    "electrician-vehicle-wraps-chicago": ["electrical", "electrical"],
    "electric":                          ["electrical", "electrical"],
    "hvac-van-wraps-chicago":            ["hvac", "van"],
    "hvac":                              ["hvac", "van"],
    "plumbing-van-wraps-chicago":        ["hvac", "van"],
    "plumber":                           ["hvac", "van"],
    "sprinter":                          ["sprinter", "sprinter"],
    "sprinter-van-wraps":                ["sprinter", "sprinter"],
    "transit":                           ["van", "van"],
    "van-wraps-chicago":                 ["van", "van"],
    "delivery-fleet-wraps-chicago":      ["van", "boxtruck"],
    "delivery":                          ["van", "boxtruck"],
    "box-truck-wraps-chicago":           ["boxtruck", "boxtruck"],
    "boxtruck":                          ["boxtruck", "boxtruck"],
    "food-truck-wraps-chicago":          ["foodtruck", "foodtruck"],
    "foodtruck":                         ["foodtruck", "van"],
    "boat-wraps-chicago":                ["boat", "boat"],
    "boating":                           ["boat", "boat"],
    "color-change-wraps":                ["colorchange", "colorchange"],
    "colorchange":                       ["colorchange", "colorchange"],
    "contractor-vehicle-wraps-chicago":  ["truck", "van"],
    "contractor":                        ["truck", "van"],
    "landscaping-truck-wraps-chicago":   ["truck", "truck"],
    "landscape":                         ["truck", "truck"],
    "moving-truck-wraps-chicago":        ["boxtruck", "van"],
    "moving":                            ["boxtruck", "van"],
    "ev-wraps":                          ["ev", "ev"],
    "rivian-wraps-chicago":              ["ev", "ev"],
    "tesla-wraps-chicago":               ["ev", "ev"],
    "full-vehicle-wraps":                ["colorchange", "van"],
    "partial-vehicle-wraps":             ["van", "truck"],
    "partial-vehicle-wraps-chicago":     ["van", "truck"],
    "partial-wraps":                     ["van", "truck"],
    "commercial-vehicle-wraps-chicago":  ["van", "fleet"],
    "commercial":                        ["van", "fleet"],
    "commercial-wraps":                  ["van", "fleet"],
    "fleet-wraps-chicago":               ["fleet", "fleet"],
    "fleet":                             ["fleet", "fleet"],
    "truck-wraps-chicago":               ["truck", "boxtruck"],
    "pickup-truck-wraps":                ["truck", "truck"],
    "pickup-truck":                      ["truck", "truck"],
    "wallwraps":                         ["wall", "wall"],
    "vehicle-wraps-chicago":             ["fleet", "van"],
    "vehicle-wrap-cost-chicago":         ["van", "truck"],
}

# City / neighborhood pages → fleet photos
CITY_SLUGS = {
    "chicago","schaumburg","naperville","aurora","elgin","evanston","lakeview",
    "lincoln-park","loop","downtown-chicago","skokie","albany-park","andersonville",
    "arlington-heights","austin","avondale","belmont-cragin","berwyn","bolingbrook",
    "bridgeport","bronzeville","bucktown","cicero","des-plaines","downers-grove",
    "dunning","edgewater","elmhurst","forest-glen","garfield-park","gold-coast",
    "hermosa","humboldt-park","hyde-park","irving-park","jefferson-park","joliet",
    "kenwood","logan-square","lombard","montclaire","naperville","north-lawndale",
    "norwood-park","oak-park","old-town","orland-park","palatine","pilsen",
    "portage-park","ravenswood","river-north","rogers-park","south-lawndale",
    "tinley-park","ukrainian-village","uptown","west-loop","wheaton","wicker-park",
    "wilmette","servicearea",
}

# ── CSS injected once into site.css approach — use inline style ──────────────
IMG_FLOAT_RIGHT = (
    'style="float:right;margin:0 0 24px 28px;width:min(380px,48%);border-radius:10px;'
    'box-shadow:0 4px 24px rgba(0,0,0,.5);display:block"'
)
IMG_FLOAT_LEFT = (
    'style="float:left;margin:0 28px 24px 0;width:min(380px,48%);border-radius:10px;'
    'box-shadow:0 4px 24px rgba(0,0,0,.5);display:block"'
)
IMG_FULL = (
    'style="width:100%;max-width:860px;display:block;margin:32px auto;border-radius:10px;'
    'box-shadow:0 6px 32px rgba(0,0,0,.6)"'
)

CLEARFIX = '<div style="clear:both"></div>'

def make_img(src, alt, style_str):
    return f'<img src="{src}" alt="{alt}" loading="lazy" width="800" height="500" {style_str}/>'

def inject_photos(html, photos_to_use):
    """Inject photos at smart locations inside the page body."""
    # photos_to_use: list of (src, alt) tuples
    if len(photos_to_use) < 2:
        return html

    # Find good injection points — after <h2> or <p> tags inside <section> or <div class="container">
    # We'll inject AFTER the 2nd <h2> and AFTER the 4th <p> at minimum
    
    results = []
    used = []

    # Injection 1: After the 2nd <h2> — float right
    h2_matches = list(re.finditer(r'</h2>', html, re.IGNORECASE))
    if len(h2_matches) >= 2:
        pos = h2_matches[1].end()
        src, alt = photos_to_use[0]
        img_html = '\n' + make_img(src, alt, IMG_FLOAT_RIGHT) + '\n'
        html = html[:pos] + img_html + html[pos:]
        used.append(0)

    # Injection 2: After the 5th <p> — float left (accounting for offset from injection 1)
    p_matches = list(re.finditer(r'</p>', html, re.IGNORECASE))
    if len(p_matches) >= 5:
        pos = p_matches[4].end()
        src, alt = photos_to_use[1] if len(photos_to_use) > 1 else photos_to_use[0]
        img_html = '\n' + make_img(src, alt, IMG_FLOAT_LEFT) + '\n'
        html = html[:pos] + img_html + html[pos:]

    # Injection 3: If there's a 3rd photo and enough content — full width before final CTA
    if len(photos_to_use) >= 3:
        # Find "final-cta" or last <h2> 
        cta_match = re.search(r'<section[^>]*class="[^"]*final-cta[^"]*"', html, re.IGNORECASE)
        if cta_match:
            pos = cta_match.start()
            src, alt = photos_to_use[2]
            img_html = '\n' + CLEARFIX + '\n' + make_img(src, alt, IMG_FULL) + '\n'
            html = html[:pos] + img_html + html[pos:]

    return html

# ── Per-page photo assignment (deterministic by slug index) ─────────────────
def get_photos_for_slug(slug, idx=0):
    """Return list of (src, alt) for the page."""
    if slug in PAGE_MAP:
        cats = PAGE_MAP[slug]
    elif slug in CITY_SLUGS:
        cats = ["fleet", "van"]
    else:
        cats = ["fleet", "van"]

    result = []
    for i, cat in enumerate(cats):
        pool = PHOTOS.get(cat, PHOTOS["fleet"])
        photo_idx = (idx + i) % len(pool)
        result.append(pool[photo_idx])

    # Add a 3rd from the first category (offset)
    pool = PHOTOS.get(cats[0], PHOTOS["fleet"])
    result.append(pool[(idx + 2) % len(pool)])

    return result

# ── Skip pages that already have enough photos ───────────────────────────────
def count_photos(html):
    return len(re.findall(r'<img\b', html, re.IGNORECASE))

# ── Main ─────────────────────────────────────────────────────────────────────
SKIP_SLUGS = {
    "", "googleac4190c5fb66b0fb", "site", "sitemap", "custom-sitemap",
    "robots", "404", "blog", "post", "portfolio", "beforeafter",
    "estimate", "contact", "intake", "schedule", "calculator",
    "rent-the-bay", "video", "visualizer", "stats", "roi", "vsads",
    "faq", "warranty", "care", "materials", "about", "brand-audit",
    "brandaudit", "refund-policy", "apparel", "signsandgraphics",
}

html_files = sorted(PUBLIC.rglob("*/index.html"))
processed = 0
skipped_few_imgs = 0
skipped_slug = 0
skipped_no_container = 0

for i, fp in enumerate(html_files):
    # Derive slug from path
    rel = fp.parent.relative_to(PUBLIC)
    slug = str(rel).strip("/")

    if slug in SKIP_SLUGS:
        skipped_slug += 1
        continue

    # Skip blog posts
    if slug.startswith("post/"):
        skipped_slug += 1
        continue

    html = fp.read_text(encoding='utf-8', errors='replace')

    # Skip pages that already have 6+ images (well-stocked)
    existing_imgs = count_photos(html)
    if existing_imgs >= 8:
        skipped_few_imgs += 1
        continue

    # Must have a container to inject into
    if 'class="container"' not in html and '<section' not in html:
        skipped_no_container += 1
        continue

    photos = get_photos_for_slug(slug, idx=i % 5)
    
    new_html = inject_photos(html, photos)

    if new_html != html:
        fp.write_text(new_html, encoding='utf-8')
        processed += 1

print(f"✓ Injected photos into {processed} pages")
print(f"  Skipped (already rich): {skipped_few_imgs}")
print(f"  Skipped (utility page): {skipped_slug}")
print(f"  Skipped (no container): {skipped_no_container}")
