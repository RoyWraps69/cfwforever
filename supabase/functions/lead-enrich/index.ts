// CFW Lead Enrichment Phase A: Apollo + Hunter + Profile
// POST { job_id, force? } — Returns after Claude profile built.
// Does NOT build intel package (call lead-intel next).

import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getClient() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function getSecret(sb: any, name: string): Promise<string> {
  const { data, error } = await sb.from("app_secrets").select("value").eq("name", name).single();
  if (error || !data) throw new Error(`Missing secret: ${name}`);
  return data.value;
}

async function apolloSearchPeople(domain: string, apiKey: string) {
  try {
    const r = await fetch("https://api.apollo.io/api/v1/mixed_people/search", {
      method: "POST",
      headers: { "X-Api-Key": apiKey, "Content-Type": "application/json", "Cache-Control": "no-cache" },
      body: JSON.stringify({
        q_organization_domains: domain,
        person_titles: ["owner","president","ceo","founder","general manager","operations manager","service director","service manager","fleet manager","vp","director"],
        page: 1, per_page: 5,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) return { people: [] };
    const d = await r.json();
    return { people: d.people || [] };
  } catch { return { people: [] }; }
}

async function hunterDomainSearch(domain: string, apiKey: string) {
  try {
    const r = await fetch(`https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(domain)}&api_key=${apiKey}&limit=10`, { signal: AbortSignal.timeout(15000) });
    if (!r.ok) return { emails: [] };
    const d = await r.json();
    return { emails: d?.data?.emails || [], pattern: d?.data?.pattern };
  } catch { return { emails: [] }; }
}

async function hunterVerify(email: string, apiKey: string) {
  try {
    const r = await fetch(`https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(email)}&api_key=${apiKey}`, { signal: AbortSignal.timeout(10000) });
    if (!r.ok) return null;
    const d = await r.json();
    return d?.data || null;
  } catch { return null; }
}

const PROFILE_SYSTEM = `You are CFW Psychological Profile Builder — 20 years profiling Chicago metro business owners and managers.

RULES:
1. NEVER invent. Unknown = null. No guessing on family/religion/politics without evidence.
2. Ethnicity: last-name patterns only, mark "likely_X".
3. DISC + Big Five: OBSERVABLE behavior only.
4. Pain points: only what the data actually shows.
5. Chicago context: real neighborhoods, sports, Catholic/ethnic networks, union locals 130/134/150/399.
6. Output valid JSON only. No fences.

approach_mode (exact string, pick one):
teddy_bear, hat_in_hand, hat_in_hand_swagger, swagger, local_pride, mentor, urgency.`;

async function buildProfile(bundle: any, apiKey: string): Promise<any> {
  const userMsg = `Build a psychological profile from this enrichment bundle.

${JSON.stringify(bundle, null, 2)}

Output JSON with EXACTLY these nested keys:

{
  "identity": { "full_name", "preferred_name", "title", "role_tenure_years", "age_estimate_range", "gender", "ethnicity_cultural_inference", "religion_signals", "military_status", "immigrant_generation", "family" (nested: married, kids_count, kid_ages, eldest_in_business), "education", "prior_companies" (array), "hometown", "current_neighborhood" },
  "psychology": { "disc_primary", "disc_secondary", "big_five" (nested: openness, conscientiousness, extraversion, agreeableness, neuroticism), "decision_speed", "risk_tolerance", "self_perception", "humor_style", "profanity_level", "status_orientation", "legacy_orientation", "political_lean_inferred", "tribal_affiliations" (array), "religious_observance_level" },
  "values": { "top_5": array of strings },
  "pain": { "top_5": array of {rank, issue, evidence} objects },
  "status": { "symbols_flaunted", "awards_won", "sponsorships", "marquee_accounts", "board_seats", "industry_positions" (all arrays) },
  "behavioral": { "response_pattern", "posting_cadence", "time_of_day_active", "day_of_week_preferred", "email_response_latency_hours", "fleet_age_visible", "fleet_wrap_status", "current_wrap_vendor_inferred", "truck_condition_1_10" },
  "gatekeeper": { "name", "title", "personality_inference", "bypass_strategy", "opening_line_if_she_answers" },
  "network": { "mutual_connections_high_value" (array), "shared_orgs" (array), "shared_neighborhood", "shared_schools" (array), "shared_church", "shared_union" },
  "approach_mode",
  "approach_mode_rationale",
  "approach_mode_confidence",
  "approach_mode_fallback",
  "overall_confidence",
  "low_confidence"
}

All 1-10 numbers unless noted. Return ONLY the JSON.`;

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4000,
      system: PROFILE_SYSTEM,
      messages: [{ role: "user", content: userMsg }],
    }),
  });
  if (!r.ok) throw new Error(`Claude profile failed: ${await r.text()}`);
  const d = await r.json();
  let text = d.content?.[0]?.text?.trim() || "";
  if (text.startsWith("```")) text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  return JSON.parse(text);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  try {
    const body = await req.json();
    const { job_id, force = false } = body;
    if (!job_id) {
      return new Response(JSON.stringify({ error: "job_id required" }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const sb = getClient();

    const { data: job, error: jobErr } = await sb.from("jobs").select("*").eq("id", job_id).single();
    if (jobErr || !job) {
      return new Response(JSON.stringify({ error: "job not found" }), {
        status: 404, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // Resume logic: if profile exists and not forcing, skip
    if (!force) {
      const { data: existing } = await sb.from("decision_makers").select("id, profile, intel_package").eq("job_id", job_id).maybeSingle();
      if (existing?.profile) {
        return new Response(JSON.stringify({
          status: "profile_already_built",
          decision_maker_id: existing.id,
          has_intel: !!existing.intel_package,
          next: existing.intel_package ? "done" : "call lead-intel",
        }), { headers: { ...CORS, "Content-Type": "application/json" } });
      }
    }

    const [anthropicKey, apolloKey, hunterKey] = await Promise.all([
      getSecret(sb, "ANTHROPIC_API_KEY"),
      getSecret(sb, "APOLLO_API_KEY"),
      getSecret(sb, "HUNTER_API_KEY"),
    ]);

    let domain = job.domain;
    if (!domain && job.website) {
      domain = String(job.website).replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
    }

    const steps: any[] = [];

    let apolloPeople: any[] = [];
    if (domain) {
      const res = await apolloSearchPeople(domain, apolloKey);
      apolloPeople = res.people;
      steps.push({ step: "apollo_search", count: apolloPeople.length });
    }

    let hunterData: any = { emails: [] };
    if (domain) {
      hunterData = await hunterDomainSearch(domain, hunterKey);
      steps.push({ step: "hunter_search", count: hunterData.emails.length });
    }

    let dm: any = null;
    if (apolloPeople.length > 0) {
      const top = apolloPeople[0];
      dm = {
        full_name: top.name, first_name: top.first_name, last_name: top.last_name,
        title: top.title, seniority: top.seniority,
        email: top.email || null, phone: null,
        linkedin_url: top.linkedin_url, photo_url: top.photo_url,
        apollo_person_id: top.id, apollo_raw: top,
      };
    } else if (hunterData.emails.length > 0) {
      const titlesRx = /(owner|president|ceo|founder|director|manager|vp|general manager|principal)/i;
      const sorted = [...hunterData.emails].sort((a, b) => {
        const aT = titlesRx.test(a.position || "") ? 1 : 0;
        const bT = titlesRx.test(b.position || "") ? 1 : 0;
        if (aT !== bT) return bT - aT;
        return (b.confidence || 0) - (a.confidence || 0);
      });
      const top = sorted[0];
      dm = {
        full_name: `${top.first_name || ""} ${top.last_name || ""}`.trim() || null,
        first_name: top.first_name, last_name: top.last_name,
        title: top.position, email: top.value,
        linkedin_url: top.linkedin, phone: top.phone_number,
      };
    }

    if (!dm || !dm.full_name) {
      await sb.from("jobs").update({ enrichment_status: "no_decision_maker_found" }).eq("id", job_id);
      return new Response(JSON.stringify({ status: "no_decision_maker", steps }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    if (dm.email) {
      const v = await hunterVerify(dm.email, hunterKey);
      if (v) { dm.email_verified = v.status === "valid"; dm.email_risk = v.status; }
    }

    const enrichmentBundle = {
      company_name: job.customer_name,
      website: job.website, industry: job.industry || job.job_type,
      fleet_size: job.fleet_size, city: job.city, state: job.state, address: job.address,
      apollo: dm.apollo_raw || null,
      hunter: hunterData,
      // Phase 4a signals — Google Places reviews/hours, website scrape, news, BBB, socials
      signals: job.enrichment_data || {},
      other: { job_source: job.source, score: job.score, score_breakdown: job.score_breakdown, message: job.message },
    };

    const { data: existingDm } = await sb.from("decision_makers").select("id").eq("job_id", job_id).maybeSingle();
    let dmId: string;
    if (existingDm) {
      const { error: uErr } = await sb.from("decision_makers").update({
        full_name: dm.full_name, first_name: dm.first_name, last_name: dm.last_name,
        title: dm.title, seniority: dm.seniority,
        email: dm.email, email_verified: dm.email_verified || null, email_risk: dm.email_risk || null,
        phone: dm.phone, linkedin_url: dm.linkedin_url, photo_url: dm.photo_url,
        apollo_person_id: dm.apollo_person_id, apollo_raw: dm.apollo_raw,
        enrichment_bundle: enrichmentBundle,
      }).eq("id", existingDm.id);
      if (uErr) throw new Error(`DM update failed: ${uErr.message}`);
      dmId = existingDm.id;
    } else {
      const { data: dmRow, error: dmErr } = await sb.from("decision_makers").insert({
        job_id, company_name: job.customer_name, metro_slug: job.metro_slug || "chicago",
        full_name: dm.full_name, first_name: dm.first_name, last_name: dm.last_name,
        title: dm.title, seniority: dm.seniority,
        email: dm.email, email_verified: dm.email_verified || null, email_risk: dm.email_risk || null,
        phone: dm.phone, linkedin_url: dm.linkedin_url, photo_url: dm.photo_url,
        apollo_person_id: dm.apollo_person_id, apollo_raw: dm.apollo_raw,
        enrichment_bundle: enrichmentBundle,
      }).select("id").single();
      if (dmErr) throw new Error(`DM insert failed: ${dmErr.message}`);
      dmId = dmRow.id;
    }
    steps.push({ step: "dm_saved", id: dmId, name: dm.full_name });

    // Build profile
    try {
      const profile = await buildProfile(enrichmentBundle, anthropicKey);
      await sb.from("decision_makers").update({
        profile,
        profile_built_at: new Date().toISOString(),
        profile_confidence: profile.overall_confidence || 0.5,
        approach_mode: profile.approach_mode,
      }).eq("id", dmId);
      steps.push({ step: "profile_built", mode: profile.approach_mode, confidence: profile.overall_confidence });

      await sb.from("jobs").update({
        primary_decision_maker_id: dmId,
        enrichment_status: "profile_built",
        apollo_enriched: !!dm.apollo_person_id,
        apollo_email: dm.email,
        apollo_linkedin: dm.linkedin_url,
      }).eq("id", job_id);
    } catch (e) {
      steps.push({ step: "profile_failed", error: (e as Error).message });
    }

    return new Response(JSON.stringify({
      status: "ok",
      decision_maker_id: dmId,
      next: "call lead-intel",
      steps,
    }), { headers: { ...CORS, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message, stack: (e as Error).stack?.slice(0, 500) }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
