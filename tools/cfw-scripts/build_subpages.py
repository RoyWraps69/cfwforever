"""Build the 4 marine sub-pages."""
import sys
sys.path.insert(0, '.')
from page_factory import build_page

DATE_PUB = "2026-04-23"
DATE_MOD = "2026-04-23"

def crumbs(label):
    return [
        ('Home', '/'),
        ('Services', '/commercial-vehicle-wraps-chicago/'),
        ('Marine Wraps', '/marine-wraps/'),
        (label, f'/{label.lower().replace(" ", "-").replace("chicago","chicago/").rstrip("/") }/')
    ]

def cta_block_pricing(pricing_rows):
    rows = '\n'.join(
        f'<tr><td style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.08)">{label}</td><td style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.08);color:#FFD700;font-weight:600">{price}</td><td style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.08);color:rgba(255,255,255,.65);font-size:.9rem">{scope}</td></tr>'
        for label, price, scope in pricing_rows
    )
    return f'''<section style="max-width:1000px;margin:40px auto;padding:0 24px">
<h2 style="font-family:var(--H);font-size:2rem;color:#FFD700;margin-bottom:20px">Pricing</h2>
<div style="overflow-x:auto;margin-bottom:16px">
<table style="width:100%;border-collapse:collapse;background:rgba(255,255,255,.02);border-radius:8px;overflow:hidden">
<thead><tr style="background:rgba(255,215,0,.08)"><th style="padding:14px 16px;text-align:left;color:#FFD700;font-family:var(--H);font-size:.95rem;letter-spacing:.05em">Service</th><th style="padding:14px 16px;text-align:left;color:#FFD700;font-family:var(--H);font-size:.95rem;letter-spacing:.05em">Price</th><th style="padding:14px 16px;text-align:left;color:#FFD700;font-family:var(--H);font-size:.95rem;letter-spacing:.05em">Scope</th></tr></thead>
<tbody>{rows}</tbody>
</table>
</div>
<p style="color:rgba(255,255,255,.6);font-size:.85rem">All pricing includes design, cast vinyl, marine-grade laminate, professional installation, and 2-year workmanship warranty. Free pickup from all Chicago-area harbors.</p>
</section>'''

def content_section(heading, paras):
    body = '\n'.join(f'<p style="color:rgba(255,255,255,.78);line-height:1.7;margin-bottom:16px">{p}</p>' for p in paras)
    return f'''<section style="max-width:900px;margin:60px auto;padding:0 24px">
<h2 style="font-family:var(--H);font-size:2rem;color:#FFD700;margin-bottom:20px">{heading}</h2>
{body}
</section>'''

# ═══════════════════════════════════════════════════════════════
# YACHT WRAPS
# ═══════════════════════════════════════════════════════════════
yacht_sections = (
    cta_block_pricing([
        ("28'–30' yacht — full wrap", "$8,500", "Hull sides, transom, cabin exterior. Color change or custom graphic."),
        ("32'–36' yacht — full wrap", "$13,500", "Full hull plus hardtop and accent panels."),
        ("37'–42' yacht — full wrap", "$18,500", "Full hull with cabin trunk and bridge."),
        ("43'–50' yacht — full wrap", "$24,500", "Includes full hull, cabin structure, and large panel work."),
        ("51'+ yacht — full wrap", "$30,000+", "Custom scoping. Contact for site assessment."),
        ("Partial wrap (hull sides + transom)", "From $5,500", "Common for owners wanting branding without full cabin coverage."),
        ("Boot stripe + accent graphics", "From $1,200", "Lettering, boot stripe, registration numbers."),
    ]) +
    content_section("Why Yacht Owners Choose Wraps Over Paint",
        ["A professional yacht paint job runs $400–$800 per foot in Chicago — $14,000–$28,000 for a 35-footer before mechanical and hauling charges. A full wrap on the same boat runs $13,500, takes 7–10 business days instead of 4–6 weeks, and can be fully removed at resale to return the hull to its original gelcoat.",
         "Wraps also protect gelcoat from UV oxidation and minor dock rash. Paint gets chipped at the rub rail and stays chipped. Vinyl takes the hit, and if it gets damaged, we repanel the affected section in a day without repainting the entire hull.",
         "The reversibility matters for resale. Buyers of used yachts often prefer factory gelcoat. Peel the wrap, polish the gelcoat underneath, and your vessel looks factory-new for the listing photos."]) +
    content_section("Popular Yacht Finishes and Colors",
        ["<strong>Gloss:</strong> deepest color saturation, most reflective, closest to a painted finish. Best for showing off custom color choices on modern yachts.",
         "<strong>Satin:</strong> subtle, premium look. Hides minor hull imperfections better than gloss. Popular on classic Sea Rays and Tiara's.",
         "<strong>Matte:</strong> dead flat finish. Aggressive, modern, attention-grabbing. Requires more maintenance — every water spot shows.",
         "<strong>Metallic and pearlescent:</strong> true metallic flake or pearl pigments layered under clear laminate. Premium pricing (add 15%) but outperforms any paint finish at this price point.",
         "<strong>Color change favorites for 2026:</strong> deep midnight blue (Avery Gloss Dark Blue), satin black, battleship gray, brushed aluminum metallic, and matte white."]) +
    content_section("Lake Michigan-Specific Considerations",
        ["Fresh water is actually kinder to wraps than salt — no chloride attack on adhesive edges. But Lake Michigan UV is no joke from June through September. Direct southern exposure at Burnham, Monroe, and 31st Street slip configurations hits wraps harder than covered slips in Belmont or Montrose.",
         "We spec laminates based on your slip orientation. South-facing slips get 3M 8519 or Avery DOL-1000 for maximum UV resistance. Covered or north-facing slips can use standard cast laminate.",
         "Winter storage is the other challenge. Most Chicago yachts winterize under shrink-wrap from November through April. We apply a protective edge seal before haul-out to prevent shrink-wrap contact from lifting vinyl edges during the off-season."])
)

