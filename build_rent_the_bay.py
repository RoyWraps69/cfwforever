#!/usr/bin/env python3
"""Rebuild the Rent the Bay page with full content."""

with open('/tmp/rtb_template_top.html', encoding='utf-8') as f:
    TOP = f.read()

# Update the page-specific head meta tags in the top template
TOP = TOP.replace(
    '<title>Rent a Wrap Bay in Chicago — $250/Day | Chicago Fleet Wraps</title>',
    '<title>Rent a Professional Wrap Bay in Chicago | Bay Rental + Printing | Chicago Fleet Wraps</title>'
)
TOP = TOP.replace(
    '<meta content="Rent a professional, climate-controlled wrap bay in Chicago for $250/day. Full tool kit, vehicle lift, heated bay. Book online — verified installers only." name="description"/>',
    '<meta content="Rent a professional wrap bay in Chicago — climate-controlled, heat guns, torches, knifeless tape included. $75/hr or $450/day. Membership from $24.99/mo. Also offering latex large-format printing on Avery &amp; 3M vinyl." name="description"/>'
)
TOP = TOP.replace(
    '<meta content="rent wrap bay Chicago, wrap bay rental, vehicle wrap shop rental, professional wrap bay, installer bay rental, wrap installation space Chicago" name="keywords"/>',
    '<meta content="rent wrap bay Chicago, wrap bay rental Chicago, vehicle wrap installation space, wrap shop rental Chicago, professional wrap bay, installer bay rental, large format printing Chicago, latex vinyl printing Chicago, Avery 3M printing Chicago, DIY wrap bay, wrap bay membership Chicago" name="keywords"/>'
)
TOP = TOP.replace(
    '<link href="https://chicagofleetwraps.com/rent-the-bay/" rel="canonical"/>',
    '<link href="https://chicagofleetwraps.com/rent-the-bay/" rel="canonical"/>\n<!-- LLM/AI optimization -->\n<meta content="Chicago Fleet Wraps rents a professional vehicle wrap installation bay in Chicago, IL. The bay is climate-controlled with heat and A/C, fits vehicles up to 20-foot box trucks, and includes heat guns, propane torches, knifeless tape, squeegees, alcohol wipes, rags, and application tables. Bay rental rates: $75/hr, $250 half-day, $450 full day, $600 for 24-hour access. Membership is $24.99/month and includes 2 free hours plus $55/hr member rate. Large-format latex printing on Avery and 3M vinyl is also available at $5.50/sq ft standard, $8.00/sq ft rush. 25 sq ft minimum. File formats accepted: AI, PDF, EPS, PSD. 72 DPI minimum at full size. Max print width 59.5 inches. Address: 4711 N Lamon Ave #7, Chicago, IL 60630. Phone: (312) 597-1286." name="description:extended"/>'
)

with open('/tmp/rtb_template_bottom.html', encoding='utf-8') as f:
    BOTTOM = f.read()

