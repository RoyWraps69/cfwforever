exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  const cid = process.env.GSC_CLIENT_ID;
  const cs = process.env.GSC_CLIENT_SECRET;
  const RT = process.env.GSC_REFRESH_TOKEN;
  const ru = "https://chicagofleetwraps.com/.netlify/functions/oauth-callback";
  const pg = (t,b) => ({statusCode:200,headers:{"Content-Type":"text/html"},body:`<!DOCTYPE html><html><body style="font-family:sans-serif;padding:40px;background:#0a0a0a;color:#fff;max-width:900px;margin:0 auto"><h2 style="color:#FFD700">${t}</h2>${b}</body></html>`});
  if (q.error) return pg("Error", `<p style="color:#f66">${q.error}: ${q.error_description||""}</p>`);

  // Load GSC data using stored refresh token
  if (!q.code && RT) {
    const td = await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:cid,client_secret:cs,refresh_token:RT,grant_type:"refresh_token"}).toString()}).then(r=>r.json());
    const AT = td.access_token;
    if (!AT) return pg("Token Error",`<pre style="color:#f66">${JSON.stringify(td,null,2)}</pre>`);
    const SITE = "sc-domain:chicagofleetwraps.com";
    const [perf,tot] = await Promise.all([
      fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`,{method:"POST",headers:{"Authorization":`Bearer ${AT}`,"Content-Type":"application/json"},body:JSON.stringify({startDate:"2026-01-10",endDate:"2026-04-10",dimensions:["query"],rowLimit:25})}).then(r=>r.json()),
      fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`,{method:"POST",headers:{"Authorization":`Bearer ${AT}`,"Content-Type":"application/json"},body:JSON.stringify({startDate:"2026-01-10",endDate:"2026-04-10",dimensions:[]})}).then(r=>r.json())
    ]);
    const t=tot.rows?.[0]||{};
    let html=`<p style="color:#888;margin-bottom:20px">Jan 10 – Apr 10, 2026</p><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:30px"><div style="background:#111;padding:20px;border:1px solid #333;border-radius:4px"><div style="font-size:32px;color:#FFD700;font-weight:bold">${(t.clicks||0).toLocaleString()}</div><div style="color:#888;font-size:12px;margin-top:4px">Clicks</div></div><div style="background:#111;padding:20px;border:1px solid #333;border-radius:4px"><div style="font-size:32px;color:#FFD700;font-weight:bold">${(t.impressions||0).toLocaleString()}</div><div style="color:#888;font-size:12px;margin-top:4px">Impressions</div></div><div style="background:#111;padding:20px;border:1px solid #333;border-radius:4px"><div style="font-size:32px;color:#FFD700;font-weight:bold">${((t.ctr||0)*100).toFixed(2)}%</div><div style="color:#888;font-size:12px;margin-top:4px">CTR</div></div><div style="background:#111;padding:20px;border:1px solid #333;border-radius:4px"><div style="font-size:32px;color:#FFD700;font-weight:bold">${(t.position||0).toFixed(1)}</div><div style="color:#888;font-size:12px;margin-top:4px">Avg Position</div></div></div><table style="width:100%;border-collapse:collapse;font-size:13px"><tr style="color:#888;border-bottom:1px solid #333;text-align:left"><th style="padding:10px">Query</th><th style="padding:10px;text-align:right">Clicks</th><th style="padding:10px;text-align:right">Impr</th><th style="padding:10px;text-align:right">CTR</th><th style="padding:10px;text-align:right">Pos</th></tr>`;
    for(const r of perf.rows||[]) html+=`<tr style="border-bottom:1px solid #1a1a1a"><td style="padding:10px;color:#FFD700">${r.keys[0]}</td><td style="padding:10px;text-align:right">${r.clicks}</td><td style="padding:10px;text-align:right">${r.impressions}</td><td style="padding:10px;text-align:right">${(r.ctr*100).toFixed(1)}%</td><td style="padding:10px;text-align:right">${r.position.toFixed(1)}</td></tr>`;
    html+=`</table>${perf.error?`<pre style="color:#f66;margin-top:20px">${JSON.stringify(perf.error)}</pre>`:""}`;
    return pg("✅ GSC — chicagofleetwraps.com",html);
  }

  if (!q.code) return pg("Ready","<p>Waiting for auth code.</p>");
  const t2=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({code:q.code,client_id:cid,client_secret:cs,redirect_uri:ru,grant_type:"authorization_code"}).toString()}).then(r=>r.json());
  if(t2.refresh_token) return pg("SUCCESS ✅",`<div onclick="navigator.clipboard.writeText(this.innerText)" style="background:#111;border:2px solid #FFD700;border-radius:4px;padding:16px;font-family:monospace;font-size:12px;color:#FFD700;word-break:break-all;cursor:pointer">${t2.refresh_token}</div>`);
  return pg("Failed",`<pre style="color:#f66">${JSON.stringify(t2,null,2)}</pre>`);
};
// v1775993191
