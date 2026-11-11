import test from 'node:test';
import assert from 'node:assert/strict';
import { parseInlineTokens, parseMessageBlocks } from '../src/utils/chatTextFormatter.js';

test('parseInlineTokens - parses bold markdown', () => {
  const result = parseInlineTokens('This is **bold text** here');
  assert.ok(Array.isArray(result));
  assert.equal(result.length, 3);
  assert.equal(result[0].content, 'This is ');
  assert.equal(result[1].type, 'bold');
  assert.equal(result[1].content, 'bold text');
  assert.equal(result[2].content, ' here');
});

test('parseInlineTokens - parses inline code backticks', () => {
  const result = parseInlineTokens('Use `isl-cedar-86` to join');
  assert.ok(Array.isArray(result));
  assert.equal(result.length, 3);
  assert.equal(result[0].content, 'Use ');
  assert.equal(result[1].type, 'code');
  assert.equal(result[1].content, 'isl-cedar-86');
  assert.equal(result[2].content, ' to join');
});

test('parseInlineTokens - parses italic text', () => {
  const result = parseInlineTokens('Here is *italicized* phrase');
  assert.ok(Array.isArray(result));
  assert.equal(result.length, 3);
  assert.equal(result[0].content, 'Here is ');
  assert.equal(result[1].type, 'italic');
  assert.equal(result[1].content, 'italicized');
  assert.equal(result[2].content, ' phrase');
});

test('parseInlineTokens - parses bold+italic text', () => {
  const result = parseInlineTokens('Very ***important*** point');
  assert.ok(Array.isArray(result));
  assert.equal(result[1].type, 'bold_italic');
  assert.equal(result[1].content, 'important');
});

test('parseInlineTokens - parses markdown links and raw URLs', () => {
  const mdLink = parseInlineTokens('Visit [Groq Docs](https://console.groq.com/docs) now');
  assert.equal(mdLink[1].type, 'link');
  assert.equal(mdLink[1].url, 'https://console.groq.com/docs');
  assert.equal(mdLink[1].label, 'Groq Docs');

  const rawUrl = parseInlineTokens('Go to https://sanket-isl.org for more');
  assert.equal(rawUrl[1].type, 'url');
  assert.equal(rawUrl[1].url, 'https://sanket-isl.org');
});

test('parseMessageBlocks - parses headings (# H1, ## H2, ### H3)', () => {
  const markdownText = `# Main Heading
## Second Heading
### Core purposes
Regular text`;

  const blocks = parseMessageBlocks(markdownText);
  assert.ok(blocks);
  assert.equal(blocks.length, 4);
  assert.equal(blocks[0].type, 'heading');
  assert.equal(blocks[0].level, 1);
  assert.equal(blocks[1].level, 2);
  assert.equal(blocks[2].level, 3);
  assert.equal(blocks[3].type, 'paragraph');
});

test('parseMessageBlocks - parses unordered lists and sub-bullets', () => {
  const text = `• Learn ISL Studio
- 7-level, self-paced course.
- Live skeleton-AI feedback.
• Video Call & Live Chat (BETA)
- Peer-to-peer WebRTC video rooms (e.g., isl-cedar-86).`;

  const blocks = parseMessageBlocks(text);
  assert.ok(blocks);
  assert.equal(blocks.length, 5);
  assert.equal(blocks[0].type, 'bullet');
  assert.equal(blocks[0].bulletType, 'root');
  assert.equal(blocks[1].type, 'bullet');
  assert.equal(blocks[1].bulletType, 'sub');
  assert.equal(blocks[2].type, 'bullet');
  assert.equal(blocks[2].bulletType, 'sub');
  assert.equal(blocks[3].type, 'bullet');
  assert.equal(blocks[3].bulletType, 'root');
  assert.equal(blocks[4].type, 'bullet');
  assert.equal(blocks[4].bulletType, 'sub');
});

test('parseMessageBlocks - parses ordered numbered lists', () => {
  const text = `1. Bring hands together
2. Bow head slightly
3. Release to neutral`;

  const blocks = parseMessageBlocks(text);
  assert.ok(blocks);
  assert.equal(blocks.length, 3);
  assert.equal(blocks[0].type, 'ordered');
  assert.equal(blocks[0].number, '1');
  assert.equal(blocks[1].number, '2');
  assert.equal(blocks[2].number, '3');
});

test('parseMessageBlocks - parses callouts, warnings and blockquotes', () => {
  const text = `⚠️ Groq models currently unavailable.
> Note: Camera permission is required for ISL detection.
💡 Tip: Keep hands in camera view.`;

  const blocks = parseMessageBlocks(text);
  assert.ok(blocks);
  assert.equal(blocks.length, 3);
  assert.equal(blocks[0].type, 'alert');
  assert.equal(blocks[0].alertType, 'warning');
  assert.equal(blocks[1].type, 'alert');
  assert.equal(blocks[1].alertType, 'quote');
  assert.equal(blocks[2].type, 'alert');
  assert.equal(blocks[2].alertType, 'tip');
});

test('parseMessageBlocks - parses fenced code blocks', () => {
  const text = `Here is sample code:
\`\`\`js
const sign = "NAMASTE";
console.log(sign);
\`\`\`
Done.`;

  const blocks = parseMessageBlocks(text);
  assert.ok(blocks);
  assert.equal(blocks.length, 3);
  assert.equal(blocks[0].type, 'paragraph');
  assert.equal(blocks[1].type, 'codeblock');
  assert.equal(blocks[1].language, 'js');
  assert.equal(blocks[2].type, 'paragraph');
});

test('parseMessageBlocks - handles empty text safely', () => {
  assert.deepEqual(parseMessageBlocks(''), []);
  assert.deepEqual(parseMessageBlocks(null), []);
});
