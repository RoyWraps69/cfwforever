#!/usr/bin/env node
/* Last regenerated: 2026-03-11 — internal links, mobile nav, JSON-LD upgrades */
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
const BASE_URL = 'https://www.chicagofleetwraps.com';

// All pages with SEO metadata, content, and URL mapping
const PAGES = [
  // === Service Pages (no duplicates — long-keyword versions live as hand-crafted HTML) ===
  { slug: 'boxtruck', url: 'boxtruck', ogImage: 'windy_city_box_truck.webp', heroImage: 'hunt_brothers_pizza_truck.jpg', h1: 'Box Truck Wraps Chicago', desc: 'Box truck wraps in Chicago — 16 to 26 ft. Avery Dennison & 3M cast vinyl. 2-year warranty. 70,000+ daily impressions. Get a free quote today →', title: 'Box Truck Wraps Chicago — 16 to 26 ft | From $4,500 | Chicago Fleet Wraps', category: 'Services', keywords: 'box truck wraps Chicago, box truck graphics, 16 ft box truck wrap, 26 ft box truck wrap, truck wrap cost Chicago', content: 'A wrapped box truck on I-90, I-290, or I-94 generates 70,000+ daily impressions with zero recurring ad spend. All sizes: 16, 18, 20, 22, 24, 26 ft box trucks. Cab, box sides, and rear door fully covered. Avery Dennison MPI 1105 cast vinyl rated 7 years.' },
  { slug: 'sprinter', url: 'sprinter', ogImage: 'precision_today_sprinter.jpg', heroImage: 'cfw_van_3.webp', h1: 'Sprinter Van Wraps Chicago', desc: 'Mercedes Sprinter van wraps in Chicago — standard & high-roof. Full and partial options. ★ 5.0 Google rating. Request your free estimate →', title: 'Sprinter Van Wraps Chicago | From $3,700 | Chicago Fleet Wraps', category: 'Services', keywords: 'sprinter van wraps Chicago, Mercedes Sprinter wrap, high roof sprinter wrap, sprinter van graphics, sprinter wrap cost', content: 'Professional Mercedes Sprinter van wraps in Chicago. Standard and high-roof models. Full and partial wrap options. Premium Avery Dennison MPI 1105 and 3M IJ180-CV3 cast vinyl. Free pickup throughout Chicagoland.' },
  { slug: 'transit', url: 'transit', ogImage: 'small_transit_van_opt.webp', heroImage: 'cfw_van_1.webp', h1: 'Transit Van Wraps Chicago', desc: 'Ford Transit van wraps in Chicago — full & partial commercial wraps. Premium cast vinyl. Free pickup across Chicagoland. Call (312) 597-1286 →', title: 'Transit Van Wraps Chicago | Free Pickup | Chicago Fleet Wraps', category: 'Services', keywords: 'Ford Transit van wraps Chicago, transit van graphics, transit van wrap cost, commercial van wraps', content: 'Ford Transit van wraps in Chicago. Full and partial commercial wrap options. Premium cast vinyl materials. Free fleet pickup and delivery across Chicagoland.' },
  { slug: 'colorchange', url: 'colorchange', ogImage: 'color_change_tesla.webp', heroImage: 'audi_color_shift.jpg', h1: 'Color Change Wraps Chicago', desc: '120+ colors — gloss, matte, satin, chrome. Avery Dennison & 3M certified. Cars, trucks, SUVs. See our gallery & get a free quote →', title: 'Color Change Wraps Chicago | 120+ Colors | Chicago Fleet Wraps', category: 'Services', keywords: 'color change wrap Chicago, matte wrap, satin wrap, gloss wrap, chrome wrap, vehicle color change, car wrap colors', content: 'Full color change vehicle wraps in Chicago. Over 120 colors available including gloss, matte, satin, metallic, and chrome finishes. Avery Dennison Supreme Wrapping Film and 3M 2080 series. Professional installation with 2-year workmanship warranty.' },
  { slug: 'wallwraps', url: 'wallwraps', ogImage: 'oakbros_wall_wrap.jpg', heroImage: 'balloon_museum_massive.jpg', h1: 'Wall Wraps & Murals Chicago', desc: 'Custom wall wraps, murals & environmental graphics in Chicago. Interior and exterior. See our work & request a free quote →', title: 'Wall Wraps & Murals Chicago | Chicago Fleet Wraps', category: 'Services', keywords: 'wall wraps Chicago, wall murals, environmental graphics, wall graphics, office wall wrap, commercial murals Chicago', content: 'Custom wall wraps, murals, and environmental graphics in Chicago. Interior and exterior installations. Commercial lobbies, retail spaces, gyms, restaurants. High-resolution printing on premium adhesive vinyl.' },
  { slug: 'ev', url: 'ev-wraps', ogImage: 'rivian_blue_holographic.jpg', heroImage: 'rivian_rad.jpg', h1: 'Electric Vehicle Wraps Chicago — #1 EV Wrap Shop in Illinois', desc: "Illinois' #1 EV wrap shop — 600+ Rivians, hundreds of Teslas. Zero warranty issues. Color change & commercial. Get your free EV quote →", title: 'EV Wraps Chicago — #1 in Illinois | 600+ Rivians | Chicago Fleet Wraps', category: 'Services', keywords: 'EV wraps Chicago, electric vehicle wrap, Rivian wrap, Tesla wrap, Lucid wrap, BMW iX wrap, EV color change, electric car wrap Illinois', content: "Illinois' largest EV wrap installer. 600+ Rivians wrapped. Tesla Model 3, Model Y, Model S, Model X. Rivian R1T, R1S. Lucid Air. BMW iX. Polestar. Color change and commercial wraps. Zero warranty issues. Avery Dennison and 3M certified." },
  // Removed: commercial, removal → canonical at /commercial-vehicle-wraps-chicago/ and /wrap-removal/

  // === Industry Pages — REMOVED short slugs, canonical lives at long-keyword HTML ===
  // Removed: hvac, plumber, electric, contractor, delivery, foodtruck, landscape, boating, moving
  // Canonical URLs: /hvac-van-wraps-chicago/, /plumbing-van-wraps-chicago/, etc.

  // === Core Pages ===
  { slug: 'portfolio', url: 'portfolio', ogImage: 'corvette_mid_wrap.jpg', heroImage: 'pink_chrome.webp', h1: 'Vehicle Wrap Gallery & Portfolio', desc: 'Real car, truck, van & fleet wrap projects from Chicago. Bold, custom designs. 9,400+ vehicles completed. Browse our gallery →', title: 'Vehicle Wrap Gallery & Portfolio | Chicago Fleet Wraps', category: 'Company', keywords: 'vehicle wrap portfolio, fleet wrap gallery, wrap examples Chicago, vehicle wrap before after', content: 'Browse our portfolio of vehicle wrap projects. Commercial fleet wraps, color change wraps, box truck wraps, sprinter van wraps, and more. All projects completed in Chicago.' },
  { slug: 'blog', url: 'blog', ogImage: 'cfw_van_2.webp', heroImage: 'cfw_truck_1.webp', h1: 'Fleet Wrap Insights & Blog', desc: 'Expert guides, ROI data & industry knowledge from 24+ years in the wrap business. Read our latest articles →', title: 'Fleet Wrap Blog & Guides | Chicago Fleet Wraps', category: 'Company', keywords: 'fleet wrap blog, vehicle wrap tips, wrap industry insights, fleet branding articles', content: 'Expert guides, ROI data, and industry knowledge from 24+ years in the wrap business. Articles on materials, pricing, care, and fleet wrap strategies.' },
  { slug: 'faq', url: 'faq', ogImage: 'wrap_install_closeup.jpg', heroImage: 'frontier_fleet_vans.jpg', h1: 'Vehicle Wrap FAQs', desc: 'Answers to common vehicle wrap questions — materials, pricing, installation, care & more. Still have questions? Call (312) 597-1286 →', title: 'Vehicle Wrap FAQs | Chicago Fleet Wraps', category: 'Company', keywords: 'vehicle wrap FAQ, wrap questions, how long do wraps last, vehicle wrap cost, wrap care', content: 'Frequently asked questions about vehicle wraps. Materials, pricing, installation timelines, care instructions, warranty information, and more.' },
  { slug: 'about', url: 'about', ogImage: 'balloon_museum_exterior.jpg', heroImage: 'balloon_museum_interior.jpg', h1: 'About Chicago Fleet Wraps', desc: "24+ years. 9,400+ vehicles. ★ 5.0 Google rating. Meet the team behind Chicago's highest-rated fleet wrap company →", title: 'About Chicago Fleet Wraps | 24+ Years | 9,400+ Vehicles', category: 'Company', keywords: 'Chicago Fleet Wraps, vehicle wrap company Chicago, fleet wrap installer, about Chicago Fleet Wraps', content: '24+ years experience in commercial vehicle graphics. Started in Las Vegas in 2001. Operating in Chicago since 2014. 9,400+ vehicles wrapped. 2,800+ fleet accounts.' },
  { slug: 'estimate', url: 'estimate', ogImage: 'cfw_van_1.webp', heroImage: 'cfw_truck_3.webp', h1: 'Get a Free Fleet Wrap Estimate', desc: 'Free fleet wrap estimate — real pricing within 2 hours, not a range. Free pickup across Chicagoland. Request yours now → (312) 597-1286.', title: 'Get a Free Wrap Estimate | Real Pricing in 2 Hours | Chicago Fleet Wraps', category: 'Company', keywords: 'free wrap estimate, fleet wrap quote, vehicle wrap pricing, wrap cost estimate Chicago', content: 'Request a free fleet wrap estimate. Real pricing — not a range — within 2 business hours. Free pickup and delivery throughout Chicagoland.' },
  { slug: 'warranty', url: 'warranty', ogImage: 'cfw_van_3.webp', heroImage: 'precision_today_sprinter.jpg', h1: 'Warranty Policy', desc: '2-year installation warranty + 5–7 year vinyl manufacturer warranty (Avery Dennison & 3M). See full coverage details →', title: 'Warranty Policy | 2-Year + Manufacturer | Chicago Fleet Wraps', category: 'Company', keywords: 'vehicle wrap warranty, wrap guarantee, Avery Dennison warranty, 3M wrap warranty', content: '2-year workmanship warranty covering lifting, peeling, and bubbling. 5–7 year vinyl manufacturer warranty from Avery Dennison and 3M.' },
  { slug: 'servicearea', url: 'servicearea', ogImage: 'chicago_neighborhoods_map.png', heroImage: 'frontier_fleet_vans.jpg', h1: 'Service Area — 75+ Cities in Chicagoland', desc: 'Serving 75+ cities across Chicagoland — Cook, DuPage, Kane, Lake, Will, McHenry. Free fleet pickup & delivery. Find your city →', title: 'Service Area — 75+ Cities | Free Pickup | Chicago Fleet Wraps', category: 'Company', keywords: 'fleet wraps Chicagoland, vehicle wraps near me, fleet wraps Cook County, fleet wraps DuPage County, Chicago suburbs wraps', content: 'Chicago Fleet Wraps serves 75+ cities across Chicagoland including Cook, DuPage, Kane, Lake, Will, and McHenry counties. Free fleet pickup and delivery included.' },
  { slug: 'apparel', url: 'apparel', ogImage: 'beats2.jpg', heroImage: 'mortal_combat.jpg', h1: 'Custom Apparel & Team Wear', desc: 'Custom branded apparel for fleet teams — tees, polos, hats, workwear. Match your wrap branding. Request a quote →', title: 'Custom Apparel & Team Wear | Chicago Fleet Wraps', category: 'Company', keywords: 'custom apparel, team workwear, branded uniforms, fleet team clothing', content: 'Custom branded apparel for fleet teams. T-shirts, polos, hats, workwear. Match your vehicle wrap branding for a cohesive professional image.' },

  // === Resource Pages ===
  { slug: 'roi', url: 'roi', ogImage: 'cfw_truck_1.webp', heroImage: 'frontier_fleet_vans.jpg', h1: 'Fleet Wrap ROI Calculator Guide', desc: 'Calculate your fleet wrap ROI — $0.04 CPM vs $19.70 for Google Ads. See why wraps deliver 2,500–5,000% ROI. Try the calculator →', title: 'Fleet Wrap ROI Calculator | $0.04 CPM | Chicago Fleet Wraps', category: 'Resources', keywords: 'fleet wrap ROI, vehicle wrap return on investment, wrap CPM, advertising ROI calculator', content: 'Calculate your fleet wrap return on investment. Vehicle wraps deliver the lowest CPM of any advertising medium at $0.04–$0.48 per thousand impressions.' },
  { slug: 'stats', url: 'stats', ogImage: 'cfw_truck_3.webp', heroImage: 'cfw_van_2.webp', h1: 'Vehicle Wrap Statistics & Industry Data', desc: '97% recall rate. 70,000 daily impressions. $0.04 CPM. Data from OAAA, 3M & ARF studies. See all the numbers →', title: 'Vehicle Wrap Statistics | 97% Recall Rate | Chicago Fleet Wraps', category: 'Resources', keywords: 'vehicle wrap statistics, wrap impressions data, fleet advertising stats, OAAA wrap data, vehicle wrap CPM', content: '97% ad recall rate. 70,000+ daily impressions per vehicle. $0.04 CPM. Data sourced from OAAA, 3M, and ARF research studies.' },
  { slug: 'vsads', url: 'vsads', ogImage: 'cfw_van_1.webp', heroImage: 'cfw_truck_2.webp', h1: 'Vehicle Wraps vs Google Ads', desc: '$0.48 CPM vs $19.70 — one-time cost vs never-ending ad spend. The math is not close. See the full breakdown →', title: 'Vehicle Wraps vs Google Ads | CPM Comparison | Chicago Fleet Wraps', category: 'Resources', keywords: 'vehicle wraps vs Google Ads, wrap vs billboard, fleet advertising comparison, best advertising for small business', content: 'Vehicle wraps vs Google Ads, billboards, and social media advertising. Side-by-side CPM, ROI, and total cost comparison over 5 years.' },
  { slug: 'materials', url: 'materials', ogImage: 'wrap_install_closeup.jpg', heroImage: 'corvette_mid_wrap.jpg', h1: 'Wrap Materials Guide — Avery Dennison & 3M', desc: 'Compare Avery Dennison MPI 1105 vs 3M IJ180-CV3 cast vinyl — specs, durability & recommendations from 24+ years experience →', title: 'Wrap Materials Guide | Avery Dennison & 3M | Chicago Fleet Wraps', category: 'Resources', keywords: 'Avery Dennison MPI 1105, 3M IJ180-CV3, cast vinyl, wrap materials, vinyl wrap film comparison', content: 'Compare Avery Dennison MPI 1105 and 3M IJ180-CV3 cast vinyl. Specifications, durability ratings, conformability, and professional recommendations.' },
  { slug: 'care', url: 'care', ogImage: 'sandals_color_change.jpg', heroImage: 'bmw_matte_black.jpg', h1: 'Wrap Care & Maintenance Guide', desc: 'How to care for your vehicle wrap — washing, storage & winter tips. Extend your wrap to 7+ years. Read the full guide →', title: 'Wrap Care & Maintenance Guide | Chicago Fleet Wraps', category: 'Resources', keywords: 'wrap care, vehicle wrap maintenance, how to wash wrapped car, wrap care tips, vinyl wrap cleaning', content: 'How to care for your vehicle wrap. Hand washing techniques, storage recommendations, winter weather tips. Extend your wrap life to 7+ years.' },

  // === Tool Pages ===
  { slug: 'visualizer', url: 'visualizer', ogImage: 'camaro_color_shift.jpg', heroImage: 'pink_chrome-2.webp', h1: 'Vehicle Wrap Color Visualizer', desc: 'Preview 120+ vinyl wrap colors on vehicle templates. Try before you buy — free interactive tool. Start visualizing →', title: 'Vehicle Wrap Color Visualizer | 120+ Colors | Chicago Fleet Wraps', category: 'Tools', keywords: 'wrap color visualizer, vinyl wrap colors, vehicle wrap preview, color change preview tool', content: 'Preview over 120 vinyl wrap colors on vehicle templates. Avery Dennison and 3M color swatches. Try before you buy. Free interactive tool.' },
  { slug: 'brandaudit', url: 'brandaudit', ogImage: 'arnold_electric_sales.jpg', heroImage: 'frontier_fleet_vans.jpg', h1: 'Fleet Brand Audit — Free Assessment', desc: 'Score your fleet branding in 2 minutes — 8 questions, instant recommendations. Free tool. Take the audit now →', title: 'Fleet Brand Audit | Free 2-Minute Assessment | Chicago Fleet Wraps', category: 'Tools', keywords: 'fleet brand audit, fleet branding score, vehicle branding assessment, fleet marketing audit', content: 'Score your fleet branding in 2 minutes. 8-question assessment covering visibility, consistency, and impact. Instant recommendations and action plan.' },
  { slug: 'calculator', url: 'calculator', ogImage: 'small_suv.webp', heroImage: 'small_transit_van.webp', h1: 'Wrap Cost Per Day Calculator', desc: 'Calculate your vehicle wrap cost per day & CPM. Compare to Google Ads, billboards & other advertising. Try the free calculator →', title: 'Wrap Cost Per Day Calculator | Free Tool | Chicago Fleet Wraps', category: 'Tools', keywords: 'wrap cost calculator, vehicle wrap price calculator, wrap CPM calculator, fleet wrap cost estimator', content: 'Calculate your vehicle wrap cost per day and cost per thousand impressions (CPM). Compare to Google Ads, billboards, and social media advertising.' },
  { slug: 'wrap-calculator', url: 'calculator', ogImage: 'small_suv.webp', heroImage: 'small_transit_van.webp', h1: 'Instant Wrap Price Calculator', desc: 'Get instant wrap pricing — 310+ vehicles. Select type, vinyl & coverage. Real installed pricing, not estimates. Try it now →', title: 'Instant Wrap Price Calculator | 310+ Vehicles | Chicago Fleet Wraps', category: 'Tools', keywords: 'instant wrap pricing, vehicle wrap price tool, how much does a wrap cost, wrap price by vehicle', content: 'Get instant vehicle wrap pricing. 310+ vehicle types. Select your vehicle, vinyl type, and coverage level. Real installed pricing — not estimates.' },
  { slug: 'beforeafter', url: 'beforeafter', ogImage: 'windy_city_after.jpg', heroImage: 'windy_city_before.jpg', h1: 'Before & After Vehicle Wraps', desc: 'See dramatic before & after wrap transformations — real projects from 9,400+ vehicles. Browse the gallery →', title: 'Before & After Vehicle Wraps | Real Projects | Chicago Fleet Wraps', category: 'Tools', keywords: 'vehicle wrap before after, wrap transformation, fleet wrap examples, wrap results', content: 'See dramatic before and after vehicle wrap transformations. Real projects from Chicago Fleet Wraps featuring commercial fleets, color changes, and custom designs.' },
  { slug: 'vinyl', url: 'vinyl', ogImage: 'pink_chrome-3.webp', heroImage: 'dune_buggy_galaxy.jpg', h1: 'Vinyl Wrap Film Guide', desc: 'Compare Avery Dennison MPI 1105, 3M IJ180-CV3 & Supreme Wrapping Film — durability, conformability & pricing. Read the guide →', title: 'Vinyl Wrap Film Guide | Compare Films | Chicago Fleet Wraps', category: 'Tools', keywords: 'vinyl wrap film guide, wrap film specs, Avery Dennison vs 3M, cast vinyl comparison', content: 'Compare vinyl wrap film specifications. Avery Dennison MPI 1105, 3M IJ180-CV3, Supreme Wrapping Film. Durability ratings, conformability, and professional recommendations.' },

  // === Blog Posts ===
  { slug: 'post-downside-wrapping', url: 'post/what-is-the-downside-of-wrapping-a-car', ogImage: 'sandals_color_change.jpg', heroImage: 'bmw_matte_black.jpg', h1: 'What Is the Downside of Wrapping a Car?', desc: 'Honest vehicle wrap trade-offs from 24+ years experience — durability, quality, surface prep & washing. Read before you wrap →', title: 'Downside of Wrapping a Car? | Honest Guide | Chicago Fleet Wraps', category: 'Blog', keywords: 'downside of wrapping a car, vehicle wrap cons, wrap disadvantages, is wrapping a car worth it', content: 'An honest look at vehicle wrap downsides from 24+ years of experience. Durability limitations, quality differences between cast and calendered vinyl, surface preparation requirements, and washing restrictions.' },
  { slug: 'post-3m-vs-avery', url: 'post/3m-vs-avery-dennison-vehicle-wraps', ogImage: 'wrap_install_closeup.jpg', heroImage: 'corvette_mid_wrap.jpg', h1: '3M vs Avery Dennison Vehicle Wraps', desc: '3M IJ180-CV3 vs Avery Dennison MPI 1105 — from a shop that installs both daily. See which wins →', title: '3M vs Avery Dennison Wraps | Head-to-Head | Chicago Fleet Wraps', category: 'Blog', keywords: '3M vs Avery Dennison, 3M IJ180 vs MPI 1105, best wrap vinyl, wrap material comparison', content: 'Head-to-head comparison of 3M IJ180-CV3 vs Avery Dennison MPI 1105 cast vinyl. Adhesive technology, conformability, durability, and pricing from a shop that installs both daily.' },
  { slug: 'post-fleet-decals', url: 'post/top-benefits-of-custom-decals', ogImage: 'diecut_sheriff_k9.webp', heroImage: '4aces_suv.jpg', h1: 'Top Benefits of Custom Decals for Fleet Vehicles', desc: 'Fleet decals deliver massive ROI — cost-effective branding, 24/7 advertising, easy updates. See why they work →', title: 'Top Benefits of Fleet Decals | ROI Guide | Chicago Fleet Wraps', category: 'Blog', keywords: 'custom fleet decals, vehicle decal benefits, fleet decal ROI, commercial decals', content: 'Why fleet decals deliver massive ROI. Cost-effective branding, 24/7 advertising exposure, easy updates and replacements. Professional fleet decal design and installation.' },
  { slug: 'post-wrap-cost', url: 'post/how-much-does-a-car-wrap-cost', ogImage: 'small_suv.webp', heroImage: 'cfw_van_2.webp', h1: 'How Much Does a Car Wrap Cost in Chicago?', desc: 'Real 2026 wrap pricing — sedans from $3,750, vans from $3,750, box trucks from $5,000. Premium cast vinyl only. See all prices →', title: 'Car Wrap Cost Chicago | 2026 Pricing | Chicago Fleet Wraps', category: 'Blog', keywords: 'car wrap cost Chicago, how much does a wrap cost, vehicle wrap pricing, wrap price by vehicle type', content: 'Real vehicle wrap pricing in Chicago. Sedans from $3,750, SUVs from $3,900, cargo vans from $3,750, sprinters from $4,700, box trucks from $5,000–$10,900. Premium cast vinyl only.' },
  { slug: 'post-3m-vinyl-2025', url: 'post/3m-vinyl-wraps-chicago-fleet', ogImage: 'cfw_van_3.webp', heroImage: 'cfw_truck_1.webp', h1: '3M Vinyl Wraps: Best Choice for Your Chicago Fleet', desc: '3M IJ180-CV3 cast vinyl — extreme durability in Chicago weather, UV resistance & paint protection. Learn why it\'s the standard →', title: '3M Vinyl Wraps Chicago | Fleet Standard | Chicago Fleet Wraps', category: 'Blog', keywords: '3M vinyl wraps Chicago, 3M IJ180-CV3, 3M fleet wraps, best vinyl for fleet, 3M cast vinyl', content: '3M IJ180-CV3 cast vinyl remains the industry standard for fleet graphics. Extreme durability in Chicago weather, UV resistance, and paint protection.' },

  // === City/Geo Pages ===
  { slug: 'geo-chicago', url: 'chicago', ogImage: 'cfw_truck_1.webp', heroImage: 'frontier_fleet_vans.jpg', h1: 'Fleet Wraps Chicago, IL', desc: 'Fleet wraps in Chicago — cargo vans, box trucks, sprinters. ★ 5.0 rated. Avery Dennison & 3M certified. Free pickup → (312) 597-1286.', title: 'Fleet Wraps Chicago, IL | ★ 5.0 Rated | Chicago Fleet Wraps', category: 'Cities', city: 'Chicago', keywords: 'fleet wraps Chicago, vehicle wraps Chicago IL, car wraps Chicago, commercial wraps Chicago, wrap shop Chicago' },
  { slug: 'geo-schaumburg', url: 'schaumburg', ogImage: 'cfw_van_2.webp', heroImage: 'cfw_truck_3.webp', h1: 'Fleet Wraps Schaumburg, IL', desc: 'Fleet wraps serving Schaumburg — free pickup & delivery. Premium cast vinyl. ★ 5.0 rated. Get your free estimate →', title: 'Fleet Wraps Schaumburg, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Schaumburg', keywords: 'fleet wraps Schaumburg, vehicle wraps Schaumburg IL, car wraps Schaumburg, commercial wraps Schaumburg' },
  { slug: 'geo-naperville', url: 'naperville', ogImage: 'cfw_van_3.webp', heroImage: 'cfw_van_1.webp', h1: 'Fleet Wraps Naperville, IL', desc: 'Fleet wraps serving Naperville — free pickup & delivery. Premium cast vinyl. ★ 5.0 rated. Get your free estimate →', title: 'Fleet Wraps Naperville, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Naperville', keywords: 'fleet wraps Naperville, vehicle wraps Naperville IL, car wraps Naperville, commercial wraps Naperville' },
  { slug: 'geo-aurora', url: 'aurora', ogImage: 'cfw_truck_2.webp', heroImage: 'precision_today_sprinter.jpg', h1: 'Fleet Wraps Aurora, IL', desc: 'Fleet wraps serving Aurora — free pickup & delivery. Premium cast vinyl. ★ 5.0 rated. Get your free estimate →', title: 'Fleet Wraps Aurora, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Aurora', keywords: 'fleet wraps Aurora, vehicle wraps Aurora IL, car wraps Aurora, commercial wraps Aurora' },
  { slug: 'geo-elgin', url: 'elgin', ogImage: 'precision_today_hvac.jpg', heroImage: 'sbc_hvac_van.jpg', h1: 'Fleet Wraps Elgin, IL', desc: 'Fleet wraps serving Elgin — free pickup & delivery. Premium cast vinyl. ★ 5.0 rated. Get your free estimate →', title: 'Fleet Wraps Elgin, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Elgin', keywords: 'fleet wraps Elgin, vehicle wraps Elgin IL, car wraps Elgin, commercial wraps Elgin' },
  { slug: 'geo-joliet', url: 'joliet', ogImage: 'exalt_air_pick_up_truck.webp', heroImage: 'arnold_electric_van.jpg', h1: 'Fleet Wraps Joliet, IL', desc: 'Fleet wraps serving Joliet — free pickup & delivery. Premium cast vinyl. ★ 5.0 rated. Get your free estimate →', title: 'Fleet Wraps Joliet, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Joliet', keywords: 'fleet wraps Joliet, vehicle wraps Joliet IL, car wraps Joliet, commercial wraps Joliet' },
  { slug: 'geo-evanston', url: 'evanston', ogImage: 'small_transit_van_opt.webp', heroImage: 'cfw_van_2.webp', h1: 'Fleet Wraps Evanston, IL', desc: 'Fleet wraps serving Evanston — free pickup & delivery. Premium cast vinyl. ★ 5.0 rated. Get your free estimate →', title: 'Fleet Wraps Evanston, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Evanston', keywords: 'fleet wraps Evanston, vehicle wraps Evanston IL, car wraps Evanston, commercial wraps Evanston' },
  { slug: 'geo-skokie', url: 'skokie', ogImage: 'sns_roofing_truck.webp', heroImage: 'cfw_truck_1.webp', h1: 'Fleet Wraps Skokie, IL', desc: 'Fleet wraps serving Skokie — free pickup & delivery. Premium cast vinyl. ★ 5.0 rated. Get your free estimate →', title: 'Fleet Wraps Skokie, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Skokie', keywords: 'fleet wraps Skokie, vehicle wraps Skokie IL, car wraps Skokie, commercial wraps Skokie' },
  { slug: 'geo-oak-park', url: 'oak-park', ogImage: 'arnold_electric_truck.jpg', heroImage: 'precision_today_hvac.jpg', h1: 'Fleet Wraps Oak Park, IL', desc: 'Fleet wraps serving Oak Park — free pickup & delivery. Premium cast vinyl. ★ 5.0 rated. Get your free estimate →', title: 'Fleet Wraps Oak Park, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Oak Park', keywords: 'fleet wraps Oak Park, vehicle wraps Oak Park IL, car wraps Oak Park, commercial wraps Oak Park' },
  { slug: 'geo-wilmette', url: 'wilmette', ogImage: 'windy_city_box_truck.webp', heroImage: 'blondies_beef_truck.jpg', h1: 'Fleet Wraps Wilmette, IL', desc: 'Fleet wraps serving Wilmette — free pickup & delivery. Premium cast vinyl. ★ 5.0 rated. Get your free estimate →', title: 'Fleet Wraps Wilmette, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Wilmette', keywords: 'fleet wraps Wilmette, vehicle wraps Wilmette IL, car wraps Wilmette, commercial wraps Wilmette' },
  // Extended city pages
  { slug: 'geo-arlington-heights', url: 'arlington-heights', ogImage: 'cfw_van_1.webp', heroImage: 'cfw_truck_2.webp', h1: 'Fleet Wraps Arlington Heights, IL', desc: 'Fleet wraps serving Arlington Heights — free pickup & delivery. Premium cast vinyl. ★ 5.0 rated. Get your free estimate →', title: 'Fleet Wraps Arlington Heights, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Arlington Heights', keywords: 'fleet wraps Arlington Heights, vehicle wraps Arlington Heights IL, car wraps Arlington Heights' },
  { slug: 'geo-des-plaines', url: 'des-plaines', ogImage: 'frontier_fleet_vans.jpg', heroImage: 'cfw_van_3.webp', h1: 'Fleet Wraps Des Plaines, IL', desc: 'Fleet wraps serving Des Plaines — free pickup & delivery. Premium cast vinyl. ★ 5.0 rated. Get your free estimate →', title: 'Fleet Wraps Des Plaines, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Des Plaines', keywords: 'fleet wraps Des Plaines, vehicle wraps Des Plaines IL, car wraps Des Plaines' },
  { slug: 'geo-palatine', url: 'palatine', ogImage: 'precision_today_sprinter.jpg', heroImage: 'small_transit_van_opt.webp', h1: 'Fleet Wraps Palatine, IL', desc: 'Fleet wraps serving Palatine — free pickup & delivery. Premium cast vinyl. ★ 5.0 rated. Get your free estimate →', title: 'Fleet Wraps Palatine, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Palatine', keywords: 'fleet wraps Palatine, vehicle wraps Palatine IL, car wraps Palatine' },
  { slug: 'geo-wheaton', url: 'wheaton', ogImage: 'cfw_truck_3.webp', heroImage: 'exalt_air_pick_up_truck.webp', h1: 'Fleet Wraps Wheaton, IL', desc: 'Fleet wraps serving Wheaton — free pickup & delivery. Premium cast vinyl. ★ 5.0 rated. Get your free estimate →', title: 'Fleet Wraps Wheaton, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Wheaton', keywords: 'fleet wraps Wheaton, vehicle wraps Wheaton IL, car wraps Wheaton' },
  { slug: 'geo-downers-grove', url: 'downers-grove', ogImage: 'hunt_brothers_pizza_truck.jpg', heroImage: 'sns_roofing_truck.webp', h1: 'Fleet Wraps Downers Grove, IL', desc: 'Fleet wraps serving Downers Grove — free pickup & delivery. Premium cast vinyl. ★ 5.0 rated. Get your free estimate →', title: 'Fleet Wraps Downers Grove, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Downers Grove', keywords: 'fleet wraps Downers Grove, vehicle wraps Downers Grove IL, car wraps Downers Grove' },
  { slug: 'geo-lombard', url: 'lombard', ogImage: 'arnold_electric_van.jpg', heroImage: 'windy_city_box_truck.webp', h1: 'Fleet Wraps Lombard, IL', desc: 'Fleet wraps serving Lombard — free pickup & delivery. Premium cast vinyl. ★ 5.0 rated. Get your free estimate →', title: 'Fleet Wraps Lombard, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Lombard', keywords: 'fleet wraps Lombard, vehicle wraps Lombard IL, car wraps Lombard' },
  { slug: 'geo-elmhurst', url: 'elmhurst', ogImage: 'sbc_hvac_van.jpg', heroImage: 'arnold_electric_sales.jpg', h1: 'Fleet Wraps Elmhurst, IL', desc: 'Fleet wraps serving Elmhurst — free pickup & delivery. Premium cast vinyl. ★ 5.0 rated. Get your free estimate →', title: 'Fleet Wraps Elmhurst, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Elmhurst', keywords: 'fleet wraps Elmhurst, vehicle wraps Elmhurst IL, car wraps Elmhurst' },
  { slug: 'geo-tinley-park', url: 'tinley-park', ogImage: 'blondies_beef_truck.jpg', heroImage: 'stark_cement_mixer.jpg', h1: 'Fleet Wraps Tinley Park, IL', desc: 'Fleet wraps serving Tinley Park — free pickup & delivery. Premium cast vinyl. ★ 5.0 rated. Get your free estimate →', title: 'Fleet Wraps Tinley Park, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Tinley Park', keywords: 'fleet wraps Tinley Park, vehicle wraps Tinley Park IL, car wraps Tinley Park' },
  { slug: 'geo-orland-park', url: 'orland-park', ogImage: 'stark_cement_mixer.jpg', heroImage: 'cfw_truck_1.webp', h1: 'Fleet Wraps Orland Park, IL', desc: 'Fleet wraps serving Orland Park — free pickup & delivery. Premium cast vinyl. ★ 5.0 rated. Get your free estimate →', title: 'Fleet Wraps Orland Park, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Orland Park', keywords: 'fleet wraps Orland Park, vehicle wraps Orland Park IL, car wraps Orland Park' },
  { slug: 'geo-bolingbrook', url: 'bolingbrook', ogImage: '4aces_suv.jpg', heroImage: 'small_suv.webp', h1: 'Fleet Wraps Bolingbrook, IL', desc: 'Fleet wraps serving Bolingbrook — free pickup & delivery. Premium cast vinyl. ★ 5.0 rated. Get your free estimate →', title: 'Fleet Wraps Bolingbrook, IL | Free Pickup | Chicago Fleet Wraps', category: 'Cities', city: 'Bolingbrook', keywords: 'fleet wraps Bolingbrook, vehicle wraps Bolingbrook IL, car wraps Bolingbrook' },
];

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ============================================================
// CITY DATA — genuinely unique content for each location page
// ============================================================
const CITY_DATA = {
  'Chicago': {
    county: 'Cook',
    pop: '2.7 million',
    coords: '41.8781, -87.6298',
    driveTime: '0 min — we\'re local',
    routeFromShop: 'Our shop is right here at 4711 N. Lamon Ave on the Northwest Side.',
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
    routeFromShop: 'Straight shot west on I-90 from our shop at 4711 N. Lamon Ave — 22 miles, about 35 minutes outside rush hour.',
    landmarks: ['Woodfield Mall', 'Legoland Discovery Center', 'Medieval Times', 'Schaumburg Boomers Stadium'],
    businessDistricts: ['Woodfield Corporate Center', 'East Golf Road corridor', 'Meacham Road industrial area'],
    localContext: 'Schaumburg is one of the largest commercial centers in the Midwest outside downtown Chicago. The Woodfield corridor alone has thousands of businesses that rely on service vehicles — HVAC techs, plumbing companies, IT service providers, and delivery fleets. A wrapped van driving Meacham Road or Golf Road during business hours reaches decision-makers at corporate parks all day long.',
    industries: ['IT and managed services providers', 'corporate facility maintenance', 'medical equipment delivery', 'restaurant supply companies', 'commercial cleaning services'],
    parkingTip: 'We pick up directly from your Schaumburg office or lot — no need to drive to our shop. Free round-trip included.',
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
    localContext: 'Naperville consistently ranks among the best places to live and do business in Illinois. Its affluent residential neighborhoods mean homeowners regularly hire HVAC, plumbing, electrical, and landscaping contractors — exactly the businesses that benefit most from wrapped vehicles. A branded van parked in a Naperville driveway is the best referral tool money can buy.',
    industries: ['home service contractors (HVAC, plumbing, electrical)', 'landscaping and lawn care companies', 'real estate brokerages', 'medical and dental practices', 'catering and event companies'],
    parkingTip: 'We provide free pickup and return delivery to any Naperville address — your business, your home, wherever the vehicle is.',
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
    localContext: 'Aurora is Illinois\' second-largest city and a major employment center straddling Kane and DuPage counties. The city\'s mix of industrial parks along Farnsworth Avenue, retail corridors on Route 59, and residential neighborhoods creates dense, diverse audiences for wrapped vehicles. HVAC and plumbing contractors based in Aurora cover a massive service radius — their wrapped vans are seen across four counties daily.',
    industries: ['manufacturing and warehouse logistics', 'HVAC and plumbing service companies', 'auto dealership service fleets', 'pest control companies', 'residential cleaning and maid services'],
    parkingTip: 'Free pickup from anywhere in Aurora — we come to you, wrap the vehicle at our shop, and deliver it back.',
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
    localContext: 'Elgin sits at the crossroads of Kane and Cook counties, making it a strategic hub for service companies covering the northwest suburbs. The Randall Road corridor is one of the busiest commercial strips in the Fox Valley — a wrapped vehicle here gets consistent exposure to both consumer and commercial audiences. Elgin\'s growing industrial base along McLean Boulevard also means more B2B fleet branding opportunities.',
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
    localContext: 'Joliet is the gateway to Will County — one of the fastest-growing counties in Illinois. The I-80 logistics corridor and CenterPoint Intermodal make it a national hub for trucking and distribution. Fleet wraps here aren\'t just local advertising — they travel interstate. Joliet\'s booming residential development also fuels demand for home service contractors who need branded vehicles.',
    industries: ['trucking and logistics companies', 'warehouse and distribution centers', 'residential construction contractors', 'plumbing and drain service companies', 'moving and relocation companies'],
    parkingTip: 'We provide free pickup throughout Joliet and Will County — including from warehouse lots and industrial parks.',
    nearbyClients: 'We\'ve wrapped delivery fleets for logistics companies near CenterPoint and service vans for plumbing contractors operating across Will County.',
  },
  'Evanston': {
    county: 'Cook',
    pop: '79,000',
    coords: '42.0451, -87.6877',
    driveTime: '25 min',
    routeFromShop: 'North on Cicero Ave to Touhy, east to Evanston. Just 12 miles from our shop — about 25 minutes.',
    landmarks: ['Northwestern University', 'Grosse Point Lighthouse', 'Davis Street shopping district', 'Evanston Art Center'],
    businessDistricts: ['Davis Street downtown', 'Central Street corridor', 'Dempster Street commercial strip', 'Main Street business district'],
    localContext: 'Evanston is one of the most densely populated and affluent suburbs on the North Shore. With Northwestern University\'s campus driving foot traffic and a vibrant downtown, wrapped service vehicles here get premium exposure. The mix of older homes requiring constant maintenance creates a steady market for HVAC, plumbing, electrical, and renovation contractors — all prime candidates for fleet wraps.',
    industries: ['university service contractors', 'residential renovation and remodeling', 'property management companies', 'restaurant and catering businesses', 'medical and dental practices'],
    parkingTip: 'Free pickup from anywhere in Evanston. We\'re only 25 minutes away — one of our closest service areas.',
    nearbyClients: 'We\'ve wrapped contractor vans for renovation companies working on Evanston\'s historic homes and delivery vehicles for restaurants on Davis Street.',
  },
  'Skokie': {
    county: 'Cook',
    pop: '67,000',
    coords: '42.0324, -87.7416',
    driveTime: '15 min',
    routeFromShop: 'East on Touhy Ave — just 7 miles from our shop. One of our closest service areas at about 15 minutes.',
    landmarks: ['Illinois Holocaust Museum', 'Westfield Old Orchard mall', 'North Shore Center for the Performing Arts', 'Skokie Lagoons'],
    businessDistricts: ['Old Orchard Road retail area', 'Dempster Street corridor', 'Skokie Boulevard business district', 'McCormick Boulevard industrial area'],
    localContext: 'Skokie is practically our next-door neighbor — just 15 minutes from our shop. This dense suburban hub is home to hundreds of small service businesses that serve both Skokie residents and the broader North Shore. The Dempster-Skokie corridor is a non-stop stream of commercial traffic, and a wrapped van here is seen by the exact homeowners who hire contractors. We\'ve wrapped more vehicles for Skokie businesses than almost any other suburb.',
    industries: ['HVAC and heating companies', 'electrical contractors', 'commercial cleaning services', 'auto body and detailing shops', 'home health care companies'],
    parkingTip: 'We\'re 15 minutes away. Free pickup or drive in — either way, the fastest turnaround of any suburb we serve.',
    nearbyClients: 'We regularly wrap service vans for HVAC companies on Dempster Street and electrician trucks for contractors based in Skokie\'s light industrial district.',
  },
  'Oak Park': {
    county: 'Cook',
    pop: '52,000',
    coords: '41.8850, -87.7845',
    driveTime: '15 min',
    routeFromShop: 'South on Cicero Ave or Harlem Ave — just 6 miles from our shop. About 15 minutes.',
    landmarks: ['Frank Lloyd Wright Home and Studio', 'Ernest Hemingway Birthplace', 'Unity Temple', 'Lake Street shopping district'],
    businessDistricts: ['Lake Street corridor', 'Madison Street commercial strip', 'Roosevelt Road business district', 'North Avenue mixed-use area'],
    localContext: 'Oak Park is a historic village known for its Frank Lloyd Wright architecture and strict building preservation standards — which means constant renovation and maintenance work. Contractors, painters, HVAC techs, and plumbers working on Oak Park\'s iconic homes benefit enormously from professional vehicle wraps. A clean, branded van parked outside a Prairie-style home signals quality and professionalism to neighbors watching from across the street.',
    industries: ['historic home renovation contractors', 'painting and decorating companies', 'HVAC and plumbing specialists', 'tree care and landscaping services', 'home inspection companies'],
    parkingTip: 'We\'re just 15 minutes from Oak Park. Free pickup from your home or business.',
    nearbyClients: 'We\'ve wrapped contractor vans for renovation specialists who work exclusively on Oak Park\'s historic home stock and HVAC companies serving the near-west suburbs.',
  },
  'Wilmette': {
    county: 'Cook',
    pop: '28,000',
    coords: '42.0722, -87.7253',
    driveTime: '20 min',
    routeFromShop: 'North on Cicero to Touhy, east to Green Bay Road. About 10 miles from our shop — 20 minutes.',
    landmarks: ['Bahá\'í House of Worship', 'Gillson Park and Beach', 'Plaza del Lago shopping center', 'Wilmette Harbor'],
    businessDistricts: ['Green Bay Road village center', 'Skokie Highway commercial strip', 'Lake Avenue mixed-use district'],
    localContext: 'Wilmette is one of the most affluent communities on the North Shore, with large homes and high standards for service providers. Homeowners here expect polished, professional contractors — a branded wrap instantly communicates credibility. Landscapers, electricians, painters, and HVAC companies working in Wilmette often report that their wrap generates referral conversations with neighbors who see the van in driveways.',
    industries: ['premium landscaping and estate maintenance', 'high-end home renovation', 'HVAC and mechanical contractors', 'painting and exterior restoration', 'custom cabinetry and millwork installers'],
    parkingTip: 'Free pickup from any Wilmette address. We\'re less than 20 minutes from the North Shore.',
    nearbyClients: 'We\'ve wrapped vehicles for landscaping companies maintaining Wilmette estates and HVAC contractors serving the North Shore.',
  },
  'Arlington Heights': {
    county: 'Cook',
    pop: '77,000',
    coords: '42.0884, -87.9806',
    driveTime: '25 min',
    routeFromShop: 'I-90 west to Arlington Heights Road exit. About 18 miles from our shop — 25 minutes.',
    landmarks: ['Arlington Park (former racetrack redevelopment)', 'Metropolis Performing Arts Centre', 'Long Grove historic downtown', 'Arlington Heights Memorial Library'],
    businessDistricts: ['Arlington Heights Road corridor', 'Rand Road commercial strip', 'Golf Road business area', 'Algonquin Road industrial parks'],
    localContext: 'Arlington Heights is the commercial engine of the northwest suburbs. The intersection of I-90, Route 53, and Route 14 creates a natural hub for service businesses covering a huge territory from Palatine to Buffalo Grove to Mount Prospect. A wrapped van driving the Arlington Heights Road corridor during peak hours reaches thousands of commuters and business owners. The village\'s massive redevelopment of the former Arlington Park site is also bringing new commercial tenants who\'ll need fleet branding.',
    industries: ['mechanical and HVAC contractors', 'commercial roofing companies', 'office technology and copier service', 'pest control and lawn care', 'medical courier and transport services'],
    parkingTip: 'Free pickup from your Arlington Heights location — business, residential, or fleet yard.',
    nearbyClients: 'We\'ve wrapped HVAC fleets based on Algonquin Road and commercial service vehicles for companies operating out of the Golf Road business corridor.',
  },
  'Des Plaines': {
    county: 'Cook',
    pop: '60,000',
    coords: '42.0334, -87.8834',
    driveTime: '15 min',
    routeFromShop: 'North on Harlem Ave to Touhy, west on Touhy to Des Plaines. Just 8 miles from our shop — about 15 minutes.',
    landmarks: ['Rivers Casino Des Plaines', 'Lake Opeka', 'Des Plaines Theatre', 'Mystic Waters Family Aquatic Center'],
    businessDistricts: ['Mannheim Road corridor', 'Oakton Street business district', 'Ellinwood Street downtown', 'River Road industrial zone'],
    localContext: 'Des Plaines sits right next to O\'Hare Airport, making it a strategic location for logistics, transportation, and service companies that need airport-area visibility. The Mannheim Road corridor is one of the busiest commercial strips in the northwest suburbs, and a wrapped vehicle here gets exposure to an incredible volume of traffic. The city\'s proximity to our shop also means the fastest turnaround times — your vehicle can be picked up and returned the same week.',
    industries: ['airport shuttle and transportation services', 'logistics and warehousing companies', 'restaurant and food delivery services', 'commercial cleaning and janitorial', 'automotive repair and towing services'],
    parkingTip: 'We\'re just 15 minutes from Des Plaines — one of our fastest pickup-and-return areas.',
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
    localContext: 'Palatine is the geographic center of the northwest suburban service market. Contractors based here cover territory from Barrington to Hoffman Estates to Inverness — affluent communities with high demand for home services. The Northwest Highway and Rand Road corridors carry heavy daily traffic, giving wrapped vehicles consistent exposure. Palatine\'s mix of residential subdivisions and commercial parks means your branded van is seen by both homeowners and business decision-makers.',
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
    localContext: 'Wheaton is the DuPage County seat and the administrative center for one of the wealthiest counties in Illinois. County government offices, courthouses, and legal services create a professional environment where polished branding matters. The surrounding residential neighborhoods — from older homes near downtown to newer developments near Danada — keep home service contractors busy year-round. A branded vehicle is the single best marketing investment for any Wheaton-area contractor.',
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
    localContext: 'Downers Grove sits at the crossroads of I-88 and I-355, giving local businesses access to the entire DuPage County market. The Butterfield Road corridor alone has dozens of corporate campuses and office parks — a wrapped van servicing these buildings is seen by thousands of professionals daily. The village\'s walkable downtown and established neighborhoods also create steady demand for residential service contractors.',
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
    localContext: 'Lombard — the "Lilac Village" — is a central DuPage County hub with excellent highway access via I-355, I-88, and I-290. The Roosevelt Road corridor is one of the most heavily trafficked commercial strips in the western suburbs, providing maximum exposure for wrapped vehicles. Lombard\'s position between Elmhurst, Glen Ellyn, and Downers Grove means service contractors based here cover a huge territory, making fleet branding especially valuable for brand recognition across multiple communities.',
    industries: ['general contracting and home improvement', 'electrical and lighting companies', 'HVAC service and installation', 'auto glass and body shops', 'commercial printing and signage (complementary service)'],
    parkingTip: 'Free pickup from Lombard. We\'re 30 minutes away and service the area regularly.',
    nearbyClients: 'We\'ve wrapped contractor trucks for general contractors on Roosevelt Road and service vans for HVAC companies covering the Lombard-to-Glen Ellyn area.',
  },
  'Elmhurst': {
    county: 'DuPage',
    pop: '47,000',
    coords: '41.8995, -87.9403',
    driveTime: '20 min',
    routeFromShop: 'South on Harlem to North Avenue, west to Elmhurst. Or I-290 to Route 83. About 14 miles — 20 minutes.',
    landmarks: ['Elmhurst Art Museum', 'Lizzadro Museum of Lapidary Art', 'Wilder Park', 'York Theatre', 'Elmhurst College campus'],
    businessDistricts: ['York Road corridor', 'Route 83 commercial strip', 'North Avenue business district', 'Spring Road downtown area'],
    localContext: 'Elmhurst is a high-income community where homeowners invest heavily in property maintenance and improvement. The village\'s tree-lined streets and well-maintained homes create a strong market for HVAC, plumbing, landscaping, and renovation contractors. York Road and Route 83 carry heavy north-south traffic between I-290 and the Butterfield corridor — a wrapped van on these routes reaches a consistently affluent audience.',
    industries: ['residential renovation and remodeling', 'tree care and arborist services', 'HVAC and geothermal installers', 'kitchen and bath remodeling', 'painting and wallpaper contractors'],
    parkingTip: 'Free pickup from Elmhurst. We\'re just 20 minutes away — one of our closest DuPage County service areas.',
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
    localContext: 'Tinley Park straddles Cook and Will counties, giving businesses based here access to the entire south suburban market. The 159th Street and Harlem Avenue corridors are major commercial arteries with heavy daily traffic. The village\'s rapid residential growth — especially in the newer developments west of Harlem — means constant demand for home service contractors. A wrapped fleet vehicle here builds brand recognition across Orland Park, Mokena, Frankfort, and New Lenox simultaneously.',
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
    localContext: 'Orland Park is the retail and commercial capital of the south suburbs, anchored by Orland Square Mall and the LaGrange Road corridor. This is where south suburban homeowners shop, dine, and hire contractors. A wrapped service vehicle parked in an Orland Park driveway is seen by neighbors who are the exact demographic for home services. The 159th Street and LaGrange Road intersection is one of the highest-traffic intersections in the south suburbs — prime wrap exposure.',
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
    localContext: 'Bolingbrook is a fast-growing suburb straddling Will and DuPage counties with excellent highway access via I-55 and I-355. The Remington Boulevard industrial corridor is home to warehouses, distribution centers, and service companies that rely on fleet vehicles daily. Bolingbrook\'s diverse residential communities — from starter homes to executive estates — keep home service contractors busy across every price point. The I-55 corridor exposure means your wrapped vehicle is also seen by tens of thousands of commuters.',
    industries: ['warehouse and distribution companies', 'residential and commercial electrical', 'HVAC and mechanical service', 'pest control and extermination', 'courier and same-day delivery services'],
    parkingTip: 'Free pickup from Bolingbrook — we regularly service the I-355 corridor.',
    nearbyClients: 'We\'ve wrapped delivery fleets for distribution companies in the Remington Boulevard corridor and service vans for contractors covering Bolingbrook and Romeoville.',
  },
  'Berwyn': {
    county: 'Cook',
    pop: '55,000',
    coords: '41.8506, -87.7936',
    driveTime: '12 min',
    routeFromShop: 'South on Harlem Avenue — just 5 miles from our shop. One of our closest service areas.',
    landmarks: ['Cermak Plaza (Spindle sculpture site)', 'Proksa Park', 'Berwyn\'s historic bungalow district', '16 Inch Softball Hall of Fame Museum'],
    businessDistricts: ['Cermak Road (Route 66) corridor', 'Ogden Avenue commercial strip', 'Roosevelt Road business district', 'Harlem Avenue retail area'],
    localContext: 'Berwyn is practically our backyard — just 12 minutes from our shop on Harlem Avenue. This dense, working-class community is famous for its bungalow belt: thousands of closely-packed homes that need constant maintenance. Plumbers, electricians, HVAC techs, and general contractors working Berwyn\'s neighborhoods are highly visible — your wrapped van is parked 15 feet from the sidewalk where every neighbor walks by. Cermak Road (the historic Route 66) is also a major commercial artery with excellent drive-by exposure.',
    industries: ['residential plumbing and sewer', 'electrical contractors', 'roofing and gutter companies', 'painting and drywall services', 'appliance repair and installation'],
    parkingTip: 'We\'re 12 minutes away — the fastest turnaround of almost any location we serve. Free pickup included.',
    nearbyClients: 'We\'ve wrapped contractor vans for plumbing companies on Cermak Road and service trucks for electrical contractors serving the Berwyn-Cicero area.',
  },
};

