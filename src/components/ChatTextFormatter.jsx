import React, { useState } from 'react';
import { AlertCircle, Lightbulb, Info, Quote, Copy, Check } from 'lucide-react';
import {
  parseInlineTokens,
  parseMessageBlocks
} from '../utils/chatTextFormatter.js';

/**
 * ChatTextFormatter.jsx
 *
 * Rich, playful, high-readability Markdown formatter tailored for the Sanket
 * assistant in Duolingo / Modern Cartoon aesthetic.
 *
 * Features larger typography, crisp line heights, playful 3D step badges,
 * and high-contrast readable content.
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
            className={`font-mono text-xs sm:text-[13px] px-2 py-0.5 rounded-lg border font-bold select-all shadow-2xs ${
              isUser
                ? 'bg-amber-200/90 text-amber-950 border-amber-400'
                : 'bg-emerald-50 text-emerald-950 border-emerald-300'
            }`}
          >
            {token.content}
          </code>
        );
      case 'bold_italic':
        return (
          <strong key={`bi-${idx}`} className={`font-black ${isUser ? 'text-zinc-950' : 'text-zinc-900'}`}>
            <em className="italic">{token.content}</em>
          </strong>
        );
      case 'bold':
        return (
          <strong
            key={`b-${idx}`}
            className={`font-black ${isUser ? 'text-zinc-950' : 'text-zinc-900'}`}
          >
            {token.content}
          </strong>
        );
      case 'italic':
        return (
          <em key={`i-${idx}`} className="italic font-medium">
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
            className={`underline font-bold hover:opacity-80 break-all transition-opacity ${
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
            className={`underline font-bold hover:opacity-80 break-all transition-opacity ${
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

function CodeBlockItem({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="my-2.5 overflow-hidden rounded-2xl border-2 border-zinc-900 bg-zinc-950 text-zinc-100 shadow-[0_3px_0_0_#18181B]">
      <div className="bg-zinc-900/90 px-3 py-1.5 text-xs font-mono font-bold text-zinc-400 border-b border-zinc-800 flex items-center justify-between">
        <span className="uppercase tracking-wider text-[11px] text-zinc-300">
          {language || 'code'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title="Copy code to clipboard"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-3 text-xs sm:text-[13px] font-mono overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * Main ChatTextFormatter component
 */
