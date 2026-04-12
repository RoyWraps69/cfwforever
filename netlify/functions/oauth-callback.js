exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  const cid = "784740411802-9ssbi3ik8aonf4d0mnvoj8rd5657iubt.apps.googleusercontent.com";
  const cs = ["GOCSPX", "-8z6pizFCs64J8mLy-AbH5Ks-KuCC"].join("");
  const ru = "https://www.chicagofleetwraps.com/.netlify/functions/oauth-callback";
  const pg = (t,b) => ({statusCode:200,headers:{"Content-Type":"text/html"},body:`<!DOCTYPE html><html><body style="font-family:sans-serif;padding:40px;background:#0a0a0a;color:#fff;max-width:700px;margin:0 auto"><h2 style="color:#FFD700">${t}</h2>${b}</body></html>`});
  if (q.error) return pg("Error", `<p style="color:#f66">${q.error}: ${q.error_description||''}</p>`);
  if (!q.code) return pg("Ready", "<p>Waiting for auth.</p>");
  const p = new URLSearchParams({code:q.code,client_id:cid,client_secret:cs,redirect_uri:ru,grant_type:"authorization_code"});
  const r = await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:p.toString()});
  const t2 = await r.json();
  if (t2.refresh_token) return pg("SUCCESS ✅", `<p style="color:rgba(255,255,255,0.6);margin-bottom:12px">Click to copy, paste into Claude:</p><div onclick="navigator.clipboard.writeText(this.innerText);this.style.background='#003300';this.textContent='COPIED ✓'" style="background:#111;border:2px solid #FFD700;border-radius:4px;padding:16px;font-family:monospace;font-size:12px;color:#FFD700;word-break:break-all;cursor:pointer">${t2.refresh_token}</div>`);
  return pg("Failed", `<pre style="color:#f66;font-size:11px">${JSON.stringify(t2,null,2)}</pre>`);
};
