// supabase/functions/lead-scraper/index.ts
//
// CFW Lead Scraper — Multi-source, geo-fenced to active metro
// Sources: DOT SAFER Motor Carrier Census + Chicago Data Portal Business Licenses
//
// Called with: { metro_slug: "chicago", sources?: ["dot","licenses"], days_back?: 30 }
// Default: pulls both sources for Chicago, last 30 days, dedupes by source_id
//
// Deploy: supabase functions deploy lead-scraper --no-verify-jwt
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
};
const sb = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false, autoRefreshToken: false } });
const UA = "Mozilla/5.0 CFW-LeadScraper/1.0";

// ---------- Scoring config ----------
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
  UTIL: 18, ENERGY: 15, SOLAR: 20,
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
  "Limited Business License": 40, "Shared Kitchen User (Long Term)": 38,
  "Pop-Up Retail User": 28, "Secondhand Dealer": 25,
  "Tavern": 22, "Tobacco": 20, "Outdoor Patio": 18,
};
const BOOST_KW: Record<string, number> = {
  plumb: 30, hvac: 30, heat: 25, cool: 25, refriger: 25,
  electric: 25, roof: 25, mason: 20, concrete: 20, paving: 25,
  landscap: 28, lawn: 20, tree: 22, snow: 20, pest: 25, exterm: 25,
  clean: 18, janit: 20, deliver: 28, courier: 28, moving: 30, mover: 35,
  haul: 25, tow: 22, transport: 22, catering: 22, "food truck": 30,
  construct: 22, contract: 18, paint: 20, handyman: 18, repair: 15,
  fleet: 40, trucking: 35, logistics: 30, freight: 30,
  waste: 22, recycl: 22, disposal: 25, scavenger: 25,
  chimney: 20, gutter: 22, siding: 22, locksmith: 22, fencing: 20,
};

function scoreDotFleet(row: any): [number, string] {
  const pu = parseInt(row.power_units || "0");
  const name = (row.legal_name || "").toUpperCase();
  const classdef = (row.classdef || "").toUpperCase();
  let score = 25;
  const bd: string[] = ["base=25"];

  if (pu >= 2 && pu <= 5) { score += 15; bd.push("+15(sm_fleet)"); }
  else if (pu <= 15) { score += 25; bd.push("+25(mid_fleet)"); }
  else if (pu <= 50) { score += 35; bd.push("+35(good_fleet)"); }
  else if (pu <= 200) { score += 30; bd.push("+30(large)"); }
  else { score += 10; bd.push("+10(enterprise)"); }

  if (classdef.includes("PRIVATE PROPERTY") && !classdef.includes("AUTHORIZED")) {
    score += 25; bd.push("+25(service_fleet)");
  } else if (classdef.includes("PRIVATE PROPERTY")) {
    score += 18; bd.push("+18(mixed_private)");
  }

  for (const [kw, boost] of Object.entries(DOT_NAME_BOOST)) {
    if (name.includes(kw)) { score += boost; bd.push(`+${boost}(${kw.toLowerCase().trim()})`); break; }
  }
  for (const kw of DOT_LONG_HAUL) {
    if (name.includes(kw)) { score -= 15; bd.push(`-15(${kw.toLowerCase()})`); break; }
  }

  return [Math.max(0, Math.min(100, score)), bd.join(",")];
}

function scoreLicense(row: any): [number, string] {
  const desc = row.license_description || "";
  const activity = (row.business_activity || "").toLowerCase();
  const dba = (row.doing_business_as_name || row.legal_name || "").toLowerCase();
  const hay = `${dba} ${activity} ${desc}`.toLowerCase();
  let score = LICENSE_BASE[desc] ?? 15;
  const bd: string[] = [`base:${desc}=${score}`];

  for (const [kw, b] of Object.entries(BOOST_KW)) {
    if (hay.includes(kw)) { score += b; bd.push(`+${b}(${kw})`); break; }
  }
  return [Math.max(0, Math.min(100, score)), bd.join(",")];
}

// ---------- Metro geo-fence ----------
async function getMetro(slug: string) {
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
  if (zp && prefixes.includes(zp)) return true;
  const ct = (city || "").toUpperCase().trim();
  if (ct && metro.core_cities?.includes(ct)) return true;
  return false;
}

// ---------- DOT SAFER scraper ----------
async function scrapeDotForState(state: string, metro: any): Promise<any[]> {
  const results: any[] = [];
  let offset = 0;
  const pageSize = 1000;
  const maxPages = 50; // safety cap

  for (let p = 0; p < maxPages; p++) {
    const where = `phy_state='${state}' AND power_units::number BETWEEN 2 AND 500 AND status_code='A'`;
    const qs = new URLSearchParams({
      "$where": where,
      "$limit": String(pageSize),
      "$offset": String(offset),
      "$order": "power_units::number DESC",
    });
    const url = `https://data.transportation.gov/resource/az4n-8mr2.json?${qs}`;
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    if (!r.ok) break;
    const batch = await r.json();
    if (!batch || batch.length === 0) break;

    // Geo-filter in place to reduce memory
    for (const row of batch) {
      if (inMetro(row.phy_zip || "", row.phy_state || "", row.phy_city || "", metro)) {
        results.push(row);
      }
    }

    if (batch.length < pageSize) break;
    offset += pageSize;
    await new Promise(r => setTimeout(r, 200));
  }
  return results;
}