yacht_cfg = {
    'slug': 'yacht-wraps-chicago',
    'title': 'Yacht Wraps Chicago — Full & Partial Wraps for Luxury Vessels | CFW',
    'meta_desc': 'Yacht wraps in Chicago from $8,500 for 28-footers, $18,500 for 40-footers. Cast vinyl color changes, custom graphics. 200+ marine installs. Free pickup from Belmont, Monroe, Burnham, 31st Street.',
    'h1': "Yacht Wraps Chicago — Full & Partial Wraps for 28'+ Luxury Vessels",
    'lead_html': '<p class="lead speakable"><strong>Yacht wraps in Chicago start at $8,500 for a 28-footer and run to $30,000+ for 50-foot vessels.</strong> CFW has wrapped yachts stored at Burnham, Monroe, 31st Street, and DuSable Harbors — full color changes, custom graphics, owner brand integration. Avery Dennison and 3M cast vinyl only, marine-grade laminate. Free pickup throughout Chicagoland. Same-day estimate at (312) 597-1286.</p>',
    'hero_img': '/images/patron_boat.webp',
    'hero_alt': 'Yacht wraps Chicago — Chicago Fleet Wraps',
    'breadcrumbs': [('Home','/'),('Services','/commercial-vehicle-wraps-chicago/'),('Marine Wraps','/marine-wraps/'),('Yacht Wraps Chicago','/yacht-wraps-chicago/')],
    'sections_html': yacht_sections,
    'faqs': [
        ("How much does it cost to wrap a yacht in Chicago?", "Yacht wrap pricing is based on length. 28–30 foot yachts start at $8,500. 32–36 foot at $13,500. 37–42 foot at $18,500. 43–50 foot at $24,500. 51+ requires on-site scoping. All pricing includes design, cast vinyl, marine-grade laminate, installation, and 2-year workmanship warranty."),
        ("How long does a yacht wrap last in Chicago?", "A properly installed cast vinyl wrap with marine laminate lasts 5–7 years on Lake Michigan. That assumes shrink-wrap winter storage and reasonable care. South-facing slips at Burnham and 31st Street see more UV exposure than covered Belmont/Montrose slips, which can affect longevity at the upper end of the range."),
        ("Can you wrap a yacht without hauling it out of the water?", "Most yacht wraps require haul-out. In-water wraps are only practical for above-the-waterline partial wraps (cabin trunk, hardtop, bridge) or small accent graphics. For full hull wraps, we coordinate with your marina's yard crew for haul, block, and re-splash — usually 7–10 business days on the hard."),
        ("Will the wrap damage my gelcoat?", "No. Cast vinyl with non-aggressive marine adhesive is designed to remove cleanly within its rated lifespan. When you remove the wrap — whether at resale, 5 years in, or for a color change — the underlying gelcoat is unaffected and often in better condition than exposed hulls because the wrap protected it from UV oxidation the entire time."),
        ("Can you match my existing boat's graphics or brand?", "Yes. Provide your brand files (logo vectors, color codes, graphic layouts) and we match exactly. We can also reverse-engineer colors from photos if source files are lost. Brand integration is especially common on charter yachts, company-owned vessels, and captains running Instagram presence."),
        ("What's included in the yacht wrap price?", "Design (in-house, unlimited revisions), premium cast vinyl (Avery MPI 1105 or 3M IJ180-CV3), marine-grade gloss laminate (3M 8519 or Avery DOL-1000), professional installation in our climate-controlled Portage Park facility, and a 2-year workmanship warranty. Free pickup and delivery from Chicagoland harbors."),
        ("How do I prepare my yacht for a wrap installation?", "Not much. We handle hull prep — degreasing, wax removal, surface cleaning. Remove any non-fixed accessories (covers, fenders, loose antennas). The rest is our job. If your boat is in the water, we coordinate haul-out with your marina. If it's already on the hard, we bring the shop to the boat when practical."),
    ],
    'howto_steps': [
        ("Measure length and panel scope", "Yacht wrap pricing scales with LOA (length overall). Measure from bow tip to transom. Decide if you want full hull only, full hull plus cabin, or full exterior including bridge. This determines your quote tier."),
        ("Pick your finish", "Gloss = deepest color. Satin = premium, forgiving of surface imperfections. Matte = aggressive modern look. Metallic/pearl = ultimate premium. Each finish has different laminate requirements and maintenance profiles."),
        ("Schedule around launch or haul-out", "Spring installs book 6–8 weeks out because every harbor owner wants the boat done before Memorial Day. Fall/winter installs are 15% cheaper and coordinate with off-season haul-out — cleanest way to schedule."),
        ("Verify material spec in writing", "Your quote should list the exact vinyl brand and product number (Avery MPI 1105 or 3M IJ180-CV3) AND the laminate brand and product number (3M 8519 or Avery DOL-1000). No spec, no deal."),
    ],
    'howto_name': 'How to Scope a Yacht Wrap Project in Chicago',
    'howto_desc': 'Four-step guide for yacht owners planning a full or partial wrap on Lake Michigan.',
    'keywords': 'yacht wraps chicago, luxury yacht graphics, yacht color change chicago, 40 foot yacht wrap, sea ray wrap, tiara wrap, yacht vinyl',
    'date_published': DATE_PUB,
    'date_modified': DATE_MOD,
    'article_keywords': 'yacht wraps Chicago, Lake Michigan yacht graphics, yacht color change, 40-foot yacht wrap cost, sea ray wrap, tiara wrap',
    'article_section': 'Marine Wraps',
    'servicesDescription': 'Professional yacht wraps in Chicago for 28-foot and larger luxury vessels including color changes, custom graphics, and brand integration.',
}

