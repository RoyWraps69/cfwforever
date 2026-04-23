"""Build the boat sponsorship consortium page — two-sided marketplace."""
import sys
sys.path.insert(0, '.')
from page_factory import build_page

DATE_PUB = "2026-04-23"
DATE_MOD = "2026-04-23"

# Body content — complete two-sided marketplace page
sections = '''
<section style="max-width:900px;margin:40px auto;padding:0 24px">
<p style="color:rgba(255,255,255,.82);line-height:1.75;font-size:1.05rem">Chicago Fleet Wraps runs a boat sponsorship program that connects brands who want moving billboards on Lake Michigan with boat captains who want to get paid to have their vessel wrapped. Brands get 40,000+ daily impressions from June through October at a fraction of billboard cost. Captains offset fuel, slip fees, and maintenance — sometimes cover the full season. We coordinate the match, handle the wrap, manage removal at end of term.</p>
</section>

<section style="max-width:1100px;margin:60px auto;padding:0 24px">
<h2 style="font-family:var(--H,'Bebas Neue',sans-serif);font-size:2.2rem;color:#FFD700;margin-bottom:16px;text-align:center">Two Sides. One Matching Program.</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:24px;margin-top:32px">

<div style="background:linear-gradient(135deg,rgba(255,215,0,.08),rgba(255,215,0,.02));border:1px solid rgba(255,215,0,.3);border-radius:12px;padding:32px">
<div style="font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;color:#FFD700;margin-bottom:12px">For Brands & Agencies</div>
<h3 style="font-family:var(--H);font-size:1.6rem;color:#fff;margin-bottom:12px;line-height:1.2">Advertise on a Boat on Lake Michigan</h3>
<p style="color:rgba(255,255,255,.75);line-height:1.6;margin-bottom:20px">Sponsor a captain's vessel for a weekend, a month, or the full summer season. We handle vessel matching, design, installation, and removal. You handle the creative direction and the budget.</p>
<ul style="list-style:none;padding:0;margin:0 0 24px;color:rgba(255,255,255,.7);line-height:1.8">
<li style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06)">✓ 40,000+ daily impressions peak summer</li>
<li style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06)">✓ Social-worthy photo and video content</li>
<li style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06)">✓ Clean removal at end of term</li>
<li style="padding:6px 0">✓ Event activations for brand launches</li>
</ul>
<a href="#brand-signup" style="display:inline-block;padding:12px 28px;background:#FFD700;color:#000;font-family:var(--H);font-weight:700;font-size:.95rem;letter-spacing:.05em;text-decoration:none;border-radius:4px">Start a Brand Inquiry →</a>
</div>

<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:32px">
<div style="font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;color:#FFD700;margin-bottom:12px">For Boat Captains & Owners</div>
<h3 style="font-family:var(--H);font-size:1.6rem;color:#fff;margin-bottom:12px;line-height:1.2">Get Paid to Wrap Your Boat</h3>
<p style="color:rgba(255,255,255,.75);line-height:1.6;margin-bottom:20px">Enroll your vessel in the consortium. We match you with a sponsor that fits your boat size, home harbor, and summer schedule. You keep full control — approve or pass on every offer.</p>
<ul style="list-style:none;padding:0;margin:0 0 24px;color:rgba(255,255,255,.7);line-height:1.8">
<li style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06)">✓ $1,500–$12,000 per season depending on vessel</li>
<li style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06)">✓ Free wrap install and removal</li>
<li style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06)">✓ You approve every sponsor — no surprise deals</li>
<li style="padding:6px 0">✓ Protects your gelcoat while earning</li>
</ul>
<a href="#captain-signup" style="display:inline-block;padding:12px 28px;background:transparent;color:#FFD700;border:2px solid #FFD700;font-family:var(--H);font-weight:700;font-size:.95rem;letter-spacing:.05em;text-decoration:none;border-radius:4px">Enroll Your Boat →</a>
</div>
</div>
</section>

<section style="max-width:1100px;margin:80px auto;padding:0 24px">
<h2 style="font-family:var(--H);font-size:2rem;color:#FFD700;margin-bottom:24px">Duration Tiers — Match Your Campaign or Your Season</h2>
<div style="overflow-x:auto">
<table style="width:100%;border-collapse:collapse;background:rgba(255,255,255,.02);border-radius:8px;overflow:hidden;color:rgba(255,255,255,.85)">
<thead><tr style="background:rgba(255,215,0,.08)">
<th style="padding:14px 16px;text-align:left;color:#FFD700;font-family:var(--H);letter-spacing:.05em">Term</th>
<th style="padding:14px 16px;text-align:left;color:#FFD700;font-family:var(--H);letter-spacing:.05em">Brand Cost</th>
<th style="padding:14px 16px;text-align:left;color:#FFD700;font-family:var(--H);letter-spacing:.05em">Captain Payout</th>
<th style="padding:14px 16px;text-align:left;color:#FFD700;font-family:var(--H);letter-spacing:.05em">Typical Use Case</th>
</tr></thead>
<tbody>
<tr><td style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.08)">Single-day activation</td><td style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.08);color:#FFD700">$2,500–$5,000</td><td style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.08)">$800–$1,800</td><td style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.08);font-size:.9rem;color:rgba(255,255,255,.65)">Air & Water Show, product launches, photo/video shoots</td></tr>
<tr><td style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.08)">1 week</td><td style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.08);color:#FFD700">$4,500–$9,500</td><td style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.08)">$1,500–$3,200</td><td style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.08);font-size:.9rem;color:rgba(255,255,255,.65)">Festival weeks, conference activations, targeted campaigns</td></tr>
<tr><td style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.08)">1 month</td><td style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.08);color:#FFD700">$8,500–$18,000</td><td style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.08)">$3,000–$6,500</td><td style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.08);font-size:.9rem;color:rgba(255,255,255,.65)">Product launches, seasonal promos, event sponsorships</td></tr>
<tr><td style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.08)"><strong style="color:#FFD700">Full summer season</strong> (May–Oct)</td><td style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.08);color:#FFD700">$22,000–$55,000</td><td style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.08)">$8,000–$22,000</td><td style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.08);font-size:.9rem;color:rgba(255,255,255,.65)"><strong>Most popular.</strong> Full-season brand presence on the lake.</td></tr>
<tr><td style="padding:14px 16px">Multi-year partnership</td><td style="padding:14px 16px;color:#FFD700">Custom</td><td style="padding:14px 16px">Custom</td><td style="padding:14px 16px;font-size:.9rem;color:rgba(255,255,255,.65)">Charter companies, regional beverage brands, local developers</td></tr>
</tbody>
</table>
</div>
<p style="color:rgba(255,255,255,.6);font-size:.85rem;margin-top:16px">Brand costs include wrap design, cast vinyl, installation, captain payout, removal, and CFW coordination fee. Captain payouts shown are net to captain after CFW fees. Payouts scale with vessel length and visibility profile.</p>
</section>

<section style="max-width:1100px;margin:80px auto;padding:0 24px">
<h2 style="font-family:var(--H);font-size:2rem;color:#FFD700;margin-bottom:24px">Boat Size & Visibility Tiers</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px">
<div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:24px">
<div style="font-family:var(--H);font-size:1.3rem;color:#FFD700;margin-bottom:8px">Small — 18'–24'</div>
<div style="font-size:.85rem;color:rgba(255,255,255,.55);margin-bottom:12px">Runabouts, center consoles, small pontoons</div>
<p style="color:rgba(255,255,255,.7);font-size:.88rem;line-height:1.55;margin:0">Fits light-footprint brand activations. Best for week/month campaigns. Payout tier 1.</p>
</div>
<div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:24px">
<div style="font-family:var(--H);font-size:1.3rem;color:#FFD700;margin-bottom:8px">Mid — 25'–32'</div>
<div style="font-size:.85rem;color:rgba(255,255,255,.55);margin-bottom:12px">Cruisers, tritoons, day-sailors</div>
<p style="color:rgba(255,255,255,.7);font-size:.88rem;line-height:1.55;margin:0">Sweet spot for most sponsorships. Visible panel real estate without yacht-level cost. Payout tier 2.</p>
</div>
<div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:24px">
<div style="font-family:var(--H);font-size:1.3rem;color:#FFD700;margin-bottom:8px">Large — 33'–45'</div>
<div style="font-size:.85rem;color:rgba(255,255,255,.55);margin-bottom:12px">Mid-size yachts, charter vessels, sportfish</div>
<p style="color:rgba(255,255,255,.7);font-size:.88rem;line-height:1.55;margin:0">Premium placement. High-impact branding from 300+ feet. Typically full-season deals only. Payout tier 3.</p>
</div>
<div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:24px">
<div style="font-family:var(--H);font-size:1.3rem;color:#FFD700;margin-bottom:8px">Flagship — 46'+</div>
<div style="font-size:.85rem;color:rgba(255,255,255,.55);margin-bottom:12px">Large yachts, hardtop sportfish, commercial charter</div>
<p style="color:rgba(255,255,255,.7);font-size:.88rem;line-height:1.55;margin:0">Largest brand footprint. Limited inventory. Typically reserved for anchor sponsors. Payout tier 4.</p>
</div>
</div>
</section>

<section style="max-width:900px;margin:80px auto;padding:0 24px">
<h2 style="font-family:var(--H);font-size:2rem;color:#FFD700;margin-bottom:20px">How It Works — For Brands</h2>
<div style="display:grid;gap:16px">
<div style="display:flex;gap:16px;padding:20px;background:rgba(255,215,0,.04);border-left:3px solid #FFD700;border-radius:4px">
<div style="font-family:var(--H);font-size:2rem;color:#FFD700;min-width:40px">1</div>
<div><strong style="color:#fff;display:block;margin-bottom:4px">Submit a brief</strong><span style="color:rgba(255,255,255,.75);line-height:1.55">Tell us your campaign window, budget range, target boat size, preferred harbor(s), and creative direction. 5-minute form below.</span></div>
</div>
<div style="display:flex;gap:16px;padding:20px;background:rgba(255,215,0,.04);border-left:3px solid #FFD700;border-radius:4px">
<div style="font-family:var(--H);font-size:2rem;color:#FFD700;min-width:40px">2</div>
<div><strong style="color:#fff;display:block;margin-bottom:4px">We present 3–5 matched vessels</strong><span style="color:rgba(255,255,255,.75);line-height:1.55">Within 72 hours we send you a shortlist of captains who match your criteria — vessel photos, home harbor, captain bio, typical use days per week. You choose.</span></div>
</div>
<div style="display:flex;gap:16px;padding:20px;background:rgba(255,215,0,.04);border-left:3px solid #FFD700;border-radius:4px">
<div style="font-family:var(--H);font-size:2rem;color:#FFD700;min-width:40px">3</div>
<div><strong style="color:#fff;display:block;margin-bottom:4px">Design, install, launch</strong><span style="color:rgba(255,255,255,.75);line-height:1.55">Our design team builds the wrap layout from your brand assets. We coordinate with the captain's marina for haul-out. Wrap goes on in 5–14 days depending on vessel.</span></div>
</div>
<div style="display:flex;gap:16px;padding:20px;background:rgba(255,215,0,.04);border-left:3px solid #FFD700;border-radius:4px">
<div style="font-family:var(--H);font-size:2rem;color:#FFD700;min-width:40px">4</div>
<div><strong style="color:#fff;display:block;margin-bottom:4px">Monthly reporting + removal at term end</strong><span style="color:rgba(255,255,255,.75);line-height:1.55">You receive monthly photo updates from the captain plus estimated impressions. At contract end we remove the wrap cleanly — no residue, no gelcoat damage.</span></div>
</div>
</div>
</section>

<section style="max-width:900px;margin:80px auto;padding:0 24px">
<h2 style="font-family:var(--H);font-size:2rem;color:#FFD700;margin-bottom:20px">How It Works — For Captains</h2>
<div style="display:grid;gap:16px">
<div style="display:flex;gap:16px;padding:20px;background:rgba(255,255,255,.04);border-left:3px solid rgba(255,255,255,.3);border-radius:4px">
<div style="font-family:var(--H);font-size:2rem;color:rgba(255,255,255,.8);min-width:40px">1</div>
<div><strong style="color:#fff;display:block;margin-bottom:4px">Enroll your boat</strong><span style="color:rgba(255,255,255,.75);line-height:1.55">Complete the captain enrollment form below. Photos of your boat, home harbor, vessel length, typical summer usage pattern, any restrictions (no alcohol, no political, etc).</span></div>
</div>
<div style="display:flex;gap:16px;padding:20px;background:rgba(255,255,255,.04);border-left:3px solid rgba(255,255,255,.3);border-radius:4px">
<div style="font-family:var(--H);font-size:2rem;color:rgba(255,255,255,.8);min-width:40px">2</div>
<div><strong style="color:#fff;display:block;margin-bottom:4px">We send matched offers</strong><span style="color:rgba(255,255,255,.75);line-height:1.55">When a brand matches your profile, we send you the full offer — term, payout, brand, creative direction. You have 5 business days to accept or pass.</span></div>
</div>
<div style="display:flex;gap:16px;padding:20px;background:rgba(255,255,255,.04);border-left:3px solid rgba(255,255,255,.3);border-radius:4px">
<div style="font-family:var(--H);font-size:2rem;color:rgba(255,255,255,.8);min-width:40px">3</div>
<div><strong style="color:#fff;display:block;margin-bottom:4px">We wrap, you sail</strong><span style="color:rgba(255,255,255,.75);line-height:1.55">We coordinate haul-out with your marina and wrap the boat at our facility. You continue using the boat normally during the campaign term — just with a sponsor on the hull.</span></div>
</div>
<div style="display:flex;gap:16px;padding:20px;background:rgba(255,255,255,.04);border-left:3px solid rgba(255,255,255,.3);border-radius:4px">
<div style="font-family:var(--H);font-size:2rem;color:rgba(255,255,255,.8);min-width:40px">4</div>
<div><strong style="color:#fff;display:block;margin-bottom:4px">Get paid. Keep sailing.</strong><span style="color:rgba(255,255,255,.75);line-height:1.55">Payout by ACH within 14 days of install for short terms, or in 3 installments across the term for season deals. Wrap removes cleanly at term end. Original gelcoat unaffected.</span></div>
</div>
</div>
</section>

<section id="brand-signup" style="max-width:900px;margin:80px auto;padding:40px 32px;background:linear-gradient(135deg,rgba(255,215,0,.08),rgba(255,215,0,.02));border:1px solid rgba(255,215,0,.3);border-radius:12px">
<h2 style="font-family:var(--H);font-size:2rem;color:#FFD700;margin-bottom:8px">Brand Inquiry — Start Here</h2>
<p style="color:rgba(255,255,255,.75);margin-bottom:24px">Tell us about your campaign. We'll respond within 72 hours with matched vessels.</p>
<form action="/submit-brand-inquiry/" method="post" style="display:grid;gap:16px">
<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
<input type="text" name="brand_name" placeholder="Brand / Company Name" required style="padding:12px 16px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:#fff;font-size:.95rem">
<input type="text" name="contact_name" placeholder="Your Name" required style="padding:12px 16px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:#fff;font-size:.95rem">
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
<input type="email" name="email" placeholder="Work Email" required style="padding:12px 16px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:#fff;font-size:.95rem">
<input type="tel" name="phone" placeholder="Phone (optional)" style="padding:12px 16px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:#fff;font-size:.95rem">
</div>
<select name="term" required style="padding:12px 16px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:#fff;font-size:.95rem">
<option value="">Campaign Term</option>
<option value="day">Single-day activation</option>
<option value="week">1 week</option>
<option value="month">1 month</option>
<option value="season">Full summer season (May-Oct)</option>
<option value="multi">Multi-year / custom</option>
</select>
<select name="budget" required style="padding:12px 16px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:#fff;font-size:.95rem">
<option value="">Budget Range</option>
<option value="under5k">Under $5,000</option>
<option value="5-15k">$5,000–$15,000</option>
<option value="15-30k">$15,000–$30,000</option>
<option value="30-55k">$30,000–$55,000</option>
<option value="55kplus">$55,000+</option>
</select>
<textarea name="campaign_notes" placeholder="Campaign goals, creative direction, target harbor(s), any specific requirements..." rows="4" style="padding:12px 16px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:#fff;font-size:.95rem;font-family:inherit"></textarea>
<button type="submit" style="padding:14px 32px;background:#FFD700;color:#000;font-family:var(--H);font-weight:900;font-size:1rem;letter-spacing:.05em;border:0;border-radius:4px;cursor:pointer">Submit Brand Inquiry →</button>
</form>
</section>

<section id="captain-signup" style="max-width:900px;margin:80px auto;padding:40px 32px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);border-radius:12px">
<h2 style="font-family:var(--H);font-size:2rem;color:#FFD700;margin-bottom:8px">Captain Enrollment</h2>
<p style="color:rgba(255,255,255,.75);margin-bottom:24px">Enroll your vessel in the consortium. No commitment until you accept a specific offer.</p>
<form action="/submit-captain-enrollment/" method="post" style="display:grid;gap:16px">
<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
<input type="text" name="captain_name" placeholder="Your Name" required style="padding:12px 16px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:#fff;font-size:.95rem">
<input type="email" name="email" placeholder="Email" required style="padding:12px 16px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:#fff;font-size:.95rem">
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
<input type="tel" name="phone" placeholder="Phone" required style="padding:12px 16px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:#fff;font-size:.95rem">
<input type="text" name="harbor" placeholder="Home Harbor / Marina" required style="padding:12px 16px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:#fff;font-size:.95rem">
</div>
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px">
<input type="text" name="make_model" placeholder="Make / Model" required style="padding:12px 16px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:#fff;font-size:.95rem">
<input type="text" name="length" placeholder="Length (ft)" required style="padding:12px 16px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:#fff;font-size:.95rem">
<input type="text" name="year" placeholder="Year" style="padding:12px 16px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:#fff;font-size:.95rem">
</div>
<select name="usage" required style="padding:12px 16px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:#fff;font-size:.95rem">
<option value="">Typical Summer Usage</option>
<option value="charter">Charter / commercial use (100+ days)</option>
<option value="heavy">Heavy personal use (50–100 days)</option>
<option value="moderate">Moderate personal use (20–50 days)</option>
<option value="light">Light / weekend use (under 20 days)</option>
</select>
<textarea name="restrictions" placeholder="Any sponsor restrictions? (e.g. no alcohol, no tobacco, no political, industry exclusions)..." rows="3" style="padding:12px 16px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:#fff;font-size:.95rem;font-family:inherit"></textarea>
<button type="submit" style="padding:14px 32px;background:transparent;color:#FFD700;border:2px solid #FFD700;font-family:var(--H);font-weight:900;font-size:1rem;letter-spacing:.05em;border-radius:4px;cursor:pointer">Enroll My Boat →</button>
</form>
<p style="color:rgba(255,255,255,.5);font-size:.8rem;margin-top:16px;text-align:center">No commitment. We'll contact you only when a sponsor matches your profile. You approve or pass on every offer.</p>
</section>
'''

