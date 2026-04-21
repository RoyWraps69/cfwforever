// CFW Action Outcome Logger — Phase D
// POST { action_id, outcome, notes? }
// outcome values:
//   booked             → marks lead as qualified, stops outreach
//   replied_positive   → pauses sequence, alerts Roy
//   replied_negative   → suppresses, kills sequence
//   replied_question   → pauses sequence, alerts Roy for reply
//   no_answer          → schedules retry in 3 days
//   voicemail          → continues to next step in sequence
//   wrong_number       → marks DM phone invalid, suppresses phone channel
//   not_interested     → kills sequence, marks dead
//   call_back_later    → pauses sequence 7 days
//   opened | clicked   → logs event only, continues sequence
//   bounced            → suppresses email channel
//   unsubscribed       → adds to suppressions, kills sequence

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

// Outcome → downstream effect mapping
const OUTCOME_EFFECTS: Record<string, {
  action_status: string;
  priority_change?: string;
  suppress?: { channel: string; reason: string };
  schedule_next?: { days_from_now: number };
  pause_until_days?: number;
  alert_roy?: boolean;
}> = {
  booked: {
    action_status: "completed",
    priority_change: "qualified",
    alert_roy: true,
  },
  replied_positive: {
    action_status: "completed",
    priority_change: "qualified",
    pause_until_days: 999, // effectively indefinite pause; Roy takes over
    alert_roy: true,
  },
  replied_question: {
    action_status: "completed",
    pause_until_days: 999,
    alert_roy: true,
  },
  replied_negative: {
    action_status: "completed",
    priority_change: "dead",
    suppress: { channel: "all", reason: "replied_negative" },
  },
  no_answer: {
    action_status: "completed",
    schedule_next: { days_from_now: 3 },
  },
  voicemail: {
    action_status: "completed",
    schedule_next: { days_from_now: 2 },
  },
  wrong_number: {
    action_status: "failed",
    suppress: { channel: "sms", reason: "wrong_number" },
  },
  not_interested: {
    action_status: "completed",
    priority_change: "dead",
  },
  call_back_later: {
    action_status: "completed",
    pause_until_days: 7,
  },
  opened: { action_status: "pending" },  // don't change status, just log event
  clicked: { action_status: "pending" },
  bounced: {
    action_status: "failed",
    suppress: { channel: "email", reason: "bounced" },
  },
  unsubscribed: {
    action_status: "completed",
    priority_change: "dead",
    suppress: { channel: "email", reason: "unsubscribed" },
  },
  stopped: {
    action_status: "completed",
    priority_change: "dead",
    suppress: { channel: "sms", reason: "stopped" },
  },
  delivered: { action_status: "pending" },
  other: { action_status: "completed" },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  try {
    const body = await req.json();
    const { action_id, outcome, notes } = body;
    if (!action_id || !outcome) {
      return new Response(JSON.stringify({ error: "action_id and outcome required" }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const effect = OUTCOME_EFFECTS[outcome];
    if (!effect) {
      return new Response(JSON.stringify({ error: `unknown outcome: ${outcome}`, valid: Object.keys(OUTCOME_EFFECTS) }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const sb = getClient();

    const { data: action, error: aErr } = await sb.from("actions_queue").select("*").eq("id", action_id).single();
    if (aErr || !action) {
      return new Response(JSON.stringify({ error: "action not found" }), {
        status: 404, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // Update action status
    await sb.from("actions_queue").update({
      status: effect.action_status,
      outcome,
      outcome_notes: notes || null,
      outcome_logged_at: new Date().toISOString(),
      completed_at: ["completed", "failed"].includes(effect.action_status) ? new Date().toISOString() : null,
    }).eq("id", action_id);

    const effects: any[] = [{ step: "action_marked", status: effect.action_status, outcome }];

    // Change job priority if needed
    if (effect.priority_change && action.job_id) {
      await sb.from("jobs").update({ priority: effect.priority_change }).eq("id", action.job_id);
      effects.push({ step: "job_priority_changed", to: effect.priority_change });
    }

    // Add suppression if needed
    if (effect.suppress && action.decision_maker_id) {
      const { data: dm } = await sb.from("decision_makers").select("email, phone").eq("id", action.decision_maker_id).single();
      const values = [];
      if ((effect.suppress.channel === "email" || effect.suppress.channel === "all") && dm?.email) {
        values.push({ channel: "email", value: dm.email.toLowerCase(), reason: effect.suppress.reason });
      }
      if ((effect.suppress.channel === "sms" || effect.suppress.channel === "all") && dm?.phone) {
        values.push({ channel: "sms", value: dm.phone, reason: effect.suppress.reason });
      }
      if (values.length > 0) {
        const rows = values.map(v => ({
          ...v,
          decision_maker_id: action.decision_maker_id,
          job_id: action.job_id,
          metro_slug: action.metro_slug,
          source: "auto",
        }));
        await sb.from("suppressions_v2").upsert(rows, { onConflict: "channel,value", ignoreDuplicates: true });
        effects.push({ step: "suppressions_added", count: rows.length });
      }
    }

    // Schedule next retry
    if (effect.schedule_next && action.decision_maker_id) {
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + effect.schedule_next.days_from_now);
      const { data: newAction } = await sb.from("actions_queue").insert({
        decision_maker_id: action.decision_maker_id,
        job_id: action.job_id,
        metro_slug: action.metro_slug,
        step_number: (action.step_number || 0) + 1,
        action_type: action.action_type,
        title: `Retry: ${action.title}`,
        body: action.body,
        script_snippets: action.script_snippets,
        scheduled_for: nextDate.toISOString(),
        due_date: nextDate.toISOString().slice(0, 10),
        estimated_duration_min: action.estimated_duration_min,
        status: "pending",
      }).select("id").single();
      if (newAction) {
        await sb.from("actions_queue").update({ next_action_id: newAction.id }).eq("id", action_id);
        effects.push({ step: "retry_scheduled", next_id: newAction.id, days_out: effect.schedule_next.days_from_now });
      }
    }

    // Pause all pending actions for this DM
    if (effect.pause_until_days && action.decision_maker_id) {
      const pauseUntil = new Date();
      pauseUntil.setDate(pauseUntil.getDate() + effect.pause_until_days);
      const { data: pausedRows } = await sb.from("actions_queue")
        .update({ status: "paused" })
        .eq("decision_maker_id", action.decision_maker_id)
        .eq("status", "pending")
        .select("id");
      effects.push({ step: "actions_paused", count: pausedRows?.length || 0, until: pauseUntil.toISOString().slice(0, 10) });
      if (action.job_id) {
        await sb.from("jobs").update({ decay_pause_until: pauseUntil.toISOString() }).eq("id", action.job_id);
      }
    }

    // Log engagement event
    await sb.from("engagement_events").insert({
      decision_maker_id: action.decision_maker_id,
      job_id: action.job_id,
      action_id: action.id,
      metro_slug: action.metro_slug,
      event_type: outcome,
      event_data: { notes, action_type: action.action_type },
    });
    effects.push({ step: "event_logged", type: outcome });

    // Alert Roy if needed (currently a log entry — email alert wires up later)
    if (effect.alert_roy) {
      effects.push({ step: "alert_queued", reason: outcome });
      // TODO Phase 2: send SMS to Roy / Slack webhook / dashboard flag
    }

    return new Response(JSON.stringify({
      status: "ok",
      action_id,
      outcome,
      effects,
    }), { headers: { ...CORS, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message, stack: (e as Error).stack?.slice(0, 500) }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
