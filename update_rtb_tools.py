#!/usr/bin/env python3
"""Update the Rent the Bay page tool sections."""

with open('/home/ubuntu/cfwforever/public/rent-the-bay/index.html', encoding='utf-8') as f:
    html = f.read()

# ── 1. Replace the "What's Included" section ──────────────────────────────────
OLD_INCLUDED = '''<!-- WHAT'S INCLUDED -->
<section class="rtb-included" id="included">
  <div class="rtb-section-label">// What's Included</div>
  <h2>Everything You Need to Wrap</h2>
  <p class="rtb-section-sub">Just bring your vinyl and your vehicle. We've got the rest.</p>
  <div class="rtb-included-grid">
    <div class="rtb-inc-card">
      <div class="rtb-inc-icon">🌡️</div>
      <div class="rtb-inc-title">Climate Controlled</div>
      <p>Full heat and A/C — critical for proper vinyl adhesion in Chicago winters and summers. No more fighting cold vinyl in an unheated garage.</p>
    </div>
    <div class="rtb-inc-card">
      <div class="rtb-inc-icon">🔥</div>
      <div class="rtb-inc-title">Heat Guns &amp; Torches</div>
      <p>Professional-grade heat guns and propane torches for stretching, conforming, and post-heating vinyl on complex curves and recesses.</p>
    </div>
    <div class="rtb-inc-card">
      <div class="rtb-inc-icon">🔪</div>
      <div class="rtb-inc-title">Knifeless Tape</div>
      <p>Knifeless finishing tape for clean, scratch-free panel cuts — no blade on the vehicle surface. The professional standard.</p>
    </div>
    <div class="rtb-inc-card">
      <div class="rtb-inc-icon">🧽</div>
      <div class="rtb-inc-title">Squeegees &amp; Tools</div>
      <p>Full squeegee kit — hard, soft, and felt-edge — plus application fluid, alcohol prep wipes, and lint-free rags.</p>
    </div>
    <div class="rtb-inc-card">
      <div class="rtb-inc-icon">📐</div>
      <div class="rtb-inc-title">Application Tables</div>
      <p>Large flat application tables for laying out and pre-cutting panels before applying to the vehicle.</p>
    </div>
    <div class="rtb-inc-card">
      <div class="rtb-inc-icon">🚛</div>
      <div class="rtb-inc-title">Up to 20-Foot Vehicles</div>
      <p>Bay accommodates vehicles up to 20 feet — full-size box trucks, Sprinter vans, transit vans, pickup trucks, SUVs, and passenger cars.</p>
    </div>
    <div class="rtb-inc-card">
      <div class="rtb-inc-icon">💡</div>
      <div class="rtb-inc-title">Professional Lighting</div>
      <p>High-output LED lighting at multiple angles — essential for catching bubbles, lifting edges, and quality-checking your work.</p>
    </div>
    <div class="rtb-inc-card">
      <div class="rtb-inc-icon">🛠️</div>
      <div class="rtb-inc-title">Install Assistance Available</div>
      <p>Not confident on a section? Our team can assist or take over. Just bring your prints — we can handle the full install if needed.</p>
    </div>
  </div>
</section>'''

