"""Build all 5 marine pages using the factory."""
import sys
sys.path.insert(0, '.')
from page_factory import build_page

DATE_PUB = "2026-04-23"
DATE_MOD = "2026-04-23"

# ═══════════════════════════════════════════════════════════════
# 1. MARINE WRAPS HUB — /marine-wraps/
# ═══════════════════════════════════════════════════════════════
hub_sections = '''
<section class="segments" style="margin:60px 0">
<h2 style="font-family:var(--H,'Bebas Neue',sans-serif);font-size:2.2rem;color:#FFD700;margin-bottom:32px;text-align:center">Marine Wrap Services by Vessel Type</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;max-width:1100px;margin:0 auto">

<a href="/boat-wraps-chicago/" style="display:block;text-decoration:none;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:24px;transition:all .2s" onmouseover="this.style.borderColor='#FFD700';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='rgba(255,255,255,.08)';this.style.transform='translateY(0)'">
<div style="font-family:var(--H);font-size:1.4rem;color:#FFD700;margin-bottom:8px">Boat Wraps</div>
<div style="font-size:.85rem;color:rgba(255,255,255,.6);margin-bottom:12px">Center consoles, cruisers, runabouts · $2,500–$10,000+</div>
<div style="font-size:.82rem;color:rgba(255,255,255,.5)">Cast vinyl. Full hull or partial coverage. Custom graphics. →</div>
</a>

<a href="/yacht-wraps-chicago/" style="display:block;text-decoration:none;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:24px;transition:all .2s" onmouseover="this.style.borderColor='#FFD700';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='rgba(255,255,255,.08)';this.style.transform='translateY(0)'">
<div style="font-family:var(--H);font-size:1.4rem;color:#FFD700;margin-bottom:8px">Yacht Wraps</div>
<div style="font-size:.85rem;color:rgba(255,255,255,.6);margin-bottom:12px">28'+ luxury vessels · $8,500–$30,000</div>
<div style="font-size:.82rem;color:rgba(255,255,255,.5)">Full color changes, owner graphics, premium laminates. →</div>
</a>

<a href="/pontoon-wraps-chicago/" style="display:block;text-decoration:none;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:24px;transition:all .2s" onmouseover="this.style.borderColor='#FFD700';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='rgba(255,255,255,.08)';this.style.transform='translateY(0)'">
<div style="font-family:var(--H);font-size:1.4rem;color:#FFD700;margin-bottom:8px">Pontoon Wraps</div>
<div style="font-size:.85rem;color:rgba(255,255,255,.6);margin-bottom:12px">Bennington, Harris, Sun Tracker · $3,500–$8,000</div>
<div style="font-size:.82rem;color:rgba(255,255,255,.5)">Fence panels, deck sides, charter fleet branding. →</div>
</a>

<a href="/jet-ski-wraps-chicago/" style="display:block;text-decoration:none;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:24px;transition:all .2s" onmouseover="this.style.borderColor='#FFD700';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='rgba(255,255,255,.08)';this.style.transform='translateY(0)'">
<div style="font-family:var(--H);font-size:1.4rem;color:#FFD700;margin-bottom:8px">Jet Ski Wraps</div>
<div style="font-size:.85rem;color:rgba(255,255,255,.6);margin-bottom:12px">Sea-Doo, Yamaha, Kawasaki · $800–$1,500</div>
<div style="font-size:.82rem;color:rgba(255,255,255,.5)">Color change, custom graphics, rental fleet volume. →</div>
</a>

<a href="/fishing-boat-wraps-chicago/" style="display:block;text-decoration:none;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:24px;transition:all .2s" onmouseover="this.style.borderColor='#FFD700';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='rgba(255,255,255,.08)';this.style.transform='translateY(0)'">
<div style="font-family:var(--H);font-size:1.4rem;color:#FFD700;margin-bottom:8px">Fishing Boat Wraps</div>
<div style="font-size:.85rem;color:rgba(255,255,255,.6);margin-bottom:12px">Charter, tournament, guide service · $2,500–$6,500</div>
<div style="font-size:.82rem;color:rgba(255,255,255,.5)">Sponsor logos, charter branding, salmon-season proven. →</div>
</a>

</div>
</section>

<section style="max-width:900px;margin:80px auto;padding:0 24px">
<h2 style="font-family:var(--H);font-size:2rem;color:#FFD700;margin-bottom:20px">Why Marine Wraps Fail (and How Ours Don't)</h2>
<p style="color:rgba(255,255,255,.78);line-height:1.7;margin-bottom:16px">Walk any Chicago harbor in October and you'll see wraps peeling off transoms, lifting at rub rails, and bubbling along chine edges. The cause is almost always one of three things: cheap calendered vinyl instead of cast, no marine-grade laminate, or an installer who wraps cars and "also does boats."</p>
<p style="color:rgba(255,255,255,.78);line-height:1.7;margin-bottom:16px">CFW runs a simple rule: <strong style="color:#FFD700">cast vinyl only, laminated, installed by a technician with 100+ boat wraps in their portfolio.</strong> That's Avery Dennison MPI 1105 or 3M IJ180-CV3, topped with 3M 8519 or Avery DOL-1000 gloss overlaminate, applied by someone who understands hull geometry, through-hulls, and cleat cutouts.</p>
<p style="color:rgba(255,255,255,.78);line-height:1.7">Result: wraps that hold through Chicago winters in shrink-wrap storage, through Lake Michigan's UV from May to October, and through 5–7 seasons of actual use. Not 18 months.</p>
</section>

<section style="max-width:1100px;margin:80px auto;padding:0 24px">
<h2 style="font-family:var(--H);font-size:2rem;color:#FFD700;margin-bottom:20px">Chicago Harbors We Serve</h2>
<p style="color:rgba(255,255,255,.78);line-height:1.7;margin-bottom:20px">Free pickup from every Chicago Park District harbor plus private marinas from Waukegan to Michigan City:</p>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;font-size:.9rem;color:rgba(255,255,255,.75)">
<div>• Belmont Harbor</div>
<div>• Montrose Harbor</div>
<div>• Diversey Harbor</div>
<div>• Monroe Harbor</div>
<div>• DuSable Harbor</div>
<div>• Burnham Harbor</div>
<div>• 31st Street Harbor</div>
<div>• Jackson Park Harbor</div>
<div>• 59th Street Harbor</div>
<div>• Waukegan Harbor</div>
<div>• Winthrop Harbor</div>
<div>• Hammond Marina (IN)</div>
</div>
</section>

<section style="max-width:900px;margin:80px auto;padding:0 24px">
<h2 style="font-family:var(--H);font-size:2rem;color:#FFD700;margin-bottom:20px">Seasonal Scheduling</h2>
<p style="color:rgba(255,255,255,.78);line-height:1.7;margin-bottom:16px"><strong style="color:#FFD700">Spring rush (April–May):</strong> Book 3+ weeks out. Every harbor owner wants their boat wrapped before Memorial Day. We schedule around launch dates and coordinate with marina yard crews.</p>
<p style="color:rgba(255,255,255,.78);line-height:1.7;margin-bottom:16px"><strong style="color:#FFD700">Peak season (June–August):</strong> 1–2 week turnaround depending on vessel size. We can pull your boat off the water for 3–5 days, wrap in our Portage Park facility, and return it ready to launch.</p>
<p style="color:rgba(255,255,255,.78);line-height:1.7"><strong style="color:#FFD700">Off-season (November–March):</strong> Best pricing. Your boat's already out of the water, already cleaned. Book winter installs for 15% off. Spring launch ready.</p>
</section>
'''