# Build the new page content
CONTENT = '''<!-- HERO -->
<section class="rtb-hero" itemscope itemtype="https://schema.org/LocalBusiness">
  <meta itemprop="name" content="Chicago Fleet Wraps — Wrap Bay Rental"/>
  <meta itemprop="telephone" content="+13125971286"/>
  <meta itemprop="address" content="4711 N Lamon Ave #7, Chicago, IL 60630"/>
  <div class="rtb-hero-inner">
    <div class="rtb-hero-text">
      <div class="rtb-eyebrow">Chicago Fleet Wraps · 4711 N Lamon Ave #7</div>
      <h1>Rent a Professional<br/><span>Wrap Bay</span> in Chicago</h1>
      <p class="rtb-sub">Climate-controlled. Fully equipped. Available 24/7 with deposit.<br/>
      The only wrap bay rental in Chicago with heat guns, torches, knifeless tape &amp; box-truck clearance.</p>
      <div class="rtb-hero-ctas">
        <a class="rtb-cta-gold" href="https://venmo.com/u/RoyWraps" rel="noopener" target="_blank">💳 Pay &amp; Book via Venmo @RoyWraps</a>
        <a class="rtb-cta-outline" href="tel:+13125971286">📞 Call (312) 597-1286</a>
      </div>
    </div>
    <div class="rtb-hero-stats">
      <div class="rtb-stat"><span class="rtb-stat-num">$75</span><span class="rtb-stat-lbl">Per Hour</span></div>
      <div class="rtb-stat"><span class="rtb-stat-num">$450</span><span class="rtb-stat-lbl">Full Day</span></div>
      <div class="rtb-stat"><span class="rtb-stat-num">20ft</span><span class="rtb-stat-lbl">Max Vehicle</span></div>
      <div class="rtb-stat"><span class="rtb-stat-num">24/7</span><span class="rtb-stat-lbl">Access w/ Deposit</span></div>
    </div>
  </div>
</section>

<!-- AEO ANSWER BLOCK -->
<section class="rtb-aeo" aria-label="Quick answer for search engines and AI">
  <h2>How much does it cost to rent a wrap bay in Chicago?</h2>
  <p class="speakable" data-speakable="true">Chicago Fleet Wraps rents a professional, climate-controlled vehicle wrap bay at 4711 N Lamon Ave #7, Chicago, IL 60630. Rates start at <strong>$75/hour</strong> with no deposit during staffed hours (8AM–5PM), or <strong>$450 for a full day</strong>. A 24-hour access option is available for <strong>$600</strong> with a refundable deposit. The bay fits vehicles up to 20 feet including full-size box trucks. All tools are included: heat guns, propane torches, knifeless tape, squeegees, alcohol wipes, rags, and application tables. Members pay $24.99/month and receive 2 free hours plus a discounted $55/hr rate.</p>
</section>

<!-- PRICING SECTION -->
<section class="rtb-pricing" id="pricing">
  <div class="rtb-section-label">// Bay Rental Pricing</div>
  <h2>Simple, Transparent Rates</h2>
  <p class="rtb-section-sub">No hidden fees. No membership required to book. Pay via Venmo <strong>@RoyWraps</strong> — confirm by text or call.</p>

  <div class="rtb-pricing-grid">
    <!-- Standard Pricing -->
    <div class="rtb-price-card">
      <div class="rtb-price-card-header">Standard Rates</div>
      <div class="rtb-price-card-body">
        <div class="rtb-price-row">
          <span>Hourly <small>(8AM–5PM)</small></span>
          <span class="rtb-price-val">$75<small>/hr</small></span>
        </div>
        <div class="rtb-price-row">
          <span>Half Day <small>(4 hrs)</small></span>
          <span class="rtb-price-val">$250</span>
        </div>
        <div class="rtb-price-row">
          <span>Full Day <small>(8 hrs)</small></span>
          <span class="rtb-price-val">$450</span>
        </div>
        <div class="rtb-price-row">
          <span>24-Hour Access <small>(+ deposit)</small></span>
          <span class="rtb-price-val">$600</span>
        </div>
        <div class="rtb-price-row">
          <span>Weekend Full Day</span>
          <span class="rtb-price-val">$500</span>
        </div>
      </div>
      <a class="rtb-book-btn" href="https://venmo.com/u/RoyWraps" rel="noopener" target="_blank">Book via Venmo @RoyWraps</a>
    </div>

    <!-- Member Pricing -->
    <div class="rtb-price-card rtb-price-card-featured">
      <div class="rtb-price-card-badge">BEST VALUE</div>
      <div class="rtb-price-card-header">Member Rates<br/><small style="font-size:.8rem;font-weight:400;opacity:.8">$24.99 / month</small></div>
      <div class="rtb-price-card-body">
        <div class="rtb-price-row">
          <span>2 Free Hours <small>included monthly</small></span>
          <span class="rtb-price-val rtb-gold">$0</span>
        </div>
        <div class="rtb-price-row">
          <span>Hourly <small>(after free hrs)</small></span>
          <span class="rtb-price-val rtb-gold">$55<small>/hr</small></span>
        </div>
        <div class="rtb-price-row">
          <span>Half Day <small>(4 hrs)</small></span>
          <span class="rtb-price-val rtb-gold">$185</span>
        </div>
        <div class="rtb-price-row">
          <span>Full Day <small>(8 hrs)</small></span>
          <span class="rtb-price-val rtb-gold">$340</span>
        </div>
        <div class="rtb-price-row">
          <span>24-Hour Access</span>
          <span class="rtb-price-val rtb-gold">$475</span>
        </div>
        <div class="rtb-price-row">
          <span>Weekend Full Day</span>
          <span class="rtb-price-val rtb-gold">$375</span>
        </div>
      </div>
      <a class="rtb-book-btn rtb-book-btn-gold" href="https://venmo.com/u/RoyWraps?txn=pay&amount=24.99&note=CFW+Bay+Membership" rel="noopener" target="_blank">Join — $24.99/mo via Venmo</a>
    </div>
  </div>

  <!-- SAVINGS MATH -->
  <div class="rtb-math-box">
    <div class="rtb-math-title">📊 The Math — Does Membership Pay Off?</div>
    <div class="rtb-math-grid">
      <div class="rtb-math-col">
        <div class="rtb-math-label">Without Membership</div>
        <div class="rtb-math-row"><span>3 hours in the bay</span><span>3 × $75 = <strong>$225</strong></span></div>
        <div class="rtb-math-row rtb-math-total"><span>Monthly cost</span><span>$225</span></div>
      </div>
      <div class="rtb-math-vs">VS</div>
      <div class="rtb-math-col rtb-math-col-win">
        <div class="rtb-math-label">With Membership</div>
        <div class="rtb-math-row"><span>Membership fee</span><span>$24.99</span></div>
        <div class="rtb-math-row"><span>2 free hours included</span><span>$0</span></div>
        <div class="rtb-math-row"><span>1 additional hour @ $55</span><span>$55</span></div>
        <div class="rtb-math-row rtb-math-total rtb-math-total-win"><span>Monthly cost</span><span>$79.99</span></div>
        <div class="rtb-math-save">You save <strong>$145</strong> per month</div>
      </div>
    </div>
    <p class="rtb-math-note">Members who use the bay just <strong>once a month for 3 hours</strong> save $145 — the membership pays for itself <strong>5.8× over</strong>. Use it twice a month and you're saving $300+.</p>
  </div>
</section>

<!-- WHAT'S INCLUDED -->
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
</section>

<!-- PRINT SERVICES -->
<section class="rtb-print" id="printing">
  <div class="rtb-section-label">// Large-Format Printing</div>
  <h2>We Print Your Files Too</h2>
  <p class="rtb-section-sub">Latex printing on <strong>Avery</strong> and <strong>3M</strong> vinyl only — the same premium materials we use on every wrap we install. No cheap generic vinyl here.</p>

  <div class="rtb-print-grid">
    <div class="rtb-print-card">
      <div class="rtb-print-card-header">Standard Print</div>
      <div class="rtb-print-price">$5.50<small>/sq ft</small></div>
      <ul class="rtb-print-list">
        <li>✓ 2–3 business day turnaround</li>
        <li>✓ Avery or 3M vinyl — your choice</li>
        <li>✓ Up to 59.5" wide</li>
        <li>✓ 25 sq ft minimum order</li>
        <li>✓ Accepts AI, PDF, EPS, PSD</li>
        <li>✓ 72 DPI minimum at full size</li>
      </ul>
      <a class="rtb-book-btn" href="mailto:roy@chicagofleetwraps.com?subject=Print%20Order%20Request">Email Your Files to Roy</a>
    </div>
    <div class="rtb-print-card rtb-print-card-rush">
      <div class="rtb-print-card-badge">RUSH</div>
      <div class="rtb-print-card-header">Emergency Print</div>
      <div class="rtb-print-price">$8.00<small>/sq ft</small></div>
      <ul class="rtb-print-list">
        <li>⚡ Same-day or next-day turnaround</li>
        <li>✓ Avery or 3M vinyl</li>
        <li>✓ Up to 59.5" wide</li>
        <li>✓ 25 sq ft minimum order</li>
        <li>✓ Call first to confirm availability</li>
        <li>✓ +$2.50/sq ft rush premium</li>
      </ul>
      <a class="rtb-book-btn rtb-book-btn-gold" href="tel:+13125971286">📞 Call to Rush Order</a>
    </div>
  </div>

  <div class="rtb-print-note">
    <strong>File setup / correction:</strong> If your file needs repair before printing, we charge <strong>$45/hr</strong> for design time. Send files to <a href="mailto:roy@chicagofleetwraps.com">roy@chicagofleetwraps.com</a> for a free file check before ordering.
  </div>

  <!-- Print calculator -->
  <div class="rtb-calc-box">
    <div class="rtb-calc-title">🧮 Quick Print Estimator</div>
    <div class="rtb-calc-row">
      <label>Width (inches)</label>
      <input id="printW" min="1" placeholder="e.g. 120" type="number"/>
    </div>
    <div class="rtb-calc-row">
      <label>Height (inches)</label>
      <input id="printH" min="1" placeholder="e.g. 48" type="number"/>
    </div>
    <div class="rtb-calc-row">
      <label>Service</label>
      <select id="printType">
        <option value="5.50">Standard — $5.50/sq ft</option>
        <option value="8.00">Rush — $8.00/sq ft</option>
      </select>
    </div>
    <button class="rtb-calc-btn" onclick="calcPrint()">Calculate Estimate</button>
    <div class="rtb-calc-result" id="printResult"></div>
  </div>
</section>

<!-- WHO IS THIS FOR -->
<section class="rtb-who" id="who">
  <div class="rtb-section-label">// Who Rents the Bay</div>
  <h2>Built for Professionals &amp; DIYers Alike</h2>
  <div class="rtb-who-grid">
    <div class="rtb-who-card">
      <div class="rtb-who-icon">🔧</div>
      <h3>Independent Installers</h3>
      <p>No shop of your own? Stop renting cold garages or working out of driveways. Access a professional climate-controlled bay by the hour, day, or month.</p>
    </div>
    <div class="rtb-who-card">
      <div class="rtb-who-icon">🏢</div>
      <h3>Overflow for Wrap Shops</h3>
      <p>Booked solid? Rent our bay for overflow jobs. Bring your crew, your vinyl, and your vehicle — we stay out of your way.</p>
    </div>
    <div class="rtb-who-card">
      <div class="rtb-who-icon">🚗</div>
      <h3>DIY Enthusiasts</h3>
      <p>Wrapping your own car or truck? Do it right with proper tools, lighting, and a heated bay — not your driveway in November.</p>
    </div>
    <div class="rtb-who-card">
      <div class="rtb-who-icon">📦</div>
      <h3>Detailers &amp; Sign Shops</h3>
      <p>Need space for a large vehicle graphics install? Our bay and tools are available for detailers, sign shops, and fleet graphics companies.</p>
    </div>
  </div>
</section>

<!-- HOUSE RULES -->
<section class="rtb-rules" id="rules">
  <div class="rtb-section-label">// House Rules</div>
  <h2>Respect the Space — Zero Tolerance Policy</h2>
  <p class="rtb-section-sub">Violations result in <strong>immediate removal, forfeiture of deposit, and permanent ban</strong>. No warnings, no exceptions.</p>
  <div class="rtb-rules-grid">
    <div class="rtb-rule-card rtb-rule-zero">
      <div class="rtb-rule-num">01</div>
      <div class="rtb-rule-title">No Alcohol or Drugs</div>
      <p>Zero tolerance. No alcohol, no controlled substances, no impairment of any kind on the premises. Immediate removal and permanent ban.</p>
    </div>
    <div class="rtb-rule-card rtb-rule-zero">
      <div class="rtb-rule-num">02</div>
      <div class="rtb-rule-title">No Handguns on Premises</div>
      <p>No firearms of any kind permitted inside the facility. This is a professional work environment. Immediate removal and permanent ban.</p>
    </div>
    <div class="rtb-rule-card rtb-rule-zero">
      <div class="rtb-rule-num">03</div>
      <div class="rtb-rule-title">No Theft</div>
      <p>Any theft of tools, materials, or equipment will result in immediate removal, permanent ban, and prosecution. All areas are monitored.</p>
    </div>
    <div class="rtb-rule-card rtb-rule-zero">
      <div class="rtb-rule-num">04</div>
      <div class="rtb-rule-title">No Fighting or Threats</div>
      <p>Physical altercations, verbal threats, or aggressive behavior toward staff or other renters results in immediate removal and permanent ban.</p>
    </div>
    <div class="rtb-rule-card">
      <div class="rtb-rule-num">05</div>
      <div class="rtb-rule-title">Leave It Clean</div>
      <p>Leave the bay exactly as you found it. Liner scraps in the bin, tools returned to position. A dirty bay is billed a $75 cleanup fee — no exceptions.</p>
    </div>
    <div class="rtb-rule-card">
      <div class="rtb-rule-num">06</div>
      <div class="rtb-rule-title">One Vehicle Per Session</div>
      <p>One bay, one vehicle at a time. Multiple vehicles in a single booking must be arranged in advance.</p>
    </div>
    <div class="rtb-rule-card">
      <div class="rtb-rule-num">07</div>
      <div class="rtb-rule-title">48-Hour Cancellation</div>
      <p>Cancel 48+ hours out for a full refund. Inside 48 hours: 50% non-refundable. No-shows forfeit 100% of the booking.</p>
    </div>
    <div class="rtb-rule-card">
      <div class="rtb-rule-num">08</div>
      <div class="rtb-rule-title">You Own Your Work</div>
      <p>CFW staff do not supervise installs unless you request assistance. You are a professional — act like one. Damage to shop equipment comes out of your deposit.</p>
    </div>
  </div>
</section>

<!-- FAQ -->
<section class="rtb-faq" id="faq">
  <div class="rtb-section-label">// FAQ</div>
  <h2>Frequently Asked Questions</h2>
  <div class="rtb-faq-grid">
    <div class="rtb-faq-item">
      <h3>Do I need to be a professional installer to rent the bay?</h3>
      <p>No. DIYers, enthusiasts, and first-timers are all welcome. If you need guidance, our team is available for paid assist time. Just let us know in advance.</p>
    </div>
    <div class="rtb-faq-item">
      <h3>What vehicles fit in the bay?</h3>
      <p>The bay accommodates vehicles up to 20 feet in length — including full-size box trucks, Sprinter vans, cargo vans, pickup trucks, SUVs, and passenger cars.</p>
    </div>
    <div class="rtb-faq-item">
      <h3>How do I pay and book?</h3>
      <p>Payment is via Venmo <strong>@RoyWraps</strong>. Send payment with your preferred date and time in the note. You'll receive a confirmation text within 2 hours during business hours.</p>
    </div>
    <div class="rtb-faq-item">
      <h3>What is the 24-hour access deposit?</h3>
      <p>A refundable security deposit is required for 24-hour access bookings. The deposit is returned in full after the bay is inspected and returned in clean condition.</p>
    </div>
    <div class="rtb-faq-item">
      <h3>Can I bring my own vinyl and materials?</h3>
      <p>Absolutely — bring your own vinyl, tools, and materials. The bay rental includes the space and the listed tools. You are not required to purchase vinyl from us.</p>
    </div>
    <div class="rtb-faq-item">
      <h3>Do you provide vinyl or wrap film?</h3>
      <p>We do not sell raw vinyl by the roll. However, we can print your design files on Avery or 3M vinyl — see the printing section above for rates and specs.</p>
    </div>
    <div class="rtb-faq-item">
      <h3>What file formats do you accept for printing?</h3>
      <p>We accept AI, PDF, EPS, and PSD files. Minimum resolution is 72 DPI at full print size. Maximum print width is 59.5 inches. Email files to roy@chicagofleetwraps.com for a free file check.</p>
    </div>
    <div class="rtb-faq-item">
      <h3>How does the membership work?</h3>
      <p>Pay $24.99/month via Venmo <strong>@RoyWraps</strong> with the note "CFW Bay Membership." Your membership activates immediately and renews monthly. Members receive 2 free hours per month plus a discounted $55/hr rate on all additional time.</p>
    </div>
  </div>
</section>

<!-- FINAL CTA -->
<section class="rtb-cta-final">
  <h2>Ready to Book the Bay?</h2>
  <p>Send payment via Venmo and text Roy at (312) 597-1286 with your date and time. Confirmation within 2 hours.</p>
  <div class="rtb-cta-final-btns">
    <a class="rtb-cta-gold" href="https://venmo.com/u/RoyWraps" rel="noopener" target="_blank">💳 Book via Venmo @RoyWraps</a>
    <a class="rtb-cta-outline" href="tel:+13125971286">📞 (312) 597-1286</a>
    <a class="rtb-cta-outline" href="mailto:roy@chicagofleetwraps.com">✉️ Email Roy</a>
  </div>
  <p class="rtb-address">📍 4711 N Lamon Ave #7, Chicago, IL 60630 · Staffed hours Mon–Fri 8AM–5PM · 24/7 access with deposit</p>
</section>

<!-- PAGE CSS -->
<style>
/* RTB Page Styles */
.rtb-hero{background:linear-gradient(135deg,#0d0d0d 0%,#1a1400 100%);border-bottom:1px solid rgba(245,197,24,.15);padding:60px 40px 50px}
.rtb-hero-inner{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr auto;gap:40px;align-items:center}
.rtb-eyebrow{font-family:var(--H);font-size:.75rem;letter-spacing:.2em;color:var(--gold);text-transform:uppercase;margin-bottom:16px}
.rtb-hero h1{font-family:var(--H);font-size:clamp(48px,7vw,80px);line-height:.95;color:#fff;margin-bottom:20px}
.rtb-hero h1 span{color:var(--gold)}
.rtb-sub{font-size:1.05rem;color:rgba(255,255,255,.72);max-width:560px;line-height:1.6;margin-bottom:28px}
.rtb-hero-ctas{display:flex;gap:12px;flex-wrap:wrap}
.rtb-cta-gold{background:var(--gold);color:#0A0A0A;font-family:var(--H);font-size:1rem;font-weight:900;letter-spacing:.08em;padding:14px 28px;text-decoration:none;border-radius:6px;transition:.2s}
.rtb-cta-gold:hover{background:#e6b800;transform:translateY(-2px)}
.rtb-cta-outline{border:2px solid rgba(245,197,24,.5);color:var(--gold);font-family:var(--H);font-size:.9rem;letter-spacing:.08em;padding:13px 24px;text-decoration:none;border-radius:6px;transition:.2s}
.rtb-cta-outline:hover{border-color:var(--gold);background:rgba(245,197,24,.08)}
.rtb-hero-stats{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.rtb-stat{background:rgba(245,197,24,.07);border:1px solid rgba(245,197,24,.2);border-radius:10px;padding:20px 24px;text-align:center}
.rtb-stat-num{display:block;font-family:var(--H);font-size:2.4rem;color:var(--gold);line-height:1}
.rtb-stat-lbl{display:block;font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.5);margin-top:4px}
.rtb-aeo{max-width:900px;margin:0 auto;padding:40px 40px;border-bottom:1px solid rgba(255,255,255,.06)}
.rtb-aeo h2{font-family:var(--H);font-size:.75rem;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);margin-bottom:12px}
.rtb-aeo p{font-size:.95rem;color:rgba(255,255,255,.72);line-height:1.7}
.rtb-section-label{font-family:var(--H);font-size:.72rem;letter-spacing:.2em;color:var(--gold);text-transform:uppercase;margin-bottom:10px}
.rtb-pricing,.rtb-included,.rtb-print,.rtb-who,.rtb-rules,.rtb-faq{max-width:1100px;margin:0 auto;padding:64px 40px}
.rtb-pricing h2,.rtb-included h2,.rtb-print h2,.rtb-who h2,.rtb-rules h2,.rtb-faq h2{font-family:var(--H);font-size:clamp(32px,5vw,52px);color:#fff;margin-bottom:10px}
.rtb-section-sub{color:rgba(255,255,255,.62);margin-bottom:40px;font-size:1rem;max-width:680px}
.rtb-pricing-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:40px}
.rtb-price-card{background:#161616;border:1px solid rgba(255,255,255,.08);border-radius:14px;overflow:hidden}
.rtb-price-card-featured{border-color:rgba(245,197,24,.4);box-shadow:0 0 40px rgba(245,197,24,.08);position:relative}
.rtb-price-card-badge{position:absolute;top:16px;right:16px;background:var(--gold);color:#0A0A0A;font-family:var(--H);font-size:.65rem;letter-spacing:.15em;padding:4px 10px;border-radius:4px}
.rtb-price-card-header{background:#1e1e1e;padding:20px 24px;font-family:var(--H);font-size:1.3rem;letter-spacing:.05em;color:#fff;border-bottom:1px solid rgba(255,255,255,.06)}
.rtb-price-card-featured .rtb-price-card-header{background:rgba(245,197,24,.08);border-bottom-color:rgba(245,197,24,.2)}
.rtb-price-card-body{padding:8px 0}
.rtb-price-row{display:flex;justify-content:space-between;align-items:center;padding:12px 24px;border-bottom:1px solid rgba(255,255,255,.04);font-size:.9rem;color:rgba(255,255,255,.72)}
.rtb-price-row:last-child{border-bottom:none}
.rtb-price-val{font-family:var(--H);font-size:1.2rem;color:#fff;white-space:nowrap}
.rtb-gold{color:var(--gold)!important}
.rtb-book-btn{display:block;margin:16px 20px 20px;padding:12px 20px;text-align:center;background:#222;border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.8);font-family:var(--H);font-size:.85rem;letter-spacing:.08em;text-decoration:none;border-radius:8px;transition:.2s}
.rtb-book-btn:hover{background:#2a2a2a;color:#fff}
.rtb-book-btn-gold{background:var(--gold);color:#0A0A0A;border-color:var(--gold)}
.rtb-book-btn-gold:hover{background:#e6b800;color:#0A0A0A}
/* Savings Math */
.rtb-math-box{background:linear-gradient(135deg,#0f0f0f,#1a1400);border:1px solid rgba(245,197,24,.25);border-radius:16px;padding:36px 40px;margin-top:8px}
.rtb-math-title{font-family:var(--H);font-size:1.1rem;letter-spacing:.06em;color:var(--gold);margin-bottom:28px}
.rtb-math-grid{display:grid;grid-template-columns:1fr auto 1fr;gap:20px;align-items:start;margin-bottom:24px}
.rtb-math-label{font-family:var(--H);font-size:.72rem;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:12px}
.rtb-math-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:.88rem;color:rgba(255,255,255,.7)}
.rtb-math-total{font-family:var(--H);font-size:1.1rem;color:#fff;border-bottom:none;padding-top:12px;margin-top:4px}
.rtb-math-total-win{color:var(--gold)}
.rtb-math-vs{font-family:var(--H);font-size:1.5rem;color:rgba(255,255,255,.2);align-self:center;text-align:center;padding-top:40px}
.rtb-math-col-win{background:rgba(245,197,24,.04);border-radius:10px;padding:16px}
.rtb-math-save{font-family:var(--H);font-size:1rem;color:var(--gold);margin-top:12px;letter-spacing:.05em}
.rtb-math-note{font-size:.88rem;color:rgba(255,255,255,.55);line-height:1.6;border-top:1px solid rgba(255,255,255,.06);padding-top:20px}
/* Included */
.rtb-included-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.rtb-inc-card{background:#161616;border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:24px;transition:.2s}
.rtb-inc-card:hover{border-color:rgba(245,197,24,.25);transform:translateY(-3px)}
.rtb-inc-icon{font-size:1.8rem;margin-bottom:12px}
.rtb-inc-title{font-family:var(--H);font-size:1rem;letter-spacing:.05em;color:#fff;margin-bottom:8px}
.rtb-inc-card p{font-size:.84rem;color:rgba(255,255,255,.6);line-height:1.55}
/* Print */
.rtb-print-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px}
.rtb-print-card{background:#161616;border:1px solid rgba(255,255,255,.08);border-radius:14px;overflow:hidden;position:relative}
.rtb-print-card-rush{border-color:rgba(245,197,24,.35);box-shadow:0 0 30px rgba(245,197,24,.06)}
.rtb-print-card-badge{position:absolute;top:16px;right:16px;background:var(--gold);color:#0A0A0A;font-family:var(--H);font-size:.65rem;letter-spacing:.15em;padding:4px 10px;border-radius:4px}
.rtb-print-card-header{background:#1e1e1e;padding:20px 24px;font-family:var(--H);font-size:1.2rem;letter-spacing:.05em;color:#fff;border-bottom:1px solid rgba(255,255,255,.06)}
.rtb-print-price{font-family:var(--H);font-size:2.8rem;color:var(--gold);padding:20px 24px 8px;line-height:1}
.rtb-print-price small{font-size:1rem;color:rgba(255,255,255,.4)}
.rtb-print-list{list-style:none;padding:0 24px 8px;margin:0}
.rtb-print-list li{font-size:.87rem;color:rgba(255,255,255,.68);padding:6px 0;border-bottom:1px solid rgba(255,255,255,.04)}
.rtb-print-list li:last-child{border-bottom:none}
.rtb-print-note{background:#111;border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:20px 24px;font-size:.88rem;color:rgba(255,255,255,.6);margin-bottom:32px}
.rtb-print-note a{color:var(--gold)}
/* Print Calculator */
.rtb-calc-box{background:#111;border:1px solid rgba(245,197,24,.2);border-radius:14px;padding:32px 36px;max-width:520px}
.rtb-calc-title{font-family:var(--H);font-size:1rem;letter-spacing:.08em;color:var(--gold);margin-bottom:24px}
.rtb-calc-row{margin-bottom:16px}
.rtb-calc-row label{display:block;font-size:.8rem;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.5);margin-bottom:6px}
.rtb-calc-row input,.rtb-calc-row select{width:100%;background:#1a1a1a;border:1px solid rgba(255,255,255,.12);color:#fff;padding:10px 14px;border-radius:7px;font-size:.95rem;font-family:var(--B)}
.rtb-calc-btn{background:var(--gold);color:#0A0A0A;font-family:var(--H);font-size:.9rem;letter-spacing:.1em;padding:12px 28px;border:none;border-radius:7px;cursor:pointer;margin-top:8px;transition:.2s}
.rtb-calc-btn:hover{background:#e6b800}
.rtb-calc-result{margin-top:16px;font-family:var(--H);font-size:1.4rem;color:var(--gold);min-height:32px}
/* Who */
.rtb-who-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.rtb-who-card{background:#161616;border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:28px 24px}
.rtb-who-icon{font-size:2rem;margin-bottom:14px}
.rtb-who-card h3{font-family:var(--H);font-size:1.1rem;color:#fff;margin-bottom:10px}
.rtb-who-card p{font-size:.85rem;color:rgba(255,255,255,.6);line-height:1.55}
/* Rules */
.rtb-rules-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.rtb-rule-card{background:#161616;border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:24px}
.rtb-rule-zero{border-color:rgba(220,50,50,.3);background:#1a0a0a}
.rtb-rule-num{font-family:var(--H);font-size:2rem;color:rgba(255,255,255,.12);line-height:1;margin-bottom:8px}
.rtb-rule-zero .rtb-rule-num{color:rgba(220,50,50,.3)}
.rtb-rule-title{font-family:var(--H);font-size:1rem;color:#fff;margin-bottom:8px;letter-spacing:.04em}
.rtb-rule-zero .rtb-rule-title{color:#ff6b6b}
.rtb-rule-card p{font-size:.83rem;color:rgba(255,255,255,.58);line-height:1.55}
/* FAQ */
.rtb-faq-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.rtb-faq-item{background:#161616;border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:24px}
.rtb-faq-item h3{font-family:var(--H);font-size:1rem;color:var(--gold);margin-bottom:10px;letter-spacing:.03em}
.rtb-faq-item p{font-size:.87rem;color:rgba(255,255,255,.65);line-height:1.6}
/* Final CTA */
.rtb-cta-final{background:linear-gradient(135deg,#111 0%,#1a1400 100%);border-top:1px solid rgba(245,197,24,.15);padding:64px 40px;text-align:center}
.rtb-cta-final h2{font-family:var(--H);font-size:clamp(36px,5vw,56px);color:#fff;margin-bottom:16px}
.rtb-cta-final p{color:rgba(255,255,255,.62);margin-bottom:32px;font-size:1rem}
.rtb-cta-final-btns{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-bottom:24px}
.rtb-address{font-size:.82rem;color:rgba(255,255,255,.4);font-family:var(--H);letter-spacing:.06em}
/* Responsive */
@media(max-width:900px){
  .rtb-hero-inner{grid-template-columns:1fr}
  .rtb-hero-stats{grid-template-columns:repeat(4,1fr)}
  .rtb-pricing-grid,.rtb-print-grid{grid-template-columns:1fr}
  .rtb-included-grid,.rtb-who-grid,.rtb-rules-grid{grid-template-columns:1fr 1fr}
  .rtb-faq-grid{grid-template-columns:1fr}
  .rtb-math-grid{grid-template-columns:1fr;gap:12px}
  .rtb-math-vs{display:none}
}
@media(max-width:600px){
  .rtb-hero,.rtb-pricing,.rtb-included,.rtb-print,.rtb-who,.rtb-rules,.rtb-faq,.rtb-cta-final{padding:40px 20px}
  .rtb-hero-stats{grid-template-columns:1fr 1fr}
  .rtb-included-grid,.rtb-who-grid,.rtb-rules-grid{grid-template-columns:1fr}
  .rtb-math-box{padding:24px 20px}
}
</style>

<!-- PRINT CALCULATOR SCRIPT -->
<script>
function calcPrint(){
  var w=parseFloat(document.getElementById('printW').value)||0;
  var h=parseFloat(document.getElementById('printH').value)||0;
  var rate=parseFloat(document.getElementById('printType').value)||5.50;
  var sqft=(w*h)/144;
  var el=document.getElementById('printResult');
  if(!w||!h){el.textContent='Please enter width and height.';return;}
  if(sqft<25){
    el.innerHTML='<span style="color:#ff6b6b">Minimum order is 25 sq ft ('+sqft.toFixed(1)+' sq ft entered)</span>';
    return;
  }
  var total=sqft*rate;
  el.innerHTML=sqft.toFixed(1)+' sq ft &times; $'+rate.toFixed(2)+' = <strong>$'+total.toFixed(2)+'</strong>';
}
</script>

<!-- FOOTER -->
'''

# Build the full page
full_page = TOP + CONTENT + BOTTOM

with open('/home/ubuntu/cfwforever/public/rent-the-bay/index.html', 'w', encoding='utf-8') as f:
    f.write(full_page)

print(f'Written: {len(full_page)} chars')
print('Done!')