NEW_INCLUDED = '''<!-- WHAT'S INCLUDED -->
<section class="rtb-included" id="included">
  <div class="rtb-section-label">// What's Included With Every Bay Rental</div>
  <h2>Bay Essentials — Always Included</h2>
  <p class="rtb-section-sub">Every bay rental comes with the space, the environment, and the consumables. <strong>Hand tools are not included</strong> — bring your own or rent/buy our fully loaded wrap pouch below.</p>
  <div class="rtb-included-grid">
    <div class="rtb-inc-card">
      <div class="rtb-inc-icon">🌡️</div>
      <div class="rtb-inc-title">Heat &amp; A/C</div>
      <p>Full climate control — critical for proper vinyl adhesion in Chicago winters and summers. No more fighting cold or sticky vinyl.</p>
    </div>
    <div class="rtb-inc-card">
      <div class="rtb-inc-icon">🔥</div>
      <div class="rtb-inc-title">Heat Gun &amp; Torch</div>
      <p>Professional-grade heat gun and propane torch for stretching, conforming, and post-heating vinyl on complex curves and recesses.</p>
    </div>
    <div class="rtb-inc-card">
      <div class="rtb-inc-icon">✂️</div>
      <div class="rtb-inc-title">Sensor Cutters</div>
      <p>Sensor-safe cutters for clean panel cuts without risking damage to vehicle sensors, antennas, or painted surfaces.</p>
    </div>
    <div class="rtb-inc-card">
      <div class="rtb-inc-icon">🔪</div>
      <div class="rtb-inc-title">Knifeless Tape</div>
      <p>3M knifeless finishing tape for clean, scratch-free seam cuts — no blade on the vehicle surface. The professional standard.</p>
    </div>
    <div class="rtb-inc-card">
      <div class="rtb-inc-icon">🧴</div>
      <div class="rtb-inc-title">Alcohol &amp; Prep Supplies</div>
      <p>Isopropyl alcohol, spray bottles, and lint-free rags for proper surface prep — the most critical step in any wrap install.</p>
    </div>
    <div class="rtb-inc-card">
      <div class="rtb-inc-icon">🔧</div>
      <div class="rtb-inc-title">Assembly / Disassembly Tools</div>
      <p>Basic trim removal tools and 3M 2" tape for panel disassembly and reassembly during the wrap process.</p>
    </div>
    <div class="rtb-inc-card">
      <div class="rtb-inc-icon">💡</div>
      <div class="rtb-inc-title">Professional Lighting</div>
      <p>High-output LED lighting at multiple angles — essential for catching bubbles, lifting edges, and quality-checking your work.</p>
    </div>
    <div class="rtb-inc-card">
      <div class="rtb-inc-icon">🚛</div>
      <div class="rtb-inc-title">Up to 20-Foot Vehicles</div>
      <p>Bay accommodates vehicles up to 20 feet — full-size box trucks, Sprinter vans, cargo vans, pickup trucks, SUVs, and passenger cars.</p>
    </div>
  </div>

  <!-- WRAP POUCH SECTION -->
  <div class="rtb-pouch-section" id="pouch">
    <div class="rtb-section-label" style="margin-top:48px">// Hand Tools — Bring Your Own or Rent / Buy</div>
    <h2 style="margin-bottom:10px">The Fully Loaded Wrap Pouch</h2>
    <p class="rtb-section-sub">Hand tools are <strong>not</strong> included with the bay. You can bring your own kit, or rent or purchase our fully loaded professional wrap pouch. Everything a working installer needs, packed and ready.</p>

    <!-- Pouch Contents -->
    <div class="rtb-pouch-contents">
      <div class="rtb-pouch-label">What's in the Pouch</div>
      <div class="rtb-pouch-tools">
        <div class="rtb-tool-item"><span class="rtb-tool-icon">🟨</span><span>4" Felt Squeegee</span></div>
        <div class="rtb-tool-item"><span class="rtb-tool-icon">🟧</span><span>6" Felt Squeegee</span></div>
        <div class="rtb-tool-item"><span class="rtb-tool-icon">🔷</span><span>4" Hard-Side Squeegee</span></div>
        <div class="rtb-tool-item"><span class="rtb-tool-icon">🔶</span><span>6" Hard-Side Squeegee</span></div>
        <div class="rtb-tool-item"><span class="rtb-tool-icon">🔪</span><span>2 Wrap Knives</span></div>
        <div class="rtb-tool-item"><span class="rtb-tool-icon">🧤</span><span>XL Wrap Gloves</span></div>
        <div class="rtb-tool-item"><span class="rtb-tool-icon">🔩</span><span>3 Unique Tuck Tools</span></div>
        <div class="rtb-tool-item"><span class="rtb-tool-icon">🪛</span><span>Rivet Brush</span></div>
        <div class="rtb-tool-item"><span class="rtb-tool-icon">💨</span><span>Air Poker</span></div>
      </div>
    </div>

    <!-- Pouch Pricing Cards -->
    <div class="rtb-pouch-cards">
      <div class="rtb-pouch-card">
        <div class="rtb-pouch-card-eyebrow">Daily Rental</div>
        <div class="rtb-pouch-card-price">$75<small>/day</small></div>
        <p>Rent the fully loaded pouch for your session. Returned at end of rental. Venmo <strong>@RoyWraps</strong> with your booking.</p>
        <a class="rtb-book-btn" href="https://venmo.com/u/RoyWraps?txn=pay&amount=75&note=CFW+Wrap+Pouch+Rental" rel="noopener" target="_blank">Rent via Venmo @RoyWraps</a>
      </div>
      <div class="rtb-pouch-card rtb-pouch-card-buy">
        <div class="rtb-pouch-card-badge">OWN IT</div>
        <div class="rtb-pouch-card-eyebrow">Buy Outright</div>
        <div class="rtb-pouch-card-price">$185</div>
        <p>Purchase the fully loaded pouch and keep it. Yours forever — bring it every time you book the bay. Pays for itself in 2.5 rentals.</p>
        <a class="rtb-book-btn rtb-book-btn-gold" href="https://venmo.com/u/RoyWraps?txn=pay&amount=185&note=CFW+Wrap+Pouch+Purchase" rel="noopener" target="_blank">Buy via Venmo @RoyWraps</a>
      </div>
      <div class="rtb-pouch-card rtb-pouch-card-own">
        <div class="rtb-pouch-card-eyebrow">Bring Your Own</div>
        <div class="rtb-pouch-card-price">$0</div>
        <p>Already have your own tools? Bring them. No charge. The bay, consumables, heat gun, torch, and sensor cutters are always included.</p>
        <div style="padding:12px 20px 20px;font-size:.8rem;color:rgba(255,255,255,.4)">No action needed — just show up with your kit.</div>
      </div>
    </div>

    <div class="rtb-pouch-math">
      <strong>💡 The math:</strong> Rent the pouch 3× = $225 spent. Buy it outright for $185 and it pays for itself on the 3rd use. If you're coming back, buy it.
    </div>
  </div>
</section>'''

