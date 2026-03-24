#!/usr/bin/env python3
"""
inject_photos_v2.py — fixes pages using class="content" or other containers
"""
import re
from pathlib import Path

PUBLIC = Path("/app/cfw-repo/public")

PHOTOS = {
    "electrical": [
        ("/images/arnold_electric_van.webp",   "Arnold Electric service van wrap — electrician vehicle graphics Chicago"),
        ("/images/arnold_electric_truck.webp",  "Arnold Electric truck wrap — commercial electrician vehicle branding"),
        ("/images/arnold_electric_sales.webp",  "Arnold Electric fleet wrap — electrical contractor vehicle graphics"),
        ("/images/studio/arnold-electric-transit-van-wrap.webp",  "Arnold Electric transit van wrap Chicago"),
        ("/images/studio/arnold-electric-transit-van-wrap-2.webp","Arnold Electric van fleet wrap — Chicago electrician"),
        ("/images/studio/arnold-electric-transit-van-wrap-3.webp","Arnold Electric van wrap — commercial electrician branding"),
    ],
    "hvac": [
        ("/images/precision_today_hvac.webp",   "Precision Today HVAC van wrap Chicago"),
        ("/images/sbc_hvac_van.webp",            "SBC HVAC van wrap — service vehicle graphics Chicago"),
        ("/images/studio/pro-air-transit-van-wrap.webp", "Pro Air HVAC transit van wrap Chicago"),
        ("/images/studio/pro-air-suv-wrap.webp", "Pro Air HVAC SUV wrap — commercial vehicle graphics"),
        ("/images/studio/puroclean-transit-van-wrap.webp","PuroClean transit van wrap — commercial service vehicle"),
        ("/images/studio/puroclean-cargo-van-wrap.webp",  "PuroClean cargo van wrap Chicago"),
        ("/images/studio/medxwaste-transit-van-wrap.webp","MedXWaste HVAC service van wrap Chicago"),
    ],
    "sprinter": [
        ("/images/precision_today_sprinter.webp","Precision Today Sprinter van wrap Chicago"),
        ("/images/studio/precision-today-transit-van-wrap.webp",  "Precision Today Sprinter van wrap — commercial fleet graphics"),
        ("/images/studio/precision-today-transit-van-wrap-2.webp","Precision Today Sprinter wrap — professional vehicle branding"),
        ("/images/studio/medxwaste-transit-van-wrap.webp",  "MedXWaste Sprinter van wrap Chicago"),
        ("/images/studio/medxwaste-transit-van-wrap-2.webp","MedXWaste Sprinter fleet wrap — commercial vehicle graphics"),
        ("/images/studio/dp-dough-transit-van-wrap.webp",   "DP Dough Sprinter van wrap Chicago"),
    ],
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
    "boxtruck": [
        ("/images/windy_city_box_truck.webp",      "Windy City Movers box truck wrap Chicago"),
        ("/images/windy_city_box_truck_hero.webp",  "Box truck wrap Chicago — commercial vehicle graphics"),
        ("/images/studio/oakbros-box-truck-wrap.webp",  "Oak Bros box truck wrap Chicago"),
        ("/images/studio/oakbros-box-truck-wrap-2.webp","Oak Bros box truck fleet wrap — commercial branding"),
        ("/images/studio/matte-black-box-truck-wrap.webp","Matte black box truck wrap Chicago — custom vehicle graphics"),
        ("/images/studio/chestnut-health-systems-box-truck-wrap.webp","Commercial box truck wrap Chicago — fleet graphics"),
        ("/images/studio/autonation-mobile-service-box-truck-wrap.webp","AutoNation mobile service box truck wrap Chicago"),
    ],
    "foodtruck": [
        ("/images/hunt_brothers_pizza_truck.webp", "Hunt Brothers Pizza food truck wrap Chicago"),
        ("/images/blondies_beef_truck.webp",        "Blondie's Beef food truck wrap — commercial vehicle graphics Chicago"),
    ],
    "boat": [
        ("/images/patron_boat.webp",    "Patron Tequila boat wrap Chicago"),
        ("/images/cutwater_boat.webp",  "Cutwater boat wrap — custom marine graphics Chicago"),
        ("/images/green_patron_boat.webp","Patron boat wrap green — custom marine vehicle graphics"),
        ("/images/studio/patron-boat-wrap.webp",  "Patron boat wrap Chicago — custom marine graphics"),
        ("/images/studio/1800-tequila-boat-wrap.webp","1800 Tequila boat wrap — custom marine wrap Chicago"),
    ],
    "colorchange": [
        ("/images/audi_color_shift.webp",    "Audi color change wrap Chicago — premium vinyl wrap"),
        ("/images/camaro_color_shift.webp",  "Camaro color shift wrap — custom vehicle graphics Chicago"),
        ("/images/bmw_matte_black.webp",     "BMW matte black color change wrap Chicago"),
        ("/images/rivian_blue_holographic.webp","Rivian holographic wrap — EV color change Chicago"),
        ("/images/color_change_tesla.webp",  "Tesla color change wrap Chicago — premium vinyl"),
        ("/images/studio/matte-black-car-wrap.webp","Matte black car wrap Chicago — color change vinyl"),
        ("/images/studio/holographic-car-wrap.webp","Holographic car wrap Chicago — custom color change"),
    ],
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
    "wall": [
        ("/images/oakbros_wall_wrap.webp",         "Oak Bros wall wrap mural Chicago"),
        ("/images/balloon_museum_interior.webp",    "Balloon Museum interior wall wrap Chicago"),
        ("/images/balloon_museum_exterior.webp",    "Balloon Museum exterior wall graphics Chicago"),
        ("/images/studio/aws-wall-wrap.webp",       "AWS wall wrap — corporate interior graphics Chicago"),
        ("/images/studio/geometric-pattern-wall-wrap.webp","Geometric wall wrap — commercial interior graphics"),
    ],
    "semi": [
        ("/images/studio/stark-semi-truck-wrap.webp",  "Stark semi truck wrap Chicago"),
        ("/images/studio/stark-semi-truck-wrap-2.webp","Stark semi truck fleet wrap — commercial branding Chicago"),
        ("/images/studio/chicago-fleet-wraps-semi-truck-wrap.webp","Chicago Fleet Wraps semi truck wrap"),
    ],
    "fleet": [
        ("/images/frontier_fleet_vans.webp",  "Frontier fleet vans — commercial vehicle wraps Chicago"),
        ("/images/cfw_van_1.webp",            "Commercial fleet van wrap Chicago"),
        ("/images/cfw_truck_1.webp",          "Commercial fleet truck wrap Chicago"),
        ("/images/wrap_install_closeup.webp", "Vehicle wrap installation closeup — professional install Chicago"),
        ("/images/studio/multi-brand-multi-vehicle-wrap.webp","Multi-brand fleet wraps — commercial vehicle graphics Chicago"),
        ("/images/studio/precision-today-shop-photo-wrap.webp","Professional wrap shop — Chicago Fleet Wraps installation"),
    ],
}

