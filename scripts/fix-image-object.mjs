import { readFileSync, writeFileSync } from 'fs';

const file = 'public/site.html';
let html = readFileSync(file, 'utf-8');

const before = (html.match(/"image":\{"@type":"ImageObject"/g) || []).length;

// Replace {"@type":"ImageObject","url":"<URL>","width":1200,"height":630} with just "<URL>"
html = html.replace(
  /"image":\{"@type":"ImageObject","url":"([^"]+)","width":\d+,"height":\d+\}/g,
  '"image":"$1"'
);

const after = (html.match(/"image":\{"@type":"ImageObject"/g) || []).length;
console.log(`Replaced ${before - after} ImageObject instances (${after} remaining)`);

writeFileSync(file, html);
console.log('Done.');
