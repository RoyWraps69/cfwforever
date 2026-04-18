
const https = require('https');

const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
const TO_EMAILS = ['roy@chicagofleetwraps.com', 'karigan@chicagofleetwraps.com'];
const FROM_EMAIL = 'roy@chicagofleetwraps.com';

async function post(hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const req = https.request({ hostname, path, method: 'POST', headers }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function getAccessToken() {
  const body = new URLSearchParams({
    client_id: GMAIL_CLIENT_ID,
    client_secret: GMAIL_CLIENT_SECRET,
    refresh_token: GMAIL_REFRESH_TOKEN,
    grant_type: 'refresh_token'
  }).toString();

  const res = await post('oauth2.googleapis.com', '/token', {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(body)
  }, body);

  const d = JSON.parse(res.body);
  if (!d.access_token) throw new Error('Gmail token failed: ' + res.body);
  return d.access_token;
}

function buildEmail(to, subject, html) {
  const msg = [
    `From: Chicago Fleet Wraps <${FROM_EMAIL}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    html
  ].join('\r\n');
  return Buffer.from(msg).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sendEmail(token, to, subject, html) {
  const body = JSON.stringify({ raw: buildEmail(to, subject, html) });
  const res = await post('gmail.googleapis.com', '/gmail/v1/users/me/messages/send', {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  }, body);
  if (res.status >= 300) throw new Error('Gmail send failed: ' + res.body);
}

function parseBody(body, contentType) {
  if (contentType && contentType.includes('application/json')) {
    return JSON.parse(body);
  }
  const params = new URLSearchParams(body);
  const obj = {};
  for (const [k, v] of params.entries()) obj[k] = v;
  return obj;
}

function buildEmailHTML(fields, formName) {
  const titles = {
    'contact': 'New Contact Form Submission',
    'bay-rental': 'New Bay Rental Request',
    'fleet-intake': 'New Fleet Intake Form',
    'schedule-install': 'New Install Appointment Request',
    'estimate-request': 'New Estimate Request'
  };
  const title = titles[formName] || 'New Form Submission';
  const skip = ['form-name', 'bot-field'];
  const rows = Object.entries(fields)
    .filter(([k]) => !skip.includes(k) && fields[k])
    .map(([k, v]) => `<tr><td style="padding:8px 12px;font-weight:700;text-transform:uppercase;font-size:12px;color:#666;white-space:nowrap;background:#f9f9f9;border:1px solid #eee">${k.replace(/_/g,' ')}</td><td style="padding:8px 12px;border:1px solid #eee">${v}</td></tr>`)
    .join('');

  return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
<div style="background:#0A0A0A;padding:20px 28px;border-bottom:3px solid #FFD700">
<span style="font-family:Georgia,serif;font-size:22px;color:#FFD700;letter-spacing:2px">CHICAGO FLEET WRAPS</span>
</div>
<div style="padding:24px 28px;background:#fff">
<h2 style="margin:0 0 20px;color:#0A0A0A;font-size:18px">${title}</h2>
<table style="width:100%;border-collapse:collapse">${rows}</table>
<div style="margin-top:24px;padding:16px;background:#fffbe6;border-left:4px solid #FFD700">
<p style="margin:0;font-size:13px;color:#555">Received: ${new Date().toLocaleString('en-US',{timeZone:'America/Chicago'})} CT</p>
</div>
</div>
</div>`;
}

exports.handler = async (event) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: cors, body: 'Method not allowed' };

  try {
    const fields = parseBody(event.body, event.headers['content-type']);
    const formName = fields['form-name'] || 'unknown';

    // Honeypot check
    if (fields['bot-field']) return { statusCode: 200, headers: cors, body: JSON.stringify({ ok: true }) };

    const titles = {
      'contact': 'New Contact Form — Chicago Fleet Wraps',
      'bay-rental': 'New Bay Rental Request — Chicago Fleet Wraps',
      'fleet-intake': 'New Fleet Intake — Chicago Fleet Wraps',
      'schedule-install': 'New Install Request — Chicago Fleet Wraps',
      'estimate-request': 'New Estimate Request — Chicago Fleet Wraps'
    };
    const subject = titles[formName] || `New Form Submission — ${formName}`;
    const html = buildEmailHTML(fields, formName);

    const token = await getAccessToken();
    for (const to of TO_EMAILS) {
      await sendEmail(token, to, subject, html);
    }

    return { statusCode: 200, headers: cors, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('form-mailer error:', err);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: err.message }) };
  }
};
