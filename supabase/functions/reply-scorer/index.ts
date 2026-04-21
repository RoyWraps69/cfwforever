// CFW Reply Scorer
// POST { reply_log_id } OR { from_email, subject, body, gmail_message_id }
// Uses Claude Haiku to classify intent of inbound replies, triggers downstream action.
//
// Intent labels: hot_yes, curious, objection, not_now, unsubscribe, auto_reply, wrong_person, spam
// Downstream effects per label (routes through action-outcome):
//   hot_yes/curious  → pause sequence, alert Roy, mark priority=qualified
//   objection        → pause, log, let Roy respond
//   not_now          → pause 30 days
//   unsubscribe/stop → suppress + kill sequence
//   auto_reply       → ignore (out-of-office, etc)
//   wrong_person     → suppress email, keep job for DM hunt
//   spam             → ignore

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

const INTENT_SYSTEM = `You are CFW Reply Classifier. Read an inbound email reply to a fleet wrap outreach email and classify the sender's intent.

Return valid JSON only, no fences:
{
  "intent_label": "hot_yes" | "curious" | "objection" | "not_now" | "unsubscribe" | "auto_reply" | "wrong_person" | "spam",
  "confidence": number (0.0 - 1.0),
  "one_line_summary": string,
  "recommended_action": string,
  "keywords_detected": string[]
}

Labels:
- hot_yes: wants to meet, asks for quote, gives availability
- curious: asks questions but not committed, wants more info
- objection: price/timing/fit concern, not closing door
- not_now: asks to circle back later
- unsubscribe: wants off list — words like "stop", "unsubscribe", "remove me"
- auto_reply: out-of-office, vacation autoresponder
- wrong_person: says "not the right contact" or "try X instead"
- spam: not a real reply`;

async function classifyReply(subject: string, body: string, apiKey: string) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 800,
      system: INTENT_SYSTEM,
      messages: [{ role: "user", content: `Subject: ${subject}\n\nBody:\n${body.slice(0, 4000)}` }],
    }),
  });
  if (!r.ok) throw new Error(`Claude classify failed: ${await r.text()}`);
  const d = await r.json();
  let text = d.content?.[0]?.text?.trim() || "";
  if (text.startsWith("```")) text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  return JSON.parse(text);
}

// Map intent → outcome for action-outcome processing
const INTENT_TO_OUTCOME: Record<string, string> = {
  hot_yes: "replied_positive",
  curious: "replied_question",
  objection: "replied_question",
  not_now: "call_back_later",
  unsubscribe: "unsubscribed",
  auto_reply: "other",
  wrong_person: "wrong_number",
  spam: "other",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  try {
    const body = await req.json();
    const sb = getClient();

    let reply: any;
    if (body.reply_log_id) {
      const { data } = await sb.from("reply_log").select("*").eq("id", body.reply_log_id).single();
      reply = data;
      if (!reply) {
        return new Response(JSON.stringify({ error: "reply_log_id not found" }), {
          status: 404, headers: { ...CORS, "Content-Type": "application/json" },
        });
      }
    } else if (body.from_email) {
      // Insert and classify
      const { data } = await sb.from("reply_log").insert({
        from_email: body.from_email,
        subject: body.subject,
        snippet: (body.body || "").slice(0, 400),
        full_body: body.body || "",
        gmail_message_id: body.gmail_message_id,
      }).select("*").single();
      reply = data;
    } else {
      return new Response(JSON.stringify({ error: "reply_log_id or from_email required" }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const anthropicKey = await getSecret(sb, "ANTHROPIC_API_KEY");
    const classification = await classifyReply(reply.subject || "", reply.full_body || reply.snippet || "", anthropicKey);

    // Find matching DM by from_email
    const fromLower = (reply.from_email || "").toLowerCase();
    const { data: dm } = await sb.from("decision_makers")
      .select("id, job_id, full_name, email")
      .eq("email", fromLower).maybeSingle();

    // Update reply_log with classification
    await sb.from("reply_log").update({
      intent_label: classification.intent_label,
      intent_confidence: classification.confidence,
      decision_maker_id: dm?.id || null,
      job_id: dm?.job_id || null,
      action_taken: classification.recommended_action,
    }).eq("id", reply.id);

    // If we found the DM, also call action-outcome logic to pause/suppress correctly
    let outcomeResult: any = null;
    if (dm) {
      const outcome = INTENT_TO_OUTCOME[classification.intent_label] || "other";
      // Find the most recent pending/completed email action for this DM
      const { data: action } = await sb.from("actions_queue")
        .select("id")
        .eq("decision_maker_id", dm.id)
        .in("action_type", ["email"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (action) {
        // Forward to action-outcome function for unified handling
        const outcomeReq = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/action-outcome`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            action_id: action.id,
            outcome,
            notes: `reply_scorer: ${classification.one_line_summary}`,
          }),
        });
        if (outcomeReq.ok) outcomeResult = await outcomeReq.json();
      }

      // Log engagement
      await sb.from("engagement_events").insert({
        decision_maker_id: dm.id,
        job_id: dm.job_id,
        event_type: "replied",
        event_data: {
          intent: classification.intent_label,
          confidence: classification.confidence,
          subject: reply.subject,
          summary: classification.one_line_summary,
        },
      });
    }

    return new Response(JSON.stringify({
      status: "ok",
      reply_id: reply.id,
      classification,
      matched_dm: dm ? { id: dm.id, name: dm.full_name } : null,
      outcome_result: outcomeResult,
    }), { headers: { ...CORS, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message, stack: (e as Error).stack?.slice(0, 500) }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
