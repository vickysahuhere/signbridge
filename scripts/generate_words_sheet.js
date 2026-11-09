import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ISL_WORD_LABELS, ISL_WORD_CATEGORIES } from '../src/ai/islWordLabels.js';
import { ISL_ALPHABET_GUIDE, ISL_ALPHABET_LABELS } from '../src/ai/islAlphabetLabels.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const LIVE_VISION_GLOSSES = new Set([
  'BAD', 'CALL', 'DRINK', 'EAT', 'FEVER', 'GOOD', 'HELLO', 'HELP',
  'LOVE', 'ME', 'MONEY', 'NAMASTE', 'NO', 'PAIN', 'PLEASE', 'SORRY',
  'STOP', 'TIME', 'WANT', 'WELCOME', 'YES', 'YOU'
]);

const categoryMap = new Map();
ISL_WORD_CATEGORIES.forEach(c => categoryMap.set(c.id, c.name));

// CSV Escaping helper
function escapeCsv(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

// 1. Generate ISL_Words_Sheet.csv
const wordsCsvHeader = ['ID', 'Gloss', 'English Translation', 'Category ID', 'Category Name', 'Live Vision Active', 'Gesture Description & Kinematics'];
const wordsCsvRows = [wordsCsvHeader.join(',')];

ISL_WORD_LABELS.forEach((w, idx) => {
  const isLive = LIVE_VISION_GLOSSES.has(w.gloss) ? 'YES' : 'NO';
  const catName = categoryMap.get(w.category) || w.category;
  wordsCsvRows.push([
    idx + 1,
    escapeCsv(w.gloss),
    escapeCsv(w.english),
    escapeCsv(w.category),
    escapeCsv(catName),
    escapeCsv(isLive),
    escapeCsv(w.description)
  ].join(','));
});

// 2. Generate ISL_Alphabet_Sheet.csv
const alphaCsvHeader = ['Letter/Digit', 'Category', 'ISL Mode', 'Teaching Tip', 'Gesture Description'];
const alphaCsvRows = [alphaCsvHeader.join(',')];

ISL_ALPHABET_GUIDE.forEach(item => {
  alphaCsvRows.push([
    escapeCsv(item.letter),
    escapeCsv(item.category),
    escapeCsv(item.type),
    escapeCsv(item.tip),
    escapeCsv(item.description)
  ].join(','));
});

// Add digits 0-9
for (let i = 0; i <= 9; i++) {
  alphaCsvRows.push([
    escapeCsv(String(i)),
    escapeCsv('Digit'),
    escapeCsv('Single-Handed Counting / ISL'),
    escapeCsv(`ISL Digit ${i}`),
    escapeCsv(`Authentic ISL numeral sign for digit ${i}.`)
  ].join(','));
}

// 3. Generate Markdown Catalog ISL_Words_Catalog.md
let mdContent = `# 🤟 Sanket (संकेत) — Complete ISL Vocabulary & Dictionary Sheet

This document catalogs **all 1,025 Indian Sign Language (ISL) words** and **all 36 Fingerspelling Alphabet & Digit signs** taught and recognized in **Sanket (SignBridge ISL)**.

---

## 📊 Summary Statistics
- **Total Vocabulary Words Taught**: ${ISL_WORD_LABELS.length} words
- **Fingerspelling Letters Taught**: 26 authentic two-handed ISL letters (A–Z)
- **Fingerspelling Digits Taught**: 10 numeral signs (0–9)
- **Direct 3D Kinematic Live-Vision Signs**: ${LIVE_VISION_GLOSSES.size} real-time gestures
- **Taxonomy Categories**: ${ISL_WORD_CATEGORIES.length} conversational domains
- **Standards Grounding**: Indian Sign Language Research and Training Centre (ISLRTC) & AI4Bharat INCLUDE benchmark

---

## 📂 Category Breakdown

| Category ID | Category Name | Word Count |
| :--- | :--- | :--- |
`;

ISL_WORD_CATEGORIES.forEach(cat => {
  const count = ISL_WORD_LABELS.filter(w => w.category === cat.id).length;
  mdContent += `| \`${cat.id}\` | **${cat.name}** | ${count} words |\n`;
});

mdContent += `\n---\n\n## 🔤 1. ISL Fingerspelling & Alphabets (A–Z)\n\n`;
mdContent += `| Letter | Type | Category | Quick Tip | How to Sign / Movement |\n`;
mdContent += `| :---: | :--- | :--- | :--- | :--- |\n`;

ISL_ALPHABET_GUIDE.forEach(item => {
  mdContent += `| **${item.letter}** | ${item.type} | ${item.category} | *${item.tip}* | ${item.description} |\n`;
});

mdContent += `\n---\n\n## 📖 2. Complete 1,025 ISL Conversational Vocabulary Sheet\n\n`;
mdContent += `| # | Gloss | English Meaning | Category | Live Vision | How to Sign / Handshape & Movement |\n`;
mdContent += `| :---: | :--- | :--- | :--- | :---: | :--- |\n`;

ISL_WORD_LABELS.forEach((w, idx) => {
  const isLiveBadge = LIVE_VISION_GLOSSES.has(w.gloss) ? '✅ Active' : '📋 Lexicon';
  const catName = categoryMap.get(w.category) || w.category;
  mdContent += `| ${idx + 1} | **\`${w.gloss}\`** | ${w.english} | ${catName} | ${isLiveBadge} | ${w.description} |\n`;
});

// Output targets
const targetDirs = [
  path.join(rootDir, 'documents'),
  path.join(rootDir, 'docs')
];

targetDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write CSV
  const wordsCsvPath = path.join(dir, 'ISL_Words_Sheet.csv');
  fs.writeFileSync(wordsCsvPath, wordsCsvRows.join('\n'), 'utf8');

  const alphaCsvPath = path.join(dir, 'ISL_Alphabet_Sheet.csv');
  fs.writeFileSync(alphaCsvPath, alphaCsvRows.join('\n'), 'utf8');

  // Write MD
  const mdPath = path.join(dir, 'ISL_Words_Catalog.md');
  fs.writeFileSync(mdPath, mdContent, 'utf8');

  console.log(`Generated files in: ${dir}`);
});

console.log('Successfully generated all vocabulary sheets!');