PAGE_MAP = {
    "electrician-vehicle-wraps-chicago": ["electrical","electrical","electrical"],
    "electric":                          ["electrical","electrical"],
    "hvac-van-wraps-chicago":            ["hvac","hvac","van"],
    "hvac":                              ["hvac","van"],
    "plumbing-van-wraps-chicago":        ["hvac","van"],
    "plumber":                           ["hvac","van"],
    "sprinter":                          ["sprinter","sprinter","sprinter"],
    "sprinter-van-wraps":                ["sprinter","sprinter"],
    "transit":                           ["van","van"],
    "van-wraps-chicago":                 ["van","van"],
    "delivery-fleet-wraps-chicago":      ["van","boxtruck"],
    "delivery":                          ["van","boxtruck"],
    "box-truck-wraps-chicago":           ["boxtruck","boxtruck","boxtruck"],
    "boxtruck":                          ["boxtruck","boxtruck"],
    "food-truck-wraps-chicago":          ["foodtruck","foodtruck"],
    "foodtruck":                         ["foodtruck","van"],
    "boat-wraps-chicago":                ["boat","boat","boat"],
    "boating":                           ["boat","boat"],
    "color-change-wraps":                ["colorchange","colorchange"],
    "colorchange":                       ["colorchange","colorchange"],
    "contractor-vehicle-wraps-chicago":  ["truck","van"],
    "contractor":                        ["truck","van"],
    "landscaping-truck-wraps-chicago":   ["truck","truck"],
    "landscape":                         ["truck","truck"],
    "moving-truck-wraps-chicago":        ["boxtruck","van"],
    "moving":                            ["boxtruck","van"],
    "ev-wraps":                          ["ev","ev"],
    "rivian-wraps-chicago":              ["ev","ev"],
    "tesla-wraps-chicago":               ["ev","ev"],
    "full-vehicle-wraps":                ["colorchange","van"],
    "partial-vehicle-wraps":             ["van","truck"],
    "partial-vehicle-wraps-chicago":     ["van","truck"],
    "partial-wraps":                     ["van","truck"],
    "commercial-vehicle-wraps-chicago":  ["van","fleet"],
    "commercial":                        ["van","fleet"],
    "commercial-wraps":                  ["van","fleet"],
    "fleet-wraps-chicago":               ["fleet","fleet"],
    "fleet":                             ["fleet","fleet"],
    "truck-wraps-chicago":               ["truck","boxtruck"],
    "pickup-truck-wraps":                ["truck","truck"],
    "pickup-truck":                      ["truck","truck"],
    "wallwraps":                         ["wall","wall"],
    "vehicle-wraps-chicago":             ["fleet","van"],
    "vehicle-wrap-cost-chicago":         ["van","truck"],
}

