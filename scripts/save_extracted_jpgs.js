import fs from 'node:fs';
import path from 'node:path';

const outputFile = 'C:/Users/Vicky/.gemini/antigravity/brain/83891920-0cd0-4764-afd4-ef9b7e42ef6e/.system_generated/steps/736/output.txt';
const raw = fs.readFileSync(outputFile, 'utf8');

const marker = 'Result:\n';
const idx = raw.indexOf(marker);
if (idx === -1) {
  console.error('Could not find Result marker');
  process.exit(1);
}

const jsonStr = raw.substring(idx + marker.length).trim();
const data = JSON.parse(jsonStr);

const targetDir = path.resolve('public/signs');

for (const [name, base64] of Object.entries(data)) {
  if (!base64) {
    console.error('Missing data for:', name);
    continue;
  }
  const dest = path.join(targetDir, `${name}.jpg`);
  const buf = Buffer.from(base64, 'base64');
  fs.writeFileSync(dest, buf);
  console.log(`Saved ${dest} (${buf.length} bytes)`);
}
