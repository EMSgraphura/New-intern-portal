import fs from 'fs';
const content = fs.readFileSync('src/pages/HR/ActiveInternsPage.jsx', 'utf8');
const tags = new Set();
const regex = /<([A-Z][a-zA-Z0-9]*)/g;
let match;
while ((match = regex.exec(content)) !== null) {
  tags.add(match[1]);
}
console.log(Array.from(tags).sort());