async function runDotScraper(metro: any): Promise<{ fetched: number; scored: number; inserted: number }> {
  // Existing source_ids for dedup
  const { data: existingRows } = await sb.from("jobs").select("source_id").eq("source", "dot_safer").eq("metro_slug", metro.slug);
  const existing = new Set((existingRows || []).map((r: any) => r.source_id));

  let fetched = 0;
  let scored = 0;
  const newJobs: any[] = [];

  for (const state of metro.states_included) {
    const rows = await scrapeDotForState(state, metro);
    fetched += rows.length;
    for (const r of rows) {
      const dot = r.dot_number;
      if (!dot || existing.has(dot)) continue;
      const [score, bd] = scoreDotFleet(r);
      if (score < 40) continue;
      scored++;

      const pu = parseInt(r.power_units || "0");
      const addr = `${r.phy_street || ""}, ${r.phy_city || ""}, ${r.phy_state || ""} ${r.phy_zip || ""}`.trim().replace(/^,|,$/g, "");
      newJobs.push({
        customer_name: (r.legal_name || "").slice(0, 120),
        source: "dot_safer",
        source_id: dot,
        stage: "cold_outreach",
        status: "prospect",
        priority: score >= 75 ? "hot" : score >= 55 ? "warm" : "cool",
        score,
        score_breakdown: bd,
        message: `DOT FLEET: ${pu} power units — ${(r.classdef || "").slice(0, 60)} — ${addr}`,
        notes: `USDOT #${dot} | ${pu} trucks, ${r.total_intrastate_drivers || 0} drivers`,
        job_type: "dot_fleet",
        fleet_size: pu,
        dot_number: dot,
        address: r.phy_street,
        city: r.phy_city,
        state: r.phy_state,
        zip: r.phy_zip,
        industry: r.classdef,
        metro_slug: metro.slug,
      });
    }
  }

  // Batch insert
  let inserted = 0;
  for (let i = 0; i < newJobs.length; i += 100) {
    const batch = newJobs.slice(i, i + 100);
    const { data, error } = await sb.from("jobs").insert(batch).select("id");
    if (error) continue;
    inserted += data?.length || 0;
  }

  return { fetched, scored, inserted };
}

// ---------- Chicago Business Licenses scraper ----------
async function runLicenseScraper(metro: any, daysBack = 30): Promise<{ fetched: number; scored: number; inserted: number }> {
  // Only runs for Chicago (data source is Chicago-specific)
  if (metro.slug !== "chicago") return { fetched: 0, scored: 0, inserted: 0 };

  const cutoff = new Date(Date.now() - daysBack * 86400000).toISOString().slice(0, 19);
  const where = `application_type='ISSUE' AND date_issued > '${cutoff}'`;
  const qs = new URLSearchParams({
    "$where": where,
    "$order": "date_issued DESC",
    "$limit": "1500",
  });
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
    const [score, bd] = scoreLicense(lic);
    if (score < 35) continue;

    // Geo-filter — Chicago license data is already IL but verify metro match
    const city = (lic.city || "").toUpperCase();
    if (city && !metro.core_cities.includes(city) && !city.includes("CHICAGO")) continue;

    scored++;
    const addr = `${lic.address || ""}, ${lic.city || ""}, ${lic.state || "IL"} ${lic.zip_code || ""}`.trim().replace(/^,|,$/g, "");
    newJobs.push({
      customer_name: dba.slice(0, 120),
      source: "business_license",
      source_id: lid,
      stage: "cold_outreach",
      status: "prospect",
      priority: score >= 75 ? "hot" : score >= 55 ? "warm" : "cool",
      score,
      score_breakdown: bd,
      message: `NEW BIZ LICENSE: ${lic.license_description} — ${lic.business_activity || "see license"} — ${addr}`,
      notes: `License #${lid} issued ${(lic.date_issued || "").slice(0, 10)}`,
      job_type: "business_license",
      fleet_size: 1,
      license_number: lid,
      address: lic.address,
      city: lic.city,
      state: lic.state || "IL",
      zip: lic.zip_code,
      industry: lic.business_activity || lic.license_description,
      metro_slug: metro.slug,
    });
  }

  let inserted = 0;
  for (let i = 0; i < newJobs.length; i += 100) {
    const batch = newJobs.slice(i, i + 100);
    const { data, error } = await sb.from("jobs").insert(batch).select("id");
    if (error) continue;
    inserted += data?.length || 0;
  }

  return { fetched, scored, inserted };
}

// ---------- MAIN ----------
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  try {
    const body = await req.json().catch(() => ({}));
    const metro_slug = body.metro_slug || "chicago";
    const sources: string[] = body.sources || ["dot", "licenses"];
    const days_back = body.days_back || 30;

    const metro = await getMetro(metro_slug);
    const results: any = { metro: metro.slug, started: new Date().toISOString() };

    if (sources.includes("dot")) {
      results.dot = await runDotScraper(metro);
    }
    if (sources.includes("licenses")) {
      results.licenses = await runLicenseScraper(metro, days_back);
    }

    results.finished = new Date().toISOString();
    const totalInserted = (results.dot?.inserted || 0) + (results.licenses?.inserted || 0);
    results.total_new_leads = totalInserted;

    return new Response(JSON.stringify(results), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
