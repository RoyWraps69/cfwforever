/**
 * Injects <script src="/js/gmb-live.js" defer></script> into all public HTML files
 * that don't already have it. Run once: node scripts/inject-gmb-script.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { globSync } from 'glob';

const GMB_TAG = '<script src="/js/gmb-live.js" defer></script>';
const files = globSync('public/**/index.html');

let updated = 0;
let skipped = 0;
let noScript = 0;

for (const file of files) {
  let html = readFileSync(file, 'utf-8');
  
  // Skip if already has gmb-live.js
  if (html.includes('gmb-live.js')) {
    skipped++;
    continue;
  }

  // Try to insert before the redirect <script> tag (two patterns)
  const pattern1 = '</footer><script>if(window.history';
  const pattern2 = '</footer>\n<script>if(window.history';
  const pattern3 = '</footer>\r\n<script>if(window.history';

  if (html.includes(pattern1)) {
    html = html.replace(pattern1, `</footer>${GMB_TAG}<script>if(window.history`);
    writeFileSync(file, html);
    updated++;
  } else if (html.includes(pattern2)) {
    html = html.replace(pattern2, `</footer>\n${GMB_TAG}\n<script>if(window.history`);
    writeFileSync(file, html);
    updated++;
  } else if (html.includes(pattern3)) {
    html = html.replace(pattern3, `</footer>\r\n${GMB_TAG}\r\n<script>if(window.history`);
    writeFileSync(file, html);
    updated++;
  } else {
    // Files without the standard redirect script (brand-audit, calculator, rent-the-bay, schedule)
    // Try inserting before </body>
    if (html.includes('</body>')) {
      html = html.replace('</body>', `${GMB_TAG}\n</body>`);
      writeFileSync(file, html);
      updated++;
    } else {
      noScript++;
      console.log(`⚠️  No injection point found: ${file}`);
    }
  }
}

console.log(`✅ Updated: ${updated} files`);
console.log(`⏭️  Already had gmb-live.js: ${skipped} files`);
if (noScript) console.log(`⚠️  No injection point: ${noScript} files`);
console.log(`📄 Total scanned: ${files.length} files`);
