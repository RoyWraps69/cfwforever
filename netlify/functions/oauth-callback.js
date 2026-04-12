exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  const cid = process.env.GSC_CLIENT_ID;
  const cs = process.env.GSC_CLIENT_SECRET;
  const RT = process.env.GSC_REFRESH_TOKEN;
  const ru = "https://chicagofleetwraps.com/.netlify/functions/oauth-callback";
  const pg = (t,b) => ({statusCode:200,headers:{"Content-Type":"text/html"},body:`<!DOCTYPE html><html><body style="font-family:sans-serif;padding:40px;background:#0a0a0a;color:#fff;max-width:1100px;margin:0 auto"><h2 style="color:#FFD700">${t}</h2>${b}</body></html>`});
  if (q.error) return pg("Error",`<p style="color:#f66">${q.error}: ${q.error_description||""}</p>`);

  if (!q.code && RT) {
    const td = await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:cid,client_secret:cs,refresh_token:RT,grant_type:"refresh_token"}).toString()}).then(r=>r.json());
    const AT = td.access_token;
    if (!AT) return pg("Token Error",`<pre style="color:#f66">${JSON.stringify(td,null,2)}</pre>`);

    const SITE = "sc-domain:chicagofleetwraps.com";
    const call = (body) => fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`,{method:"POST",headers:{"Authorization":`Bearer ${AT}`,"Content-Type":"application/json"},body:JSON.stringify(body)}).then(r=>r.json());

    const [tot,qr,pr,prev,gmb_accounts] = await Promise.all([
      call({startDate:"2026-01-10",endDate:"2026-04-10",dimensions:[]}),
      call({startDate:"2026-01-10",endDate:"2026-04-10",dimensions:["query"],rowLimit:200}),
      call({startDate:"2026-01-10",endDate:"2026-04-10",dimensions:["page"],rowLimit:25}),
      call({startDate:"2025-10-01",endDate:"2026-01-09",dimensions:[]}),
      fetch("https://mybusinessaccountmanagement.googleapis.com/v1/accounts",{headers:{"Authorization":`Bearer ${AT}`}}).then(r=>r.json()),
    ]);

    const t=tot.rows?.[0]||{}, p=prev.rows?.[0]||{};
    const clickDelta = (t.clicks||0)-(p.clicks||0);
    const ctrDelta = ((t.ctr||0)-(p.ctr||0))*100;

    // GMB - get locations if accounts exist
    let gmbHtml = '';
    if (gmb_accounts.accounts && gmb_accounts.accounts.length > 0) {
      const acctName = gmb_accounts.accounts[0].name;
      const locs = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${acctName}/locations?readMask=name,title,websiteUri,regularHours,phoneNumbers`,{headers:{"Authorization":`Bearer ${AT}`}}).then(r=>r.json());
      gmbHtml = `<h3 style="color:#FFD700;margin:30px 0 12px">📍 Google Business Profile</h3>
      <div style="background:#111;border:1px solid #333;border-radius:4px;padding:20px;margin-bottom:30px">
        <p style="color:#aaa;font-size:12px;margin-bottom:8px">Account: ${gmb_accounts.accounts[0].accountName||acctName}</p>
        ${locs.locations ? locs.locations.map(l=>`<div><span style="color:#FFD700;font-weight:bold">${l.title||'Location'}</span> — ${l.websiteUri||'no website'}</div>`).join('') : `<pre style="color:#f66;font-size:11px">${JSON.stringify(locs,null,2).substring(0,300)}</pre>`}
      </div>`;
    } else {
      gmbHtml = `<h3 style="color:#FFD700;margin:30px 0 12px">📍 Google Business Profile</h3>
      <div style="background:#111;border:1px solid #333;border-radius:4px;padding:20px;margin-bottom:30px;color:#f66">
        <p>GMB: ${JSON.stringify(gmb_accounts).substring(0,200)}</p>
      </div>`;
    }

    const tbl = (rows,cols) => `<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:30px"><tr style="color:#888;border-bottom:1px solid #333">${cols.map(c=>`<th style="padding:8px;text-align:${c.r?'right':'left'}">${c.h}</th>`).join('')}</tr>${rows.map(r=>`<tr style="border-bottom:1px solid #111">${cols.map(c=>`<td style="padding:8px;text-align:${c.r?'right':'left'};${c.gold?'color:#FFD700':''}">${c.fn(r)}</td>`).join('')}</tr>`).join('')}</table>`;

    const zeroClick = (qr.rows||[]).filter(r=>r.clicks===0&&r.impressions>=50).sort((a,b)=>b.impressions-a.impressions);
    const lowCTR = (qr.rows||[]).filter(r=>r.ctr<0.01&&r.impressions>=200).sort((a,b)=>b.impressions-a.impressions);
    const top5 = (qr.rows||[]).filter(r=>r.position<=5&&r.impressions>=50).sort((a,b)=>b.impressions-a.impressions);

    const html = `
    <p style="color:#888;margin-bottom:24px">Jan 10 – Apr 10, 2026</p>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:36px">
      <div style="background:#111;padding:20px;border:1px solid #333;border-radius:4px"><div style="font-size:28px;color:#FFD700;font-weight:bold">${(t.clicks||0).toLocaleString()}</div><div style="color:#888;font-size:11px;margin-top:4px">Clicks</div><div style="font-size:11px;color:${clickDelta>=0?'#4f4':'#f66'};margin-top:4px">${clickDelta>=0?'+':''}${clickDelta} vs prev 90d</div></div>
      <div style="background:#111;padding:20px;border:1px solid #333;border-radius:4px"><div style="font-size:28px;color:#FFD700;font-weight:bold">${(t.impressions||0).toLocaleString()}</div><div style="color:#888;font-size:11px;margin-top:4px">Impressions</div></div>
      <div style="background:#111;padding:20px;border:1px solid #333;border-radius:4px"><div style="font-size:28px;color:#FFD700;font-weight:bold">${((t.ctr||0)*100).toFixed(2)}%</div><div style="color:#888;font-size:11px;margin-top:4px">CTR</div><div style="font-size:11px;color:${ctrDelta>=0?'#4f4':'#f66'};margin-top:4px">${ctrDelta>=0?'+':''}${ctrDelta.toFixed(2)}% vs prev</div></div>
      <div style="background:#111;padding:20px;border:1px solid #333;border-radius:4px"><div style="font-size:28px;color:#FFD700;font-weight:bold">${(t.position||0).toFixed(1)}</div><div style="color:#888;font-size:11px;margin-top:4px">Avg Position</div></div>
    </div>
    ${gmbHtml}
    <h3 style="color:#FFD700;margin-bottom:12px">🔴 CTR Killers — High Impressions, Zero Clicks</h3>
    ${tbl(zeroClick.slice(0,20),[{h:'Query',fn:r=>r.keys[0],gold:true},{h:'Impr',r:true,fn:r=>r.impressions.toLocaleString()},{h:'Pos',r:true,fn:r=>r.position.toFixed(1)}])}
    <h3 style="color:#FFD700;margin-bottom:12px">🟡 Low CTR — Ranking But Not Converting</h3>
    ${tbl(lowCTR.slice(0,15),[{h:'Query',fn:r=>r.keys[0],gold:true},{h:'Impr',r:true,fn:r=>r.impressions.toLocaleString()},{h:'CTR',r:true,fn:r=>(r.ctr*100).toFixed(2)+'%'},{h:'Pos',r:true,fn:r=>r.position.toFixed(1)}])}
    <h3 style="color:#FFD700;margin-bottom:12px">🟢 Top 5 Positions — Optimize CTR Here</h3>
    ${tbl(top5.slice(0,15),[{h:'Query',fn:r=>r.keys[0],gold:true},{h:'Clicks',r:true,fn:r=>r.clicks},{h:'Impr',r:true,fn:r=>r.impressions.toLocaleString()},{h:'CTR',r:true,fn:r=>(r.ctr*100).toFixed(1)+'%'},{h:'Pos',r:true,fn:r=>r.position.toFixed(1)}])}
    <h3 style="color:#FFD700;margin-bottom:12px">📄 Top Pages</h3>
    ${tbl((pr.rows||[]).slice(0,25),[{h:'Page',fn:r=>r.keys[0].replace('https://chicagofleetwraps.com','').replace('https://www.chicagofleetwraps.com',''),gold:true},{h:'Clicks',r:true,fn:r=>r.clicks},{h:'Impr',r:true,fn:r=>r.impressions.toLocaleString()},{h:'CTR',r:true,fn:r=>(r.ctr*100).toFixed(1)+'%'},{h:'Pos',r:true,fn:r=>r.position.toFixed(1)}])}
    <h3 style="color:#FFD700;margin-bottom:12px">📊 All Queries</h3>
    ${tbl((qr.rows||[]),[{h:'Query',fn:r=>r.keys[0],gold:true},{h:'Clicks',r:true,fn:r=>r.clicks},{h:'Impr',r:true,fn:r=>r.impressions.toLocaleString()},{h:'CTR',r:true,fn:r=>(r.ctr*100).toFixed(1)+'%'},{h:'Pos',r:true,fn:r=>r.position.toFixed(1)}])}`;

    return pg("🔍 CFW Dashboard — GSC + GMB",html);
  }

  if (!q.code) return pg("Ready","<p>No refresh token.</p>");
  const t2=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({code:q.code,client_id:cid,client_secret:cs,redirect_uri:ru,grant_type:"authorization_code"}).toString()}).then(r=>r.json());
  if(t2.refresh_token) return pg("SUCCESS ✅",`<div onclick="navigator.clipboard.writeText(this.innerText)" style="background:#111;border:2px solid #FFD700;border-radius:4px;padding:16px;font-family:monospace;font-size:12px;color:#FFD700;word-break:break-all;cursor:pointer">${t2.refresh_token}</div>`);
  return pg("Failed",`<pre style="color:#f66">${JSON.stringify(t2,null,2)}</pre>`);
};
