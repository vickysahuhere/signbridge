/**
 * On-device store + matcher for user-taught signs.
 * A sample is a short clip of normalized 240-float frames. Matching is a per-frame
 * k-nearest-neighbour on hand shape (+ body position for words), with a hold check.
 */
import { useSyncExternalStore } from 'react';

export const FEATURE_DIM = 240;
export const MAX_SAMPLE_FRAMES = 40;
const STORAGE_KEY = 'sanket_custom_signs_v2';

/* ---------- frame helpers ---------- */

export function frameHasHands(f) {
  // 0..125 = both hands (21 pts × xyz each). Zeros mean "not tracked".
  for (let i = 0; i < 126; i++) if (f[i] !== 0) return true;
  return false;
}

/** Evenly pick n frames (keeps clips short; no interpolation needed for kNN). */
export function resample(frames, n = MAX_SAMPLE_FRAMES) {
  const len = frames.length;
  if (len <= n) return frames.slice();
  const out = [];
  for (let i = 0; i < n; i++) out.push(frames[Math.round((i * (len - 1)) / (n - 1))]);
  return out;
}

/* ---------- features (same idea as the Proto 18 trainer) ---------- */

const HAND_N = 129;
const BODY_N = 16;
const BODY_W = 1.5;
const DIM = Math.sqrt(129 / 63);
export const MIN_CONF = 0.6; // share of the 5 nearest samples that must agree
export const MAX_DIST = 1.2; // reject if even the closest sample is further than this
const K = 5;

// wrist-relative, scaled so the largest coordinate is 1 (works on shoulder-normalised input too)
function hand63(f, o) {
  const wx = f[o], wy = f[o + 1], wz = f[o + 2];
  const p = new Array(63);
  let m = 0;
  for (let j = 0; j < 21; j++) {
    const a = f[o + j * 3] - wx, b = f[o + j * 3 + 1] - wy, c = f[o + j * 3 + 2] - wz;
    p[j * 3] = a; p[j * 3 + 1] = b; p[j * 3 + 2] = c;
    const mm = Math.max(Math.abs(a), Math.abs(b), Math.abs(c));
    if (mm > m) m = mm;
  }
  m = m || 1;
  for (let i = 0; i < 63; i++) p[i] /= m;
  return p;
}

const descCache = new WeakMap();
/** 145 values: 129 hand shape + 16 body position (zeros when no body was visible). */
export function describeFrame(f) {
  let d = descCache.get(f);
  if (d) return d;
  const hasL = f[0] !== 0 || f[1] !== 0 || f[2] !== 0;
  const hasR = f[63] !== 0 || f[64] !== 0 || f[65] !== 0;
  d = new Float32Array(HAND_N + BODY_N);
  d.hasBody = false;
  if (!hasL && !hasR) {
    descCache.set(f, d);
    return d;
  }
  // order by wrist x (image left to right); person's left hand sits on the image's right
  let hs = [];
  if (hasL) hs.push({ o: 0, x: f[0] });
  if (hasR) hs.push({ o: 63, x: f[63] });
  hs.sort((a, b) => a.x - b.x);
  const A = hs[0], B = hs[1];
  const a63 = hand63(f, A.o);
  for (let i = 0; i < 63; i++) d[i] = a63[i];
  if (B) {
    const b63 = hand63(f, B.o);
    for (let i = 0; i < 63; i++) d[63 + i] = b63[i];
    // wrist offset between the hands, in units of hand size
    const size = Math.hypot(f[A.o + 27] - f[A.o], f[A.o + 28] - f[A.o + 1], f[A.o + 29] - f[A.o + 2]) || 1;
    d[126] = (f[B.o] - f[A.o]) / size / 2;
    d[127] = (f[B.o + 1] - f[A.o + 1]) / size / 2;
    d[128] = (f[B.o + 2] - f[A.o + 2]) / size / 2;
  }
  // body: pose block starts at 126 (12 points): 0 nose, 1/2 shoulders, 3/4 elbows. Frame origin = shoulder centre.
  const hasBody = f[129] !== 0 && f[132] !== 0;
  if (hasBody) {
    d.hasBody = true;
    const nx = f[126], ny = f[127];
    const put = (k, h) => {
      if (!h) return;
      d[HAND_N + k] = (f[h.o] - nx) * BODY_W;
      d[HAND_N + k + 1] = (f[h.o + 1] - ny) * BODY_W;
      d[HAND_N + k + 2] = f[h.o] * BODY_W;
      d[HAND_N + k + 3] = f[h.o + 1] * BODY_W;
      d[HAND_N + k + 4] = (f[h.o + 24] - nx) * BODY_W;
      d[HAND_N + k + 5] = (f[h.o + 25] - ny) * BODY_W;
    };
    put(0, A);
    put(6, B);
    d[HAND_N + 12] = f[135] * BODY_W; d[HAND_N + 13] = f[136] * BODY_W; // left elbow
    d[HAND_N + 14] = f[138] * BODY_W; d[HAND_N + 15] = f[139] * BODY_W; // right elbow
  }
  descCache.set(f, d);
  return d;
}