CITY_SLUGS = {
    "chicago","schaumburg","naperville","aurora","elgin","evanston","lakeview",
    "lincoln-park","loop","downtown-chicago","skokie","albany-park","andersonville",
    "arlington-heights","austin","avondale","belmont-cragin","berwyn","bolingbrook",
    "bridgeport","bronzeville","bucktown","cicero","des-plaines","downers-grove",
    "dunning","edgewater","elmhurst","forest-glen","garfield-park","gold-coast",
    "hermosa","humboldt-park","hyde-park","irving-park","jefferson-park","joliet",
    "kenwood","logan-square","lombard","montclaire","north-lawndale","norwood-park",
    "oak-park","old-town","orland-park","palatine","pilsen","portage-park",
    "ravenswood","river-north","rogers-park","south-lawndale","tinley-park",
    "ukrainian-village","uptown","west-loop","wheaton","wicker-park","wilmette",
    "servicearea",
}

IMG_RIGHT = 'style="float:right;margin:0 0 28px 32px;width:min(400px,45%);border-radius:10px;box-shadow:0 4px 24px rgba(0,0,0,.55);display:block"'
IMG_LEFT  = 'style="float:left;margin:0 32px 28px 0;width:min(400px,45%);border-radius:10px;box-shadow:0 4px 24px rgba(0,0,0,.55);display:block"'
IMG_FULL  = 'style="width:100%;max-width:900px;display:block;margin:36px auto;border-radius:12px;box-shadow:0 6px 32px rgba(0,0,0,.6)"'
CLEARFIX  = '<div style="clear:both;margin:0"></div>'

def img_tag(src, alt, style):
    return f'\n<img src="{src}" alt="{alt}" loading="lazy" width="800" height="500" {style}/>\n'

