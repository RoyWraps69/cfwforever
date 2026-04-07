#!/usr/bin/env node
// trigger-build.mjs — trigger a Netlify build
// Usage: node scripts/trigger-build.mjs
import https from 'https';
const url = new URL('https://api.netlify.com/build_hooks/69d4bc7aadc9eee597add807');
const req = https.request({hostname:url.hostname,path:url.pathname,method:'POST',headers:{'Content-Type':'application/json'}}, r=>{
  console.log(`Build triggered: HTTP ${r.statusCode}`);
  console.log('Live in ~2 minutes: https://chicagofleetwraps.com');
});
req.write('{}'); req.end();
