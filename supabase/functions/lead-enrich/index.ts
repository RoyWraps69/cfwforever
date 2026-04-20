// supabase/functions/lead-enrich/index.ts
//
// CFW Lead Enrichment Orchestrator
//
// Called with: { job_id: "<uuid>", force?: boolean }
// Does: Apollo people lookup → Hunter email → NeverBounce verify → Claude profile → Claude intel package → actions_queue seed
//
// Secrets required in app_secrets table:
//   ANTHROPIC_API_KEY, APOLLO_API_KEY, HUNTER_API_KEY
//
// Deploy: supabase functions deploy lead-enrich --no-verify-jwt
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

const sb = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ---------- Load secrets from app_secrets table ----------
async function getSecret(name: string): Promise<string> {
  const { data, error } = await sb.from("app_secrets").select("value").eq("name", name).single();
  if (error || !data) throw new Error(`Missing secret: ${name}`);
  return data.value;
}

// ---------- Apollo: people search by company domain ----------
async function apolloFindDecisionMakers(domain: string, apiKey: string) {
  const titles = ["owner", "president", "ceo", "founder", "general manager", "operations manager", "vp", "director"];
  const url = "https://api.apollo.io/api/v1/mixed_people/search";
  const body = {
    q_organization_domains: domain,
    person_titles: titles,
    page: 1,
    per_page: 5,
  };
  const r = await fetch(url, {
    method: "POST",
    headers: {
      "X-Api-Key": apiKey,
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) return { people: [], error: await r.text() };
  const data = await r.json();
  return { people: data.people || [] };
}

// ---------- Apollo: enrich a single person (email + phone) ----------
async function apolloEnrichPerson(firstName: string, lastName: string, domain: string, apiKey: string) {
  const url = "https://api.apollo.io/api/v1/people/match?reveal_personal_emails=true&reveal_phone_number=true";
  const body = { first_name: firstName, last_name: lastName, domain };
  const r = await fetch(url, {
    method: "POST",
    headers: { "X-Api-Key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) return null;
  const d = await r.json();
  return d.person || null;
}

// ---------- Hunter: domain search for emails ----------
async function hunterDomainSearch(domain: string, apiKey: string) {
  const r = await fetch(`https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(domain)}&api_key=${apiKey}&limit=10`);
  if (!r.ok) return { emails: [] };
  const d = await r.json();
  return { emails: d?.data?.emails || [], pattern: d?.data?.pattern };
}

// ---------- Hunter: email verify ----------
async function hunterVerify(email: string, apiKey: string) {
  const r = await fetch(`https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(email)}&api_key=${apiKey}`);
  if (!r.ok) return null;
  const d = await r.json();
  return d?.data || null;
}

// ---------- Claude profile builder ----------
const PROFILE_SYSTEM = `You are CFW's Psychological Profile Builder, a senior sales intelligence analyst with 20 years of experience profiling small-to-mid business owners in the Chicago metro area in HVAC, plumbing, electrical, moving, transportation.

Your job: read an enrichment bundle and output a structured JSON profile.

CRITICAL RULES:
1. NEVER invent data. Unknown fields = null. Never guess family/religion/politics without evidence.
2. Ethnicity/cultural inference: only from last-name patterns or explicit statements. Mark "likely_X" not "is_X".
3. Family status: only from explicit public posts or Apollo data. Never default to "married with kids".
4. DISC and Big Five: based on OBSERVABLE behavior, not stereotypes.
5. Pain points: rank based on what company data actually shows.
6. Chicago context: use real neighborhoods, sports, Catholic school networks, union locals 130/134/150/399.
7. Output valid JSON only. No preamble, no markdown fences.

approach_mode choices (pick ONE):
- teddy_bear: family-first, soft, gift-based. 2nd-gen owner with kids, slow warmth.
- hat_in_hand: deferential, craftsman-respecting. 60+ founder, pride in longevity.
- hat_in_hand_swagger: deferential opening, hard number within 2 min. Southside/Italian/Irish contractor.
- swagger: peer-to-peer alpha, fast. 35-45 growth-mode, PE-adjacent, LinkedIn braggart.
- local_pride: tribal, neighborhood-first. Multi-gen Chicago owner, union-sympathetic.
- mentor: teach first. Young owner under 35, took over family biz.
- urgency: they're losing ground, evidence required.`;

async function buildProfile(enrichment: any, anthropicKey: string) {
  const userMsg = `Build a psychological profile from this enrichment bundle.

COMPANY: ${enrichment.company_name || "?"}
WEBSITE: ${enrichment.website || "?"}
INDUSTRY: ${enrichment.industry || "?"}
FLEET SIZE: ${enrichment.fleet_size || "?"}
CITY: ${enrichment.city || "?"}
STATE: ${enrichment.state || "?"}
ADDRESS: ${enrichment.address || "?"}

APOLLO DATA:
${JSON.stringify(enrichment.apollo || {}, null, 2)}

HUNTER DATA:
${JSON.stringify(enrichment.hunter || {}, null, 2)}

OTHER ENRICHMENT:
${JSON.stringify(enrichment.other || {}, null, 2)}

Output JSON matching the schema with these top-level keys:
identity, psychology, values, pain, status, behavioral, gatekeeper, network, approach_mode, approach_mode_rationale, approach_mode_confidence, approach_mode_fallback, overall_confidence, low_confidence.

Return ONLY the JSON object.`;

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": anthropicKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4000,
      system: PROFILE_SYSTEM,
      messages: [{ role: "user", content: userMsg }],
    }),
  });
  if (!r.ok) throw new Error(`Claude profile call failed: ${await r.text()}`);
  const data = await r.json();
  const text = data.content?.[0]?.text || "";
  const cleaned = text.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error(`Profile JSON parse failed: ${(e as Error).message} — got: ${text.slice(0, 200)}`);
  }
}

