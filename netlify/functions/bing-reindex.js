// CFW Bing Reindex — runs from Roy's browser, no terminal needed.
// URL: https://chicagofleetwraps.com/.netlify/functions/bing-reindex
// Optional flags: ?recent=7  (only URLs with lastmod within N days)
//                 ?priority=1 (only top priority pages)

exports.handler = async (event) => {
  const SITE = "https://chicagofleetwraps.com";
  const HOST = "chicagofleetwraps.com";
  const BING_API_KEY = "59b6acb9938a4733a1e234e858c38859";
  const INDEXNOW_KEY = "b1d95b588bc440689702668f937d2cc5";
  const INDEXNOW_KEY_LOCATION = `${SITE}/${INDEXNOW_KEY}.txt`;

  const params = event.queryStringParameters || {};
  const recentDays = parseInt(params.recent || "0", 10);
  const priorityOnly = params.priority === "1";

  // 1. Pull live sitemap
  const log = [];
  let urls = [];
  try {
    const r = await fetch(`${SITE}/sitemap.xml`);
    const xml = await r.text();
    const re = /<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>(?:\s*<changefreq>[^<]+<\/changefreq>)?(?:\s*<priority>([^<]+)<\/priority>)?/g;
    const matches = [...xml.matchAll(re)];
    for (const m of matches) {
      const [, url, lastmod, priority] = m;
      if (recentDays > 0) {
        const cutoff = new Date(Date.now() - recentDays * 86400000);
        if (new Date(lastmod) < cutoff) continue;
      }
      if (priorityOnly && parseFloat(priority || "0") < 0.8) continue;
      urls.push(url);
    }
    log.push(`✅ Loaded ${urls.length} URLs from sitemap`);
  } catch (e) {
    log.push(`❌ Sitemap load failed: ${e.message}`);
    return jsonResp(500, { log });
  }

  if (!urls.length) {
    log.push("⚠ No URLs match filter — nothing to submit");
    return htmlResp(log, []);
  }

  const results = [];

  // 2. Submit sitemap to Bing
  try {
    const r = await fetch(
      `https://ssl.bing.com/webmaster/api.svc/json/SubmitFeed?apikey=${BING_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ siteUrl: SITE + "/", feedUrl: `${SITE}/sitemap.xml` }),
      }
    );
    const body = await r.text();
    results.push({ name: "Bing SubmitFeed (sitemap)", status: r.status, body: body.slice(0, 200) });
  } catch (e) {
    results.push({ name: "Bing SubmitFeed", status: 0, body: e.message });
  }

  // 3. Check Bing quota
  try {
    const r = await fetch(
      `https://ssl.bing.com/webmaster/api.svc/json/GetUrlSubmissionQuota?siteUrl=${SITE}/&apikey=${BING_API_KEY}`
    );
    const body = await r.text();
    results.push({ name: "Bing Quota", status: r.status, body: body.slice(0, 300) });
  } catch (e) {
    results.push({ name: "Bing Quota", status: 0, body: e.message });
  }

  // 4. Submit URL batches to Bing (max 500/batch per Bing API spec)
  const BING_BATCH = 500;
  for (let i = 0; i < urls.length; i += BING_BATCH) {
    const chunk = urls.slice(i, i + BING_BATCH);
    try {
      const r = await fetch(
        `https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlBatch?apikey=${BING_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({ siteUrl: SITE + "/", urlList: chunk }),
        }
      );
      const body = await r.text();
      results.push({
        name: `Bing SubmitUrlBatch (${chunk.length} URLs, batch ${Math.floor(i / BING_BATCH) + 1})`,
        status: r.status,
        body: body.slice(0, 200),
      });
    } catch (e) {
      results.push({ name: `Bing SubmitUrlBatch batch ${i / BING_BATCH + 1}`, status: 0, body: e.message });
    }
  }

  // 5. Submit via IndexNow (Bing endpoint first, fallback to api.indexnow.org)
  const INDEXNOW_BATCH = 10000;
  for (let i = 0; i < urls.length; i += INDEXNOW_BATCH) {
    const chunk = urls.slice(i, i + INDEXNOW_BATCH);
    const payload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: INDEXNOW_KEY_LOCATION,
      urlList: chunk,
    };
    let succeeded = false;
    for (const endpoint of ["https://www.bing.com/indexnow", "https://api.indexnow.org/IndexNow"]) {
      try {
        const r = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify(payload),
        });
        const body = await r.text();
        results.push({
          name: `IndexNow @ ${endpoint.replace("https://", "")} (${chunk.length} URLs)`,
          status: r.status,
          body: body.slice(0, 200) || "(empty body — usually means success)",
        });
        if (r.status === 200 || r.status === 202) {
          succeeded = true;
          break;
        }
      } catch (e) {
        results.push({ name: `IndexNow @ ${endpoint}`, status: 0, body: e.message });
      }
    }
    if (succeeded) break;
  }

  return htmlResp(log, results, urls);
};

function jsonResp(status, body) {
  return { statusCode: status, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body, null, 2) };
}

function htmlResp(log, results, urls = []) {
  const ok = results.filter((r) => r.status === 200 || r.status === 202).length;
  const total = results.length;
  const rows = results
    .map((r) => {
      const color = r.status === 200 || r.status === 202 ? "#0f0" : r.status === 0 ? "#888" : "#f55";
      return `<tr style="border-bottom:1px solid #222">
        <td style="padding:10px;color:${color};font-family:monospace">HTTP ${r.status || "ERR"}</td>
        <td style="padding:10px;color:#FFD700">${r.name}</td>
        <td style="padding:10px;color:#aaa;font-size:12px;font-family:monospace">${escapeHtml(r.body || "(empty)")}</td>
      </tr>`;
    })
    .join("");

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
    body: `<!DOCTYPE html><html><head><title>Bing Reindex — CFW</title></head>
<body style="font-family:'Barlow Condensed',sans-serif;background:#0a0a0a;color:#fff;padding:32px;max-width:1100px;margin:0 auto">
<h1 style="font-family:'Bebas Neue',sans-serif;color:#FFD700;font-size:2.4rem;letter-spacing:0.06em;margin:0 0 8px">BING REINDEX RESULT</h1>
<p style="color:#888;margin:0 0 24px">URLs submitted: <strong style="color:#FFD700">${urls.length}</strong> · Successful submissions: <strong style="color:#0f0">${ok}/${total}</strong> · Run at ${new Date().toISOString()}</p>

${log.length ? `<div style="background:#111;padding:16px;border-left:4px solid #FFD700;margin-bottom:24px;font-family:monospace;font-size:13px">${log.map((l) => escapeHtml(l)).join("<br>")}</div>` : ""}

<table style="width:100%;border-collapse:collapse;background:#111;border-radius:6px;overflow:hidden">
<thead><tr style="background:#FFD700;color:#0a0a0a"><th style="padding:12px;text-align:left;font-family:'Bebas Neue',sans-serif">Status</th><th style="padding:12px;text-align:left;font-family:'Bebas Neue',sans-serif">Action</th><th style="padding:12px;text-align:left;font-family:'Bebas Neue',sans-serif">Response</th></tr></thead>
<tbody>${rows}</tbody>
</table>

<div style="margin-top:32px;padding:20px;background:#111;border-radius:6px">
<p style="color:#aaa;margin:0 0 12px"><strong style="color:#FFD700">Re-run options:</strong></p>
<p style="margin:4px 0"><a href="?" style="color:#FFD700">↻ Re-run full submission (273 URLs)</a></p>
<p style="margin:4px 0"><a href="?recent=7" style="color:#FFD700">↻ Submit only URLs updated in last 7 days</a></p>
<p style="margin:4px 0"><a href="?priority=1" style="color:#FFD700">↻ Submit only top-priority pages (priority ≥ 0.8)</a></p>
</div>

<p style="color:#666;font-size:12px;margin-top:24px">If you see HTTP 403 from IndexNow with "UserForbiddedToAccessSite" — Bing's IndexNow auth layer takes 24–48h to propagate after BWT verification. Bing Webmaster API submissions still work and are the higher-leverage channel.</p>
</body></html>`,
  };
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}
