// Quick test: process only 3 specific pages
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, '..', 'public');

// Copy 3 test pages to a temp dir
const testPages = ['electric', 'albany-park', 'ford-transit-wrap-chicago'];
const testDir = path.join(__dirname, '..', 'test-pages');
fs.mkdirSync(testDir, { recursive: true });

for (const p of testPages) {
  const src = path.join(PUBLIC, p, 'index.html');
  const dest = path.join(testDir, p + '.html');
  fs.copyFileSync(src, dest);
  const wc = fs.readFileSync(src, 'utf8').replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(/\s+/).length;
  console.log(`${p}: ${wc} words`);
}
console.log('Test pages copied to test-pages/');
