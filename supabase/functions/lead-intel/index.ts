// CFW Lead Intel Package Builder (Phase B)
// POST { decision_maker_id | job_id, force? }
// Model: Haiku 4.5 (~41s) — fits inside Edge Function 150s idle timeout
// Produces 11-section intel package + queues today's action

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

const INTEL_SYSTEM = `You are CFW Sales Intel Package Builder. You closed $50M+ in Chicago fleet wrap deals.

CFW CONTEXT:
- Chicago Fleet Wraps, 4711 N Lamon Ave #7, Chicago IL 60630
- 24+ years, 9,400+ installs, 2,800+ active fleet accounts
- Illinois leading EV fleet wrap installer (600+ Rivians)
- HP Latex + Avery Dennison + 3M certified. Founder: Roy Alkalay
- Price range: $1,200 single partial → $10,900 enterprise full wrap
- Main competitors: SpeedPro Windy City, Sign A Rama, Perfect Impressions, Power Graphics

RULES:
1. NEVER placeholders like [NAME]. Every script pre-filled with real names.
2. NEVER generic objections. Reference actual person/company/situation.
3. today_single_action executable by a new rep: exact time, channel, verbatim words, exact next step.
4. 30-day sequence MIXES channels (call, email, linkedin, drive-by, gift, letter). Never 30 days of email.
5. Tone: Roy Alkalay voice — direct, field-manual, 20yr veteran. NO "I'd be happy to" or "feel free to" or "it's worth noting".
6. Output valid JSON only, no markdown fences.`;

