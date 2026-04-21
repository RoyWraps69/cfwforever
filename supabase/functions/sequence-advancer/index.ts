// CFW Sequence Advancer
// Runs hourly via pg_cron. Moves leads through their 30-day touch sequences.
//
// Logic:
//   1. Find all decision_makers with intel_package + status=sequence_active (or null, implying active)
//   2. For each, find the next unfulfilled touch step from section_6_touch_sequence
//   3. If the current action is completed and it's time for the next touch, queue it
//   4. Skip if DM is suppressed, paused, or sequence was killed by an outcome

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

interface TouchStep {
  day: number;
  channel: string;
  action: string;
  script?: string;
}

function channelToActionType(channel: string): string {
  const c = channel.toLowerCase();
  if (c.includes("email")) return "email";
  if (c.includes("linkedin")) return "linkedin_msg";
  if (c.includes("sms") || c.includes("text")) return "sms";
  if (c.includes("call") || c.includes("phone")) return "call";
  if (c.includes("postcard") || c.includes("letter") || c.includes("mail")) return "postcard";
  if (c.includes("drive")) return "drive_by";
  return "research";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  try {
    const sb = getClient();
    const nowIso = new Date().toISOString();
    const summary = { scanned: 0, advanced: 0, skipped: 0, errors: [] as string[] };

    // Get all DMs with intel packages
    const { data: dms, error: dmErr } = await sb
      .from("decision_makers")
      .select("id, job_id, full_name, email, phone, intel_package, metro_slug")
      .not("intel_package", "is", null);

    if (dmErr) throw new Error(`DM query failed: ${dmErr.message}`);
    if (!dms || dms.length === 0) {
      return new Response(JSON.stringify({ status: "ok", summary: "no DMs with intel" }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    for (const dm of dms) {
      summary.scanned++;
      try {
        const sequence: TouchStep[] = dm.intel_package?.section_6_touch_sequence || [];
        if (!Array.isArray(sequence) || sequence.length === 0) { summary.skipped++; continue; }

        // Check if job was marked dead/qualified/customer — skip
        const { data: job } = await sb.from("jobs").select("priority, decay_pause_until").eq("id", dm.job_id).single();
        if (!job) { summary.skipped++; continue; }
        if (["dead", "qualified", "customer", "dormant"].includes(job.priority)) { summary.skipped++; continue; }
        if (job.decay_pause_until && new Date(job.decay_pause_until) > new Date()) { summary.skipped++; continue; }

        // Check suppressions
        if (dm.email) {
          const { data: sup } = await sb.from("suppressions_v2")
            .select("id").eq("channel", "email").eq("value", dm.email.toLowerCase()).maybeSingle();
          if (sup) { summary.skipped++; continue; }
        }

        // Get existing actions for this DM
        const { data: actions } = await sb.from("actions_queue")
          .select("id, step_number, status, scheduled_for, action_type")
          .eq("decision_maker_id", dm.id)
          .order("step_number", { ascending: true });

        const existingSteps = new Set((actions || []).map(a => a.step_number));
        // Find next touch step to queue
        // Day 0 is already queued by lead-intel (step 0). Start from day 1 onward.
        const daysElapsed = actions && actions.length > 0
          ? Math.floor((Date.now() - new Date(actions[0].scheduled_for).getTime()) / 86400000)
          : 0;

        // Find the next step in sequence whose day <= daysElapsed and whose step_number not yet in queue
        let queued = 0;
        for (let i = 1; i < sequence.length; i++) {
          const step = sequence[i];
          if (typeof step.day !== "number") continue;
          if (existingSteps.has(i)) continue;
          if (step.day > daysElapsed) break; // future day, wait
          // All prior steps must be completed (or failed) before advancing
          const prior = (actions || []).find(a => a.step_number === i - 1);
          if (prior && prior.status === "pending") break;
          if (prior && prior.status === "paused") break;

          const actionType = channelToActionType(step.channel || "");
          const firstName = dm.full_name?.split(" ")[0] || "";
          const scheduledFor = new Date();
          // Schedule for business hours — Tue/Wed/Thu 10am local
          const dayOfWeek = scheduledFor.getDay();
          if (dayOfWeek === 0) scheduledFor.setDate(scheduledFor.getDate() + 2); // Sunday -> Tuesday
          if (dayOfWeek === 6) scheduledFor.setDate(scheduledFor.getDate() + 3); // Saturday -> Tuesday
          scheduledFor.setHours(10, 0, 0, 0);

          const { error: insertErr } = await sb.from("actions_queue").insert({
            decision_maker_id: dm.id,
            job_id: dm.job_id,
            metro_slug: dm.metro_slug,
            step_number: i,
            action_type: actionType,
            title: `Day ${step.day}: ${step.action}`,
            body: step.script || "",
            script_snippets: dm.intel_package?.section_3_script_card || null,
            scheduled_for: scheduledFor.toISOString(),
            due_date: scheduledFor.toISOString().slice(0, 10),
            estimated_duration_min: actionType === "call" ? 5 : 10,
            status: "pending",
            sequence_type: "outreach",
          });
          if (!insertErr) queued++;
        }

        if (queued > 0) summary.advanced++;
      } catch (e) {
        summary.errors.push(`${dm.id}: ${(e as Error).message.slice(0, 200)}`);
      }
    }

    return new Response(JSON.stringify({ status: "ok", summary }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message, stack: (e as Error).stack?.slice(0, 500) }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