hub_cfg = {
    'slug': 'marine-wraps',
    'title': 'Marine Wraps Chicago — Boats, Yachts, Jet Skis, Pontoons | CFW',
    'meta_desc': 'Marine wrap services in Chicago for every vessel type. Boats, yachts, pontoons, jet skis, fishing boats. 200+ vessels wrapped since 2001. Cast vinyl, marine-grade laminate, 2-year warranty.',
    'h1': 'Marine Wraps Chicago — Every Vessel Type, Every Chicagoland Harbor',
    'lead_html': '<p class="lead speakable"><strong>Marine wraps in Chicago start at $800 for a jet ski, $2,500 for a center console, and $8,500 for a 28-foot yacht.</strong> CFW has wrapped 200+ vessels on Lake Michigan since 2001 using Avery Dennison and 3M cast vinyls rated for marine exposure. Free pickup from every Chicago harbor. 2-year workmanship warranty. Text (312) 597-1286 for same-day estimate.</p>',
    'hero_img': '/images/boat.webp',
    'hero_alt': 'Marine wraps Chicago — Chicago Fleet Wraps',
    'breadcrumbs': [('Home', '/'), ('Services', '/commercial-vehicle-wraps-chicago/'), ('Marine Wraps', '/marine-wraps/')],
    'sections_html': hub_sections,
    'faqs': [
        ("How much does a marine wrap cost in Chicago?", "Marine wrap pricing depends on vessel type and size. Jet skis start at $800. Center-console boats $2,500–$5,500. Pontoon boats $3,500–$8,000. Yachts (28'+) $8,500–$30,000. Fishing boats $2,500–$6,500. All pricing includes Avery Dennison or 3M cast vinyl, marine-grade laminate, professional installation, and 2-year warranty."),
        ("Will a wrap survive Lake Michigan conditions?", "Yes — when installed correctly. CFW uses only cast vinyl (Avery MPI 1105, 3M IJ180-CV3) rated 5–7 years outdoor, topped with 3M or Avery gloss laminate for UV and chemical resistance. We've had wraps survive 6+ Chicago seasons including winter shrink-wrap storage, Lake Michigan UV, and freshwater conditions with zero lift or peel."),
        ("Can you pick up my boat from my harbor?", "Yes. Free pickup and delivery from every Chicago Park District harbor (Belmont, Montrose, Monroe, Burnham, 31st Street, Jackson Park, 59th Street, etc.) plus private marinas from Waukegan to Hammond, Indiana. We coordinate with your marina's yard crew for lift-out and re-splash."),
        ("What's the turnaround on a boat wrap?", "Depends on size. Jet skis: 2–3 days. Center-console boats and smaller fishing boats: 5–7 days. Pontoons: 7–10 days. Mid-size yachts (28–35'): 10–14 days. Large yachts (40'+): 14–21 days. Add 5 business days in spring rush (April–May)."),
        ("How long does a marine wrap last?", "Properly installed cast vinyl wraps with marine laminate last 5–7 years on Lake Michigan boats. That assumes off-season indoor or shrink-wrap storage and reasonable care. Calendered vinyl (what cheap shops use) fails in 12–18 months. Always ask for the vinyl brand and product number in writing."),
        ("Do you do custom designs, or only solid color changes?", "Both. We design everything from single-color hull transformations to full-custom graphics with brand integration, sponsor logos, and multi-color fade effects. Our design team works from your concept or builds from scratch. Design is included in the wrap price — no separate design fee for standard projects."),
        ("Can I remove the wrap later without damaging the gelcoat?", "Yes. Cast vinyl removes cleanly within its rated lifespan. We heat-peel and rinse — no residue, no gelcoat damage. If a wrap has been on past its rated life (8+ years), removal takes longer and may require solvent work. Original gelcoat stays protected underneath the wrap the entire time."),
    ],
    'howto_steps': [
        ("Pick your vinyl grade", "Demand cast vinyl — Avery Dennison MPI 1105 or 3M IJ180-CV3. Calendered vinyl is cheaper but fails in 18 months in marine conditions. Get the product number in writing on your quote."),
        ("Verify laminate coverage", "A marine wrap without laminate fades within 2 Lake Michigan summers. Confirm your installer is applying 3M 8519 or Avery DOL-1000 gloss overlaminate. No laminate = no UV protection."),
        ("Check installer's marine portfolio", "Car wrappers often can't handle hull geometry — compound curves, rub rails, cleats, through-hull fittings. Ask for 10+ previous marine jobs with photos. CFW has wrapped 200+ vessels."),
        ("Plan for storage and winterization", "Chicago boats spend 4–5 months in shrink-wrap storage. Proper edge sealing and pre-storage wash extend wrap life. Ask how the shop handles shrink-wrap contact."),
        ("Lock your spring launch date", "Book spring wraps by February. Every harbor owner wants their boat wrapped before Memorial Day. Off-season (November–March) install is 15% cheaper and avoids the launch-deadline squeeze."),
    ],
    'howto_name': 'How to Pick a Marine Wrap That Survives Lake Michigan',
    'howto_desc': 'Five-step guide for Chicago boat owners choosing professional wrap materials, installers, and scheduling.',
    'keywords': 'marine wraps chicago, boat wraps chicago, yacht wraps, pontoon wraps, jet ski wraps, fishing boat wraps, lake michigan boat wraps',
    'date_published': DATE_PUB,
    'date_modified': DATE_MOD,
    'article_keywords': 'marine wraps Chicago, Lake Michigan boat wraps, yacht wraps, pontoon wraps, jet ski wraps, fishing boat wraps, marine vinyl',
    'article_section': 'Marine Wraps',
    'servicesDescription': 'Professional marine wrap services in Chicago for all vessel types including boats, yachts, pontoons, jet skis, and fishing boats.',
}

# Generate & save
html_hub = build_page(hub_cfg)
with open('out_marine-wraps.html','w') as f:
    f.write(html_hub)
print(f"✓ /marine-wraps/            {len(html_hub):>7,} bytes")
