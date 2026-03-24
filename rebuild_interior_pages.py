#!/usr/bin/env python3
"""
Rebuilds interior service/industry pages with proper designer layout.
Images are placed strategically — not randomly floated into text walls.

Layout per page:
1. Hero (existing — full width wrap photo)
2. Intro split: H1 + lead LEFT | main photo RIGHT
3. Trust strip
4. Why section: alternating text/photo
5. Vehicle types (styled grid)
6. Gallery: 3-col photo grid
7. Mid-page CTA
8. FAQ
9. Final CTA
"""

import re
from pathlib import Path

PAGES = {
    "hvac-van-wraps-chicago": {
        "title": "HVAC Van Wraps in Chicago",
        "h1": "HVAC Van Wraps Chicago",
        "subtitle": "Turn Every Service Call Into a Neighborhood Billboard",
        "lead": "Your HVAC van parks in a customer's driveway for 2–8 hours per job. Every neighbor, mail carrier, and school-run parent sees your brand. We turn that dead time into 30,000–70,000 daily impressions with premium 3M and Avery Dennison cast vinyl built to survive Chicago winters.",
        "hero_img": "/images/499031832_24357754093827647_8285045186686109093_n.webp",
        "hero_alt": "HVAC van wrap — Precision Today heating and cooling van by Chicago Fleet Wraps",
        "why_title": "Why HVAC Companies In Chicago Get Wrapped",
        "why_body": "Google Ads cost $3.50+ per impression. Angi charges $8–$25 per lead. A wrapped HVAC van costs $0.04 CPM and works 24/7 for 5–7 years. Chicago's extreme seasons drive year-round HVAC demand — a professionally wrapped van pays for itself with a single job referral, and every route you run is a moving billboard on the Kennedy, the Eisenhower, and every residential street in between.",
        "why_img": "/images/studio/pro-air-transit-van-wrap.webp",
        "why_alt": "Pro Air HVAC transit van wrap — Chicago Fleet Wraps",
        "vehicles": [
            ("Ford Transit", "Full-size and Transit Connect — #1 HVAC service van in Chicago."),
            ("Ram ProMaster", "1500, 2500, 3500 cargo and cutaway models."),
            ("Chevy Express", "2500 and 3500 cargo vans for service techs."),
            ("Mercedes Sprinter", "Standard and high-roof — ideal for large equipment."),
            ("Nissan NV200 / NV2500", "Compact and full-size for residential service calls."),
            ("Box Trucks", "3/4-ton to 26,000 lb GVWR for large HVAC equipment fleets."),
        ],
        "gallery": [
            ("/images/studio/pro-air-transit-van-wrap.webp", "Pro Air HVAC transit van wrap"),
            ("/images/sbc_hvac_van.webp", "SBC HVAC cargo van wrap"),
            ("/images/499031832_24357754093827647_8285045186686109093_n.webp", "Precision Today HVAC sprinter wrap"),
        ],
        "faqs": [
            ("How much do HVAC van wraps cost in Chicago?", "HVAC van wraps start at $3,150 for a full cargo van wrap. Sprinter vans start at $3,700. Fleet discounts available for 3+ vehicles. 100% IRS Section 179 deductible."),
            ("What should I include on my HVAC van wrap?", "Company name, phone number large enough to read at 45 mph, your HVAC license number, service area, website, and a one-line offer. We handle the design — you approve it."),
            ("How long does the wrap last in Chicago weather?", "Avery Dennison MPI 1105 and 3M IJ180-CV last 5–7 years in Chicago's freeze-thaw cycles, road salt, and summer heat. We use cast vinyl only — no calendered film that cracks in January."),
            ("Do you serve HVAC contractors in the suburbs?", "Yes — free pickup and delivery anywhere in Chicagoland. Schaumburg, Naperville, Aurora, Joliet, Arlington Heights, and 60+ cities covered."),
        ],
        "cta_headline": "Ready to Put Your HVAC Fleet to Work?",
        "cta_sub": "Free estimate in under 2 hours. Free pickup anywhere in Chicagoland.",
        "breadcrumb": [("Home", "/"), ("HVAC Wraps", "/hvac-van-wraps-chicago/")],
        "canonical": "https://www.chicagofleetwraps.com/hvac-van-wraps-chicago/",
    },
    "electrician-vehicle-wraps-chicago": {
        "title": "Electrician Vehicle Wraps Chicago",
        "h1": "Electrician Vehicle Wraps Chicago",
        "subtitle": "Brand Your Fleet. Own Your Market. Generate Leads 24/7.",
        "lead": "Electrical contractors live and die by trust. A professionally wrapped van on a residential street signals credibility before you knock on the door. We've wrapped Chicago's top electrical fleets for 24+ years using 3M and Avery Dennison cast vinyl — the only materials that hold up through Chicago winters.",
        "hero_img": "/images/studio/arnold-electric-transit-van-wrap-3.webp",
        "hero_alt": "Arnold Electric transit van wrap — electrician fleet branding by Chicago Fleet Wraps",
        "why_title": "Electricians Who Wrap Their Vans Win More Jobs",
        "why_body": "Residential customers choose the contractor they recognize and trust. A wrapped van parked outside a job site tells every neighbor: this company is established, professional, and worth calling. The OAAA reports 97% ad recall for vehicle wraps — higher than any digital channel. On Chicago's North Shore, in Lincoln Park, in Naperville — your wrapped van is your best salesman.",
        "why_img": "/images/arnold_electric_sales.webp",
        "why_alt": "Arnold Electric fleet wrap — electrical contractor vehicle branding",
        "vehicles": [
            ("Ford Transit", "Full-size cargo van — most popular electrician vehicle in Chicago."),
            ("Chevy Express 2500/3500", "High-roof and standard for tool and material storage."),
            ("Ram ProMaster", "Cargo and city van models for residential electricians."),
            ("Ford F-150 / F-250", "Pickup trucks for independent electrical contractors."),
            ("Mercedes Sprinter", "High-roof for commercial electrical crews."),
            ("Utility Trucks", "Bucket trucks and service bodies for line work."),
        ],
        "gallery": [
            ("/images/studio/arnold-electric-transit-van-wrap.webp", "Arnold Electric transit van wrap"),
            ("/images/arnold_electric_truck.webp", "Arnold Electric truck fleet wrap"),
            ("/images/studio/arnold-electric-transit-van-wrap-2.webp", "Arnold Electric van wrap detail"),
        ],
        "faqs": [
            ("How much do electrician van wraps cost in Chicago?", "Full cargo van wraps start at $3,150. Pickup truck wraps start at $2,400. Partial wraps from $1,200. Fleet pricing available for 3+ vehicles. 100% IRS Section 179 deductible."),
            ("What should my electrician van wrap include?", "License number (IBEW or state electrical license), phone number readable at 45 mph, service area, specialty (residential, commercial, industrial), and a one-line offer. We design it — you approve it."),
            ("How long will the wrap last?", "5–7 years with Avery Dennison MPI 1105 or 3M IJ180-CV cast vinyl. We don't use calendered film. Our wraps survive Chicago road salt, freeze-thaw, and summer UV without peeling or cracking."),
            ("Do you wrap electrician fleets outside Chicago?", "Yes — free pickup and delivery across all of Chicagoland. We serve electrical contractors in Evanston, Schaumburg, Naperville, Oak Park, and 60+ surrounding cities."),
        ],
        "cta_headline": "Get Your Electrician Fleet Wrapped This Week",
        "cta_sub": "Free estimate in under 2 hours. Free pickup anywhere in Chicagoland.",
        "breadcrumb": [("Home", "/"), ("Electrician Wraps", "/electrician-vehicle-wraps-chicago/")],
        "canonical": "https://www.chicagofleetwraps.com/electrician-vehicle-wraps-chicago/",
    },
    "plumbing-van-wraps-chicago": {
        "title": "Plumbing Van Wraps Chicago",
        "h1": "Plumbing Van Wraps Chicago",
        "subtitle": "Every Plumbing Call Is a Marketing Opportunity. Are You Using It?",
        "lead": "A plumber's van sits in front of a customer's house while you work. That's 1–4 hours of free advertising to every neighbor on the block. We wrap plumbing fleets across Chicago with 3M and Avery Dennison cast vinyl — built to handle road salt, winter grime, and 5+ years of Chicago weather.",
        "hero_img": "/images/studio/improovy-painters-cargo-van-wrap-2.webp",
        "hero_alt": "Plumbing cargo van wrap — Chicago Fleet Wraps",
        "why_title": "Why Chicago Plumbers Wrap Their Vans",
        "why_body": "Trust is everything in residential plumbing. Homeowners call the company they recognize. A wrapped van on Wrightwood, on Roscoe Village streets, in Oak Park driveways — that's brand building money can't buy any other way. At $0.04 CPM versus $8–$25 per lead on Angi, wrapped vans are the best ROI in your marketing budget by a mile.",
        "why_img": "/images/studio/puroclean-transit-van-wrap.webp",
        "why_alt": "Commercial van wrap — Chicago Fleet Wraps plumbing fleet",
        "vehicles": [
            ("Ford Transit", "Cargo and passenger van models — most popular plumbing fleet van."),
            ("Chevy Express 2500/3500", "Standard workhorse for Chicago plumbing fleets."),
            ("Ram ProMaster", "1500 city van to 3500 high-roof cargo."),
            ("Ford F-250 / F-350", "Super Duty for large plumbing and drain companies."),
            ("Mercedes Sprinter", "High-roof for crews with large pipe inventory."),
            ("Box Trucks", "For large commercial plumbing operations."),
        ],
        "gallery": [
            ("/images/studio/improovy-painters-cargo-van-wrap-2.webp", "Cargo van wrap — full coverage"),
            ("/images/studio/puroclean-transit-van-wrap.webp", "Transit van wrap — commercial plumbing"),
            ("/images/studio/pro-air-transit-van-wrap.webp", "Sprinter van wrap — service fleet"),
        ],
        "faqs": [
            ("How much do plumbing van wraps cost in Chicago?", "Full cargo van wraps start at $3,150. Partial wraps from $1,200. Fleet pricing for 3+ vehicles. 100% IRS Section 179 deductible as an advertising expense."),
            ("What should my plumbing van wrap include?", "License number, 24/7 emergency line, specialties (drain, sewer, water heater, etc.), service area, and website. We design — you approve. Turnaround is typically 5–7 business days."),
            ("How durable are the wraps in Chicago weather?", "We use cast vinyl only — Avery Dennison MPI 1105 or 3M IJ180-CV. Rated 5–7 years. Survives road salt, freeze-thaw cycles, and Chicago's brutal winters. No peeling, no cracking."),
            ("Do you offer fleet pricing for plumbing companies?", "Yes — fleet pricing available for 3+ vehicles. Our 6th wrap is free loyalty program rewards high-volume clients. Free pickup and delivery anywhere in Chicagoland."),
        ],
        "cta_headline": "Wrap Your Plumbing Fleet. Own Your Neighborhood.",
        "cta_sub": "Free estimate in under 2 hours. Free pickup anywhere in Chicagoland.",
        "breadcrumb": [("Home", "/"), ("Plumbing Van Wraps", "/plumbing-van-wraps-chicago/")],
        "canonical": "https://www.chicagofleetwraps.com/plumbing-van-wraps-chicago/",
    },
}


