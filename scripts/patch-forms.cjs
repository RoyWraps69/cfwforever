// Post-build: inject data-netlify into forms stripped by build process
const fs = require('fs');
const path = require('path');

const patches = [
  {
    file: 'public/estimate/index.html',
    find: `<form action='/estimate/thank-you/' class='est-form-body' method='POST' name='estimate-request'>`,
    replace: `<form action='/estimate/thank-you/' class='est-form-body' data-netlify='true' data-netlify-honeypot='bot-field' method='POST' name='estimate-request'>
<input type='hidden' name='form-name' value='estimate-request' />`
  }
];

for (const patch of patches) {
  if (!fs.existsSync(patch.file)) {
    console.log(`SKIP (not found): ${patch.file}`);
    continue;
  }
  let html = fs.readFileSync(patch.file, 'utf8');
  if (html.includes('data-netlify')) {
    console.log(`OK (already patched): ${patch.file}`);
    continue;
  }
  if (!html.includes(patch.find)) {
    console.log(`WARN (find string missing): ${patch.file}`);
    console.log(`  Looking for: ${patch.find.slice(0, 80)}`);
    continue;
  }
  html = html.replace(patch.find, patch.replace);
  fs.writeFileSync(patch.file, html);
  console.log(`PATCHED: ${patch.file}`);
}
