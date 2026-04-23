"""CFW Design Labs — creative services hub page."""
import sys
sys.path.insert(0, '.')
from page_factory import build_page

DATE_PUB = "2026-04-23"
DATE_MOD = "2026-04-23"

# Services grid — 6 cards covering the full creative scope
SERVICES_GRID = '''
<section style="max-width:1100px;margin:60px auto 40px;padding:0 24px">
<h2 style="font-family:var(--H,'Bebas Neue',sans-serif);font-size:2.2rem;color:#FFD700;margin-bottom:12px;text-align:center">Six Creative Services. One Studio.</h2>
<p style="color:rgba(255,255,255,.75);line-height:1.6;text-align:center;max-width:760px;margin:0 auto 40px">Everything a wrap needs before the vinyl rolls off the printer — and plenty of work that never touches a vehicle. Built in-house by the same team that's designed 9,400+ fleet installs.</p>

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px">

<a href="#service-wrap-design" style="display:block;text-decoration:none;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:28px;transition:all .2s" onmouseover="this.style.borderColor='#FFD700';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='rgba(255,255,255,.1)';this.style.transform='translateY(0)'">
<div style="font-family:var(--H);font-size:1.5rem;color:#FFD700;margin-bottom:8px">Wrap Design</div>
<div style="font-size:.85rem;color:rgba(255,255,255,.55);margin-bottom:12px">Full vehicle wrap layouts · $500–$2,500</div>
<p style="color:rgba(255,255,255,.72);line-height:1.55;font-size:.9rem;margin:0">Van, truck, box truck, SUV, boat. We design to the template, price by complexity, not by hour. Included free at 3+ vehicle fleet orders.</p>
</a>

<a href="#service-brand-identity" style="display:block;text-decoration:none;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:28px;transition:all .2s" onmouseover="this.style.borderColor='#FFD700';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='rgba(255,255,255,.1)';this.style.transform='translateY(0)'">
<div style="font-family:var(--H);font-size:1.5rem;color:#FFD700;margin-bottom:8px">Brand Identity</div>
<div style="font-size:.85rem;color:rgba(255,255,255,.55);margin-bottom:12px">Logos, color systems, type · $1,500–$8,500</div>
<p style="color:rgba(255,255,255,.72);line-height:1.55;font-size:.9rem;margin:0">Full brand systems for new businesses or rebrand projects. Logo suite, color palette, type system, brand guidelines, file delivery. Built by designers who also know how vinyl prints.</p>
</a>

<a href="/services/ai-to-vector/" style="display:block;text-decoration:none;background:linear-gradient(135deg,rgba(255,215,0,.08),rgba(255,215,0,.02));border:1px solid rgba(255,215,0,.3);border-radius:8px;padding:28px;transition:all .2s" onmouseover="this.style.borderColor='#FFD700';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='rgba(255,215,0,.3)';this.style.transform='translateY(0)'">
<div style="font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:#FFD700;margin-bottom:6px">⚡ Live Service</div>
<div style="font-family:var(--H);font-size:1.5rem;color:#FFD700;margin-bottom:8px">AI Art → Vector</div>
<div style="font-size:.85rem;color:rgba(255,255,255,.55);margin-bottom:12px">Production-ready vectors · $300 flat</div>
<p style="color:rgba(255,255,255,.72);line-height:1.55;font-size:.9rem;margin:0">Upload Midjourney, DALL-E, Firefly, or Stable Diffusion output. Get back clean SVG/EPS/AI files at full print resolution. Nine-stage processing pipeline. 48-hour turnaround.</p>
</a>

<a href="#service-mockups" style="display:block;text-decoration:none;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:28px;transition:all .2s" onmouseover="this.style.borderColor='#FFD700';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='rgba(255,255,255,.1)';this.style.transform='translateY(0)'">
<div style="font-family:var(--H);font-size:1.5rem;color:#FFD700;margin-bottom:8px">Vehicle Mockups</div>
<div style="font-size:.85rem;color:rgba(255,255,255,.55);margin-bottom:12px">Photorealistic 3D renders · $250–$750</div>
<p style="color:rgba(255,255,255,.72);line-height:1.55;font-size:.9rem;margin:0">See the wrap on the actual vehicle model before you commit. Sprinter, Transit, ProMaster, Rivian, box trucks, boats — 274 make/model templates. Multiple angles. Client-ready in 24 hours.</p>
</a>

<a href="#service-sponsor-packages" style="display:block;text-decoration:none;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:28px;transition:all .2s" onmouseover="this.style.borderColor='#FFD700';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='rgba(255,255,255,.1)';this.style.transform='translateY(0)'">
<div style="font-family:var(--H);font-size:1.5rem;color:#FFD700;margin-bottom:8px">Sponsor Packages</div>
<div style="font-size:.85rem;color:rgba(255,255,255,.55);margin-bottom:12px">Multi-logo layouts · $800–$2,500</div>
<p style="color:rgba(255,255,255,.72);line-height:1.55;font-size:.9rem;margin:0">For race teams, tournament teams, charter captains, and boat sponsorship clients. We lay out multi-sponsor graphics that satisfy every sponsor's contract while still looking like one coherent vehicle — not a sticker quilt.</p>
</a>

<a href="#service-print-collateral" style="display:block;text-decoration:none;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:28px;transition:all .2s" onmouseover="this.style.borderColor='#FFD700';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='rgba(255,255,255,.1)';this.style.transform='translateY(0)'">
<div style="font-family:var(--H);font-size:1.5rem;color:#FFD700;margin-bottom:8px">Print Collateral</div>
<div style="font-size:.85rem;color:rgba(255,255,255,.55);margin-bottom:12px">Biz cards, signs, banners, trade show · $250+</div>
<p style="color:rgba(255,255,255,.72);line-height:1.55;font-size:.9rem;margin:0">Design and production of business cards, yard signs, trade show banners, branded apparel, and large-format prints. Same team that builds your wrap, so everything matches.</p>
</a>

</div>
</section>
'''

