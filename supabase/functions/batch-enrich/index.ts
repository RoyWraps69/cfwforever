// CFW Batch Enrichment Orchestrator
// Runs on cron (nightly at 3am CT), processes top-fit uncontacted leads
// For each: lead-signals → lead-enrich → lead-intel
//
// POST { limit?: number, min_fit?: number, concurrency?: number, dry_run?: boolean }
// Defaults: limit=25, min_fit=60, concurrency=3
//
// Budget guardrail: stops if it would spend > $15 in Claude costs per run (roughly 150 leads)

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

async function invokeFn(slug: string, body: any, timeoutMs = 180000): Promise<{ ok: boolean; data: any; elapsed: number }> {
  const sbUrl = Deno.env.get("SUPABASE_URL")!;
  const sr = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const t0 = Date.now();
  try {
    const r = await fetch(`${sbUrl}/functions/v1/${slug}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sr}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
    const elapsed = Date.now() - t0;
    if (!r.ok) {
      const text = await r.text().catch(() => "");
      return { ok: false, data: { error: text.slice(0, 500), status: r.status }, elapsed };
    }
    return { ok: true, data: await r.json(), elapsed };
  } catch (e) {
    return { ok: false, data: { error: (e as Error).message }, elapsed: Date.now() - t0 };
  }
}

async function processOne(sb: any, jobId: string): Promise<any> {
  const log: any[] = [];

  // Phase 4a: signals
  const sig = await invokeFn("lead-signals", { job_id: jobId }, 60000);
  log.push({ phase: "signals", ok: sig.ok, elapsed_ms: sig.elapsed });
  if (!sig.ok) return { job_id: jobId, status: "signals_failed", log };

  // Phase A: enrich
  const en = await invokeFn("lead-enrich", { job_id: jobId, force: true }, 150000);
  log.push({
    phase: "enrich",
    ok: en.ok,
    elapsed_ms: en.elapsed,
    dm_id: en.data?.decision_maker_id,
    profile_mode: en.data?.steps?.find((s: any) => s.step === "profile_built")?.mode,
    contactability: en.data?.steps?.find((s: any) => s.step === "contactability_scored")?.score,
  });
  if (!en.ok || !en.data?.decision_maker_id) return { job_id: jobId, status: "enrich_failed", log };

  const dmId = en.data.decision_maker_id;

  // Phase B: intel
  const intel = await invokeFn("lead-intel", { decision_maker_id: dmId, force: false }, 150000);
  log.push({
    phase: "intel",
    ok: intel.ok,
    elapsed_ms: intel.elapsed,
    today_action: intel.data?.today_action_title,
  });

  return {
    job_id: jobId,
    dm_id: dmId,
    status: intel.ok ? "complete" : "intel_failed",
    log,
  };
}

async function processBatch(sb: any, jobs: any[], concurrency: number) {
  const results: any[] = [];
  let idx = 0;

  const workers = Array.from({ length: concurrency }, async () => {
    while (true) {
      const i = idx++;
      if (i >= jobs.length) break;
      const job = jobs[i];
      try {
        const result = await processOne(sb, job.id);
        result.customer_name = job.customer_name;
        result.fit_score = job.fit_score;
        results.push(result);
      } catch (e) {
        results.push({
          job_id: job.id,
          customer_name: job.customer_name,
          status: "exception",
          error: (e as Error).message,
        });
      }
    }
  });

  await Promise.all(workers);
  return results;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  const t0 = Date.now();
  try {
    const body = await req.json().catch(() => ({}));
    const limit = Math.min(body.limit || 25, 150);
    const minFit = body.min_fit || 60;
    const concurrency = Math.min(body.concurrency || 3, 5);
    const dryRun = !!body.dry_run;

    const sb = getClient();

    // Pick top uncontacted leads by fit_score
    const { data: jobs, error } = await sb.from("jobs")
      .select("id, customer_name, fit_score, industry_category, tier, source")
      .eq("metro_slug", "chicago")
      .eq("priority", "uncontacted")
      .gte("fit_score", minFit)
      .order("fit_score", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(`query failed: ${error.message}`);
    if (!jobs || jobs.length === 0) {
      return new Response(JSON.stringify({
        status: "no_candidates",
        message: `No uncontacted leads with fit_score >= ${minFit}`,
      }), { headers: { ...CORS, "Content-Type": "application/json" } });
    }

    if (dryRun) {
      return new Response(JSON.stringify({
        status: "dry_run",
        would_enrich: jobs.length,
        estimated_cost_usd: (jobs.length * 0.07).toFixed(2),
        estimated_time_min: Math.ceil((jobs.length * 60) / concurrency / 60),
        leads: jobs.slice(0, 10),
      }), { headers: { ...CORS, "Content-Type": "application/json" } });
    }

    // Mark leads as "enriching" so UI reflects immediately and we don't double-process
    const jobIds = jobs.map((j: any) => j.id);
    await sb.from("jobs").update({ enrichment_status: "enriching" }).in("id", jobIds);

    // Fire-and-forget background processing via EdgeRuntime.waitUntil
    // Parent returns 200 OK immediately; children run async up to 400s total
    const bgTask = (async () => {
      const startedAt = Date.now();
      try {
        const results = await processBatch(sb, jobs, concurrency);
        const byStatus: Record<string, number> = {};
        for (const r of results) byStatus[r.status] = (byStatus[r.status] || 0) + 1;
        await sb.from("engagement_events").insert({
          event_type: "batch_enrich_run",
          event_data: {
            total: results.length,
            by_status: byStatus,
            concurrency,
            elapsed_sec: Math.round((Date.now() - startedAt) / 1000),
            min_fit: minFit,
            results: results.map(r => ({
              job_id: r.job_id, name: r.customer_name, status: r.status,
              mode: r.log?.find((l: any) => l.phase === "enrich")?.profile_mode,
              contact: r.log?.find((l: any) => l.phase === "enrich")?.contactability,
            })),
          },
        }).catch(() => {});
      } catch (e) {
        await sb.from("engagement_events").insert({
          event_type: "batch_enrich_error",
          event_data: { error: (e as Error).message },
        }).catch(() => {});
      }
    })();

    // @ts-ignore EdgeRuntime is available in Supabase Edge Functions
    if (typeof EdgeRuntime !== "undefined") EdgeRuntime.waitUntil(bgTask);

    return new Response(JSON.stringify({
      status: "started",
      queued: jobs.length,
      concurrency,
      estimated_completion_min: Math.ceil((jobs.length * 60) / concurrency / 60),
      message: "Background enrichment running. Check /ops/leads/ in 2-10 min.",
      lead_ids: jobIds,
    }), { headers: { ...CORS, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message, stack: (e as Error).stack?.slice(0, 500) }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
