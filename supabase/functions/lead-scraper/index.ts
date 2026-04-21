// CFW Lead Scraper — Multi-source, geo-fenced to active metro
// Runtime: Supabase Edge Functions (Deno)

import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const UA = "Mozilla/5.0 CFW-LeadScraper/1.0";

function getClient() {
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

const DOT_NAME_BOOST: Record<string, number> = {
  HVAC: 30, HEATING: 28, COOLING: 26, "AIR COND": 26, REFRIG: 22,
  PLUMB: 30, ELECTRIC: 24, MECHANICAL: 22,
  MOVER: 35, MOVING: 35, RELOCATION: 30,
  LANDSCAP: 25, LAWN: 18, SNOW: 15, PEST: 22, EXTERM: 22,
  CLEAN: 18, JANIT: 20,
  ROOFING: 22, CONCRETE: 18, MASON: 18, PAVING: 22,
  CONSTRUCT: 15, CONTRACT: 12,
  DELIVER: 20, COURIER: 25, EXPRESS: 15, LOGISTICS: 12,
  TOWING: 25, "TOW ": 25, AUTO: 12,
  FLEET: 15, TRUCK: 10, TRANSPORT: 10,
  CATER: 20, FOOD: 15,
  WASTE: 22, DISPOSAL: 22, RECYCL: 20, SCAVENG: 22,
  FENCE: 18, GLASS: 15, SIDING: 18, GUTTER: 18,
  SECURITY: 15, LOCK: 18, CHIMNEY: 18, PAINT: 15,
};
const DOT_LONG_HAUL = ["FREIGHT LINES", "INTERMODAL", "OTR", "EXPEDITED"];
const LICENSE_BASE: Record<string, number> = {
  "Towing - Tow Truck": 95, "Towing - Storage Lot": 92,
  "Motor Vehicle Services License": 88, "Commercial Garage": 85,
  "Mobile Food License": 85, "Filling Station": 78,
  "Caterer's Liquor License": 75, "Wholesale Food Establishment": 75,
  "Peddler License": 68, "Manufacturing Establishments": 62,
  "Regulated Business License": 58, "Valet Parking Operator": 55,
  "Retail Food Establishment": 48, "Package Goods": 45,
  "Limited Business License": 40,
};
const BOOST_KW: Record<string, number> = {
  plumb: 30, hvac: 30, heat: 25, cool: 25, refriger: 25,
  electric: 25, roof: 25, mason: 20, concrete: 20, paving: 25,
  landscap: 28, lawn: 20, tree: 22, snow: 20, pest: 25, exterm: 25,
  clean: 18, janit: 20, deliver: 28, courier: 28, moving: 30, mover: 35,
  haul: 25, tow: 22, transport: 22, catering: 22, "food truck": 30,
  construct: 22, paint: 20, handyman: 18, repair: 15,
  fleet: 40, trucking: 35, logistics: 30, freight: 30,
  waste: 22, recycl: 22, disposal: 25, scavenger: 25,
};

// ========== INDUSTRY CATEGORIES ==========
// TIER A (+35): HVAC, Plumbing, Electrical, Movers
// TIER B (+25): Landscaping, Roofing, Pest, Delivery
// TIER C (+15): Dealers, Towing, Cleaning, Food, Catering, Security, Waste, Construction, Medical
function categorizeLead(name: string, extra: string = ""): { category: string; tier: "A"|"B"|"C"; points: number } {
  const h = (name + " " + extra).toUpperCase();
  if (/\b(HVAC|HEATING|COOLING|AIR COND|REFRIG|FURNACE)\b/.test(h)) return { category: "hvac", tier: "A", points: 35 };
  if (/\b(PLUMB|PLUMBER|SEWER|DRAIN|WATER HEATER)\b/.test(h)) return { category: "plumbing", tier: "A", points: 35 };
  if (/\b(ELECTRIC|ELECTRICIAN|WIRING)\b/.test(h)) return { category: "electrical", tier: "A", points: 35 };
  if (/\b(MOVER|MOVING|RELOCATION|VAN LINES)\b/.test(h)) return { category: "moving", tier: "A", points: 35 };
  if (/\b(LANDSCAP|LAWN|TREE|SNOW|IRRIG|GARDEN|HORTICULT)\b/.test(h)) return { category: "landscaping", tier: "B", points: 25 };
  if (/\b(ROOFING|ROOFER|SHINGLE|GUTTER)\b/.test(h)) return { category: "roofing", tier: "B", points: 25 };
  if (/\b(PEST|EXTERM|TERMITE|RODENT)\b/.test(h)) return { category: "pest_control", tier: "B", points: 25 };
  if (/\b(COURIER|DELIVERY|MESSENGER|LAST MILE)\b/.test(h)) return { category: "delivery", tier: "B", points: 25 };
  if (/\b(AUTO|DEALERSHIP|MOTORS|NISSAN|FORD|TOYOTA|HONDA|CHEVROLET|DODGE|VOLKSWAGEN|INFINITI|CADILLAC|BMW|MERCEDES|LEXUS|AUDI|ACURA|SUBARU)\b/.test(h)) return { category: "auto_dealer", tier: "C", points: 15 };
  if (/\b(TOWING|TOW TRUCK|COMMERCIAL GARAGE)\b/.test(h)) return { category: "towing", tier: "C", points: 15 };
  if (/\b(CLEAN|JANIT|MAID|SANIT)\b/.test(h)) return { category: "cleaning", tier: "C", points: 15 };
  if (/\b(FOOD TRUCK|CATER|MOBILE FOOD|CONCESSION)\b/.test(h)) return { category: "food_service", tier: "C", points: 15 };
  if (/\b(SECURITY|ALARM|LOCKSMITH|GUARD)\b/.test(h)) return { category: "security", tier: "C", points: 15 };
  if (/\b(WASTE|RECYCL|DISPOSAL|SCAVENG|SANITATION)\b/.test(h)) return { category: "waste", tier: "C", points: 15 };
  if (/\b(CONSTRUCT|CONCRETE|MASON|PAVING|PAINT|FENCE|SIDING|GLASS)\b/.test(h)) return { category: "construction_trades", tier: "C", points: 15 };
  if (/\b(MEDICAL|HOME HEALTH|MOBILE CARE|PHARMACY)\b/.test(h)) return { category: "medical", tier: "C", points: 15 };
  return { category: "other", tier: "C", points: 10 };
}

// PHASE 1 FIT SCORE: should we spend Apollo/Hunter credits on this lead?
// Per Roy's "soft gates" rule: failed gate = cold tier, still enrichable on override.
function scoreDot(row: any): [number, string] {
  const pu = parseInt(row.power_units || "0");
  const name = (row.legal_name || "").toUpperCase();
  const classdef = (row.classdef || "").toUpperCase();
  let score = 0;
  const bd: string[] = [];
  const cat = categorizeLead(name, classdef);
  score += cat.points;
  bd.push(`tier_${cat.tier}:${cat.category}+${cat.points}`);
  if (pu >= 6 && pu <= 25) { score += 25; bd.push("+25(sweet_6_25)"); }
  else if (pu >= 3 && pu <= 5) { score += 15; bd.push("+15(small_3_5)"); }
  else if (pu >= 26 && pu <= 50) { score += 15; bd.push("+15(mid_26_50)"); }
  else if (pu >= 51 && pu <= 200) { score += 5; bd.push("+5(large)"); }
  else if (pu < 3) { score -= 15; bd.push("-15(solo<3)"); }
  else if (pu > 500) { score -= 15; bd.push("-15(enterprise)"); }
  if (classdef.includes("PRIVATE PROPERTY") && !classdef.includes("AUTHORIZED")) { score += 15; bd.push("+15(service_fleet)"); }
  else if (classdef.includes("PRIVATE PROPERTY")) { score += 10; bd.push("+10(mixed)"); }
  for (const kw of DOT_LONG_HAUL) {
    if (name.includes(kw)) { score -= 20; bd.push(`-20(${kw.toLowerCase()})`); break; }
  }
  return [Math.max(0, Math.min(100, score)), bd.join(",")];
}

function scoreLicense(row: any): [number, string] {
  const desc = row.license_description || "";
  const activity = (row.business_activity || "").toLowerCase();
  const dba = (row.doing_business_as_name || row.legal_name || "").toLowerCase();
  const hay = `${dba} ${activity} ${desc}`.toLowerCase();
  let score = 0;
  const bd: string[] = [];
  const cat = categorizeLead(dba + " " + activity, desc);
  score += cat.points;
  bd.push(`tier_${cat.tier}:${cat.category}+${cat.points}`);
  // License-type multipliers (fleet-obvious licenses get a boost on top of industry tier)
  const licBoost = LICENSE_BASE[desc] ?? 0;
  if (licBoost >= 85) { score += 25; bd.push(`+25(fleet_license:${desc})`); }
  else if (licBoost >= 60) { score += 15; bd.push(`+15(lic:${desc})`); }
  else if (licBoost >= 40) { score += 8; bd.push(`+8(lic:${desc})`); }
  // New license in last 30 days implies active growth
  score += 10;
  bd.push("+10(new_license<30d)");
  return [Math.max(0, Math.min(100, score)), bd.join(",")];
}

async function getMetro(sb: any, slug: string) {
  const { data, error } = await sb.from("metro_regions").select("*").eq("slug", slug).single();
  if (error || !data) throw new Error(`Metro ${slug} not found`);
  if (!data.activated) throw new Error(`Metro ${slug} not activated`);
  return data;
}

function inMetro(zip: string, state: string, city: string, metro: any): boolean {
  const st = (state || "").toUpperCase().trim();
  if (!metro.states_included.includes(st)) return false;
  const zp = (zip || "").trim().slice(0, 3);
  const prefixes = metro.zip_prefixes?.[st] || [];
  const homeState = metro.states_included[0]; // first state = home state (IL for chicago)

  // Border states (not home state): MUST match zip prefix. No city-name fallback.
  // This prevents "BROOKFIELD, WI" matching "BROOKFIELD" in Chicago's core_cities.
  if (st !== homeState) {
    return !!(zp && prefixes.includes(zp));
  }

  // Home state: zip prefix match OR core_cities match (city names don't collide within IL)
  if (zp && prefixes.includes(zp)) return true;
  const ct = (city || "").toUpperCase().trim();
  if (ct && metro.core_cities?.includes(ct)) return true;
  return false;
}

async function runDotScraper(sb: any, metro: any) {
  const { data: existingRows } = await sb.from("jobs").select("source_id").eq("source", "dot_safer").eq("metro_slug", metro.slug);
  const existing = new Set((existingRows || []).map((r: any) => r.source_id));
  let fetched = 0, scored = 0;
  const newJobs: any[] = [];

  for (const state of metro.states_included) {
    let offset = 0;
    for (let p = 0; p < 30; p++) {
      const where = `phy_state='${state}' AND power_units::number BETWEEN 2 AND 500 AND status_code='A'`;
      const qs = new URLSearchParams({
        "$where": where, "$limit": "1000", "$offset": String(offset),
        "$order": "power_units::number DESC",
      });
      const url = `https://data.transportation.gov/resource/az4n-8mr2.json?${qs}`;
      const r = await fetch(url, { headers: { "User-Agent": UA } });
      if (!r.ok) break;
      const batch: any[] = await r.json();
      if (!batch || batch.length === 0) break;
      fetched += batch.length;

      for (const row of batch) {
        if (!inMetro(row.phy_zip || "", row.phy_state || "", row.phy_city || "", metro)) continue;
        const dot = row.dot_number;
        if (!dot || existing.has(dot)) continue;
        const [fitScore, bd] = scoreDot(row);
        if (fitScore < 20) continue; // soft gate: below 20, not worth storing
        scored++;
        const pu = parseInt(row.power_units || "0");
        const addr = `${row.phy_street || ""}, ${row.phy_city || ""}, ${row.phy_state || ""} ${row.phy_zip || ""}`.trim().replace(/^,|,$/g, "");
        const cat = categorizeLead((row.legal_name || "").toUpperCase(), (row.classdef || "").toUpperCase());
        newJobs.push({
          customer_name: (row.legal_name || "").slice(0, 120),
          source: "dot_safer", source_id: dot,
          stage: "cold_outreach", status: "prospect",
          // Phase 1 — all new leads start uncontacted; Phase 2 will set hot/warm/cold post-enrichment
          priority: "uncontacted",
          score: fitScore, score_breakdown: bd, // legacy column kept for back-compat
          fit_score: fitScore, fit_breakdown: bd,
          industry_category: cat.category, tier: cat.tier,
          message: `DOT FLEET: ${pu} power units — ${(row.classdef || "").slice(0, 60)} — ${addr}`,
          notes: `USDOT #${dot} | ${pu} trucks`,
          job_type: "dot_fleet", fleet_size: pu,
          dot_number: dot, address: row.phy_street,
          city: row.phy_city, state: row.phy_state, zip: row.phy_zip,
          industry: row.classdef, metro_slug: metro.slug,
        });
        existing.add(dot);
      }
      if (batch.length < 1000) break;
      offset += 1000;
      await new Promise((r) => setTimeout(r, 150));
    }
  }

  let inserted = 0;
  for (let i = 0; i < newJobs.length; i += 100) {
    const { data } = await sb.from("jobs").insert(newJobs.slice(i, i + 100)).select("id");
    inserted += data?.length || 0;
  }
  return { fetched, scored, inserted };
}

async function runLicenseScraper(sb: any, metro: any, daysBack = 30) {
  if (metro.slug !== "chicago") return { fetched: 0, scored: 0, inserted: 0 };
  const cutoff = new Date(Date.now() - daysBack * 86400000).toISOString().slice(0, 19);
  const where = `application_type='ISSUE' AND date_issued > '${cutoff}'`;
  const qs = new URLSearchParams({ "$where": where, "$order": "date_issued DESC", "$limit": "1500" });
  const url = `https://data.cityofchicago.org/resource/r5kz-chrr.json?${qs}`;
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) return { fetched: 0, scored: 0, inserted: 0 };
  const rows: any[] = await r.json();
  const fetched = rows.length;

  const { data: existingRows } = await sb.from("jobs").select("source_id").eq("source", "business_license").eq("metro_slug", metro.slug);
  const existing = new Set((existingRows || []).map((x: any) => x.source_id));
  const newJobs: any[] = [];
  let scored = 0;
  for (const lic of rows) {
    const lid = lic.license_number || lic.license_id;
    if (!lid || existing.has(lid)) continue;
    const dba = lic.doing_business_as_name || lic.legal_name || "";
    const [fitScore, bd] = scoreLicense(lic);
    if (fitScore < 20) continue; // soft gate: skip fit<20
    const city = (lic.city || "").toUpperCase();
    if (city && !metro.core_cities.includes(city) && !city.includes("CHICAGO")) continue;
    scored++;
    const addr = `${lic.address || ""}, ${lic.city || ""}, ${lic.state || "IL"} ${lic.zip_code || ""}`.trim().replace(/^,|,$/g, "");
    const cat = categorizeLead(dba + " " + (lic.business_activity || ""), lic.license_description || "");
    newJobs.push({
      customer_name: dba.slice(0, 120),
      source: "business_license", source_id: lid,
      stage: "cold_outreach", status: "prospect",
      priority: "uncontacted",
      score: fitScore, score_breakdown: bd,
      fit_score: fitScore, fit_breakdown: bd,
      industry_category: cat.category, tier: cat.tier,
      message: `NEW BIZ LICENSE: ${lic.license_description} — ${lic.business_activity || ""} — ${addr}`,
      notes: `License #${lid} issued ${(lic.date_issued || "").slice(0, 10)}`,
      job_type: "business_license", fleet_size: 1,
      license_number: lid, address: lic.address,
      city: lic.city, state: lic.state || "IL", zip: lic.zip_code,
      industry: lic.business_activity || lic.license_description, metro_slug: metro.slug,
    });
    existing.add(lid);
  }
  let inserted = 0;
  for (let i = 0; i < newJobs.length; i += 100) {
    const { data } = await sb.from("jobs").insert(newJobs.slice(i, i + 100)).select("id");
    inserted += data?.length || 0;
  }
  return { fetched, scored, inserted };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  try {
    const body = await req.json().catch(() => ({}));
    const metro_slug = body.metro_slug || "chicago";
    const sources: string[] = body.sources || ["dot", "licenses"];
    const days_back = body.days_back || 30;

    const sb = getClient();
    const metro = await getMetro(sb, metro_slug);
    const results: any = { metro: metro.slug, started: new Date().toISOString() };

    if (sources.includes("dot")) results.dot = await runDotScraper(sb, metro);
    if (sources.includes("licenses")) results.licenses = await runLicenseScraper(sb, metro, days_back);

    results.finished = new Date().toISOString();
    results.total_new_leads = (results.dot?.inserted || 0) + (results.licenses?.inserted || 0);

    return new Response(JSON.stringify(results), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