def inject(html, photos):
    if len(photos) < 2:
        return html

    # Find h2 closing tags
    h2s = [m.end() for m in re.finditer(r'</h2>', html, re.IGNORECASE)]
    # Find paragraph closing tags (only inside body content, skip header/footer)
    # Use a window: find the main content area
    body_start = html.find('<div class="content"')
    if body_start == -1:
        body_start = html.find('<div class="container"')
    if body_start == -1:
        body_start = html.find('<main')
    if body_start == -1:
        body_start = 0

    body_end = html.rfind('</footer>')
    if body_end == -1:
        body_end = len(html)

    body = html[body_start:body_end]

    # Injection 1: after 2nd <h2> inside body — float right
    h2s_in_body = [m.end() + body_start for m in re.finditer(r'</h2>', body, re.IGNORECASE)]
    offset = 0

    if len(h2s_in_body) >= 2:
        pos = h2s_in_body[1] + offset
        chunk = img_tag(photos[0][0], photos[0][1], IMG_RIGHT)
        html = html[:pos] + chunk + html[pos:]
        offset += len(chunk)

    # Injection 2: after 5th </p> inside body — float left
    body_after = html[body_start:body_end + offset]
    ps_in_body = [m.end() + body_start for m in re.finditer(r'</p>', body_after, re.IGNORECASE)]

    if len(ps_in_body) >= 5:
        pos = ps_in_body[4] + offset
        chunk = img_tag(photos[1][0], photos[1][1], IMG_LEFT)
        html = html[:pos] + chunk + html[pos:]
        offset += len(chunk)

    # Injection 3: if 3rd photo, full-width before final CTA / last h2
    if len(photos) >= 3:
        cta = html.find('<section', body_start + offset)
        if cta == -1:
            # Before the last h2
            last_h2s = [m.start() for m in re.finditer(r'<h2\b', html[body_start:], re.IGNORECASE)]
            if len(last_h2s) >= 2:
                cta = last_h2s[-1] + body_start + offset

        if cta and cta > body_start:
            chunk = CLEARFIX + img_tag(photos[2][0], photos[2][1], IMG_FULL)
            html = html[:cta] + chunk + html[cta:]

    return html

def get_photos(slug, idx):
    if slug in PAGE_MAP:
        cats = PAGE_MAP[slug]
    elif slug in CITY_SLUGS:
        cats = ["fleet","van","truck"]
    else:
        cats = ["fleet","van"]

    result = []
    for i, cat in enumerate(cats):
        pool = PHOTOS.get(cat, PHOTOS["fleet"])
        result.append(pool[(idx + i * 2) % len(pool)])
    return result

SKIP = {
    "","googleac4190c5fb66b0fb","site","sitemap","custom-sitemap",
    "robots","404","blog","estimate","contact","intake","schedule",
    "calculator","rent-the-bay","video","visualizer","stats","roi","vsads",
    "faq","warranty","care","materials","about","brand-audit","brandaudit",
    "refund-policy","apparel","signsandgraphics","portfolio","beforeafter",
}

# Only run on pages that DON'T already have our injected photos
# (check for our specific style string)
MARKER = 'box-shadow:0 4px 24px rgba(0,0,0,.55)'

html_files = sorted(PUBLIC.rglob("*/index.html"))
done = 0
already = 0
skipped = 0

for i, fp in enumerate(html_files):
    rel = fp.parent.relative_to(PUBLIC)
    slug = str(rel).strip("/")

    if slug in SKIP or slug.startswith("post/"):
        skipped += 1
        continue

    html = fp.read_text(encoding='utf-8', errors='replace')

    # Skip if already injected by v2
    if MARKER in html:
        already += 1
        continue

    photos = get_photos(slug, idx=i % 6)
    new_html = inject(html, photos)

    if new_html != html:
        fp.write_text(new_html, encoding='utf-8')
        done += 1

print(f"✓ Injected photos into {done} more pages")
print(f"  Already done (v1): {already}")
print(f"  Skipped (utility): {skipped}")