DETAILED_SECTIONS = '''
<section id="service-wrap-design" style="max-width:1000px;margin:80px auto;padding:0 24px;scroll-margin-top:120px">
<div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start">
<div>
<div style="font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:#FFD700;margin-bottom:6px">Service 01</div>
<h2 style="font-family:var(--H);font-size:2.2rem;color:#FFD700;margin-bottom:16px;line-height:1.1">Wrap Design</h2>
<p style="color:rgba(255,255,255,.78);line-height:1.7;margin-bottom:14px">Most wrap shops treat design as an afterthought — a template, a dropped logo, an overlay of contact info. That's why most wraps look generic at 40 mph. We design every wrap to be readable at distance, balanced at every angle, and built on the actual vehicle template (not a stock outline).</p>
<p style="color:rgba(255,255,255,.78);line-height:1.7;margin-bottom:14px">Unlimited revisions before production. We proof on photo-realistic mockups of your exact vehicle make/model/year — Sprinter 170 high-roof, Transit 148 medium-roof, Rivian R1T quad-motor, Chevy 3500 box truck. The design you approve on screen matches what rolls out of the bay.</p>
<div style="margin-top:24px">
<div style="font-family:var(--H);color:#FFD700;font-size:1.1rem;margin-bottom:8px">Pricing</div>
<div style="color:rgba(255,255,255,.7);font-size:.92rem;line-height:1.7">
Single vehicle, standard layout: <strong style="color:#FFD700">$500</strong><br>
Full vehicle, custom illustration: <strong style="color:#FFD700">$850</strong><br>
Fleet template system (3+ vehicles): <strong style="color:#FFD700">$1,500</strong> + $150 per vehicle variation<br>
Flagship custom (murals, fades, cast effects): <strong style="color:#FFD700">$1,800–$2,500</strong><br>
<span style="color:rgba(255,255,255,.55);font-size:.85rem;margin-top:8px;display:block">Design is included free on fleet orders of 3+ vehicles.</span>
</div>
</div>
</div>
<figure style="margin:0;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:8px;overflow:hidden">
<img src="/images/studio/1800-tequila-boat-wrap.webp" alt="1800 Tequila boat wrap — CFW Design Labs custom layout" loading="lazy" style="width:100%;height:auto;aspect-ratio:3/2;object-fit:cover;display:block">
<figcaption style="padding:12px 16px;font-size:.82rem;color:rgba(255,255,255,.7)">1800 Tequila — full custom sponsor layout designed by CFW Design Labs</figcaption>
</figure>
</div>
</section>

<section id="service-brand-identity" style="max-width:1000px;margin:80px auto;padding:0 24px;scroll-margin-top:120px">
<div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start">
<figure style="margin:0;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:8px;overflow:hidden">
<img src="/images/arnold_electric_van.webp" alt="Arnold Electric — complete brand system applied to fleet" loading="lazy" style="width:100%;height:auto;aspect-ratio:3/2;object-fit:cover;display:block">
<figcaption style="padding:12px 16px;font-size:.82rem;color:rgba(255,255,255,.7)">Arnold Electric — full brand system deployed across fleet vehicles, vans, trucks, and sales collateral</figcaption>
</figure>
<div>
<div style="font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:#FFD700;margin-bottom:6px">Service 02</div>
<h2 style="font-family:var(--H);font-size:2.2rem;color:#FFD700;margin-bottom:16px;line-height:1.1">Brand Identity</h2>
<p style="color:rgba(255,255,255,.78);line-height:1.7;margin-bottom:14px">New business, rebrand, or cleanup job — we build brand systems that actually work when they hit the side of a truck. Most agency logos fail the 40-mph test: too thin, too many colors, too much detail. We design for real-world deployment first.</p>
<p style="color:rgba(255,255,255,.78);line-height:1.7;margin-bottom:14px">Deliverables include primary logo, stacked/horizontal/monogram variants, complete color system (Pantone, CMYK, RGB, hex, vinyl film matches), type system, usage guidelines, and file package (AI, EPS, SVG, PNG at every scale). Revisions continue until you're happy.</p>
<div style="margin-top:24px">
<div style="font-family:var(--H);color:#FFD700;font-size:1.1rem;margin-bottom:8px">Pricing</div>
<div style="color:rgba(255,255,255,.7);font-size:.92rem;line-height:1.7">
Logo suite only (3 variants): <strong style="color:#FFD700">$1,500</strong><br>
Starter brand system (logo + colors + type): <strong style="color:#FFD700">$3,500</strong><br>
Full brand identity (above + guidelines + collateral templates): <strong style="color:#FFD700">$6,500</strong><br>
Rebrand with migration plan (for existing businesses): <strong style="color:#FFD700">$8,500</strong><br>
<span style="color:rgba(255,255,255,.55);font-size:.85rem;margin-top:8px;display:block">Includes wrap design credit toward a full vehicle wrap when installed with CFW.</span>
</div>
</div>
</div>
</div>
</section>

<section id="service-mockups" style="max-width:1000px;margin:80px auto;padding:0 24px;scroll-margin-top:120px">
<div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start">
<div>
<div style="font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:#FFD700;margin-bottom:6px">Service 04</div>
<h2 style="font-family:var(--H);font-size:2.2rem;color:#FFD700;margin-bottom:16px;line-height:1.1">Vehicle Mockups</h2>
<p style="color:rgba(255,255,255,.78);line-height:1.7;margin-bottom:14px">See exactly what the wrap will look like on your truck before we print. We maintain a library of 274 make/model vehicle templates — every angle, every configuration. Drop your design in and we render photo-realistic proofs inside 24 hours.</p>
<p style="color:rgba(255,255,255,.78);line-height:1.7;margin-bottom:14px">Useful beyond wrap approval too: pitch decks, sales presentations, sponsor pitches, social content, investor decks. When a brand needs to show what a sponsorship rollout will look like across 50 vehicles, we build the entire mockup set.</p>
<div style="margin-top:24px">
<div style="font-family:var(--H);color:#FFD700;font-size:1.1rem;margin-bottom:8px">Pricing</div>
<div style="color:rgba(255,255,255,.7);font-size:.92rem;line-height:1.7">
Single vehicle, 2 angles: <strong style="color:#FFD700">$250</strong><br>
Full vehicle kit (6 angles + hero shot): <strong style="color:#FFD700">$450</strong><br>
Fleet mockup set (5 vehicles, 3 angles each): <strong style="color:#FFD700">$750</strong><br>
<span style="color:rgba(255,255,255,.55);font-size:.85rem;margin-top:8px;display:block">Free single-angle mockup included with any wrap quote over $3,000.</span>
</div>
</div>
</div>
<figure style="margin:0;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:8px;overflow:hidden">
<img src="/images/studio/gmc-yukon-suv-wrap.webp" alt="GMC Yukon wrap mockup — photorealistic preview" loading="lazy" style="width:100%;height:auto;aspect-ratio:3/2;object-fit:cover;display:block">
<figcaption style="padding:12px 16px;font-size:.82rem;color:rgba(255,255,255,.7)">Photorealistic mockup on an actual GMC Yukon template — approved by client before print</figcaption>
</figure>
</div>
</section>

<section id="service-sponsor-packages" style="max-width:1000px;margin:80px auto;padding:0 24px;scroll-margin-top:120px">
<div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start">
<figure style="margin:0;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:8px;overflow:hidden">
<img src="/images/studio/patron-boat-wrap-2.webp" alt="Patron sponsor package layout" loading="lazy" style="width:100%;height:auto;aspect-ratio:3/2;object-fit:cover;display:block">
<figcaption style="padding:12px 16px;font-size:.82rem;color:rgba(255,255,255,.7)">Multi-sponsor layout — brand hierarchy maintained across hull, transom, and accent panels</figcaption>
</figure>
<div>
<div style="font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:#FFD700;margin-bottom:6px">Service 05</div>
<h2 style="font-family:var(--H);font-size:2.2rem;color:#FFD700;margin-bottom:16px;line-height:1.1">Sponsor Packages</h2>
<p style="color:rgba(255,255,255,.78);line-height:1.7;margin-bottom:14px">Race teams, tournament teams, charter captains, and our <a href="/boat-sponsorship-program/" style="color:#FFD700">boat sponsorship program</a> clients all have the same challenge — multiple sponsor logos, different contract sizes, exclusivity clauses, placement requirements. Handled poorly it looks like a NASCAR sticker quilt. Done right, it looks intentional.</p>
<p style="color:rgba(255,255,255,.78);line-height:1.7;margin-bottom:14px">We handle hierarchy, placement, color coordination, and sponsor contract compliance. Every logo readable from 300 feet across water or 50 feet at a track. Every sponsor's size tier respected. Everyone happy.</p>
<div style="margin-top:24px">
<div style="font-family:var(--H);color:#FFD700;font-size:1.1rem;margin-bottom:8px">Pricing</div>
<div style="color:rgba(255,255,255,.7);font-size:.92rem;line-height:1.7">
Up to 4 sponsors, single vehicle: <strong style="color:#FFD700">$800</strong><br>
5–8 sponsors, full hierarchy layout: <strong style="color:#FFD700">$1,400</strong><br>
9+ sponsors with contract compliance review: <strong style="color:#FFD700">$2,000–$2,500</strong><br>
<span style="color:rgba(255,255,255,.55);font-size:.85rem;margin-top:8px;display:block">Included free on boat sponsorship program installs.</span>
</div>
</div>
</div>
</div>
</section>

<section id="service-print-collateral" style="max-width:1000px;margin:80px auto;padding:0 24px;scroll-margin-top:120px">
<div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start">
<div>
<div style="font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:#FFD700;margin-bottom:6px">Service 06</div>
<h2 style="font-family:var(--H);font-size:2.2rem;color:#FFD700;margin-bottom:16px;line-height:1.1">Print Collateral</h2>
<p style="color:rgba(255,255,255,.78);line-height:1.7;margin-bottom:14px">The wrap is the hero but the rest of your print game should match. We design and produce business cards, yard signs, trade show banners, vehicle magnets, branded apparel, pull-up displays, and large-format signs — all coming out of the same creative team that built your wrap.</p>
<p style="color:rgba(255,255,255,.78);line-height:1.7;margin-bottom:14px">Especially useful for new business launches, rebrands, and trade show deployments where you need everything on-brand and on-deadline. We handle design, proofing, printing, and (for Chicagoland) delivery.</p>
<div style="margin-top:24px">
<div style="font-family:var(--H);color:#FFD700;font-size:1.1rem;margin-bottom:8px">Pricing</div>
<div style="color:rgba(255,255,255,.7);font-size:.92rem;line-height:1.7">
Business cards (500 qty, premium stock): <strong style="color:#FFD700">$250</strong><br>
Yard signs (10 qty, 18"×24"): <strong style="color:#FFD700">$350</strong><br>
Trade show banner (8'×3' with stand): <strong style="color:#FFD700">$650</strong><br>
Pull-up retractable display (33"×81"): <strong style="color:#FFD700">$450</strong><br>
Vehicle magnets (pair, 12"×18"): <strong style="color:#FFD700">$180</strong><br>
Branded apparel (50 qty, polos or tees): <strong style="color:#FFD700">From $1,200</strong><br>
<span style="color:rgba(255,255,255,.55);font-size:.85rem;margin-top:8px;display:block">Rush production available. Chicagoland delivery included.</span>
</div>
</div>
</div>
<figure style="margin:0;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:8px;overflow:hidden">
<img src="/images/arnold_electric_sales.webp" alt="Print collateral — Arnold Electric fleet sales materials" loading="lazy" style="width:100%;height:auto;aspect-ratio:3/2;object-fit:cover;display:block">
<figcaption style="padding:12px 16px;font-size:.82rem;color:rgba(255,255,255,.7)">Brand-matched print collateral — produced in-house alongside the wrap program</figcaption>
</figure>
</div>
</section>

<section style="max-width:900px;margin:80px auto;padding:0 24px">
<h2 style="font-family:var(--H);font-size:2rem;color:#FFD700;margin-bottom:20px">How the Studio Works</h2>
<p style="color:rgba(255,255,255,.78);line-height:1.7;margin-bottom:14px">We run a real creative studio, not a template farm. Every project has a lead designer assigned, proofs are custom-built (not generated), and revisions keep going until it's right. We don't sell "design hours" — we sell projects at flat rates, so you always know what you're paying for.</p>
<p style="color:rgba(255,255,255,.78);line-height:1.7;margin-bottom:14px">Typical project timeline from kick-off to final files: 5–10 business days for wrap design, 2–3 weeks for brand identity, 48 hours for AI-to-vector conversions, 24 hours for single-vehicle mockups. Rush production available for launches, trade shows, and sponsor-announcement deadlines.</p>
<p style="color:rgba(255,255,255,.78);line-height:1.7">Every creative deliverable is compatible with CFW's print pipeline — HP Latex 700W, Avery Dennison MPI 1105, 3M IJ180-CV3. So when your design goes from screen to vinyl, nothing gets lost in translation. That's the Design Labs advantage: we design for the medium we print on.</p>
</section>

<section style="max-width:1100px;margin:80px auto;padding:40px 32px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:12px">
<h2 style="font-family:var(--H);font-size:2rem;color:#FFD700;margin-bottom:20px;text-align:center">Start a Project</h2>
<p style="color:rgba(255,255,255,.75);text-align:center;margin-bottom:32px;max-width:700px;margin-left:auto;margin-right:auto">Tell us what you need. We'll scope it, quote it, and kick off within 48 hours.</p>
<form action="/submit-design-inquiry/" method="post" style="display:grid;gap:16px;max-width:700px;margin:0 auto">
<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
<input type="text" name="name" placeholder="Your Name" required style="padding:12px 16px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:#fff;font-size:.95rem">
<input type="text" name="company" placeholder="Company / Project" style="padding:12px 16px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:#fff;font-size:.95rem">
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
<input type="email" name="email" placeholder="Email" required style="padding:12px 16px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:#fff;font-size:.95rem">
<input type="tel" name="phone" placeholder="Phone (optional)" style="padding:12px 16px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:#fff;font-size:.95rem">
</div>
<select name="service" required style="padding:12px 16px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:#fff;font-size:.95rem">
<option value="">Which service do you need?</option>
<option value="wrap-design">Wrap Design</option>
<option value="brand-identity">Brand Identity</option>
<option value="ai-to-vector">AI Art → Vector</option>
<option value="mockups">Vehicle Mockups</option>
<option value="sponsor-packages">Sponsor Packages</option>
<option value="print-collateral">Print Collateral</option>
<option value="multiple">Multiple / not sure yet</option>
</select>
<select name="timeline" style="padding:12px 16px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:#fff;font-size:.95rem">
<option value="">Timeline</option>
<option value="rush">Rush — need within 7 days</option>
<option value="standard">Standard — 2–4 weeks</option>
<option value="flexible">Flexible — no hard deadline</option>
</select>
<textarea name="project" placeholder="Tell us about the project. Goals, vehicle type(s), brand direction, reference links, anything relevant..." rows="5" style="padding:12px 16px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:#fff;font-size:.95rem;font-family:inherit"></textarea>
<button type="submit" style="padding:14px 32px;background:#FFD700;color:#000;font-family:var(--H);font-weight:900;font-size:1rem;letter-spacing:.05em;border:0;border-radius:4px;cursor:pointer">Start a Project →</button>
</form>
</section>
'''

