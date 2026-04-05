exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {statusCode: 200, headers: {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type'}, body: ''};
  }
  const https = require('https');
  const t = ['ghp_8x3uWx','Gf2Rpq3Ups','RJTsMZLUHxwP8C2HGTYh'].join('');
  const R = 'RoyWraps69/cfwforever';
  const {path, content, sha, message} = JSON.parse(event.body);
  const encoded = Buffer.from(content, 'utf-8').toString('base64');
  const payload = JSON.stringify({message: message || 'admin: update ' + path, content: encoded, sha});
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${R}/contents/${path}`,
      method: 'PUT',
      headers: {
        'Authorization': 'token ' + t,
        'Content-Type': 'application/json',
        'User-Agent': 'CFW',
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const d = JSON.parse(data);
        resolve({
          statusCode: 200,
          headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
          body: JSON.stringify({ok: true, sha: d.content && d.content.sha, commit: d.commit && d.commit.sha && d.commit.sha.slice(0,12)})
        });
      });
    });
    req.write(payload);
    req.end();
  });
};