// Generate 1,100+ words of genuinely unique city content
function generateCityContent(city) {
  const data = CITY_DATA[city];
  if (!data) {
    // Fallback for cities without detailed data
    return `<p class="lead speakable">Chicago Fleet Wraps provides professional fleet vehicle wrap services to businesses in ${city}, IL. Cargo vans, box trucks, sprinter vans, and pickup trucks — wrapped with Avery Dennison MPI 1105 and 3M IJ180-CV3 premium cast vinyl. Free pickup and delivery. 2-year workmanship warranty.</p>`;
  }

  return `
<p class="lead speakable">Chicago Fleet Wraps provides professional fleet vehicle wrap services to businesses throughout ${city}, IL (${data.county} County, pop. ${data.pop}). From cargo vans and box trucks to sprinter vans and pickup trucks, we wrap commercial vehicles with Avery Dennison MPI 1105 and 3M IJ180-CV3 premium cast vinyl — the same materials trusted by national fleets. Free pickup and delivery from ${city} included with every project.</p>

<h2>Getting Your Vehicle to Us from ${city}</h2>
<p>${data.routeFromShop} ${data.parkingTip} Most ${city} fleet wrap projects are completed in 3–7 business days from design approval to delivery back to your location.</p>

<h2>Why ${city} Businesses Wrap Their Fleets</h2>
<p>${data.localContext}</p>
<p>A single wrapped cargo van generates <strong>30,000–70,000 impressions per day</strong> driving through ${city}'s commercial corridors and residential neighborhoods. At a cost-per-thousand-impressions (CPM) of just <strong>$0.04–$0.48</strong>, fleet wraps deliver the highest ROI of any advertising medium — and they work 24/7, including when your vehicle is parked at a job site or in a customer's driveway.</p>

<h2>${city} Business Districts & High-Traffic Routes</h2>
<p>Your wrapped vehicle gets maximum exposure on ${city}'s busiest corridors:</p>
<ul>
${data.businessDistricts.map(d => `<li><strong>${d}</strong></li>`).join('\n')}
</ul>
<p>Whether you're driving through the ${data.businessDistricts[0]} during rush hour or parked at a residential job site near ${data.landmarks[0]}, your wrap is working — building brand recognition with every person who sees it.</p>

<h2>Top Industries We Serve in ${city}</h2>
<p>We've wrapped vehicles for dozens of ${city}-area businesses across these industries:</p>
<ul>
${data.industries.map(i => `<li>${i.charAt(0).toUpperCase() + i.slice(1)}</li>`).join('\n')}
</ul>
<p>${data.nearbyClients}</p>

<h2>What's Included in Every ${city} Fleet Wrap</h2>
<ul>
<li><strong>Free pickup and delivery</strong> from any ${city} address — business, residential, or fleet yard</li>
<li><strong>Custom design</strong> on exact vehicle templates (not generic mockups) with unlimited revisions</li>
<li><strong>Premium cast vinyl only</strong> — Avery Dennison MPI 1105 or 3M IJ180-CV3 with UV overlaminate</li>
<li><strong>Professional installation</strong> in our climate-controlled facility</li>
<li><strong>2-year workmanship warranty</strong> plus 5–7 year manufacturer vinyl warranty</li>
<li><strong>Fleet discounts</strong>: 3% for 2–4 vehicles, 7% for 5–9, 11% for 10–24, 15% for 25+</li>
</ul>

<h2>Fleet Wrap Pricing for ${city} Businesses</h2>
<p>All pricing includes design, premium materials, installation, and free pickup/delivery from ${city}:</p>
<ul>
<li><strong>Cargo van full wrap</strong>: from $3,750</li>
<li><strong>Sprinter van full wrap</strong>: from $4,700</li>
<li><strong>Box truck wrap (16–26 ft)</strong>: $5,000–$10,900</li>
<li><strong>Pickup truck wrap</strong>: from $3,200</li>
<li><strong>Partial wrap / spot graphics</strong>: from $1,500</li>
</ul>
<p>Every ${city} estimate includes real pricing — not a range. We respond within 2 business hours. <a href="/estimate/" style="color:var(--gold)">Request your free estimate →</a></p>

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
    { q: 'How much does a commercial fleet wrap cost in Chicago?', a: 'Cargo van full wraps start at $3,750. Sprinter vans from $4,700. Box trucks from $5,000–$10,900. Fleet discounts: 3% for 2–4 vehicles, 7% for 5–9, 11% for 10–24, 15% for 25+.' },
    { q: 'How long do commercial fleet wraps last?', a: 'Avery Dennison MPI 1105 and 3M IJ180-CV3 cast vinyl wraps are rated 5–7 years outdoor. With proper care, fleet wraps in Chicago regularly last 6–7 years.' },
    { q: 'Do you offer free pickup for fleet vehicles?', a: 'Yes. Free pickup and delivery throughout Chicagoland — Cook, DuPage, Kane, Lake, Will, and McHenry counties. No mileage charges.' },
    { q: 'How long does fleet wrap installation take?', a: 'Cargo vans: 1–2 days. Sprinter vans: 2–3 days. Box trucks: 2–4 days. Fleet orders are phased to minimize vehicle downtime.' },
  ],
  'boxtruck': [
    { q: 'How much does a box truck wrap cost in Chicago?', a: '16–18 ft box trucks: $4,200–$6,000. 24–26 ft box trucks: $7,000–$10,900. Includes design, premium cast vinyl, UV overlaminate, and installation.' },
    { q: 'How long does a box truck wrap take to install?', a: 'A full box truck wrap takes 2–4 business days depending on size. Design approval typically takes 2–5 days before production.' },
    { q: 'What vinyl is best for box trucks?', a: 'Avery Dennison MPI 1105 or 3M IJ180-CV3 cast vinyl only. No calendered film — the large flat panels on box trucks are where cheap vinyl fails fastest.' },
    { q: 'Can you wrap a leased box truck?', a: 'Yes. Cast vinyl wraps are fully removable without paint damage. Leased fleet vehicles are one of the most common use cases.' },
  ],
  'sprinter': [
    { q: 'How much does a Sprinter van wrap cost?', a: 'Sprinter van full wraps start at $4,700. High-roof models may cost slightly more due to additional surface area. Fleet discounts available for 3+ vehicles.' },
    { q: 'Do you wrap high-roof Sprinter vans?', a: 'Yes. We wrap both standard and high-roof Mercedes Sprinter vans. Our templates are precise to each model year and roof height.' },
    { q: 'How many impressions does a wrapped Sprinter generate?', a: 'A wrapped Sprinter van generates 30,000–70,000 daily impressions in Chicago metro traffic at a CPM of $0.04–$0.48.' },
    { q: 'What is the turnaround time for Sprinter wraps?', a: 'Design: 2–5 days. Installation: 2–3 days. Free pickup and delivery included throughout Chicagoland.' },
  ],
  'transit': [
    { q: 'Do you wrap all Ford Transit models?', a: 'Yes — Ford Transit Connect, standard Transit, and high-roof Transit. Full and partial wrap options for each model.' },
    { q: 'How much does a Transit van wrap cost?', a: 'Transit Connect wraps start around $2,800. Full-size Transit van wraps from $3,750. Fleet pricing available.' },
    { q: 'How long does a Transit van wrap last?', a: 'Using Avery Dennison or 3M cast vinyl, Transit van wraps are rated 5–7 years outdoor with proper care.' },
  ],
  'colorchange': [
    { q: 'How much does a color change wrap cost in Chicago?', a: 'Color change wraps start at $3,500 for sedans and $4,500+ for SUVs/trucks. Pricing depends on vehicle size and film selection.' },
    { q: 'How many colors are available?', a: 'Over 120 colors including gloss, matte, satin, metallic, chrome, and color-shift finishes from Avery Dennison and 3M.' },
    { q: 'Does a color change wrap damage paint?', a: 'No. Cast vinyl wraps actually protect factory paint from UV and road debris. They remove cleanly when you want a change.' },
    { q: 'How long does a color change wrap last?', a: 'Avery Dennison Supreme Wrapping Film and 3M 2080 series are rated 5–7 years outdoor. Indoor/garaged vehicles last even longer.' },
  ],
  'wallwraps': [
    { q: 'How long do wall wraps last?', a: 'Indoor wall wraps last 5–7 years. Outdoor-exposed applications have a shorter lifespan of 3–5 years depending on sun exposure.' },
    { q: 'Can you install wall wraps on brick or concrete?', a: 'Yes. We use specialized primers and adhesion promoters for porous surfaces. A site visit confirms compatibility before production.' },
    { q: 'How is wall wrap pricing calculated?', a: 'Pricing is by square footage, surface complexity, and accessibility. Simple drywall at ground level is the base rate.' },
  ],
  'removal': [
    { q: 'Will wrap removal damage my paint?', a: 'Not if the paint is in good condition. Factory paint releases cleanly. The team photographs all vehicles before removal begins.' },
    { q: 'How long does wrap removal take?', a: 'Full cargo van: 3–5 hours. Box trucks: 6–8 hours. Fleet programs: 1 vehicle per day including adhesive cleanup.' },
    { q: 'How much does wrap removal cost?', a: 'Removal pricing depends on vehicle size, vinyl age, and adhesive condition. Older wraps cost more due to harder adhesive. Contact us for a quote.' },
  ],
  'ev': [
    { q: 'Can you wrap a Tesla without voiding the warranty?', a: 'Yes. A professional vinyl wrap does not void the Tesla warranty. We have wrapped hundreds of Teslas with zero warranty issues.' },
    { q: 'How many Rivians have you wrapped?', a: 'Over 600 Rivian R1T and R1S vehicles wrapped — more than any other shop in Illinois. Color change and commercial wraps.' },
    { q: 'Do EV wraps require special materials?', a: 'We use the same premium Avery Dennison and 3M cast vinyl. The key difference is installation technique around EV-specific panels, sensors, and charge ports.' },
    { q: 'How much does an EV wrap cost?', a: 'Tesla Model 3/Y from $3,500. Rivian R1T/R1S from $4,500. Pricing depends on coverage and film selection.' },
  ],
  'hvac': [
    { q: 'How much does an HVAC van wrap cost?', a: 'HVAC cargo van wraps start at $3,750. Fleet discounts available for 3+ vehicles. Includes design, print, install, and free pickup.' },
    { q: 'How many impressions does a wrapped HVAC van generate?', a: '30,000–70,000 daily impressions in Chicago metro area. At a CPM of $0.04–$0.48, it is the most cost-effective advertising for HVAC companies.' },
    { q: 'Are vehicle wraps tax deductible for HVAC companies?', a: 'Yes. Commercial vehicle wraps are 100% tax deductible under IRS Section 179 as a business advertising expense.' },
    { q: 'Do you offer fleet discounts for HVAC companies?', a: 'Yes. 3% off for 2–4 vehicles, 7% for 5–9, 11% for 10–24, 15% for 25+. Many HVAC fleets qualify for significant savings.' },
  ],
  'plumber': [
    { q: 'How much does a plumbing van wrap cost?', a: 'Plumbing van wraps start at $3,750. Includes custom design on exact vehicle templates, premium cast vinyl, and free pickup.' },
    { q: 'How long does a plumber van wrap last?', a: '5–7 years with Avery Dennison or 3M cast vinyl. Proper care extends life even further.' },
    { q: 'Do wrapped vans generate leads for plumbers?', a: 'Yes. A wrapped service van generates 30,000+ daily impressions. Plumbing companies report 15–30% more inbound calls after wrapping their fleet.' },
  ],
  'electric': [
    { q: 'How much does an electrician van wrap cost?', a: 'Electrician van wraps start at $3,750 for cargo vans. Box trucks from $5,000. Fleet discounts available for multiple vehicles.' },
    { q: 'What should an electrician van wrap include?', a: 'Company name, logo, phone number, license number, services list, and website. High-visibility design optimized for both parked and moving views.' },
    { q: 'Do you design electrician fleet wraps?', a: 'Yes. In-house design team creates custom layouts on exact vehicle templates. Unlimited revisions until approved.' },
  ],
  'contractor': [
    { q: 'How much does a contractor truck wrap cost?', a: 'Pickup truck wraps from $3,200. Cargo van wraps from $3,750. Box trucks from $5,000. Fleet discounts for 3+ vehicles.' },
    { q: 'What vehicles do contractors typically wrap?', a: 'Pickup trucks, cargo vans, box trucks, trailers, and service vehicles. We wrap all sizes and brands.' },
    { q: 'Are contractor vehicle wraps a good investment?', a: 'Yes. At $0.04–$0.48 CPM, vehicle wraps are the most cost-effective advertising for contractors. One wrapped truck generates 30,000+ daily impressions.' },
  ],
  'delivery': [
    { q: 'How much does a delivery fleet wrap cost?', a: 'Cargo van wraps from $3,750. Box trucks from $5,000–$10,900. Volume discounts for large delivery fleets.' },
    { q: 'Do you wrap Amazon DSP delivery vans?', a: 'Yes. We have wrapped hundreds of Amazon DSP fleet vehicles and other last-mile delivery vans.' },
    { q: 'How quickly can you wrap a delivery fleet?', a: 'Fleet orders are batched — typically 3–5 vehicles per week. Design approval adds 2–5 days. Free pickup minimizes downtime.' },
  ],
  'foodtruck': [
    { q: 'How much does a food truck wrap cost?', a: 'Food truck wraps start at $4,500–$8,000 depending on size and design complexity. Includes custom design and premium materials.' },
    { q: 'Can food truck wraps withstand kitchen heat?', a: 'Yes. Cast vinyl is rated for temperatures well above what food truck exteriors experience. Grease and cleaning chemicals wipe off easily.' },
    { q: 'How long does a food truck wrap take?', a: 'Design: 3–5 days. Installation: 2–4 days depending on vehicle size and complexity.' },
  ],
  'landscape': [
    { q: 'How much does a landscaping truck wrap cost?', a: 'Pickup truck wraps from $3,200. Cargo vans from $3,750. Trailer wraps from $1,500. Fleet discounts for 3+ vehicles.' },
    { q: 'Do landscaping wraps hold up in outdoor conditions?', a: 'Yes. Avery Dennison and 3M cast vinyl is rated 5–7 years outdoor. Designed to withstand UV, rain, and road debris.' },
    { q: 'What should a landscaping truck wrap include?', a: 'Company name, logo, phone number, services list, website, and license info. We design for maximum visibility at job sites and on the road.' },
  ],
  'boating': [
    { q: 'How much does a boat wrap cost?', a: 'Boat wraps vary by size — small boats from $3,000, larger vessels $5,000+. Marine-grade vinyl is used for water exposure.' },
    { q: 'How long do boat wraps last?', a: '3–5 years for watercraft with regular water exposure. Proper care and storage extend vinyl life.' },
    { q: 'Can you wrap any type of boat?', a: 'Yes — pontoons, speedboats, charter boats, fishing boats, and commercial marine vessels. Marine-grade adhesive vinyl.' },
  ],
  'moving': [
    { q: 'How much does a moving truck wrap cost?', a: 'Moving truck wraps from $5,000–$10,900 depending on truck size. Fleet discounts for 3+ vehicles.' },
    { q: 'Do wrapped moving trucks generate leads?', a: 'Yes. A wrapped moving truck generates 70,000+ daily impressions in city traffic. Many moving companies report significant inbound call increases.' },
    { q: 'Can you wrap rented or leased moving trucks?', a: 'Yes, with fleet owner approval. Cast vinyl removes cleanly without paint damage at the end of the lease.' },
  ],
  // Chicago-keyword service pages
  'fleet-wraps-chicago': [
    { q: 'What is the best fleet wrap company in Chicago?', a: 'Chicago Fleet Wraps has 24+ years experience, 9,400+ vehicles wrapped, and a 5.0 Google rating. Avery Dennison and 3M certified. Free pickup throughout Chicagoland.' },
    { q: 'How much do fleet wraps cost in Chicago?', a: 'Cargo vans from $3,750. Sprinter vans from $4,700. Box trucks from $5,000–$10,900. Fleet discounts up to 15%.' },
    { q: 'Do fleet wraps come with a warranty?', a: 'Yes. 2-year workmanship warranty plus 5–7 year vinyl manufacturer warranty from Avery Dennison or 3M.' },
  ],
  'van-wraps-chicago': [
    { q: 'How much does a van wrap cost in Chicago?', a: 'Cargo van wraps from $3,750. Transit Connect from $2,800. Sprinter vans from $4,700. Fleet discounts available.' },
    { q: 'What types of vans do you wrap?', a: 'Ford Transit, Mercedes Sprinter, Ram ProMaster, Chevy Express, GMC Savana, Nissan NV, and all commercial van models.' },
    { q: 'How long does a van wrap take?', a: 'Design: 2–5 days. Installation: 1–3 days depending on van size. Free pickup and delivery included.' },
  ],
  'truck-wraps-chicago': [
    { q: 'How much does a truck wrap cost in Chicago?', a: 'Pickup trucks from $3,200. Box trucks from $5,000–$10,900. Pricing depends on vehicle size and coverage.' },
    { q: 'Do you wrap pickup trucks?', a: 'Yes — Ford F-150/250/350, RAM 1500/2500/3500, Chevy Silverado, GMC Sierra, Toyota Tundra, and all makes/models.' },
    { q: 'Can truck wraps withstand Chicago winters?', a: 'Yes. Cast vinyl is rated for -40°F to 200°F. Road salt washes off easily. Wraps actually protect paint from winter damage.' },
  ],
  'boat-wraps-chicago': [
    { q: 'Where can I get a boat wrapped in Chicago?', a: 'Chicago Fleet Wraps provides boat wraps using marine-grade vinyl. We serve Lake Michigan marinas and the greater Chicagoland area.' },
    { q: 'How much does a boat wrap cost in Chicago?', a: 'Small boats from $3,000. Larger vessels $5,000+. Marine-grade cast vinyl rated for water exposure.' },
  ],
  'commercial-vehicle-wraps-chicago': [
    { q: 'What types of commercial vehicles can be wrapped?', a: 'Cargo vans, box trucks, sprinter vans, pickup trucks, trailers, buses, and specialty vehicles. All makes and models.' },
    { q: 'Are commercial vehicle wraps worth it?', a: 'Yes. At $0.04–$0.48 CPM, vehicle wraps deliver the lowest cost-per-impression of any advertising medium. One wrapped van generates 30,000+ daily impressions.' },
    { q: 'How long do commercial vehicle wraps last?', a: '5–7 years with Avery Dennison or 3M cast vinyl. Proper care extends life significantly.' },
  ],
  'vehicle-wraps-chicago': [
    { q: 'How much does a vehicle wrap cost in Chicago?', a: 'Sedan wraps from $2,800. SUV wraps from $3,500. Cargo vans from $3,750. Box trucks from $5,000. Color change wraps from $3,500.' },
    { q: 'How long does a vehicle wrap last in Chicago weather?', a: '5–7 years with premium cast vinyl. Chicago winters do not damage properly installed wraps. Road salt washes off easily.' },
    { q: 'Is it better to wrap or paint a car?', a: 'Wraps cost less, are removable, protect factory paint, and can be changed. Paint is permanent and typically costs 2–3x more for a quality job.' },
  ],
  'vehicle-wrap-cost-chicago': [
    { q: 'How much does a vehicle wrap cost in Chicago?', a: 'Sedan: $2,800–$4,000. SUV: $3,500–$5,000. Cargo van: $3,750–$5,500. Box truck: $5,000–$10,900. Color change: $3,500+.' },
    { q: 'What factors affect vehicle wrap pricing?', a: 'Vehicle size, coverage (full vs partial), material selection, design complexity, and fleet quantity discounts all affect pricing.' },
    { q: 'Are vehicle wraps cheaper than paint?', a: 'Yes. A quality paint job costs $5,000–$15,000. A full wrap costs $2,800–$5,500 and is removable. Wraps are the better value for most applications.' },
  ],
  'partial-vehicle-wraps-chicago': [
    { q: 'How much does a partial wrap cost?', a: 'Partial wraps start at $1,500–$2,500 depending on coverage area. Common options: half wrap, spot graphics, tailgate wrap, and panel wraps.' },
    { q: 'Is a partial wrap worth it?', a: 'Yes. Partial wraps deliver 60–80% of the visual impact of a full wrap at 40–60% of the cost. Great for tight budgets.' },
    { q: 'What is included in a partial wrap?', a: 'Typically covers 40–60% of the vehicle — often sides and rear. Design, premium cast vinyl, and professional installation included.' },
  ],
  'hvac-van-wraps-chicago': [
    { q: 'How much does an HVAC van wrap cost in Chicago?', a: 'HVAC cargo van wraps start at $3,750. Fleet discounts: 3% for 2–4 vehicles, 7% for 5–9, 11% for 10–24, 15% for 25+.' },
    { q: 'What should an HVAC van wrap include?', a: 'Company name, logo, phone number, license info, services offered, emergency service callout, and website. High-visibility design is key.' },
    { q: 'Do HVAC companies get a tax deduction for vehicle wraps?', a: 'Yes. Vehicle wraps are 100% tax deductible under IRS Section 179 as a business advertising expense.' },
  ],
  'plumbing-van-wraps-chicago': [
    { q: 'How much does a plumbing van wrap cost in Chicago?', a: 'Plumbing van wraps start at $3,750 for cargo vans. Includes custom design, premium cast vinyl, and free pickup.' },
    { q: 'Do plumbing wraps help generate leads?', a: 'Yes. Wrapped plumbing vans generate 30,000+ daily impressions. Companies report 15–30% more inbound calls after wrapping.' },
    { q: 'How long do plumbing van wraps last?', a: '5–7 years with Avery Dennison or 3M cast vinyl. Designed to withstand daily commercial use and Chicago weather.' },
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
    { q: 'How much do delivery fleet wraps cost in Chicago?', a: 'Cargo vans from $3,750. Box trucks from $5,000–$10,900. Volume discounts for large delivery fleets.' },
    { q: 'Can you wrap Amazon DSP vans?', a: 'Yes. We have wrapped hundreds of Amazon DSP and last-mile delivery vehicles with brand-compliant graphics.' },
  ],
  'food-truck-wraps-chicago': [
    { q: 'How much does a food truck wrap cost in Chicago?', a: 'Food truck wraps start at $4,500–$8,000 depending on size and design. Menu-integrated designs available.' },
    { q: 'Do food truck wraps hold up to heat and grease?', a: 'Yes. Cast vinyl withstands kitchen-adjacent temperatures. Grease and cleaning chemicals wipe off easily.' },
  ],
  'moving-truck-wraps-chicago': [
    { q: 'How much does a moving truck wrap cost in Chicago?', a: 'Moving truck wraps from $5,000–$10,900 depending on size. Fleet discounts for 3+ trucks.' },
    { q: 'Do wrapped moving trucks get more calls?', a: 'Yes. Wrapped moving trucks generate 70,000+ daily impressions. Moving companies report significant call volume increases.' },
  ],
  'landscaping-truck-wraps-chicago': [
    { q: 'How much does a landscaping truck wrap cost?', a: 'Pickup trucks from $3,200. Cargo vans from $3,750. Trailer wraps from $1,500. Fleet discounts available.' },
    { q: 'Do landscaping wraps hold up outdoors?', a: 'Yes. Avery Dennison and 3M cast vinyl is rated 5–7 years outdoor, designed for UV, rain, and debris exposure.' },
  ],
  // Resource/info pages
  'faq': [
    { q: 'How much does a vehicle wrap cost?', a: 'Pricing depends on vehicle size and coverage. Sedans from $2,800, cargo vans from $3,750, box trucks from $5,000–$10,900.' },
    { q: 'How long do vehicle wraps last?', a: '5–7 years with Avery Dennison or 3M cast vinyl and proper care.' },
    { q: 'Are vehicle wraps tax deductible?', a: 'Yes. Commercial vehicle wraps are 100% deductible under IRS Section 179 as advertising expense.' },
  ],
  'care': [
    { q: 'How do you wash a wrapped vehicle?', a: 'Hand wash with mild soap and water. Avoid brush car washes and pressure washers above 1,200 PSI. No abrasive cleaners.' },
    { q: 'Can you pressure wash a wrapped vehicle?', a: 'Only below 1,200 PSI and at least 12 inches from the surface. High pressure can lift vinyl edges.' },
    { q: 'Does wax protect a vehicle wrap?', a: 'Vinyl-safe spray sealants help protect the wrap. Do not use traditional car wax, which can dull the finish.' },
  ],
  'materials': [
    { q: 'What vinyl do you use for wraps?', a: 'Avery Dennison MPI 1105 and 3M IJ180-CV3 cast vinyl with DOL 1360 UV overlaminate. Cast vinyl only — no calendered film.' },
    { q: 'What is the difference between cast and calendered vinyl?', a: 'Cast vinyl is thinner, more conformable, and lasts 5–7 years. Calendered vinyl is thicker, less flexible, and lasts 2–3 years. We use cast only.' },
    { q: 'What is UV overlaminate?', a: 'A clear protective layer applied over printed vinyl. It blocks UV rays, prevents fading, and adds scratch resistance. Standard on all our wraps.' },
  ],
  'warranty': [
    { q: 'What does the wrap warranty cover?', a: '2-year workmanship warranty covers lifting, peeling, bubbling, and installation defects. 5–7 year vinyl manufacturer warranty from Avery Dennison and 3M.' },
    { q: 'What voids the wrap warranty?', a: 'Brush car washes, high-pressure washers above 1,200 PSI, abrasive cleaners, and unauthorized repairs void the installation warranty.' },
  ],
  'vinyl-guide': [
    { q: 'Which vinyl is best for vehicle wraps?', a: 'Avery Dennison MPI 1105 and 3M IJ180-CV3 are the industry gold standards. Both are cast vinyl rated 5–7 years outdoor.' },
    { q: 'What is the difference between 3M and Avery Dennison wraps?', a: 'Both are premium cast vinyl. Avery Dennison offers slightly easier installation. 3M has a wider distribution network. Performance is comparable.' },
  ],
  'partial-wraps': [
    { q: 'How much does a partial wrap cost?', a: 'Partial wraps start at $1,500–$2,500. Common options include spot graphics, half wraps, tailgate wraps, and panel wraps.' },
    { q: 'Is a partial wrap effective for advertising?', a: 'Yes. Partial wraps deliver 60–80% of the visual impact at 40–60% of the cost. Strategic placement maximizes visibility.' },
  ],
  'lettering': [
    { q: 'How much does vehicle lettering cost?', a: 'Vinyl lettering starts at $300–$800 depending on the amount of text and number of sides. An affordable alternative to full wraps.' },
    { q: 'How long does vinyl lettering last?', a: 'Die-cut vinyl lettering lasts 5–7 years outdoor with Avery or 3M cast vinyl.' },
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
  { q: 'Do you offer free pickup and delivery?', a: 'Yes. Free pickup and delivery throughout Chicagoland — Cook, DuPage, Kane, Lake, Will, and McHenry counties.' },
  { q: 'What materials do you use?', a: 'Avery Dennison MPI 1105 and 3M IJ180-CV3 premium cast vinyl with UV overlaminate. Cast vinyl only — never calendered.' },
];

// City-specific FAQ — unique questions per city
function getCityFaqs(city) {
  const data = CITY_DATA[city];
  const county = data ? data.county : 'Cook';
  const driveTime = data ? data.driveTime : '30–45 min';
  const topIndustry = data ? data.industries[0] : 'service contractors';
  const landmark = data ? data.landmarks[0] : 'your area';
  const district = data ? data.businessDistricts ? data.businessDistricts[0] : 'your local business district' : 'your local business district';

  return [
    { q: `Do you provide fleet wrap services in ${city}, IL?`, a: `Yes. Chicago Fleet Wraps provides free pickup and delivery to ${city} and all of ${county} County. Our shop is at 4711 N Lamon Ave, Chicago IL 60630 — about ${driveTime} from ${city}.` },
    { q: `How much do vehicle wraps cost for ${city} businesses?`, a: `Pricing is the same across Chicagoland with free pickup from ${city} included. Cargo vans from $3,750, sprinter vans from $4,700, box trucks from $5,000–$10,900, pickup trucks from $3,200.` },
    { q: `How long does it take to wrap a vehicle from ${city}?`, a: `Design: 2–5 days with unlimited revisions. Installation: 1–4 days depending on vehicle size. We pick up from ${city} and deliver back when complete. Total turnaround: typically 5–9 business days.` },
    { q: `What industries do you serve in ${city}?`, a: `We wrap vehicles for all industries in ${city}, with particular expertise in ${topIndustry}. Other common clients include HVAC companies, plumbers, electricians, delivery fleets, and general contractors.` },
    { q: `Do you offer fleet discounts for ${city} companies?`, a: `Yes. Fleet discounts: 3% off for 2–4 vehicles, 7% for 5–9, 11% for 10–24, 15% for 25+. Many ${city} businesses save significantly with multi-vehicle orders.` },
    { q: `What areas near ${city} do you also serve?`, a: `We serve all of ${county} County and surrounding areas — 75+ cities total. Free pickup and delivery throughout Chicagoland. See our full service area map at chicagofleetwraps.com/servicearea/.` },
    { q: `Where will my wrapped vehicle get the most exposure in ${city}?`, a: `High-traffic areas like the ${district} provide excellent visibility. Job-site parking in residential neighborhoods is also highly effective — neighbors see your brand while you work.` },
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
        { "@type": "HowToStep", "position": 1, "name": "Request a Free Estimate", "text": "Call (312) 597-1286 or submit an online estimate. We respond within 2 business hours with real pricing — not a range.", "url": `${BASE_URL}/estimate/` },
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
      "name": `Chicago Fleet Wraps — ${page.city} Fleet Wraps`,
      "url": canonical,
      "telephone": "+13125971286",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "4711 N Lamon Ave",
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
    html += `<a href="/${rp.url}/" class="related-card">\n<strong>${escapeHtml(rp.h1)}</strong>\n<span>${escapeHtml(rp.desc.substring(0, 100))}…</span>\n</a>\n`;
  }
  html += `</div>\n</section>\n`;
  return html;
}

function generatePage(page) {
  const canonical = `${BASE_URL}/${page.url}/`;
  const content = page.content || generateCityContent(page.city);
  const jsonLd = generateJsonLd(page);
  const relatedLinks = generateRelatedLinksHtml(page);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(page.title)}</title>
<meta name="description" content="${escapeHtml(page.desc)}">
${page.keywords ? `<meta name="keywords" content="${escapeHtml(page.keywords)}">` : ''}<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${escapeHtml(page.title)}">
<meta property="og:description" content="${escapeHtml(page.desc)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${BASE_URL}/images/${page.ogImage || 'cfw_truck_1.png'}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="Chicago Fleet Wraps">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(page.title)}">
<meta name="twitter:description" content="${escapeHtml(page.desc)}">
<meta name="twitter:image" content="${BASE_URL}/images/${page.ogImage || 'cfw_truck_1.png'}">
<meta name="geo.region" content="US-IL">
<meta name="geo.placename" content="${page.city || 'Chicago'}">
<meta name="geo.position" content="41.9742;-87.7498">
${jsonLd}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;800;900&family=Barlow:wght@400;500;600;700&family=Bebas+Neue&display=swap" rel="stylesheet">
<style>
:root{--gold:#F5C518;--black:#0A0A0A;--dark:#1C1C1C;--steel:#242424;--border:rgba(255,255,255,.10);--text:rgba(255,255,255,.92);--muted:rgba(255,255,255,.55);--H:'Barlow Condensed',sans-serif;--B:'Barlow',sans-serif}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{background:var(--black);color:var(--text);font-family:var(--B);font-size:16px;line-height:1.6;overflow-x:hidden}
header{position:sticky;top:0;z-index:1000;background:rgba(10,10,10,.97);backdrop-filter:blur(12px);border-bottom:1px solid var(--border)}
.hbar{max-width:1200px;margin:0 auto;padding:0 24px;display:flex;align-items:center;gap:20px;height:62px}
.logo{font-family:var(--H);font-size:1.25rem;font-weight:900;color:#fff;text-decoration:none;flex-shrink:0}
.logo span{color:var(--gold)}
nav a{color:rgba(255,255,255,.7);text-decoration:none;font-family:var(--H);font-size:.88rem;font-weight:700;padding:8px 12px;transition:color .2s}
nav a:hover{color:var(--gold)}
.hphone{color:var(--gold);text-decoration:none;font-family:var(--H);font-weight:700;font-size:.9rem;margin-left:auto}
.hamburger{display:none;background:none;border:none;cursor:pointer;padding:8px}
.hamburger svg{width:28px;height:28px;stroke:var(--gold);stroke-width:2;fill:none}
.mobile-nav{display:none;position:fixed;top:62px;left:0;right:0;bottom:0;background:rgba(10,10,10,.98);z-index:999;padding:24px;overflow-y:auto}
.mobile-nav.open{display:flex;flex-direction:column;gap:4px}
.mobile-nav a{color:rgba(255,255,255,.85);text-decoration:none;font-family:var(--H);font-size:1.1rem;font-weight:700;padding:14px 16px;border-radius:8px;min-height:44px;display:flex;align-items:center}
.mobile-nav a:hover,.mobile-nav a:focus{background:rgba(245,197,24,.08);color:var(--gold)}
.content{max-width:900px;margin:0 auto;padding:60px 24px}
h1{font-family:'Bebas Neue',var(--H);font-size:clamp(2.4rem,5vw,3.6rem);color:#fff;margin-bottom:16px;line-height:1.05}
h1 span{color:var(--gold)}
h2{font-family:var(--H);font-size:clamp(1.4rem,3vw,1.8rem);color:#fff;margin:40px 0 16px;font-weight:800}
.lead{font-size:1.1rem;color:rgba(255,255,255,.75);line-height:1.7;margin-bottom:32px}
.speakable{font-size:1rem;color:rgba(255,255,255,.7);line-height:1.7;margin-bottom:24px}
.btn{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border-radius:8px;font-family:var(--H);font-size:.95rem;font-weight:800;cursor:pointer;text-decoration:none;border:2px solid transparent;transition:.18s;letter-spacing:.02em;min-height:44px}
.btn-primary{background:var(--gold);color:#000;border-color:var(--gold)}
.btn-primary:hover{background:#e0b000}
.cta-bar{margin-top:32px;display:flex;gap:12px;flex-wrap:wrap}
.breadcrumb{padding:12px 0;color:rgba(255,255,255,.4);font-size:.85rem}
.breadcrumb a{color:rgba(255,255,255,.5);text-decoration:none}
.breadcrumb a:hover{color:var(--gold)}
.trust{display:flex;flex-wrap:wrap;gap:24px;margin:32px 0;padding:20px;background:rgba(245,197,24,.04);border:1px solid rgba(245,197,24,.12);border-radius:12px}
.trust span{font-size:.85rem;color:rgba(255,255,255,.6)}
.trust strong{color:var(--gold)}
.related-links{margin-top:48px;padding-top:32px;border-top:1px solid var(--border)}
.related-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin-top:16px}
.related-card{display:block;padding:20px;background:var(--steel);border:1px solid var(--border);border-radius:10px;text-decoration:none;transition:border-color .2s,transform .2s}
.related-card:hover{border-color:var(--gold);transform:translateY(-2px)}
.related-card strong{display:block;color:#fff;font-family:var(--H);font-size:1rem;margin-bottom:6px}
.related-card span{color:var(--muted);font-size:.85rem;line-height:1.5}
footer{background:#111;border-top:1px solid var(--border);padding:40px 24px;margin-top:60px}
.footer-inner{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:32px}
.footer-inner h4{color:var(--gold);font-family:var(--H);margin-bottom:12px}
.footer-inner a{display:block;color:rgba(255,255,255,.5);text-decoration:none;font-size:.88rem;padding:3px 0}
.footer-inner a:hover{color:var(--gold)}
.footer-bottom{text-align:center;color:rgba(255,255,255,.3);font-size:.78rem;margin-top:32px;padding-top:20px;border-top:1px solid var(--border)}
@media(max-width:768px){
  nav.desktop-nav{display:none}
  .hamburger{display:block}
  .content{padding:40px 16px}
  .related-grid{grid-template-columns:1fr}
}
@media(pointer:coarse){
  .btn,.mobile-nav a,.footer-inner a{min-height:44px}
}
</style>
</head>
<body>
<header role="banner">
<div class="hbar">
<a href="/" class="logo"><img src="/images/logo-horizontal.png" alt="Chicago Fleet Wraps" style="height:38px;width:auto" width="190" height="38"></a>
<nav class="desktop-nav" role="navigation" aria-label="Main navigation">
<a href="/commercial-vehicle-wraps-chicago/">Commercial</a>
<a href="/boxtruck/">Box Trucks</a>
<a href="/sprinter/">Sprinters</a>
<a href="/colorchange/">Color Change</a>
<a href="/ev-wraps/">EV Wraps</a>
<a href="/portfolio/">Portfolio</a>
<a href="/blog/">Blog</a>
<a href="/faq/">FAQ</a>
<a href="/about/">About</a>
</nav>
<button class="hamburger" aria-label="Open menu" aria-expanded="false" aria-controls="mnav" onclick="var n=document.getElementById('mnav');var open=n.classList.toggle('open');this.setAttribute('aria-expanded',open)">
<svg viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
</button>
<a href="tel:+13125971286" class="hphone">📞 (312) 597-1286</a>
</div>
</header>
<div id="mnav" class="mobile-nav" role="navigation" aria-label="Mobile navigation">
<a href="/commercial-vehicle-wraps-chicago/">Commercial Wraps</a>
<a href="/boxtruck/">Box Truck Wraps</a>
<a href="/sprinter/">Sprinter Wraps</a>
<a href="/colorchange/">Color Change</a>
<a href="/ev-wraps/">EV Wraps</a>
<a href="/estimate/">Get Estimate</a>
<a href="/portfolio/">Portfolio</a>
<a href="/blog/">Blog</a>
<a href="/faq/">FAQ</a>
<a href="/about/">About</a>
<a href="/servicearea/">Service Area</a>
<a href="/calculator/">Price Calculator</a>
</div>

<main role="main">
<div class="content">
<nav class="breadcrumb" aria-label="Breadcrumb">
<a href="/">Home</a> › ${page.category === 'Blog' ? '<a href="/blog/">Blog</a> › ' : ''}${page.category === 'Cities' ? '<a href="/servicearea/">Service Area</a> › ' : ''}${escapeHtml(page.h1)}
</nav>

<h1>${escapeHtml(page.h1)}</h1>
${page.city ? content : `<p class="lead speakable">${escapeHtml(content)}</p>`}
${page.heroImage ? `<img src="/images/${page.heroImage}" alt="${escapeHtml(page.h1)} — Chicago Fleet Wraps" style="width:100%;max-width:900px;border-radius:12px;margin:24px 0 32px;aspect-ratio:4/3;object-fit:contain;object-position:center center;background:var(--steel);padding:12px" width="900" height="675" loading="eager">` : ''}

<div class="trust">
<span>📅 <strong>24+ Years</strong> Experience</span>
<span>🏆 <strong>9,400+</strong> Vehicles Wrapped</span>
<span>✅ <strong>Avery Dennison & 3M</strong> Certified</span>
<span>📍 <strong>${page.city ? escapeHtml(page.city) + ', IL' : 'Chicago, IL'}</strong></span>
<span>🚐 <strong>Free Fleet Pickup</strong></span>
</div>

<div class="cta-bar">
<a href="/estimate/" class="btn btn-primary">Get ${page.city ? escapeHtml(page.city) : ''} Fleet Estimate →</a>
<a href="tel:+13125971286" class="btn" style="border-color:var(--gold);color:var(--gold)">📞 (312) 597-1286</a>
<a href="/calculator/" class="btn" style="border-color:var(--border);color:var(--text)">💰 Price Calculator</a>
</div>

${relatedLinks}
</div>
</main>

<footer role="contentinfo">
<div class="footer-inner">
<div>
<h4>Chicago Fleet Wraps</h4>
<p style="color:rgba(255,255,255,.5);font-size:.88rem">Professional fleet wrap specialists serving Chicago and all of Chicagoland since 2014.</p>
<p style="color:rgba(255,255,255,.4);font-size:.85rem;margin-top:8px">4711 N. Lamon Ave, Chicago, IL 60630</p>
<p style="margin-top:4px"><a href="tel:+13125971286">(312) 597-1286</a> · <a href="mailto:roy@chicagofleetwraps.com">roy@chicagofleetwraps.com</a></p>
</div>
<div>
<h4>Services</h4>
<a href="/commercial-vehicle-wraps-chicago/">Commercial Fleets</a>
<a href="/boxtruck/">Box Trucks</a>
<a href="/sprinter/">Sprinter Vans</a>
<a href="/transit/">Transit Vans</a>
<a href="/colorchange/">Color Change</a>
<a href="/ev-wraps/">EV Wraps</a>
<a href="/wallwraps/">Wall Graphics</a>
<a href="/wrap-removal/">Wrap Removal</a>
</div>
<div>
<h4>Industries</h4>
<a href="/hvac-van-wraps-chicago/">HVAC</a>
<a href="/plumbing-van-wraps-chicago/">Plumbing</a>
<a href="/electrician-vehicle-wraps-chicago/">Electrical</a>
<a href="/contractor-vehicle-wraps-chicago/">Contractors</a>
<a href="/delivery-fleet-wraps-chicago/">Delivery</a>
<a href="/food-truck-wraps-chicago/">Food Trucks</a>
<a href="/landscaping-truck-wraps-chicago/">Landscaping</a>
<a href="/boat-wraps-chicago/">Boating</a>
<a href="/moving-truck-wraps-chicago/">Moving Companies</a>
</div>
<div>
<h4>Company</h4>
<a href="/estimate/">Get Estimate</a>
<a href="/calculator/">Price Calculator</a>
<a href="/portfolio/">Portfolio</a>
<a href="/about/">About</a>
<a href="/faq/">FAQ</a>
<a href="/servicearea/">Service Area</a>
<a href="/warranty/">Warranty</a>
<a href="/blog/">Blog</a>
</div>
</div>
<div class="footer-bottom">© 2026 Chicago Fleet Wraps · 4711 N. Lamon Ave, Chicago IL 60630 · 24+ Years · 9,400+ Vehicles</div>
</footer>

<script src="/js/gmb-live.js" defer></script>
<script src="/js/chat-widget.js" defer></script>
</body>
</html>`;
}