cfg = {
    'slug': 'boat-sponsorship-program',
    'title': 'Boat Sponsorship Program Chicago — Sponsor a Vessel on Lake Michigan | CFW',
    'meta_desc': 'Match brands with boat captains for seasonal sponsorship. $2,500 single-day to $55,000 full-season programs. Captains earn $1,500-$22,000. CFW coordinates wrap + removal. Lake Michigan.',
    'h1': 'Boat Sponsorship Program — Brands + Captains, Matched on Lake Michigan',
    'lead_html': '<p class="lead speakable"><strong>CFW matches brands with boat captains for wrap sponsorships on Lake Michigan.</strong> Brands pay $2,500 for a single-day activation up to $55,000 for a full summer season. Captains earn $1,500 to $22,000 depending on vessel size and term. We handle matching, wrap design, installation, and clean removal at end of term. Captain approves every offer — no surprise deals. Text (312) 597-1286.</p>',
    'hero_img': '/images/patron_boat.webp',
    'hero_alt': 'Boat sponsorship program Chicago — CFW',
    'breadcrumbs': [('Home','/'),('Services','/commercial-vehicle-wraps-chicago/'),('Marine Wraps','/marine-wraps/'),('Boat Sponsorship Program','/boat-sponsorship-program/')],
    'sections_html': sections,
    'faqs': [
        ("How big of a boat does a brand need to sponsor?", "Minimum vessel for the program is 20 feet. Sweet spot is 25–40 feet — enough panel surface for readable branding without yacht-level cost. Flagship-tier sponsorships use 46+ foot yachts but those slots are limited. Brands can specify minimum size in their inquiry."),
        ("How long can a sponsorship wrap stay on a boat?", "Single day, 1 week, 1 month, full summer season (May–October), or multi-year custom. Most brands book full-season. Captains usually prefer full-season too — it's the highest payout and simplest schedule. Short-term activations (day/week) are common for event-specific campaigns like the Air & Water Show."),
        ("Does the wrap need to come off at the end of the term?", "Yes. CFW removes every sponsorship wrap cleanly at contract end. Cast vinyl peels off without residue or gelcoat damage. Removal is included in the brand cost — no extra charge for the captain. If the brand wants to extend, we re-wrap with a refreshed design at a reduced rate."),
        ("How much does a captain earn?", "Payout scales with vessel size and term. Small boat (18–24 feet) full-season: $2,500–$4,500. Mid-size (25–32 feet) full-season: $5,500–$9,000. Large (33–45 feet) full-season: $10,000–$18,000. Flagship (46+) full-season: $18,000–$22,000. Short-term deals payout less total but proportionally higher per day."),
        ("What if I don't like the sponsor offer?", "You pass on it. No commitment. We send captains matched offers — vessel, brand, term, payout, creative direction — and they have 5 business days to accept or pass. Captains can also set restrictions upfront (no alcohol, no political, industry exclusions) so we filter offers before they reach you."),
        ("Will this damage my gelcoat?", "No. Cast vinyl with marine-grade adhesive is specifically engineered for clean removal within its rated lifespan. When we peel the wrap at term end, the gelcoat underneath is often in better condition than exposed hulls because the wrap shielded it from UV oxidation for the entire term. This is standard CFW material — same spec we use on permanent wraps."),
        ("Can I still use my boat normally during the sponsorship?", "Yes. Sponsorship wraps are just wraps — your boat functions identically. Charter captains keep taking customers. Private owners keep running whatever routes they normally run. The only exception is exclusivity clauses in brand contracts (e.g. no competing-brand logos visible during the term). Those are rare and always disclosed upfront."),
        ("Who handles the design?", "CFW's design team handles all creative. Brands provide assets (logo, color codes, optional campaign copy) and creative direction. We build the wrap layout, render proofs for approval, revise until brand is happy, then produce. Captains have no creative obligations — just approve that the final design meets their baseline requirements (no offensive content, meets any restrictions they set)."),
        ("How do I get started as a brand?", "Submit the brand inquiry form on this page — 5 minutes to complete. Within 72 hours we send you 3–5 matched vessels with photos, captain bios, and home harbor info. You pick your vessel. We execute. Entire sponsorship is typically live within 2–4 weeks of initial inquiry for short-term deals, 6–8 weeks for full-season starts."),
        ("How do I enroll my boat as a captain?", "Submit the captain enrollment form on this page. Takes under 10 minutes. We review your submission and add your vessel to the consortium database. No commitment until you accept a specific offer. We notify you when a sponsor matches your profile. Enrollment is free — CFW earns from the brand side."),
    ],
    'howto_steps': [
        ("Define the opportunity", "Brands: clarify your campaign window, budget, target harbor, vessel size preference. Captains: photograph your vessel, identify your home harbor, note typical usage pattern and any sponsor restrictions."),
        ("Submit to CFW", "Use the brand inquiry or captain enrollment form on this page. We respond within 72 hours either way — brands get matched vessel shortlists, captains get added to the consortium roster."),
        ("Review and approve match", "Brands: choose from 3-5 matched vessels and approve creative direction. Captains: receive specific offers, accept or pass within 5 business days of notification."),
        ("Execute the wrap", "CFW coordinates haul-out with the captain's marina, builds the design from brand assets, installs the wrap at our Portage Park facility, and re-splashes the vessel ready for the campaign."),
        ("Run the term, then remove clean", "Monthly photo updates from captain to brand during term. Impression estimates included. At contract end CFW removes the wrap cleanly — no residue, no gelcoat damage, vessel returned to original state."),
    ],
    'howto_name': 'How to Run a Boat Sponsorship Campaign or Enroll Your Vessel',
    'howto_desc': 'Five-step process for brands booking boat wrap campaigns and captains enrolling in the CFW consortium.',
    'keywords': 'boat sponsorship chicago, boat advertising lake michigan, yacht sponsorship program, marine advertising chicago, sponsor a boat, boat wrap consortium, wrap my boat for money',
    'date_published': DATE_PUB,
    'date_modified': DATE_MOD,
    'article_keywords': 'boat sponsorship, boat advertising Chicago, Lake Michigan marketing, yacht sponsorship, marine advertising program, captain enrollment, wrap my boat',
    'article_section': 'Marine Wraps',
    'servicesDescription': 'Two-sided boat sponsorship marketplace connecting advertising brands with boat captains on Lake Michigan for seasonal wrap campaigns with CFW coordinating match, install, and removal.',
}

html = build_page(cfg)
open('out_boat-sponsorship-program.html','w').write(html)
print(f"✓ /boat-sponsorship-program/   {len(html):>7,} bytes")