async function buildIntel(profile: any, company: any, apiKey: string): Promise<any> {
  const firstName = profile?.identity?.preferred_name || profile?.identity?.full_name?.split(" ")[0] || "them";
  const fullName = profile?.identity?.full_name || "?";
  const title = profile?.identity?.title || "?";
  const disc = `${profile?.psychology?.disc_primary}/${profile?.psychology?.disc_secondary || "-"}`;

  const userMsg = `Generate 11-section intel package for ${fullName}, ${title} at ${company.customer_name}.

approach_mode = "${profile.approach_mode}". Rationale: ${profile.approach_mode_rationale}

COMPANY: ${company.customer_name} | ${company.industry || company.job_type || "?"} | fleet ${company.fleet_size || "?"} | ${company.address || ""}, ${company.city || ""}, ${company.state || ""} ${company.zip || ""} | score ${company.score} | source ${company.source}

PROFILE SUMMARY:
- DISC: ${disc} | decision_speed: ${profile?.psychology?.decision_speed} | risk tolerance: ${profile?.psychology?.risk_tolerance}/10
- Values top 5: ${JSON.stringify(profile?.values?.top_5 || profile?.values || [])}
- Pain top 5: ${JSON.stringify(profile?.pain?.top_5 || profile?.pain || [])}
- Behavioral: response ${profile?.behavioral?.response_pattern}, fleet_wrap_status: ${profile?.behavioral?.fleet_wrap_status}, current_vendor: ${profile?.behavioral?.current_wrap_vendor_inferred || "none known"}
- Network: ${JSON.stringify(profile?.network || {})}
- Gatekeeper: ${JSON.stringify(profile?.gatekeeper || {})}
- Prior companies: ${JSON.stringify(profile?.identity?.prior_companies || [])}

Return JSON with these EXACT top-level keys:

{
  "section_1_verdict": {"mode": "${profile.approach_mode}", "mode_display_name": "<human readable>", "mode_color": "<hex>", "why_this_mode": "<1-2 sentences specific to ${firstName}>", "confidence": <0-1 number>, "fallback_mode": "<one of the 7 modes>"},
  "section_2_today_action": {"action_type": "call"|"email"|"linkedin_msg"|"drive_by"|"letter"|"research", "title": "<short>", "exact_time": "<day + time e.g. Tuesday 10am>", "exact_script": "<verbatim words to say, 200-400 chars>", "estimated_duration_min": <number>, "next_step_if_success": "<1 sentence>", "next_step_if_fail": "<1 sentence>"},
  "section_3_script_card": {"in_person_opener": "<verbatim 200 chars>", "phone_voicemail": "<verbatim 200 chars>", "linkedin_first_message": "<verbatim 200 chars>", "text_message": "<verbatim 150 chars>"},
  "section_4_email_kit": {"subject_a": "<subject>", "subject_b": "<subject>", "body_a": "<400 chars>", "body_b": "<400 chars>", "signature_block": "Roy Alkalay\\nFounder, Chicago Fleet Wraps\\n4711 N Lamon Ave #7, Chicago IL 60630\\nchicagofleetwraps.com"},
  "section_5_do_dont": {"do": ["<item SPECIFIC to ${firstName}>", "...6 items referencing known facts"], "dont": ["<item SPECIFIC>", "...6 items"]},
  "section_6_touch_sequence": [{"day": 0, "channel": "<channel>", "action": "<short>", "script": "<150 chars>"}, {"day": 1, ...}, {"day": 4, ...}, {"day": 7, ...}, {"day": 14, ...}, {"day": 21, ...}, {"day": 30, ...}],
  "section_7_objection_map": [{"objection": "<stated>", "response": "<verbatim 200 chars>", "follow_up": "<next move>"}, ...6+ entries INCLUDING one specific to ${firstName}'s situation],
  "section_8_competitive_displacement": {"current_vendor_analysis": "<2 sentences>", "switching_cost": "<1 sentence>", "win_angle": "<1 sentence>", "proof_points_to_deploy": ["<fact>", "<fact>"]},
  "section_9_aio_seo_intel": {"queries_this_prospect_searches": ["<query>", "<query>"], "cfw_ranking_gap": "<1 sentence>", "content_cfw_should_publish": "<1 sentence>", "schema_to_add": "<schema.org type>"},
  "section_10_gatekeeper": {"name": "<if known else null>", "personality_read": "<1 sentence>", "bypass_strategy_a": "<1 sentence>", "bypass_strategy_b": "<1 sentence>", "if_she_answers_line": "<verbatim words>"},
  "section_11_close_strategy": {"pitch_type": "full_fleet"|"pilot_truck"|"sample_install", "price_anchor": "<e.g. $1,200 pilot to $8k full>", "trust_builder_sequence": ["<move>", "<move>", "<move>"], "closer": "<verbatim words>", "recommended_call_to_action": "<verbatim words>"}
}

Return ONLY the JSON. No markdown fences.`;

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 5000,
      system: INTEL_SYSTEM,
      messages: [{ role: "user", content: userMsg }],
    }),
  });
  if (!r.ok) throw new Error(`Claude intel failed: ${await r.text()}`);
  const d = await r.json();
  let text = d.content?.[0]?.text?.trim() || "";
  if (text.startsWith("```")) text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  return JSON.parse(text);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  try {
    const body = await req.json();
    const { decision_maker_id, job_id, force = false } = body;
    if (!decision_maker_id && !job_id) {
      return new Response(JSON.stringify({ error: "decision_maker_id or job_id required" }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const sb = getClient();
    const q = decision_maker_id
      ? sb.from("decision_makers").select("*").eq("id", decision_maker_id).single()
      : sb.from("decision_makers").select("*").eq("job_id", job_id).order("created_at", { ascending: false }).limit(1).single();
    const { data: dm, error: dmErr } = await q;
    if (dmErr || !dm) {
      return new Response(JSON.stringify({ error: "decision_maker not found" }), {
        status: 404, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }
    if (!dm.profile) {
      return new Response(JSON.stringify({ error: "profile not built yet — call lead-enrich first" }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }
    if (dm.intel_package && !force) {
      return new Response(JSON.stringify({ status: "intel_already_built", decision_maker_id: dm.id }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const { data: job } = await sb.from("jobs").select("*").eq("id", dm.job_id).single();
    const anthropicKey = await getSecret(sb, "ANTHROPIC_API_KEY");

    const intelPkg = await buildIntel(dm.profile, job, anthropicKey);

    await sb.from("decision_makers").update({
      intel_package: intelPkg,
      intel_built_at: new Date().toISOString(),
    }).eq("id", dm.id);

    const action = intelPkg.section_2_today_action;
    const steps: any[] = [{ step: "intel_built" }];

    if (action) {
      await sb.from("actions_queue").delete().eq("decision_maker_id", dm.id).eq("step_number", 0);
      await sb.from("actions_queue").insert({
        decision_maker_id: dm.id, job_id: dm.job_id, metro_slug: dm.metro_slug || "chicago",
        step_number: 0,
        action_type: action.action_type,
        title: action.title,
        body: action.exact_script,
        script_snippets: intelPkg.section_3_script_card,
        scheduled_for: new Date().toISOString(),
        due_date: new Date().toISOString().split("T")[0],
        estimated_duration_min: action.estimated_duration_min,
        status: "pending",
      });
      steps.push({ step: "action_queued", action_type: action.action_type, title: action.title });
    }

    await sb.from("jobs").update({ enrichment_status: "complete" }).eq("id", dm.job_id);
    steps.push({ step: "job_marked_complete" });

    return new Response(JSON.stringify({
      status: "ok",
      decision_maker_id: dm.id,
      approach_mode: dm.approach_mode,
      today_action_title: action?.title,
      steps,
    }), { headers: { ...CORS, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message, stack: (e as Error).stack?.slice(0, 500) }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
