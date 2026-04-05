import fs from 'fs';
import path from 'path';

const src = fs.readFileSync('scripts/generate-static-pages.mjs','utf-8');
const matches = src.match(/url:\s*'([^']+)'/g);
const generatedUrls = new Set(matches.map(m => m.replace(/url:\s*'/,'').replace(/'/,'')));

const publicDir = 'public';
const allDirs = fs.readdirSync(publicDir).filter(d => {
  const p = path.join(publicDir, d, 'index.html');
  return fs.existsSync(p) && fs.statSync(path.join(publicDir, d)).isDirectory();
});

const handCrafted = allDirs.filter(d => {
  return !generatedUrls.has(d);
});

console.log('Generated pages:', generatedUrls.size);
console.log('Hand-crafted pages:', handCrafted.length);
console.log('\nHand-crafted page list:');
handCrafted.sort().forEach(d => {
  const html = fs.readFileSync(path.join(publicDir, d, 'index.html'), 'utf-8');
  const lines = html.split('\n').length;
  const hasSec = (html.match(/class="sec"/g) || []).length;
  const isRedirect = html.includes('http-equiv="refresh"') || html.includes("http-equiv='refresh'");
  const type = isRedirect ? 'REDIRECT' : (hasSec > 0 ? 'STYLED' : 'UNSTYLED');
  console.log(`  ${type.padEnd(10)} ${d} (${lines} lines, ${hasSec} .sec)`);
});