def build_page(slug, data):
    """Build a fully redesigned interior page."""

    # Breadcrumb HTML
    bc_html = ' › '.join(
        f'<a href="{url}">{label}</a>' for label, url in data["breadcrumb"]
    ) + f' › {data["title"]}'

    # Vehicles grid
    vehicles_html = "\n".join(
        f'<div class="vtype-card"><div class="vtype-name">{name}</div><div class="vtype-desc">{desc}</div></div>'
        for name, desc in data["vehicles"]
    )

    # Gallery
    gallery_html = "\n".join(
        f'<div class="gallery-item"><img src="{src}" alt="{alt}" loading="lazy" width="600" height="400"></div>'
        for src, alt in data["gallery"]
    )

    # FAQ
    faq_html = "\n".join(
        f'''<div class="faq-item">
  <div class="faq-q">{q}</div>
  <div class="faq-a">{a}</div>
</div>'''
        for q, a in data["faqs"]
    )

    # Read the existing page to grab head/header/footer
    src_path = Path(f"public/{slug}/index.html")
    if not src_path.exists():
        print(f"SKIP: {slug} not found")
        return

    existing = src_path.read_text(encoding="utf-8", errors="replace")

    # Extract everything from <head> through the hero section
    head_end = existing.find("</head>") + 7
    head = existing[:head_end]

    # Extract the trust ribbon
    trib_start = existing.find('<div aria-label="Trust indicators"')
    trib_end = existing.find("</div>", trib_start) + 6  # find closing of trib div
    # Get full trib block
    trib_block = existing[trib_start:existing.find('<header', trib_start)]

    # Extract header block
    header_start = existing.find("<header")
    header_end = existing.find("</header>") + 9
    header = existing[header_start:header_end]

    # Extract the hero section
    hero_start = existing.find('<div class="page-hero-banner"')
    if hero_start == -1:
        hero_start = existing.find('<section class="hero"')
    if hero_start == -1:
        hero_start = existing.find('<div class="hero"')

    hero_end = existing.find("</div>", hero_start)
    # Walk to find the closing div for the hero wrapper
    depth = 0
    i = hero_start
    while i < len(existing):
        if existing[i:i+4] == "<div":
            depth += 1
        elif existing[i:i+6] == "</div>":
            depth -= 1
            if depth == 0:
                hero_end = i + 6
                break
        i += 1
    hero_block = existing[hero_start:hero_end]

    # Extract footer
    footer_start = existing.find("<footer")
    footer_end = existing.find("</footer>") + 9
    footer = existing[footer_start:footer_end]

    # Extract any scripts after footer
    scripts_after = existing[footer_end:]

    new_content = f"""<!DOCTYPE html>
<html lang="en">
{head[head.find('<head>'):-7]}
</head>
<body>
{trib_block}
{header}

{hero_block}

<main class="ip-main">

  <!-- ── INTRO SPLIT ─────────────────────────────────────────── -->
  <section class="ip-intro">
    <div class="ip-wrap">
      <div class="ip-intro-text">
        <nav class="breadcrumb" aria-label="Breadcrumb">{bc_html}</nav>
        <h1>{data["h1"]}</h1>
        <p class="ip-subtitle">{data["subtitle"]}</p>
        <p class="ip-lead">{data["lead"]}</p>
        <div class="ip-cta-bar">
          <a href="/estimate/" class="ip-btn-primary">Get a Free Quote →</a>
          <a href="tel:+13125971286" class="ip-btn-secondary">📞 (312) 597-1286</a>
        </div>
      </div>
      <div class="ip-intro-img">
        <img src="{data["hero_img"]}" alt="{data["hero_alt"]}" width="700" height="500" loading="eager">
        <div class="ip-img-badge">Chicago's #1 Fleet Wrap Installer</div>
      </div>
    </div>
  </section>

  <!-- ── TRUST STRIP ─────────────────────────────────────────── -->
  <section class="ip-trust-strip">
    <div class="ip-wrap">
      <div class="ip-trust-items">
        <div class="ip-trust-item"><span class="ip-trust-num">24+</span><span class="ip-trust-label">Years in Business</span></div>
        <div class="ip-trust-item"><span class="ip-trust-num">9,400+</span><span class="ip-trust-label">Vehicles Wrapped</span></div>
        <div class="ip-trust-item"><span class="ip-trust-num">4.9★</span><span class="ip-trust-label">Google Rating</span></div>
        <div class="ip-trust-item"><span class="ip-trust-num">3M + Avery</span><span class="ip-trust-label">Cast Vinyl Only</span></div>
        <div class="ip-trust-item"><span class="ip-trust-num">Free</span><span class="ip-trust-label">Pickup & Delivery</span></div>
      </div>
    </div>
  </section>

  <!-- ── WHY SECTION ─────────────────────────────────────────── -->
  <section class="ip-why">
    <div class="ip-wrap">
      <div class="ip-why-grid">
        <div class="ip-why-text">
          <div class="ip-label">Why It Works</div>
          <h2>{data["why_title"]}</h2>
          <p>{data["why_body"]}</p>
          <ul class="ip-why-list">
            <li><strong>30,000–70,000</strong> daily impressions per vehicle</li>
            <li><strong>$0.04 CPM</strong> vs. $3.50+ for Google Ads</li>
            <li><strong>97% ad recall</strong> — highest of any ad medium (OAAA)</li>
            <li><strong>5–7 year</strong> lifespan on premium cast vinyl</li>
            <li><strong>100% IRS Section 179</strong> deductible advertising expense</li>
          </ul>
        </div>
        <div class="ip-why-img">
          <img src="{data["why_img"]}" alt="{data["why_alt"]}" width="600" height="420" loading="lazy">
        </div>
      </div>
    </div>
  </section>

  <!-- ── VEHICLE TYPES ────────────────────────────────────────── -->
  <section class="ip-vehicles">
    <div class="ip-wrap">
      <div class="ip-label">What We Wrap</div>
      <h2>Vehicle Types We Wrap in Chicago</h2>
      <div class="ip-vtype-grid">
        {vehicles_html}
      </div>
    </div>
  </section>

  <!-- ── GALLERY ─────────────────────────────────────────────── -->
  <section class="ip-gallery">
    <div class="ip-wrap">
      <div class="ip-label">Our Work</div>
      <h2>Recent Wraps — Chicago Fleet Wraps</h2>
      <p class="ip-gallery-sub">Every wrap is 3M or Avery Dennison premium cast vinyl. Zero paint damage. Zero shortcuts.</p>
      <div class="ip-gallery-grid">
        {gallery_html}
      </div>
    </div>
  </section>

  <!-- ── MID CTA ──────────────────────────────────────────────── -->
  <section class="ip-mid-cta">
    <div class="ip-wrap">
      <div class="ip-mid-cta-box">
        <div class="ip-mid-cta-text">
          <h2>{data["cta_headline"]}</h2>
          <p>{data["cta_sub"]}</p>
        </div>
        <div class="ip-mid-cta-actions">
          <a href="/estimate/" class="ip-btn-primary">Get Free Estimate →</a>
          <a href="tel:+13125971286" class="ip-btn-secondary">📞 (312) 597-1286</a>
        </div>
      </div>
    </div>
  </section>

  <!-- ── FAQ ─────────────────────────────────────────────────── -->
  <section class="ip-faq">
    <div class="ip-wrap">
      <div class="ip-label">FAQ</div>
      <h2>Common Questions</h2>
      <div class="ip-faq-list">
        {faq_html}
      </div>
    </div>
  </section>

</main>

{footer}
{scripts_after}
</body>
</html>"""

    src_path.write_text(new_content, encoding="utf-8")
    print(f"✓ Rebuilt: {slug}")


if __name__ == "__main__":
    import os
    os.chdir(Path(__file__).parent)
    for slug, data in PAGES.items():
        build_page(slug, data)
    print("Done.")