html = build_page(yacht_cfg)
open('out_yacht-wraps-chicago.html','w').write(html)
print(f"✓ /yacht-wraps-chicago/     {len(html):>7,} bytes")

# ═══════════════════════════════════════════════════════════════
# JET SKI WRAPS
# ═══════════════════════════════════════════════════════════════
jetski_sections = (
    cta_block_pricing([
        ("Full color change — standard PWC", "$800", "Sea-Doo GTI/GTX/RXP, Yamaha VX/FX, Kawasaki STX. Hood, deck, side panels."),
        ("Full color change — performance PWC", "$1,100", "Sea-Doo RXT-X, Yamaha GP HO, Kawasaki Ultra 310. Complex body lines."),
        ("Custom graphics + color", "$1,200", "Color change with added graphics, logos, sponsor branding."),
        ("Full promotional wrap (branded)", "$1,500", "Rental fleet branding, race team graphics, commercial promo."),
        ("Rental fleet — 5+ units", "15% off each", "Volume pricing for Sea-Doo rental operators, resorts, event fleets."),
        ("Rental fleet — 10+ units", "20% off each", "Maximum volume discount. Spring booking only."),
    ]) +
    content_section("Models We Template",
        ["<strong>Sea-Doo:</strong> Spark, GTI 90/130/170, GTR-X, GTX 170/230/300, RXP-X 300, RXT-X 300, Wake 170, Fish Pro. Template library covers 2018–2026 model years.",
         "<strong>Yamaha:</strong> EX, EX Sport, VX, VX Cruiser, VX Deluxe, VXR, GP1800R HO/SVHO, FX Cruiser, FX SVHO. WaveRunner lineup 2017 forward.",
         "<strong>Kawasaki:</strong> STX-15F, STX 160, SX-R 160, Ultra LX, Ultra 310 X, Ultra 310 LX, Ultra 310 R. Jet Ski lineup 2016 forward.",
         "Older model years outside our template library still wrap fine — we just hand-pattern them on-site. Add 1 day to turnaround."]) +
    content_section("For Rental Operators and Charter Fleets",
        ["Branded PWC fleets generate more bookings. Rental operators who wrap their Sea-Doos with company colors and phone numbers book 30–40% more than operators running factory-color rentals. Branding is advertising, and every jet ski is a floating billboard on Lake Michigan and Chain O' Lakes.",
         "CFW runs rental fleet programs with volume pricing, priority scheduling around rental season, and consistent graphic treatment across 5–20 unit fleets. We've wrapped rental fleets for operators at Chain O' Lakes, Wolf Lake, and Lake Geneva.",
         "Off-season install (November–March) gives rental operators 15–20% lower pricing and guaranteed Memorial Day readiness. Don't wait until April when every marina in the region is screaming for wrap slots."]) +
    content_section("Jet Ski Wrap Durability and Care",
        ["Properly wrapped PWCs hold 3–5 years in Chicago conditions. Less than a yacht because jet skis see more direct handling — people sitting on them, getting on and off, pulling them on trailers. Normal wear accelerates wrap aging on high-contact surfaces.",
         "Rental fleet wraps typically last 2–3 seasons of heavy use before needing refresh. Private PWCs with gentle owners hit 4–5 years.",
         "Care: hand wash after every use in the marina pump-out station. No automatic brush washes. No high-pressure water directly on seams. Off-season storage indoors or under a breathable cover — not vinyl tarps that trap moisture and condensate against the wrap."])
)