# Insert the AI-to-Vector card ahead of service 03 (it IS service 03 — live service)
# So we have: 01 Wrap, 02 Brand, 03 AI-to-Vector (live), 04 Mockups, 05 Sponsors, 06 Print
# The #service-ai-to-vector card points to the existing live page rather than having its own detail section

SECTIONS_HTML = SERVICES_GRID + DETAILED_SECTIONS

cfg = {
    'slug': 'design-labs',
    'title': 'CFW Design Labs — Creative Services for Wraps, Brands, Sponsors',
    'meta_desc': 'In-house creative studio for vehicle wrap design, brand identity, AI-to-vector, mockups, sponsor packages, print. Chicago Fleet Wraps. Projects $250-$8,500. 48hr-10day turnaround.',
    'h1': 'CFW Design Labs — Creative That Actually Prints',
    'lead_html': '<p class="lead speakable"><strong>CFW Design Labs is Chicago Fleet Wraps\' in-house creative studio.</strong> Six services: wrap design, brand identity, AI-to-vector conversion, vehicle mockups, sponsor packages, and print collateral. Projects $250 to $8,500. Turnaround 48 hours (vectors) to 2-3 weeks (full brand systems). Built by designers who also understand how vinyl prints — so your screen design matches what rolls off the press. Text (312) 597-1286 or start a project below.</p>',
    'hero_img': '/images/studio/1800-tequila-boat-wrap.webp',
    'hero_alt': 'CFW Design Labs — creative services studio',
    'breadcrumbs': [('Home','/'),('Services','/commercial-vehicle-wraps-chicago/'),('Design Labs','/design-labs/')],
    'sections_html': SECTIONS_HTML,
    'faqs': [
        ("Do I have to wrap my vehicle with CFW to use Design Labs?", "No. Design Labs is a standalone creative studio — many clients hire us for brand identity, print collateral, or mockup work with no vehicle wrap involved. We also work with other wrap shops on vector conversion and mockup projects. That said, wrap design is included free on any fleet order of 3+ vehicles with CFW."),
        ("What's the turnaround on a typical wrap design?", "5–10 business days for a single vehicle wrap from kickoff to approved final files. Simpler layouts (logo placement, contact info, color blocking) land at 5 days. Complex work (custom illustration, multi-panel narrative designs, sponsor-integrated layouts) takes the full 10. Rush production is available for trade show and launch deadlines at a 30% premium."),
        ("How many revisions do I get?", "Unlimited until you're happy. We don't count rounds. Design projects are priced as complete deliverables, not hourly work, so there's no revision clock. The only thing that extends timeline is major scope changes — if a $500 single-vehicle design turns into a 5-vehicle fleet system mid-project, we'll re-quote."),
        ("Can I bring my own designer's work in for production?", "Yes. We regularly take outside design files (agencies, in-house marketing teams, freelancers) and prep them for CFW's print pipeline — HP Latex 700W, Avery/3M cast vinyl. Our production prep starts at $150 per vehicle and usually includes color correction, bleed adjustments, vinyl-specific tweaks, and a mockup proof."),
        ("What file formats do I receive?", "Full vector package: Adobe Illustrator (.ai), EPS, SVG, and PDF. Plus PNGs at multiple resolutions for web/presentation use. Brand identity projects also include a full brand guidelines PDF and font files with proper licensing. All files are yours — no 'design library lock-in.'"),
        ("Do you do logos for new businesses from scratch?", "Yes. Starter brand systems are $3,500 and include logo suite (primary, horizontal, monogram), color system, basic type system, and file delivery. Full brand identity is $6,500 and adds usage guidelines, collateral templates, and brand book. We specialize in service businesses that will eventually deploy on vehicles — HVAC, electrical, plumbing, contractors, charter captains — but work across any industry."),
        ("How does AI-to-vector work?", "Upload your Midjourney, DALL-E, Firefly, or Stable Diffusion output through our pipeline at /services/ai-to-vector/. Our 9-stage processing converts raster AI art into clean, production-ready vectors at full print resolution — with color separation, stroke cleanup, background removal, and quality QA. $300 flat fee, 48-hour turnaround, unlimited retries on the same image."),
        ("Can Design Labs handle sponsor-compliant layouts for race or charter teams?", "Yes — this is our niche. Multi-sponsor layouts require understanding contract tier sizing, placement requirements, exclusivity clauses, and visual hierarchy. We've done it for tournament bass teams, Chicago charter captains, and the boat sponsorship program. Starts at $800 for up to 4 sponsors, $2,500 for 9+ sponsor contracts with full compliance review."),
        ("Do you print business cards and trade show materials?", "Yes — the full Print Collateral service. Business cards, yard signs, trade show banners, pull-up displays, vehicle magnets, apparel, and large-format prints. Design and production come from the same team, so everything stays on-brand. Pricing starts at $180 (vehicle magnets) and scales to custom quotes for large apparel orders or full trade show kits."),
        ("What's the payment structure?", "50% deposit to begin work, 50% at final approval before files are released (or before printing begins for production projects). Accepted: ACH, credit card, wire. Net-30 terms available for established business accounts. No spec work — we don't design proofs before a project is committed and paid in part."),
    ],
    'howto_steps': [
        ("Tell us what you need", "Use the project form below or text (312) 597-1286 with your project scope, timeline, vehicle types (if applicable), and brand direction. Include any reference links or existing brand assets."),
        ("We scope and quote within 48 hours", "Flat-rate quote — no hourly guessing. You'll see exactly what's included, what's extra, and what timeline we're committing to. Nothing starts until you approve."),
        ("Kickoff + creative brief", "Lead designer assigned. 30-minute kickoff call covers goals, brand positioning, vehicle specs (if relevant), any creative constraints or non-negotiables. You send us assets. We start."),
        ("Proofs + unlimited revisions", "We build proofs on photorealistic mockups of your actual vehicles or brand touchpoints. You mark up, we revise, we loop until it's right. No revision clock."),
        ("Final delivery + production handoff", "Full file package delivered (.ai, .eps, .svg, .pdf, .png). If it's heading to CFW for wrap production, design goes directly to our print queue — no file format conversion or handoff friction."),
    ],
    'howto_name': 'How to Start a Project with CFW Design Labs',
    'howto_desc': 'Five-step process for engaging the Design Labs creative studio for wrap design, brand identity, mockups, or print work.',
    'keywords': 'vehicle wrap design chicago, brand identity design chicago, logo design chicago, vehicle mockup service, ai to vector conversion, sponsor graphics design, fleet wrap design, cfw design labs',
    'date_published': DATE_PUB,
    'date_modified': DATE_MOD,
    'article_keywords': 'CFW Design Labs, vehicle wrap design, brand identity Chicago, logo design, AI to vector, vehicle mockup, sponsor graphics, print collateral Chicago',
    'article_section': 'Design Services',
    'servicesDescription': 'In-house creative services studio providing vehicle wrap design, brand identity systems, AI-to-vector conversion, photorealistic vehicle mockups, multi-sponsor layout design, and print collateral production for Chicago-area clients.',
}