// Build route path from public HTML file path
function routeFromHtmlFile(file) {
  if (file === 'index.html') return '/';
  if (file.endsWith('/index.html')) return `/${file.replace(/\/index\.html$/, '')}/`;
  return `/${file}`;
}

// Internal link rewriting map: old short paths → canonical long-keyword paths
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

function normalizeHtmlForIndexing(file, html) {
  let output = html;
  const route = routeFromHtmlFile(file);
  const canonicalUrl = `${BASE_URL}${route}`;

  // 1) Remove any JS soft-redirect/cloaking snippets
  output = output.replace(/<script>\s*if\s*\(\s*window\.history[\s\S]*?route[\s\S]*?<\/script>/gi, '');
  output = output.replace(/<script>[^<]*?(?:bot|crawl|spider)[^<]*?route[^<]*?<\/script>/gi, '');

  // 2) Ensure robots indexability is explicit
  if (!/<meta\s+name=["']robots["']/i.test(output)) {
    output = output.replace(
      /<\/head>/i,
      '<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">\n</head>'
    );
  }

  // 3) Ensure canonical is self-referential and consistent
  if (/<link\s+rel=["']canonical["']/i.test(output)) {
    output = output.replace(
      /<link\s+rel=["']canonical["']\s+href=["'][^"']*["']\s*\/?>(?:<\/link>)?/i,
      `<link rel="canonical" href="${canonicalUrl}">`
    );
  } else {
    output = output.replace(/<\/head>/i, `<link rel="canonical" href="${canonicalUrl}">\n</head>`);
  }

  // 4) Ensure og:url aligns with canonical
  if (/<meta\s+property=["']og:url["']/i.test(output)) {
    output = output.replace(
      /<meta\s+property=["']og:url["']\s+content=["'][^"']*["']\s*\/?>(?:<\/meta>)?/i,
      `<meta property="og:url" content="${canonicalUrl}">`
    );
  } else {
    output = output.replace(/<\/head>/i, `<meta property="og:url" content="${canonicalUrl}">\n</head>`);
  }

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
  const excluded = new Set(['googleac4190c5fb66b0fb.html', 'site.html', 'wrap-calculator.html']);
  // Exclude redirect stubs from sitemap
  const redirectSlugs = new Set(Object.keys(REDIRECTS).map(s => `${s}/index.html`));
  // Exclude internal/utility pages that shouldn't be indexed
  const noIndexSlugs = new Set([
    'intake/index.html',
    'schedule/index.html',
    'stats/index.html',
    'vsads/index.html',
    'brand-audit/index.html',
    'rent-the-bay/index.html',
  ]);
  const routes = new Set(['/']);

  for (const file of htmlFiles) {
    if (excluded.has(file)) continue;
    if (redirectSlugs.has(file)) continue;
    if (noIndexSlugs.has(file)) continue;
    routes.add(routeFromHtmlFile(file));
  }

  const today = new Date().toISOString().split('T')[0];
  const sortedRoutes = [...routes].sort((a, b) => {
    if (a === '/') return -1;
    if (b === '/') return 1;
    return a.localeCompare(b);
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sortedRoutes.map((route) => {
      const priority = route === '/' ? '1.0' : route.startsWith('/post/') ? '0.7' : '0.8';
      const changefreq = route.startsWith('/post/') ? 'monthly' : route === '/' ? 'daily' : 'weekly';
      return `  <url><loc>${BASE_URL}${route}</loc><lastmod>${today}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
    }),
    '</urlset>',
    '',
  ].join('\n');

  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), xml, 'utf-8');
  console.log(`\n🗺️ Rebuilt sitemap.xml from actual files (${sortedRoutes.length} URLs)`);
}

// === Redirect map: short slug (loser) → long keyword slug (winner) ===
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
console.log('🚀 Generating static HTML pages...');
let generatedCount = 0;

for (const page of PAGES) {
  const dir = path.join(PUBLIC_DIR, page.url);
  fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, 'index.html');
  const html = generatePage(page);
  fs.writeFileSync(filePath, html, 'utf-8');
  generatedCount++;
  console.log(`  ✓ /${page.url}/`);
}

console.log(`\n✅ Generated ${generatedCount} static HTML pages`);

// Generate redirect stubs for duplicate short slugs
let redirectCount = 0;
for (const [fromSlug, toSlug] of Object.entries(REDIRECTS)) {
  const dir = path.join(PUBLIC_DIR, fromSlug);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, 'index.html');
  const html = generateRedirectPage(fromSlug, toSlug);
  fs.writeFileSync(filePath, html, 'utf-8');
  redirectCount++;
  console.log(`  ↪ /${fromSlug}/ → /${toSlug}/`);
}
console.log(`\n↪ Generated ${redirectCount} redirect stubs`);

// Normalize every HTML file for indexability (skip redirect pages)
const allHtmlFiles = globSync('**/*.html', { cwd: PUBLIC_DIR });
const redirectPaths = new Set(Object.keys(REDIRECTS).map(s => `${s}/index.html`));
let normalizedCount = 0;
for (const file of allHtmlFiles) {
  // Skip redirect stubs — they have their own canonical pointing to the target
  if (redirectPaths.has(file)) continue;
  
  const fp = path.join(PUBLIC_DIR, file);
  const original = fs.readFileSync(fp, 'utf-8');
  const normalized = normalizeHtmlForIndexing(file, original);

  if (normalized !== original) {
    fs.writeFileSync(fp, normalized, 'utf-8');
    normalizedCount++;
    console.log(`  🧹 Normalized SEO/indexing for ${file}`);
  }
}

console.log(`\n🧹 Normalized ${normalizedCount} HTML files for indexability`);

// Rebuild sitemap from actual files so nothing is missing
regenerateSitemapFromPublicFiles();