const isWordKey = (w) => w.length > 1;

/**
 * Per-frame k-nearest-neighbour. Letters compare hand shape only; words also compare body position.
 * signs: { [word]: { samples: frame[][] } }
 * Returns { best (or null), ranking[{word,votes,distance,ratio,confidence}] }.
 */
export function classify(frame, signs, filter = null) {
  const words = Object.keys(signs || {}).filter((w) => !filter || filter(w));
  if (!frame || !words.length || !frameHasHands(frame)) return { best: null, ranking: [] };
  const q = describeFrame(frame);
  const bd = new Array(K).fill(Infinity);
  const bl = new Array(K).fill(null);
  const minD = {};
  let n = 0;
  for (const w of words) {
    const word = isWordKey(w);
    for (const sample of signs[w].samples) {
      for (const sf of sample) {
        const s = describeFrame(sf);
        let len = HAND_N, d2 = 0;
        for (let i = 0; i < HAND_N; i++) { const t = s[i] - q[i]; d2 += t * t; }
        if (word && q.hasBody && s.hasBody) {
          for (let i = HAND_N; i < HAND_N + BODY_N; i++) { const t = s[i] - q[i]; d2 += t * t; }
          len += BODY_N;
        }
        d2 *= HAND_N / len;
        n++;
        if (d2 < (minD[w] ?? Infinity)) minD[w] = d2;
        if (d2 < bd[K - 1]) {
          let k = K - 1;
          while (k > 0 && d2 < bd[k - 1]) { bd[k] = bd[k - 1]; bl[k] = bl[k - 1]; k--; }
          bd[k] = d2; bl[k] = w;
        }
      }
    }
  }
  if (n < K) return { best: null, ranking: [] };
  const votes = {};
  bl.forEach((l) => l && (votes[l] = (votes[l] || 0) + 1));
  const ranking = words
    .map((word) => {
      const distance = Math.sqrt(minD[word] ?? Infinity) / DIM;
      return { word, votes: votes[word] || 0, distance, ratio: distance / MAX_DIST, confidence: (votes[word] || 0) / K };
    })
    .filter((r) => Number.isFinite(r.distance))
    .sort((a, b) => b.votes - a.votes || a.distance - b.distance);
  const top = ranking[0];
  const ok = top && top.confidence >= MIN_CONF && top.distance < MAX_DIST;
  return { best: ok ? top : null, ranking: ranking.slice(0, 5) };
}

/* ---------- persistence (tiny external store) ---------- */

let cache = null;
const listeners = new Set();

function read() {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    cache = raw ? JSON.parse(raw) : {};
  } catch {
    cache = {};
  }
  return cache;
}

function commit(next) {
  cache = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (e) {
    console.warn('[customSignStore] could not persist', e);
  }
  listeners.forEach((l) => l());
}

const round = (frames) => frames.map((r) => Array.from(r, (v) => Math.round(v * 1000) / 1000));

export function addSample(word, frames) {
  const key = word.trim();
  if (!key) return;
  const cur = read();
  const prev = cur[key] || { samples: [], createdAt: Date.now() };
  commit({ ...cur, [key]: { ...prev, samples: [...prev.samples, round(resample(frames.filter(frameHasHands)))] } });
}

export function removeSample(word, index) {
  const cur = read();
  if (!cur[word]) return;
  const samples = cur[word].samples.filter((_, i) => i !== index);
  const next = { ...cur };
  if (samples.length) next[word] = { ...cur[word], samples };
  else delete next[word];
  commit(next);
}

export function exportSigns() {
  return JSON.stringify({ version: 1, signs: read() });
}

export function importSigns(text) {
  const data = JSON.parse(text);
  const incoming = data && data.signs;
  if (!incoming || typeof incoming !== 'object') throw new Error('Not a Sanket sign file');
  const merged = { ...read() };
  for (const [w, e] of Object.entries(incoming)) {
    if (!e || !Array.isArray(e.samples)) continue;
    const prev = merged[w]?.samples || [];
    merged[w] = { createdAt: e.createdAt || Date.now(), samples: [...prev, ...e.samples].slice(-8) };
  }
  commit(merged);
}

export function removeWord(word) {
  const next = { ...read() };
  delete next[word];
  commit(next);
}

export function useCustomSigns() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => ({})
  );
}
