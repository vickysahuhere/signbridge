/**
 * chatTextFormatter.js
 *
 * Lightweight, zero-dependency Markdown & text parser for Sanket AI chatbot.
 * Converts raw assistant/user responses into structured AST tokens and blocks.
 *
 * Supported constructs:
 * - Headings: # H1, ## H2, ### H3, #### H4
 * - Inline formatting: **bold**, *italic*, ***bold+italic***, `code`
 * - Links: [label](url), raw URLs (https://...)
 * - Unordered bullet lists: root bullets (•, -, *), nested sub-bullets (  - item)
 * - Ordered lists: 1. item, 2. item
 * - Callout alerts: ⚠️, 💡, ℹ️, ❗, > quote
 * - Fenced code blocks: ```lang ... ```
 * - Horizontal rules: ---, ***, ___
 */

/**
 * Tokenizes an inline string into structured inline tokens.
 * @param {string} text
 * @returns {Array<{ type: string, content?: string, label?: string, url?: string }>}
 */
export function parseInlineTokens(text) {
  if (!text || typeof text !== 'string') return [];

  // Match:
  // 1: `code`
  // 2: ***bold+italic***
  // 3: **bold**
  // 4: *italic*
  // 5: [label](url)
  // 6: https?://...
  const tokenRegex = /(`[^`]+`|\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\(https?:\/\/[^\s)]+\)|https?:\/\/[^\s<)]+)/g;

  const tokens = [];
  let lastIndex = 0;
  let match;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: 'text',
        content: text.substring(lastIndex, match.index)
      });
    }

    const token = match[0];

    if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
      tokens.push({
        type: 'code',
        content: token.slice(1, -1)
      });
    } else if (token.startsWith('***') && token.endsWith('***') && token.length >= 6) {
      tokens.push({
        type: 'bold_italic',
        content: token.slice(3, -3)
      });
    } else if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
      tokens.push({
        type: 'bold',
        content: token.slice(2, -2)
      });
    } else if (token.startsWith('*') && token.endsWith('*') && token.length >= 2) {
      tokens.push({
        type: 'italic',
        content: token.slice(1, -1)
      });
    } else if (token.startsWith('[') && token.includes('](') && token.endsWith(')')) {
      const closingBracket = token.indexOf('](');
      const label = token.slice(1, closingBracket);
      const url = token.slice(closingBracket + 2, -1);
      tokens.push({
        type: 'link',
        label,
        url
      });
    } else if (token.startsWith('http://') || token.startsWith('https://')) {
      tokens.push({
        type: 'url',
        url: token
      });
    } else {
      tokens.push({
        type: 'text',
        content: token
      });
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    tokens.push({
      type: 'text',
      content: text.substring(lastIndex)
    });
  }

  return tokens;
}

/**
 * Parses full message text into structured block tokens.
 * @param {string} text
 * @returns {Array<Object>}
 */
export function parseMessageBlocks(text) {
  if (!text || typeof text !== 'string') return [];

  const rawLines = text.split('\n');
  const blocks = [];
  let inCodeBlock = false;
  let codeBlockLines = [];
  let codeBlockLang = '';

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmed = line.trim();

    // Fenced Code Block Toggle
    if (trimmed.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockLang = trimmed.slice(3).trim();
        codeBlockLines = [];
      } else {
        inCodeBlock = false;
        blocks.push({
          type: 'codeblock',
          language: codeBlockLang,
          code: codeBlockLines.join('\n')
        });
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      blocks.push({ type: 'hr' });
      continue;
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      blocks.push({
        type: 'heading',
        level: 1,
        content: trimmed.substring(2)
      });
      continue;
    }
    if (trimmed.startsWith('## ')) {
      blocks.push({
        type: 'heading',
        level: 2,
        content: trimmed.substring(3)
      });
      continue;
    }
    if (trimmed.startsWith('### ')) {
      blocks.push({
        type: 'heading',
        level: 3,
        content: trimmed.substring(4)
      });
      continue;
    }
    if (trimmed.startsWith('#### ')) {
      blocks.push({
        type: 'heading',
        level: 4,
        content: trimmed.substring(5)
      });
      continue;
    }

    // Callout / Alert / Blockquote
    if (
      trimmed.startsWith('> ') ||
      trimmed.startsWith('⚠️') ||
      trimmed.startsWith('💡') ||
      trimmed.startsWith('ℹ️') ||
      trimmed.startsWith('❗')
    ) {
      let alertType = 'quote';
      if (trimmed.startsWith('⚠️') || trimmed.startsWith('❗')) alertType = 'warning';
      else if (trimmed.startsWith('💡')) alertType = 'tip';
      else if (trimmed.startsWith('ℹ️')) alertType = 'info';

      const content = trimmed.startsWith('> ') ? trimmed.substring(2) : trimmed;
      blocks.push({
        type: 'alert',
        alertType,
        content
      });
      continue;
    }

    // Numbered ordered list: 1. Item
    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      blocks.push({
        type: 'ordered',
        number: orderedMatch[1],
        content: orderedMatch[2]
      });
      continue;
    }

    // Sub-bullet / Indented list item:
    // Starts with 2+ spaces/tabs + bullet, or a hyphen after a bullet line
    const isIndentedBullet =
      line.match(/^(\s{2,}|\t)[•\-\*]\s+(.*)$/) ||
      (line.startsWith('- ') &&
        i > 0 &&
        (rawLines[i - 1].trim().startsWith('• ') ||
          rawLines[i - 1].trim().startsWith('- ') ||
          rawLines[i - 1].trim().startsWith('* ')));

    if (isIndentedBullet) {
      const content = trimmed.replace(/^[•\-\*]\s+/, '');
      blocks.push({
        type: 'bullet',
        bulletType: 'sub',
        content
      });
      continue;
    }

    // Standard Bullet list item: • item, - item, * item
    if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const content = trimmed.substring(2);
      blocks.push({
        type: 'bullet',
        bulletType: 'root',
        content
      });
      continue;
    }

    // Empty line spacer
    if (!trimmed) {
      blocks.push({ type: 'empty' });
      continue;
    }

    // Standard paragraph
    blocks.push({
      type: 'paragraph',
      content: line
    });
  }

  // Handle unclosed code block gracefully
  if (inCodeBlock && codeBlockLines.length > 0) {
    blocks.push({
      type: 'codeblock',
      language: codeBlockLang,
      code: codeBlockLines.join('\n')
    });
  }

  return blocks;
}
