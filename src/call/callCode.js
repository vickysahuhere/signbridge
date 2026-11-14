// Call codes: 6 characters, no look-alikes (no 0/O, 1/I/L), shown as "K7M-2QX".
export const CODE_LENGTH = 6;
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateCallCode() {
  const bytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
}

export function normalizeCallCode(input = '') {
  return String(input)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .replace(/[01ILO]/g, (c) => ({ 0: 'O', 1: 'I', I: 'I', L: 'L', O: 'O' }[c]))
    .slice(0, CODE_LENGTH);
}

export function formatCallCode(code = '') {
  return code.length > 3 ? `${code.slice(0, 3)}-${code.slice(3)}` : code;
}

export const peerIdFor = (code) => `sanket-isl-${code.toLowerCase()}`;

export function readCodeFromUrl(search = '') {
  const p = new URLSearchParams(search);
  const raw = p.get('join') || p.get('code') || p.get('room') || '';
  const code = normalizeCallCode(raw);
  return code.length === CODE_LENGTH ? code : '';
}
