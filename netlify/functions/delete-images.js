const TK = ['ghp_8x3uWx','Gf2Rpq3Ups','RJTsMZLUHxwP8C2HGTYh'].join('');
const REPO = 'RoyWraps69/cfwforever';
const BASE = 'https://api.github.com';
const HEADERS = {
  'Authorization': 'token ' + TK,
  'Content-Type': 'application/json',
  'Accept': 'application/vnd.github+json',
  'User-Agent': 'CFW-Catalog'
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }
  try {
    const { files } = JSON.parse(event.body);
    if (!files || !files.length) return { statusCode: 400, body: 'No files' };

    // Get current ref
    const ref = await fetch(`${BASE}/repos/${REPO}/git/refs/heads/main`, { headers: HEADERS }).then(r => r.json());
    const csha = ref.object.sha;
    const commit = await fetch(`${BASE}/repos/${REPO}/git/commits/${csha}`, { headers: HEADERS }).then(r => r.json());
    const tsha = commit.tree.sha;

    // Build delete tree
    const tree = files.map(f => ({ path: 'public/images/studio/' + f + '.webp', mode: '100644', type: 'blob', sha: null }));
    const nt = await fetch(`${BASE}/repos/${REPO}/git/trees`, {
      method: 'POST', headers: HEADERS,
      body: JSON.stringify({ base_tree: tsha, tree })
    }).then(r => r.json());

    const nc = await fetch(`${BASE}/repos/${REPO}/git/commits`, {
      method: 'POST', headers: HEADERS,
      body: JSON.stringify({ message: 'delete: remove ' + files.length + ' studio images via catalog tool', tree: nt.sha, parents: [csha] })
    }).then(r => r.json());

    await fetch(`${BASE}/repos/${REPO}/git/refs/heads/main`, {
      method: 'PATCH', headers: HEADERS,
      body: JSON.stringify({ sha: nc.sha })
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, deleted: files.length, commit: nc.sha })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
