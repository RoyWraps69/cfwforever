exports.handler = async (event) => {
  const cid = process.env.GSC_CLIENT_ID;
  const cs = process.env.GSC_CLIENT_SECRET;
  const RT = process.env.GSC_REFRESH_TOKEN;

  // Date range: trailing 90 days
  const today = new Date();
  const end = today.toISOString().slice(0, 10);
  const start = new Date(today.getTime() - 90 * 86400000).toISOString().slice(0, 10);

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: cid, client_secret: cs, refresh_token: RT, grant_type: "refresh_token"
    }).toString()
  });
  const td = await tokenRes.json();
  const AT = td.access_token;
  if (!AT) return { statusCode: 500, body: JSON.stringify(td) };

  const SITE = "sc-domain:chicagofleetwraps.com";
  const queryAPI = (body) => fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`,
    { method: "POST", headers: { "Authorization": `Bearer ${AT}`, "Content-Type": "application/json" }, body: JSON.stringify(body) }
  ).then(r => r.json());

  // Run all 3 queries in parallel: totals, top queries, top pages
  const [tot, perf, pages] = await Promise.all([
    queryAPI({ startDate: start, endDate: end, dimensions: [] }),
    queryAPI({ startDate: start, endDate: end, dimensions: ["query"], rowLimit: 25 }),
    queryAPI({ startDate: start, endDate: end, dimensions: ["page"], rowLimit: 50 })
  ]);
  const t = tot.rows?.[0] || {};

  // JSON mode for programmatic access
  const params = event.queryStringParameters || {};
  if (params.format === "json") {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        site: SITE, startDate: start, endDate: end,
        totals: t,
        topQueries: perf.rows || [],
        topPages: pages.rows || [],
        errors: { perf: perf.error, pages: pages.error }
      })
    };
  }

  // HTML dashboard (default)
  const html = `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:40px;background:#0a0a0a;color:#fff;max-width:1100px;margin:0 auto">
  <h2 style="color:#FFD700">GSC — chicagofleetwraps.com</h2>
  <p style="color:#888;margin-bottom:20px">${start} – ${end} (trailing 90 days)</p>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:30px">
    <div style="background:#111;padding:20px;border:1px solid #333;border-radius:4px"><div style="font-size:32px;color:#FFD700;font-weight:bold">${(t.clicks||0).toLocaleString()}</div><div style="color:#888;margin-top:4px;font-size:12px">Clicks</div></div>
    <div style="background:#111;padding:20px;border:1px solid #333;border-radius:4px"><div style="font-size:32px;color:#FFD700;font-weight:bold">${(t.impressions||0).toLocaleString()}</div><div style="color:#888;margin-top:4px;font-size:12px">Impressions</div></div>
    <div style="background:#111;padding:20px;border:1px solid #333;border-radius:4px"><div style="font-size:32px;color:#FFD700;font-weight:bold">${((t.ctr||0)*100).toFixed(2)}%</div><div style="color:#888;margin-top:4px;font-size:12px">CTR</div></div>
    <div style="background:#111;padding:20px;border:1px solid #333;border-radius:4px"><div style="font-size:32px;color:#FFD700;font-weight:bold">${(t.position||0).toFixed(1)}</div><div style="color:#888;margin-top:4px;font-size:12px">Avg Position</div></div>
  </div>

  <h3 style="color:#FFD700;margin-top:30px">Top pages (by clicks)</h3>
  <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:30px">
  <tr style="color:#888;border-bottom:1px solid #333;text-align:left"><th style="padding:10px">Page</th><th style="padding:10px;text-align:right">Clicks</th><th style="padding:10px;text-align:right">Impr</th><th style="padding:10px;text-align:right">CTR</th><th style="padding:10px;text-align:right">Pos</th></tr>
  ${(pages.rows||[]).slice(0, 25).map(r=>`<tr style="border-bottom:1px solid #1a1a1a"><td style="padding:10px;color:#FFD700;font-size:11px">${r.keys[0].replace('https://chicagofleetwraps.com','')}</td><td style="padding:10px;text-align:right">${r.clicks}</td><td style="padding:10px;text-align:right">${r.impressions}</td><td style="padding:10px;text-align:right">${(r.ctr*100).toFixed(1)}%</td><td style="padding:10px;text-align:right">${r.position.toFixed(1)}</td></tr>`).join('')}
  </table>

  <h3 style="color:#FFD700;margin-top:30px">Top queries</h3>
  <table style="width:100%;border-collapse:collapse;font-size:13px">
  <tr style="color:#888;border-bottom:1px solid #333;text-align:left"><th style="padding:10px">Query</th><th style="padding:10px;text-align:right">Clicks</th><th style="padding:10px;text-align:right">Impr</th><th style="padding:10px;text-align:right">CTR</th><th style="padding:10px;text-align:right">Pos</th></tr>
  ${(perf.rows||[]).map(r=>`<tr style="border-bottom:1px solid #1a1a1a"><td style="padding:10px;color:#FFD700">${r.keys[0]}</td><td style="padding:10px;text-align:right">${r.clicks}</td><td style="padding:10px;text-align:right">${r.impressions}</td><td style="padding:10px;text-align:right">${(r.ctr*100).toFixed(1)}%</td><td style="padding:10px;text-align:right">${r.position.toFixed(1)}</td></tr>`).join('')}
  </table>
  ${perf.error || pages.error ? `<pre style="color:#f66;margin-top:20px">${JSON.stringify({perf:perf.error, pages:pages.error})}</pre>` : ''}
  </body></html>`;

  return { statusCode: 200, headers: { "Content-Type": "text/html" }, body: html };
};
