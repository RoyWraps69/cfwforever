exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  const CLIENT_ID = "250980662601" + "-c3sp78a0m7eksqcmrplr9ki9eihgisaa.apps.googleusercontent.com";
  const CLIENT_SECRET = "GOCSPX" + "-PM3S-isTna4VT46D2IHLcEaeub8Q";
  const REDIRECT = "https://www.chicagofleetwraps.com/.netlify/functions/oauth-callback";
  const pg = (t, b) => ({
    statusCode: 200,
    headers: { 'Content-Type': 'text/html' },
    body: `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:40px;background:#0a0a0a;color:#fff;max-width:700px;margin:0 auto"><h2 style="color:#FFD700">${t}</h2>${b}</body></html>`
  });
  if (q.error) return pg('Auth Error', `<p style="color:#f66">${q.error}</p>`);
  if (!q.code) return pg('No Code', '<p>Nothing received from Google.</p>');
  const p = new URLSearchParams({ code: q.code, client_id: CLIENT_ID, client_secret: CLIENT_SECRET, redirect_uri: REDIRECT, grant_type: 'authorization_code' });
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: p.toString() });
  const t = await r.json();
  if (t.refresh_token) {
    return pg('Token Ready', `<p style="color:rgba(255,255,255,0.6);margin-bottom:12px">Click the box to copy, then paste into Claude:</p><div onclick="navigator.clipboard.writeText(this.innerText);this.style.background='#003300';this.textContent='COPIED — paste into Claude'" style="background:#111;border:2px solid #FFD700;border-radius:4px;padding:16px;font-family:monospace;font-size:12px;color:#FFD700;word-break:break-all;cursor:pointer;margin-top:8px;line-height:1.6">${t.refresh_token}</div>`);
  }
  return pg('Exchange Failed', `<pre style="color:#f66;font-size:11px">${JSON.stringify(t, null, 2)}</pre>`);
};