jetski_cfg = {
    'slug': 'jet-ski-wraps-chicago',
    'title': 'Jet Ski Wraps Chicago — Sea-Doo, Yamaha, Kawasaki PWC | CFW',
    'meta_desc': 'Jet ski wraps in Chicago from $800 per unit. Sea-Doo, Yamaha WaveRunner, Kawasaki Jet Ski models. Rental fleet volume pricing. 3-day turnaround. Cast vinyl, marine laminate.',
    'h1': 'Jet Ski & PWC Wraps Chicago — Sea-Doo, Yamaha, Kawasaki',
    'lead_html': '<p class="lead speakable"><strong>Jet ski wraps in Chicago start at $800 per unit for a full color change.</strong> Sea-Doo, Yamaha WaveRunner, and Kawasaki Jet Ski models — all standard PWC templates covered. Rental operators and charter fleets get 15% off at 5+ units, 20% off at 10+. 3-day turnaround from drop-off. Cast vinyl, marine-grade laminate, 2-year warranty. (312) 597-1286.</p>',
    'hero_img': '/images/cutwater_boat.webp',
    'hero_alt': 'Jet ski wraps Chicago — Chicago Fleet Wraps',
    'breadcrumbs': [('Home','/'),('Services','/commercial-vehicle-wraps-chicago/'),('Marine Wraps','/marine-wraps/'),('Jet Ski Wraps Chicago','/jet-ski-wraps-chicago/')],
    'sections_html': jetski_sections,
    'faqs': [
        ("How much does it cost to wrap a jet ski in Chicago?", "Standard PWC color change wraps start at $800. Performance models (Sea-Doo RXT-X, Yamaha GP HO, Kawasaki Ultra) run $1,100 due to complex body lines. Custom graphics add $200–$400. Full promotional branding wraps are $1,500. Rental fleet volume discounts: 15% off at 5+ units, 20% off at 10+."),
        ("How long does a jet ski wrap last?", "Private PWCs with gentle ownership hit 4–5 years. Rental fleet jet skis with heavy daily use typically need refresh at 2–3 seasons. Daily sun exposure, handling contact, and trailer wear all affect wrap lifespan. We only use cast vinyl with marine laminate — calendered vinyl fails within one season on PWCs."),
        ("Do you wrap older jet ski models?", "Yes. Our template library covers 2016 forward (Kawasaki), 2017 forward (Yamaha), and 2018 forward (Sea-Doo). Older models still wrap fine — we hand-pattern them on-site. Add one business day to standard turnaround for template generation."),
        ("What's the turnaround time on a PWC wrap?", "Drop off Monday, pick up Thursday. Standard 3 business days for installation. Rental fleet orders of 5+ units: we stagger intake to keep your season going — you'll never have more than 50% of the fleet off the water at once."),
        ("Can I wrap just the hood or specific panels?", "Yes. Partial wraps are cheaper than full color changes. Hood-only wrap: $350. Hood plus side panels: $550. Full deck wrap without hull sides: $650. Mix and match based on budget and visual goal."),
        ("Is a wrap removable without damaging the gelcoat?", "Yes. Cast vinyl with marine adhesive removes cleanly within its rated lifespan. We heat-peel and rinse. No residue, no gelcoat damage. If the wrap is past its rated life (5+ years) removal takes longer and may require solvent work on adhesive residue."),
    ],
    'howto_steps': [
        ("Pick your model year coverage", "Standard templates cover 2016+ Kawasaki, 2017+ Yamaha, 2018+ Sea-Doo. Older models cost the same — we hand-pattern. Confirm your year/model when booking."),
        ("Decide on scope", "Full color change (all panels) = best visual impact. Hood-only = cheapest refresh. Deck wrap = good compromise. Rental operators almost always go full color change with branding."),
        ("Book your slot around rental season", "Spring (April–May) books out fast. Fall/winter installs cost 15% less and guarantee Memorial Day readiness. Rental operators should book by February."),
        ("Plan pickup and drop-off logistics", "PWCs fit on standard single-ski trailers. Drop off at our Portage Park facility or arrange fleet pickup for 5+ unit orders. 3-day turnaround from drop-off, single unit."),
    ],
    'howto_name': 'How to Plan a Jet Ski Wrap Project in Chicago',
    'howto_desc': 'Four-step guide for PWC owners and rental fleet operators planning a wrap install.',
    'keywords': 'jet ski wraps chicago, pwc wraps, sea-doo wrap, yamaha waverunner wrap, kawasaki jet ski wrap, jet ski color change chicago, rental fleet wraps',
    'date_published': DATE_PUB,
    'date_modified': DATE_MOD,
    'article_keywords': 'jet ski wraps Chicago, PWC wraps, Sea-Doo wrap, Yamaha WaveRunner wrap, Kawasaki Jet Ski wrap, rental fleet PWC',
    'article_section': 'Marine Wraps',
    'servicesDescription': 'Jet ski and personal watercraft wrap services in Chicago for Sea-Doo, Yamaha WaveRunner, and Kawasaki models including rental fleet volume pricing.',
}

