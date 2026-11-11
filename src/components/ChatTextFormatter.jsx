import React from 'react';
import {
  parseInlineTokens,
  parseMessageBlocks
} from '../utils/chatTextFormatter.js';

/**
 * ChatTextFormatter.jsx
 *
 * Rich, zero-dependency Markdown & text formatter tailored for the Sanket
 * on-device chatbot assistant and user speech bubbles.
 *
 * Renders AST blocks and inline tokens with retro/cartoon styling.
 */

/**
 * Helper to render structured inline tokens to React nodes
 */
export function renderInlineContent(text, isUser = false) {
  if (!text || typeof text !== 'string') return text;

  const tokens = parseInlineTokens(text);

  return tokens.map((token, idx) => {
    switch (token.type) {
      case 'code':
        return (
          <code
            key={`c-${idx}`}
            className={`font-mono text-[11px] px-1 py-0.5 rounded border select-all ${
              isUser
                ? 'bg-amber-200/70 text-zinc-950 border-amber-400'
                : 'bg-zinc-100 text-amber-950 border-zinc-300 font-semibold'
            }`}
          >
            {token.content}
          </code>
        );
      case 'bold_italic':
        return (
          <strong key={`bi-${idx}`} className="font-black text-zinc-900">
            <em className="italic">{token.content}</em>
          </strong>
        );
      case 'bold':
        return (
          <strong
            key={`b-${idx}`}
            className={`font-bold ${isUser ? 'text-zinc-950 font-black' : 'text-zinc-900'}`}
          >
            {token.content}
          </strong>
        );
      case 'italic':
        return (
          <em key={`i-${idx}`} className="italic">
            {token.content}
          </em>
        );
      case 'link':
        return (
          <a
            key={`link-${idx}`}
            href={token.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`underline font-medium hover:opacity-80 break-all ${
              isUser ? 'text-blue-900' : 'text-blue-600'
            }`}
          >
            {token.label}
          </a>
        );
      case 'url':
        return (
          <a
            key={`url-${idx}`}
            href={token.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`underline font-medium hover:opacity-80 break-all ${
              isUser ? 'text-blue-900' : 'text-blue-600'
            }`}
          >
            {token.url}
          </a>
        );
      case 'text':
      default:
        return token.content;
    }
  });
}

/**
 * Main ChatTextFormatter component
 */
export default function ChatTextFormatter({ text = '', isUser = false, className = '' }) {
  if (!text) return null;

  const blocks = parseMessageBlocks(text);

  return (
    <div className={`chat-formatted-text ${className}`}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading': {
            if (block.level === 1) {
              return (
                <h3
                  key={`h1-${i}`}
                  className="text-xs font-black text-zinc-900 border-b border-zinc-200 pb-1 mt-2.5 mb-1 flex items-center gap-1.5"
                >
                  {renderInlineContent(block.content, isUser)}
                </h3>
              );
            }
            if (block.level === 2) {
              return (
                <h4
                  key={`h2-${i}`}
                  className="text-xs font-black text-zinc-900 mt-2 mb-1 flex items-center gap-1.5"
                >
                  {renderInlineContent(block.content, isUser)}
                </h4>
              );
            }
            if (block.level === 3) {
              return (
                <h5
                  key={`h3-${i}`}
                  className="text-[11px] font-black uppercase tracking-wider text-zinc-800 border-b border-zinc-100 pb-0.5 mt-2 mb-1 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full inline-block shrink-0" />
                  <span>{renderInlineContent(block.content, isUser)}</span>
                </h5>
              );
            }
            return (
              <h6
                key={`h4-${i}`}
                className="text-[11px] font-bold text-zinc-700 mt-1.5 mb-0.5"
              >
                {renderInlineContent(block.content, isUser)}
              </h6>
            );
          }

          case 'alert':
            return (
              <div
                key={`alert-${i}`}
                className={`p-2 rounded-lg border text-[11px] leading-relaxed my-1.5 flex items-start gap-1.5 shadow-xs ${
                  isUser
                    ? 'bg-amber-100 border-amber-400 text-zinc-900'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
              >
                <div className="flex-1 break-words">
                  {renderInlineContent(block.content, isUser)}
                </div>
              </div>
            );

          case 'ordered':
            return (
              <div key={`ol-${i}`} className="flex items-start gap-1.5 my-1">
                <span
                  className={`font-mono font-bold text-[10px] px-1 py-0.2 rounded border select-none leading-tight mt-0.5 shrink-0 ${
                    isUser
                      ? 'bg-amber-300 text-zinc-950 border-amber-500'
                      : 'bg-zinc-100 text-zinc-800 border-zinc-300'
                  }`}
                >
                  {block.number}
                </span>
                <div className="flex-1 break-words">
                  {renderInlineContent(block.content, isUser)}
                </div>
              </div>
            );

          case 'bullet':
            if (block.bulletType === 'sub') {
              return (
                <div
                  key={`subli-${i}`}
                  className={`flex items-start gap-1.5 my-0.5 ml-3.5 pl-1.5 border-l-2 ${
                    isUser ? 'border-amber-400/80 text-zinc-900' : 'border-zinc-200 text-zinc-700'
                  }`}
                >
                  <span className="text-zinc-400 font-bold text-[10px] select-none mt-0.5 shrink-0">
                    ◦
                  </span>
                  <div className="flex-1 break-words">
                    {renderInlineContent(block.content, isUser)}
                  </div>
                </div>
              );
            }
            return (
              <div key={`li-${i}`} className="flex items-start gap-1.5 my-1">
                <span
                  className={`font-black text-xs leading-none select-none mt-0.5 shrink-0 ${
                    isUser ? 'text-zinc-950' : 'text-amber-500'
                  }`}
                >
                  •
                </span>
                <div className="flex-1 break-words">
                  {renderInlineContent(block.content, isUser)}
                </div>
              </div>
            );

          case 'codeblock':
            return (
              <div
                key={`codeblock-${i}`}
                className="my-1.5 overflow-hidden rounded-lg border-2 border-zinc-900 bg-zinc-950 text-zinc-100 shadow-sm"
              >
                {block.language && (
                  <div className="bg-zinc-900 px-2.5 py-1 text-[10px] font-mono text-zinc-400 border-b border-zinc-800">
                    {block.language}
                  </div>
                )}
                <pre className="p-2.5 text-[11px] font-mono overflow-x-auto leading-relaxed">
                  <code>{block.code}</code>
                </pre>
              </div>
            );

          case 'hr':
            return <hr key={`hr-${i}`} className="my-2 border-zinc-200" />;

          case 'empty':
            return <div key={`empty-${i}`} className="h-1.5" />;

          case 'paragraph':
          default:
            return (
              <p key={`p-${i}`} className="my-1 leading-relaxed break-words">
                {renderInlineContent(block.content, isUser)}
              </p>
            );
        }
      })}
    </div>
  );
}