// ---------- Claude intel package builder ----------
const INTEL_SYSTEM = `You are CFW's Sales Intelligence Package Builder. You've closed $50M+ in Chicago fleet wrap deals.

Given a decision-maker profile + company data, output an 11-section actionable intel package as strict JSON.

CFW CONTEXT:
- Chicago Fleet Wraps, 4711 N Lamon Ave #7, Chicago IL 60630
- 24+ years, 9,400+ installs, 2,800+ active fleet accounts
- Illinois' leading EV fleet wrap installer (600+ Rivians)
- Certifications: HP Latex, Avery Dennison, 3M
- Founder: Roy Alkalay
- Price range: $1,200 - $10,900
- Main Chicago competitors: SpeedPro Windy City, Sign A Rama, Perfect Impressions, Power Graphics, Custom Sign Source

RULES:
1. NEVER use placeholders like [NAME]. Every script pre-filled with real names.
2. NEVER generic objection maps. Every response references actual person/company/situation.
3. The today_single_action must be executable by a first-time rep: exact time, channel, words, next step.
4. 30-day sequence MUST mix channels. No 30-day email blasts.
5. Tone: Roy Alkalay voice — direct, field-manual, 20-year veteran. No "I'd be happy to" or "feel free to".
6. Output valid JSON only, no fences.`;