html = build_page(jetski_cfg)
open('out_jet-ski-wraps-chicago.html','w').write(html)
print(f"✓ /jet-ski-wraps-chicago/   {len(html):>7,} bytes")

# ═══════════════════════════════════════════════════════════════
# PONTOON WRAPS
# ═══════════════════════════════════════════════════════════════
pontoon_sections = (
    cta_block_pricing([
        ("18'–20' pontoon — full wrap", "$3,500", "Fence panels, deck skirts, helm console. Single color or split pattern."),
        ("22'–24' pontoon — full wrap", "$4,800", "Standard family pontoon. Full panel coverage including motor pod."),
        ("25'–27' pontoon — full wrap", "$6,500", "Large pontoons, tritoons, charter platforms. Complete wrap."),
        ("Partial wrap (fence panels only)", "From $1,800", "Fence panels and front cap. No deck or helm."),
        ("Charter / party-boat branding package", "From $2,500", "Fence panels plus logo, phone, URL, social handles. Full-fleet branding available."),
        ("Fleet of 3+ pontoons", "7% off each", "Rental fleets, charter operators, country clubs."),
    ]) +
    content_section("Models We Wrap",
        ["<strong>Bennington:</strong> S series, SX, SL, SLX, SLDX, Q series, R series, QX. Pontoon and tritoon configurations.",
         "<strong>Harris:</strong> Cruiser, Sunliner, Grand Mariner, Solstice. Luxury lineup typically sees full-wrap brand activation work.",
         "<strong>Sun Tracker:</strong> Bass Buggy, Fishin' Barge, Party Barge, SportFish. Common rental and personal use boats.",
         "<strong>Avalon:</strong> LSZ, Eagle, Venture, Ambassador. Ambassador's large platform surfaces wrap beautifully.",
         "<strong>Other brands covered:</strong> Manitou, Sweetwater, Tahoe, Crest, Premier, Princecraft, Aqua Patio, Godfrey."]) +
    content_section("Pontoon Brand Activation and Charter Use",
        ["Pontoon boats are rolling billboards on Chicago-area lakes — Chain O' Lakes, Wolf Lake, Lake Geneva, Delavan. Charter operators, party-boat companies, and country clubs run fleets that generate 40,000+ daily eyeball impressions in peak summer.",
         "A wrapped pontoon outperforms signage. Instead of a small logo on the stern, the entire fence panel surface (20+ linear feet of visible graphic space) becomes your brand canvas. Phone, URL, social handles, full-color logo, sponsor integration — all readable from 100+ feet across the water.",
         "Rental fleets that wrap their pontoons report 25–40% higher booking rates versus plain fleets. Branding creates memorability, social shares, and word-of-mouth referrals you can't buy any other way at this cost per impression."]) +
    content_section("Winter Storage and Seasonal Care",
        ["Pontoons get shrink-wrapped for winter in Chicago-area marinas from November through April. The shrink-wrap contact is the #1 cause of pontoon wrap edge lift.",
         "Our pre-storage protocol: degrease all wrap edges, apply marine-grade edge sealer on all perimeter seams, inspect fence panel attachment points for any lifted corners. Takes 90 minutes per pontoon and extends wrap life by 1–2 years.",
         "Spring launch: we coordinate with your marina's yard crew for in-water delivery if needed, or pickup from dry storage. Pontoons are easier than most boats to schedule because they don't require specialized lifting equipment."])
)

