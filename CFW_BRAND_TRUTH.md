# CFW_BRAND_TRUTH.md

**Single source of truth for every claim, number, and product spec on chicagofleetwraps.com.**
Every page rewrite pulls from this file. If a fact isn't here, it doesn't go on a page.
Conflicts get resolved here first, then the site, never the other way around.

_Last updated: 2026-04-29_
_Locked by: project lead_

---

## Numbers

| Claim | Approved value | Where to use |
|---|---|---|
| Daily impressions per vehicle | **30,000–70,000** | All pages. Cite OAAA. |
| Ad recall | **97%** | All pages. Cite OAAA. |
| Wrap lifespan | **5–7 years** | All pages |
| Cost per thousand impressions (CPM) | **$0.04–$0.08** (range) / **$0.05** (single number) | Range on most pages; single number only when format requires it |
| CFW vehicles wrapped | **9,400+** | All pages |
| CFW active fleet accounts | **2,800+** | All pages |
| CFW Rivian installs | **600+** | EV / Rivian pages |
| Years operating | **10+** | All pages |
| Verified paint damage claims | **0** | Trust / warranty / material pages |

### Banned numbers
- ❌ $0.70 CPM (was in original strategy doc, math doesn't compute, deprecated)
- ❌ $0.01, $0.03, $0.033, $0.036, $0.06, $0.07, $0.09 CPM — sweep target, replace with the approved range or $0.05

### Source citations
- Impressions, recall, lifespan: **Outdoor Advertising Association of America (OAAA)**
- CPM: derived from CFW pricing × OAAA impression range (5–7 yr lifespan)
- Vehicle/account counts: CFW internal records

---

## Materials

### Approved films (use SKU-level naming)

| Film | Type | Use case |
|---|---|---|
| **Avery Dennison MPI 1105** | Cast vinyl | Primary commercial fleet film |
| **3M IJ180-CV3** | Cast vinyl | Alternative primary film |
| **3M 2080** | Cast vinyl | Color change / specialty finishes |
| **Avery J55C** | Cast vinyl | Color change applications |
| **3M 8518 Gloss Overlaminate** | Overlaminate | Salt / UV protection over print |

### Generic terms — when to use, when to avoid
- ✅ "Cast vinyl" — fine when SKU isn't relevant to the audience
- ✅ "Premium cast vinyl" — fine in summary or hero copy
- ❌ "3M Cast Vinyl" alone — too generic; if naming 3M, name the SKU
- ❌ "Calendered vinyl" — only used for comparison/contrast purposes (we don't sell it for fleet)

### Certifications
- HP Latex certified
- Avery Dennison certified installer
- 3M certified

---

## Voice — tonal flex by page type

**Locked decision (2026-04-29):** voice flexes by page type. No full brand pivot.

### Page-type voice map

| Page type | Voice | Why |
|---|---|---|
| Homepage / hero | Industrial-confident | First impression, brand anchor |
| Materials / spec / process pages | Technical-precise | Buyer is qualifying us; depth wins |
| Vehicle model pages (Sprinter, Transit, etc.) | Technical-helpful | Spec-curious buyer |
| Industry pages (HVAC, plumbing, etc.) | Warmer, peer-to-peer | Owner-operator buyer; "we get your business" |
| City / suburb pages | Local-friendly | Pride of place, less growl |
| Cost / pricing / ROI pages | Direct-helpful | Buyer wants answers, not edge |
| FAQ / education / how-to | Plain-spoken expert | Teaching mode |
| Quote / contact / form pages | Direct-warm | Friction-killer, no edge |
| Case studies / portfolio | Confident-specific | Proof mode |

### Universal rules (apply to every page regardless of voice)
- Active voice always
- Shop-talk vocabulary welcome: panel breaks, adhesive failure, out-gassing, road salt corrosion, rivet conformability, post-heat
- Chicago-specific references encouraged but rationed: Eisenhower, Dan Ryan, salt-truck season, Lake-effect cold, Naperville/Aurora/Schaumburg traffic — use one per page max, not stacked
- One dominant CTA per page: **"Get a Fleet Quote"** in CFW yellow

### Banned vocabulary
synergy · comprehensive · tailored · innovative · cutting-edge · seamless · best-in-class · world-class · solutions · leverage · empower · unlock · journey · ecosystem

---

## Sticky mobile CTA — pending decision

Strategy doc proposes: `[CALL NOW] | [GET QUOTE] | [GALLERY]` (3 buttons)
Pillar 4 says: one dominant CTA per page

**Status:** unresolved. Recommend single sticky [GET QUOTE], phone in header. Awaiting final call before applying to 230 pages.

---

## Phone, email, address — single source

To be filled from a sweep of the site (TODO before next session). Today there are conflicting versions on different pages — same problem class as the CPM mess.

---

## How to use this file

1. Before writing any page copy, open this file.
2. Use only numbers, films, and phrasings from this file.
3. If you find a contradiction (live page says X, this file says Y), this file wins. Update the page.
4. If a new claim comes up that isn't here, add it here first with a source. No claim goes on a page until it's in this file.



---

## Strategic principle: destination shop, not local network

**Locked decision (2026-04-29):** CFW is a destination shop. One physical location at 4711 N Lamon Ave #7, Chicago. We serve all of Chicagoland because customers come to us — and because we pick up fleets for free.

### What this changes
- **No per-city landing pages.** 68 templated city pages were culled on this date because they had no real local proof, no per-city differentiation, and were triggering Google's scaled-content penalty. Replaced by one canonical `/service-area/` page.
- **Schema does the geographic work.** `LocalBusiness` schema on `/service-area/` lists every Chicagoland city in `areaServed`. That's the SEO surface area — not 68 thin pages.
- **Voice acknowledges the geography directly.** "We pick them up free" is a real differentiator, not generic copy. Drive times from the Mayfair shop are concrete.
- **Hub pages are the priority.** `/vehicle-wraps-chicago/`, `/fleet-wraps-chicago/`, `/commercial-vehicle-wraps-chicago/`, `/ev-wraps/`, `/rivian-wrap-chicago/`, `/portfolio/` — these are the pages that should rank, and they were being dragged down by the city-page doorway pattern.

### Banned moving forward
- Templated city pages with placeholder-style swap content.
- Claims like "we have a location in [city]" — we don't.
- Geographic content not backed by either real proof OR clear "we serve / we come to" framing.

### What still works
- The address (4711 N Lamon Ave #7) on every page.
- "Free pickup across Chicagoland" as a value prop.
- Drive-time language ("25 minutes from the Loop") instead of pretending to be local.
