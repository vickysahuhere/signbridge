/**
 * Minimal Gemini client. The key comes from the .env file (VITE_GEMINI_API_KEY).
 * Vite inlines it at build/dev start, so restart `npm run dev` after editing .env.
 */
import { buildPageSystemInstruction } from './pageContextManager.js';

const KEY = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
const PRIMARY = (import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash').trim();
const MODELS = [...new Set([PRIMARY, 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash-lite'])];
const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export const hasGeminiKey = () => Boolean(KEY);

const VOICE_RULES =
  'You are speaking aloud. Reply in 1-3 short plain sentences. No markdown, no lists, no emoji.';

function friendly(status, detail = '') {
  if (status === 400 && /API key/i.test(detail)) return 'The Gemini key in .env looks invalid.';
  if (status === 401 || status === 403) return 'Gemini rejected the key. Check VITE_GEMINI_API_KEY in .env.';
  if (status === 429) return 'Free quota reached for now. Wait a minute and try again.';
  if (status >= 500) return 'Gemini is busy right now. Try again.';
  return 'Could not reach Gemini. Check your internet and key.';
}

/**
 * @param {{role:'user'|'assistant', text:string}[]} history  last message is the new user turn
 * @param {{page?:string, extraState?:object, voice?:boolean, lang?:string, signal?:AbortSignal}} opts
 * @returns {Promise<string>} reply text (throws Error with a friendly message)
 */
export async function askGemini(history, { page = 'home', extraState = {}, voice = false, lang = 'en', signal } = {}) {
  if (!KEY) throw new Error('NO_KEY');
  let system = buildPageSystemInstruction(page, extraState);
  if (lang === 'hi') system += '\nReply in Hindi (Devanagari) unless the user writes in English.';
  if (voice) system += `\n${VOICE_RULES}`;

  const contents = history
    .filter((m) => m.text)
    .slice(-12)
    .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.text }] }));

  let lastErr = new Error(friendly(0));
  for (const model of MODELS) {
    let res;
    try {
      res = await fetch(`${BASE}/${model}:generateContent`, {
        method: 'POST',
        signal,
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': KEY },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents,
          generationConfig: { temperature: 0.6, maxOutputTokens: voice ? 220 : 900 }
        })
      });
    } catch (e) {
      if (e.name === 'AbortError') throw e;
      lastErr = new Error(friendly(0));
      continue;
    }
    if (res.ok) {
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('').trim();
      if (text) return text;
      lastErr = new Error('Gemini returned an empty answer. Try rephrasing.');
      continue;
    }
    let detail = '';
    try { detail = (await res.json())?.error?.message || ''; } catch { /* ignore */ }
    lastErr = new Error(friendly(res.status, detail));
    if (res.status !== 404 && res.status !== 400) break; // only try the next model on "unknown model"
    if (res.status === 400 && /API key/i.test(detail)) break;
  }
  throw lastErr;
}