if OLD_INCLUDED in html:
    html = html.replace(OLD_INCLUDED, NEW_INCLUDED, 1)
    print('Replaced included section: OK')
else:
    print('ERROR: Could not find old included section to replace')
    # Try a partial match
    marker = "<!-- WHAT'S INCLUDED -->"
    if marker in html:
        print(f'  Marker found at index {html.index(marker)}')
    else:
        print('  Marker not found either')

# ── 2. Add pouch CSS before the closing </style> of the page-specific styles ──
POUCH_CSS = '''
/* Wrap Pouch Section */
.rtb-pouch-section{margin-top:8px}
.rtb-pouch-contents{background:#111;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:28px 32px;margin-bottom:28px}
.rtb-pouch-label{font-family:var(--H);font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);margin-bottom:18px}
.rtb-pouch-tools{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.rtb-tool-item{display:flex;align-items:center;gap:10px;font-size:.88rem;color:rgba(255,255,255,.72);background:#1a1a1a;border:1px solid rgba(255,255,255,.06);border-radius:8px;padding:10px 14px}
.rtb-tool-icon{font-size:1.1rem;flex-shrink:0}
.rtb-pouch-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:20px}
.rtb-pouch-card{background:#161616;border:1px solid rgba(255,255,255,.08);border-radius:14px;overflow:hidden;position:relative}
.rtb-pouch-card-buy{border-color:rgba(245,197,24,.35);box-shadow:0 0 30px rgba(245,197,24,.06)}
.rtb-pouch-card-own{border-color:rgba(255,255,255,.05)}
.rtb-pouch-card-badge{position:absolute;top:14px;right:14px;background:var(--gold);color:#0A0A0A;font-family:var(--H);font-size:.6rem;letter-spacing:.15em;padding:3px 9px;border-radius:4px}
.rtb-pouch-card-eyebrow{font-family:var(--H);font-size:.68rem;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.4);padding:20px 20px 4px}
.rtb-pouch-card-price{font-family:var(--H);font-size:2.6rem;color:var(--gold);padding:0 20px 8px;line-height:1}
.rtb-pouch-card-price small{font-size:1rem;color:rgba(255,255,255,.35)}
.rtb-pouch-card p{font-size:.84rem;color:rgba(255,255,255,.6);line-height:1.55;padding:0 20px 12px}
.rtb-pouch-math{background:rgba(245,197,24,.06);border:1px solid rgba(245,197,24,.18);border-radius:10px;padding:16px 20px;font-size:.88rem;color:rgba(255,255,255,.65);line-height:1.6}
.rtb-pouch-math strong{color:var(--gold)}
@media(max-width:900px){
  .rtb-pouch-tools{grid-template-columns:1fr 1fr}
  .rtb-pouch-cards{grid-template-columns:1fr}
}
@media(max-width:600px){
  .rtb-pouch-tools{grid-template-columns:1fr}
}
'''

# Insert before the closing </style> tag of the page-specific styles block
# The page has a <style> block near the bottom — find the last </style> before </body>
last_style_close = html.rfind('</style>')
if last_style_close != -1:
    html = html[:last_style_close] + POUCH_CSS + '\n</style>' + html[last_style_close+8:]
    print('Added pouch CSS: OK')
else:
    print('ERROR: No </style> tag found')

# ── 3. Update the FAQ to add a pouch question ─────────────────────────────────
OLD_FAQ_ITEM = '''    <div class="rtb-faq-item">
      <h3>Can I bring my own vinyl and materials?</h3>
      <p>Absolutely — bring your own vinyl, tools, and materials. The bay rental includes the space and the listed tools. You are not required to purchase vinyl from us.</p>
    </div>'''

NEW_FAQ_ITEM = '''    <div class="rtb-faq-item">
      <h3>Can I bring my own tools?</h3>
      <p>Absolutely. If you have your own wrap tool kit, bring it — no charge. The bay includes heat gun, torch, sensor cutters, knifeless tape, alcohol, rags, spray bottles, 3M tape, and assembly tools. Hand squeegees, knives, tuck tools, and gloves are not included — bring your own or rent/buy our wrap pouch.</p>
    </div>
    <div class="rtb-faq-item">
      <h3>What's in the wrap pouch rental?</h3>
      <p>The fully loaded pouch includes: 4" and 6" felt squeegees, 4" and 6" hard-side squeegees, 2 wrap knives, XL wrap gloves, 3 unique tuck tools, a rivet brush, and an air poker. Rent it for $75/day or buy it outright for $185 via Venmo @RoyWraps.</p>
    </div>'''

if OLD_FAQ_ITEM in html:
    html = html.replace(OLD_FAQ_ITEM, NEW_FAQ_ITEM, 1)
    print('Updated FAQ: OK')
else:
    print('WARNING: FAQ item not found — skipping FAQ update')

with open('/home/ubuntu/cfwforever/public/rent-the-bay/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print(f'\nFinal page size: {len(html)} chars')
print('Done!')