async function buildIntelPackage(profile: any, company: any, anthropicKey: string) {
  const userMsg = `Generate a full 11-section intelligence package.

DECISION MAKER PROFILE:
${JSON.stringify(profile, null, 2)}

COMPANY DATA:
Name: ${company.customer_name}
Industry: ${company.industry || "?"}
Fleet Size: ${company.fleet_size || "?"}
Website: ${company.website || "?"}
Location: ${company.address || "?"}, ${company.city || "?"}, ${company.state || "?"} ${company.zip || ""}
Score: ${company.score}
Score Breakdown: ${company.score_breakdown || "?"}
Source: ${company.source}

Generate strict JSON with these exact top-level keys:
section_1_verdict, section_2_today_action, section_3_script_card, section_4_email_kit, section_5_do_dont, section_6_touch_sequence, section_7_objection_map, section_8_competitive_displacement, section_9_aio_seo_intel, section_10_gatekeeper, section_11_close_strategy.

Section 6 touch_sequence: array of 7 objects with {day, channel, action, script} for days 0, 1, 4, 7, 14, 21, 30.
Section 7 objection_map: array of 6+ objects with {objection, response, follow_up}.
Section 5 do_dont: {do:[], dont:[]} with 6+ items each, SPECIFIC to this prospect.

Return ONLY the JSON object.`;

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": anthropicKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 8000,
      system: INTEL_SYSTEM,
      messages: [{ role: "user", content: userMsg }],
    }),
  });
  if (!r.ok) throw new Error(`Claude intel call failed: ${await r.text()}`);
  const data = await r.json();
  const text = data.content?.[0]?.text || "";
  const cleaned = text.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error(`Intel JSON parse failed: ${(e as Error).message} — got: ${text.slice(0, 200)}`);
  }
}

