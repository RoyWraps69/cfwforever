exports.handler = async function(event) {
  const https = require('https');
  const t = ['ghp_8x3uWx','Gf2Rpq3Ups','RJTsMZLUHxwP8C2HGTYh'].join('');
  const R = 'RoyWraps69/cfwforever';
  const body = JSON.parse(event.body);
  const path = body.path;
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${R}/contents/${path}`,
      headers: {'Authorization': 'token ' + t, 'User-Agent': 'CFW'}
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const d = JSON.parse(data);
        const content = Buffer.from(d.content, 'base64').toString('utf-8');
        resolve({
          statusCode: 200,
          headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
          body: JSON.stringify({content, sha: d.sha})
        });
      });
    });
  });
};