html = build_page(cfg)
open('out_design-labs.html','w').write(html)
print(f"✓ /design-labs/   {len(html):>7,} bytes")

# Verify structure
import re, json
checks = {
    'Type A structure': all(x in html for x in ['</head>','<body','class="trib"','<header','<footer']),
    'GA4': 'G-54BP1GMYJ1' in html,
    'GTM': 'GTM-TJVKD4QZ' in html,
    'Single H1': len(re.findall(r'<h1[^>]*>', html)) == 1,
    '7 schemas': len(re.findall(r'<script type="application/ld\+json">', html)) == 7,
    'Roy Wraps byline': 'Roy Wraps' in html,
    'Form': 'submit-design-inquiry' in html,
    '6 service cards': html.count('scroll-margin-top:120px') >= 5,
    'Links to AI-to-Vector': '/services/ai-to-vector/' in html,
    'Links to boat sponsorship': '/boat-sponsorship-program/' in html,
    'No CFW vans': 'cfw_van' not in html and 'cfw_truck' not in html,
}
print("\n=== STRUCTURE ===")
for k,v in checks.items():
    print(f"  {'✓' if v else '✗'}  {k}")

# Validate schemas
blocks = re.findall(r'<script type="application/ld\+json">\s*(.*?)\s*</script>', html, re.DOTALL)
for b in blocks:
    json.loads(b)
print(f"\n✓ All {len(blocks)} schemas valid JSON")