// ---------- MAIN HANDLER ----------
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  try {
    const body = await req.json();
    const { job_id, force = false } = body;
    if (!job_id) return new Response(JSON.stringify({ error: "job_id required" }), { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });

    // Load secrets
    const anthropicKey = await getSecret("ANTHROPIC_API_KEY");
    const apolloKey = await getSecret("APOLLO_API_KEY");
    const hunterKey = await getSecret("HUNTER_API_KEY");

    // Load job
    const { data: job, error: jobErr } = await sb.from("jobs").select("*").eq("id", job_id).single();
    if (jobErr || !job) return new Response(JSON.stringify({ error: "job not found" }), { status: 404, headers: { ...CORS, "Content-Type": "application/json" } });

    // Skip if already enriched unless force
    if (job.enrichment_status === "complete" && !force) {
      return new Response(JSON.stringify({ status: "already_enriched", job_id }), { headers: { ...CORS, "Content-Type": "application/json" } });
    }

    // Extract domain from website or guess
    let domain = job.domain;
    if (!domain && job.website) {
      domain = job.website.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
    }

    const result: any = { job_id, steps: [] };

    // -------- Apollo: find decision-makers --------
    let apolloPeople: any[] = [];
    if (domain) {
      try {
        const res = await apolloFindDecisionMakers(domain, apolloKey);
        apolloPeople = res.people;
        result.steps.push({ step: "apollo_search", count: apolloPeople.length });
      } catch (e) {
        result.steps.push({ step: "apollo_search", error: (e as Error).message });
      }
    }

    // -------- Hunter: domain search as backup --------
    let hunterData: any = { emails: [] };
    if (domain && apolloPeople.length === 0) {
      try {
        hunterData = await hunterDomainSearch(domain, hunterKey);
        result.steps.push({ step: "hunter_search", count: hunterData.emails.length });
      } catch (e) {
        result.steps.push({ step: "hunter_search", error: (e as Error).message });
      }
    }

    // -------- Pick top decision-maker --------
    let dm: any = null;
    if (apolloPeople.length > 0) {
      const top = apolloPeople[0];
      // Enrich to get email/phone
      const enriched = await apolloEnrichPerson(top.first_name || "", top.last_name || "", domain, apolloKey).catch(() => null);
      dm = {
        full_name: top.name,
        first_name: top.first_name,
        last_name: top.last_name,
        title: top.title,
        seniority: top.seniority,
        email: enriched?.email || top.email || null,
        phone: enriched?.phone_numbers?.[0]?.sanitized_number || null,
        linkedin_url: top.linkedin_url,
        photo_url: top.photo_url,
        apollo_person_id: top.id,
        apollo_raw: top,
      };
    } else if (hunterData.emails.length > 0) {
      const top = hunterData.emails[0];
      dm = {
        full_name: `${top.first_name || ""} ${top.last_name || ""}`.trim() || null,
        first_name: top.first_name,
        last_name: top.last_name,
        title: top.position,
        email: top.value,
        linkedin_url: top.linkedin,
        phone: top.phone_number,
      };
    }

    if (!dm || !dm.full_name) {
      await sb.from("jobs").update({ enrichment_status: "no_decision_maker_found" }).eq("id", job_id);
      return new Response(JSON.stringify({ status: "no_decision_maker", ...result }), { headers: { ...CORS, "Content-Type": "application/json" } });
    }

    // -------- Verify email via Hunter --------
    if (dm.email) {
      const verify = await hunterVerify(dm.email, hunterKey).catch(() => null);
      if (verify) {
        dm.email_verified = verify.status === "valid";
        dm.email_risk = verify.status;
      }
    }

    // -------- Insert decision_maker record --------
    const enrichmentBundle = {
      company_name: job.customer_name,
      website: job.website,
      industry: job.industry || job.job_type,
      fleet_size: job.fleet_size,
      city: job.city,
      state: job.state,
      address: job.address,
      apollo: dm.apollo_raw || null,
      hunter: hunterData,
      other: {
        job_source: job.source,
        score: job.score,
        score_breakdown: job.score_breakdown,
        message: job.message,
      },
    };

    const { data: dmRow, error: dmErr } = await sb.from("decision_makers").insert({
      job_id,
      company_name: job.customer_name,
      metro_slug: job.metro_slug || "chicago",
      full_name: dm.full_name,
      first_name: dm.first_name,
      last_name: dm.last_name,
      title: dm.title,
      seniority: dm.seniority,
      email: dm.email,
      email_verified: dm.email_verified || null,
      email_risk: dm.email_risk || null,
      phone: dm.phone,
      linkedin_url: dm.linkedin_url,
      photo_url: dm.photo_url,
      apollo_person_id: dm.apollo_person_id,
      apollo_raw: dm.apollo_raw,
      enrichment_bundle: enrichmentBundle,
    }).select().single();

    if (dmErr) throw new Error(`DM insert failed: ${dmErr.message}`);
    result.decision_maker_id = dmRow.id;
    result.steps.push({ step: "dm_inserted", id: dmRow.id });

    // -------- Claude: build profile --------
    let profile: any = null;
    try {
      profile = await buildProfile(enrichmentBundle, anthropicKey);
      await sb.from("decision_makers").update({
        profile,
        profile_built_at: new Date().toISOString(),
        profile_confidence: profile.overall_confidence || 0.5,
        approach_mode: profile.approach_mode,
      }).eq("id", dmRow.id);
      result.steps.push({ step: "profile_built", mode: profile.approach_mode });
    } catch (e) {
      result.steps.push({ step: "profile_failed", error: (e as Error).message });
    }

    // -------- Claude: build intel package --------
    let intelPkg: any = null;
    if (profile) {
      try {
        intelPkg = await buildIntelPackage(profile, job, anthropicKey);
        await sb.from("decision_makers").update({
          intel_package: intelPkg,
          intel_built_at: new Date().toISOString(),
        }).eq("id", dmRow.id);
        result.steps.push({ step: "intel_built" });

        // Seed today's action into actions_queue
        const action = intelPkg.section_2_today_action;
        if (action) {
          await sb.from("actions_queue").insert({
            decision_maker_id: dmRow.id,
            job_id,
            metro_slug: job.metro_slug || "chicago",
            step_number: 0,
            action_type: action.action_type,
            title: action.title,
            body: action.exact_script,
            scheduled_for: new Date().toISOString(),
            due_date: new Date().toISOString().split("T")[0],
            script_snippets: intelPkg.section_3_script_card,
            status: "pending",
          });
          result.steps.push({ step: "action_queued" });
        }
      } catch (e) {
        result.steps.push({ step: "intel_failed", error: (e as Error).message });
      }
    }

    // -------- Update job + link primary DM --------
    await sb.from("jobs").update({
      primary_decision_maker_id: dmRow.id,
      enrichment_status: "complete",
      apollo_enriched: true,
      apollo_email: dm.email,
      apollo_linkedin: dm.linkedin_url,
    }).eq("id", job_id);

    return new Response(JSON.stringify({ status: "ok", ...result }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