export default function ChatTextFormatter({ text = '', isUser = false, className = '' }) {
  if (!text) return null;

  const blocks = parseMessageBlocks(text);

  return (
    <div className={`chat-formatted-text font-['Nunito',sans-serif] ${className}`}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading': {
            if (block.level === 1) {
              return (
                <h3
                  key={`h1-${i}`}
                  className="text-base sm:text-lg font-black text-zinc-900 border-b-2 border-zinc-100 pb-1.5 mt-3 mb-2 flex items-center gap-2"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#58CC02]" />
                  <span>{renderInlineContent(block.content, isUser)}</span>
                </h3>
              );
            }
            if (block.level === 2) {
              return (
                <h4
                  key={`h2-${i}`}
                  className="text-sm sm:text-base font-black text-zinc-900 mt-2.5 mb-1.5 flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>{renderInlineContent(block.content, isUser)}</span>
                </h4>
              );
            }
            if (block.level === 3) {
              return (
                <h5
                  key={`h3-${i}`}
                  className="text-xs sm:text-[13px] font-black uppercase tracking-wider text-emerald-800 border-b border-zinc-100 pb-1 mt-2.5 mb-1.5 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 bg-[#58CC02] rounded-full inline-block shrink-0" />
                  <span>{renderInlineContent(block.content, isUser)}</span>
                </h5>
              );
            }
            return (
              <h6
                key={`h4-${i}`}
                className="text-xs sm:text-[13px] font-extrabold text-zinc-800 mt-2 mb-1"
              >
                {renderInlineContent(block.content, isUser)}
              </h6>
            );
          }

          case 'alert': {
            const cleanContent = block.content.replace(/^[\p{Extended_Pictographic}\s]+/u, '');
            const AlertIcon =
              block.alertType === 'warning' ? AlertCircle :
              block.alertType === 'tip' ? Lightbulb :
              block.alertType === 'info' ? Info : Quote;
            return (
              <div
                key={`alert-${i}`}
                className={`p-3.5 rounded-2xl border-2 text-[14px] sm:text-[15px] leading-relaxed my-2 flex items-start gap-3 shadow-xs ${
                  isUser
                    ? 'bg-amber-100 border-amber-400 text-zinc-900'
                    : block.alertType === 'warning'
                    ? 'bg-rose-50 border-rose-300 text-rose-950 shadow-[0_3px_0_0_#FDA4AF]'
                    : block.alertType === 'tip'
                    ? 'bg-amber-50 border-amber-300 text-amber-950 shadow-[0_3px_0_0_#FCD34D]'
                    : 'bg-sky-50 border-sky-300 text-sky-950 shadow-[0_3px_0_0_#7DD3FC]'
                }`}
              >
                <div className={`p-1 rounded-lg shrink-0 mt-0.5 ${
                  block.alertType === 'warning' ? 'bg-rose-200 text-rose-800' :
                  block.alertType === 'tip' ? 'bg-amber-200 text-amber-900' :
                  block.alertType === 'info' ? 'bg-sky-200 text-sky-900' : 'bg-zinc-200 text-zinc-700'
                }`}>
                  <AlertIcon className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="flex-1 break-words font-semibold">
                  {renderInlineContent(cleanContent, isUser)}
                </div>
              </div>
            );
          }

          case 'ordered':
            return (
              <div key={`ol-${i}`} className="flex items-start gap-2.5 my-1.5">
                <span
                  className={`w-6 h-6 rounded-full font-black text-xs flex items-center justify-center shrink-0 select-none mt-0.5 ${
                    isUser
                      ? 'bg-amber-400 text-zinc-950 shadow-[0_2px_0_0_#D97706]'
                      : 'bg-[#58CC02] text-white shadow-[0_2px_0_0_#46A302]'
                  }`}
                >
                  {block.number}
                </span>
                <div className="flex-1 text-[15px] sm:text-[16px] font-semibold text-zinc-800 break-words leading-relaxed">
                  {renderInlineContent(block.content, isUser)}
                </div>
              </div>
            );

          case 'bullet':
            if (block.bulletType === 'sub') {
              return (
                <div
                  key={`subli-${i}`}
                  className={`flex items-start gap-2 my-1 ml-5 pl-2.5 border-l-2 ${
                    isUser ? 'border-amber-400/80 text-zinc-900' : 'border-[#58CC02]/40 text-zinc-700'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-2 shrink-0" />
                  <div className="flex-1 text-sm sm:text-[15px] font-semibold break-words leading-relaxed">
                    {renderInlineContent(block.content, isUser)}
                  </div>
                </div>
              );
            }
            return (
              <div key={`li-${i}`} className="flex items-start gap-2.5 my-1.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${
                    isUser ? 'bg-zinc-950' : 'bg-[#58CC02] shadow-[0_1px_0_0_#46A302]'
                  }`}
                />
                <div className="flex-1 text-[15px] sm:text-[16px] font-semibold text-zinc-800 break-words leading-relaxed">
                  {renderInlineContent(block.content, isUser)}
                </div>
              </div>
            );

          case 'codeblock':
            return <CodeBlockItem key={`codeblock-${i}`} code={block.code} language={block.language} />;

          case 'hr':
            return <hr key={`hr-${i}`} className="my-2.5 border-zinc-200" />;

          case 'empty':
            return <div key={`empty-${i}`} className="h-1.5" />;

          case 'paragraph':
          default:
            return (
              <p
                key={`p-${i}`}
                className={`my-1 text-[15px] sm:text-[16px] leading-[1.65] break-words ${
                  isUser ? 'font-bold text-zinc-950' : 'font-semibold text-zinc-800'
                }`}
              >
                {renderInlineContent(block.content, isUser)}
              </p>
            );
        }
      })}
    </div>
  );
}
