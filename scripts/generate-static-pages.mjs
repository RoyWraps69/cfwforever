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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const BASE_URL = 'https://www.chicagofleetwraps.com';

// All pages with SEO metadata, content, and URL mapping
const PAGES = [
  // === Service Pages ===
  { slug: 'commercial', url: 'commercial', ogImage: 'frontier_fleet_vans.jpg', heroImage: 'cfw_van_2.png', h1: 'Commercial Fleet Wraps Chicago', desc: 'Commercial fleet vehicle wrap services in Chicago. Cargo vans, pickups, full fleet programs. Avery Dennison & 3M materials. Free pickup — (312) 597-1286.', title: 'Commercial Fleet Wraps Chicago | Chicago Fleet Wraps', category: 'Services', keywords: 'commercial fleet wraps Chicago, fleet vehicle wraps, cargo van wraps, fleet graphics, vehicle branding Chicago, Avery Dennison wraps, 3M fleet wraps', content: 'A wrapped cargo van generates 30,000–70,000 impressions per day in Chicago traffic at a CPM of $0.48. No recurring ad spend. One investment that works for 5–7 years. In-house design on exact vehicle templates. Avery Dennison MPI 1105 or 3M IJ180-CV3 cast vinyl only. UV overlaminate standard. Free pickup and delivery throughout Chicagoland. Fleet discounts available.' },
  { slug: 'boxtruck', url: 'boxtruck', ogImage: 'windy_city_box_truck.webp', heroImage: 'hunt_brothers_pizza_truck.jpg', h1: 'Box Truck Wraps Chicago', desc: 'Professional box truck wraps in Chicago. 16–26 ft trucks wrapped with Avery Dennison & 3M cast vinyl. 2-year warranty. Free pickup.', title: 'Box Truck Wraps Chicago — 16 to 26 ft | Chicago Fleet Wraps', category: 'Services', keywords: 'box truck wraps Chicago, box truck graphics, 16 ft box truck wrap, 26 ft box truck wrap, truck wrap cost Chicago', content: 'A wrapped box truck on I-90, I-290, or I-94 generates 70,000+ daily impressions with zero recurring ad spend. All sizes: 16, 18, 20, 22, 24, 26 ft box trucks. Cab, box sides, and rear door fully covered. Avery Dennison MPI 1105 cast vinyl rated 7 years.' },
  { slug: 'sprinter', url: 'sprinter', ogImage: 'precision_today_sprinter.jpg', heroImage: 'cfw_van_3.png', h1: 'Sprinter Van Wraps Chicago', desc: 'Mercedes Sprinter van wraps in Chicago. Standard and high-roof. Full and partial wraps. Avery Dennison & 3M certified. Free estimates.', title: 'Sprinter Van Wraps Chicago | Chicago Fleet Wraps', category: 'Services', keywords: 'sprinter van wraps Chicago, Mercedes Sprinter wrap, high roof sprinter wrap, sprinter van graphics, sprinter wrap cost', content: 'Professional Mercedes Sprinter van wraps in Chicago. Standard and high-roof models. Full and partial wrap options. Premium Avery Dennison MPI 1105 and 3M IJ180-CV3 cast vinyl. Free pickup throughout Chicagoland.' },
  { slug: 'transit', url: 'transit', ogImage: 'small_transit_van.webp', heroImage: 'cfw_van_1.png', h1: 'Transit Van Wraps Chicago', desc: 'Ford Transit van wraps in Chicago. Full and partial commercial wraps. Premium cast vinyl. Free fleet pickup throughout Chicagoland.', title: 'Transit Van Wraps Chicago | Chicago Fleet Wraps', category: 'Services', keywords: 'Ford Transit van wraps Chicago, transit van graphics, transit van wrap cost, commercial van wraps', content: 'Ford Transit van wraps in Chicago. Full and partial commercial wrap options. Premium cast vinyl materials. Free fleet pickup and delivery across Chicagoland.' },
  { slug: 'colorchange', url: 'colorchange', ogImage: 'color_change_tesla.webp', heroImage: 'audi_color_shift.jpg', h1: 'Color Change Wraps Chicago', desc: 'Full color change vehicle wraps in Chicago. 120+ colors. Avery Dennison Supreme Wrapping Film & 3M 2080. Cars, trucks, SUVs. Free estimates.', title: 'Color Change Wraps Chicago | Chicago Fleet Wraps', category: 'Services', keywords: 'color change wrap Chicago, matte wrap, satin wrap, gloss wrap, chrome wrap, vehicle color change, car wrap colors', content: 'Full color change vehicle wraps in Chicago. Over 120 colors available including gloss, matte, satin, metallic, and chrome finishes. Avery Dennison Supreme Wrapping Film and 3M 2080 series. Professional installation with 2-year workmanship warranty.' },
  { slug: 'wallwraps', url: 'wallwraps', ogImage: 'oakbros_wall_wrap.jpg', heroImage: 'balloon_museum_massive.jpg', h1: 'Wall Wraps & Murals Chicago', desc: 'Custom wall wraps, murals, and environmental graphics in Chicago. Interior and exterior. Commercial and residential. Free quotes.', title: 'Wall Wraps & Murals Chicago | Chicago Fleet Wraps', category: 'Services', keywords: 'wall wraps Chicago, wall murals, environmental graphics, wall graphics, office wall wrap, commercial murals Chicago', content: 'Custom wall wraps, murals, and environmental graphics in Chicago. Interior and exterior installations. Commercial lobbies, retail spaces, gyms, restaurants. High-resolution printing on premium adhesive vinyl.' },
  { slug: 'removal', url: 'removal', ogImage: 'graphics_removal.webp', heroImage: 'wrap_install_closeup.jpg', h1: 'Wrap Removal Chicago', desc: 'Professional vehicle wrap removal in Chicago. Safe removal preserving factory paint. Fleet and individual vehicles. Free estimates.', title: 'Wrap Removal Chicago | Chicago Fleet Wraps', category: 'Services', keywords: 'wrap removal Chicago, vehicle wrap removal, vinyl removal, fleet wrap removal, wrap removal cost', content: 'Professional vehicle wrap removal services in Chicago. Safe heat-gun removal preserving factory paint. Fleet and individual vehicles. Adhesive residue cleaning included. Free estimates.' },
  { slug: 'ev', url: 'ev-wraps', ogImage: 'rivian_blue_holographic.jpg', heroImage: 'rivian_rad.jpg', h1: 'Electric Vehicle Wraps Chicago — #1 EV Wrap Shop in Illinois', desc: "Illinois' largest EV wrap installer. 600+ Rivians wrapped. Tesla, Rivian, Lucid, BMW iX. Color change & commercial. Zero warranty issues.", title: 'Electric Vehicle Wraps Chicago — #1 EV Wrap Shop IL | Chicago Fleet Wraps', category: 'Services', keywords: 'EV wraps Chicago, electric vehicle wrap, Rivian wrap, Tesla wrap, Lucid wrap, BMW iX wrap, EV color change, electric car wrap Illinois', content: "Illinois' largest EV wrap installer. 600+ Rivians wrapped. Tesla Model 3, Model Y, Model S, Model X. Rivian R1T, R1S. Lucid Air. BMW iX. Polestar. Color change and commercial wraps. Zero warranty issues. Avery Dennison and 3M certified." },

  // === Industry Pages ===
  { slug: 'hvac', url: 'hvac', ogImage: 'precision_today_hvac.jpg', heroImage: 'sbc_hvac_van.jpg', h1: 'HVAC Fleet Wraps Chicago', desc: 'HVAC fleet vehicle wraps in Chicago. Cargo vans, trucks, sprinters. Generate 30,000+ daily impressions. Free pickup & fleet discounts.', title: 'HVAC Fleet Wraps Chicago | Chicago Fleet Wraps', category: 'Industries', keywords: 'HVAC fleet wraps, HVAC van wraps Chicago, HVAC truck wraps, heating cooling vehicle wraps, HVAC branding', content: 'HVAC fleet vehicle wraps generating 30,000+ daily impressions per vehicle. Cargo vans, trucks, sprinters. Professional designs on exact vehicle templates. Free pickup throughout Chicagoland. Fleet discounts available.' },
  { slug: 'plumber', url: 'plumber', ogImage: 'cfw_van_1.png', heroImage: 'cfw_van_3.png', h1: 'Plumbing Fleet Wraps Chicago', desc: 'Plumbing company vehicle wraps in Chicago. Professional fleet branding. Cargo vans, trucks. Free estimates — (312) 597-1286.', title: 'Plumbing Fleet Wraps Chicago | Chicago Fleet Wraps', category: 'Industries', keywords: 'plumber van wraps Chicago, plumbing fleet wraps, plumber truck wraps, plumbing vehicle graphics', content: 'Plumbing company vehicle wraps in Chicago. Professional fleet branding for plumbers. Cargo vans, trucks, and service vehicles. Premium cast vinyl. Free estimates and fleet pickup.' },
  { slug: 'electric', url: 'electric', ogImage: 'arnold_electric_van.jpg', heroImage: 'arnold_electric_truck.jpg', h1: 'Electrician Fleet Wraps Chicago', desc: 'Electrical contractor vehicle wraps in Chicago. Professional fleet branding for electricians. Free pickup throughout Chicagoland.', title: 'Electrician Fleet Wraps Chicago | Chicago Fleet Wraps', category: 'Industries', keywords: 'electrician van wraps Chicago, electrical contractor wraps, electrician fleet branding, electrician truck wraps', content: 'Electrical contractor vehicle wraps in Chicago. Professional fleet branding for electricians. Cargo vans, trucks, and service vehicles. Avery Dennison and 3M certified materials.' },
  { slug: 'contractor', url: 'contractor', ogImage: 'sns_roofing_truck.png', heroImage: 'exalt_air_pick_up_truck.webp', h1: 'General Contractor Fleet Wraps Chicago', desc: 'General contractor vehicle wraps in Chicago. Trucks, vans, and fleet vehicles. Professional branding. Free fleet pickup.', title: 'General Contractor Fleet Wraps Chicago | Chicago Fleet Wraps', category: 'Industries', keywords: 'contractor vehicle wraps Chicago, general contractor fleet wraps, construction truck wraps, contractor van graphics', content: 'General contractor vehicle wraps in Chicago. Trucks, vans, and fleet vehicles. Professional branding that generates leads on every job site and commute.' },
  { slug: 'delivery', url: 'delivery', ogImage: 'cfw_truck_2.png', heroImage: 'windy_city_box_truck.webp', h1: 'Delivery Fleet Wraps Chicago', desc: 'Delivery and logistics fleet wraps in Chicago. Box trucks, cargo vans, sprinters. Volume discounts. Free pickup.', title: 'Delivery Fleet Wraps Chicago | Chicago Fleet Wraps', category: 'Industries', keywords: 'delivery fleet wraps Chicago, logistics vehicle wraps, delivery van graphics, delivery truck branding', content: 'Delivery and logistics fleet wraps in Chicago. Box trucks, cargo vans, sprinters. Volume discounts for large fleets. Free pickup and delivery throughout Chicagoland.' },
  { slug: 'foodtruck', url: 'foodtruck', ogImage: 'blondies_beef_truck.jpg', heroImage: 'hunt_brothers_pizza_truck.jpg', h1: 'Food Truck Wraps Chicago', desc: 'Custom food truck wraps in Chicago. Eye-catching designs. Avery Dennison & 3M materials. Full and partial wraps. Free estimates.', title: 'Food Truck Wraps Chicago | Chicago Fleet Wraps', category: 'Industries', keywords: 'food truck wraps Chicago, food truck graphics, food truck design, custom food truck wrap', content: 'Custom food truck wraps in Chicago. Eye-catching designs that attract customers. Avery Dennison and 3M materials rated for 5–7 years outdoor. Full and partial wrap options.' },
  { slug: 'landscape', url: 'landscape', ogImage: 'exalt_air_pick_up_truck.webp', heroImage: 'cfw_truck_3.png', h1: 'Landscaping Fleet Wraps Chicago', desc: 'Landscaping company vehicle wraps in Chicago. Trucks, trailers, cargo vans. Professional fleet branding. Free estimates.', title: 'Landscaping Fleet Wraps Chicago | Chicago Fleet Wraps', category: 'Industries', keywords: 'landscaping vehicle wraps Chicago, lawn care truck wraps, landscaping van graphics, landscaper fleet branding', content: 'Landscaping company vehicle wraps in Chicago. Trucks, trailers, cargo vans. Professional fleet branding. Premium cast vinyl that withstands outdoor conditions.' },
  { slug: 'boating', url: 'boating', ogImage: 'cutwater_boat.jpg', heroImage: 'patron_boat.jpg', h1: 'Boat & Marine Wraps Chicago', desc: 'Commercial boat wraps in Chicago. Charter companies, marinas. Marine-grade vinyl. Free consultation.', title: 'Boat & Marine Wraps Chicago | Chicago Fleet Wraps', category: 'Industries', keywords: 'boat wraps Chicago, marine wraps, boat graphics, boat vinyl wrap, charter boat wraps', content: 'Commercial boat wraps in Chicago. Charter companies, marinas, and marine businesses. Marine-grade vinyl rated for water exposure. Free consultation.' },
  { slug: 'moving', url: 'moving', ogImage: 'cfw_truck_1.png', heroImage: 'cfw_truck_2.png', h1: 'Moving Company Wraps Chicago', desc: 'Moving company fleet wraps in Chicago. Box trucks, cargo vans. Professional branding. Volume discounts. Free pickup.', title: 'Moving Company Wraps Chicago | Chicago Fleet Wraps', category: 'Industries', keywords: 'moving company wraps Chicago, moving truck wraps, moving van graphics, mover fleet branding', content: 'Moving company fleet wraps in Chicago. Box trucks, cargo vans, and pickup trucks. Professional branding that builds trust. Volume discounts for large fleets.' },

  // === Core Pages ===
  { slug: 'portfolio', url: 'portfolio', ogImage: 'corvette_mid_wrap.jpg', heroImage: 'pink_chrome.webp', h1: 'Vehicle Wrap Gallery & Portfolio', desc: 'Explore our vehicle wrap gallery featuring real car, truck, van, and fleet wrap projects in Chicago. Bold, custom designs.', title: 'Vehicle Wrap Gallery & Portfolio | Chicago Fleet Wraps', category: 'Company', keywords: 'vehicle wrap portfolio, fleet wrap gallery, wrap examples Chicago, vehicle wrap before after', content: 'Browse our portfolio of vehicle wrap projects. Commercial fleet wraps, color change wraps, box truck wraps, sprinter van wraps, and more. All projects completed in Chicago.' },
  { slug: 'blog', url: 'blog', ogImage: 'cfw_van_2.png', heroImage: 'cfw_truck_1.png', h1: 'Fleet Wrap Insights & Blog', desc: 'Expert guides, ROI data, and industry knowledge from 24+ years in the wrap business. Chicago Fleet Wraps blog.', title: 'Fleet Wrap Insights & Blog | Chicago Fleet Wraps', category: 'Company', keywords: 'fleet wrap blog, vehicle wrap tips, wrap industry insights, fleet branding articles', content: 'Expert guides, ROI data, and industry knowledge from 24+ years in the wrap business. Articles on materials, pricing, care, and fleet wrap strategies.' },
  { slug: 'faq', url: 'faq', ogImage: 'wrap_install_closeup.jpg', heroImage: 'frontier_fleet_vans.jpg', h1: 'Vehicle Wrap FAQs', desc: 'Answers to common vehicle wrap questions. Materials, pricing, installation, care, and more. Chicago Fleet Wraps — (312) 597-1286.', title: 'Vehicle Wrap FAQs | Chicago Fleet Wraps', category: 'Company', keywords: 'vehicle wrap FAQ, wrap questions, how long do wraps last, vehicle wrap cost, wrap care', content: 'Frequently asked questions about vehicle wraps. Materials, pricing, installation timelines, care instructions, warranty information, and more.' },
  { slug: 'about', url: 'about', ogImage: 'balloon_museum_exterior.jpg', heroImage: 'balloon_museum_interior.jpg', h1: 'About Chicago Fleet Wraps', desc: "24+ years experience. 9,400+ vehicles wrapped. Meet the team behind Chicago's highest-rated fleet wrap company.", title: 'About Chicago Fleet Wraps | Vehicle Wrap Experts', category: 'Company', keywords: 'Chicago Fleet Wraps, vehicle wrap company Chicago, fleet wrap installer, about Chicago Fleet Wraps', content: '24+ years experience in commercial vehicle graphics. Started in Las Vegas in 2001. Operating in Chicago since 2014. 9,400+ vehicles wrapped. 2,800+ fleet accounts.' },
  { slug: 'estimate', url: 'estimate', ogImage: 'cfw_van_1.png', heroImage: 'cfw_truck_3.png', h1: 'Get a Free Fleet Wrap Estimate', desc: 'Request a free fleet wrap estimate. Real pricing within 2 hours. Free pickup throughout Chicagoland. (312) 597-1286.', title: 'Get a Free Fleet Wrap Estimate | Chicago Fleet Wraps', category: 'Company', keywords: 'free wrap estimate, fleet wrap quote, vehicle wrap pricing, wrap cost estimate Chicago', content: 'Request a free fleet wrap estimate. Real pricing — not a range — within 2 business hours. Free pickup and delivery throughout Chicagoland.' },
  { slug: 'warranty', url: 'warranty', ogImage: 'cfw_van_3.png', heroImage: 'precision_today_sprinter.jpg', h1: 'Warranty Policy', desc: '2-year installation warranty covering lifting, peeling, bubbling. 5–7 year vinyl manufacturer warranty. Chicago Fleet Wraps.', title: 'Warranty Policy | Chicago Fleet Wraps', category: 'Company', keywords: 'vehicle wrap warranty, wrap guarantee, Avery Dennison warranty, 3M wrap warranty', content: '2-year workmanship warranty covering lifting, peeling, and bubbling. 5–7 year vinyl manufacturer warranty from Avery Dennison and 3M.' },
  { slug: 'servicearea', url: 'servicearea', ogImage: 'chicago_neighborhoods_map.png', heroImage: 'frontier_fleet_vans.jpg', h1: 'Service Area — 75+ Cities in Chicagoland', desc: 'Serving 75+ cities across Chicagoland. Cook, DuPage, Kane, Lake, Will, McHenry counties. Free fleet pickup and delivery.', title: 'Service Area — 75+ Cities in Chicagoland | Chicago Fleet Wraps', category: 'Company', keywords: 'fleet wraps Chicagoland, vehicle wraps near me, fleet wraps Cook County, fleet wraps DuPage County, Chicago suburbs wraps', content: 'Chicago Fleet Wraps serves 75+ cities across Chicagoland including Cook, DuPage, Kane, Lake, Will, and McHenry counties. Free fleet pickup and delivery included.' },
  { slug: 'apparel', url: 'apparel', ogImage: 'beats2.jpg', heroImage: 'mortal_combat.jpg', h1: 'Custom Apparel & Team Wear', desc: 'Custom branded apparel for fleet teams. T-shirts, polos, hats, workwear. Match your vehicle wraps. Chicago Fleet Wraps.', title: 'Custom Apparel & Team Wear | Chicago Fleet Wraps', category: 'Company', keywords: 'custom apparel, team workwear, branded uniforms, fleet team clothing', content: 'Custom branded apparel for fleet teams. T-shirts, polos, hats, workwear. Match your vehicle wrap branding for a cohesive professional image.' },

  // === Resource Pages ===
  { slug: 'roi', url: 'roi', ogImage: 'cfw_truck_1.png', heroImage: 'frontier_fleet_vans.jpg', h1: 'Fleet Wrap ROI Calculator Guide', desc: 'Calculate your fleet wrap ROI. CPM data, impression counts, and cost comparisons. Chicago Fleet Wraps.', title: 'Fleet Wrap ROI Calculator Guide | Chicago Fleet Wraps', category: 'Resources', keywords: 'fleet wrap ROI, vehicle wrap return on investment, wrap CPM, advertising ROI calculator', content: 'Calculate your fleet wrap return on investment. Vehicle wraps deliver the lowest CPM of any advertising medium at $0.04–$0.48 per thousand impressions.' },
  { slug: 'stats', url: 'stats', ogImage: 'cfw_truck_3.png', heroImage: 'cfw_van_2.png', h1: 'Vehicle Wrap Statistics & Industry Data', desc: 'Fleet wrap statistics: 97% recall rate, 70,000 daily impressions, $0.04 CPM. Data from OAAA, 3M, and ARF studies.', title: 'Vehicle Wrap Statistics & Industry Data | Chicago Fleet Wraps', category: 'Resources', keywords: 'vehicle wrap statistics, wrap impressions data, fleet advertising stats, OAAA wrap data, vehicle wrap CPM', content: '97% ad recall rate. 70,000+ daily impressions per vehicle. $0.04 CPM. Data sourced from OAAA, 3M, and ARF research studies.' },
  { slug: 'vsads', url: 'vsads', ogImage: 'cfw_van_1.png', heroImage: 'cfw_truck_2.png', h1: 'Vehicle Wraps vs Google Ads', desc: 'Compare vehicle wraps to Google Ads, billboards, and social media. CPM, ROI, and cost analysis. Chicago Fleet Wraps.', title: 'Vehicle Wraps vs Google Ads | Chicago Fleet Wraps', category: 'Resources', keywords: 'vehicle wraps vs Google Ads, wrap vs billboard, fleet advertising comparison, best advertising for small business', content: 'Vehicle wraps vs Google Ads, billboards, and social media advertising. Side-by-side CPM, ROI, and total cost comparison over 5 years.' },
  { slug: 'materials', url: 'materials', ogImage: 'wrap_install_closeup.jpg', heroImage: 'corvette_mid_wrap.jpg', h1: 'Wrap Materials Guide — Avery Dennison & 3M', desc: 'Compare Avery Dennison MPI 1105 and 3M IJ180-CV3 cast vinyl. Specs, durability, and recommendations.', title: 'Wrap Materials Guide — Avery Dennison & 3M | Chicago Fleet Wraps', category: 'Resources', keywords: 'Avery Dennison MPI 1105, 3M IJ180-CV3, cast vinyl, wrap materials, vinyl wrap film comparison', content: 'Compare Avery Dennison MPI 1105 and 3M IJ180-CV3 cast vinyl. Specifications, durability ratings, conformability, and professional recommendations.' },
  { slug: 'care', url: 'care', ogImage: 'sandals_color_change.jpg', heroImage: 'bmw_matte_black.jpg', h1: 'Wrap Care & Maintenance Guide', desc: 'How to care for your vehicle wrap. Washing, storage, winter tips. Extend your wrap to 7+ years. Chicago Fleet Wraps.', title: 'Wrap Care & Maintenance Guide | Chicago Fleet Wraps', category: 'Resources', keywords: 'wrap care, vehicle wrap maintenance, how to wash wrapped car, wrap care tips, vinyl wrap cleaning', content: 'How to care for your vehicle wrap. Hand washing techniques, storage recommendations, winter weather tips. Extend your wrap life to 7+ years.' },

  // === Tool Pages ===
  { slug: 'visualizer', url: 'visualizer', ogImage: 'camaro_color_shift.jpg', heroImage: 'pink_chrome-2.webp', h1: 'Vehicle Wrap Color Visualizer', desc: 'Preview 120+ vinyl wrap colors on vehicle templates. Try before you buy. Free tool from Chicago Fleet Wraps.', title: 'Vehicle Wrap Color Visualizer | Chicago Fleet Wraps', category: 'Tools', keywords: 'wrap color visualizer, vinyl wrap colors, vehicle wrap preview, color change preview tool', content: 'Preview over 120 vinyl wrap colors on vehicle templates. Avery Dennison and 3M color swatches. Try before you buy. Free interactive tool.' },
  { slug: 'brandaudit', url: 'brandaudit', ogImage: 'arnold_electric_sales.jpg', heroImage: 'frontier_fleet_vans.jpg', h1: 'Fleet Brand Audit — Free Assessment', desc: 'Score your fleet branding in 2 minutes. 8-question assessment with instant recommendations. Free tool.', title: 'Fleet Brand Audit — Free Assessment | Chicago Fleet Wraps', category: 'Tools', keywords: 'fleet brand audit, fleet branding score, vehicle branding assessment, fleet marketing audit', content: 'Score your fleet branding in 2 minutes. 8-question assessment covering visibility, consistency, and impact. Instant recommendations and action plan.' },
  { slug: 'calculator', url: 'calculator', ogImage: 'small_suv.webp', heroImage: 'small_transit_van.webp', h1: 'Wrap Cost Per Day Calculator', desc: 'Calculate your vehicle wrap cost per day and CPM. Compare to Google Ads, billboards, and other advertising.', title: 'Wrap Cost Per Day Calculator | Chicago Fleet Wraps', category: 'Tools', keywords: 'wrap cost calculator, vehicle wrap price calculator, wrap CPM calculator, fleet wrap cost estimator', content: 'Calculate your vehicle wrap cost per day and cost per thousand impressions (CPM). Compare to Google Ads, billboards, and social media advertising.' },
  { slug: 'wrap-calculator', url: 'calculator', ogImage: 'small_suv.webp', heroImage: 'small_transit_van.webp', h1: 'Instant Wrap Price Calculator', desc: 'Get instant vehicle wrap pricing. 310+ vehicles. Select type, vinyl, coverage. Real installed pricing from Chicago Fleet Wraps.', title: 'Instant Wrap Price Calculator | Chicago Fleet Wraps', category: 'Tools', keywords: 'instant wrap pricing, vehicle wrap price tool, how much does a wrap cost, wrap price by vehicle', content: 'Get instant vehicle wrap pricing. 310+ vehicle types. Select your vehicle, vinyl type, and coverage level. Real installed pricing — not estimates.' },
  { slug: 'beforeafter', url: 'beforeafter', ogImage: 'windy_city_after.jpg', heroImage: 'windy_city_before.jpg', h1: 'Before & After Vehicle Wraps', desc: 'See dramatic before and after vehicle wrap transformations. Real projects from Chicago Fleet Wraps.', title: 'Before & After Vehicle Wraps | Chicago Fleet Wraps', category: 'Tools', keywords: 'vehicle wrap before after, wrap transformation, fleet wrap examples, wrap results', content: 'See dramatic before and after vehicle wrap transformations. Real projects from Chicago Fleet Wraps featuring commercial fleets, color changes, and custom designs.' },
  { slug: 'vinyl', url: 'vinyl', ogImage: 'pink_chrome-3.webp', heroImage: 'dune_buggy_galaxy.jpg', h1: 'Vinyl Wrap Film Guide', desc: 'Compare wrap film specs. Avery Dennison MPI 1105, 3M IJ180-CV3, Supreme Wrapping Film. Durability, conformability, pricing.', title: 'Vinyl Wrap Film Guide | Chicago Fleet Wraps', category: 'Tools', keywords: 'vinyl wrap film guide, wrap film specs, Avery Dennison vs 3M, cast vinyl comparison', content: 'Compare vinyl wrap film specifications. Avery Dennison MPI 1105, 3M IJ180-CV3, Supreme Wrapping Film. Durability ratings, conformability, and professional recommendations.' },

  // === Blog Posts ===
  { slug: 'post-downside-wrapping', url: 'post/what-is-the-downside-of-wrapping-a-car', ogImage: 'sandals_color_change.jpg', heroImage: 'bmw_matte_black.jpg', h1: 'What Is the Downside of Wrapping a Car?', desc: 'An honest look at vehicle wrap trade-offs: durability, quality, surface prep, and washing restrictions. From 24+ years experience.', title: 'What Is the Downside of Wrapping a Car? | Chicago Fleet Wraps', category: 'Blog', keywords: 'downside of wrapping a car, vehicle wrap cons, wrap disadvantages, is wrapping a car worth it', content: 'An honest look at vehicle wrap downsides from 24+ years of experience. Durability limitations, quality differences between cast and calendered vinyl, surface preparation requirements, and washing restrictions.' },
  { slug: 'post-3m-vs-avery', url: 'post/3m-vs-avery-dennison-vehicle-wraps', ogImage: 'wrap_install_closeup.jpg', heroImage: 'corvette_mid_wrap.jpg', h1: '3M vs Avery Dennison Vehicle Wraps', desc: 'Head-to-head comparison of 3M IJ180-CV3 vs Avery Dennison MPI 1105. From a shop that installs both daily.', title: '3M vs Avery Dennison Vehicle Wraps | Chicago Fleet Wraps', category: 'Blog', keywords: '3M vs Avery Dennison, 3M IJ180 vs MPI 1105, best wrap vinyl, wrap material comparison', content: 'Head-to-head comparison of 3M IJ180-CV3 vs Avery Dennison MPI 1105 cast vinyl. Adhesive technology, conformability, durability, and pricing from a shop that installs both daily.' },
  { slug: 'post-fleet-decals', url: 'post/top-benefits-of-custom-decals', ogImage: 'diecut_sheriff_k9.webp', heroImage: '4aces_suv.jpg', h1: 'Top Benefits of Custom Decals for Fleet Vehicles', desc: 'Why fleet decals deliver massive ROI. Cost-effective branding, 24/7 advertising, easy updates. Chicago Fleet Wraps.', title: 'Top Benefits of Custom Decals for Fleet Vehicles | Chicago Fleet Wraps', category: 'Blog', keywords: 'custom fleet decals, vehicle decal benefits, fleet decal ROI, commercial decals', content: 'Why fleet decals deliver massive ROI. Cost-effective branding, 24/7 advertising exposure, easy updates and replacements. Professional fleet decal design and installation.' },
  { slug: 'post-wrap-cost', url: 'post/how-much-does-a-car-wrap-cost', ogImage: 'small_suv.webp', heroImage: 'cfw_van_2.png', h1: 'How Much Does a Car Wrap Cost in Chicago?', desc: 'Real vehicle wrap pricing in Chicago. Sedans, SUVs, cargo vans, sprinters, box trucks. Premium cast vinyl. Chicago Fleet Wraps.', title: 'How Much Does a Car Wrap Cost in Chicago? | Chicago Fleet Wraps', category: 'Blog', keywords: 'car wrap cost Chicago, how much does a wrap cost, vehicle wrap pricing, wrap price by vehicle type', content: 'Real vehicle wrap pricing in Chicago. Sedans from $3,750, SUVs from $3,900, cargo vans from $3,750, sprinters from $4,700, box trucks from $5,000–$10,900. Premium cast vinyl only.' },
  { slug: 'post-3m-vinyl-2025', url: 'post/3m-vinyl-wraps-chicago-fleet', ogImage: 'cfw_van_3.png', heroImage: 'cfw_truck_1.png', h1: '3M Vinyl Wraps: Best Choice for Your Chicago Fleet', desc: 'Why 3M IJ180-CV3 cast vinyl remains the industry standard for fleet graphics. Durability, weather resistance, protection.', title: '3M Vinyl Wraps: Best Choice for Your Chicago Fleet | Chicago Fleet Wraps', category: 'Blog', keywords: '3M vinyl wraps Chicago, 3M IJ180-CV3, 3M fleet wraps, best vinyl for fleet, 3M cast vinyl', content: '3M IJ180-CV3 cast vinyl remains the industry standard for fleet graphics. Extreme durability in Chicago weather, UV resistance, and paint protection.' },

  // === City/Geo Pages ===
  { slug: 'geo-chicago', url: 'chicago', h1: 'Fleet Wraps Chicago, IL', desc: 'Fleet vehicle wraps in Chicago. Cargo vans, box trucks, sprinters. Avery Dennison & 3M certified. Free pickup — (312) 597-1286.', title: 'Fleet Wraps Chicago, IL | Chicago Fleet Wraps', category: 'Cities', city: 'Chicago', keywords: 'fleet wraps Chicago, vehicle wraps Chicago IL, car wraps Chicago, commercial wraps Chicago, wrap shop Chicago' },
  { slug: 'geo-schaumburg', url: 'schaumburg', h1: 'Fleet Wraps Schaumburg, IL', desc: 'Fleet vehicle wraps serving Schaumburg, IL. Free pickup and delivery. Premium cast vinyl. Chicago Fleet Wraps.', title: 'Fleet Wraps Schaumburg, IL | Chicago Fleet Wraps', category: 'Cities', city: 'Schaumburg', keywords: 'fleet wraps Schaumburg, vehicle wraps Schaumburg IL, car wraps Schaumburg, commercial wraps Schaumburg' },
  { slug: 'geo-naperville', url: 'naperville', h1: 'Fleet Wraps Naperville, IL', desc: 'Fleet vehicle wraps serving Naperville, IL. Free pickup and delivery. Premium cast vinyl. Chicago Fleet Wraps.', title: 'Fleet Wraps Naperville, IL | Chicago Fleet Wraps', category: 'Cities', city: 'Naperville', keywords: 'fleet wraps Naperville, vehicle wraps Naperville IL, car wraps Naperville, commercial wraps Naperville' },
  { slug: 'geo-aurora', url: 'aurora', h1: 'Fleet Wraps Aurora, IL', desc: 'Fleet vehicle wraps serving Aurora, IL. Free pickup and delivery. Premium cast vinyl. Chicago Fleet Wraps.', title: 'Fleet Wraps Aurora, IL | Chicago Fleet Wraps', category: 'Cities', city: 'Aurora', keywords: 'fleet wraps Aurora, vehicle wraps Aurora IL, car wraps Aurora, commercial wraps Aurora' },
  { slug: 'geo-elgin', url: 'elgin', h1: 'Fleet Wraps Elgin, IL', desc: 'Fleet vehicle wraps serving Elgin, IL. Free pickup and delivery. Premium cast vinyl. Chicago Fleet Wraps.', title: 'Fleet Wraps Elgin, IL | Chicago Fleet Wraps', category: 'Cities', city: 'Elgin', keywords: 'fleet wraps Elgin, vehicle wraps Elgin IL, car wraps Elgin, commercial wraps Elgin' },
  { slug: 'geo-joliet', url: 'joliet', h1: 'Fleet Wraps Joliet, IL', desc: 'Fleet vehicle wraps serving Joliet, IL. Free pickup and delivery. Premium cast vinyl. Chicago Fleet Wraps.', title: 'Fleet Wraps Joliet, IL | Chicago Fleet Wraps', category: 'Cities', city: 'Joliet', keywords: 'fleet wraps Joliet, vehicle wraps Joliet IL, car wraps Joliet, commercial wraps Joliet' },
  { slug: 'geo-evanston', url: 'evanston', h1: 'Fleet Wraps Evanston, IL', desc: 'Fleet vehicle wraps serving Evanston, IL. Free pickup and delivery. Premium cast vinyl. Chicago Fleet Wraps.', title: 'Fleet Wraps Evanston, IL | Chicago Fleet Wraps', category: 'Cities', city: 'Evanston', keywords: 'fleet wraps Evanston, vehicle wraps Evanston IL, car wraps Evanston, commercial wraps Evanston' },
  { slug: 'geo-skokie', url: 'skokie', h1: 'Fleet Wraps Skokie, IL', desc: 'Fleet vehicle wraps serving Skokie, IL. Free pickup and delivery. Premium cast vinyl. Chicago Fleet Wraps.', title: 'Fleet Wraps Skokie, IL | Chicago Fleet Wraps', category: 'Cities', city: 'Skokie', keywords: 'fleet wraps Skokie, vehicle wraps Skokie IL, car wraps Skokie, commercial wraps Skokie' },
  { slug: 'geo-oak-park', url: 'oak-park', h1: 'Fleet Wraps Oak Park, IL', desc: 'Fleet vehicle wraps serving Oak Park, IL. Free pickup and delivery. Premium cast vinyl. Chicago Fleet Wraps.', title: 'Fleet Wraps Oak Park, IL | Chicago Fleet Wraps', category: 'Cities', city: 'Oak Park', keywords: 'fleet wraps Oak Park, vehicle wraps Oak Park IL, car wraps Oak Park, commercial wraps Oak Park' },
  { slug: 'geo-wilmette', url: 'wilmette', h1: 'Fleet Wraps Wilmette, IL', desc: 'Fleet vehicle wraps serving Wilmette, IL. Free pickup and delivery. Premium cast vinyl. Chicago Fleet Wraps.', title: 'Fleet Wraps Wilmette, IL | Chicago Fleet Wraps', category: 'Cities', city: 'Wilmette', keywords: 'fleet wraps Wilmette, vehicle wraps Wilmette IL, car wraps Wilmette, commercial wraps Wilmette' },
  // Extended city pages
  { slug: 'geo-arlington-heights', url: 'arlington-heights', h1: 'Fleet Wraps Arlington Heights, IL', desc: 'Fleet vehicle wraps serving Arlington Heights, IL. Free pickup and delivery. Premium cast vinyl.', title: 'Fleet Wraps Arlington Heights, IL | Chicago Fleet Wraps', category: 'Cities', city: 'Arlington Heights', keywords: 'fleet wraps Arlington Heights, vehicle wraps Arlington Heights IL, car wraps Arlington Heights' },
  { slug: 'geo-des-plaines', url: 'des-plaines', h1: 'Fleet Wraps Des Plaines, IL', desc: 'Fleet vehicle wraps serving Des Plaines, IL. Free pickup and delivery. Premium cast vinyl.', title: 'Fleet Wraps Des Plaines, IL | Chicago Fleet Wraps', category: 'Cities', city: 'Des Plaines', keywords: 'fleet wraps Des Plaines, vehicle wraps Des Plaines IL, car wraps Des Plaines' },
  { slug: 'geo-palatine', url: 'palatine', h1: 'Fleet Wraps Palatine, IL', desc: 'Fleet vehicle wraps serving Palatine, IL. Free pickup and delivery. Premium cast vinyl.', title: 'Fleet Wraps Palatine, IL | Chicago Fleet Wraps', category: 'Cities', city: 'Palatine', keywords: 'fleet wraps Palatine, vehicle wraps Palatine IL, car wraps Palatine' },
  { slug: 'geo-wheaton', url: 'wheaton', h1: 'Fleet Wraps Wheaton, IL', desc: 'Fleet vehicle wraps serving Wheaton, IL. Free pickup and delivery. Premium cast vinyl.', title: 'Fleet Wraps Wheaton, IL | Chicago Fleet Wraps', category: 'Cities', city: 'Wheaton', keywords: 'fleet wraps Wheaton, vehicle wraps Wheaton IL, car wraps Wheaton' },
  { slug: 'geo-downers-grove', url: 'downers-grove', h1: 'Fleet Wraps Downers Grove, IL', desc: 'Fleet vehicle wraps serving Downers Grove, IL. Free pickup and delivery. Premium cast vinyl.', title: 'Fleet Wraps Downers Grove, IL | Chicago Fleet Wraps', category: 'Cities', city: 'Downers Grove', keywords: 'fleet wraps Downers Grove, vehicle wraps Downers Grove IL, car wraps Downers Grove' },
  { slug: 'geo-lombard', url: 'lombard', h1: 'Fleet Wraps Lombard, IL', desc: 'Fleet vehicle wraps serving Lombard, IL. Free pickup and delivery. Premium cast vinyl.', title: 'Fleet Wraps Lombard, IL | Chicago Fleet Wraps', category: 'Cities', city: 'Lombard', keywords: 'fleet wraps Lombard, vehicle wraps Lombard IL, car wraps Lombard' },
  { slug: 'geo-elmhurst', url: 'elmhurst', h1: 'Fleet Wraps Elmhurst, IL', desc: 'Fleet vehicle wraps serving Elmhurst, IL. Free pickup and delivery. Premium cast vinyl.', title: 'Fleet Wraps Elmhurst, IL | Chicago Fleet Wraps', category: 'Cities', city: 'Elmhurst', keywords: 'fleet wraps Elmhurst, vehicle wraps Elmhurst IL, car wraps Elmhurst' },
  { slug: 'geo-tinley-park', url: 'tinley-park', h1: 'Fleet Wraps Tinley Park, IL', desc: 'Fleet vehicle wraps serving Tinley Park, IL. Free pickup and delivery. Premium cast vinyl.', title: 'Fleet Wraps Tinley Park, IL | Chicago Fleet Wraps', category: 'Cities', city: 'Tinley Park', keywords: 'fleet wraps Tinley Park, vehicle wraps Tinley Park IL, car wraps Tinley Park' },
  { slug: 'geo-orland-park', url: 'orland-park', h1: 'Fleet Wraps Orland Park, IL', desc: 'Fleet vehicle wraps serving Orland Park, IL. Free pickup and delivery. Premium cast vinyl.', title: 'Fleet Wraps Orland Park, IL | Chicago Fleet Wraps', category: 'Cities', city: 'Orland Park', keywords: 'fleet wraps Orland Park, vehicle wraps Orland Park IL, car wraps Orland Park' },
  { slug: 'geo-bolingbrook', url: 'bolingbrook', h1: 'Fleet Wraps Bolingbrook, IL', desc: 'Fleet vehicle wraps serving Bolingbrook, IL. Free pickup and delivery. Premium cast vinyl.', title: 'Fleet Wraps Bolingbrook, IL | Chicago Fleet Wraps', category: 'Cities', city: 'Bolingbrook', keywords: 'fleet wraps Bolingbrook, vehicle wraps Bolingbrook IL, car wraps Bolingbrook' },
];

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function generateCityContent(city) {
  return `Chicago Fleet Wraps provides professional fleet vehicle wrap services to businesses in ${city}, IL and surrounding areas. Cargo vans, box trucks, sprinter vans, and pickup trucks. Avery Dennison MPI 1105 and 3M IJ180-CV3 premium cast vinyl. Free pickup and delivery. 2-year workmanship warranty. Fleet discounts available for 3+ vehicles.`;
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

  const breadcrumbItems = [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE_URL}/` }
  ];
  if (page.category === 'Cities') {
    breadcrumbItems.push({ "@type": "ListItem", "position": 2, "name": "Service Area", "item": `${BASE_URL}/servicearea/` });
    breadcrumbItems.push({ "@type": "ListItem", "position": 3, "name": page.h1, "item": canonical });
  } else if (page.category === 'Blog') {
    breadcrumbItems.push({ "@type": "ListItem", "position": 2, "name": "Blog", "item": `${BASE_URL}/blog/` });
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
<meta property="og:image" content="${BASE_URL}/images/cfw_truck_1.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="Chicago Fleet Wraps">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(page.title)}">
<meta name="twitter:description" content="${escapeHtml(page.desc)}">
<meta name="twitter:image" content="${BASE_URL}/images/cfw_truck_1.png">
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
<a href="/commercial/">Commercial</a>
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
<a href="/commercial/">Commercial Wraps</a>
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
<p class="lead speakable">${escapeHtml(content)}</p>

<div class="trust">
<span>📅 <strong>24+ Years</strong> Experience</span>
<span>🏆 <strong>9,400+</strong> Vehicles Wrapped</span>
<span>✅ <strong>Avery Dennison & 3M</strong> Certified</span>
<span>📍 <strong>Chicago, IL</strong></span>
<span>🚐 <strong>Free Fleet Pickup</strong></span>
</div>

<div class="cta-bar">
<a href="/estimate/" class="btn btn-primary">Get Free Estimate →</a>
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
<a href="/commercial/">Commercial Fleets</a>
<a href="/boxtruck/">Box Trucks</a>
<a href="/sprinter/">Sprinter Vans</a>
<a href="/transit/">Transit Vans</a>
<a href="/colorchange/">Color Change</a>
<a href="/ev-wraps/">EV Wraps</a>
<a href="/wallwraps/">Wall Graphics</a>
<a href="/removal/">Wrap Removal</a>
</div>
<div>
<h4>Industries</h4>
<a href="/hvac/">HVAC</a>
<a href="/plumber/">Plumbing</a>
<a href="/electric/">Electrical</a>
<a href="/contractor/">Contractors</a>
<a href="/delivery/">Delivery</a>
<a href="/foodtruck/">Food Trucks</a>
<a href="/landscape/">Landscaping</a>
<a href="/boating/">Boating</a>
<a href="/moving/">Moving Companies</a>
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

<script>
if (window.history && window.history.replaceState) {
  window.addEventListener('load', function() {
    var isBot = /bot|crawl|spider|slurp|googlebot|bingbot|yandex/i.test(navigator.userAgent);
    if (!isBot) {
      var currentPath = window.location.pathname;
      window.location.href = '/?route=' + encodeURIComponent(currentPath);
    }
  });
}
</script>
<script src="/js/gmb-live.js" defer></script>
</body>
</html>`;
}

// Main execution
console.log('🚀 Generating static HTML pages...');
let count = 0;

for (const page of PAGES) {
  const dir = path.join(PUBLIC_DIR, page.url);
  fs.mkdirSync(dir, { recursive: true });
  
  const filePath = path.join(dir, 'index.html');
  const html = generatePage(page);
  fs.writeFileSync(filePath, html, 'utf-8');
  count++;
  console.log(`  ✓ /${page.url}/`);
}

console.log(`\n✅ Generated ${count} static HTML pages`);