pontoon_cfg = {
    'slug': 'pontoon-wraps-chicago',
    'title': 'Pontoon Boat Wraps Chicago — Bennington, Harris, Sun Tracker | CFW',
    'meta_desc': 'Pontoon boat wraps in Chicago from $3,500 for 20-footers, $6,500 for 25-footers. Bennington, Harris, Sun Tracker, Avalon coverage. Charter fleet and rental volume pricing.',
    'h1': 'Pontoon Boat Wraps Chicago — Full Coverage, Charter-Grade Branding',
    'lead_html': '<p class="lead speakable"><strong>Pontoon wraps in Chicago start at $3,500 for a 20-footer, $6,500 for 25-footers.</strong> CFW wraps Bennington, Harris, Sun Tracker, Avalon, and every other major pontoon builder. Fence panels, deck skirts, helm console, motor pod — complete coverage. Charter operators, party-boat fleets, rental operators: volume pricing at 3+ units. 5–7 year cast vinyl lifespan. (312) 597-1286.</p>',
    'hero_img': '/images/green_patron_boat.webp',
    'hero_alt': 'Pontoon wraps Chicago — Chicago Fleet Wraps',
    'breadcrumbs': [('Home','/'),('Services','/commercial-vehicle-wraps-chicago/'),('Marine Wraps','/marine-wraps/'),('Pontoon Wraps Chicago','/pontoon-wraps-chicago/')],
    'sections_html': pontoon_sections,
    'faqs': [
        ("How much does it cost to wrap a pontoon boat in Chicago?", "Pontoon wrap pricing scales with length. 18–20 foot pontoons: $3,500 full wrap. 22–24 foot: $4,800. 25–27 foot and tritoons: $6,500. Partial wraps (fence panels only): from $1,800. Charter/party-boat branding packages: from $2,500. Fleet of 3+ units: 7% off each."),
        ("What parts of the pontoon do you wrap?", "A full pontoon wrap covers fence panels (the exterior side panels that run the length of the deck), deck side skirts, helm console, and motor pod. Optional: front cap, rear deck skirt, furniture bases. We don't wrap the pontoon tubes themselves — those are bare aluminum that should stay exposed for maintenance."),
        ("How long does a pontoon wrap last in Chicago conditions?", "Cast vinyl pontoon wraps with marine-grade laminate hold 5–7 years on Chicago-area lakes. That assumes proper winter storage (either indoor or shrink-wrapped with edge sealer applied pre-storage). Cheap calendered vinyl fails within 18 months — insist on the vinyl product number in writing."),
        ("Can you wrap a pontoon that's already been wrapped?", "Yes, but the old wrap has to come off first. We heat-peel, clean the substrate, and install new vinyl. Removal of an existing wrap in good condition: $400–$800. Removal of a failed/brittle wrap: $600–$1,200. Most rental operators plan for re-wraps every 4–5 years."),
        ("Do you offer volume pricing for rental or charter fleets?", "Yes. Fleets of 3+ pontoons get 7% off per unit. Fleets of 5+ get 10% off. Fleets of 10+ negotiate custom pricing including on-site install options. Rental operators at Chain O' Lakes, Wolf Lake, and Lake Geneva have run multi-year programs with us since 2010."),
        ("How long does installation take?", "Single pontoon: 5–7 business days from drop-off. That includes design time if you need it, prep, wrap, quality check, and edge sealing. Fleet orders: we stagger intake so you're never short more than 30% of your fleet at any time during peak season."),
    ],
    'howto_steps': [
        ("Measure your pontoon length", "Measure from front deck edge to rear deck edge (not including the motor). 18–20' is the common family-size category. 22–24' is the most popular range. 25'+ means tritoon territory and larger panel surface."),
        ("Decide on coverage scope", "Full wrap = maximum visual impact, highest cost. Partial (fence only) = 60% of the visual benefit at 50% cost. Charter branding package = fence plus logo/phone/URL overlay, balanced approach."),
        ("Lock your storage plan before install", "Pre-storage edge sealing extends wrap life dramatically. Schedule wrap install in fall (cheaper) and apply sealer before winter shrink-wrap. Or install in spring after de-shrink. Either works — just don't shrink-wrap a fresh install."),
        ("Design for readability from distance", "Pontoon wraps compete for attention across water, not parking lots. Use bold colors, large type, high contrast. Your phone number should be readable from 100+ feet. Social handles should be visible at closing speed."),
    ],
    'howto_name': 'How to Plan a Pontoon Boat Wrap Project',
    'howto_desc': 'Four-step guide for pontoon owners and charter fleet operators planning a wrap install in Chicago.',
    'keywords': 'pontoon wraps chicago, pontoon boat wrap, bennington wrap, harris wrap, sun tracker wrap, pontoon graphics chicago, charter pontoon branding',
    'date_published': DATE_PUB,
    'date_modified': DATE_MOD,
    'article_keywords': 'pontoon wraps Chicago, pontoon boat wrap, Bennington wrap, Harris wrap, Sun Tracker wrap, charter pontoon',
    'article_section': 'Marine Wraps',
    'servicesDescription': 'Professional pontoon boat wraps in Chicago for Bennington, Harris, Sun Tracker, and all major pontoon builders including charter fleet branding.',
}

