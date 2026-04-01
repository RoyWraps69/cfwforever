#!/usr/bin/env node
/* Last regenerated: 2026-03-11 â internal links, mobile nav, JSON-LD upgrades */
/**
 * Static HTML Page Generator for SEO
 * 
 * Generates lightweight static HTML files for each route so Google
 * can index them without JavaScript rendering. Each file contains:
 * - Full <head> with title, description, canonical, OG, Twitter tags
 * - JSON-LD schemas (WebPage + BreadcrumbList)
 * - Visible H1 and key content
 * - Styled with site.css
 * - Progressive enhancement: loads SPA for full interactivity
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const BASE_URL = 'https://chicagofleetwraps.com';

// All pages with SEO metadata, content, and URL mapping
const PAGES = [
  // === Service Pages (no duplicates â long-keyword versions live as hand-crafted HTML) ===
  { slug: 'boxtruck', url: 'boxtruck', ogImage: 'windy_city_box_truck.webp', heroImage: 'hunt_brothers_pizza_truck.jpg', h1: 'Box Truck Wraps Chicago', desc: 'Box truck wraps in Chicago â 16 to 26 ft. Avery Dennison & 3M cast vinyl. 2-year warranty. 70,000+ daily impressions. Get a free quote today â', title: 'Box Truck Wraps Chicago â 16 to 26 ft | From $4,500 | Chicago Fleet Wraps', category: 'Services', keywords: 'box truck wraps Chicago, box truck graphics, 16 ft box truck wrap, 26 ft box truck wrap, truck wrap cost Chicago', content: 'A wrapped box truck on I-90, I-290, or I-94 generates 70,000+ daily impressions with zero recurring ad spend. All sizes: 16, 18, 20, 22, 24, 26 ft box trucks. Cab, box sides, and rear door fully covered. Avery Dennison MPI 1105 cast vinyl rated 7 years.' },
  { slug: 'sprinter', url: 'sprinter', ogImage: 'precision_today_sprinter.jpg', heroImage: 'cfw_van_3.webp', h1: 'Sprinter Van Wraps Chicago', desc: 'Mercedes Sprinter van wraps in Chicago â standard & high-roof. Full and partial options. â 5.0 Google rating. Request your free estimate â', title: 'Sprinter Van Wraps Chicago | From $3,700 | Chicago Fleet Wraps', category: 'Services', keywords: 'sprinter van wraps Chicago, Mercedes Sprinter wrap, high roof sprinter wrap, sprinter van graphics, sprinter wrap cost', content: 'Professional Mercedes Sprinter van wraps in Chicago. Standard and high-roof models. Full and partial wrap options. Premium Avery Dennison MPI 1105 and 3M IJ180-CV3 cast vinyl. Free pickup throughout Chicagoland.' },
  { slug: 'transit', url: 'transit', ogImage: 'small_transit_van_opt.webp', heroImage: 'cfw_van_1.webp', h1: 'Transit Van Wraps Chicago', desc: 'Ford Transit van wraps in Chicago â full & partial commercial wraps. Premium cast vinyl. Free pickup across Chicagoland. Call (312) 597-1286 â', title: 'Transit Van Wraps Chicago | Free Pickup | Chicago Fleet Wraps', category: 'Services', keywords: 'Ford Transit van wraps Chicago, transit van graphics, transit van wrap cost, commercial van wraps', content: 'Ford Transit van wraps in Chicago. Full and partial commercial wrap options. Premium cast vinyl materials. Free fleet pickup and delivery across Chicagoland.' },
  { slug: 'colorchange', url: 'colorchange', ogImage: 'color_change_tesla.webp', heroImage: 'audi_color_shift.jpg', h1: 'Color Change Wraps Chicago', desc: '120+ colors â gloss, matte, satin, chrome. Avery Dennison & 3M certified. Cars, trucks, SUVs. See our gallery & get a free quote â', title: 'Color Change Wraps Chicago | 120+ Colors | Chicago Fleet Wraps', category: 'Services', keywords: 'color change wrap Chicago, matte wrap, satin wrap, gloss wrap, chrome wrap, vehicle color change, car wrap colors', content: 'Full color change vehicle wraps in Chicago. Over 120 colors available including gloss, matte, satin, metallic, and chrome finishes. Avery Dennison Supreme Wrapping Film and 3M 2080 series. Professional installation with 2-year workmanship warranty.' },
  { slug: 'wallwraps', url: 'wallwraps', ogImage: 'oakbros_wall_wrap.jpg', heroImage: 'balloon_museum_massive.jpg', h1: 'Wall Wraps & Murals Chicago', desc: 'Custom wall wraps, murals & environmental graphics in Chicago. Interior and exterior. See our work & request a free quote â', title: 'Wall Wraps & Murals Chicago | Chicago Fleet Wraps', category: 'Services', keywords: 'wall wraps Chicago, wall murals, environmental graphics, wall graphics, office wall wrap, commercial murals Chicago', content: 'Custom wall wraps, murals, and environmental graphics in Chicago. Interior and exterior installations. Commercial lobbies, retail spaces, gyms, restaurants. High-resolution printing on premium adhesive vinyl.' },
  { slug: 'ev', url: 'ev-wraps', ogImage: 'rivian_blue_holographic.jpg', heroImage: 'rivian_rad.jpg', h1: 'Electric Vehicle Wraps Chicago â #1 EV Wrap Shop in Illinois', desc: "Illinois' #1 EV wrap shop â 600+ Rivians, hundreds of Teslas. Zero warranty issues. Color change & commercial. Get your free EV quote â", title: 'EV Wraps Chicago â #1 in Illinois | 600+ Rivians | Chicago Fleet Wraps', category: 'Services', keywords: 'EV wraps Chicago, electric vehicle wrap, Rivian wrap, Tesla wrap, Lucid wrap, BMW iX wrap, EV color change, electric car wrap Illinois', content: "Illinois' largest EV wrap installer. 600+ Rivians wrapped. Tesla Model 3, Model Y, Model S, Model X. Rivian R1T, R1S. Lucid Air. BMW iX. Polestar. Color change and commercial wraps. Zero warranty issues. Avery Dennison and 3M certified." },
  // Removed: commercial, removal â canonical at /commercial-vehicle-wraps-chicago/ and /wrap-removal/

  // === Industry Pages â REMOVED short slugs, canonical lives at long-keyword HTML ===
  // Removed: hvac, plumber, electric, contractor, delivery, foodtruck, landscape, boating, moving
  // Canonical URLs: /hvac-van-wraps-chicago/, /plumbing-van-wraps-chicago/, etc.

  // === New Service Pages ===
  { slug: 'one-day-wraps', url: 'one-day-wraps', ogImage: 'cfw_van_1.webp', heroImage: 'cfw_truck_2.webp', h1: 'One Day Wraps Chicago — Same Day Vehicle Wraps', desc: '1 day wraps in Chicago — partial wraps, lettering & color change installed same day. Premium cast vinyl. Free pickup. Call (312) 597-1286 →', title: 'One Day Wraps Chicago | Same Day Install | Chicago Fleet Wraps', category: 'Services', keywords: 'one day wraps, 1 day wraps, same day vehicle wraps, quick wraps Chicago, fast vehicle wrap, one day wrap install', content: `One day wraps in Chicago — get your vehicle wrapped and back on the road in a single day. Chicago Fleet Wraps offers same-day installation for partial wraps, vinyl lettering, spot graphics, and select color change wraps.

Not every wrap takes 3–5 days. Our 1 day wrap service is designed for businesses that cannot afford vehicle downtime. Partial wraps covering sides and rear, commercial lettering packages, and single-panel color accents can all be completed in one business day.

Our one day wrap options include:
• Partial commercial wraps (sides + rear) — installed in 4–6 hours
• Commercial vinyl lettering — company name, phone, DOT info — 2–4 hours
• Single-panel color change accents — hood, roof, or trunk — 3–5 hours
• Spot graphics and logo applications — 1–3 hours
• Fleet decal packages for multiple vehicles — 1–2 hours per vehicle

All one day wraps use the same premium Avery Dennison and 3M cast vinyl as our multi-day installations. No shortcuts, no calendered film. The difference is scope, not quality.

Pricing for 1 day wraps starts at $400 for lettering packages and $1,200–$2,500 for partial wraps. Full vehicle wraps require 2–5 days and cannot be rushed without compromising quality.

Free pickup and delivery throughout Chicagoland for all one day wrap projects. Drop off in the morning, pick up by end of day.` },
  { slug: 'construction-vehicle-wraps', url: 'construction-vehicle-wraps', ogImage: 'sns_roofing_truck.webp', heroImage: 'exalt_air_pick_up_truck.webp', h1: 'Construction Vehicle Wraps Chicago — Trucks, Vans & Equipment', desc: 'Construction truck wraps & construction vehicle wraps in Chicago. Pickup trucks, dump trucks, box trucks & vans. DOT compliant. Free estimate →', title: 'Construction Vehicle Wraps Chicago | Trucks & Vans | Chicago Fleet Wraps', category: 'Services', keywords: 'construction truck wrap, construction vehicle wraps, construction fleet wraps Chicago, contractor truck wraps, dump truck wraps, construction company vehicle graphics', content: `Construction vehicle wraps in Chicago — professional branding for construction companies, general contractors, and specialty trades. Chicago Fleet Wraps has wrapped thousands of construction trucks, vans, and fleet vehicles across Chicagoland.

Construction truck wraps are one of the most effective marketing investments for contractors. A wrapped pickup truck or dump truck generates 30,000–70,000 daily impressions at job sites, on highways, and in residential neighborhoods where your next customer lives.

Our construction vehicle wrap services include:
• Pickup truck wraps — F-150, F-250, F-350, Silverado, RAM, Tundra
• Dump truck wraps and graphics — single axle and tandem
• Box truck wraps — 16 to 26 ft construction box trucks
• Cargo van wraps — construction crew vans and tool vans
• Trailer wraps — enclosed and flatbed construction trailers
• Equipment decals — skid steers, excavators, generators

Construction truck wrap pricing: Pickup trucks from $3,200. Box trucks from $5,000–$10,900. Cargo vans from $3,750. Fleet discounts of 5–15% for 3+ vehicles.

All construction vehicle wraps include DOT-compliant lettering (USDOT number, GVW, company name) as required by FMCSA regulations. We design construction wraps for maximum visibility at job sites and on the road.

Premium Avery Dennison MPI 1105 and 3M IJ180-CV3 cast vinyl rated 5–7 years outdoor — built to withstand the abuse construction vehicles endure daily.` },
  { slug: 'trailer-wraps-chicago', url: 'trailer-wraps-chicago', ogImage: 'windy_city_box_truck.webp', heroImage: 'cfw_truck_3.webp', h1: 'Trailer Wraps Chicago — Enclosed, Flatbed & Utility Trailers', desc: 'Trailer wrap installation in Chicago — enclosed trailers, flatbed trailers, utility trailers. Premium cast vinyl. Free estimate. Call (312) 597-1286 →', title: 'Trailer Wraps Chicago | Professional Installation | Chicago Fleet Wraps', category: 'Services', keywords: 'trailer wrap installation, trailer wrap near me, trailer wraps Chicago, enclosed trailer wrap, utility trailer wrap, flatbed trailer graphics', content: `Trailer wraps in Chicago — professional trailer wrap installation for enclosed trailers, flatbed trailers, utility trailers, and specialty trailers. Chicago Fleet Wraps provides end-to-end trailer wrap services from design to installation.

Trailer wrap installation is one of the highest-ROI advertising investments available. Trailers have massive flat panels — the largest mobile billboard you can own. A wrapped enclosed trailer generates 70,000+ daily impressions on Chicago highways.

Our trailer wrap services include:
• Enclosed trailer wraps — 6x12, 7x14, 8.5x20, and larger
• Flatbed trailer graphics — side rail lettering and panel wraps
• Utility trailer wraps — landscaping, construction, and service trailers
• Refrigerated trailer wraps — food distribution and cold chain
• Car hauler trailer graphics — auto transport and dealership trailers
• Concession trailer wraps — food and beverage service trailers

Trailer wrap pricing: Utility trailers from $1,500. Enclosed trailers from $2,500–$6,000 depending on size. Large semi-trailers from $4,000–$8,000.

All trailer wrap installations use premium Avery Dennison MPI 1105 or 3M IJ180-CV3 cast vinyl with UV overlaminate. Rated 5–7 years outdoor.

Trailer wrap installation near me — Chicago Fleet Wraps serves all of Chicagoland with free pickup and delivery. Our shop at 4711 N Lamon Ave handles trailers up to 53 ft. Professional installation by certified technicians with 2-year workmanship warranty.` },

  // === Core Pages ===
  { slug: 'portfolio', url: 'portfolio', ogImage: 'frontier_fleet_vans.webp', heroImage: 'pink_chrome-2.webp', h1: 'Vehicle Wrap Gallery & Portfolio', desc: 'Real car, truck, van & fleet wrap projects from Chicago. Bold, custom designs. 9,400+ vehicles completed. Browse our gallery â', title: 'Vehicle Wrap Gallery & Portfolio | Chicago Fleet Wraps', category: 'Company', keywords: 'vehicle wrap portfolio, fleet wrap gallery, wrap examples Chicago, vehicle wrap before after', content: 'Browse our portfolio of vehicle wrap projects. Commercial fleet wraps, color change wraps, box truck wraps, sprinter van wraps, and more. All projects completed in Chicago.' },
  { slug: 'blog', url: 'blog', ogImage: 'cfw_van_2.webp', heroImage: 'cfw_truck_1.webp', h1: 'Fleet Wrap Insights & Blog', desc: 'Expert guides, ROI data & industry knowledge from 24+ years in the wrap business. Read our latest articles â', title: 'Fleet Wrap Blog & Guides | Chicago Fleet Wraps', category: 'Company', keywords: 'fleet wrap blog, vehicle wrap tips, wrap industry insights, fleet branding articles', content: 'Expert guides, ROI data, and industry knowledge from 24+ years in the wrap business. Articles on materials, pricing, care, and fleet wrap strategies.' },
  { slug: 'faq', url: 'faq', ogImage: 'wrap_install_closeup.jpg', heroImage: 'frontier_fleet_vans.jpg', h1: 'Vehicle Wrap FAQs', desc: 'Answers to common vehicle wrap questions â materials, pricing, installation, care & more. Still have questions? Call (312) 597-1286 â', title: 'Vehicle Wrap FAQs | Chicago Fleet Wraps', category: 'Company', keywords: 'vehicle wrap FAQ, wrap questions, how long do wraps last, vehicle wrap cost, wrap care', content: 'Frequently asked questions about vehicle wraps. Materials, pricing, installation timelines, care instructions, warranty information, and more.' },
  { slug: 'about', url: 'about', ogImage: 'balloon_museum_exterior.jpg', heroImage: 'balloon_museum_interior.jpg', h1: 'About Chicago Fleet Wraps', desc: "24+ years. 9,400+ vehicles. â 5.0 Google rating. Meet the team behind Chicago's highest-rated fleet wrap company â", title: 'About Chicago Fleet Wraps | 24+ Years | 9,400+ Vehicles', category: 'Company', keywords: 'Chicago Fleet Wraps, vehicle wrap company Chicago, fleet wrap installer, about Chicago Fleet Wraps', content: '24+ years experience in commercial vehicle graphics. Started in Las Vegas in 2001. Operating in Chicago since 2014. 9,400+ vehicles wrapped. 2,800+ fleet accounts.' },
  { slug: 'estimate', url: 'estimate', ogImage: 'cfw_van_1.webp', heroImage: 'cfw_truck_3.webp', h1: 'Get a Free Fleet Wrap Estimate', desc: 'Free fleet wrap estimate â real pricing within 2 hours, not a range. Free pickup across Chicagoland. Request yours now â (312) 597-1286.', title: 'Get a Free Wrap Estimate | Real Pricing in 2 Hours | Chicago Fleet Wraps', category: 'Company', keywords: 'free wrap estimate, fleet wrap quote, vehicle wrap pricing, wrap cost estimate Chicago', content: 'Request a free fleet wrap estimate. Real pricing â not a range â within 2 business hours. Free pickup and delivery throughout Chicagoland.' },
  { slug: 'warranty', url: 'warranty', ogImage: 'cfw_van_3.webp', heroImage: 'precision_today_sprinter.jpg', h1: 'Warranty Policy', desc: '2-year installation warranty + 5â7 year vinyl manufacturer warranty (Avery Dennison & 3M). See full coverage details â', title: 'Warranty Policy | 2-Year + Manufacturer | Chicago Fleet Wraps', category: 'Company', keywords: 'vehicle wrap warranty, wrap guarantee, Avery Dennison warranty, 3M wrap warranty', content: '2-year workmanship warranty covering lifting, peeling, and bubbling. 5â7 year vinyl manufacturer warranty from Avery Dennison and 3M.' },
  { slug: 'servicearea', url: 'servicearea', ogImage: 'chicago_neighborhoods_map.png', heroImage: 'frontier_fleet_vans.jpg', h1: 'Service Area â 75+ Cities in Chicagoland', desc: 'Serving 75+ cities across Chicagoland â Cook, DuPage, Kane, Lake, Will, McHenry. Free fleet pickup & delivery. Find your city â', title: 'Service Area â 75+ Cities | Free Pickup | Chicago Fleet Wraps', category: 'Company', keywords: 'fleet wraps Chicagoland, vehicle wraps near me, fleet wraps Cook County, fleet wraps DuPage County, Chicago suburbs wraps', content: 'Chicago Fleet Wraps serves 75+ cities across Chicagoland including Cook, DuPage, Kane, Lake, Will, and McHenry counties. Free fleet pickup and delivery included.' },
  { slug: 'apparel', url: 'apparel', ogImage: 'beats2.jpg', heroImage: 'mortal_combat.jpg', h1: 'Custom Apparel & Team Wear', desc: 'Custom branded apparel for fleet teams â tees, polos, hats, workwear. Match your wrap branding. Request a quote â', title: 'Custom Apparel & Team Wear | Chicago Fleet Wraps', category: 'Company', keywords: 'custom apparel, team workwear, branded uniforms, fleet team clothing', content: 'Custom branded apparel for fleet teams. T-shirts, polos, hats, workwear. Match your vehicle wrap branding for a cohesive professional image.' },

  // === Resource Pages ===
  { slug: 'roi', url: 'roi', ogImage: 'cfw_truck_1.webp', heroImage: 'frontier_fleet_vans.jpg', h1: 'Fleet Wrap ROI Calculator Guide', desc: 'Calculate your fleet wrap ROI â $0.04 CPM vs $19.70 for Google Ads. See why wraps deliver 2,500â5,000% ROI. Try the calculator â', title: 'Fleet Wrap ROI Calculator | $0.04 CPM | Chicago Fleet Wraps', category: 'Resources', keywords: 'fleet wrap ROI, vehicle wrap return on investment, wrap CPM, advertising ROI calculator', content: 'Calculate your fleet wrap return on investment. Vehicle wraps deliver the lowest CPM of any advertising medium at $0.04â$0.48 per thousand impressions.' },
  { slug: 'stats', url: 'stats', ogImage: 'cfw_truck_3.webp', heroImage: 'cfw_van_2.webp', h1: 'Vehicle Wrap Statistics & Industry Data', desc: '97% recall rate. 70,000 daily impressions. $0.04 CPM. Data from OAAA, 3M & ARF studies. See all the numbers â', title: 'Vehicle Wrap Statistics | 97% Recall Rate | Chicago Fleet Wraps', category: 'Resources', keywords: 'vehicle wrap statistics, wrap impressions data, fleet advertising stats, OAAA wrap data, vehicle wrap CPM', content: '97% ad recall rate. 70,000+ daily impressions per vehicle. $0.04 CPM. Data sourced from OAAA, 3M, and ARF research studies.' },
  { slug: 'vsads', url: 'vsads', ogImage: 'cfw_van_1.webp', heroImage: 'cfw_truck_2.webp', h1: 'Vehicle Wraps vs Google Ads', desc: '$0.48 CPM vs $19.70 â one-time cost vs never-ending ad spend. The math is not close. See the full breakdown â', title: 'Vehicle Wraps vs Google Ads | CPM Comparison | Chicago Fleet Wraps', category: 'Resources', keywords: 'vehicle wraps vs Google Ads, wrap vs billboard, fleet advertising comparison, best advertising for small business', content: 'Vehicle wraps vs Google Ads, billboards, and social media advertising. Side-by-side CPM, ROI, and total cost comparison over 5 years.' },
  { slug: 'materials', url: 'materials', ogImage: 'wrap_install_closeup.jpg', heroImage: 'corvette_mid_wrap.jpg', h1: 'Wrap Materials Guide â Avery Dennison & 3M', desc: 'Compare Avery Dennison MPI 1105 vs 3M IJ180-CV3 cast vinyl â specs, durability & recommendations from 24+ years experience â', title: 'Wrap Materials Guide | Avery Dennison & 3M | Chicago Fleet Wraps', category: 'Resources', keywords: 'Avery Dennison MPI 1105, 3M IJ180-CV3, cast vinyl, wrap materials, vinyl wrap film comparison', content: 'Compare Avery Dennison MPI 1105 and 3M IJ180-CV3 cast vinyl. Specifications, durability ratings, conformability, and professional recommendations.' },
  { slug: 'care', url: 'care', ogImage: 'sandals_color_change.jpg', heroImage: 'bmw_matte_black.jpg', h1: 'Wrap Care & Maintenance Guide', desc: 'How to care for your vehicle wrap â washing, storage & winter tips. Extend your wrap to 7+ years. Read the full guide â', title: 'Wrap Care & Maintenance Guide | Chicago Fleet Wraps', category: 'Resources', keywords: 'wrap care, vehicle wrap maintenance, how to wash wrapped car, wrap care tips, vinyl wrap cleaning', content: 'How to care for your vehicle wrap. Hand washing techniques, storage recommendations, winter weather tips. Extend your wrap life to 7+ years.' },

  // === Tool Pages ===
  { slug: 'visualizer', url: 'visualizer', ogImage: 'camaro_color_shift.jpg', heroImage: 'pink_chrome-2.webp', h1: 'Vehicle Wrap Color Visualizer', desc: 'Preview 120+ vinyl wrap colors on vehicle templates. Try before you buy â free interactive tool. Start visualizing â', title: 'Vehicle Wrap Color Visualizer | 120+ Colors | Chicago Fleet Wraps', category: 'Tools', keywords: 'wrap color visualizer, vinyl wrap colors, vehicle wrap preview, color change preview tool', content: 'Preview over 120 vinyl wrap colors on vehicle templates. Avery Dennison and 3M color swatches. Try before you buy. Free interactive tool.' },
  { slug: 'brandaudit', url: 'brandaudit', ogImage: 'arnold_electric_sales.jpg', heroImage: 'frontier_fleet_vans.jpg', h1: 'Fleet Brand Audit â Free Assessment', desc: 'Score your fleet branding in 2 minutes â 8 questions, instant recommendations. Free tool. Take the audit now â', title: 'Fleet Brand Audit | Free 2-Minute Assessment | Chicago Fleet Wraps', category: 'Tools', keywords: 'fleet brand audit, fleet branding score, vehicle branding assessment, fleet marketing audit', content: 'Score your fleet branding in 2 minutes. 8-question assessment covering visibility, consistency, and impact. Instant recommendations and action plan.' },
  { slug: 'calculator', url: 'calculator', ogImage: 'small_suv.webp', heroImage: 'small_transit_van.webp', h1: 'Wrap Cost Per Day Calculator', desc: 'Calculate your vehicle wrap cost per day & CPM. Compare to Google Ads, billboards & other advertising. Try the free calculator â', title: 'Wrap Cost Per Day Calculator | Free Tool | Chicago Fleet Wraps', category: 'Tools', keywords: 'wrap cost calculator, vehicle wrap price calculator, wrap CPM calculator, fleet wrap cost estimator', content: 'Calculate your vehicle wrap cost per day and cost per thousand impressions (CPM). Compare to Google Ads, billboards, and social media advertising.' },
  { slug: 'wrap-calculator', url: 'calculator', ogImage: 'small_suv.webp', heroImage: 'small_transit_van.webp', h1: 'Instant Wrap Price Calculator', desc: 'Get instant wrap pricing â 310+ vehicles. Select type, vinyl & coverage. Real installed pricing, not estimates. Try it now â', title: 'Instant Wrap Price Calculator | 310+ Vehicles | Chicago Fleet Wraps', category: 'Tools', keywords: 'instant wrap pricing, vehicle wrap price tool, how much does a wrap cost, wrap price by vehicle', content: 'Get instant vehicle wrap pricing. 310+ vehicle types. Select your vehicle, vinyl type, and coverage level. Real installed pricing â not estimates.' },
  { slug: 'beforeafter', url: 'beforeafter', ogImage: 'windy_city_after.jpg', heroImage: 'windy_city_before.jpg', h1: 'Before & After Vehicle Wraps', desc: 'See dramatic before & after wrap transformations â real projects from 9,400+ vehicles. Browse the gallery â', title: 'Before & After Vehicle Wraps | Real Projects | Chicago Fleet Wraps', category: 'Tools', keywords: 'vehicle wrap before after, wrap transformation, fleet wrap examples, wrap results', content: 'See dramatic before and after vehicle wrap transformations. Real projects from Chicago Fleet Wraps featuring commercial fleets, color changes, and custom designs.' },
  { slug: 'vinyl', url: 'vinyl', ogImage: 'pink_chrome-3.webp', heroImage: 'dune_buggy_galaxy.jpg', h1: 'Vinyl Wrap Film Guide', desc: 'Compare Avery Dennison MPI 1105, 3M IJ180-CV3 & Supreme Wrapping Film â durability, conformability & pricing. Read the guide â', title: 'Vinyl Wrap Film Guide | Compare Films | Chicago Fleet Wraps', category: 'Tools', keywords: 'vinyl wrap film guide, wrap film specs, Avery Dennison vs 3M, cast vinyl comparison', content: 'Compare vinyl wrap film specifications. Avery Dennison MPI 1105, 3M IJ180-CV3, Supreme Wrapping Film. Durability ratings, conformability, and professional recommendations.' },

  // === Blog Posts ===
  { slug: 'post-downside-wrapping', url: 'post/what-is-the-downside-of-wrapping-a-car', ogImage: 'sandals_color_change.jpg', heroImage: 'bmw_matte_black.jpg', h1: 'What Is the Downside of Wrapping a Car?', desc: 'Honest vehicle wrap trade-offs from 24+ years experience â durability, quality, surface prep & washing. Read before you wrap â', title: 'Downside of Wrapping a Car? | Honest Guide | Chicago Fleet Wraps', category: 'Blog', keywords: 'downside of wrapping a car, vehicle wrap cons, wrap disadvantages, is wrapping a car worth it', content: 'An honest look at vehicle wrap downsides from 24+ years of experience. Durability limitations, quality differences between cast and calendered vinyl, surface preparation requirements, and washing restrictions.' },
  { slug: 'post-3m-vs-avery', url: 'post/3m-vs-avery-dennison-vehicle-wraps', ogImage: 'wrap_install_closeup.jpg', heroImage: 'corvette_mid_wrap.jpg', h1: '3M vs Avery Dennison Vehicle Wraps', desc: '3M IJ180-CV3 vs Avery Dennison MPI 1105 â from a shop that installs both daily. See which wins â', title: '3M vs Avery Dennison Wraps | Head-to-Head | Chicago Fleet Wraps', category: 'Blog', keywords: '3M vs Avery Dennison, 3M IJ180 vs MPI 1105, best wrap vinyl, wrap material comparison', content: 'Head-to-head comparison of 3M IJ180-CV3 vs Avery Dennison MPI 1105 cast vinyl. Adhesive technology, conformability, durability, and pricing from a shop that installs both daily.' },
  { slug: 'post-fleet-decals', url: 'post/top-benefits-of-custom-decals', ogImage: 'diecut_sheriff_k9.webp', heroImage: '4aces_suv.jpg', h1: 'Top Benefits of Custom Decals for Fleet Vehicles', desc: 'Fleet decals deliver massive ROI â cost-effective branding, 24/7 advertising, easy updates. See why they work â', title: 'Top Benefits of Fleet Decals | ROI Guide | Chicago Fleet Wraps', category: 'Blog', keywords: 'custom fleet decals, vehicle decal benefits, fleet decal ROI, commercial decals', content: 'Why fleet decals deliver massive ROI. Cost-effective branding, 24/7 advertising exposure, easy updates and replacements. Professional fleet decal design and installation.' },
  { slug: 'post-wrap-cost', url: 'post/how-much-does-a-car-wrap-cost', ogImage: 'small_suv.webp', heroImage: 'cfw_van_2.webp', h1: 'How Much Does a Car Wrap Cost in Chicago?', desc: 'Real 2026 wrap pricing â sedans from $3,750, vans from $3,750, box trucks from $5,000. Premium cast vinyl only. See all prices â', title: 'Car Wrap Cost Chicago | 2026 Pricing | Chicago Fleet Wraps', category: 'Blog', keywords: 'car wrap cost Chicago, how much does a wrap cost, vehicle wrap pricing, wrap price by vehicle type', content: 'Real vehicle wrap pricing in Chicago. Sedans from $3,750, SUVs from $3,900, cargo vans from $3,750, sprinters from $4,700, box trucks from $5,000â$10,900. Premium cast vinyl only.' },
  { slug: 'post-3m-vinyl-2025', url: 'post/3m-vinyl-wraps-chicago-fleet', ogImage: 'cfw_van_3.webp', heroImage: 'cfw_truck_1.webp', h1: '3M Vinyl Wraps: Best Choice for Your Chicago Fleet', desc: '3M IJ180-CV3 cast vinyl â extreme durability in Chicago weather, UV resistance & paint protection. Learn why it\'s the standard â', title: '3M Vinyl Wraps Chicago | Fleet Standard | Chicago Fleet Wraps', category: 'Blog', keywords: '3M vinyl wraps Chicago, 3M IJ180-CV3, 3M fleet wraps, best vinyl for fleet, 3M cast vinyl', content: '3M IJ180-CV3 cast vinyl remains the industry standard for fleet graphics. Extreme durability in Chicago weather, UV resistance, and paint protection.' },

  // === City/Geo Pages ===
  { slug: 'geo-chicago', url: 'chicago', ogImage: 'cfw_truck_1.webp', heroImage: 'frontier_fleet_vans.jpg', h1: 'Fleet Wraps Chicago, IL', desc: 'Fleet wraps in Chicago â cargo vans, box trucks, sprinters. â 5.0 rated. Avery Dennison & 3M certified. Free pickup â (312) 597-1286.', title: 'Fleet Wraps Chicago, IL | â 5.0 Rated | Chicago Fleet Wraps', category: 'Cities', city: 'Chicago', keywords: 'fleet wraps Chicago, vehicle wraps Chicago IL, car wraps Chicago, commercial wraps Chicago, wrap shop Chicago' },
  { slug: 'geo-schaumburg', url: 'schaumburg', ogImage: 'cfw_van_2.webp', heroImage: 'cfw_truck_3.webp', h1: 'Fleet Wraps Schaumburg, IL', desc: 'Fleet wraps serving Schaumburg â free pickup & delivery. Premium cast vinyl. â 5.0 rated. Get your free estimate â', title: 'Fleet Wraps Schaumburg, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Schaumburg', keywords: 'fleet wraps Schaumburg, vehicle wraps Schaumburg IL, car wraps Schaumburg, commercial wraps Schaumburg' },
  { slug: 'geo-naperville', url: 'naperville', ogImage: 'cfw_van_3.webp', heroImage: 'cfw_van_1.webp', h1: 'Fleet Wraps Naperville, IL', desc: 'Fleet wraps serving Naperville â free pickup & delivery. Premium cast vinyl. â 5.0 rated. Get your free estimate â', title: 'Fleet Wraps Naperville, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Naperville', keywords: 'fleet wraps Naperville, vehicle wraps Naperville IL, car wraps Naperville, commercial wraps Naperville' },
  { slug: 'geo-aurora', url: 'aurora', ogImage: 'cfw_truck_2.webp', heroImage: 'precision_today_sprinter.jpg', h1: 'Fleet Wraps Aurora, IL', desc: 'Fleet wraps serving Aurora â free pickup & delivery. Premium cast vinyl. â 5.0 rated. Get your free estimate â', title: 'Fleet Wraps Aurora, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Aurora', keywords: 'fleet wraps Aurora, vehicle wraps Aurora IL, car wraps Aurora, commercial wraps Aurora' },
  { slug: 'geo-elgin', url: 'elgin', ogImage: 'precision_today_hvac.jpg', heroImage: 'sbc_hvac_van.jpg', h1: 'Fleet Wraps Elgin, IL', desc: 'Fleet wraps serving Elgin â free pickup & delivery. Premium cast vinyl. â 5.0 rated. Get your free estimate â', title: 'Fleet Wraps Elgin, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Elgin', keywords: 'fleet wraps Elgin, vehicle wraps Elgin IL, car wraps Elgin, commercial wraps Elgin' },
  { slug: 'geo-joliet', url: 'joliet', ogImage: 'exalt_air_pick_up_truck.webp', heroImage: 'arnold_electric_van.jpg', h1: 'Fleet Wraps Joliet, IL', desc: 'Fleet wraps serving Joliet â free pickup & delivery. Premium cast vinyl. â 5.0 rated. Get your free estimate â', title: 'Fleet Wraps Joliet, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Joliet', keywords: 'fleet wraps Joliet, vehicle wraps Joliet IL, car wraps Joliet, commercial wraps Joliet' },
  { slug: 'geo-evanston', url: 'evanston', ogImage: 'small_transit_van_opt.webp', heroImage: 'cfw_van_2.webp', h1: 'Fleet Wraps Evanston, IL', desc: 'Fleet wraps serving Evanston â free pickup & delivery. Premium cast vinyl. â 5.0 rated. Get your free estimate â', title: 'Fleet Wraps Evanston, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Evanston', keywords: 'fleet wraps Evanston, vehicle wraps Evanston IL, car wraps Evanston, commercial wraps Evanston' },
  { slug: 'geo-skokie', url: 'skokie', ogImage: 'sns_roofing_truck.webp', heroImage: 'cfw_truck_1.webp', h1: 'Fleet Wraps Skokie, IL', desc: 'Fleet wraps serving Skokie â free pickup & delivery. Premium cast vinyl. â 5.0 rated. Get your free estimate â', title: 'Fleet Wraps Skokie, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Skokie', keywords: 'fleet wraps Skokie, vehicle wraps Skokie IL, car wraps Skokie, commercial wraps Skokie' },
  { slug: 'geo-oak-park', url: 'oak-park', ogImage: 'arnold_electric_truck.jpg', heroImage: 'precision_today_hvac.jpg', h1: 'Fleet Wraps Oak Park, IL', desc: 'Fleet wraps serving Oak Park â free pickup & delivery. Premium cast vinyl. â 5.0 rated. Get your free estimate â', title: 'Fleet Wraps Oak Park, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Oak Park', keywords: 'fleet wraps Oak Park, vehicle wraps Oak Park IL, car wraps Oak Park, commercial wraps Oak Park' },
  { slug: 'geo-wilmette', url: 'wilmette', ogImage: 'windy_city_box_truck.webp', heroImage: 'blondies_beef_truck.jpg', h1: 'Fleet Wraps Wilmette, IL', desc: 'Fleet wraps serving Wilmette â free pickup & delivery. Premium cast vinyl. â 5.0 rated. Get your free estimate â', title: 'Fleet Wraps Wilmette, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Wilmette', keywords: 'fleet wraps Wilmette, vehicle wraps Wilmette IL, car wraps Wilmette, commercial wraps Wilmette' },
  // Extended city pages
  { slug: 'geo-arlington-heights', url: 'arlington-heights', ogImage: 'cfw_van_1.webp', heroImage: 'cfw_truck_2.webp', h1: 'Fleet Wraps Arlington Heights, IL', desc: 'Fleet wraps serving Arlington Heights â free pickup & delivery. Premium cast vinyl. â 5.0 rated. Get your free estimate â', title: 'Fleet Wraps Arlington Heights, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Arlington Heights', keywords: 'fleet wraps Arlington Heights, vehicle wraps Arlington Heights IL, car wraps Arlington Heights' },
  { slug: 'geo-des-plaines', url: 'des-plaines', ogImage: 'frontier_fleet_vans.jpg', heroImage: 'cfw_van_3.webp', h1: 'Fleet Wraps Des Plaines, IL', desc: 'Fleet wraps serving Des Plaines â free pickup & delivery. Premium cast vinyl. â 5.0 rated. Get your free estimate â', title: 'Fleet Wraps Des Plaines, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Des Plaines', keywords: 'fleet wraps Des Plaines, vehicle wraps Des Plaines IL, car wraps Des Plaines' },
  { slug: 'geo-palatine', url: 'palatine', ogImage: 'precision_today_sprinter.jpg', heroImage: 'small_transit_van_opt.webp', h1: 'Fleet Wraps Palatine, IL', desc: 'Fleet wraps serving Palatine â free pickup & delivery. Premium cast vinyl. â 5.0 rated. Get your free estimate â', title: 'Fleet Wraps Palatine, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Palatine', keywords: 'fleet wraps Palatine, vehicle wraps Palatine IL, car wraps Palatine' },
  { slug: 'geo-wheaton', url: 'wheaton', ogImage: 'cfw_truck_3.webp', heroImage: 'exalt_air_pick_up_truck.webp', h1: 'Fleet Wraps Wheaton, IL', desc: 'Fleet wraps serving Wheaton â free pickup & delivery. Premium cast vinyl. â 5.0 rated. Get your free estimate â', title: 'Fleet Wraps Wheaton, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Wheaton', keywords: 'fleet wraps Wheaton, vehicle wraps Wheaton IL, car wraps Wheaton' },
  { slug: 'geo-downers-grove', url: 'downers-grove', ogImage: 'hunt_brothers_pizza_truck.jpg', heroImage: 'sns_roofing_truck.webp', h1: 'Fleet Wraps Downers Grove, IL', desc: 'Fleet wraps serving Downers Grove â free pickup & delivery. Premium cast vinyl. â 5.0 rated. Get your free estimate â', title: 'Fleet Wraps Downers Grove, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Downers Grove', keywords: 'fleet wraps Downers Grove, vehicle wraps Downers Grove IL, car wraps Downers Grove' },
  { slug: 'geo-lombard', url: 'lombard', ogImage: 'arnold_electric_van.jpg', heroImage: 'windy_city_box_truck.webp', h1: 'Fleet Wraps Lombard, IL', desc: 'Fleet wraps serving Lombard â free pickup & delivery. Premium cast vinyl. â 5.0 rated. Get your free estimate â', title: 'Fleet Wraps Lombard, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Lombard', keywords: 'fleet wraps Lombard, vehicle wraps Lombard IL, car wraps Lombard' },
  { slug: 'geo-elmhurst', url: 'elmhurst', ogImage: 'sbc_hvac_van.jpg', heroImage: 'arnold_electric_sales.jpg', h1: 'Fleet Wraps Elmhurst, IL', desc: 'Fleet wraps serving Elmhurst â free pickup & delivery. Premium cast vinyl. â 5.0 rated. Get your free estimate â', title: 'Fleet Wraps Elmhurst, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Elmhurst', keywords: 'fleet wraps Elmhurst, vehicle wraps Elmhurst IL, car wraps Elmhurst' },
  { slug: 'geo-tinley-park', url: 'tinley-park', ogImage: 'blondies_beef_truck.jpg', heroImage: 'stark_cement_mixer.jpg', h1: 'Fleet Wraps Tinley Park, IL', desc: 'Fleet wraps serving Tinley Park â free pickup & delivery. Premium cast vinyl. â 5.0 rated. Get your free estimate â', title: 'Fleet Wraps Tinley Park, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Tinley Park', keywords: 'fleet wraps Tinley Park, vehicle wraps Tinley Park IL, car wraps Tinley Park' },
  { slug: 'geo-orland-park', url: 'orland-park', ogImage: 'stark_cement_mixer.jpg', heroImage: 'cfw_truck_1.webp', h1: 'Fleet Wraps Orland Park, IL', desc: 'Fleet wraps serving Orland Park â free pickup & delivery. Premium cast vinyl. â 5.0 rated. Get your free estimate â', title: 'Fleet Wraps Orland Park, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Orland Park', keywords: 'fleet wraps Orland Park, vehicle wraps Orland Park IL, car wraps Orland Park' },
  { slug: 'geo-bolingbrook', url: 'bolingbrook', ogImage: '4aces_suv.jpg', heroImage: 'small_suv.webp', h1: 'Fleet Wraps Bolingbrook, IL', desc: 'Fleet wraps serving Bolingbrook â free pickup & delivery. Premium cast vinyl. â 5.0 rated. Get your free estimate â', title: 'Fleet Wraps Bolingbrook, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Bolingbrook', keywords: 'fleet wraps Bolingbrook, vehicle wraps Bolingbrook IL, car wraps Bolingbrook' },
];

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ============================================================
// CITY DATA â genuinely unique content for each location page
// ============================================================
const CITY_DATA = {
  'Chicago': {
    county: 'Cook',
    pop: '2.7 million',
    coords: '41.8781, -87.6298',
    driveTime: '0 min â we\'re local',
    routeFromShop: 'Our shop is right here at 4711 N Lamon Ave #7 #7 on the Northwest Side.',
    landmarks: ['Willis Tower', 'Millennium Park', 'Navy Pier', 'Wrigley Field', 'United Center'],
    businessDistricts: ['Loop', 'River North', 'West Loop', 'Lincoln Park', 'Wicker Park', 'Pilsen'],
    localContext: 'As Chicago\'s home-base fleet wrap shop, we\'ve wrapped vehicles for restaurants on Randolph Street, HVAC contractors in Bridgeport, electricians in Edison Park, and delivery fleets running routes from South Loop to Rogers Park. Chicago\'s 77 neighborhoods mean 77 different audiences seeing your wrapped vehicle every single day.',
    industries: ['restaurants and food service', 'HVAC and mechanical contractors', 'property management companies', 'delivery and logistics fleets', 'construction and general contractors'],
    parkingTip: 'Street parking near our shop is free and plentiful. We also have a gated lot for overnight vehicle storage during multi-day installs.',
    nearbyClients: 'We\'ve completed fleet wraps for service companies operating out of the Northwest Side industrial corridor, food trucks based in Pilsen, and electrical contractors headquartered in Jefferson Park.',
  },
  'Schaumburg': {
    county: 'Cook',
    pop: '78,000',
    coords: '42.0334, -88.0834',
    driveTime: '35 min',
    routeFromShop: 'Straight shot west on I-90 from our shop at 4711 N Lamon Ave #7 #7 â 22 miles, about 35 minutes outside rush hour.',
    landmarks: ['Woodfield Mall', 'Legoland Discovery Center', 'Medieval Times', 'Schaumburg Boomers Stadium'],
    businessDistricts: ['Woodfield Corporate Center', 'East Golf Road corridor', 'Meacham Road industrial area'],
    localContext: 'Schaumburg is one of the largest commercial centers in the Midwest outside downtown Chicago. The Woodfield corridor alone has thousands of businesses that rely on service vehicles â HVAC techs, plumbing companies, IT service providers, and delivery fleets. A wrapped van driving Meacham Road or Golf Road during business hours reaches decision-makers at corporate parks all day long.',
    industries: ['IT and managed services providers', 'corporate facility maintenance', 'medical equipment delivery', 'restaurant supply companies', 'commercial cleaning services'],
    parkingTip: 'We pick up directly from your Schaumburg office or lot â no need to drive to our shop. Free round-trip included.',
    nearbyClients: 'We\'ve wrapped HVAC fleets operating from the Meacham Road industrial corridor and delivery vans serving the Woodfield business district.',
  },
  'Naperville': {
    county: 'DuPage',
    pop: '149,000',
    coords: '41.7508, -88.1535',
    driveTime: '45 min',
    routeFromShop: 'Take I-290 west to I-88, exit at Naperville Road. About 38 miles from our shop, typically 45 minutes.',
    landmarks: ['Riverwalk', 'Centennial Beach', 'Naper Settlement', 'DuPage Children\'s Museum'],
    businessDistricts: ['Route 59 corridor', 'Ogden Avenue commercial strip', 'Freedom Commons', 'Iroquois Center'],
    localContext: 'Naperville consistently ranks among the best places to live and do business in Illinois. Its affluent residential neighborhoods mean homeowners regularly hire HVAC, plumbing, electrical, and landscaping contractors â exactly the businesses that benefit most from wrapped vehicles. A branded van parked in a Naperville driveway is the best referral tool money can buy.',
    industries: ['home service contractors (HVAC, plumbing, electrical)', 'landscaping and lawn care companies', 'real estate brokerages', 'medical and dental practices', 'catering and event companies'],
    parkingTip: 'We provide free pickup and return delivery to any Naperville address â your business, your home, wherever the vehicle is.',
    nearbyClients: 'We\'ve wrapped contractor fleets based along the Route 59 corridor and service vehicles for home improvement companies operating throughout DuPage County.',
  },
  'Aurora': {
    county: 'Kane/DuPage',
    pop: '180,000',
    coords: '41.7606, -88.3201',
    driveTime: '50 min',
    routeFromShop: 'I-290 west to I-88, continue past Naperville to Aurora. About 43 miles from our shop.',
    landmarks: ['Paramount Theatre', 'Phillips Park Zoo', 'Hollywood Casino Aurora', 'RiverEdge Park'],
    businessDistricts: ['Route 30 (Lincoln Highway) corridor', 'Farnsworth Avenue', 'Eola Road business parks', 'New York Street downtown'],
    localContext: 'Aurora is Illinois\' second-largest city and a major employment center straddling Kane and DuPage counties. The city\'s mix of industrial parks along Farnsworth Avenue, retail corridors on Route 59, and residential neighborhoods creates dense, diverse audiences for wrapped vehicles. HVAC and plumbing contractors based in Aurora cover a massive service radius â their wrapped vans are seen across four counties daily.',
    industries: ['manufacturing and warehouse logistics', 'HVAC and plumbing service companies', 'auto dealership service fleets', 'pest control companies', 'residential cleaning and maid services'],
    parkingTip: 'Free pickup from anywhere in Aurora â we come to you, wrap the vehicle at our shop, and deliver it back.',
    nearbyClients: 'We\'ve completed box truck wraps for distribution companies along the I-88 corridor and service van wraps for contractors operating in Aurora\'s west-side industrial parks.',
  },
  'Elgin': {
    county: 'Kane/Cook',
    pop: '114,000',
    coords: '42.0354, -88.2826',
    driveTime: '45 min',
    routeFromShop: 'I-90 west to Route 25 north. About 40 miles from our shop, roughly 45 minutes.',
    landmarks: ['Grand Victoria Casino', 'Elgin National Watch Company building', 'Gail Borden Public Library', 'Lords Park Zoo'],
    businessDistricts: ['Randall Road commercial corridor', 'McLean Boulevard industrial area', 'Big Timber Road business parks'],
    localContext: 'Elgin sits at the crossroads of Kane and Cook counties, making it a strategic hub for service companies covering the northwest suburbs. The Randall Road corridor is one of the busiest commercial strips in the Fox Valley â a wrapped vehicle here gets consistent exposure to both consumer and commercial audiences. Elgin\'s growing industrial base along McLean Boulevard also means more B2B fleet branding opportunities.',
    industries: ['mechanical and HVAC contractors', 'roofing and siding companies', 'food distribution and catering', 'janitorial and commercial cleaning', 'landscaping and snow removal'],
    parkingTip: 'Free pickup from your Elgin location. We handle the logistics so your vehicle downtime is minimal.',
    nearbyClients: 'We\'ve wrapped sprinter vans for HVAC companies on Randall Road and box trucks for food distributors in Elgin\'s industrial district.',
  },
  'Joliet': {
    county: 'Will',
    pop: '150,000',
    coords: '41.5250, -88.0817',
    driveTime: '55 min',
    routeFromShop: 'I-55 south from Chicago. About 48 miles from our shop, roughly 55 minutes.',
    landmarks: ['Chicagoland Speedway', 'Rialto Square Theatre', 'Harrah\'s Casino', 'Joliet Iron Works Historic Site'],
    businessDistricts: ['Larkin Avenue corridor', 'Route 30 (Lincoln Highway)', 'I-80 logistics corridor', 'CenterPoint Intermodal'],
    localContext: 'Joliet is the gateway to Will County â one of the fastest-growing counties in Illinois. The I-80 logistics corridor and CenterPoint Intermodal make it a national hub for trucking and distribution. Fleet wraps here aren\'t just local advertising â they travel interstate. Joliet\'s booming residential development also fuels demand for home service contractors who need branded vehicles.',
    industries: ['trucking and logistics companies', 'warehouse and distribution centers', 'residential construction contractors', 'plumbing and drain service companies', 'moving and relocation companies'],
    parkingTip: 'We provide free pickup throughout Joliet and Will County â including from warehouse lots and industrial parks.',
    nearbyClients: 'We\'ve wrapped delivery fleets for logistics companies near CenterPoint and service vans for plumbing contractors operating across Will County.',
  },
  'Evanston': {
    county: 'Cook',
    pop: '79,000',
    coords: '42.0451, -87.6877',
    driveTime: '25 min',
    routeFromShop: 'North on Cicero Ave to Touhy, east to Evanston. Just 12 miles from our shop â about 25 minutes.',
    landmarks: ['Northwestern University', 'Grosse Point Lighthouse', 'Davis Street shopping district', 'Evanston Art Center'],
    businessDistricts: ['Davis Street downtown', 'Central Street corridor', 'Dempster Street commercial strip', 'Main Street business district'],
    localContext: 'Evanston is one of the most densely populated and affluent suburbs on the North Shore. With Northwestern University\'s campus driving foot traffic and a vibrant downtown, wrapped service vehicles here get premium exposure. The mix of older homes requiring constant maintenance creates a steady market for HVAC, plumbing, electrical, and renovation contractors â all prime candidates for fleet wraps.',
    industries: ['university service contractors', 'residential renovation and remodeling', 'property management companies', 'restaurant and catering businesses', 'medical and dental practices'],
    parkingTip: 'Free pickup from anywhere in Evanston. We\'re only 25 minutes away â one of our closest service areas.',
    nearbyClients: 'We\'ve wrapped contractor vans for renovation companies working on Evanston\'s historic homes and delivery vehicles for restaurants on Davis Street.',
  },
  'Skokie': {
    county: 'Cook',
    pop: '67,000',
    coords: '42.0324, -87.7416',
    driveTime: '15 min',
    routeFromShop: 'East on Touhy Ave â just 7 miles from our shop. One of our closest service areas at about 15 minutes.',
    landmarks: ['Illinois Holocaust Museum', 'Westfield Old Orchard mall', 'North Shore Center for the Performing Arts', 'Skokie Lagoons'],
    businessDistricts: ['Old Orchard Road retail area', 'Dempster Street corridor', 'Skokie Boulevard business district', 'McCormick Boulevard industrial area'],
    localContext: 'Skokie is practically our next-door neighbor â just 15 minutes from our shop. This dense suburban hub is home to hundreds of small service businesses that serve both Skokie residents and the broader North Shore. The Dempster-Skokie corridor is a non-stop stream of commercial traffic, and a wrapped van here is seen by the exact homeowners who hire contractors. We\'ve wrapped more vehicles for Skokie businesses than almost any other suburb.',
    industries: ['HVAC and heating companies', 'electrical contractors', 'commercial cleaning services', 'auto body and detailing shops', 'home health care companies'],
    parkingTip: 'We\'re 15 minutes away. Free pickup or drive in â either way, the fastest turnaround of any suburb we serve.',
    nearbyClients: 'We regularly wrap service vans for HVAC companies on Dempster Street and electrician trucks for contractors based in Skokie\'s light industrial district.',
  },
  'Oak Park': {
    county: 'Cook',
    pop: '52,000',
    coords: '41.8850, -87.7845',
    driveTime: '15 min',
    routeFromShop: 'South on Cicero Ave or Harlem Ave â just 6 miles from our shop. About 15 minutes.',
    landmarks: ['Frank Lloyd Wright Home and Studio', 'Ernest Hemingway Birthplace', 'Unity Temple', 'Lake Street shopping district'],
    businessDistricts: ['Lake Street corridor', 'Madison Street commercial strip', 'Roosevelt Road business district', 'North Avenue mixed-use area'],
    localContext: 'Oak Park is a historic village known for its Frank Lloyd Wright architecture and strict building preservation standards â which means constant renovation and maintenance work. Contractors, painters, HVAC techs, and plumbers working on Oak Park\'s iconic homes benefit enormously from professional vehicle wraps. A clean, branded van parked outside a Prairie-style home signals quality and professionalism to neighbors watching from across the street.',
    industries: ['historic home renovation contractors', 'painting and decorating companies', 'HVAC and plumbing specialists', 'tree care and landscaping services', 'home inspection companies'],
    parkingTip: 'We\'re just 15 minutes from Oak Park. Free pickup from your home or business.',
    nearbyClients: 'We\'ve wrapped contractor vans for renovation specialists who work exclusively on Oak Park\'s historic home stock and HVAC companies serving the near-west suburbs.',
  },
  'Wilmette': {
    county: 'Cook',
    pop: '28,000',
    coords: '42.0722, -87.7253',
    driveTime: '20 min',
    routeFromShop: 'North on Cicero to Touhy, east to Green Bay Road. About 10 miles from our shop â 20 minutes.',
    landmarks: ['BahÃ¡\'Ã­ House of Worship', 'Gillson Park and Beach', 'Plaza del Lago shopping center', 'Wilmette Harbor'],
    businessDistricts: ['Green Bay Road village center', 'Skokie Highway commercial strip', 'Lake Avenue mixed-use district'],
    localContext: 'Wilmette is one of the most affluent communities on the North Shore, with large homes and high standards for service providers. Homeowners here expect polished, professional contractors â a branded wrap instantly communicates credibility. Landscapers, electricians, painters, and HVAC companies working in Wilmette often report that their wrap generates referral conversations with neighbors who see the van in driveways.',
    industries: ['premium landscaping and estate maintenance', 'high-end home renovation', 'HVAC and mechanical contractors', 'painting and exterior restoration', 'custom cabinetry and millwork installers'],
    parkingTip: 'Free pickup from any Wilmette address. We\'re less than 20 minutes from the North Shore.',
    nearbyClients: 'We\'ve wrapped vehicles for landscaping companies maintaining Wilmette estates and HVAC contractors serving the North Shore.',
  },
  'Arlington Heights': {
    county: 'Cook',
    pop: '77,000',
    coords: '42.0884, -87.9806',
    driveTime: '25 min',
    routeFromShop: 'I-90 west to Arlington Heights Road exit. About 18 miles from our shop â 25 minutes.',
    landmarks: ['Arlington Park (former racetrack redevelopment)', 'Metropolis Performing Arts Centre', 'Long Grove historic downtown', 'Arlington Heights Memorial Library'],
    businessDistricts: ['Arlington Heights Road corridor', 'Rand Road commercial strip', 'Golf Road business area', 'Algonquin Road industrial parks'],
    localContext: 'Arlington Heights is the commercial engine of the northwest suburbs. The intersection of I-90, Route 53, and Route 14 creates a natural hub for service businesses covering a huge territory from Palatine to Buffalo Grove to Mount Prospect. A wrapped van driving the Arlington Heights Road corridor during peak hours reaches thousands of commuters and business owners. The village\'s massive redevelopment of the former Arlington Park site is also bringing new commercial tenants who\'ll need fleet branding.',
    industries: ['mechanical and HVAC contractors', 'commercial roofing companies', 'office technology and copier service', 'pest control and lawn care', 'medical courier and transport services'],
    parkingTip: 'Free pickup from your Arlington Heights location â business, residential, or fleet yard.',
    nearbyClients: 'We\'ve wrapped HVAC fleets based on Algonquin Road and commercial service vehicles for companies operating out of the Golf Road business corridor.',
  },
  'Des Plaines': {
    county: 'Cook',
    pop: '60,000',
    coords: '42.0334, -87.8834',
    driveTime: '15 min',
    routeFromShop: 'North on Harlem Ave to Touhy, west on Touhy to Des Plaines. Just 8 miles from our shop â about 15 minutes.',
    landmarks: ['Rivers Casino Des Plaines', 'Lake Opeka', 'Des Plaines Theatre', 'Mystic Waters Family Aquatic Center'],
    businessDistricts: ['Mannheim Road corridor', 'Oakton Street business district', 'Ellinwood Street downtown', 'River Road industrial zone'],
    localContext: 'Des Plaines sits right next to O\'Hare Airport, making it a strategic location for logistics, transportation, and service companies that need airport-area visibility. The Mannheim Road corridor is one of the busiest commercial strips in the northwest suburbs, and a wrapped vehicle here gets exposure to an incredible volume of traffic. The city\'s proximity to our shop also means the fastest turnaround times â your vehicle can be picked up and returned the same week.',
    industries: ['airport shuttle and transportation services', 'logistics and warehousing companies', 'restaurant and food delivery services', 'commercial cleaning and janitorial', 'automotive repair and towing services'],
    parkingTip: 'We\'re just 15 minutes from Des Plaines â one of our fastest pickup-and-return areas.',
    nearbyClients: 'We\'ve wrapped shuttle vans for airport transportation companies on Mannheim Road and service vehicles for commercial cleaning companies in the River Road industrial zone.',
  },
  'Palatine': {
    county: 'Cook',
    pop: '69,000',
    coords: '42.1103, -88.0340',
    driveTime: '30 min',
    routeFromShop: 'I-90 west to Roselle Road or Route 53, north to Palatine. About 22 miles from our shop.',
    landmarks: ['Palatine Hills Golf Course', 'Durty Nellie\'s (historic pub)', 'Fred P. Hall Amphitheater', 'Palatine Trail System'],
    businessDistricts: ['Northwest Highway corridor', 'Rand Road retail strip', 'Palatine Road business parks', 'Hicks Road commercial area'],
    localContext: 'Palatine is the geographic center of the northwest suburban service market. Contractors based here cover territory from Barrington to Hoffman Estates to Inverness â affluent communities with high demand for home services. The Northwest Highway and Rand Road corridors carry heavy daily traffic, giving wrapped vehicles consistent exposure. Palatine\'s mix of residential subdivisions and commercial parks means your branded van is seen by both homeowners and business decision-makers.',
    industries: ['roofing and exterior contractors', 'HVAC and refrigeration companies', 'residential electrical contractors', 'painting and drywall companies', 'swimming pool service and maintenance'],
    parkingTip: 'Free pickup from anywhere in Palatine. We handle the logistics so you don\'t lose a workday.',
    nearbyClients: 'We\'ve wrapped contractor trucks for roofing companies on Northwest Highway and sprinter vans for HVAC businesses covering the Palatine-to-Barrington corridor.',
  },
  'Wheaton': {
    county: 'DuPage',
    pop: '54,000',
    coords: '41.8661, -88.1070',
    driveTime: '40 min',
    routeFromShop: 'I-290 west to I-88 or Roosevelt Road to Wheaton. About 30 miles from our shop.',
    landmarks: ['Cantigny Park', 'Cosley Zoo', 'Wheaton College', 'DuPage County Fairgrounds', 'Illinois Prairie Path trailhead'],
    businessDistricts: ['Roosevelt Road commercial corridor', 'Geneva Road business strip', 'Naperville Road office parks', 'Butterfield Road mixed-use area'],
    localContext: 'Wheaton is the DuPage County seat and the administrative center for one of the wealthiest counties in Illinois. County government offices, courthouses, and legal services create a professional environment where polished branding matters. The surrounding residential neighborhoods â from older homes near downtown to newer developments near Danada â keep home service contractors busy year-round. A branded vehicle is the single best marketing investment for any Wheaton-area contractor.',
    industries: ['legal and professional services', 'residential remodeling contractors', 'landscaping and estate maintenance', 'HVAC and plumbing service companies', 'senior care and home health services'],
    parkingTip: 'Free pickup from anywhere in Wheaton and DuPage County. We deliver your wrapped vehicle right back to your door.',
    nearbyClients: 'We\'ve wrapped service fleets for contractors based along Roosevelt Road and delivery vans for companies operating in Wheaton\'s downtown business district.',
  },
  'Downers Grove': {
    county: 'DuPage',
    pop: '50,000',
    coords: '41.7959, -88.0118',
    driveTime: '35 min',
    routeFromShop: 'I-290 west to I-88, exit Finley Road or I-355. About 27 miles from our shop.',
    landmarks: ['Tivoli Theatre', 'Lyman Woods Nature Center', 'Downers Grove Museum', 'Main Street downtown district'],
    businessDistricts: ['Ogden Avenue commercial corridor', 'Butterfield Road corporate parks', 'Finley Road office area', 'Highland Avenue mixed-use strip'],
    localContext: 'Downers Grove sits at the crossroads of I-88 and I-355, giving local businesses access to the entire DuPage County market. The Butterfield Road corridor alone has dozens of corporate campuses and office parks â a wrapped van servicing these buildings is seen by thousands of professionals daily. The village\'s walkable downtown and established neighborhoods also create steady demand for residential service contractors.',
    industries: ['corporate facility services', 'IT and technology service companies', 'plumbing and drain specialists', 'commercial HVAC and refrigeration', 'office furniture and equipment delivery'],
    parkingTip: 'Free pickup from any Downers Grove address. We frequently serve the I-88 corridor businesses.',
    nearbyClients: 'We\'ve wrapped service fleets for facility management companies on Butterfield Road and contractor vans for plumbing businesses serving the Downers Grove area.',
  },
  'Lombard': {
    county: 'DuPage',
    pop: '44,000',
    coords: '41.8800, -88.0078',
    driveTime: '30 min',
    routeFromShop: 'I-290 west to Roosevelt Road or North Avenue through Lombard. About 24 miles from our shop.',
    landmarks: ['Lilacia Park (famous for lilacs and tulips)', 'Yorktown Center mall', 'Lombard Historical Society', 'Great Western Prairie'],
    businessDistricts: ['Roosevelt Road corridor', 'North Avenue commercial strip', 'Butterfield Road business parks', 'Highland Avenue village center'],
    localContext: 'Lombard â the "Lilac Village" â is a central DuPage County hub with excellent highway access via I-355, I-88, and I-290. The Roosevelt Road corridor is one of the most heavily trafficked commercial strips in the western suburbs, providing maximum exposure for wrapped vehicles. Lombard\'s position between Elmhurst, Glen Ellyn, and Downers Grove means service contractors based here cover a huge territory, making fleet branding especially valuable for brand recognition across multiple communities.',
    industries: ['general contracting and home improvement', 'electrical and lighting companies', 'HVAC service and installation', 'auto glass and body shops', 'commercial printing and signage (complementary service)'],
    parkingTip: 'Free pickup from Lombard. We\'re 30 minutes away and service the area regularly.',
    nearbyClients: 'We\'ve wrapped contractor trucks for general contractors on Roosevelt Road and service vans for HVAC companies covering the Lombard-to-Glen Ellyn area.',
  },
  'Elmhurst': {
    county: 'DuPage',
    pop: '47,000',
    coords: '41.8995, -87.9403',
    driveTime: '20 min',
    routeFromShop: 'South on Harlem to North Avenue, west to Elmhurst. Or I-290 to Route 83. About 14 miles â 20 minutes.',
    landmarks: ['Elmhurst Art Museum', 'Lizzadro Museum of Lapidary Art', 'Wilder Park', 'York Theatre', 'Elmhurst College campus'],
    businessDistricts: ['York Road corridor', 'Route 83 commercial strip', 'North Avenue business district', 'Spring Road downtown area'],
    localContext: 'Elmhurst is a high-income community where homeowners invest heavily in property maintenance and improvement. The village\'s tree-lined streets and well-maintained homes create a strong market for HVAC, plumbing, landscaping, and renovation contractors. York Road and Route 83 carry heavy north-south traffic between I-290 and the Butterfield corridor â a wrapped van on these routes reaches a consistently affluent audience.',
    industries: ['residential renovation and remodeling', 'tree care and arborist services', 'HVAC and geothermal installers', 'kitchen and bath remodeling', 'painting and wallpaper contractors'],
    parkingTip: 'Free pickup from Elmhurst. We\'re just 20 minutes away â one of our closest DuPage County service areas.',
    nearbyClients: 'We\'ve wrapped contractor vans for remodeling companies on York Road and service vehicles for HVAC businesses covering Elmhurst and Villa Park.',
  },
  'Tinley Park': {
    county: 'Cook/Will',
    pop: '57,000',
    coords: '41.5731, -87.7845',
    driveTime: '40 min',
    routeFromShop: 'I-294 south to I-80, or Harlem Ave south. About 30 miles from our shop.',
    landmarks: ['Hollywood Casino Amphitheatre', 'Tinley Park Convention Center', 'Vogt Visual Arts Center', 'Oak Park Avenue downtown'],
    businessDistricts: ['Harlem Avenue corridor', 'Oak Park Avenue downtown', '159th Street commercial strip', 'Brennan Highway industrial area'],
    localContext: 'Tinley Park straddles Cook and Will counties, giving businesses based here access to the entire south suburban market. The 159th Street and Harlem Avenue corridors are major commercial arteries with heavy daily traffic. The village\'s rapid residential growth â especially in the newer developments west of Harlem â means constant demand for home service contractors. A wrapped fleet vehicle here builds brand recognition across Orland Park, Mokena, Frankfort, and New Lenox simultaneously.',
    industries: ['residential construction and development', 'plumbing and water treatment', 'HVAC and furnace companies', 'landscaping and hardscaping', 'moving and storage companies'],
    parkingTip: 'Free pickup from Tinley Park and the entire south suburban area. We serve the I-80 corridor regularly.',
    nearbyClients: 'We\'ve wrapped contractor trucks for builders in Tinley Park\'s new developments and service vans for HVAC companies covering the south suburbs.',
  },
  'Orland Park': {
    county: 'Cook',
    pop: '59,000',
    coords: '41.6303, -87.8539',
    driveTime: '40 min',
    routeFromShop: 'I-294 south to 159th Street, or Harlem Avenue south. About 28 miles from our shop.',
    landmarks: ['Orland Square Mall', 'Centennial Park', 'John Humphrey House', 'Crystal Tree Golf Club'],
    businessDistricts: ['LaGrange Road (Route 45) corridor', 'Orland Square area', '159th Street commercial strip', 'Wolf Road business district'],
    localContext: 'Orland Park is the retail and commercial capital of the south suburbs, anchored by Orland Square Mall and the LaGrange Road corridor. This is where south suburban homeowners shop, dine, and hire contractors. A wrapped service vehicle parked in an Orland Park driveway is seen by neighbors who are the exact demographic for home services. The 159th Street and LaGrange Road intersection is one of the highest-traffic intersections in the south suburbs â prime wrap exposure.',
    industries: ['dental and medical practices', 'residential HVAC and plumbing', 'landscaping and lawn care', 'commercial cleaning services', 'real estate brokerages'],
    parkingTip: 'Free pickup from anywhere in Orland Park. We handle the entire south suburban corridor.',
    nearbyClients: 'We\'ve wrapped fleet vehicles for medical practices near Orland Square and service vans for landscaping companies covering the south suburban area.',
  },
  'Bolingbrook': {
    county: 'Will/DuPage',
    pop: '75,000',
    coords: '41.6986, -88.0684',
    driveTime: '40 min',
    routeFromShop: 'I-55 south to I-355, or I-290 to I-355. About 32 miles from our shop.',
    landmarks: ['The Promenade Bolingbrook shopping center', 'Hidden Oaks Nature Center', 'Bolingbrook Golf Club', 'Clow International Airport'],
    businessDistricts: ['Boughton Road corridor', 'Route 53 commercial strip', 'Remington Boulevard industrial parks', 'Weber Road retail area'],
    localContext: 'Bolingbrook is a fast-growing suburb straddling Will and DuPage counties with excellent highway access via I-55 and I-355. The Remington Boulevard industrial corridor is home to warehouses, distribution centers, and service companies that rely on fleet vehicles daily. Bolingbrook\'s diverse residential communities â from starter homes to executive estates â keep home service contractors busy across every price point. The I-55 corridor exposure means your wrapped vehicle is also seen by tens of thousands of commuters.',
    industries: ['warehouse and distribution companies', 'residential and commercial electrical', 'HVAC and mechanical service', 'pest control and extermination', 'courier and same-day delivery services'],
    parkingTip: 'Free pickup from Bolingbrook â we regularly service the I-355 corridor.',
    nearbyClients: 'We\'ve wrapped delivery fleets for distribution companies in the Remington Boulevard corridor and service vans for contractors covering Bolingbrook and Romeoville.',
  },
  'Berwyn': {
    county: 'Cook',
    pop: '55,000',
    coords: '41.8506, -87.7936',
    driveTime: '12 min',
    routeFromShop: 'South on Harlem Avenue â just 5 miles from our shop. One of our closest service areas.',
    landmarks: ['Cermak Plaza (Spindle sculpture site)', 'Proksa Park', 'Berwyn\'s historic bungalow district', '16 Inch Softball Hall of Fame Museum'],
    businessDistricts: ['Cermak Road (Route 66) corridor', 'Ogden Avenue commercial strip', 'Roosevelt Road business district', 'Harlem Avenue retail area'],
    localContext: 'Berwyn is practically our backyard â just 12 minutes from our shop on Harlem Avenue. This dense, working-class community is famous for its bungalow belt: thousands of closely-packed homes that need constant maintenance. Plumbers, electricians, HVAC techs, and general contractors working Berwyn\'s neighborhoods are highly visible â your wrapped van is parked 15 feet from the sidewalk where every neighbor walks by. Cermak Road (the historic Route 66) is also a major commercial artery with excellent drive-by exposure.',
    industries: ['residential plumbing and sewer', 'electrical contractors', 'roofing and gutter companies', 'painting and drywall services', 'appliance repair and installation'],
    parkingTip: 'We\'re 12 minutes away â the fastest turnaround of almost any location we serve. Free pickup included.',
    nearbyClients: 'We\'ve wrapped contractor vans for plumbing companies on Cermak Road and service trucks for electrical contractors serving the Berwyn-Cicero area.',
  },
};

// Generate 1,100+ words of genuinely unique city content
function generateCityContent(city) {
  const data = CITY_DATA[city];
  if (!data) {
    // Fallback for cities without detailed data
    return `<p class="lead speakable">Chicago Fleet Wraps provides professional fleet vehicle wrap services to businesses in ${city}, IL. Cargo vans, box trucks, sprinter vans, and pickup trucks â wrapped with Avery Dennison MPI 1105 and 3M IJ180-CV3 premium cast vinyl. Free pickup and delivery. 2-year workmanship warranty.</p>`;
  }

  return `
<p class="lead speakable">Chicago Fleet Wraps provides professional fleet vehicle wrap services to businesses throughout ${city}, IL (${data.county} County, pop. ${data.pop}). From cargo vans and box trucks to sprinter vans and pickup trucks, we wrap commercial vehicles with Avery Dennison MPI 1105 and 3M IJ180-CV3 premium cast vinyl â the same materials trusted by national fleets. Free pickup and delivery from ${city} included with every project.</p>

<h2>Getting Your Vehicle to Us from ${city}</h2>
<p>${data.routeFromShop} ${data.parkingTip} Most ${city} fleet wrap projects are completed in 3â7 business days from design approval to delivery back to your location.</p>

<h2>Why ${city} Businesses Wrap Their Fleets</h2>
<p>${data.localContext}</p>
<p>A single wrapped cargo van generates <strong>30,000â70,000 impressions per day</strong> driving through ${city}'s commercial corridors and residential neighborhoods. At a cost-per-thousand-impressions (CPM) of just <strong>$0.04â$0.48</strong>, fleet wraps deliver the highest ROI of any advertising medium â and they work 24/7, including when your vehicle is parked at a job site or in a customer's driveway.</p>

<h2>${city} Business Districts & High-Traffic Routes</h2>
<p>Your wrapped vehicle gets maximum exposure on ${city}'s busiest corridors:</p>
<ul>
${data.businessDistricts.map(d => `<li><strong>${d}</strong></li>`).join('\n')}
</ul>
<p>Whether you're driving through the ${data.businessDistricts[0]} during rush hour or parked at a residential job site near ${data.landmarks[0]}, your wrap is working â building brand recognition with every person who sees it.</p>

<h2>Top Industries We Serve in ${city}</h2>
<p>We've wrapped vehicles for dozens of ${city}-area businesses across these industries:</p>
<ul>
${data.industries.map(i => `<li>${i.charAt(0).toUpperCase() + i.slice(1)}</li>`).join('\n')}
</ul>
<p>${data.nearbyClients}</p>

<h2>What's Included in Every ${city} Fleet Wrap</h2>
<ul>
<li><strong>Free pickup and delivery</strong> from any ${city} address â business, residential, or fleet yard</li>
<li><strong>Custom design</strong> on exact vehicle templates (not generic mockups) with unlimited revisions</li>
<li><strong>Premium cast vinyl only</strong> â Avery Dennison MPI 1105 or 3M IJ180-CV3 with UV overlaminate</li>
<li><strong>Professional installation</strong> in our climate-controlled facility</li>
<li><strong>2-year workmanship warranty</strong> plus 5â7 year manufacturer vinyl warranty</li>
<li><strong>Fleet discounts</strong>: 3% for 2â4 vehicles, 7% for 5â9, 11% for 10â24, 15% for 25+</li>
</ul>

<h2>Fleet Wrap Pricing for ${city} Businesses</h2>
<p>All pricing includes design, premium materials, installation, and free pickup/delivery from ${city}:</p>
<ul>
<li><strong>Cargo van full wrap</strong>: from $3,750</li>
<li><strong>Sprinter van full wrap</strong>: from $4,700</li>
<li><strong>Box truck wrap (16â26 ft)</strong>: $5,000â$10,900</li>
<li><strong>Pickup truck wrap</strong>: from $3,200</li>
<li><strong>Partial wrap / spot graphics</strong>: from $1,500</li>
</ul>
<p>Every ${city} estimate includes real pricing â not a range. We respond within 2 business hours. <a href="/estimate/" style="color:var(--gold)">Request your free estimate â</a></p>

<h2>${city} Landmarks & Local Area</h2>
<p>${city} is home to notable landmarks including ${data.landmarks.join(', ')}. Our GPS coordinates for ${city} service: ${data.coords}. Drive time from our shop: ${data.driveTime}.</p>
<p>We serve all of ${data.county} County and surrounding areas. See our full <a href="/servicearea/" style="color:var(--gold)">service area map covering 75+ Chicagoland cities</a>.</p>
`;
}

// Build related pages for internal linking
function getRelatedPages(currentPage) {
  const related = [];
  const currentSlug = currentPage.slug;
  
  const categoryPages = PAGES.filter(p => p.category === currentPage.category && p.slug !== currentSlug);
  related.push(...categoryPages.slice(0, 3));
  
  if (currentPage.category === 'Services') {
    related.push(...PAGES.filter(p => p.category === 'Industries').slice(0, 3));
  } else if (currentPage.category === 'Industries') {
    related.push(...PAGES.filter(p => p.category === 'Services').slice(0, 3));
  } else if (currentPage.category === 'Cities') {
    related.push(...PAGES.filter(p => p.category === 'Cities' && p.slug !== currentSlug).slice(0, 4));
    related.push(...PAGES.filter(p => p.category === 'Services').slice(0, 2));
  } else if (currentPage.category === 'Blog') {
    related.push(...PAGES.filter(p => p.category === 'Blog' && p.slug !== currentSlug).slice(0, 3));
    related.push(...PAGES.filter(p => p.category === 'Services').slice(0, 2));
  } else {
    related.push(...PAGES.filter(p => p.category === 'Services').slice(0, 3));
    related.push(...PAGES.filter(p => p.category === 'Industries').slice(0, 2));
  }

  const seen = new Set();
  return related.filter(p => {
    if (seen.has(p.slug)) return false;
    seen.add(p.slug);
    return true;
  }).slice(0, 6);
}

// Service/industry-specific FAQs for FAQPage schema
const PAGE_FAQS = {
  'commercial': [
    { q: 'How much does a commercial fleet wrap cost in Chicago?', a: 'Cargo van full wraps start at $3,750. Sprinter vans from $4,700. Box trucks from $5,000â$10,900. Fleet discounts: 3% for 2â4 vehicles, 7% for 5â9, 11% for 10â24, 15% for 25+.' },
    { q: 'How long do commercial fleet wraps last?', a: 'Avery Dennison MPI 1105 and 3M IJ180-CV3 cast vinyl wraps are rated 5â7 years outdoor. With proper care, fleet wraps in Chicago regularly last 6â7 years.' },
    { q: 'Do you offer free pickup for fleet vehicles?', a: 'Yes. Free pickup and delivery throughout Chicagoland â Cook, DuPage, Kane, Lake, Will, and McHenry counties. No mileage charges.' },
    { q: 'How long does fleet wrap installation take?', a: 'Cargo vans: 1â2 days. Sprinter vans: 2â3 days. Box trucks: 2â4 days. Fleet orders are phased to minimize vehicle downtime.' },
  ],
  'boxtruck': [
    { q: 'How much does a box truck wrap cost in Chicago?', a: '16â18 ft box trucks: $4,200â$6,000. 24â26 ft box trucks: $7,000â$10,900. Includes design, premium cast vinyl, UV overlaminate, and installation.' },
    { q: 'How long does a box truck wrap take to install?', a: 'A full box truck wrap takes 2â4 business days depending on size. Design approval typically takes 2â5 days before production.' },
    { q: 'What vinyl is best for box trucks?', a: 'Avery Dennison MPI 1105 or 3M IJ180-CV3 cast vinyl only. No calendered film â the large flat panels on box trucks are where cheap vinyl fails fastest.' },
    { q: 'Can you wrap a leased box truck?', a: 'Yes. Cast vinyl wraps are fully removable without paint damage. Leased fleet vehicles are one of the most common use cases.' },
  ],
  'sprinter': [
    { q: 'How much does a Sprinter van wrap cost?', a: 'Sprinter van full wraps start at $4,700. High-roof models may cost slightly more due to additional surface area. Fleet discounts available for 3+ vehicles.' },
    { q: 'Do you wrap high-roof Sprinter vans?', a: 'Yes. We wrap both standard and high-roof Mercedes Sprinter vans. Our templates are precise to each model year and roof height.' },
    { q: 'How many impressions does a wrapped Sprinter generate?', a: 'A wrapped Sprinter van generates 30,000â70,000 daily impressions in Chicago metro traffic at a CPM of $0.04â$0.48.' },
    { q: 'What is the turnaround time for Sprinter wraps?', a: 'Design: 2â5 days. Installation: 2â3 days. Free pickup and delivery included throughout Chicagoland.' },
  ],
  'transit': [
    { q: 'Do you wrap all Ford Transit models?', a: 'Yes â Ford Transit Connect, standard Transit, and high-roof Transit. Full and partial wrap options for each model.' },
    { q: 'How much does a Transit van wrap cost?', a: 'Transit Connect wraps start around $2,800. Full-size Transit van wraps from $3,750. Fleet pricing available.' },
    { q: 'How long does a Transit van wrap last?', a: 'Using Avery Dennison or 3M cast vinyl, Transit van wraps are rated 5â7 years outdoor with proper care.' },
  ],
  'colorchange': [
    { q: 'How much does a color change wrap cost in Chicago?', a: 'Color change wraps start at $3,500 for sedans and $4,500+ for SUVs/trucks. Pricing depends on vehicle size and film selection.' },
    { q: 'How many colors are available?', a: 'Over 120 colors including gloss, matte, satin, metallic, chrome, and color-shift finishes from Avery Dennison and 3M.' },
    { q: 'Does a color change wrap damage paint?', a: 'No. Cast vinyl wraps actually protect factory paint from UV and road debris. They remove cleanly when you want a change.' },
    { q: 'How long does a color change wrap last?', a: 'Avery Dennison Supreme Wrapping Film and 3M 2080 series are rated 5â7 years outdoor. Indoor/garaged vehicles last even longer.' },
  ],
  'wallwraps': [
    { q: 'How long do wall wraps last?', a: 'Indoor wall wraps last 5â7 years. Outdoor-exposed applications have a shorter lifespan of 3â5 years depending on sun exposure.' },
    { q: 'Can you install wall wraps on brick or concrete?', a: 'Yes. We use specialized primers and adhesion promoters for porous surfaces. A site visit confirms compatibility before production.' },
    { q: 'How is wall wrap pricing calculated?', a: 'Pricing is by square footage, surface complexity, and accessibility. Simple drywall at ground level is the base rate.' },
  ],
  'removal': [
    { q: 'Will wrap removal damage my paint?', a: 'Not if the paint is in good condition. Factory paint releases cleanly. The team photographs all vehicles before removal begins.' },
    { q: 'How long does wrap removal take?', a: 'Full cargo van: 3â5 hours. Box trucks: 6â8 hours. Fleet programs: 1 vehicle per day including adhesive cleanup.' },
    { q: 'How much does wrap removal cost?', a: 'Removal pricing depends on vehicle size, vinyl age, and adhesive condition. Older wraps cost more due to harder adhesive. Contact us for a quote.' },
  ],
  'ev': [
    { q: 'Can you wrap a Tesla without voiding the warranty?', a: 'Yes. A professional vinyl wrap does not void the Tesla warranty. We have wrapped hundreds of Teslas with zero warranty issues.' },
    { q: 'How many Rivians have you wrapped?', a: 'Over 600 Rivian R1T and R1S vehicles wrapped â more than any other shop in Illinois. Color change and commercial wraps.' },
    { q: 'Do EV wraps require special materials?', a: 'We use the same premium Avery Dennison and 3M cast vinyl. The key difference is installation technique around EV-specific panels, sensors, and charge ports.' },
    { q: 'How much does an EV wrap cost?', a: 'Tesla Model 3/Y from $3,500. Rivian R1T/R1S from $4,500. Pricing depends on coverage and film selection.' },
  ],
  'hvac': [
    { q: 'How much does an HVAC van wrap cost?', a: 'HVAC cargo van wraps start at $3,750. Fleet discounts available for 3+ vehicles. Includes design, print, install, and free pickup.' },
    { q: 'How many impressions does a wrapped HVAC van generate?', a: '30,000â70,000 daily impressions in Chicago metro area. At a CPM of $0.04â$0.48, it is the most cost-effective advertising for HVAC companies.' },
    { q: 'Are vehicle wraps tax deductible for HVAC companies?', a: 'Yes. Commercial vehicle wraps are 100% tax deductible under IRS Section 179 as a business advertising expense.' },
    { q: 'Do you offer fleet discounts for HVAC companies?', a: 'Yes. 3% off for 2â4 vehicles, 7% for 5â9, 11% for 10â24, 15% for 25+. Many HVAC fleets qualify for significant savings.' },
  ],
  'plumber': [
    { q: 'How much does a plumbing van wrap cost?', a: 'Plumbing van wraps start at $3,750. Includes custom design on exact vehicle templates, premium cast vinyl, and free pickup.' },
    { q: 'How long does a plumber van wrap last?', a: '5â7 years with Avery Dennison or 3M cast vinyl. Proper care extends life even further.' },
    { q: 'Do wrapped vans generate leads for plumbers?', a: 'Yes. A wrapped service van generates 30,000+ daily impressions. Plumbing companies report 15â30% more inbound calls after wrapping their fleet.' },
  ],
  'electric': [
    { q: 'How much does an electrician van wrap cost?', a: 'Electrician van wraps start at $3,750 for cargo vans. Box trucks from $5,000. Fleet discounts available for multiple vehicles.' },
    { q: 'What should an electrician van wrap include?', a: 'Company name, logo, phone number, license number, services list, and website. High-visibility design optimized for both parked and moving views.' },
    { q: 'Do you design electrician fleet wraps?', a: 'Yes. In-house design team creates custom layouts on exact vehicle templates. Unlimited revisions until approved.' },
  ],
  'contractor': [
    { q: 'How much does a contractor truck wrap cost?', a: 'Pickup truck wraps from $3,200. Cargo van wraps from $3,750. Box trucks from $5,000. Fleet discounts for 3+ vehicles.' },
    { q: 'What vehicles do contractors typically wrap?', a: 'Pickup trucks, cargo vans, box trucks, trailers, and service vehicles. We wrap all sizes and brands.' },
    { q: 'Are contractor vehicle wraps a good investment?', a: 'Yes. At $0.04â$0.48 CPM, vehicle wraps are the most cost-effective advertising for contractors. One wrapped truck generates 30,000+ daily impressions.' },
  ],
  'delivery': [
    { q: 'How much does a delivery fleet wrap cost?', a: 'Cargo van wraps from $3,750. Box trucks from $5,000â$10,900. Volume discounts for large delivery fleets.' },
    { q: 'Do you wrap Amazon DSP delivery vans?', a: 'Yes. We have wrapped hundreds of Amazon DSP fleet vehicles and other last-mile delivery vans.' },
    { q: 'How quickly can you wrap a delivery fleet?', a: 'Fleet orders are batched â typically 3â5 vehicles per week. Design approval adds 2â5 days. Free pickup minimizes downtime.' },
  ],
  'foodtruck': [
    { q: 'How much does a food truck wrap cost?', a: 'Food truck wraps start at $4,500â$8,000 depending on size and design complexity. Includes custom design and premium materials.' },
    { q: 'Can food truck wraps withstand kitchen heat?', a: 'Yes. Cast vinyl is rated for temperatures well above what food truck exteriors experience. Grease and cleaning chemicals wipe off easily.' },
    { q: 'How long does a food truck wrap take?', a: 'Design: 3â5 days. Installation: 2â4 days depending on vehicle size and complexity.' },
  ],
  'landscape': [
    { q: 'How much does a landscaping truck wrap cost?', a: 'Pickup truck wraps from $3,200. Cargo vans from $3,750. Trailer wraps from $1,500. Fleet discounts for 3+ vehicles.' },
    { q: 'Do landscaping wraps hold up in outdoor conditions?', a: 'Yes. Avery Dennison and 3M cast vinyl is rated 5â7 years outdoor. Designed to withstand UV, rain, and road debris.' },
    { q: 'What should a landscaping truck wrap include?', a: 'Company name, logo, phone number, services list, website, and license info. We design for maximum visibility at job sites and on the road.' },
  ],
  'boating': [
    { q: 'How much does a boat wrap cost?', a: 'Boat wraps vary by size â small boats from $3,000, larger vessels $5,000+. Marine-grade vinyl is used for water exposure.' },
    { q: 'How long do boat wraps last?', a: '3â5 years for watercraft with regular water exposure. Proper care and storage extend vinyl life.' },
    { q: 'Can you wrap any type of boat?', a: 'Yes â pontoons, speedboats, charter boats, fishing boats, and commercial marine vessels. Marine-grade adhesive vinyl.' },
  ],
  'moving': [
    { q: 'How much does a moving truck wrap cost?', a: 'Moving truck wraps from $5,000â$10,900 depending on truck size. Fleet discounts for 3+ vehicles.' },
    { q: 'Do wrapped moving trucks generate leads?', a: 'Yes. A wrapped moving truck generates 70,000+ daily impressions in city traffic. Many moving companies report significant inbound call increases.' },
    { q: 'Can you wrap rented or leased moving trucks?', a: 'Yes, with fleet owner approval. Cast vinyl removes cleanly without paint damage at the end of the lease.' },
  ],
  // New service pages
  'one-day-wraps': [
    { q: 'Can you wrap a vehicle in one day?', a: 'Yes — partial wraps, vinyl lettering, spot graphics, and single-panel color accents can be completed in one business day. Full vehicle wraps require 2–5 days.' },
    { q: 'How much do one day wraps cost?', a: 'Lettering packages from $400. Partial wraps from $1,200–$2,500. Spot graphics from $300. All using premium Avery Dennison and 3M cast vinyl.' },
    { q: 'What types of wraps can be done in one day?', a: 'Partial commercial wraps (sides + rear), vinyl lettering, logo applications, single-panel color accents, and fleet decal packages for multiple vehicles.' },
    { q: 'Do one day wraps use the same materials?', a: 'Yes. All one day wraps use the same premium Avery Dennison MPI 1105 and 3M IJ180-CV3 cast vinyl. The difference is scope, not quality.' },
  ],
  'construction-vehicle-wraps': [
    { q: 'How much does a construction truck wrap cost?', a: 'Pickup truck wraps from $3,200. Box trucks from $5,000–$10,900. Cargo vans from $3,750. Fleet discounts of 5–15% for 3+ construction vehicles.' },
    { q: 'Do construction vehicle wraps include DOT lettering?', a: 'Yes. All construction wraps include DOT-compliant lettering (USDOT number, GVW, company name) as required by FMCSA regulations.' },
    { q: 'How long do construction vehicle wraps last?', a: '5–7 years with Avery Dennison or 3M cast vinyl. Built to withstand the daily abuse construction vehicles endure — job sites, gravel, highway miles.' },
    { q: 'Can you wrap dump trucks and heavy equipment?', a: 'Yes. We wrap dump trucks (single and tandem axle), excavators, skid steers, generators, and all construction equipment with durable vinyl graphics.' },
  ],
  'trailer-wraps-chicago': [
    { q: 'How much does a trailer wrap cost in Chicago?', a: 'Utility trailers from $1,500. Enclosed trailers from $2,500–$6,000. Large semi-trailers from $4,000–$8,000. Pricing depends on size and coverage.' },
    { q: 'What types of trailers do you wrap?', a: 'Enclosed trailers, flatbed trailers, utility trailers, refrigerated trailers, car haulers, concession trailers, and semi-trailers up to 53 ft.' },
    { q: 'How long does trailer wrap installation take?', a: 'Utility trailers: 1–2 days. Enclosed trailers: 2–4 days. Semi-trailers: 3–5 days. Free pickup and delivery throughout Chicagoland.' },
    { q: 'Do trailer wraps hold up on the highway?', a: 'Yes. Premium cast vinyl with UV overlaminate is rated 5–7 years outdoor. Designed for highway speeds, weather exposure, and road debris.' },
  ],
  // Chicago-keyword service pages
  'fleet-wraps-chicago': [
    { q: 'What is the best fleet wrap company in Chicago?', a: 'Chicago Fleet Wraps has 24+ years experience, 9,400+ vehicles wrapped, and a 5.0 Google rating. Avery Dennison and 3M certified. Free pickup throughout Chicagoland.' },
    { q: 'How much do fleet wraps cost in Chicago?', a: 'Cargo vans from $3,750. Sprinter vans from $4,700. Box trucks from $5,000â$10,900. Fleet discounts up to 15%.' },
    { q: 'Do fleet wraps come with a warranty?', a: 'Yes. 2-year workmanship warranty plus 5â7 year vinyl manufacturer warranty from Avery Dennison or 3M.' },
  ],
  'van-wraps-chicago': [
    { q: 'How much does a van wrap cost in Chicago?', a: 'Cargo van wraps from $3,750. Transit Connect from $2,800. Sprinter vans from $4,700. Fleet discounts available.' },
    { q: 'What types of vans do you wrap?', a: 'Ford Transit, Mercedes Sprinter, Ram ProMaster, Chevy Express, GMC Savana, Nissan NV, and all commercial van models.' },
    { q: 'How long does a van wrap take?', a: 'Design: 2â5 days. Installation: 1â3 days depending on van size. Free pickup and delivery included.' },
  ],
  'truck-wraps-chicago': [
    { q: 'How much does a truck wrap cost in Chicago?', a: 'Pickup trucks from $3,200. Box trucks from $5,000â$10,900. Pricing depends on vehicle size and coverage.' },
    { q: 'Do you wrap pickup trucks?', a: 'Yes â Ford F-150/250/350, RAM 1500/2500/3500, Chevy Silverado, GMC Sierra, Toyota Tundra, and all makes/models.' },
    { q: 'Can truck wraps withstand Chicago winters?', a: 'Yes. Cast vinyl is rated for -40Â°F to 200Â°F. Road salt washes off easily. Wraps actually protect paint from winter damage.' },
  ],
  'boat-wraps-chicago': [
    { q: 'Where can I get a boat wrapped in Chicago?', a: 'Chicago Fleet Wraps provides boat wraps using marine-grade vinyl. We serve Lake Michigan marinas and the greater Chicagoland area.' },
    { q: 'How much does a boat wrap cost in Chicago?', a: 'Small boats from $3,000. Larger vessels $5,000+. Marine-grade cast vinyl rated for water exposure.' },
  ],
  'commercial-vehicle-wraps-chicago': [
    { q: 'What types of commercial vehicles can be wrapped?', a: 'Cargo vans, box trucks, sprinter vans, pickup trucks, trailers, buses, and specialty vehicles. All makes and models.' },
    { q: 'Are commercial vehicle wraps worth it?', a: 'Yes. At $0.04â$0.48 CPM, vehicle wraps deliver the lowest cost-per-impression of any advertising medium. One wrapped van generates 30,000+ daily impressions.' },
    { q: 'How long do commercial vehicle wraps last?', a: '5â7 years with Avery Dennison or 3M cast vinyl. Proper care extends life significantly.' },
  ],
  'vehicle-wraps-chicago': [
    { q: 'How much does a vehicle wrap cost in Chicago?', a: 'Sedan wraps from $2,800. SUV wraps from $3,500. Cargo vans from $3,750. Box trucks from $5,000. Color change wraps from $3,500.' },
    { q: 'How long does a vehicle wrap last in Chicago weather?', a: '5â7 years with premium cast vinyl. Chicago winters do not damage properly installed wraps. Road salt washes off easily.' },
    { q: 'Is it better to wrap or paint a car?', a: 'Wraps cost less, are removable, protect factory paint, and can be changed. Paint is permanent and typically costs 2â3x more for a quality job.' },
  ],
  'vehicle-wrap-cost-chicago': [
    { q: 'How much does a vehicle wrap cost in Chicago?', a: 'Sedan: $2,800â$4,000. SUV: $3,500â$5,000. Cargo van: $3,750â$5,500. Box truck: $5,000â$10,900. Color change: $3,500+.' },
    { q: 'What factors affect vehicle wrap pricing?', a: 'Vehicle size, coverage (full vs partial), material selection, design complexity, and fleet quantity discounts all affect pricing.' },
    { q: 'Are vehicle wraps cheaper than paint?', a: 'Yes. A quality paint job costs $5,000â$15,000. A full wrap costs $2,800â$5,500 and is removable. Wraps are the better value for most applications.' },
  ],
  'partial-vehicle-wraps-chicago': [
    { q: 'How much does a partial wrap cost?', a: 'Partial wraps start at $1,500â$2,500 depending on coverage area. Common options: half wrap, spot graphics, tailgate wrap, and panel wraps.' },
    { q: 'Is a partial wrap worth it?', a: 'Yes. Partial wraps deliver 60â80% of the visual impact of a full wrap at 40â60% of the cost. Great for tight budgets.' },
    { q: 'What is included in a partial wrap?', a: 'Typically covers 40â60% of the vehicle â often sides and rear. Design, premium cast vinyl, and professional installation included.' },
  ],
  'hvac-van-wraps-chicago': [
    { q: 'How much does an HVAC van wrap cost in Chicago?', a: 'HVAC cargo van wraps start at $3,750. Fleet discounts: 3% for 2â4 vehicles, 7% for 5â9, 11% for 10â24, 15% for 25+.' },
    { q: 'What should an HVAC van wrap include?', a: 'Company name, logo, phone number, license info, services offered, emergency service callout, and website. High-visibility design is key.' },
    { q: 'Do HVAC companies get a tax deduction for vehicle wraps?', a: 'Yes. Vehicle wraps are 100% tax deductible under IRS Section 179 as a business advertising expense.' },
  ],
  'plumbing-van-wraps-chicago': [
    { q: 'How much does a plumbing van wrap cost in Chicago?', a: 'Plumbing van wraps start at $3,750 for cargo vans. Includes custom design, premium cast vinyl, and free pickup.' },
    { q: 'Do plumbing wraps help generate leads?', a: 'Yes. Wrapped plumbing vans generate 30,000+ daily impressions. Companies report 15â30% more inbound calls after wrapping.' },
    { q: 'How long do plumbing van wraps last?', a: '5â7 years with Avery Dennison or 3M cast vinyl. Designed to withstand daily commercial use and Chicago weather.' },
  ],
  'electrician-vehicle-wraps-chicago': [
    { q: 'How much does an electrician vehicle wrap cost in Chicago?', a: 'Electrician van wraps from $3,750. Truck wraps from $3,200. Fleet discounts for 3+ vehicles.' },
    { q: 'What information should be on an electrician wrap?', a: 'Company name, logo, phone, license number, services, emergency availability, and website. We design for maximum job-site visibility.' },
  ],
  'contractor-vehicle-wraps-chicago': [
    { q: 'How much do contractor vehicle wraps cost in Chicago?', a: 'Pickup trucks from $3,200. Cargo vans from $3,750. Box trucks from $5,000. Fleet discounts up to 15% for 25+ vehicles.' },
    { q: 'What should a contractor wrap include?', a: 'Company name, logo, phone, license info, services, and website. Bold design that is readable at 50+ feet on the road.' },
  ],
  'delivery-fleet-wraps-chicago': [
    { q: 'How much do delivery fleet wraps cost in Chicago?', a: 'Cargo vans from $3,750. Box trucks from $5,000â$10,900. Volume discounts for large delivery fleets.' },
    { q: 'Can you wrap Amazon DSP vans?', a: 'Yes. We have wrapped hundreds of Amazon DSP and last-mile delivery vehicles with brand-compliant graphics.' },
  ],
  'food-truck-wraps-chicago': [
    { q: 'How much does a food truck wrap cost in Chicago?', a: 'Food truck wraps start at $4,500â$8,000 depending on size and design. Menu-integrated designs available.' },
    { q: 'Do food truck wraps hold up to heat and grease?', a: 'Yes. Cast vinyl withstands kitchen-adjacent temperatures. Grease and cleaning chemicals wipe off easily.' },
  ],
  'moving-truck-wraps-chicago': [
    { q: 'How much does a moving truck wrap cost in Chicago?', a: 'Moving truck wraps from $5,000â$10,900 depending on size. Fleet discounts for 3+ trucks.' },
    { q: 'Do wrapped moving trucks get more calls?', a: 'Yes. Wrapped moving trucks generate 70,000+ daily impressions. Moving companies report significant call volume increases.' },
  ],
  'landscaping-truck-wraps-chicago': [
    { q: 'How much does a landscaping truck wrap cost?', a: 'Pickup trucks from $3,200. Cargo vans from $3,750. Trailer wraps from $1,500. Fleet discounts available.' },
    { q: 'Do landscaping wraps hold up outdoors?', a: 'Yes. Avery Dennison and 3M cast vinyl is rated 5â7 years outdoor, designed for UV, rain, and debris exposure.' },
  ],
  // Resource/info pages
  'faq': [
    { q: 'How much does a vehicle wrap cost?', a: 'Pricing depends on vehicle size and coverage. Sedans from $2,800, cargo vans from $3,750, box trucks from $5,000â$10,900.' },
    { q: 'How long do vehicle wraps last?', a: '5â7 years with Avery Dennison or 3M cast vinyl and proper care.' },
    { q: 'Are vehicle wraps tax deductible?', a: 'Yes. Commercial vehicle wraps are 100% deductible under IRS Section 179 as advertising expense.' },
  ],
  'care': [
    { q: 'How do you wash a wrapped vehicle?', a: 'Hand wash with mild soap and water. Avoid brush car washes and pressure washers above 1,200 PSI. No abrasive cleaners.' },
    { q: 'Can you pressure wash a wrapped vehicle?', a: 'Only below 1,200 PSI and at least 12 inches from the surface. High pressure can lift vinyl edges.' },
    { q: 'Does wax protect a vehicle wrap?', a: 'Vinyl-safe spray sealants help protect the wrap. Do not use traditional car wax, which can dull the finish.' },
  ],
  'materials': [
    { q: 'What vinyl do you use for wraps?', a: 'Avery Dennison MPI 1105 and 3M IJ180-CV3 cast vinyl with DOL 1360 UV overlaminate. Cast vinyl only â no calendered film.' },
    { q: 'What is the difference between cast and calendered vinyl?', a: 'Cast vinyl is thinner, more conformable, and lasts 5â7 years. Calendered vinyl is thicker, less flexible, and lasts 2â3 years. We use cast only.' },
    { q: 'What is UV overlaminate?', a: 'A clear protective layer applied over printed vinyl. It blocks UV rays, prevents fading, and adds scratch resistance. Standard on all our wraps.' },
  ],
  'warranty': [
    { q: 'What does the wrap warranty cover?', a: '2-year workmanship warranty covers lifting, peeling, bubbling, and installation defects. 5â7 year vinyl manufacturer warranty from Avery Dennison and 3M.' },
    { q: 'What voids the wrap warranty?', a: 'Brush car washes, high-pressure washers above 1,200 PSI, abrasive cleaners, and unauthorized repairs void the installation warranty.' },
  ],
  'vinyl-guide': [
    { q: 'Which vinyl is best for vehicle wraps?', a: 'Avery Dennison MPI 1105 and 3M IJ180-CV3 are the industry gold standards. Both are cast vinyl rated 5â7 years outdoor.' },
    { q: 'What is the difference between 3M and Avery Dennison wraps?', a: 'Both are premium cast vinyl. Avery Dennison offers slightly easier installation. 3M has a wider distribution network. Performance is comparable.' },
  ],
  'partial-wraps': [
    { q: 'How much does a partial wrap cost?', a: 'Partial wraps start at $1,500â$2,500. Common options include spot graphics, half wraps, tailgate wraps, and panel wraps.' },
    { q: 'Is a partial wrap effective for advertising?', a: 'Yes. Partial wraps deliver 60â80% of the visual impact at 40â60% of the cost. Strategic placement maximizes visibility.' },
  ],
  'lettering': [
    { q: 'How much does vehicle lettering cost?', a: 'Vinyl lettering starts at $300â$800 depending on the amount of text and number of sides. An affordable alternative to full wraps.' },
    { q: 'How long does vinyl lettering last?', a: 'Die-cut vinyl lettering lasts 5â7 years outdoor with Avery or 3M cast vinyl.' },
  ],
  'pickup-truck': [
    { q: 'How much does a pickup truck wrap cost?', a: 'Full pickup truck wraps from $3,200. Partial wraps from $1,500. Tailgate wraps from $500. Fleet discounts available.' },
    { q: 'Can you wrap a truck with a bed liner?', a: 'We wrap cab, doors, and tailgate. Bed liners and heavily textured surfaces are not wrapped but can be color-matched.' },
  ],
  'signsandgraphics': [
    { q: 'What types of signs and graphics do you offer?', a: 'Vehicle wraps, wall graphics, window graphics, A-frames, banners, and custom signage. Full design and installation services.' },
    { q: 'Do you install indoor graphics?', a: 'Yes. Office walls, lobby graphics, wayfinding signage, and environmental graphics. Avery Dennison adhesive vinyl.' },
  ],
};

// Fallback FAQs for pages without specific entries
const DEFAULT_FAQS = [
  { q: 'How do I get started with Chicago Fleet Wraps?', a: 'Call (312) 597-1286 or submit an online estimate request. We respond within 2 business hours with a detailed quote.' },
  { q: 'Do you offer free pickup and delivery?', a: 'Yes. Free pickup and delivery throughout Chicagoland â Cook, DuPage, Kane, Lake, Will, and McHenry counties.' },
  { q: 'What materials do you use?', a: 'Avery Dennison MPI 1105 and 3M IJ180-CV3 premium cast vinyl with UV overlaminate. Cast vinyl only â never calendered.' },
];

// City-specific FAQ â unique questions per city
function getCityFaqs(city) {
  const data = CITY_DATA[city];
  const county = data ? data.county : 'Cook';
  const driveTime = data ? data.driveTime : '30â45 min';
  const topIndustry = data ? data.industries[0] : 'service contractors';
  const landmark = data ? data.landmarks[0] : 'your area';
  const district = data ? data.businessDistricts ? data.businessDistricts[0] : 'your local business district' : 'your local business district';

  return [
    { q: `Do you provide fleet wrap services in ${city}, IL?`, a: `Yes. Chicago Fleet Wraps provides free pickup and delivery to ${city} and all of ${county} County. Our shop is at 4711 N Lamon Ave #7 #7, Chicago, IL 60630 â about ${driveTime} from ${city}.` },
    { q: `How much do vehicle wraps cost for ${city} businesses?`, a: `Pricing is the same across Chicagoland with free pickup from ${city} included. Cargo vans from $3,750, sprinter vans from $4,700, box trucks from $5,000â$10,900, pickup trucks from $3,200.` },
    { q: `How long does it take to wrap a vehicle from ${city}?`, a: `Design: 2â5 days with unlimited revisions. Installation: 1â4 days depending on vehicle size. We pick up from ${city} and deliver back when complete. Total turnaround: typically 5â9 business days.` },
    { q: `What industries do you serve in ${city}?`, a: `We wrap vehicles for all industries in ${city}, with particular expertise in ${topIndustry}. Other common clients include HVAC companies, plumbers, electricians, delivery fleets, and general contractors.` },
    { q: `Do you offer fleet discounts for ${city} companies?`, a: `Yes. Fleet discounts: 3% off for 2â4 vehicles, 7% for 5â9, 11% for 10â24, 15% for 25+. Many ${city} businesses save significantly with multi-vehicle orders.` },
    { q: `What areas near ${city} do you also serve?`, a: `We serve all of ${county} County and surrounding areas â 75+ cities total. Free pickup and delivery throughout Chicagoland. See our full service area map at chicagofleetwraps.com/servicearea/.` },
    { q: `Where will my wrapped vehicle get the most exposure in ${city}?`, a: `High-traffic areas like the ${district} provide excellent visibility. Job-site parking in residential neighborhoods is also highly effective â neighbors see your brand while you work.` },
  ];
}

function generateJsonLd(page) {
  const canonical = `${BASE_URL}/${page.url}/`;
  const schemas = [];
  
  schemas.push({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${canonical}#webpage`,
    "url": canonical,
    "name": page.h1,
    "description": page.desc,
    "inLanguage": "en-US",
    "isPartOf": { "@id": `${BASE_URL}/#website` },
    "about": { "@id": `${BASE_URL}/#localbusiness` },
    "author": { "@id": `${BASE_URL}/#founder` },
    "publisher": { "@id": `${BASE_URL}/#localbusiness` },
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["h1", ".speakable", ".aeo-answer"]
    },
    "breadcrumb": { "@id": `${canonical}#breadcrumb` }
  });

  // Enhanced breadcrumbs with category-level items for sitelink eligibility
  const breadcrumbItems = [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE_URL}/` }
  ];
  if (page.category === 'Cities') {
    breadcrumbItems.push({ "@type": "ListItem", "position": 2, "name": "Service Area", "item": `${BASE_URL}/servicearea/` });
    breadcrumbItems.push({ "@type": "ListItem", "position": 3, "name": page.h1, "item": canonical });
  } else if (page.category === 'Blog') {
    breadcrumbItems.push({ "@type": "ListItem", "position": 2, "name": "Blog", "item": `${BASE_URL}/blog/` });
    breadcrumbItems.push({ "@type": "ListItem", "position": 3, "name": page.h1, "item": canonical });
  } else if (page.category === 'Services') {
    breadcrumbItems.push({ "@type": "ListItem", "position": 2, "name": "Services", "item": `${BASE_URL}/commercial/` });
    breadcrumbItems.push({ "@type": "ListItem", "position": 3, "name": page.h1, "item": canonical });
  } else if (page.category === 'Industries') {
    breadcrumbItems.push({ "@type": "ListItem", "position": 2, "name": "Industries", "item": `${BASE_URL}/commercial/` });
    breadcrumbItems.push({ "@type": "ListItem", "position": 3, "name": page.h1, "item": canonical });
  } else if (page.category === 'Resources' || page.category === 'Tools') {
    breadcrumbItems.push({ "@type": "ListItem", "position": 2, "name": page.category, "item": `${BASE_URL}/faq/` });
    breadcrumbItems.push({ "@type": "ListItem", "position": 3, "name": page.h1, "item": canonical });
  } else {
    breadcrumbItems.push({ "@type": "ListItem", "position": 2, "name": page.h1, "item": canonical });
  }
  schemas.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${canonical}#breadcrumb`,
    "itemListElement": breadcrumbItems
  });

  // AggregateRating for service and industry pages (rich star snippets)
  if (page.category === 'Services' || page.category === 'Industries' || page.category === 'Cities') {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": `${canonical}#rating`,
      "name": "Chicago Fleet Wraps",
      "url": `${BASE_URL}/`,
      "telephone": "+13125971286",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5.0",
        "bestRating": "5",
        "worstRating": "1",
        "ratingCount": "47",
        "reviewCount": "47"
      }
    });
  }

  // HowTo schema for service/industry pages (rich snippet eligibility)
  if (page.category === 'Services' || page.category === 'Industries') {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      "@id": `${canonical}#howto`,
      "name": `How to Get ${page.h1}`,
      "description": `The simple 3-step process to get professional ${page.h1.toLowerCase()} from Chicago Fleet Wraps.`,
      "totalTime": "P14D",
      "estimatedCost": { "@type": "MonetaryAmount", "currency": "USD", "value": "3150" },
      "step": [
        { "@type": "HowToStep", "position": 1, "name": "Request a Free Estimate", "text": "Call (312) 597-1286 or submit an online estimate. We respond within 2 business hours with real pricing â not a range.", "url": `${BASE_URL}/estimate/` },
        { "@type": "HowToStep", "position": 2, "name": "Approve Your Custom Design", "text": "Our in-house design team creates your wrap on exact vehicle templates. Unlimited revisions until you approve.", "url": `${BASE_URL}/portfolio/` },
        { "@type": "HowToStep", "position": 3, "name": "We Install & Deliver", "text": "Free pickup from anywhere in Chicagoland. Professional installation with Avery Dennison or 3M cast vinyl. 2-year warranty included.", "url": `${BASE_URL}/warranty/` }
      ]
    });
  }

  if (page.city) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": ["LocalBusiness", "ProfessionalService"],
      "@id": `${canonical}#geo-lb`,
      "name": `Chicago Fleet Wraps â ${page.city} Fleet Wraps`,
      "url": canonical,
      "telephone": "+13125971286",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "4711 N Lamon Ave #7",
        "addressLocality": "Chicago",
        "addressRegion": "IL",
        "postalCode": "60630",
        "addressCountry": "US"
      },
      "areaServed": { "@type": "City", "name": `${page.city}, Illinois` },
      "parentOrganization": { "@id": `${BASE_URL}/#localbusiness` }
    });
  }

  // FAQPage schema
  let faqs = PAGE_FAQS[page.slug] || PAGE_FAQS[page.url];
  if (!faqs && page.city) {
    faqs = getCityFaqs(page.city);
  }
  if (!faqs) {
    faqs = DEFAULT_FAQS;
  }
  schemas.push({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${canonical}#faqpage`,
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a }
    }))
  });

  return schemas.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n');
}

function generateRelatedLinksHtml(page) {
  const related = getRelatedPages(page);
  if (related.length === 0) return '';
  
  let html = `\n<section class="related-links">\n<h2>Related Services &amp; Pages</h2>\n<div class="related-grid">\n`;
  for (const rp of related) {
    html += `<a href="/${rp.url}/" class="related-card">\n<strong>${escapeHtml(rp.h1)}</strong>\n<span>${escapeHtml(rp.desc.substring(0, 100))}â¦</span>\n</a>\n`;
  }
  html += `</div>\n</section>\n`;
  return html;
}


// === Portfolio Gallery HTML ===
const PORTFOLIO_GALLERY_HTML = `
<style>
.port-filters{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:0 -24px 0;padding:20px 24px;background:rgba(255,255,255,.03);border-radius:12px;margin-bottom:24px}
.filter-btn{padding:7px 18px;border-radius:20px;border:1px solid rgba(255,255,255,.15);background:transparent;color:rgba(255,255,255,.6);font-family:var(--H);font-size:.82rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;cursor:pointer;transition:.15s}
.filter-btn:hover,.filter-btn.active{background:var(--gold);color:#000;border-color:var(--gold)}
.port-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin:0 -24px 40px}
.port-item{position:relative;overflow:hidden;aspect-ratio:4/3;cursor:pointer;background:#111}
.port-item img{width:100%;height:100%;object-fit:cover;transition:transform .4s ease;display:block}
.port-item:hover img{transform:scale(1.06)}
.port-item-label{position:absolute;bottom:0;left:0;right:0;padding:14px 12px 10px;background:linear-gradient(transparent,rgba(0,0,0,.85));color:#fff;font-family:var(--H);font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;opacity:0;transition:.2s;transform:translateY(4px)}
.port-item:hover .port-item-label{opacity:1;transform:translateY(0)}
@media(max-width:768px){.port-grid{grid-template-columns:repeat(2,1fr)}.related-grid{grid-template-columns:repeat(2,1fr)}.port-item-label{opacity:1;transform:none;font-size:.68rem}}@media(max-width:480px){.port-grid{grid-template-columns:repeat(2,1fr)}.related-grid{grid-template-columns:repeat(2,1fr)}}
</style>
<p class="lead speakable">Browse our vehicle wrap portfolio — 9,400+ vehicles wrapped in Chicago. Fleet wraps, color change, box trucks, sprinters, Rivians, boats, and more. All 3M and Avery Dennison premium cast vinyl.</p>
<div class="port-filters">
  <button class="filter-btn active" data-filter="all">All Wraps</button>
  <button class="filter-btn" data-filter="fleet">Fleet & Commercial</button>
  <button class="filter-btn" data-filter="color">Color Change</button>
  <button class="filter-btn" data-filter="truck">Trucks & Vans</button>
  <button class="filter-btn" data-filter="electric">Electric Vehicles</button>
  <button class="filter-btn" data-filter="specialty">Specialty</button>
</div>
<div class="port-grid" id="port-grid">
  <div class="port-item" data-cat="fleet"><img src="/images/frontier_fleet_vans.webp" alt="Frontier fleet van wraps Chicago" loading="lazy"><div class="port-item-label">Frontier Fleet Vans — Full Fleet Wrap</div></div>
  <div class="port-item" data-cat="fleet"><img src="/images/arnold_electric_van.webp" alt="Arnold Electric fleet van wrap Chicago" loading="lazy"><div class="port-item-label">Arnold Electric — Fleet Van Wrap</div></div>
  <div class="port-item" data-cat="fleet"><img src="/images/arnold_electric_truck.webp" alt="Arnold Electric truck wrap Chicago" loading="lazy"><div class="port-item-label">Arnold Electric — Truck Wrap</div></div>
  <div class="port-item" data-cat="fleet"><img src="/images/precision_today_sprinter.webp" alt="Precision Today HVAC sprinter van wrap" loading="lazy"><div class="port-item-label">Precision Today HVAC — Sprinter Fleet</div></div>
  <div class="port-item" data-cat="fleet"><img src="/images/precision_today_hvac.webp" alt="Precision Today HVAC van wrap Chicago" loading="lazy"><div class="port-item-label">Precision Today HVAC — Van Wrap</div></div>
  <div class="port-item" data-cat="fleet"><img src="/images/sbc_hvac_van.webp" alt="SBC HVAC van wrap Chicago" loading="lazy"><div class="port-item-label">SBC HVAC — Van Wrap</div></div>
  <div class="port-item" data-cat="fleet"><img src="/images/exalt_air_pick_up_truck.webp" alt="Exalt Air pickup truck wrap Chicago" loading="lazy"><div class="port-item-label">Exalt Air — Pickup Truck Wrap</div></div>
  <div class="port-item" data-cat="fleet"><img src="/images/sns_roofing_truck.webp" alt="SNS Roofing truck wrap Chicago" loading="lazy"><div class="port-item-label">SNS Roofing — Truck Wrap</div></div>
  <div class="port-item" data-cat="fleet"><img src="/images/mh_equipment_hero.webp" alt="MH Equipment vehicle wrap Chicago" loading="lazy"><div class="port-item-label">MH Equipment — Fleet Wrap</div></div>
  <div class="port-item" data-cat="fleet"><img src="/images/497772790_24331701613099562_4203498232102002021_n.webp" alt="Fleet van wrap Chicago" loading="lazy"><div class="port-item-label">Fleet Van Wrap — Chicago</div></div>
  <div class="port-item" data-cat="fleet"><img src="/images/497515435_24330598833209840_7307182871652909685_n.webp" alt="Commercial wrap Chicago" loading="lazy"><div class="port-item-label">Commercial Vehicle Wrap</div></div>
  <div class="port-item" data-cat="fleet"><img src="/images/498082014_24330598523209871_6738588666879214947_n.webp" alt="Fleet wrap Chicago" loading="lazy"><div class="port-item-label">Fleet Wrap — Chicago</div></div>
  <div class="port-item" data-cat="fleet"><img src="/images/496928478_24317780384491685_4884906545053314507_n.webp" alt="Vehicle wrap project Chicago" loading="lazy"><div class="port-item-label">Vehicle Wrap Project</div></div>
  <div class="port-item" data-cat="fleet"><img src="/images/497639999_24317780324491691_6025330273556081540_n.webp" alt="Commercial graphics Chicago" loading="lazy"><div class="port-item-label">Commercial Graphics</div></div>
  <div class="port-item" data-cat="fleet"><img src="/images/497767279_24332472089689181_2225150346793984394_n.webp" alt="Fleet branding Chicago" loading="lazy"><div class="port-item-label">Fleet Branding — Chicago</div></div>
  <div class="port-item" data-cat="fleet"><img src="/images/498587882_24363965446539845_8040426383196277230_n.webp" alt="Vehicle graphics Chicago" loading="lazy"><div class="port-item-label">Vehicle Graphics</div></div>
  <div class="port-item" data-cat="fleet"><img src="/images/499031832_24357754093827647_8285045186686109093_n.webp" alt="Wrap installation Chicago" loading="lazy"><div class="port-item-label">Wrap Installation — Chicago</div></div>
  <div class="port-item" data-cat="fleet"><img src="/images/503510088_24485339417735780_5558300970756617480_n.webp" alt="Fleet vehicle wrap" loading="lazy"><div class="port-item-label">Fleet Vehicle Wrap</div></div>
  <div class="port-item" data-cat="fleet"><img src="/images/540641462_25195391446730570_5281464292364706116_n.webp" alt="Commercial wrap project" loading="lazy"><div class="port-item-label">Commercial Wrap Project</div></div>
  <div class="port-item" data-cat="truck"><img src="/images/windy_city_box_truck.webp" alt="Windy City Movers box truck wrap" loading="lazy"><div class="port-item-label">Windy City Movers — Box Truck Wrap</div></div>
  <div class="port-item" data-cat="truck"><img src="/images/windy_city_box_truck_hero.webp" alt="Box truck wrap Chicago" loading="lazy"><div class="port-item-label">Box Truck Full Wrap — Chicago</div></div>
  <div class="port-item" data-cat="truck"><img src="/images/stark_cement_mixer.webp" alt="Stark cement mixer truck wrap" loading="lazy"><div class="port-item-label">Stark — Cement Mixer Wrap</div></div>
  <div class="port-item" data-cat="truck"><img src="/images/hunt_brothers_pizza_truck.webp" alt="Hunt Brothers Pizza truck wrap" loading="lazy"><div class="port-item-label">Hunt Brothers Pizza — Truck Wrap</div></div>
  <div class="port-item" data-cat="truck"><img src="/images/blondies_beef_truck.webp" alt="Blondies Beef food truck wrap" loading="lazy"><div class="port-item-label">Blondie's Beef — Food Truck Wrap</div></div>
  <div class="port-item" data-cat="truck"><img src="/images/cfw_truck_1.webp" alt="Commercial truck wrap Chicago" loading="lazy"><div class="port-item-label">Commercial Truck Wrap</div></div>
  <div class="port-item" data-cat="truck"><img src="/images/cfw_truck_2.webp" alt="Fleet truck wrap Chicago" loading="lazy"><div class="port-item-label">Fleet Truck Wrap — Chicago</div></div>
  <div class="port-item" data-cat="truck"><img src="/images/cfw_truck_3.webp" alt="Box truck graphics Chicago" loading="lazy"><div class="port-item-label">Box Truck Graphics</div></div>
  <div class="port-item" data-cat="truck"><img src="/images/cfw_van_1.webp" alt="Commercial van wrap Chicago" loading="lazy"><div class="port-item-label">Commercial Van Wrap</div></div>
  <div class="port-item" data-cat="truck"><img src="/images/cfw_van_2.webp" alt="Van wrap Chicago fleet" loading="lazy"><div class="port-item-label">Van Wrap — Fleet Branding</div></div>
  <div class="port-item" data-cat="truck"><img src="/images/cfw_van_3.webp" alt="Cargo van wrap Chicago" loading="lazy"><div class="port-item-label">Cargo Van Full Wrap</div></div>
  <div class="port-item" data-cat="color"><img src="/images/pink_chrome-2.webp" alt="Pink chrome color change wrap Chicago" loading="lazy"><div class="port-item-label">Pink Chrome — Color Change Wrap</div></div>
  <div class="port-item" data-cat="color"><img src="/images/audi_color_shift.webp" alt="Audi color shift wrap Chicago" loading="lazy"><div class="port-item-label">Audi — Color Shift Wrap</div></div>
  <div class="port-item" data-cat="color"><img src="/images/bmw_matte_black.webp" alt="BMW matte black wrap Chicago" loading="lazy"><div class="port-item-label">BMW — Matte Black Wrap</div></div>
  <div class="port-item" data-cat="color"><img src="/images/camaro_color_shift.webp" alt="Camaro color shift wrap" loading="lazy"><div class="port-item-label">Camaro — Color Shift Wrap</div></div>
  <div class="port-item" data-cat="color"><img src="/images/corvette_mid_wrap.webp" alt="Corvette partial wrap Chicago" loading="lazy"><div class="port-item-label">Corvette — Partial Color Change</div></div>
  <div class="port-item" data-cat="color"><img src="/images/sandals_color_change.webp" alt="Color change wrap Chicago" loading="lazy"><div class="port-item-label">Full Color Change Wrap</div></div>
  <div class="port-item" data-cat="color"><img src="/images/color_change_tesla.webp" alt="Tesla color change wrap Chicago" loading="lazy"><div class="port-item-label">Tesla — Color Change Wrap</div></div>
  <div class="port-item" data-cat="color"><img src="/images/small_suv.webp" alt="SUV color change wrap Chicago" loading="lazy"><div class="port-item-label">SUV — Color Change Wrap</div></div>
  <div class="port-item" data-cat="color"><img src="/images/4aces_suv.webp" alt="4 Aces SUV wrap Chicago" loading="lazy"><div class="port-item-label">4 Aces — SUV Custom Wrap</div></div>
  <div class="port-item" data-cat="electric"><img src="/images/rivian_blue_holographic.webp" alt="Rivian blue holographic wrap Chicago" loading="lazy"><div class="port-item-label">Rivian R1T — Blue Holographic</div></div>
  <div class="port-item" data-cat="electric"><img src="/images/rivian_blue_origin.webp" alt="Rivian Blue Origin wrap" loading="lazy"><div class="port-item-label">Rivian — Blue Origin Edition</div></div>
  <div class="port-item" data-cat="electric"><img src="/images/rivian_green_r1s.webp" alt="Rivian R1S green wrap" loading="lazy"><div class="port-item-label">Rivian R1S — Custom Green Wrap</div></div>
  <div class="port-item" data-cat="electric"><img src="/images/rivian_pink_r1s.webp" alt="Rivian R1S pink wrap" loading="lazy"><div class="port-item-label">Rivian R1S — Pink Color Change</div></div>
  <div class="port-item" data-cat="electric"><img src="/images/rivian_rad.webp" alt="Rivian custom wrap Chicago" loading="lazy"><div class="port-item-label">Rivian — Custom Graphic Wrap</div></div>
  <div class="port-item" data-cat="electric"><img src="/images/rivian_snow_camo.webp" alt="Rivian snow camo wrap" loading="lazy"><div class="port-item-label">Rivian — Snow Camo Wrap</div></div>
  <div class="port-item" data-cat="electric"><img src="/images/blue_origin_launch_rivian.webp" alt="Blue Origin Rivian fleet wrap" loading="lazy"><div class="port-item-label">Blue Origin — Rivian Fleet Wraps</div></div>
  <div class="port-item" data-cat="electric"><img src="/images/tesla_cybertruck.webp" alt="Tesla Cybertruck wrap Chicago" loading="lazy"><div class="port-item-label">Tesla Cybertruck — Custom Wrap</div></div>
  <div class="port-item" data-cat="electric"><img src="/images/mustang_lightning.webp" alt="Ford Lightning wrap" loading="lazy"><div class="port-item-label">Ford Lightning — Custom Wrap</div></div>
  <div class="port-item" data-cat="specialty"><img src="/images/mortal_combat.webp" alt="Mortal Kombat custom vehicle wrap" loading="lazy"><div class="port-item-label">Mortal Kombat — Custom Graphic Wrap</div></div>
  <div class="port-item" data-cat="specialty"><img src="/images/dune_buggy_galaxy.webp" alt="Dune buggy galaxy wrap" loading="lazy"><div class="port-item-label">Dune Buggy — Galaxy Wrap</div></div>
  <div class="port-item" data-cat="specialty"><img src="/images/diecut_sheriff_k9.webp" alt="Sheriff K9 die-cut graphics" loading="lazy"><div class="port-item-label">Sheriff K9 — Die-Cut Graphics</div></div>
  <div class="port-item" data-cat="specialty"><img src="/images/the_d_limo_motorcycle.webp" alt="The D limo motorcycle wrap" loading="lazy"><div class="port-item-label">The D Limo — Motorcycle Wrap</div></div>
  <div class="port-item" data-cat="specialty"><img src="/images/oakbros_wall_wrap.webp" alt="Oak Bros wall wrap Chicago" loading="lazy"><div class="port-item-label">Oak Bros — Wall Wrap Graphics</div></div>
  <div class="port-item" data-cat="specialty"><img src="/images/boat.webp" alt="Boat wrap Chicago" loading="lazy"><div class="port-item-label">Boat — Full Vinyl Wrap</div></div>
  <div class="port-item" data-cat="specialty"><img src="/images/cutwater_boat.webp" alt="Cutwater boat wrap" loading="lazy"><div class="port-item-label">Cutwater — Boat Wrap</div></div>
  <div class="port-item" data-cat="specialty"><img src="/images/green_patron_boat.webp" alt="Green Patron boat wrap" loading="lazy"><div class="port-item-label">Patron — Boat Wrap</div></div>
  <div class="port-item" data-cat="specialty"><img src="/images/patron_boat.webp" alt="Patron sponsored boat wrap" loading="lazy"><div class="port-item-label">Patron Sponsored — Boat Wrap</div></div>
</div>
<script>
document.querySelectorAll('.filter-btn').forEach(btn=>{btn.addEventListener('click',()=>{document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');const f=btn.dataset.filter;document.querySelectorAll('.port-item').forEach(item=>{item.style.display=(f==='all'||item.dataset.cat===f)?'':'none'});});});
</script>
`;


function generatePage(page) {
  const canonical = `${BASE_URL}/${page.url}/`;
  const content = page.content || generateCityContent(page.city);
  const jsonLd = generateJsonLd(page);
  const relatedLinks = generateRelatedLinksHtml(page);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width,initial-scale=1" name="viewport"/>
<meta content="nosniff" http-equiv="X-Content-Type-Options"/>
<meta content="strict-origin-when-cross-origin" name="referrer"/>
<title>${escapeHtml(page.title)}</title>
<meta content="${escapeHtml(page.desc)}" name="description"/>
${page.keywords ? `<meta content="${escapeHtml(page.keywords)}" name="keywords"/>` : ''}
<meta content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" name="robots"/>
<link href="${canonical}" rel="canonical"/>
<link href="/favicon.png" rel="icon" type="image/png"/>
<meta content="${escapeHtml(page.title)}" property="og:title"/>
<meta content="${escapeHtml(page.desc)}" property="og:description"/>
<meta content="website" property="og:type"/>
<meta content="${canonical}" property="og:url"/>
<meta content="en_US" property="og:locale"/>
<meta content="Chicago Fleet Wraps" property="og:site_name"/>
<meta content="${BASE_URL}/images/${page.ogImage || 'cfw_truck_1.webp'}" property="og:image"/>
<meta content="1200" property="og:image:width"/>
<meta content="630" property="og:image:height"/>
<meta content="summary_large_image" name="twitter:card"/>
<meta content="${escapeHtml(page.title)}" name="twitter:title"/>
<meta content="${escapeHtml(page.desc)}" name="twitter:description"/>
<meta content="${BASE_URL}/images/${page.ogImage || 'cfw_truck_1.webp'}" name="twitter:image"/>
<meta content="US-IL" name="geo.region"/>
<meta content="${page.city || 'Chicago'}" name="geo.placename"/>
<meta content="41.9742;-87.7498" name="geo.position"/>
${jsonLd}
<link as="font" crossorigin="" href="/fonts/bebas-neue.woff2" rel="preload" type="font/woff2"/>
<link as="font" crossorigin="" href="/fonts/barlow-700.woff2" rel="preload" type="font/woff2"/>
<link as="font" crossorigin="" href="/fonts/barlow-condensed-700.woff2" rel="preload" type="font/woff2"/>
<style>
@font-face{font-family:'Barlow';font-style:normal;font-weight:700;font-display:swap;src:url('/fonts/barlow-700.woff2') format('woff2')}
@font-face{font-family:'Barlow Condensed';font-style:normal;font-weight:700;font-display:swap;src:url('/fonts/barlow-condensed-700.woff2') format('woff2')}
@font-face{font-family:'Bebas Neue';font-style:normal;font-weight:400;font-display:swap;src:url('/fonts/bebas-neue.woff2') format('woff2')}
</style>
<link rel="stylesheet" href="/css/site.v4.css"/>
<!-- GTM deferred -->
<script>
window.dataLayer=window.dataLayer||[];
(function(){var loaded=false;function loadGTM(){if(loaded)return;loaded=true;(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-TJVKD4QZ');}
['click','touchstart','keydown','scroll','mousemove'].forEach(function(e){document.addEventListener(e,loadGTM,{once:true,passive:true});});setTimeout(loadGTM,8000);})();
</script>
</head>
<body>
<script>history.scrollRestoration='manual';window.scrollTo(0,0);</script>
<!-- Ticker bar -->
<div aria-label="Trust indicators" class="trib" role="region">
<div class="trib-inner">
<span>✓ <strong>24+ Years</strong> Commercial Experience</span>
<span>✓ <strong>9,400+</strong> Vehicles Wrapped</span>
<span>🚐 Free Fleet Pickup — All of Chicagoland</span>
<span>⚡ 2-Hour Estimate Response</span>
<span>📞 (312) 597-1286 — Mon–Fri 8AM–5PM</span>
<span>🏆 6th Wrap Free — Fleet Loyalty Program</span>
<span>💰 IRS Section 179 — 100% Deductible</span>
<span>✓ <em>24+ Years</em> Commercial Experience</span>
<span>✓ <em>9,400+</em> Vehicles Wrapped</span>
<span>🚐 Free Fleet Pickup — All of Chicagoland</span>
<span>⚡ 2-Hour Estimate Response</span>
<span>📞 (312) 597-1286 — Mon–Fri 8AM–5PM</span>
<span>🏆 6th Wrap Free — Fleet Loyalty Program</span>
<span>💰 IRS Section 179 — 100% Deductible</span>
</div>
</div>
<!-- Header / Navigation -->
<header role="banner">
<div class="hbar">
<a aria-label="Chicago Fleet Wraps - Home" class="logo" href="/"><img alt="Chicago Fleet Wraps" height="38" src="/images/logo-horizontal.webp" style="height:38px;width:auto" width="180"/></a>
<nav aria-label="Main navigation" role="navigation">
<div class="ni"><button aria-haspopup="true">Services <svg height="6" viewBox="0 0 10 6" width="10"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"/></svg></button>
<div class="drop">
<a href="/commercial-vehicle-wraps-chicago/">Commercial Fleets</a>
<a href="/boxtruck/">Box Trucks</a>
<a href="/sprinter/">Sprinter Vans</a>
<a href="/commercial/">Transit Vans</a>
<a href="/colorchange/">Color Change Wraps</a>
<a href="/ev-wraps/">⚡ Electric Vehicle Wraps</a>
<a href="/wall-wraps/">Wall Graphics</a>
<a href="/wrap-removal/">Wrap Removal</a>
</div></div>
<div class="ni"><button aria-haspopup="true">Industries <svg height="6" viewBox="0 0 10 6" width="10"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"/></svg></button>
<div class="drop">
<a href="/hvac-van-wraps-chicago/">❄ HVAC</a>
<a href="/plumbing-van-wraps-chicago/">🚰 Plumbing</a>
<a href="/electrician-vehicle-wraps-chicago/">⚡ Electrical</a>
<a href="/contractor-vehicle-wraps-chicago/">🔨 Contractors</a>
<a href="/delivery-fleet-wraps-chicago/">📦 Delivery</a>
<a href="/food-truck-wraps-chicago/">🍔 Food Trucks</a>
<a href="/landscaping-truck-wraps-chicago/">🌿 Landscaping</a>
<a href="/boat-wraps-chicago/">⛵ Boating</a>
<a href="/moving-truck-wraps-chicago/">🚚 Moving</a>
</div></div>
<div class="ni"><button aria-haspopup="true">Resources <svg height="6" viewBox="0 0 10 6" width="10"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"/></svg></button>
<div class="drop">
<a href="/roi/">ROI Calculator Guide</a>
<a href="/stats/">Wrap Industry Stats</a>
<a href="/vsads/">Wraps vs. Ads</a>
<a href="/blog/">Blog</a>
<a href="/faq/">FAQ</a>
<a href="/warranty/">Warranty</a>
</div></div>
<div class="ni"><button aria-haspopup="true">Cities <svg height="6" viewBox="0 0 10 6" width="10"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"/></svg></button>
<div class="drop">
<a href="/chicago/">Chicago</a>
<a href="/schaumburg/">Schaumburg</a>
<a href="/naperville/">Naperville</a>
<a href="/aurora/">Aurora</a>
<a href="/elgin/">Elgin</a>
<a href="/joliet/">Joliet</a>
<a href="/evanston/">Evanston</a>
<a href="/skokie/">Skokie</a>
<a href="/oak-park/">Oak Park</a>
<a href="/servicearea/">📍 All 75 Cities</a>
</div></div>
<div class="ni"><button aria-haspopup="true">Company <svg height="6" viewBox="0 0 10 6" width="10"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"/></svg></button>
<div class="drop">
<a href="/about/">About the Team</a>
<a href="/portfolio/">Portfolio</a>
<a href="/contact/">Contact</a>
<a href="/rent-the-bay/">🔧 Rent the Bay</a>
<a href="/refund-policy/">Refund Policy</a>
</div></div>
</nav>
<div class="hright">
<a class="gmb-header" href="https://g.page/r/CYlPAF8xkJCsEAE/review" rel="noopener" target="_blank">
<span class="gs">★★★★★</span>
<div><span>4.9 / 5.0</span><small>42 reviews</small></div>
</a>
<a class="hphone" href="tel:+13125971286">📞 (312) 597-1286</a>
<a class="btn bg pulse" href="/portfolio/">Portfolio</a>
<a class="btn bo" href="/estimate/" style="border-color:var(--gold);color:var(--gold)">Get Estimate</a>
<button aria-controls="mnav" aria-expanded="false" aria-label="Open menu" class="hambtn" onclick="var m=document.getElementById('mnav');m.classList.toggle('open');this.setAttribute('aria-expanded',m.classList.contains('open'))">☰</button>
</div>
</div>
</header>
<!-- Mobile nav -->
<div class="mnav" id="mnav">
<span class="mg">Services</span>
<a href="/commercial-vehicle-wraps-chicago/">Commercial Fleets</a>
<a href="/boxtruck/">Box Trucks</a>
<a href="/sprinter/">Sprinter Vans</a>
<a href="/colorchange/">Color Change</a>
<a href="/ev-wraps/">⚡ EV Wraps</a>
<a href="/wall-wraps/">Wall Graphics</a>
<a href="/wrap-removal/">Wrap Removal</a>
<span class="mg">Industries</span>
<a href="/hvac-van-wraps-chicago/">HVAC</a>
<a href="/plumbing-van-wraps-chicago/">Plumbing</a>
<a href="/electrician-vehicle-wraps-chicago/">Electrical</a>
<a href="/contractor-vehicle-wraps-chicago/">Contractors</a>
<a href="/delivery-fleet-wraps-chicago/">Delivery</a>
<a href="/food-truck-wraps-chicago/">Food Trucks</a>
<a href="/landscaping-truck-wraps-chicago/">Landscaping</a>
<a href="/boat-wraps-chicago/">Boating</a>
<a href="/moving-truck-wraps-chicago/">Moving Companies</a>
<span class="mg">Cities</span>
<a href="/chicago/">Chicago</a>
<a href="/schaumburg/">Schaumburg</a>
<a href="/naperville/">Naperville</a>
<a href="/servicearea/">All 75 Cities</a>
<span class="mg">More</span>
<a href="/portfolio/">Portfolio</a>
<a href="/blog/">Blog</a>
<a href="/about/">About</a>
<a href="/faq/">FAQ</a>
<a href="/rent-the-bay/">🔧 Rent the Bay</a>
<a href="/estimate/">Get Estimate</a>
<a href="/contact/">Contact</a>
</div>
<main role="main">
<div class="content">
<nav class="breadcrumb" aria-label="Breadcrumb">
<a href="/">Home</a> › ${page.category === 'Blog' ? '<a href="/blog/">Blog</a> › ' : ''}${page.category === 'Cities' ? '<a href="/servicearea/">Service Area</a> › ' : ''}${escapeHtml(page.h1)}
</nav>
<h1>${escapeHtml(page.h1)}</h1>
${page.heroImage ? `<div class="page-hero-banner" style="margin:-0px 0 32px;border-radius:12px;overflow:hidden"><img src="/images/${page.heroImage}" alt="${escapeHtml(page.h1)} — Chicago Fleet Wraps" loading="eager"/></div>` : ''}

${page.slug === 'portfolio' ? PORTFOLIO_GALLERY_HTML : (page.city ? content : `
<p class="lead speakable">${escapeHtml(content)}</p>

<div class="trust">
<span>📅 <strong>24+ Years</strong> Experience</span>
<span>🏆 <strong>9,400+</strong> Vehicles Wrapped</span>
<span>✓ <strong>Avery Dennison & 3M</strong> Only</span>
<span>📍 <strong>Chicago, IL</strong></span>
<span>🚐 <strong>Free Fleet Pickup</strong></span>
</div>

<div class="cta-bar">
<a href="/estimate/" class="btn btn-primary">Get a Free Estimate →</a>
<a href="tel:+13125971286" class="btn" style="border-color:var(--gold);color:var(--gold)">📞 (312) 597-1286</a>
</div>

<section class="overview" style="margin:40px 0">
<h2>Why Chicago Fleet Wraps for ${escapeHtml(page.h1)}</h2>
<p>Since 2001, Chicago Fleet Wraps has built its reputation on one standard: cast vinyl only, applied right the first time. We use <strong>Avery Dennison MPI 1105</strong> and <strong>3M IJ180-CV3</strong> — the same materials Amazon DSP operators, regional distributors, and national brands rely on. No calendered shortcuts, no subcontractors, no exceptions.</p>
<p>With <strong>9,400+ vehicles wrapped</strong> and <strong>zero verified paint damage claims</strong> in 10+ years, our track record speaks for itself. Every project comes with a <strong>2-year workmanship warranty</strong> and free pickup and delivery throughout Chicagoland — Cook, DuPage, Kane, Lake, Will, and McHenry Counties.</p>
</section>

<section style="margin:40px 0">
<h2>What's Included in Every Wrap</h2>
<ul style="color:rgba(255,255,255,.72);line-height:2;padding-left:20px">
<li>Free fleet pickup and drop-off anywhere in Chicagoland</li>
<li>Custom design on your exact vehicle template — unlimited revisions</li>
<li>HP Latex print — Pantone-matched output, UV-stable inks</li>
<li>Avery Dennison MPI 1105 or 3M IJ180-CV3 cast vinyl only</li>
<li>DOL 1360 gloss overlaminate for maximum durability</li>
<li>Professional installation by experienced technicians</li>
<li>2-year workmanship warranty — zero paint damage claims</li>
<li>IRS Section 179 deductible — 100% advertising expense</li>
</ul>
</section>

<section style="margin:40px 0">
<h2>Chicago Fleet Wrap Pricing</h2>
<p>All pricing is based on square footage and vinyl tier. Premium cast vinyl runs <strong>$9.75/sqft</strong>. Color change wraps are <strong>$8.25/sqft</strong>. Here are our standard starting prices:</p>
<ul style="color:rgba(255,255,255,.72);line-height:2;padding-left:20px">
<li><strong>Cargo Van Full Wrap</strong> — from $3,750</li>
<li><strong>Sprinter Van Full Wrap</strong> — from $4,700</li>
<li><strong>Box Truck 16 ft</strong> — from $5,000</li>
<li><strong>Box Truck 26 ft</strong> — from $10,900</li>
</ul>
<p>Fleet discounts apply automatically: <strong>3%</strong> for 2–4 vehicles, <strong>7%</strong> for 5–9, <strong>11%</strong> for 10–24, <strong>15%</strong> for 25+. Use our <a href="/wrap-calculator">instant price calculator</a> for your exact vehicle.</p>
</section>

<section style="margin:40px 0">
<h2>The Wrap Process — Start to Finish</h2>
<ol style="color:rgba(255,255,255,.72);line-height:2;padding-left:20px">
<li><strong>Free Estimate:</strong> Submit online or call (312) 597-1286. We respond within 2 hours with real pricing.</li>
<li><strong>Design & Approval:</strong> Our team creates custom mockups on your exact vehicle. Unlimited revisions until you sign off.</li>
<li><strong>Free Pickup:</strong> We come to your yard, your lot, or your facility anywhere in Chicagoland.</li>
<li><strong>Professional Install:</strong> 1–4 days depending on vehicle size. Cast vinyl only. No shortcuts.</li>
<li><strong>Delivery + Warranty:</strong> Vehicles returned wrapped and ready. 2-year workmanship warranty included.</li>
</ol>
</section>

<section style="margin:40px 0">
<h2>Materials: Avery Dennison vs 3M</h2>
<p>Chicago Fleet Wraps uses two cast vinyl systems — both rated for <strong>5–7 years outdoor</strong> in Chicago's climate. We don't use calendered vinyl, economy films, or off-brand materials on any commercial job.</p>
<ul style="color:rgba(255,255,255,.72);line-height:2;padding-left:20px">
<li><strong>Avery Dennison MPI 1105</strong> — our primary fleet material. Conformable cast film for rivets, curves, and compound shapes. Consistent performance across all vehicle types.</li>
<li><strong>3M IJ180-CV3</strong> — premium cast vinyl with Comply air-release technology. Used on smooth surfaces and color change applications.</li>
<li><strong>DOL 1360 Overlaminate</strong> — gloss overlaminate applied to all prints. Adds UV protection and scratch resistance to extend wrap life.</li>
</ul>
</section>

<section style="margin:40px 0">
<h2>${page.h1} Near Me — Chicagoland Service Area</h2>
<p style="color:rgba(255,255,255,.72);line-height:1.7">Chicago Fleet Wraps provides ${page.h1.toLowerCase()} services across the entire Chicagoland metro area. Whether you're in the city or the suburbs, we offer free pickup and delivery for all wrap projects. Our shop near me serves businesses in:</p>
<ul style="color:rgba(255,255,255,.72);line-height:2;padding-left:20px;columns:2;column-gap:40px">
<li><strong><a href="/chicago/" style="color:var(--gold)">Chicago</a></strong> — All 77 neighborhoods including the Loop, Lincoln Park, Wicker Park, Logan Square, and Lakeview</li>
<li><strong><a href="/elmhurst/" style="color:var(--gold)">Elmhurst</a></strong> — DuPage County businesses and contractors</li>
<li><strong><a href="/naperville/" style="color:var(--gold)">Naperville</a></strong> — Western suburban commercial fleets</li>
<li><strong><a href="/aurora/" style="color:var(--gold)">Aurora</a></strong> — Kane County service companies</li>
<li><strong><a href="/schaumburg/" style="color:var(--gold)">Schaumburg</a></strong> — Northwest suburban businesses</li>
<li><strong><a href="/evanston/" style="color:var(--gold)">Evanston</a></strong> — North Shore and north suburban fleets</li>
<li><strong><a href="/oak-park/" style="color:var(--gold)">Oak Park</a></strong> — Near west suburban service companies</li>
<li><strong><a href="/joliet/" style="color:var(--gold)">Joliet</a></strong> — Will County commercial vehicles</li>
<li><strong>Downers Grove &amp; Lombard</strong> — Western suburban fleets</li>
<li><strong>Orland Park &amp; Tinley Park</strong> — South suburban businesses</li>
<li><strong>Arlington Heights &amp; Palatine</strong> — Northwest Cook County</li>
<li><strong><a href="/elgin/" style="color:var(--gold)">Elgin</a></strong> — Fox Valley area businesses</li>
</ul>
<p style="color:rgba(255,255,255,.72);line-height:1.7;margin-top:12px">Free pickup and delivery for all projects. <a href="/servicearea/" style="color:var(--gold)">View all 75+ cities we serve →</a></p>
</section>

<section style="margin:40px 0">
<h2>Frequently Asked Questions</h2>
<div class="faq" style="border-top:1px solid rgba(255,255,255,.1);margin-top:16px">
<div style="padding:20px 0;border-bottom:1px solid rgba(255,255,255,.08)">
<h3 style="font-size:1rem;color:#fff;margin-bottom:8px">How long does a commercial vehicle wrap last?</h3>
<p style="color:rgba(255,255,255,.65);margin:0">Cast vinyl wraps using Avery Dennison MPI 1105 or 3M IJ180-CV3 are rated for 5–7 years outdoor. With proper care — hand washing, no automated brush washes — Chicago fleet wraps regularly hit 6–7 years even with road salt and winter exposure.</p>
</div>
<div style="padding:20px 0;border-bottom:1px solid rgba(255,255,255,.08)">
<h3 style="font-size:1rem;color:#fff;margin-bottom:8px">Do wraps damage paint?</h3>
<p style="color:rgba(255,255,255,.65);margin:0">No. Chicago Fleet Wraps has <strong>zero verified paint damage claims</strong> in 10+ years of operation. Wraps actually protect factory paint from UV and minor scratches. When removed correctly, paint is preserved — often in better condition than unwrapped vehicles.</p>
</div>
<div style="padding:20px 0;border-bottom:1px solid rgba(255,255,255,.08)">
<h3 style="font-size:1rem;color:#fff;margin-bottom:8px">Are vehicle wraps tax deductible?</h3>
<p style="color:rgba(255,255,255,.65);margin:0">Yes. Commercial vehicle wraps are 100% deductible under IRS Section 179 as a business advertising expense. A $5,000 wrap for a business in the 25% bracket costs $3,750 after the deduction. Consult your tax professional for details.</p>
</div>
<div style="padding:20px 0">
<h3 style="font-size:1rem;color:#fff;margin-bottom:8px">How much does a vehicle wrap cost in Chicago?</h3>
<p style="color:rgba(255,255,255,.65);margin:0">Cargo van full wraps start at $3,750. Sprinter vans from $4,700. Box trucks from $5,000 to $10,900. Pricing is based on square footage at $9.75/sqft for premium cast vinyl. Fleet discounts up to 15% for 25+ vehicles. Use our <a href="/wrap-calculator">instant calculator</a> for exact pricing on 310+ vehicles.</p>
</div>
</div>
</section>

<div class="cta-bar" style="margin-top:48px">
<a href="/estimate/" class="btn btn-primary" style="font-size:1.05rem;padding:14px 36px">Get Your Free Estimate →</a>
<a href="tel:+13125971286" class="btn" style="border-color:var(--gold);color:var(--gold)">📞 (312) 597-1286</a>
</div>
`)}

${relatedLinks}
</div>
</main>
<script defer src="/js/gmb-live.js"></script>
<script defer src="/js/chat-widget.js"></script>
</body>
</html>`;
}

// Build route path from public HTML file path
function routeFromHtmlFile(file) {
  if (file === 'index.html') return '/';
  if (file.endsWith('/index.html')) return `/${file.replace(/\/index\.html$/, '')}/`;
  return `/${file}`;
}

// Internal link rewriting map: old short paths â canonical long-keyword paths
const LINK_REWRITES = {
  '/commercial/':     '/commercial-vehicle-wraps-chicago/',
  '/removal/':        '/wrap-removal/',
  '/hvac/':           '/hvac-van-wraps-chicago/',
  '/plumber/':        '/plumbing-van-wraps-chicago/',
  '/electric/':       '/electrician-vehicle-wraps-chicago/',
  '/contractor/':     '/contractor-vehicle-wraps-chicago/',
  '/delivery/':       '/delivery-fleet-wraps-chicago/',
  '/foodtruck/':      '/food-truck-wraps-chicago/',
  '/landscape/':      '/landscaping-truck-wraps-chicago/',
  '/boating/':        '/boat-wraps-chicago/',
  '/moving/':         '/moving-truck-wraps-chicago/',
  '/partial-wraps/':  '/partial-vehicle-wraps-chicago/',
  '/fleet/':          '/fleet-wraps-chicago/',
  '/brandaudit/':     '/brand-audit/',
};

// Pages that should NOT be indexed (internal tools, forms, utility pages)
const NOINDEX_SLUGS = new Set([
  // True utility/internal pages only — nothing public-facing
  'intake', 'schedule', 'brand-audit', 'custom-sitemap', '404', 'site', 'brandaudit',
]);

function normalizeHtmlForIndexing(file, html) {
  let output = html;
  const route = routeFromHtmlFile(file);
  const canonicalUrl = `${BASE_URL}${route}`;

  // Check if this is a noindex utility page
  const slug = file.replace(/\/index\.html$/, '').replace(/\.html$/, '');
  const shouldNoindex = NOINDEX_SLUGS.has(slug) || file === 'site.html';

  // 1) Remove any JS soft-redirect/cloaking snippets
  output = output.replace(/<script>\s*if\s*\(\s*window\.history[\s\S]*?route[\s\S]*?<\/script>/gi, '');
  output = output.replace(/<script>[^<]*?(?:bot|crawl|spider)[^<]*?route[^<]*?<\/script>/gi, '');

  // 2) Set robots directive — remove ALL existing then inject one
  const robotsContent = shouldNoindex
    ? 'noindex, nofollow'
    : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
  output = output.replace(/<meta[^>]*name=["']robots["'][^>]*\/?>/gi, '');
  output = output.replace(/<meta[^>]*content=["'][^"']*["'][^>]*name=["']robots["'][^>]*\/?>/gi, '');
  output = output.replace(/<\/head>/i, `<meta name="robots" content="${robotsContent}">\n</head>`);

  // 3) Ensure canonical is self-referential — remove ALL then inject one
  output = output.replace(/<link[^>]*rel=["']canonical["'][^>]*\/?>/gi, '');
  output = output.replace(/<link[^>]*href=["'][^"']*["'][^>]*rel=["']canonical["'][^>]*\/?>/gi, '');
  output = output.replace(/<\/head>/i, `<link rel="canonical" href="${canonicalUrl}">\n</head>`);

  // 4) Ensure og:url aligns with canonical — remove ALL then inject one
  output = output.replace(/<meta[^>]*property=["']og:url["'][^>]*\/?>/gi, '');
  output = output.replace(/<meta[^>]*content=["'][^"']*["'][^>]*property=["']og:url["'][^>]*\/?>/gi, '');
  output = output.replace(/<\/head>/i, `<meta property="og:url" content="${canonicalUrl}">\n</head>`);

  // 5a) SEO guard: .hero-h2 MUST be a <p>, not <h2>, to avoid duplicate heading issues.
  //     The page-hero-banner subtitle is a visual element, not a semantic heading.
  output = output.replace(/<h2([^>]*class="[^"]*hero-h2[^"]*"[^>]*)>/gi, '<p$1>');
  output = output.replace(/<\/h2>(?=\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<section)/gi, '</p>');
  // 5) Rewrite internal links from short slugs to canonical long-keyword URLs
  for (const [oldPath, newPath] of Object.entries(LINK_REWRITES)) {
    // Match href="/old-slug/" in any attribute context
    const escaped = oldPath.replace(/\//g, '\\/');
    const regex = new RegExp(`href="${escaped}"`, 'g');
    output = output.replace(regex, `href="${newPath}"`);
  }

  return output;
}

function regenerateSitemapFromPublicFiles() {
  const htmlFiles = globSync('**/*.html', { cwd: PUBLIC_DIR });
  // Use NOINDEX_SLUGS as the single source of truth for sitemap exclusion
  // Also exclude non-page files and redirect stubs
  const excluded = new Set(['googleac4190c5fb66b0fb.html', 'site.html', 'googleac4190c5fb66b0fb/index.html', '404.html']);
  const redirectSlugs = actualRedirectPaths;
  console.log(`  Excluding ${NOINDEX_SLUGS.size} noindex slugs from sitemap`);

  const routeMap = new Map();

  // Homepage
  const indexStat = fs.statSync(path.join(PUBLIC_DIR, '../index.html'));
  routeMap.set('/', indexStat.mtime.toISOString().split('T')[0]);

  // Wrap calculator (flat .html file, no trailing slash) — only add once
  try {
    const calcStat = fs.statSync(path.join(PUBLIC_DIR, 'wrap-calculator.html'));
    routeMap.set('/wrap-calculator', calcStat.mtime.toISOString().split('T')[0]);
  } catch(e) {}

  for (const file of htmlFiles) {
    if (excluded.has(file)) continue;
    if (redirectSlugs.has(file)) continue;
    if (file === 'wrap-calculator.html') continue;
    const route = routeFromHtmlFile(file);
    const routeSlug = route.replace(/^\//, '').replace(/\/$/, '');
    if (NOINDEX_SLUGS.has(routeSlug)) continue;
    const filePath = path.join(PUBLIC_DIR, file);
    const stat = fs.statSync(filePath);
    routeMap.set(route, stat.mtime.toISOString().split('T')[0]);
  }

  const sortedRoutes = [...routeMap.keys()].sort((a, b) => {
    if (a === '/') return -1;
    if (b === '/') return 1;
    return a.localeCompare(b);
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sortedRoutes.map((route) => {
      const highValueRoutes = ['/commercial-vehicle-wraps-chicago/','/boxtruck/','/sprinter/','/ev-wraps/','/hvac-van-wraps-chicago/','/plumbing-van-wraps-chicago/','/electrician-vehicle-wraps-chicago/','/contractor-vehicle-wraps-chicago/','/delivery-fleet-wraps-chicago/','/food-truck-wraps-chicago/','/landscaping-truck-wraps-chicago/','/moving-truck-wraps-chicago/','/boat-wraps-chicago/','/colorchange/','/wallwraps/','/vehicle-wrap-cost-chicago/','/wrap-calculator','/box-truck-wraps-chicago/','/sprinter-van-wraps/','/color-change-wraps/','/fleet-wraps-chicago/','/truck-wraps-chicago/','/van-wraps-chicago/','/vehicle-wraps-chicago/','/partial-vehicle-wraps-chicago/'];
      const priority = route === '/' ? '1.0' : highValueRoutes.includes(route) ? '0.9' : route.startsWith('/post/') ? '0.7' : route.startsWith('/about') || route.startsWith('/faq') || route.startsWith('/blog') || route.startsWith('/portfolio') ? '0.8' : '0.6';
      const changefreq = route === '/' ? 'daily' : highValueRoutes.includes(route) ? 'weekly' : route.startsWith('/post/') ? 'monthly' : 'monthly';
      const lastmod = routeMap.get(route);
      return `  <url><loc>${BASE_URL}${route}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
    }),
    '</urlset>',
    '',
  ].join('\n');

  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), xml, 'utf-8');
  console.log(`\nðºï¸ Rebuilt sitemap.xml from actual files (${sortedRoutes.length} URLs, real lastmod dates)`);
}

// === Redirect map: short slug (loser) â long keyword slug (winner) ===
const REDIRECTS = {
  'commercial':     'commercial-vehicle-wraps-chicago',
  'removal':        'wrap-removal',
  'hvac':           'hvac-van-wraps-chicago',
  'plumber':        'plumbing-van-wraps-chicago',
  'electric':       'electrician-vehicle-wraps-chicago',
  'contractor':     'contractor-vehicle-wraps-chicago',
  'delivery':       'delivery-fleet-wraps-chicago',
  'foodtruck':      'food-truck-wraps-chicago',
  'landscape':      'landscaping-truck-wraps-chicago',
  'boating':        'boat-wraps-chicago',
  'moving':         'moving-truck-wraps-chicago',
  'partial-wraps':  'partial-vehicle-wraps-chicago',
  'fleet':          'fleet-wraps-chicago',
  'brandaudit':     'brand-audit',
};

function generateRedirectPage(fromSlug, toSlug) {
  const canonicalUrl = `${BASE_URL}/${toSlug}/`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Redirecting to ${toSlug}</title>
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="${canonicalUrl}">
<meta property="og:url" content="${canonicalUrl}">
<meta http-equiv="refresh" content="0;url=/${toSlug}/">
<script>window.location.replace('/${toSlug}/');</script>
</head>
<body>
<p>This page has moved to <a href="/${toSlug}/">${canonicalUrl}</a>.</p>
</body>
</html>`;
}

// Main execution
console.log('ð Generating static HTML pages...');
let generatedCount = 0;
const generatedFiles = new Set();

for (const page of PAGES) {
  const dir = path.join(PUBLIC_DIR, page.url);
  fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, 'index.html');

  // Preserve rich hand-crafted or Eleventy-compiled pages (> 150 lines)
  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath, 'utf-8');
    const lineCount = existing.split('\n').length;
    const isRedirectStub = existing.includes('http-equiv="refresh"') || existing.includes("http-equiv='refresh'");
    if (lineCount > 400 && !isRedirectStub) {
      console.log(`  PRESERVE /${page.url}/ (${lineCount} lines)`);
      generatedCount++;
      continue;
    }
  }

  const html = generatePage(page);
  fs.writeFileSync(filePath, html, 'utf-8');
  generatedFiles.add(path.relative(PUBLIC_DIR, filePath));
  generatedCount++;
  console.log(`  GEN /${page.url}/`);
}
console.log(`\nâ Generated ${generatedCount} static HTML pages`);

// Generate redirect stubs for duplicate short slugs
// IMPORTANT: Skip files that already have hand-crafted content (>20 lines, no meta refresh)
// This prevents the build from overwriting rich SEO content pages with redirect stubs
let redirectCount = 0;
let preservedCount = 0;
const actualRedirectPaths = new Set(); // Track only files that ARE redirect stubs

for (const [fromSlug, toSlug] of Object.entries(REDIRECTS)) {
  const dir = path.join(PUBLIC_DIR, fromSlug);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, 'index.html');

  // Check if file already has hand-crafted content worth preserving
  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath, 'utf-8');
    const lineCount = existing.split('\n').length;
    const isRedirectStub = existing.includes('http-equiv="refresh"') || existing.includes("http-equiv='refresh'");
    if (lineCount > 20 && !isRedirectStub) {
      preservedCount++;
      console.log(`  â­ï¸  /${fromSlug}/ â preserving hand-crafted content (${lineCount} lines)`);
      continue;
    }
  }

  const html = generateRedirectPage(fromSlug, toSlug);
  fs.writeFileSync(filePath, html, 'utf-8');
  actualRedirectPaths.add(`${fromSlug}/index.html`);
  redirectCount++;
  console.log(`  âª /${fromSlug}/ â /${toSlug}/`);
}
console.log(`\nâª Generated ${redirectCount} redirect stubs (preserved ${preservedCount} hand-crafted pages)`);

// Normalize every HTML file for indexability (skip only ACTUAL redirect stubs)
// Only normalize files written by THIS script run — never touch hand-crafted pages
const allHtmlFiles = [...generatedFiles];
let normalizedCount = 0;
for (const file of allHtmlFiles) {
  if (actualRedirectPaths.has(file)) continue;
  
  const fp = path.join(PUBLIC_DIR, file);
  const original = fs.readFileSync(fp, 'utf-8');
  const normalized = normalizeHtmlForIndexing(file, original);

  if (normalized !== original) {
    fs.writeFileSync(fp, normalized, 'utf-8');
    normalizedCount++;
    console.log(`  ð§¹ Normalized SEO/indexing for ${file}`);
  }
}

console.log(`\nð§¹ Normalized ${normalizedCount} HTML files for indexability`);

// Re-enabled: Auto-generate clean sitemap (excludes Netlify-redirected slugs)
regenerateSitemapFromPublicFiles();