html = build_page(pontoon_cfg)
open('out_pontoon-wraps-chicago.html','w').write(html)
print(f"✓ /pontoon-wraps-chicago/   {len(html):>7,} bytes")

# ═══════════════════════════════════════════════════════════════
# FISHING BOAT WRAPS
# ═══════════════════════════════════════════════════════════════
fish_sections = (
    cta_block_pricing([
        ("18'–22' center console — full wrap", "$2,500", "Hull sides, transom, T-top if equipped. Guide service standard."),
        ("23'–27' bay/walk-around — full wrap", "$3,800", "Full hull plus cabin exterior. Most common charter size."),
        ("28'–32' offshore — full wrap", "$5,500", "Full exterior including hardtop. Tournament and charter tier."),
        ("33'+ sportfish — full wrap", "$6,500+", "Custom scoping. Sponsor integration, team graphics, bridge included."),
        ("Charter branding package", "From $1,800", "Phone, URL, sponsor logos, captain name. Partial hull coverage."),
        ("Tournament team graphics", "From $2,200", "Sponsor panels, team colors, tournament trail branding. Multi-sponsor layouts."),
    ]) +
    content_section("Charter Operators, Guide Services, Tournament Teams",
        ["Chicago charter captains running Lake Michigan salmon trips put 100–150 fishing days on a boat per season. That's 1,500+ hours of direct sun, bait handling, water spray, and customer contact. A wrap on a charter boat isn't decoration — it's working capital that has to hold up.",
         "CFW has wrapped charter boats for captains running out of Waukegan, Winthrop, Belmont, Burnham, and Hammond. We know what works: cast vinyl (not calendered), marine laminate (not car laminate), and careful seam placement to avoid high-wear zones where customers grab the boat for balance.",
         "Tournament teams running the FLW, Great Lakes Walleye Trail, or Salmon Unlimited derby circuit use wraps for sponsor obligations. We build multi-sponsor layouts that keep logos readable while coordinating with boat colors. Sponsor graphics are the most lucrative wrap segment — get it right and the boat pays for itself."]) +
    content_section("Durability in Fishing Conditions",
        ["Fishing boats take a beating. Bait residue (especially bloody herring and alewife used for salmon), water spray, UV from 6 AM to 9 PM, thermal cycling from cold water to hot deck, ice in winter storage. Standard vehicle wraps fail in this environment inside a year.",
         "Our marine spec is different: Avery Dennison MPI 1105 or 3M IJ180-CV3 cast vinyl, topped with 3M 8519 or Avery DOL-1000 gloss laminate. The laminate is the difference — it resists oil, blood, chemicals, and UV. Without it, bait residue will discolor vinyl inside one season.",
         "We also apply edge sealer at all cut-line perimeters. On a fishing boat, every edge is a water intrusion point. Belt-and-suspenders approach extends wrap life from 3 years to 5–7 even in charter use."]) +
    content_section("Great Lakes vs Inland Waters",
        ["Great Lakes charter boats (salmon, trout, walleye fleets out of Waukegan, Winthrop, Michigan City) see different conditions than inland lake boats (muskie, bass, walleye boats on Fox Chain, Lake Geneva, Delavan).",
         "Great Lakes: higher UV (open water reflections), more water spray from running 20+ miles offshore, more direct sun without tree cover. Requires top-tier laminate.",
         "Inland lakes: lower UV, less spray, but more dock contact, more trailering wear, more handling by multiple customers. Requires thicker edge sealing and strategic panel placement away from grab zones.",
         "We ask where you run before spec'ing the wrap. Different application = different material choice. Not every 'marine wrap' is the right wrap for your use case."])
)

fish_cfg = {
    'slug': 'fishing-boat-wraps-chicago',
    'title': 'Fishing Boat Wraps Chicago — Charter, Tournament, Guide Service | CFW',
    'meta_desc': 'Fishing boat wraps in Chicago from $2,500 for 18-22 foot center consoles, $5,500 for 30-foot offshore boats. Charter branding, tournament sponsor layouts, salmon-season proven.',
    'h1': 'Fishing Boat Wraps Chicago — Charter, Tournament & Guide Service',
    'lead_html': '<p class="lead speakable"><strong>Fishing boat wraps in Chicago start at $2,500 for a 20-foot center console, $5,500 for 30-foot offshore boats.</strong> CFW wraps charter captains, tournament teams, and guide services from Waukegan to Hammond. Sponsor logos, charter branding, tournament graphics — built to survive salmon season, bait residue, and 100+ fishing days per year. Cast vinyl, marine laminate, 2-year warranty. (312) 597-1286.</p>',
    'hero_img': '/images/patron_boat.webp',
    'hero_alt': 'Fishing boat wraps Chicago — Chicago Fleet Wraps',
    'breadcrumbs': [('Home','/'),('Services','/commercial-vehicle-wraps-chicago/'),('Marine Wraps','/marine-wraps/'),('Fishing Boat Wraps Chicago','/fishing-boat-wraps-chicago/')],
    'sections_html': fish_sections,
    'faqs': [
        ("How much does it cost to wrap a fishing boat in Chicago?", "Pricing depends on boat size. 18–22 foot center console: $2,500. 23–27 foot bay boat or walk-around: $3,800. 28–32 foot offshore: $5,500. 33+ sportfish: $6,500 and up based on custom scope. Charter branding packages (partial hull coverage) start at $1,800. Tournament team graphics from $2,200."),
        ("Can you integrate tournament sponsor graphics?", "Yes. Tournament wraps are a CFW specialty. We build multi-sponsor layouts that satisfy sponsor contract requirements — logo size, placement zones, color fidelity, visibility specs. We also coordinate with boat color choices and team branding. Sponsor integration is usually included in the base wrap price."),
        ("Will a wrap hold up to salmon/bait/fish residue?", "With proper laminate, yes. We spec 3M 8519 or Avery DOL-1000 gloss overlaminate on every fishing boat wrap. This laminate resists blood, bait oils (herring, alewife, shiner), fish slime, and UV. Wraps without laminate will discolor from bait residue within one season. Always confirm laminate in writing."),
        ("How long does a charter boat wrap last?", "Charter boats with 100+ fishing days per season hit 4–5 years on a properly installed wrap. Tournament boats running 20–30 events per year hit 5–7 years. Private fishing boats used 20–40 days per year can hit 7+ years. Factor in winter storage conditions — covered/indoor extends life by 1–2 years versus shrink-wrap."),
        ("Do you wrap boats stored at Waukegan, Winthrop, or Hammond?", "Yes. We cover all Chicago-area charter fleets from Waukegan Harbor down through Winthrop, Belmont, Burnham, 31st Street, Hammond Marina, and Michigan City. Free pickup and delivery. We coordinate with your marina's yard crew for haul-out and re-splash."),
        ("Can I brand my boat mid-season without losing fishing days?", "Depends on size. Center consoles wrap in 5 business days from haul. Larger offshore boats: 7–10 days. Tournament teams typically schedule wraps during the off-season (November–February) to guarantee spring-ready launch. Last-minute mid-season wraps are possible but not recommended during peak booking months."),
    ],
    'howto_steps': [
        ("Define your use case", "Charter = need customer-friendly graphics, durability, phone readable at distance. Tournament = sponsor contract compliance, team branding, multi-logo integration. Guide service = minimalist branding with contact info. Private = purely aesthetic. Tell us which before scoping."),
        ("Spec the right laminate", "Fishing boats require 3M 8519 or Avery DOL-1000 gloss laminate. No exceptions. Standard car-wrap laminate fails within a season when exposed to bait residue and fish oils. Get the laminate brand and product number in writing on your quote."),
        ("Plan panel placement around grab zones", "Fishing customers grab gunwales, T-top supports, and hardtop railings for balance. Place seams away from these zones. Vinyl directly under high-contact hands wears 3x faster."),
        ("Book around your season", "Tournament teams: book November–February for spring launch. Charter operators: book October–March before spring rush. Guide services: any off-day window works. Don't book peak season (June–August) unless you can afford 7–10 days off the water."),
    ],
    'howto_name': 'How to Wrap a Fishing Boat That Survives Charter Use',
    'howto_desc': 'Four-step guide for charter captains, tournament teams, and guide services wrapping fishing boats in Chicago.',
    'keywords': 'fishing boat wraps chicago, charter boat wrap, tournament boat graphics, salmon charter wrap, walleye boat wrap, center console wrap',
    'date_published': DATE_PUB,
    'date_modified': DATE_MOD,
    'article_keywords': 'fishing boat wraps Chicago, charter boat wrap, tournament boat graphics, salmon charter wrap, walleye boat wrap',
    'article_section': 'Marine Wraps',
    'servicesDescription': 'Fishing boat wrap services in Chicago for charter operators, tournament teams, and guide services with sponsor integration and marine-grade materials.',
}

html = build_page(fish_cfg)
open('out_fishing-boat-wraps-chicago.html','w').write(html)
print(f"✓ /fishing-boat-wraps-chicago/ {len(html):>6,} bytes")

print("\nAll 4 sub-pages generated.")
